import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getData } from '@/shared/lib/api-client';
import type { ApiEnvelope, ItemOrigin } from '@/shared/lib/types';

/**
 * Item extras API (POSI006/008/009 multi-barcode + POSI2000 stock limits) —
 * proof-verified against the live backend (:3000, 2026-07-04):
 *   GET    /items/{code}/barcodes      → ERP IAS_ITM_UNT_BARCODE + overlay
 *   POST   /items/{code}/barcodes      → add a LOCAL barcode (supervisor/admin)
 *   DELETE /items/{code}/barcodes/{bc} → disable a LOCAL barcode (ERP immutable)
 *   GET    /items/{code}/limits        → min/max/reorder merged ERP + overlay
 *   PUT    /items/{code}               → minLimitQty/maxLimitQty/reorderLimitQty
 */

export interface ItemBarcode {
  barcode: string;
  itemCode: string;
  unit: string | null;
  packSize: number | null;
  isMain: boolean;
  noSale: boolean;
  inactive: boolean;
  origin: 'ERP' | 'LOCAL';
}

export interface ItemBarcodesView {
  code: string;
  barcodes: ItemBarcode[];
}

export interface ItemStockLimits {
  code: string;
  minLimitQty: number | null;
  maxLimitQty: number | null;
  reorderLimitQty: number | null;
  origin: ItemOrigin;
}

export interface AddItemBarcodeDto {
  barcode: string;
  unit?: string;
  packSize?: number;
  isMain?: boolean;
  noSale?: boolean;
}

export function useItemBarcodes(code: string | null) {
  return useQuery({
    queryKey: ['item', code, 'barcodes'],
    enabled: !!code,
    queryFn: () =>
      getData<ItemBarcodesView>(`/items/${encodeURIComponent(code!)}/barcodes`),
    staleTime: 30_000,
  });
}

export function useItemLimits(code: string | null) {
  return useQuery({
    queryKey: ['item', code, 'limits'],
    enabled: !!code,
    queryFn: () => getData<ItemStockLimits>(`/items/${encodeURIComponent(code!)}/limits`),
    staleTime: 30_000,
  });
}

export function useAddItemBarcode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { code: string; dto: AddItemBarcodeDto }): Promise<ItemBarcode> => {
      const res = await api.post<ApiEnvelope<ItemBarcode>>(
        `/items/${encodeURIComponent(vars.code)}/barcodes`,
        vars.dto,
      );
      return res.data.data;
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ['item', vars.code, 'barcodes'] }),
  });
}

export function useRemoveItemBarcode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { code: string; barcode: string }) => {
      const res = await api.delete<ApiEnvelope<{ barcode: string; removed: boolean }>>(
        `/items/${encodeURIComponent(vars.code)}/barcodes/${encodeURIComponent(vars.barcode)}`,
      );
      return res.data.data;
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: ['item', vars.code, 'barcodes'] }),
  });
}

/** PUT /items/{code} carrying only the stock-limit fields (POSI2000). */
export function useUpdateItemLimits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      code: string;
      dto: { minLimitQty?: number; maxLimitQty?: number; reorderLimitQty?: number };
    }) => {
      const res = await api.put<ApiEnvelope<unknown>>(
        `/items/${encodeURIComponent(vars.code)}`,
        vars.dto,
      );
      return res.data.data;
    },
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: ['item', vars.code, 'limits'] });
      void qc.invalidateQueries({ queryKey: ['items'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Price-level selection (POS_ITM_PRICE) — GET /items/{code}/prices/{levNo}
// ---------------------------------------------------------------------------

/** Resolved price for one level (optionally one unit). */
export interface PriceAtLevel {
  code: string;
  levNo: number;
  unit: string | null;
  packSize: number | null;
  warehouseCode: number | null;
  price: number;
  minPrice: number | null;
  maxPrice: number | null;
}

/**
 * GET /items/{code}/prices/{levNo}?unit= — sale-time price-level selection;
 * defaults to the base (smallest) unit when unit is omitted.
 */
export function usePriceAtLevel(code: string | null, levNo: number | null, unit?: string) {
  return useQuery({
    queryKey: ['item', code, 'price-at-level', { levNo, unit }],
    enabled: !!code && levNo != null,
    queryFn: () => {
      const qs = unit ? `?unit=${encodeURIComponent(unit)}` : '';
      return getData<PriceAtLevel>(
        `/items/${encodeURIComponent(code!)}/prices/${levNo}${qs}`,
      );
    },
    staleTime: 60_000,
  });
}
