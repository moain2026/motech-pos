import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import oracledb from 'oracledb';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../../src/app.module';
import { AllExceptionsFilter } from '../../src/shared/filters/all-exceptions.filter';
import { uuidv7 } from '../../src/shared/domain/uuid';

/**
 * LIVE P0 FEATURES INTEGRATION — proof-not-assumption.
 *
 * Drives the three critical P0 gaps against the REAL databases:
 *   (1) Held bills: hold → list → resume (produces a real POSTED bill).
 *   (2) Multi/partial/multi-currency payments on a posted bill.
 *   (3) Shift close reconciliation / Z-report (expected vs actual, over/short,
 *       per-method breakdown).
 * A unique cashier per run avoids the one-open-shift collision + eases cleanup.
 */

const writeUser = process.env.ORACLE_WRITE_USER ?? 'MOTECH_POS';
const writePass = process.env.ORACLE_WRITE_PASSWORD ?? 'motech_pos_2026';
const connectString = process.env.ORACLE_CONNECT_STRING ?? '127.0.0.1:1521/xe';
const writeSchema = process.env.ORACLE_WRITE_SCHEMA ?? 'MOTECH_POS';
const ITEM_CODE = process.env.GOLDEN_ITEM_CODE ?? '1020060001';
const CASHIER = 800000 + (Date.now() % 90000);

let app: import('@nestjs/common').INestApplication;
let httpServer: ReturnType<import('@nestjs/common').INestApplication['getHttpServer']>;
let token: string;
let writePool: oracledb.Pool;
let shiftId: string | undefined;
const billIds: string[] = [];

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
    poolAlias: 'test-p0-write',
  });

  const login = await request(httpServer)
    .post('/api/v1/auth/login')
    .send({ username: 'cashier1', password: 'cashier123' });
  expect(login.status).toBe(200);
  token = login.body.data?.accessToken ?? login.body.accessToken;
}, 60_000);

afterAll(async () => {
  try {
    for (const id of billIds) {
      await dbExec(`DELETE FROM ${writeSchema}.PAYMENTS WHERE BILL_ID = :id`, { id });
      await dbExec(`DELETE FROM ${writeSchema}.BILL_LINES WHERE BILL_ID = :id`, { id });
    }
    if (shiftId) {
      await dbExec(`DELETE FROM ${writeSchema}.HELD_BILLS WHERE SHIFT_ID = :id`, { id: shiftId });
    }
    for (const id of billIds) {
      await dbExec(`DELETE FROM ${writeSchema}.BILLS WHERE ID = :id`, { id });
    }
    if (shiftId) {
      await dbExec(`DELETE FROM ${writeSchema}.SHIFTS WHERE ID = :id`, { id: shiftId });
    }
  } catch {
    /* best-effort cleanup */
  }
  if (writePool) await writePool.close(2);
  if (app) await app.close();
}, 60_000);

