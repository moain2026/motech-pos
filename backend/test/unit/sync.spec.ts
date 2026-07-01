import { beforeEach, describe, expect, it } from 'vitest';
import { EInvoiceService } from '../../src/modules/einvoice/application/einvoice.service';
import { SyncService } from '../../src/modules/sync/application/sync.service';
import {
  canSync,
  taxBillsNotSyncedMessage,
} from '../../src/modules/sync/domain/sync-guard';
import {
  SyncBillFacts,
  SyncQueueEntry,
  SyncQueueUniqueViolation,
  SyncRepository,
  SyncStatusCounts,
} from '../../src/modules/sync/domain/ports/sync-repository.port';

describe('canSync (-20001 guard predicate)', () => {
  it('allows a non-taxable bill (vat=0) even without an e-invoice', () => {
    expect(canSync({ billId: 'b', vatAmount: 0, eInvoiceIssued: false })).toBe(
      true,
    );
  });
  it('blocks a taxable bill until its e-invoice is issued', () => {
    expect(canSync({ billId: 'b', vatAmount: 15, eInvoiceIssued: false })).toBe(
      false,
    );
    expect(canSync({ billId: 'b', vatAmount: 15, eInvoiceIssued: true })).toBe(
      true,
    );
  });
  it('the -20001 message mirrors the Onyx text', () => {
    expect(taxBillsNotSyncedMessage(3)).toBe(
      'There are tax bills not Sync. to tax authority bills count=3',
    );
  });
});

// ---- Fakes -----------------------------------------------------------------

class FakeSyncRepo implements SyncRepository {
  bills = new Map<string, SyncBillFacts>();
  rows: SyncQueueEntry[] = [];
  private seq = 0;

  billExists(billId: string): Promise<boolean> {
    return Promise.resolve(this.bills.has(billId));
  }
  billFacts(billId: string): Promise<SyncBillFacts | null> {
    return Promise.resolve(this.bills.get(billId) ?? null);
  }
  enqueue(billId: string, billNo: string | null): Promise<SyncQueueEntry> {
    if (this.rows.some((r) => r.billId === billId)) {
      return Promise.reject(new SyncQueueUniqueViolation());
    }
    const now = new Date().toISOString();
    const entry: SyncQueueEntry = {
      id: `q${++this.seq}`,
      billId,
      billNo,
      status: 'pending',
      rtryCnt: 0,
      allwdRtryCnt: 5,
      lastError: null,
      enqueuedAt: now,
      syncedAt: null,
      createdAt: now,
    };
    this.rows.push(entry);
    return Promise.resolve(entry);
  }
  findByBillId(billId: string): Promise<SyncQueueEntry | null> {
    return Promise.resolve(this.rows.find((r) => r.billId === billId) ?? null);
  }
  list(
    status: 'pending' | 'synced' | 'failed' | undefined,
  ): Promise<SyncQueueEntry[]> {
    return Promise.resolve(
      status ? this.rows.filter((r) => r.status === status) : [...this.rows],
    );
  }
  pending(): Promise<SyncQueueEntry[]> {
    return Promise.resolve(this.rows.filter((r) => r.status === 'pending'));
  }
  counts(): Promise<SyncStatusCounts> {
    const c: SyncStatusCounts = { pending: 0, synced: 0, failed: 0, total: 0 };
    for (const r of this.rows) {
      c[r.status] += 1;
      c.total += 1;
    }
    return Promise.resolve(c);
  }
  markSynced(id: string): Promise<SyncQueueEntry> {
    const r = this.rows.find((x) => x.id === id)!;
    r.status = 'synced';
    r.syncedAt = new Date().toISOString();
    r.lastError = null;
    return Promise.resolve(r);
  }
  markFailed(id: string, error: string): Promise<SyncQueueEntry> {
    const r = this.rows.find((x) => x.id === id)!;
    r.status = 'failed';
    r.rtryCnt += 1;
    r.lastError = error;
    return Promise.resolve(r);
  }
}

/** Minimal EInvoiceService stub exposing only isIssued. */
function fakeEInvoice(issued: Set<string>): EInvoiceService {
  return {
    isIssued: (billId: string) => Promise.resolve(issued.has(billId)),
  } as unknown as EInvoiceService;
}

describe('SyncService', () => {
  let repo: FakeSyncRepo;
  let issued: Set<string>;
  let svc: SyncService;

  beforeEach(() => {
    repo = new FakeSyncRepo();
    issued = new Set<string>();
    svc = new SyncService(repo, fakeEInvoice(issued));
  });

  it('enqueue is idempotent per bill', async () => {
    repo.bills.set('b1', { billId: 'b1', billNo: 'B1', vatAmount: 15 });
    const a = await svc.enqueue('b1');
    const b = await svc.enqueue('b1');
    expect(a.replayed).toBe(false);
    expect(b.replayed).toBe(true);
    expect(b.entry.id).toBe(a.entry.id);
  });

  it('enqueue rejects an unknown bill (404)', async () => {
    await expect(svc.enqueue('nope')).rejects.toThrow(/not found/i);
  });

  it('run BLOCKS a taxable bill with no e-invoice (-20001)', async () => {
    repo.bills.set('b1', { billId: 'b1', billNo: 'B1', vatAmount: 15 });
    await svc.enqueue('b1');
    const res = await svc.run();
    expect(res.synced).toBe(0);
    expect(res.blocked).toBe(1);
    expect(res.counts.failed).toBe(1);
    const entry = await repo.findByBillId('b1');
    expect(entry?.lastError).toMatch(/not Sync/);
  });

  it('run SYNCS a taxable bill once its e-invoice is issued', async () => {
    repo.bills.set('b1', { billId: 'b1', billNo: 'B1', vatAmount: 15 });
    await svc.enqueue('b1');
    await svc.run(); // blocked
    issued.add('b1'); // e-invoice now generated
    // re-open the entry to pending to simulate a retry cycle
    (await repo.findByBillId('b1'))!.status = 'pending';
    const res = await svc.run();
    expect(res.synced).toBe(1);
    expect(res.blocked).toBe(0);
    const entry = await repo.findByBillId('b1');
    expect(entry?.status).toBe('synced');
    expect(entry?.syncedAt).not.toBeNull();
  });

  it('run SYNCS a non-taxable bill directly (no e-invoice needed)', async () => {
    repo.bills.set('b2', { billId: 'b2', billNo: 'B2', vatAmount: 0 });
    await svc.enqueue('b2');
    const res = await svc.run();
    expect(res.synced).toBe(1);
    expect(res.blocked).toBe(0);
  });
});
