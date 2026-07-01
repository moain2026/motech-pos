import { Money } from '../../../../shared/domain/money';

/**
 * ReturnLine — pure domain entity for a single returned item line
 * (analogue of BillLine for IAS_POS_RT_BILL_DTL). Re-uses the same NUMERIC-safe
 * Money math: the returned amount is the reversal of the original sale line
 * (positive magnitude here; the document as a whole represents a refund).
 *
 * Mirrors PKG_POS_API_PKG.EXTRCT_POS_RT_BILL_PRC per-line calc
 * (docs/flows/FLOW_RETURN.md §3): I_QTY returned * (I_PRICE) plus reversed
 * VAT / discount. VAT calc type reuses the same 1/2 semantics as sales.
 */
export interface ReturnLineProps {
  iCode: string;
  /** quantity being returned (must be > 0 and <= remaining sold qty). */
  qty: number;
  /** unit price excl. VAT (I_PRICE) — normally the original sale price. */
  price: number;
  /** detail-level discount per unit (DIS_AMT_DTL) — reversed. */
  discDtl?: number;
  /** head discount allocated per unit (DIS_AMT_MST) — reversed. */
  discMst?: number;
  /** VAT percent for the item (VAT_PER), e.g. 15. */
  vatPercent?: number;
  /** replacement amount (RT_RPLC_AMT) — for item-swap returns; default 0. */
  replaceAmount?: number;
  /** item unit passthrough. */
  itmUnit?: string;
}

/** 1 = VAT on full price, 2 = VAT after discount (mirrors sales CLC_VAT_AMT_TYP). */
export enum ReturnVatCalcType {
  ON_PRICE = 1,
  AFTER_DISCOUNT = 2,
}

export class ReturnLine {
  readonly iCode: string;
  readonly qty: number;
  readonly price: Money;
  readonly discDtl: Money;
  readonly discMst: Money;
  readonly vatPercent: number;
  readonly replaceAmount: Money;
  readonly itmUnit?: string;

  constructor(props: ReturnLineProps) {
    if (!props.iCode) throw new Error('ReturnLine: iCode required');
    if (!Number.isFinite(props.qty) || props.qty <= 0)
      throw new Error('ReturnLine: qty must be > 0');
    if (!Number.isFinite(props.price) || props.price < 0)
      throw new Error('ReturnLine: price must be >= 0');

    this.iCode = props.iCode;
    this.qty = props.qty;
    this.price = Money.of(props.price);
    this.discDtl = Money.of(props.discDtl ?? 0);
    this.discMst = Money.of(props.discMst ?? 0);
    this.vatPercent = props.vatPercent ?? 0;
    this.replaceAmount = Money.of(props.replaceAmount ?? 0);
    this.itmUnit = props.itmUnit;
  }

  /** Per-unit total discount (DIS_AMT_DTL + DIS_AMT_MST). */
  unitDiscount(): Money {
    return this.discDtl.add(this.discMst);
  }

  /** Net unit price after discount. */
  netUnitPrice(): Money {
    return this.price.subtract(this.unitDiscount());
  }

  /** Per-unit VAT (same rule as sales CLC_ITM_TAX). */
  unitVat(calcType: ReturnVatCalcType): Money {
    if (this.vatPercent <= 0) return Money.zero();
    const base =
      calcType === ReturnVatCalcType.AFTER_DISCOUNT
        ? this.netUnitPrice()
        : this.price;
    return base.percentage(this.vatPercent);
  }

  /** Line gross returned = qty * price (excl. VAT, before discount). */
  lineGross(): Money {
    return this.price.multiply(this.qty);
  }

  /** Line discount reversed = qty * (DIS_AMT_DTL + DIS_AMT_MST). */
  lineDiscount(): Money {
    return this.unitDiscount().multiply(this.qty);
  }

  /** Line VAT reversed = qty * unitVat. */
  lineVat(calcType: ReturnVatCalcType): Money {
    return this.unitVat(calcType).multiply(this.qty);
  }

  /** Net line amount excl. VAT = lineGross - lineDiscount. */
  lineNet(): Money {
    return this.lineGross().subtract(this.lineDiscount());
  }
}
