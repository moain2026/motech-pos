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
  /** Low-stock threshold (GET /inventory/low-stock). */
  threshold?: number;
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
/** Item provenance: ERP (Oracle reference), LOCAL (created here), EDIT (ERP
 *  reference with a local override applied). */
export type ItemOrigin = 'ERP' | 'LOCAL' | 'EDIT';

export interface Item {
  code: string;
  name: string | null;
  barcode: string | null;
  unit: string | null;
  packSize: number;
  lastPrice: number;
  /** Present on live responses; absent on legacy cached rows. */
  origin?: ItemOrigin;
}

/** POST /items body — create a LOCAL item. Requires supervisor/admin. */
export interface CreateItemDto {
  code: string;
  name: string;
  barcode?: string;
  unit?: string;
  price: number;
  vatPercent?: number;
  inactive?: boolean;
}

/** PUT /items/{code} body — patch/override (code immutable). */
export interface UpdateItemDto {
  name?: string;
  barcode?: string;
  unit?: string;
  price?: number;
  vatPercent?: number;
  inactive?: boolean;
}

export interface ItemStockRow {
  warehouseCode: number;
  availableQty: number;
}

export interface ItemDetail extends Item {
  totalAvailableQty: number;
  stock: ItemStockRow[];
  vatPercent?: number | null;
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

/** GET /reports/monthly — one row per YYYY-MM. */
export interface MonthlySummaryRow {
  month: string;
  billCount: number;
  totalAmt: number;
  totalVat: number;
  totalDisc: number;
}

/** GET /reports/by-item — best-selling items (Arabic names). */
export interface ByItemRow {
  iCode: string;
  iName: string | null;
  totalQty: number;
  totalAmt: number;
  lineCount: number;
}

/** GET /reports/by-machine — sales per POS machine. */
export interface ByMachineRow {
  machineNo: number;
  billCount: number;
  totalAmt: number;
  totalVat: number;
  totalDisc: number;
}

/** GET /reports/by-cashier — sales & collections per cashier. */
export interface ByCashierRow {
  cashierNo: number;
  billCount: number;
  grossAmt: number;
  discountAmt: number;
  vatAmt: number;
  netAmt: number;
  cashCollected: number;
  cardCollected: number;
  creditCollected: number;
}

/** GET /reports/payment-methods — tender totals per method/currency. */
export interface PaymentMethodRow {
  method: PaymentMethod;
  currency: string;
  txnCount: number;
  amount: number;
  amountInBill: number;
}

/** GET /reports/returns — returns summary per day. */
export interface ReturnsReportRow {
  day: string;
  returnCount: number;
  grossAmt: number;
  vatAmt: number;
  netAmt: number;
  refundAmt: number;
}

// ---- Customers ----
/** GET /customers, /customers/{code}. Arabic-first names. */
export interface Customer {
  code: string;
  arName: string | null;
  enName: string | null;
  mobile: string | null;
  whatsapp: string | null;
  phone: string | null;
  inactive: boolean;
  /** ERP (Oracle reference), LOCAL (created here), EDIT (overridden). */
  origin?: ItemOrigin;
}

/** POST /customers body — create a LOCAL customer. */
export interface CreateCustomerDto {
  code: string;
  arName: string;
  enName?: string;
  mobile?: string;
  whatsapp?: string;
  phone?: string;
  inactive?: boolean;
}

/** PUT /customers/{code} body (code immutable). */
export interface UpdateCustomerDto {
  arName?: string;
  enName?: string;
  mobile?: string;
  whatsapp?: string;
  phone?: string;
  inactive?: boolean;
}

export interface CustomerPointsBalance {
  code: string;
  totalPoints: number;
  txnCount: number;
}

export interface CustomerPointsTxn {
  date?: string;
  points?: number;
  billNo?: string;
  note?: string | null;
  [key: string]: unknown;
}

export interface CustomerPoints {
  balance: CustomerPointsBalance;
  txns: CustomerPointsTxn[];
}

// ---- Returns ----
/** GET /returns — return-bill list row. */
export interface ReturnSummary {
  id: string;
  source: string;
  rtBillNo: string;
  originalBillNo: string | null;
  rtBillDate: string;
  returnType: number;
  rtBillAmt: number;
  vatAmt: number;
  discAmt: number;
  cName: string | null;
  machineNo: number;
  lineCount: number;
}

export interface ReturnLine {
  iCode: string;
  qty: number;
  price: number;
  discount: number;
  vat: number;
  net: number;
  replaceAmount?: number;
  itmUnit: string | null;
}

export interface ReturnDetail {
  rtBillNo: string;
  originalBillNo: string | null;
  rtBillDate: string;
  returnType: number;
  customer: { code: string | null; name: string | null };
  machineNo: number;
  lines: ReturnLine[];
  totals: { gross: number; discount: number; vat: number; net: number };
  stored: { rtBillAmt: number; vatAmt: number; discAmt: number; payedAmt: number };
}

/** POST /returns line. */
export interface PostReturnLineDto {
  itemCode: string;
  qty: number;
  unitPrice?: number;
  discDtl?: number;
  vatPercent?: number;
}

/** POST /returns body. Requires Idempotency-Key header (uuid). */
export interface PostReturnDto {
  cashierNo: number;
  machineNo?: number;
  originalBillNo: string;
  customerCode?: string;
  customerName?: string;
  currency?: string;
  lines: PostReturnLineDto[];
}

export interface PostedReturnLine {
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

export interface PostedReturn {
  id: string;
  rtBillNo: string;
  originalBillNo: string;
  cashierNo: number;
  machineNo: number;
  returnType: number;
  customerCode: string | null;
  customerName: string | null;
  currency: string;
  grossAmt: number;
  discountAmt: number;
  vatAmt: number;
  netAmt: number;
  refundAmt: number;
  status: string;
  idempotencyKey: string;
  issuedAt: string;
  createdAt: string;
  lines: PostedReturnLine[];
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

// ---- Held (parked) bills — wave 1, proof-verified against live :3000 ----
/** A line inside a held bill (POST /bills/hold + GET /bills/held). */
export interface HeldBillLine {
  itemCode: string;
  qty: number;
  unitPrice: number | null;
  discDtl: number | null;
  freeQty: number | null;
  vatPercent: number | null;
  itemName: string | null;
}

/** POST /bills/hold body (Idempotency-Key header mandatory). */
export interface HoldBillLineDto {
  itemCode: string;
  qty: number;
  unitPrice?: number;
  discDtl?: number;
  freeQty?: number;
  vatPercent?: number;
  itemName?: string;
}

export interface HoldBillDto {
  cashierNo: number;
  machineNo?: number;
  label?: string;
  customerCode?: string;
  customerName?: string;
  currency?: string;
  taxCalcType?: 1 | 2;
  headerDiscount?: number;
  clientOperationId?: string;
  lines: HoldBillLineDto[];
}

/** A held (parked) bill as returned by POST /bills/hold and GET /bills/held. */
export interface HeldBill {
  id: string;
  holdNo: number;
  label: string | null;
  shiftId: string;
  cashierNo: number;
  machineNo: number;
  customerCode: string | null;
  customerName: string | null;
  currency: string;
  taxCalcType: number;
  headerDiscount: number;
  lineCount: number;
  estNetAmt: number;
  lines: HeldBillLine[];
  status: string;
  idempotencyKey: string;
  clientOpId: string | null;
  resumedBillId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** POST /bills/held/{id}/resume body. Returns the produced POSTED bill. */
export interface ResumeBillDto {
  cashierNo: number;
}

/** Resume envelope: { data: { bill: PostedBill, held?: HeldBill } }. */
export interface ResumeResult {
  bill: PostedBill;
  held?: HeldBill;
}

// ---- Multi-tender payment (POST /bills/{id}/payments/multi) ----
export interface PaymentTenderDto {
  method: PaymentMethod;
  amount: number;
  currency?: string;
  rate?: number;
  cardNo?: string;
  customerCode?: string;
}

export interface AddPaymentsDto {
  tenders: PaymentTenderDto[];
}

// ---- Shift reconciliation / Z-X report (GET /shifts/{id}/reconciliation) ----
export interface ReconciliationCurrencyRow {
  currency: string;
  count: number;
  amount: number;
  amountInBill: number;
}

export interface ReconciliationMethodRow {
  method: PaymentMethod;
  count: number;
  amountInBill: number;
  byCurrency: ReconciliationCurrencyRow[];
}

export interface ShiftReconciliation {
  shiftId: string;
  shiftNo: number;
  cashierNo: number;
  machineNo: number;
  currency: string;
  status: ShiftStatus;
  openedAt: string;
  closedAt: string | null;
  openingBalance: number;
  billCount: number;
  netSalesTotal: number;
  cashSales: number;
  cashReceipts: number;
  cashExpenses: number;
  expectedCash: number;
  actualCash: number | null;
  cashDifference: number | null;
  overShort: 'OVER' | 'SHORT' | 'BALANCED';
  cardTotal: number;
  creditTotal: number;
  tenderTotal: number;
  breakdown: ReconciliationMethodRow[];
}

// ---- Vouchers (سند قبض / صرف) — POST /vouchers, GET /vouchers ----
export type VoucherType = 'RECEIPT' | 'EXPENSE';
export type VoucherMethod = 'CASH' | 'CARD' | 'BANK';

export interface Voucher {
  id: string;
  voucherNo: string;
  type: VoucherType;
  shiftId: string;
  cashierNo: number;
  machineNo: number;
  amount: number;
  currency: string;
  rate: number;
  amountInShift: number;
  paymentMethod: VoucherMethod;
  description: string | null;
  partyName: string | null;
  category: string | null;
  status: string;
  idempotencyKey: string;
  clientOpId: string | null;
  issuedAt: string;
  createdAt: string;
}

// ---- Settings (GET/PUT /settings) — proof-verified live :3000 2026-07-01 ----
export interface SettingsNumbering {
  machineDigit: number;
  userDigit: number;
  serialDigit: number;
  posBillSerial: number;
}
export interface SettingsPrinting {
  printBill: boolean;
  printBillBeforeSave: boolean;
  openDrawer: boolean;
}
export interface SettingsHungBills {
  useHungBills: boolean;
  maxHungs: number | null;
  allowPrintHungBill: boolean;
}
export interface SettingsTax {
  roundAmtFraction: number | null;
  useCheckSum: boolean;
  returnPeriod: number | null;
  changePeriod: number | null;
}
export interface SettingsPoints {
  usePosPointSys: boolean;
  pointCalcType: number | null;
}
export interface SettingsFeatures {
  useSaleOrder: boolean;
  useDiscCard: boolean;
  allowChangeBillCurr: boolean;
}
export interface SettingsDefaultRow {
  no: number;
  value: string;
  comment: string;
}

/** GET /settings → resolved effective settings (system + overrides). */
export interface Settings {
  shopName: string | null;
  currency: string | null;
  priceLevel: string | null;
  pricingType: number | null;
  billFooter: string | null;
  numbering: SettingsNumbering;
  printing: SettingsPrinting;
  hungBills: SettingsHungBills;
  tax: SettingsTax;
  points: SettingsPoints;
  features: SettingsFeatures;
  defaults: SettingsDefaultRow[];
  hasOverrides: boolean;
}

/** PUT /settings — apply local overrides by key. */
export interface SettingsOverride {
  key: string;
  value: unknown;
}
export interface UpdateSettingsDto {
  overrides: SettingsOverride[];
}

/** POST /vouchers body (Idempotency-Key header mandatory). */
export interface CreateVoucherDto {
  type: VoucherType;
  cashierNo: number;
  machineNo?: number;
  amount: number;
  currency?: string;
  rate?: number;
  paymentMethod?: VoucherMethod;
  description?: string;
  partyName?: string;
  category?: string;
  clientOperationId?: string;
}

// ===========================================================================
// Wave 5 — inventory, admin, e-invoice, sync, cards, new reports
// (proof-verified against live backend :3000, 2026-07-01)
// ===========================================================================

// ---- Inventory (GET /inventory, /inventory/low-stock, /inventory/{code}) ----
/** One item row with aggregated available quantity across warehouses. */
export interface InventoryItem {
  code: string;
  name: string | null;
  totalAvailableQty: number;
  warehouseCount: number;
}

/** Per-warehouse / per-batch stock line for a single item. */
export interface InventoryStockLine {
  warehouseCode: number;
  batchNo: string;
  expireDate: string | null;
  availableQty: number;
}

/** GET /inventory/{code} → item + per-warehouse breakdown. */
export interface InventoryDetail extends InventoryItem {
  stock: InventoryStockLine[];
}

// ---- Admin (GET /admin/machines, /admin/users, /admin/sessions) ----
export interface AdminMachine {
  machineNo: number;
  terminal: string | null;
  inactive: boolean;
  defWarehouse: number | null;
  defBranch: number | null;
  ipAddress: string | null;
  lastBillDate: string | null;
  useVat: boolean;
  priceLevel: number | null;
}

export interface AdminUser {
  userId: number;
  arabicName: string | null;
  englishName: string | null;
  code: string | null;
  inactive: boolean;
  isAdmin: boolean;
  userType: number | null;
  loggedOn: boolean;
  locked: boolean;
  email: string | null;
}

export interface AdminSession {
  userId: number;
  terminal: string | null;
  loginType: number; // 0 = login, 1 = logout
  eventAt: string;
  branchNo: number | null;
}

// ---- E-invoice (POST /einvoice/generate/{billId}, GET /einvoice/{billId}) ----
export interface EInvoice {
  id: string;
  billId: string;
  billNo: string;
  sellerName: string;
  vatNumber: string;
  invoiceTs: string;
  totalAmount: number;
  vatAmount: number;
  qrTlvBase64: string;
  docHash: string;
  docJson: string;
}

// ---- Sync (GET /sync/status, /sync/queue, POST /sync/run) ----
export interface SyncStatus {
  pending: number;
  synced: number;
  failed: number;
  total: number;
}

export type SyncEntryStatus = 'pending' | 'synced' | 'failed';

export interface SyncQueueEntry {
  id: string;
  billId: string;
  billNo: string;
  status: SyncEntryStatus;
  rtryCnt: number;
  allwdRtryCnt: number;
  lastError: string | null;
  enqueuedAt: string;
  syncedAt: string | null;
  createdAt: string;
}

export interface SyncRunResult {
  processed: number;
  synced: number;
  blocked: number;
  counts: SyncStatus;
}

// ---- Cards (GET /cards) ----
export interface PaymentCard {
  cardNo: number;
  cardName: string | null;
  cardEName: string | null;
  commissionPct: number;
  cardType: number;
  bankNo: number | null;
}

// ---- New reports ----
/** GET /reports/tax — VAT/tax report per day. */
export interface TaxReportRow {
  day: string;
  billCount: number;
  totalVat: number;
  totalDisc: number;
  totalAmt: number;
  netBeforeVat: number;
}

/** GET /reports/hourly-sales — one row per hour (00..23). */
export interface HourlySalesRow {
  hour: string;
  billCount: number;
  totalAmt: number;
  totalVat: number;
  totalDisc: number;
}

/** GET /reports/z-report — single end-of-day close summary. */
export interface ZReportPayment {
  method: string;
  billCount: number;
  amount: number;
}
export interface ZReport {
  from: string | null;
  to: string | null;
  machineNo: number | null;
  billCount: number;
  grossAmt: number;
  totalVat: number;
  totalDisc: number;
  netBeforeVat: number;
  returnAmt: number;
  firstBillTime: string | null;
  lastBillTime: string | null;
  byPayment: ZReportPayment[];
}

/** GET /reports/top-customers — top customers by total sales. */
export interface TopCustomerRow {
  cCode: string | null;
  cName: string | null;
  custCode: string | null;
  billCount: number;
  totalAmt: number;
  totalVat: number;
  totalDisc: number;
}

/** GET /reports/discount — discount report per day. */
export interface DiscountReportRow {
  day: string;
  billCount: number;
  totalDisc: number;
  totalAmt: number;
  discPct: number;
}

/** GET /reports/sales-by-category — sales grouped by item category. */
export interface SalesByCategoryRow {
  categoryNo: number;
  categoryName: string | null;
  lineCount: number;
  totalQty: number;
  totalAmt: number;
}
