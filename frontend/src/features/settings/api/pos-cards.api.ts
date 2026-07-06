import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getData } from '@/shared/lib/api-client';
import type { ApiEnvelope } from '@/shared/lib/types';

/**
 * POS cards API (POSI012) — proof-verified against live backend (:3000).
 * The ERP master (CREDIT_CARD_TYPES) is SACRED read-only; reads merge it with
 * the MOTECH_POS overlay (origin ERP|LOCAL|EDIT). Writes land in the overlay.
 *   GET  /pos-cards
 *   GET  /pos-cards/{cardNo}
 *   POST /pos-cards          (supervisor/admin)
 *   PUT  /pos-cards/{cardNo}  (supervisor/admin)
 */

export interface PosCard {
  cardNo: number;
  arName: string | null;
  enName: string | null;
  cardType: number | null;
  bankNo: number | null;
  commissionPct: number | null;
  commCalcType: number | null;
  duePeriod: number | null;
  bankAc: string | null;
  inactive: boolean;
  origin: 'ERP' | 'LOCAL' | 'EDIT';
}

export interface UpsertPosCard {
  cardNo?: number;
  arName: string;
  enName?: string | null;
  cardType?: number | null;
  bankNo?: number | null;
  commissionPct?: number | null;
  commCalcType?: number | null;
  duePeriod?: number | null;
  bankAc?: string | null;
  inactive?: boolean;
}

const KEY = ['pos-cards'];

export function usePosCards() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => getData<PosCard[]>('/pos-cards'),
    staleTime: 30_000,
  });
}

export function useCreatePosCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: UpsertPosCard): Promise<PosCard> => {
      const res = await api.post<ApiEnvelope<PosCard>>('/pos-cards', dto);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdatePosCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { cardNo: number; dto: UpsertPosCard }): Promise<PosCard> => {
      const res = await api.put<ApiEnvelope<PosCard>>(
        `/pos-cards/${vars.cardNo}`,
        vars.dto,
      );
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
