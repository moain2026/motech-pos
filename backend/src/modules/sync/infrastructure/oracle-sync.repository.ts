import { Injectable } from '@nestjs/common';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import {
  SyncBillFacts,
  SyncQueueEntry,
  SyncQueueUniqueViolation,
  SyncRepository,
  SyncStatusCounts,
} from '../domain/ports/sync-repository.port';

interface QueueRow {
  ID: string;
  BILL_ID: string;
  BILL_NO: string | null;
  STATUS: string;
  RTRY_CNT: number;
  ALLWD_RTRY_CNT: number;
  LAST_ERROR: string | null;
  ENQUEUED_AT: Date;
  SYNCED_AT: Date | null;
  CREATED_AT: Date;
}

/**
 * OracleSyncRepository — the internal-transfer queue in MOTECH_POS.SYNC_QUEUE
 * (analogue of POS_SQL_QUEUE + IAS_POS_BILL_MST.POSTED/MOV_DATE). The transfer
 * to the "center" is SIMULATED here — we NEVER write to the live Onyx
 * (YSPOS23). Enqueue is idempotent per bill (UNIQUE BILL_ID).
 */
@Injectable()
export class OracleSyncRepository implements SyncRepository {
  constructor(private readonly db: OracleWriteService) {}

  private get schema(): string {
    return this.db.schema();
  }

  async billExists(billId: string): Promise<boolean> {
    const row = await this.db.queryOne<{ N: number }>(
      `SELECT COUNT(*) AS N FROM ${this.schema}.BILLS WHERE ID = :id`,
      { id: billId },
    );
    return Number(row?.N ?? 0) > 0;
  }

  async billFacts(billId: string): Promise<SyncBillFacts | null> {
    const row = await this.db.queryOne<{
      ID: string;
      BILL_NO: string | null;
      VAT_AMT: number;
    }>(
      `SELECT ID, BILL_NO, VAT_AMT FROM ${this.schema}.BILLS WHERE ID = :id`,
      { id: billId },
    );
    if (!row) return null;
    return {
      billId: row.ID,
      billNo: row.BILL_NO,
      vatAmount: Number(row.VAT_AMT),
    };
  }

  async enqueue(billId: string, billNo: string | null): Promise<SyncQueueEntry> {
    const id = uuidv7();
    try {
      await this.db.execute(
        `INSERT INTO ${this.schema}.SYNC_QUEUE
           (ID, BILL_ID, BILL_NO, STATUS, RTRY_CNT, ALLWD_RTRY_CNT)
         VALUES (:id, :billId, :billNo, 'pending', 0, 5)`,
        { id, billId, billNo },
      );
    } catch (err) {
      if (this.isUniqueViolation(err)) throw new SyncQueueUniqueViolation();
      throw err;
    }
    const row = await this.findById(id);
    if (!row) throw new Error('enqueue: entry vanished after commit');
    return row;
  }

  private async findById(id: string): Promise<SyncQueueEntry | null> {
    const row = await this.db.queryOne<QueueRow>(
      `SELECT * FROM ${this.schema}.SYNC_QUEUE WHERE ID = :id`,
      { id },
    );
    return row ? this.map(row) : null;
  }

  async findByBillId(billId: string): Promise<SyncQueueEntry | null> {
    const row = await this.db.queryOne<QueueRow>(
      `SELECT * FROM ${this.schema}.SYNC_QUEUE WHERE BILL_ID = :id`,
      { id: billId },
    );
    return row ? this.map(row) : null;
  }

  async list(
    status: 'pending' | 'synced' | 'failed' | undefined,
    limit: number,
  ): Promise<SyncQueueEntry[]> {
    const rows = status
      ? await this.db.query<QueueRow>(
          `SELECT * FROM (
             SELECT * FROM ${this.schema}.SYNC_QUEUE
             WHERE STATUS = :s ORDER BY ENQUEUED_AT DESC
           ) WHERE ROWNUM <= :lim`,
          { s: status, lim: limit },
        )
      : await this.db.query<QueueRow>(
          `SELECT * FROM (
             SELECT * FROM ${this.schema}.SYNC_QUEUE
             ORDER BY ENQUEUED_AT DESC
           ) WHERE ROWNUM <= :lim`,
          { lim: limit },
        );
    return rows.map((r) => this.map(r));
  }

  async pending(limit: number): Promise<SyncQueueEntry[]> {
    const rows = await this.db.query<QueueRow>(
      `SELECT * FROM (
         SELECT * FROM ${this.schema}.SYNC_QUEUE
         WHERE STATUS = 'pending' ORDER BY ENQUEUED_AT ASC
       ) WHERE ROWNUM <= :lim`,
      { lim: limit },
    );
    return rows.map((r) => this.map(r));
  }

  async counts(): Promise<SyncStatusCounts> {
    const rows = await this.db.query<{ STATUS: string; N: number }>(
      `SELECT STATUS, COUNT(*) AS N FROM ${this.schema}.SYNC_QUEUE
       GROUP BY STATUS`,
    );
    const counts: SyncStatusCounts = {
      pending: 0,
      synced: 0,
      failed: 0,
      total: 0,
    };
    for (const r of rows) {
      const n = Number(r.N);
      if (r.STATUS === 'pending') counts.pending = n;
      else if (r.STATUS === 'synced') counts.synced = n;
      else if (r.STATUS === 'failed') counts.failed = n;
      counts.total += n;
    }
    return counts;
  }

  async markSynced(id: string): Promise<SyncQueueEntry> {
    await this.db.execute(
      `UPDATE ${this.schema}.SYNC_QUEUE
         SET STATUS = 'synced', SYNCED_AT = SYSTIMESTAMP, LAST_ERROR = NULL
       WHERE ID = :id`,
      { id },
    );
    const row = await this.findById(id);
    if (!row) throw new Error('markSynced: entry not found');
    return row;
  }

  async markFailed(id: string, error: string): Promise<SyncQueueEntry> {
    await this.db.execute(
      `UPDATE ${this.schema}.SYNC_QUEUE
         SET STATUS = 'failed', RTRY_CNT = RTRY_CNT + 1,
             LAST_ERROR = :err
       WHERE ID = :id`,
      { id, err: error.slice(0, 600) },
    );
    const row = await this.findById(id);
    if (!row) throw new Error('markFailed: entry not found');
    return row;
  }

  private map(r: QueueRow): SyncQueueEntry {
    return {
      id: r.ID,
      billId: r.BILL_ID,
      billNo: r.BILL_NO,
      status: r.STATUS as SyncQueueEntry['status'],
      rtryCnt: Number(r.RTRY_CNT),
      allwdRtryCnt: Number(r.ALLWD_RTRY_CNT),
      lastError: r.LAST_ERROR,
      enqueuedAt: r.ENQUEUED_AT.toISOString(),
      syncedAt: r.SYNCED_AT ? r.SYNCED_AT.toISOString() : null,
      createdAt: r.CREATED_AT.toISOString(),
    };
  }

  private isUniqueViolation(err: unknown): boolean {
    return (
      typeof err === 'object' &&
      err !== null &&
      'errorNum' in err &&
      (err as { errorNum?: number }).errorNum === 1
    );
  }
}
