import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  Receipt,
  Coins,
  CalendarDays,
  CalendarRange,
  Package,
  MonitorSmartphone,
  UserCog,
  CreditCard,
  Undo2,
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { formatMoney, formatNumber } from '@/shared/lib/format';
import {
  useDailyReport,
  useMonthlyReport,
  useByItemReport,
  useByMachineReport,
  useByCashierReport,
  usePaymentMethodsReport,
  useReturnsReport,
} from '../api/reports.api';
import type { UseQueryResult } from '@tanstack/react-query';

type Tab =
  | 'daily'
  | 'monthly'
  | 'byItem'
  | 'byMachine'
  | 'byCashier'
  | 'paymentMethods'
  | 'returns';

const TABS: { key: Tab; icon: typeof CalendarDays }[] = [
  { key: 'daily', icon: CalendarDays },
  { key: 'monthly', icon: CalendarRange },
  { key: 'byItem', icon: Package },
  { key: 'byMachine', icon: MonitorSmartphone },
  { key: 'byCashier', icon: UserCog },
  { key: 'paymentMethods', icon: CreditCard },
  { key: 'returns', icon: Undo2 },
];

/**
 * Reports screen — 4 reports (daily / monthly / best-selling / by-machine)
 * with KPI cards + tables. All data via TanStack Query, RFC 9457 errors.
 */
export function ReportsPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('daily');

  const daily = useDailyReport();
  const monthly = useMonthlyReport();
  const byItem = useByItemReport();
  const byMachine = useByMachineReport();
  const byCashier = useByCashierReport();
  const paymentMethods = usePaymentMethodsReport();
  const returns = useReturnsReport();

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <h1 className="flex items-center gap-2 text-xl font-bold">
        <BarChart3 className="size-6 text-[var(--color-brand-500)]" aria-hidden />
        {t('reports.title')}
      </h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label={t('reports.title')}>
        {TABS.map(({ key, icon: Icon }) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={
              'flex items-center gap-2 rounded-[var(--radius)] border px-4 py-2 text-sm font-medium transition-colors ' +
              (tab === key
                ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-600)] text-white'
                : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-2)]')
            }
          >
            <Icon className="size-4" aria-hidden />
            {t(`reports.tab.${key}`)}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {tab === 'daily' && <DailyReport query={daily} />}
        {tab === 'monthly' && <MonthlyReport query={monthly} />}
        {tab === 'byItem' && <ByItemReport query={byItem} />}
        {tab === 'byMachine' && <ByMachineReport query={byMachine} />}
        {tab === 'byCashier' && <ByCashierReport query={byCashier} />}
        {tab === 'paymentMethods' && <PaymentMethodsReport query={paymentMethods} />}
        {tab === 'returns' && <ReturnsReport query={returns} />}
      </div>
    </div>
  );
}

/* ---------- shared building blocks ---------- */

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

function ReportShell<T>({
  query,
  empty,
  children,
}: {
  query: UseQueryResult<T[]>;
  empty: boolean;
  children: React.ReactNode;
}) {
  if (query.isLoading) return <LoadingView />;
  if (query.isError) return <ErrorView error={query.error} onRetry={() => query.refetch()} />;
  if (empty) return <EmptyView />;
  return <div className="flex h-full flex-col gap-4">{children}</div>;
}

function Th({ children, end }: { children: React.ReactNode; end?: boolean }) {
  return (
    <th className={`px-3 py-2 font-semibold ${end ? 'text-end' : 'text-start'}`}>{children}</th>
  );
}

function TableCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="min-h-0 flex-1 overflow-auto scroll-thin">
      <table className="w-full text-sm">{children}</table>
    </Card>
  );
}

/* ---------- daily ---------- */

