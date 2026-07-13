/**
 * ناقل المتصفح — fallback دائم. يغلّف `printReceipt` (window.print عبر iframe
 * مخفي، HTML عربي RTL 80mm + QR) في واجهة `PrintTransport`.
 *
 * هذا الناقل «مستندي» لا خام (`raw = false`): لا يستقبل بايتات ESC/POS بل
 * يطبع نموذج الإيصال عبر درايفر النظام — لذا `send(bytes)` غير مدعومة عمداً
 * و`printViaTransport` في transport/index.ts تتعامل معه بمسار خاص.
 * يعمل في كل المتصفحات ولا يُكسر أبداً (STANDARDS/13 §3).
 */
import type { PrintTransport } from './types';
import type { ReceiptModel } from '../receipt-model';
import { printReceipt } from '../receipt-print';

export class BrowserPrintTransport implements PrintTransport {
  readonly id = 'browser' as const;
  readonly label = 'طباعة المتصفح (درايفر النظام)';
  readonly raw = false;

  isSupported(): boolean {
    return typeof window !== 'undefined' && typeof window.print === 'function';
  }

  async connect(): Promise<void> {
    /* لا اتصال مطلوب — درايفر النظام */
  }

  /** غير مدعومة: هذا ناقل مستندات. استخدم printModel(). */
  async send(_bytes: Uint8Array): Promise<void> {
    void _bytes;
    throw new Error('ناقل المتصفح يطبع مستندات لا بايتات خام — استخدم printModel');
  }

  /** المسار الفعلي: طباعة نموذج الإيصال كـHTML عبر window.print. */
  async printModel(model: ReceiptModel): Promise<void> {
    await printReceipt(model);
  }

  async disconnect(): Promise<void> {
    /* لا شيء يُحرَّر */
  }
}
