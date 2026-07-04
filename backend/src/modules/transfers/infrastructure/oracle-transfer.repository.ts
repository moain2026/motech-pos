import { Injectable } from '@nestjs/common';
import type { BindParameters } from 'oracledb';
import { OracleService } from '../../../infrastructure/oracle/oracle.service';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import {
  CreateTransferInput,
  ListTransfersFilter,
  TransferDetail,
  TransferHeader,
  TransferLine,
  TransferRepository,
  TransferStatus,
} from '../domain/ports/transfer.port';

interface HeadRow {
  ID: string;
  REQ_NO: number;
  FROM_W_CODE: number;
  TO_W_CODE: number;
  STATUS: string;
  REQ_SIDE: string | null;
  PURPOSE: string | null;
  REF_NO: string | null;
  NOTE: string | null;
  CREATED_BY: string;
  CREATED_AT: Date;
  CANCELLED_BY: string | null;
  CANCELLED_AT: Date | null;
  LINE_CNT: number;
}

interface LineRow {
  ID: string;
  ITEM_CODE: string;
  ITEM_NAME: string | null;
  QTY: number;
  AVL_QTY: number | null;
  NOTE: string | null;
}

/**
 * OracleTransferRepository — POST019 persistence. Requests live ONLY in
 * MOTECH_POS (MATERIAL_TRANSFERS + MATERIAL_TRANSFER_LINES, V018); warehouse
 * existence + item availability come LIVE from YSPOS23 via the read-only
 * MOTECH_RO pool; Arabic item names from the ERP master (IAS202623).
 * Header + lines are one transaction; REQ_NO comes from SEQ_TRANSFER_NO
 * inside the same transaction (gap-free enough for a human-facing serial).
 */
@Injectable()
export class OracleTransferRepository implements TransferRepository {
  constructor(
    private readonly read: OracleService,
    private readonly write: OracleWriteService,
  ) {}

  private get schema(): string {
    return this.write.schema();
  }

  async create(input: CreateTransferInput): Promise<TransferDetail> {
    const id = uuidv7();
    await this.write.withTransaction(async (conn) => {
      await conn.execute(
        `INSERT INTO ${this.schema}.MATERIAL_TRANSFERS
           (ID, REQ_NO, FROM_W_CODE, TO_W_CODE, REQ_SIDE, PURPOSE, REF_NO,
            NOTE, CREATED_BY)
         VALUES
           (:id, ${this.schema}.SEQ_TRANSFER_NO.NEXTVAL, :fromW, :toW,
            :reqSide, :purpose, :refNo, :note, :createdBy)`,
        {
          id,
          fromW: input.fromWarehouse,
          toW: input.toWarehouse,
          reqSide: input.reqSide,
          purpose: input.purpose,
          refNo: input.refNo,
          note: input.note,
          createdBy: input.createdBy,
        },
      );
      for (const line of input.lines) {
        await conn.execute(
          `INSERT INTO ${this.schema}.MATERIAL_TRANSFER_LINES
             (ID, TRANSFER_ID, ITEM_CODE, ITEM_NAME, QTY, AVL_QTY, NOTE)
           VALUES
             (:id, :transferId, :itemCode, :itemName, :qty, :avlQty, :note)`,
          {
            id: uuidv7(),
            transferId: id,
            itemCode: line.itemCode,
            itemName: line.itemName,
            qty: line.qty,
            avlQty: line.avlQty,
            note: line.note,
          },
        );
      }
    });
    const created = await this.findById(id);
    if (!created) throw new Error('create: transfer vanished after insert');
    return created;
  }

  async findById(id: string): Promise<TransferDetail | null> {
    const row = await this.write.queryOne<HeadRow>(
      `${this.headSelect()} WHERE t.ID = :k`,
      { k: id },
    );
    if (!row) return null;
    return { ...this.toHeader(row), lines: await this.linesOf(id) };
  }

