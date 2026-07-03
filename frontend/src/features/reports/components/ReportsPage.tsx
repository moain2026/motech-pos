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
  Percent,
  Clock,
  FileCheck2,
  Crown,
  Tags,
  Landmark,
  Turtle,
  TrendingUp,
  GitCompareArrows,
  Activity,
  ShieldAlert,
  ReceiptText,
  Search,
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
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
  useTaxReport,
  useHourlySalesReport,
  useZReport,
  useTopCustomersReport,
  useDiscountReport,
  useSalesByCategoryReport,
  useSlowMovingReport,
  useProfitReport,
  useComparisonReport,
  useItemMovementReport,
  useAuditReport,
  useVatDetailedReport,
} from '../api/reports.api';
import type { UseQueryResult } from '@tanstack/react-query';

type Tab =
  | 'daily'
  | 'monthly'
  | 'byItem'
  | 'byMachine'
  | 'byCashier'
  | 'paymentMethods'
  | 'returns'
  | 'tax'
  | 'hourly'
  | 'zReport'
  | 'topCustomers'
  | 'discount'
  | 'salesByCategory'
  | 'slowMoving'
  | 'profit'
  | 'comparison'
  | 'itemMovement'
  | 'audit'
  | 'vatDetailed';

const TABS: { key: Tab; icon: typeof CalendarDays }[] = [
  { key: 'daily', icon: CalendarDays },
  { key: 'monthly', icon: CalendarRange },
  { key: 'byItem', icon: Package },
  { key: 'byMachine', icon: MonitorSmartphone },
  { key: 'byCashier', icon: UserCog },
  { key: 'paymentMethods', icon: CreditCard },
  { key: 'returns', icon: Undo2 },
  { key: 'tax', icon: Landmark },
  { key: 'hourly', icon: Clock },
  { key: 'zReport', icon: FileCheck2 },
  { key: 'topCustomers', icon: Crown },
  { key: 'discount', icon: Percent },
  { key: 'salesByCategory', icon: Tags },
  { key: 'slowMoving', icon: Turtle },
  { key: 'profit', icon: TrendingUp },
  { key: 'comparison', icon: GitCompareArrows },
  { key: 'itemMovement', icon: Activity },
  { key: 'audit', icon: ShieldAlert },
  { key: 'vatDetailed', icon: ReceiptText },
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
  const tax = useTaxReport();
  const hourly = useHourlySalesReport();
  const zReport = useZReport();
  const topCustomers = useTopCustomersReport();
  const discount = useDiscountReport();
  const salesByCategory = useSalesByCategoryReport();

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
        {tab === 'tax' && <TaxReport query={tax} />}
        {tab === 'hourly' && <HourlyReport query={hourly} />}
        {tab === 'zReport' && <ZReportView query={zReport} />}
        {tab === 'topCustomers' && <TopCustomersReport query={topCustomers} />}
        {tab === 'discount' && <DiscountReport query={discount} />}
        {tab === 'salesByCategory' && <SalesByCategoryReport query={salesByCategory} />}
        {tab === 'slowMoving' && <SlowMovingReport />}
        {tab === 'profit' && <ProfitReport />}
        {tab === 'comparison' && <ComparisonReportView />}
        {tab === 'itemMovement' && <ItemMovementReportView />}
        {tab === 'audit' && <AuditReport />}
        {tab === 'vatDetailed' && <VatDetailedReport />}
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

function Th({
  children,
  end,
  center,
}: {
  children: React.ReactNode;
  end?: boolean;
  center?: boolean;
}) {
  return (
    <th
      className={`px-3 py-2 font-semibold ${end ? 'text-end' : center ? 'text-center' : 'text-start'}`}
    >
      {children}
    </th>
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

/* ---------- tax (VAT) ---------- */

function TaxReport({ query }: { query: ReturnType<typeof useTaxReport> }) {
  const { t } = useTranslation();
  const rows = useMemo(() => query.data ?? [], [query.data]);
  const kpis = useMemo(
    () => ({
      totalVat: rows.reduce((n, r) => n + r.totalVat, 0),
      netBeforeVat: rows.reduce((n, r) => n + r.netBeforeVat, 0),
    }),
    [rows],
  );
  return (
    <ReportShell query={query} empty={rows.length === 0}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Kpi icon={<Landmark className="size-6" />} label={t('reports.totalVat')} value={formatMoney(kpis.totalVat)} />
        <Kpi icon={<Coins className="size-6" />} label={t('reports.netBeforeVat')} value={formatMoney(kpis.netBeforeVat)} />
      </div>
      <TableCard>
        <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
          <tr>
            <Th>{t('reports.day')}</Th>
            <Th end>{t('reports.billCount')}</Th>
            <Th end>{t('reports.netBeforeVat')}</Th>
            <Th end>{t('reports.totalVat')}</Th>
            <Th end>{t('reports.totalAmt')}</Th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r) => (
            <tr key={r.day} className="hover:bg-[var(--color-surface-2)]">
              <td className="tnum px-3 py-2 font-medium">{r.day}</td>
              <td className="tnum px-3 py-2 text-end">{formatNumber(r.billCount)}</td>
              <td className="tnum px-3 py-2 text-end">{formatMoney(r.netBeforeVat)}</td>
              <td className="tnum px-3 py-2 text-end font-bold">{formatMoney(r.totalVat)}</td>
              <td className="tnum px-3 py-2 text-end">{formatMoney(r.totalAmt)}</td>
            </tr>
          ))}
        </tbody>
      </TableCard>
    </ReportShell>
  );
}

