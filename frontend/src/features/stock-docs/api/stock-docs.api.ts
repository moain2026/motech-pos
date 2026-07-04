import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getData } from '@/shared/lib/api-client';
import { newIdempotencyKey } from '@/shared/lib/idempotency';
import type {
  ApiEnvelope,
  CreateStockIssueDto,
  CreateStockReceiptDto,
  StockDocStatus,
  StockIssueDetail,
  StockIssueHeader,
  StockReceiptDetail,
  StockReceiptHeader,
} from '@/shared/lib/types';

/**
 * Stock documents API — proof-verified live :3000 (2026-07-04):
 *
 * POST029 الاستلام المخزني (/stock-receipts):
 *   POST /stock-receipts            → DRAFT document
 *   GET  /stock-receipts?status=&warehouse=
 *   GET  /stock-receipts/{id}
 *   POST /stock-receipts/{id}/post  → supervisor/admin + Idempotency-Key;
 *                                     REALLY increases stock (DOC_TYPE=8 +1)
 *   POST /stock-receipts/{id}/cancel
 *
 * POST028 التحويل الصادر (/stock-issues): same shape; posting REALLY decreases
 * stock (DOC_TYPE=7 −1) behind the availability guard.
 */

/* ---------------- receipts ---------------- */

export function useStockReceipts(filters: { status?: StockDocStatus; warehouse?: number }) {
  const { status, warehouse } = filters;
  return useQuery({
    queryKey: ['stock-receipts', { status, warehouse }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (warehouse) params.set('warehouse', String(warehouse));
      params.set('limit', '100');
      return getData<StockReceiptHeader[]>(`/stock-receipts?${params.toString()}`);
    },
  });
}

export function useStockReceipt(id: string | null) {
  return useQuery({
    queryKey: ['stock-receipts', 'detail', id],
    enabled: !!id,
    queryFn: () => getData<StockReceiptDetail>(`/stock-receipts/${encodeURIComponent(id!)}`),
  });
}

export function useCreateStockReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateStockReceiptDto): Promise<StockReceiptDetail> => {
      const res = await api.post<ApiEnvelope<StockReceiptDetail>>('/stock-receipts', dto);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stock-receipts'] }),
  });
}

/** POST /stock-receipts/{id}/post — approval writes the REAL stock increase. */
export function usePostStockReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<StockReceiptDetail> => {
      const res = await api.post<ApiEnvelope<StockReceiptDetail>>(
        `/stock-receipts/${encodeURIComponent(id)}/post`,
        {},
        { headers: { 'Idempotency-Key': newIdempotencyKey() } },
      );
      return res.data.data;
    },
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: ['stock-receipts'] });
      qc.invalidateQueries({ queryKey: ['stock-receipts', 'detail', id] });
    },
  });
}

export function useCancelStockReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<StockReceiptDetail> => {
      const res = await api.post<ApiEnvelope<StockReceiptDetail>>(
        `/stock-receipts/${encodeURIComponent(id)}/cancel`,
        {},
      );
      return res.data.data;
    },
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: ['stock-receipts'] });
      qc.invalidateQueries({ queryKey: ['stock-receipts', 'detail', id] });
    },
  });
}

/* ---------------- issues (dispatch) ---------------- */

export function useStockIssues(filters: { status?: StockDocStatus; warehouse?: number }) {
  const { status, warehouse } = filters;
  return useQuery({
    queryKey: ['stock-issues', { status, warehouse }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (warehouse) params.set('warehouse', String(warehouse));
      params.set('limit', '100');
      return getData<StockIssueHeader[]>(`/stock-issues?${params.toString()}`);
    },
  });
}

export function useStockIssue(id: string | null) {
  return useQuery({
    queryKey: ['stock-issues', 'detail', id],
    enabled: !!id,
    queryFn: () => getData<StockIssueDetail>(`/stock-issues/${encodeURIComponent(id!)}`),
  });
}

export function useCreateStockIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateStockIssueDto): Promise<StockIssueDetail> => {
      const res = await api.post<ApiEnvelope<StockIssueDetail>>('/stock-issues', dto);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stock-issues'] }),
  });
}

/** POST /stock-issues/{id}/post — availability-guarded REAL stock decrease. */
export function usePostStockIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<StockIssueDetail> => {
      const res = await api.post<ApiEnvelope<StockIssueDetail>>(
        `/stock-issues/${encodeURIComponent(id)}/post`,
        {},
        { headers: { 'Idempotency-Key': newIdempotencyKey() } },
      );
      return res.data.data;
    },
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: ['stock-issues'] });
      qc.invalidateQueries({ queryKey: ['stock-issues', 'detail', id] });
    },
  });
}

export function useCancelStockIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<StockIssueDetail> => {
      const res = await api.post<ApiEnvelope<StockIssueDetail>>(
        `/stock-issues/${encodeURIComponent(id)}/cancel`,
        {},
      );
      return res.data.data;
    },
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: ['stock-issues'] });
      qc.invalidateQueries({ queryKey: ['stock-issues', 'detail', id] });
    },
  });
}
