import { Injectable } from '@nestjs/common';
import oracledb from 'oracledb';
import type { BindParameters } from 'oracledb';
import { OracleService } from '../../../infrastructure/oracle/oracle.service';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import {
  CatalogCacheRepository,
  CatalogCacheRow,
  CatalogCacheStatus,
  CatalogSourceItem,
  CatalogSyncRun,
} from '../domain/ports/catalog-cache.port';

interface RunRow {
  ID: string;
  STATUS: string;
  TRIGGERED_BY: string;
  SOURCE_COUNT: number;
  UPSERTED: number;
  STALED: number;
  DURATION_MS: number | null;
  ERROR: string | null;
  STARTED_AT: Date;
  FINISHED_AT: Date | null;
}

/**
 * OracleCatalogCacheRepository — the downward catalog-pull adapter (POST008).
 *
 * READS the LIVE ERP catalog through the read-only pool (OracleService →
 * MOTECH_RO): IAS202623.IAS_ITM_MST (Arabic name/group/weighted/inactive),
 * IAS202623.IAS_ITEM_PRICE (retail price LEV_NO=1, base unit) and
 * YSPOS23.MV_ITEM_AVL_QTY (available qty). WRITES only to MOTECH_POS
 * (CATALOG_CACHE / CATALOG_SYNC_RUNS) through the write pool — the ERP is
 * never mutated. Schema-qualified SQL + bind variables only.
 */
@Injectable()
export class OracleCatalogCacheRepository implements CatalogCacheRepository {
  constructor(
    private readonly read: OracleService,
    private readonly write: OracleWriteService,
  ) {}

  private get wschema(): string {
    return this.write.schema();
  }

  private get pos(): string {
    return this.read.schema(); // YSPOS23
  }

  private get master(): string {
    return this.read.masterSchema(); // IAS202623
  }

  //==========================================================================
  // READ from the live ERP (read-only)
  //==========================================================================

  async readSourceItems(limit = 20000): Promise<CatalogSourceItem[]> {
    // Base unit + retail price at LEV_NO=1 (smallest pack size), the item
    // master row, and the summed available quantity across warehouses.
    const rows = await this.read.query<{
      I_CODE: string;
      I_NAME: string | null;
      G_CODE: string | null;
      MNG_CODE: string | null;
      WEIGHTED: number | null;
      INACTIVE: number | null;
      BARCODE: string | null;
      ITM_UNT: string | null;
      P_SIZE: number | null;
      I_PRICE: number | null;
      AVL_QTY: number | null;
    }>(
      `SELECT * FROM (
        SELECT m.I_CODE,
               m.I_NAME,
               m.G_CODE,
               m.MNG_CODE,
               NVL(m.WEIGHTED, 0) AS WEIGHTED,
               NVL(m.INACTIVE, 0) AS INACTIVE,
               pr.BARCODE,
               pr.ITM_UNT,
               pr.P_SIZE,
               pr.I_PRICE,
               q.AVL_QTY
        FROM ${this.master}.IAS_ITM_MST m
        LEFT JOIN (
          SELECT p.I_CODE, p.ITM_UNT, p.P_SIZE, p.I_PRICE, d.BARCODE
          FROM (
            SELECT pr.I_CODE, pr.ITM_UNT, pr.P_SIZE, pr.I_PRICE,
                   ROW_NUMBER() OVER (
                     PARTITION BY pr.I_CODE ORDER BY pr.P_SIZE ASC, pr.ITM_UNT
                   ) AS RN
            FROM ${this.master}.IAS_ITEM_PRICE pr
            WHERE pr.LEV_NO = 1
          ) p
          LEFT JOIN ${this.master}.IAS_ITM_DTL d
            ON d.I_CODE = p.I_CODE AND d.ITM_UNT = p.ITM_UNT
          WHERE p.RN = 1
        ) pr ON pr.I_CODE = m.I_CODE
        LEFT JOIN (
          SELECT I_CODE, SUM(AVL_QTY) AS AVL_QTY
          FROM ${this.pos}.MV_ITEM_AVL_QTY
          GROUP BY I_CODE
        ) q ON q.I_CODE = m.I_CODE
        ORDER BY m.I_CODE
      ) WHERE ROWNUM <= :lim`,
      { lim: limit } as BindParameters,
    );
    return rows.map((r) => ({
      code: r.I_CODE,
      name: r.I_NAME ?? null,
      barcode: r.BARCODE ?? null,
      unit: r.ITM_UNT ?? null,
      packSize: r.P_SIZE == null ? null : Number(r.P_SIZE),
      price: r.I_PRICE == null ? null : Number(r.I_PRICE),
      groupCode: r.G_CODE ?? null,
      subGroupCode: r.MNG_CODE ?? null,
      weighted: Number(r.WEIGHTED ?? 0) === 1,
      availableQty: r.AVL_QTY == null ? null : Number(r.AVL_QTY),
      inactive: Number(r.INACTIVE ?? 0) === 1,
    }));
  }

