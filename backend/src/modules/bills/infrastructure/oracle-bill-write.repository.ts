import { Injectable } from '@nestjs/common';
import oracledb from 'oracledb';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import {
  AddPaymentInput,
  BillWriteRepository,
  IdempotencyUniqueViolation,
  InsertBillInput,
  PersistedBill,
  PersistedBillLine,
  PersistedPayment,
} from '../domain/ports/bill-write-repository.port';

interface BillRow {
  ID: string;
  BILL_NO: string;
  SHIFT_ID: string;
  CASHIER_NO: number;
  MACHINE_NO: number | null;
  BILL_TYPE: number;
  CUSTOMER_CODE: string | null;
  CUSTOMER_NAME: string | null;
  CURRENCY: string;
  TAX_CALC_TYPE: number;
  GROSS_AMT: number;
  DISCOUNT_AMT: number;
  VAT_AMT: number;
  NET_AMT: number;
  PAID_AMT: number;
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
  FREE_QTY: number;
  UNIT_PRICE: number;
  DISC_DTL: number;
  DISC_MST: number;
  VAT_PERCENT: number;
  LINE_GROSS: number;
  LINE_DISCOUNT: number;
  LINE_VAT: number;
  LINE_NET: number;
  ITEM_UNIT: string | null;
}

interface PaymentRow {
  ID: string;
  METHOD: string;
  CURRENCY: string;
  AMOUNT: number;
  RATE: number;
  AMOUNT_IN_BILL: number;
  CARD_NO: string | null;
  CUSTOMER_CODE: string | null;
  CREATED_AT: Date;
}

/**
 * OracleBillWriteRepository — writes invoices into MOTECH_POS (our own schema).
 * Never writes to YSPOS23. The whole sale (header + lines) is one transaction.
 * Bill numbering is server-side from SEQ_BILL_NO under SERIALIZABLE isolation;
 * the UNIQUE idempotency_key is the final anti-duplicate backstop.
 */
@Injectable()
export class OracleBillWriteRepository implements BillWriteRepository {
  constructor(private readonly db: OracleWriteService) {}

  private get schema(): string {
    return this.db.schema();
  }

  async findByIdempotencyKey(key: string): Promise<PersistedBill | null> {
    const row = await this.db.queryOne<BillRow>(
      `SELECT * FROM ${this.schema}.BILLS WHERE IDEMPOTENCY_KEY = :k`,
      { k: key },
    );
    return row ? this.assemble(row) : null;
  }

  async findById(id: string): Promise<PersistedBill | null> {
    const row = await this.db.queryOne<BillRow>(
      `SELECT * FROM ${this.schema}.BILLS WHERE ID = :id`,
      { id },
    );
    return row ? this.assemble(row) : null;
  }

  async insertBill(input: InsertBillInput): Promise<PersistedBill> {
    const id = uuidv7();
    try {
      await this.db.withTransaction(async (conn) => {
        const seq = await conn.execute<{ N: number }>(
          `SELECT ${this.schema}.SEQ_BILL_NO.NEXTVAL AS N FROM DUAL`,
          {},
          { outFormat: oracledb.OUT_FORMAT_OBJECT },
        );
        const n = (seq.rows as { N: number }[])[0].N;
        const billNo = this.formatBillNo(input.machineNo, n);

        await conn.execute(
          `INSERT INTO ${this.schema}.BILLS
             (ID, BILL_NO, SHIFT_ID, CASHIER_NO, MACHINE_NO, BILL_TYPE,
              CUSTOMER_CODE, CUSTOMER_NAME, CURRENCY, TAX_CALC_TYPE,
              GROSS_AMT, DISCOUNT_AMT, VAT_AMT, NET_AMT, PAID_AMT,
              STATUS, IDEMPOTENCY_KEY, CLIENT_OP_ID)
           VALUES (:id, :billNo, :shiftId, :cashierNo, :machineNo, :billType,
              :customerCode, :customerName, :currency, :taxCalcType,
              :grossAmt, :discountAmt, :vatAmt, :netAmt, 0,
              'POSTED', :idempotencyKey, :clientOpId)`,
          {
            id,
            billNo,
            shiftId: input.shiftId,
            cashierNo: input.cashierNo,
            machineNo: input.machineNo,
            billType: input.billType,
            customerCode: input.customerCode,
            customerName: input.customerName,
            currency: input.currency,
            taxCalcType: input.taxCalcType,
            grossAmt: input.grossAmt,
            discountAmt: input.discountAmt,
            vatAmt: input.vatAmt,
            netAmt: input.netAmt,
            idempotencyKey: input.idempotencyKey,
            clientOpId: input.clientOpId,
          },
        );

        for (const l of input.lines) {
          await conn.execute(
            `INSERT INTO ${this.schema}.BILL_LINES
               (ID, BILL_ID, LINE_NO, ITEM_CODE, ITEM_NAME, QTY, FREE_QTY,
                UNIT_PRICE, DISC_DTL, DISC_MST, VAT_PERCENT,
                LINE_GROSS, LINE_DISCOUNT, LINE_VAT, LINE_NET, ITEM_UNIT)
             VALUES (:id, :billId, :lineNo, :itemCode, :itemName, :qty, :freeQty,
                :unitPrice, :discDtl, :discMst, :vatPercent,
                :lineGross, :lineDiscount, :lineVat, :lineNet, :itemUnit)`,
            {
              id: uuidv7(),
              billId: id,
              lineNo: l.lineNo,
              itemCode: l.itemCode,
              itemName: l.itemName,
              qty: l.qty,
              freeQty: l.freeQty,
              unitPrice: l.unitPrice,
              discDtl: l.discDtl,
              discMst: l.discMst,
              vatPercent: l.vatPercent,
              lineGross: l.lineGross,
              lineDiscount: l.lineDiscount,
              lineVat: l.lineVat,
              lineNet: l.lineNet,
              itemUnit: l.itemUnit,
            },
          );
        }
      });
    } catch (err) {
      if (this.isUniqueViolation(err)) {
        throw new IdempotencyUniqueViolation();
      }
      throw err;
    }

    const persisted = await this.findById(id);
    if (!persisted) {
      throw new Error('insertBill: bill vanished after commit');
    }
    return persisted;
  }

