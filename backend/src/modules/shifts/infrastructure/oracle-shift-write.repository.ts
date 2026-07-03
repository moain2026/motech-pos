import { Injectable } from '@nestjs/common';
import oracledb from 'oracledb';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import {
  ShiftAlreadyClosedError,
  ShiftAlreadyOpenError,
  ShiftAlreadySettledError,
  ShiftNotFoundError,
} from '../../../shared/errors/domain-error';
import {
  CloseShiftInput,
  OpenShiftInput,
  PaymentMethodBreakdown,
  SaveShiftCountInput,
  SettleShiftInput,
  ShiftCashTotals,
  ShiftDenomination,
  ShiftRecord,
  ShiftWriteRepository,
} from '../domain/ports/shift-repository.port';

interface ShiftRow {
  ID: string;
  SHIFT_NO: number;
  SHIFT_CODE: string | null;
  CASHIER_NO: number;
  MACHINE_NO: number | null;
  OPENING_BALANCE: number;
  CURRENCY: string;
  STATUS: string;
  OPENED_AT: Date;
  CLOSED_AT: Date | null;
  CLOSING_BALANCE: number | null;
  EXPECTED_CASH: number | null;
  CASH_DIFFERENCE: number | null;
  CLOSE_NOTE: string | null;
  COUNTED_CASH: number | null;
  SETTLE_DIFFERENCE: number | null;
  SETTLED_AT: Date | null;
  SETTLED_BY: number | null;
  SETTLE_NOTE: string | null;
}

/**
 * OracleShiftWriteRepository — writes our OWN shifts into MOTECH_POS.SHIFTS.
 * Never touches YSPOS23. ORA-00001 on the partial unique index
 * (UX_SHIFTS_ONE_OPEN) is the DB backstop for "one open shift per cashier".
 */
@Injectable()
export class OracleShiftWriteRepository implements ShiftWriteRepository {
  constructor(private readonly db: OracleWriteService) {}

  private get schema(): string {
    return this.db.schema();
  }

  private map(row: ShiftRow): ShiftRecord {
    return {
      id: row.ID,
      shiftNo: Number(row.SHIFT_NO),
      shiftCode: row.SHIFT_CODE,
      cashierNo: Number(row.CASHIER_NO),
      machineNo: row.MACHINE_NO == null ? null : Number(row.MACHINE_NO),
      openingBalance: Number(row.OPENING_BALANCE),
      currency: row.CURRENCY,
      status: row.STATUS as ShiftRecord['status'],
      openedAt: row.OPENED_AT.toISOString(),
      closedAt: row.CLOSED_AT ? row.CLOSED_AT.toISOString() : null,
      closingBalance:
        row.CLOSING_BALANCE == null ? null : Number(row.CLOSING_BALANCE),
      expectedCash: row.EXPECTED_CASH == null ? null : Number(row.EXPECTED_CASH),
      cashDifference:
        row.CASH_DIFFERENCE == null ? null : Number(row.CASH_DIFFERENCE),
      closeNote: row.CLOSE_NOTE,
      countedCash: row.COUNTED_CASH == null ? null : Number(row.COUNTED_CASH),
      settleDifference:
        row.SETTLE_DIFFERENCE == null ? null : Number(row.SETTLE_DIFFERENCE),
      settledAt: row.SETTLED_AT ? row.SETTLED_AT.toISOString() : null,
      settledBy: row.SETTLED_BY == null ? null : Number(row.SETTLED_BY),
      settleNote: row.SETTLE_NOTE,
    };
  }

  private readonly cols = `ID, SHIFT_NO, SHIFT_CODE, CASHIER_NO, MACHINE_NO,
    OPENING_BALANCE, CURRENCY, STATUS, OPENED_AT, CLOSED_AT, CLOSING_BALANCE,
    EXPECTED_CASH, CASH_DIFFERENCE, CLOSE_NOTE, COUNTED_CASH,
    SETTLE_DIFFERENCE, SETTLED_AT, SETTLED_BY, SETTLE_NOTE`;

  async findOpenByCashier(cashierNo: number): Promise<ShiftRecord | null> {
    const row = await this.db.queryOne<ShiftRow>(
      `SELECT ${this.cols} FROM ${this.schema}.SHIFTS
       WHERE CASHIER_NO = :c AND STATUS = 'OPEN'`,
      { c: cashierNo },
    );
    return row ? this.map(row) : null;
  }

  async findById(id: string): Promise<ShiftRecord | null> {
    const row = await this.db.queryOne<ShiftRow>(
      `SELECT ${this.cols} FROM ${this.schema}.SHIFTS WHERE ID = :id`,
      { id },
    );
    return row ? this.map(row) : null;
  }

