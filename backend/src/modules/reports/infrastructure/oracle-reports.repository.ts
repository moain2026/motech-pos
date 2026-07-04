import { Injectable } from '@nestjs/common';
import type { BindParameters } from 'oracledb';
import { OracleService } from '../../../infrastructure/oracle/oracle.service';
import {
  AuditReportRow,
  CategoryReportRow,
  ComparisonPeriod,
  ComparisonReport,
  CustomerGroupReportRow,
  CustomerReportRow,
  DailyReportRow,
  DateRangeFilter,
  DiscountReportRow,
  HourlyReportRow,
  ItemMovementReport,
  ItemMovementRow,
  ItemReportRow,
  MachineReportRow,
  MonthlyReportRow,
  ProfitReportRow,
  ReportsRepository,
  SalesOrderRow,
  SlowMovingRow,
  TaxReportRow,
  VatDetailedRow,
  ZPaymentSlice,
  ZReportSummary,
} from '../domain/ports/reports-repository.port';

/**
 * OracleReportsRepository — reads the real YSPOS23.IAS_POS_BILL_MST / _DTL
 * tables (and the IAS202623.IAS_ITM_MST item master for Arabic names) through
 * the READ-ONLY MOTECH_RO connection. All SQL is schema-qualified and uses
 * bind variables (no concatenation). READ-ONLY: no INSERT/UPDATE/DELETE.
 *
 * `HUNG = 0` mirrors the bills read repository — suspended/hung bills are
 * excluded so the aggregates match the operational reporting semantics.
 */
@Injectable()
export class OracleReportsRepository implements ReportsRepository {
  constructor(private readonly oracle: OracleService) {}

  private get schema(): string {
    return this.oracle.schema();
  }

  private get masterSchema(): string {
    return this.oracle.masterSchema();
  }

  /** Build the shared WHERE clause + binds for a BILL_DATE range on alias `a`. */
  private range(
    filter: DateRangeFilter,
    alias = '',
  ): { where: string[]; binds: Record<string, unknown> } {
    const p = alias ? `${alias}.` : '';
    const where: string[] = [`${p}HUNG = 0`];
    const binds: Record<string, unknown> = {};
    if (filter.from) {
      where.push(`${p}BILL_DATE >= TO_DATE(:fromD, 'YYYY-MM-DD')`);
      binds.fromD = filter.from;
    }
    if (filter.to) {
      where.push(`${p}BILL_DATE < TO_DATE(:toD, 'YYYY-MM-DD') + 1`);
      binds.toD = filter.to;
    }
    return { where, binds };
  }

  async daily(filter: DateRangeFilter): Promise<DailyReportRow[]> {
    const { where, binds } = this.range(filter);
    type Row = {
      DAY: string;
      BILL_COUNT: number;
      TOTAL_AMT: number;
      TOTAL_VAT: number;
      TOTAL_DISC: number;
    };
    const rows = await this.oracle.query<Row>(
      `SELECT TO_CHAR(TRUNC(BILL_DATE), 'YYYY-MM-DD') AS DAY,
              COUNT(*)              AS BILL_COUNT,
              SUM(BILL_AMT)         AS TOTAL_AMT,
              SUM(NVL(VAT_AMT, 0))  AS TOTAL_VAT,
              SUM(NVL(DISC_AMT, 0)) AS TOTAL_DISC
       FROM ${this.schema}.IAS_POS_BILL_MST
       WHERE ${where.join(' AND ')}
       GROUP BY TRUNC(BILL_DATE)
       ORDER BY TRUNC(BILL_DATE) DESC`,
      binds as BindParameters,
    );
    return rows.map((r) => ({
      day: r.DAY,
      billCount: Number(r.BILL_COUNT),
      totalAmt: Number(r.TOTAL_AMT ?? 0),
      totalVat: Number(r.TOTAL_VAT ?? 0),
      totalDisc: Number(r.TOTAL_DISC ?? 0),
    }));
  }

  async monthly(filter: DateRangeFilter): Promise<MonthlyReportRow[]> {
    const { where, binds } = this.range(filter);
    type Row = {
      MONTH: string;
      BILL_COUNT: number;
      TOTAL_AMT: number;
      TOTAL_VAT: number;
      TOTAL_DISC: number;
    };
    const rows = await this.oracle.query<Row>(
      `SELECT TO_CHAR(TRUNC(BILL_DATE, 'MM'), 'YYYY-MM') AS MONTH,
              COUNT(*)              AS BILL_COUNT,
              SUM(BILL_AMT)         AS TOTAL_AMT,
              SUM(NVL(VAT_AMT, 0))  AS TOTAL_VAT,
              SUM(NVL(DISC_AMT, 0)) AS TOTAL_DISC
       FROM ${this.schema}.IAS_POS_BILL_MST
       WHERE ${where.join(' AND ')}
       GROUP BY TRUNC(BILL_DATE, 'MM')
       ORDER BY TRUNC(BILL_DATE, 'MM') DESC`,
      binds as BindParameters,
    );
    return rows.map((r) => ({
      month: r.MONTH,
      billCount: Number(r.BILL_COUNT),
      totalAmt: Number(r.TOTAL_AMT ?? 0),
      totalVat: Number(r.TOTAL_VAT ?? 0),
      totalDisc: Number(r.TOTAL_DISC ?? 0),
    }));
  }

