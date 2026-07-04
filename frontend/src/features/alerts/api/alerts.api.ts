import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getData } from '@/shared/lib/api-client';
import type { ApiEnvelope, CreateAlertDto, PosAlert, UpdateAlertDto } from '@/shared/lib/types';

/**
 * POS alerts API (POS_ALRT_SCR تنبيهات الدخول) — proof-verified live :3000
 * (2026-07-04):
 *   GET  /alerts/pending    → alerts the CURRENT user has not acknowledged
 *   POST /alerts/{id}/ack   → idempotent per-user acknowledge
 *   GET  /alerts            → all alerts (supervisor/admin)
 *   POST /alerts            → create (supervisor/admin)
 *   PUT  /alerts/{id}       → update/deactivate (supervisor/admin)
 */
export function usePendingAlerts(enabled: boolean) {
  return useQuery({
    queryKey: ['alerts', 'pending'],
    enabled,
    queryFn: () => getData<PosAlert[]>('/alerts/pending?limit=20'),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useAckAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.post(`/alerts/${encodeURIComponent(id)}/ack`, {});
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts', 'pending'] }),
  });
}

export function useAllAlerts() {
  return useQuery({
    queryKey: ['alerts', 'all'],
    queryFn: () => getData<PosAlert[]>('/alerts?limit=100'),
  });
}

export function useCreateAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateAlertDto): Promise<PosAlert> => {
      const res = await api.post<ApiEnvelope<PosAlert>>('/alerts', dto);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  });
}

export function useUpdateAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; dto: UpdateAlertDto }): Promise<PosAlert> => {
      const res = await api.put<ApiEnvelope<PosAlert>>(
        `/alerts/${encodeURIComponent(vars.id)}`,
        vars.dto,
      );
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  });
}