function DailyReport({ query }: { query: ReturnType<typeof useDailyReport> }) {
  const { t } = useTranslation();
  const rows = useMemo(() => query.data ?? [], [query.data]);
  const kpis = useMemo(
    () => ({
      totalAmt: rows.reduce((n, r) => n + r.totalAmt, 0),
      totalBills: rows.reduce((n, r) => n + r.billCount, 0),
    }),
    [rows],
  );
  return (
    <ReportShell query={query} empty={rows.length === 0}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Kpi icon={<Coins className="size-6" />} label={t('reports.totalAmt')} value={formatMoney(kpis.totalAmt)} />
        <Kpi icon={<Receipt className="size-6" />} label={t('reports.billCount')} value={formatNumber(kpis.totalBills)} />
      </div>
      <TableCard>
        <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
          <tr>
            <Th>{t('reports.day')}</Th>
            <Th end>{t('reports.billCount')}</Th>
            <Th end>{t('reports.totalAmt')}</Th>
            <Th end>{t('reports.totalVat')}</Th>
            <Th end>{t('reports.totalDisc')}</Th>
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
      </TableCard>
    </ReportShell>
  );
}

/* ---------- monthly ---------- */

function MonthlyReport({ query }: { query: ReturnType<typeof useMonthlyReport> }) {
  const { t } = useTranslation();
  const rows = useMemo(() => query.data ?? [], [query.data]);
  const kpis = useMemo(
    () => ({
      totalAmt: rows.reduce((n, r) => n + r.totalAmt, 0),
      totalBills: rows.reduce((n, r) => n + r.billCount, 0),
    }),
    [rows],
  );
  return (
    <ReportShell query={query} empty={rows.length === 0}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Kpi icon={<Coins className="size-6" />} label={t('reports.totalAmt')} value={formatMoney(kpis.totalAmt)} />
        <Kpi icon={<Receipt className="size-6" />} label={t('reports.billCount')} value={formatNumber(kpis.totalBills)} />
      </div>
      <TableCard>
        <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
          <tr>
            <Th>{t('reports.month')}</Th>
            <Th end>{t('reports.billCount')}</Th>
            <Th end>{t('reports.totalAmt')}</Th>
            <Th end>{t('reports.totalVat')}</Th>
            <Th end>{t('reports.totalDisc')}</Th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r) => (
            <tr key={r.month} className="hover:bg-[var(--color-surface-2)]">
              <td className="tnum px-3 py-2 font-medium">{r.month}</td>
              <td className="tnum px-3 py-2 text-end">{formatNumber(r.billCount)}</td>
              <td className="tnum px-3 py-2 text-end font-bold">{formatMoney(r.totalAmt)}</td>
              <td className="tnum px-3 py-2 text-end">{formatMoney(r.totalVat)}</td>
              <td className="tnum px-3 py-2 text-end">{formatMoney(r.totalDisc)}</td>
            </tr>
          ))}
        </tbody>
      </TableCard>
    </ReportShell>
  );
}

/* ---------- by item (best sellers) ---------- */

function ByItemReport({ query }: { query: ReturnType<typeof useByItemReport> }) {
  const { t } = useTranslation();
  const rows = useMemo(() => query.data ?? [], [query.data]);
  const kpis = useMemo(
    () => ({
      totalQty: rows.reduce((n, r) => n + r.totalQty, 0),
      totalAmt: rows.reduce((n, r) => n + r.totalAmt, 0),
    }),
    [rows],
  );
  return (
    <ReportShell query={query} empty={rows.length === 0}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Kpi icon={<Package className="size-6" />} label={t('reports.totalQty')} value={formatNumber(kpis.totalQty)} />
        <Kpi icon={<Coins className="size-6" />} label={t('reports.totalAmt')} value={formatMoney(kpis.totalAmt)} />
      </div>
      <TableCard>
        <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
          <tr>
            <Th>#</Th>
            <Th>{t('reports.itemName')}</Th>
            <Th>{t('reports.itemCode')}</Th>
            <Th end>{t('reports.qty')}</Th>
            <Th end>{t('reports.lineCount')}</Th>
            <Th end>{t('reports.totalAmt')}</Th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r, i) => (
            <tr key={r.iCode} className="hover:bg-[var(--color-surface-2)]">
              <td className="tnum px-3 py-2 text-[var(--color-muted)]">{i + 1}</td>
              <td className="px-3 py-2 font-medium">{r.iName?.trim() || r.iCode}</td>
              <td className="tnum px-3 py-2 text-[var(--color-muted)]">{r.iCode}</td>
              <td className="tnum px-3 py-2 text-end">{formatNumber(r.totalQty)}</td>
              <td className="tnum px-3 py-2 text-end">{formatNumber(r.lineCount)}</td>
              <td className="tnum px-3 py-2 text-end font-bold">{formatMoney(r.totalAmt)}</td>
            </tr>
          ))}
        </tbody>
      </TableCard>
    </ReportShell>
  );
}

