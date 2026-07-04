import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeftRight, Plus, Eye, Ban } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { formatDateTime, formatNumber } from '@/shared/lib/format';
import { ApiError } from '@/shared/lib/api-client';
import type { TransferRow } from '@/shared/lib/types';
import { useTransfers, useCancelTransfer, useWarehouses } from '../api/transfers.api';
import { TransferDialog } from './TransferDialog';
import { TransferDetailDialog } from './TransferDetailDialog';

type StatusFilter = 'all' | 'OPEN' | 'CANCELLED';

/**
 * POST019 طلب التحويل — material transfer requests between warehouses:
 * list + status filter, create dialog, detail view, and cancel (OPEN only).
 */
export function TransfersPage() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<StatusFilter>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const list = useTransfers({ status: status === 'all' ? undefined : status });
  const warehouses = useWarehouses();
  const cancel = useCancelTransfer();
  const rows = list.data ?? [];

  const whName = useMemo(() => {
    const map = new Map<number, string>();
    for (const w of warehouses.data ?? []) {
      map.set(w.code, w.arName?.trim() || w.enName?.trim() || `#${w.code}`);
    }
    return (code: number) => map.get(code) ?? `#${code}`;
  }, [warehouses.data]);

  const doCancel = async (r: TransferRow) => {
    setCancelError(null);
    if (!window.confirm(t('transfers.cancelConfirm', { no: r.reqNo }))) return;
    try {
      await cancel.mutateAsync(r.id);
    } catch (e) {
      setCancelError(
        e instanceof ApiError ? e.problem.detail || e.problem.title : t('transfers.cancelError'),
      );
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <ArrowLeftRight className="size-6 text-[var(--color-brand-500)]" aria-hidden />
          {t('transfers.title')}
        </h1>
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          <Plus className="size-4" />
          {t('transfers.new')}
        </Button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2" role="tablist" aria-label={t('transfers.statusL')}>
        {(['all', 'OPEN', 'CANCELLED'] as StatusFilter[]).map((s) => (
          <button
            key={s}
            role="tab"
            aria-selected={status === s}
            onClick={() => setStatus(s)}
            className={
              'rounded-[var(--radius)] border px-4 py-2 text-sm font-medium transition-colors ' +
              (status === s
                ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-600)] text-white'
                : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-2)]')
            }
          >
            {t(`transfers.filter.${s}`)}
          </button>
        ))}
      </div>

      {cancelError ? (
        <p role="alert" className="rounded-md bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]">
          {cancelError}
        </p>
      ) : null}

      {list.isLoading ? (
        <LoadingView />
      ) : list.isError ? (
        <ErrorView error={list.error} onRetry={() => list.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyView label={t('transfers.empty')} />
      ) : (
        <Card className="min-h-0 flex-1 overflow-auto scroll-thin">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
              <tr>
                <th className="px-3 py-2 text-start font-semibold">{t('transfers.reqNo')}</th>
                <th className="px-3 py-2 text-start font-semibold">{t('transfers.from')}</th>
                <th className="px-3 py-2 text-start font-semibold">{t('transfers.to')}</th>
                <th className="px-3 py-2 text-start font-semibold">{t('transfers.purpose')}</th>
                <th className="px-3 py-2 text-end font-semibold">{t('transfers.lineCount')}</th>
                <th className="px-3 py-2 text-center font-semibold">{t('transfers.statusL')}</th>
                <th className="px-3 py-2 text-start font-semibold">{t('transfers.createdAt')}</th>
                <th className="px-3 py-2 text-end font-semibold">{t('transfers.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-[var(--color-surface-2)]">
                  <td className="tnum px-3 py-2 font-medium">#{r.reqNo}</td>
                  <td className="px-3 py-2">{whName(r.fromWarehouse)}</td>
                  <td className="px-3 py-2">{whName(r.toWarehouse)}</td>
                  <td className="max-w-48 truncate px-3 py-2 text-[var(--color-muted)]">
                    {r.purpose ?? '—'}
                  </td>
                  <td className="tnum px-3 py-2 text-end">{formatNumber(r.lineCount)}</td>
                  <td className="px-3 py-2 text-center">
                    <span
                      className={
                        'rounded-full px-2 py-0.5 text-xs font-medium ' +
                        (r.status === 'OPEN'
                          ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
                          : 'bg-[var(--color-danger)]/15 text-[var(--color-danger)]')
                      }
                    >
                      {t(`transfers.status.${r.status}`)}
                    </span>
                  </td>
                  <td className="tnum px-3 py-2 text-[var(--color-muted)]">
                    {formatDateTime(r.createdAt)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => setDetailId(r.id)}
                      >
                        <Eye className="size-4" />
                        {t('transfers.view')}
                      </Button>
                      {r.status === 'OPEN' ? (
                        <Button
                          variant="outline"
                          className="h-8 text-xs text-[var(--color-danger)]"
                          disabled={cancel.isPending}
                          onClick={() => void doCancel(r)}
                        >
                          <Ban className="size-4" />
                          {t('transfers.cancel')}
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {showCreate ? <TransferDialog onClose={() => setShowCreate(false)} /> : null}
      {detailId ? <TransferDetailDialog id={detailId} onClose={() => setDetailId(null)} /> : null}
    </div>
  );
}