  //==========================================================================
  // WRITE into MOTECH_POS.CATALOG_CACHE
  //==========================================================================

  async upsertBatch(
    items: CatalogSourceItem[],
  ): Promise<{ upserted: number; staled: number }> {
    const table = `${this.wschema}.CATALOG_CACHE`;
    return this.write.withTransaction(async (conn) => {
      let upserted = 0;
      for (const it of items) {
        await conn.execute(
          `MERGE INTO ${table} t
           USING (SELECT :code AS I_CODE FROM DUAL) s
           ON (t.I_CODE = s.I_CODE)
           WHEN MATCHED THEN UPDATE SET
             t.I_NAME = :name, t.BARCODE = :barcode, t.UNIT = :unit,
             t.PACK_SIZE = :packSize, t.PRICE = :price, t.G_CODE = :gcode,
             t.MNG_CODE = :mng, t.WEIGHTED = :weighted, t.AVL_QTY = :avl,
             t.INACTIVE = :inactive, t.STALE = 0, t.SYNCED_AT = SYSTIMESTAMP
           WHEN NOT MATCHED THEN INSERT
             (I_CODE, I_NAME, BARCODE, UNIT, PACK_SIZE, PRICE, G_CODE, MNG_CODE,
              WEIGHTED, AVL_QTY, INACTIVE, STALE)
           VALUES
             (:code, :name, :barcode, :unit, :packSize, :price, :gcode, :mng,
              :weighted, :avl, :inactive, 0)`,
          {
            code: it.code,
            name: it.name,
            barcode: it.barcode,
            unit: it.unit,
            packSize: { val: it.packSize ?? null, type: oracledb.NUMBER },
            price: { val: it.price ?? null, type: oracledb.NUMBER },
            gcode: it.groupCode,
            mng: it.subGroupCode,
            weighted: { val: it.weighted ? 1 : 0, type: oracledb.NUMBER },
            avl: { val: it.availableQty ?? null, type: oracledb.NUMBER },
            inactive: { val: it.inactive ? 1 : 0, type: oracledb.NUMBER },
          } as BindParameters,
        );
        upserted++;
      }
      // Flag any cache row not seen in this pull as STALE (removed/renamed in
      // the ERP) — without deleting, so history/lookups still resolve.
      const codes = items.map((i) => i.code);
      let staled = 0;
      if (codes.length > 0) {
        // Chunk the NOT IN list to stay within Oracle's 1000-literal limit.
        // We stage the seen codes in a GTT-free way: mark all stale, then
        // clear stale for the seen codes in chunks.
        await conn.execute(
          `UPDATE ${table} SET STALE = 1 WHERE STALE = 0`,
        );
        const chunkSize = 500;
        for (let i = 0; i < codes.length; i += chunkSize) {
          const chunk = codes.slice(i, i + chunkSize);
          const binds: Record<string, unknown> = {};
          const placeholders = chunk
            .map((c, idx) => {
              const k = `c${idx}`;
              binds[k] = c;
              return `:${k}`;
            })
            .join(',');
          await conn.execute(
            `UPDATE ${table} SET STALE = 0 WHERE I_CODE IN (${placeholders})`,
            binds as BindParameters,
          );
        }
        const staleRow = await conn.execute<{ N: number }>(
          `SELECT COUNT(*) AS N FROM ${table} WHERE STALE = 1`,
          {},
          { outFormat: oracledb.OUT_FORMAT_OBJECT },
        );
        staled = Number((staleRow.rows?.[0] as { N: number } | undefined)?.N ?? 0);
      }
      return { upserted, staled };
    });
  }

  //==========================================================================
  // Run audit (CATALOG_SYNC_RUNS)
  //==========================================================================

  async startRun(triggeredBy: 'manual' | 'scheduled'): Promise<string> {
    const id = uuidv7();
    await this.write.execute(
      `INSERT INTO ${this.wschema}.CATALOG_SYNC_RUNS
         (ID, STATUS, TRIGGERED_BY) VALUES (:id, 'running', :trig)`,
      { id, trig: triggeredBy },
    );
    return id;
  }

  async finishRun(
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
    await this.write.execute(
      `UPDATE ${this.wschema}.CATALOG_SYNC_RUNS
         SET STATUS = :st, SOURCE_COUNT = :sc, UPSERTED = :up, STALED = :stl,
             DURATION_MS = :dur, ERROR = :err, FINISHED_AT = SYSTIMESTAMP
       WHERE ID = :id`,
      {
        id,
        st: result.status,
        sc: result.sourceCount,
        up: result.upserted,
        stl: result.staled,
        dur: result.durationMs,
        err: result.error ? result.error.slice(0, 1900) : null,
      },
    );
  }

