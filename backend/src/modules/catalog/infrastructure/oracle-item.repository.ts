import { Injectable } from '@nestjs/common';
import type { BindParameters } from 'oracledb';
import { OracleService } from '../../../infrastructure/oracle/oracle.service';
import { Item, ItemStock } from '../domain/entities/item.entity';
import {
  ItemDetail,
  ItemListFilter,
  ItemListResult,
  ItemRepository,
} from '../domain/ports/item-repository.port';

/**
 * OracleItemRepository — reads the REAL, PRESENT data only.
 *
 * The item master lives in the absent `IAS202623` schema (synonyms +
 * INVALID views — see item.entity.ts header). So we reconstruct items from:
 *   - YSPOS23.MV_ITEM_AVL_QTY        → I_CODE, W_CODE, AVL_QTY (qty authority)
 *   - YSPOS23.IAS_POS_BILL_DTL       → last-observed price / barcode / unit
 *
 * READ-ONLY. All SQL is schema-qualified and uses bind variables only.
 */
@Injectable()
export class OracleItemRepository implements ItemRepository {
  constructor(private readonly oracle: OracleService) {}

  private get schema(): string {
    return this.oracle.schema();
  }

  /**
   * Per-item enrichment derived from real sale lines: the most recent
   * non-null price/barcode/unit/pack size observed for the code.
   * Keyed by I_CODE; MAX(BILL_NO) approximates "most recent sale".
   */
  private enrichmentSubquery(alias: string): string {
    return `(
      SELECT e.I_CODE,
             e.I_PRICE   AS LAST_PRICE,
             e.BARCODE   AS LAST_BARCODE,
             e.ITM_UNT   AS LAST_UNIT,
             e.P_SIZE    AS LAST_PSIZE
      FROM (
        SELECT d.I_CODE, d.I_PRICE, d.BARCODE, d.ITM_UNT, d.P_SIZE,
               ROW_NUMBER() OVER (
                 PARTITION BY d.I_CODE ORDER BY d.BILL_NO DESC, d.BILL_SRL DESC
               ) AS RN
        FROM ${this.schema}.IAS_POS_BILL_DTL d
      ) e
      WHERE e.RN = 1
    ) ${alias}`;
  }

  async list(filter: ItemListFilter): Promise<ItemListResult> {
    const binds: Record<string, unknown> = { lim: filter.limit + 1 };
    const where: string[] = [];

    if (filter.search) {
      // Search by item code prefix/substring or exact-ish barcode.
      where.push(
        '(UPPER(q.I_CODE) LIKE UPPER(:search) OR UPPER(e.LAST_BARCODE) LIKE UPPER(:search))',
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
               SUM(q.AVL_QTY)        AS TOTAL_QTY,
               MAX(e.LAST_PRICE)     AS LAST_PRICE,
               MAX(e.LAST_BARCODE)   AS LAST_BARCODE,
               MAX(e.LAST_UNIT)      AS LAST_UNIT,
               MAX(e.LAST_PSIZE)     AS LAST_PSIZE
        FROM ${this.schema}.MV_ITEM_AVL_QTY q
        LEFT JOIN ${this.enrichmentSubquery('e')} ON e.I_CODE = q.I_CODE
        ${whereSql}
        GROUP BY q.I_CODE
        ORDER BY q.I_CODE
      ) WHERE ROWNUM <= :lim`;

    type Row = {
      I_CODE: string;
      TOTAL_QTY: number;
      LAST_PRICE: number | null;
      LAST_BARCODE: string | null;
      LAST_UNIT: string | null;
      LAST_PSIZE: number | null;
    };
    const rows = await this.oracle.query<Row>(sql, binds as BindParameters);

    const sliced = rows.slice(0, filter.limit);
    let nextCursor: string | undefined;
    if (rows.length > filter.limit) {
      nextCursor = sliced[sliced.length - 1].I_CODE;
    }
    const items = sliced.map((r) => this.toItem(r));
    return { items, nextCursor };
  }

  async findByCode(code: string): Promise<ItemDetail | null> {
    const head = await this.oracle.queryOne<{
      I_CODE: string;
      LAST_PRICE: number | null;
      LAST_BARCODE: string | null;
      LAST_UNIT: string | null;
      LAST_PSIZE: number | null;
    }>(
      `SELECT q.I_CODE,
              MAX(e.LAST_PRICE)   AS LAST_PRICE,
              MAX(e.LAST_BARCODE) AS LAST_BARCODE,
              MAX(e.LAST_UNIT)    AS LAST_UNIT,
              MAX(e.LAST_PSIZE)   AS LAST_PSIZE
       FROM ${this.schema}.MV_ITEM_AVL_QTY q
       LEFT JOIN ${this.enrichmentSubquery('e')} ON e.I_CODE = q.I_CODE
       WHERE q.I_CODE = :code
       GROUP BY q.I_CODE`,
      { code },
    );
    if (!head) return null;
    return this.assembleDetail(head);
  }

  async findByBarcode(barcode: string): Promise<ItemDetail | null> {
    // Resolve barcode → item code from real sale history, then load detail.
    const row = await this.oracle.queryOne<{ I_CODE: string }>(
      `SELECT I_CODE FROM (
         SELECT d.I_CODE,
                ROW_NUMBER() OVER (ORDER BY d.BILL_NO DESC, d.BILL_SRL DESC) AS RN
         FROM ${this.schema}.IAS_POS_BILL_DTL d
         WHERE d.BARCODE = :bc
       ) WHERE RN = 1`,
      { bc: barcode },
    );
    if (!row) return null;
    return this.findByCode(row.I_CODE);
  }

  private async assembleDetail(head: {
    I_CODE: string;
    LAST_PRICE: number | null;
    LAST_BARCODE: string | null;
    LAST_UNIT: string | null;
    LAST_PSIZE: number | null;
  }): Promise<ItemDetail> {
    const stockRows = await this.oracle.query<{
      W_CODE: number;
      AVL_QTY: number;
    }>(
      `SELECT W_CODE, SUM(AVL_QTY) AS AVL_QTY
       FROM ${this.schema}.MV_ITEM_AVL_QTY
       WHERE I_CODE = :code
       GROUP BY W_CODE
       ORDER BY W_CODE`,
      { code: head.I_CODE },
    );
    const stock: ItemStock[] = stockRows.map((s) => ({
      warehouseCode: Number(s.W_CODE),
      availableQty: Number(s.AVL_QTY ?? 0),
    }));
    const totalAvailableQty = stock.reduce((acc, s) => acc + s.availableQty, 0);
    const item = new Item({
      code: head.I_CODE,
      barcode: head.LAST_BARCODE,
      unit: head.LAST_UNIT,
      packSize: head.LAST_PSIZE == null ? null : Number(head.LAST_PSIZE),
      lastPrice: head.LAST_PRICE == null ? null : Number(head.LAST_PRICE),
    });
    return { item, stock, totalAvailableQty };
  }

  private toItem(r: {
    I_CODE: string;
    LAST_PRICE: number | null;
    LAST_BARCODE: string | null;
    LAST_UNIT: string | null;
    LAST_PSIZE: number | null;
  }): Item {
    return new Item({
      code: r.I_CODE,
      barcode: r.LAST_BARCODE,
      unit: r.LAST_UNIT,
      packSize: r.LAST_PSIZE == null ? null : Number(r.LAST_PSIZE),
      lastPrice: r.LAST_PRICE == null ? null : Number(r.LAST_PRICE),
    });
  }
}
