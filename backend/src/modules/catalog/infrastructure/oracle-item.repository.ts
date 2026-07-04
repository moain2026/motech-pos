import { Injectable } from '@nestjs/common';
import type { BindParameters } from 'oracledb';
import { OracleService } from '../../../infrastructure/oracle/oracle.service';
import { Item, ItemStock } from '../domain/entities/item.entity';
import {
  CategoryNode,
  ItemDetail,
  ItemListFilter,
  ItemListResult,
  ItemPriceLevel,
  ItemRepository,
  ItemStockLimits,
  ItemTypeRow,
  ItemUnit,
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

  private get masterSchema(): string {
    return this.oracle.masterSchema();
  }

  /**
   * Canonical item-name source: IAS202623.IAS_ITM_MST (Arabic I_NAME keyed by
   * I_CODE). MOTECH_RO has SELECT (granted 2026-06-29). Read-only, qualified.
   */
  private nameSubquery(alias: string): string {
    return `(
      SELECT m.I_CODE, m.I_NAME, m.G_CODE, m.MNG_CODE,
             NVL(m.WEIGHTED, 0) AS WEIGHTED, NVL(m.INACTIVE, 0) AS INACTIVE
      FROM ${this.masterSchema}.IAS_ITM_MST m
    ) ${alias}`;
  }

  /**
   * Live price-list price per item: LEV_NO = 1 (retail), smallest pack size
   * (base unit). Source: IAS202623.IAS_ITEM_PRICE (2,523 rows).
   */
  private priceListSubquery(alias: string): string {
    return `(
      SELECT p.I_CODE, p.I_PRICE AS LIST_PRICE
      FROM (
        SELECT pr.I_CODE, pr.I_PRICE,
               ROW_NUMBER() OVER (
                 PARTITION BY pr.I_CODE ORDER BY pr.P_SIZE ASC, pr.ITM_UNT
               ) AS RN
        FROM ${this.masterSchema}.IAS_ITEM_PRICE pr
        WHERE pr.LEV_NO = 1
      ) p
      WHERE p.RN = 1
    ) ${alias}`;
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
      // Search by item code, barcode, OR Arabic name (substring).
      where.push(
        '(UPPER(q.I_CODE) LIKE UPPER(:search) OR UPPER(e.LAST_BARCODE) LIKE UPPER(:search) OR nm.I_NAME LIKE :search)',
      );
      binds.search = `%${filter.search}%`;
    }
    if (filter.cursor) {
      where.push('q.I_CODE > :cur');
      binds.cur = filter.cursor;
    }
    if (filter.category) {
      where.push('nm.G_CODE = :cat');
      binds.cat = filter.category;
    }
    if (filter.subCategory) {
      where.push('nm.MNG_CODE = :subcat');
      binds.subcat = filter.subCategory;
    }
    if (filter.weighted !== undefined) {
      where.push('nm.WEIGHTED = :wgt');
      binds.wgt = filter.weighted ? 1 : 0;
    }
    if (filter.active !== undefined) {
      where.push('nm.INACTIVE = :inact');
      binds.inact = filter.active ? 0 : 1;
    }
    // Effective price = live price list (LEV_NO 1) or last-observed sale price.
    if (filter.minPrice !== undefined) {
      where.push('COALESCE(pl.LIST_PRICE, e.LAST_PRICE) >= :pmin');
      binds.pmin = filter.minPrice;
    }
    if (filter.maxPrice !== undefined) {
      where.push('COALESCE(pl.LIST_PRICE, e.LAST_PRICE) <= :pmax');
      binds.pmax = filter.maxPrice;
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const sql = `
      SELECT * FROM (
        SELECT q.I_CODE,
               MAX(nm.I_NAME)        AS I_NAME,
               SUM(q.AVL_QTY)        AS TOTAL_QTY,
               MAX(COALESCE(pl.LIST_PRICE, e.LAST_PRICE)) AS LAST_PRICE,
               MAX(e.LAST_BARCODE)   AS LAST_BARCODE,
               MAX(e.LAST_UNIT)      AS LAST_UNIT,
               MAX(e.LAST_PSIZE)     AS LAST_PSIZE
        FROM ${this.schema}.MV_ITEM_AVL_QTY q
        LEFT JOIN ${this.enrichmentSubquery('e')} ON e.I_CODE = q.I_CODE
        LEFT JOIN ${this.nameSubquery('nm')} ON nm.I_CODE = q.I_CODE
        LEFT JOIN ${this.priceListSubquery('pl')} ON pl.I_CODE = q.I_CODE
        ${whereSql}
        GROUP BY q.I_CODE
        ORDER BY q.I_CODE
      ) WHERE ROWNUM <= :lim`;

    type Row = {
      I_CODE: string;
      I_NAME: string | null;
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
      I_NAME: string | null;
      LAST_PRICE: number | null;
      LAST_BARCODE: string | null;
      LAST_UNIT: string | null;
      LAST_PSIZE: number | null;
    }>(
      `SELECT q.I_CODE,
              MAX(nm.I_NAME)      AS I_NAME,
              MAX(COALESCE(pl.LIST_PRICE, e.LAST_PRICE)) AS LAST_PRICE,
              MAX(e.LAST_BARCODE) AS LAST_BARCODE,
              MAX(e.LAST_UNIT)    AS LAST_UNIT,
              MAX(e.LAST_PSIZE)   AS LAST_PSIZE
       FROM ${this.schema}.MV_ITEM_AVL_QTY q
       LEFT JOIN ${this.enrichmentSubquery('e')} ON e.I_CODE = q.I_CODE
       LEFT JOIN ${this.nameSubquery('nm')} ON nm.I_CODE = q.I_CODE
       LEFT JOIN ${this.priceListSubquery('pl')} ON pl.I_CODE = q.I_CODE
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
    I_NAME: string | null;
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
      name: head.I_NAME,
      barcode: head.LAST_BARCODE,
      unit: head.LAST_UNIT,
      packSize: head.LAST_PSIZE == null ? null : Number(head.LAST_PSIZE),
      lastPrice: head.LAST_PRICE == null ? null : Number(head.LAST_PRICE),
    });
    return { item, stock, totalAvailableQty };
  }

  async listPrices(code: string): Promise<ItemPriceLevel[]> {
    const rows = await this.oracle.query<{
      LEV_NO: number;
      ITM_UNT: string | null;
      P_SIZE: number | null;
      W_CODE: number | null;
      I_PRICE: number;
      MIN_ITM_PRICE: number | null;
      MAX_ITM_PRICE: number | null;
    }>(
      `SELECT LEV_NO, ITM_UNT, P_SIZE, W_CODE, I_PRICE,
              MIN_ITM_PRICE, MAX_ITM_PRICE
       FROM ${this.masterSchema}.IAS_ITEM_PRICE
       WHERE I_CODE = :code
       ORDER BY LEV_NO, P_SIZE, ITM_UNT`,
      { code },
    );
    return rows.map((r) => ({
      levNo: Number(r.LEV_NO),
      unit: r.ITM_UNT ?? null,
      packSize: r.P_SIZE == null ? null : Number(r.P_SIZE),
      warehouseCode: r.W_CODE == null ? null : Number(r.W_CODE),
      price: Number(r.I_PRICE),
      minPrice: r.MIN_ITM_PRICE == null ? null : Number(r.MIN_ITM_PRICE),
      maxPrice: r.MAX_ITM_PRICE == null ? null : Number(r.MAX_ITM_PRICE),
    }));
  }

  async findPriceAtLevel(
    code: string,
    levNo: number,
    unit?: string | null,
  ): Promise<ItemPriceLevel | null> {
    const binds: Record<string, unknown> = { code, lev: levNo };
    let unitSql = '';
    if (unit) {
      unitSql = 'AND ITM_UNT = :unt';
      binds.unt = unit;
    }
    const row = await this.oracle.queryOne<{
      LEV_NO: number;
      ITM_UNT: string | null;
      P_SIZE: number | null;
      W_CODE: number | null;
      I_PRICE: number;
      MIN_ITM_PRICE: number | null;
      MAX_ITM_PRICE: number | null;
    }>(
      `SELECT * FROM (
         SELECT LEV_NO, ITM_UNT, P_SIZE, W_CODE, I_PRICE,
                MIN_ITM_PRICE, MAX_ITM_PRICE
         FROM ${this.masterSchema}.IAS_ITEM_PRICE
         WHERE I_CODE = :code AND LEV_NO = :lev ${unitSql}
         ORDER BY P_SIZE ASC, ITM_UNT
       ) WHERE ROWNUM <= 1`,
      binds as BindParameters,
    );
    if (!row) return null;
    return {
      levNo: Number(row.LEV_NO),
      unit: row.ITM_UNT ?? null,
      packSize: row.P_SIZE == null ? null : Number(row.P_SIZE),
      warehouseCode: row.W_CODE == null ? null : Number(row.W_CODE),
      price: Number(row.I_PRICE),
      minPrice: row.MIN_ITM_PRICE == null ? null : Number(row.MIN_ITM_PRICE),
      maxPrice: row.MAX_ITM_PRICE == null ? null : Number(row.MAX_ITM_PRICE),
    };
  }

  async listUnits(code: string): Promise<ItemUnit[]> {
    const rows = await this.oracle.query<{
      ITM_UNT: string;
      P_SIZE: number;
      BARCODE: string | null;
      MAIN_UNIT: number | null;
      SALE_UNIT: number | null;
      PUR_UNIT: number | null;
      STOCK_UNIT: number | null;
      NO_SALE: number | null;
      INACTIVE: number | null;
      LIST_PRICE: number | null;
    }>(
      `SELECT d.ITM_UNT, d.P_SIZE, d.BARCODE,
              d.MAIN_UNIT, d.SALE_UNIT, d.PUR_UNIT, d.STOCK_UNIT,
              d.NO_SALE, d.INACTIVE,
              p.I_PRICE AS LIST_PRICE
       FROM ${this.masterSchema}.IAS_ITM_DTL d
       LEFT JOIN ${this.masterSchema}.IAS_ITEM_PRICE p
         ON p.I_CODE = d.I_CODE AND p.ITM_UNT = d.ITM_UNT AND p.LEV_NO = 1
       WHERE d.I_CODE = :code
       ORDER BY d.P_SIZE ASC, d.ITM_UNT`,
      { code },
    );
    return rows.map((r) => ({
      unit: r.ITM_UNT,
      packSize: Number(r.P_SIZE ?? 1),
      barcode: r.BARCODE ?? null,
      isMainUnit: Number(r.MAIN_UNIT ?? 0) === 1,
      isSaleUnit: Number(r.SALE_UNIT ?? 0) === 1,
      isPurchaseUnit: Number(r.PUR_UNIT ?? 0) === 1,
      isStockUnit: Number(r.STOCK_UNIT ?? 0) === 1,
      noSale: Number(r.NO_SALE ?? 0) === 1,
      inactive: Number(r.INACTIVE ?? 0) === 1,
      price: r.LIST_PRICE == null ? null : Number(r.LIST_PRICE),
    }));
  }

  async findStockLimits(code: string): Promise<ItemStockLimits | null> {
    const row = await this.oracle.queryOne<{
      ITM_MIN_LMT_QTY: number | null;
      ITM_MAX_LMT_QTY: number | null;
      ITM_ROL_LMT_QTY: number | null;
    }>(
      `SELECT ITM_MIN_LMT_QTY, ITM_MAX_LMT_QTY, ITM_ROL_LMT_QTY
       FROM ${this.masterSchema}.IAS_ITM_MST
       WHERE I_CODE = :code`,
      { code },
    );
    if (!row) return null;
    return {
      minLimitQty:
        row.ITM_MIN_LMT_QTY == null ? null : Number(row.ITM_MIN_LMT_QTY),
      maxLimitQty:
        row.ITM_MAX_LMT_QTY == null ? null : Number(row.ITM_MAX_LMT_QTY),
      reorderLimitQty:
        row.ITM_ROL_LMT_QTY == null ? null : Number(row.ITM_ROL_LMT_QTY),
    };
  }

  async listCategories(): Promise<CategoryNode[]> {
    // Main groups + per-group item counts (only groups actually used or defined).
    const groups = await this.oracle.query<{
      G_CODE: string;
      G_A_NAME: string | null;
      G_E_NAME: string | null;
      ITEM_COUNT: number;
    }>(
      `SELECT g.G_CODE, g.G_A_NAME, g.G_E_NAME,
              NVL(c.CNT, 0) AS ITEM_COUNT
       FROM ${this.masterSchema}.GROUP_DETAILS g
       LEFT JOIN (
         SELECT G_CODE, COUNT(*) AS CNT
         FROM ${this.masterSchema}.IAS_ITM_MST
         GROUP BY G_CODE
       ) c ON c.G_CODE = g.G_CODE
       ORDER BY g.G_CODE`,
    );
    const subs = await this.oracle.query<{
      G_CODE: string;
      MNG_CODE: string;
      MNG_A_NAME: string | null;
      MNG_E_NAME: string | null;
      ITEM_COUNT: number;
    }>(
      `SELECT s.G_CODE, s.MNG_CODE, s.MNG_A_NAME, s.MNG_E_NAME,
              NVL(c.CNT, 0) AS ITEM_COUNT
       FROM ${this.masterSchema}.IAS_MAINSUB_GRP_DTL s
       LEFT JOIN (
         SELECT G_CODE, MNG_CODE, COUNT(*) AS CNT
         FROM ${this.masterSchema}.IAS_ITM_MST
         GROUP BY G_CODE, MNG_CODE
       ) c ON c.G_CODE = s.G_CODE AND c.MNG_CODE = s.MNG_CODE
       ORDER BY s.G_CODE, s.MNG_CODE`,
    );
    const byGroup = new Map<string, CategoryNode>();
    for (const g of groups) {
      byGroup.set(g.G_CODE, {
        code: g.G_CODE,
        name: g.G_A_NAME ?? null,
        englishName: g.G_E_NAME ?? null,
        itemCount: Number(g.ITEM_COUNT ?? 0),
        children: [],
      });
    }
    for (const s of subs) {
      const parent = byGroup.get(s.G_CODE);
      if (!parent) continue;
      parent.children.push({
        code: s.MNG_CODE,
        name: s.MNG_A_NAME ?? null,
        englishName: s.MNG_E_NAME ?? null,
        itemCount: Number(s.ITEM_COUNT ?? 0),
      });
    }
    return [...byGroup.values()];
  }

  async listItemTypes(): Promise<ItemTypeRow[]> {
    const rows = await this.oracle.query<{
      TYPE_OF_ITEM: number;
      IT_A_NAME: string | null;
      IT_E_NAME: string | null;
    }>(
      `SELECT TYPE_OF_ITEM, IT_A_NAME, IT_E_NAME
       FROM ${this.masterSchema}.ITEM_TYPES
       ORDER BY TYPE_OF_ITEM`,
    );
    return rows.map((r) => ({
      typeOfItem: Number(r.TYPE_OF_ITEM),
      name: r.IT_A_NAME ?? null,
      englishName: r.IT_E_NAME ?? null,
    }));
  }

  private toItem(r: {
    I_CODE: string;
    I_NAME: string | null;
    LAST_PRICE: number | null;
    LAST_BARCODE: string | null;
    LAST_UNIT: string | null;
    LAST_PSIZE: number | null;
  }): Item {
    return new Item({
      code: r.I_CODE,
      name: r.I_NAME,
      barcode: r.LAST_BARCODE,
      unit: r.LAST_UNIT,
      packSize: r.LAST_PSIZE == null ? null : Number(r.LAST_PSIZE),
      lastPrice: r.LAST_PRICE == null ? null : Number(r.LAST_PRICE),
    });
  }
}
