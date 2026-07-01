import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Printer, Usb } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import type { ReceiptModel } from '../receipt-model';
import { printReceipt } from '../receipt-print';
import { encodeReceiptEscPos } from '../escpos-encoder';
import { isWebUsbSupported, sendEscPosOverWebUsb } from '../webusb-printer';

/**
 * "طباعة" — print button shown after a sale. Default action is the reliable
 * browser print path (window.print, 80mm RTL). When WebUSB is available an
 * extra "طباعة USB" option sends raw ESC/POS bytes directly to the printer.
 * Printing never affects the sale (STANDARDS/13 §3) — failures are surfaced
 * softly and re-print is always available.
 */
export function PrintReceiptButton({
  receipt,
  variant = 'primary',
}: {
  receipt: ReceiptModel;
  variant?: 'primary' | 'outline' | 'ghost';
}) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const doBrowserPrint = async () => {
    setBusy(true);
    setNote(null);
    try {
      await printReceipt(receipt);
    } catch {
      setNote(t('print.failed'));
    } finally {
      setBusy(false);
    }
  };

  const doUsbPrint = async () => {
    setBusy(true);
    setNote(null);
    try {
      const bytes = encodeReceiptEscPos(receipt, { openDrawer: true, cut: true });
      const ok = await sendEscPosOverWebUsb(bytes);
      setNote(ok ? t('print.sent') : t('print.failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button variant={variant} className="flex-1" disabled={busy} onClick={doBrowserPrint}>
          <Printer className="size-5" />
          {busy ? t('print.printing') : t('print.print')}
        </Button>
        {isWebUsbSupported() ? (
          <Button variant="outline" disabled={busy} onClick={doUsbPrint} title="WebUSB ESC/POS">
            <Usb className="size-5" />
          </Button>
        ) : null}
      </div>
      {note ? (
        <p role="status" className="text-center text-xs text-[var(--color-muted)]">
          {note}
        </p>
      ) : null}
    </div>
  );
}
