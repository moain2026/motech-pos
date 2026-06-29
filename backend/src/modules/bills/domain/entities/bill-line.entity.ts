import { Money } from '../../../../shared/domain/money';

/**
 * Tax calculation mode (mirrors CLC_VAT_AMT_TYP / P_CALC_VAT_AMT_TYPE in
 * PKG_POS_API_PKG.CLC_ITM_TAX — PACKAGES_ANALYSIS §1.3):
 *   1 = VAT on full price (before discount)
 *   2 = VAT on price after discount
 */
export enum VatCalcType {
  ON_PRICE = 1,
  AFTER_DISCOUNT = 2,
}

export interface BillLineProps {
  iCode: string;
  qty: number;
  /** unit price excl. VAT (I_PRICE) */
  price: number;
  /** detail-level discount per unit (DIS_AMT_DTL) */
  discDtl?: number;
  /** head discount allocated to this line per unit (DIS_AMT_MST) */
  discMst?: number;
  /** VAT percent for the item (from GET_ITM_TAX_PRCNT), e.g. 15 */
  vatPercent?: number;
  /** free quantity (FREE_QTY) */
  freeQty?: number;
  /** unit / pack metadata (passthrough) */
  itmUnit?: string;
}

/**
 * BillLine — pure domain entity. Re-implements the per-line tax/discount math
 * from PKG_POS_API_PKG.CLC_ITM_TAX (PACKAGES_ANALYSIS §1.3 / SALES_FLOW step 5)
 * with NUMERIC-safe Money. No DB, no framework.
 */
export class BillLine {
  readonly iCode: string;
  readonly qty: number;
  readonly freeQty: number;
  readonly price: Money;
  readonly discDtl: Money;
  readonly discMst: Money;
  readonly vatPercent: number;
  readonly itmUnit?: string;

  constructor(props: BillLineProps) {
    if (!props.iCode) throw new Error('BillLine: iCode required');
    if (!Number.isFinite(props.qty) || props.qty < 0)
      throw new Error('BillLine: qty must be >= 0');
    if (!Number.isFinite(props.price) || props.price < 0)
      throw new Error('BillLine: price must be >= 0');

    this.iCode = props.iCode;
    this.qty = props.qty;
    this.freeQty = props.freeQty ?? 0;
    this.price = Money.of(props.price);
    this.discDtl = Money.of(props.discDtl ?? 0);
    this.discMst = Money.of(props.discMst ?? 0);
    this.vatPercent = props.vatPercent ?? 0;
    this.itmUnit = props.itmUnit;
  }

  /** Total per-unit discount = DIS_AMT_DTL + DIS_AMT_MST (PACKAGES_ANALYSIS §1.4). */
  unitDiscount(): Money {
    return this.discDtl.add(this.discMst);
  }

  /** Net unit price after discount = I_PRICE - (DIS_AMT_DTL + DIS_AMT_MST). */
  netUnitPrice(): Money {
    return this.price.subtract(this.unitDiscount());
  }

  /**
   * Per-unit VAT amount per CLC_ITM_TAX:
   *   type 1: ROUND(I_PRICE * VAT%/100)
   *   type 2: ROUND((I_PRICE - (DIS_DTL+DIS_MST)) * VAT%/100)
   */
  unitVat(calcType: VatCalcType): Money {
    if (this.vatPercent <= 0) return Money.zero();
    const base =
      calcType === VatCalcType.AFTER_DISCOUNT ? this.netUnitPrice() : this.price;
    return base.percentage(this.vatPercent);
  }

  /** Line gross (qty * price), excl. VAT, before discount. */
  lineGross(): Money {
    return this.price.multiply(this.qty);
  }

  /** Line total discount = qty * (DIS_AMT_DTL + DIS_AMT_MST). */
  lineDiscount(): Money {
    return this.unitDiscount().multiply(this.qty);
  }

  /**
   * Line VAT total. Per UPDT_BILL_IN_SAV_PRC (PACKAGES_ANALYSIS §1.5):
   *   SUM((I_QTY + FREE_QTY * CLC_TAX_FREE_QTY_FLG) * VAT_AMT_per_unit)
   * We expose the taxable-qty multiplier; default flag=0 (free qty not taxed).
   */
  lineVat(calcType: VatCalcType, taxFreeQtyFlag = 0): Money {
    const taxableQty = this.qty + this.freeQty * taxFreeQtyFlag;
    return this.unitVat(calcType).multiply(taxableQty);
  }

  /** Net line amount excl. VAT = lineGross - lineDiscount. */
  lineNet(): Money {
    return this.lineGross().subtract(this.lineDiscount());
  }
}
