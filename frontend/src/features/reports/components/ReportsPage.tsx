import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
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
  Download,
  Hourglass,
  History,
  UserSearch,
  Wallet,
  Banknote,
  Star,
  ClipboardList,
  Users,
  AlarmClock,
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
  useCashierPaymentSummaryReport,
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
  useByShiftReport,
  useShiftsHistoryReport,
  useCustomerStatementReport,
  useReceivablesReport,
  useVouchersSummaryReport,
  useLoyaltyReport,
  useSalesOrdersReport,
  useCustomerGroupsReport,
  useReturnsWindowReport,
  downloadReportCsv,
  type ExportableReport,
} from '../api/reports.api';
import { formatDateTime } from '@/shared/lib/format';
import { ApiError } from '@/shared/lib/api-client';
import type { UseQueryResult } from '@tanstack/react-query';

type Tab =
  | 'daily'
  | 'monthly'
  | 'byItem'
  | 'byMachine'
  | 'byCashier'
  | 'paymentMethods'
  | 'cashierPaymentSummary'
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
  | 'vatDetailed'
  | 'byShift'
  | 'shiftsHistory'
  | 'customerStatement'
  | 'receivables'
  | 'vouchersSummary'
  | 'loyalty'
  | 'salesOrders'
  | 'customerGroups'
  | 'returnsWindow';

const TABS: { key: Tab; icon: typeof CalendarDays }[] = [
  { key: 'daily', icon: CalendarDays },
  { key: 'monthly', icon: CalendarRange },
  { key: 'byItem', icon: Package },
  { key: 'byMachine', icon: MonitorSmartphone },
  { key: 'byCashier', icon: UserCog },
  { key: 'paymentMethods', icon: CreditCard },
  { key: 'cashierPaymentSummary', icon: UserCog },
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
  { key: 'byShift', icon: Hourglass },
  { key: 'shiftsHistory', icon: History },
  { key: 'customerStatement', icon: UserSearch },
  { key: 'receivables', icon: Wallet },
  { key: 'vouchersSummary', icon: Banknote },
  { key: 'loyalty', icon: Star },
  { key: 'salesOrders', icon: ClipboardList },
  { key: 'customerGroups', icon: Users },
  { key: 'returnsWindow', icon: AlarmClock },
];

/** Tab → GET /reports/export report id (only flat reports are exportable). */
const EXPORT_OF: Partial<Record<Tab, ExportableReport>> = {
  daily: 'daily',
  monthly: 'monthly',
  byItem: 'by-item',
  byMachine: 'by-machine',
  byCashier: 'by-cashier',
  paymentMethods: 'payment-methods',
  returns: 'returns',
  tax: 'tax',
  hourly: 'hourly-sales',
  topCustomers: 'top-customers',
  discount: 'discount',
  salesByCategory: 'sales-by-category',
  byShift: 'by-shift',
  shiftsHistory: 'shifts-history',
  receivables: 'receivables',
  salesOrders: 'sales-orders',
  customerGroups: 'customer-groups',
};

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
  const cashierPaymentSummary = useCashierPaymentSummaryReport();
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

      {/* Tabs + CSV export for the active (exportable) tab */}
      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label={t('reports.title')}>
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
        {EXPORT_OF[tab] ? <ExportCsvButton report={EXPORT_OF[tab]!} /> : null}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {tab === 'daily' && <DailyReport query={daily} />}
        {tab === 'monthly' && <MonthlyReport query={monthly} />}
        {tab === 'byItem' && <ByItemReport query={byItem} />}
        {tab === 'byMachine' && <ByMachineReport query={byMachine} />}
        {tab === 'byCashier' && <ByCashierReport query={byCashier} />}
        {tab === 'paymentMethods' && <PaymentMethodsReport query={paymentMethods} />}
        {tab === 'cashierPaymentSummary' && (
          <CashierPaymentSummaryReport query={cashierPaymentSummary} />
        )}
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
        {tab === 'byShift' && <ByShiftReport />}
        {tab === 'shiftsHistory' && <ShiftsHistoryReport />}
        {tab === 'customerStatement' && <CustomerStatementView />}
        {tab === 'receivables' && <ReceivablesReport />}
        {tab === 'vouchersSummary' && <VouchersSummaryReport />}
        {tab === 'loyalty' && <LoyaltyReportView />}
        {tab === 'salesOrders' && <SalesOrdersReport />}
        {tab === 'customerGroups' && <CustomerGroupsReport />}
        {tab === 'returnsWindow' && <ReturnsWindowReportView />}
      </div>
    </div>
  );
}

/**
 * CSV export button (POSR003 substitute) — shown on every exportable tab;
 * downloads GET /reports/export?report=… via the authed client.
 */
