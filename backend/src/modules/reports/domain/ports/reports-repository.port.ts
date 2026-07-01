/** DI token for the read-only ReportsRepository port (YSPOS23 + IAS202623). */
export const REPORTS_REPOSITORY = Symbol('REPORTS_REPOSITORY');

/** One row of the daily sales aggregation. */
export interface DailyReportRow {
  day: string; // YYYY-MM-DD
  billCount: number;
  totalAmt: number;
  totalVat: number;
  totalDisc: number;
}

/** One row of the monthly sales aggregation. */
export interface MonthlyReportRow {
  month: string; // YYYY-MM
  billCount: number;
  totalAmt: number;
  totalVat: number;
  totalDisc: number;
}

/** One row of the best-selling-items aggregation (name from IAS202623). */
export interface ItemReportRow {
  iCode: string;
  iName: string | null;
  totalQty: number;
  totalAmt: number;
  lineCount: number;
}

/** One row of the per-cashier-machine aggregation. */
export interface MachineReportRow {
  machineNo: number | null;
  billCount: number;
  totalAmt: number;
  totalVat: number;
  totalDisc: number;
}

export interface DateRangeFilter {
  from?: string; // ISO date YYYY-MM-DD
  to?: string;
}

/**
 * ReportsRepository — aggregate reads over the LIVE YSPOS23 POS tables,
 * joined with the IAS202623 item master for Arabic names. STRICTLY read-only
 * (served by the MOTECH_RO connection). No INSERT/UPDATE/DELETE.
 */
export interface ReportsRepository {
  /** Daily sales aggregation (COUNT bills, SUM amt/vat/disc) by day. */
  daily(filter: DateRangeFilter): Promise<DailyReportRow[]>;

  /** Monthly sales aggregation by calendar month. */
  monthly(filter: DateRangeFilter): Promise<MonthlyReportRow[]>;

  /** Best-selling items (SUM qty desc), name resolved from IAS202623. */
  byItem(filter: DateRangeFilter & { limit: number }): Promise<ItemReportRow[]>;

  /** Sales per cashier machine (MACHINE_NO). */
  byMachine(filter: DateRangeFilter): Promise<MachineReportRow[]>;
}