describe('P0 features (live)', () => {
  let heldId: string;

  it('opens a shift for the run', async () => {
    const res = await request(httpServer)
      .post('/api/v1/shifts/open')
      .set('Authorization', `Bearer ${token}`)
      .send({ cashierNo: CASHIER, openingBalance: 1000, currency: 'YER' });
    expect(res.status).toBe(201);
    shiftId = res.body.data.id;
  });

  it('rejects hold without an Idempotency-Key (422)', async () => {
    const res = await request(httpServer)
      .post('/api/v1/bills/hold')
      .set('Authorization', `Bearer ${token}`)
      .send({ cashierNo: CASHIER, lines: [{ itemCode: ITEM_CODE, qty: 1 }] });
    expect(res.status).toBe(422);
    expect(res.body.type).toContain('idempotency-key-required');
  });

  it('HOLD parks a bill (snapshot) and is replay-safe', async () => {
    const key = uuidv7();
    const body = {
      cashierNo: CASHIER,
      machineNo: 1,
      label: 'Table 5',
      lines: [
        { itemCode: ITEM_CODE, qty: 2 },
        { itemCode: ITEM_CODE, qty: 1, unitPrice: 100, discDtl: 10, vatPercent: 15 },
      ],
    };
    const res = await request(httpServer)
      .post('/api/v1/bills/hold')
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', key)
      .send(body);
    expect(res.status).toBe(201);
    expect(res.body.meta.replayed).toBe(false);
    expect(res.body.data.status).toBe('HELD');
    expect(res.body.data.lineCount).toBe(2);
    heldId = res.body.data.id;

    // Replay: same key → same held bill (no dup).
    const replay = await request(httpServer)
      .post('/api/v1/bills/hold')
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', key)
      .send(body);
    expect(replay.status).toBe(201);
    expect(replay.body.meta.replayed).toBe(true);
    expect(replay.body.data.id).toBe(heldId);
  });

  it('LISTS held bills for the cashier', async () => {
    const res = await request(httpServer)
      .get(`/api/v1/bills/held?cashierNo=${CASHIER}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.meta.count).toBe(1);
    expect(res.body.data[0].label).toBe('Table 5');
  });

  it('RESUMES a held bill → posts a real bill; re-resume is idempotent', async () => {
    const res = await request(httpServer)
      .post(`/api/v1/bills/held/${heldId}/resume`)
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', uuidv7())
      .send({ cashierNo: CASHIER });
    expect(res.status).toBe(201);
    const bill = res.body.data.bill;
    billIds.push(bill.id);
    expect(bill.status).toBe('POSTED');
    // gross 200, disc 10, vat (100-10)*15% = 13.5, net = 200-10+13.5 = 203.5
    expect(bill.grossAmt).toBeCloseTo(200, 4);
    expect(bill.discountAmt).toBeCloseTo(10, 4);
    expect(bill.vatAmt).toBeCloseTo(13.5, 4);
    expect(bill.netAmt).toBeCloseTo(203.5, 4);
    expect(res.body.data.held.status).toBe('RESUMED');

    // Re-resume the same held bill → returns the SAME posted bill (no dup).
    const again = await request(httpServer)
      .post(`/api/v1/bills/held/${heldId}/resume`)
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', uuidv7())
      .send({ cashierNo: CASHIER });
    expect(again.status).toBe(201);
    expect(again.body.meta.replayed).toBe(true);
    expect(again.body.data.bill.billNo).toBe(bill.billNo);
  });

  it('accepts a PARTIAL payment and reports outstanding', async () => {
    const billId = billIds[0];
    const res = await request(httpServer)
      .post(`/api/v1/bills/${billId}/payments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ method: 'CASH', amount: 100 });
    expect(res.status).toBe(201);
    expect(res.body.data.paidAmt).toBeCloseTo(100, 4);
    expect(res.body.data.outstanding).toBeCloseTo(103.5, 4);
    expect(res.body.data.fullyPaid).toBe(false);
  });

  it('rejects a non-cash overpay (422 payment-exceeds-balance)', async () => {
    const billId = billIds[0];
    const res = await request(httpServer)
      .post(`/api/v1/bills/${billId}/payments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ method: 'CARD', amount: 500 });
    expect(res.status).toBe(422);
    expect(res.body.type).toContain('payment-exceeds-balance');
  });

  it('settles the rest with MULTI tenders (card + credit + cash overtender)', async () => {
    const billId = billIds[0];
    const res = await request(httpServer)
      .post(`/api/v1/bills/${billId}/payments/multi`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        tenders: [
          { method: 'CARD', amount: 50 },
          { method: 'CREDIT', amount: 30, customerCode: 'C001' },
          { method: 'CASH', amount: 40 }, // outstanding was 23.5 → change 16.5
        ],
      });
    expect(res.status).toBe(201);
    expect(res.body.data.fullyPaid).toBe(true);
    expect(res.body.data.outstanding).toBeCloseTo(0, 4);
    expect(res.body.data.change).toBeCloseTo(16.5, 4);
    expect(res.body.data.payments).toHaveLength(4);
  });

  it('handles a MULTI-CURRENCY tender (USD @ rate → bill currency)', async () => {
    // Fresh bill of net 250, paid with 1 USD @ 250.
    const create = await request(httpServer)
      .post('/api/v1/bills')
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', uuidv7())
      .send({
        cashierNo: CASHIER,
        machineNo: 1,
        lines: [{ itemCode: ITEM_CODE, qty: 1, unitPrice: 250, vatPercent: 0 }],
      });
    expect(create.status).toBe(201);
    const billId = create.body.data.id;
    billIds.push(billId);

    const pay = await request(httpServer)
      .post(`/api/v1/bills/${billId}/payments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ method: 'CASH', amount: 1, currency: 'USD', rate: 250 });
    expect(pay.status).toBe(201);
    expect(pay.body.data.payments[0].amountInBill).toBeCloseTo(250, 4);
    expect(pay.body.data.fullyPaid).toBe(true);
  });

  it('X-report reconciliation on the OPEN shift (expected vs actual, over/short)', async () => {
    const res = await request(httpServer)
      .get(`/api/v1/shifts/${shiftId}/reconciliation?actualCash=1200`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const r = res.body.data;
    expect(r.status).toBe('OPEN');
    // cash sales = 100 (partial) + 40 (multi cash) + 250 (usd->bill) = 390
    expect(r.cashSales).toBeCloseTo(390, 4);
    // expected = opening 1000 + 390 - 0 = 1390; actual 1200 → -190 SHORT
    expect(r.expectedCash).toBeCloseTo(1390, 4);
    expect(r.cashDifference).toBeCloseTo(-190, 4);
    expect(r.overShort).toBe('SHORT');
    // breakdown carries per-method + per-currency detail
    const cash = r.breakdown.find((b: { method: string }) => b.method === 'CASH');
    expect(cash.byCurrency.some((c: { currency: string }) => c.currency === 'USD')).toBe(true);
  });

  it('CLOSES the shift with expenses → Z-report (expected − expenses, over/short)', async () => {
    const res = await request(httpServer)
      .post(`/api/v1/shifts/${shiftId}/close`)
      .set('Authorization', `Bearer ${token}`)
      .send({ closingBalance: 1200, cashExpenses: 50 });
    expect(res.status).toBe(201);
    const shift = res.body.data;
    const reconciliation = res.body.meta.reconciliation;
    expect(shift.status).toBe('CLOSED');
    // expected = 1000 + 390 - 50 = 1340; actual 1200 → -140 SHORT
    expect(shift.expectedCash).toBeCloseTo(1340, 4);
    expect(shift.cashDifference).toBeCloseTo(-140, 4);
    expect(reconciliation.overShort).toBe('SHORT');
    expect(reconciliation.expectedCash).toBeCloseTo(1340, 4);
    expect(reconciliation.breakdown.length).toBeGreaterThanOrEqual(3);
  });
});
