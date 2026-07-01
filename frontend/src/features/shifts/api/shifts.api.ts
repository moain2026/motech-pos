import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getData, ApiError } from '@/shared/lib/api-client';
import type {
  ApiEnvelope,
  Shift,
  OpenShiftDto,
  CloseShiftDto,
} from '@/shared/lib/types';

/**
 * Shift API — proof-verified against live :3100 (2026-06-29).
 *
 *   GET  /shifts/current?cashierNo=  → open shift, or 409 no-open-shift
 *   POST /shifts/open                → opens a shift (selling precondition)
 *   POST /shifts/{id}/close          → closes it (expected cash + difference)
 *
 * NOTE: the backend keys shifts by POS `cashierNo` (e.g. 12), which is a
 * distinct concept from the auth user id. The POS settings store supplies it.
 */

export interface CurrentShiftResult {
  shift: Shift | null;
  noShift: boolean;
}

export function useCurrentShift(cashierNo: number | undefined) {
  return useQuery({
    queryKey: ['shift', 'current', cashierNo],
    enabled: cashierNo != null,
    retry: false,
    queryFn: async (): Promise<CurrentShiftResult> => {
      try {
        const shift = await getData<Shift>(`/shifts/current?cashierNo=${cashierNo}`);
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

/** POST /shifts/open — opens a work shift. Invalidates current-shift cache. */
export function useOpenShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: OpenShiftDto): Promise<Shift> => {
      const res = await api.post<ApiEnvelope<Shift>>('/shifts/open', dto);
      return res.data.data;
    },
    onSuccess: (shift) => {
      qc.invalidateQueries({ queryKey: ['shift', 'current', shift.cashierNo] });
    },
  });
}

/** POST /shifts/{id}/close — closes the shift; returns expected/difference. */
export function useCloseShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; dto?: CloseShiftDto }): Promise<Shift> => {
      const res = await api.post<ApiEnvelope<Shift>>(
        `/shifts/${encodeURIComponent(vars.id)}/close`,
        vars.dto ?? {},
      );
      return res.data.data;
    },
    onSuccess: (shift) => {
      qc.invalidateQueries({ queryKey: ['shift', 'current', shift.cashierNo] });
    },
  });
}
