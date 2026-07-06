import { Injectable } from '@nestjs/common';
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
  COUPON_NO: string | null;
  CREATED_AT: Date;
}

/**
 * OracleBillWriteRepository — writes invoices into the REAL Onyx tables
 * (YSPOS23.IAS_POS_BILL_MST / IAS_POS_BILL_DTL) plus a tracking row in
 * MOTECH_POS.BILLS (+BILL_LINES) that links idempotency_key → BILL_NO and
 * feeds our read-model/reports. All of it is ONE transaction: either the
 * bill lands in both places or nowhere.
 *
 * Bill numbering is server-side: YSPOS23.POS_BILLS_SEQ under SERIALIZABLE
 * isolation, formatted YYMM+machine(3)+seq(8) — numeric, collision-free
 * with legacy Onyx numbers (different length/prefix). The UNIQUE
 * idempotency_key on MOTECH_POS.BILLS is the final anti-duplicate backstop.
 */
@Injectable()
export class OracleBillWriteRepository implements BillWriteRepository {
  constructor(private readonly db: OracleWriteService) {}

  private get schema(): string {
    return this.db.schema();
  }

  /** Real Onyx POS schema (YSPOS23). */
  private get onyx(): string {
    return this.db.onyxSchema();
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

  async findByBillNo(billNo: string): Promise<PersistedBill | null> {
    const row = await this.db.queryOne<BillRow>(
      `SELECT * FROM ${this.schema}.BILLS WHERE BILL_NO = :b`,
      { b: billNo },
    );
    return row ? this.assemble(row) : null;
  }

  async insertBill(input: InsertBillInput): Promise<PersistedBill> {
    const id = uuidv7();
    // Sequence NEXTVAL is non-transactional; fetch it OUTSIDE the serializable
    // transaction (inside it, the recursive SEQ$ cache update raises ORA-08177).
    const seqRow = await this.db.queryOne<{ N: number }>(
      `SELECT ${this.onyx}.POS_BILLS_SEQ.NEXTVAL AS N FROM DUAL`,
    );
    if (!seqRow) throw new Error('insertBill: POS_BILLS_SEQ returned no value');
    const n = Number(seqRow.N);
    const billNo = this.formatBillNo(input.machineNo, n);
    // Same reason: prefetch one DOC_D_SEQ per line outside the transaction.
    const dtlSeqs: number[] = [];
    for (let i = 0; i < input.lines.length; i++) {
      const r = await this.db.queryOne<{ N: number }>(
        `SELECT ${this.onyx}.POS_BILL_DTL_SEQ.NEXTVAL AS N FROM DUAL`,
      );
      if (!r) throw new Error('insertBill: POS_BILL_DTL_SEQ returned no value');
      dtlSeqs.push(Number(r.N));
    }
    try {
      await this.db.withTransaction(async (conn) => {

        // 1) Tracking / idempotency row first — the UNIQUE idempotency_key
        //    makes a duplicate POST fail fast (ORA-00001) and roll back
        //    everything, including the Onyx rows below.
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

        // 2) REAL Onyx header — YSPOS23.IAS_POS_BILL_MST.
        //    NOT NULL columns are all filled; optional columns stay NULL.
        //    BILL_SRL (unique) mirrors BILL_NO; DOC_MCHN_SQ carries the raw seq.
        await conn.execute(
          `INSERT INTO ${this.onyx}.IAS_POS_BILL_MST
             (BILL_NO, BILL_SRL, BILL_DATE, BILL_TIME, BILL_TYPE, SI_TYPE,
              C_CODE, C_NAME, A_CY, BILL_RATE, BILL_AMT, POSTED, BILL_NOTE,
              MACHINE_NO, HUNG, PAYED_AMT, VAT_AMT, DISC_AMT, DISC_AMT_MST,
              DISC_AMT_DTL, CASH_NO, W_CODE, AD_U_ID, AD_DATE, AD_TRMNL_NM,
              CMP_NO, BRN_NO, BRN_YEAR, BRN_USR, DOC_MCHN_SQ, CLC_TYP_NO_TAX,
              CLC_VAT_AMT_TYP)
           VALUES
             (TO_NUMBER(:billNo), TO_NUMBER(:billNo), SYSDATE,
              TO_CHAR(SYSDATE,'HH24:MI:SS'), :billType, 1,
              :customerCode, :customerName, :currency, 1, :netAmt, 0, :note,
              :machineNo, 0, 0, :vatAmt, :discountAmt, :discountAmt,
              0, :cashierNo, :wCode, :cashierNo, SYSDATE, :terminal,
              :cmpNo, :brnNo, EXTRACT(YEAR FROM SYSDATE), :cashierNo, :seqNo,
              :taxCalcType, :taxCalcType)`,
          {
            billNo,
            billType: input.billType,
            customerCode: input.customerCode,
            customerName: input.customerName,
            currency: input.currency,
            netAmt: input.netAmt,
            note: `MOTECH-POS ${input.idempotencyKey}`.slice(0, 250),
            machineNo: input.machineNo ?? ONYX_DEFAULT_MACHINE_NO,
            vatAmt: input.vatAmt,
            discountAmt: input.discountAmt,
            cashierNo: input.cashierNo,
            wCode: ONYX_DEFAULT_W_CODE,
            terminal: ONYX_TERMINAL_NAME,
            cmpNo: ONYX_CMP_NO,
            brnNo: ONYX_BRN_NO,
            seqNo: n,
            taxCalcType: input.taxCalcType,
          },
        );

        // 3) REAL Onyx lines — YSPOS23.IAS_POS_BILL_DTL.
        //    DOC_D_SEQ comes from POS_BILL_DTL_SEQ (part of POSBILLDTL_UQ),
        //    RCRD_NO is the visual line number, W_CODE/P_SIZE/P_QTY are NOT NULL.
        //    BATCH_NO='0' + EXPIRE_DATE=1900-01-01 mirror the legacy "no batch"
        //    convention — MV_ITEM_AVL_QTY's container has them NOT NULL, so a
        //    NULL here breaks the availability refresh (ORA-01400).
        for (const [li, l] of input.lines.entries()) {
          await conn.execute(
            `INSERT INTO ${this.onyx}.IAS_POS_BILL_DTL
               (BILL_NO, BILL_SRL, I_CODE, I_QTY, I_PRICE, DIS_PER, DIS_AMT,
                DIS_AMT_MST, DIS_AMT_DTL, ITM_UNT, P_SIZE, P_QTY, VAT_PER,
                VAT_AMT, W_CODE, FREE_QTY, RCRD_NO, BRN_NO, BRN_YEAR, BRN_USR,
                DOC_D_SEQ, BATCH_NO, EXPIRE_DATE)
             VALUES
               (TO_NUMBER(:billNo), TO_NUMBER(:billNo), :itemCode, :qty,
                :unitPrice, 0, :lineDiscount, :discMst, :discDtl, :itemUnit,
                1, :qty2, :vatPercent, :lineVat, :wCode, :freeQty, :lineNo,
                :brnNo, EXTRACT(YEAR FROM SYSDATE), :cashierNo, :docDSeq,
                '0', DATE '1900-01-01')`,
            {
              docDSeq: dtlSeqs[li],
              billNo,
              itemCode: l.itemCode,
              qty: l.qty,
              unitPrice: l.unitPrice,
              lineDiscount: l.lineDiscount,
              discMst: l.discMst,
              discDtl: l.discDtl,
              itemUnit: l.itemUnit ?? ONYX_DEFAULT_ITM_UNT,
              qty2: l.qty,
              vatPercent: l.vatPercent,
              lineVat: l.lineVat,
              wCode: ONYX_DEFAULT_W_CODE,
              freeQty: l.freeQty,
              lineNo: l.lineNo,
              brnNo: ONYX_BRN_NO,
              cashierNo: input.cashierNo,
            },
          );
        }

        // 4) Our read-model lines (reports/assemble read these).
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

    // Post-commit: refresh Onyx availability (MV_ITEM_AVL_QTY) so the sold
    // qty is deducted immediately. Outside the transaction on purpose —
    // DBMS_MVIEW.REFRESH issues its own commit. Best-effort: a refresh
    // failure must never undo a committed sale.
    await this.db.refreshOnyxAvailability();

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
            AMOUNT_IN_BILL, CARD_NO, CUSTOMER_CODE, COUPON_NO)
         VALUES (:id, :billId, :shiftId, :method, :currency, :amount, :rate,
            :amountInBill, :cardNo, :customerCode, :couponNo)`,
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
          couponNo: input.couponNo ?? null,
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
      // Mirror the paid amount onto the real Onyx header (PAYED_AMT).
      await conn.execute(
        `UPDATE ${this.onyx}.IAS_POS_BILL_MST
           SET PAYED_AMT = (
             SELECT NVL(SUM(AMOUNT_IN_BILL),0) FROM ${this.schema}.PAYMENTS
             WHERE BILL_ID = :billId)
         WHERE BILL_NO = (
             SELECT TO_NUMBER(BILL_NO) FROM ${this.schema}.BILLS
             WHERE ID = :billId)`,
        { billId: input.billId },
      );
    });
    const persisted = await this.findById(input.billId);
    if (!persisted) throw new Error('addPayment: bill not found');
    return persisted;
  }

  async attachCustomer(
    billId: string,
    customerCode: string,
    customerName: string | null,
  ): Promise<PersistedBill> {
    await this.db.withTransaction(async (conn) => {
      // 1) MOTECH_POS tracking header.
      await conn.execute(
        `UPDATE ${this.schema}.BILLS
           SET CUSTOMER_CODE = :customerCode, CUSTOMER_NAME = :customerName
         WHERE ID = :billId`,
        { billId, customerCode, customerName },
      );
      // 2) Mirror onto the real Onyx header (IAS_POS_BILL_MST.C_CODE/C_NAME).
      await conn.execute(
        `UPDATE ${this.onyx}.IAS_POS_BILL_MST
           SET C_CODE = :customerCode, C_NAME = :customerName
         WHERE BILL_NO = (
             SELECT TO_NUMBER(BILL_NO) FROM ${this.schema}.BILLS
             WHERE ID = :billId)`,
        { billId, customerCode, customerName },
      );
    });
    const persisted = await this.findById(billId);
    if (!persisted) throw new Error('attachCustomer: bill not found');
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
              CUSTOMER_CODE, COUPON_NO, CREATED_AT
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
      couponNo: r.COUPON_NO,
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

// --- Onyx (YSPOS23) NOT NULL defaults, mirrored from the live dataset ---
// Live rows: CMP_NO=1, BRN_NO=1, W_CODE=2 (main warehouse), machines 2/3.
const ONYX_CMP_NO = 1;
const ONYX_BRN_NO = 1;
const ONYX_DEFAULT_W_CODE = 2;
const ONYX_DEFAULT_MACHINE_NO = 3;
const ONYX_DEFAULT_ITM_UNT = 'NO';
const ONYX_TERMINAL_NAME = 'MOTECH-POS';
