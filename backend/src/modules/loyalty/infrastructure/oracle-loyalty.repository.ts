import { Injectable } from '@nestjs/common';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import { LoyaltyRule } from '../domain/points-policy';
import {
  EarnedPointsBalance,
  InsertEarnInput,
  InsertRedeemInput,
  LoyaltyProgramRow,
  LoyaltyRepository,
  LoyaltySummary,
  PointsLedgerRow,
  UpsertLoyaltyProgramInput,
} from '../domain/ports/loyalty-repository.port';
import oracledb from 'oracledb';

interface ProgramRow {
  ID: string;
  NAME: string;
  POINT_TYP_NO: number;
  CALC_TYPE: number;
  AMT_4POINT: number;
  POINT_CNT: number;
  TRUNCATE_FLAG: number;
  POINT_VALUE: number;
  MIN_BILL_AMT: number;
  MAX_POINTS_PER_BILL: number;
  START_DATE: Date | null;
  END_DATE: Date | null;
  ACTIVE: number;
  CREATED_BY: number | null;
  CREATED_AT: Date;
  UPDATED_AT: Date;
}

interface LedgerRow {
  ID: string;
  CUSTOMER_CODE: string;
  POINT_TYP_NO: number;
  TRNS_TYPE: number;
  BILL_ID: string | null;
  BILL_NO: string | null;
  DOC_AMT: number;
  POINT_CNT: number;
  POINT_AMT: number;
  SHIFT_ID: string | null;
  CASHIER_NO: number | null;
  NOTE: string | null;
  CREATED_AT: Date;
}

/**
 * OracleLoyaltyRepository — loyalty config + points ledger in MOTECH_POS.
 * The EARN insert is idempotent via UQ_POINTS_BILL_TYP (BILL_ID, TRNS_TYPE):
 * re-posting the same bill never double-earns (ORA-00001 → treated as replay).
 */
@Injectable()
export class OracleLoyaltyRepository implements LoyaltyRepository {
  constructor(private readonly db: OracleWriteService) {}

  private get schema(): string {
    return this.db.schema();
  }

  /**
   * Active earning rule for a point type. A named PROGRAM (POSI008) whose
   * validity window contains today takes precedence; otherwise we fall back to
   * the legacy single-row LOYALTY_CONFIG overlay (V006) so nothing breaks when
   * no program is defined.
   */
  async activeRule(pointTypNo = 1): Promise<LoyaltyRule | null> {
    const program = await this.activeProgram(pointTypNo);
    if (program) {
      return {
        calcType: program.calcType,
        amt4Point: program.amt4Point,
        pointCnt: program.pointCnt,
        truncate: program.truncate,
        pointValue: program.pointValue,
        minBillAmt: program.minBillAmt,
        maxPointsPerBill: program.maxPointsPerBill,
      };
    }
    const row = await this.db.queryOne<{
      CALC_TYPE: number;
      AMT_4POINT: number;
      POINT_CNT: number;
      TRUNCATE_FLAG: number;
      POINT_VALUE: number;
    }>(
      `SELECT CALC_TYPE, AMT_4POINT, POINT_CNT, TRUNCATE_FLAG, POINT_VALUE
       FROM ${this.schema}.LOYALTY_CONFIG
       WHERE POINT_TYP_NO = :t AND ACTIVE = 1`,
      { t: pointTypNo },
    );
    if (!row) return null;
    return {
      calcType: Number(row.CALC_TYPE),
      amt4Point: Number(row.AMT_4POINT),
      pointCnt: Number(row.POINT_CNT),
      truncate: Number(row.TRUNCATE_FLAG) === 1,
      pointValue: Number(row.POINT_VALUE),
    };
  }

  //========================================================================
  // POSI008 — loyalty programs CRUD (MOTECH_POS.LOYALTY_PROGRAMS)
  //========================================================================

  async listPrograms(): Promise<LoyaltyProgramRow[]> {
    const rows = await this.db.query<ProgramRow>(
      `SELECT * FROM ${this.schema}.LOYALTY_PROGRAMS ORDER BY CREATED_AT DESC`,
    );
    return rows.map((r) => this.mapProgram(r));
  }

  async findProgramById(id: string): Promise<LoyaltyProgramRow | null> {
    const row = await this.db.queryOne<ProgramRow>(
      `SELECT * FROM ${this.schema}.LOYALTY_PROGRAMS WHERE ID = :id`,
      { id },
    );
    return row ? this.mapProgram(row) : null;
  }

