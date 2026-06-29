import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getEnvelope, getData } from '@/shared/lib/api-client';
import type { BillSummary, BillDetail } from '@/shared/lib/types';

const PAGE = 30;

export interface BillFilters {
  from?: string; // yyyy-mm-dd
  to?: string;
  machineNo?: string;
}

/** GET /bills?from&to&machineNo&cursor&limit — newest first, cursor paginated. */
export function useBills(filters: BillFilters) {
  return useInfiniteQuery({
    queryKey: ['bills', filters],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set('limit', String(PAGE));
      if (filters.from) params.set('from', filters.from);
      if (filters.to) params.set('to', filters.to);
      if (filters.machineNo) params.set('machineNo', filters.machineNo);
      if (pageParam) params.set('cursor', pageParam);
      return getEnvelope<BillSummary[]>(`/bills?${params.toString()}`);
    },
    getNextPageParam: (last) => last.meta?.nextCursor ?? undefined,
  });
}

/** GET /bills/{billNo} — header + lines + recomputed totals. */
export function useBillDetail(billNo: string | null) {
  return useQuery({
    queryKey: ['bill', billNo],
    enabled: !!billNo,
    queryFn: () => getData<BillDetail>(`/bills/${encodeURIComponent(billNo!)}`),
  });
}
