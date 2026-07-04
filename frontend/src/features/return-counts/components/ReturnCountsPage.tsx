import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PackageSearch, Plus, X, CheckCircle2, Eye } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { ApiError } from '@/shared/lib/api-client';
import { formatDateTime, formatNumber } from '@/shared/lib/format';
import type { ReturnCountStatus } from '@/shared/lib/types';
import { usePosSettings } from '@/features/pos-terminal/store/pos-settings.store';
import { useReturnCounts, useStartReturnCount } from '../api/return-counts.api';
import { ReturnCountDetailDialog } from './ReturnCountDetailDialog';

export function RcStatusBadge({ status }: { status: ReturnCountStatus }) {
  const { t } = useTranslation();
  return (
    <span
      className={
        'rounded-full px-2 py-0.5 text-xs font-medium ' +
        (status === 'DRAFT'
          ? 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]'
          : 'bg-[var(--color-success)]/15 text-[var(--color-success)]')
      }
    >
      {t(`returnCounts.status.${status}`)}
    </span>
  );
}

/**
 * POST022 جرد أصناف مردود المبيعات — count sessions for one machine + day:
 * list + status filter, "start session" dialog, and the counting detail
 * dialog (system returned qty vs physically counted, diff computed server-side).
 */
export function ReturnCountsPage() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<ReturnCountStatus | ''>('');
  const [showStart, setShowStart] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const list = useReturnCounts({ status: status || undefined });
  const rows = list.data ?? [];

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <PackageSearch className="size-6 text-[var(--color-brand-500)]" aria-hidden />
          {t('returnCounts.title')}
        </h1>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ReturnCountStatus | '')}
            className="h-11 rounded-md border bg-[var(--color-surface)] px-3 text-sm"
            aria-label={t('returnCounts.statusFilter')}
          >
            <option value="">{t('returnCounts.allStatuses')}</option>
            <option value="DRAFT">{t('returnCounts.status.DRAFT')}</option>
            <option value="POSTED">{t('returnCounts.status.POSTED')}</option>
          </select>
          <Button variant="primary" onClick={() => setShowStart(true)}>
            <Plus className="size-4" />
            {t('returnCounts.new')}
          </Button>
        </div>
      </div>

      {list.isLoading ? (
        <LoadingView />
      ) : list.isError ? (
        <ErrorView error={list.error} onRetry={() => list.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyView label={t('returnCounts.empty')} />
      ) : (
        <Card className="min-h-0 flex-1 overflow-auto scroll-thin">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
              <tr>
                <th className="px-3 py-2 text-start font-semibold">{t('returnCounts.countNo')}</th>
                <th className="px-3 py-2 text-start font-semibold">{t('returnCounts.machine')}</th>
                <th className="px-3 py-2 text-start font-semibold">{t('returnCounts.countDate')}</th>
                <th className="tnum px-3 py-2 text-end font-semibold">
                  {t('returnCounts.lineCount')}
                </th>
                <th className="px-3 py-2 text-center font-semibold">{t('returnCounts.statusL')}</th>
                <th className="hidden px-3 py-2 text-start font-semibold md:table-cell">
                  {t('returnCounts.createdAt')}
                </th>
                <th className="px-3 py-2 text-end font-semibold">{t('returnCounts.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-[var(--color-surface-2)]">
                  <td className="tnum px-3 py-2 font-medium">#{r.countNo}</td>
                  <td className="tnum px-3 py-2">#{r.machineNo}</td>
                  <td className="tnum px-3 py-2" dir="ltr">
                    {r.countDate}
                  </td>
                  <td className="tnum px-3 py-2 text-end">{formatNumber(r.lineCount)}</td>
                  <td className="px-3 py-2 text-center">
                    <RcStatusBadge status={r.status} />
                  </td>
                  <td className="tnum hidden px-3 py-2 text-[var(--color-muted)] md:table-cell">
                    {formatDateTime(r.createdAt)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => setDetailId(r.id)}
                      >
                        <Eye className="size-4" />
                        {t('returnCounts.view')}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {showStart ? <StartReturnCountDialog onClose={() => setShowStart(false)} /> : null}
      {detailId ? (
        <ReturnCountDetailDialog id={detailId} onClose={() => setDetailId(null)} />
      ) : null}
    </div>
  );
}

/** Start a new return-count session: machine + date (+ optional ref/note). */
function StartReturnCountDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const start = useStartReturnCount();
  const defaultMachine = usePosSettings((s) => s.machineNo);

  const today = new Date().toISOString().slice(0, 10);
  const [machineNo, setMachineNo] = useState(String(defaultMachine || 1));
  const [countDate, setCountDate] = useState(today);
  const [refNo, setRefNo] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [doneNo, setDoneNo] = useState<number | null>(null);

  const canSubmit = !start.isPending && Number(machineNo) > 0 && !!countDate;

  const submit = async () => {
    setError(null);
    if (!canSubmit) return;
    try {
      const res = await start.mutateAsync({
        machineNo: Number(machineNo),
        countDate,
        refNo: refNo.trim() || undefined,
        note: note.trim() || undefined,
      });
      setDoneNo(res.countNo);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.problem.detail || e.problem.title : t('returnCounts.createError'),
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('returnCounts.new')}
    >
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="flex items-center gap-2 font-bold">
            <PackageSearch className="size-5 text-[var(--color-brand-500)]" aria-hidden />
            {t('returnCounts.new')}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('returnCounts.close')}>
            <X className="size-5" />
          </Button>
        </div>

        {doneNo != null ? (
          <div className="flex flex-col items-center gap-4 p-6 text-center">
            <CheckCircle2 className="size-12 text-[var(--color-success)]" aria-hidden />
            <p className="font-bold">
              {t('returnCounts.created')} #{doneNo}
            </p>
            <Button variant="primary" className="w-full max-w-xs" onClick={onClose}>
              {t('returnCounts.close')}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-[var(--color-muted)]">
                    {t('returnCounts.machine')}
                    <span className="text-[var(--color-danger)]"> *</span>
                  </span>
                  <Input
                    type="number"
                    min={1}
                    value={machineNo}
                    onChange={(e) => setMachineNo(e.target.value)}
                    className="tnum h-9"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-[var(--color-muted)]">
                    {t('returnCounts.countDate')}
                    <span className="text-[var(--color-danger)]"> *</span>
                  </span>
                  <Input
                    type="date"
                    value={countDate}
                    onChange={(e) => setCountDate(e.target.value)}
                    className="tnum h-9"
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-[var(--color-muted)]">{t('returnCounts.refNo')}</span>
                <Input value={refNo} onChange={(e) => setRefNo(e.target.value)} className="tnum h-9" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-[var(--color-muted)]">{t('returnCounts.note')}</span>
                <Input value={note} onChange={(e) => setNote(e.target.value)} className="h-9" />
              </label>

              {error ? (
                <p role="alert" className="rounded-md bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]">
                  {error}
                </p>
              ) : null}
            </div>

            <div className="flex gap-2 border-t p-4">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                {t('returnCounts.cancelBtn')}
              </Button>
              <Button variant="primary" className="flex-1" disabled={!canSubmit} onClick={() => void submit()}>
                {start.isPending ? t('returnCounts.saving') : t('returnCounts.submit')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
