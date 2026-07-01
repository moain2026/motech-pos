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

/** One row of the VAT/tax report grouped by day (net base + VAT collected). */
export interface TaxReportRow {
  day: string; // YYYY-MM-DD
  billCount: number;
  totalVat: number; // VAT_AMT collected
  totalDisc: number; // discounts granted
  totalAmt: number; // gross bill amount (VAT-inclusive)
  netBeforeVat: number; // taxable base = totalAmt - totalVat
}

/** One row of the hourly-sales distribution (00..23). */
export interface HourlyReportRow {
  hour: string; // '00'..'23'
  billCount: number;
  totalAmt: number;
  totalVat: number;
  totalDisc: number;
}

/** One row of the top-customers aggregation (by C_CODE / CUST_CODE). */
export interface CustomerReportRow {
  cCode: string | null;
  cName: string | null;
  custCode: string | null;
  billCount: number;
  totalAmt: number;
  totalVat: number;
  totalDisc: number;
}

/** One row of the discount report grouped by day. */
export interface DiscountReportRow {
  day: string; // YYYY-MM-DD
  billCount: number;
  totalDisc: number; // header discount (DISC_AMT)
  totalAmt: number; // gross amount
  discPct: number; // totalDisc / totalAmt * 100
}

/** One row of the sales-by-category aggregation (ITEM_TYPES). */
export interface CategoryReportRow {
  categoryNo: number | null;
  categoryName: string | null;
  lineCount: number;
  totalQty: number;
  totalAmt: number;
}

/** Z-report — full end-of-shift/day close over the LIVE YSPOS23 bills. */
export interface ZReportSummary {
  from: string | null;
  to: string | null;
  machineNo: number | null;
  billCount: number;
  grossAmt: number; // SUM(BILL_AMT)
  totalVat: number;
  totalDisc: number;
  netBeforeVat: number; // grossAmt - totalVat
  returnAmt: number; // SUM(RET_AMT) on the bills
  firstBillTime: string | null; // HH24:MI:SS
  lastBillTime: string | null;
  byPayment: ZPaymentSlice[];
}

/** Payment slice inside the Z-report (cash vs credit-card breakdown). */
export interface ZPaymentSlice {
  method: string; // 'CASH' | 'CARD'
  billCount: number;
  amount: number;
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

  /** VAT/tax report by day (taxable base + VAT collected). */
  taxReport(filter: DateRangeFilter): Promise<TaxReportRow[]>;

  /** Hourly sales distribution parsed from BILL_TIME (00..23). */
  hourlySales(filter: DateRangeFilter): Promise<HourlyReportRow[]>;

  /** Top customers by total sales (name from bill header). */
  topCustomers(
    filter: DateRangeFilter & { limit: number },
  ): Promise<CustomerReportRow[]>;

  /** Discount report by day (header discount vs gross). */
  discountReport(filter: DateRangeFilter): Promise<DiscountReportRow[]>;

  /** Sales grouped by item category (ITEM_TYPES). */
  salesByCategory(filter: DateRangeFilter): Promise<CategoryReportRow[]>;

  /** Z-report: full close summary + payment breakdown for a range/machine. */
  zReport(
    filter: DateRangeFilter & { machineNo?: number },
  ): Promise<ZReportSummary>;
}
