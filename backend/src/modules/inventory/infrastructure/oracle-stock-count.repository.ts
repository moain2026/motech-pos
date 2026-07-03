import { Injectable } from '@nestjs/common';
import type { BindParameters } from 'oracledb';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import {
  CreateStockCountInput,
  ListStockCountsFilter,
  StockCountDetail,
  StockCountHeader,
  StockCountLine,
  StockCountPostIdempotencyViolation,
  StockCountRepository,
  StockCountStatus,
  UpsertLineInput,
} from '../domain/ports/stock-count.port';

interface HeadRow {
  ID: string;
  W_CODE: number;
  STATUS: string;
  NOTE: string | null;
  CREATED_BY: string;
  CREATED_AT: Date;
  POSTED_BY: string | null;
  POSTED_AT: Date | null;
  LINE_CNT: number;
  VAR_CNT: number;
}

interface LineRow {
  ID: string;
  ITEM_CODE: string;
  ITEM_NAME: string | null;
  SYSTEM_QTY: number;
  COUNTED_QTY: number;
  DIFF_QTY: number;
  COUNTED_AT: Date;
}

const HEAD_SELECT = `
  SELECT h.ID, h.W_CODE, h.STATUS, h.NOTE, h.CREATED_BY, h.CREATED_AT,
         h.POSTED_BY, h.POSTED_AT,
         NVL(l.LINE_CNT, 0) AS LINE_CNT,
         NVL(l.VAR_CNT, 0)  AS VAR_CNT`;

/**
 * OracleStockCountRepository — persists جرد sessions in MOTECH_POS
 * (STOCK_COUNTS + STOCK_COUNT_LINES, V015). SYSTEM_QTY snapshots come from
 * the live YSPOS23.MV_ITEM_AVL_QTY (read via the same MOTECH_RW pool — it has
 * SELECT there); Arabic names from IAS202623.IAS_ITM_MST. Counts NEVER mutate
 * Onyx stock — they are audit records (variance report), mirroring Onyx
 * POST018 (IAS_POS_AUD_ITEM) semantics.
 */
@Injectable()
export class OracleStockCountRepository implements StockCountRepository {
  constructor(private readonly db: OracleWriteService) {}

  private get schema(): string {
    return this.db.schema();
  }

  private get onyx(): string {
    return this.db.onyxSchema();
  }

  async create(input: CreateStockCountInput): Promise<StockCountDetail> {
    const id = uuidv7();
    await this.db.execute(
      `INSERT INTO ${this.schema}.STOCK_COUNTS (ID, W_CODE, NOTE, CREATED_BY)
       VALUES (:id, :wCode, :note, :createdBy)`,
      {
        id,
        wCode: input.warehouseCode,
        note: input.note,
        createdBy: input.createdBy,
      },
    );
    const created = await this.findById(id);
    if (!created) throw new Error('create: stock count vanished after insert');
    return created;
  }

  async findById(id: string): Promise<StockCountDetail | null> {
    const head = await this.headWhere('h.ID = :k', id);
    if (!head) return null;
    return { ...head, lines: await this.linesOf(id) };
  }

  async findByPostIdempotencyKey(
    key: string,
  ): Promise<StockCountDetail | null> {
    const head = await this.headWhere('h.POST_IDEMPOTENCY_KEY = :k', key);
    if (!head) return null;
    return { ...head, lines: await this.linesOf(head.id) };
  }

  async list(filter: ListStockCountsFilter): Promise<StockCountHeader[]> {
    const binds: Record<string, unknown> = { lim: filter.limit };
    let where = '';
    if (filter.status) {
      where = 'WHERE h.STATUS = :st';
      binds.st = filter.status;
    }
    const rows = await this.db.query<HeadRow>(
      `SELECT * FROM (
         ${HEAD_SELECT}
         FROM ${this.schema}.STOCK_COUNTS h
         LEFT JOIN (
           SELECT COUNT_ID, COUNT(*) AS LINE_CNT,
                  SUM(CASE WHEN DIFF_QTY <> 0 THEN 1 ELSE 0 END) AS VAR_CNT
           FROM ${this.schema}.STOCK_COUNT_LINES GROUP BY COUNT_ID
         ) l ON l.COUNT_ID = h.ID
         ${where}
         ORDER BY h.CREATED_AT DESC
       ) WHERE ROWNUM <= :lim`,
      binds as BindParameters,
    );
    return rows.map((r) => this.toHeader(r));
  }

