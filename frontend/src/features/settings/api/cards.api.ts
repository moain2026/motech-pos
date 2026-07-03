import { useQuery } from '@tanstack/react-query';
import { getData } from '@/shared/lib/api-client';
import type { PaymentCard } from '@/shared/lib/types';

/**
 * Cards API — proof-verified against live backend (:3000, 2026-07-01):
 *   GET /cards → PaymentCard[] (CREDIT_CARD_TYPES: name, commission, bank).
 */
export function useCards() {
  return useQuery({
    queryKey: ['cards'],
    queryFn: () => getData<PaymentCard[]>('/cards'),
    staleTime: 5 * 60_000,
  });
}
