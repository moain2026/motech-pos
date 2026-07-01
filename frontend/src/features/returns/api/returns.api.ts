import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getData, getEnvelope } from '@/shared/lib/api-client';
import { newIdempotencyKey } from '@/shared/lib/idempotency';
import type {
  ApiEnvelope,
  ReturnSummary,
  ReturnDetail,
  PostReturnDto,
  PostedReturn,
} from '@/shared/lib/types';

const PAGE = 30;

/**
 * Returns API — proof-verified against live backend (:3000, 2026-07-01):
 *   GET  /returns?cursor&limit  → ReturnSummary[] (newest first)
 *   GET  /returns/{id}          → ReturnDetail
 *   POST /returns               → PostedReturn (Idempotency-Key MANDATORY;
 *                                  requires open shift + a valid original bill)
 */
export function useReturns() {
  return useInfiniteQuery({
    queryKey: ['returns'],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set('limit', String(PAGE));
      if (pageParam) params.set('cursor', pageParam);
      return getEnvelope<ReturnSummary[]>(`/returns?${params.toString()}`);
    },
    getNextPageParam: (last) => last.meta?.nextCursor ?? undefined,
  });
}

export function useReturnDetail(id: string | null) {
  return useQuery({
    queryKey: ['return', id],
    enabled: !!id,
    queryFn: () => getData<ReturnDetail>(`/returns/${encodeURIComponent(id!)}`),
  });
}

/**
 * POST /returns — create a return bill. Idempotency-Key (uuid) is mandatory;
 * replays return the same document. Invalidates the returns list on success.
 */
export function useCreateReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: PostReturnDto): Promise<PostedReturn> => {
      const res = await api.post<ApiEnvelope<PostedReturn>>('/returns', dto, {
        headers: { 'Idempotency-Key': newIdempotencyKey() },
      });
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['returns'] });
    },
  });
}
