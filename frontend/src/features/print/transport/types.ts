/**
 * PrintTransport — الواجهة الموحّدة لنقل بايتات ESC/POS إلى الطابعة
 * (فصل الترميز عن النقل — docs/PRINTER_CONNECTIVITY_RESEARCH.md §8).
 *
 * الترميز (نصي/raster عربي) يحدث مرة واحدة في escpos-encoder/rasterize؛
 * كل تطبيق هنا مسؤول فقط عن إيصال البايتات: Web Serial (بلوتوث SPP الكلاسيكي
 * + USB-serial)، WebUSB (طابعات USB class 7)، أو fallback المتصفح
 * (window.print — مستند وليس بايتات خام).
 */

export type TransportId = 'web-serial' | 'web-usb' | 'browser';

export interface PrintTransport {
  readonly id: TransportId;
  /** تسمية للعرض في واجهة اختيار الطابعة (مفتاح i18n يُشتق من id). */
  readonly label: string;
  /**
   * هل يرسل هذا الناقل بايتات ESC/POS خام للعتاد؟
   * `false` = ناقل مستندات (browser-print) — يطبع HTML عبر درايفر النظام.
   */
  readonly raw: boolean;
  /** كشف التوفر في بيئة التشغيل الحالية (بدون أي حوار أذونات). */
  isSupported(): boolean;
  /**
   * فتح الاتصال. قد يعيد استخدام إذن سابق بصمت؛ وإن لم يوجد فقد يعرض
   * حوار اختيار (يتطلب إيماءة مستخدم في Web Serial/WebUSB).
   */
  connect(): Promise<void>;
  /**
   * اختيار/اقتران تفاعلي صريح (يعرض حوار المنفذ/الجهاز دائماً).
   * يتطلب إيماءة مستخدم. غير موجود على ناقل المتصفح.
   */
  pair?(): Promise<void>;
  /** إرسال البايتات. يرمي خطأ عند الفشل (لا يبتلع الأخطاء). */
  send(bytes: Uint8Array): Promise<void>;
  /** إغلاق الاتصال وتحرير الموارد. آمن الاستدعاء المتكرر. */
  disconnect(): Promise<void>;
}

/* ------------------------------------------------------------------ */
/* أنواع Web Serial API — غير مضمّنة في lib.dom.d.ts فنعرّفها حسب     */
/* مواصفة W3C (https://wicg.github.io/serial/). Chromium فقط.          */
/* ------------------------------------------------------------------ */

export interface SerialPortOpenOptions {
  baudRate: number;
  dataBits?: 7 | 8;
  stopBits?: 1 | 2;
  parity?: 'none' | 'even' | 'odd';
  bufferSize?: number;
  flowControl?: 'none' | 'hardware';
}

export interface SerialPortInfoLike {
  usbVendorId?: number;
  usbProductId?: number;
  /** يُملأ لمنافذ بلوتوث RFCOMM (Chrome 117+). */
  bluetoothServiceClassId?: number | string;
}

export interface SerialPortLike {
  readonly readable: ReadableStream<Uint8Array> | null;
  readonly writable: WritableStream<Uint8Array> | null;
  getInfo(): SerialPortInfoLike;
  open(options: SerialPortOpenOptions): Promise<void>;
  close(): Promise<void>;
}

export interface SerialPortRequestOptions {
  filters?: Array<{
    usbVendorId?: number;
    usbProductId?: number;
    bluetoothServiceClassId?: number | string;
  }>;
  /** لإظهار خدمات RFCOMM بمعرّفات غير قياسية (SPP القياسي يظهر افتراضياً). */
  allowedBluetoothServiceClassIds?: Array<number | string>;
}

export interface SerialLike {
  requestPort(options?: SerialPortRequestOptions): Promise<SerialPortLike>;
  getPorts(): Promise<SerialPortLike[]>;
}

/** `navigator.serial` بأمان نوعي (Chromium فقط — قد يكون undefined). */
export function getNavigatorSerial(): SerialLike | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return (navigator as Navigator & { serial?: SerialLike }).serial;
}
