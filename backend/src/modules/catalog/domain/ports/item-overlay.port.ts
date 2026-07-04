export const ITEM_OVERLAY_REPOSITORY = Symbol('ITEM_OVERLAY_REPOSITORY');

/** A local item overlay record (MOTECH_POS.ITEMS_OVERLAY). */
export interface ItemOverlayRow {
  code: string;
  origin: 'LOCAL' | 'EDIT';
  name: string | null;
  barcode: string | null;
  unit: string | null;
  price: number | null;
  vatPercent: number | null;
  minLimitQty: number | null; // ITM_MIN_LMT_QTY (حد أدنى للمخزون)
  maxLimitQty: number | null; // ITM_MAX_LMT_QTY
  reorderLimitQty: number | null; // ITM_ROL_LMT_QTY (حد إعادة الطلب)
  inactive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertItemOverlayInput {
  code: string;
  origin: 'LOCAL' | 'EDIT';
  name?: string | null;
  barcode?: string | null;
  unit?: string | null;
  price?: number | null;
  vatPercent?: number | null;
  minLimitQty?: number | null;
  maxLimitQty?: number | null;
  reorderLimitQty?: number | null;
  inactive?: boolean;
}

/**
 * ItemOverlayRepository — write-side local item creates/edits in MOTECH_POS
 * (never writes YSPOS23/IAS202623). Read endpoints merge these on top of the
 * ERP master (overlay price/name win).
 */
export interface ItemOverlayRepository {
  findByCode(code: string): Promise<ItemOverlayRow | null>;
  findByCodes(codes: string[]): Promise<Map<string, ItemOverlayRow>>;
  listLocal(search: string | undefined, limit: number): Promise<ItemOverlayRow[]>;
  upsert(input: UpsertItemOverlayInput): Promise<ItemOverlayRow>;
}
