/**
 * طبقة النقل الموحّدة (docs/PRINT_TRANSPORT.md):
 * - `detectTransports()` — الناقلات المتاحة مرتّبة بالأفضلية:
 *   Web Serial (بلوتوث SPP + تسلسلي) → WebUSB → طباعة المتصفح (دائماً).
 * - `printViaTransport(transport, model, opts)` — يبني البايتات (raster
 *   العربي افتراضياً أو ESC/POS نصي) ويرسلها؛ ولناقل المتصفح يطبع HTML.
 * - تفضيل الناقل يُخزَّن في localStorage (getPreferredTransportId).
 *
 * الترميز يحدث هنا مرة واحدة — الناقلات لا تعرف شيئاً عن ESC/POS.
 */
import type { PrintTransport, TransportId } from './types';
import { WebSerialTransport } from './web-serial';
import { WebUsbTransport } from './web-usb';
import { BrowserPrintTransport } from './browser-print';
import type { ReceiptModel } from '../receipt-model';
import { encodeReceiptEscPos } from '../escpos-encoder';
import { rasterizeReceipt, canRasterize, HEAD_WIDTH_80MM } from '../rasterize';

export type { PrintTransport, TransportId } from './types';
export { WebSerialTransport, isWebSerialSupported, getSerialBaudRate, setSerialBaudRate, SERIAL_BAUD_RATES } from './web-serial';
export { WebUsbTransport } from './web-usb';
export { BrowserPrintTransport } from './browser-print';

const PREF_KEY = 'motech.print.transport';

/* نسخ مفردة (singletons) — تحافظ على الاتصال المفتوح بين عمليات الطباعة. */
const registry: readonly PrintTransport[] = [
  new WebSerialTransport(),
  new WebUsbTransport(),
  new BrowserPrintTransport(),
];

/**
 * الناقلات المتاحة في بيئة التشغيل الحالية مرتّبة بالأفضلية:
 * Web Serial → WebUSB → المتصفح. ناقل المتصفح متاح دائماً (fallback).
 */
export function detectTransports(): PrintTransport[] {
  return registry.filter((t) => t.isSupported());
}

/** ناقل بمعرّفه (إن كان مدعوماً في هذه البيئة). */
export function getTransport(id: TransportId): PrintTransport | undefined {
  return detectTransports().find((t) => t.id === id);
}

/** تفضيل المستخدم المخزَّن (localStorage) — أو undefined. */
export function getPreferredTransportId(): TransportId | undefined {
  try {
    const v = localStorage.getItem(PREF_KEY);
    return v === 'web-serial' || v === 'web-usb' || v === 'browser' ? v : undefined;
  } catch {
    return undefined;
  }
}

export function setPreferredTransportId(id: TransportId): void {
  try {
    localStorage.setItem(PREF_KEY, id);
  } catch {
    /* localStorage محجوب — نتجاهل */
  }
}

/**
 * الناقل الفعّال: تفضيل المستخدم إن كان لا يزال مدعوماً، وإلا الأفضل
 * المتاح تلقائياً (Web Serial → WebUSB → المتصفح).
 */
export function resolveActiveTransport(): PrintTransport {
  const available = detectTransports();
  const preferred = getPreferredTransportId();
  const match = preferred ? available.find((t) => t.id === preferred) : undefined;
  // ناقل المتصفح مدعوم دائماً في بيئة الويب، فالمصفوفة لا تكون فارغة.
  const active = match ?? available[0];
  if (!active) throw new Error('لا يوجد أي ناقل طباعة متاح');
  return active;
}

export interface PrintViaTransportOptions {
  /**
   * raster العربي (GS v 0) — الافتراضي للطابعات الحرارية لأنه يضمن العربي
   * على أي طابعة بغضّ النظر عن ترميزها (docs/PRINT_RASTER.md). `false` =
   * ESC/POS نصي (CP1256) للطابعات ذات صفحة الترميز العربية.
   */
  raster?: boolean;
  /** عرض رأس الطابعة بالنقاط (576 = 80mm، 384 = 58mm). */
  headWidth?: number;
  /** فتح درج النقود (ESC p). */
  openDrawer?: boolean;
  /** قص الورق (GS V). */
  cut?: boolean;
}

/** بايتات ESC/POS النهائية: init + (raster عربي | نصي) + drawer/cut. */
export function buildPrintBytes(
  model: ReceiptModel,
  opts: PrintViaTransportOptions = {},
): Uint8Array {
  const { raster = true, headWidth = HEAD_WIDTH_80MM, openDrawer = false, cut = true } = opts;
  if (raster && canRasterize()) {
    // raster: ESC @ (init) + GS v 0 (الصورة) + تغذية + drawer/cut.
    const img = rasterizeReceipt(model, headWidth);
    const tail: number[] = [0x0a, 0x0a, 0x0a];
    if (openDrawer) tail.push(0x1b, 0x70, 0x00, 0x19, 0xfa); // ESC p 0
    if (cut) tail.push(0x1d, 0x56, 0x42, 0x00); // GS V B 0
    const out = new Uint8Array(2 + img.length + tail.length);
    out.set([0x1b, 0x40], 0); // ESC @
    out.set(img, 2);
    out.set(tail, 2 + img.length);
    return out;
  }
  return encodeReceiptEscPos(model, { openDrawer, cut });
}

/**
 * الطباعة عبر ناقل: يبني البايتات ويرسلها (للناقلات الخام)، أو يطبع HTML
 * عبر درايفر النظام (ناقل المتصفح). يرمي خطأ عند الفشل — القرار للمستدعي
 * (الطباعة لا تكسر البيع أبداً: STANDARDS/13 §3).
 */
export async function printViaTransport(
  transport: PrintTransport,
  model: ReceiptModel,
  opts: PrintViaTransportOptions = {},
): Promise<void> {
  if (!transport.raw) {
    // ناقل مستندي (المتصفح) — يطبع النموذج مباشرة.
    if (transport instanceof BrowserPrintTransport) {
      await transport.printModel(model);
      return;
    }
    throw new Error(`الناقل ${transport.id} غير خام ولا يدعم طباعة النموذج`);
  }
  const bytes = buildPrintBytes(model, opts);
  await transport.connect();
  await transport.send(bytes);
}
