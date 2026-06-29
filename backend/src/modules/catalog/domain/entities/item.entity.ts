import { Money } from '../../../../shared/domain/money';

/**
 * Item — read model of a sellable POS item.
 *
 * DATA SOURCE (proof-based, see docs/db/CATALOG_DATA_NOTE.md):
 * The canonical item master/price tables (`IAS_ITM_MST`, `IAS_ITM_DTL`,
 * `IAS_ITEM_PRICE`) are *synonyms* in YSPOS23 that resolve to the main ERP
 * schema `IAS202623`, which is NOT present in the current local dump. The
 * catalog views built on them (`IAS_V_ITM_UNT`, `IAS_ITM_DATA_VW`, …) are
 * therefore INVALID and cannot be queried.
 *
 * What DOES exist with real data and is read by this module:
 *   - `MV_ITEM_AVL_QTY` (materialized view, 1,280 distinct items) — the
 *     item-code + warehouse + available-quantity authority.
 *   - `IAS_POS_BILL_DTL` (41,945 real sale lines) — last-observed selling
 *     price, barcode, unit and pack size per item code.
 *
 * So an `Item` is reconstructed from the intersection of available-qty and
 * real historical sale data. `name` is intentionally null here because item
 * names live only in the absent `IAS202623` master; the field is kept so the
 * shape is forward-compatible once that schema is reachable.
 */
export class Item {
  readonly code: string;
  readonly name: string | null;
  readonly barcode: string | null;
  readonly unit: string | null;
  readonly packSize: number | null;
  private readonly _lastPrice: Money | null;

  constructor(props: {
    code: string;
    name?: string | null;
    barcode?: string | null;
    unit?: string | null;
    packSize?: number | null;
    lastPrice?: number | null;
  }) {
    this.code = props.code;
    this.name = props.name ?? null;
    this.barcode = props.barcode ?? null;
    this.unit = props.unit ?? null;
    this.packSize = props.packSize ?? null;
    this._lastPrice =
      props.lastPrice == null ? null : Money.of(props.lastPrice);
  }

  /** Last observed selling price (from real sale history), or null. */
  lastPrice(): Money | null {
    return this._lastPrice;
  }
}

/** Per-warehouse available quantity for an item. */
export interface ItemStock {
  warehouseCode: number;
  availableQty: number;
}