/* ---------- hourly sales ---------- */

function HourlyReport({ query }: { query: ReturnType<typeof useHourlySalesReport> }) {
  const { t } = useTranslation();
  const rows = useMemo(() => query.data ?? [], [query.data]);
  const kpis = useMemo(
    () => ({
      totalAmt: rows.reduce((n, r) => n + r.totalAmt, 0),
      totalBills: rows.reduce((n, r) => n + r.billCount, 0),
      peak: rows.reduce((p, r) => (r.totalAmt > (p?.totalAmt ?? -1) ? r : p), rows[0]),
    }),
    [rows],
  );
  const max = Math.max(1, ...rows.map((r) => r.totalAmt));
  return (
    <ReportShell query={query} empty={rows.length === 0}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Kpi icon={<Coins className="size-6" />} label={t('reports.totalAmt')} value={formatMoney(kpis.totalAmt)} />
        <Kpi icon={<Clock className="size-6" />} label={t('reports.peakHour')} value={kpis.peak ? `${kpis.peak.hour}:00` : '—'} />
      </div>
      <TableCard>
        <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
          <tr>
            <Th>{t('reports.hour')}</Th>
            <Th end>{t('reports.billCount')}</Th>
            <Th end>{t('reports.totalAmt')}</Th>
            <Th>{t('reports.share')}</Th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r) => (
            <tr key={r.hour} className="hover:bg-[var(--color-surface-2)]">
              <td className="tnum px-3 py-2 font-medium">{r.hour}:00</td>
              <td className="tnum px-3 py-2 text-end">{formatNumber(r.billCount)}</td>
              <td className="tnum px-3 py-2 text-end font-bold">{formatMoney(r.totalAmt)}</td>
              <td className="px-3 py-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-2)]">
                  <div
                    className="h-full rounded-full bg-[var(--color-brand-500)]"
                    style={{ width: `${Math.round((r.totalAmt / max) * 100)}%` }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </TableCard>
    </ReportShell>
  );
}

/* ---------- Z-report (single summary object) ---------- */

function ZReportView({ query }: { query: ReturnType<typeof useZReport> }) {
  const { t } = useTranslation();
  if (query.isLoading) return <LoadingView />;
  if (query.isError) return <ErrorView error={query.error} onRetry={() => query.refetch()} />;
  const z = query.data;
  if (!z) return <EmptyView />;
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi icon={<Receipt className="size-6" />} label={t('reports.billCount')} value={formatNumber(z.billCount)} />
        <Kpi icon={<Coins className="size-6" />} label={t('reports.grossAmt')} value={formatMoney(z.grossAmt)} />
        <Kpi icon={<Landmark className="size-6" />} label={t('reports.totalVat')} value={formatMoney(z.totalVat)} />
      </div>
      <Card className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
        <ZRow label={t('reports.netBeforeVat')} value={formatMoney(z.netBeforeVat)} />
        <ZRow label={t('reports.totalDisc')} value={formatMoney(z.totalDisc)} />
        <ZRow label={t('reports.returnAmt')} value={formatMoney(z.returnAmt)} />
        <ZRow label={t('reports.firstBill')} value={z.firstBillTime ?? '—'} />
        <ZRow label={t('reports.lastBill')} value={z.lastBillTime ?? '—'} />
      </Card>
      <TableCard>
        <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
          <tr>
            <Th>{t('reports.paymentMethod')}</Th>
            <Th end>{t('reports.billCount')}</Th>
            <Th end>{t('reports.amount')}</Th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {z.byPayment.map((p, i) => (
            <tr key={`${p.method}-${i}`} className="hover:bg-[var(--color-surface-2)]">
              <td className="px-3 py-2 font-medium">{t(`reports.method.${p.method}`, { defaultValue: p.method })}</td>
              <td className="tnum px-3 py-2 text-end">{formatNumber(p.billCount)}</td>
              <td className="tnum px-3 py-2 text-end font-bold">{formatMoney(p.amount)}</td>
            </tr>
          ))}
        </tbody>
      </TableCard>
    </div>
  );
}

function ZRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border bg-[var(--color-surface-2)] px-3 py-2 text-sm">
      <span className="text-[var(--color-muted)]">{label}</span>
      <span className="tnum font-bold">{value}</span>
    </div>
  );
}

/* ---------- top customers ---------- */

function TopCustomersReport({ query }: { query: ReturnType<typeof useTopCustomersReport> }) {
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
            <Th>#</Th>
            <Th>{t('reports.customer')}</Th>
            <Th>{t('reports.customerCode')}</Th>
            <Th end>{t('reports.billCount')}</Th>
            <Th end>{t('reports.totalAmt')}</Th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r, i) => (
            <tr key={`${r.cCode ?? 'walkin'}-${i}`} className="hover:bg-[var(--color-surface-2)]">
              <td className="tnum px-3 py-2 text-[var(--color-muted)]">{i + 1}</td>
              <td className="px-3 py-2 font-medium">{r.cName?.trim() || r.custCode?.trim() || r.cCode?.trim() || t('reports.walkIn')}</td>
              <td className="tnum px-3 py-2 text-[var(--color-muted)]">{r.custCode ?? r.cCode ?? '—'}</td>
              <td className="tnum px-3 py-2 text-end">{formatNumber(r.billCount)}</td>
              <td className="tnum px-3 py-2 text-end font-bold">{formatMoney(r.totalAmt)}</td>
            </tr>
          ))}
        </tbody>
      </TableCard>
    </ReportShell>
  );
}

/* ---------- discount ---------- */

function DiscountReport({ query }: { query: ReturnType<typeof useDiscountReport> }) {
  const { t } = useTranslation();
  const rows = useMemo(() => query.data ?? [], [query.data]);
  const kpis = useMemo(
    () => ({
      totalDisc: rows.reduce((n, r) => n + r.totalDisc, 0),
      totalAmt: rows.reduce((n, r) => n + r.totalAmt, 0),
    }),
    [rows],
  );
  return (
    <ReportShell query={query} empty={rows.length === 0}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Kpi icon={<Percent className="size-6" />} label={t('reports.totalDisc')} value={formatMoney(kpis.totalDisc)} />
        <Kpi icon={<Coins className="size-6" />} label={t('reports.totalAmt')} value={formatMoney(kpis.totalAmt)} />
      </div>
      <TableCard>
        <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
          <tr>
            <Th>{t('reports.day')}</Th>
            <Th end>{t('reports.billCount')}</Th>
            <Th end>{t('reports.totalDisc')}</Th>
            <Th end>{t('reports.totalAmt')}</Th>
            <Th end>{t('reports.discPct')}</Th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r) => (
            <tr key={r.day} className="hover:bg-[var(--color-surface-2)]">
              <td className="tnum px-3 py-2 font-medium">{r.day}</td>
              <td className="tnum px-3 py-2 text-end">{formatNumber(r.billCount)}</td>
              <td className="tnum px-3 py-2 text-end font-bold">{formatMoney(r.totalDisc)}</td>
              <td className="tnum px-3 py-2 text-end">{formatMoney(r.totalAmt)}</td>
              <td className="tnum px-3 py-2 text-end">{formatNumber(r.discPct)}%</td>
            </tr>
          ))}
        </tbody>
      </TableCard>
    </ReportShell>
  );
}

