import { Injectable } from '@nestjs/common';
import type { BindParameters } from 'oracledb';
import { OracleService } from '../../../infrastructure/oracle/oracle.service';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import {
  CreateReturnCountInput,
  ListReturnCountsFilter,
  ReturnCountDetail,
  ReturnCountHeader,
  ReturnCountLine,
  ReturnCountPostIdempotencyViolation,
  ReturnCountRepository,
  ReturnCountStatus,
  UpsertReturnCountLineInput,
} from '../domain/ports/return-count.port';

interface HeadRow {
  ID: string;
  COUNT_NO: number;
  MACHINE_NO: number;
  COUNT_DATE_STR: string; // yyyy-mm-dd — TO_CHAR in SQL (no TZ shift)
  STATUS: string;
  REF_NO: string | null;
  NOTE: string | null;
  CREATED_BY: string;
  CREATED_AT: Date;
  POSTED_BY: string | null;
  POSTED_AT: Date | null;
  LINE_CNT: number;
}

interface LineRow {
  ID: string;
  ITEM_CODE: string;
  ITEM_NAME: string | null;
  SYSTEM_QTY: number;
  COUNTED_QTY: number;
  DIFF_QTY: number;
}

/**
 * OracleReturnCountRepository — POST022 persistence. Sessions live in
 * MOTECH_POS (RETURN_COUNTS + RETURN_COUNT_LINES, V026); the system side is
 * read live from YSPOS23.IAS_POS_RT_BILL_MST/DTL (read-only) — the same REAL
 * tables our returns module writes into, so Motech returns are counted too.
 */
@Injectable()
export class OracleReturnCountRepository implements ReturnCountRepository {
  constructor(
    private readonly read: OracleService,
    private readonly write: OracleWriteService,
  ) {}

  private get schema(): string {
    return this.write.schema();
  }

  async create(input: CreateReturnCountInput): Promise<ReturnCountDetail> {
    const id = uuidv7();
    await this.write.execute(
      `INSERT INTO ${this.schema}.RETURN_COUNTS
         (ID, COUNT_NO, MACHINE_NO, COUNT_DATE, REF_NO, NOTE, CREATED_BY)
       VALUES
         (:id, ${this.schema}.SEQ_RETURN_COUNT_NO.NEXTVAL, :machineNo,
          TO_DATE(:countDate, 'YYYY-MM-DD'), :refNo, :note, :createdBy)`,
      {
        id,
        machineNo: input.machineNo,
        countDate: input.countDate,
        refNo: input.refNo,
        note: input.note,
        createdBy: input.createdBy,
      },
    );
    const created = await this.findById(id);
    if (!created) throw new Error('create: return count vanished after insert');
    return created;
  }

  async findById(id: string): Promise<ReturnCountDetail | null> {
    const row = await this.write.queryOne<HeadRow>(
      `${this.headSelect()} WHERE c.ID = :k`,
      { k: id },
    );
    if (!row) return null;
    return { ...this.toHeader(row), lines: await this.linesOf(id) };
  }

  async findByPostKey(key: string): Promise<ReturnCountDetail | null> {
    const row = await this.write.queryOne<HeadRow>(
      `${this.headSelect()} WHERE c.POST_IDEMPOTENCY_KEY = :k`,
      { k: key },
    );
    if (!row) return null;
    return { ...this.toHeader(row), lines: await this.linesOf(row.ID) };
  }

  async list(filter: ListReturnCountsFilter): Promise<ReturnCountHeader[]> {
    const binds: Record<string, unknown> = { lim: filter.limit };
    const where: string[] = [];
    if (filter.status) {
      where.push('c.STATUS = :st');
      binds.st = filter.status;
    }
    if (filter.machineNo != null) {
      where.push('c.MACHINE_NO = :mn');
      binds.mn = filter.machineNo;
    }
    const rows = await this.write.query<HeadRow>(
      `SELECT * FROM (
         ${this.headSelect()}
         ${where.length > 0 ? 'WHERE ' + where.join(' AND ') : ''}
         ORDER BY c.CREATED_AT DESC
       ) WHERE ROWNUM <= :lim`,
      binds as BindParameters,
    );
    return rows.map((r) => this.toHeader(r));
  }

