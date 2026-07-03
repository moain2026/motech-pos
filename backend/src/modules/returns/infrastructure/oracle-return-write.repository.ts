import { Injectable } from '@nestjs/common';
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
 * OracleReturnWriteRepository — writes returns (مردود مبيعات) into the REAL
 * Onyx tables (YSPOS23.IAS_POS_RT_BILL_MST / IAS_POS_RT_BILL_DTL — the same
 * tables EXTRCT_POS_RT_BILL_PRC fills) plus a tracking row in
 * MOTECH_POS.RETURNS (+RETURN_LINES) that links idempotency_key → RT_BILL_NO
 * and feeds our read-model. ONE transaction — the return lands in both places
 * or nowhere. After commit, MV_ITEM_AVL_QTY is refreshed so returned qty goes
 * back into stock (the MV adds RT bill qty with a + sign).
 *
 * RT numbering is server-side: YSPOS23.POS_RT_BILLS_SEQ, formatted
 * YYMM+machine(3)+seq(8) — numeric, collision-free with legacy RT numbers
 * (13 digits vs our 15). The UNIQUE idempotency_key on MOTECH_POS.RETURNS is
 * the final anti-duplicate backstop.
 */
@Injectable()
export class OracleReturnWriteRepository implements ReturnWriteRepository {
  constructor(private readonly db: OracleWriteService) {}

  private get schema(): string {
    return this.db.schema();
  }