  async open(input: OpenShiftInput): Promise<ShiftRecord> {
    const id = uuidv7();
    try {
      return await this.db.withTransaction(async (conn) => {
        const seq = await conn.execute<{ N: number }>(
          `SELECT ${this.schema}.SEQ_SHIFT_NO.NEXTVAL AS N FROM DUAL`,
          {},
          { outFormat: oracledb.OUT_FORMAT_OBJECT },
        );
        const shiftNo = (seq.rows as { N: number }[])[0].N;

        await conn.execute(
          `INSERT INTO ${this.schema}.SHIFTS
             (ID, SHIFT_NO, SHIFT_CODE, CASHIER_NO, MACHINE_NO,
              OPENING_BALANCE, CURRENCY, STATUS)
           VALUES (:id, :shiftNo, :shiftCode, :cashierNo, :machineNo,
              :openingBalance, :currency, 'OPEN')`,
          {
            id,
            shiftNo,
            shiftCode: input.shiftCode ?? null,
            cashierNo: input.cashierNo,
            machineNo: input.machineNo ?? null,
            openingBalance: input.openingBalance ?? 0,
            currency: input.currency ?? 'YER',
          },
        );

        const row = await conn.execute<ShiftRow>(
          `SELECT ${this.cols} FROM ${this.schema}.SHIFTS WHERE ID = :id`,
          { id },
          { outFormat: oracledb.OUT_FORMAT_OBJECT },
        );
        return this.map((row.rows as ShiftRow[])[0]);
      });
    } catch (err) {
      if (this.isUniqueViolation(err)) {
        throw new ShiftAlreadyOpenError(
          `Cashier ${input.cashierNo} already has an open shift`,
          { cashierNo: input.cashierNo },
        );
      }
      throw err;
    }
  }

