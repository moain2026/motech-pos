import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getData } from '@/shared/lib/api-client';
import { newIdempotencyKey } from '@/shared/lib/idempotency';
import type {
  ApiEnvelope,
  Voucher,
  VoucherType,
  CreateVoucherDto,
} from '@/shared/lib/types';

/**
 * Vouchers API — cash receipts (سند قبض / POST025) and expenses
 * (سند صرف / POST026). Vouchers attach to the cashier's open shift and feed
 * the shift-close cash reconciliation. Proof-verified against live :3000
 * (2026-07-01).
 *
 *   POST /vouchers                       → Voucher (Idempotency-Key MANDATORY,
 *                                          open shift required)
 *   GET  /vouchers?cashierNo=&type=&…    → Voucher[] (newest first)
 */

export interface VoucherFilters {
  cashierNo?: number;
  type?: VoucherType;
  shift?: string;
}

/** GET /vouchers — list vouchers (filter by cashier / type / shift). */
export function useVouchers(filters: VoucherFilters) {
  return useQuery({
    queryKey: ['vouchers', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.cashierNo != null) params.set('cashierNo', String(filters.cashierNo));
      if (filters.type) params.set('type', filters.type);
      if (filters.shift) params.set('shift', filters.shift);
      const qs = params.toString();
      return getData<Voucher[]>(`/vouchers${qs ? `?${qs}` : ''}`);
    },
    staleTime: 10_000,
  });
}

/**
 * POST /vouchers — create a cash voucher (RECEIPT/قبض or EXPENSE/صرف).
 * Idempotency-Key (uuid) is mandatory; replays return the same voucher.
 * Requires an open shift for cashierNo. Invalidates the list on success.
 */
export function useCreateVoucher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateVoucherDto): Promise<Voucher> => {
      const res = await api.post<ApiEnvelope<Voucher>>('/vouchers', dto, {
        headers: { 'Idempotency-Key': newIdempotencyKey() },
      });
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vouchers'] });
    },
  });
}