/* ---------- sales by category ---------- */

function SalesByCategoryReport({ query }: { query: ReturnType<typeof useSalesByCategoryReport> }) {
  const { t } = useTranslation();
  const rows = useMemo(() => query.data ?? [], [query.data]);
  const kpis = useMemo(
    () => ({
      totalAmt: rows.reduce((n, r) => n + r.totalAmt, 0),
      totalQty: rows.reduce((n, r) => n + r.totalQty, 0),
    }),
    [rows],
  );
  return (
    <ReportShell query={query} empty={rows.length === 0}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Kpi icon={<Coins className="size-6" />} label={t('reports.totalAmt')} value={formatMoney(kpis.totalAmt)} />
        <Kpi icon={<Package className="size-6" />} label={t('reports.totalQty')} value={formatNumber(kpis.totalQty)} />
      </div>
      <TableCard>
        <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
          <tr>
            <Th>{t('reports.category')}</Th>
            <Th end>{t('reports.lineCount')}</Th>
            <Th end>{t('reports.totalQty')}</Th>
            <Th end>{t('reports.totalAmt')}</Th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r) => (
            <tr key={r.categoryNo} className="hover:bg-[var(--color-surface-2)]">
              <td className="px-3 py-2 font-medium">{r.categoryName?.trim() || `#${r.categoryNo}`}</td>
              <td className="tnum px-3 py-2 text-end">{formatNumber(r.lineCount)}</td>
              <td className="tnum px-3 py-2 text-end">{formatNumber(r.totalQty)}</td>
              <td className="tnum px-3 py-2 text-end font-bold">{formatMoney(r.totalAmt)}</td>
            </tr>
          ))}
        </tbody>
      </TableCard>
    </ReportShell>
  );
}

/* ==========================================================================
 * Fable-5 wave — historical / advanced reports (2026-07-03 endpoints):
 * slow-moving · profit · comparison · item-movement · audit · vat-detailed.
 * ========================================================================== */

/** Shared date-range picker row (from/to → apply). */
function RangeBar({
  onApply,
  extra,
}: {
  onApply: (from?: string, to?: string) => void;
  extra?: React.ReactNode;
}) {
  const { t } = useTranslation();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="flex flex-col gap-1">
        <span className="text-xs text-[var(--color-muted)]">{t('reports2.from')}</span>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 w-40" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-[var(--color-muted)]">{t('reports2.to')}</span>
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 w-40" />
      </label>
      {extra}
      <Button
        variant="primary"
        className="h-9"
        onClick={() => onApply(from || undefined, to || undefined)}
      >
        {t('reports2.apply')}
      </Button>
    </div>
  );
}

/* ---------- slow-moving (POSR007) ---------- */

