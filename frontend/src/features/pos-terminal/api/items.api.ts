import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getEnvelope } from '@/shared/lib/api-client';
import type { Item, ItemDetail } from '@/shared/lib/types';

const PAGE = 40;

/**
 * GET /items?search=&cursor=&limit= — infinite (cursor-based) item search.
 * Server returns { data: Item[], meta: { count, nextCursor } }.
 */
export function useItemSearch(search: string) {
  return useInfiniteQuery({
    queryKey: ['items', { search }],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set('limit', String(PAGE));
      if (search.trim()) params.set('search', search.trim());
      if (pageParam) params.set('cursor', pageParam);
      return getEnvelope<Item[]>(`/items?${params.toString()}`);
    },
    getNextPageParam: (last) => last.meta?.nextCursor ?? undefined,
    staleTime: 60_000,
  });
}

/** GET /items/{code} — detail with stock. */
export function useItemDetail(code: string | null) {
  return useQuery({
    queryKey: ['item', code],
    enabled: !!code,
    queryFn: () => getEnvelope<ItemDetail>(`/items/${encodeURIComponent(code!)}`).then((e) => e.data),
    staleTime: 30_000,
  });
}