  async byItem(
    filter: DateRangeFilter & { limit: number },
  ): Promise<ItemReportRow[]> {
    // Filter the range on the MST header (via the BILL_NO join) so date
    // filtering stays consistent with the other reports.
    const { where, binds } = this.range(filter, 'm');
    binds.lim = filter.limit;
    type Row = {
      I_CODE: string;
      I_NAME: string | null;
      TOTAL_QTY: number;
      TOTAL_AMT: number;
      LINE_COUNT: number;
    };
    const rows = await this.oracle.query<Row>(
      `SELECT * FROM (
         SELECT d.I_CODE                                   AS I_CODE,
                MAX(nm.I_NAME)                             AS I_NAME,
                SUM(d.I_QTY)                               AS TOTAL_QTY,
                SUM(d.I_QTY * NVL(d.I_PRICE, 0))           AS TOTAL_AMT,
                COUNT(*)                                   AS LINE_COUNT
         FROM ${this.schema}.IAS_POS_BILL_DTL d
         JOIN ${this.schema}.IAS_POS_BILL_MST m ON m.BILL_NO = d.BILL_NO
         LEFT JOIN ${this.masterSchema}.IAS_ITM_MST nm ON nm.I_CODE = d.I_CODE
         WHERE ${where.join(' AND ')}
         GROUP BY d.I_CODE
         ORDER BY SUM(d.I_QTY) DESC
       ) WHERE ROWNUM <= :lim`,
      binds as BindParameters,
    );
    return rows.map((r) => ({
      iCode: r.I_CODE,
      iName: r.I_NAME,
      totalQty: Number(r.TOTAL_QTY ?? 0),
      totalAmt: Number(r.TOTAL_AMT ?? 0),
      lineCount: Number(r.LINE_COUNT),
    }));
  }

  async byMachine(filter: DateRangeFilter): Promise<MachineReportRow[]> {
    const { where, binds } = this.range(filter);
    type Row = {
      MACHINE_NO: number | null;
      BILL_COUNT: number;
      TOTAL_AMT: number;
      TOTAL_VAT: number;
      TOTAL_DISC: number;
    };
    const rows = await this.oracle.query<Row>(
      `SELECT MACHINE_NO            AS MACHINE_NO,
              COUNT(*)              AS BILL_COUNT,
              SUM(BILL_AMT)         AS TOTAL_AMT,
              SUM(NVL(VAT_AMT, 0))  AS TOTAL_VAT,
              SUM(NVL(DISC_AMT, 0)) AS TOTAL_DISC
       FROM ${this.schema}.IAS_POS_BILL_MST
       WHERE ${where.join(' AND ')}
       GROUP BY MACHINE_NO
       ORDER BY SUM(BILL_AMT) DESC`,
      binds as BindParameters,
    );
    return rows.map((r) => ({
      machineNo: r.MACHINE_NO == null ? null : Number(r.MACHINE_NO),
      billCount: Number(r.BILL_COUNT),
      totalAmt: Number(r.TOTAL_AMT ?? 0),
      totalVat: Number(r.TOTAL_VAT ?? 0),
      totalDisc: Number(r.TOTAL_DISC ?? 0),
    }));
  }

  //==========================================================================
  // Extended YSPOS23 reports (tax / hourly / customers / discount / category /
  // z-report). All READ-ONLY, schema-qualified, bind variables only.
  //==========================================================================

  async taxReport(filter: DateRangeFilter): Promise<TaxReportRow[]> {
    const { where, binds } = this.range(filter);
    type Row = {
      DAY: string;
      BILL_COUNT: number;
      TOTAL_VAT: number;
      TOTAL_DISC: number;
      TOTAL_AMT: number;
    };
    const rows = await this.oracle.query<Row>(
      `SELECT TO_CHAR(TRUNC(BILL_DATE), 'YYYY-MM-DD') AS DAY,
              COUNT(*)              AS BILL_COUNT,
              SUM(NVL(VAT_AMT, 0))  AS TOTAL_VAT,
              SUM(NVL(DISC_AMT, 0)) AS TOTAL_DISC,
              SUM(BILL_AMT)         AS TOTAL_AMT
       FROM ${this.schema}.IAS_POS_BILL_MST
       WHERE ${where.join(' AND ')}
       GROUP BY TRUNC(BILL_DATE)
       ORDER BY TRUNC(BILL_DATE) DESC`,
      binds as BindParameters,
    );
    return rows.map((r) => {
      const totalAmt = Number(r.TOTAL_AMT ?? 0);
      const totalVat = Number(r.TOTAL_VAT ?? 0);
      return {
        day: r.DAY,
        billCount: Number(r.BILL_COUNT),
        totalVat,
        totalDisc: Number(r.TOTAL_DISC ?? 0),
        totalAmt,
        netBeforeVat: totalAmt - totalVat,
      };
    });
  }

  async hourlySales(filter: DateRangeFilter): Promise<HourlyReportRow[]> {
    const { where, binds } = this.range(filter);
    // BILL_DATE is date-only; the wall-clock hour lives in BILL_TIME
    // ('HH24:MI:SS'). Bills with a NULL time are excluded from the hourly cut.
    type Row = {
      HOUR: string;
      BILL_COUNT: number;
      TOTAL_AMT: number;
      TOTAL_VAT: number;
      TOTAL_DISC: number;
    };
    const rows = await this.oracle.query<Row>(
      `SELECT SUBSTR(BILL_TIME, 1, 2) AS HOUR,
              COUNT(*)              AS BILL_COUNT,
              SUM(BILL_AMT)         AS TOTAL_AMT,
              SUM(NVL(VAT_AMT, 0))  AS TOTAL_VAT,
              SUM(NVL(DISC_AMT, 0)) AS TOTAL_DISC
       FROM ${this.schema}.IAS_POS_BILL_MST
       WHERE ${where.join(' AND ')}
         AND BILL_TIME IS NOT NULL
       GROUP BY SUBSTR(BILL_TIME, 1, 2)
       ORDER BY SUBSTR(BILL_TIME, 1, 2)`,
      binds as BindParameters,
    );
    return rows.map((r) => ({
      hour: r.HOUR,
      billCount: Number(r.BILL_COUNT),
      totalAmt: Number(r.TOTAL_AMT ?? 0),
      totalVat: Number(r.TOTAL_VAT ?? 0),
      totalDisc: Number(r.TOTAL_DISC ?? 0),
    }));
  }

