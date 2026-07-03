import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getData } from '@/shared/lib/api-client';
import type {
  ApiEnvelope,
  SyncStatus,
  SyncQueueEntry,
  SyncRunResult,
  SyncEntryStatus,
} from '@/shared/lib/types';

/**
 * Sync API — proof-verified against live backend (:3000, 2026-07-01):
 *   GET  /sync/status          → { pending, synced, failed, total }
 *   GET  /sync/queue?status=   → SyncQueueEntry[]
 *   POST /sync/run             → { processed, synced, blocked, counts }
 * Run is admin/supervisor (RBAC on route + client).
 */
export function useSyncStatus() {
  return useQuery({
    queryKey: ['sync', 'status'],
    queryFn: () => getData<SyncStatus>('/sync/status'),
    staleTime: 10_000,
  });
}

export function useSyncQueue(status?: SyncEntryStatus, limit = 50) {
  return useQuery({
    queryKey: ['sync', 'queue', { status, limit }],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('limit', String(limit));
      if (status) params.set('status', status);
      return getData<SyncQueueEntry[]>(`/sync/queue?${params.toString()}`);
    },
    staleTime: 10_000,
  });
}

/** POST /sync/run — process the pending sync queue. */
export function useRunSync() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<SyncRunResult> => {
      const res = await api.post<ApiEnvelope<SyncRunResult>>('/sync/run', {});
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sync'] });
    },
  });
}