  async upsertLine(input: UpsertReturnCountLineInput): Promise<ReturnCountLine> {
    const diff = input.countedQty - input.systemQty;
    await this.write.execute(
      `MERGE INTO ${this.schema}.RETURN_COUNT_LINES t
       USING (SELECT :countId AS COUNT_ID, :itemCode AS ITEM_CODE FROM DUAL) s
       ON (t.COUNT_ID = s.COUNT_ID AND t.ITEM_CODE = s.ITEM_CODE)
       WHEN MATCHED THEN UPDATE SET
         t.ITEM_NAME = :itemName, t.SYSTEM_QTY = :systemQty,
         t.COUNTED_QTY = :countedQty, t.DIFF_QTY = :diffQty
       WHEN NOT MATCHED THEN INSERT
         (ID, COUNT_ID, ITEM_CODE, ITEM_NAME, SYSTEM_QTY, COUNTED_QTY, DIFF_QTY)
       VALUES
         (:newId, :countId2, :itemCode2, :itemName2, :systemQty2,
          :countedQty2, :diffQty2)`,
      {
        countId: input.countId,
        itemCode: input.itemCode,
        itemName: input.itemName,
        systemQty: input.systemQty,
        countedQty: input.countedQty,
        diffQty: diff,
        newId: uuidv7(),
        countId2: input.countId,
        itemCode2: input.itemCode,
        itemName2: input.itemName,
        systemQty2: input.systemQty,
        countedQty2: input.countedQty,
        diffQty2: diff,
      },
    );
    const row = await this.write.queryOne<LineRow>(
      `SELECT ID, ITEM_CODE, ITEM_NAME, SYSTEM_QTY, COUNTED_QTY, DIFF_QTY
       FROM ${this.schema}.RETURN_COUNT_LINES
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
  ): Promise<ReturnCountDetail | null> {
    try {
      const res = await this.write.execute(
        `UPDATE ${this.schema}.RETURN_COUNTS
         SET STATUS = 'POSTED', POSTED_BY = :postedBy,
             POSTED_AT = SYSTIMESTAMP, POST_IDEMPOTENCY_KEY = :key
         WHERE ID = :id AND STATUS = 'DRAFT'`,
        { postedBy, key: idempotencyKey, id },
      );
      if ((res.rowsAffected ?? 0) === 0) return null;
    } catch (err) {
      if (this.isUniqueViolation(err)) {
        throw new ReturnCountPostIdempotencyViolation();
      }
      throw err;
    }
    return this.findById(id);
  }

  async machineExists(machineNo: number): Promise<boolean> {
    const row = await this.read.queryOne<{ ONE: number }>(
      `SELECT 1 AS ONE FROM ${this.read.schema()}.IAS_POS_MACHINE
       WHERE MACHINE_NO = :m`,
      { m: machineNo },
    );
    if (row) return true;
    const overlay = await this.write.queryOne<{ ONE: number }>(
      `SELECT 1 AS ONE FROM ${this.schema}.MACHINES_OVERLAY
       WHERE MACHINE_NO = :m`,
      { m: machineNo },
    );
    return overlay != null;
  }

  async systemReturnedQty(
    itemCode: string,
    machineNo: number,
    countDate: string,
  ): Promise<number> {
    const row = await this.read.queryOne<{ Q: number | null }>(
      `SELECT SUM(NVL(d.P_QTY, 0)) AS Q
       FROM ${this.read.schema()}.IAS_POS_RT_BILL_MST m
       JOIN ${this.read.schema()}.IAS_POS_RT_BILL_DTL d
         ON d.RT_BILL_NO = m.RT_BILL_NO
       WHERE d.I_CODE = :i AND m.MACHINE_NO = :m
         AND TRUNC(m.RT_BILL_DATE) = TO_DATE(:dt, 'YYYY-MM-DD')`,
      { i: itemCode, m: machineNo, dt: countDate },
    );
    return row?.Q == null ? 0 : Number(row.Q);
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
      SELECT c.ID, c.COUNT_NO, c.MACHINE_NO,
             TO_CHAR(c.COUNT_DATE, 'YYYY-MM-DD') AS COUNT_DATE_STR,
             c.STATUS, c.REF_NO,
             c.NOTE, c.CREATED_BY, c.CREATED_AT, c.POSTED_BY, c.POSTED_AT,
             NVL(l.LINE_CNT, 0) AS LINE_CNT
      FROM ${this.schema}.RETURN_COUNTS c
      LEFT JOIN (
        SELECT COUNT_ID, COUNT(*) AS LINE_CNT
        FROM ${this.schema}.RETURN_COUNT_LINES GROUP BY COUNT_ID
      ) l ON l.COUNT_ID = c.ID`;
  }

  private async linesOf(countId: string): Promise<ReturnCountLine[]> {
    const rows = await this.write.query<LineRow>(
      `SELECT ID, ITEM_CODE, ITEM_NAME, SYSTEM_QTY, COUNTED_QTY, DIFF_QTY
       FROM ${this.schema}.RETURN_COUNT_LINES
       WHERE COUNT_ID = :c
       ORDER BY ITEM_CODE`,
      { c: countId },
    );
    return rows.map((r) => this.toLine(r));
  }

  private toLine(r: LineRow): ReturnCountLine {
    return {
      lineId: r.ID,
      itemCode: r.ITEM_CODE,
      itemName: r.ITEM_NAME,
      systemQty: Number(r.SYSTEM_QTY),
      countedQty: Number(r.COUNTED_QTY),
      diffQty: Number(r.DIFF_QTY),
    };
  }

  private toHeader(r: HeadRow): ReturnCountHeader {
    return {
      id: r.ID,
      countNo: Number(r.COUNT_NO),
      machineNo: Number(r.MACHINE_NO),
      countDate: r.COUNT_DATE_STR,
      status: r.STATUS as ReturnCountStatus,
      refNo: r.REF_NO,
      note: r.NOTE,
      createdBy: r.CREATED_BY,
      createdAt: r.CREATED_AT.toISOString(),
      postedBy: r.POSTED_BY,
      postedAt: r.POSTED_AT ? r.POSTED_AT.toISOString() : null,
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
