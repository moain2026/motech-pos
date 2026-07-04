import { Injectable, Logger } from '@nestjs/common';
import oracledb, { type BindParameters } from 'oracledb';
import { OracleService } from '../../../infrastructure/oracle/oracle.service';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import type { ReceiptItemSnapshot } from '../domain/ports/stock-receipt.port';
import {
  CreateStockIssueInput,
  ListStockIssuesFilter,
  StockIssueDetail,
  StockIssueHeader,
  StockIssueLine,
  StockIssuePostIdempotencyViolation,
  StockIssueRepository,
  StockIssueStatus,
} from '../domain/ports/stock-issue.port';

interface HeadRow {
  ID: string;
  ISSUE_NO: number;
  W_CODE: number;
  DEST_W_CODE: number | null;
  TRANSFER_ID: string | null;
  STATUS: string;
  REF_NO: string | null;
  NOTE: string | null;
  CREATED_BY: string;
  CREATED_AT: Date;
  POSTED_BY: string | null;
  POSTED_AT: Date | null;
  ONYX_DOC_NO: number | null;
  ONYX_DOC_SER: number | null;
  CANCELLED_BY: string | null;
  CANCELLED_AT: Date | null;
  LINE_CNT: number;
}

interface LineRow {
  ID: string;
  ITEM_CODE: string;
  ITEM_NAME: string | null;
  QTY: number;
  ITM_UNT: string | null;
  P_SIZE: number;
  UNIT_COST: number | null;
  NOTE: string | null;
}

const ONYX_CMP_NO = 1;
const ONYX_BRN_NO = 1;
const ONYX_CURRENCY = 'YER';
const ONYX_DEFAULT_ITM_UNT = 'NO';
/** DOC_TYPE=7 is the transfer-out movement (proven by the live rows). */
const ISSUE_DOC_TYPE = 7;
const NO_BATCH = '0';

/**
 * OracleStockIssueRepository — POST028 persistence. The dispatch DOCUMENT
 * lives in MOTECH_POS (STOCK_ISSUES + STOCK_ISSUE_LINES, V025); POSTING
 * writes ITEM_MOVEMENT rows DOC_TYPE=7 / IN_OUT=−1 (stock LEAVES the source)
 * in the same transaction as the guarded DRAFT → POSTED flip, then refreshes
 * MV_ITEM_AVL_QTY. Numbering mirrors the receipt repository exactly.
 */
@Injectable()
export class OracleStockIssueRepository implements StockIssueRepository {
  private readonly logger = new Logger(OracleStockIssueRepository.name);

  constructor(
    private readonly read: OracleService,
    private readonly write: OracleWriteService,
  ) {}

  private get schema(): string {
    return this.write.schema();
  }

  private get master(): string {
    return this.read.masterSchema();
  }

  async create(input: CreateStockIssueInput): Promise<StockIssueDetail> {
    const id = uuidv7();
    await this.write.withTransaction(async (conn) => {
      await conn.execute(
        `INSERT INTO ${this.schema}.STOCK_ISSUES
           (ID, ISSUE_NO, W_CODE, DEST_W_CODE, TRANSFER_ID, REF_NO, NOTE,
            CREATED_BY)
         VALUES
           (:id, ${this.schema}.SEQ_STOCK_ISSUE_NO.NEXTVAL, :wCode,
            :destWCode, :transferId, :refNo, :note, :createdBy)`,
        {
          id,
          wCode: input.warehouseCode,
          destWCode: input.destWarehouseCode,
          transferId: input.transferId,
          refNo: input.refNo,
          note: input.note,
          createdBy: input.createdBy,
        },
      );
      for (const line of input.lines) {
        await conn.execute(
          `INSERT INTO ${this.schema}.STOCK_ISSUE_LINES
             (ID, ISSUE_ID, ITEM_CODE, ITEM_NAME, QTY, ITM_UNT, P_SIZE,
              UNIT_COST, NOTE)
           VALUES
             (:id, :issueId, :itemCode, :itemName, :qty, :itmUnt, :pSize,
              :unitCost, :note)`,
          {
            id: uuidv7(),
            issueId: id,
            itemCode: line.itemCode,
            itemName: line.itemName,
            qty: line.qty,
            itmUnt: line.itmUnt,
            pSize: line.pSize,
            unitCost: line.unitCost,
            note: line.note,
          },
        );
      }
    });
    const created = await this.findById(id);
    if (!created) throw new Error('create: stock issue vanished after insert');
    return created;
  }