  async topCustomers(
    filter: DateRangeFilter & { limit: number },
  ): Promise<CustomerReportRow[]> {
    const { where, binds } = this.range(filter);
    binds.lim = filter.limit;
    // Group by the customer key recorded on the bill header. Bills with no
    // customer (walk-in) collapse into a single NULL-keyed bucket.
    type Row = {
      C_CODE: string | null;
      C_NAME: string | null;
      CUST_CODE: string | null;
      BILL_COUNT: number;
      TOTAL_AMT: number;
      TOTAL_VAT: number;
      TOTAL_DISC: number;
    };
    const rows = await this.oracle.query<Row>(
      `SELECT * FROM (
         SELECT C_CODE                AS C_CODE,
                MAX(C_NAME)           AS C_NAME,
                CUST_CODE             AS CUST_CODE,
                COUNT(*)              AS BILL_COUNT,
                SUM(BILL_AMT)         AS TOTAL_AMT,
                SUM(NVL(VAT_AMT, 0))  AS TOTAL_VAT,
                SUM(NVL(DISC_AMT, 0)) AS TOTAL_DISC
         FROM ${this.schema}.IAS_POS_BILL_MST
         WHERE ${where.join(' AND ')}
         GROUP BY C_CODE, CUST_CODE
         ORDER BY SUM(BILL_AMT) DESC
       ) WHERE ROWNUM <= :lim`,
      binds as BindParameters,
    );
    return rows.map((r) => ({
      cCode: r.C_CODE,
      cName: r.C_NAME,
      custCode: r.CUST_CODE,
      billCount: Number(r.BILL_COUNT),
      totalAmt: Number(r.TOTAL_AMT ?? 0),
      totalVat: Number(r.TOTAL_VAT ?? 0),
      totalDisc: Number(r.TOTAL_DISC ?? 0),
    }));
  }

  async discountReport(filter: DateRangeFilter): Promise<DiscountReportRow[]> {
    const { where, binds } = this.range(filter);
    type Row = {
      DAY: string;
      BILL_COUNT: number;
      TOTAL_DISC: number;
      TOTAL_AMT: number;
    };
    const rows = await this.oracle.query<Row>(
      `SELECT TO_CHAR(TRUNC(BILL_DATE), 'YYYY-MM-DD') AS DAY,
              COUNT(*)              AS BILL_COUNT,
              SUM(NVL(DISC_AMT, 0)) AS TOTAL_DISC,
              SUM(BILL_AMT)         AS TOTAL_AMT
       FROM ${this.schema}.IAS_POS_BILL_MST
       WHERE ${where.join(' AND ')}
       GROUP BY TRUNC(BILL_DATE)
       ORDER BY TRUNC(BILL_DATE) DESC`,
      binds as BindParameters,
    );
    return rows.map((r) => {
      const totalDisc = Number(r.TOTAL_DISC ?? 0);
      const totalAmt = Number(r.TOTAL_AMT ?? 0);
      const base = totalAmt + totalDisc; // pre-discount gross
      return {
        day: r.DAY,
        billCount: Number(r.BILL_COUNT),
        totalDisc,
        totalAmt,
        discPct: base > 0 ? (totalDisc / base) * 100 : 0,
      };
    });
  }

  async salesByCategory(
    filter: DateRangeFilter & { machineNo?: number },
  ): Promise<CategoryReportRow[]> {
    // Filter the range on the MST header; resolve the category through the
    // item master (ITEM_TYPE) -> ITEM_TYPES lookup in the master schema.
    // Optional machine filter = POSR006's "مبيعات حسب نوع الصنف/الآلة".
    const { where, binds } = this.range(filter, 'm');
    if (filter.machineNo != null) {
      where.push('m.MACHINE_NO = :machineNo');
      binds.machineNo = filter.machineNo;
    }
    type Row = {
      CATEGORY_NO: number | null;
      CATEGORY_NAME: string | null;
      LINE_COUNT: number;
      TOTAL_QTY: number;
      TOTAL_AMT: number;
    };
    const rows = await this.oracle.query<Row>(
      `SELECT im.ITEM_TYPE                        AS CATEGORY_NO,
              MAX(it.IT_A_NAME)                  AS CATEGORY_NAME,
              COUNT(*)                           AS LINE_COUNT,
              SUM(d.I_QTY)                       AS TOTAL_QTY,
              SUM(d.I_QTY * NVL(d.I_PRICE, 0))   AS TOTAL_AMT
       FROM ${this.schema}.IAS_POS_BILL_DTL d
       JOIN ${this.schema}.IAS_POS_BILL_MST m ON m.BILL_NO = d.BILL_NO
       LEFT JOIN ${this.masterSchema}.IAS_ITM_MST im ON im.I_CODE = d.I_CODE
       LEFT JOIN ${this.masterSchema}.ITEM_TYPES it
              ON it.TYPE_OF_ITEM = im.ITEM_TYPE
       WHERE ${where.join(' AND ')}
       GROUP BY im.ITEM_TYPE
       ORDER BY SUM(d.I_QTY * NVL(d.I_PRICE, 0)) DESC`,
      binds as BindParameters,
    );
    return rows.map((r) => ({
      categoryNo: r.CATEGORY_NO == null ? null : Number(r.CATEGORY_NO),
      categoryName: r.CATEGORY_NAME,
      lineCount: Number(r.LINE_COUNT),
      totalQty: Number(r.TOTAL_QTY ?? 0),
      totalAmt: Number(r.TOTAL_AMT ?? 0),
    }));
  }