  /** Real Onyx POS schema (YSPOS23). */
  private get onyx(): string {
    return this.db.onyxSchema();
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
    // Sequence NEXTVAL is non-transactional; fetch it OUTSIDE the serializable
    // transaction (inside it, the recursive SEQ$ update raises ORA-08177).
    const seqRow = await this.db.queryOne<{ N: number }>(
      `SELECT ${this.onyx}.POS_RT_BILLS_SEQ.NEXTVAL AS N FROM DUAL`,
    );
    if (!seqRow) {
      throw new Error('insertReturn: POS_RT_BILLS_SEQ returned no value');
    }
    const rtBillNo = this.formatRtBillNo(input.machineNo, Number(seqRow.N));
    // One DOC_D_SEQ per line (part of POSRTBILLDTL_UQ), also prefetched.
    const dtlSeqs: number[] = [];
    for (let i = 0; i < input.lines.length; i++) {
      const r = await this.db.queryOne<{ N: number }>(
        `SELECT ${this.onyx}.POS_RT_BILL_DTL_SEQ.NEXTVAL AS N FROM DUAL`,
      );
      if (!r) {
        throw new Error('insertReturn: POS_RT_BILL_DTL_SEQ returned no value');
      }
      dtlSeqs.push(Number(r.N));
    }
    try {
      await this.db.withTransaction(async (conn) => {
        // 1) Tracking / idempotency row first — UNIQUE idempotency_key makes
        //    a duplicate POST fail fast and roll back the Onyx rows below.
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

        // 2) REAL Onyx RT header — YSPOS23.IAS_POS_RT_BILL_MST.
        //    RT_BILL_TYPE=1 / RETURN_TYPE mirror the live dataset; BILL_NO
        //    carries the original sale; POSTED=0 so the availability MV
        //    counts the returned qty back into stock.
        await conn.execute(
          `INSERT INTO ${this.onyx}.IAS_POS_RT_BILL_MST
             (RT_BILL_NO, RT_BILL_SRL, RT_BILL_DATE, RT_BILL_TIME, RT_BILL_TYPE,
              BILL_NO, C_CODE, C_NAME, A_CY, RT_BILL_RATE, RT_BILL_AMT, POSTED,
              RT_BILL_NOTE, MACHINE_NO, HUNG, PAYED_AMT, VAT_AMT, DISC_AMT,
              DISC_AMT_MST, DISC_AMT_DTL, CASH_NO, W_CODE, RETURN_TYPE,
              AD_U_ID, AD_DATE, AD_TRMNL_NM, CMP_NO, BRN_NO, BRN_YEAR, BRN_USR,
              CLC_TYP_NO_TAX, CLC_VAT_AMT_TYP)
           VALUES
             (TO_NUMBER(:rtBillNo), TO_NUMBER(:rtBillNo), SYSDATE,
              TO_CHAR(SYSDATE,'HH24:MI:SS'), 1,
              TO_NUMBER(:originalBillNo), :customerCode, :customerName,
              :currency, 1, :netAmt, 0, :note, :machineNo, 0, 0, :vatAmt,
              :discountAmt, :discountAmt, 0, :cashierNo, :wCode, :returnType,
              :cashierNo, SYSDATE, :terminal, :cmpNo, :brnNo,
              EXTRACT(YEAR FROM SYSDATE), :cashierNo, :taxCalcType,
              :taxCalcType)`,
          {
            rtBillNo,
            originalBillNo: input.originalBillNo,
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
            returnType: input.returnType,
            terminal: ONYX_TERMINAL_NAME,
            cmpNo: ONYX_CMP_NO,
            brnNo: ONYX_BRN_NO,
            taxCalcType: input.taxCalcType,
          },
        );

        // 3) REAL Onyx RT lines — YSPOS23.IAS_POS_RT_BILL_DTL.
        //    BATCH_NO='0' + EXPIRE_DATE=1900-01-01 mirror the legacy "no
        //    batch" convention (NOT NULL in the MV container).
        for (const [li, l] of input.lines.entries()) {
          await conn.execute(
            `INSERT INTO ${this.onyx}.IAS_POS_RT_BILL_DTL
               (RT_BILL_NO, RT_BILL_SRL, I_CODE, I_QTY, I_PRICE, DIS_PER,
                DIS_AMT, DIS_AMT_MST, DIS_AMT_DTL, ITM_UNT, P_SIZE, P_QTY,
                VAT_PER, VAT_AMT, W_CODE, FREE_QTY, RCRD_NO, BRN_NO, BRN_YEAR,
                BRN_USR, DOC_D_SEQ, RT_RPLC_AMT, BATCH_NO, EXPIRE_DATE)
             VALUES
               (TO_NUMBER(:rtBillNo), TO_NUMBER(:rtBillNo), :itemCode, :qty,
                :unitPrice, 0, :lineDiscount, :discMst, :discDtl, :itemUnit,
                1, :qty2, :vatPercent, :lineVat, :wCode, 0, :lineNo, :brnNo,
                EXTRACT(YEAR FROM SYSDATE), :cashierNo, :docDSeq, :replaceAmt,
                '0', DATE '1900-01-01')`,
            {
              docDSeq: dtlSeqs[li],
              rtBillNo,
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
              lineNo: l.lineNo,
              brnNo: ONYX_BRN_NO,
              cashierNo: input.cashierNo,
              replaceAmt: l.replaceAmount,
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

    // Post-commit: refresh MV_ITEM_AVL_QTY so the returned qty is back in
    // stock immediately. Best-effort — never undoes a committed return.
    await this.db.refreshOnyxAvailability();

    const persisted = await this.findById(id);
    if (!persisted) {
      throw new Error('insertReturn: return vanished after commit');
    }
    return persisted;
  }

  // RT_BILL_NO = YYMM + machine(3) + seq(8) — numeric (YSPOS23 column is
  // NUMBER), collision-free with legacy 13-digit RT numbers.
  private formatRtBillNo(machineNo: number | null, seq: number): string {
    const d = new Date();
    const yy = String(d.getFullYear()).slice(2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const mc = String(machineNo ?? 0).padStart(3, '0');
    const sq = String(seq).padStart(8, '0');
    return `${yy}${mm}${mc}${sq}`;
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

// --- Onyx (YSPOS23) NOT NULL defaults, mirrored from the live dataset ---
// Live RT rows: CMP_NO=1, BRN_NO=1, W_CODE=2 (main warehouse), machines 2/3.
const ONYX_CMP_NO = 1;
const ONYX_BRN_NO = 1;
const ONYX_DEFAULT_W_CODE = 2;
const ONYX_DEFAULT_MACHINE_NO = 3;
const ONYX_DEFAULT_ITM_UNT = 'NO';
const ONYX_TERMINAL_NAME = 'MOTECH-POS';
