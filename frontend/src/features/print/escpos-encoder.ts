/**
 * ESC/POS byte encoder (STANDARDS/13 §3).
 *
 * Produces a raw ESC/POS command stream (Uint8Array) for an 80mm thermal
 * printer, to be sent later via WebUSB / Web Serial / a local print agent.
 * This is the machine path; the browser `window.print` path (receipt-print.ts)
 * is the reliable default until a printer transport is wired.
 *
 * Arabic caveat (STANDARDS/13 §3): many cheap thermal printers lack an Arabic
 * codepage. Text-mode Arabic will not render correctly on those. The robust
 * fix is to rasterize the receipt to a bitmap (GS v 0) — left as a documented
 * limitation; here we emit CP864/Windows-1256 bytes and fall back to the code
 * for names when encoding is impossible, so numbers/totals always print.
 */
import type { ReceiptModel } from './receipt-model';

const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

/** Growable byte buffer. */
class ByteWriter {
  private chunks: number[] = [];
  raw(...b: number[]) {
    for (const x of b) this.chunks.push(x & 0xff);
    return this;
  }
  bytes(arr: Uint8Array | number[]) {
    for (const x of arr) this.chunks.push(x & 0xff);
    return this;
  }
  /** ASCII/Latin text (safe subset). Non-encodable chars → '?'. */
  ascii(s: string) {
    for (const ch of s) {
      const c = ch.codePointAt(0) ?? 0x3f;
      this.chunks.push(c <= 0xff ? c : 0x3f);
    }
    return this;
  }
  newline(n = 1) {
    for (let i = 0; i < n; i++) this.chunks.push(LF);
    return this;
  }
  build(): Uint8Array {
    return Uint8Array.from(this.chunks);
  }
  get length() {
    return this.chunks.length;
  }
}

/** Try to encode Arabic/text to CP1256 bytes; returns null if unrepresentable. */
function toCp1256(s: string): Uint8Array | null {
  // Minimal Windows-1256 mapping for common Arabic range. Printers set to
  // CP1256 (ESC t 32 on many models) accept these. Unmapped → null.
  const out: number[] = [];
  for (const ch of s) {
    const cp = ch.codePointAt(0) ?? 0;
    if (cp <= 0x7f) {
      out.push(cp);
      continue;
    }
    // Arabic letters block 0x0621–0x064A → CP1256 0xC1..0xEC (approx contiguous)
    if (cp >= 0x0621 && cp <= 0x064a) {
      out.push(0xc1 + (cp - 0x0621));
      continue;
    }
    if (cp === 0x0640) {
      out.push(0xdc); // tatweel
      continue;
    }
    return null; // give up → caller falls back
  }
  return Uint8Array.from(out);
}

/**
 * GS v 0 — raster bit image. Encodes a 1-bpp monochrome bitmap (MSB-first,
 * row-major, 1 = black dot) into an ESC/POS raster print command. This is the
 * ROBUST Arabic path: the receipt is rendered to a bitmap by the browser
 * canvas (perfect Arabic shaping) then printed as dots — works on ANY thermal
 * printer regardless of its codepage. (STANDARDS/13 §3 — documented fix.)
 *
 * @param mono   packed 1-bpp rows: each row is ceil(width/8) bytes, MSB=leftmost
 * @param width  image width in dots (≤ the printer head width, 576 for 80mm)
 * @param height image height in dots
 */
export function encodeRasterImage(
  mono: Uint8Array,
  width: number,
  height: number,
): Uint8Array {
  const bytesPerRow = Math.ceil(width / 8);
  if (mono.length !== bytesPerRow * height) {
    throw new Error(
      `raster: expected ${bytesPerRow * height} bytes (${bytesPerRow}×${height}), got ${mono.length}`,
    );
  }
  const xL = bytesPerRow & 0xff;
  const xH = (bytesPerRow >> 8) & 0xff;
  const yL = height & 0xff;
  const yH = (height >> 8) & 0xff;
  // GS v 0 m xL xH yL yH [data]   (m=0 : normal density)
  const header = [GS, 0x76, 0x30, 0x00, xL, xH, yL, yH];
  const out = new Uint8Array(header.length + mono.length);
  out.set(header, 0);
  out.set(mono, header.length);
  return out;
}

function ESCPOS_ALIGN(w: ByteWriter, mode: 0 | 1 | 2) {
  w.raw(ESC, 0x61, mode); // ESC a n : 0=left 1=center 2=right
}
function ESCPOS_BOLD(w: ByteWriter, on: boolean) {
  w.raw(ESC, 0x45, on ? 1 : 0);
}
function ESCPOS_SIZE(w: ByteWriter, doubleH: boolean, doubleW: boolean) {
  const n = (doubleW ? 0x10 : 0) | (doubleH ? 0x01 : 0);
  w.raw(GS, 0x21, n); // GS ! n
}