  async activeProgram(
    pointTypNo: number,
    on?: string,
  ): Promise<LoyaltyProgramRow | null> {
    const row = await this.db.queryOne<ProgramRow>(
      `SELECT * FROM ${this.schema}.LOYALTY_PROGRAMS
       WHERE POINT_TYP_NO = :t AND ACTIVE = 1
         AND (START_DATE IS NULL OR START_DATE <= :d)
         AND (END_DATE IS NULL OR END_DATE >= :d)`,
      { t: pointTypNo, d: parseDate(on ?? today()) },
    );
    return row ? this.mapProgram(row) : null;
  }

  async insertProgram(
    input: UpsertLoyaltyProgramInput,
  ): Promise<LoyaltyProgramRow> {
    const id = uuidv7();
    await this.db.execute(
      `INSERT INTO ${this.schema}.LOYALTY_PROGRAMS
         (ID, NAME, POINT_TYP_NO, CALC_TYPE, AMT_4POINT, POINT_CNT,
          TRUNCATE_FLAG, POINT_VALUE, MIN_BILL_AMT, MAX_POINTS_PER_BILL,
          START_DATE, END_DATE, ACTIVE, CREATED_BY)
       VALUES (:id, :name, :pointTypNo, :calcType, :amt4Point, :pointCnt,
          :truncate, :pointValue, :minBillAmt, :maxPointsPerBill,
          :startDate, :endDate, :active, :createdBy)`,
      this.programBinds(id, input),
    );
    const created = await this.findProgramById(id);
    if (!created) throw new Error('insertProgram: row vanished after insert');
    return created;
  }

  async updateProgram(
    id: string,
    input: UpsertLoyaltyProgramInput,
  ): Promise<LoyaltyProgramRow | null> {
    const res = await this.db.execute(
      `UPDATE ${this.schema}.LOYALTY_PROGRAMS SET
         NAME = :name, POINT_TYP_NO = :pointTypNo, CALC_TYPE = :calcType,
         AMT_4POINT = :amt4Point, POINT_CNT = :pointCnt,
         TRUNCATE_FLAG = :truncate, POINT_VALUE = :pointValue,
         MIN_BILL_AMT = :minBillAmt, MAX_POINTS_PER_BILL = :maxPointsPerBill,
         START_DATE = :startDate, END_DATE = :endDate,
         ACTIVE = :active, UPDATED_AT = SYSTIMESTAMP
       WHERE ID = :id`,
      this.programBinds(id, input, /* includeCreatedBy */ false),
    );
    if (!res.rowsAffected) return null;
    return this.findProgramById(id);
  }

  async deleteProgram(id: string): Promise<boolean> {
    const res = await this.db.execute(
      `DELETE FROM ${this.schema}.LOYALTY_PROGRAMS WHERE ID = :id`,
      { id },
    );
    return Number(res.rowsAffected ?? 0) > 0;
  }

  private programBinds(
    id: string,
    input: UpsertLoyaltyProgramInput,
    includeCreatedBy = true,
  ) {
    const binds: Record<string, unknown> = {
      id,
      name: input.name,
      pointTypNo: { val: input.pointTypNo, type: oracledb.NUMBER },
      calcType: { val: input.calcType, type: oracledb.NUMBER },
      amt4Point: { val: input.amt4Point, type: oracledb.NUMBER },
      pointCnt: { val: input.pointCnt, type: oracledb.NUMBER },
      truncate: { val: input.truncate ? 1 : 0, type: oracledb.NUMBER },
      pointValue: { val: input.pointValue, type: oracledb.NUMBER },
      minBillAmt: { val: input.minBillAmt, type: oracledb.NUMBER },
      maxPointsPerBill: { val: input.maxPointsPerBill, type: oracledb.NUMBER },
      startDate: parseDate(input.startDate),
      endDate: parseDate(input.endDate),
      active: { val: input.active ? 1 : 0, type: oracledb.NUMBER },
    };
    if (includeCreatedBy) {
      binds.createdBy =
        input.createdBy == null
          ? { val: null, type: oracledb.NUMBER }
          : { val: input.createdBy, type: oracledb.NUMBER };
    }
    return binds as import('oracledb').BindParameters;
  }

