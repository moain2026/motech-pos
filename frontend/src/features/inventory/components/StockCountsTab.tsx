import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClipboardCheck, Plus, X, CheckCircle2 } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { ApiError } from '@/shared/lib/api-client';
import { formatDateTime, formatNumber } from '@/shared/lib/format';
import type { StockCountHeader, StockCountStatus } from '@/shared/lib/types';
import { useWarehouses } from '@/features/master-data/api/master-data.api';
import { useStartCount, useStockCounts } from '../api/stock-counts.api';
import { StockCountDetailDialog } from './StockCountDetailDialog';

/**
 * الجرد الفعلي (POST018) — list of stock-count sessions with a status filter,
 * a "start count" dialog (warehouse + note), and a drill-down detail dialog
 * where physical counts are entered and the session is posted.
 * GET/POST /inventory/counts · supervisor/admin route.
 */
export function StockCountsTab() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<StockCountStatus | ''>('');
  const [showStart, setShowStart] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const counts = useStockCounts(status || undefined);
  const rows = counts.data ?? [];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StockCountStatus | '')}
          className="h-11 rounded-md border bg-[var(--color-surface)] px-3 text-sm"
          aria-label={t('stockCount.statusFilter')}
        >
          <option value="">{t('stockCount.allStatuses')}</option>
          <option value="DRAFT">{t('stockCount.status.DRAFT')}</option>
          <option value="POSTED">{t('stockCount.status.POSTED')}</option>
        </select>
        <Button variant="primary" onClick={() => setShowStart(true)}>
          <Plus className="size-4" />
          {t('stockCount.new')}
        </Button>
      </div>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-auto scroll-thin">
          {counts.isLoading ? (
            <LoadingView />
          ) : counts.isError ? (
            <ErrorView error={counts.error} onRetry={() => counts.refetch()} />
          ) : rows.length === 0 ? (
            <EmptyView label={t('stockCount.empty')} />
          ) : (
            <CountsTable rows={rows} onOpen={setDetailId} />
          )}
        </div>
      </Card>

      {showStart ? (
        <StartCountDialog
          onClose={() => setShowStart(false)}
          onStarted={(id) => {
            setShowStart(false);
            setDetailId(id);
          }}
        />
      ) : null}

      {detailId ? (
        <StockCountDetailDialog id={detailId} onClose={() => setDetailId(null)} />
      ) : null}
    </>
  );
}

function CountsTable({
  rows,
  onOpen,
}: {
  rows: StockCountHeader[];
  onOpen: (id: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <table className="w-full text-sm">
      <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
        <tr>
          <th className="px-3 py-2 text-start font-semibold">{t('stockCount.warehouse')}</th>
          <th className="px-3 py-2 text-start font-semibold">{t('stockCount.statusL')}</th>
          <th className="px-3 py-2 text-end font-semibold">{t('stockCount.lineCount')}</th>
          <th className="px-3 py-2 text-end font-semibold">{t('stockCount.varianceCount')}</th>
          <th className="px-3 py-2 text-start font-semibold">{t('stockCount.createdBy')}</th>
          <th className="hidden px-3 py-2 text-start font-semibold md:table-cell">
            {t('stockCount.createdAt')}
          </th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {rows.map((c) => (
          <tr
            key={c.id}
            className="cursor-pointer hover:bg-[var(--color-surface-2)]"
            onClick={() => onOpen(c.id)}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpen(c.id);
              }
            }}
          >
            <td className="tnum px-3 py-2 font-medium">#{c.warehouseCode}</td>
            <td className="px-3 py-2">
              <StatusBadge status={c.status} />
            </td>
            <td className="tnum px-3 py-2 text-end">{formatNumber(c.lineCount)}</td>
            <td
              className={
                'tnum px-3 py-2 text-end font-bold ' +
                (c.varianceCount > 0 ? 'text-[var(--color-warning)]' : '')
              }
            >
              {formatNumber(c.varianceCount)}
            </td>
            <td className="px-3 py-2 text-[var(--color-muted)]">{c.createdBy}</td>
            <td className="tnum hidden px-3 py-2 text-[var(--color-muted)] md:table-cell">
              {formatDateTime(c.createdAt)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function StatusBadge({ status }: { status: StockCountStatus }) {
  const { t } = useTranslation();
  return (
    <span
      className={
        'rounded-full px-2 py-0.5 text-xs font-semibold ' +
        (status === 'POSTED'
          ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
          : 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]')
      }
    >
      {t(`stockCount.status.${status}`)}
    </span>
  );
}

/** بدء جرد — pick a warehouse (GET /warehouses) + optional note. */
function StartCountDialog({
  onClose,
  onStarted,
}: {
  onClose: () => void;
  onStarted: (id: string) => void;
}) {
  const { t } = useTranslation();
  const warehouses = useWarehouses();
  const start = useStartCount();
  const [warehouseCode, setWarehouseCode] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const whOptions = (warehouses.data ?? []).filter((w) => !w.inactive);

  const submit = async () => {
    setError(null);
    if (!warehouseCode) return;
    try {
      const res = await start.mutateAsync({
        warehouseCode: Number(warehouseCode),
        note: note.trim() || undefined,
      });
      onStarted(res.id);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.problem.detail || e.problem.title : t('stockCount.startError'),
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('stockCount.new')}
    >
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="flex items-center gap-2 font-bold">
            <ClipboardCheck className="size-5 text-[var(--color-brand-500)]" aria-hidden />
            {t('stockCount.new')}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('stockCount.close')}>
            <X className="size-5" />
          </Button>
        </div>

        <div className="flex flex-col gap-3 p-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--color-muted)]">
              {t('stockCount.warehouse')}
              <span className="text-[var(--color-danger)]"> *</span>
            </span>
            <select
              value={warehouseCode}
              onChange={(e) => setWarehouseCode(e.target.value)}
              className="h-11 rounded-[var(--radius)] border bg-[var(--color-surface)] px-2 text-sm"
            >
              <option value="">{t('stockCount.pickWarehouse')}</option>
              {whOptions.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.arName?.trim() || w.enName?.trim() || `#${w.code}`}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--color-muted)]">{t('stockCount.note')}</span>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={250}
              placeholder={t('stockCount.notePlaceholder')}
            />
          </label>

          {error ? (
            <p role="alert" className="text-sm text-[var(--color-danger)]">
              {error}
            </p>
          ) : null}

          <Button
            variant="primary"
            disabled={!warehouseCode || start.isPending}
            onClick={() => void submit()}
          >
            <CheckCircle2 className="size-4" />
            {start.isPending ? t('status.loading') : t('stockCount.start')}
          </Button>
        </div>
      </div>
    </div>
  );
}