/* ---------- by cashier ---------- */

function ByCashierReport({ query }: { query: ReturnType<typeof useByCashierReport> }) {
  const { t } = useTranslation();
  const rows = useMemo(() => query.data ?? [], [query.data]);
  const kpis = useMemo(
    () => ({
      totalAmt: rows.reduce((n, r) => n + r.netAmt, 0),
      totalBills: rows.reduce((n, r) => n + r.billCount, 0),
    }),
    [rows],
  );
  return (
    <ReportShell query={query} empty={rows.length === 0}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Kpi icon={<Coins className="size-6" />} label={t('reports.totalAmt')} value={formatMoney(kpis.totalAmt)} />
        <Kpi icon={<Receipt className="size-6" />} label={t('reports.billCount')} value={formatNumber(kpis.totalBills)} />
      </div>
      <TableCard>
        <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
          <tr>
            <Th>{t('reports.cashierNo')}</Th>
            <Th end>{t('reports.billCount')}</Th>
            <Th end>{t('reports.netAmt')}</Th>
            <Th end>{t('reports.cashCollected')}</Th>
            <Th end>{t('reports.cardCollected')}</Th>
            <Th end>{t('reports.creditCollected')}</Th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r) => (
            <tr key={r.cashierNo} className="hover:bg-[var(--color-surface-2)]">
              <td className="tnum px-3 py-2 font-medium">{r.cashierNo}</td>
              <td className="tnum px-3 py-2 text-end">{formatNumber(r.billCount)}</td>
              <td className="tnum px-3 py-2 text-end font-bold">{formatMoney(r.netAmt)}</td>
              <td className="tnum px-3 py-2 text-end">{formatMoney(r.cashCollected)}</td>
              <td className="tnum px-3 py-2 text-end">{formatMoney(r.cardCollected)}</td>
              <td className="tnum px-3 py-2 text-end">{formatMoney(r.creditCollected)}</td>
            </tr>
          ))}
        </tbody>
      </TableCard>
    </ReportShell>
  );
}

/* ---------- payment methods ---------- */

function PaymentMethodsReport({
  query,
}: {
  query: ReturnType<typeof usePaymentMethodsReport>;
}) {
  const { t } = useTranslation();
  const rows = useMemo(() => query.data ?? [], [query.data]);
  const kpis = useMemo(
    () => ({
      totalAmt: rows.reduce((n, r) => n + r.amountInBill, 0),
      totalTxns: rows.reduce((n, r) => n + r.txnCount, 0),
    }),
    [rows],
  );
  const methodLabel = (m: string) => t(`reports.method.${m}`, { defaultValue: m });
  return (
    <ReportShell query={query} empty={rows.length === 0}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Kpi icon={<Coins className="size-6" />} label={t('reports.totalAmt')} value={formatMoney(kpis.totalAmt)} />
        <Kpi icon={<Receipt className="size-6" />} label={t('reports.txnCount')} value={formatNumber(kpis.totalTxns)} />
      </div>
      <TableCard>
        <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
          <tr>
            <Th>{t('reports.paymentMethod')}</Th>
            <Th>{t('reports.currency')}</Th>
            <Th end>{t('reports.txnCount')}</Th>
            <Th end>{t('reports.amount')}</Th>
            <Th end>{t('reports.amountInBill')}</Th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r, i) => (
            <tr key={`${r.method}-${r.currency}-${i}`} className="hover:bg-[var(--color-surface-2)]">
              <td className="px-3 py-2 font-medium">{methodLabel(r.method)}</td>
              <td className="tnum px-3 py-2">{r.currency}</td>
              <td className="tnum px-3 py-2 text-end">{formatNumber(r.txnCount)}</td>
              <td className="tnum px-3 py-2 text-end">{formatNumber(r.amount)}</td>
              <td className="tnum px-3 py-2 text-end font-bold">{formatMoney(r.amountInBill)}</td>
            </tr>
          ))}
        </tbody>
      </TableCard>
    </ReportShell>
  );
}

