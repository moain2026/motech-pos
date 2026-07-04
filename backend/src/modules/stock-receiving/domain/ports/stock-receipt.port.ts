/** DI token for the StockReceiptRepository port. */
export const STOCK_RECEIPT_REPOSITORY = Symbol('STOCK_RECEIPT_REPOSITORY');

export type StockReceiptStatus = 'DRAFT' | 'POSTED' | 'CANCELLED';

/** One received item (POST029 detail). */
export interface StockReceiptLine {
  lineId: string;
  itemCode: string;
  itemName: string | null; // Arabic name snapshot (IAS_ITM_MST)
  qty: number; // received qty (sale units)
  itmUnt: string | null; // unit snapshot (default sale unit)
  pSize: number; // pack size snapshot (P_QTY = qty × pSize)
  unitCost: number | null; // last-known cost snapshot (I_COST/STK_COST)
  note: string | null;
}

/** Stock receipt header (POST029 الاستلام المخزني). */
export interface StockReceiptHeader {
  id: string;
  receiptNo: number; // human-friendly serial (SEQ_STOCK_RECEIPT_NO)
  warehouseCode: number; // المخزن المستلِم
  sourceWarehouseCode: number | null; // المخزن المحول منه
  transferId: string | null; // optional POST019 request linkage
  status: StockReceiptStatus;
  refNo: string | null;
  note: string | null;
  createdBy: string;
  createdAt: string;
  postedBy: string | null;
  postedAt: string | null;
  onyxDocNo: number | null; // ITEM_MOVEMENT.DOC_NO (DOC_TYPE=8)
  onyxDocSer: number | null; // ITEM_MOVEMENT.DOC_SER
  cancelledBy: string | null;
  cancelledAt: string | null;
  lineCount: number;
}

export interface StockReceiptDetail extends StockReceiptHeader {
  lines: StockReceiptLine[];
}

export interface CreateStockReceiptLineInput {
  itemCode: string;
  itemName: string | null;
  qty: number;
  itmUnt: string | null;
  pSize: number;
  unitCost: number | null;
  note: string | null;
}

export interface CreateStockReceiptInput {
  warehouseCode: number;
  sourceWarehouseCode: number | null;
  transferId: string | null;
  refNo: string | null;
  note: string | null;
  createdBy: string;
  lines: CreateStockReceiptLineInput[];
}

export interface ListStockReceiptsFilter {
  status?: StockReceiptStatus;
  warehouse?: number;
  limit: number;
}

/** Item snapshot at entry time (name/unit/pack/cost). */
export interface ReceiptItemSnapshot {
  itemName: string | null;
  itmUnt: string | null;
  pSize: number;
  unitCost: number | null;
}

/** Raised when the POST_IDEMPOTENCY_KEY unique constraint fires (race). */
export class StockReceiptPostIdempotencyViolation extends Error {
  constructor() {
    super('POST_IDEMPOTENCY_KEY unique violation');
  }
}

/**
 * StockReceiptRepository — persistence port for POST029 stock receipts.
 * Documents live in MOTECH_POS (V022); POSTING writes the REAL stock effect
 * (IAS202623.ITEM_MOVEMENT rows, DOC_TYPE=8 / IN_OUT=+1 — V023 grants) in the
 * SAME transaction as the status flip, then refreshes MV_ITEM_AVL_QTY so the
 * received quantity is immediately available (Onyx INSTALL_TR analogue).
 */
export interface StockReceiptRepository {
  /** Insert header + lines atomically (RECEIPT_NO from SEQ_STOCK_RECEIPT_NO). */
  create(input: CreateStockReceiptInput): Promise<StockReceiptDetail>;
  findById(id: string): Promise<StockReceiptDetail | null>;
  /** Replay lookup: a receipt already posted with this Idempotency-Key. */
  findByPostKey(key: string): Promise<StockReceiptDetail | null>;
  list(filter: ListStockReceiptsFilter): Promise<StockReceiptHeader[]>;
  /**
   * Post (approve) the receipt: guarded DRAFT → POSTED flip + ITEM_MOVEMENT
   * inserts in ONE transaction, then MV refresh (best-effort, post-commit).
   * Returns null when no DRAFT row matched (concurrent post/cancel).
   * Throws StockReceiptPostIdempotencyViolation on a duplicate-key race.
   */
  post(
    id: string,
    postedBy: string,
    idempotencyKey: string,
  ): Promise<StockReceiptDetail | null>;
  /** Guarded DRAFT → CANCELLED flip; returns null when no DRAFT row matched. */
  cancel(id: string, cancelledBy: string): Promise<StockReceiptDetail | null>;
  /** True when the warehouse exists in YSPOS23.WAREHOUSE_DETAILS. */
  warehouseExists(wCode: number): Promise<boolean>;
  /** Item snapshot (name/unit/pack/cost); null when the item is unknown. */
  itemSnapshot(itemCode: string): Promise<ReceiptItemSnapshot | null>;
  /** Available qty at a warehouse AFTER refresh (proof/verification aid). */
  availableQty(itemCode: string, wCode: number): Promise<number | null>;
}
