import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api-client';
import type {
  ApiEnvelope,
  ApplyPromotionLineDto,
  PromotionResult,
} from '@/shared/lib/types';

/**
 * POST /promotions/apply — evaluate the active POS promotions (POST001,
 * GNR_QTN_PRM_PKG) against the current cart. Returns the discounts + free
 * items to display/apply. Keyed on the cart shape so it re-evaluates whenever
 * quantities/prices change (debounce is unnecessary — the cart mutates on
 * discrete add/remove events).
 */
export function usePromotions(lines: ApplyPromotionLineDto[]) {
  // Stable key from the priced lines (code:qty:price).
  const key = lines
    .map((l) => `${l.itemCode}:${l.qty}:${l.unitPrice}`)
    .sort()
    .join('|');
  return useQuery({
    queryKey: ['promotions', 'apply', key],
    enabled: lines.length > 0,
    queryFn: async (): Promise<PromotionResult> => {
      const res = await api.post<ApiEnvelope<PromotionResult>>(
        '/promotions/apply',
        { lines },
      );
      return res.data.data;
    },
    staleTime: 15_000,
    placeholderData: (prev) => prev,
  });
}
