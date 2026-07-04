import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getData } from '@/shared/lib/api-client';
import type { ApiEnvelope, ItemOrigin } from '@/shared/lib/types';

/**
 * Master-data API (wave E — POSI001/003/004/005/011) — proof-verified against
 * the live backend (:3000, 2026-07-04):
 *   GET/POST /suppliers        + PUT /suppliers/{code}     (V_DETAILS + overlay)
 *   GET/POST /warehouses       + PUT /warehouses/{code}    (WAREHOUSE_DETAILS + overlay)
 *   GET/POST /item-groups      + PUT /item-groups/{code}   (GROUP_DETAILS + overlay)
 *   GET/POST /units            + PUT /units/{code}         (MEASUREMENT + overlay)
 *   GET/POST /currencies       + PUT /currencies/{code}    (EX_RATE + overlay)
 * Reads all roles; mutations supervisor/admin. Writes land ONLY in the
 * MOTECH_POS overlays (origin ERP/LOCAL/EDIT surfaces provenance).
 */

// ---------------------------------------------------------------------------
// Suppliers (POSI001/002)
// ---------------------------------------------------------------------------

export interface Supplier {
  code: string;
  arName: string | null;
  enName: string | null;
  phone: string | null;
  mobile: string | null;
  email: string | null;
  address: string | null;
  taxCode: string | null;
  contact: string | null;
  creditPeriod: number | null;
  inactive: boolean;
  origin: ItemOrigin;
}

export interface UpsertSupplierDto {
  code?: string;
  arName?: string;
  enName?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  address?: string;
  taxCode?: string;
  contact?: string;
  creditPeriod?: number;
  inactive?: boolean;
}

export function useSuppliers(search: string) {
  return useQuery({
    queryKey: ['suppliers', { search }],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('limit', '300');
      if (search.trim()) params.set('search', search.trim());
      return getData<Supplier[]>(`/suppliers?${params.toString()}`);
    },
    staleTime: 30_000,
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: UpsertSupplierDto): Promise<Supplier> => {
      const res = await api.post<ApiEnvelope<Supplier>>('/suppliers', dto);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { code: string; dto: UpsertSupplierDto }): Promise<Supplier> => {
      const res = await api.put<ApiEnvelope<Supplier>>(
        `/suppliers/${encodeURIComponent(vars.code)}`,
        vars.dto,
      );
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  });
}

// ---------------------------------------------------------------------------
// Warehouses (POSI003)
// ---------------------------------------------------------------------------

export interface Warehouse {
  code: number;
  arName: string | null;
  enName: string | null;
  location: string | null;
  tel: string | null;
  keeper: string | null;
  noSale: boolean;
  priceLevel: number | null;
  inactive: boolean;
  origin: ItemOrigin;
}

export interface UpsertWarehouseDto {
  code?: number;
  arName?: string;
  enName?: string;
  location?: string;
  tel?: string;
  keeper?: string;
  noSale?: boolean;
  priceLevel?: number;
  inactive?: boolean;
}

export function useWarehouses() {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: () => getData<Warehouse[]>('/warehouses'),
    staleTime: 30_000,
  });
}

export function useCreateWarehouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: UpsertWarehouseDto): Promise<Warehouse> => {
      const res = await api.post<ApiEnvelope<Warehouse>>('/warehouses', dto);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['warehouses'] }),
  });
}

export function useUpdateWarehouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { code: number; dto: UpsertWarehouseDto }): Promise<Warehouse> => {
      const res = await api.put<ApiEnvelope<Warehouse>>(`/warehouses/${vars.code}`, vars.dto);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['warehouses'] }),
  });
}

// ---------------------------------------------------------------------------
// Item groups (POSI004)
// ---------------------------------------------------------------------------

export interface ItemGroup {
  code: string;
  arName: string | null;
  enName: string | null;
  taxPercent: number | null;
  allowDiscount: boolean | null;
  sortOrder: number | null;
  itemCount: number;
  inactive: boolean;
  origin: ItemOrigin;
}

export interface UpsertItemGroupDto {
  code?: string;
  arName?: string;
  enName?: string;
  taxPercent?: number;
  allowDiscount?: boolean;
  sortOrder?: number;
  inactive?: boolean;
}

export function useItemGroups() {
  return useQuery({
    queryKey: ['item-groups'],
    queryFn: () => getData<ItemGroup[]>('/item-groups'),
    staleTime: 30_000,
  });
}

export function useCreateItemGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: UpsertItemGroupDto): Promise<ItemGroup> => {
      const res = await api.post<ApiEnvelope<ItemGroup>>('/item-groups', dto);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['item-groups'] }),
  });
}

export function useUpdateItemGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { code: string; dto: UpsertItemGroupDto }): Promise<ItemGroup> => {
      const res = await api.put<ApiEnvelope<ItemGroup>>(
        `/item-groups/${encodeURIComponent(vars.code)}`,
        vars.dto,
      );
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['item-groups'] }),
  });
}

// ---------------------------------------------------------------------------
// Units of measure (POSI005)
// ---------------------------------------------------------------------------

export interface Unit {
  code: string;
  arName: string | null;
  enName: string | null;
  defaultSize: number | null;
  inactive: boolean;
  origin: ItemOrigin;
}

export interface UpsertUnitDto {
  code?: string;
  arName?: string;
  enName?: string;
  defaultSize?: number;
  inactive?: boolean;
}

export function useUnits() {
  return useQuery({
    queryKey: ['units'],
    queryFn: () => getData<Unit[]>('/units'),
    staleTime: 30_000,
  });
}

export function useCreateUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: UpsertUnitDto): Promise<Unit> => {
      const res = await api.post<ApiEnvelope<Unit>>('/units', dto);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['units'] }),
  });
}

export function useUpdateUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { code: string; dto: UpsertUnitDto }): Promise<Unit> => {
      const res = await api.put<ApiEnvelope<Unit>>(
        `/units/${encodeURIComponent(vars.code)}`,
        vars.dto,
      );
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['units'] }),
  });
}

// ---------------------------------------------------------------------------
// Currencies + POS exchange rates (POSI011)
// ---------------------------------------------------------------------------

export interface Currency {
  code: string;
  no: number | null;
  arName: string | null;
  enName: string | null;
  /** Accounting exchange rate (CUR_RATE). */
  rate: number | null;
  /** POS exchange rate (CUR_RATE_POS). */
  ratePos: number | null;
  fractionNo: number | null;
  isLocal: boolean;
  inactive: boolean;
  origin: ItemOrigin;
}

export interface UpsertCurrencyDto {
  code?: string;
  arName?: string;
  enName?: string;
  rate?: number;
  ratePos?: number;
  fractionNo?: number;
  inactive?: boolean;
}

export function useCurrencies() {
  return useQuery({
    queryKey: ['currencies'],
    queryFn: () => getData<Currency[]>('/currencies'),
    staleTime: 30_000,
  });
}

export function useCreateCurrency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: UpsertCurrencyDto): Promise<Currency> => {
      const res = await api.post<ApiEnvelope<Currency>>('/currencies', dto);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['currencies'] }),
  });
}

export function useUpdateCurrency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { code: string; dto: UpsertCurrencyDto }): Promise<Currency> => {
      const res = await api.put<ApiEnvelope<Currency>>(
        `/currencies/${encodeURIComponent(vars.code)}`,
        vars.dto,
      );
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['currencies'] }),
  });
}