  async findById(id: string): Promise<StockIssueDetail | null> {
    const row = await this.write.queryOne<HeadRow>(
      `${this.headSelect()} WHERE s.ID = :k`,
      { k: id },
    );
    if (!row) return null;
    return { ...this.toHeader(row), lines: await this.linesOf(id) };
  }

  async findByPostKey(key: string): Promise<StockIssueDetail | null> {
    const row = await this.write.queryOne<HeadRow>(
      `${this.headSelect()} WHERE s.POST_IDEMPOTENCY_KEY = :k`,
      { k: key },
    );
    if (!row) return null;
    return { ...this.toHeader(row), lines: await this.linesOf(row.ID) };
  }

  async list(filter: ListStockIssuesFilter): Promise<StockIssueHeader[]> {
    const binds: Record<string, unknown> = { lim: filter.limit };
    const where: string[] = [];
    if (filter.status) {
      where.push('s.STATUS = :st');
      binds.st = filter.status;
    }
    if (filter.warehouse != null) {
      where.push('(s.W_CODE = :wh OR s.DEST_W_CODE = :wh)');
      binds.wh = filter.warehouse;
    }
    const rows = await this.write.query<HeadRow>(
      `SELECT * FROM (
         ${this.headSelect()}
         ${where.length > 0 ? 'WHERE ' + where.join(' AND ') : ''}
         ORDER BY s.CREATED_AT DESC
       ) WHERE ROWNUM <= :lim`,
      binds as BindParameters,
    );
    return rows.map((r) => this.toHeader(r));
  }

  async post(
    id: string,
    postedBy: string,
    idempotencyKey: string,
  ): Promise<StockIssueDetail | null> {
    const existing = await this.findById(id);
    if (!existing || existing.lines.length === 0) return null;
    const lines = existing.lines;
    const wCode = existing.warehouseCode;

    // Prefetch ERP numbering OUTSIDE the serializable transaction.
    const docSerRow = await this.write.queryOne<{ N: number }>(
      `SELECT ${this.master}.GNR_DOC_PST_SQ.NEXTVAL AS N FROM DUAL`,
    );
    if (!docSerRow) throw new Error('post: GNR_DOC_PST_SQ returned no value');
    const docSer = Number(docSerRow.N);
    const serials: number[] = [];
    const docSeqs: number[] = [];
    for (let i = 0; i < lines.length; i++) {
      const s = await this.write.queryOne<{ N: number }>(
        `SELECT ${this.master}.IAS_SERIAL_SEQ.NEXTVAL AS N FROM DUAL`,
      );
      const q = await this.write.queryOne<{ N: number }>(
        `SELECT ${this.master}.IAS_DOC_SEQ.NEXTVAL AS N FROM DUAL`,
      );
      if (!s || !q) throw new Error('post: ERP sequence returned no value');
      serials.push(Number(s.N));
      docSeqs.push(Number(q.N));
    }

    let flipped = false;
    try {
      await this.write.withTransaction(async (conn) => {
        const docNoRes = await conn.execute<{ N: number }>(
          `SELECT NVL(MAX(DOC_NO), 0) + 1 AS N
           FROM ${this.master}.ITEM_MOVEMENT WHERE DOC_TYPE = :t`,
          { t: ISSUE_DOC_TYPE },
          { outFormat: oracledb.OUT_FORMAT_OBJECT },
        );
        const docNo = Number(
          (docNoRes.rows?.[0] as { N?: number } | undefined)?.N ?? 1,
        );

        const upd = await conn.execute(
          `UPDATE ${this.schema}.STOCK_ISSUES
           SET STATUS = 'POSTED', POSTED_BY = :postedBy,
               POSTED_AT = SYSTIMESTAMP, POST_IDEMPOTENCY_KEY = :key,
               ONYX_DOC_NO = :docNo, ONYX_DOC_SER = :docSer
           WHERE ID = :id AND STATUS = 'DRAFT'`,
          { postedBy, key: idempotencyKey, docNo, docSer, id },
        );
        if ((upd.rowsAffected ?? 0) === 0) return;
        flipped = true;

        // Stock LEAVES the source: IN_OUT = −1 (transfer-out DOC_TYPE=7).
        for (const [li, l] of lines.entries()) {
          await conn.execute(
            `INSERT INTO ${this.master}.ITEM_MOVEMENT
               (DOC_TYPE, DOC_NO, I_CODE, I_QTY, FREE_QTY, ITM_UNT, P_SIZE,
                P_QTY, PF_QTY, I_DATE, I_COST, W_CODE, STK_COST, A_CY,
                AC_RATE, STK_RATE, A_DESC, EXPIRE_DATE, BATCH_NO, RCRD_NO,
                SERIAL, REF_NO, DOC_SER, DOC_SEQUENCE, IN_OUT, AD_DATE,
                CMP_NO, BRN_NO, BRN_YEAR)
             VALUES
               (:docType, :docNo, :itemCode, :qty, 0, :itmUnt, :pSize,
                :pQty, 0, SYSDATE, :cost, :wCode, :cost2, :cy,
                1, 1, :descr, DATE '1900-01-01', :batch, :rcrdNo,
                :serial, :refNo, :docSer, :docSeq, -1, SYSDATE,
                :cmpNo, :brnNo, EXTRACT(YEAR FROM SYSDATE))`,
            {
              docType: ISSUE_DOC_TYPE,
              docNo,
              itemCode: l.itemCode,
              qty: l.qty,
              itmUnt: l.itmUnt ?? ONYX_DEFAULT_ITM_UNT,
              pSize: l.pSize,
              pQty: l.qty * l.pSize,
              cost: l.unitCost ?? 0,
              cost2: l.unitCost ?? 0,
              wCode,
              cy: ONYX_CURRENCY,
              descr: `MOTECH-POS issue ${idempotencyKey}`.slice(0, 250),
              batch: NO_BATCH,
              rcrdNo: li + 1,
              serial: serials[li],
              refNo: null,
              docSer,
              docSeq: docSeqs[li],
              cmpNo: ONYX_CMP_NO,
              brnNo: ONYX_BRN_NO,
            },
          );
        }
      });
    } catch (err) {
      if (this.isUniqueViolation(err)) {
        throw new StockIssuePostIdempotencyViolation();
      }
      throw err;
    }
    if (!flipped) return null;

    await this.write.refreshOnyxAvailability();
    return this.findById(id);
  }

