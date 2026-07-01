import { Injectable } from '@nestjs/common';
import oracledb from 'oracledb';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import {
  InsertReturnInput,
  PersistedReturn,
  PersistedReturnLine,
  ReturnedQtyRow,
  ReturnIdempotencyUniqueViolation,
  ReturnWriteRepository,
} from '../domain/ports/return-write-repository.port';

interface RetRow {
  ID: string;
  RT_BILL_NO: string;
  ORIGINAL_BILL_NO: string;
  ORIGINAL_BILL_ID: string | null;
  SHIFT_ID: string | null;
  CASHIER_NO: number;
  MACHINE_NO: number | null;
  RETURN_TYPE: number;
  CUSTOMER_CODE: string | null;
  CUSTOMER_NAME: string | null;
  CURRENCY: string;
  TAX_CALC_TYPE: number;
  GROSS_AMT: number;
  DISCOUNT_AMT: number;
  VAT_AMT: number;
  NET_AMT: number;
  REFUND_AMT: number;
  STATUS: string;
  IDEMPOTENCY_KEY: string;
  CLIENT_OP_ID: string | null;
  ISSUED_AT: Date;
  CREATED_AT: Date;
}

interface LineRow {
  LINE_NO: number;
  ITEM_CODE: string;
  ITEM_NAME: string | null;
  QTY: number;
  UNIT_PRICE: number;
  DISC_DTL: number;
  DISC_MST: number;
  VAT_PERCENT: number;
  LINE_GROSS: number;
  LINE_DISCOUNT: number;
  LINE_VAT: number;
  LINE_NET: number;
  REPLACE_AMOUNT: number;
  ITEM_UNIT: string | null;
}

/**
 * OracleReturnWriteRepository — writes returns (مردود مبيعات) into MOTECH_POS
 * (our own schema). Never writes to YSPOS23. The whole return (header + lines)
 * is one transaction. RT numbering is server-side from SEQ_RETURN_NO;
 * the UNIQUE idempotency_key is the anti-duplicate backstop.
 */
@Injectable()
export class OracleReturnWriteRepository implements ReturnWriteRepository {
  constructor(private readonly db: OracleWriteService) {}

  private get schema(): string {
    return this.db.schema();
  }

  async findByIdempotencyKey(key: string): Promise<PersistedReturn | null> {
    const row = await this.db.queryOne<RetRow>(
      `SELECT * FROM ${this.schema}.RETURNS WHERE IDEMPOTENCY_KEY = :k`,
      { k: key },
    );
    return row ? this.assemble(row) : null;
  }

  async findById(id: string): Promise<PersistedReturn | null> {
    const row = await this.db.queryOne<RetRow>(
      `SELECT * FROM ${this.schema}.RETURNS WHERE ID = :id`,
      { id },
    );
    return row ? this.assemble(row) : null;
  }

  async returnedQtyForOriginal(
    originalBillNo: string,
  ): Promise<ReturnedQtyRow[]> {
    const rows = await this.db.query<{ ITEM_CODE: string; Q: number }>(
      `SELECT l.ITEM_CODE, NVL(SUM(l.QTY),0) AS Q
       FROM ${this.schema}.RETURNS r
       JOIN ${this.schema}.RETURN_LINES l ON l.RETURN_ID = r.ID
       WHERE r.ORIGINAL_BILL_NO = :obn AND r.STATUS = 'POSTED'
       GROUP BY l.ITEM_CODE`,
      { obn: originalBillNo },
    );
    return rows.map((r) => ({
      itemCode: r.ITEM_CODE,
      qtyReturned: Number(r.Q ?? 0),
    }));
  }

