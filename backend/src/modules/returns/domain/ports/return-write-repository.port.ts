export const RETURN_WRITE_REPOSITORY = Symbol('RETURN_WRITE_REPOSITORY');

/** A persisted return line (snapshot of the computed reversal line). */
export interface PersistedReturnLine {
  lineNo: number;
  itemCode: string;
  itemName: string | null;
  qty: number;
  unitPrice: number;
  discDtl: number;
  discMst: number;
  vatPercent: number;
  lineGross: number;
  lineDiscount: number;
  lineVat: number;
  lineNet: number;
  replaceAmount: number;
  itemUnit: string | null;
}

/** Full persisted return (header + lines) from MOTECH_POS. */
export interface PersistedReturn {
  id: string;
  rtBillNo: string;
  originalBillNo: string;
  originalBillId: string | null;
  shiftId: string | null;
  cashierNo: number;
  machineNo: number | null;
  returnType: number;
  customerCode: string | null;
  customerName: string | null;
  currency: string;
  taxCalcType: number;
  grossAmt: number;
  discountAmt: number;
  vatAmt: number;
  netAmt: number;
  refundAmt: number;
  status: string;
  idempotencyKey: string;
  clientOpId: string | null;
  issuedAt: string;
  createdAt: string;
  lines: PersistedReturnLine[];
}

/** Header values to insert (totals already computed by the domain). */
export interface InsertReturnInput {
  originalBillNo: string;
  originalBillId: string | null;
  shiftId: string | null;
  cashierNo: number;
  machineNo: number | null;
  returnType: number;
  customerCode: string | null;
  customerName: string | null;
  currency: string;
  taxCalcType: number;
  grossAmt: number;
  discountAmt: number;
  vatAmt: number;
  netAmt: number;
  refundAmt: number;
  idempotencyKey: string;
  clientOpId: string | null;
  lines: PersistedReturnLine[];
}

/** Already-returned quantity per item for a given original bill (over-return guard). */
export interface ReturnedQtyRow {
  itemCode: string;
  qtyReturned: number;
}

export interface ReturnWriteRepository {
  /** Look up a previously created return by idempotency key (replay), or null. */
  findByIdempotencyKey(key: string): Promise<PersistedReturn | null>;

  /** Fetch a full return (header+lines) by id, or null. */
  findById(id: string): Promise<PersistedReturn | null>;

  /**
   * Sum of already-returned qty per item, across ALL returns of an original
   * bill that we wrote into MOTECH_POS. Used to prevent over-returning.
   */
  returnedQtyForOriginal(originalBillNo: string): Promise<ReturnedQtyRow[]>;

  /**
   * Atomically insert a return header + its lines, generating a safe RT_BILL_NO.
   * Throws IdempotencyUniqueViolation on idempotency UNIQUE collision.
   */
  insertReturn(input: InsertReturnInput): Promise<PersistedReturn>;
}

/** Sentinel error thrown by insertReturn on idempotency UNIQUE collision. */
export class ReturnIdempotencyUniqueViolation extends Error {
  constructor() {
    super('idempotency key already exists');
    this.name = 'ReturnIdempotencyUniqueViolation';
  }
}