  async cancel(
    id: string,
    cancelledBy: string,
  ): Promise<StockIssueDetail | null> {
    const res = await this.write.execute(
      `UPDATE ${this.schema}.STOCK_ISSUES
       SET STATUS = 'CANCELLED', CANCELLED_BY = :cancelledBy,
           CANCELLED_AT = SYSTIMESTAMP
       WHERE ID = :id AND STATUS = 'DRAFT'`,
      { cancelledBy, id },
    );
    if ((res.rowsAffected ?? 0) === 0) return null;
    return this.findById(id);
  }

  async warehouseExists(wCode: number): Promise<boolean> {
    const row = await this.read.queryOne<{ ONE: number }>(
      `SELECT 1 AS ONE FROM ${this.read.schema()}.WAREHOUSE_DETAILS
       WHERE W_CODE = :w`,
      { w: wCode },
    );
    return row != null;
  }

  async itemSnapshot(itemCode: string): Promise<ReceiptItemSnapshot | null> {
    const name = await this.read.queryOne<{ I_NAME: string | null }>(
      `SELECT I_NAME FROM ${this.master}.IAS_ITM_MST WHERE I_CODE = :i`,
      { i: itemCode },
    );
    if (!name) return null;
    const unit = await this.read.queryOne<{
      ITM_UNT: string | null;
      P_SIZE: number | null;
    }>(
      `SELECT ITM_UNT, P_SIZE FROM (
         SELECT u.ITM_UNT, u.P_SIZE,
                ROW_NUMBER() OVER (
                  ORDER BY NVL(u.STOCK_UNIT, 0) DESC, NVL(u.MAIN_UNIT, 0) DESC,
                           u.P_SIZE ASC
                ) AS RN
         FROM ${this.master}.IAS_ITM_DTL u
         WHERE u.I_CODE = :i AND NVL(u.INACTIVE, 0) = 0
       ) WHERE RN = 1`,
      { i: itemCode },
    );
    const cost = await this.read.queryOne<{ C: number | null }>(
      `SELECT C FROM (
         SELECT m.STK_COST AS C,
                ROW_NUMBER() OVER (ORDER BY m.SERIAL DESC) AS RN
         FROM ${this.read.schema()}.ITEM_MOVEMENT m
         WHERE m.I_CODE = :i AND m.STK_COST IS NOT NULL
       ) WHERE RN = 1`,
      { i: itemCode },
    );
    return {
      itemName: name.I_NAME ?? null,
      itmUnt: unit?.ITM_UNT ?? null,
      pSize: unit?.P_SIZE == null ? 1 : Number(unit.P_SIZE),
      unitCost: cost?.C == null ? null : Number(cost.C),
    };
  }

