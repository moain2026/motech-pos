import { beforeEach, describe, expect, it } from 'vitest';
import { CatalogPullService } from '../../src/modules/catalog/application/catalog-pull.service';
import {
  CatalogCacheRepository,
  CatalogCacheRow,
  CatalogCacheStatus,
  CatalogSourceItem,
  CatalogSyncRun,
} from '../../src/modules/catalog/domain/ports/catalog-cache.port';

/** In-memory fake of the downward catalog cache. */
class FakeCache implements CatalogCacheRepository {
  source: CatalogSourceItem[] = [];
  cache = new Map<string, CatalogCacheRow>();
  runs: CatalogSyncRun[] = [];
  private seq = 0;
  // A hook to simulate a slow/failed source read.
  failNext = false;

  readSourceItems(): Promise<CatalogSourceItem[]> {
    if (this.failNext) {
      this.failNext = false;
      return Promise.reject(new Error('ERP unreachable'));
    }
    return Promise.resolve([...this.source]);
  }

  upsertBatch(
    items: CatalogSourceItem[],
  ): Promise<{ upserted: number; staled: number }> {
    const seen = new Set(items.map((i) => i.code));
    for (const it of items) {
      this.cache.set(it.code, {
        ...it,
        stale: false,
        syncedAt: new Date().toISOString(),
      });
    }
    let staled = 0;
    for (const [code, row] of this.cache) {
      if (!seen.has(code)) {
        row.stale = true;
        staled++;
      }
    }
    return Promise.resolve({ upserted: items.length, staled });
  }

  startRun(triggeredBy: 'manual' | 'scheduled'): Promise<string> {
    const id = `run${++this.seq}`;
    this.runs.unshift({
      id,
      status: 'running',
      triggeredBy,
      sourceCount: 0,
      upserted: 0,
      staled: 0,
      durationMs: null,
      error: null,
      startedAt: new Date().toISOString(),
      finishedAt: null,
    });
    return Promise.resolve(id);
  }

  finishRun(
    id: string,
    result: {
      status: 'success' | 'failed';
      sourceCount: number;
      upserted: number;
      staled: number;
      durationMs: number;
      error?: string | null;
    },
  ): Promise<void> {
    const run = this.runs.find((r) => r.id === id);
    if (run) {
      Object.assign(run, result, {
        error: result.error ?? null,
        finishedAt: new Date().toISOString(),
      });
    }
    return Promise.resolve();
  }

  lastRun(): Promise<CatalogSyncRun | null> {
    return Promise.resolve(this.runs[0] ?? null);
  }
  listRuns(limit: number): Promise<CatalogSyncRun[]> {
    return Promise.resolve(this.runs.slice(0, limit));
  }
  status(): Promise<CatalogCacheStatus> {
    const rows = [...this.cache.values()];
    return Promise.resolve({
      total: rows.length,
      active: rows.filter((r) => !r.stale && !r.inactive).length,
      stale: rows.filter((r) => r.stale).length,
      lastSyncedAt: rows.length ? rows[0].syncedAt : null,
      lastRun: this.runs[0] ?? null,
    });
  }
  listCached(search: string | undefined): Promise<CatalogCacheRow[]> {
    let rows = [...this.cache.values()];
    if (search) rows = rows.filter((r) => r.code.includes(search));
    return Promise.resolve(rows);
  }
}

function item(code: string, price: number | null): CatalogSourceItem {
  return {
    code,
    name: `صنف ${code}`,
    barcode: `BC${code}`,
    unit: 'حبة',
    packSize: 1,
    price,
    groupCode: '01',
    subGroupCode: '0101',
    weighted: false,
    availableQty: 10,
    inactive: false,
  };
}

describe('CatalogPullService (downward sync POST008)', () => {
  let repo: FakeCache;
  let svc: CatalogPullService;

  beforeEach(() => {
    repo = new FakeCache();
    svc = new CatalogPullService(repo);
  });

  it('pulls items from the ERP into the local cache + records a run', async () => {
    repo.source = [item('A1', 100), item('A2', 250)];
    const r = await svc.pull('manual');
    expect(r.sourceCount).toBe(2);
    expect(r.upserted).toBe(2);
    expect(repo.cache.get('A1')?.price).toBe(100);
    const run = await repo.lastRun();
    expect(run?.status).toBe('success');
    expect(run?.triggeredBy).toBe('manual');
    expect(run?.upserted).toBe(2);
  });

  it('flags removed items as STALE on a subsequent pull', async () => {
    repo.source = [item('A1', 100), item('A2', 250)];
    await svc.pull('scheduled');
    // A2 disappears from the ERP on the next pull.
    repo.source = [item('A1', 110)];
    const r = await svc.pull('scheduled');
    expect(r.staled).toBe(1);
    expect(repo.cache.get('A2')?.stale).toBe(true);
    expect(repo.cache.get('A1')?.price).toBe(110); // price refreshed
    expect(repo.cache.get('A1')?.stale).toBe(false);
  });

  it('records a failed run and rethrows when the ERP read fails', async () => {
    repo.failNext = true;
    await expect(svc.pull('manual')).rejects.toThrow(/unreachable/i);
    const run = await repo.lastRun();
    expect(run?.status).toBe('failed');
    expect(run?.error).toMatch(/unreachable/i);
    expect(svc.isRunning()).toBe(false);
  });

  it('status reflects active vs stale counts', async () => {
    repo.source = [item('A1', 100), item('A2', 250)];
    await svc.pull('manual');
    const s = await svc.status();
    expect(s.total).toBe(2);
    expect(s.active).toBe(2);
    expect(s.stale).toBe(0);
    expect(s.lastRun?.status).toBe('success');
  });
});
