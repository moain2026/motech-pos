import { useQuery } from '@tanstack/react-query';
import { api, getData } from '@/shared/lib/api-client';
import type {
  DailySummaryRow,
  MonthlySummaryRow,
  ByItemRow,
  ByMachineRow,
  ByCashierRow,
  PaymentMethodRow,
  ReturnsReportRow,
  TaxReportRow,
  HourlySalesRow,
  ZReport,
  TopCustomerRow,
  DiscountReportRow,
  SalesByCategoryRow,
  SlowMovingRow,
  ProfitReportRow,
  ComparisonReport,
  ItemMovementReport,
  AuditReportRow,
  VatDetailedRow,
  ByShiftRow,
  ShiftHistoryRow,
  CustomerStatementReport,
  ReceivableRow,
  VoucherSummaryReport,
  LoyaltyReport,
  SalesOrderRow,
  CustomerGroupReportRow,
} from '@/shared/lib/types';

function rangeParams(from?: string, to?: string): string {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Reports API — proof-verified against live backend (:3000, 2026-07-01):
 *   GET /reports/daily       → DailySummaryRow[]  (per day)
 *   GET /reports/monthly     → MonthlySummaryRow[] (per YYYY-MM)
 *   GET /reports/by-item     → ByItemRow[]  (best sellers, Arabic names)
 *   GET /reports/by-machine  → ByMachineRow[] (per POS machine)
 *
 * NOTE: the legacy /bills/summary/daily also returns DailySummaryRow[]; the
 * dedicated /reports/daily is preferred and used here.
 */
export function useDailyReport(from?: string, to?: string) {
  return useQuery({
    queryKey: ['report', 'daily', { from, to }],
    queryFn: () => getData<DailySummaryRow[]>(`/reports/daily${rangeParams(from, to)}`),
  });
}

export function useMonthlyReport(from?: string, to?: string) {
  return useQuery({
    queryKey: ['report', 'monthly', { from, to }],
    queryFn: () => getData<MonthlySummaryRow[]>(`/reports/monthly${rangeParams(from, to)}`),
  });
}

export function useByItemReport(from?: string, to?: string) {
  return useQuery({
    queryKey: ['report', 'by-item', { from, to }],
    queryFn: () => getData<ByItemRow[]>(`/reports/by-item${rangeParams(from, to)}`),
  });
}

export function useByMachineReport(from?: string, to?: string) {
  return useQuery({
    queryKey: ['report', 'by-machine', { from, to }],
    queryFn: () => getData<ByMachineRow[]>(`/reports/by-machine${rangeParams(from, to)}`),
  });
}

/** GET /reports/by-cashier — sales & collections per cashier. */
export function useByCashierReport(from?: string, to?: string) {
  return useQuery({
    queryKey: ['report', 'by-cashier', { from, to }],
    queryFn: () => getData<ByCashierRow[]>(`/reports/by-cashier${rangeParams(from, to)}`),
  });
}

/** GET /reports/payment-methods — tender totals per method/currency. */
export function usePaymentMethodsReport(from?: string, to?: string) {
  return useQuery({
    queryKey: ['report', 'payment-methods', { from, to }],
    queryFn: () =>
      getData<PaymentMethodRow[]>(`/reports/payment-methods${rangeParams(from, to)}`),
  });
}

/** GET /reports/returns — returns summary per day. */
export function useReturnsReport(from?: string, to?: string) {
  return useQuery({
    queryKey: ['report', 'returns', { from, to }],
    queryFn: () => getData<ReturnsReportRow[]>(`/reports/returns${rangeParams(from, to)}`),
  });
}

// ---------------------------------------------------------------------------
// Wave 5 — additional reports (proof-verified live :3000, 2026-07-01)
// ---------------------------------------------------------------------------

/** GET /reports/tax — VAT/tax report by day (taxable base + VAT collected). */
export function useTaxReport(from?: string, to?: string) {
  return useQuery({
    queryKey: ['report', 'tax', { from, to }],
    queryFn: () => getData<TaxReportRow[]>(`/reports/tax${rangeParams(from, to)}`),
  });
}

/** GET /reports/hourly-sales — sales distribution across the 24 hours. */
export function useHourlySalesReport(from?: string, to?: string) {
  return useQuery({
    queryKey: ['report', 'hourly-sales', { from, to }],
    queryFn: () => getData<HourlySalesRow[]>(`/reports/hourly-sales${rangeParams(from, to)}`),
  });
}

/** GET /reports/z-report — single end-of-day close summary object. */
export function useZReport(from?: string, to?: string) {
  return useQuery({
    queryKey: ['report', 'z-report', { from, to }],
    queryFn: () => getData<ZReport>(`/reports/z-report${rangeParams(from, to)}`),
  });
}

/** GET /reports/top-customers — top customers by total sales. */
export function useTopCustomersReport(from?: string, to?: string) {
  return useQuery({
    queryKey: ['report', 'top-customers', { from, to }],
    queryFn: () => getData<TopCustomerRow[]>(`/reports/top-customers${rangeParams(from, to)}`),
  });
}

/** GET /reports/discount — header discount vs gross, per day. */
export function useDiscountReport(from?: string, to?: string) {
  return useQuery({
    queryKey: ['report', 'discount', { from, to }],
    queryFn: () => getData<DiscountReportRow[]>(`/reports/discount${rangeParams(from, to)}`),
  });
}

/** GET /reports/sales-by-category — sales grouped by item category. */
export function useSalesByCategoryReport(from?: string, to?: string) {
  return useQuery({
    queryKey: ['report', 'sales-by-category', { from, to }],
    queryFn: () =>
      getData<SalesByCategoryRow[]>(`/reports/sales-by-category${rangeParams(from, to)}`),
  });
}

// ---------------------------------------------------------------------------
// Fable-5 wave — historical / advanced reports (proof-verified :3000,
// 2026-07-03): slow-moving · profit · comparison · item-movement · audit ·
// vat-detailed.
// ---------------------------------------------------------------------------

/** GET /reports/slow-moving — least/zero-sold items in the period. */
export function useSlowMovingReport(from?: string, to?: string, limit = 50, maxQty = 5) {
  return useQuery({
    queryKey: ['report', 'slow-moving', { from, to, limit, maxQty }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      params.set('limit', String(limit));
      params.set('maxQty', String(maxQty));
      return getData<SlowMovingRow[]>(`/reports/slow-moving?${params.toString()}`);
    },
  });
}

/** GET /reports/profit — revenue vs PRIMARY_COST per item + margin %. */
export function useProfitReport(from?: string, to?: string, limit = 50) {
  return useQuery({
    queryKey: ['report', 'profit', { from, to, limit }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      params.set('limit', String(limit));
      return getData<ProfitReportRow[]>(`/reports/profit?${params.toString()}`);
    },
  });
}

/**
 * GET /reports/comparison — two-period sales comparison (A vs B) with
 * absolute + % deltas. All four dates are required by the backend, so the
 * query stays disabled until they are all provided.
 */
export function useComparisonReport(periods: {
  fromA?: string;
  toA?: string;
  fromB?: string;
  toB?: string;
}) {
  const { fromA, toA, fromB, toB } = periods;
  const ready = !!(fromA && toA && fromB && toB);
  return useQuery({
    queryKey: ['report', 'comparison', { fromA, toA, fromB, toB }],
    enabled: ready,
    queryFn: () =>
      getData<ComparisonReport>(
        `/reports/comparison?fromA=${fromA}&toA=${toA}&fromB=${fromB}&toB=${toB}`,
      ),
  });
}

/**
 * GET /reports/item-movement — full movement history (sales + returns) of
 * ONE item in a period. `item` (I_CODE) is required → disabled until set.
 */
export function useItemMovementReport(item: string, from?: string, to?: string, limit = 200) {
  const code = item.trim();
  return useQuery({
    queryKey: ['report', 'item-movement', { item: code, from, to, limit }],
    enabled: code.length > 0,
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('item', code);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      params.set('limit', String(limit));
      return getData<ItemMovementReport>(`/reports/item-movement?${params.toString()}`);
    },
  });
}

