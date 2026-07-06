export const SHIFT_REPOSITORY = Symbol('SHIFT_REPOSITORY');

/** Open shift as read from YSPOS23 (legacy reference, read-only). */
export interface OpenShift {
  shftSrl: string;
  shftCode: string | null;
  cshrNo: number | null;
  opnDate: string | null;
  shftDate: string | null;
}

export interface ShiftRepository {
  /**
   * Open shift for a cashier — mirrors GET_WRK_SHFT_OPN_FNC:
   *   MIN(SHFT_SRL) FROM POS_WRK_SHFT_CSHR WHERE CSHR_NO=? AND CLS_DATE IS NULL.
   * Returns null when no open shift exists.
   */
  findOpenByCashier(cshrNo: number): Promise<OpenShift | null>;
}

//==============================================================================
// WRITE side — our own MOTECH_POS.SHIFTS (separate from YSPOS23)
//==============================================================================

export const SHIFT_WRITE_REPOSITORY = Symbol('SHIFT_WRITE_REPOSITORY');

export type ShiftStatus = 'OPEN' | 'CLOSED' | 'SETTLED';

export interface ShiftRecord {
  id: string;
  shiftNo: number;
  shiftCode: string | null;
  cashierNo: number;
  machineNo: number | null;
  openingBalance: number;
  currency: string;
  status: ShiftStatus;
  openedAt: string;
  closedAt: string | null;
  closingBalance: number | null;
  expectedCash: number | null;
  cashDifference: number | null;
  closeNote: string | null;
  /** POST013 settlement: counted cash (sum of denominations) once settled. */
  countedCash: number | null;
  /** countedCash - expectedCash at settle time (over/short). */
  settleDifference: number | null;
  settledAt: string | null;
  settledBy: number | null;
  settleNote: string | null;
}

export interface OpenShiftInput {
  cashierNo: number;
  shiftCode?: string;
  machineNo?: number;
  openingBalance?: number;
  currency?: string;
}

export interface CloseShiftInput {
  shiftId: string;
  /** Counted actual cash in the drawer at close (for over/short). */
  closingBalance?: number;
  /** Expenses paid out of the drawer during the shift (reduces expected cash). */
  cashExpenses?: number;
  /**
   * CASH receipt vouchers folded into the drawer (adds to expected cash).
   * Filled by the service from the vouchers module so close() and
   * reconciliation() share the exact same expected-cash formula:
   *   expected = opening + cash sales + cash receipts - cash expenses.
   */
  cashReceipts?: number;
  closeNote?: string;
}

//==============================================================================
// POST013 — cash count by denominations + approved settlement
//==============================================================================

/** One denomination line of the counted cash (e.g. 1000 × 5). */
export interface DenominationLine {
  /** Face value of the note/coin (1000, 500, 250 …). */
  value: number;
  /** How many notes/coins of that value were counted. */
  count: number;
}

/** Persisted denomination row (value × count = amount). */
export interface ShiftDenomination {
  currency: string;
  value: number;
  count: number;
  amount: number;
}

export interface SaveShiftCountInput {
  shiftId: string;
  currency: string;
  denominations: DenominationLine[];
}

export interface SettleShiftInput {
  shiftId: string;
  expectedCash: number;
  countedCash: number;
  difference: number;
  settledBy?: number;
  note?: string;
}

/** Final settlement view (GET /shifts/:id/settlement). */
export interface ShiftSettlement {
  shiftId: string;
  shiftNo: number;
  cashierNo: number;
  currency: string;
  status: ShiftStatus;
  expectedCash: number | null;
  countedCash: number | null;
  difference: number | null;
  overShort: 'OVER' | 'SHORT' | 'BALANCED' | null;
  denominations: ShiftDenomination[];
  settledAt: string | null;
  settledBy: number | null;
  settleNote: string | null;
}

/** Aggregated cash totals for a shift (computed from PAYMENTS). */
export interface ShiftCashTotals {
  billCount: number;
  netSalesTotal: number;
  cashTotal: number;
  cardTotal: number;
  creditTotal: number;
}

/** One payment-method line in the Z-report breakdown. */
export interface PaymentMethodBreakdown {
  method: string;
  count: number;
  /** Sum in bill currency (AMOUNT_IN_BILL). */
  amountInBill: number;
  /** Per-currency detail (raw amounts before rate conversion). */
  byCurrency: Array<{ currency: string; count: number; amount: number; amountInBill: number }>;
}

/**
 * Z-report / cashier reconciliation payload (POST013/POST015 + POSR001):
 * expected vs actual cash, over/short, and a full per-method breakdown.
 */