  async insertReturn(input: InsertReturnInput): Promise<PersistedReturn> {
    const id = uuidv7();
    try {
      await this.db.withTransaction(async (conn) => {
        const seq = await conn.execute<{ N: number }>(
          `SELECT ${this.schema}.SEQ_RETURN_NO.NEXTVAL AS N FROM DUAL`,
          {},
          { outFormat: oracledb.OUT_FORMAT_OBJECT },
        );
        const n = (seq.rows as { N: number }[])[0].N;
        const rtBillNo = this.formatRtBillNo(input.machineNo, n);

        await conn.execute(
          `INSERT INTO ${this.schema}.RETURNS
             (ID, RT_BILL_NO, ORIGINAL_BILL_NO, ORIGINAL_BILL_ID, SHIFT_ID,
              CASHIER_NO, MACHINE_NO, RETURN_TYPE, CUSTOMER_CODE, CUSTOMER_NAME,
              CURRENCY, TAX_CALC_TYPE, GROSS_AMT, DISCOUNT_AMT, VAT_AMT, NET_AMT,
              REFUND_AMT, STATUS, IDEMPOTENCY_KEY, CLIENT_OP_ID)
           VALUES (:id, :rtBillNo, :originalBillNo, :originalBillId, :shiftId,
              :cashierNo, :machineNo, :returnType, :customerCode, :customerName,
              :currency, :taxCalcType, :grossAmt, :discountAmt, :vatAmt, :netAmt,
              :refundAmt, 'POSTED', :idempotencyKey, :clientOpId)`,
          {
            id,
            rtBillNo,
            originalBillNo: input.originalBillNo,
            originalBillId: input.originalBillId,
            shiftId: input.shiftId,
            cashierNo: input.cashierNo,
            machineNo: input.machineNo,
            returnType: input.returnType,
            customerCode: input.customerCode,
            customerName: input.customerName,
            currency: input.currency,
            taxCalcType: input.taxCalcType,
            grossAmt: input.grossAmt,
            discountAmt: input.discountAmt,
            vatAmt: input.vatAmt,
            netAmt: input.netAmt,
            refundAmt: input.refundAmt,
            idempotencyKey: input.idempotencyKey,
            clientOpId: input.clientOpId,
          },
        );

        for (const l of input.lines) {
          await conn.execute(
            `INSERT INTO ${this.schema}.RETURN_LINES
               (ID, RETURN_ID, LINE_NO, ITEM_CODE, ITEM_NAME, QTY,
                UNIT_PRICE, DISC_DTL, DISC_MST, VAT_PERCENT,
                LINE_GROSS, LINE_DISCOUNT, LINE_VAT, LINE_NET,
                REPLACE_AMOUNT, ITEM_UNIT)
             VALUES (:id, :returnId, :lineNo, :itemCode, :itemName, :qty,
                :unitPrice, :discDtl, :discMst, :vatPercent,
                :lineGross, :lineDiscount, :lineVat, :lineNet,
                :replaceAmount, :itemUnit)`,
            {
              id: uuidv7(),
              returnId: id,
              lineNo: l.lineNo,
              itemCode: l.itemCode,
              itemName: l.itemName,
              qty: l.qty,
              unitPrice: l.unitPrice,
              discDtl: l.discDtl,
              discMst: l.discMst,
              vatPercent: l.vatPercent,
              lineGross: l.lineGross,
              lineDiscount: l.lineDiscount,
              lineVat: l.lineVat,
              lineNet: l.lineNet,
              replaceAmount: l.replaceAmount,
              itemUnit: l.itemUnit,
            },
          );
        }
      });
    } catch (err) {
      if (this.isUniqueViolation(err)) {
        throw new ReturnIdempotencyUniqueViolation();
      }
      throw err;
    }

    const persisted = await this.findById(id);
    if (!persisted) {
      throw new Error('insertReturn: return vanished after commit');
    }
    return persisted;
  }

  // RT_BILL_NO = 'R' + YYMM + machine(3) + seq(8). Compact, sortable, scoped.
  private formatRtBillNo(machineNo: number | null, seq: number): string {
    const d = new Date();
    const yy = String(d.getFullYear()).slice(2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const mc = String(machineNo ?? 0).padStart(3, '0');
    const sq = String(seq).padStart(8, '0');
    return `R${yy}${mm}${mc}${sq}`;
  }

  private async assemble(head: RetRow): Promise<PersistedReturn> {
    const lineRows = await this.db.query<LineRow>(
      `SELECT LINE_NO, ITEM_CODE, ITEM_NAME, QTY, UNIT_PRICE, DISC_DTL, DISC_MST,
              VAT_PERCENT, LINE_GROSS, LINE_DISCOUNT, LINE_VAT, LINE_NET,
              REPLACE_AMOUNT, ITEM_UNIT
       FROM ${this.schema}.RETURN_LINES WHERE RETURN_ID = :id ORDER BY LINE_NO`,
      { id: head.ID },
    );

    const lines: PersistedReturnLine[] = lineRows.map((r) => ({
      lineNo: Number(r.LINE_NO),
      itemCode: r.ITEM_CODE,
      itemName: r.ITEM_NAME,
      qty: Number(r.QTY),
      unitPrice: Number(r.UNIT_PRICE),
      discDtl: Number(r.DISC_DTL),
      discMst: Number(r.DISC_MST),
      vatPercent: Number(r.VAT_PERCENT),
      lineGross: Number(r.LINE_GROSS),
      lineDiscount: Number(r.LINE_DISCOUNT),
      lineVat: Number(r.LINE_VAT),
      lineNet: Number(r.LINE_NET),
      replaceAmount: Number(r.REPLACE_AMOUNT),
      itemUnit: r.ITEM_UNIT,
    }));

    return {
      id: head.ID,
      rtBillNo: head.RT_BILL_NO,
      originalBillNo: head.ORIGINAL_BILL_NO,
      originalBillId: head.ORIGINAL_BILL_ID,
      shiftId: head.SHIFT_ID,
      cashierNo: Number(head.CASHIER_NO),
      machineNo: head.MACHINE_NO == null ? null : Number(head.MACHINE_NO),
      returnType: Number(head.RETURN_TYPE),
      customerCode: head.CUSTOMER_CODE,
      customerName: head.CUSTOMER_NAME,
      currency: head.CURRENCY,
      taxCalcType: Number(head.TAX_CALC_TYPE),
      grossAmt: Number(head.GROSS_AMT),
      discountAmt: Number(head.DISCOUNT_AMT),
      vatAmt: Number(head.VAT_AMT),
      netAmt: Number(head.NET_AMT),
      refundAmt: Number(head.REFUND_AMT),
      status: head.STATUS,
      idempotencyKey: head.IDEMPOTENCY_KEY,
      clientOpId: head.CLIENT_OP_ID,
      issuedAt: head.ISSUED_AT.toISOString(),
      createdAt: head.CREATED_AT.toISOString(),
      lines,
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
