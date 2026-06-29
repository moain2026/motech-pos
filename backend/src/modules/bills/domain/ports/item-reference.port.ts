/** DI token for the read-only item reference port (YSPOS23). */
export const ITEM_REFERENCE = Symbol('ITEM_REFERENCE');

/** Pricing/tax reference for an item, read from YSPOS23 (MOTECH_RO, read-only). */
export interface ItemReference {
  itemCode: string;
  /** Reference unit price (excl VAT) observed for the item, or null. */
  unitPrice: number | null;
  /** VAT percent for the item (GET_ITM_TAX_PRCNT analogue), default 0. */
  vatPercent: number;
  /** Item unit (passthrough), if known. */
  unit: string | null;
  /** Item name, if resolvable. */
  name: string | null;
}

/**
 * ItemReferenceReader — reads item price + VAT% from the LIVE YSPOS23 schema.
 * STRICTLY read-only (served by the MOTECH_RO connection). The write side never
 * writes to YSPOS23; it only consults this for canonical prices/tax.
 */
export interface ItemReferenceReader {
  /** Resolve one item's reference price/tax, or null if the code is unknown. */
  findByCode(itemCode: string): Promise<ItemReference | null>;
}
