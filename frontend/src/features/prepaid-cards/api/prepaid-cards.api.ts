import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getData } from '@/shared/lib/api-client';
import type { ApiEnvelope } from '@/shared/lib/types';

/**
 * Prepaid cards / coupons API (POSI007 + POSI200) — proof-verified against
 * the live backend (:3000, 2026-07-04). MOTECH_POS authoritative (V019):
 *   GET  /prepaid-cards?customer=&type=&active=&limit=
 *   GET  /prepaid-cards/{cardNo}                → detail + live balance
 *   GET  /prepaid-cards/{cardNo}/movements      → running-balance ledger
 *   POST /prepaid-cards                         → issue (supervisor/admin)
 *   POST /prepaid-cards/{cardNo}/topup          → supervisor/admin
 *   POST /prepaid-cards/{cardNo}/redeem         → any role (payment action)
 *   PUT  /prepaid-cards/{cardNo}/status         → enable/disable
 * Redeem is row-locked server-side and can never overdraw (422 RFC 9457).
 */

export type PrepaidCardType = 'CARD' | 'COUPON';
export type PrepaidMoveType = 'ISSUE' | 'TOPUP' | 'REDEEM' | 'ADJUST';

export interface PrepaidCard {
  id: string;
  cardNo: string;
  cardType: PrepaidCardType;
  currency: string;
  amount: number;
  remaining: number;
  customerCode: string | null;
  description: string | null;
  expireDate: string | null;
  inactive: boolean;
  createdBy: string;
  createdAt: string;
}

export interface PrepaidMovement {
  id: string;
  cardNo: string;
  moveType: PrepaidMoveType;
  amount: number;
  balance: number;
  ref: string | null;
  note: string | null;
  createdBy: string;
  createdAt: string;
}

export interface PrepaidMovementsView {
  card: PrepaidCard;
  movements: PrepaidMovement[];
}

export interface CreatePrepaidCardDto {
  cardNo: string;
  cardType?: PrepaidCardType;
  currency?: string;
  amount: number;
  customerCode?: string;
  description?: string;
  expireDate?: string;
}

export interface PrepaidFilter {
  customer?: string;
  type?: PrepaidCardType | '';
  activeOnly?: boolean;
}

export function usePrepaidCards(filter: PrepaidFilter) {
  return useQuery({
    queryKey: ['prepaid-cards', filter],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('limit', '300');
      if (filter.customer?.trim()) params.set('customer', filter.customer.trim());
      if (filter.type) params.set('type', filter.type);
      if (filter.activeOnly) params.set('active', 'true');
      return getData<PrepaidCard[]>(`/prepaid-cards?${params.toString()}`);
    },
    staleTime: 15_000,
  });
}

export function usePrepaidMovements(cardNo: string | null) {
  return useQuery({
    queryKey: ['prepaid-cards', cardNo, 'movements'],
    enabled: !!cardNo,
    queryFn: () =>
      getData<PrepaidMovementsView>(
        `/prepaid-cards/${encodeURIComponent(cardNo!)}/movements`,
      ),
    staleTime: 10_000,
  });
}

export function useCreatePrepaidCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreatePrepaidCardDto): Promise<PrepaidCard> => {
      const res = await api.post<ApiEnvelope<PrepaidCard>>('/prepaid-cards', dto);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prepaid-cards'] }),
  });
}

export function useTopupPrepaidCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      cardNo: string;
      amount: number;
      note?: string;
    }): Promise<PrepaidCard> => {
      const res = await api.post<ApiEnvelope<PrepaidCard>>(
        `/prepaid-cards/${encodeURIComponent(vars.cardNo)}/topup`,
        { amount: vars.amount, note: vars.note || undefined },
      );
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prepaid-cards'] }),
  });
}

export function useRedeemPrepaidCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      cardNo: string;
      amount: number;
      ref?: string;
      note?: string;
    }): Promise<PrepaidCard> => {
      const res = await api.post<ApiEnvelope<PrepaidCard>>(
        `/prepaid-cards/${encodeURIComponent(vars.cardNo)}/redeem`,
        { amount: vars.amount, ref: vars.ref || undefined, note: vars.note || undefined },
      );
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prepaid-cards'] }),
  });
}

export function useSetPrepaidCardStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { cardNo: string; inactive: boolean }): Promise<PrepaidCard> => {
      const res = await api.put<ApiEnvelope<PrepaidCard>>(
        `/prepaid-cards/${encodeURIComponent(vars.cardNo)}/status`,
        { inactive: vars.inactive },
      );
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prepaid-cards'] }),
  });
}