  async zReport(
    filter: DateRangeFilter & { machineNo?: number },
  ): Promise<ZReportSummary> {
    const { where, binds } = this.range(filter);
    if (filter.machineNo != null) {
      where.push('MACHINE_NO = :machineNo');
      binds.machineNo = filter.machineNo;
    }
    type Row = {
      BILL_COUNT: number;
      GROSS: number;
      TOTAL_VAT: number;
      TOTAL_DISC: number;
      RET_AMT: number;
      CR_CARD: number;
      FIRST_TIME: string | null;
      LAST_TIME: string | null;
    };
    const [row] = await this.oracle.query<Row>(
      `SELECT COUNT(*)                   AS BILL_COUNT,
              NVL(SUM(BILL_AMT), 0)      AS GROSS,
              SUM(NVL(VAT_AMT, 0))       AS TOTAL_VAT,
              SUM(NVL(DISC_AMT, 0))      AS TOTAL_DISC,
              SUM(NVL(RET_AMT, 0))       AS RET_AMT,
              SUM(NVL(CR_CARD_AMT, 0))   AS CR_CARD,
              MIN(BILL_TIME)             AS FIRST_TIME,
              MAX(BILL_TIME)             AS LAST_TIME
       FROM ${this.schema}.IAS_POS_BILL_MST
       WHERE ${where.join(' AND ')}`,
      binds as BindParameters,
    );
    const gross = Number(row?.GROSS ?? 0);
    const card = Number(row?.CR_CARD ?? 0);
    const cash = gross - card; // remainder settled in cash
    const byPayment: ZPaymentSlice[] = [
      { method: 'CASH', billCount: Number(row?.BILL_COUNT ?? 0), amount: cash },
      { method: 'CARD', billCount: Number(row?.BILL_COUNT ?? 0), amount: card },
    ];
    const totalVat = Number(row?.TOTAL_VAT ?? 0);
    return {
      from: filter.from ?? null,
      to: filter.to ?? null,
      machineNo: filter.machineNo ?? null,
      billCount: Number(row?.BILL_COUNT ?? 0),
      grossAmt: gross,
      totalVat,
      totalDisc: Number(row?.TOTAL_DISC ?? 0),
      netBeforeVat: gross - totalVat,
      returnAmt: Number(row?.RET_AMT ?? 0),
      firstBillTime: row?.FIRST_TIME ?? null,
      lastBillTime: row?.LAST_TIME ?? null,
      byPayment,
    };
  }

  //==========================================================================
  // Historical / advanced reports (slow-moving, profit, comparison,
  // item-movement, audit trail, detailed VAT). All READ-ONLY,
  // schema-qualified, bind variables only.
  //==========================================================================

  async slowMoving(
    filter: DateRangeFilter & { limit: number; maxQty: number },
  ): Promise<SlowMovingRow[]> {
    // LEFT JOIN the item master against the period's sales so items with ZERO
    // sales also appear (totalQty = 0), sorted slowest-first.
    const { where, binds } = this.range(filter, 'm');
    binds.lim = filter.limit;
    binds.maxQty = filter.maxQty;
    type Row = {
      I_CODE: string;
      I_NAME: string | null;
      TOTAL_QTY: number | null;
      TOTAL_AMT: number | null;
      LINE_COUNT: number | null;
      LAST_SOLD: string | null;
    };
    const rows = await this.oracle.query<Row>(
      `SELECT * FROM (
         SELECT im.I_CODE                             AS I_CODE,
                im.I_NAME                             AS I_NAME,
                NVL(s.TOTAL_QTY, 0)                   AS TOTAL_QTY,
                NVL(s.TOTAL_AMT, 0)                   AS TOTAL_AMT,
                NVL(s.LINE_COUNT, 0)                  AS LINE_COUNT,
                s.LAST_SOLD                           AS LAST_SOLD
         FROM ${this.masterSchema}.IAS_ITM_MST im
         LEFT JOIN (
           SELECT d.I_CODE,
                  SUM(d.I_QTY)                             AS TOTAL_QTY,
                  SUM(d.I_QTY * NVL(d.I_PRICE, 0))         AS TOTAL_AMT,
                  COUNT(*)                                 AS LINE_COUNT,
                  TO_CHAR(MAX(m.BILL_DATE), 'YYYY-MM-DD')  AS LAST_SOLD
           FROM ${this.schema}.IAS_POS_BILL_DTL d
           JOIN ${this.schema}.IAS_POS_BILL_MST m ON m.BILL_NO = d.BILL_NO
           WHERE ${where.join(' AND ')}
           GROUP BY d.I_CODE
         ) s ON s.I_CODE = im.I_CODE
         WHERE NVL(s.TOTAL_QTY, 0) <= :maxQty
         ORDER BY NVL(s.TOTAL_QTY, 0) ASC, im.I_CODE
       ) WHERE ROWNUM <= :lim`,
      binds as BindParameters,
    );
    return rows.map((r) => ({
      iCode: r.I_CODE,
      iName: r.I_NAME,
      totalQty: Number(r.TOTAL_QTY ?? 0),
      totalAmt: Number(r.TOTAL_AMT ?? 0),
      lineCount: Number(r.LINE_COUNT ?? 0),
      lastSoldDay: r.LAST_SOLD ?? null,
    }));
  }

