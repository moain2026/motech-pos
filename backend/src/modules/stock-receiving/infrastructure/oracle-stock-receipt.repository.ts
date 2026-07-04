import { Injectable, Logger } from '@nestjs/common';
import oracledb, { type BindParameters } from 'oracledb';
import { OracleService } from '../../../infrastructure/oracle/oracle.service';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import {
  CreateStockReceiptInput,
  ListStockReceiptsFilter,
  ReceiptItemSnapshot,
  StockReceiptDetail,
  StockReceiptHeader,
  StockReceiptLine,
  StockReceiptPostIdempotencyViolation,
  StockReceiptRepository,
  StockReceiptStatus,
} from '../domain/ports/stock-receipt.port';

interface HeadRow {
  ID: string;
  RECEIPT_NO: number;
  W_CODE: number;
  SOURCE_W_CODE: number | null;
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

/** Onyx conventions for Motech-written movements (mirror bill-write). */
const ONYX_CMP_NO = 1;
const ONYX_BRN_NO = 1;
const ONYX_CURRENCY = 'YER';
const ONYX_DEFAULT_ITM_UNT = 'NO';
/** DOC_TYPE=8 is the receipt-in movement (proven by the live rows). */
const RECEIPT_DOC_TYPE = 8;
/** Legacy "no batch" convention — MV container has these NOT NULL (V010). */
const NO_BATCH = '0';

/**
 * OracleStockReceiptRepository — POST029 persistence. The receipt DOCUMENT
 * lives in MOTECH_POS (STOCK_RECEIPTS + STOCK_RECEIPT_LINES, V022); POSTING
 * writes the REAL stock effect: IAS202623.ITEM_MOVEMENT rows with DOC_TYPE=8
 * / IN_OUT=+1 (V023 grants — exactly what MV_ITEM_AVL_QTY sums), in the SAME
 * transaction as the guarded DRAFT → POSTED flip. Post-commit the MV is
 * refreshed so the received qty is immediately available.
 *
 * Numbering (all live conventions, verified against the existing rows):
 *   SERIAL       ← IAS202623.IAS_SERIAL_SEQ   (PK ITMMOV_PK)
 *   DOC_SEQUENCE ← IAS202623.IAS_DOC_SEQ      (INV_ITMMV_DOC_SQ_INDX)
 *   DOC_SER      ← IAS202623.GNR_DOC_PST_SQ   (ITMMOV_UQ member)
 *   DOC_NO       ← MAX(DOC_NO)+1 per DOC_TYPE (Onyx GET_SERIAL analogue)
 * Sequence NEXTVALs are prefetched OUTSIDE the serializable transaction
 * (inside it the recursive SEQ$ update raises ORA-08177 — bills precedent).
 */
@Injectable()
export class OracleStockReceiptRepository implements StockReceiptRepository {
  private readonly logger = new Logger(OracleStockReceiptRepository.name);

  constructor(
    private readonly read: OracleService,
    private readonly write: OracleWriteService,
  ) {}

  private get schema(): string {
    return this.write.schema();
  }

  /** ERP master schema that owns ITEM_MOVEMENT + its sequences. */
  private get master(): string {
    return this.read.masterSchema();
  }