function SlowMovingReport() {
  const { t } = useTranslation();
  const [range, setRange] = useState<{ from?: string; to?: string }>({});
  const query = useSlowMovingReport(range.from, range.to);
  const rows = query.data ?? [];
  return (
    <div className="flex h-full flex-col gap-4">
      <RangeBar onApply={(from, to) => setRange({ from, to })} />
      <p className="text-xs text-[var(--color-muted)]">{t('reports2.slowMoving.hint')}</p>
      <ReportShell query={query} empty={rows.length === 0}>
        <TableCard>
          <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
            <tr>
              <Th>{t('reports.itemName')}</Th>
              <Th>{t('reports.itemCode')}</Th>
              <Th end>{t('reports.qty')}</Th>
              <Th end>{t('reports.totalAmt')}</Th>
              <Th>{t('reports2.slowMoving.lastSold')}</Th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={r.iCode} className="hover:bg-[var(--color-surface-2)]">
                <td className="px-3 py-2 font-medium">{r.iName?.trim() || r.iCode}</td>
                <td className="tnum px-3 py-2 text-[var(--color-muted)]">{r.iCode}</td>
                <td
                  className={`tnum px-3 py-2 text-end font-bold ${
                    r.totalQty === 0 ? 'text-[var(--color-danger)]' : ''
                  }`}
                >
                  {formatNumber(r.totalQty)}
                </td>
                <td className="tnum px-3 py-2 text-end">{formatMoney(r.totalAmt)}</td>
                <td className="tnum px-3 py-2 text-[var(--color-muted)]">
                  {r.lastSoldDay ?? t('reports2.slowMoving.neverSold')}
                </td>
              </tr>
            ))}
          </tbody>
        </TableCard>
      </ReportShell>
    </div>
  );
}

/* ---------- profit (POSR013) ---------- */