  private mapRun(r: RunRow): CatalogSyncRun {
    return {
      id: r.ID,
      status: r.STATUS as CatalogSyncRun['status'],
      triggeredBy: r.TRIGGERED_BY as CatalogSyncRun['triggeredBy'],
      sourceCount: Number(r.SOURCE_COUNT),
      upserted: Number(r.UPSERTED),
      staled: Number(r.STALED),
      durationMs: r.DURATION_MS == null ? null : Number(r.DURATION_MS),
      error: r.ERROR ?? null,
      startedAt: r.STARTED_AT.toISOString(),
      finishedAt: r.FINISHED_AT ? r.FINISHED_AT.toISOString() : null,
    };
  }

  async lastRun(): Promise<CatalogSyncRun | null> {
    const row = await this.write.queryOne<RunRow>(
      `SELECT * FROM (
         SELECT * FROM ${this.wschema}.CATALOG_SYNC_RUNS ORDER BY STARTED_AT DESC
       ) WHERE ROWNUM <= 1`,
    );
    return row ? this.mapRun(row) : null;
  }

  async listRuns(limit: number): Promise<CatalogSyncRun[]> {
    const rows = await this.write.query<RunRow>(
      `SELECT * FROM (
         SELECT * FROM ${this.wschema}.CATALOG_SYNC_RUNS ORDER BY STARTED_AT DESC
       ) WHERE ROWNUM <= :lim`,
      { lim: limit } as BindParameters,
    );
    return rows.map((r) => this.mapRun(r));
  }

  async status(): Promise<CatalogCacheStatus> {
    const agg = await this.write.queryOne<{
      TOTAL: number;
      ACTIVE: number;
      STALE: number;
      LAST_SYNC: Date | null;
    }>(
      `SELECT COUNT(*) AS TOTAL,
              SUM(CASE WHEN STALE = 0 AND INACTIVE = 0 THEN 1 ELSE 0 END) AS ACTIVE,
              SUM(CASE WHEN STALE = 1 THEN 1 ELSE 0 END) AS STALE,
              MAX(SYNCED_AT) AS LAST_SYNC
       FROM ${this.wschema}.CATALOG_CACHE`,
    );
    const lastRun = await this.lastRun();
    return {
      total: Number(agg?.TOTAL ?? 0),
      active: Number(agg?.ACTIVE ?? 0),
      stale: Number(agg?.STALE ?? 0),
      lastSyncedAt: agg?.LAST_SYNC ? agg.LAST_SYNC.toISOString() : null,
      lastRun,
    };
  }

  async listCached(
    search: string | undefined,
    limit: number,
  ): Promise<CatalogCacheRow[]> {
    const binds: Record<string, unknown> = { lim: limit };
    let where = '';
    if (search) {
      where = `WHERE (UPPER(I_CODE) LIKE UPPER(:s) OR I_NAME LIKE :s OR UPPER(BARCODE) LIKE UPPER(:s))`;
      binds.s = `%${search}%`;
    }
    const rows = await this.write.query<{
      I_CODE: string;
      I_NAME: string | null;
      BARCODE: string | null;
      UNIT: string | null;
      PACK_SIZE: number | null;
      PRICE: number | null;
      G_CODE: string | null;
      MNG_CODE: string | null;
      WEIGHTED: number;
      AVL_QTY: number | null;
      INACTIVE: number;
      STALE: number;
      SYNCED_AT: Date;
    }>(
      `SELECT * FROM (
         SELECT * FROM ${this.wschema}.CATALOG_CACHE ${where} ORDER BY I_CODE
       ) WHERE ROWNUM <= :lim`,
      binds as BindParameters,
    );
    return rows.map((r) => ({
      code: r.I_CODE,
      name: r.I_NAME ?? null,
      barcode: r.BARCODE ?? null,
      unit: r.UNIT ?? null,
      packSize: r.PACK_SIZE == null ? null : Number(r.PACK_SIZE),
      price: r.PRICE == null ? null : Number(r.PRICE),
      groupCode: r.G_CODE ?? null,
      subGroupCode: r.MNG_CODE ?? null,
      weighted: Number(r.WEIGHTED) === 1,
      availableQty: r.AVL_QTY == null ? null : Number(r.AVL_QTY),
      inactive: Number(r.INACTIVE) === 1,
      stale: Number(r.STALE) === 1,
      syncedAt: r.SYNCED_AT.toISOString(),
    }));
  }
}
