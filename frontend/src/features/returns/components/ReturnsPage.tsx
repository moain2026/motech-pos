import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Undo2, Plus, ChevronLeft } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { formatMoney, formatDate } from '@/shared/lib/format';
import { useReturns, useReturnDetail } from '../api/returns.api';
import { CreateReturnDialog } from './CreateReturnDialog';

/**
 * Returns screen — list of return bills + create-return dialog + detail drawer.
 */
export function ReturnsPage() {
  const { t } = useTranslation();
  const [creating, setCreating] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const query = useReturns();
  const rows = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
    [query.data],
  );

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Undo2 className="size-6 text-[var(--color-brand-500)]" aria-hidden />
          {t('returns.title')}
        </h1>
        <Button variant="primary" onClick={() => setCreating(true)}>
          <Plus className="size-4" />
          {t('returns.new')}
        </Button>
      </div>

      {query.isLoading ? (
        <LoadingView />
      ) : query.isError ? (
        <ErrorView error={query.error} onRetry={() => query.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyView />
      ) : (
        <Card className="min-h-0 flex-1 overflow-auto scroll-thin">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
              <tr>
                <th className="px-3 py-2 text-start font-semibold">{t('returns.rtBillNo')}</th>
                <th className="px-3 py-2 text-start font-semibold">{t('returns.date')}</th>
                <th className="px-3 py-2 text-start font-semibold">{t('returns.originalBill')}</th>
                <th className="px-3 py-2 text-end font-semibold">{t('returns.machine')}</th>
                <th className="px-3 py-2 text-end font-semibold">{t('returns.lines')}</th>
                <th className="px-3 py-2 text-end font-semibold">{t('returns.amount')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setDetailId(r.id)}
                  className="cursor-pointer hover:bg-[var(--color-surface-2)]"
                >
                  <td className="tnum px-3 py-2 font-medium">{r.rtBillNo}</td>
                  <td className="tnum px-3 py-2">{formatDate(r.rtBillDate)}</td>
                  <td className="tnum px-3 py-2">{r.originalBillNo ?? '—'}</td>
                  <td className="tnum px-3 py-2 text-end">#{r.machineNo}</td>
                  <td className="tnum px-3 py-2 text-end">{r.lineCount}</td>
                  <td className="tnum px-3 py-2 text-end font-bold">{formatMoney(r.rtBillAmt)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {query.hasNextPage ? (
            <div className="flex justify-center p-3">
              <Button
                variant="outline"
                onClick={() => query.fetchNextPage()}
                disabled={query.isFetchingNextPage}
              >
                {query.isFetchingNextPage ? t('status.loading') : t('bills.loadMore')}
              </Button>
            </div>
          ) : null}
        </Card>
      )}

      {creating ? <CreateReturnDialog onClose={() => setCreating(false)} /> : null}
      {detailId ? <ReturnDetailDrawer id={detailId} onClose={() => setDetailId(null)} /> : null}
    </div>
  );
}

function ReturnDetailDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const { t } = useTranslation();
  const query = useReturnDetail(id);
  const d = query.data;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" role="dialog" aria-modal="true">
      <div className="flex h-full w-full max-w-md flex-col overflow-hidden border-s bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('returns.close')}>
            <ChevronLeft className="size-5" />
          </Button>
          <h2 className="font-bold">{t('returns.detailTitle')}</h2>
        </div>

        <div className="min-h-0 flex-1 overflow-auto scroll-thin p-4">
          {query.isLoading ? (
            <LoadingView />
          ) : query.isError ? (
            <ErrorView error={query.error} onRetry={() => query.refetch()} />
          ) : d ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Meta label={t('returns.rtBillNo')} value={d.rtBillNo} />
                <Meta label={t('returns.originalBill')} value={d.originalBillNo ?? '—'} />
                <Meta label={t('returns.date')} value={formatDate(d.rtBillDate)} />
                <Meta label={t('returns.machine')} value={`#${d.machineNo}`} />
              </div>

              <div className="overflow-hidden rounded-[var(--radius)] border">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--color-surface-2)] text-[var(--color-muted)]">
                    <tr>
                      <th className="px-3 py-2 text-start font-semibold">{t('returns.item')}</th>
                      <th className="px-3 py-2 text-end font-semibold">{t('returns.returnQty')}</th>
                      <th className="px-3 py-2 text-end font-semibold">{t('returns.net')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {d.lines.map((l, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 font-medium">{l.iCode}</td>
                        <td className="tnum px-3 py-2 text-end">{l.qty}</td>
                        <td className="tnum px-3 py-2 text-end font-bold">{formatMoney(l.net)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t pt-3">
                <span className="font-bold">{t('returns.net')}</span>
                <span className="tnum text-2xl font-extrabold text-[var(--color-brand-100)]">
                  {formatMoney(d.totals.net)}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius)] border p-2">
      <p className="text-xs text-[var(--color-muted)]">{label}</p>
      <p className="tnum truncate font-medium">{value}</p>
    </div>
  );
}
