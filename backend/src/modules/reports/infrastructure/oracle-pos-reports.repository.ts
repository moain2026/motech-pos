import { Injectable } from '@nestjs/common';
import oracledb from 'oracledb';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import {
  CashierReportRow,
  PaymentMethodReportRow,
  PosReportFilter,
  PosReportsRepository,
  ReturnsReportRow,
} from '../domain/ports/pos-reports-repository.port';

/**
 * OraclePosReportsRepository — aggregate reads over the MOTECH_POS write schema
 * (our own BILLS / PAYMENTS / RETURNS). Read-only aggregation; no mutations.
 */
@Injectable()
export class OraclePosReportsRepository implements PosReportsRepository {
  constructor(private readonly db: OracleWriteService) {}

  private get schema(): string {
    return this.db.schema();
  }

  /** Build a (whereSql, binds) pair over ISSUED_AT + optional SHIFT_ID. */
  private range(
    filter: PosReportFilter,
    alias: string,
  ): { where: string; binds: Record<string, unknown> } {
    const binds: Record<string, unknown> = {};
    const where: string[] = [`${alias}.STATUS = 'POSTED'`];
    if (filter.from) {
      binds.fromTs = filter.from;
      where.push(`${alias}.ISSUED_AT >= TO_TIMESTAMP(:fromTs, 'YYYY-MM-DD')`);
    }
    if (filter.to) {
      binds.toTs = filter.to;
      where.push(`${alias}.ISSUED_AT < TO_TIMESTAMP(:toTs, 'YYYY-MM-DD') + 1`);
    }
    if (filter.shiftId) {
      binds.shiftId = filter.shiftId;
      where.push(`${alias}.SHIFT_ID = :shiftId`);
    }
    return { where: where.join(' AND '), binds };
  }

  async byCashier(filter: PosReportFilter): Promise<CashierReportRow[]> {
    const { where, binds } = this.range(filter, 'b');
    const rows = await this.db.query<{
      CASHIER_NO: number;
      BILL_COUNT: number;
      GROSS: number;
      DISC: number;
      VAT: number;
      NET: number;
      CASH: number;
      CARD: number;
      CREDIT: number;
    }>(
      `SELECT b.CASHIER_NO,
              COUNT(*)                 AS BILL_COUNT,
              NVL(SUM(b.GROSS_AMT),0)  AS GROSS,
              NVL(SUM(b.DISCOUNT_AMT),0) AS DISC,
              NVL(SUM(b.VAT_AMT),0)    AS VAT,
              NVL(SUM(b.NET_AMT),0)    AS NET,
              NVL(SUM(p.CASH),0)       AS CASH,
              NVL(SUM(p.CARD),0)       AS CARD,
              NVL(SUM(p.CREDIT),0)     AS CREDIT
       FROM ${this.schema}.BILLS b
       LEFT JOIN (
         SELECT BILL_ID,
                SUM(CASE WHEN METHOD='CASH'   THEN AMOUNT_IN_BILL END) AS CASH,
                SUM(CASE WHEN METHOD='CARD'   THEN AMOUNT_IN_BILL END) AS CARD,
                SUM(CASE WHEN METHOD='CREDIT' THEN AMOUNT_IN_BILL END) AS CREDIT
         FROM ${this.schema}.PAYMENTS GROUP BY BILL_ID
       ) p ON p.BILL_ID = b.ID
       WHERE ${where}
       GROUP BY b.CASHIER_NO
       ORDER BY NET DESC`,
      binds as oracledb.BindParameters,
    );
    return rows.map((r) => ({
      cashierNo: Number(r.CASHIER_NO),
      billCount: Number(r.BILL_COUNT),
      grossAmt: Number(r.GROSS),
      discountAmt: Number(r.DISC),
      vatAmt: Number(r.VAT),
      netAmt: Number(r.NET),
      cashCollected: Number(r.CASH),
      cardCollected: Number(r.CARD),
      creditCollected: Number(r.CREDIT),
    }));
  }

  async paymentMethods(
    filter: PosReportFilter,
  ): Promise<PaymentMethodReportRow[]> {
    // Join payments to their bill so we can range-filter by the bill's
    // issued_at / shift and only count POSTED bills.
    const { where, binds } = this.range(filter, 'b');
    const rows = await this.db.query<{
      METHOD: string;
      CURRENCY: string;
      CNT: number;
      AMOUNT: number;
      AMT_IN_BILL: number;
    }>(
      `SELECT p.METHOD, p.CURRENCY,
              COUNT(*)                   AS CNT,
              NVL(SUM(p.AMOUNT),0)       AS AMOUNT,
              NVL(SUM(p.AMOUNT_IN_BILL),0) AS AMT_IN_BILL
       FROM ${this.schema}.PAYMENTS p
       JOIN ${this.schema}.BILLS b ON b.ID = p.BILL_ID
       WHERE ${where}
       GROUP BY p.METHOD, p.CURRENCY
       ORDER BY p.METHOD, p.CURRENCY`,
      binds as oracledb.BindParameters,
    );
    return rows.map((r) => ({
      method: r.METHOD,
      currency: r.CURRENCY,
      txnCount: Number(r.CNT),
      amount: Number(r.AMOUNT),
      amountInBill: Number(r.AMT_IN_BILL),
    }));
  }

  async returns(filter: PosReportFilter): Promise<ReturnsReportRow[]> {
    const { where, binds } = this.range(filter, 'r');
    const rows = await this.db.query<{
      DAY: string;
      CNT: number;
      GROSS: number;
      VAT: number;
      NET: number;
      REFUND: number;
    }>(
      `SELECT TO_CHAR(r.ISSUED_AT, 'YYYY-MM-DD') AS DAY,
              COUNT(*)                AS CNT,
              NVL(SUM(r.GROSS_AMT),0) AS GROSS,
              NVL(SUM(r.VAT_AMT),0)   AS VAT,
              NVL(SUM(r.NET_AMT),0)   AS NET,
              NVL(SUM(r.REFUND_AMT),0) AS REFUND
       FROM ${this.schema}.RETURNS r
       WHERE ${where}
       GROUP BY TO_CHAR(r.ISSUED_AT, 'YYYY-MM-DD')
       ORDER BY DAY DESC`,
      binds as oracledb.BindParameters,
    );
    return rows.map((r) => ({
      day: r.DAY,
      returnCount: Number(r.CNT),
      grossAmt: Number(r.GROSS),
      vatAmt: Number(r.VAT),
      netAmt: Number(r.NET),
      refundAmt: Number(r.REFUND),
    }));
  }
}
