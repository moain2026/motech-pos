import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getData, getEnvelope } from '@/shared/lib/api-client';
import type { InventoryItem, InventoryDetail } from '@/shared/lib/types';

const PAGE = 40;

/**
 * Inventory API — proof-verified against live backend (:3000, 2026-07-01):
 *   GET /inventory?search=&cursor=&limit=  → InventoryItem[] (Arabic names)
 *   GET /inventory/low-stock?limit=        → InventoryItem[] (qty asc)
 *   GET /inventory/{code}                  → InventoryDetail (per-warehouse)
 */
export function useInventory(search: string) {
  return useInfiniteQuery({
    queryKey: ['inventory', { search }],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set('limit', String(PAGE));
      if (search.trim()) params.set('search', search.trim());
      if (pageParam) params.set('cursor', pageParam);
      return getEnvelope<InventoryItem[]>(`/inventory?${params.toString()}`);
    },
    getNextPageParam: (last) => last.meta?.nextCursor ?? undefined,
    staleTime: 30_000,
  });
}

/** GET /inventory/low-stock — items at/below the low-stock threshold. */
export function useLowStock(limit = 50) {
  return useQuery({
    queryKey: ['inventory', 'low-stock', { limit }],
    queryFn: () => getEnvelope<InventoryItem[]>(`/inventory/low-stock?limit=${limit}`),
    staleTime: 30_000,
  });
}

/** GET /inventory/{code} — per-warehouse / per-batch stock breakdown. */
export function useInventoryDetail(code: string | null) {
  return useQuery({
    queryKey: ['inventory', 'detail', code],
    enabled: !!code,
    queryFn: () => getData<InventoryDetail>(`/inventory/${encodeURIComponent(code!)}`),
  });
}
