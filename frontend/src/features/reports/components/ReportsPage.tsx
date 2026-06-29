import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Receipt, Coins } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { formatMoney, formatNumber } from '@/shared/lib/format';
import { useDailySummary } from '../api/reports.api';

export function ReportsPage() {
  const { t } = useTranslation();
  const query = useDailySummary();
  const rows = useMemo(() => query.data ?? [], [query.data]);

  const kpis = useMemo(() => {
    const totalAmt = rows.reduce((n, r) => n + r.totalAmt, 0);
    const totalBills = rows.reduce((n, r) => n + r.billCount, 0);
    return { totalAmt, totalBills };
  }, [rows]);

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <h1 className="flex items-center gap-2 text-xl font-bold">
        <BarChart3 className="size-6 text-[var(--color-brand-500)]" aria-hidden />
        {t('reports.title')}
      </h1>

      {query.isLoading ? (
        <LoadingView />
      ) : query.isError ? (
        <ErrorView error={query.error} onRetry={() => query.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyView />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Kpi
              icon={<Coins className="size-6" />}
              label={t('reports.totalAmt')}
              value={formatMoney(kpis.totalAmt)}
            />
            <Kpi
              icon={<Receipt className="size-6" />}
              label={t('reports.billCount')}
              value={formatNumber(kpis.totalBills)}
            />
          </div>

          <Card className="min-h-0 flex-1 overflow-auto scroll-thin">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
                <tr>
                  <th className="px-3 py-2 text-start font-semibold">{t('reports.day')}</th>
                  <th className="px-3 py-2 text-end font-semibold">{t('reports.billCount')}</th>
                  <th className="px-3 py-2 text-end font-semibold">{t('reports.totalAmt')}</th>
                  <th className="px-3 py-2 text-end font-semibold">{t('reports.totalVat')}</th>
                  <th className="px-3 py-2 text-end font-semibold">{t('reports.totalDisc')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r) => (
                  <tr key={r.day} className="hover:bg-[var(--color-surface-2)]">
                    <td className="tnum px-3 py-2 font-medium">{r.day}</td>
                    <td className="tnum px-3 py-2 text-end">{formatNumber(r.billCount)}</td>
                    <td className="tnum px-3 py-2 text-end font-bold">{formatMoney(r.totalAmt)}</td>
                    <td className="tnum px-3 py-2 text-end">{formatMoney(r.totalVat)}</td>
                    <td className="tnum px-3 py-2 text-end">{formatMoney(r.totalDisc)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}

function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <div className="grid size-12 place-items-center rounded-xl bg-[var(--color-brand-600)]/20 text-[var(--color-brand-500)]">
        {icon}
      </div>
      <div>
        <p className="text-sm text-[var(--color-muted)]">{label}</p>
        <p className="tnum text-xl font-extrabold">{value}</p>
      </div>
    </Card>
  );
}
