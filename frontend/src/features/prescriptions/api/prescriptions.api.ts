import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getData } from '@/shared/lib/api-client';
import type {
  ApiEnvelope,
  CreatePrescriptionDto,
  PrescriptionDetail,
  PrescriptionRow,
  RxBillItem,
} from '@/shared/lib/types';

/**
 * Prescriptions API (POST023) — proof-verified against live :3000 (2026-07-04):
 *   GET  /prescriptions?billNo=&patient=&limit= → PrescriptionRow[]
 *   GET  /prescriptions/{id}                    → PrescriptionDetail (+lines)
 *   GET  /prescriptions/bill/{billNo}/items     → RxBillItem[] (pre-fill)
 *   POST /prescriptions                         → created detail
 */
export function usePrescriptions(filters: { billNo?: string; patient?: string }) {
  const billNo = filters.billNo?.trim();
  const patient = filters.patient?.trim();
  return useQuery({
    queryKey: ['prescriptions', { billNo, patient }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (billNo) params.set('billNo', billNo);
      if (patient) params.set('patient', patient);
      params.set('limit', '100');
      return getData<PrescriptionRow[]>(`/prescriptions?${params.toString()}`);
    },
  });
}

export function usePrescription(id: string | null) {
  return useQuery({
    queryKey: ['prescription', id],
    enabled: !!id,
    queryFn: () => getData<PrescriptionDetail>(`/prescriptions/${encodeURIComponent(id!)}`),
  });
}

/** Items of a live sale bill — pre-fills the annotate grid (404 = unknown). */
export function useRxBillItems(billNo: string | null) {
  return useQuery({
    queryKey: ['prescription', 'bill-items', billNo],
    enabled: !!billNo,
    retry: false,
    queryFn: () =>
      getData<RxBillItem[]>(`/prescriptions/bill/${encodeURIComponent(billNo!)}/items`),
  });
}

export function useCreatePrescription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreatePrescriptionDto): Promise<PrescriptionDetail> => {
      const res = await api.post<ApiEnvelope<PrescriptionDetail>>('/prescriptions', dto);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });
}
