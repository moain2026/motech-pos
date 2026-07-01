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

/**
 * PosReportsRepository — aggregate reads over the MOTECH_POS write schema
 * (OUR bills/payments/returns). These are the reports about sales we actually
 * recorded (distinct from the YSPOS23 historical reports).
 */
export interface PosReportsRepository {
  byCashier(filter: PosReportFilter): Promise<CashierReportRow[]>;
  paymentMethods(filter: PosReportFilter): Promise<PaymentMethodReportRow[]>;
  returns(filter: PosReportFilter): Promise<ReturnsReportRow[]>;
}
