import { createHash } from 'node:crypto';

/**
 * EInvoicePolicy — build the electronic-invoice document (ZATCA-style),
 * extracted from YSPOS23 PKG_GNR_E_INVC_OP + PKG_GNR_QR_CODE_API_PKG (proof:
 * docs/flows/FLOW_SYNC.md §3 steps 2/5 + docs/db/PACKAGES_ANALYSIS.md §8).
 *
 * The tax document carries the seller / VAT number / timestamp / total / vat
 * as a ZATCA-phase-1 TLV payload (base64), plus a structured JSON document and
 * a SHA-256 content hash. SUBMITDOCUMENT is SIMULATED (no external gateway) —
 * this is a pure, deterministic, side-effect-free builder so it is fully unit
 * testable and never touches the live Onyx.
 */

/** Seller/company identity for the tax document. */
export interface SellerInfo {
  /** Legal seller name (TLV tag 1). */
  name: string;
  /** VAT registration number / الرقم الضريبي (TLV tag 2). */
  vatNumber: string;
}

/** The bill facts needed to build the tax document. */
export interface EInvoiceBillInput {
  billId: string;
  billNo: string | null;
  /** ISO-8601 issue timestamp (TLV tag 3). */
  issuedAt: string;
  /** Grand total INCLUDING VAT (TLV tag 4). */
  totalAmount: number;
  /** Total VAT amount (TLV tag 5). */
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

/** The built (not yet persisted) e-invoice document. */
export interface EInvoiceDocument {
  seller: SellerInfo;
  invoiceTs: string;
  totalAmount: number;
  vatAmount: number;
  /** Base64-encoded ZATCA TLV payload (the QR content). */
  qrTlvBase64: string;
  /** SHA-256 hex of the canonical JSON document (تجزئة). */
  docHash: string;
  /** The structured invoice document (stored as CLOB). */
  docJson: string;
}

/**
 * Encode a single ZATCA TLV (Tag-Length-Value) field.
 * tag: 1 byte, length: 1 byte (UTF-8 byte length), value: UTF-8 bytes.
 */
function encodeTlv(tag: number, value: string): Buffer {
  const valueBuf = Buffer.from(value, 'utf8');
  return Buffer.concat([
    Buffer.from([tag, valueBuf.length]),
    valueBuf,
  ]);
}

/**
 * Build the ZATCA phase-1 TLV payload (5 mandatory tags) and return base64.
 *   1 = seller name, 2 = VAT number, 3 = timestamp, 4 = total (w/ VAT),
 *   5 = VAT total.
 */
export function buildQrTlvBase64(
  seller: SellerInfo,
  invoiceTs: string,
  totalAmount: number,
  vatAmount: number,
): string {
  const tlv = Buffer.concat([
    encodeTlv(1, seller.name),
    encodeTlv(2, seller.vatNumber),
    encodeTlv(3, invoiceTs),
    encodeTlv(4, totalAmount.toFixed(2)),
    encodeTlv(5, vatAmount.toFixed(2)),
  ]);
  return tlv.toString('base64');
}

/**
 * Build the full e-invoice document for a bill: TLV/QR + structured JSON +
 * content hash. Pure and deterministic (given the same inputs).
 */
export function buildEInvoice(
  seller: SellerInfo,
  bill: EInvoiceBillInput,
): EInvoiceDocument {
  const total = round4(bill.totalAmount);
  const vat = round4(bill.vatAmount);
  const qrTlvBase64 = buildQrTlvBase64(seller, bill.issuedAt, total, vat);

  // Canonical structured document (ZATCA-style simplified tax invoice).
  const doc = {
    invoiceType: 'simplified-tax-invoice',
    profile: 'ZATCA-phase1-sim',
    seller: { name: seller.name, vatNumber: seller.vatNumber },
    invoice: {
      id: bill.billId,
      number: bill.billNo,
      issuedAt: bill.issuedAt,
      currency: bill.currency,
    },
    customer: {
      code: bill.customerCode,
      name: bill.customerName,
    },
    totals: {
      taxExclusive: round4(total - vat),
      taxAmount: vat,
      taxInclusive: total,
    },
    lines: bill.lines.map((l) => ({
      lineNo: l.lineNo,
      itemCode: l.itemCode,
      itemName: l.itemName,
      qty: l.qty,
      unitPrice: round4(l.unitPrice),
      vatPercent: l.vatPercent,
      vatAmount: round4(l.lineVat),
      netAmount: round4(l.lineNet),
    })),
    qr: { encoding: 'TLV-base64', value: qrTlvBase64 },
  };
  const docJson = JSON.stringify(doc);
  const docHash = createHash('sha256').update(docJson).digest('hex');

  return {
    seller,
    invoiceTs: bill.issuedAt,
    totalAmount: total,
    vatAmount: vat,
    qrTlvBase64,
    docHash,
    docJson,
  };
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
