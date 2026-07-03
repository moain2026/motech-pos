/** DI token for the read-only CardsRepository port (IAS202623 master). */
export const CARDS_REPOSITORY = Symbol('CARDS_REPOSITORY');

/** One credit-/debit-card payment type (POSI007/POSI012). */
export interface CardTypeRow {
  cardNo: number;
  cardName: string | null; // Arabic name
  cardEName: string | null; // English name
  commissionPct: number; // COMM_PER
  cardType: number | null; // grouping code (CR_CARD_TYPE)
  bankNo: number | null;
}

/** One coupon document header (IAS_CPN_MST). */
export interface CouponRow {
  docNo: number;
  docDate: string | null; // YYYY-MM-DD
  couponTypeNo: number | null;
  couponCount: number;
  bookNo: string | null;
  fromCoupon: string | null;
  toCoupon: string | null;
  description: string | null;
}

/** A resolvable coupon (number inside an IAS_CPN_MST book range). */
export interface ResolvedCoupon {
  docNo: number;
  couponNo: string;
  /** Face value of one coupon (BOOK_I_PRICE), or null when not priced. */
  value: number | null;
  bookNo: string | null;
  description: string | null;
}

/**
 * CardsRepository — READ-ONLY reads over the IAS202623 master schema for
 * payment-card types (CREDIT_CARD_TYPES) and coupon documents (IAS_CPN_MST).
 * Served through the least-privilege MOTECH_RO connection. No mutations.
 */
export interface CardsRepository {
  /** Payment-card types configured in the ERP. */
  listCardTypes(): Promise<CardTypeRow[]>;

  /** Coupon document headers (returns [] when none exist). */
  listCoupons(limit: number): Promise<CouponRow[]>;

  /**
   * Resolve a coupon number against IAS_CPN_MST (number within the book's
   * F_CPN_NO..T_CPN_NO range). Returns null when no matching document exists
   * (the table is EMPTY in this environment — null is the normal outcome).
   */
  findCoupon(couponNo: string): Promise<ResolvedCoupon | null>;
}
