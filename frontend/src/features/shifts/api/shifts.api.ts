import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getData, ApiError } from '@/shared/lib/api-client';
import { newIdempotencyKey } from '@/shared/lib/idempotency';
import type {
  ApiEnvelope,
  Shift,
  OpenShiftDto,
  CloseShiftDto,
  ShiftReconciliation,
  ShiftCountDto,
  SettleShiftDto,
  ShiftSettlement,
  CustodyMovement,
  CustodyTotals,
  RecordCustodyDto,
  ShiftVariance,
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

/**
 * GET /shifts/{id}/reconciliation — cashier reconciliation / Z-X report:
 * expected vs actual cash, over/short, and a per-payment-method breakdown.
 * `actualCash` (counted drawer cash) and `cashExpenses` are optional query
 * inputs for a live X-report over/short. Proof-verified against live :3000.
 */
export function useShiftReconciliation(
  shiftId: string | null,
  opts?: { actualCash?: number; cashExpenses?: number; enabled?: boolean },
) {
  const { actualCash, cashExpenses, enabled = true } = opts ?? {};
  return useQuery({
    queryKey: ['shift', 'reconciliation', shiftId, actualCash ?? null, cashExpenses ?? null],
    enabled: !!shiftId && enabled,
    queryFn: () => {
      const params = new URLSearchParams();
      if (actualCash != null && Number.isFinite(actualCash)) {
        params.set('actualCash', String(actualCash));
      }
      if (cashExpenses != null && Number.isFinite(cashExpenses)) {
        params.set('cashExpenses', String(cashExpenses));
      }
      const qs = params.toString();
      return getData<ShiftReconciliation>(
        `/shifts/${encodeURIComponent(shiftId!)}/reconciliation${qs ? `?${qs}` : ''}`,
      );
    },
  });
}

/**
 * POST /shifts/{id}/count — save the counted cash by denominations (POST013).
 * The sum of value×count is the actual cash; replaces a previous count for
 * the same currency. Rejected with 409 once the shift is SETTLED.
 */
export function useShiftCount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; dto: ShiftCountDto }): Promise<ShiftSettlement> => {
      const res = await api.post<ApiEnvelope<ShiftSettlement>>(
        `/shifts/${encodeURIComponent(vars.id)}/count`,
        vars.dto,
      );
      return res.data.data;
    },
    onSuccess: (_s, vars) => {
      qc.invalidateQueries({ queryKey: ['shift', 'settlement', vars.id] });
      qc.invalidateQueries({ queryKey: ['shift', 'reconciliation', vars.id] });
    },
  });
}

/**
 * POST /shifts/{id}/settle — approve the settlement (supervisor/admin):
 * expected vs counted denominations → over/short, status SETTLED
 * (irreversible). 409 when not closed / no count / already settled.
 */
export function useSettleShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; dto?: SettleShiftDto }): Promise<ShiftSettlement> => {
      const res = await api.post<ApiEnvelope<ShiftSettlement>>(
        `/shifts/${encodeURIComponent(vars.id)}/settle`,
        vars.dto ?? {},
      );
      return res.data.data;
    },
    onSuccess: (_s, vars) => {
      qc.invalidateQueries({ queryKey: ['shift', 'settlement', vars.id] });
      qc.invalidateQueries({ queryKey: ['shift', 'variance', vars.id] });
      qc.invalidateQueries({ queryKey: ['shift'] });
    },
  });
}

/**
 * GET /shifts/{id}/settlement — final settlement view: expected, counted by
 * denominations, difference, status (frozen once SETTLED; live before).
 */
export function useShiftSettlement(shiftId: string | null, enabled = true) {
  return useQuery({
    queryKey: ['shift', 'settlement', shiftId],
    enabled: !!shiftId && enabled,
    queryFn: () =>
      getData<ShiftSettlement>(`/shifts/${encodeURIComponent(shiftId!)}/settlement`),
  });
}

/**
 * GET /shifts/{id}/custody — list cash custody movements (عهدة) + net totals.
 * POST014. Returns the envelope so meta.totals is available.
 */
export function useShiftCustody(shiftId: string | null, enabled = true) {
  return useQuery({
    queryKey: ['shift', 'custody', shiftId],
    enabled: !!shiftId && enabled,
    queryFn: async (): Promise<{ movements: CustodyMovement[]; totals: CustodyTotals }> => {
      const res = await api.get<ApiEnvelope<CustodyMovement[]>>(
        `/shifts/${encodeURIComponent(shiftId!)}/custody`,
      );
      const meta = res.data.meta as { totals?: CustodyTotals } | undefined;
      return {
        movements: res.data.data,
        totals: meta?.totals ?? {
          deposits: 0, withdrawals: 0, net: 0, depositCount: 0, withdrawCount: 0,
        },
      };
    },
  });
}

/**
 * POST /shifts/{id}/custody — record a custody movement (deposit/withdraw).
 * Idempotency-Key mandatory (open shift required, withdraw guarded).
 */
export function useRecordCustody() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; dto: RecordCustodyDto }): Promise<CustodyMovement> => {
      const res = await api.post<ApiEnvelope<CustodyMovement>>(
        `/shifts/${encodeURIComponent(vars.id)}/custody`,
        vars.dto,
        { headers: { 'Idempotency-Key': newIdempotencyKey() } },
      );
      return res.data.data;
    },
    onSuccess: (_m, vars) => {
      qc.invalidateQueries({ queryKey: ['shift', 'custody', vars.id] });
      qc.invalidateQueries({ queryKey: ['shift', 'reconciliation', vars.id] });
      qc.invalidateQueries({ queryKey: ['shift', 'settlement', vars.id] });
    },
  });
}

/**
 * GET /shifts/{id}/variance — the posted over/short variance for a settled
 * shift, or null (POST015).
 */
export function useShiftVariance(shiftId: string | null, enabled = true) {
  return useQuery({
    queryKey: ['shift', 'variance', shiftId],
    enabled: !!shiftId && enabled,
    queryFn: () =>
      getData<ShiftVariance | null>(
        `/shifts/${encodeURIComponent(shiftId!)}/variance`,
      ),
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
