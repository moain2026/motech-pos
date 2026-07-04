import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getData } from '@/shared/lib/api-client';
import { newIdempotencyKey } from '@/shared/lib/idempotency';
import type {
  ApiEnvelope,
  ReturnCountDetail,
  ReturnCountHeader,
  ReturnCountLine,
  ReturnCountStatus,
} from '@/shared/lib/types';

/**
 * Return-counts API (POST022 جرد أصناف مردود المبيعات) — proof-verified live
 * :3000 (2026-07-04):
 *   POST /return-counts             → open a DRAFT session (machine + date)
 *   GET  /return-counts?status=&machine=
 *   GET  /return-counts/{id}        → header + lines (system vs counted)
 *   POST /return-counts/{id}/lines  → record one counted item (server pulls
 *                                     systemQty from the REAL return bills)
 *   POST /return-counts/{id}/post   → supervisor/admin + Idempotency-Key;
 *                                     freezes variances (immutable)
 */
export function useReturnCounts(filters: { status?: ReturnCountStatus; machine?: number }) {
  const { status, machine } = filters;
  return useQuery({
    queryKey: ['return-counts', { status, machine }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (machine) params.set('machine', String(machine));
      params.set('limit', '100');
      return getData<ReturnCountHeader[]>(`/return-counts?${params.toString()}`);
    },
  });
}

export function useReturnCount(id: string | null) {
  return useQuery({
    queryKey: ['return-counts', 'detail', id],
    enabled: !!id,
    queryFn: () => getData<ReturnCountDetail>(`/return-counts/${encodeURIComponent(id!)}`),
  });
}

export function useStartReturnCount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: {
      machineNo: number;
      countDate: string;
      refNo?: string;
      note?: string;
    }): Promise<ReturnCountDetail> => {
      const res = await api.post<ApiEnvelope<ReturnCountDetail>>('/return-counts', dto);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['return-counts'] }),
  });
}

/** POST /return-counts/{id}/lines — record one physically counted item. */
export function useRecordReturnCountLine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      id: string;
      itemCode: string;
      countedQty: number;
    }): Promise<ReturnCountLine> => {
      const res = await api.post<ApiEnvelope<ReturnCountLine>>(
        `/return-counts/${encodeURIComponent(vars.id)}/lines`,
        { itemCode: vars.itemCode, countedQty: vars.countedQty },
      );
      return res.data.data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['return-counts', 'detail', vars.id] });
    },
  });
}

/** POST /return-counts/{id}/post — approve (supervisor/admin, idempotent). */
export function usePostReturnCount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<ReturnCountDetail> => {
      const res = await api.post<ApiEnvelope<ReturnCountDetail>>(
        `/return-counts/${encodeURIComponent(id)}/post`,
        {},
        { headers: { 'Idempotency-Key': newIdempotencyKey() } },
      );
      return res.data.data;
    },
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: ['return-counts'] });
      qc.invalidateQueries({ queryKey: ['return-counts', 'detail', id] });
    },
  });
}