function ExportCsvButton({
  report,
  range,
}: {
  report: ExportableReport;
  range?: { from?: string; to?: string };
}) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      await downloadReportCsv(report, range);
    } catch (e) {
      setError(e instanceof ApiError ? e.problem.detail || e.problem.title : t('reports2.exportError'));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" className="h-9" disabled={busy} onClick={() => void run()}>
        <Download className="size-4" />
        {busy ? t('reports2.exporting') : t('reports2.exportCsv')}
      </Button>
      {error ? <span className="text-xs text-[var(--color-danger)]">{error}</span> : null}
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

/* ---------- POST012 cashier payment summary (per-cashier methods) ---------- */

function CashierPaymentSummaryReport({
  query,
}: {
  query: ReturnType<typeof useCashierPaymentSummaryReport>;
}) {
  const { t } = useTranslation();
  const rows = useMemo(() => query.data ?? [], [query.data]);
  const kpis = useMemo(
    () => ({
      totalAmt: rows.reduce((n, r) => n + r.netAmt, 0),
      totalBills: rows.reduce((n, r) => n + r.billCount, 0),
      totalRefunds: rows.reduce((n, r) => n + r.refundTotal, 0),
    }),
    [rows],
  );
  return (
    <ReportShell query={query} empty={rows.length === 0}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi icon={<Coins className="size-6" />} label={t('reports.totalAmt')} value={formatMoney(kpis.totalAmt)} />
        <Kpi icon={<Receipt className="size-6" />} label={t('reports.billCount')} value={formatNumber(kpis.totalBills)} />
        <Kpi icon={<Undo2 className="size-6" />} label={t('reports.refundTotal')} value={formatMoney(kpis.totalRefunds)} />
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
            <Th>{t('reports.methodsBreakdown')}</Th>
            <Th end>{t('reports.refundTotal')}</Th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r) => (
            <tr key={r.cashierNo} className="hover:bg-[var(--color-surface-2)]">
              <td className="tnum px-3 py-2 font-medium">{r.cashierNo}</td>
              <td className="tnum px-3 py-2 text-end">{formatNumber(r.billCount)}</td>
              <td className="tnum px-3 py-2 text-end font-bold">{formatMoney(r.netAmt)}</td>
              <td className="tnum px-3 py-2 text-end">{formatMoney(r.cashTotal)}</td>
              <td className="tnum px-3 py-2 text-end">{formatMoney(r.cardTotal)}</td>
              <td className="tnum px-3 py-2 text-end">{formatMoney(r.creditTotal)}</td>
              <td className="px-3 py-2 text-xs">
                {r.methods
                  .map((m) => `${m.method}: ${formatMoney(m.amountInBill)} (${m.txnCount})`)
                  .join(' · ')}
              </td>
              <td className="tnum px-3 py-2 text-end">{formatMoney(r.refundTotal)}</td>
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

/* ==========================================================================
 * Wave F/G — POSR reports (live endpoints, 2026-07-04): by-shift ·
 * shifts-history · customer-statement · receivables · vouchers-summary ·
 * loyalty · sales-orders · customer-groups.
 * ========================================================================== */

/** Small colored status pill (shift / order states). */
function StatusPill({ value, tone }: { value: string; tone: 'success' | 'warning' | 'danger' | 'muted' }) {
  const cls =
    tone === 'success'
      ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
      : tone === 'warning'
        ? 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]'
        : tone === 'danger'
          ? 'bg-[var(--color-danger)]/15 text-[var(--color-danger)]'
          : 'bg-[var(--color-surface-2)] text-[var(--color-muted)]';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{value}</span>;
}

function shiftTone(status: string): 'success' | 'warning' | 'muted' {
  if (status === 'OPEN') return 'success';
  if (status === 'CLOSED') return 'warning';
  return 'muted';
}

/* ---------- by shift (POSR004) ---------- */

function ByShiftReport() {
  const { t } = useTranslation();
  const [range, setRange] = useState<{ from?: string; to?: string }>({});
  const query = useByShiftReport(range.from, range.to);
  const rows = query.data ?? [];
  const kpis = useMemo(
    () => ({
      netAmt: rows.reduce((n, r) => n + r.netAmt, 0),
      bills: rows.reduce((n, r) => n + r.billCount, 0),
    }),
    [rows],
  );
  return (
    <div className="flex h-full flex-col gap-4">
      <RangeBar onApply={(from, to) => setRange({ from, to })} />
      <ReportShell query={query} empty={rows.length === 0}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Kpi icon={<Coins className="size-6" />} label={t('reports.netAmt')} value={formatMoney(kpis.netAmt)} />
          <Kpi icon={<Receipt className="size-6" />} label={t('reports.billCount')} value={formatNumber(kpis.bills)} />
        </div>
        <TableCard>
          <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
            <tr>
              <Th>{t('reports2.byShift.shiftNo')}</Th>
              <Th>{t('reports.cashierNo')}</Th>
              <Th>{t('reports.machineNo')}</Th>
              <Th center>{t('reports2.byShift.status')}</Th>
              <Th>{t('reports2.byShift.openedAt')}</Th>
              <Th end>{t('reports.billCount')}</Th>
              <Th end>{t('reports.netAmt')}</Th>
              <Th end>{t('reports.cashCollected')}</Th>
              <Th end>{t('reports.cardCollected')}</Th>
              <Th end>{t('reports2.byShift.overShort')}</Th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={r.shiftId} className="hover:bg-[var(--color-surface-2)]">
                <td className="tnum px-3 py-2 font-medium">#{r.shiftNo}</td>
                <td className="tnum px-3 py-2">{r.cashierNo}</td>
                <td className="tnum px-3 py-2">{r.machineNo ?? '—'}</td>
                <td className="px-3 py-2 text-center">
                  <StatusPill value={t(`reports2.shiftStatus.${r.status}`, { defaultValue: r.status })} tone={shiftTone(r.status)} />
                </td>
                <td className="tnum px-3 py-2 text-[var(--color-muted)]">{formatDateTime(r.openedAt)}</td>
                <td className="tnum px-3 py-2 text-end">{formatNumber(r.billCount)}</td>
                <td className="tnum px-3 py-2 text-end font-bold">{formatMoney(r.netAmt)}</td>
                <td className="tnum px-3 py-2 text-end">{formatMoney(r.cashCollected)}</td>
                <td className="tnum px-3 py-2 text-end">{formatMoney(r.cardCollected)}</td>
                <td
                  className={`tnum px-3 py-2 text-end font-bold ${
                    (r.cashDifference ?? 0) < 0
                      ? 'text-[var(--color-danger)]'
                      : (r.cashDifference ?? 0) > 0
                        ? 'text-[var(--color-warning)]'
                        : ''
                  }`}
                >
                  {r.cashDifference != null ? formatMoney(r.cashDifference) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </TableCard>
      </ReportShell>
    </div>
  );
}

/* ---------- shifts history (POSR014) ---------- */

function ShiftsHistoryReport() {
  const { t } = useTranslation();
  const [range, setRange] = useState<{ from?: string; to?: string }>({});
  const query = useShiftsHistoryReport(range.from, range.to);
  const rows = query.data ?? [];
  return (
    <div className="flex h-full flex-col gap-4">
      <RangeBar onApply={(from, to) => setRange({ from, to })} />
      <p className="text-xs text-[var(--color-muted)]">{t('reports2.shiftsHistory.hint')}</p>
      <ReportShell query={query} empty={rows.length === 0}>
        <TableCard>
          <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
            <tr>
              <Th>{t('reports2.byShift.shiftNo')}</Th>
              <Th>{t('reports.cashierNo')}</Th>
              <Th center>{t('reports2.byShift.status')}</Th>
              <Th>{t('reports2.byShift.openedAt')}</Th>
              <Th end>{t('reports2.shiftsHistory.opening')}</Th>
              <Th end>{t('reports2.shiftsHistory.expected')}</Th>
              <Th end>{t('reports2.shiftsHistory.counted')}</Th>
              <Th end>{t('reports2.byShift.overShort')}</Th>
              <Th end>{t('reports2.shiftsHistory.receipts')}</Th>
              <Th end>{t('reports2.shiftsHistory.expenses')}</Th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={r.shiftId} className="hover:bg-[var(--color-surface-2)]">
                <td className="tnum px-3 py-2 font-medium">#{r.shiftNo}</td>
                <td className="tnum px-3 py-2">{r.cashierNo}</td>
                <td className="px-3 py-2 text-center">
                  <StatusPill value={t(`reports2.shiftStatus.${r.status}`, { defaultValue: r.status })} tone={shiftTone(r.status)} />
                </td>
                <td className="tnum px-3 py-2 text-[var(--color-muted)]">{formatDateTime(r.openedAt)}</td>
                <td className="tnum px-3 py-2 text-end">{formatMoney(r.openingBalance)}</td>
                <td className="tnum px-3 py-2 text-end">{r.expectedCash != null ? formatMoney(r.expectedCash) : '—'}</td>
                <td className="tnum px-3 py-2 text-end">{r.countedCash != null ? formatMoney(r.countedCash) : '—'}</td>
                <td
                  className={`tnum px-3 py-2 text-end font-bold ${
                    (r.settleDifference ?? r.cashDifference ?? 0) < 0 ? 'text-[var(--color-danger)]' : ''
                  }`}
                >
                  {r.settleDifference != null
                    ? formatMoney(r.settleDifference)
                    : r.cashDifference != null
                      ? formatMoney(r.cashDifference)
                      : '—'}
                </td>
                <td className="tnum px-3 py-2 text-end">{formatMoney(r.cashReceipts)}</td>
                <td className="tnum px-3 py-2 text-end">{formatMoney(r.cashExpenses)}</td>
              </tr>
            ))}
          </tbody>
        </TableCard>
      </ReportShell>
    </div>
  );
}