export interface ShiftReconciliation {
  shiftId: string;
  shiftNo: number;
  cashierNo: number;
  machineNo: number | null;
  currency: string;
  status: ShiftStatus;
  openedAt: string;
  closedAt: string | null;
  openingBalance: number;
  billCount: number;
  netSalesTotal: number;
  /** expected cash = opening + cash sales + cash receipts - cash expenses. */
  cashSales: number;
  /** CASH receipt vouchers (POST025) + net custody, folded into the drawer. */
  cashReceipts: number;
  cashExpenses: number;
  /** POST014: custody deposits into the drawer during the shift. */
  custodyDeposits: number;
  /** POST014: custody withdrawals from the drawer during the shift. */
  custodyWithdrawals: number;
  expectedCash: number;
  /** actual counted cash (closingBalance); null while still OPEN and uncounted. */
  actualCash: number | null;
  /** actualCash - expectedCash (positive = over, negative = short); null if uncounted. */
  cashDifference: number | null;
  overShort: 'OVER' | 'SHORT' | 'BALANCED' | null;
  cardTotal: number;
  creditTotal: number;
  /** Grand total of all tenders in bill currency. */
  tenderTotal: number;
  breakdown: PaymentMethodBreakdown[];
}

//==============================================================================
// POST014 — cashier custody movements (deposit/withdraw during a shift)
//==============================================================================

export type CustodyDirection = 'DEPOSIT' | 'WITHDRAW';

/** A persisted custody movement (MOTECH_POS.CASHIER_CUSTODY). */
export interface CustodyMovement {
  id: string;
  custodyNo: number;
  shiftId: string;
  cashierNo: number;
  machineNo: number | null;
  direction: CustodyDirection;
  amount: number;
  currency: string;
  rate: number;
  amountInShift: number;
  reason: string | null;
  status: string;
  idempotencyKey: string;
  clientOpId: string | null;
  createdBy: string | null;
  issuedAt: string;
  createdAt: string;
}

export interface InsertCustodyInput {
  shiftId: string;
  cashierNo: number;
  machineNo: number | null;
  direction: CustodyDirection;
  amount: number;
  currency: string;
  rate: number;
  amountInShift: number;
  reason: string | null;
  idempotencyKey: string;
  clientOpId: string | null;
  createdBy: string | null;
}

/** Net custody effect on the drawer for a shift (deposits − withdrawals). */
export interface CustodyTotals {
  deposits: number;
  withdrawals: number;
  /** deposits − withdrawals (signed drawer effect). */
  net: number;
  depositCount: number;
  withdrawCount: number;
}

/** Sentinel thrown by insertCustody on the idempotency UNIQUE collision. */
export class CustodyIdempotencyUniqueViolation extends Error {
  constructor() {
    super('idempotency key already exists');
    this.name = 'CustodyIdempotencyUniqueViolation';
  }
}

//==============================================================================
// POST015 — shift settlement variance (over/short) posted record
//==============================================================================

export interface PostedVariance {
  id: string;
  varianceNo: number;
  shiftId: string;
  cashierNo: number;
  currency: string;
  expectedCash: number;
  countedCash: number;
  difference: number;
  kind: 'OVER' | 'SHORT' | 'BALANCED';
  note: string | null;
  postedBy: number | null;
  postedAt: string;
}

export interface InsertVarianceInput {
  shiftId: string;
  cashierNo: number;
  currency: string;
  expectedCash: number;
  countedCash: number;
  difference: number;
  kind: 'OVER' | 'SHORT' | 'BALANCED';
  note: string | null;
  postedBy: number | null;
}

export interface ShiftWriteRepository {
  /** The single OPEN shift for a cashier in our DB, or null. */
  findOpenByCashier(cashierNo: number): Promise<ShiftRecord | null>;

  /** Fetch a shift by id. */
  findById(id: string): Promise<ShiftRecord | null>;

  /** Open a new shift (fails if the cashier already has an open one). */
  open(input: OpenShiftInput): Promise<ShiftRecord>;

  /** Close an open shift, computing expected cash + difference. */
  close(input: CloseShiftInput): Promise<ShiftRecord>;

  /** Cash/sales totals for a shift (for close + summary). */
  cashTotals(shiftId: string): Promise<ShiftCashTotals>;

  /** Per-payment-method breakdown (method × currency) for the Z-report. */
  paymentBreakdown(shiftId: string): Promise<PaymentMethodBreakdown[]>;

  /** Replace the saved denomination count for a shift (POST013 count entry). */
  saveCount(input: SaveShiftCountInput): Promise<ShiftDenomination[]>;

  /** Saved denomination lines for a shift. */
  findDenominations(shiftId: string): Promise<ShiftDenomination[]>;

  /** Persist the approved settlement (CLOSED -> SETTLED, immutable after). */
  settle(input: SettleShiftInput): Promise<ShiftRecord>;

  //-- POST014 custody ---------------------------------------------------------
  /** Insert a custody movement (deposit/withdraw). */
  insertCustody(input: InsertCustodyInput): Promise<CustodyMovement>;
  /** Look up a custody movement by idempotency key (replay). */
  findCustodyByIdempotencyKey(key: string): Promise<CustodyMovement | null>;
  /** List custody movements for a shift (newest first). */
  listCustody(shiftId: string): Promise<CustodyMovement[]>;
  /** Net custody totals for a shift (feeds expected-cash). */
  custodyTotals(shiftId: string): Promise<CustodyTotals>;

  //-- POST015 variance --------------------------------------------------------
  /** Post the settlement variance record (one per shift, immutable). */
  insertVariance(input: InsertVarianceInput): Promise<PostedVariance>;
  /** The posted variance for a shift, or null. */
  findVariance(shiftId: string): Promise<PostedVariance | null>;
}