  async close(input: CloseShiftInput): Promise<ShiftRecord> {
    const existing = await this.findById(input.shiftId);
    if (!existing) {
      throw new ShiftNotFoundError(`Shift ${input.shiftId} not found`, {
        shiftId: input.shiftId,
      });
    }
    if (existing.status !== 'OPEN') {
      throw new ShiftAlreadyClosedError(
        `Shift ${input.shiftId} is already closed`,
        { shiftId: input.shiftId },
      );
    }

    const totals = await this.cashTotals(input.shiftId);
    const cashExpenses = input.cashExpenses ?? 0;
    // expected cash = opening + cash sales - cash expenses (POST013/015).
    const expectedCash = round4(
      existing.openingBalance + totals.cashTotal - cashExpenses,
    );
    const closingBalance = input.closingBalance ?? expectedCash;
    const cashDifference = round4(closingBalance - expectedCash);

    return this.db.withTransaction(async (conn) => {
      await conn.execute(
        `UPDATE ${this.schema}.SHIFTS
           SET STATUS = 'CLOSED',
               CLOSED_AT = SYSTIMESTAMP,
               CLOSING_BALANCE = :closingBalance,
               EXPECTED_CASH = :expectedCash,
               CASH_DIFFERENCE = :cashDifference,
               CLOSE_NOTE = :closeNote
           WHERE ID = :id AND STATUS = 'OPEN'`,
        {
          id: input.shiftId,
          closingBalance,
          expectedCash,
          cashDifference,
          closeNote: input.closeNote ?? null,
        },
      );
      const row = await conn.execute<ShiftRow>(
        `SELECT ${this.cols} FROM ${this.schema}.SHIFTS WHERE ID = :id`,
        { id: input.shiftId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
      );
      return this.map((row.rows as ShiftRow[])[0]);
    });
  }

  async paymentBreakdown(shiftId: string): Promise<PaymentMethodBreakdown[]> {
    const rows = await this.db.query<{
      METHOD: string;
      CURRENCY: string;
      CNT: number;
      AMOUNT: number;
      AMOUNT_IN_BILL: number;
    }>(
      `SELECT METHOD, CURRENCY, COUNT(*) AS CNT,
              NVL(SUM(AMOUNT),0) AS AMOUNT,
              NVL(SUM(AMOUNT_IN_BILL),0) AS AMOUNT_IN_BILL
       FROM ${this.schema}.PAYMENTS WHERE SHIFT_ID = :s
       GROUP BY METHOD, CURRENCY
       ORDER BY METHOD, CURRENCY`,
      { s: shiftId },
    );
    const byMethod = new Map<string, PaymentMethodBreakdown>();
    for (const r of rows) {
      const method = r.METHOD;
      let m = byMethod.get(method);
      if (!m) {
        m = { method, count: 0, amountInBill: 0, byCurrency: [] };
        byMethod.set(method, m);
      }
      m.count += Number(r.CNT);
      m.amountInBill = round4(m.amountInBill + Number(r.AMOUNT_IN_BILL));
      m.byCurrency.push({
        currency: r.CURRENCY,
        count: Number(r.CNT),
        amount: Number(r.AMOUNT),
        amountInBill: Number(r.AMOUNT_IN_BILL),
      });
    }
    return [...byMethod.values()];
  }

  async cashTotals(shiftId: string): Promise<ShiftCashTotals> {
    const billAgg = await this.db.queryOne<{
      BILL_COUNT: number;
      NET_TOTAL: number;
    }>(
      `SELECT COUNT(*) AS BILL_COUNT, NVL(SUM(NET_AMT),0) AS NET_TOTAL
       FROM ${this.schema}.BILLS WHERE SHIFT_ID = :s AND STATUS = 'POSTED'`,
      { s: shiftId },
    );
    const payAgg = await this.db.queryOne<{
      CASH_TOTAL: number;
      CARD_TOTAL: number;
      CREDIT_TOTAL: number;
    }>(
      `SELECT
         NVL(SUM(CASE WHEN METHOD='CASH'   THEN AMOUNT_IN_BILL END),0) AS CASH_TOTAL,
         NVL(SUM(CASE WHEN METHOD='CARD'   THEN AMOUNT_IN_BILL END),0) AS CARD_TOTAL,
         NVL(SUM(CASE WHEN METHOD='CREDIT' THEN AMOUNT_IN_BILL END),0) AS CREDIT_TOTAL
       FROM ${this.schema}.PAYMENTS WHERE SHIFT_ID = :s`,
      { s: shiftId },
    );
    const row = {
      BILL_COUNT: billAgg?.BILL_COUNT ?? 0,
      NET_TOTAL: billAgg?.NET_TOTAL ?? 0,
      CASH_TOTAL: payAgg?.CASH_TOTAL ?? 0,
      CARD_TOTAL: payAgg?.CARD_TOTAL ?? 0,
      CREDIT_TOTAL: payAgg?.CREDIT_TOTAL ?? 0,
    };
    return {
      billCount: Number(row?.BILL_COUNT ?? 0),
      netSalesTotal: Number(row?.NET_TOTAL ?? 0),
      cashTotal: Number(row?.CASH_TOTAL ?? 0),
      cardTotal: Number(row?.CARD_TOTAL ?? 0),
      creditTotal: Number(row?.CREDIT_TOTAL ?? 0),
    };
  }

  /** Replace the saved denomination count for a shift (POST013). */
  async saveCount(input: SaveShiftCountInput): Promise<ShiftDenomination[]> {
    await this.db.withTransaction(async (conn) => {
      await conn.execute(
        `DELETE FROM ${this.schema}.SHIFT_DENOMINATIONS
         WHERE SHIFT_ID = :s AND CURRENCY = :c`,
        { s: input.shiftId, c: input.currency },
      );
      for (const d of input.denominations) {
        await conn.execute(
          `INSERT INTO ${this.schema}.SHIFT_DENOMINATIONS
             (ID, SHIFT_ID, CURRENCY, DENOMINATION_VALUE, DENOM_COUNT, AMOUNT)
           VALUES (:id, :shiftId, :currency, :val, :cnt, :amount)`,
          {
            id: uuidv7(),
            shiftId: input.shiftId,
            currency: input.currency,
            val: d.value,
            cnt: d.count,
            amount: round4(d.value * d.count),
          },
        );
      }
    });
    return this.findDenominations(input.shiftId);
  }

  async findDenominations(shiftId: string): Promise<ShiftDenomination[]> {
    const rows = await this.db.query<{
      CURRENCY: string;
      DENOMINATION_VALUE: number;
      DENOM_COUNT: number;
      AMOUNT: number;
    }>(
      `SELECT CURRENCY, DENOMINATION_VALUE, DENOM_COUNT, AMOUNT
       FROM ${this.schema}.SHIFT_DENOMINATIONS
       WHERE SHIFT_ID = :s
       ORDER BY CURRENCY, DENOMINATION_VALUE DESC`,
      { s: shiftId },
    );
    return rows.map((r) => ({
      currency: r.CURRENCY,
      value: Number(r.DENOMINATION_VALUE),
      count: Number(r.DENOM_COUNT),
      amount: Number(r.AMOUNT),
    }));
  }

  /** Persist the approved settlement: CLOSED -> SETTLED (immutable after). */
  async settle(input: SettleShiftInput): Promise<ShiftRecord> {
    return this.db.withTransaction(async (conn) => {
      const res = await conn.execute(
        `UPDATE ${this.schema}.SHIFTS
           SET STATUS = 'SETTLED',
               COUNTED_CASH = :countedCash,
               SETTLE_DIFFERENCE = :difference,
               SETTLED_AT = SYSTIMESTAMP,
               SETTLED_BY = :settledBy,
               SETTLE_NOTE = :note
         WHERE ID = :id AND STATUS = 'CLOSED'`,
        {
          id: input.shiftId,
          countedCash: input.countedCash,
          difference: input.difference,
          settledBy: input.settledBy ?? null,
          note: input.note ?? null,
        },
      );
      if ((res.rowsAffected ?? 0) === 0) {
        // Row exists (caller verified) but not CLOSED => already settled.
        throw new ShiftAlreadySettledError(
          `Shift ${input.shiftId} is already settled`,
          { shiftId: input.shiftId },
        );
      }
      const row = await conn.execute<ShiftRow>(
        `SELECT ${this.cols} FROM ${this.schema}.SHIFTS WHERE ID = :id`,
        { id: input.shiftId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
      );
      return this.map((row.rows as ShiftRow[])[0]);
    });
  }

  private isUniqueViolation(err: unknown): boolean {
    return (
      typeof err === 'object' &&
      err !== null &&
      'errorNum' in err &&
      (err as { errorNum?: number }).errorNum === 1
    );
  }
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