/** GET /reports/audit — deleted-lines audit trail (IAS_POS_AUD_ITEM). */
export function useAuditReport(from?: string, to?: string, limit = 100) {
  return useQuery({
    queryKey: ['report', 'audit', { from, to, limit }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      params.set('limit', String(limit));
      return getData<AuditReportRow[]>(`/reports/audit?${params.toString()}`);
    },
  });
}

/** GET /reports/vat-detailed — VAT grouped by effective rate × category. */
export function useVatDetailedReport(from?: string, to?: string) {
  return useQuery({
    queryKey: ['report', 'vat-detailed', { from, to }],
    queryFn: () => getData<VatDetailedRow[]>(`/reports/vat-detailed${rangeParams(from, to)}`),
  });
}

// ---------------------------------------------------------------------------
// Wave F/G — POSR reports (proof-verified live :3000, 2026-07-04):
// by-shift · shifts-history · customer-statement · receivables ·
// vouchers-summary · loyalty · sales-orders · customer-groups + CSV export.
// ---------------------------------------------------------------------------

/** GET /reports/by-shift (POSR004) — per-shift sales + over/short. */
export function useByShiftReport(from?: string, to?: string) {
  return useQuery({
    queryKey: ['report', 'by-shift', { from, to }],
    queryFn: () => getData<ByShiftRow[]>(`/reports/by-shift${rangeParams(from, to)}`),
  });
}

