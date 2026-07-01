export const EINVOICE_REPOSITORY = Symbol('EINVOICE_REPOSITORY');

/** A bill (header + minimal lines) read back from MOTECH_POS for e-invoicing. */
export interface EInvoiceBillFacts {
  billId: string;
  billNo: string | null;
  issuedAt: string;
  /** Grand total including VAT (NET_AMT + VAT_AMT of the header). */
  totalAmount: number;
  vatAmount: number;
  currency: string;
  customerCode: string | null;
  customerName: string | null;
  lines: Array<{
    lineNo: number;
    itemCode: string;
    itemName: string | null;
    qty: number;
    unitPrice: number;
    lineVat: number;
    lineNet: number;
    vatPercent: number;
  }>;
}

/** A persisted e-invoice row. */
export interface PersistedEInvoice {
  id: string;
  billId: string;
  billNo: string | null;
  sellerName: string;
  vatNumber: string;
  invoiceTs: string;
  totalAmount: number;
  vatAmount: number;
  qrTlvBase64: string;
  docHash: string;
  docJson: string;
  fdaCode: string | null;
  submitStatus: 'generated' | 'submitted';
  submittedAt: string | null;
  createdAt: string;
}

/** Values to insert a new e-invoice. */
export interface InsertEInvoiceInput {
  billId: string;
  billNo: string | null;
  sellerName: string;
  vatNumber: string;
  invoiceTs: string;
  totalAmount: number;
  vatAmount: number;
  qrTlvBase64: string;
  docHash: string;
  docJson: string;
  fdaCode: string;
}

/** Thrown on the UNIQUE (BILL_ID) collision so the caller can replay. */
export class EInvoiceUniqueViolation extends Error {
  constructor() {
    super('e-invoice already exists for this bill');
    this.name = 'EInvoiceUniqueViolation';
  }
}

export interface EInvoiceRepository {
  /** Read the bill facts (header+lines) from MOTECH_POS, or null if missing. */
  findBillFacts(billId: string): Promise<EInvoiceBillFacts | null>;

  /** Fetch a stored e-invoice by bill id, or null. */
  findByBillId(billId: string): Promise<PersistedEInvoice | null>;

  /**
   * Insert a new e-invoice. Throws EInvoiceUniqueViolation on the UNIQUE
   * (BILL_ID) collision so the caller can fall back to replay.
   */
  insert(input: InsertEInvoiceInput): Promise<PersistedEInvoice>;

  /** Mark a generated e-invoice as submitted (simulated SUBMITDOCUMENT). */
  markSubmitted(billId: string): Promise<PersistedEInvoice>;
}
