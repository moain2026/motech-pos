export const POS_REPORTS_REPOSITORY = Symbol('POS_REPORTS_REPOSITORY');

/** Sales per cashier (MOTECH_POS bills + payments). */
export interface CashierReportRow {
  cashierNo: number;
  billCount: number;
  grossAmt: number;
  discountAmt: number;
  vatAmt: number;
  netAmt: number;
  cashCollected: number;
  cardCollected: number;
  creditCollected: number;
}

/** Payment-method distribution (MOTECH_POS payments). */
export interface PaymentMethodReportRow {
  method: string;
  currency: string;
  txnCount: number;
  amount: number; // in tender currency
  amountInBill: number; // converted to bill currency
}

/** Returns aggregation (MOTECH_POS returns). */
export interface ReturnsReportRow {
  day: string; // YYYY-MM-DD
  returnCount: number;
  grossAmt: number;
  vatAmt: number;
  netAmt: number;
  refundAmt: number;
}

export interface PosReportFilter {
  from?: string; // YYYY-MM-DD
  to?: string;
  shiftId?: string;
}

//==============================================================================
// Wave F — POSR completions over MOTECH_POS (+ read-only YSPOS23 joins)
//==============================================================================

/** POSR004 — per-shift sales detail (shift-by-shift, not by-cashier). */
export interface ShiftSalesReportRow {
  shiftId: string;
  shiftNo: number;
  cashierNo: number;
  machineNo: number | null;
  status: string;
  openedAt: string;
  closedAt: string | null;
  billCount: number;
  grossAmt: number;
  discountAmt: number;
  vatAmt: number;
  netAmt: number;
  cashCollected: number;
  cardCollected: number;
  creditCollected: number;
  /** Over/short recorded at close (null while OPEN). */
  cashDifference: number | null;
}

/** POSR014 — historical shifts list with reconciliation figures. */
export interface ShiftHistoryRow {
  shiftId: string;
  shiftNo: number;
  shiftCode: string | null;
  cashierNo: number;
  machineNo: number | null;
  currency: string;
  status: string;
  openedAt: string;
  closedAt: string | null;
  openingBalance: number;
  closingBalance: number | null;
  expectedCash: number | null;
  cashDifference: number | null;
  countedCash: number | null;
  settleDifference: number | null;
  settledAt: string | null;
  cashReceipts: number;
  cashExpenses: number;
}

/** POSR002 — full customer statement (bills/returns/points/collections). */
export interface CustomerStatementBillRow {
  billId: string;
  billNo: string;
  issuedAt: string;
  currency: string;
  grossAmt: number;
  discountAmt: number;
  vatAmt: number;
  netAmt: number;
  paidAmt: number;
}

export interface CustomerStatementReturnRow {
  returnId: string;
  rtBillNo: string;
  originalBillNo: string;
  issuedAt: string;
  netAmt: number;
  refundAmt: number;
}

export interface CustomerStatementPointsRow {
  trnsType: number;
  trnsTypeName: 'EARN' | 'REDEEM' | 'EXPIRE' | 'ADJUST';
  billNo: string | null;
  docAmt: number;
  pointCnt: number;
  pointAmt: number;
  createdAt: string;
}

export interface CustomerStatementCollectionRow {
  collectionId: string;
  billId: string;
  method: string;
  currency: string;
  amountInBill: number;
  createdAt: string;
}

export interface CustomerStatementReport {
  customerCode: string;
  customerName: string | null;
  from: string | null;
  to: string | null;
  bills: CustomerStatementBillRow[];
  returns: CustomerStatementReturnRow[];
  points: CustomerStatementPointsRow[];
  collections: CustomerStatementCollectionRow[];
  totals: {
    billCount: number;
    salesTotal: number;
    returnCount: number;
    returnsTotal: number;
    pointsEarned: number;
    pointsRedeemed: number;
    creditTotal: number;
    collectedTotal: number;
    outstanding: number;
  };
}

