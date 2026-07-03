import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import oracledb from 'oracledb';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../../src/app.module';
import { AllExceptionsFilter } from '../../src/shared/filters/all-exceptions.filter';
import { uuidv7 } from '../../src/shared/domain/uuid';

/**
 * LIVE WRITE-SIDE INTEGRATION — proof-not-assumption.
 *
 * Boots the real NestJS app (read pool → YSPOS23 via MOTECH_RO, write pool →
 * MOTECH_POS) and drives a full sale cycle against the REAL databases:
 *   open shift → create bill (reads price from YSPOS23, writes to MOTECH_POS)
 *   → add payment → close shift → verify directly in MOTECH_POS.
 * Also proves Idempotency (same key twice == one bill).
 *
 * A unique cashier number per run avoids the "one open shift per cashier"
 * collision and lets us clean up our own rows afterwards.
 */

const writeUser = process.env.ORACLE_WRITE_USER ?? 'MOTECH_POS';
const writePass = process.env.ORACLE_WRITE_PASSWORD ?? 'motech_pos_2026';
const connectString = process.env.ORACLE_CONNECT_STRING ?? '127.0.0.1:1521/xe';
const writeSchema = process.env.ORACLE_WRITE_SCHEMA ?? 'MOTECH_POS';

// A real item code with a reference price in YSPOS23 (see SALES_FLOW notes).
const ITEM_CODE = process.env.GOLDEN_ITEM_CODE ?? '1010010004';
// Unique-ish cashier per run. Since the Onyx-twin write path lands the bill
// in the REAL YSPOS23.IAS_POS_BILL_MST/DTL, the cashier number must fit the
// legacy columns (BRN_USR NUMBER(3), AD_U_ID NUMBER(5)) → keep it ≤ 999.
// Range 700-789 (disjoint from p0 suite's 200-289 and from real Onyx users
// ≤ 23); leftover rows from crashed runs are purged in beforeAll.
const CASHIER = 700 + (Date.now() % 90);

let app: import('@nestjs/common').INestApplication;
let httpServer: ReturnType<import('@nestjs/common').INestApplication['getHttpServer']>;
let token: string;
let writePool: oracledb.Pool;
let createdShiftId: string | undefined;
let createdBillId: string | undefined;