function ProfitReport() {
  const { t } = useTranslation();
  const [range, setRange] = useState<{ from?: string; to?: string }>({});
  const query = useProfitReport(range.from, range.to);
  const rows = query.data ?? [];
  const kpis = useMemo(
    () => ({
      revenue: rows.reduce((n, r) => n + r.revenue, 0),
      profit: rows.reduce((n, r) => n + (r.costAvailable ? r.profit : 0), 0),
    }),
    [rows],
  );
  return (
    <div className="flex h-full flex-col gap-4">
      <RangeBar onApply={(from, to) => setRange({ from, to })} />
      <ReportShell query={query} empty={rows.length === 0}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Kpi icon={<Coins className="size-6" />} label={t('reports2.profit.revenue')} value={formatMoney(kpis.revenue)} />
          <Kpi icon={<TrendingUp className="size-6" />} label={t('reports2.profit.profit')} value={formatMoney(kpis.profit)} />
        </div>
        <TableCard>
          <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
            <tr>
              <Th>{t('reports.itemName')}</Th>
              <Th end>{t('reports.qty')}</Th>
              <Th end>{t('reports2.profit.revenue')}</Th>
              <Th end>{t('reports2.profit.cost')}</Th>
              <Th end>{t('reports2.profit.profit')}</Th>
              <Th end>{t('reports2.profit.margin')}</Th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={r.iCode} className="hover:bg-[var(--color-surface-2)]">
                <td className="px-3 py-2 font-medium">
                  {r.iName?.trim() || r.iCode}
                  {!r.costAvailable ? (
                    <span className="ms-2 rounded-full bg-[var(--color-warning)]/15 px-2 py-0.5 text-[10px] text-[var(--color-warning)]">
                      {t('reports2.profit.noCost')}
                    </span>
                  ) : null}
                </td>
                <td className="tnum px-3 py-2 text-end">{formatNumber(r.totalQty)}</td>
                <td className="tnum px-3 py-2 text-end">{formatMoney(r.revenue)}</td>
                <td className="tnum px-3 py-2 text-end">{r.costAvailable ? formatMoney(r.cost) : '—'}</td>
                <td
                  className={`tnum px-3 py-2 text-end font-bold ${
                    r.costAvailable && r.profit < 0 ? 'text-[var(--color-danger)]' : ''
                  }`}
                >
                  {r.costAvailable ? formatMoney(r.profit) : '—'}
                </td>
                <td className="tnum px-3 py-2 text-end">
                  {r.costAvailable ? `${formatNumber(r.marginPct)}%` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </TableCard>
      </ReportShell>
    </div>
  );
}

/* ---------- comparison (A vs B) ---------- */

function ComparisonReportView() {
  const { t } = useTranslation();
  const [fromA, setFromA] = useState('');
  const [toA, setToA] = useState('');
  const [fromB, setFromB] = useState('');
  const [toB, setToB] = useState('');
  const [applied, setApplied] = useState<{
    fromA?: string;
    toA?: string;
    fromB?: string;
    toB?: string;
  }>({});
  const query = useComparisonReport(applied);
  const r = query.data;

  const dateField = (label: string, value: string, set: (v: string) => void) => (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-[var(--color-muted)]">{label}</span>
      <Input type="date" value={value} onChange={(e) => set(e.target.value)} className="h-9 w-40" />
    </label>
  );

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-end gap-2">
        {dateField(`${t('reports2.comparison.periodA')} — ${t('reports2.from')}`, fromA, setFromA)}
        {dateField(t('reports2.to'), toA, setToA)}
        {dateField(`${t('reports2.comparison.periodB')} — ${t('reports2.from')}`, fromB, setFromB)}
        {dateField(t('reports2.to'), toB, setToB)}
        <Button
          variant="primary"
          className="h-9"
          disabled={!(fromA && toA && fromB && toB)}
          onClick={() => setApplied({ fromA, toA, fromB, toB })}
        >
          {t('reports2.apply')}
        </Button>
      </div>

      {!applied.fromA ? (
        <EmptyView label={t('reports2.comparison.needDates')} />
      ) : query.isLoading ? (
        <LoadingView />
      ) : query.isError ? (
        <ErrorView error={query.error} onRetry={() => query.refetch()} />
      ) : r ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Kpi
              icon={<Coins className="size-6" />}
              label={`${t('reports2.comparison.delta')} (${t('reports2.comparison.sales')})`}
              value={`${formatMoney(r.deltaAmt)} (${formatNumber(r.deltaAmtPct)}%)`}
            />
            <Kpi
              icon={<Receipt className="size-6" />}
              label={`${t('reports2.comparison.delta')} (${t('reports2.comparison.bills')})`}
              value={`${formatNumber(r.deltaBills)} (${formatNumber(r.deltaBillsPct)}%)`}
            />
          </div>
          <TableCard>
            <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
              <tr>
                <Th>{t('reports2.comparison.metric')}</Th>
                <Th end>{`${t('reports2.comparison.periodA')} (${r.periodA.from} → ${r.periodA.to})`}</Th>
                <Th end>{`${t('reports2.comparison.periodB')} (${r.periodB.from} → ${r.periodB.to})`}</Th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(
                [
                  [t('reports2.comparison.sales'), formatMoney(r.periodA.totalAmt), formatMoney(r.periodB.totalAmt)],
                  [t('reports2.comparison.bills'), formatNumber(r.periodA.billCount), formatNumber(r.periodB.billCount)],
                  [t('reports2.comparison.avgBill'), formatMoney(r.periodA.avgBill), formatMoney(r.periodB.avgBill)],
                  [t('reports2.comparison.vat'), formatMoney(r.periodA.totalVat), formatMoney(r.periodB.totalVat)],
                  [t('reports2.comparison.discount'), formatMoney(r.periodA.totalDisc), formatMoney(r.periodB.totalDisc)],
                ] as [string, string, string][]
              ).map(([label, a, b]) => (
                <tr key={label} className="hover:bg-[var(--color-surface-2)]">
                  <td className="px-3 py-2 font-medium">{label}</td>
                  <td className="tnum px-3 py-2 text-end font-bold">{a}</td>
                  <td className="tnum px-3 py-2 text-end">{b}</td>
                </tr>
              ))}
            </tbody>
          </TableCard>
        </>
      ) : null}
    </div>
  );
}

/* ---------- item movement (POSR007) ---------- */

