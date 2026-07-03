import { Injectable } from '@nestjs/common';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import { LoyaltyRule } from '../domain/points-policy';
import {
  EarnedPointsBalance,
  InsertEarnInput,
  InsertRedeemInput,
  LoyaltyRepository,
  PointsLedgerRow,
} from '../domain/ports/loyalty-repository.port';

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

  async activeRule(pointTypNo = 1): Promise<LoyaltyRule | null> {
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
