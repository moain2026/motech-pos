import { useTranslation } from 'react-i18next';
import { X, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { LoadingView, ErrorView } from '@/shared/ui/StateView';
import { formatDateTime, formatNumber } from '@/shared/lib/format';
import { useTransfer } from '../api/transfers.api';

/** Read-only transfer detail — GET /transfers/{id} (header + lines w/ avlQty). */
export function TransferDetailDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const { t } = useTranslation();
  const tr = useTransfer(id);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('transfers.detailTitle')}
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="flex items-center gap-2 font-bold">
            <ArrowLeftRight className="size-5 text-[var(--color-brand-500)]" aria-hidden />
            {t('transfers.detailTitle')}
            {tr.data ? <span className="tnum text-[var(--color-muted)]">#{tr.data.reqNo}</span> : null}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('transfers.close')}>
            <X className="size-5" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scroll-thin p-4">
          {tr.isLoading ? (
            <LoadingView />
          ) : tr.isError ? (
            <ErrorView error={tr.error} onRetry={() => tr.refetch()} />
          ) : tr.data ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-2 rounded-md border bg-[var(--color-surface-2)] p-3 text-sm sm:grid-cols-2">
                <Info label={t('transfers.from')} value={`#${tr.data.fromWarehouse}`} mono />
                <Info label={t('transfers.to')} value={`#${tr.data.toWarehouse}`} mono />
                <Info label={t('transfers.statusL')} value={t(`transfers.status.${tr.data.status}`)} />
                <Info label={t('transfers.createdAt')} value={formatDateTime(tr.data.createdAt)} mono />
                <Info label={t('transfers.createdBy')} value={tr.data.createdBy} />
                {tr.data.reqSide ? <Info label={t('transfers.reqSide')} value={tr.data.reqSide} /> : null}
                {tr.data.purpose ? <Info label={t('transfers.purpose')} value={tr.data.purpose} /> : null}
                {tr.data.refNo ? <Info label={t('transfers.refNo')} value={tr.data.refNo} mono /> : null}
                {tr.data.cancelledAt ? (
                  <Info
                    label={t('transfers.cancelledAt')}
                    value={`${formatDateTime(tr.data.cancelledAt)} (${tr.data.cancelledBy ?? '—'})`}
                    mono
                  />
                ) : null}
              </div>

              <table className="w-full text-sm">
                <thead className="bg-[var(--color-surface-2)] text-[var(--color-muted)]">
                  <tr>
                    <th className="px-2 py-2 text-start font-semibold">{t('transfers.item')}</th>
                    <th className="px-2 py-2 text-end font-semibold">{t('transfers.qty')}</th>
                    <th className="px-2 py-2 text-end font-semibold">{t('transfers.avlQty')}</th>
                    <th className="px-2 py-2 text-start font-semibold">{t('transfers.lineNote')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tr.data.lines.map((l) => (
                    <tr key={l.lineId}>
                      <td className="px-2 py-2">
                        <p className="font-medium">{l.itemName?.trim() || l.itemCode}</p>
                        <p className="tnum text-xs text-[var(--color-muted)]">{l.itemCode}</p>
                      </td>
                      <td className="tnum px-2 py-2 text-end font-bold">{formatNumber(l.qty)}</td>
                      <td
                        className={`tnum px-2 py-2 text-end ${
                          l.avlQty != null && l.avlQty < l.qty ? 'text-[var(--color-danger)]' : ''
                        }`}
                      >
                        {l.avlQty != null ? formatNumber(l.avlQty) : '—'}
                      </td>
                      <td className="px-2 py-2 text-[var(--color-muted)]">{l.note ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[var(--color-muted)]">{label}</span>
      <span className={`font-medium ${mono ? 'tnum' : ''}`}>{value}</span>
    </div>
  );
}
