import { Injectable } from '@nestjs/common';
import oracledb from 'oracledb';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import {
  CashierReportRow,
  CustomerStatementReport,
  LoyaltyReport,
  PaymentMethodReportRow,
  PosReportFilter,
  PosReportsRepository,
  ReceivableRow,
  ReturnsReportRow,
  ReturnsWindowReport,
  ShiftHistoryRow,
  ShiftSalesReportRow,
  VoucherSummaryReport,
  VoucherSummaryRow,
} from '../domain/ports/pos-reports-repository.port';

const TRNS_TYPE_NAMES: Record<number, 'EARN' | 'REDEEM' | 'EXPIRE' | 'ADJUST'> =
  { 1: 'EARN', 2: 'REDEEM', 3: 'EXPIRE', 4: 'ADJUST' };

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

  //==========================================================================
  // Wave F — POSR completions
  //==========================================================================

  /** POSR004 — sales aggregated shift-by-shift (with per-shift over/short). */
  async byShift(
    filter: PosReportFilter & { cashierNo?: number },
  ): Promise<ShiftSalesReportRow[]> {
    // Range on the SHIFT's OPENED_AT (shift-centric report); bills/payments
    // roll up to their shift regardless of individual timestamps.
    const binds: Record<string, unknown> = {};
    const where: string[] = ['1 = 1'];
    if (filter.from) {
      binds.fromTs = filter.from;
      where.push(`s.OPENED_AT >= TO_TIMESTAMP(:fromTs, 'YYYY-MM-DD')`);
    }
    if (filter.to) {
      binds.toTs = filter.to;
      where.push(`s.OPENED_AT < TO_TIMESTAMP(:toTs, 'YYYY-MM-DD') + 1`);
    }
    if (filter.shiftId) {
      binds.shiftId = filter.shiftId;
      where.push('s.ID = :shiftId');
    }
    if (filter.cashierNo != null) {
      binds.cashierNo = filter.cashierNo;
      where.push('s.CASHIER_NO = :cashierNo');
    }
    const rows = await this.db.query<{
      ID: string;
      SHIFT_NO: number;
      CASHIER_NO: number;
      MACHINE_NO: number | null;
      STATUS: string;
      OPENED_AT: Date;
      CLOSED_AT: Date | null;
      CASH_DIFFERENCE: number | null;
      BILL_COUNT: number;
      GROSS: number;
      DISC: number;
      VAT: number;
      NET: number;
      CASH: number;
      CARD: number;
      CREDIT: number;
    }>(
      `SELECT s.ID, s.SHIFT_NO, s.CASHIER_NO, s.MACHINE_NO, s.STATUS,
              s.OPENED_AT, s.CLOSED_AT, s.CASH_DIFFERENCE,
              NVL(b.BILL_COUNT, 0) AS BILL_COUNT,
              NVL(b.GROSS, 0)      AS GROSS,
              NVL(b.DISC, 0)       AS DISC,
              NVL(b.VAT, 0)        AS VAT,
              NVL(b.NET, 0)        AS NET,
              NVL(p.CASH, 0)       AS CASH,
              NVL(p.CARD, 0)       AS CARD,
              NVL(p.CREDIT, 0)     AS CREDIT
       FROM ${this.schema}.SHIFTS s
       LEFT JOIN (
         SELECT SHIFT_ID,
                COUNT(*)              AS BILL_COUNT,
                SUM(GROSS_AMT)        AS GROSS,
                SUM(DISCOUNT_AMT)     AS DISC,
                SUM(VAT_AMT)          AS VAT,
                SUM(NET_AMT)          AS NET
         FROM ${this.schema}.BILLS WHERE STATUS = 'POSTED'
         GROUP BY SHIFT_ID
       ) b ON b.SHIFT_ID = s.ID
       LEFT JOIN (
         SELECT SHIFT_ID,
                SUM(CASE WHEN METHOD='CASH'   THEN AMOUNT_IN_BILL END) AS CASH,
                SUM(CASE WHEN METHOD='CARD'   THEN AMOUNT_IN_BILL END) AS CARD,
                SUM(CASE WHEN METHOD='CREDIT' THEN AMOUNT_IN_BILL END) AS CREDIT
         FROM ${this.schema}.PAYMENTS
         GROUP BY SHIFT_ID
       ) p ON p.SHIFT_ID = s.ID
       WHERE ${where.join(' AND ')}
       ORDER BY s.OPENED_AT DESC`,
      binds as oracledb.BindParameters,
    );
    return rows.map((r) => ({
      shiftId: r.ID,
      shiftNo: Number(r.SHIFT_NO),
      cashierNo: Number(r.CASHIER_NO),
      machineNo: r.MACHINE_NO == null ? null : Number(r.MACHINE_NO),
      status: r.STATUS,
      openedAt: r.OPENED_AT.toISOString(),
      closedAt: r.CLOSED_AT ? r.CLOSED_AT.toISOString() : null,
      billCount: Number(r.BILL_COUNT),
      grossAmt: Number(r.GROSS),
      discountAmt: Number(r.DISC),
      vatAmt: Number(r.VAT),
      netAmt: Number(r.NET),
      cashCollected: Number(r.CASH),
      cardCollected: Number(r.CARD),
      creditCollected: Number(r.CREDIT),
      cashDifference:
        r.CASH_DIFFERENCE == null ? null : Number(r.CASH_DIFFERENCE),
    }));
  }

  /** POSR014 — historical shifts with reconciliation + voucher figures. */
  async shiftsHistory(
    filter: PosReportFilter & { status?: string },
  ): Promise<ShiftHistoryRow[]> {
    const binds: Record<string, unknown> = {};
    const where: string[] = ['1 = 1'];
    if (filter.from) {
      binds.fromTs = filter.from;
      where.push(`s.OPENED_AT >= TO_TIMESTAMP(:fromTs, 'YYYY-MM-DD')`);
    }
    if (filter.to) {
      binds.toTs = filter.to;
      where.push(`s.OPENED_AT < TO_TIMESTAMP(:toTs, 'YYYY-MM-DD') + 1`);
    }
    if (filter.status) {
      binds.status = filter.status;
      where.push('s.STATUS = :status');
    }
    const rows = await this.db.query<{
      ID: string;
      SHIFT_NO: number;
      SHIFT_CODE: string | null;
      CASHIER_NO: number;
      MACHINE_NO: number | null;
      CURRENCY: string;
      STATUS: string;
      OPENED_AT: Date;
      CLOSED_AT: Date | null;
      OPENING_BALANCE: number;
      CLOSING_BALANCE: number | null;
      EXPECTED_CASH: number | null;
      CASH_DIFFERENCE: number | null;
      COUNTED_CASH: number | null;
      SETTLE_DIFFERENCE: number | null;
      SETTLED_AT: Date | null;
      CASH_RECEIPTS: number;
      CASH_EXPENSES: number;
    }>(
      `SELECT s.ID, s.SHIFT_NO, s.SHIFT_CODE, s.CASHIER_NO, s.MACHINE_NO,
              s.CURRENCY, s.STATUS, s.OPENED_AT, s.CLOSED_AT,
              s.OPENING_BALANCE, s.CLOSING_BALANCE, s.EXPECTED_CASH,
              s.CASH_DIFFERENCE, s.COUNTED_CASH, s.SETTLE_DIFFERENCE,
              s.SETTLED_AT,
              NVL(v.RECEIPTS, 0) AS CASH_RECEIPTS,
              NVL(v.EXPENSES, 0) AS CASH_EXPENSES
       FROM ${this.schema}.SHIFTS s
       LEFT JOIN (
         SELECT SHIFT_ID,
                SUM(CASE WHEN VOUCHER_TYPE='RECEIPT' AND PAYMENT_METHOD='CASH'
                         THEN AMOUNT_IN_SHIFT END) AS RECEIPTS,
                SUM(CASE WHEN VOUCHER_TYPE='EXPENSE' AND PAYMENT_METHOD='CASH'
                         THEN AMOUNT_IN_SHIFT END) AS EXPENSES
         FROM ${this.schema}.VOUCHERS WHERE STATUS = 'POSTED'
         GROUP BY SHIFT_ID
       ) v ON v.SHIFT_ID = s.ID
       WHERE ${where.join(' AND ')}
       ORDER BY s.OPENED_AT DESC`,
      binds as oracledb.BindParameters,
    );
    return rows.map((r) => ({
      shiftId: r.ID,
      shiftNo: Number(r.SHIFT_NO),
      shiftCode: r.SHIFT_CODE,
      cashierNo: Number(r.CASHIER_NO),
      machineNo: r.MACHINE_NO == null ? null : Number(r.MACHINE_NO),
      currency: r.CURRENCY,
      status: r.STATUS,
      openedAt: r.OPENED_AT.toISOString(),
      closedAt: r.CLOSED_AT ? r.CLOSED_AT.toISOString() : null,
      openingBalance: Number(r.OPENING_BALANCE),
      closingBalance:
        r.CLOSING_BALANCE == null ? null : Number(r.CLOSING_BALANCE),
      expectedCash: r.EXPECTED_CASH == null ? null : Number(r.EXPECTED_CASH),
      cashDifference:
        r.CASH_DIFFERENCE == null ? null : Number(r.CASH_DIFFERENCE),
      countedCash: r.COUNTED_CASH == null ? null : Number(r.COUNTED_CASH),
      settleDifference:
        r.SETTLE_DIFFERENCE == null ? null : Number(r.SETTLE_DIFFERENCE),
      settledAt: r.SETTLED_AT ? r.SETTLED_AT.toISOString() : null,
      cashReceipts: Number(r.CASH_RECEIPTS),
      cashExpenses: Number(r.CASH_EXPENSES),
    }));
  }

  /** POSR002 — full statement of one cash customer (bills/returns/points/collections). */
  async customerStatement(
    filter: PosReportFilter & { customerCode: string },
  ): Promise<CustomerStatementReport> {
    const c = filter.customerCode;
    const rangeOn = (col: string, binds: Record<string, unknown>) => {
      const w: string[] = [];
      if (filter.from) {
        binds.fromTs = filter.from;
        w.push(`${col} >= TO_TIMESTAMP(:fromTs, 'YYYY-MM-DD')`);
      }
      if (filter.to) {
        binds.toTs = filter.to;
        w.push(`${col} < TO_TIMESTAMP(:toTs, 'YYYY-MM-DD') + 1`);
      }
      return w.length ? ' AND ' + w.join(' AND ') : '';
    };

    // Bills
    const billBinds: Record<string, unknown> = { c };
    const bills = await this.db.query<{
      ID: string;
      BILL_NO: string;
      ISSUED_AT: Date;
      CURRENCY: string;
      GROSS_AMT: number;
      DISCOUNT_AMT: number;
      VAT_AMT: number;
      NET_AMT: number;
      PAID_AMT: number;
    }>(
      `SELECT ID, BILL_NO, ISSUED_AT, CURRENCY, GROSS_AMT, DISCOUNT_AMT,
              VAT_AMT, NET_AMT, PAID_AMT
       FROM ${this.schema}.BILLS
       WHERE STATUS = 'POSTED' AND CUSTOMER_CODE = :c${rangeOn('ISSUED_AT', billBinds)}
       ORDER BY ISSUED_AT DESC`,
      billBinds as oracledb.BindParameters,
    );

    // Returns
    const retBinds: Record<string, unknown> = { c };
    const returns = await this.db.query<{
      ID: string;
      RT_BILL_NO: string;
      ORIGINAL_BILL_NO: string;
      ISSUED_AT: Date;
      NET_AMT: number;
      REFUND_AMT: number;
    }>(
      `SELECT ID, RT_BILL_NO, ORIGINAL_BILL_NO, ISSUED_AT, NET_AMT, REFUND_AMT
       FROM ${this.schema}.RETURNS
       WHERE STATUS = 'POSTED' AND CUSTOMER_CODE = :c${rangeOn('ISSUED_AT', retBinds)}
       ORDER BY ISSUED_AT DESC`,
      retBinds as oracledb.BindParameters,
    );

    // Loyalty movements
    const ptsBinds: Record<string, unknown> = { c };
    const points = await this.db.query<{
      TRNS_TYPE: number;
      BILL_NO: string | null;
      DOC_AMT: number;
      POINT_CNT: number;
      POINT_AMT: number;
      CREATED_AT: Date;
    }>(
      `SELECT TRNS_TYPE, BILL_NO, DOC_AMT, POINT_CNT, POINT_AMT, CREATED_AT
       FROM ${this.schema}.POINTS_LEDGER
       WHERE CUSTOMER_CODE = :c${rangeOn('CREATED_AT', ptsBinds)}
       ORDER BY CREATED_AT DESC`,
      ptsBinds as oracledb.BindParameters,
    );

    // Credit collections
    const colBinds: Record<string, unknown> = { c };
    const collections = await this.db.query<{
      ID: string;
      BILL_ID: string;
      METHOD: string;
      CURRENCY: string;
      AMOUNT_IN_BILL: number;
      CREATED_AT: Date;
    }>(
      `SELECT ID, BILL_ID, METHOD, CURRENCY, AMOUNT_IN_BILL, CREATED_AT
       FROM ${this.schema}.CREDIT_COLLECTIONS
       WHERE CUSTOMER_CODE = :c${rangeOn('CREATED_AT', colBinds)}
       ORDER BY CREATED_AT DESC`,
      colBinds as oracledb.BindParameters,
    );

    // Credit exposure (all-time, independent of the range — it is a balance)
    const credit = await this.db.queryOne<{ CREDIT_TOTAL: number }>(
      `SELECT NVL(SUM(AMOUNT_IN_BILL), 0) AS CREDIT_TOTAL
       FROM ${this.schema}.PAYMENTS
       WHERE METHOD = 'CREDIT' AND CUSTOMER_CODE = :c`,
      { c },
    );
    const collectedAll = await this.db.queryOne<{ COLLECTED: number }>(
      `SELECT NVL(SUM(AMOUNT_IN_BILL), 0) AS COLLECTED
       FROM ${this.schema}.CREDIT_COLLECTIONS WHERE CUSTOMER_CODE = :c`,
      { c },
    );

    // Arabic name: our overlay first, else the last bill's snapshot name.
    const nameRow = await this.db.queryOne<{ NAME: string | null }>(
      `SELECT NVL(
         (SELECT AR_NAME FROM ${this.schema}.CUSTOMERS_OVERLAY WHERE CODE = :c),
         (SELECT MAX(CUSTOMER_NAME) FROM ${this.schema}.BILLS WHERE CUSTOMER_CODE = :c)
       ) AS NAME FROM DUAL`,
      { c },
    );

    const salesTotal = bills.reduce((a, b) => a + Number(b.NET_AMT), 0);
    const returnsTotal = returns.reduce((a, b) => a + Number(b.NET_AMT), 0);
    const pointsEarned = points
      .filter((p) => Number(p.TRNS_TYPE) === 1)
      .reduce((a, p) => a + Number(p.POINT_CNT), 0);
    const pointsRedeemed = points
      .filter((p) => Number(p.TRNS_TYPE) === 2)
      .reduce((a, p) => a + Math.abs(Number(p.POINT_CNT)), 0);
    const creditTotal = Number(credit?.CREDIT_TOTAL ?? 0);
    const collectedTotal = Number(collectedAll?.COLLECTED ?? 0);

    return {
      customerCode: c,
      customerName: nameRow?.NAME ?? null,
      from: filter.from ?? null,
      to: filter.to ?? null,
      bills: bills.map((b) => ({
        billId: b.ID,
        billNo: b.BILL_NO,
        issuedAt: b.ISSUED_AT.toISOString(),
        currency: b.CURRENCY,
        grossAmt: Number(b.GROSS_AMT),
        discountAmt: Number(b.DISCOUNT_AMT),
        vatAmt: Number(b.VAT_AMT),
        netAmt: Number(b.NET_AMT),
        paidAmt: Number(b.PAID_AMT),
      })),
      returns: returns.map((r) => ({
        returnId: r.ID,
        rtBillNo: r.RT_BILL_NO,
        originalBillNo: r.ORIGINAL_BILL_NO,
        issuedAt: r.ISSUED_AT.toISOString(),
        netAmt: Number(r.NET_AMT),
        refundAmt: Number(r.REFUND_AMT),
      })),
      points: points.map((p) => ({
        trnsType: Number(p.TRNS_TYPE),
        trnsTypeName: TRNS_TYPE_NAMES[Number(p.TRNS_TYPE)] ?? 'ADJUST',
        billNo: p.BILL_NO,
        docAmt: Number(p.DOC_AMT),
        pointCnt: Number(p.POINT_CNT),
        pointAmt: Number(p.POINT_AMT),
        createdAt: p.CREATED_AT.toISOString(),
      })),
      collections: collections.map((cl) => ({
        collectionId: cl.ID,
        billId: cl.BILL_ID,
        method: cl.METHOD,
        currency: cl.CURRENCY,
        amountInBill: Number(cl.AMOUNT_IN_BILL),
        createdAt: cl.CREATED_AT.toISOString(),
      })),
      totals: {
        billCount: bills.length,
        salesTotal: round4(salesTotal),
        returnCount: returns.length,
        returnsTotal: round4(returnsTotal),
        pointsEarned: round4(pointsEarned),
        pointsRedeemed: round4(pointsRedeemed),
        creditTotal: round4(creditTotal),
        collectedTotal: round4(collectedTotal),
        outstanding: round4(Math.max(0, creditTotal - collectedTotal)),
      },
    };
  }

  /** POSR008 — receivables (ذمم آجلة) per customer, as-of snapshot. */
  async receivables(): Promise<ReceivableRow[]> {
    const rows = await this.db.query<{
      CUSTOMER_CODE: string;
      CUSTOMER_NAME: string | null;
      CREDIT_BILL_COUNT: number;
      CREDIT_TOTAL: number;
      COLLECTED_TOTAL: number;
      LAST_CREDIT_AT: Date | null;
      LAST_COLLECTION_AT: Date | null;
    }>(
      `SELECT cr.CUSTOMER_CODE,
              NVL(o.AR_NAME, cr.SNAP_NAME)  AS CUSTOMER_NAME,
              cr.CREDIT_BILL_COUNT,
              cr.CREDIT_TOTAL,
              NVL(cc.COLLECTED, 0)          AS COLLECTED_TOTAL,
              cr.LAST_CREDIT_AT,
              cc.LAST_COLLECTION_AT
       FROM (
         SELECT p.CUSTOMER_CODE,
                COUNT(DISTINCT p.BILL_ID)   AS CREDIT_BILL_COUNT,
                SUM(p.AMOUNT_IN_BILL)       AS CREDIT_TOTAL,
                MAX(p.CREATED_AT)           AS LAST_CREDIT_AT,
                MAX(b.CUSTOMER_NAME)        AS SNAP_NAME
         FROM ${this.schema}.PAYMENTS p
         JOIN ${this.schema}.BILLS b ON b.ID = p.BILL_ID AND b.STATUS = 'POSTED'
         WHERE p.METHOD = 'CREDIT' AND p.CUSTOMER_CODE IS NOT NULL
         GROUP BY p.CUSTOMER_CODE
       ) cr
       LEFT JOIN (
         SELECT CUSTOMER_CODE,
                SUM(AMOUNT_IN_BILL) AS COLLECTED,
                MAX(CREATED_AT)     AS LAST_COLLECTION_AT
         FROM ${this.schema}.CREDIT_COLLECTIONS
         GROUP BY CUSTOMER_CODE
       ) cc ON cc.CUSTOMER_CODE = cr.CUSTOMER_CODE
       LEFT JOIN ${this.schema}.CUSTOMERS_OVERLAY o ON o.CODE = cr.CUSTOMER_CODE
       ORDER BY cr.CREDIT_TOTAL - NVL(cc.COLLECTED, 0) DESC`,
    );
    return rows.map((r) => {
      const creditTotal = Number(r.CREDIT_TOTAL);
      const collectedTotal = Number(r.COLLECTED_TOTAL);
      return {
        customerCode: r.CUSTOMER_CODE,
        customerName: r.CUSTOMER_NAME,
        creditBillCount: Number(r.CREDIT_BILL_COUNT),
        creditTotal: round4(creditTotal),
        collectedTotal: round4(collectedTotal),
        outstanding: round4(Math.max(0, creditTotal - collectedTotal)),
        lastCreditAt: r.LAST_CREDIT_AT ? r.LAST_CREDIT_AT.toISOString() : null,
        lastCollectionAt: r.LAST_COLLECTION_AT
          ? r.LAST_COLLECTION_AT.toISOString()
          : null,
      };
    });
  }

  /** POSR009/POSR016 — voucher aggregates (machine × type × method × currency). */
  async vouchersSummary(filter: PosReportFilter): Promise<VoucherSummaryReport> {
    const binds: Record<string, unknown> = {};
    const where: string[] = [`v.STATUS = 'POSTED'`];
    if (filter.from) {
      binds.fromTs = filter.from;
      where.push(`v.ISSUED_AT >= TO_TIMESTAMP(:fromTs, 'YYYY-MM-DD')`);
    }
    if (filter.to) {
      binds.toTs = filter.to;
      where.push(`v.ISSUED_AT < TO_TIMESTAMP(:toTs, 'YYYY-MM-DD') + 1`);
    }
    if (filter.shiftId) {
      binds.shiftId = filter.shiftId;
      where.push('v.SHIFT_ID = :shiftId');
    }
    const dbRows = await this.db.query<{
      MACHINE_NO: number | null;
      VOUCHER_TYPE: string;
      PAYMENT_METHOD: string;
      CURRENCY: string;
      CNT: number;
      AMOUNT: number;
      AMOUNT_IN_SHIFT: number;
    }>(
      `SELECT v.MACHINE_NO, v.VOUCHER_TYPE, v.PAYMENT_METHOD, v.CURRENCY,
              COUNT(*)                     AS CNT,
              NVL(SUM(v.AMOUNT), 0)        AS AMOUNT,
              NVL(SUM(v.AMOUNT_IN_SHIFT), 0) AS AMOUNT_IN_SHIFT
       FROM ${this.schema}.VOUCHERS v
       WHERE ${where.join(' AND ')}
       GROUP BY v.MACHINE_NO, v.VOUCHER_TYPE, v.PAYMENT_METHOD, v.CURRENCY
       ORDER BY v.MACHINE_NO, v.VOUCHER_TYPE, v.PAYMENT_METHOD, v.CURRENCY`,
      binds as oracledb.BindParameters,
    );
    const rows: VoucherSummaryRow[] = dbRows.map((r) => ({
      machineNo: r.MACHINE_NO == null ? null : Number(r.MACHINE_NO),
      voucherType: r.VOUCHER_TYPE === 'EXPENSE' ? 'EXPENSE' : 'RECEIPT',
      paymentMethod: r.PAYMENT_METHOD,
      currency: r.CURRENCY,
      voucherCount: Number(r.CNT),
      amount: Number(r.AMOUNT),
      amountInShift: Number(r.AMOUNT_IN_SHIFT),
    }));
    const receipts = rows.filter((r) => r.voucherType === 'RECEIPT');
    const expenses = rows.filter((r) => r.voucherType === 'EXPENSE');
    const receiptsTotal = round4(
      receipts.reduce((a, r) => a + r.amountInShift, 0),
    );
    const expensesTotal = round4(
      expenses.reduce((a, r) => a + r.amountInShift, 0),
    );
    return {
      rows,
      totals: {
        receiptCount: receipts.reduce((a, r) => a + r.voucherCount, 0),
        receiptsTotal,
        expenseCount: expenses.reduce((a, r) => a + r.voucherCount, 0),
        expensesTotal,
        netCashEffect: round4(receiptsTotal - expensesTotal),
      },
    };
  }

  /** POSR010 — loyalty points for a period (by movement type + by customer). */
  async loyaltyReport(
    filter: PosReportFilter & { customerCode?: string },
  ): Promise<LoyaltyReport> {
    const binds: Record<string, unknown> = {};
    const where: string[] = ['1 = 1'];
    if (filter.from) {
      binds.fromTs = filter.from;
      where.push(`l.CREATED_AT >= TO_TIMESTAMP(:fromTs, 'YYYY-MM-DD')`);
    }
    if (filter.to) {
      binds.toTs = filter.to;
      where.push(`l.CREATED_AT < TO_TIMESTAMP(:toTs, 'YYYY-MM-DD') + 1`);
    }
    if (filter.shiftId) {
      binds.shiftId = filter.shiftId;
      where.push('l.SHIFT_ID = :shiftId');
    }
    if (filter.customerCode) {
      binds.cust = filter.customerCode;
      where.push('l.CUSTOMER_CODE = :cust');
    }
    const whereSql = where.join(' AND ');

    const typeRows = await this.db.query<{
      TRNS_TYPE: number;
      CNT: number;
      POINTS: number;
      POINT_AMT: number;
      DOC_AMT: number;
    }>(
      `SELECT l.TRNS_TYPE,
              COUNT(*)               AS CNT,
              NVL(SUM(l.POINT_CNT), 0) AS POINTS,
              NVL(SUM(l.POINT_AMT), 0) AS POINT_AMT,
              NVL(SUM(l.DOC_AMT), 0)   AS DOC_AMT
       FROM ${this.schema}.POINTS_LEDGER l
       WHERE ${whereSql}
       GROUP BY l.TRNS_TYPE
       ORDER BY l.TRNS_TYPE`,
      binds as oracledb.BindParameters,
    );

    const custRows = await this.db.query<{
      CUSTOMER_CODE: string;
      CUSTOMER_NAME: string | null;
      EARNED: number;
      REDEEMED: number;
      EXPIRED: number;
      ADJUSTED: number;
    }>(
      `SELECT l.CUSTOMER_CODE,
              MAX(o.AR_NAME) AS CUSTOMER_NAME,
              NVL(SUM(CASE WHEN l.TRNS_TYPE = 1 THEN l.POINT_CNT END), 0) AS EARNED,
              NVL(SUM(CASE WHEN l.TRNS_TYPE = 2 THEN ABS(l.POINT_CNT) END), 0) AS REDEEMED,
              NVL(SUM(CASE WHEN l.TRNS_TYPE = 3 THEN ABS(l.POINT_CNT) END), 0) AS EXPIRED,
              NVL(SUM(CASE WHEN l.TRNS_TYPE = 4 THEN l.POINT_CNT END), 0) AS ADJUSTED
       FROM ${this.schema}.POINTS_LEDGER l
       LEFT JOIN ${this.schema}.CUSTOMERS_OVERLAY o ON o.CODE = l.CUSTOMER_CODE
       WHERE ${whereSql}
       GROUP BY l.CUSTOMER_CODE
       ORDER BY NVL(SUM(CASE WHEN l.TRNS_TYPE = 1 THEN l.POINT_CNT END), 0) DESC`,
      binds as oracledb.BindParameters,
    );

    const byType = typeRows.map((r) => ({
      trnsType: Number(r.TRNS_TYPE),
      trnsTypeName: TRNS_TYPE_NAMES[Number(r.TRNS_TYPE)] ?? ('ADJUST' as const),
      txnCount: Number(r.CNT),
      points: Number(r.POINTS),
      pointAmt: Number(r.POINT_AMT),
      docAmt: Number(r.DOC_AMT),
    }));
    const sumOf = (t: number) =>
      byType
        .filter((s) => s.trnsType === t)
        .reduce((a, s) => a + Math.abs(s.points), 0);
    const earned = sumOf(1);
    const redeemed = sumOf(2);
    const expired = sumOf(3);
    return {
      from: filter.from ?? null,
      to: filter.to ?? null,
      byType,
      byCustomer: custRows.map((r) => {
        const e = Number(r.EARNED);
        const rd = Number(r.REDEEMED);
        const ex = Number(r.EXPIRED);
        const ad = Number(r.ADJUSTED);
        return {
          customerCode: r.CUSTOMER_CODE,
          customerName: r.CUSTOMER_NAME,
          earned: e,
          redeemed: rd,
          expired: ex,
          adjusted: ad,
          net: round4(e - rd - ex + ad),
        };
      }),
      totals: {
        earned: round4(earned),
        redeemed: round4(redeemed),
        expired: round4(expired),
        net: round4(earned - redeemed - expired),
      },
    };
  }

  /** POSR011 — returns vs the allowed return window (PRD_BACK_HOUR). */
  async returnsWindow(filter: PosReportFilter): Promise<ReturnsWindowReport> {
    // The configured window (hours) lives on the live Onyx parameter row.
    const onyx = this.db.onyxSchema();
    const para = await this.db.queryOne<{ PRD_BACK_HOUR: number | null }>(
      `SELECT PRD_BACK_HOUR FROM ${onyx}.IAS_PARA_POS`,
    );
    const windowHours =
      para?.PRD_BACK_HOUR == null ? null : Number(para.PRD_BACK_HOUR);

    const { where, binds } = this.range(filter, 'r');
    // Delay = return ISSUED_AT minus the ORIGINAL bill's date+time (Onyx
    // header; BILL_TIME is 'HH24:MI:SS'). NULL when the original is missing.
    const rows = await this.db.query<{
      RT_BILL_NO: string;
      ORIGINAL_BILL_NO: string;
      CUSTOMER_NAME: string | null;
      CASHIER_NO: number;
      ISSUED_AT: Date;
      ORIG_DAY: string | null;
      ORIG_TIME: string | null;
      DELAY_HOURS: number | null;
      NET_AMT: number;
      REFUND_AMT: number;
    }>(
      `SELECT r.RT_BILL_NO, r.ORIGINAL_BILL_NO, r.CUSTOMER_NAME, r.CASHIER_NO,
              r.ISSUED_AT, r.NET_AMT, r.REFUND_AMT,
              TO_CHAR(m.BILL_DATE, 'YYYY-MM-DD') AS ORIG_DAY,
              m.BILL_TIME                        AS ORIG_TIME,
              CASE WHEN m.BILL_NO IS NULL THEN NULL ELSE
                ROUND((CAST(r.ISSUED_AT AS DATE)
                       - (TRUNC(m.BILL_DATE)
                          + NVL(TO_NUMBER(SUBSTR(m.BILL_TIME, 1, 2)), 0) / 24
                          + NVL(TO_NUMBER(SUBSTR(m.BILL_TIME, 4, 2)), 0) / 1440
                          + NVL(TO_NUMBER(SUBSTR(m.BILL_TIME, 7, 2)), 0) / 86400)
                      ) * 24, 2)
              END AS DELAY_HOURS
       FROM ${this.schema}.RETURNS r
       LEFT JOIN ${onyx}.IAS_POS_BILL_MST m
         ON TO_CHAR(m.BILL_NO) = r.ORIGINAL_BILL_NO
       WHERE ${where}
       ORDER BY r.ISSUED_AT DESC`,
      binds as oracledb.BindParameters,
    );
    return {
      windowHours,
      rows: rows.map((r) => {
        const delayHours =
          r.DELAY_HOURS == null ? null : Number(r.DELAY_HOURS);
        return {
          rtBillNo: r.RT_BILL_NO,
          originalBillNo: r.ORIGINAL_BILL_NO,
          customerName: r.CUSTOMER_NAME,
          cashierNo: Number(r.CASHIER_NO),
          issuedAt: r.ISSUED_AT.toISOString(),
          originalBillDay: r.ORIG_DAY,
          originalBillTime: r.ORIG_TIME,
          netAmt: Number(r.NET_AMT),
          refundAmt: Number(r.REFUND_AMT),
          delayHours,
          withinWindow:
            windowHours == null || delayHours == null
              ? null
              : delayHours <= windowHours,
        };
      }),
    };
  }
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
