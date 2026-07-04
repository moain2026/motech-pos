import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getData } from '@/shared/lib/api-client';
import type {
  ApiEnvelope,
  StockCountDetail,
  StockCountHeader,
  StockCountLine,
  StockCountStatus,
} from '@/shared/lib/types';

/** uuid v4 for the mandatory Idempotency-Key header (crypto.randomUUID). */
function newIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Stock-counts API (POST018 جرد) — proof-verified against the live backend
 * (:3000, 2026-07-04):
 *   POST /inventory/counts             → start a DRAFT session for a warehouse
 *   GET  /inventory/counts?status=     → sessions newest first
 *   GET  /inventory/counts/{id}        → header + lines (Arabic names)
 *   POST /inventory/counts/{id}/lines  → upsert one physical count (diff server-side)
 *   POST /inventory/counts/{id}/post   → approve; supervisor/admin + Idempotency-Key
 */
export function useStockCounts(status?: StockCountStatus) {
  return useQuery({
    queryKey: ['stock-counts', { status }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      const qs = params.toString();
      return getData<StockCountHeader[]>(`/inventory/counts${qs ? `?${qs}` : ''}`);
    },
    staleTime: 15_000,
  });
}

export function useStockCount(id: string | null) {
  return useQuery({
    queryKey: ['stock-counts', 'detail', id],
    enabled: !!id,
    queryFn: () => getData<StockCountDetail>(`/inventory/counts/${encodeURIComponent(id!)}`),
  });
}

/** POST /inventory/counts — open a new DRAFT جرد for one warehouse. */
export function useStartCount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: { warehouseCode: number; note?: string }): Promise<StockCountDetail> => {
      const res = await api.post<ApiEnvelope<StockCountDetail>>('/inventory/counts', dto);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stock-counts'] }),
  });
}

/** POST /inventory/counts/{id}/lines — record (or re-record) one item count. */
export function useRecordCountLine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      id: string;
      itemCode: string;
      countedQty: number;
    }): Promise<StockCountLine> => {
      const res = await api.post<ApiEnvelope<StockCountLine>>(
        `/inventory/counts/${encodeURIComponent(vars.id)}/lines`,
        { itemCode: vars.itemCode, countedQty: vars.countedQty },
      );
      return res.data.data;
    },
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: ['stock-counts', 'detail', vars.id] });
      void qc.invalidateQueries({ queryKey: ['stock-counts'] });
    },
  });
}

/** POST /inventory/counts/{id}/post — approve (freeze) the count. */
export function usePostCount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<StockCountDetail> => {
      const res = await api.post<ApiEnvelope<StockCountDetail>>(
        `/inventory/counts/${encodeURIComponent(id)}/post`,
        {},
        { headers: { 'Idempotency-Key': newIdempotencyKey() } },
      );
      return res.data.data;
    },
    onSuccess: (_d, id) => {
      void qc.invalidateQueries({ queryKey: ['stock-counts', 'detail', id] });
      void qc.invalidateQueries({ queryKey: ['stock-counts'] });
    },
  });
}
