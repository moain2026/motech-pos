import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  CatalogCacheRepository,
  CatalogCacheStatus,
  CatalogSyncRun,
  CATALOG_CACHE_REPOSITORY,
} from '../domain/ports/catalog-cache.port';

/** Result of a single downward pull. */
export interface CatalogPullResult {
  runId: string;
  sourceCount: number;
  upserted: number;
  staled: number;
  durationMs: number;
  skipped?: boolean;
}

/**
 * CatalogPullService — the downward half of POST008 (المزامنة النزولية).
 * Pulls the live ERP catalog (items + retail prices + available qty) into the
 * local MOTECH_POS.CATALOG_CACHE so the POS terminal has a fast/offline,
 * consistent "as-of last pull" snapshot. The ERP is read-only; only the local
 * cache is written.
 *
 * A single in-flight guard (`running`) prevents overlapping pulls (manual vs
 * scheduled) from double-running. Every pull is recorded in CATALOG_SYNC_RUNS.
 */
@Injectable()
export class CatalogPullService {
  private readonly logger = new Logger(CatalogPullService.name);
  private running = false;

  constructor(
    @Inject(CATALOG_CACHE_REPOSITORY)
    private readonly repo: CatalogCacheRepository,
  ) {}

  /** True while a pull is in progress (manual or scheduled). */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * Run a downward catalog pull. If one is already in flight, returns a
   * skipped result (idempotent — no overlapping runs).
   */
  async pull(
    triggeredBy: 'manual' | 'scheduled' = 'manual',
  ): Promise<CatalogPullResult> {
    if (this.running) {
      this.logger.warn('Catalog pull already running — skipping');
      return {
        runId: '',
        sourceCount: 0,
        upserted: 0,
        staled: 0,
        durationMs: 0,
        skipped: true,
      };
    }
    this.running = true;
    const runId = await this.repo.startRun(triggeredBy);
    const started = Date.now();
    try {
      const source = await this.repo.readSourceItems();
      const { upserted, staled } = await this.repo.upsertBatch(source);
      const durationMs = Date.now() - started;
      await this.repo.finishRun(runId, {
        status: 'success',
        sourceCount: source.length,
        upserted,
        staled,
        durationMs,
      });
      this.logger.log(
        `Catalog pull [${triggeredBy}] ok: ${source.length} source → ${upserted} upserted, ${staled} stale in ${durationMs}ms`,
      );
      return { runId, sourceCount: source.length, upserted, staled, durationMs };
    } catch (err) {
      const durationMs = Date.now() - started;
      await this.repo.finishRun(runId, {
        status: 'failed',
        sourceCount: 0,
        upserted: 0,
        staled: 0,
        durationMs,
        error: String(err),
      });
      this.logger.error(`Catalog pull [${triggeredBy}] failed: ${String(err)}`);
      throw err;
    } finally {
      this.running = false;
    }
  }

  status(): Promise<CatalogCacheStatus> {
    return this.repo.status();
  }

  listRuns(limit: number): Promise<CatalogSyncRun[]> {
    return this.repo.listRuns(limit);
  }

  listCached(search: string | undefined, limit: number) {
    return this.repo.listCached(search, limit);
  }
}
