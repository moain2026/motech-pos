import { PromotionLine, PromotionMaster } from './ports/promotions-repository.port';

/** A cart line handed to the engine (server-priced). */
export interface EngineCartLine {
  itemCode: string;
  itemUnit?: string | null;
  qty: number;
  unitPrice: number;
}

/** A discount applied to a specific cart line. */
export interface AppliedLineDiscount {
  itemCode: string;
  quotNo: number;
  rcrdNo: number;
  /** Total discount amount for the line (absolute, bill currency). */
  discountAmount: number;
  /** Human hint of the promo mechanism. */
  kind: 'tier-price' | 'tier-discount' | 'invoice-discount' | 'free-as-discount';
  description: string | null;
}

/** A free/bonus item granted by a promotion. */
export interface AppliedFreeItem {
  itemCode: string;
  itemUnit: string | null;
  quotNo: number;
  rcrdNo: number;
  freeQty: number;
  /** True when the free item is the SAME item as the trigger. */
  sameItem: boolean;
  description: string | null;
}

export interface PromotionResult {
  lineDiscounts: AppliedLineDiscount[];
  freeItems: AppliedFreeItem[];
  /** Total monetary discount from all promotions (sum of lineDiscounts). */
  totalDiscount: number;
  /** QUOT_NOs that fired (for audit / display). */
  appliedPromoNos: number[];
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

const EPS = 0.0001;

/**
 * PromotionsEngine — pure, deterministic evaluation of the active promotions
 * against a cart. No I/O; the caller supplies the active promotions (from the
 * repository) and the cart lines (already server-priced).
 *
 * Supported mechanisms (proof: derived from live IAS_QUT_PRM_MST/DTL data):
 *   • Quantity tier (prmType 2, per item): qty within [fQty,tQty] →
 *       - if levPrice > 0 and < unitPrice → charge levPrice (discount = diff).
 *       - else if discType set → percentage / fixed-per-unit discount.
 *   • Invoice-amount discount (byInvoiceAmount): bill gross within [fAmt,tAmt]
 *     → discType/discAmtPer applied to the whole bill (spread on one synthetic
 *     entry keyed by the promo, itemCode='' ).
 *   • Buy X get Y free (prmType 1, per item): floor(qty / compQty) * freeQty
 *     free units of the same item (qtItemCode null) or of qtItemCode.
 *       - if freeQtyAsDiscount → express as an equivalent discount on the
 *         trigger line instead of a free line (Onyx APPRVD_FREEQTY_AS_DSCNT).
 *
 * Guards: one discount per line (best/highest wins to avoid double-dipping);
 * discounts never exceed the line gross; quantities/prices must be positive.
 */
export class PromotionsEngine {
  /**
   * @param promos     active promotions (already filtered by date/POS flag)
   * @param cart       server-priced cart lines
   * @param billGross  Σ qty*price (used for invoice-amount promos)
   */
  evaluate(
    promos: PromotionMaster[],
    cart: EngineCartLine[],
    billGross: number,
  ): PromotionResult {
    const lineDiscounts: AppliedLineDiscount[] = [];
    const freeItems: AppliedFreeItem[] = [];
    const appliedPromoNos = new Set<number>();

    // Best discount per cart item (avoid stacking multiple promos on one line).
    const bestDiscountByItem = new Map<string, AppliedLineDiscount>();

    // Index the cart by item code (sum qty per code — one line per code in our
    // cart store, but be defensive).
    const cartByCode = new Map<string, EngineCartLine>();
    for (const l of cart) {
      if (!(l.qty > 0) || !(l.unitPrice >= 0)) continue;
      const prev = cartByCode.get(l.itemCode);
      if (prev) {
        prev.qty = round4(prev.qty + l.qty);
      } else {
        cartByCode.set(l.itemCode, { ...l });
      }
    }

    for (const promo of promos) {
      for (const rule of promo.lines) {
        // ---- Invoice-amount discount (whole bill) ----
        if (promo.byInvoiceAmount && rule.iCode == null) {
          const disc = this.invoiceDiscount(promo, rule, billGross);
          if (disc && disc.discountAmount > EPS) {
            lineDiscounts.push(disc);
            appliedPromoNos.add(promo.quotNo);
          }
          continue;
        }

        if (!rule.iCode) continue;
        const line = cartByCode.get(rule.iCode);
        if (!line) continue;
        // Unit filter: if the rule pins a unit, it must match the cart line.
        if (rule.itemUnit && line.itemUnit && rule.itemUnit !== line.itemUnit) {
          continue;
        }

        if (promo.prmType === 1) {
          // ---- Buy X get Y free ----
          this.applyBuyXGetY(
            promo,
            rule,
            line,
            cartByCode,
            freeItems,
            bestDiscountByItem,
            appliedPromoNos,
          );
        } else {
          // ---- Quantity/amount tier (special price or discount) ----
          const disc = this.tierDiscount(promo, rule, line);
          if (disc && disc.discountAmount > EPS) {
            this.keepBest(bestDiscountByItem, disc);
            appliedPromoNos.add(promo.quotNo);
          }
        }
      }
    }

    for (const d of bestDiscountByItem.values()) lineDiscounts.push(d);

    const totalDiscount = round2(
      lineDiscounts.reduce((a, d) => a + d.discountAmount, 0),
    );

    return {
      lineDiscounts,
      freeItems,
      totalDiscount,
      appliedPromoNos: [...appliedPromoNos].sort((a, b) => a - b),
    };
  }