function ItemMovementReportView() {
  const { t } = useTranslation();
  const [itemInput, setItemInput] = useState('');
  const [range, setRange] = useState<{ item: string; from?: string; to?: string }>({ item: '' });
  const query = useItemMovementReport(range.item, range.from, range.to);
  const r = query.data;

  return (
    <div className="flex h-full flex-col gap-4">
      <RangeBar
        extra={
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--color-muted)]">{t('reports2.itemMovement.itemCode')}</span>
            <div className="relative">
              <Search className="pointer-events-none absolute inset-y-0 end-2 my-auto size-4 text-[var(--color-muted)]" aria-hidden />
              <Input
                value={itemInput}
                onChange={(e) => setItemInput(e.target.value)}
                placeholder={t('reports2.itemMovement.itemPlaceholder')}
                className="tnum h-9 w-48 pe-8"
              />
            </div>
          </label>
        }
        onApply={(from, to) => setRange({ item: itemInput.trim(), from, to })}
      />

      {!range.item ? (
        <EmptyView label={t('reports2.itemMovement.needItem')} />
      ) : query.isLoading ? (
        <LoadingView />
      ) : query.isError ? (
        <ErrorView error={query.error} onRetry={() => query.refetch()} />
      ) : r ? (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Kpi icon={<Package className="size-6" />} label={t('reports2.itemMovement.sold')} value={formatNumber(r.totalSoldQty)} />
            <Kpi icon={<Undo2 className="size-6" />} label={t('reports2.itemMovement.returned')} value={formatNumber(r.totalReturnedQty)} />
            <Kpi icon={<Activity className="size-6" />} label={t('reports2.itemMovement.netQty')} value={formatNumber(r.netQty)} />
            <Kpi icon={<Coins className="size-6" />} label={t('reports2.itemMovement.netAmt')} value={formatMoney(r.netAmt)} />
          </div>
          <p className="text-sm font-bold">{r.iName?.trim() || r.iCode}</p>
          {r.movements.length === 0 ? (
            <EmptyView />
          ) : (
            <TableCard>
              <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
                <tr>
                  <Th>{t('reports2.itemMovement.moveType')}</Th>
                  <Th>{t('bills.billNo')}</Th>
                  <Th>{t('reports.day')}</Th>
                  <Th>{t('reports2.itemMovement.time')}</Th>
                  <Th end>{t('reports.qty')}</Th>
                  <Th end>{t('pos.price')}</Th>
                  <Th end>{t('reports.totalAmt')}</Th>
                  <Th end>{t('reports.machineNo')}</Th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {r.movements.map((m, i) => (
                  <tr key={`${m.billNo}-${i}`} className="hover:bg-[var(--color-surface-2)]">
                    <td className="px-3 py-2">
                      <span
                        className={
                          'rounded-full px-2 py-0.5 text-xs font-medium ' +
                          (m.moveType === 'SALE'
                            ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
                            : 'bg-[var(--color-danger)]/15 text-[var(--color-danger)]')
                        }
                      >
                        {m.moveType === 'SALE' ? t('reports2.itemMovement.sale') : t('reports2.itemMovement.return')}
                      </span>
                    </td>
                    <td className="tnum px-3 py-2">{m.billNo}</td>
                    <td className="tnum px-3 py-2">{m.day}</td>
                    <td className="tnum px-3 py-2 text-[var(--color-muted)]">{m.time ?? '—'}</td>
                    <td className="tnum px-3 py-2 text-end font-bold">{formatNumber(m.qty)}</td>
                    <td className="tnum px-3 py-2 text-end">{formatMoney(m.price)}</td>
                    <td className="tnum px-3 py-2 text-end">{formatMoney(m.amount)}</td>
                    <td className="tnum px-3 py-2 text-end text-[var(--color-muted)]">{m.machineNo ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </TableCard>
          )}
        </>
      ) : null}
    </div>
  );
}

/* ---------- audit — deleted lines (POSR005) ---------- */

function AuditReport() {
  const { t } = useTranslation();
  const [range, setRange] = useState<{ from?: string; to?: string }>({});
  const query = useAuditReport(range.from, range.to);
  const rows = query.data ?? [];
  return (
    <div className="flex h-full flex-col gap-4">
      <RangeBar onApply={(from, to) => setRange({ from, to })} />
      <p className="text-xs text-[var(--color-muted)]">{t('reports2.audit.hint')}</p>
      <ReportShell query={query} empty={rows.length === 0}>
        <TableCard>
          <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
            <tr>
              <Th>{t('bills.billNo')}</Th>
              <Th>{t('reports.itemName')}</Th>
              <Th end>{t('reports.qty')}</Th>
              <Th end>{t('pos.price')}</Th>
              <Th end>{t('reports.totalAmt')}</Th>
              <Th>{t('reports2.audit.byUser')}</Th>
              <Th>{t('reports2.audit.deletedAt')}</Th>
              <Th center>{t('reports2.audit.fromHung')}</Th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r, i) => (
              <tr key={`${r.billNo}-${r.iCode}-${i}`} className="hover:bg-[var(--color-surface-2)]">
                <td className="tnum px-3 py-2">{r.billNo}</td>
                <td className="px-3 py-2 font-medium">{r.iName?.trim() || r.iCode}</td>
                <td className="tnum px-3 py-2 text-end">{formatNumber(r.qty)}</td>
                <td className="tnum px-3 py-2 text-end">{formatMoney(r.price)}</td>
                <td className="tnum px-3 py-2 text-end font-bold">{formatMoney(r.amount)}</td>
                <td className="px-3 py-2 text-[var(--color-muted)]">
                  {r.auditUserName?.trim() || (r.auditUserId != null ? `#${r.auditUserId}` : '—')}
                </td>
                <td className="tnum px-3 py-2 text-[var(--color-muted)]">{r.auditedAt ?? '—'}</td>
                <td className="px-3 py-2 text-center">
                  {r.fromHungBill ? (
                    <span className="rounded-full bg-[var(--color-warning)]/15 px-2 py-0.5 text-xs text-[var(--color-warning)]">
                      {t('reports2.audit.fromHung')}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </TableCard>
      </ReportShell>
    </div>
  );
}

/* ---------- VAT detailed (rate × category) ---------- */

function VatDetailedReport() {
  const { t } = useTranslation();
  const [range, setRange] = useState<{ from?: string; to?: string }>({});
  const query = useVatDetailedReport(range.from, range.to);
  const rows = query.data ?? [];
  const kpis = useMemo(
    () => ({
      gross: rows.reduce((n, r) => n + r.grossAmt, 0),
      vat: rows.reduce((n, r) => n + r.vatAmt, 0),
    }),
    [rows],
  );
  return (
    <div className="flex h-full flex-col gap-4">
      <RangeBar onApply={(from, to) => setRange({ from, to })} />
      <p className="text-xs text-[var(--color-muted)]">{t('reports2.vatDetailed.hint')}</p>
      <ReportShell query={query} empty={rows.length === 0}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Kpi icon={<Coins className="size-6" />} label={t('reports2.vatDetailed.gross')} value={formatMoney(kpis.gross)} />
          <Kpi icon={<Landmark className="size-6" />} label={t('reports2.vatDetailed.vatAmt')} value={formatMoney(kpis.vat)} />
        </div>
        <TableCard>
          <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
            <tr>
              <Th end>{t('reports2.vatDetailed.rate')}</Th>
              <Th>{t('reports2.vatDetailed.category')}</Th>
              <Th end>{t('reports.lineCount')}</Th>
              <Th end>{t('reports.totalQty')}</Th>
              <Th end>{t('reports2.vatDetailed.gross')}</Th>
              <Th end>{t('reports2.vatDetailed.vatAmt')}</Th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r, i) => (
              <tr key={`${r.vatRate}-${r.categoryNo}-${i}`} className="hover:bg-[var(--color-surface-2)]">
                <td className="tnum px-3 py-2 text-end font-bold">{formatNumber(r.vatRate)}%</td>
                <td className="px-3 py-2 font-medium">
                  {r.categoryName?.trim() || (r.categoryNo != null ? `#${r.categoryNo}` : '—')}
                </td>
                <td className="tnum px-3 py-2 text-end">{formatNumber(r.lineCount)}</td>
                <td className="tnum px-3 py-2 text-end">{formatNumber(r.totalQty)}</td>
                <td className="tnum px-3 py-2 text-end">{formatMoney(r.grossAmt)}</td>
                <td className="tnum px-3 py-2 text-end font-bold">{formatMoney(r.vatAmt)}</td>
              </tr>
            ))}
          </tbody>
        </TableCard>
      </ReportShell>
    </div>
  );
}
