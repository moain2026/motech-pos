import { useTranslation } from 'react-i18next';
import { X, ClipboardList } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { LoadingView, ErrorView } from '@/shared/ui/StateView';
import { formatDateTime } from '@/shared/lib/format';
import { usePrescription } from '../api/prescriptions.api';

/** Read-only prescription detail — GET /prescriptions/{id} (header + lines). */
export function PrescriptionDetailDialog({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const rx = usePrescription(id);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('rx.detailTitle')}
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="flex items-center gap-2 font-bold">
            <ClipboardList className="size-5 text-[var(--color-brand-500)]" aria-hidden />
            {t('rx.detailTitle')}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('rx.close')}>
            <X className="size-5" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scroll-thin p-4">
          {rx.isLoading ? (
            <LoadingView />
          ) : rx.isError ? (
            <ErrorView error={rx.error} onRetry={() => rx.refetch()} />
          ) : rx.data ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-2 rounded-md border bg-[var(--color-surface-2)] p-3 text-sm sm:grid-cols-2">
                <Info label={t('rx.billNo')} value={rx.data.billNo} mono />
                <Info label={t('rx.rxDate')} value={rx.data.rxDate ?? '—'} mono />
                <Info label={t('rx.doctor')} value={rx.data.doctorName} />
                <Info label={t('rx.patient')} value={rx.data.patientName} />
                <Info label={t('rx.patientRef')} value={rx.data.patientRef ?? '—'} mono />
                <Info label={t('rx.createdAt')} value={formatDateTime(rx.data.createdAt)} mono />
                {rx.data.note ? <Info label={t('rx.note')} value={rx.data.note} /> : null}
              </div>

              <table className="w-full text-sm">
                <thead className="bg-[var(--color-surface-2)] text-[var(--color-muted)]">
                  <tr>
                    <th className="px-2 py-2 text-start font-semibold">{t('rx.item')}</th>
                    <th className="px-2 py-2 text-end font-semibold">{t('rx.qty')}</th>
                    <th className="px-2 py-2 text-start font-semibold">{t('rx.dosage')}</th>
                    <th className="px-2 py-2 text-start font-semibold">{t('rx.usage')}</th>
                    <th className="px-2 py-2 text-start font-semibold">{t('rx.duration')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rx.data.lines.map((l) => (
                    <tr key={l.lineId}>
                      <td className="px-2 py-2">
                        <p className="font-medium">{l.itemName?.trim() || l.itemCode}</p>
                        <p className="tnum text-xs text-[var(--color-muted)]">{l.itemCode}</p>
                      </td>
                      <td className="tnum px-2 py-2 text-end">{l.qty}</td>
                      <td className="px-2 py-2">{l.dosage ?? '—'}</td>
                      <td className="px-2 py-2">{l.usageNotes ?? '—'}</td>
                      <td className="px-2 py-2">{l.duration ?? '—'}</td>
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