  private mapProgram(r: ProgramRow): LoyaltyProgramRow {
    return {
      id: r.ID,
      name: r.NAME,
      pointTypNo: Number(r.POINT_TYP_NO),
      calcType: Number(r.CALC_TYPE),
      amt4Point: Number(r.AMT_4POINT),
      pointCnt: Number(r.POINT_CNT),
      truncate: Number(r.TRUNCATE_FLAG) === 1,
      pointValue: Number(r.POINT_VALUE),
      minBillAmt: Number(r.MIN_BILL_AMT),
      maxPointsPerBill: Number(r.MAX_POINTS_PER_BILL),
      startDate: r.START_DATE ? toIsoDate(r.START_DATE) : null,
      endDate: r.END_DATE ? toIsoDate(r.END_DATE) : null,
      active: Number(r.ACTIVE) === 1,
      createdBy: r.CREATED_BY == null ? null : Number(r.CREATED_BY),
      createdAt: r.CREATED_AT.toISOString(),
      updatedAt: r.UPDATED_AT.toISOString(),
    };
  }

  async insertEarn(input: InsertEarnInput): Promise<PointsLedgerRow | null> {
    if (!(input.pointCnt > 0)) return null;
    const id = uuidv7();
    try {
      await this.db.execute(
        `INSERT INTO ${this.schema}.POINTS_LEDGER
           (ID, CUSTOMER_CODE, POINT_TYP_NO, TRNS_TYPE, BILL_ID, BILL_NO,
            DOC_AMT, POINT_CNT, POINT_AMT, SHIFT_ID, CASHIER_NO, NOTE)
         VALUES (:id, :customerCode, :pointTypNo, 1, :billId, :billNo,
            :docAmt, :pointCnt, :pointAmt, :shiftId, :cashierNo, :note)`,
        {
          id,
          customerCode: input.customerCode,
          pointTypNo: input.pointTypNo,
          billId: input.billId,
          billNo: input.billNo,
          docAmt: input.docAmt,
          pointCnt: input.pointCnt,
          pointAmt: input.pointAmt,
          shiftId: input.shiftId,
          cashierNo: input.cashierNo,
          note: input.note,
        },
      );
    } catch (err) {
      // Duplicate earn for the same bill → return the existing movement.
      if (this.isUniqueViolation(err) && input.billId) {
        const existing = await this.db.queryOne<LedgerRow>(
          `SELECT * FROM ${this.schema}.POINTS_LEDGER
           WHERE BILL_ID = :b AND TRNS_TYPE = 1`,
          { b: input.billId },
        );
        return existing ? this.map(existing) : null;
      }
      throw err;
    }
    const row = await this.db.queryOne<LedgerRow>(
      `SELECT * FROM ${this.schema}.POINTS_LEDGER WHERE ID = :id`,
      { id },
    );
    return row ? this.map(row) : null;
  }

  async insertRedeem(input: InsertRedeemInput): Promise<PointsLedgerRow> {
    const id = uuidv7();
    try {
      await this.db.execute(
        `INSERT INTO ${this.schema}.POINTS_LEDGER
           (ID, CUSTOMER_CODE, POINT_TYP_NO, TRNS_TYPE, BILL_ID, BILL_NO,
            DOC_AMT, POINT_CNT, POINT_AMT, SHIFT_ID, CASHIER_NO, NOTE)
         VALUES (:id, :customerCode, :pointTypNo, 2, :billId, :billNo,
            :docAmt, :pointCnt, :pointAmt, :shiftId, :cashierNo, :note)`,
        {
          id,
          customerCode: input.customerCode,
          pointTypNo: input.pointTypNo,
          billId: input.billId,
          billNo: input.billNo,
          docAmt: input.docAmt,
          pointCnt: -Math.abs(input.pointCnt),
          pointAmt: input.pointAmt,
          shiftId: input.shiftId,
          cashierNo: input.cashierNo,
          note: input.note,
        },
      );
    } catch (err) {
      // Duplicate redeem for the same bill → return the existing movement.
      if (this.isUniqueViolation(err) && input.billId) {
        const existing = await this.db.queryOne<LedgerRow>(
          `SELECT * FROM ${this.schema}.POINTS_LEDGER
           WHERE BILL_ID = :b AND TRNS_TYPE = 2`,
          { b: input.billId },
        );
        if (existing) return this.map(existing);
      }
      throw err;
    }
    const row = await this.db.queryOne<LedgerRow>(
      `SELECT * FROM ${this.schema}.POINTS_LEDGER WHERE ID = :id`,
      { id },
    );
    if (!row) throw new Error('insertRedeem: ledger row vanished');
    return this.map(row);
  }

