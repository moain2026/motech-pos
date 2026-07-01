import { Inject, Injectable, Logger } from '@nestjs/common';
import { SyncBillNotFoundError } from '../../../shared/errors/domain-error';
import { EInvoiceService } from '../../einvoice/application/einvoice.service';
import { canSync, taxBillsNotSyncedMessage } from '../domain/sync-guard';
import {
  SyncQueueEntry,
  SyncQueueUniqueViolation,
  SyncRepository,
  SyncStatusCounts,
  SYNC_REPOSITORY,
} from '../domain/ports/sync-repository.port';

/** Result of a single queue-processing run. */
export interface SyncRunResult {
  processed: number;
  synced: number;
  blocked: number;
  entries: SyncQueueEntry[];
  counts: SyncStatusCounts;
}

/**
 * SyncService — manages the internal transfer of bills to the "center"
 * (analogue of PKG_POS_MOV_TRNS_PKG.MOV_BILLS_PRC + POS_SQL_QUEUE). The actual
 * transfer is SIMULATED (we never write to the live Onyx). New bills are
 * enqueued; a run processes the pending queue and marks entries synced.
 *
 * CRITICAL GUARD (-20001): a taxable bill cannot be synced before its
 * e-invoice is issued — mirrors MOV_BILLS_PRC's RAISE_APPLICATION_ERROR.
 * Blocked entries are marked FAILED with the -20001 message and left for a
 * later run (after the e-invoice is generated).
 */
@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    @Inject(SYNC_REPOSITORY) private readonly repo: SyncRepository,
    private readonly einvoice: EInvoiceService,
  ) {}

  /** Aggregate queue status (pending/synced/failed counts). */
  status(): Promise<SyncStatusCounts> {
    return this.repo.counts();
  }

  /** List queue entries (optionally filtered by status). */
  queue(
    status: 'pending' | 'synced' | 'failed' | undefined,
    limit: number,
  ): Promise<SyncQueueEntry[]> {
    return this.repo.list(status, limit);
  }

  /**
   * Enqueue a bill for sync (idempotent per bill). Returns the entry and a
   * `replayed` flag if it was already queued.
   */
  async enqueue(
    billId: string,
  ): Promise<{ entry: SyncQueueEntry; replayed: boolean }> {
    const facts = await this.repo.billFacts(billId);
    if (!facts) {
      throw new SyncBillNotFoundError(
        `Bill ${billId} not found in MOTECH_POS`,
        { billId },
      );
    }
    try {
      const entry = await this.repo.enqueue(facts.billId, facts.billNo);
      return { entry, replayed: false };
    } catch (err) {
      if (err instanceof SyncQueueUniqueViolation) {
        const existing = await this.repo.findByBillId(billId);
        if (existing) return { entry: existing, replayed: true };
      }
      throw err;
    }
  }

  /**
   * Process the pending queue: for each pending entry evaluate the -20001
   * guard, then simulate the transfer and mark it synced (or failed/blocked).
   */
  async run(limit = 100): Promise<SyncRunResult> {
    const pending = await this.repo.pending(limit);
    const entries: SyncQueueEntry[] = [];
    let synced = 0;
    let blocked = 0;

    for (const entry of pending) {
      const facts = await this.repo.billFacts(entry.billId);
      if (!facts) {
        entries.push(
          await this.repo.markFailed(entry.id, 'bill no longer exists'),
        );
        continue;
      }
      const eInvoiceIssued = await this.einvoice.isIssued(entry.billId);
      const allowed = canSync({
        billId: entry.billId,
        vatAmount: facts.vatAmount,
        eInvoiceIssued,
      });

      if (!allowed) {
        // -20001 guard: taxable bill without an issued e-invoice → block.
        blocked += 1;
        const msg = taxBillsNotSyncedMessage(1);
        this.logger.warn({ billId: entry.billId }, msg);
        entries.push(await this.repo.markFailed(entry.id, msg));
        continue;
      }

      // Simulate the internal transfer (no live-Onyx write) → synced.
      synced += 1;
      entries.push(await this.repo.markSynced(entry.id));
    }

    const counts = await this.repo.counts();
    return { processed: pending.length, synced, blocked, entries, counts };
  }
}