/* ---------- customer statement (POSR002) ---------- */

function CustomerStatementView() {
  const { t } = useTranslation();
  const [customerInput, setCustomerInput] = useState('');
  const [applied, setApplied] = useState<{ customer: string; from?: string; to?: string }>({
    customer: '',
  });
  const query = useCustomerStatementReport(applied.customer, applied.from, applied.to);
  const r = query.data;

  return (
    <div className="flex h-full flex-col gap-4">
      <RangeBar
        extra={
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--color-muted)]">{t('reports2.customerStatement.customer')}</span>
            <div className="relative">
              <Search className="pointer-events-none absolute inset-y-0 end-2 my-auto size-4 text-[var(--color-muted)]" aria-hidden />
              <Input
                value={customerInput}
                onChange={(e) => setCustomerInput(e.target.value)}
                placeholder={t('reports2.customerStatement.customerPh')}
                className="tnum h-9 w-48 pe-8"
              />
            </div>
          </label>
        }
        onApply={(from, to) => setApplied({ customer: customerInput.trim(), from, to })}
      />

      {!applied.customer ? (
        <EmptyView label={t('reports2.customerStatement.needCustomer')} />
      ) : query.isLoading ? (
        <LoadingView />
      ) : query.isError ? (
        <ErrorView error={query.error} onRetry={() => query.refetch()} />
      ) : r ? (
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto scroll-thin pe-1">
          <p className="text-sm font-bold">
            {r.customerName?.trim() || r.customerCode}
            <span className="tnum ms-2 text-[var(--color-muted)]">{r.customerCode}</span>
          </p>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Kpi icon={<Coins className="size-6" />} label={t('reports2.customerStatement.salesTotal')} value={formatMoney(r.totals.salesTotal)} />
            <Kpi icon={<Undo2 className="size-6" />} label={t('reports2.customerStatement.returnsTotal')} value={formatMoney(r.totals.returnsTotal)} />
            <Kpi icon={<Star className="size-6" />} label={t('reports2.customerStatement.points')} value={`${formatNumber(r.totals.pointsEarned)} / ${formatNumber(r.totals.pointsRedeemed)}`} />
            <Kpi icon={<Wallet className="size-6" />} label={t('reports2.customerStatement.outstanding')} value={formatMoney(r.totals.outstanding)} />
          </div>

          <StatementSection title={t('reports2.customerStatement.bills')} count={r.bills.length}>
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-surface-2)] text-[var(--color-muted)]">
                <tr>
                  <Th>{t('bills.billNo')}</Th>
                  <Th>{t('reports2.customerStatement.date')}</Th>
                  <Th end>{t('reports.grossAmt')}</Th>
                  <Th end>{t('reports.totalDisc')}</Th>
                  <Th end>{t('reports.totalVat')}</Th>
                  <Th end>{t('reports.netAmt')}</Th>
                  <Th end>{t('reports2.customerStatement.paid')}</Th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {r.bills.map((b) => (
                  <tr key={b.billId} className="hover:bg-[var(--color-surface-2)]">
                    <td className="tnum px-3 py-2 font-medium">{b.billNo}</td>
                    <td className="tnum px-3 py-2 text-[var(--color-muted)]">{formatDateTime(b.issuedAt)}</td>
                    <td className="tnum px-3 py-2 text-end">{formatMoney(b.grossAmt)}</td>
                    <td className="tnum px-3 py-2 text-end">{formatMoney(b.discountAmt)}</td>
                    <td className="tnum px-3 py-2 text-end">{formatMoney(b.vatAmt)}</td>
                    <td className="tnum px-3 py-2 text-end font-bold">{formatMoney(b.netAmt)}</td>
                    <td className="tnum px-3 py-2 text-end">{formatMoney(b.paidAmt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </StatementSection>

          <StatementSection title={t('reports2.customerStatement.returns')} count={r.returns.length}>
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-surface-2)] text-[var(--color-muted)]">
                <tr>
                  <Th>{t('reports2.customerStatement.rtBillNo')}</Th>
                  <Th>{t('reports2.customerStatement.originalBillNo')}</Th>
                  <Th>{t('reports2.customerStatement.date')}</Th>
                  <Th end>{t('reports.netAmt')}</Th>
                  <Th end>{t('reports.refundAmt')}</Th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {r.returns.map((x) => (
                  <tr key={x.returnId} className="hover:bg-[var(--color-surface-2)]">
                    <td className="tnum px-3 py-2 font-medium">{x.rtBillNo}</td>
                    <td className="tnum px-3 py-2">{x.originalBillNo}</td>
                    <td className="tnum px-3 py-2 text-[var(--color-muted)]">{formatDateTime(x.issuedAt)}</td>
                    <td className="tnum px-3 py-2 text-end">{formatMoney(x.netAmt)}</td>
                    <td className="tnum px-3 py-2 text-end font-bold">{formatMoney(x.refundAmt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </StatementSection>

          <StatementSection title={t('reports2.customerStatement.pointsSection')} count={r.points.length}>
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-surface-2)] text-[var(--color-muted)]">
                <tr>
                  <Th>{t('reports2.loyalty.type')}</Th>
                  <Th>{t('bills.billNo')}</Th>
                  <Th end>{t('reports2.loyalty.points')}</Th>
                  <Th end>{t('reports2.customerStatement.docAmt')}</Th>
                  <Th>{t('reports2.customerStatement.date')}</Th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {r.points.map((p, i) => (
                  <tr key={i} className="hover:bg-[var(--color-surface-2)]">
                    <td className="px-3 py-2">{t(`loyalty.kind.${p.trnsTypeName}`, { defaultValue: p.trnsTypeName })}</td>
                    <td className="tnum px-3 py-2">{p.billNo ?? '—'}</td>
                    <td className={`tnum px-3 py-2 text-end font-bold ${p.pointCnt < 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'}`}>
                      {formatNumber(p.pointCnt)}
                    </td>
                    <td className="tnum px-3 py-2 text-end">{formatMoney(p.docAmt)}</td>
                    <td className="tnum px-3 py-2 text-[var(--color-muted)]">{formatDateTime(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </StatementSection>

          <StatementSection title={t('reports2.customerStatement.collections')} count={r.collections.length}>
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-surface-2)] text-[var(--color-muted)]">
                <tr>
                  <Th>{t('reports.paymentMethod')}</Th>
                  <Th>{t('reports.currency')}</Th>
                  <Th end>{t('reports.amount')}</Th>
                  <Th>{t('reports2.customerStatement.date')}</Th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {r.collections.map((c) => (
                  <tr key={c.collectionId} className="hover:bg-[var(--color-surface-2)]">
                    <td className="px-3 py-2">{t(`reports.method.${c.method}`, { defaultValue: c.method })}</td>
                    <td className="tnum px-3 py-2">{c.currency}</td>
                    <td className="tnum px-3 py-2 text-end font-bold">{formatMoney(c.amountInBill)}</td>
                    <td className="tnum px-3 py-2 text-[var(--color-muted)]">{formatDateTime(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </StatementSection>
        </div>
      ) : null}
    </div>
  );
}

function StatementSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b bg-[var(--color-surface-2)] px-3 py-2">
        <p className="text-sm font-bold">{title}</p>
        <span className="tnum text-xs text-[var(--color-muted)]">{count}</span>
      </div>
      {count === 0 ? (
        <p className="p-4 text-center text-sm text-[var(--color-muted)]">{t('status.empty')}</p>
      ) : (
        <div className="overflow-x-auto">{children}</div>
      )}
    </Card>
  );
}

/* ---------- receivables (POSR008) ---------- */

function ReceivablesReport() {
  const { t } = useTranslation();
  const query = useReceivablesReport();
  const rows = query.data ?? [];
  const kpis = useMemo(
    () => ({
      outstanding: rows.reduce((n, r) => n + r.outstanding, 0),
      credit: rows.reduce((n, r) => n + r.creditTotal, 0),
    }),
    [rows],
  );
  return (
    <ReportShell query={query} empty={rows.length === 0}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Kpi icon={<Wallet className="size-6" />} label={t('reports2.receivables.outstanding')} value={formatMoney(kpis.outstanding)} />
        <Kpi icon={<Coins className="size-6" />} label={t('reports2.receivables.creditTotal')} value={formatMoney(kpis.credit)} />
      </div>
      <TableCard>
        <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
          <tr>
            <Th>{t('reports.customer')}</Th>
            <Th end>{t('reports2.receivables.creditBills')}</Th>
            <Th end>{t('reports2.receivables.creditTotal')}</Th>
            <Th end>{t('reports2.receivables.collected')}</Th>
            <Th end>{t('reports2.receivables.outstanding')}</Th>
            <Th>{t('reports2.receivables.lastCredit')}</Th>
            <Th>{t('reports2.receivables.lastCollection')}</Th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r) => (
            <tr key={r.customerCode} className="hover:bg-[var(--color-surface-2)]">
              <td className="px-3 py-2 font-medium">
                {r.customerName?.trim() || r.customerCode}
                <span className="tnum ms-2 text-xs text-[var(--color-muted)]">{r.customerCode}</span>
              </td>
              <td className="tnum px-3 py-2 text-end">{formatNumber(r.creditBillCount)}</td>
              <td className="tnum px-3 py-2 text-end">{formatMoney(r.creditTotal)}</td>
              <td className="tnum px-3 py-2 text-end text-[var(--color-success)]">{formatMoney(r.collectedTotal)}</td>
              <td className={`tnum px-3 py-2 text-end font-bold ${r.outstanding > 0 ? 'text-[var(--color-danger)]' : ''}`}>
                {formatMoney(r.outstanding)}
              </td>
              <td className="tnum px-3 py-2 text-[var(--color-muted)]">{r.lastCreditAt ? formatDateTime(r.lastCreditAt) : '—'}</td>
              <td className="tnum px-3 py-2 text-[var(--color-muted)]">{r.lastCollectionAt ? formatDateTime(r.lastCollectionAt) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </TableCard>
    </ReportShell>
  );
}

/* ---------- vouchers summary (POSR009/016) ---------- */

function VouchersSummaryReport() {
  const { t } = useTranslation();
  const [range, setRange] = useState<{ from?: string; to?: string }>({});
  const query = useVouchersSummaryReport(range.from, range.to);
  const r = query.data;
  return (
    <div className="flex h-full flex-col gap-4">
      <RangeBar onApply={(from, to) => setRange({ from, to })} />
      {query.isLoading ? (
        <LoadingView />
      ) : query.isError ? (
        <ErrorView error={query.error} onRetry={() => query.refetch()} />
      ) : !r || r.rows.length === 0 ? (
        <EmptyView />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Kpi icon={<Banknote className="size-6" />} label={t('reports2.vouchersSummary.receipts')} value={`${formatMoney(r.totals.receiptsTotal)} (${formatNumber(r.totals.receiptCount)})`} />
            <Kpi icon={<Banknote className="size-6" />} label={t('reports2.vouchersSummary.expenses')} value={`${formatMoney(r.totals.expensesTotal)} (${formatNumber(r.totals.expenseCount)})`} />
            <Kpi icon={<Coins className="size-6" />} label={t('reports2.vouchersSummary.netEffect')} value={formatMoney(r.totals.netCashEffect)} />
          </div>
          <TableCard>
            <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
              <tr>
                <Th>{t('reports.machineNo')}</Th>
                <Th>{t('reports2.vouchersSummary.type')}</Th>
                <Th>{t('reports.paymentMethod')}</Th>
                <Th>{t('reports.currency')}</Th>
                <Th end>{t('reports2.vouchersSummary.count')}</Th>
                <Th end>{t('reports.amount')}</Th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {r.rows.map((v, i) => (
                <tr key={i} className="hover:bg-[var(--color-surface-2)]">
                  <td className="tnum px-3 py-2">{v.machineNo ?? '—'}</td>
                  <td className="px-3 py-2">
                    <StatusPill
                      value={t(`reports2.vouchersSummary.${v.voucherType === 'RECEIPT' ? 'receipt' : 'expense'}`)}
                      tone={v.voucherType === 'RECEIPT' ? 'success' : 'danger'}
                    />
                  </td>
                  <td className="px-3 py-2">{t(`reports.method.${v.paymentMethod}`, { defaultValue: v.paymentMethod })}</td>
                  <td className="tnum px-3 py-2">{v.currency}</td>
                  <td className="tnum px-3 py-2 text-end">{formatNumber(v.voucherCount)}</td>
                  <td className="tnum px-3 py-2 text-end font-bold">{formatMoney(v.amount)}</td>
                </tr>
              ))}
            </tbody>
          </TableCard>
        </>
      )}
    </div>
  );
}

/* ---------- loyalty (POSR010) ---------- */

function LoyaltyReportView() {
  const { t } = useTranslation();
  const [range, setRange] = useState<{ from?: string; to?: string }>({});
  const query = useLoyaltyReport(range.from, range.to);
  const r = query.data;
  return (
    <div className="flex h-full flex-col gap-4">
      <RangeBar onApply={(from, to) => setRange({ from, to })} />
      {query.isLoading ? (
        <LoadingView />
      ) : query.isError ? (
        <ErrorView error={query.error} onRetry={() => query.refetch()} />
      ) : !r || (r.byCustomer.length === 0 && r.byType.length === 0) ? (
        <EmptyView />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto scroll-thin pe-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Kpi icon={<Star className="size-6" />} label={t('reports2.loyalty.earned')} value={formatNumber(r.totals.earned)} />
            <Kpi icon={<Star className="size-6" />} label={t('reports2.loyalty.redeemed')} value={formatNumber(r.totals.redeemed)} />
            <Kpi icon={<Star className="size-6" />} label={t('reports2.loyalty.net')} value={formatNumber(r.totals.net)} />
          </div>
          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-surface-2)] text-[var(--color-muted)]">
                <tr>
                  <Th>{t('reports2.loyalty.type')}</Th>
                  <Th end>{t('reports.txnCount')}</Th>
                  <Th end>{t('reports2.loyalty.points')}</Th>
                  <Th end>{t('reports2.customerStatement.docAmt')}</Th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {r.byType.map((s) => (
                  <tr key={s.trnsType} className="hover:bg-[var(--color-surface-2)]">
                    <td className="px-3 py-2 font-medium">{t(`loyalty.kind.${s.trnsTypeName}`, { defaultValue: s.trnsTypeName })}</td>
                    <td className="tnum px-3 py-2 text-end">{formatNumber(s.txnCount)}</td>
                    <td className={`tnum px-3 py-2 text-end font-bold ${s.points < 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'}`}>
                      {formatNumber(s.points)}
                    </td>
                    <td className="tnum px-3 py-2 text-end">{formatMoney(s.docAmt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-surface-2)] text-[var(--color-muted)]">
                <tr>
                  <Th>{t('reports.customer')}</Th>
                  <Th end>{t('reports2.loyalty.earned')}</Th>
                  <Th end>{t('reports2.loyalty.redeemed')}</Th>
                  <Th end>{t('reports2.loyalty.expired')}</Th>
                  <Th end>{t('reports2.loyalty.net')}</Th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {r.byCustomer.map((c) => (
                  <tr key={c.customerCode} className="hover:bg-[var(--color-surface-2)]">
                    <td className="px-3 py-2 font-medium">
                      {c.customerName?.trim() || c.customerCode}
                      <span className="tnum ms-2 text-xs text-[var(--color-muted)]">{c.customerCode}</span>
                    </td>
                    <td className="tnum px-3 py-2 text-end text-[var(--color-success)]">{formatNumber(c.earned)}</td>
                    <td className="tnum px-3 py-2 text-end text-[var(--color-danger)]">{formatNumber(c.redeemed)}</td>
                    <td className="tnum px-3 py-2 text-end">{formatNumber(c.expired)}</td>
                    <td className="tnum px-3 py-2 text-end font-bold">{formatNumber(c.net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ---------- sales orders (POSR015, read-only) ---------- */

function SalesOrdersReport() {
  const { t } = useTranslation();
  const [range, setRange] = useState<{ from?: string; to?: string }>({});
  const query = useSalesOrdersReport(range.from, range.to);
  const rows = query.data ?? [];
  const kpis = useMemo(
    () => ({
      totalAmt: rows.reduce((n, r) => n + r.orderAmt, 0),
      count: rows.length,
    }),
    [rows],
  );
  return (
    <div className="flex h-full flex-col gap-4">
      <RangeBar onApply={(from, to) => setRange({ from, to })} />
      <p className="text-xs text-[var(--color-muted)]">{t('reports2.salesOrders.hint')}</p>
      <ReportShell query={query} empty={rows.length === 0}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Kpi icon={<Coins className="size-6" />} label={t('reports.totalAmt')} value={formatMoney(kpis.totalAmt)} />
          <Kpi icon={<ClipboardList className="size-6" />} label={t('reports2.salesOrders.count')} value={formatNumber(kpis.count)} />
        </div>
        <TableCard>
          <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
            <tr>
              <Th>{t('reports2.salesOrders.orderNo')}</Th>
              <Th>{t('reports.day')}</Th>
              <Th>{t('reports2.itemMovement.time')}</Th>
              <Th>{t('reports.customer')}</Th>
              <Th>{t('reports.currency')}</Th>
              <Th end>{t('reports.amount')}</Th>
              <Th end>{t('reports.totalVat')}</Th>
              <Th center>{t('reports2.salesOrders.processed')}</Th>
              <Th end>{t('reports.machineNo')}</Th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r, i) => (
              <tr key={`${r.orderNo}-${i}`} className="hover:bg-[var(--color-surface-2)]">
                <td className="tnum px-3 py-2 font-medium">#{r.orderNo}</td>
                <td className="tnum px-3 py-2">{r.orderDay ?? '—'}</td>
                <td className="tnum px-3 py-2 text-[var(--color-muted)]">{r.orderTime ?? '—'}</td>
                <td className="px-3 py-2">{r.customerName?.trim() || r.custCode || '—'}</td>
                <td className="tnum px-3 py-2">{r.currency ?? '—'}</td>
                <td className="tnum px-3 py-2 text-end font-bold">{formatMoney(r.orderAmt)}</td>
                <td className="tnum px-3 py-2 text-end">{formatMoney(r.vatAmt)}</td>
                <td className="px-3 py-2 text-center">
                  <StatusPill
                    value={r.processed ? t('reports2.salesOrders.yes') : t('reports2.salesOrders.no')}
                    tone={r.processed ? 'success' : 'warning'}
                  />
                </td>
                <td className="tnum px-3 py-2 text-end text-[var(--color-muted)]">{r.machineNo ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </TableCard>
      </ReportShell>
    </div>
  );
}

/* ---------- customer groups (POSR012) ---------- */

function CustomerGroupsReport() {
  const { t } = useTranslation();
  const [range, setRange] = useState<{ from?: string; to?: string }>({});
  const query = useCustomerGroupsReport(range.from, range.to);
  const rows = query.data ?? [];
  const kpis = useMemo(
    () => ({
      totalAmt: rows.reduce((n, r) => n + r.totalAmt, 0),
      bills: rows.reduce((n, r) => n + r.billCount, 0),
    }),
    [rows],
  );
  return (
    <div className="flex h-full flex-col gap-4">
      <RangeBar onApply={(from, to) => setRange({ from, to })} />
      <ReportShell query={query} empty={rows.length === 0}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Kpi icon={<Coins className="size-6" />} label={t('reports.totalAmt')} value={formatMoney(kpis.totalAmt)} />
          <Kpi icon={<Receipt className="size-6" />} label={t('reports.billCount')} value={formatNumber(kpis.bills)} />
        </div>
        <TableCard>
          <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
            <tr>
              <Th>{t('reports2.customerGroups.group')}</Th>
              <Th end>{t('reports2.customerGroups.customers')}</Th>
              <Th end>{t('reports.billCount')}</Th>
              <Th end>{t('reports.totalAmt')}</Th>
              <Th end>{t('reports.totalVat')}</Th>
              <Th end>{t('reports.totalDisc')}</Th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r, i) => (
              <tr key={`${r.groupCode ?? 'none'}-${i}`} className="hover:bg-[var(--color-surface-2)]">
                <td className="px-3 py-2 font-medium">
                  {r.groupName?.trim() || r.groupCode || t('reports2.customerGroups.ungrouped')}
                </td>
                <td className="tnum px-3 py-2 text-end">{formatNumber(r.customerCount)}</td>
                <td className="tnum px-3 py-2 text-end">{formatNumber(r.billCount)}</td>
                <td className="tnum px-3 py-2 text-end font-bold">{formatMoney(r.totalAmt)}</td>
                <td className="tnum px-3 py-2 text-end">{formatMoney(r.totalVat)}</td>
                <td className="tnum px-3 py-2 text-end">{formatMoney(r.totalDisc)}</td>
              </tr>
            ))}
          </tbody>
        </TableCard>
      </ReportShell>
    </div>
  );
}

/* ---------- returns vs return window (POSR011) ---------- */

function ReturnsWindowReportView() {
  const { t } = useTranslation();
  const [range, setRange] = useState<{ from?: string; to?: string }>({});
  const query = useReturnsWindowReport(range.from, range.to);
  const r = query.data;
  const rows = r?.rows ?? [];
  const kpis = useMemo(
    () => ({
      outside: rows.filter((x) => x.withinWindow === false).length,
      refund: rows.reduce((n, x) => n + x.refundAmt, 0),
    }),
    [rows],
  );
  return (
    <div className="flex h-full flex-col gap-4">
      <RangeBar onApply={(from, to) => setRange({ from, to })} />
      {r?.windowHours == null && r ? (
        <p className="text-xs text-[var(--color-warning)]">
          {t('reports2.returnsWindow.notConfigured')}
        </p>
      ) : r ? (
        <p className="text-xs text-[var(--color-muted)]">
          {t('reports2.returnsWindow.windowHint', { hours: r.windowHours })}
        </p>
      ) : null}
      {query.isLoading ? (
        <LoadingView />
      ) : query.isError ? (
        <ErrorView error={query.error} onRetry={() => query.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyView />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Kpi icon={<Undo2 className="size-6" />} label={t('reports2.returnsWindow.total')} value={formatNumber(rows.length)} />
            <Kpi icon={<AlarmClock className="size-6" />} label={t('reports2.returnsWindow.outside')} value={formatNumber(kpis.outside)} />
            <Kpi icon={<Coins className="size-6" />} label={t('reports2.returnsWindow.refund')} value={formatMoney(kpis.refund)} />
          </div>
          <TableCard>
            <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
              <tr>
                <Th>{t('reports2.returnsWindow.rtBill')}</Th>
                <Th>{t('reports2.returnsWindow.originalBill')}</Th>
                <Th>{t('reports.customer')}</Th>
                <Th end>{t('reports.cashierNo')}</Th>
                <Th>{t('reports2.returnsWindow.issuedAt')}</Th>
                <Th end>{t('reports2.returnsWindow.delayHours')}</Th>
                <Th end>{t('reports2.returnsWindow.refundAmt')}</Th>
                <Th center>{t('reports2.returnsWindow.window')}</Th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((x) => (
                <tr key={x.rtBillNo} className="hover:bg-[var(--color-surface-2)]">
                  <td className="tnum px-3 py-2 font-medium">{x.rtBillNo}</td>
                  <td className="tnum px-3 py-2 text-[var(--color-muted)]">{x.originalBillNo}</td>
                  <td className="px-3 py-2">{x.customerName?.trim() || '—'}</td>
                  <td className="tnum px-3 py-2 text-end">{x.cashierNo}</td>
                  <td className="tnum px-3 py-2">{formatDateTime(x.issuedAt)}</td>
                  <td className="tnum px-3 py-2 text-end">
                    {x.delayHours != null ? formatNumber(x.delayHours) : '—'}
                  </td>
                  <td className="tnum px-3 py-2 text-end font-bold">{formatMoney(x.refundAmt)}</td>
                  <td className="px-3 py-2 text-center">
                    {x.withinWindow == null ? (
                      <StatusPill value={t('reports2.returnsWindow.unknown')} tone="muted" />
                    ) : x.withinWindow ? (
                      <StatusPill value={t('reports2.returnsWindow.within')} tone="success" />
                    ) : (
                      <StatusPill value={t('reports2.returnsWindow.outsideBadge')} tone="danger" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </TableCard>
        </>
      )}
    </div>
  );
}
