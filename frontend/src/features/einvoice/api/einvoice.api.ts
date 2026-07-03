import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getData } from '@/shared/lib/api-client';
import type { ApiEnvelope, EInvoice } from '@/shared/lib/types';

/**
 * E-invoice API — proof-verified against live backend (:3000, 2026-07-01):
 *   POST /einvoice/generate/{billId} → EInvoice (TLV/QR + JSON + hash; simulates submit)
 *   GET  /einvoice/{billId}          → EInvoice (404 problem+json if not generated)
 *
 * NOTE: billId is the MOTECH_POS bill UUID (from POST /bills), NOT the legacy
 * billNo. E-invoices are therefore available for POS-issued bills only.
 */
export function useEInvoice(billId: string | null, enabled = true) {
  return useQuery({
    queryKey: ['einvoice', billId],
    enabled: !!billId && enabled,
    retry: false, // 404 = "not generated yet"; don't hammer.
    queryFn: () => getData<EInvoice>(`/einvoice/${encodeURIComponent(billId!)}`),
  });
}

/** POST /einvoice/generate/{billId} — generate (idempotent) the e-invoice. */
export function useGenerateEInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (billId: string): Promise<EInvoice> => {
      const res = await api.post<ApiEnvelope<EInvoice>>(
        `/einvoice/generate/${encodeURIComponent(billId)}`,
        {},
      );
      return res.data.data;
    },
    onSuccess: (e) => {
      qc.setQueryData(['einvoice', e.billId], e);
    },
  });
}
