import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getData } from '@/shared/lib/api-client';
import type {
  AddKeypadKeyDto,
  ApiEnvelope,
  KeypadDetail,
  KeypadKeyRow,
  KeypadRow,
  UpsertKeypadDto,
} from '@/shared/lib/types';

/**
 * Keypads API (POSI002 لوحات المفاتيح + POSI003 أصنافها) — proof-verified
 * against the live backend (:3000, 2026-07-04):
 *   GET    /keypads                    → KeypadRow[] with key counts
 *   POST   /keypads                    → create (auto keypadNo when omitted)
 *   GET    /keypads/{no}               → detail + keys (resolved names/prices)
 *   PUT    /keypads/{no}               → rename / (de)activate
 *   POST   /keypads/{no}/keys          → link an item (must exist)
 *   DELETE /keypads/{no}/keys/{keyId}  → unlink a key
 * Reads all roles; mutations supervisor/admin.
 */
export function useKeypads() {
  return useQuery({
    queryKey: ['keypads'],
    queryFn: () => getData<KeypadRow[]>('/keypads'),
    staleTime: 30_000,
  });
}

export function useKeypad(no: number | null) {
  return useQuery({
    queryKey: ['keypads', 'detail', no],
    enabled: no != null,
    queryFn: () => getData<KeypadDetail>(`/keypads/${no}`),
  });
}

export function useCreateKeypad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: UpsertKeypadDto): Promise<KeypadRow> => {
      const res = await api.post<ApiEnvelope<KeypadRow>>('/keypads', dto);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['keypads'] }),
  });
}

export function useUpdateKeypad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { no: number; dto: UpsertKeypadDto }): Promise<KeypadRow> => {
      const res = await api.put<ApiEnvelope<KeypadRow>>(`/keypads/${vars.no}`, vars.dto);
      return res.data.data;
    },
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: ['keypads'] });
      void qc.invalidateQueries({ queryKey: ['keypads', 'detail', vars.no] });
    },
  });
}

export function useAddKeypadKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { no: number; dto: AddKeypadKeyDto }): Promise<KeypadKeyRow> => {
      const res = await api.post<ApiEnvelope<KeypadKeyRow>>(`/keypads/${vars.no}/keys`, vars.dto);
      return res.data.data;
    },
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: ['keypads'] });
      void qc.invalidateQueries({ queryKey: ['keypads', 'detail', vars.no] });
    },
  });
}

export function useRemoveKeypadKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { no: number; keyId: string }) => {
      const res = await api.delete<ApiEnvelope<{ removed: boolean }>>(
        `/keypads/${vars.no}/keys/${encodeURIComponent(vars.keyId)}`,
      );
      return res.data.data;
    },
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: ['keypads'] });
      void qc.invalidateQueries({ queryKey: ['keypads', 'detail', vars.no] });
    },
  });
}
