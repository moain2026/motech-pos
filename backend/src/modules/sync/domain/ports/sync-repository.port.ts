export const SYNC_REPOSITORY = Symbol('SYNC_REPOSITORY');

/** A queue entry for a bill pending transfer to the center. */
export interface SyncQueueEntry {
  id: string;
  billId: string;
  billNo: string | null;
  status: 'pending' | 'synced' | 'failed';
  rtryCnt: number;
  allwdRtryCnt: number;
  lastError: string | null;
  enqueuedAt: string;
  syncedAt: string | null;
  createdAt: string;
}

/** Aggregate counts by status. */
export interface SyncStatusCounts {
  pending: number;
  synced: number;
  failed: number;
  total: number;
}

/** Thrown on the UNIQUE (BILL_ID) collision so the caller can treat as replay. */
export class SyncQueueUniqueViolation extends Error {
  constructor() {
    super('bill already enqueued for sync');
    this.name = 'SyncQueueUniqueViolation';
  }
}

/** Minimal bill facts read from MOTECH_POS.BILLS for the sync flow. */
export interface SyncBillFacts {
  billId: string;
  billNo: string | null;
  vatAmount: number;
}

export interface SyncRepository {
  /** True when a bill exists in MOTECH_POS.BILLS. */
  billExists(billId: string): Promise<boolean>;

  /** Read minimal bill facts (billNo + vat) from MOTECH_POS.BILLS, or null. */
  billFacts(billId: string): Promise<SyncBillFacts | null>;

  /** Enqueue a bill (pending). Throws SyncQueueUniqueViolation if already queued. */
  enqueue(billId: string, billNo: string | null): Promise<SyncQueueEntry>;

  /** Fetch a queue entry by bill id, or null. */
  findByBillId(billId: string): Promise<SyncQueueEntry | null>;

  /** List queue entries, newest first, optionally filtered by status. */
  list(
    status: 'pending' | 'synced' | 'failed' | undefined,
    limit: number,
  ): Promise<SyncQueueEntry[]>;

  /** All currently pending entries (oldest first — FIFO processing). */
  pending(limit: number): Promise<SyncQueueEntry[]>;

  /** Aggregate counts by status. */
  counts(): Promise<SyncStatusCounts>;

  /** Mark an entry synced (simulated transfer succeeded). */
  markSynced(id: string): Promise<SyncQueueEntry>;

  /** Mark an entry failed, bumping RTRY_CNT and recording the error. */
  markFailed(id: string, error: string): Promise<SyncQueueEntry>;
}
