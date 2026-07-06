import { Injectable } from '@nestjs/common';
import oracledb from 'oracledb';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import {
  InsertVoucherInput,
  PersistedVoucher,
  RefundReturnUniqueViolation,
  VoucherIdempotencyUniqueViolation,
  VoucherListFilter,
  VoucherRepository,
  VoucherShiftTotals,
} from '../domain/ports/voucher-repository.port';

interface VoucherRow {
  ID: string;
  VOUCHER_NO: string;
  VOUCHER_TYPE: 'RECEIPT' | 'EXPENSE';
  SHIFT_ID: string | null;
  CASHIER_NO: number;
  MACHINE_NO: number | null;
  AMOUNT: number;
  CURRENCY: string;
  RATE: number;
  AMOUNT_IN_SHIFT: number;
  PAYMENT_METHOD: 'CASH' | 'CARD' | 'BANK';
  DESCRIPTION: string | null;
  PARTY_NAME: string | null;
  CATEGORY: string | null;
  STATUS: string;
  IDEMPOTENCY_KEY: string;
  CLIENT_OP_ID: string | null;
  REFUND_RETURN_ID: string | null;
  ISSUED_AT: Date;
  CREATED_AT: Date;
}

/**
 * OracleVoucherRepository — writes cash vouchers (سندات قبض/صرف) into
 * MOTECH_POS.VOUCHERS (our own schema). Never writes to YSPOS23. Server-side
 * numbering from SEQ_VOUCHER_NO; the UNIQUE idempotency_key is the anti-dup
 * backstop (ORA-00001).
 */
@Injectable()
export class OracleVoucherRepository implements VoucherRepository {
  constructor(private readonly db: OracleWriteService) {}

  private get schema(): string {
    return this.db.schema();
  }

  private readonly cols = `ID, VOUCHER_NO, VOUCHER_TYPE, SHIFT_ID, CASHIER_NO,
    MACHINE_NO, AMOUNT, CURRENCY, RATE, AMOUNT_IN_SHIFT, PAYMENT_METHOD,
    DESCRIPTION, PARTY_NAME, CATEGORY, STATUS, IDEMPOTENCY_KEY, CLIENT_OP_ID,
    REFUND_RETURN_ID, ISSUED_AT, CREATED_AT`;

  async findByIdempotencyKey(key: string): Promise<PersistedVoucher | null> {
    const row = await this.db.queryOne<VoucherRow>(
      `SELECT ${this.cols} FROM ${this.schema}.VOUCHERS WHERE IDEMPOTENCY_KEY = :k`,
      { k: key },
    );
    return row ? this.map(row) : null;
  }

  async findByRefundReturnId(
    returnId: string,
  ): Promise<PersistedVoucher | null> {
    const row = await this.db.queryOne<VoucherRow>(
      `SELECT ${this.cols} FROM ${this.schema}.VOUCHERS WHERE REFUND_RETURN_ID = :r`,
      { r: returnId },
    );
    return row ? this.map(row) : null;
  }

  async findById(id: string): Promise<PersistedVoucher | null> {
    const row = await this.db.queryOne<VoucherRow>(
      `SELECT ${this.cols} FROM ${this.schema}.VOUCHERS WHERE ID = :id`,
      { id },
    );
    return row ? this.map(row) : null;
  }

  async insertVoucher(input: InsertVoucherInput): Promise<PersistedVoucher> {
    const id = uuidv7();
    try {
      await this.db.withTransaction(async (conn) => {
        const seq = await conn.execute<{ N: number }>(
          `SELECT ${this.schema}.SEQ_VOUCHER_NO.NEXTVAL AS N FROM DUAL`,
          {},
          { outFormat: oracledb.OUT_FORMAT_OBJECT },
        );
        const n = (seq.rows as { N: number }[])[0].N;
        const voucherNo = this.formatVoucherNo(
          input.type,
          input.machineNo,
          n,
        );

        await conn.execute(
          `INSERT INTO ${this.schema}.VOUCHERS
             (ID, VOUCHER_NO, VOUCHER_TYPE, SHIFT_ID, CASHIER_NO, MACHINE_NO,
              AMOUNT, CURRENCY, RATE, AMOUNT_IN_SHIFT, PAYMENT_METHOD,
              DESCRIPTION, PARTY_NAME, CATEGORY, STATUS, IDEMPOTENCY_KEY, CLIENT_OP_ID,
              REFUND_RETURN_ID)
           VALUES (:id, :voucherNo, :type, :shiftId, :cashierNo, :machineNo,
              :amount, :currency, :rate, :amountInShift, :paymentMethod,
              :description, :partyName, :category, 'POSTED', :idempotencyKey, :clientOpId,
              :refundReturnId)`,
          {
            id,
            voucherNo,
            type: input.type,
            shiftId: input.shiftId,
            cashierNo: input.cashierNo,
            machineNo: input.machineNo,
            amount: input.amount,
            currency: input.currency,
            rate: input.rate,
            amountInShift: input.amountInShift,
            paymentMethod: input.paymentMethod,
            description: input.description,
            partyName: input.partyName,
            category: input.category,
            idempotencyKey: input.idempotencyKey,
            clientOpId: input.clientOpId,
            refundReturnId: input.refundReturnId ?? null,
          },
        );
      });
    } catch (err) {
      if (this.isUniqueViolation(err)) {
        // Distinguish the refund-return UNIQUE index from the idempotency one.
        if (this.isRefundReturnViolation(err)) {
          throw new RefundReturnUniqueViolation();
        }
        throw new VoucherIdempotencyUniqueViolation();
      }
      throw err;
    }

    const persisted = await this.findById(id);
    if (!persisted) {
      throw new Error('insertVoucher: voucher vanished after commit');
    }
    return persisted;
  }

