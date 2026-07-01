import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api, getEnvelope } from '@/shared/lib/api-client';
import type {
  ApiEnvelope,
  CreateItemDto,
  Item,
  ItemDetail,
  UpdateItemDto,
} from '@/shared/lib/types';

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

/**
 * POST /items — create a LOCAL item (supervisor/admin). Returns ItemDetail
 * with origin=LOCAL. Invalidates the search list.
 */
export function useCreateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateItemDto): Promise<ItemDetail> => {
      const res = await api.post<ApiEnvelope<ItemDetail>>('/items', dto);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['items'] }),
  });
}

/**
 * PUT /items/{code} — patch price/name/etc. On an ERP item this creates a
 * local EDIT override; on a LOCAL item it updates it. Invalidates list + detail.
 */
export function useUpdateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      code,
      dto,
    }: {
      code: string;
      dto: UpdateItemDto;
    }): Promise<ItemDetail> => {
      const res = await api.put<ApiEnvelope<ItemDetail>>(
        `/items/${encodeURIComponent(code)}`,
        dto,
      );
      return res.data.data;
    },
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: ['items'] });
      qc.invalidateQueries({ queryKey: ['item', item.code] });
    },
  });
}
