import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Undo2, Plus } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { formatMoney, formatDate } from '@/shared/lib/format';
import { useReturns } from '../api/returns.api';
import { CreateReturnDialog } from './CreateReturnDialog';

/**
 * Returns screen — list of return bills + create-return dialog. Rows navigate
 * to the full POST005 detail page (/returns/:id) — BillDetail's counterpart.
 */
export function ReturnsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

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
                  onClick={() => navigate(`/returns/${r.id}`)}
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
    </div>
  );
}
