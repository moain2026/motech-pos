import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Printer, Settings2, Check } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import type { ReceiptModel } from '../receipt-model';
import { usePrinter } from '../hooks/usePrinter';
import type { TransportId } from '../transport';

/**
 * "طباعة" — زر الطباعة بعد البيع (STANDARDS/13 §3).
 *
 * يستخدم طبقة النقل الموحّدة (usePrinter): يختار تلقائياً أفضل ناقل متاح
 * (Web Serial بلوتوث SPP/تسلسلي → WebUSB → طباعة المتصفح) مع raster عربي
 * افتراضياً للطابعات الحرارية، ويسقط تلقائياً لـwindow.print عند أي فشل —
 * الطباعة لا تكسر البيع أبداً وإعادة الطباعة متاحة دائماً.
 *
 * زر «إعداد الطابعة» (الترس) يعرض الناقلات المتاحة؛ اختيار Web Serial/WebUSB
 * يفتح حوار الاقتران (إيماءة مستخدم) ويخزّن التفضيل في localStorage.
 */
export function PrintReceiptButton({
  receipt,
  variant = 'primary',
}: {
  receipt: ReceiptModel;
  variant?: 'primary' | 'outline' | 'ghost';
}) {
  const { t } = useTranslation();
  const printer = usePrinter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [setupOpen, setSetupOpen] = useState(false);

  const doPrint = async () => {
    setBusy(true);
    setNote(null);
    try {
      const outcome = await printer.print(receipt, { openDrawer: true, cut: true });
      if (outcome === 'failed') setNote(t('print.failed'));
      else if (outcome === 'sent' && printer.activeId !== 'browser') setNote(t('print.sent'));
      else if (outcome === 'fallback') setNote(t('print.fellBack'));
    } finally {
      setBusy(false);
    }
  };

  const doPair = async (id: TransportId) => {
    setBusy(true);
    setNote(null);
    try {
      const ok = await printer.pair(id);
      setNote(ok ? t('print.paired') : t('print.pairFailed'));
      if (ok) setSetupOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button variant={variant} className="flex-1" disabled={busy} onClick={doPrint}>
          <Printer className="size-5" />
          {busy ? t('print.printing') : t('print.print')}
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={busy}
          onClick={() => setSetupOpen((v) => !v)}
          title={t('print.setup')}
          aria-label={t('print.setup')}
          aria-expanded={setupOpen}
        >
          <Settings2 className="size-5" />
        </Button>
      </div>

      {setupOpen ? (
        <div
          role="menu"
          aria-label={t('print.setup')}
          className="flex flex-col gap-1 rounded-[var(--radius)] border bg-[var(--color-surface-2)] p-2"
        >
          {printer.transports.map((tr) => (
            <Button
              key={tr.id}
              variant="ghost"
              size="sm"
              className="justify-between"
              disabled={busy}
              onClick={() => doPair(tr.id)}
            >
              <span>{t(`print.transport.${tr.id}`)}</span>
              {printer.activeId === tr.id ? <Check className="size-4" /> : null}
            </Button>
          ))}
        </div>
      ) : null}

      {note ? (
        <p role="status" className="text-center text-xs text-[var(--color-muted)]">
          {note}
        </p>
      ) : null}
    </div>
  );
}