  async upsertLine(input: UpsertLineInput): Promise<StockCountLine> {
    const diff = round4(input.countedQty - input.systemQty);
    // MERGE = idempotent re-count of the same item (UQ COUNT_ID+ITEM_CODE).
    await this.db.execute(
      `MERGE INTO ${this.schema}.STOCK_COUNT_LINES t
       USING (SELECT :countId AS COUNT_ID, :itemCode AS ITEM_CODE FROM DUAL) s
       ON (t.COUNT_ID = s.COUNT_ID AND t.ITEM_CODE = s.ITEM_CODE)
       WHEN MATCHED THEN UPDATE SET
         t.ITEM_NAME = :itemName, t.SYSTEM_QTY = :systemQty,
         t.COUNTED_QTY = :countedQty, t.DIFF_QTY = :diff,
         t.COUNTED_AT = SYSTIMESTAMP
       WHEN NOT MATCHED THEN INSERT
         (ID, COUNT_ID, ITEM_CODE, ITEM_NAME, SYSTEM_QTY, COUNTED_QTY, DIFF_QTY)
       VALUES
         (:newId, :countId2, :itemCode2, :itemName2, :systemQty2, :countedQty2,
          :diff2)`,
      {
        countId: input.countId,
        itemCode: input.itemCode,
        itemName: input.itemName,
        systemQty: input.systemQty,
        countedQty: input.countedQty,
        diff,
        newId: uuidv7(),
        countId2: input.countId,
        itemCode2: input.itemCode,
        itemName2: input.itemName,
        systemQty2: input.systemQty,
        countedQty2: input.countedQty,
        diff2: diff,
      },
    );
    const row = await this.db.queryOne<LineRow>(
      `SELECT ID, ITEM_CODE, ITEM_NAME, SYSTEM_QTY, COUNTED_QTY, DIFF_QTY,
              COUNTED_AT
       FROM ${this.schema}.STOCK_COUNT_LINES
       WHERE COUNT_ID = :c AND ITEM_CODE = :i`,
      { c: input.countId, i: input.itemCode },
    );
    if (!row) throw new Error('upsertLine: line vanished after merge');
    return this.toLine(row);
  }

  async post(
    id: string,
    postedBy: string,
    idempotencyKey: string,
  ): Promise<StockCountDetail> {
    try {
      // Guarded UPDATE: only flips a DRAFT row — a concurrent/second post
      // matches zero rows (checked by the service via re-read) or trips the
      // UNIQUE POST_IDEMPOTENCY_KEY backstop.
      await this.db.execute(
        `UPDATE ${this.schema}.STOCK_COUNTS
         SET STATUS = 'POSTED', POSTED_BY = :postedBy, POSTED_AT = SYSTIMESTAMP,
             POST_IDEMPOTENCY_KEY = :idemKey
         WHERE ID = :id AND STATUS = 'DRAFT'`,
        { postedBy, idemKey: idempotencyKey, id },
      );
    } catch (err) {
      if (this.isUniqueViolation(err)) {
        throw new StockCountPostIdempotencyViolation();
      }
      throw err;
    }
    const posted = await this.findById(id);
    if (!posted) throw new Error('post: stock count vanished after update');
    return posted;
  }

  async systemQty(itemCode: string, warehouseCode: number): Promise<number> {
    const row = await this.db.queryOne<{ Q: number }>(
      `SELECT NVL(SUM(AVL_QTY), 0) AS Q
       FROM ${this.onyx}.MV_ITEM_AVL_QTY
       WHERE I_CODE = :i AND W_CODE = :w`,
      { i: itemCode, w: warehouseCode },
    );
    return Number(row?.Q ?? 0);
  }

  async itemName(itemCode: string): Promise<string | null> {
    const row = await this.db.queryOne<{ I_NAME: string | null }>(
      `SELECT I_NAME FROM ${this.db.masterSchema()}.IAS_ITM_MST WHERE I_CODE = :i`,
      { i: itemCode },
    );
    return row ? (row.I_NAME ?? null) : null;
  }

  // ---- helpers ----

  private async headWhere(
    predicate: string,
    bind: string,
  ): Promise<StockCountHeader | null> {
    const row = await this.db.queryOne<HeadRow>(
      `${HEAD_SELECT}
       FROM ${this.schema}.STOCK_COUNTS h
       LEFT JOIN (
         SELECT COUNT_ID, COUNT(*) AS LINE_CNT,
                SUM(CASE WHEN DIFF_QTY <> 0 THEN 1 ELSE 0 END) AS VAR_CNT
         FROM ${this.schema}.STOCK_COUNT_LINES GROUP BY COUNT_ID
       ) l ON l.COUNT_ID = h.ID
       WHERE ${predicate}`,
      { k: bind },
    );
    return row ? this.toHeader(row) : null;
  }

  private async linesOf(countId: string): Promise<StockCountLine[]> {
    const rows = await this.db.query<LineRow>(
      `SELECT ID, ITEM_CODE, ITEM_NAME, SYSTEM_QTY, COUNTED_QTY, DIFF_QTY,
              COUNTED_AT
       FROM ${this.schema}.STOCK_COUNT_LINES
       WHERE COUNT_ID = :c ORDER BY ITEM_CODE`,
      { c: countId },
    );
    return rows.map((r) => this.toLine(r));
  }

  private toHeader(r: HeadRow): StockCountHeader {
    return {
      id: r.ID,
      warehouseCode: Number(r.W_CODE),
      status: r.STATUS as StockCountStatus,
      note: r.NOTE,
      createdBy: r.CREATED_BY,
      createdAt: r.CREATED_AT.toISOString(),
      postedBy: r.POSTED_BY,
      postedAt: r.POSTED_AT ? r.POSTED_AT.toISOString() : null,
      lineCount: Number(r.LINE_CNT ?? 0),
      varianceCount: Number(r.VAR_CNT ?? 0),
    };
  }

  private toLine(r: LineRow): StockCountLine {
    return {
      lineId: r.ID,
      itemCode: r.ITEM_CODE,
      itemName: r.ITEM_NAME,
      systemQty: Number(r.SYSTEM_QTY),
      countedQty: Number(r.COUNTED_QTY),
      diffQty: Number(r.DIFF_QTY),
      countedAt: r.COUNTED_AT.toISOString(),
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

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
