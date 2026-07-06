export const VOUCHER_REPOSITORY = Symbol('VOUCHER_REPOSITORY');

/** Full persisted voucher (MOTECH_POS.VOUCHERS). */
export interface PersistedVoucher {
  id: string;
  voucherNo: string;
  type: 'RECEIPT' | 'EXPENSE';
  shiftId: string | null;
  cashierNo: number;
  machineNo: number | null;
  amount: number;
  currency: string;
  rate: number;
  amountInShift: number;
  paymentMethod: 'CASH' | 'CARD' | 'BANK';
  description: string | null;
  partyName: string | null;
  category: string | null;
  status: string;
  idempotencyKey: string;
  clientOpId: string | null;
  /** POST006: the MOTECH_POS return this refund voucher pays out (or null). */
  refundReturnId: string | null;
  issuedAt: string;
  createdAt: string;
}

/** Values to insert (amountInShift already computed by the domain). */
export interface InsertVoucherInput {
  type: 'RECEIPT' | 'EXPENSE';
  shiftId: string | null;
  cashierNo: number;
  machineNo: number | null;
  amount: number;
  currency: string;
  rate: number;
  amountInShift: number;
  paymentMethod: 'CASH' | 'CARD' | 'BANK';
  description: string | null;
  partyName: string | null;
  category: string | null;
  idempotencyKey: string;
  clientOpId: string | null;
  /** POST006: link a refund voucher to its return (idempotent 1:1). */
  refundReturnId?: string | null;
}

/** Filter for listing vouchers. */
export interface VoucherListFilter {
  shiftId?: string;
  type?: 'RECEIPT' | 'EXPENSE';
  cashierNo?: number;
  from?: string;
  to?: string;
  limit: number;
}

/** Cash totals for a shift (receipts / expenses / net cash effect). */
export interface VoucherShiftTotals {
  cashReceipts: number;
  cashExpenses: number;
  netCashEffect: number;
  receiptCount: number;
  expenseCount: number;
}

export interface VoucherRepository {
  /** Look up by idempotency key (replay), or null. */
  findByIdempotencyKey(key: string): Promise<PersistedVoucher | null>;

  /** POST006: look up the refund voucher for a return, or null (idempotency). */
  findByRefundReturnId(returnId: string): Promise<PersistedVoucher | null>;

  /** Fetch by id, or null. */
  findById(id: string): Promise<PersistedVoucher | null>;

  /** Atomically insert a voucher with a safe VOUCHER_NO. */
  insertVoucher(input: InsertVoucherInput): Promise<PersistedVoucher>;

  /** List vouchers (newest first) matching the filter. */
  list(filter: VoucherListFilter): Promise<PersistedVoucher[]>;

  /**
   * Cash totals for a shift — CASH receipts and CASH expenses in shift currency.
   * Feeds the shift-close reconciliation (expected cash).
   */
  shiftCashTotals(shiftId: string): Promise<VoucherShiftTotals>;
}

/** Sentinel error thrown by insertVoucher on idempotency UNIQUE collision. */
export class VoucherIdempotencyUniqueViolation extends Error {
  constructor() {
    super('idempotency key already exists');
    this.name = 'VoucherIdempotencyUniqueViolation';
  }
}

/** Sentinel error thrown when the UX_VOUCHERS_REFUND_RET UNIQUE index fires. */
export class RefundReturnUniqueViolation extends Error {
  constructor() {
    super('a refund voucher already exists for this return');
    this.name = 'RefundReturnUniqueViolation';
  }
}
