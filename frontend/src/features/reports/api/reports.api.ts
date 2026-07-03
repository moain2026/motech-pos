import { useQuery } from '@tanstack/react-query';
import { getData } from '@/shared/lib/api-client';
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

/** Legacy daily summary (kept for backward compat / bills/summary/daily). */
export function useDailySummary(from?: string, to?: string) {
  return useQuery({
    queryKey: ['report', 'daily-legacy', { from, to }],
    queryFn: () => getData<DailySummaryRow[]>(`/bills/summary/daily${rangeParams(from, to)}`),
  });
}
