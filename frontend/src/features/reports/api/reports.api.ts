import { useQuery } from '@tanstack/react-query';
import { getData } from '@/shared/lib/api-client';
import type {
  DailySummaryRow,
  MonthlySummaryRow,
  ByItemRow,
  ByMachineRow,
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

/** Legacy daily summary (kept for backward compat / bills/summary/daily). */
export function useDailySummary(from?: string, to?: string) {
  return useQuery({
    queryKey: ['report', 'daily-legacy', { from, to }],
    queryFn: () => getData<DailySummaryRow[]>(`/bills/summary/daily${rangeParams(from, to)}`),
  });
}
