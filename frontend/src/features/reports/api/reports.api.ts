import { useQuery } from '@tanstack/react-query';
import { getData } from '@/shared/lib/api-client';
import type { DailySummaryRow } from '@/shared/lib/types';

/**
 * GET /bills/summary/daily?from&to — daily sales summary (Z-report basis).
 * Returns DailySummaryRow[] newest-first.
 */
export function useDailySummary(from?: string, to?: string) {
  return useQuery({
    queryKey: ['report', 'daily', { from, to }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const qs = params.toString();
      return getData<DailySummaryRow[]>(`/bills/summary/daily${qs ? `?${qs}` : ''}`);
    },
  });
}
