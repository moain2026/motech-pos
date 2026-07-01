import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { api, getEnvelope, getData } from '@/shared/lib/api-client';
import type {
  ApiEnvelope,
  BillSummary,
  BillDetail,
  PostBillDto,
  PostedBill,
  AddPaymentDto,
} from '@/shared/lib/types';

/** uuid v4 for the mandatory Idempotency-Key header (crypto.randomUUID). */
function newIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback (non-secure contexts) — RFC4122-ish.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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

/**
 * POST /bills — create a sale bill. The Idempotency-Key header is MANDATORY
 * (uuid); replays return the same bill (no duplicate). Requires an open shift
 * for the given cashierNo. Returns the full posted bill.
 */
export function useCreateBill() {
  return useMutation({
    mutationFn: async (dto: PostBillDto): Promise<PostedBill> => {
      const res = await api.post<ApiEnvelope<PostedBill>>('/bills', dto, {
        headers: { 'Idempotency-Key': newIdempotencyKey() },
      });
      return res.data.data;
    },
  });
}

/** POST /bills/{id}/payments — add a payment to a posted bill. */
export function usePayBill() {
  return useMutation({
    mutationFn: async (vars: { id: string; dto: AddPaymentDto }): Promise<PostedBill> => {
      const res = await api.post<ApiEnvelope<PostedBill>>(
        `/bills/${encodeURIComponent(vars.id)}/payments`,
        vars.dto,
      );
      return res.data.data;
    },
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
