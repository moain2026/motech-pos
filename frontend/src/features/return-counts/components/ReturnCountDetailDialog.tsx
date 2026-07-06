import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, PackageSearch, Plus, ShieldCheck, Lock } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { ApiError } from '@/shared/lib/api-client';
import { formatDateTime, formatNumber } from '@/shared/lib/format';
import { useSession } from '@/features/auth';
import {
  usePostReturnCount,
  useRecordReturnCountLine,
  useReturnCount,
} from '../api/return-counts.api';
import { RcStatusBadge } from './ReturnCountsPage';
import { confirmDialog } from '@/shared/ui/ConfirmDialog';

/**
 * Return-count detail (POST022) — session header, the "count one item" entry
 * row (item code + physical returned qty → server computes diff vs the REAL
 * return bills of that machine+day), the variance table, and the
 * supervisor/admin approve action that freezes the session.
 */
export function ReturnCountDetailDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const { t } = useTranslation();
  const role = useSession((s) => s.user?.role);
  const canPost = role === 'supervisor' || role === 'admin';

  const detail = useReturnCount(id);
  const record = useRecordReturnCountLine();
  const post = usePostReturnCount();

  const [itemCode, setItemCode] = useState('');
  const [countedQty, setCountedQty] = useState('');
  const [error, setError] = useState<string | null>(null);

  const c = detail.data;
  const isDraft = c?.status === 'DRAFT';

  const addLine = async () => {
    setError(null);
    const code = itemCode.trim();
    const qty = Number(countedQty);
    if (!code || !(qty >= 0)) return;
    try {
      await record.mutateAsync({ id, itemCode: code, countedQty: qty });
      setItemCode('');
      setCountedQty('');
    } catch (e) {
      setError(
        e instanceof ApiError ? e.problem.detail || e.problem.title : t('returnCounts.lineError'),
      );
    }
  };

  const approve = async () => {
    setError(null);
    if (!(await confirmDialog({ message: t('returnCounts.postConfirm') }))) return;
    try {
      await post.mutateAsync(id);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.problem.detail || e.problem.title : t('returnCounts.postError'),
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('returnCounts.detailTitle')}
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="flex items-center gap-2 font-bold">
            <PackageSearch className="size-5 text-[var(--color-brand-500)]" aria-hidden />
            {t('returnCounts.detailTitle')}
            {c ? (
              <>
                <span className="tnum text-[var(--color-muted)]">#{c.countNo}</span>
                <RcStatusBadge status={c.status} />
              </>
            ) : null}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('returnCounts.close')}>
            <X className="size-5" />
          </Button>
        </div>

        {detail.isLoading ? (
          <LoadingView />
        ) : detail.isError ? (
          <ErrorView error={detail.error} onRetry={() => detail.refetch()} />
        ) : !c ? null : (
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto scroll-thin p-4">
            {/* Header facts */}
            <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              <Fact label={t('returnCounts.machine')} value={`#${c.machineNo}`} />
              <Fact label={t('returnCounts.countDate')} value={c.countDate} />
              <Fact label={t('returnCounts.createdBy')} value={c.createdBy} />
              <Fact label={t('returnCounts.createdAt')} value={formatDateTime(c.createdAt)} />
            </div>
            {c.note ? (
              <p className="rounded-md bg-[var(--color-surface-2)] p-2 text-xs text-[var(--color-muted)]">
                {c.note}
              </p>
            ) : null}
            {c.status === 'POSTED' ? (
              <p className="flex items-center gap-2 rounded-md bg-[var(--color-success)]/10 p-2 text-xs text-[var(--color-success)]">
                <Lock className="size-3.5 shrink-0" aria-hidden />
                {t('returnCounts.postedBy', {
                  user: c.postedBy ?? '—',
                  at: c.postedAt ? formatDateTime(c.postedAt) : '—',
                })}
              </p>
            ) : null}

            {/* Entry row (DRAFT only) */}
            {isDraft ? (
              <div className="flex flex-wrap items-end gap-2 rounded-md border p-3">
                <label className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-xs text-[var(--color-muted)]">
                    {t('returnCounts.itemCode')}
                  </span>
                  <Input
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    placeholder={t('returnCounts.itemCodePlaceholder')}
                    className="h-10"
                    dir="ltr"
                  />
                </label>
                <label className="flex w-32 flex-col gap-1">
                  <span className="text-xs text-[var(--color-muted)]">
                    {t('returnCounts.countedQty')}
                  </span>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={countedQty}
                    onChange={(e) => setCountedQty(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void addLine();
                    }}
                    className="h-10"
                  />
                </label>
                <Button
                  variant="primary"
                  className="h-10"
                  disabled={
                    record.isPending ||
                    !itemCode.trim() ||
                    !(Number(countedQty) >= 0) ||
                    countedQty === ''
                  }
                  onClick={() => void addLine()}
                >
                  <Plus className="size-4" />
                  {record.isPending ? t('status.loading') : t('returnCounts.record')}
                </Button>
              </div>
            ) : null}

            {error ? (
              <p role="alert" className="text-sm text-[var(--color-danger)]">
                {error}
              </p>
            ) : null}

            {/* Lines */}
            {c.lines.length === 0 ? (
              <EmptyView label={t('returnCounts.noLines')} />
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--color-surface-2)] text-[var(--color-muted)]">
                    <tr>
                      <th className="px-3 py-2 text-start font-semibold">
                        {t('returnCounts.item')}
                      </th>
                      <th className="px-3 py-2 text-end font-semibold">
                        {t('returnCounts.systemQty')}
                      </th>
                      <th className="px-3 py-2 text-end font-semibold">
                        {t('returnCounts.countedQty')}
                      </th>
                      <th className="px-3 py-2 text-end font-semibold">{t('returnCounts.diff')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {c.lines.map((l) => (
                      <tr key={l.lineId} className="hover:bg-[var(--color-surface-2)]">
                        <td className="px-3 py-2">
                          <span className="font-medium">{l.itemName?.trim() || l.itemCode}</span>
                          <span className="tnum ms-2 text-xs text-[var(--color-muted)]" dir="ltr">
                            {l.itemCode}
                          </span>
                        </td>
                        <td className="tnum px-3 py-2 text-end">{formatNumber(l.systemQty)}</td>
                        <td className="tnum px-3 py-2 text-end font-bold">
                          {formatNumber(l.countedQty)}
                        </td>
                        <td
                          className={
                            'tnum px-3 py-2 text-end font-bold ' +
                            (l.diffQty === 0
                              ? 'text-[var(--color-success)]'
                              : 'text-[var(--color-danger)]')
                          }
                          dir="ltr"
                        >
                          {l.diffQty > 0 ? `+${formatNumber(l.diffQty)}` : formatNumber(l.diffQty)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Approve */}
            {isDraft ? (
              canPost ? (
                <Button
                  variant="success"
                  disabled={post.isPending || c.lines.length === 0}
                  onClick={() => void approve()}
                >
                  <ShieldCheck className="size-4" />
                  {post.isPending ? t('status.loading') : t('returnCounts.post')}
                </Button>
              ) : (
                <p className="text-xs text-[var(--color-muted)]">
                  {t('returnCounts.postNeedsRole')}
                </p>
              )
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[var(--color-surface-2)] p-2">
      <p className="text-xs text-[var(--color-muted)]">{label}</p>
      <p className="tnum font-bold">{value}</p>
    </div>
  );
}
