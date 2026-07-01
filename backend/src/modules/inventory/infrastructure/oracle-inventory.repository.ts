import { Injectable } from '@nestjs/common';
import type { BindParameters } from 'oracledb';
import { OracleService } from '../../../infrastructure/oracle/oracle.service';
import {
  InventoryItemDetail,
  InventoryItemRow,
  InventoryListFilter,
  InventoryListResult,
  InventoryRepository,
  InventoryStockRow,
  LowStockFilter,
} from '../domain/ports/inventory-repository.port';

/**
 * OracleInventoryRepository — reads the REAL, PRESENT stock data only.
 *
 * Sources (proof-based):
 *   - YSPOS23.MV_ITEM_AVL_QTY  → I_CODE, W_CODE, BATCH_NO, EXPIRE_DATE, AVL_QTY
 *                                (2,004 rows, 1,280 distinct items — qty authority)
 *   - IAS202623.IAS_ITM_MST    → I_CODE, I_NAME (Arabic name; MOTECH_RO SELECT ok)
 *
 * STRICTLY READ-ONLY (MOTECH_RO). Schema-qualified, bind variables only.
 */
@Injectable()
export class OracleInventoryRepository implements InventoryRepository {
  constructor(private readonly oracle: OracleService) {}

  private get schema(): string {
    return this.oracle.schema();
  }

  private get masterSchema(): string {
    return this.oracle.masterSchema();
  }

  async list(filter: InventoryListFilter): Promise<InventoryListResult> {
    const binds: Record<string, unknown> = { lim: filter.limit + 1 };
    const where: string[] = [];

    if (filter.search) {
      where.push(
        '(UPPER(q.I_CODE) LIKE UPPER(:search) OR nm.I_NAME LIKE :search)',
      );
      binds.search = `%${filter.search}%`;
    }
    if (filter.cursor) {
      where.push('q.I_CODE > :cur');
      binds.cur = filter.cursor;
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const sql = `
      SELECT * FROM (
        SELECT q.I_CODE,
               MAX(nm.I_NAME)         AS I_NAME,
               SUM(q.AVL_QTY)         AS TOTAL_QTY,
               COUNT(DISTINCT q.W_CODE) AS WH_CNT
        FROM ${this.schema}.MV_ITEM_AVL_QTY q
        LEFT JOIN ${this.masterSchema}.IAS_ITM_MST nm ON nm.I_CODE = q.I_CODE
        ${whereSql}
        GROUP BY q.I_CODE
        ORDER BY q.I_CODE
      ) WHERE ROWNUM <= :lim`;

    type Row = {
      I_CODE: string;
      I_NAME: string | null;
      TOTAL_QTY: number;
      WH_CNT: number;
    };
    const rows = await this.oracle.query<Row>(sql, binds as BindParameters);

    const sliced = rows.slice(0, filter.limit);
    let nextCursor: string | undefined;
    if (rows.length > filter.limit) {
      nextCursor = sliced[sliced.length - 1].I_CODE;
    }
    return { items: sliced.map((r) => this.toRow(r)), nextCursor };
  }

  async findByCode(code: string): Promise<InventoryItemDetail | null> {
    // Grouping by I_CODE means unknown codes return zero rows (not a NULL row),
    // so a missing item is correctly distinguished (→ 404 at the service).
    const head = await this.oracle.queryOne<{
      I_CODE: string;
      I_NAME: string | null;
    }>(
      `SELECT q.I_CODE, MAX(nm.I_NAME) AS I_NAME
       FROM ${this.schema}.MV_ITEM_AVL_QTY q
       LEFT JOIN ${this.masterSchema}.IAS_ITM_MST nm ON nm.I_CODE = q.I_CODE
       WHERE q.I_CODE = :code
       GROUP BY q.I_CODE`,
      { code },
    );
    if (!head) return null; // no stock rows at all for this code

    const stockRows = await this.oracle.query<{
      W_CODE: number;
      BATCH_NO: string | null;
      EXPIRE_DATE: string | null;
      AVL_QTY: number;
    }>(
      `SELECT W_CODE, BATCH_NO,
              TO_CHAR(EXPIRE_DATE, 'YYYY-MM-DD') AS EXPIRE_DATE,
              SUM(AVL_QTY) AS AVL_QTY
       FROM ${this.schema}.MV_ITEM_AVL_QTY
       WHERE I_CODE = :code
       GROUP BY W_CODE, BATCH_NO, EXPIRE_DATE
       ORDER BY W_CODE, BATCH_NO`,
      { code },
    );

    const stock: InventoryStockRow[] = stockRows.map((s) => ({
      warehouseCode: Number(s.W_CODE),
      batchNo: s.BATCH_NO ?? null,
      expireDate: s.EXPIRE_DATE ?? null,
      availableQty: Number(s.AVL_QTY ?? 0),
    }));
    const totalAvailableQty = stock.reduce((a, s) => a + s.availableQty, 0);
    const warehouseCount = new Set(stock.map((s) => s.warehouseCode)).size;

    return {
      code,
      name: head.I_NAME ?? null,
      totalAvailableQty,
      warehouseCount,
      stock,
    };
  }

  async lowStock(filter: LowStockFilter): Promise<InventoryItemRow[]> {
    const sql = `
      SELECT * FROM (
        SELECT q.I_CODE,
               MAX(nm.I_NAME)         AS I_NAME,
               SUM(q.AVL_QTY)         AS TOTAL_QTY,
               COUNT(DISTINCT q.W_CODE) AS WH_CNT
        FROM ${this.schema}.MV_ITEM_AVL_QTY q
        LEFT JOIN ${this.masterSchema}.IAS_ITM_MST nm ON nm.I_CODE = q.I_CODE
        GROUP BY q.I_CODE
        HAVING SUM(q.AVL_QTY) <= :thr
        ORDER BY SUM(q.AVL_QTY) ASC, q.I_CODE
      ) WHERE ROWNUM <= :lim`;

    type Row = {
      I_CODE: string;
      I_NAME: string | null;
      TOTAL_QTY: number;
      WH_CNT: number;
    };
    const rows = await this.oracle.query<Row>(sql, {
      thr: filter.threshold,
      lim: filter.limit,
    } as BindParameters);
    return rows.map((r) => this.toRow(r));
  }

  private toRow(r: {
    I_CODE: string;
    I_NAME: string | null;
    TOTAL_QTY: number;
    WH_CNT: number;
  }): InventoryItemRow {
    return {
      code: r.I_CODE,
      name: r.I_NAME ?? null,
      totalAvailableQty: Number(r.TOTAL_QTY ?? 0),
      warehouseCount: Number(r.WH_CNT ?? 0),
    };
  }
}
