import { Injectable } from '@nestjs/common';
import oracledb from 'oracledb';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import {
  EInvoiceBillFacts,
  EInvoiceRepository,
  EInvoiceUniqueViolation,
  InsertEInvoiceInput,
  PersistedEInvoice,
} from '../domain/ports/einvoice-repository.port';

interface BillHeadRow {
  ID: string;
  BILL_NO: string | null;
  CURRENCY: string;
  VAT_AMT: number;
  NET_AMT: number;
  CUSTOMER_CODE: string | null;
  CUSTOMER_NAME: string | null;
  ISSUED_AT: Date;
}

interface BillLineRow {
  LINE_NO: number;
  ITEM_CODE: string;
  ITEM_NAME: string | null;
  QTY: number;
  UNIT_PRICE: number;
  VAT_PERCENT: number;
  LINE_VAT: number;
  LINE_NET: number;
}

interface EInvoiceRow {
  ID: string;
  BILL_ID: string;
  BILL_NO: string | null;
  SELLER_NAME: string;
  VAT_NUMBER: string;
  INVOICE_TS: string;
  TOTAL_AMT: number;
  VAT_AMT: number;
  QR_TLV_BASE64: string;
  DOC_HASH: string;
  DOC_JSON: string;
  FDA_CODE: string | null;
  SUBMIT_STATUS: string;
  SUBMITTED_AT: Date | null;
  CREATED_AT: Date;
}

/**
 * OracleEInvoiceRepository — reads bill facts from MOTECH_POS and stores the
 * generated e-invoice in MOTECH_POS.EINVOICES. Never touches YSPOS23 (live
 * Onyx). The UNIQUE (BILL_ID) constraint makes generation idempotent per bill.
 */
@Injectable()
export class OracleEInvoiceRepository implements EInvoiceRepository {
  constructor(private readonly db: OracleWriteService) {}

  private get schema(): string {
    return this.db.schema();
  }

  async findBillFacts(billId: string): Promise<EInvoiceBillFacts | null> {
    const head = await this.db.queryOne<BillHeadRow>(
      `SELECT ID, BILL_NO, CURRENCY, VAT_AMT, NET_AMT, CUSTOMER_CODE,
              CUSTOMER_NAME, ISSUED_AT
       FROM ${this.schema}.BILLS WHERE ID = :id`,
      { id: billId },
    );
    if (!head) return null;

    const lineRows = await this.db.query<BillLineRow>(
      `SELECT LINE_NO, ITEM_CODE, ITEM_NAME, QTY, UNIT_PRICE, VAT_PERCENT,
              LINE_VAT, LINE_NET
       FROM ${this.schema}.BILL_LINES WHERE BILL_ID = :id ORDER BY LINE_NO`,
      { id: billId },
    );

    const netAmt = Number(head.NET_AMT);
    const vatAmt = Number(head.VAT_AMT);
    return {
      billId: head.ID,
      billNo: head.BILL_NO,
      issuedAt: head.ISSUED_AT.toISOString(),
      // NET_AMT is the grand total (gross - discount + VAT), i.e. it already
      // INCLUDES VAT (proof: bill 200 gross + 30 vat → NET_AMT 230). So the
      // tax-inclusive total is NET_AMT; tax-exclusive = NET_AMT - VAT_AMT.
      totalAmount: netAmt,
      vatAmount: vatAmt,
      currency: head.CURRENCY,
      customerCode: head.CUSTOMER_CODE,
      customerName: head.CUSTOMER_NAME,
      lines: lineRows.map((r) => ({
        lineNo: Number(r.LINE_NO),
        itemCode: r.ITEM_CODE,
        itemName: r.ITEM_NAME,
        qty: Number(r.QTY),
        unitPrice: Number(r.UNIT_PRICE),
        lineVat: Number(r.LINE_VAT),
        lineNet: Number(r.LINE_NET),
        vatPercent: Number(r.VAT_PERCENT),
      })),
    };
  }

  async findByBillId(billId: string): Promise<PersistedEInvoice | null> {
    const rows = await this.db.queryWith<EInvoiceRow>(
      `SELECT ID, BILL_ID, BILL_NO, SELLER_NAME, VAT_NUMBER, INVOICE_TS,
              TOTAL_AMT, VAT_AMT, QR_TLV_BASE64, DOC_HASH, DOC_JSON, FDA_CODE,
              SUBMIT_STATUS, SUBMITTED_AT, CREATED_AT
       FROM ${this.schema}.EINVOICES WHERE BILL_ID = :id`,
      { id: billId },
      { fetchInfo: { DOC_JSON: { type: oracledb.STRING } } },
    );
    return rows.length ? this.map(rows[0]) : null;
  }

  async insert(input: InsertEInvoiceInput): Promise<PersistedEInvoice> {
    const id = uuidv7();
    try {
      await this.db.execute(
        `INSERT INTO ${this.schema}.EINVOICES
           (ID, BILL_ID, BILL_NO, SELLER_NAME, VAT_NUMBER, INVOICE_TS,
            TOTAL_AMT, VAT_AMT, QR_TLV_BASE64, DOC_HASH, DOC_JSON, FDA_CODE,
            SUBMIT_STATUS)
         VALUES (:id, :billId, :billNo, :sellerName, :vatNumber, :invoiceTs,
            :totalAmt, :vatAmt, :qr, :docHash, :docJson, :fdaCode,
            'generated')`,
        {
          id,
          billId: input.billId,
          billNo: input.billNo,
          sellerName: input.sellerName,
          vatNumber: input.vatNumber,
          invoiceTs: input.invoiceTs,
          totalAmt: input.totalAmount,
          vatAmt: input.vatAmount,
          qr: input.qrTlvBase64,
          docHash: input.docHash,
          docJson: { val: input.docJson, type: oracledb.CLOB },
          fdaCode: input.fdaCode,
        },
      );
    } catch (err) {
      if (this.isUniqueViolation(err)) {
        throw new EInvoiceUniqueViolation();
      }
      throw err;
    }
    const persisted = await this.findByBillId(input.billId);
    if (!persisted) throw new Error('insert e-invoice: vanished after commit');
    return persisted;
  }

  async markSubmitted(billId: string): Promise<PersistedEInvoice> {
    await this.db.execute(
      `UPDATE ${this.schema}.EINVOICES
         SET SUBMIT_STATUS = 'submitted', SUBMITTED_AT = SYSTIMESTAMP
       WHERE BILL_ID = :id AND SUBMIT_STATUS = 'generated'`,
      { id: billId },
    );
    const persisted = await this.findByBillId(billId);
    if (!persisted) throw new Error('markSubmitted: e-invoice not found');
    return persisted;
  }

  private map(r: EInvoiceRow): PersistedEInvoice {
    return {
      id: r.ID,
      billId: r.BILL_ID,
      billNo: r.BILL_NO,
      sellerName: r.SELLER_NAME,
      vatNumber: r.VAT_NUMBER,
      invoiceTs: r.INVOICE_TS,
      totalAmount: Number(r.TOTAL_AMT),
      vatAmount: Number(r.VAT_AMT),
      qrTlvBase64: r.QR_TLV_BASE64,
      docHash: r.DOC_HASH,
      docJson: r.DOC_JSON,
      fdaCode: r.FDA_CODE,
      submitStatus: r.SUBMIT_STATUS as PersistedEInvoice['submitStatus'],
      submittedAt: r.SUBMITTED_AT ? r.SUBMITTED_AT.toISOString() : null,
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
}