  async list(filter: VoucherListFilter): Promise<PersistedVoucher[]> {
    const binds: Record<string, unknown> = { lim: filter.limit };
    const where: string[] = [`STATUS = 'POSTED'`];
    if (filter.shiftId) {
      binds.shiftId = filter.shiftId;
      where.push('SHIFT_ID = :shiftId');
    }
    if (filter.type) {
      binds.type = filter.type;
      where.push('VOUCHER_TYPE = :type');
    }
    if (filter.cashierNo != null) {
      binds.cashierNo = filter.cashierNo;
      where.push('CASHIER_NO = :cashierNo');
    }
    if (filter.from) {
      binds.fromTs = filter.from;
      where.push(`ISSUED_AT >= TO_TIMESTAMP(:fromTs, 'YYYY-MM-DD')`);
    }
    if (filter.to) {
      binds.toTs = filter.to;
      where.push(`ISSUED_AT < TO_TIMESTAMP(:toTs, 'YYYY-MM-DD') + 1`);
    }
    const rows = await this.db.query<VoucherRow>(
      `SELECT * FROM (
         SELECT ${this.cols} FROM ${this.schema}.VOUCHERS
         WHERE ${where.join(' AND ')}
         ORDER BY ISSUED_AT DESC, VOUCHER_NO DESC
       ) WHERE ROWNUM <= :lim`,
      binds as oracledb.BindParameters,
    );
    return rows.map((r) => this.map(r));
  }

  async shiftCashTotals(shiftId: string): Promise<VoucherShiftTotals> {
    const row = await this.db.queryOne<{
      CASH_RECEIPTS: number;
      CASH_EXPENSES: number;
      RECEIPT_CNT: number;
      EXPENSE_CNT: number;
    }>(
      `SELECT
         NVL(SUM(CASE WHEN VOUCHER_TYPE='RECEIPT' AND PAYMENT_METHOD='CASH'
                      THEN AMOUNT_IN_SHIFT END),0) AS CASH_RECEIPTS,
         NVL(SUM(CASE WHEN VOUCHER_TYPE='EXPENSE' AND PAYMENT_METHOD='CASH'
                      THEN AMOUNT_IN_SHIFT END),0) AS CASH_EXPENSES,
         NVL(SUM(CASE WHEN VOUCHER_TYPE='RECEIPT' THEN 1 ELSE 0 END),0) AS RECEIPT_CNT,
         NVL(SUM(CASE WHEN VOUCHER_TYPE='EXPENSE' THEN 1 ELSE 0 END),0) AS EXPENSE_CNT
       FROM ${this.schema}.VOUCHERS
       WHERE SHIFT_ID = :s AND STATUS = 'POSTED'`,
      { s: shiftId },
    );
    const cashReceipts = Number(row?.CASH_RECEIPTS ?? 0);
    const cashExpenses = Number(row?.CASH_EXPENSES ?? 0);
    return {
      cashReceipts,
      cashExpenses,
      netCashEffect: round4(cashReceipts - cashExpenses),
      receiptCount: Number(row?.RECEIPT_CNT ?? 0),
      expenseCount: Number(row?.EXPENSE_CNT ?? 0),
    };
  }

  // VOUCHER_NO = ('RCP'|'EXP') + YYMM + machine(3) + seq(8). Sortable, scoped.
  private formatVoucherNo(
    type: 'RECEIPT' | 'EXPENSE',
    machineNo: number | null,
    seq: number,
  ): string {
    const d = new Date();
    const yy = String(d.getFullYear()).slice(2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const mc = String(machineNo ?? 0).padStart(3, '0');
    const sq = String(seq).padStart(8, '0');
    const prefix = type === 'RECEIPT' ? 'RCP' : 'EXP';
    return `${prefix}${yy}${mm}${mc}${sq}`;
  }

  private map(r: VoucherRow): PersistedVoucher {
    return {
      id: r.ID,
      voucherNo: r.VOUCHER_NO,
      type: r.VOUCHER_TYPE,
      shiftId: r.SHIFT_ID,
      cashierNo: Number(r.CASHIER_NO),
      machineNo: r.MACHINE_NO == null ? null : Number(r.MACHINE_NO),
      amount: Number(r.AMOUNT),
      currency: r.CURRENCY,
      rate: Number(r.RATE),
      amountInShift: Number(r.AMOUNT_IN_SHIFT),
      paymentMethod: r.PAYMENT_METHOD,
      description: r.DESCRIPTION,
      partyName: r.PARTY_NAME,
      category: r.CATEGORY,
      status: r.STATUS,
      idempotencyKey: r.IDEMPOTENCY_KEY,
      clientOpId: r.CLIENT_OP_ID,
      refundReturnId: r.REFUND_RETURN_ID ?? null,
      issuedAt: r.ISSUED_AT.toISOString(),
      createdAt: r.CREATED_AT.toISOString(),
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

  /** True when the ORA-00001 came from the refund-return UNIQUE index. */
  private isRefundReturnViolation(err: unknown): boolean {
    const msg =
      typeof err === 'object' && err !== null && 'message' in err
        ? String((err as { message?: unknown }).message ?? '')
        : '';
    return msg.includes('UX_VOUCHERS_REFUND_RET');
  }
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
