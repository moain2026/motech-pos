/**
 * WebUSB thermal-printer transport (STANDARDS/13 §3) — sends raw ESC/POS bytes
 * to a USB printer from Chromium. This is the "direct from browser" path; the
 * more production-robust alternative is a local print agent (documented as a
 * limitation — not implemented in this phase).
 *
 * Availability is feature-detected; callers should always keep the
 * window.print path as the default. Requires a secure context + user gesture.
 */

export function isWebUsbSupported(): boolean {
  return typeof navigator !== 'undefined' && 'usb' in navigator;
}

interface UsbLike {
  requestDevice(opts: { filters: unknown[] }): Promise<USBDeviceLike>;
}
interface USBDeviceLike {
  open(): Promise<void>;
  selectConfiguration(n: number): Promise<void>;
  claimInterface(n: number): Promise<void>;
  configuration?: { interfaces: Array<{ interfaceNumber: number; alternate: { endpoints: Array<{ direction: string; endpointNumber: number }> } }> };
  transferOut(endpoint: number, data: BufferSource): Promise<{ status: string }>;
  close(): Promise<void>;
}

/**
 * Prompt for a USB printer, claim the OUT endpoint, and write the bytes.
 * Returns true on success. Any failure resolves false (sale must not break).
 */
export async function sendEscPosOverWebUsb(bytes: Uint8Array): Promise<boolean> {
  if (!isWebUsbSupported()) return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const usb = (navigator as any).usb as UsbLike;
  let device: USBDeviceLike | null = null;
  try {
    // Class 7 = printer. Empty filters would also work but class filter is nicer.
    device = await usb.requestDevice({ filters: [{ classCode: 7 }] });
    await device.open();
    if (!device.configuration) await device.selectConfiguration(1);
    const iface = device.configuration?.interfaces?.[0];
    const ifaceNo = iface?.interfaceNumber ?? 0;
    await device.claimInterface(ifaceNo);
    const outEp =
      iface?.alternate.endpoints.find((e) => e.direction === 'out')?.endpointNumber ?? 1;
    const res = await device.transferOut(outEp, bytes);
    return res.status === 'ok';
  } catch {
    return false;
  } finally {
    try {
      await device?.close();
    } catch {
      /* ignore */
    }
  }
}
