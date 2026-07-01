import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getData } from '@/shared/lib/api-client';
import type { ApiEnvelope, Settings, UpdateSettingsDto } from '@/shared/lib/types';

/**
 * Settings API — proof-verified against live :3000 (2026-07-01).
 *
 *   GET  /settings           → resolved effective settings (system + overrides)
 *   PUT  /settings           → apply local overrides ({ overrides: [{key,value}] })
 *
 * Reads are cashier-visible; writes are admin-only (RBAC enforced on the route).
 */
export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => getData<Settings>('/settings'),
    staleTime: 30_000,
  });
}

/** PUT /settings — persist local overrides (admin). Invalidates the cache. */
export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: UpdateSettingsDto): Promise<Settings> => {
      const res = await api.put<ApiEnvelope<Settings>>('/settings', dto);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
}