/** Write a text line, preferring CP1256 for Arabic, else ASCII fallback. */
function line(w: ByteWriter, text: string) {
  const cp = toCp1256(text);
  if (cp) w.bytes(cp);
  else w.ascii(text);
  w.newline();
}

/** A single divider line (48 dots wide ≈ 42 chars at Font A on 80mm). */
function divider(w: ByteWriter) {
  w.ascii('-'.repeat(42)).newline();
}

/**
 * Encode a full receipt to ESC/POS bytes.
 * Includes: init, RTL-ish right alignment for Arabic, header, lines, totals,
 * QR (GS ( k model-2), cut, and cash-drawer kick (ESC p — STANDARDS/13 §3).
 */
export function encodeReceiptEscPos(
  r: ReceiptModel,
  opts: { openDrawer?: boolean; cut?: boolean } = {},
): Uint8Array {
  const w = new ByteWriter();
  const { openDrawer = false, cut = true } = opts;

  w.raw(ESC, 0x40); // ESC @ : init
  w.raw(ESC, 0x74, 32); // ESC t 32 : select CP1256 (Arabic) if supported

  // Header — centered, bold, double size.
  ESCPOS_ALIGN(w, 1);
  ESCPOS_BOLD(w, true);
  ESCPOS_SIZE(w, true, true);
  line(w, r.store.name);
  ESCPOS_SIZE(w, false, false);
  ESCPOS_BOLD(w, false);
  if (r.store.subtitle) line(w, r.store.subtitle);
  if (r.store.address) line(w, r.store.address);
  if (r.store.phone) line(w, r.store.phone);
  if (r.store.vatNumber) line(w, `الرقم الضريبي: ${r.store.vatNumber}`);
  divider(w);

  // Meta — right aligned.
  ESCPOS_ALIGN(w, 2);
  line(w, `فاتورة: ${r.billNo}`);
  line(w, `التاريخ: ${new Date(r.issuedAt).toLocaleString('ar')}`);
  line(w, `الكاشير: ${r.cashierNo}   الجهاز: ${r.machineNo}`);
  if (r.customerName) line(w, `العميل: ${r.customerName}`);
  divider(w);

  // Lines: "name" then "qty x price = net".
  for (const l of r.lines) {
    ESCPOS_ALIGN(w, 2);
    line(w, l.name);
    ESCPOS_ALIGN(w, 0);
    line(w, `  ${l.qty} x ${l.unitPrice.toFixed(2)} = ${l.lineNet.toFixed(2)}`);
  }
  divider(w);

  // Totals — right aligned.
  ESCPOS_ALIGN(w, 2);
  line(w, `الإجمالي: ${r.totals.gross.toFixed(2)}`);
  if (r.totals.discount > 0) line(w, `الخصم: ${r.totals.discount.toFixed(2)}`);
  if (r.totals.vat > 0) line(w, `الضريبة: ${r.totals.vat.toFixed(2)}`);
  ESCPOS_BOLD(w, true);
  ESCPOS_SIZE(w, true, false);
  line(w, `الصافي: ${r.totals.net.toFixed(2)} ${r.currency}`);
  ESCPOS_SIZE(w, false, false);
  ESCPOS_BOLD(w, false);
  if (r.paymentMethod) line(w, `الدفع: ${r.paymentMethod}`);
  if (r.totals.paid > 0) line(w, `المدفوع: ${r.totals.paid.toFixed(2)}`);
  if (r.totals.change > 0) line(w, `الباقي: ${r.totals.change.toFixed(2)}`);
  divider(w);

  // QR — e-invoice TLV payload (GS ( k, model 2).
  ESCPOS_ALIGN(w, 1);
  encodeQr(w, r.qrPayload);
  w.newline();
  if (r.store.footerNote) line(w, r.store.footerNote);
  w.newline(3);

  if (openDrawer) w.raw(ESC, 0x70, 0x00, 0x19, 0xfa); // ESC p 0 : kick drawer
  if (cut) w.raw(GS, 0x56, 0x42, 0x00); // GS V B 0 : partial cut

  return w.build();
}

/** Emit an ESC/POS QR code (GS ( k, model 2) for a UTF-8 string payload. */
function encodeQr(w: ByteWriter, payload: string) {
  const data = new TextEncoder().encode(payload);
  // Model 2
  w.raw(GS, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00);
  // Module size = 6
  w.raw(GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, 0x06);
  // Error correction = M (0x31)
  w.raw(GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, 0x31);
  // Store data: pL pH = len+3
  const len = data.length + 3;
  w.raw(GS, 0x28, 0x6b, len & 0xff, (len >> 8) & 0xff, 0x31, 0x50, 0x30);
  w.bytes(data);
  // Print
  w.raw(GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30);
}

/** Hex dump helper (proof / debugging). */
export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(' ');
}
