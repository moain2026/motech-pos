export const BILL_WRITE_REPOSITORY = Symbol('BILL_WRITE_REPOSITORY');

/** A persisted bill line (snapshot of the computed line). */
export interface PersistedBillLine {
  lineNo: number;
  itemCode: string;
  itemName: string | null;
  qty: number;
  freeQty: number;
  unitPrice: number;
  discDtl: number;
  discMst: number;
  vatPercent: number;
  lineGross: number;
  lineDiscount: number;
  lineVat: number;
  lineNet: number;
  itemUnit: string | null;
}

/** A persisted payment line. */
export interface PersistedPayment {
  id: string;
  method: 'CASH' | 'CARD' | 'CREDIT';
  currency: string;
  amount: number;
  rate: number;
  amountInBill: number;
  cardNo: string | null;
  customerCode: string | null;
  createdAt: string;
}

/** Full persisted bill (header + lines + payments). */
export interface PersistedBill {
  id: string;
  billNo: string;
  shiftId: string;
  cashierNo: number;
  machineNo: number | null;
  billType: number;
  customerCode: string | null;
  customerName: string | null;
  currency: string;
  taxCalcType: number;
  grossAmt: number;
  discountAmt: number;
  vatAmt: number;
  netAmt: number;
  paidAmt: number;
  status: string;
  idempotencyKey: string;
  clientOpId: string | null;
  issuedAt: string;
  createdAt: string;
  lines: PersistedBillLine[];
  payments: PersistedPayment[];
}

/** Header values to insert (totals already computed by the domain). */
export interface InsertBillInput {
  shiftId: string;
  cashierNo: number;
  machineNo: number | null;
  billType: number;
  customerCode: string | null;
  customerName: string | null;
  currency: string;
  taxCalcType: number;
  grossAmt: number;
  discountAmt: number;
  vatAmt: number;
  netAmt: number;
  idempotencyKey: string;
  clientOpId: string | null;
  lines: PersistedBillLine[];
}

export interface AddPaymentInput {
  billId: string;
  shiftId: string;
  method: 'CASH' | 'CARD' | 'CREDIT';
  currency: string;
  amount: number;
  rate: number;
  cardNo?: string | null;
  customerCode?: string | null;
}

export interface BillWriteRepository {
  /** Look up a previously posted bill by idempotency key (replay), or null. */
  findByIdempotencyKey(key: string): Promise<PersistedBill | null>;

  /** Fetch a full bill (header+lines+payments) by id, or null. */
  findById(id: string): Promise<PersistedBill | null>;

  /**
   * Atomically insert a bill header + its lines, generating a safe BILL_NO.
   * Returns the persisted bill. Throws on idempotency UNIQUE violation so the
   * caller can fall back to replay.
   */
  insertBill(input: InsertBillInput): Promise<PersistedBill>;

  /** Append a payment to an existing posted bill, updating PAID_AMT. */
  addPayment(input: AddPaymentInput): Promise<PersistedBill>;
}

/** Sentinel error thrown by insertBill on idempotency UNIQUE collision. */
export class IdempotencyUniqueViolation extends Error {
  constructor() {
    super('idempotency key already exists');
    this.name = 'IdempotencyUniqueViolation';
  }
}
