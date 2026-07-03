export const CREDIT_COLLECTIONS_REPOSITORY = Symbol(
  'CREDIT_COLLECTIONS_REPOSITORY',
);

/**
 * One credit (آجل) bill of a customer with its collection state (POST010/011).
 * creditAmt = what was tendered as CREDIT on the bill; collectedAmt = receipts
 * recorded later in CREDIT_COLLECTIONS; outstanding = the remaining debt.
 */
export interface CreditBillRow {
  billId: string;
  billNo: string;
  issuedAt: string;
  currency: string;
  netAmt: number;
  /** Total tendered as CREDIT on this bill (the debt principal). */
  creditAmt: number;
  /** Total collected against this bill so far. */
  collectedAmt: number;
  /** Remaining debt (creditAmt − collectedAmt, >= 0). */
  outstanding: number;
  /** OPEN while outstanding > 0, SETTLED once fully collected. */
  status: 'OPEN' | 'SETTLED';
}

/** One recorded collection receipt. */
export interface CollectionRow {
  id: string;
  billId: string;
  customerCode: string;
  method: 'CASH' | 'CARD';
  currency: string;
  amount: number;
  rate: number;
  amountInBill: number;
  cashierNo: number | null;
  note: string | null;
  idempotencyKey: string;
  createdAt: string;
}

export interface InsertCollectionInput {
  billId: string;
  customerCode: string;
  method: 'CASH' | 'CARD';
  currency: string;
  amount: number;
  rate: number;
  amountInBill: number;
  cashierNo: number | null;
  note: string | null;
  idempotencyKey: string;
}

export interface CreditCollectionsRepository {
  /**
   * Credit bills of a customer with per-bill collected/outstanding amounts.
   * When `openOnly` is true only bills with outstanding > 0 are returned.
   */
  creditBills(customerCode: string, openOnly: boolean): Promise<CreditBillRow[]>;

  /** A single credit bill (by bill id) with its collection state, or null. */
  creditBill(customerCode: string, billId: string): Promise<CreditBillRow | null>;

  /** Look up a previous collection by idempotency key (replay), or null. */
  findByIdempotencyKey(key: string): Promise<CollectionRow | null>;

  /** Insert a collection receipt (MOTECH_POS.CREDIT_COLLECTIONS). */
  insertCollection(input: InsertCollectionInput): Promise<CollectionRow>;
}
