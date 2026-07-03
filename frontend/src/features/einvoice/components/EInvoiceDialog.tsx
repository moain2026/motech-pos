import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, FileText, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { LoadingView } from '@/shared/ui/StateView';
import { ApiError } from '@/shared/lib/api-client';
import { formatMoney } from '@/shared/lib/format';
import { renderQrDataUrl } from '@/features/print';
import type { EInvoice } from '@/shared/lib/types';
import { useEInvoice, useGenerateEInvoice } from '../api/einvoice.api';

/**
 * فاتورة إلكترونية (E-invoice) — for a POSTED bill (MOTECH_POS UUID). Fetches
 * an existing e-invoice; if none, offers to generate it. Renders the ZATCA
 * TLV/QR and the submission (simulated SUBMITDOCUMENT) status.
 */
export function EInvoiceDialog({
  billId,
  billNo,
  onClose,
}: {
  billId: string;
  billNo?: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const existing = useEInvoice(billId);
  const generate = useGenerateEInvoice();
  const [genErr, setGenErr] = useState<string | null>(null);

  // The invoice we have (fetched or freshly generated).
  const invoice: EInvoice | undefined = existing.data ?? generate.data;

  // 404 from GET simply means "not generated yet".
  const notGenerated =
    existing.isError && existing.error instanceof ApiError && existing.error.status === 404;

  const doGenerate = async () => {
    setGenErr(null);
    try {
      await generate.mutateAsync(billId);
    } catch (e) {
      if (e instanceof ApiError) {
        const trace = e.problem.traceId ? ` (traceId: ${e.problem.traceId})` : '';
        setGenErr(`${e.problem.detail || e.problem.title}${trace}`);
      } else {
        setGenErr(t('einvoice.genError'));
      }
    }
  };

  const otherError =
    existing.isError && !notGenerated
      ? existing.error instanceof ApiError
        ? existing.error.problem.detail || existing.error.problem.title
        : t('einvoice.genError')
      : null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('einvoice.title')}
    >
      <div className="flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="flex items-center gap-2 font-bold">
            <FileText className="size-5 text-[var(--color-brand-500)]" aria-hidden />
            {t('einvoice.title')}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('returns.close')}>
            <X className="size-5" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scroll-thin p-4">
          {existing.isLoading ? (
            <LoadingView />
          ) : invoice ? (
            <InvoiceView invoice={invoice} />
          ) : notGenerated ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <FileText className="size-12 text-[var(--color-muted)]" aria-hidden />
              <p className="text-sm text-[var(--color-muted)]">
                {t('einvoice.notGenerated', { billNo: billNo ?? '' })}
              </p>
              {genErr ? (
                <p role="alert" className="flex items-center gap-2 rounded-md bg-[var(--color-danger)]/15 p-2 text-xs text-[var(--color-danger)]">
                  <AlertTriangle className="size-4" aria-hidden />
                  {genErr}
                </p>
              ) : null}
              <Button variant="primary" onClick={doGenerate} disabled={generate.isPending} className="w-full">
                <ShieldCheck className="size-4" />
                {generate.isPending ? t('einvoice.generating') : t('einvoice.generate')}
              </Button>
            </div>
          ) : (
            <p role="alert" className="rounded-md bg-[var(--color-danger)]/15 p-3 text-center text-sm text-[var(--color-danger)]">
              {otherError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function InvoiceView({ invoice }: { invoice: EInvoice }) {
  const { t } = useTranslation();
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    renderQrDataUrl(invoice.qrTlvBase64)
      .then((url) => alive && setQr(url))
      .catch(() => alive && setQr(null));
    return () => {
      alive = false;
    };
  }, [invoice.qrTlvBase64]);

  return (
    <div className="flex flex-col items-center gap-4">
      <span className="flex items-center gap-1.5 rounded-full bg-[var(--color-success)]/15 px-3 py-1 text-xs font-medium text-[var(--color-success)]">
        <ShieldCheck className="size-4" aria-hidden />
        {t('einvoice.submitted')}
      </span>

      {qr ? (
        <img
          src={qr}
          alt={t('einvoice.qrAlt')}
          className="size-44 rounded-lg border bg-white p-2"
        />
      ) : (
        <div className="grid size-44 place-items-center rounded-lg border text-xs text-[var(--color-muted)]">
          {t('einvoice.qrRendering')}
        </div>
      )}

      <div className="w-full space-y-2">
        <Row label={t('einvoice.billNo')} value={invoice.billNo} tnum />
        <Row label={t('einvoice.seller')} value={invoice.sellerName} />
        <Row label={t('einvoice.vatNumber')} value={invoice.vatNumber} tnum />
        <Row label={t('einvoice.total')} value={formatMoney(invoice.totalAmount)} tnum />
        <Row label={t('einvoice.vat')} value={formatMoney(invoice.vatAmount)} tnum />
        <div className="flex flex-col gap-1 border-t pt-2">
          <span className="text-xs text-[var(--color-muted)]">{t('einvoice.hash')}</span>
          <code className="tnum break-all rounded bg-[var(--color-surface-2)] p-2 text-[10px] leading-tight">
            {invoice.docHash}
          </code>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, tnum }: { label: string; value: string; tnum?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-[var(--color-muted)]">{label}</span>
      <span className={(tnum ? 'tnum ' : '') + 'font-medium text-end'}>{value}</span>
    </div>
  );
}
