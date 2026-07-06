import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getData } from '@/shared/lib/api-client';
import type { ApiEnvelope } from '@/shared/lib/types';

/**
 * POS config API (POSI004 shortcuts + POSI005/006 scale barcode schemes).
 * Proof-verified against live backend (:3000):
 *   GET    /pos-config/shortcuts
 *   PUT    /pos-config/shortcuts          (SETTINGS)
 *   DELETE /pos-config/shortcuts/{action} (SETTINGS)
 *   GET    /pos-config/scales
 *   POST   /pos-config/scales             (SETTINGS)
 *   PUT    /pos-config/scales/{id}        (SETTINGS)
 *   DELETE /pos-config/scales/{id}        (SETTINGS)
 *   POST   /pos-config/scales/decode      (preview)
 */

//===========================================================================
// Shortcuts (POSI004)
//===========================================================================
export interface Shortcut {
  id: string;
  action: string;
  keyCombo: string;
  arLabel: string | null;
  sortOrder: number;
  enabled: boolean;
}

export interface UpsertShortcut {
  action: string;
  keyCombo: string;
  arLabel?: string | null;
  sortOrder?: number;
  enabled?: boolean;
}

const SC_KEY = ['pos-config', 'shortcuts'];

export function useShortcuts() {
  return useQuery({
    queryKey: SC_KEY,
    queryFn: () => getData<Shortcut[]>('/pos-config/shortcuts'),
    staleTime: 30_000,
  });
}

export function useUpsertShortcut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: UpsertShortcut): Promise<Shortcut> => {
      const res = await api.put<ApiEnvelope<Shortcut>>('/pos-config/shortcuts', dto);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: SC_KEY }),
  });
}

export function useDeleteShortcut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (action: string): Promise<void> => {
      await api.delete(`/pos-config/shortcuts/${encodeURIComponent(action)}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: SC_KEY }),
  });
}

//===========================================================================
// Scale definitions (POSI005/006)
//===========================================================================
export type ScaleMode = 'WEIGHT' | 'PRICE';

export interface ScaleDefinition {
  id: string;
  name: string;
  prefix: string;
  barcodeLength: number;
  itemCodeStart: number;
  itemCodeLen: number;
  valueLen: number | null;
  divisor: number;
  mode: ScaleMode;
  enabled: boolean;
  sortOrder: number;
}

export interface UpsertScale {
  name: string;
  prefix: string;
  barcodeLength: number;
  itemCodeStart?: number;
  itemCodeLen: number;
  valueLen?: number | null;
  divisor: number;
  mode: ScaleMode;
  enabled?: boolean;
  sortOrder?: number;
}

export interface DecodedScale {
  isScale: true;
  raw: string;
  scaleName: string;
  mode: ScaleMode;
  itemCode: string;
  itemCodeRaw: string;
  quantity: number | null;
  price: number | null;
}

const SCALE_KEY = ['pos-config', 'scales'];

export function useScales() {
  return useQuery({
    queryKey: SCALE_KEY,
    queryFn: () => getData<ScaleDefinition[]>('/pos-config/scales'),
    staleTime: 30_000,
  });
}

export function useCreateScale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: UpsertScale): Promise<ScaleDefinition> => {
      const res = await api.post<ApiEnvelope<ScaleDefinition>>('/pos-config/scales', dto);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: SCALE_KEY }),
  });
}

export function useUpdateScale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; dto: UpsertScale }): Promise<ScaleDefinition> => {
      const res = await api.put<ApiEnvelope<ScaleDefinition>>(
        `/pos-config/scales/${encodeURIComponent(vars.id)}`,
        vars.dto,
      );
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: SCALE_KEY }),
  });
}

export function useDeleteScale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/pos-config/scales/${encodeURIComponent(id)}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: SCALE_KEY }),
  });
}

export async function decodeScaleBarcode(barcode: string): Promise<DecodedScale | null> {
  const res = await api.post<ApiEnvelope<DecodedScale | null>>('/pos-config/scales/decode', {
    barcode,
  });
  return res.data.data;
}