  async earnedBalance(customerCode: string): Promise<EarnedPointsBalance> {
    const row = await this.db.queryOne<{ P: number; N: number }>(
      `SELECT NVL(SUM(POINT_CNT),0) AS P, COUNT(*) AS N
       FROM ${this.schema}.POINTS_LEDGER WHERE CUSTOMER_CODE = :c`,
      { c: customerCode },
    );
    return {
      customerCode,
      earnedPoints: Number(row?.P ?? 0),
      txnCount: Number(row?.N ?? 0),
    };
  }

  async ledger(customerCode: string, limit: number): Promise<PointsLedgerRow[]> {
    const rows = await this.db.query<LedgerRow>(
      `SELECT * FROM (
         SELECT * FROM ${this.schema}.POINTS_LEDGER
         WHERE CUSTOMER_CODE = :c
         ORDER BY CREATED_AT DESC
       ) WHERE ROWNUM <= :lim`,
      { c: customerCode, lim: limit },
    );
    return rows.map((r) => this.map(r));
  }

  async summary(): Promise<LoyaltySummary> {
    const row = await this.db.queryOne<{
      EARNED: number;
      REDEEMED: number;
      NET: number;
      EARNED_AMT: number;
      REDEEMED_AMT: number;
      EARN_CNT: number;
      REDEEM_CNT: number;
      CUST_CNT: number;
    }>(
      `SELECT
         NVL(SUM(CASE WHEN TRNS_TYPE = 1 THEN POINT_CNT END), 0)      AS EARNED,
         NVL(SUM(CASE WHEN TRNS_TYPE = 2 THEN -POINT_CNT END), 0)    AS REDEEMED,
         NVL(SUM(POINT_CNT), 0)                                       AS NET,
         NVL(SUM(CASE WHEN TRNS_TYPE = 1 THEN POINT_AMT END), 0)     AS EARNED_AMT,
         NVL(SUM(CASE WHEN TRNS_TYPE = 2 THEN POINT_AMT END), 0)     AS REDEEMED_AMT,
         COUNT(CASE WHEN TRNS_TYPE = 1 THEN 1 END)                   AS EARN_CNT,
         COUNT(CASE WHEN TRNS_TYPE = 2 THEN 1 END)                   AS REDEEM_CNT,
         COUNT(DISTINCT CUSTOMER_CODE)                                AS CUST_CNT
       FROM ${this.schema}.POINTS_LEDGER`,
    );
    return {
      totalEarned: Number(row?.EARNED ?? 0),
      totalRedeemed: Number(row?.REDEEMED ?? 0),
      netOutstanding: Number(row?.NET ?? 0),
      totalEarnedAmt: Number(row?.EARNED_AMT ?? 0),
      totalRedeemedAmt: Number(row?.REDEEMED_AMT ?? 0),
      earnCount: Number(row?.EARN_CNT ?? 0),
      redeemCount: Number(row?.REDEEM_CNT ?? 0),
      customerCount: Number(row?.CUST_CNT ?? 0),
    };
  }

  private map(r: LedgerRow): PointsLedgerRow {
    return {
      id: r.ID,
      customerCode: r.CUSTOMER_CODE,
      pointTypNo: Number(r.POINT_TYP_NO),
      trnsType: Number(r.TRNS_TYPE),
      billId: r.BILL_ID,
      billNo: r.BILL_NO,
      docAmt: Number(r.DOC_AMT),
      pointCnt: Number(r.POINT_CNT),
      pointAmt: Number(r.POINT_AMT),
      shiftId: r.SHIFT_ID,
      cashierNo: r.CASHIER_NO == null ? null : Number(r.CASHIER_NO),
      note: r.NOTE,
      createdAt: r.CREATED_AT.toISOString(),
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

/** Parse a YYYY-MM-DD string into a Date (local midnight) or null. */
function parseDate(s: string | null): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split('-').map((x) => Number(x));
  return new Date(y, m - 1, d);
}

function today(): string {
  const d = new Date();
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function toIsoDate(d: Date): string {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}