  async list(filter: ListTransfersFilter): Promise<TransferHeader[]> {
    const binds: Record<string, unknown> = { lim: filter.limit };
    const where: string[] = [];
    if (filter.status) {
      where.push('t.STATUS = :st');
      binds.st = filter.status;
    }
    if (filter.warehouse != null) {
      where.push('(t.FROM_W_CODE = :wh OR t.TO_W_CODE = :wh)');
      binds.wh = filter.warehouse;
    }
    const rows = await this.write.query<HeadRow>(
      `SELECT * FROM (
         ${this.headSelect()}
         ${where.length > 0 ? 'WHERE ' + where.join(' AND ') : ''}
         ORDER BY t.CREATED_AT DESC
       ) WHERE ROWNUM <= :lim`,
      binds as BindParameters,
    );
    return rows.map((r) => this.toHeader(r));
  }

  async cancel(id: string, cancelledBy: string): Promise<TransferDetail | null> {
    const res = await this.write.execute(
      `UPDATE ${this.schema}.MATERIAL_TRANSFERS
       SET STATUS = 'CANCELLED', CANCELLED_BY = :cancelledBy,
           CANCELLED_AT = SYSTIMESTAMP
       WHERE ID = :id AND STATUS = 'OPEN'`,
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

  async availableQty(itemCode: string, wCode: number): Promise<number | null> {
    const row = await this.read.queryOne<{ Q: number | null }>(
      `SELECT SUM(AVL_QTY) AS Q
       FROM ${this.read.schema()}.MV_ITEM_AVL_QTY
       WHERE I_CODE = :i AND W_CODE = :w`,
      { i: itemCode, w: wCode },
    );
    return row?.Q == null ? null : Number(row.Q);
  }

  async itemName(itemCode: string): Promise<string | null> {
    const row = await this.read.queryOne<{ I_NAME: string | null }>(
      `SELECT I_NAME FROM ${this.read.masterSchema()}.IAS_ITM_MST
       WHERE I_CODE = :i`,
      { i: itemCode },
    );
    return row ? (row.I_NAME ?? null) : null;
  }

  // ---- helpers ----

  private headSelect(): string {
    return `
      SELECT t.ID, t.REQ_NO, t.FROM_W_CODE, t.TO_W_CODE, t.STATUS, t.REQ_SIDE,
             t.PURPOSE, t.REF_NO, t.NOTE, t.CREATED_BY, t.CREATED_AT,
             t.CANCELLED_BY, t.CANCELLED_AT,
             NVL(l.LINE_CNT, 0) AS LINE_CNT
      FROM ${this.schema}.MATERIAL_TRANSFERS t
      LEFT JOIN (
        SELECT TRANSFER_ID, COUNT(*) AS LINE_CNT
        FROM ${this.schema}.MATERIAL_TRANSFER_LINES GROUP BY TRANSFER_ID
      ) l ON l.TRANSFER_ID = t.ID`;
  }

  private async linesOf(transferId: string): Promise<TransferLine[]> {
    const rows = await this.write.query<LineRow>(
      `SELECT ID, ITEM_CODE, ITEM_NAME, QTY, AVL_QTY, NOTE
       FROM ${this.schema}.MATERIAL_TRANSFER_LINES
       WHERE TRANSFER_ID = :t
       ORDER BY ITEM_CODE`,
      { t: transferId },
    );
    return rows.map((r) => ({
      lineId: r.ID,
      itemCode: r.ITEM_CODE,
      itemName: r.ITEM_NAME,
      qty: Number(r.QTY),
      avlQty: r.AVL_QTY == null ? null : Number(r.AVL_QTY),
      note: r.NOTE,
    }));
  }

  private toHeader(r: HeadRow): TransferHeader {
    return {
      id: r.ID,
      reqNo: Number(r.REQ_NO),
      fromWarehouse: Number(r.FROM_W_CODE),
      toWarehouse: Number(r.TO_W_CODE),
      status: r.STATUS as TransferStatus,
      reqSide: r.REQ_SIDE,
      purpose: r.PURPOSE,
      refNo: r.REF_NO,
      note: r.NOTE,
      createdBy: r.CREATED_BY,
      createdAt: r.CREATED_AT.toISOString(),
      cancelledBy: r.CANCELLED_BY,
      cancelledAt: r.CANCELLED_AT ? r.CANCELLED_AT.toISOString() : null,
      lineCount: Number(r.LINE_CNT),
    };
  }
}