  async availableQty(itemCode: string, wCode: number): Promise<number | null> {
    const row = await this.read.queryOne<{ Q: number | null }>(
      `SELECT SUM(AVL_QTY) AS Q
       FROM ${this.read.schema()}.MV_ITEM_AVL_QTY
       WHERE I_CODE = :i AND W_CODE = :w`,
      { i: itemCode, w: wCode },
    );
    return row?.Q == null ? null : Number(row.Q);
  }

  // ---- helpers ----

  private headSelect(): string {
    return `
      SELECT s.ID, s.ISSUE_NO, s.W_CODE, s.DEST_W_CODE, s.TRANSFER_ID,
             s.STATUS, s.REF_NO, s.NOTE, s.CREATED_BY, s.CREATED_AT,
             s.POSTED_BY, s.POSTED_AT, s.ONYX_DOC_NO, s.ONYX_DOC_SER,
             s.CANCELLED_BY, s.CANCELLED_AT,
             NVL(l.LINE_CNT, 0) AS LINE_CNT
      FROM ${this.schema}.STOCK_ISSUES s
      LEFT JOIN (
        SELECT ISSUE_ID, COUNT(*) AS LINE_CNT
        FROM ${this.schema}.STOCK_ISSUE_LINES GROUP BY ISSUE_ID
      ) l ON l.ISSUE_ID = s.ID`;
  }

  private async linesOf(issueId: string): Promise<StockIssueLine[]> {
    const rows = await this.write.query<LineRow>(
      `SELECT ID, ITEM_CODE, ITEM_NAME, QTY, ITM_UNT, P_SIZE, UNIT_COST, NOTE
       FROM ${this.schema}.STOCK_ISSUE_LINES
       WHERE ISSUE_ID = :s
       ORDER BY ITEM_CODE`,
      { s: issueId },
    );
    return rows.map((r) => ({
      lineId: r.ID,
      itemCode: r.ITEM_CODE,
      itemName: r.ITEM_NAME,
      qty: Number(r.QTY),
      itmUnt: r.ITM_UNT,
      pSize: Number(r.P_SIZE),
      unitCost: r.UNIT_COST == null ? null : Number(r.UNIT_COST),
      note: r.NOTE,
    }));
  }

  private toHeader(r: HeadRow): StockIssueHeader {
    return {
      id: r.ID,
      issueNo: Number(r.ISSUE_NO),
      warehouseCode: Number(r.W_CODE),
      destWarehouseCode: r.DEST_W_CODE == null ? null : Number(r.DEST_W_CODE),
      transferId: r.TRANSFER_ID,
      status: r.STATUS as StockIssueStatus,
      refNo: r.REF_NO,
      note: r.NOTE,
      createdBy: r.CREATED_BY,
      createdAt: r.CREATED_AT.toISOString(),
      postedBy: r.POSTED_BY,
      postedAt: r.POSTED_AT ? r.POSTED_AT.toISOString() : null,
      onyxDocNo: r.ONYX_DOC_NO == null ? null : Number(r.ONYX_DOC_NO),
      onyxDocSer: r.ONYX_DOC_SER == null ? null : Number(r.ONYX_DOC_SER),
      cancelledBy: r.CANCELLED_BY,
      cancelledAt: r.CANCELLED_AT ? r.CANCELLED_AT.toISOString() : null,
      lineCount: Number(r.LINE_CNT),
    };
  }

  private isUniqueViolation(err: unknown): boolean {
    if (typeof err !== 'object' || err === null) return false;
    const e = err as { errorNum?: number; message?: string };
    return (
      e.errorNum === 1 ||
      (typeof e.message === 'string' && e.message.includes('ORA-00001'))
    );
  }
}
