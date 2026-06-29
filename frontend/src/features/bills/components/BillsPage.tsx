import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Receipt, ChevronLeft } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { formatMoney, formatDate } from '@/shared/lib/format';
import { useBills, type BillFilters } from '../api/bills.api';

export function BillsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<BillFilters>({});
  const [filters, setFilters] = useState<BillFilters>({});

  const query = useBills(filters);
  const bills = useMemo(() => query.data?.pages.flatMap((p) => p.data) ?? [], [query.data]);

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <h1 className="flex items-center gap-2 text-xl font-bold">
        <Receipt className="size-6 text-[var(--color-brand-500)]" aria-hidden />
        {t('bills.title')}
      </h1>

      {/* Filters */}
      <Card className="flex flex-wrap items-end gap-3 p-3">
        <Field label={t('bills.from')}>
          <Input
            type="date"
            value={draft.from ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value || undefined }))}
            className="w-40"
          />
        </Field>
        <Field label={t('bills.to')}>
          <Input
            type="date"
            value={draft.to ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value || undefined }))}
            className="w-40"
          />
        </Field>
        <Field label={t('bills.machine')}>
          <Input
            type="number"
            value={draft.machineNo ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, machineNo: e.target.value || undefined }))}
            className="w-28"
            placeholder="#"
          />
        </Field>
        <Button onClick={() => setFilters(draft)}>{t('bills.filter')}</Button>
      </Card>

      {/* Table */}
      <Card className="min-h-0 flex-1 overflow-auto scroll-thin">
        {query.isLoading ? (
          <LoadingView />
        ) : query.isError ? (
          <ErrorView error={query.error} onRetry={() => query.refetch()} />
        ) : bills.length === 0 ? (
          <EmptyView />
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[var(--color-surface-2)] text-start text-[var(--color-muted)]">
              <tr>
                <Th>{t('bills.billNo')}</Th>
                <Th>{t('bills.date')}</Th>
                <Th>{t('bills.time')}</Th>
                <Th className="text-end">{t('bills.amount')}</Th>
                <Th className="text-end">{t('bills.lines')}</Th>
                <Th>{t('bills.machine')}</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y">
              {bills.map((b) => (
                <tr
                  key={b.billNo}
                  className="cursor-pointer hover:bg-[var(--color-surface-2)]"
                  onClick={() => navigate(`/bills/${b.billNo}`)}
                >
                  <Td className="tnum font-medium">{b.billNo}</Td>
                  <Td>{formatDate(b.billDate)}</Td>
                  <Td className="tnum">{b.billTime}</Td>
                  <Td className="tnum text-end font-bold">{formatMoney(b.billAmt)}</Td>
                  <Td className="tnum text-end">{b.lineCount}</Td>
                  <Td className="tnum">{b.machineNo}</Td>
                  <Td className="text-end">
                    <ChevronLeft className="inline size-4 text-[var(--color-muted)]" aria-hidden />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {query.hasNextPage ? (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => query.fetchNextPage()}
            disabled={query.isFetchingNextPage}
          >
            {query.isFetchingNextPage ? t('status.loading') : t('bills.loadMore')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-[var(--color-muted)]">
      {label}
      {children}
    </label>
  );
}
function Th({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <th className={`px-3 py-2 text-start font-semibold ${className ?? ''}`}>{children}</th>;
}
function Td({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <td className={`px-3 py-2 ${className ?? ''}`}>{children}</td>;
}
