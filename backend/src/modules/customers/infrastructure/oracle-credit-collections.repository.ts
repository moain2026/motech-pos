import { Injectable } from '@nestjs/common';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import {
  CollectionRow,
  CreditBillRow,
  CreditCollectionsRepository,
  InsertCollectionInput,
} from '../domain/ports/credit-collections.port';

interface CreditBillDbRow {
  BILL_ID: string;
  BILL_NO: string;
  ISSUED_AT: Date;
  CURRENCY: string;
  NET_AMT: number;
  CREDIT_AMT: number;
  COLLECTED_AMT: number;
}

interface CollectionDbRow {
  ID: string;
  BILL_ID: string;
  CUSTOMER_CODE: string;
  METHOD: string;
  CURRENCY: string;
  AMOUNT: number;
  RATE: number;
  AMOUNT_IN_BILL: number;
  CASHIER_NO: number | null;
  NOTE: string | null;
  IDEMPOTENCY_KEY: string;
  CREATED_AT: Date;
}

/**
 * OracleCreditCollectionsRepository — receivables over credit (آجل) bills.
 * Debt principal = SUM(PAYMENTS.AMOUNT_IN_BILL) of CREDIT tenders for the
 * customer; receipts live in MOTECH_POS.CREDIT_COLLECTIONS. Everything is
 * derived from those two tables — no denormalised balance to drift.
 */
@Injectable()
export class OracleCreditCollectionsRepository
  implements CreditCollectionsRepository
{
  constructor(private readonly db: OracleWriteService) {}

  private get schema(): string {
    return this.db.schema();
  }

  /** Credit bills + collection state; single aggregate query (no N+1). */
  private creditBillsSql(byBill: boolean): string {
    return `
      SELECT B.ID AS BILL_ID, B.BILL_NO, B.ISSUED_AT, B.CURRENCY, B.NET_AMT,
             CR.CREDIT_AMT,
             NVL(CC.COLLECTED_AMT, 0) AS COLLECTED_AMT
      FROM ${this.schema}.BILLS B
      JOIN (
        SELECT BILL_ID, SUM(AMOUNT_IN_BILL) AS CREDIT_AMT
        FROM ${this.schema}.PAYMENTS
        WHERE METHOD = 'CREDIT' AND CUSTOMER_CODE = :c
        GROUP BY BILL_ID
      ) CR ON CR.BILL_ID = B.ID
      LEFT JOIN (
        SELECT BILL_ID, SUM(AMOUNT_IN_BILL) AS COLLECTED_AMT
        FROM ${this.schema}.CREDIT_COLLECTIONS
        WHERE CUSTOMER_CODE = :c
        GROUP BY BILL_ID
      ) CC ON CC.BILL_ID = B.ID
      WHERE B.STATUS = 'POSTED'
      ${byBill ? 'AND B.ID = :billId' : ''}
      ORDER BY B.ISSUED_AT DESC`;
  }

  async creditBills(
    customerCode: string,
    openOnly: boolean,
  ): Promise<CreditBillRow[]> {
    const rows = await this.db.query<CreditBillDbRow>(
      this.creditBillsSql(false),
      { c: customerCode },
    );
    const mapped = rows.map((r) => this.mapBill(r));
    return openOnly ? mapped.filter((b) => b.outstanding > 0) : mapped;
  }

  async creditBill(
    customerCode: string,
    billId: string,
  ): Promise<CreditBillRow | null> {
    const row = await this.db.queryOne<CreditBillDbRow>(
      this.creditBillsSql(true),
      { c: customerCode, billId },
    );
    return row ? this.mapBill(row) : null;
  }

  async findByIdempotencyKey(key: string): Promise<CollectionRow | null> {
    const row = await this.db.queryOne<CollectionDbRow>(
      `SELECT * FROM ${this.schema}.CREDIT_COLLECTIONS
       WHERE IDEMPOTENCY_KEY = :k`,
      { k: key },
    );
    return row ? this.mapCollection(row) : null;
  }

  async insertCollection(
    input: InsertCollectionInput,
  ): Promise<CollectionRow> {
    const id = uuidv7();
    await this.db.execute(
      `INSERT INTO ${this.schema}.CREDIT_COLLECTIONS
         (ID, BILL_ID, CUSTOMER_CODE, METHOD, CURRENCY, AMOUNT, RATE,
          AMOUNT_IN_BILL, CASHIER_NO, NOTE, IDEMPOTENCY_KEY)
       VALUES (:id, :billId, :customerCode, :method, :currency, :amount,
          :rate, :amountInBill, :cashierNo, :note, :idempotencyKey)`,
      {
        id,
        billId: input.billId,
        customerCode: input.customerCode,
        method: input.method,
        currency: input.currency,
        amount: input.amount,
        rate: input.rate,
        amountInBill: input.amountInBill,
        cashierNo: input.cashierNo,
        note: input.note,
        idempotencyKey: input.idempotencyKey,
      },
    );
    const row = await this.db.queryOne<CollectionDbRow>(
      `SELECT * FROM ${this.schema}.CREDIT_COLLECTIONS WHERE ID = :id`,
      { id },
    );
    if (!row) throw new Error('insertCollection: row vanished after insert');
    return this.mapCollection(row);
  }

  private mapBill(r: CreditBillDbRow): CreditBillRow {
    const creditAmt = Number(r.CREDIT_AMT);
    const collectedAmt = Number(r.COLLECTED_AMT);
    const outstanding = round4(Math.max(0, creditAmt - collectedAmt));
    return {
      billId: r.BILL_ID,
      billNo: r.BILL_NO,
      issuedAt: r.ISSUED_AT.toISOString(),
      currency: r.CURRENCY,
      netAmt: Number(r.NET_AMT),
      creditAmt,
      collectedAmt,
      outstanding,
      status: outstanding > 0 ? 'OPEN' : 'SETTLED',
    };
  }

  private mapCollection(r: CollectionDbRow): CollectionRow {
    return {
      id: r.ID,
      billId: r.BILL_ID,
      customerCode: r.CUSTOMER_CODE,
      method: r.METHOD as CollectionRow['method'],
      currency: r.CURRENCY,
      amount: Number(r.AMOUNT),
      rate: Number(r.RATE),
      amountInBill: Number(r.AMOUNT_IN_BILL),
      cashierNo: r.CASHIER_NO == null ? null : Number(r.CASHIER_NO),
      note: r.NOTE,
      idempotencyKey: r.IDEMPOTENCY_KEY,
      createdAt: r.CREATED_AT.toISOString(),
    };
  }
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
