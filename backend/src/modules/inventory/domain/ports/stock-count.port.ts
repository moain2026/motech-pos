/** DI token for the StockCountRepository port. */
export const STOCK_COUNT_REPOSITORY = Symbol('STOCK_COUNT_REPOSITORY');

export type StockCountStatus = 'DRAFT' | 'POSTED';

/** One counted item inside a stock-count session. */
export interface StockCountLine {
  lineId: string;
  itemCode: string;
  itemName: string | null; // Arabic name snapshot (IAS_ITM_MST)
  systemQty: number; // MV_ITEM_AVL_QTY at entry time
  countedQty: number; // physical count
  diffQty: number; // countedQty - systemQty
  countedAt: string; // ISO timestamp
}

/** Stock-count session header. */
export interface StockCountHeader {
  id: string;
  warehouseCode: number;
  status: StockCountStatus;
  note: string | null;
  createdBy: string;
  createdAt: string;
  postedBy: string | null;
  postedAt: string | null;
  lineCount: number;
  /** Lines with diff != 0 (variance lines). */
  varianceCount: number;
}

export interface StockCountDetail extends StockCountHeader {
  lines: StockCountLine[];
}

export interface CreateStockCountInput {
  warehouseCode: number;
  note: string | null;
  createdBy: string;
}

export interface UpsertLineInput {
  countId: string;
  itemCode: string;
  itemName: string | null;
  systemQty: number;
  countedQty: number;
}

export interface ListStockCountsFilter {
  status?: StockCountStatus;
  limit: number;
}

/** Raised by the repository when the post idempotency key hits ORA-00001. */
export class StockCountPostIdempotencyViolation extends Error {
  constructor() {
    super('POST_IDEMPOTENCY_KEY unique violation');
  }
}

/**
 * StockCountRepository — persistence port for stock-count sessions
 * (MOTECH_POS.STOCK_COUNTS + STOCK_COUNT_LINES; POST018 جرد).
 */
export interface StockCountRepository {
  create(input: CreateStockCountInput): Promise<StockCountDetail>;
  findById(id: string): Promise<StockCountDetail | null>;
  findByPostIdempotencyKey(key: string): Promise<StockCountDetail | null>;
  list(filter: ListStockCountsFilter): Promise<StockCountHeader[]>;
  /** Insert or update (same COUNT_ID+ITEM_CODE) one counted line. */
  upsertLine(input: UpsertLineInput): Promise<StockCountLine>;
  /** Flip DRAFT → POSTED (immutable). Returns the posted detail. */
  post(id: string, postedBy: string, idempotencyKey: string): Promise<StockCountDetail>;
  /** Current system qty for one item in one warehouse (MV snapshot). */
  systemQty(itemCode: string, warehouseCode: number): Promise<number>;
  /** Arabic item name from the ERP master (null when unknown). */
  itemName(itemCode: string): Promise<string | null>;
}
