import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getData } from '@/shared/lib/api-client';
import type { ApiEnvelope, Settings, UpdateSettingsDto } from '@/shared/lib/types';

/**
 * Settings API — proof-verified against live :3000 (2026-07-04).
 *
 *   GET  /settings           → resolved effective settings (system + overrides)
 *   GET  /settings/all       → ALL 179 IAS_PARA_POS settings classified in 10 groups
 *   PUT  /settings           → apply local overrides ({ overrides: [{key,value}] })
 *   PUT  /settings/:key      → upsert ONE override (value:null reverts to live) — admin
 *
 * Reads are cashier-visible; writes are admin-only (RBAC enforced on the route).
 */

/** Functional grouping of the 179 IAS_PARA_POS settings (mirror of the backend). */
export type SettingGroup =
  | 'numbering'
  | 'printing'
  | 'tax'
  | 'points'
  | 'cards'
  | 'coupons'
  | 'customers'
  | 'currency'
  | 'messages'
  | 'behavior';

/** Oracle data type of an IAS_PARA_POS column. */
export type SettingType = 'VARCHAR2' | 'NUMBER' | 'DATE';

/** One classified setting from GET /settings/all. */
export interface ClassifiedSetting {
  /** Canonical key = the IAS_PARA_POS column name (e.g. PRINT_BILL). */
  key: string;
  /** Effective value (overlay override wins over live). */
  value: string | null;
  /** The live YSPOS23 value (before any override). */
  liveValue: string | null;
  type: SettingType;
  group: SettingGroup;
  /** Whether a MOTECH_POS overlay override is currently applied. */
  overridden: boolean;
  /** وصف عربي (متوفر لأهم الإعدادات). */
  description?: string;
}

export interface AllSettingsMeta {
  total: number;
  overrideCount: number;
  groupCounts: Record<string, number>;
}

export interface AllSettings {
  groups: Record<SettingGroup, ClassifiedSetting[]>;
  meta: AllSettingsMeta;
}

/** GET /settings/all — all 179 settings classified by group. */
export function useAllSettings() {
  return useQuery({
    queryKey: ['settings', 'all'],
    queryFn: async (): Promise<AllSettings> => {
      const res = await api.get<
        ApiEnvelope<{ groups: Record<SettingGroup, ClassifiedSetting[]> }> & {
          meta: AllSettingsMeta;
        }
      >('/settings/all');
      return { groups: res.data.data.groups, meta: res.data.meta };
    },
    staleTime: 30_000,
  });
}

/**
 * PUT /settings/:key — save one override (admin). `value: null` reverts the
 * key to the live YSPOS23 value. Invalidates both settings caches.
 */
export function useSaveSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      key,
      value,
    }: {
      key: string;
      value: string | null;
    }): Promise<ClassifiedSetting> => {
      const res = await api.put<ApiEnvelope<ClassifiedSetting>>(
        `/settings/${encodeURIComponent(key)}`,
        { value },
      );
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => getData<Settings>('/settings'),
    staleTime: 30_000,
  });
}

/** PUT /settings — persist local overrides (admin). Invalidates the cache. */
export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: UpdateSettingsDto): Promise<Settings> => {
      const res = await api.put<ApiEnvelope<Settings>>('/settings', dto);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
}