  async profitReport(
    filter: DateRangeFilter & { limit: number },
  ): Promise<ProfitReportRow[]> {
    // Cost source: IAS202623.IAS_ITM_MST.PRIMARY_COST. Items with no recorded
    // cost (0/NULL) still appear with costAvailable=false so the caller can
    // distinguish "no profit" from "no cost data".
    const { where, binds } = this.range(filter, 'm');
    binds.lim = filter.limit;
    type Row = {
      I_CODE: string;
      I_NAME: string | null;
      TOTAL_QTY: number;
      REVENUE: number;
      COST: number;
      HAS_COST: number;
    };
    const rows = await this.oracle.query<Row>(
      `SELECT * FROM (
         SELECT d.I_CODE                                          AS I_CODE,
                MAX(im.I_NAME)                                    AS I_NAME,
                SUM(d.I_QTY)                                      AS TOTAL_QTY,
                SUM(d.I_QTY * NVL(d.I_PRICE, 0))                  AS REVENUE,
                SUM(d.I_QTY * NVL(im.PRIMARY_COST, 0))            AS COST,
                MAX(CASE WHEN NVL(im.PRIMARY_COST, 0) > 0 THEN 1 ELSE 0 END)
                                                                  AS HAS_COST
         FROM ${this.schema}.IAS_POS_BILL_DTL d
         JOIN ${this.schema}.IAS_POS_BILL_MST m ON m.BILL_NO = d.BILL_NO
         LEFT JOIN ${this.masterSchema}.IAS_ITM_MST im ON im.I_CODE = d.I_CODE
         WHERE ${where.join(' AND ')}
         GROUP BY d.I_CODE
         ORDER BY SUM(d.I_QTY * NVL(d.I_PRICE, 0))
                  - SUM(d.I_QTY * NVL(im.PRIMARY_COST, 0)) DESC
       ) WHERE ROWNUM <= :lim`,
      binds as BindParameters,
    );
    return rows.map((r) => {
      const revenue = Number(r.REVENUE ?? 0);
      const cost = Number(r.COST ?? 0);
      const profit = revenue - cost;
      return {
        iCode: r.I_CODE,
        iName: r.I_NAME,
        totalQty: Number(r.TOTAL_QTY ?? 0),
        revenue,
        cost,
        profit,
        marginPct: revenue > 0 ? (profit / revenue) * 100 : 0,
        costAvailable: Number(r.HAS_COST) === 1,
      };
    });
  }

  /** Aggregate one comparison side ([from, to] inclusive). */
  private async comparisonSlice(
    from: string,
    to: string,
  ): Promise<ComparisonPeriod> {
    type Row = {
      BILL_COUNT: number;
      TOTAL_AMT: number;
      TOTAL_VAT: number;
      TOTAL_DISC: number;
    };
    const [row] = await this.oracle.query<Row>(
      `SELECT COUNT(*)              AS BILL_COUNT,
              NVL(SUM(BILL_AMT), 0) AS TOTAL_AMT,
              SUM(NVL(VAT_AMT, 0))  AS TOTAL_VAT,
              SUM(NVL(DISC_AMT, 0)) AS TOTAL_DISC
       FROM ${this.schema}.IAS_POS_BILL_MST
       WHERE HUNG = 0
         AND BILL_DATE >= TO_DATE(:fromD, 'YYYY-MM-DD')
         AND BILL_DATE < TO_DATE(:toD, 'YYYY-MM-DD') + 1`,
      { fromD: from, toD: to } as BindParameters,
    );
    const billCount = Number(row?.BILL_COUNT ?? 0);
    const totalAmt = Number(row?.TOTAL_AMT ?? 0);
    return {
      from,
      to,
      billCount,
      totalAmt,
      totalVat: Number(row?.TOTAL_VAT ?? 0),
      totalDisc: Number(row?.TOTAL_DISC ?? 0),
      avgBill: billCount > 0 ? totalAmt / billCount : 0,
    };
  }

  async comparison(periods: {
    fromA: string;
    toA: string;
    fromB: string;
    toB: string;
  }): Promise<ComparisonReport> {
    const [periodA, periodB] = await Promise.all([
      this.comparisonSlice(periods.fromA, periods.toA),
      this.comparisonSlice(periods.fromB, periods.toB),
    ]);
    const deltaAmt = periodA.totalAmt - periodB.totalAmt;
    const deltaBills = periodA.billCount - periodB.billCount;
    return {
      periodA,
      periodB,
      deltaAmt,
      deltaAmtPct:
        periodB.totalAmt !== 0 ? (deltaAmt / periodB.totalAmt) * 100 : 0,
      deltaBills,
      deltaBillsPct:
        periodB.billCount !== 0 ? (deltaBills / periodB.billCount) * 100 : 0,
    };
  }

