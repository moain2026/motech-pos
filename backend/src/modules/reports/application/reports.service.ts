import { Inject, Injectable } from '@nestjs/common';
import {
  PosReportFilter,
  PosReportsRepository,
  POS_REPORTS_REPOSITORY,
} from '../domain/ports/pos-reports-repository.port';
import {
  DateRangeFilter,
  ReportsRepository,
  REPORTS_REPOSITORY,
} from '../domain/ports/reports-repository.port';

/**
 * ReportsService (application layer) — orchestrates the aggregate reads. No SQL
 * here; depends on the ReportsRepository port (Dependency Inversion).
 */
@Injectable()
export class ReportsService {
  constructor(
    @Inject(REPORTS_REPOSITORY) private readonly repo: ReportsRepository,
    @Inject(POS_REPORTS_REPOSITORY)
    private readonly pos: PosReportsRepository,
  ) {}

  daily(filter: DateRangeFilter) {
    return this.repo.daily(filter);
  }

  monthly(filter: DateRangeFilter) {
    return this.repo.monthly(filter);
  }

  byItem(filter: DateRangeFilter & { limit: number }) {
    return this.repo.byItem(filter);
  }

  byMachine(filter: DateRangeFilter) {
    return this.repo.byMachine(filter);
  }

  /** VAT/tax report by day. */
  taxReport(filter: DateRangeFilter) {
    return this.repo.taxReport(filter);
  }

  /** Hourly sales distribution (00..23) from BILL_TIME. */
  hourlySales(filter: DateRangeFilter) {
    return this.repo.hourlySales(filter);
  }

  /** Top customers by total sales. */
  topCustomers(filter: DateRangeFilter & { limit: number }) {
    return this.repo.topCustomers(filter);
  }

  /** Discount report by day. */
  discountReport(filter: DateRangeFilter) {
    return this.repo.discountReport(filter);
  }

  /** Sales grouped by item category (optional machine cut — POSR006). */
  salesByCategory(filter: DateRangeFilter & { machineNo?: number }) {
    return this.repo.salesByCategory(filter);
  }

  /** POSR012 — sales grouped by customer group. */
  customerGroups(filter: DateRangeFilter) {
    return this.repo.customerGroups(filter);
  }

  /** Z-report: full close summary for a range/machine. */
  zReport(filter: DateRangeFilter & { machineNo?: number }) {
    return this.repo.zReport(filter);
  }

  /** Slow-moving items (least/zero sold in the period). */
  slowMoving(filter: DateRangeFilter & { limit: number; maxQty: number }) {
    return this.repo.slowMoving(filter);
  }

  /** Profit per item (revenue vs PRIMARY_COST). */
  profitReport(filter: DateRangeFilter & { limit: number }) {
    return this.repo.profitReport(filter);
  }

  /** Two-period sales comparison with deltas. */
  comparison(periods: {
    fromA: string;
    toA: string;
    fromB: string;
    toB: string;
  }) {
    return this.repo.comparison(periods);
  }

  /** Full movement history of one item (sales + returns). */
  itemMovement(filter: DateRangeFilter & { iCode: string; limit: number }) {
    return this.repo.itemMovement(filter);
  }

  /** Deleted-lines audit trail (IAS_POS_AUD_ITEM). */
  auditReport(filter: DateRangeFilter & { limit: number }) {
    return this.repo.auditReport(filter);
  }

  /** Detailed VAT report (rate x category). */
  vatDetailed(filter: DateRangeFilter) {
    return this.repo.vatDetailed(filter);
  }

  /** POSR015 — sales orders (YSPOS23.SALES_ORDER). */
  salesOrders(
    filter: DateRangeFilter & { processed?: boolean; limit: number },
  ) {
    return this.repo.salesOrders(filter);
  }

  //==========================================================================
  // MOTECH_POS reports (our own recorded sales)
  //==========================================================================

  /** Sales per cashier (POST012). */
  byCashier(filter: PosReportFilter) {
    return this.pos.byCashier(filter);
  }

  /** Payment-method distribution. */
  paymentMethods(filter: PosReportFilter) {
    return this.pos.paymentMethods(filter);
  }

  /** POST012 — payment-method breakdown per cashier. */
  cashierPaymentSummary(filter: PosReportFilter & { cashierNo?: number }) {
    return this.pos.cashierPaymentSummary(filter);
  }

  /** Returns aggregation. */
  returnsReport(filter: PosReportFilter) {
    return this.pos.returns(filter);
  }

  //==========================================================================
  // Wave F — POSR completions
  //==========================================================================

  /** POSR004 — sales aggregated shift-by-shift. */
  byShift(filter: PosReportFilter & { cashierNo?: number }) {
    return this.pos.byShift(filter);
  }

  /** POSR014 — historical shifts + reconciliation deltas. */
  shiftsHistory(filter: PosReportFilter & { status?: string }) {
    return this.pos.shiftsHistory(filter);
  }

  /** POSR002 — full statement of one cash customer. */
  customerStatement(filter: PosReportFilter & { customerCode: string }) {
    return this.pos.customerStatement(filter);
  }

  /** POSR008 — receivables per customer. */
  receivables() {
    return this.pos.receivables();
  }

  /** POSR009/POSR016 — voucher aggregates. */
  vouchersSummary(filter: PosReportFilter) {
    return this.pos.vouchersSummary(filter);
  }

  /** POSR010 — loyalty points for a period. */
  loyaltyReport(filter: PosReportFilter & { customerCode?: string }) {
    return this.pos.loyaltyReport(filter);
  }

  /** POSR011 — returns vs allowed return window. */
  returnsWindow(filter: PosReportFilter) {
    return this.pos.returnsWindow(filter);
  }
}
