import { Money } from '../../../../shared/domain/money';

/**
 * Item — read model of a sellable POS item.
 *
 * DATA SOURCE (proof-based, see docs/db/CATALOG_DATA_NOTE.md):
 * The canonical item master `IAS202623.IAS_ITM_MST` (2,391 items, Arabic
 * `I_NAME` keyed by `I_CODE`) was imported into the local container on
 * 2026-06-29. `MOTECH_RO` was granted SELECT on it, so item NAMES are now
 * resolved for real (e.g. 1020060001 → "بيض").
 *
 * An `Item` is assembled from:
 *   - `IAS202623.IAS_ITM_MST`  → I_CODE, I_NAME (Arabic name authority)
 *   - `MV_ITEM_AVL_QTY` (materialized view) → warehouse + available-quantity
 *   - `IAS_POS_BILL_DTL` (real sale lines) → last-observed selling price,
 *     barcode, unit and pack size per item code.
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