/* ---------- returns ---------- */

function ReturnsReport({ query }: { query: ReturnType<typeof useReturnsReport> }) {
  const { t } = useTranslation();
  const rows = useMemo(() => query.data ?? [], [query.data]);
  const kpis = useMemo(
    () => ({
      totalRefund: rows.reduce((n, r) => n + r.refundAmt, 0),
      totalCount: rows.reduce((n, r) => n + r.returnCount, 0),
    }),
    [rows],
  );
  return (
    <ReportShell query={query} empty={rows.length === 0}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Kpi icon={<Coins className="size-6" />} label={t('reports.totalRefund')} value={formatMoney(kpis.totalRefund)} />
        <Kpi icon={<Undo2 className="size-6" />} label={t('reports.returnCount')} value={formatNumber(kpis.totalCount)} />
      </div>
      <TableCard>
        <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
          <tr>
            <Th>{t('reports.day')}</Th>
            <Th end>{t('reports.returnCount')}</Th>
            <Th end>{t('reports.grossAmt')}</Th>
            <Th end>{t('reports.totalVat')}</Th>
            <Th end>{t('reports.netAmt')}</Th>
            <Th end>{t('reports.refundAmt')}</Th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r) => (
            <tr key={r.day} className="hover:bg-[var(--color-surface-2)]">
              <td className="tnum px-3 py-2 font-medium">{r.day}</td>
              <td className="tnum px-3 py-2 text-end">{formatNumber(r.returnCount)}</td>
              <td className="tnum px-3 py-2 text-end">{formatMoney(r.grossAmt)}</td>
              <td className="tnum px-3 py-2 text-end">{formatMoney(r.vatAmt)}</td>
              <td className="tnum px-3 py-2 text-end">{formatMoney(r.netAmt)}</td>
              <td className="tnum px-3 py-2 text-end font-bold">{formatMoney(r.refundAmt)}</td>
            </tr>
          ))}
        </tbody>
      </TableCard>
    </ReportShell>
  );
}

/* ---------- by machine ---------- */

function ByMachineReport({ query }: { query: ReturnType<typeof useByMachineReport> }) {
  const { t } = useTranslation();
  const rows = useMemo(() => query.data ?? [], [query.data]);
  const kpis = useMemo(
    () => ({
      totalAmt: rows.reduce((n, r) => n + r.totalAmt, 0),
      totalBills: rows.reduce((n, r) => n + r.billCount, 0),
    }),
    [rows],
  );
  return (
    <ReportShell query={query} empty={rows.length === 0}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Kpi icon={<Coins className="size-6" />} label={t('reports.totalAmt')} value={formatMoney(kpis.totalAmt)} />
        <Kpi icon={<Receipt className="size-6" />} label={t('reports.billCount')} value={formatNumber(kpis.totalBills)} />
      </div>
      <TableCard>
        <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
          <tr>
            <Th>{t('reports.machineNo')}</Th>
            <Th end>{t('reports.billCount')}</Th>
            <Th end>{t('reports.totalAmt')}</Th>
            <Th end>{t('reports.totalVat')}</Th>
            <Th end>{t('reports.totalDisc')}</Th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r) => (
            <tr key={r.machineNo} className="hover:bg-[var(--color-surface-2)]">
              <td className="tnum px-3 py-2 font-medium">#{r.machineNo}</td>
              <td className="tnum px-3 py-2 text-end">{formatNumber(r.billCount)}</td>
              <td className="tnum px-3 py-2 text-end font-bold">{formatMoney(r.totalAmt)}</td>
              <td className="tnum px-3 py-2 text-end">{formatMoney(r.totalVat)}</td>
              <td className="tnum px-3 py-2 text-end">{formatMoney(r.totalDisc)}</td>
            </tr>
          ))}
        </tbody>
      </TableCard>
    </ReportShell>
  );
}
