import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api, getData, getEnvelope } from '@/shared/lib/api-client';
import type {
  ApiEnvelope,
  CategoryNode,
  CreateItemDto,
  Item,
  ItemDetail,
  ItemPricesView,
  ItemUnitsView,
  UpdateItemDto,
} from '@/shared/lib/types';

const PAGE = 40;

/** Optional server-side filters for GET /items (advanced catalog search). */
export interface ItemSearchFilters {
  /** Main group G_CODE (from GET /categories). */
  category?: string;
  /** Sub group MNG_CODE. */
  subCategory?: string;
}

/**
 * GET /items?search=&category=&cursor=&limit= — infinite (cursor-based) item
 * search. Server returns { data: Item[], meta: { count, nextCursor } }.
 */
export function useItemSearch(search: string, filters?: ItemSearchFilters) {
  const category = filters?.category ?? '';
  const subCategory = filters?.subCategory ?? '';
  return useInfiniteQuery({
    queryKey: ['items', { search, category, subCategory }],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set('limit', String(PAGE));
      if (search.trim()) params.set('search', search.trim());
      if (category) params.set('category', category);
      if (subCategory) params.set('subCategory', subCategory);
      if (pageParam) params.set('cursor', pageParam);
      return getEnvelope<Item[]>(`/items?${params.toString()}`);
    },
    getNextPageParam: (last) => last.meta?.nextCursor ?? undefined,
    staleTime: 60_000,
  });
}

/**
 * GET /categories — category tree (23 main groups × sub-groups, Arabic names
 * + item counts). Used for catalog browsing; pair with ?category= on /items.
 */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => getData<CategoryNode[]>('/categories'),
    staleTime: 5 * 60_000,
  });
}

/**
 * GET /items/{code}/prices — all price levels (IAS_ITEM_PRICE): every
 * LEV_NO × unit combination (retail/wholesale/promo lists).
 */
export function useItemPrices(code: string | null) {
  return useQuery({
    queryKey: ['item', code, 'prices'],
    enabled: !!code,
    queryFn: () => getData<ItemPricesView>(`/items/${encodeURIComponent(code!)}/prices`),
    staleTime: 60_000,
  });
}

/**
 * GET /items/{code}/units — units of measure (IAS_ITM_DTL) with conversion
 * factors (P_SIZE), per-unit barcode and price (حبة/كرتون…).
 */
export function useItemUnits(code: string | null) {
  return useQuery({
    queryKey: ['item', code, 'units'],
    enabled: !!code,
    queryFn: () => getData<ItemUnitsView>(`/items/${encodeURIComponent(code!)}/units`),
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