  private keepBest(
    map: Map<string, AppliedLineDiscount>,
    disc: AppliedLineDiscount,
  ): void {
    const cur = map.get(disc.itemCode);
    if (!cur || disc.discountAmount > cur.discountAmount) {
      map.set(disc.itemCode, disc);
    }
  }

  /** Quantity/amount tier discount for one item line (prmType 2). */
  private tierDiscount(
    promo: PromotionMaster,
    rule: PromotionLine,
    line: EngineCartLine,
  ): AppliedLineDiscount | null {
    // Quantity window (F_QTY..T_QTY). Both null → applies to any qty.
    if (rule.fQty != null && line.qty < rule.fQty - EPS) return null;
    if (rule.tQty != null && line.qty > rule.tQty + EPS) return null;

    const gross = round4(line.unitPrice * line.qty);

    // (a) Promotional unit price (LEV_PRICE) — only if it is a real discount.
    if (
      rule.levPrice != null &&
      rule.levPrice > 0 &&
      rule.levPrice < line.unitPrice - EPS
    ) {
      const discountAmount = round2((line.unitPrice - rule.levPrice) * line.qty);
      return {
        itemCode: line.itemCode,
        quotNo: rule.quotNo,
        rcrdNo: rule.rcrdNo,
        discountAmount: Math.min(discountAmount, gross),
        kind: 'tier-price',
        description: promo.desc,
      };
    }

    // (b) DISC_TYPE / DISC_AMT_PER.
    const raw = this.discountFromType(rule, gross, line.unitPrice, line.qty);
    if (raw > EPS) {
      return {
        itemCode: line.itemCode,
        quotNo: rule.quotNo,
        rcrdNo: rule.rcrdNo,
        discountAmount: Math.min(round2(raw), gross),
        kind: 'tier-discount',
        description: promo.desc,
      };
    }
    return null;
  }

  /** Whole-bill discount when gross within [fAmt,tAmt] (byInvoiceAmount). */
  private invoiceDiscount(
    promo: PromotionMaster,
    rule: PromotionLine,
    billGross: number,
  ): AppliedLineDiscount | null {
    if (rule.fAmt != null && billGross < rule.fAmt - EPS) return null;
    if (rule.tAmt != null && billGross > rule.tAmt + EPS) return null;
    const raw = this.discountFromType(rule, billGross, billGross, 1);
    if (raw <= EPS) return null;
    return {
      itemCode: '', // whole bill
      quotNo: rule.quotNo,
      rcrdNo: rule.rcrdNo,
      discountAmount: Math.min(round2(raw), round2(billGross)),
      kind: 'invoice-discount',
      description: promo.desc,
    };
  }

  /**
   * DISC_TYPE resolution:
   *   1 → percentage of the base (discAmtPer %).
   *   2 → fixed amount per unit (discAmtPer * qty).
   *   else → fixed absolute amount (discAmtPer).
   */
  private discountFromType(
    rule: PromotionLine,
    gross: number,
    _unitPrice: number,
    qty: number,
  ): number {
    const amt = rule.discAmtPer ?? 0;
    if (!(amt > 0)) return 0;
    if (rule.discType === 1) {
      return round4((gross * amt) / 100);
    }
    if (rule.discType === 2) {
      return round4(amt * qty);
    }
    // No explicit type → treat DISC_AMT_PER as a flat absolute discount.
    return round4(amt);
  }

  /** Buy `compQty` get `freeQty` (same or bonus item), prmType 1. */
  private applyBuyXGetY(
    promo: PromotionMaster,
    rule: PromotionLine,
    line: EngineCartLine,
    cartByCode: Map<string, EngineCartLine>,
    freeItems: AppliedFreeItem[],
    bestDiscountByItem: Map<string, AppliedLineDiscount>,
    appliedPromoNos: Set<number>,
  ): void {
    const comp = rule.compQty ?? 0;
    // The unit bonus qty: prefer FREE_QTY, else QT_QTY, else default 1.
    const perTriggerFree = rule.freeQty ?? rule.qtQty ?? 0;
    if (!(comp > 0) || !(perTriggerFree > 0)) return;

    const triggers = Math.floor((line.qty + EPS) / comp);
    if (triggers <= 0) return;

    const grantedQty = round4(triggers * perTriggerFree);
    if (!(grantedQty > 0)) return;

    const sameItem = !rule.qtItemCode || rule.qtItemCode === rule.iCode;
    const bonusCode = sameItem ? line.itemCode : rule.qtItemCode!;

    if (promo.freeQtyAsDiscount && sameItem) {
      // Express as a discount on the trigger line (free units valued at price).
      const discountAmount = round2(grantedQty * line.unitPrice);
      const gross = round4(line.unitPrice * line.qty);
      this.keepBest(bestDiscountByItem, {
        itemCode: line.itemCode,
        quotNo: rule.quotNo,
        rcrdNo: rule.rcrdNo,
        discountAmount: Math.min(discountAmount, gross),
        kind: 'free-as-discount',
        description: promo.desc,
      });
      appliedPromoNos.add(promo.quotNo);
      return;
    }

    freeItems.push({
      itemCode: bonusCode,
      itemUnit: rule.qtItemUnit ?? rule.itemUnit ?? line.itemUnit ?? null,
      quotNo: rule.quotNo,
      rcrdNo: rule.rcrdNo,
      freeQty: grantedQty,
      sameItem,
      description: promo.desc,
    });
    appliedPromoNos.add(promo.quotNo);
  }
}
