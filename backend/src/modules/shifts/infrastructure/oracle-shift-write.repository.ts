import { Injectable } from '@nestjs/common';
import oracledb from 'oracledb';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import {
  ShiftAlreadyClosedError,
  ShiftAlreadyOpenError,
  ShiftNotFoundError,
} from '../../../shared/errors/domain-error';
import {
  CloseShiftInput,
  OpenShiftInput,
  ShiftCashTotals,
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
    };
  }

  private readonly cols = `ID, SHIFT_NO, SHIFT_CODE, CASHIER_NO, MACHINE_NO,
    OPENING_BALANCE, CURRENCY, STATUS, OPENED_AT, CLOSED_AT, CLOSING_BALANCE,
    EXPECTED_CASH, CASH_DIFFERENCE, CLOSE_NOTE`;

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
    if (existing.status === 'CLOSED') {
      throw new ShiftAlreadyClosedError(
        `Shift ${input.shiftId} is already closed`,
        { shiftId: input.shiftId },
      );
    }

    const totals = await this.cashTotals(input.shiftId);
    const expectedCash = existing.openingBalance + totals.cashTotal;
    const closingBalance = input.closingBalance ?? expectedCash;
    const cashDifference = closingBalance - expectedCash;

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

  private isUniqueViolation(err: unknown): boolean {
    return (
      typeof err === 'object' &&
      err !== null &&
      'errorNum' in err &&
      (err as { errorNum?: number }).errorNum === 1
    );
  }
}
