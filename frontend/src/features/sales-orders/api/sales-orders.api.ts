import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getData } from '@/shared/lib/api-client';
import { newIdempotencyKey } from '@/shared/lib/idempotency';
import type {
  ApiEnvelope,
  CreateSalesOrderDto,
  SalesOrderDetail,
  SalesOrderHeader,
  SalesOrderStatus,
} from '@/shared/lib/types';

/**
 * Sales-orders API (POST024 طلبات العملاء) — proof-verified live :3000 (2026-07-04):
 *   GET  /sales-orders?status=&customer=  → SalesOrderHeader[]
 *   GET  /sales-orders/{id}               → SalesOrderDetail (+lines)
 *   POST /sales-orders                    → created detail (server snapshots name/price)
 *   POST /sales-orders/{id}/convert       → REAL bill (Idempotency-Key MANDATORY,
 *                                           open-shift guard, server-side pricing)
 *   POST /sales-orders/{id}/cancel        → cancels an OPEN order
 */
export function useSalesOrders(filters: { status?: SalesOrderStatus; customer?: string }) {
  const { status, customer } = filters;
  return useQuery({
    queryKey: ['sales-orders', { status, customer }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (customer) params.set('customer', customer);
      params.set('limit', '100');
      return getData<SalesOrderHeader[]>(`/sales-orders?${params.toString()}`);
    },
  });
}

export function useSalesOrder(id: string | null) {
  return useQuery({
    queryKey: ['sales-orders', 'detail', id],
    enabled: !!id,
    queryFn: () => getData<SalesOrderDetail>(`/sales-orders/${encodeURIComponent(id!)}`),
  });
}

export function useCreateSalesOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateSalesOrderDto): Promise<SalesOrderDetail> => {
      const res = await api.post<ApiEnvelope<SalesOrderDetail>>('/sales-orders', dto);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sales-orders'] }),
  });
}

/** POST /sales-orders/{id}/convert — تنزيل الطلب في فاتورة (idempotent). */
export function useConvertSalesOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      id: string;
      cashierNo: number;
      machineNo?: number;
    }): Promise<SalesOrderDetail> => {
      const res = await api.post<ApiEnvelope<SalesOrderDetail>>(
        `/sales-orders/${encodeURIComponent(vars.id)}/convert`,
        { cashierNo: vars.cashierNo, machineNo: vars.machineNo },
        { headers: { 'Idempotency-Key': newIdempotencyKey() } },
      );
      return res.data.data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['sales-orders'] });
      qc.invalidateQueries({ queryKey: ['sales-orders', 'detail', vars.id] });
    },
  });
}

export function useCancelSalesOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<SalesOrderDetail> => {
      const res = await api.post<ApiEnvelope<SalesOrderDetail>>(
        `/sales-orders/${encodeURIComponent(id)}/cancel`,
        {},
      );
      return res.data.data;
    },
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: ['sales-orders'] });
      qc.invalidateQueries({ queryKey: ['sales-orders', 'detail', id] });
    },
  });
}