  async addPayment(input: AddPaymentInput): Promise<PersistedBill> {
    const amountInBill = round4(input.amount * input.rate);
    await this.db.withTransaction(async (conn) => {
      await conn.execute(
        `INSERT INTO ${this.schema}.PAYMENTS
           (ID, BILL_ID, SHIFT_ID, METHOD, CURRENCY, AMOUNT, RATE,
            AMOUNT_IN_BILL, CARD_NO, CUSTOMER_CODE)
         VALUES (:id, :billId, :shiftId, :method, :currency, :amount, :rate,
            :amountInBill, :cardNo, :customerCode)`,
        {
          id: uuidv7(),
          billId: input.billId,
          shiftId: input.shiftId,
          method: input.method,
          currency: input.currency,
          amount: input.amount,
          rate: input.rate,
          amountInBill,
          cardNo: input.cardNo ?? null,
          customerCode: input.customerCode ?? null,
        },
      );
      // Recompute PAID_AMT from the payment lines (single source of truth).
      await conn.execute(
        `UPDATE ${this.schema}.BILLS
           SET PAID_AMT = (
             SELECT NVL(SUM(AMOUNT_IN_BILL),0) FROM ${this.schema}.PAYMENTS
             WHERE BILL_ID = :billId)
         WHERE ID = :billId`,
        { billId: input.billId },
      );
    });
    const persisted = await this.findById(input.billId);
    if (!persisted) throw new Error('addPayment: bill not found');
    return persisted;
  }

  // BILL_NO = YYMM + machine(3) + seq(8). Compact, sortable, machine-scoped.
  private formatBillNo(machineNo: number | null, seq: number): string {
    const d = new Date();
    const yy = String(d.getFullYear()).slice(2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const mc = String(machineNo ?? 0).padStart(3, '0');
    const sq = String(seq).padStart(8, '0');
    return `${yy}${mm}${mc}${sq}`;
  }

  private async assemble(head: BillRow): Promise<PersistedBill> {
    const lineRows = await this.db.query<LineRow>(
      `SELECT LINE_NO, ITEM_CODE, ITEM_NAME, QTY, FREE_QTY, UNIT_PRICE,
              DISC_DTL, DISC_MST, VAT_PERCENT, LINE_GROSS, LINE_DISCOUNT,
              LINE_VAT, LINE_NET, ITEM_UNIT
       FROM ${this.schema}.BILL_LINES WHERE BILL_ID = :id ORDER BY LINE_NO`,
      { id: head.ID },
    );
    const payRows = await this.db.query<PaymentRow>(
      `SELECT ID, METHOD, CURRENCY, AMOUNT, RATE, AMOUNT_IN_BILL, CARD_NO,
              CUSTOMER_CODE, CREATED_AT
       FROM ${this.schema}.PAYMENTS WHERE BILL_ID = :id ORDER BY CREATED_AT, ID`,
      { id: head.ID },
    );

    const lines: PersistedBillLine[] = lineRows.map((r) => ({
      lineNo: Number(r.LINE_NO),
      itemCode: r.ITEM_CODE,
      itemName: r.ITEM_NAME,
      qty: Number(r.QTY),
      freeQty: Number(r.FREE_QTY),
      unitPrice: Number(r.UNIT_PRICE),
      discDtl: Number(r.DISC_DTL),
      discMst: Number(r.DISC_MST),
      vatPercent: Number(r.VAT_PERCENT),
      lineGross: Number(r.LINE_GROSS),
      lineDiscount: Number(r.LINE_DISCOUNT),
      lineVat: Number(r.LINE_VAT),
      lineNet: Number(r.LINE_NET),
      itemUnit: r.ITEM_UNIT,
    }));

    const payments: PersistedPayment[] = payRows.map((r) => ({
      id: r.ID,
      method: r.METHOD as PersistedPayment['method'],
      currency: r.CURRENCY,
      amount: Number(r.AMOUNT),
      rate: Number(r.RATE),
      amountInBill: Number(r.AMOUNT_IN_BILL),
      cardNo: r.CARD_NO,
      customerCode: r.CUSTOMER_CODE,
      createdAt: r.CREATED_AT.toISOString(),
    }));

    return {
      id: head.ID,
      billNo: head.BILL_NO,
      shiftId: head.SHIFT_ID,
      cashierNo: Number(head.CASHIER_NO),
      machineNo: head.MACHINE_NO == null ? null : Number(head.MACHINE_NO),
      billType: Number(head.BILL_TYPE),
      customerCode: head.CUSTOMER_CODE,
      customerName: head.CUSTOMER_NAME,
      currency: head.CURRENCY,
      taxCalcType: Number(head.TAX_CALC_TYPE),
      grossAmt: Number(head.GROSS_AMT),
      discountAmt: Number(head.DISCOUNT_AMT),
      vatAmt: Number(head.VAT_AMT),
      netAmt: Number(head.NET_AMT),
      paidAmt: Number(head.PAID_AMT),
      status: head.STATUS,
      idempotencyKey: head.IDEMPOTENCY_KEY,
      clientOpId: head.CLIENT_OP_ID,
      issuedAt: head.ISSUED_AT.toISOString(),
      createdAt: head.CREATED_AT.toISOString(),
      lines,
      payments,
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
