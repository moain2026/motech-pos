import { Injectable } from '@nestjs/common';
import type { BindParameters } from 'oracledb';
import { OracleService } from '../../../infrastructure/oracle/oracle.service';
import {
  CategoryReportRow,
  CustomerReportRow,
  DailyReportRow,
  DateRangeFilter,
  DiscountReportRow,
  HourlyReportRow,
  ItemReportRow,
  MachineReportRow,
  MonthlyReportRow,
  ReportsRepository,
  TaxReportRow,
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
    filter: DateRangeFilter,
  ): Promise<CategoryReportRow[]> {
    // Filter the range on the MST header; resolve the category through the
    // item master (ITEM_TYPE) -> ITEM_TYPES lookup in the master schema.
    const { where, binds } = this.range(filter, 'm');
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
}