  async itemMovement(
    filter: DateRangeFilter & { iCode: string; limit: number },
  ): Promise<ItemMovementReport> {
    // Sales come from IAS_POS_BILL_DTL/MST, returns from IAS_POS_RT_BILL_DTL/
    // MST (qty negated). UNION ALL keeps both legs schema-qualified + bound.
    const binds: Record<string, unknown> = {
      iCode: filter.iCode,
      lim: filter.limit,
    };
    const saleWhere = ['m.HUNG = 0', 'd.I_CODE = :iCode'];
    const retWhere = ['rm.HUNG = 0', 'rd.I_CODE = :iCode'];
    if (filter.from) {
      saleWhere.push(`m.BILL_DATE >= TO_DATE(:fromD, 'YYYY-MM-DD')`);
      retWhere.push(`rm.RT_BILL_DATE >= TO_DATE(:fromD, 'YYYY-MM-DD')`);
      binds.fromD = filter.from;
    }
    if (filter.to) {
      saleWhere.push(`m.BILL_DATE < TO_DATE(:toD, 'YYYY-MM-DD') + 1`);
      retWhere.push(`rm.RT_BILL_DATE < TO_DATE(:toD, 'YYYY-MM-DD') + 1`);
      binds.toD = filter.to;
    }
    type Row = {
      MOVE_TYPE: string;
      BILL_NO: number;
      DAY: string;
      BILL_TIME: string | null;
      QTY: number;
      PRICE: number;
      MACHINE_NO: number | null;
    };
    const rows = await this.oracle.query<Row>(
      `SELECT * FROM (
         SELECT 'SALE'                                   AS MOVE_TYPE,
                m.BILL_NO                                AS BILL_NO,
                TO_CHAR(m.BILL_DATE, 'YYYY-MM-DD')       AS DAY,
                m.BILL_TIME                              AS BILL_TIME,
                d.I_QTY                                  AS QTY,
                NVL(d.I_PRICE, 0)                        AS PRICE,
                m.MACHINE_NO                             AS MACHINE_NO
         FROM ${this.schema}.IAS_POS_BILL_DTL d
         JOIN ${this.schema}.IAS_POS_BILL_MST m ON m.BILL_NO = d.BILL_NO
         WHERE ${saleWhere.join(' AND ')}
         UNION ALL
         SELECT 'RETURN'                                 AS MOVE_TYPE,
                rm.RT_BILL_NO                            AS BILL_NO,
                TO_CHAR(rm.RT_BILL_DATE, 'YYYY-MM-DD')   AS DAY,
                rm.RT_BILL_TIME                          AS BILL_TIME,
                -rd.I_QTY                                AS QTY,
                NVL(rd.I_PRICE, 0)                       AS PRICE,
                rm.MACHINE_NO                            AS MACHINE_NO
         FROM ${this.schema}.IAS_POS_RT_BILL_DTL rd
         JOIN ${this.schema}.IAS_POS_RT_BILL_MST rm
           ON rm.RT_BILL_NO = rd.RT_BILL_NO
         WHERE ${retWhere.join(' AND ')}
         ORDER BY DAY DESC, BILL_TIME DESC
       ) WHERE ROWNUM <= :lim`,
      binds as BindParameters,
    );
    // Arabic item name from the master schema.
    type NameRow = { I_NAME: string | null };
    const [nameRow] = await this.oracle.query<NameRow>(
      `SELECT I_NAME FROM ${this.masterSchema}.IAS_ITM_MST WHERE I_CODE = :iCode`,
      { iCode: filter.iCode } as BindParameters,
    );
    const movements: ItemMovementRow[] = rows.map((r) => {
      const qty = Number(r.QTY ?? 0);
      const price = Number(r.PRICE ?? 0);
      return {
        moveType: r.MOVE_TYPE === 'RETURN' ? 'RETURN' : 'SALE',
        billNo: Number(r.BILL_NO),
        day: r.DAY,
        time: r.BILL_TIME ?? null,
        qty,
        price,
        amount: qty * price,
        machineNo: r.MACHINE_NO == null ? null : Number(r.MACHINE_NO),
      };
    });
    const totalSoldQty = movements
      .filter((mv) => mv.moveType === 'SALE')
      .reduce((s, mv) => s + mv.qty, 0);
    const totalReturnedQty = movements
      .filter((mv) => mv.moveType === 'RETURN')
      .reduce((s, mv) => s + Math.abs(mv.qty), 0);
    return {
      iCode: filter.iCode,
      iName: nameRow?.I_NAME ?? null,
      totalSoldQty,
      totalReturnedQty,
      netQty: totalSoldQty - totalReturnedQty,
      netAmt: movements.reduce((s, mv) => s + mv.amount, 0),
      movements,
    };
  }

