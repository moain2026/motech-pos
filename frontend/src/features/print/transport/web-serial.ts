/**
 * ناقل Web Serial — بلوتوث SPP الكلاسيكي (RFCOMM) + USB-serial.
 *
 * منذ Chrome 117 (سطح المكتب) و138 (Android) يعرض `navigator.serial` أجهزة
 * البلوتوث الكلاسيكية المقترنة التي تعلن بروفايل SPP كمنافذ تسلسلية — وهذا
 * يشمل طابعات مثل Bixolon SPP-R310 (docs/PRINTER_CONNECTIVITY_RESEARCH.md
 * §1.2). الشروط: Chromium حصراً، سياق آمن، اقتران مسبق على مستوى النظام،
 * وإيماءة مستخدم لأول requestPort() لكل أصل — بعدها getPorts() يعيد الاتصال
 * بصمت.
 *
 * baud: البلوتوث RFCOMM يتجاهل السرعة عملياً لكن المواصفة تتطلبها؛ محوّلات
 * USB-serial تحتاجها فعلياً. الافتراضي 9600 (شائع في الطاببات الحرارية)
 * وقابل للضبط (9600/19200/38400/57600/115200).
 */
import type { PrintTransport, SerialPortLike, SerialLike } from './types';
import { getNavigatorSerial } from './types';

const BAUD_KEY = 'motech.print.serial.baud';
export const SERIAL_BAUD_RATES = [9600, 19200, 38400, 57600, 115200] as const;
const DEFAULT_BAUD = 9600;

export function getSerialBaudRate(): number {
  try {
    const v = Number(localStorage.getItem(BAUD_KEY));
    return SERIAL_BAUD_RATES.includes(v as (typeof SERIAL_BAUD_RATES)[number])
      ? v
      : DEFAULT_BAUD;
  } catch {
    return DEFAULT_BAUD;
  }
}

export function setSerialBaudRate(baud: number): void {
  try {
    localStorage.setItem(BAUD_KEY, String(baud));
  } catch {
    /* localStorage محجوب — نتجاهل */
  }
}

export function isWebSerialSupported(): boolean {
  return getNavigatorSerial() !== undefined;
}

export class WebSerialTransport implements PrintTransport {
  readonly id = 'web-serial' as const;
  readonly label = 'Web Serial (بلوتوث/تسلسلي)';
  readonly raw = true;

  private port: SerialPortLike | null = null;

  isSupported(): boolean {
    return isWebSerialSupported();
  }

  private serialOrThrow(): SerialLike {
    const serial = getNavigatorSerial();
    if (!serial) throw new Error('Web Serial غير مدعوم في هذا المتصفح (Chromium فقط)');
    return serial;
  }

  /** إعادة استخدام منفذ سبق منحه إذناً، وإلا عرض حوار الاختيار. */
  async connect(): Promise<void> {
    if (this.port?.writable) return; // مفتوح بالفعل
    const serial = this.serialOrThrow();
    const granted = await serial.getPorts();
    const port = granted[0] ?? (await serial.requestPort());
    await this.openPort(port);
  }

  /** اختيار منفذ جديد صراحةً (زر «إعداد الطابعة»). يتطلب إيماءة مستخدم. */
  async pair(): Promise<void> {
    await this.disconnect();
    const serial = this.serialOrThrow();
    const port = await serial.requestPort();
    await this.openPort(port);
  }

  private async openPort(port: SerialPortLike): Promise<void> {
    // المنفذ قد يكون مفتوحاً من محاولة سابقة (readable/writable غير null).
    if (!port.writable) {
      await port.open({ baudRate: getSerialBaudRate() });
    }
    this.port = port;
  }

  async send(bytes: Uint8Array): Promise<void> {
    if (!this.port?.writable) await this.connect();
    const writable = this.port?.writable;
    if (!writable) throw new Error('منفذ الطابعة التسلسلي غير قابل للكتابة');
    const writer = writable.getWriter();
    try {
      // نسخة بمخزن ArrayBuffer جديد (سلامة أنواع BufferSource).
      const buf = new Uint8Array(bytes.length);
      buf.set(bytes);
      await writer.write(buf);
    } finally {
      // نحرّر القفل دائماً؛ لا نغلق المنفذ — يبقى للطباعة التالية.
      writer.releaseLock();
    }
  }

  async disconnect(): Promise<void> {
    const port = this.port;
    this.port = null;
    if (!port) return;
    try {
      await port.close();
    } catch {
      /* الإغلاق المتكرر/فشل الإغلاق لا يهم */
    }
  }
}
