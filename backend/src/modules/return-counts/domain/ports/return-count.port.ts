/** DI token for the ReturnCountRepository port. */
export const RETURN_COUNT_REPOSITORY = Symbol('RETURN_COUNT_REPOSITORY');

export type ReturnCountStatus = 'DRAFT' | 'POSTED';

/** One counted returned item (POST022 detail). */
export interface ReturnCountLine {
  lineId: string;
  itemCode: string;
  itemName: string | null;
  systemQty: number; // returned qty recorded in the system (snapshot)
  countedQty: number; // physically counted returned qty
  diffQty: number; // counted − system
}

/** Return count session header (POST022 جرد أصناف مردود المبيعات). */
export interface ReturnCountHeader {
  id: string;
  countNo: number;
  machineNo: number;
  countDate: string; // yyyy-mm-dd (day whose returns are being counted)
  status: ReturnCountStatus;
  refNo: string | null;
  note: string | null;
  createdBy: string;
  createdAt: string;
  postedBy: string | null;
  postedAt: string | null;
  lineCount: number;
}

export interface ReturnCountDetail extends ReturnCountHeader {
  lines: ReturnCountLine[];
}

export interface CreateReturnCountInput {
  machineNo: number;
  countDate: string; // yyyy-mm-dd
  refNo: string | null;
  note: string | null;
  createdBy: string;
}

export interface UpsertReturnCountLineInput {
  countId: string;
  itemCode: string;
  itemName: string | null;
  systemQty: number;
  countedQty: number;
}

export interface ListReturnCountsFilter {
  status?: ReturnCountStatus;
  machineNo?: number;
  limit: number;
}

/** Raised when POST_IDEMPOTENCY_KEY unique constraint fires (race). */
export class ReturnCountPostIdempotencyViolation extends Error {
  constructor() {
    super('POST_IDEMPOTENCY_KEY unique violation');
  }
}

/**
 * ReturnCountRepository — POST022 persistence. Count sessions live in
 * MOTECH_POS (V026); the SYSTEM side of each line is the summed returned qty
 * from the REAL return tables (YSPOS23.IAS_POS_RT_BILL_MST/DTL, read-only)
 * for the session's machine + date. Posting freezes the variances.
 */
export interface ReturnCountRepository {
  create(input: CreateReturnCountInput): Promise<ReturnCountDetail>;
  findById(id: string): Promise<ReturnCountDetail | null>;
  findByPostKey(key: string): Promise<ReturnCountDetail | null>;
  list(filter: ListReturnCountsFilter): Promise<ReturnCountHeader[]>;
  upsertLine(input: UpsertReturnCountLineInput): Promise<ReturnCountLine>;
  /** Guarded DRAFT → POSTED flip. Null when no DRAFT row matched. */
  post(
    id: string,
    postedBy: string,
    idempotencyKey: string,
  ): Promise<ReturnCountDetail | null>;
  /** True when the machine exists in YSPOS23.IAS_POS_MACHINE (or overlay). */
  machineExists(machineNo: number): Promise<boolean>;
  /** System returned qty of one item at machine+date (0 when none). */
  systemReturnedQty(
    itemCode: string,
    machineNo: number,
    countDate: string,
  ): Promise<number>;
  /** Arabic item name (null when unknown). */
  itemName(itemCode: string): Promise<string | null>;
}
