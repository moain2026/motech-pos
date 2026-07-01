import { describe, expect, it } from 'vitest';
import {
  buildEInvoice,
  buildQrTlvBase64,
  EInvoiceBillInput,
  SellerInfo,
} from '../../src/modules/einvoice/domain/einvoice-policy';

const SELLER: SellerInfo = {
  name: 'Motech POS Store',
  vatNumber: '300000000000003',
};

const BILL: EInvoiceBillInput = {
  billId: 'b-1',
  billNo: 'B0001',
  issuedAt: '2026-07-01T12:00:00.000Z',
  totalAmount: 115,
  vatAmount: 15,
  currency: 'YER',
  customerCode: 'C1',
  customerName: 'Ali',
  lines: [
    {
      lineNo: 1,
      itemCode: 'I1',
      itemName: 'Water',
      qty: 1,
      unitPrice: 100,
      lineVat: 15,
      lineNet: 100,
      vatPercent: 15,
    },
  ],
};

describe('buildQrTlvBase64 (ZATCA phase-1 TLV)', () => {
  it('encodes 5 mandatory tags as decodable TLV', () => {
    const b64 = buildQrTlvBase64(SELLER, BILL.issuedAt, 115, 15);
    const buf = Buffer.from(b64, 'base64');
    // Walk the TLV structure back out.
    const fields: Record<number, string> = {};
    let i = 0;
    while (i < buf.length) {
      const tag = buf[i];
      const len = buf[i + 1];
      fields[tag] = buf.subarray(i + 2, i + 2 + len).toString('utf8');
      i += 2 + len;
    }
    expect(fields[1]).toBe('Motech POS Store');
    expect(fields[2]).toBe('300000000000003');
    expect(fields[3]).toBe('2026-07-01T12:00:00.000Z');
    expect(fields[4]).toBe('115.00');
    expect(fields[5]).toBe('15.00');
  });
});

describe('buildEInvoice', () => {
  it('produces a QR, a stable SHA-256 hash and structured JSON', () => {
    const doc = buildEInvoice(SELLER, BILL);
    expect(doc.qrTlvBase64.length).toBeGreaterThan(0);
    expect(doc.docHash).toMatch(/^[0-9a-f]{64}$/);
    const parsed = JSON.parse(doc.docJson);
    expect(parsed.seller.vatNumber).toBe('300000000000003');
    expect(parsed.totals.taxInclusive).toBe(115);
    expect(parsed.totals.taxAmount).toBe(15);
    expect(parsed.totals.taxExclusive).toBe(100);
    expect(parsed.lines).toHaveLength(1);
  });

  it('is deterministic (same input → same hash + QR)', () => {
    const a = buildEInvoice(SELLER, BILL);
    const b = buildEInvoice(SELLER, BILL);
    expect(a.docHash).toBe(b.docHash);
    expect(a.qrTlvBase64).toBe(b.qrTlvBase64);
  });

  it('rounds money to 4dp in the document', () => {
    const doc = buildEInvoice(SELLER, {
      ...BILL,
      totalAmount: 115.123456,
      vatAmount: 15.049999,
    });
    const parsed = JSON.parse(doc.docJson);
    expect(parsed.totals.taxInclusive).toBe(115.1235);
    expect(parsed.totals.taxAmount).toBe(15.05);
  });
});
