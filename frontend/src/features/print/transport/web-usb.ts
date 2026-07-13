/**
 * ناقل WebUSB — يغلّف مسار `webusb-printer.ts` الموجود في واجهة
 * `PrintTransport`، ويضيف فوقه إعادة الاتصال الصامت: `navigator.usb
 * .getDevices()` يعيد الأجهزة المأذونة سابقاً بلا حوار، فلا نطلب إذن
 * المستخدم إلا عند أول اقتران.
 *
 * حدود المنصة (docs/PRINTER_CONNECTIVITY_RESEARCH.md §1.3): يعمل على
 * Linux/macOS/Android/ChromeOS. على Windows درايفر usbprint.sys يستحوذ على
 * الجهاز فيفشل claimInterface — عندها يسقط الاختيار التلقائي لناقل المتصفح.
 */
import type { PrintTransport } from './types';
import { isWebUsbSupported } from '../webusb-printer';

/* أنواع WebUSB الدنيا المطلوبة (غير مضمّنة في lib.dom.d.ts). */
interface UsbEndpointLike {
  direction: string;
  endpointNumber: number;
}
interface UsbInterfaceLike {
  interfaceNumber: number;
  alternate: { endpoints: UsbEndpointLike[] };
}
interface UsbDeviceLike {
  opened: boolean;
  configuration: { interfaces: UsbInterfaceLike[] } | null;
  open(): Promise<void>;
  selectConfiguration(n: number): Promise<void>;
  claimInterface(n: number): Promise<void>;
  transferOut(endpoint: number, data: BufferSource): Promise<{ status?: string }>;
  close(): Promise<void>;
}
interface UsbLike {
  getDevices(): Promise<UsbDeviceLike[]>;
  requestDevice(opts: { filters: Array<{ classCode?: number }> }): Promise<UsbDeviceLike>;
}

function getNavigatorUsb(): UsbLike | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return (navigator as Navigator & { usb?: UsbLike }).usb;
}

export class WebUsbTransport implements PrintTransport {
  readonly id = 'web-usb' as const;
  readonly label = 'WebUSB (طابعة USB)';
  readonly raw = true;

  private device: UsbDeviceLike | null = null;
  private outEndpoint = 1;

  isSupported(): boolean {
    return isWebUsbSupported();
  }

  private usbOrThrow(): UsbLike {
    const usb = getNavigatorUsb();
    if (!usb) throw new Error('WebUSB غير مدعوم في هذا المتصفح (Chromium فقط)');
    return usb;
  }

  /** إعادة استخدام جهاز مأذون سابقاً، وإلا عرض حوار الاختيار. */
  async connect(): Promise<void> {
    if (this.device?.opened) return;
    const usb = this.usbOrThrow();
    const granted = await usb.getDevices();
    const device =
      granted[0] ?? (await usb.requestDevice({ filters: [{ classCode: 7 }] }));
    await this.openDevice(device);
  }

  /** اختيار جهاز جديد صراحةً (زر «إعداد الطابعة»). يتطلب إيماءة مستخدم. */
  async pair(): Promise<void> {
    await this.disconnect();
    const usb = this.usbOrThrow();
    // classCode 7 = printer (نفس فلتر webusb-printer.ts).
    const device = await usb.requestDevice({ filters: [{ classCode: 7 }] });
    await this.openDevice(device);
  }

  private async openDevice(device: UsbDeviceLike): Promise<void> {
    if (!device.opened) await device.open();
    if (!device.configuration) await device.selectConfiguration(1);
    const iface = device.configuration?.interfaces[0];
    const ifaceNo = iface?.interfaceNumber ?? 0;
    await device.claimInterface(ifaceNo);
    this.outEndpoint =
      iface?.alternate.endpoints.find((e) => e.direction === 'out')?.endpointNumber ?? 1;
    this.device = device;
  }

  async send(bytes: Uint8Array): Promise<void> {
    if (!this.device?.opened) await this.connect();
    const device = this.device;
    if (!device) throw new Error('لا توجد طابعة USB متصلة');
    const buf = new Uint8Array(bytes.length);
    buf.set(bytes);
    const res = await device.transferOut(this.outEndpoint, buf);
    if (res.status && res.status !== 'ok') {
      throw new Error(`فشل الإرسال عبر WebUSB (status=${res.status})`);
    }
  }

  async disconnect(): Promise<void> {
    const device = this.device;
    this.device = null;
    if (!device) return;
    try {
      await device.close();
    } catch {
      /* لا يهم */
    }
  }
}
