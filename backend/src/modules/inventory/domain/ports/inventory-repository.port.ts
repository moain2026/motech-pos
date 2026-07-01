/** DI token for the read-only InventoryRepository port. */
export const INVENTORY_REPOSITORY = Symbol('INVENTORY_REPOSITORY');

/** One row in the aggregated inventory list: an item with its total qty. */
export interface InventoryItemRow {
  code: string;
  name: string | null; // Arabic I_NAME
  totalAvailableQty: number; // SUM(AVL_QTY) across warehouses/batches
  warehouseCount: number; // distinct W_CODE holding this item
}

/** Per-warehouse (and batch) available quantity for a single item. */
export interface InventoryStockRow {
  warehouseCode: number;
  batchNo: string | null;
  expireDate: string | null; // YYYY-MM-DD
  availableQty: number;
}

/** Full detail for one item's stock across warehouses. */
export interface InventoryItemDetail {
  code: string;
  name: string | null;
  totalAvailableQty: number;
  warehouseCount: number;
  stock: InventoryStockRow[];
}

/** Filter for the paginated inventory list (code ascending, cursor-based). */
export interface InventoryListFilter {
  search?: string;
  limit: number;
  /** Cursor = last seen I_CODE (ascending). */
  cursor?: string;
}

export interface InventoryListResult {
  items: InventoryItemRow[];
  nextCursor?: string;
}

/** Filter for the low-stock query. */
export interface LowStockFilter {
  /** Items whose total available qty is <= this threshold. Default 5. */
  threshold: number;
  limit: number;
}

/**
 * InventoryRepository — READ-ONLY aggregations over the live YSPOS23 stock
 * materialized view (MV_ITEM_AVL_QTY), enriched with Arabic item names from
 * the IAS202623 master (IAS_ITM_MST). Served through MOTECH_RO. No mutations.
 */
export interface InventoryRepository {
  /** Paginated list of items with aggregated available quantities. */
  list(filter: InventoryListFilter): Promise<InventoryListResult>;

  /** One item's stock broken down per warehouse/batch; null if unknown. */
  findByCode(code: string): Promise<InventoryItemDetail | null>;

  /** Items at or below a low-stock threshold (ascending by qty). */
  lowStock(filter: LowStockFilter): Promise<InventoryItemRow[]>;
}
