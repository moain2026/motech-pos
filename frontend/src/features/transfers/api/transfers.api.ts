import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getData } from '@/shared/lib/api-client';
import type {
  ApiEnvelope,
  CreateTransferDto,
  TransferDetail,
  TransferRow,
  WarehouseRow,
} from '@/shared/lib/types';

/**
 * Transfers API (POST019 طلب التحويل) — proof-verified live :3000 (2026-07-04):
 *   GET  /transfers?status=&warehouse=  → TransferRow[]
 *   GET  /transfers/{id}                → TransferDetail (+lines w/ avlQty)
 *   POST /transfers                     → created detail
 *   POST /transfers/{id}/cancel         → cancels an OPEN request
 *   GET  /warehouses                    → WarehouseRow[] (for the pickers)
 */
export function useTransfers(filters: { status?: 'OPEN' | 'CANCELLED'; warehouse?: number }) {
  const { status, warehouse } = filters;
  return useQuery({
    queryKey: ['transfers', { status, warehouse }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (warehouse) params.set('warehouse', String(warehouse));
      params.set('limit', '100');
      return getData<TransferRow[]>(`/transfers?${params.toString()}`);
    },
  });
}

export function useTransfer(id: string | null) {
  return useQuery({
    queryKey: ['transfer', id],
    enabled: !!id,
    queryFn: () => getData<TransferDetail>(`/transfers/${encodeURIComponent(id!)}`),
  });
}

export function useCreateTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateTransferDto): Promise<TransferDetail> => {
      const res = await api.post<ApiEnvelope<TransferDetail>>('/transfers', dto);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transfers'] });
    },
  });
}

export function useCancelTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<TransferDetail> => {
      const res = await api.post<ApiEnvelope<TransferDetail>>(
        `/transfers/${encodeURIComponent(id)}/cancel`,
        {},
      );
      return res.data.data;
    },
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['transfers'] });
      qc.invalidateQueries({ queryKey: ['transfer', id] });
    },
  });
}

/** GET /warehouses — merged ERP + overlay list (for the from/to pickers). */
export function useWarehouses() {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: () => getData<WarehouseRow[]>('/warehouses'),
    staleTime: 5 * 60_000,
  });
}
