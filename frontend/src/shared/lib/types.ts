/**
 * API contract types — mirror the real backend responses (proof-verified
 * against live :3100 on 2026-06-29). Do NOT invent fields the API does not return.
 */

/** Standard success envelope: { data, meta? } */
export interface ApiEnvelope<T> {
  data: T;
  meta?: ListMeta;
}

export interface ListMeta {
  count: number;
  /** Cursor for the next page (null/absent when no more). */
  nextCursor?: string | null;
}

/** RFC 9457 Problem Details (application/problem+json). */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  traceId?: string;
  [key: string]: unknown;
}

// ---- Auth ----
export type Role = 'cashier' | 'supervisor' | 'admin';

export interface AuthUser {
  id: number;
  username: string;
  role: Role;
  displayName: string;
  branchNo: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// ---- Catalog ----
/** Item summary as returned by GET /items. `name` is frequently null in the
 *  current dataset (known data constraint) — UI falls back to code/barcode. */
export interface Item {
  code: string;
  name: string | null;
  barcode: string | null;
  unit: string | null;
  packSize: number;
  lastPrice: number;
}

export interface ItemStockRow {
  warehouseCode: number;
  availableQty: number;
}

export interface ItemDetail extends Item {
  totalAvailableQty: number;
  stock: ItemStockRow[];
}



// ---- Bills ----
export interface BillSummary {
  billNo: string;
  billDate: string;
  billTime: string;
  billType: number;
  billAmt: number;
  vatAmt: number;
  discAmt: number;
  cName: string | null;
  machineNo: number;
  lineCount: number;
}

export interface BillLine {
  iCode: string;
  qty: number;
  freeQty: number;
  price: number;
  discount: number;
  vat: number;
  net: number;
  itmUnit: string | null;
}

export interface BillTotals {
  gross: number;
  discount: number;
  vat: number;
  net: number;
}

export interface BillDetail {
  billNo: string;
  billDate: string;
  billType: number;
  customer: { code: string | null; name: string | null };
  machineNo: number;
  lines: BillLine[];
  totals: BillTotals;
  stored: { billAmt: number; vatAmt: number; discAmt: number; payedAmt: number };
}

// ---- Reports ----
export interface DailySummaryRow {
  day: string;
  billCount: number;
  totalAmt: number;
  totalVat: number;
  totalDisc: number;
}

// ---- Shifts (write path) — proof-verified against live :3100 2026-06-29 ----
export type ShiftStatus = 'OPEN' | 'CLOSED';

/** Open work shift (MOTECH_POS.SHIFTS). Returned by /shifts/open,
 *  /shifts/current, /shifts/{id}/close. */
export interface Shift {
  id: string;
  shiftNo: number;
  shiftCode: string;
  cashierNo: number;
  machineNo: number;
  openingBalance: number;
  currency: string;
  status: ShiftStatus;
  openedAt: string;
  closedAt: string | null;
  closingBalance: number | null;
  expectedCash: number | null;
  cashDifference: number | null;
  closeNote: string | null;
}

/** POST /shifts/open body. Only cashierNo is strictly required. */
export interface OpenShiftDto {
  cashierNo: number;
  shiftCode?: string;
  machineNo?: number;
  openingBalance?: number;
  currency?: string;
}

/** POST /shifts/{id}/close body. */
export interface CloseShiftDto {
  closingBalance?: number;
  closeNote?: string;
}

// ---- Bills (write path) ----
export type PaymentMethod = 'CASH' | 'CARD' | 'CREDIT';

/** POST /bills line (request). itemCode + qty required; price/vat optional
 *  overrides (else backend uses reference price). */
export interface PostBillLineDto {
  itemCode: string;
  qty: number;
  unitPrice?: number;
  discDtl?: number;
  freeQty?: number;
  vatPercent?: number;
}

/** POST /bills body. Requires open shift for cashierNo + Idempotency-Key hdr. */
export interface PostBillDto {
  cashierNo: number;
  machineNo?: number;
  customerCode?: string;
  customerName?: string;
  currency?: string;
  /** 1 = on price, 2 = after discount. */
  taxCalcType?: 1 | 2;
  headerDiscount?: number;
  clientOperationId?: string;
  lines: PostBillLineDto[];
}

/** POST /bills/{id}/payments body. */
export interface AddPaymentDto {
  method: PaymentMethod;
  amount: number;
  currency?: string;
  rate?: number;
  cardNo?: string;
  customerCode?: string;
}

/** A posted-bill line as returned by POST /bills + /bills/posted/{id}.
 *  itemName is null on the bill response — the cart carries the name. */
export interface PostedBillLine {
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

export interface PostedBillPayment {
  method: PaymentMethod;
  amount: number;
  currency: string;
  rate?: number;
}

/** Full posted bill (MOTECH_POS) returned by POST /bills, payments, posted/{id}. */
export interface PostedBill {
  id: string;
  billNo: string;
  shiftId: string;
  cashierNo: number;
  machineNo: number;
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
  lines: PostedBillLine[];
  payments: PostedBillPayment[];
}
