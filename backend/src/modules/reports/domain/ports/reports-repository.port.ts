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

/** One row of the slow-moving-items report (low/zero sales in a period). */
export interface SlowMovingRow {
  iCode: string;
  iName: string | null;
  totalQty: number; // qty sold in period (0 = never sold)
  totalAmt: number;
  lineCount: number;
  lastSoldDay: string | null; // YYYY-MM-DD of last sale in period
}

/** One row of the profit report (revenue vs PRIMARY_COST from item master). */
export interface ProfitReportRow {
  iCode: string;
  iName: string | null;
  totalQty: number;
  revenue: number; // SUM(qty * I_PRICE)
  cost: number; // SUM(qty * PRIMARY_COST)
  profit: number; // revenue - cost
  marginPct: number; // profit / revenue * 100 (0 when revenue = 0)
  costAvailable: boolean; // false when PRIMARY_COST is 0/null for the item
}

/** Aggregate slice for one side of the comparison report. */
export interface ComparisonPeriod {
  from: string;
  to: string;
  billCount: number;
  totalAmt: number;
  totalVat: number;
  totalDisc: number;
  avgBill: number; // totalAmt / billCount (0 when no bills)
}

/** Two-period sales comparison (period A vs period B) with deltas. */
export interface ComparisonReport {
  periodA: ComparisonPeriod;
  periodB: ComparisonPeriod;
  deltaAmt: number; // A - B
  deltaAmtPct: number; // (A - B) / B * 100 (0 when B = 0)
  deltaBills: number;
  deltaBillsPct: number;
}

/** One movement line of a single item (sale or return). */
export interface ItemMovementRow {
  moveType: 'SALE' | 'RETURN';
  billNo: number;
  day: string; // YYYY-MM-DD
  time: string | null; // HH24:MI:SS
  qty: number; // negative for returns
  price: number;
  amount: number; // qty * price (negative for returns)
  machineNo: number | null;
}

/** Item-movement report: item identity + its chronological movements. */
export interface ItemMovementReport {
  iCode: string;
  iName: string | null;
  totalSoldQty: number;
  totalReturnedQty: number;
  netQty: number;
  netAmt: number;
  movements: ItemMovementRow[];
}

/** One row of the deleted-lines audit report (IAS_POS_AUD_ITEM). */
export interface AuditReportRow {
  billNo: number;
  billDay: string | null; // YYYY-MM-DD of the bill
  billTime: string | null;
  iCode: string;
  iName: string | null;
  qty: number;
  price: number;
  amount: number;
  machineNo: number | null;
  fromHungBill: boolean; // line deleted off a hung (suspended) bill
  auditUserId: number | null;
  auditUserName: string | null; // Arabic name from USER_R
  auditedAt: string | null; // YYYY-MM-DD HH24:MI:SS
}

/** One row of the detailed VAT report (rate x category). */
export interface VatDetailedRow {
  vatRate: number; // effective VAT % (line VAT_PER, else item master VAT_PER)
  categoryNo: number | null;
  categoryName: string | null;
  lineCount: number;
  totalQty: number;
  grossAmt: number; // SUM(qty * price)
  vatAmt: number; // SUM(line VAT_AMT)
}

/**
 * ReportsRepository — aggregate reads over the LIVE YSPOS23 POS tables,
 * joined with the IAS202623 item master for Arabic names. STRICTLY read-only
 * (served by the MOTECH_RO connection). No INSERT/UPDATE/DELETE.
 */
/** POSR012 — sales grouped by customer group (IAS_CASH_CUSTMR_GRP). */
export interface CustomerGroupReportRow {
  groupCode: string | null;
  groupName: string | null;
  customerCount: number;
  billCount: number;
  totalAmt: number;
  totalVat: number;
  totalDisc: number;
}

/** POSR015 — one sales order (SALES_ORDER header, read-only). */
export interface SalesOrderRow {
  orderNo: number;
  orderSer: number | null;
  soType: number;
  orderDay: string | null;
  orderTime: string | null;
  custCode: string | null;
  customerName: string | null;
  currency: string | null;
  orderAmt: number;
  vatAmt: number;
  processed: boolean;
  machineNo: number | null;
}

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
  salesByCategory(
    filter: DateRangeFilter & { machineNo?: number },
  ): Promise<CategoryReportRow[]>;

  /** Z-report: full close summary + payment breakdown for a range/machine. */
  zReport(
    filter: DateRangeFilter & { machineNo?: number },
  ): Promise<ZReportSummary>;

  /** Slow-moving items: least/zero-sold items in the period (qty asc). */
  slowMoving(
    filter: DateRangeFilter & { limit: number; maxQty: number },
  ): Promise<SlowMovingRow[]>;

  /** Profit per item: revenue vs PRIMARY_COST (item master), profit desc. */
  profitReport(
    filter: DateRangeFilter & { limit: number },
  ): Promise<ProfitReportRow[]>;

  /** Two-period sales comparison (A vs B) with absolute + % deltas. */
  comparison(periods: {
    fromA: string;
    toA: string;
    fromB: string;
    toB: string;
  }): Promise<ComparisonReport>;

  /** Full movement history of one item (sales + returns) in a period. */
  itemMovement(
    filter: DateRangeFilter & { iCode: string; limit: number },
  ): Promise<ItemMovementReport>;

  /** Deleted-lines audit trail (IAS_POS_AUD_ITEM), newest first. */
  auditReport(
    filter: DateRangeFilter & { limit: number },
  ): Promise<AuditReportRow[]>;

  /** Detailed VAT report grouped by effective VAT rate x item category. */
  vatDetailed(filter: DateRangeFilter): Promise<VatDetailedRow[]>;

  /** POSR015 — sales orders (YSPOS23.SALES_ORDER, read-only). */
  salesOrders(
    filter: DateRangeFilter & { processed?: boolean; limit: number },
  ): Promise<SalesOrderRow[]>;

  /** POSR012 — sales grouped by customer group (cash-customer groups). */
  customerGroups(filter: DateRangeFilter): Promise<CustomerGroupReportRow[]>;
}