/** POSR008 — receivables (ذمم آجلة) per customer, as-of snapshot. */
export interface ReceivableRow {
  customerCode: string;
  customerName: string | null;
  creditBillCount: number;
  creditTotal: number;
  collectedTotal: number;
  outstanding: number;
  lastCreditAt: string | null;
  lastCollectionAt: string | null;
}

/** POSR009 + POSR016 — vouchers aggregated by machine × type × method × currency. */
export interface VoucherSummaryRow {
  machineNo: number | null;
  voucherType: 'RECEIPT' | 'EXPENSE';
  paymentMethod: string;
  currency: string;
  voucherCount: number;
  amount: number;
  amountInShift: number;
}

export interface VoucherSummaryReport {
  rows: VoucherSummaryRow[];
  totals: {
    receiptCount: number;
    receiptsTotal: number;
    expenseCount: number;
    expensesTotal: number;
    netCashEffect: number;
  };
}

/** POSR010 — loyalty points report for a period. */
export interface LoyaltyTypeSlice {
  trnsType: number;
  trnsTypeName: 'EARN' | 'REDEEM' | 'EXPIRE' | 'ADJUST';
  txnCount: number;
  points: number;
  pointAmt: number;
  docAmt: number;
}

export interface LoyaltyCustomerRow {
  customerCode: string;
  customerName: string | null;
  earned: number;
  redeemed: number;
  expired: number;
  adjusted: number;
  net: number;
}

export interface LoyaltyReport {
  from: string | null;
  to: string | null;
  byType: LoyaltyTypeSlice[];
  byCustomer: LoyaltyCustomerRow[];
  totals: { earned: number; redeemed: number; expired: number; net: number };
}

/** POSR011 — returns vs the allowed return window (PRD_BACK_HOUR). */
export interface ReturnWindowRow {
  rtBillNo: string;
  originalBillNo: string;
  customerName: string | null;
  cashierNo: number;
  issuedAt: string;
  originalBillDay: string | null;
  originalBillTime: string | null;
  netAmt: number;
  refundAmt: number;
  /** Hours between the original sale and the return (null if original not found). */
  delayHours: number | null;
  /** true/false vs PRD_BACK_HOUR; null when the window is not configured. */
  withinWindow: boolean | null;
}

export interface ReturnsWindowReport {
  /** PRD_BACK_HOUR from IAS_PARA_POS (null = feature not configured). */
  windowHours: number | null;
  rows: ReturnWindowRow[];
}

/**
 * PosReportsRepository — aggregate reads over the MOTECH_POS write schema
 * (OUR bills/payments/returns). These are the reports about sales we actually
 * recorded (distinct from the YSPOS23 historical reports).
 */
export interface PosReportsRepository {
  byCashier(filter: PosReportFilter): Promise<CashierReportRow[]>;
  paymentMethods(filter: PosReportFilter): Promise<PaymentMethodReportRow[]>;
  returns(filter: PosReportFilter): Promise<ReturnsReportRow[]>;

  /** POSR004 — sales aggregated shift-by-shift. */
  byShift(
    filter: PosReportFilter & { cashierNo?: number },
  ): Promise<ShiftSalesReportRow[]>;

  /** POSR014 — historical shifts + reconciliation deltas. */
  shiftsHistory(
    filter: PosReportFilter & { status?: string },
  ): Promise<ShiftHistoryRow[]>;

  /** POSR002 — full statement of one cash customer. */
  customerStatement(
    filter: PosReportFilter & { customerCode: string },
  ): Promise<CustomerStatementReport>;

  /** POSR008 — receivables per customer (as-of snapshot). */
  receivables(): Promise<ReceivableRow[]>;

  /** POSR009/POSR016 — voucher aggregates (machine × type × method × currency). */
  vouchersSummary(filter: PosReportFilter): Promise<VoucherSummaryReport>;

  /** POSR010 — loyalty points for a period. */
  loyaltyReport(
    filter: PosReportFilter & { customerCode?: string },
  ): Promise<LoyaltyReport>;

  /** POSR011 — returns vs allowed return window. */
  returnsWindow(filter: PosReportFilter): Promise<ReturnsWindowReport>;
}