  async auditReport(
    filter: DateRangeFilter & { limit: number },
  ): Promise<AuditReportRow[]> {
    // IAS_POS_AUD_ITEM records every line DELETED off a bill at the POS
    // (deleted-item audit trail; POSR005 domain). Filter on AUD_DATE (when
    // the deletion happened) and resolve the deleting user's Arabic name.
    const where: string[] = ['1 = 1'];
    const binds: Record<string, unknown> = { lim: filter.limit };
    if (filter.from) {
      where.push(`a.AUD_DATE >= TO_DATE(:fromD, 'YYYY-MM-DD')`);
      binds.fromD = filter.from;
    }
    if (filter.to) {
      where.push(`a.AUD_DATE < TO_DATE(:toD, 'YYYY-MM-DD') + 1`);
      binds.toD = filter.to;
    }
    type Row = {
      BILL_NO: number;
      BILL_DAY: string | null;
      BILL_TIME: string | null;
      I_CODE: string;
      I_NAME: string | null;
      I_QTY: number;
      I_PRICE: number;
      MACHINE_NO: number | null;
      HUNG_BILL: number | null;
      AUD_U_ID: number | null;
      U_A_NAME: string | null;
      AUDITED_AT: string | null;
    };
    const rows = await this.oracle.query<Row>(
      `SELECT * FROM (
         SELECT a.BILL_NO                                    AS BILL_NO,
                TO_CHAR(a.BILL_DATE, 'YYYY-MM-DD')           AS BILL_DAY,
                a.BILL_TIME                                  AS BILL_TIME,
                a.I_CODE                                     AS I_CODE,
                im.I_NAME                                    AS I_NAME,
                a.I_QTY                                      AS I_QTY,
                NVL(a.I_PRICE, 0)                            AS I_PRICE,
                a.MACHINE_NO                                 AS MACHINE_NO,
                a.HUNG_BILL                                  AS HUNG_BILL,
                a.AUD_U_ID                                   AS AUD_U_ID,
                u.U_A_NAME                                   AS U_A_NAME,
                TO_CHAR(a.AUD_DATE, 'YYYY-MM-DD HH24:MI:SS') AS AUDITED_AT
         FROM ${this.schema}.IAS_POS_AUD_ITEM a
         LEFT JOIN ${this.masterSchema}.IAS_ITM_MST im ON im.I_CODE = a.I_CODE
         LEFT JOIN ${this.masterSchema}.USER_R u ON u.U_ID = a.AUD_U_ID
         WHERE ${where.join(' AND ')}
         ORDER BY a.AUD_DATE DESC
       ) WHERE ROWNUM <= :lim`,
      binds as BindParameters,
    );
    return rows.map((r) => {
      const qty = Number(r.I_QTY ?? 0);
      const price = Number(r.I_PRICE ?? 0);
      return {
        billNo: Number(r.BILL_NO),
        billDay: r.BILL_DAY ?? null,
        billTime: r.BILL_TIME ?? null,
        iCode: r.I_CODE,
        iName: r.I_NAME,
        qty,
        price,
        amount: qty * price,
        machineNo: r.MACHINE_NO == null ? null : Number(r.MACHINE_NO),
        fromHungBill: Number(r.HUNG_BILL ?? 0) === 1,
        auditUserId: r.AUD_U_ID == null ? null : Number(r.AUD_U_ID),
        auditUserName: r.U_A_NAME ?? null,
        auditedAt: r.AUDITED_AT ?? null,
      };
    });
  }

  async vatDetailed(filter: DateRangeFilter): Promise<VatDetailedRow[]> {
    // Effective VAT rate: the line's VAT_PER when recorded, else the item
    // master's VAT_PER, else 0. Grouped by rate x item category (ITEM_TYPES).
    const { where, binds } = this.range(filter, 'm');
    type Row = {
      VAT_RATE: number;
      CATEGORY_NO: number | null;
      CATEGORY_NAME: string | null;
      LINE_COUNT: number;
      TOTAL_QTY: number;
      GROSS_AMT: number;
      VAT_AMT: number;
    };
    const rows = await this.oracle.query<Row>(
      `SELECT NVL(d.VAT_PER, NVL(im.VAT_PER, 0))     AS VAT_RATE,
              im.ITEM_TYPE                           AS CATEGORY_NO,
              MAX(it.IT_A_NAME)                      AS CATEGORY_NAME,
              COUNT(*)                               AS LINE_COUNT,
              SUM(d.I_QTY)                           AS TOTAL_QTY,
              SUM(d.I_QTY * NVL(d.I_PRICE, 0))       AS GROSS_AMT,
              SUM(NVL(d.VAT_AMT, 0))                 AS VAT_AMT
       FROM ${this.schema}.IAS_POS_BILL_DTL d
       JOIN ${this.schema}.IAS_POS_BILL_MST m ON m.BILL_NO = d.BILL_NO
       LEFT JOIN ${this.masterSchema}.IAS_ITM_MST im ON im.I_CODE = d.I_CODE
       LEFT JOIN ${this.masterSchema}.ITEM_TYPES it
              ON it.TYPE_OF_ITEM = im.ITEM_TYPE
       WHERE ${where.join(' AND ')}
       GROUP BY NVL(d.VAT_PER, NVL(im.VAT_PER, 0)), im.ITEM_TYPE
       ORDER BY NVL(d.VAT_PER, NVL(im.VAT_PER, 0)) DESC,
                SUM(d.I_QTY * NVL(d.I_PRICE, 0)) DESC`,
      binds as BindParameters,
    );
    return rows.map((r) => ({
      vatRate: Number(r.VAT_RATE ?? 0),
      categoryNo: r.CATEGORY_NO == null ? null : Number(r.CATEGORY_NO),
      categoryName: r.CATEGORY_NAME,
      lineCount: Number(r.LINE_COUNT),
      totalQty: Number(r.TOTAL_QTY ?? 0),
      grossAmt: Number(r.GROSS_AMT ?? 0),
      vatAmt: Number(r.VAT_AMT ?? 0),
    }));
  }

