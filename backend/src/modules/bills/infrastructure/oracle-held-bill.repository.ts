import { Injectable } from '@nestjs/common';
import oracledb from 'oracledb';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import {
  HeldBillLine,
  HeldBillWriteRepository,
  HeldIdempotencyUniqueViolation,
  InsertHeldBillInput,
  PersistedHeldBill,
} from '../domain/ports/held-bill-repository.port';

interface HeldRow {
  ID: string;
  HOLD_NO: number;
  LABEL: string | null;
  SHIFT_ID: string;
  CASHIER_NO: number;
  MACHINE_NO: number | null;
  CUSTOMER_CODE: string | null;
  CUSTOMER_NAME: string | null;
  CURRENCY: string;
  TAX_CALC_TYPE: number;
  HEADER_DISCOUNT: number;
  LINE_COUNT: number;
  EST_NET_AMT: number;
  LINES_JSON: string;
  STATUS: string;
  IDEMPOTENCY_KEY: string;
  CLIENT_OP_ID: string | null;
  RESUMED_BILL_ID: string | null;
  CREATED_AT: Date;
  UPDATED_AT: Date;
}

/**
 * OracleHeldBillRepository — parks/reads temporary "hung" sales in MOTECH_POS
 * (never YSPOS23). The cart is stored as a JSON CLOB snapshot so a resume
 * reconstructs the exact lines the cashier parked. Analogue of the HUNG=1
 * handling in EXTRCT_POS_BILL_PRC (IAS_POS_HUNG_BILLS).
 */
@Injectable()
export class OracleHeldBillRepository implements HeldBillWriteRepository {
  constructor(private readonly db: OracleWriteService) {}

  private get schema(): string {
    return this.db.schema();
  }

  private readonly cols = `ID, HOLD_NO, LABEL, SHIFT_ID, CASHIER_NO, MACHINE_NO,
    CUSTOMER_CODE, CUSTOMER_NAME, CURRENCY, TAX_CALC_TYPE, HEADER_DISCOUNT,
    LINE_COUNT, EST_NET_AMT, LINES_JSON, STATUS, IDEMPOTENCY_KEY, CLIENT_OP_ID,
    RESUMED_BILL_ID, CREATED_AT, UPDATED_AT`;

  private map(row: HeldRow): PersistedHeldBill {
    let lines: HeldBillLine[] = [];
    try {
      lines = row.LINES_JSON ? (JSON.parse(row.LINES_JSON) as HeldBillLine[]) : [];
    } catch {
      lines = [];
    }
    return {
      id: row.ID,
      holdNo: Number(row.HOLD_NO),
      label: row.LABEL,
      shiftId: row.SHIFT_ID,
      cashierNo: Number(row.CASHIER_NO),
      machineNo: row.MACHINE_NO == null ? null : Number(row.MACHINE_NO),
      customerCode: row.CUSTOMER_CODE,
      customerName: row.CUSTOMER_NAME,
      currency: row.CURRENCY,
      taxCalcType: Number(row.TAX_CALC_TYPE),
      headerDiscount: Number(row.HEADER_DISCOUNT),
      lineCount: Number(row.LINE_COUNT),
      estNetAmt: Number(row.EST_NET_AMT),
      lines,
      status: row.STATUS as PersistedHeldBill['status'],
      idempotencyKey: row.IDEMPOTENCY_KEY,
      clientOpId: row.CLIENT_OP_ID,
      resumedBillId: row.RESUMED_BILL_ID,
      createdAt: row.CREATED_AT.toISOString(),
      updatedAt: row.UPDATED_AT.toISOString(),
    };
  }

  /** LINES_JSON is a CLOB; fetch it as a string. */
  private fetch(where: string, binds: oracledb.BindParameters): Promise<HeldRow[]> {
    return this.db.queryWith<HeldRow>(
      `SELECT ${this.cols} FROM ${this.schema}.HELD_BILLS ${where}`,
      binds,
      { fetchInfo: { LINES_JSON: { type: oracledb.STRING } } },
    );
  }

  async findByIdempotencyKey(key: string): Promise<PersistedHeldBill | null> {
    const rows = await this.fetch('WHERE IDEMPOTENCY_KEY = :k', { k: key });
    return rows[0] ? this.map(rows[0]) : null;
  }

  async findById(id: string): Promise<PersistedHeldBill | null> {
    const rows = await this.fetch('WHERE ID = :id', { id });
    return rows[0] ? this.map(rows[0]) : null;
  }

  async listHeld(cashierNo: number): Promise<PersistedHeldBill[]> {
    const rows = await this.fetch(
      `WHERE CASHIER_NO = :c AND STATUS = 'HELD' ORDER BY CREATED_AT DESC`,
      { c: cashierNo },
    );
    return rows.map((r) => this.map(r));
  }

  async insert(input: InsertHeldBillInput): Promise<PersistedHeldBill> {
    const id = uuidv7();
    const linesJson = JSON.stringify(input.lines);
    try {
      await this.db.withTransaction(async (conn) => {
        const seq = await conn.execute<{ N: number }>(
          `SELECT ${this.schema}.SEQ_HOLD_NO.NEXTVAL AS N FROM DUAL`,
          {},
          { outFormat: oracledb.OUT_FORMAT_OBJECT },
        );
        const holdNo = (seq.rows as { N: number }[])[0].N;

        await conn.execute(
          `INSERT INTO ${this.schema}.HELD_BILLS
             (ID, HOLD_NO, LABEL, SHIFT_ID, CASHIER_NO, MACHINE_NO,
              CUSTOMER_CODE, CUSTOMER_NAME, CURRENCY, TAX_CALC_TYPE,
              HEADER_DISCOUNT, LINE_COUNT, EST_NET_AMT, LINES_JSON,
              STATUS, IDEMPOTENCY_KEY, CLIENT_OP_ID)
           VALUES (:id, :holdNo, :label, :shiftId, :cashierNo, :machineNo,
              :customerCode, :customerName, :currency, :taxCalcType,
              :headerDiscount, :lineCount, :estNetAmt, :linesJson,
              'HELD', :idempotencyKey, :clientOpId)`,
          {
            id,
            holdNo,
            label: input.label,
            shiftId: input.shiftId,
            cashierNo: input.cashierNo,
            machineNo: input.machineNo,
            customerCode: input.customerCode,
            customerName: input.customerName,
            currency: input.currency,
            taxCalcType: input.taxCalcType,
            headerDiscount: input.headerDiscount,
            lineCount: input.lines.length,
            estNetAmt: input.estNetAmt,
            linesJson: { val: linesJson, type: oracledb.CLOB },
            idempotencyKey: input.idempotencyKey,
            clientOpId: input.clientOpId,
          },
        );
      });
    } catch (err) {
      if (this.isUniqueViolation(err)) {
        throw new HeldIdempotencyUniqueViolation();
      }
      throw err;
    }
    const persisted = await this.findById(id);
    if (!persisted) throw new Error('insert held bill: vanished after commit');
    return persisted;
  }

  async markResumed(id: string, resumedBillId: string): Promise<void> {
    await this.db.execute(
      `UPDATE ${this.schema}.HELD_BILLS
         SET STATUS = 'RESUMED', RESUMED_BILL_ID = :billId,
             UPDATED_AT = SYSTIMESTAMP
       WHERE ID = :id AND STATUS = 'HELD'`,
      { id, billId: resumedBillId },
    );
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
