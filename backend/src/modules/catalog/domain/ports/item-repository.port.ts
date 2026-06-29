import { Item, ItemStock } from '../entities/item.entity';

/** DI token for the ItemRepository port. */
export const ITEM_REPOSITORY = Symbol('ITEM_REPOSITORY');

export interface ItemListFilter {
  /** Free-text search over item code / barcode. */
  search?: string;
  limit: number;
  /** Cursor = last seen I_CODE (ascending). */
  cursor?: string;
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

export interface ItemRepository {
  /** Paginated list of items (code ascending), cursor-based. */
  list(filter: ItemListFilter): Promise<ItemListResult>;

  /** One item by code, with stock; null if the code is unknown. */
  findByCode(code: string): Promise<ItemDetail | null>;

  /** One item by barcode (resolves to its code), with stock; null if unknown. */
  findByBarcode(barcode: string): Promise<ItemDetail | null>;
}