  /** POSR015 — sales orders read from YSPOS23.SALES_ORDER (read-only). */
  async salesOrders(
    filter: DateRangeFilter & { processed?: boolean; limit: number },
  ): Promise<SalesOrderRow[]> {
    const where: string[] = ['NVL(o.INACTIVE, 0) = 0'];
    const binds: Record<string, unknown> = { lim: filter.limit };
    if (filter.from) {
      where.push(`o.ORDER_DATE >= TO_DATE(:fromD, 'YYYY-MM-DD')`);
      binds.fromD = filter.from;
    }
    if (filter.to) {
      where.push(`o.ORDER_DATE < TO_DATE(:toD, 'YYYY-MM-DD') + 1`);
      binds.toD = filter.to;
    }
    if (filter.processed != null) {
      where.push('NVL(o.PROCESED, 0) = :processed');
      binds.processed = filter.processed ? 1 : 0;
    }
    type Row = {
      ORDER_NO: number;
      ORDER_SER: number | null;
      SO_TYPE: number;
      ORDER_DAY: string | null;
      ORDER_TIME: string | null;
      CUST_CODE: string | null;
      C_NAME: string | null;
      ORDER_CUR: string | null;
      ORDER_AMT: number | null;
      VAT_AMT: number | null;
      PROCESED: number | null;
      MACHINE_NO: number | null;
    };
    const rows = await this.oracle.query<Row>(
      `SELECT * FROM (
         SELECT o.ORDER_NO                              AS ORDER_NO,
                o.ORDER_SER                             AS ORDER_SER,
                o.SO_TYPE                               AS SO_TYPE,
                TO_CHAR(o.ORDER_DATE, 'YYYY-MM-DD')     AS ORDER_DAY,
                o.ORDER_TIME                            AS ORDER_TIME,
                NVL(o.CUST_CODE, o.C_CODE)              AS CUST_CODE,
                o.C_NAME                                AS C_NAME,
                o.ORDER_CUR                             AS ORDER_CUR,
                o.ORDER_AMT                             AS ORDER_AMT,
                o.VAT_AMT                               AS VAT_AMT,
                o.PROCESED                              AS PROCESED,
                o.MACHINE_NO                            AS MACHINE_NO
         FROM ${this.schema}.SALES_ORDER o
         WHERE ${where.join(' AND ')}
         ORDER BY o.ORDER_DATE DESC, o.ORDER_NO DESC
       ) WHERE ROWNUM <= :lim`,
      binds as BindParameters,
    );
    return rows.map((r) => ({
      orderNo: Number(r.ORDER_NO),
      orderSer: r.ORDER_SER == null ? null : Number(r.ORDER_SER),
      soType: Number(r.SO_TYPE),
      orderDay: r.ORDER_DAY ?? null,
      orderTime: r.ORDER_TIME ?? null,
      custCode: r.CUST_CODE ?? null,
      customerName: r.C_NAME ?? null,
      currency: r.ORDER_CUR ?? null,
      orderAmt: Number(r.ORDER_AMT ?? 0),
      vatAmt: Number(r.VAT_AMT ?? 0),
      processed: Number(r.PROCESED ?? 0) === 1,
      machineNo: r.MACHINE_NO == null ? null : Number(r.MACHINE_NO),
    }));
  }

  /**
   * POSR012 — sales grouped by cash-customer group. Bills resolve their
   * customer through CUST_CODE (falling back to C_CODE) into
   * IAS_CASH_CUSTMR -> IAS_CASH_CUSTMR_GRP (master schema). Bills without a
   * matched customer/group collapse into a NULL bucket (عملاء بلا مجموعة /
   * walk-in) so the totals always reconcile with the daily report.
   */
  async customerGroups(
    filter: DateRangeFilter,
  ): Promise<CustomerGroupReportRow[]> {
    const { where, binds } = this.range(filter, 'm');
    type Row = {
      GRP_CODE: string | null;
      GRP_NAME: string | null;
      CUSTOMER_COUNT: number;
      BILL_COUNT: number;
      TOTAL_AMT: number;
      TOTAL_VAT: number;
      TOTAL_DISC: number;
    };
    const rows = await this.oracle.query<Row>(
      `SELECT TO_CHAR(g.CUST_GRP_CODE)                    AS GRP_CODE,
              MAX(NVL(g.CUST_GRP_L_NM, g.CUST_GRP_F_NM)) AS GRP_NAME,
              COUNT(DISTINCT NVL(m.CUST_CODE, m.C_CODE)) AS CUSTOMER_COUNT,
              COUNT(*)                                   AS BILL_COUNT,
              SUM(m.BILL_AMT)                            AS TOTAL_AMT,
              SUM(NVL(m.VAT_AMT, 0))                     AS TOTAL_VAT,
              SUM(NVL(m.DISC_AMT, 0))                    AS TOTAL_DISC
       FROM ${this.schema}.IAS_POS_BILL_MST m
       LEFT JOIN ${this.masterSchema}.IAS_CASH_CUSTMR c
              ON TO_CHAR(c.CUST_CODE) = NVL(m.CUST_CODE, m.C_CODE)
       LEFT JOIN ${this.masterSchema}.IAS_CASH_CUSTMR_GRP g
              ON g.CUST_GRP_CODE = c.CUST_GRP_CODE
       WHERE ${where.join(' AND ')}
       GROUP BY g.CUST_GRP_CODE
       ORDER BY SUM(m.BILL_AMT) DESC`,
      binds as BindParameters,
    );
    return rows.map((r) => ({
      groupCode: r.GRP_CODE,
      groupName: r.GRP_NAME,
      customerCount: Number(r.CUSTOMER_COUNT ?? 0),
      billCount: Number(r.BILL_COUNT),
      totalAmt: Number(r.TOTAL_AMT ?? 0),
      totalVat: Number(r.TOTAL_VAT ?? 0),
      totalDisc: Number(r.TOTAL_DISC ?? 0),
    }));
  }
}
