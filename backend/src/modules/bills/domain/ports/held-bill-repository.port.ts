export const HELD_BILL_REPOSITORY = Symbol('HELD_BILL_REPOSITORY');

/** A parked sale line (faithful cart snapshot, re-priced on resume if needed). */
export interface HeldBillLine {
  itemCode: string;
  qty: number;
  unitPrice?: number | null;
  discDtl?: number | null;
  freeQty?: number | null;
  vatPercent?: number | null;
  itemName?: string | null;
}

/** Full persisted held (hung) bill. */
export interface PersistedHeldBill {
  id: string;
  holdNo: number;
  label: string | null;
  shiftId: string;
  cashierNo: number;
  machineNo: number | null;
  customerCode: string | null;
  customerName: string | null;
  currency: string;
  taxCalcType: number;
  headerDiscount: number;
  lineCount: number;
  estNetAmt: number;
  lines: HeldBillLine[];
  status: 'HELD' | 'RESUMED' | 'CANCELLED';
  idempotencyKey: string;
  clientOpId: string | null;
  resumedBillId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Header + snapshot values to insert. */
export interface InsertHeldBillInput {
  label: string | null;
  shiftId: string;
  cashierNo: number;
  machineNo: number | null;
  customerCode: string | null;
  customerName: string | null;
  currency: string;
  taxCalcType: number;
  headerDiscount: number;
  estNetAmt: number;
  lines: HeldBillLine[];
  idempotencyKey: string;
  clientOpId: string | null;
}

export interface HeldBillWriteRepository {
  /** Replay lookup by idempotency key (or null). */
  findByIdempotencyKey(key: string): Promise<PersistedHeldBill | null>;

  /** Fetch a held bill by id (any status), or null. */
  findById(id: string): Promise<PersistedHeldBill | null>;

  /** List HELD bills for a cashier (newest first). */
  listHeld(cashierNo: number): Promise<PersistedHeldBill[]>;

  /** Persist a new HELD bill snapshot. Throws on idempotency UNIQUE collision. */
  insert(input: InsertHeldBillInput): Promise<PersistedHeldBill>;

  /** Mark a HELD bill as RESUMED (linking the produced BILLS.ID). Idempotent-safe. */
  markResumed(id: string, resumedBillId: string): Promise<void>;
}

/** Sentinel error thrown by insert on idempotency UNIQUE collision. */
export class HeldIdempotencyUniqueViolation extends Error {
  constructor() {
    super('held-bill idempotency key already exists');
    this.name = 'HeldIdempotencyUniqueViolation';
  }
}
