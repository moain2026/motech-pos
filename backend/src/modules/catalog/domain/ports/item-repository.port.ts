import { Item, ItemStock } from '../entities/item.entity';

/** DI token for the ItemRepository port. */
export const ITEM_REPOSITORY = Symbol('ITEM_REPOSITORY');

export interface ItemListFilter {
  /** Free-text search over item code / barcode. */
  search?: string;
  limit: number;
  /** Cursor = last seen I_CODE (ascending). */
  cursor?: string;
  /** Category (main group) filter — IAS_ITM_MST.G_CODE. */
  category?: string;
  /** Sub-category filter — IAS_ITM_MST.MNG_CODE (used with category). */
  subCategory?: string;
  /** Weighted (scale) items only / non-weighted only — IAS_ITM_MST.WEIGHTED. */
  weighted?: boolean;
  /** Active items only (true) or inactive only (false) — IAS_ITM_MST.INACTIVE. */
  active?: boolean;
  /** Price range (inclusive) against the effective price. */
  minPrice?: number;
  maxPrice?: number;
}

export interface ItemListResult {
  items: Item[];
  nextCursor?: string;
}

/** Full item detail: the item plus its per-warehouse stock and total. */
export interface ItemDetail {
  item: Item;
  stock: ItemStock[];
  totalAvailableQty: number;
}

/** One price-list row for an item (IAS202623.IAS_ITEM_PRICE). */
export interface ItemPriceLevel {
  levNo: number;
  unit: string | null;
  packSize: number | null;
  warehouseCode: number | null;
  price: number;
  minPrice: number | null;
  maxPrice: number | null;
}

/** One unit-of-measure row for an item (IAS202623.IAS_ITM_DTL). */
export interface ItemUnit {
  unit: string;
  /** Conversion factor to the base unit (P_SIZE), e.g. carton = 20. */
  packSize: number;
  barcode: string | null;
  isMainUnit: boolean;
  isSaleUnit: boolean;
  isPurchaseUnit: boolean;
  isStockUnit: boolean;
  noSale: boolean;
  inactive: boolean;
  /** Price-list price (LEV_NO = 1) for this unit, when defined. */
  price: number | null;
}

/** Category tree node (GROUP_DETAILS → IAS_MAINSUB_GRP_DTL). */
export interface CategoryNode {
  code: string;
  name: string | null;
  englishName: string | null;
  itemCount: number;
  children: CategoryChild[];
}

export interface CategoryChild {
  code: string;
  name: string | null;
  englishName: string | null;
  itemCount: number;
}

/** ERP stock limits for an item (IAS_ITM_MST — POSI2000 advanced fields). */
export interface ItemStockLimits {
  minLimitQty: number | null; // ITM_MIN_LMT_QTY
  maxLimitQty: number | null; // ITM_MAX_LMT_QTY
  reorderLimitQty: number | null; // ITM_ROL_LMT_QTY
}

/** Item nature types (IAS202623.ITEM_TYPES — e.g. stocked vs service). */
export interface ItemTypeRow {
  typeOfItem: number;
  name: string | null;
  englishName: string | null;
}

export interface ItemRepository {
  /** Paginated list of items (code ascending), cursor-based. */
  list(filter: ItemListFilter): Promise<ItemListResult>;

  /** One item by code, with stock; null if the code is unknown. */
  findByCode(code: string): Promise<ItemDetail | null>;

  /** One item by barcode (resolves to its code), with stock; null if unknown. */
  findByBarcode(barcode: string): Promise<ItemDetail | null>;

  /** All price-list rows for an item, every level/unit (IAS_ITEM_PRICE). */
  listPrices(code: string): Promise<ItemPriceLevel[]>;

  /** All units of measure for an item with conversion factors (IAS_ITM_DTL). */
  listUnits(code: string): Promise<ItemUnit[]>;

  /** ERP stock limits (min/max/reorder) for an item; null if unknown. */
  findStockLimits(code: string): Promise<ItemStockLimits | null>;

  /** Category tree: main groups with sub-groups and item counts. */
  listCategories(): Promise<CategoryNode[]>;

  /** Item nature types (ITEM_TYPES). */
  listItemTypes(): Promise<ItemTypeRow[]>;

  /**
   * Price for a specific price level (optionally a specific unit).
   * Falls back to the smallest pack size at that level when unit is omitted.
   */
  findPriceAtLevel(
    code: string,
    levNo: number,
    unit?: string | null,
  ): Promise<ItemPriceLevel | null>;
}