  async create(input: CreateStockReceiptInput): Promise<StockReceiptDetail> {
    const id = uuidv7();
    await this.write.withTransaction(async (conn) => {
      await conn.execute(
        `INSERT INTO ${this.schema}.STOCK_RECEIPTS
           (ID, RECEIPT_NO, W_CODE, SOURCE_W_CODE, TRANSFER_ID, REF_NO, NOTE,
            CREATED_BY)
         VALUES
           (:id, ${this.schema}.SEQ_STOCK_RECEIPT_NO.NEXTVAL, :wCode,
            :sourceWCode, :transferId, :refNo, :note, :createdBy)`,
        {
          id,
          wCode: input.warehouseCode,
          sourceWCode: input.sourceWarehouseCode,
          transferId: input.transferId,
          refNo: input.refNo,
          note: input.note,
          createdBy: input.createdBy,
        },
      );
      for (const line of input.lines) {
        await conn.execute(
          `INSERT INTO ${this.schema}.STOCK_RECEIPT_LINES
             (ID, RECEIPT_ID, ITEM_CODE, ITEM_NAME, QTY, ITM_UNT, P_SIZE,
              UNIT_COST, NOTE)
           VALUES
             (:id, :receiptId, :itemCode, :itemName, :qty, :itmUnt, :pSize,
              :unitCost, :note)`,
          {
            id: uuidv7(),
            receiptId: id,
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
    if (!created) throw new Error('create: stock receipt vanished after insert');
    return created;
  }

  async findById(id: string): Promise<StockReceiptDetail | null> {
    const row = await this.write.queryOne<HeadRow>(
      `${this.headSelect()} WHERE r.ID = :k`,
      { k: id },
    );
    if (!row) return null;
    return { ...this.toHeader(row), lines: await this.linesOf(id) };
  }

  async findByPostKey(key: string): Promise<StockReceiptDetail | null> {
    const row = await this.write.queryOne<HeadRow>(
      `${this.headSelect()} WHERE r.POST_IDEMPOTENCY_KEY = :k`,
      { k: key },
    );
    if (!row) return null;
    return { ...this.toHeader(row), lines: await this.linesOf(row.ID) };
  }

  async list(filter: ListStockReceiptsFilter): Promise<StockReceiptHeader[]> {
    const binds: Record<string, unknown> = { lim: filter.limit };
    const where: string[] = [];
    if (filter.status) {
      where.push('r.STATUS = :st');
      binds.st = filter.status;
    }
    if (filter.warehouse != null) {
      where.push('(r.W_CODE = :wh OR r.SOURCE_W_CODE = :wh)');
      binds.wh = filter.warehouse;
    }
    const rows = await this.write.query<HeadRow>(
      `SELECT * FROM (
         ${this.headSelect()}
         ${where.length > 0 ? 'WHERE ' + where.join(' AND ') : ''}
         ORDER BY r.CREATED_AT DESC
       ) WHERE ROWNUM <= :lim`,
      binds as BindParameters,
    );
    return rows.map((r) => this.toHeader(r));
  }

  async post(
    id: string,
    postedBy: string,
    idempotencyKey: string,
  ): Promise<StockReceiptDetail | null> {
    const existing = await this.findById(id);
    if (!existing || existing.lines.length === 0) return null; // service guards
    const lines = existing.lines;
    const wCode = existing.warehouseCode;

    // Prefetch ERP numbering OUTSIDE the serializable transaction (sequence
    // NEXTVAL is non-transactional; inside it raises ORA-08177 — see bills).
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
        // (1) DOC_NO per DOC_TYPE — Onyx GET_SERIAL analogue, inside the tx.
        const docNoRes = await conn.execute<{ N: number }>(
          `SELECT NVL(MAX(DOC_NO), 0) + 1 AS N
           FROM ${this.master}.ITEM_MOVEMENT WHERE DOC_TYPE = :t`,
          { t: RECEIPT_DOC_TYPE },
          { outFormat: oracledb.OUT_FORMAT_OBJECT },
        );
        const docNo = Number(
          (docNoRes.rows?.[0] as { N?: number } | undefined)?.N ?? 1,
        );

        // (2) Guarded DRAFT → POSTED flip (UNIQUE POST_IDEMPOTENCY_KEY is the
        //     replay backstop — a duplicate raises ORA-00001 and rolls back
        //     everything, including the movement rows below).
        const upd = await conn.execute(
          `UPDATE ${this.schema}.STOCK_RECEIPTS
           SET STATUS = 'POSTED', POSTED_BY = :postedBy,
               POSTED_AT = SYSTIMESTAMP, POST_IDEMPOTENCY_KEY = :key,
               ONYX_DOC_NO = :docNo, ONYX_DOC_SER = :docSer
           WHERE ID = :id AND STATUS = 'DRAFT'`,
          { postedBy, key: idempotencyKey, docNo, docSer, id },
        );
        if ((upd.rowsAffected ?? 0) === 0) {
          return; // no DRAFT row — concurrent post/cancel won; nothing written
        }
        flipped = true;

        // (3) REAL stock effect — one ITEM_MOVEMENT row per line
        //     (DOC_TYPE=8, IN_OUT=+1 — MV_ITEM_AVL_QTY sums exactly these).
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
                :serial, :refNo, :docSer, :docSeq, 1, SYSDATE,
                :cmpNo, :brnNo, EXTRACT(YEAR FROM SYSDATE))`,
            {
              docType: RECEIPT_DOC_TYPE,
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
              descr: `MOTECH-POS receipt ${idempotencyKey}`.slice(0, 250),
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
        throw new StockReceiptPostIdempotencyViolation();
      }
      throw err;
    }
    if (!flipped) return null;

    // Post-commit: refresh MV_ITEM_AVL_QTY so the received qty shows
    // immediately (best-effort — a committed receipt is never undone).
    await this.write.refreshOnyxAvailability();
    return this.findById(id);
  }

  async cancel(
    id: string,
    cancelledBy: string,
  ): Promise<StockReceiptDetail | null> {
    const res = await this.write.execute(
      `UPDATE ${this.schema}.STOCK_RECEIPTS
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
    // Stock unit wins (receipts are stock movements), else main, else the
    // smallest pack — from the live units table IAS_ITM_DTL.
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
    // Last known stock cost (movement history) — display/valuation snapshot.
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
      SELECT r.ID, r.RECEIPT_NO, r.W_CODE, r.SOURCE_W_CODE, r.TRANSFER_ID,
             r.STATUS, r.REF_NO, r.NOTE, r.CREATED_BY, r.CREATED_AT,
             r.POSTED_BY, r.POSTED_AT, r.ONYX_DOC_NO, r.ONYX_DOC_SER,
             r.CANCELLED_BY, r.CANCELLED_AT,
             NVL(l.LINE_CNT, 0) AS LINE_CNT
      FROM ${this.schema}.STOCK_RECEIPTS r
      LEFT JOIN (
        SELECT RECEIPT_ID, COUNT(*) AS LINE_CNT
        FROM ${this.schema}.STOCK_RECEIPT_LINES GROUP BY RECEIPT_ID
      ) l ON l.RECEIPT_ID = r.ID`;
  }

  private async linesOf(receiptId: string): Promise<StockReceiptLine[]> {
    const rows = await this.write.query<LineRow>(
      `SELECT ID, ITEM_CODE, ITEM_NAME, QTY, ITM_UNT, P_SIZE, UNIT_COST, NOTE
       FROM ${this.schema}.STOCK_RECEIPT_LINES
       WHERE RECEIPT_ID = :r
       ORDER BY ITEM_CODE`,
      { r: receiptId },
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

  private toHeader(r: HeadRow): StockReceiptHeader {
    return {
      id: r.ID,
      receiptNo: Number(r.RECEIPT_NO),
      warehouseCode: Number(r.W_CODE),
      sourceWarehouseCode:
        r.SOURCE_W_CODE == null ? null : Number(r.SOURCE_W_CODE),
      transferId: r.TRANSFER_ID,
      status: r.STATUS as StockReceiptStatus,
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
