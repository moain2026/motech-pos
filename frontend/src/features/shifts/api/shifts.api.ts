import { useQuery } from '@tanstack/react-query';
import { getData, ApiError } from '@/shared/lib/api-client';
import type { CurrentShift } from '@/shared/lib/types';

/**
 * GET /shifts/current?cashierNo= — the open shift for a cashier.
 * Returns 409 no-open-shift when none (current dataset). We surface that as a
 * distinguishable "no shift" state rather than a hard error.
 */
export function useCurrentShift(cashierNo: number | undefined) {
  return useQuery({
    queryKey: ['shift', 'current', cashierNo],
    enabled: cashierNo != null,
    retry: false,
    queryFn: async (): Promise<{ shift: CurrentShift | null; noShift: boolean }> => {
      try {
        const shift = await getData<CurrentShift>(`/shifts/current?cashierNo=${cashierNo}`);
        return { shift, noShift: false };
      } catch (e) {
        if (e instanceof ApiError && e.status === 409) {
          return { shift: null, noShift: true };
        }
        throw e;
      }
    },
  });
}
