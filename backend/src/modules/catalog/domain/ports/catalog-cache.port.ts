/** DI token for the CatalogCacheRepository port. */
export const CATALOG_CACHE_REPOSITORY = Symbol('CATALOG_CACHE_REPOSITORY');

/** One item snapshot pulled from the ERP into the local POS cache. */
export interface CatalogCacheRow {
  code: string;
  name: string | null;
  barcode: string | null;
  unit: string | null;
  packSize: number | null;
  price: number | null;
  groupCode: string | null;
  subGroupCode: string | null;
  weighted: boolean;
  availableQty: number | null;
  inactive: boolean;
  stale: boolean;
  syncedAt: string;
}

/** Source row read from the live ERP for the downward pull. */
export interface CatalogSourceItem {
  code: string;
  name: string | null;
  barcode: string | null;
  unit: string | null;
  packSize: number | null;
  price: number | null;
  groupCode: string | null;
  subGroupCode: string | null;
  weighted: boolean;
  availableQty: number | null;
  inactive: boolean;
}

/** Summary of a single downward-sync (catalog pull) run. */
export interface CatalogSyncRun {
  id: string;
  status: 'running' | 'success' | 'failed';
  triggeredBy: 'manual' | 'scheduled';
  sourceCount: number;
  upserted: number;
  staled: number;
  durationMs: number | null;
  error: string | null;
  startedAt: string;
  finishedAt: string | null;
}

/** Aggregate cache state for the SyncPage. */
export interface CatalogCacheStatus {
  total: number;
  active: number;
  stale: number;
  lastSyncedAt: string | null;
  lastRun: CatalogSyncRun | null;
}

/**
 * CatalogCacheRepository — the downward (pull) side of POST008. Reads the LIVE
 * ERP catalog (read-only) and mirrors it into MOTECH_POS.CATALOG_CACHE, and
 * records each pull in CATALOG_SYNC_RUNS. The ERP is NEVER written.
 */
export interface CatalogCacheRepository {
  /** Read the current sellable catalog from the live ERP (read-only). */
  readSourceItems(limit?: number): Promise<CatalogSourceItem[]>;

  /**
   * Upsert a batch of source items into CATALOG_CACHE (MERGE per code) and
   * flag any cache row not present in the batch as STALE. Returns { upserted,
   * staled }. Runs in one transaction.
   */
  upsertBatch(
    items: CatalogSourceItem[],
  ): Promise<{ upserted: number; staled: number }>;

  /** Record the start of a pull run; returns its id. */
  startRun(triggeredBy: 'manual' | 'scheduled'): Promise<string>;

  /** Mark a run finished (success/failed) with counts + duration. */
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
  ): Promise<void>;

  /** The most recent run, or null. */
  lastRun(): Promise<CatalogSyncRun | null>;

  /** Recent runs (newest first). */
  listRuns(limit: number): Promise<CatalogSyncRun[]>;

  /** Aggregate cache status for the UI. */
  status(): Promise<CatalogCacheStatus>;

  /** Paginated cached items (code ascending), optional search. */
  listCached(
    search: string | undefined,
    limit: number,
  ): Promise<CatalogCacheRow[]>;
}
