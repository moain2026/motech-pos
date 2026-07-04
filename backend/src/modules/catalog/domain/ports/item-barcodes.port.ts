/** DI token for the item barcodes port (ERP reads + MOTECH_POS overlay). */
export const ITEM_BARCODES_REPOSITORY = Symbol('ITEM_BARCODES_REPOSITORY');

/** One barcode of an item (per unit), merged view. */
export interface ItemBarcodeRow {
  barcode: string;
  itemCode: string;
  unit: string | null; // ITM_UNT
  packSize: number | null; // P_SIZE
  isMain: boolean; // MAIN_BARCODE
  noSale: boolean;
  inactive: boolean;
  origin: 'ERP' | 'LOCAL';
}

export interface AddItemBarcodeInput {
  itemCode: string;
  barcode: string;
  unit?: string | null;
  packSize?: number | null;
  isMain?: boolean;
  noSale?: boolean;
  inactive?: boolean;
}

/**
 * ItemBarcodesRepository — multi-barcode support (POSI006/008/009 advanced
 * item settings). ERP source: IAS202623.IAS_ITM_UNT_BARCODE (2,614 rows,
 * read-only). Local additions: MOTECH_POS.ITEM_BARCODES_OVERLAY (V016).
 */
export interface ItemBarcodesRepository {
  /** All barcodes of one item: ERP rows + local overlay rows. */
  listByItem(itemCode: string): Promise<ItemBarcodeRow[]>;
  /** Resolve one barcode → row (ERP first, then overlay). */
  findByBarcode(barcode: string): Promise<ItemBarcodeRow | null>;
  /** Add a LOCAL barcode (writes MOTECH_POS only). */
  add(input: AddItemBarcodeInput): Promise<ItemBarcodeRow>;
  /** Soft-delete/disable a LOCAL barcode. */
  deactivate(barcode: string): Promise<boolean>;
}
