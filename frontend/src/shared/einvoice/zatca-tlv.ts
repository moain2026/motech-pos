/**
 * E-invoice QR payload — ZATCA-style TLV (STANDARDS/13 §5).
 *
 * The ZATCA Phase-1 QR is a Base64-encoded TLV (Tag-Length-Value) byte string
 * carrying five fields. This is the de-facto model many GCC/MENA tax authorities
 * reuse, so we implement it as the default `SA`/`GENERIC` adapter and keep the
 * shape country-configurable (STANDARDS/13 §5 adapter pattern).
 *
 * Tags:
 *   1 = seller name
 *   2 = seller VAT registration number
 *   3 = timestamp (ISO-8601)
 *   4 = invoice total (with VAT)
 *   5 = VAT amount
 *
 * Encoding: for each field  [tag:1 byte][length:1 byte][UTF-8 value bytes],
 * then the whole buffer is Base64-encoded. No signing (Phase-1 scope).
 */

export interface EInvoiceQrInput {
  sellerName: string;
  vatNumber: string;
  /** ISO-8601 timestamp, e.g. new Date().toISOString(). */
  timestamp: string;
  /** Invoice grand total (inclusive of VAT). */
  total: number;
  /** VAT amount. */
  vat: number;
}

/** UTF-8 encode a string to bytes (browser-safe, no Node Buffer). */
function utf8Bytes(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

/** Format a monetary value with 2 decimals (TLV spec: string, dot decimal). */
function money(n: number): string {
  const v = Number.isFinite(n) ? n : 0;
  return (Math.round((v + Number.EPSILON) * 100) / 100).toFixed(2);
}

/** Build one TLV field. Length is a single byte (values are always < 255). */
function tlvField(tag: number, value: string): Uint8Array {
  const valueBytes = utf8Bytes(value);
  // Guard: single-byte length. Seller names longer than 255 bytes are truncated.
  const len = Math.min(valueBytes.length, 255);
  const out = new Uint8Array(2 + len);
  out[0] = tag;
  out[1] = len;
  out.set(valueBytes.subarray(0, len), 2);
  return out;
}

/** Base64 of a byte array (browser-safe). */
function toBase64(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  if (typeof btoa === 'function') return btoa(bin);
  // Node fallback (SSR/tests).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (globalThis as any).Buffer.from(bytes).toString('base64');
}

/** Raw TLV bytes (before Base64) — exported for tests. */
export function buildTlvBytes(input: EInvoiceQrInput): Uint8Array {
  const fields = [
    tlvField(1, input.sellerName || '—'),
    tlvField(2, input.vatNumber || '—'),
    tlvField(3, input.timestamp),
    tlvField(4, money(input.total)),
    tlvField(5, money(input.vat)),
  ];
  const total = fields.reduce((n, f) => n + f.length, 0);
  const buf = new Uint8Array(total);
  let off = 0;
  for (const f of fields) {
    buf.set(f, off);
    off += f.length;
  }
  return buf;
}

/**
 * Encode the e-invoice QR payload as a Base64 TLV string.
 * This string is what gets rendered into the QR image on the receipt.
 */
export function encodeEInvoiceQr(input: EInvoiceQrInput): string {
  return toBase64(buildTlvBytes(input));
}
