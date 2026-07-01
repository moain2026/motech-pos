import { Injectable } from '@nestjs/common';
import type { BindParameters } from 'oracledb';
import { OracleService } from '../../../infrastructure/oracle/oracle.service';
import {
  DailyReportRow,
  DateRangeFilter,
  ItemReportRow,
  MachineReportRow,
  MonthlyReportRow,
  ReportsRepository,
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
}