/** GET /reports/shifts-history (POSR014) — reconciliation figures. */
export function useShiftsHistoryReport(from?: string, to?: string) {
  return useQuery({
    queryKey: ['report', 'shifts-history', { from, to }],
    queryFn: () => getData<ShiftHistoryRow[]>(`/reports/shifts-history${rangeParams(from, to)}`),
  });
}

/**
 * GET /reports/customer-statement (POSR002) — full statement of ONE cash
 * customer. `customer` is required by the backend → disabled until set.
 */
export function useCustomerStatementReport(customer: string, from?: string, to?: string) {
  const code = customer.trim();
  return useQuery({
    queryKey: ['report', 'customer-statement', { customer: code, from, to }],
    enabled: code.length > 0,
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('customer', code);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      return getData<CustomerStatementReport>(`/reports/customer-statement?${params.toString()}`);
    },
  });
}

/** GET /reports/receivables (POSR008) — credit receivables per customer. */
export function useReceivablesReport() {
  return useQuery({
    queryKey: ['report', 'receivables'],
    queryFn: () => getData<ReceivableRow[]>('/reports/receivables'),
  });
}

/** GET /reports/vouchers-summary (POSR009/016) — rows + totals. */
export function useVouchersSummaryReport(from?: string, to?: string) {
  return useQuery({
    queryKey: ['report', 'vouchers-summary', { from, to }],
    queryFn: () =>
      getData<VoucherSummaryReport>(`/reports/vouchers-summary${rangeParams(from, to)}`),
  });
}

/** GET /reports/loyalty (POSR010) — points by type/customer + totals. */
export function useLoyaltyReport(from?: string, to?: string) {
  return useQuery({
    queryKey: ['report', 'loyalty', { from, to }],
    queryFn: () => getData<LoyaltyReport>(`/reports/loyalty${rangeParams(from, to)}`),
  });
}

/** GET /reports/sales-orders (POSR015) — read-only SALES_ORDER headers. */
export function useSalesOrdersReport(from?: string, to?: string) {
  return useQuery({
    queryKey: ['report', 'sales-orders', { from, to }],
    queryFn: () => getData<SalesOrderRow[]>(`/reports/sales-orders${rangeParams(from, to)}`),
  });
}

/** GET /reports/customer-groups (POSR012) — sales per customer group. */
export function useCustomerGroupsReport(from?: string, to?: string) {
  return useQuery({
    queryKey: ['report', 'customer-groups', { from, to }],
    queryFn: () =>
      getData<CustomerGroupReportRow[]>(`/reports/customer-groups${rangeParams(from, to)}`),
  });
}

/**
 * Flat reports the backend can export as CSV via GET /reports/export
 * (POSR003 substitute) — keep in sync with the backend's valid list.
 */
export const EXPORTABLE_REPORTS = [
  'daily',
  'monthly',
  'by-item',
  'by-machine',
  'tax',
  'hourly-sales',
  'top-customers',
  'discount',
  'sales-by-category',
  'by-cashier',
  'payment-methods',
  'returns',
  'by-shift',
  'shifts-history',
  'receivables',
  'customer-groups',
  'sales-orders',
] as const;

export type ExportableReport = (typeof EXPORTABLE_REPORTS)[number];

/**
 * GET /reports/export?report=… — downloads the CSV through the authed axios
 * client (Bearer token) and triggers a browser download.
 */
export async function downloadReportCsv(
  report: ExportableReport,
  range?: { from?: string; to?: string },
): Promise<void> {
  const params = new URLSearchParams();
  params.set('report', report);
  if (range?.from) params.set('from', range.from);
  if (range?.to) params.set('to', range.to);
  const res = await api.get<Blob>(`/reports/export?${params.toString()}`, {
    responseType: 'blob',
  });
  const url = URL.createObjectURL(
    new Blob([res.data], { type: 'text/csv;charset=utf-8' }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = `${report}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Legacy daily summary (kept for backward compat / bills/summary/daily). */
export function useDailySummary(from?: string, to?: string) {
  return useQuery({
    queryKey: ['report', 'daily-legacy', { from, to }],
    queryFn: () => getData<DailySummaryRow[]>(`/bills/summary/daily${rangeParams(from, to)}`),
  });
}
