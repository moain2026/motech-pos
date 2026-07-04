import type { ReceiptItemSnapshot } from './stock-receipt.port';

/** DI token for the StockIssueRepository port. */
export const STOCK_ISSUE_REPOSITORY = Symbol('STOCK_ISSUE_REPOSITORY');

export type StockIssueStatus = 'DRAFT' | 'POSTED' | 'CANCELLED';

/** One dispatched item (POST028 detail). */
export interface StockIssueLine {
  lineId: string;
  itemCode: string;
  itemName: string | null;
  qty: number;
  itmUnt: string | null;
  pSize: number;
  unitCost: number | null;
  note: string | null;
}

/** Stock issue (dispatch) header — POST028 التحويل المخزني. */
export interface StockIssueHeader {
  id: string;
  issueNo: number; // SEQ_STOCK_ISSUE_NO
  warehouseCode: number; // source (stock leaves here)
  destWarehouseCode: number | null; // informational destination
  transferId: string | null; // optional POST019 request linkage
  status: StockIssueStatus;
  refNo: string | null;
  note: string | null;
  createdBy: string;
  createdAt: string;
  postedBy: string | null;
  postedAt: string | null;
  onyxDocNo: number | null; // ITEM_MOVEMENT.DOC_NO (DOC_TYPE=7)
  onyxDocSer: number | null;
  cancelledBy: string | null;
  cancelledAt: string | null;
  lineCount: number;
}

export interface StockIssueDetail extends StockIssueHeader {
  lines: StockIssueLine[];
}

export interface CreateStockIssueLineInput {
  itemCode: string;
  itemName: string | null;
  qty: number;
  itmUnt: string | null;
  pSize: number;
  unitCost: number | null;
  note: string | null;
}

export interface CreateStockIssueInput {
  warehouseCode: number;
  destWarehouseCode: number | null;
  transferId: string | null;
  refNo: string | null;
  note: string | null;
  createdBy: string;
  lines: CreateStockIssueLineInput[];
}

export interface ListStockIssuesFilter {
  status?: StockIssueStatus;
  warehouse?: number;
  limit: number;
}

/** Raised when the POST_IDEMPOTENCY_KEY unique constraint fires (race). */
export class StockIssuePostIdempotencyViolation extends Error {
  constructor() {
    super('POST_IDEMPOTENCY_KEY unique violation');
  }
}

/**
 * StockIssueRepository — persistence port for POST028 dispatches. Documents
 * live in MOTECH_POS (V025); POSTING writes ITEM_MOVEMENT rows DOC_TYPE=7 /
 * IN_OUT=−1 in the same transaction (stock LEAVES the source warehouse).
 */
export interface StockIssueRepository {
  create(input: CreateStockIssueInput): Promise<StockIssueDetail>;
  findById(id: string): Promise<StockIssueDetail | null>;
  findByPostKey(key: string): Promise<StockIssueDetail | null>;
  list(filter: ListStockIssuesFilter): Promise<StockIssueHeader[]>;
  /** Guarded DRAFT → POSTED flip + DOC_TYPE=7 movement rows (one tx). */
  post(
    id: string,
    postedBy: string,
    idempotencyKey: string,
  ): Promise<StockIssueDetail | null>;
  cancel(id: string, cancelledBy: string): Promise<StockIssueDetail | null>;
  warehouseExists(wCode: number): Promise<boolean>;
  itemSnapshot(itemCode: string): Promise<ReceiptItemSnapshot | null>;
  /** Available qty at a warehouse (availability guard + proof). */
  availableQty(itemCode: string, wCode: number): Promise<number | null>;
}