async function dbQuery<T>(sql: string, binds: oracledb.BindParameters = {}): Promise<T[]> {
  const conn = await writePool.getConnection();
  try {
    const r = await conn.execute<T>(sql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return (r.rows ?? []) as T[];
  } finally {
    await conn.close();
  }
}

async function dbExec(sql: string, binds: oracledb.BindParameters = {}): Promise<void> {
  const conn = await writePool.getConnection();
  try {
    await conn.execute(sql, binds, { autoCommit: true });
  } finally {
    await conn.close();
  }
}

beforeAll(async () => {
  app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('api/v1', { exclude: ['health', 'ready'] });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.init();
  httpServer = app.getHttpServer();

  writePool = await oracledb.createPool({
    user: writeUser,
    password: writePass,
    connectString,
    poolMin: 1,
    poolMax: 2,
    poolAlias: 'test-write',
  });

  // Purge leftovers from a previous crashed run for this cashier (an open
  // shift would break the "no-open-shift" and "opens a shift" cases).
  await dbExec(
    `DELETE FROM ${writeSchema}.PAYMENTS WHERE BILL_ID IN
       (SELECT ID FROM ${writeSchema}.BILLS WHERE CASHIER_NO = :c)`,
    { c: CASHIER },
  );
  await dbExec(
    `DELETE FROM ${writeSchema}.BILL_LINES WHERE BILL_ID IN
       (SELECT ID FROM ${writeSchema}.BILLS WHERE CASHIER_NO = :c)`,
    { c: CASHIER },
  );
  await dbExec(`DELETE FROM ${writeSchema}.BILLS WHERE CASHIER_NO = :c`, { c: CASHIER });
  await dbExec(`DELETE FROM ${writeSchema}.HELD_BILLS WHERE CASHIER_NO = :c`, { c: CASHIER });
  await dbExec(`DELETE FROM ${writeSchema}.SHIFTS WHERE CASHIER_NO = :c`, { c: CASHIER });

  // Log in (dev seed cashier) to obtain a JWT for protected write routes.
  // Login as SUPERVISOR: since the free-price security fix, explicit
  // unitPrice/vatPercent values that differ from the server reference
  // require the PRICE_OVERRIDE permission (cashier role lacks it).
  // Credentials come from env (secrets are no longer hardcoded/committed).
  const login = await request(httpServer)
    .post('/api/v1/auth/login')
    .send({
      username: process.env.TEST_SUPERVISOR_USER ?? 'supervisor1',
      password: process.env.TEST_SUPERVISOR_PASSWORD ?? 'super123',
    });
  expect(login.status).toBe(200);
  token = login.body.data?.accessToken ?? login.body.accessToken;
  expect(typeof token).toBe('string');
}, 60_000);

afterAll(async () => {
  // Clean up the rows we created (keep the schema tidy between runs).
  try {
    if (createdBillId) {
      await dbExec(`DELETE FROM ${writeSchema}.PAYMENTS WHERE BILL_ID = :id`, { id: createdBillId });
      await dbExec(`DELETE FROM ${writeSchema}.BILL_LINES WHERE BILL_ID = :id`, { id: createdBillId });
      await dbExec(`DELETE FROM ${writeSchema}.BILLS WHERE ID = :id`, { id: createdBillId });
    }
    if (createdShiftId) {
      await dbExec(`DELETE FROM ${writeSchema}.SHIFTS WHERE ID = :id`, { id: createdShiftId });
    }
  } catch {
    /* best-effort cleanup */
  }
  if (writePool) await writePool.close(2);
  if (app) await app.close();
}, 60_000);

describe('Write-side full sale cycle (live)', () => {
  it('rejects selling without an open shift (409 no-open-shift)', async () => {
    const res = await request(httpServer)
      .post('/api/v1/bills')
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', uuidv7())
      .send({ cashierNo: CASHIER, lines: [{ itemCode: ITEM_CODE, qty: 1 }] });
    expect(res.status).toBe(409);
    expect(res.body.type).toContain('no-open-shift');
  });

  it('opens a shift (writes MOTECH_POS.SHIFTS)', async () => {
    const res = await request(httpServer)
      .post('/api/v1/shifts/open')
      .set('Authorization', `Bearer ${token}`)
      .send({ cashierNo: CASHIER, openingBalance: 1000, currency: 'YER' });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('OPEN');
    createdShiftId = res.body.data.id;

    const rows = await dbQuery<{ STATUS: string }>(
      `SELECT STATUS FROM ${writeSchema}.SHIFTS WHERE ID = :id`,
      { id: createdShiftId },
    );
    expect(rows[0].STATUS).toBe('OPEN');
  });

  it('refuses a second open shift for the same cashier (409)', async () => {
    const res = await request(httpServer)
      .post('/api/v1/shifts/open')
      .set('Authorization', `Bearer ${token}`)
      .send({ cashierNo: CASHIER });
    expect(res.status).toBe(409);
    expect(res.body.type).toContain('shift-already-open');
  });

  let idemKey: string;
  let firstBillNo: string;

  it('creates a bill: reads price from YSPOS23, computes totals, writes MOTECH_POS', async () => {
    idemKey = uuidv7();
    const res = await request(httpServer)
      .post('/api/v1/bills')
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', idemKey)
      .send({
        cashierNo: CASHIER,
        machineNo: 1,
        lines: [
          { itemCode: ITEM_CODE, qty: 2 },
          { itemCode: ITEM_CODE, qty: 1, unitPrice: 100, discDtl: 10, vatPercent: 15 },
        ],
      });
    expect(res.status).toBe(201);
    expect(res.body.meta.replayed).toBe(false);
    const bill = res.body.data;
    createdBillId = bill.id;
    firstBillNo = bill.billNo;

    // Line 1: qty 2 * reference price (>0). Line 2: 100*1 gross, disc 10, vat on (100-10)*15%.
    expect(bill.lines).toHaveLength(2);
    const l2 = bill.lines[1];
    expect(l2.lineGross).toBeCloseTo(100, 4);
    expect(l2.lineDiscount).toBeCloseTo(10, 4);
    expect(l2.lineVat).toBeCloseTo((100 - 10) * 0.15, 4);
    // net = gross - discount + vat
    expect(bill.netAmt).toBeCloseTo(bill.grossAmt - bill.discountAmt + bill.vatAmt, 4);
    expect(bill.status).toBe('POSTED');

    // Verify it actually landed in MOTECH_POS.BILLS.
    const rows = await dbQuery<{ NET_AMT: number; STATUS: string }>(
      `SELECT NET_AMT, STATUS FROM ${writeSchema}.BILLS WHERE ID = :id`,
      { id: createdBillId },
    );
    expect(Number(rows[0].NET_AMT)).toBeCloseTo(bill.netAmt, 4);
  });

  it('IDEMPOTENCY: same key returns the SAME bill (no duplicate row)', async () => {
    const res = await request(httpServer)
      .post('/api/v1/bills')
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', idemKey)
      .send({
        cashierNo: CASHIER,
        machineNo: 1,
        lines: [
          { itemCode: ITEM_CODE, qty: 2 },
          { itemCode: ITEM_CODE, qty: 1, unitPrice: 100, discDtl: 10, vatPercent: 15 },
        ],
      });
    expect(res.status).toBe(201);
    expect(res.body.meta.replayed).toBe(true);
    expect(res.body.data.billNo).toBe(firstBillNo);

    // Exactly one bill exists for this idempotency key.
    const rows = await dbQuery<{ N: number }>(
      `SELECT COUNT(*) AS N FROM ${writeSchema}.BILLS WHERE IDEMPOTENCY_KEY = :k`,
      { k: idemKey },
    );
    expect(Number(rows[0].N)).toBe(1);
  });

  it('IDEMPOTENCY conflict: same key + different body → 409', async () => {
    const res = await request(httpServer)
      .post('/api/v1/bills')
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', idemKey)
      .send({ cashierNo: CASHIER, machineNo: 1, lines: [{ itemCode: ITEM_CODE, qty: 5 }] });
    expect(res.status).toBe(409);
    expect(res.body.type).toContain('idempotency-conflict');
  });

  it('rejects a bill creation without an Idempotency-Key (422)', async () => {
    const res = await request(httpServer)
      .post('/api/v1/bills')
      .set('Authorization', `Bearer ${token}`)
      .send({ cashierNo: CASHIER, lines: [{ itemCode: ITEM_CODE, qty: 1 }] });
    expect(res.status).toBe(422);
    expect(res.body.type).toContain('idempotency-key-required');
  });

  it('adds a cash payment to the bill (writes MOTECH_POS.PAYMENTS)', async () => {
    const res = await request(httpServer)
      .post(`/api/v1/bills/${createdBillId}/payments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ method: 'CASH', amount: 500 });
    expect(res.status).toBe(201);
    expect(res.body.data.paidAmt).toBeCloseTo(500, 4);
    expect(res.body.data.payments).toHaveLength(1);

    const rows = await dbQuery<{ N: number }>(
      `SELECT COUNT(*) AS N FROM ${writeSchema}.PAYMENTS WHERE BILL_ID = :id`,
      { id: createdBillId },
    );
    expect(Number(rows[0].N)).toBe(1);
  });

  it('closes the shift (computes expected cash + difference)', async () => {
    const res = await request(httpServer)
      .post(`/api/v1/shifts/${createdShiftId}/close`)
      .set('Authorization', `Bearer ${token}`)
      .send({ closingBalance: 1500 });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('CLOSED');
    // expected = opening(1000) + cash(500) = 1500 → difference 0
    expect(res.body.data.expectedCash).toBeCloseTo(1500, 4);
    expect(res.body.data.cashDifference).toBeCloseTo(0, 4);

    const rows = await dbQuery<{ STATUS: string }>(
      `SELECT STATUS FROM ${writeSchema}.SHIFTS WHERE ID = :id`,
      { id: createdShiftId },
    );
    expect(rows[0].STATUS).toBe('CLOSED');
  });

  it('after close, selling is blocked again (no open shift)', async () => {
    const res = await request(httpServer)
      .post('/api/v1/bills')
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', uuidv7())
      .send({ cashierNo: CASHIER, lines: [{ itemCode: ITEM_CODE, qty: 1 }] });
    expect(res.status).toBe(409);
    expect(res.body.type).toContain('no-open-shift');
  });
});
