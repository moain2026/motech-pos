export const PROMOTIONS_REPOSITORY = Symbol('PROMOTIONS_REPOSITORY');

/**
 * A promotion header (IAS_QUT_PRM_MST) that is active for the POS system today.
 * Only the fields the engine actually needs are surfaced (proof: DDL verified
 * live against IAS202623.IAS_QUT_PRM_MST — 138 columns, see PROGRESS Lane E).
 */
export interface PromotionMaster {
  quotNo: number;
  quotSer: number;
  /**
   * QT_PRM_TYPE — the promotion mechanism:
   *   1 = quantity threshold → free quantity / bonus item ("buy X get Y").
   *   2 = quantity/amount tier → special unit price or discount.
   * (Verified from live data: QUOT 2 is type 1 buy-X, QUOT 1 is type 2 tier.)
   */
  prmType: number;
  /** QT_PRM_METHOD — sub-method inside the type (kept for future group promos). */
  prmMethod: number | null;
  fromDate: string; // YYYY-MM-DD
  toDate: string; // YYYY-MM-DD
  fromTime: string | null; // HH24:MI (or null = all day)
  toTime: string | null;
  desc: string | null;
  /** BY_INVC_AMT_FLG — promo triggered by whole-bill amount (F_AMT..T_AMT). */
  byInvoiceAmount: boolean;
  /** APPRVD_FREEQTY_AS_DSCNT — express the free qty as an equivalent discount. */
  freeQtyAsDiscount: boolean;
  lines: PromotionLine[];
}

/**
 * A promotion detail line (IAS_QUT_PRM_DTL). One rule bound to an item (or the
 * whole bill when byInvoiceAmount). Discount / free-qty semantics:
 *
 *   - Quantity tier (type 2): if qty in [fQty, tQty] → charge `levPrice` as the
 *     promotional unit price (when > 0), OR apply DISC_TYPE/DISC_AMT_PER.
 *   - Buy X get Y (type 1): buy `compQty` of iCode → get `freeQty` free of the
 *     same item (qtItemCode null) or of `qtItemCode`.
 *   - DISC_TYPE: 1 = percentage (DISC_AMT_PER is %), 2 = fixed amount per unit.
 */
export interface PromotionLine {
  quotNo: number;
  rcrdNo: number;
  iCode: string | null;
  itemUnit: string | null;
  fQty: number | null;
  tQty: number | null;
  fAmt: number | null;
  tAmt: number | null;
  discType: number | null; // 1 = percent, 2 = fixed/unit
  discAmtPer: number | null; // the % or fixed amount
  levPrice: number | null; // promotional unit price (tier)
  qtItemCode: string | null; // free/bonus item (null = same item)
  qtItemUnit: string | null;
  freeQty: number | null; // qty given free
  compQty: number | null; // qty that must be bought to trigger (buy X)
  qtQty: number | null; // qty of the bonus item per trigger
}

/** A rule to persist in the LOCAL overlay (MOTECH_POS.PROMO_DTL). */
export interface LocalPromotionLineInput {
  iCode?: string | null;
  itemUnit?: string | null;
  fQty?: number | null;
  tQty?: number | null;
  fAmt?: number | null;
  tAmt?: number | null;
  discType?: number | null;
  discAmtPer?: number | null;
  levPrice?: number | null;
  qtItemCode?: string | null;
  qtItemUnit?: string | null;
  freeQty?: number | null;
  compQty?: number | null;
  qtQty?: number | null;
}

/** A local promotion to create in the overlay. */
export interface CreateLocalPromotionInput {
  description?: string | null;
  prmType: number; // 1 = buy-X, 2 = tier
  prmMethod?: number | null;
  fromDate: string; // YYYY-MM-DD
  toDate: string;
  fromTime?: string | null;
  toTime?: string | null;
  dowMask?: string | null; // '1,2,3' or null = every day
  byInvoiceAmount?: boolean;
  freeQtyAsDiscount?: boolean;
  createdBy?: string | null;
  lines: LocalPromotionLineInput[];
}

/** A stored local promotion (overlay), origin flag for the UI. */
export interface LocalPromotion extends PromotionMaster {
  inactive: boolean;
  origin: 'LOCAL';
}

export interface PromotionsRepository {
  /**
   * All promotions active for the POS system on `onDate` (INACTIVE=0,
   * USE_QTN_PRM_IN_POS_SYS_FLG=1, APPROVED<>0, date/time window + day-of-week),
   * with their detail lines. ERP catalog is read-only + LOCAL overlay merged.
   */
  activePromotions(onDate: Date): Promise<PromotionMaster[]>;

  /** One promotion (header + lines) by QUOT_NO regardless of active state. */
  findByQuotNo(quotNo: number): Promise<PromotionMaster | null>;

  // ----- LOCAL overlay CRUD (MOTECH_POS.PROMO_MST/_DTL) -----

  /** All LOCAL overlay promotions (any state). */
  listLocal(): Promise<LocalPromotion[]>;

  /** Create a LOCAL promotion (assigns a QUOT_NO from SEQ_LOCAL_PROMO_NO). */
  createLocal(input: CreateLocalPromotionInput): Promise<LocalPromotion>;

  /** Activate/deactivate a LOCAL promotion by QUOT_NO. */
  setLocalStatus(quotNo: number, inactive: boolean): Promise<LocalPromotion | null>;

  /** Delete a LOCAL promotion (+ its lines) by QUOT_NO. */
  deleteLocal(quotNo: number): Promise<boolean>;
}
