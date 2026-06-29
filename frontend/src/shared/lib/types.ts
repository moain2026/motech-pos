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

// ---- Shifts ----
export interface CurrentShift {
  // Shape depends on backend; kept loose because current dataset returns 409.
  shiftSrl?: number;
  cashierNo?: number;
  openDate?: string;
  openingBalance?: number;
  [key: string]: unknown;
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
