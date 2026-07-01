import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Coins,
  Receipt,
  Clock,
  ShoppingCart,
  Undo2,
  ReceiptText,
  BarChart3,
  Users,
  Package,
  Settings2,
  ScanBarcode,
  type LucideIcon,
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { LoadingView } from '@/shared/ui/StateView';
import { formatMoney, formatNumber } from '@/shared/lib/format';
import { useSession } from '@/features/auth';
import { usePosSettings } from '@/features/pos-terminal/store/pos-settings.store';
import { useCurrentShift } from '@/features/shifts/api/shifts.api';
import { useDailyReport } from '@/features/reports/api/reports.api';
import type { Role } from '@/shared/lib/types';

/** Local YYYY-MM-DD (today) for the daily-report range filter. */
function todayISO(): string {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

interface QuickLink {
  to: string;
  key: string;
  icon: LucideIcon;
  roles: Role[];
}

const LINKS: QuickLink[] = [
  { to: '/pos', key: 'nav.pos', icon: ShoppingCart, roles: ['cashier', 'supervisor', 'admin'] },
  { to: '/price-check', key: 'nav.priceCheck', icon: ScanBarcode, roles: ['cashier', 'supervisor', 'admin'] },
  { to: '/bills', key: 'nav.bills', icon: Receipt, roles: ['cashier', 'supervisor', 'admin'] },
  { to: '/returns', key: 'nav.returns', icon: Undo2, roles: ['cashier', 'supervisor', 'admin'] },
  { to: '/vouchers', key: 'nav.vouchers', icon: ReceiptText, roles: ['cashier', 'supervisor', 'admin'] },
  { to: '/customers', key: 'nav.customers', icon: Users, roles: ['supervisor', 'admin'] },
  { to: '/items', key: 'nav.items', icon: Package, roles: ['supervisor', 'admin'] },
  { to: '/reports', key: 'nav.reports', icon: BarChart3, roles: ['supervisor', 'admin'] },
  { to: '/settings', key: 'nav.settings', icon: Settings2, roles: ['admin'] },
];

/**
 * لوحة التحكم (Dashboard) — landing page after login. Shows today's KPIs
 * (sales / bill count / shift status) and role-aware quick links.
 * KPIs: GET /reports/daily?from=today&to=today + GET /shifts/current.
 */
export function DashboardPage() {
  const { t } = useTranslation();
  const user = useSession((s) => s.user);
  const role = user?.role;
  const cashierNo = usePosSettings((s) => s.cashierNo);

  const today = todayISO();
  const daily = useDailyReport(today, today);
  const shiftQ = useCurrentShift(cashierNo);

  const kpis = useMemo(() => {
    const rows = daily.data ?? [];
    return {
      sales: rows.reduce((n, r) => n + r.totalAmt, 0),
      bills: rows.reduce((n, r) => n + r.billCount, 0),
    };
  }, [daily.data]);

  const shift = shiftQ.data?.shift ?? null;
  const links = LINKS.filter((l) => !role || l.roles.includes(role));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <LayoutDashboard className="size-7 text-[var(--color-brand-500)]" aria-hidden />
          {t('dashboard.title')}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {t('dashboard.welcome', { name: user?.displayName ?? user?.username ?? '' })}
        </p>
      </div>

      {/* KPIs */}
      {daily.isLoading ? (
        <LoadingView />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Kpi
            icon={<Coins className="size-6" />}
            label={t('dashboard.todaySales')}
            value={formatMoney(kpis.sales)}
            tone="brand"
          />
          <Kpi
            icon={<Receipt className="size-6" />}
            label={t('dashboard.todayBills')}
            value={formatNumber(kpis.bills)}
            tone="brand"
          />
          <Kpi
            icon={<Clock className="size-6" />}
            label={t('dashboard.shift')}
            value={
              shiftQ.isLoading
                ? t('status.loading')
                : shift
                  ? `#${shift.shiftNo} · ${t('dashboard.shiftOpen')}`
                  : t('dashboard.shiftClosed')
            }
            tone={shift ? 'success' : 'muted'}
          />
        </div>
      )}

      {/* Quick links */}
      <div>
        <h2 className="mb-3 text-lg font-bold">{t('dashboard.quickLinks')}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {links.map(({ to, key, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-2 rounded-[var(--radius)] border bg-[var(--color-surface)] p-5 text-center transition-colors hover:border-[var(--color-brand-500)] hover:bg-[var(--color-surface-2)]"
            >
              <span className="grid size-12 place-items-center rounded-xl bg-[var(--color-brand-600)]/15 text-[var(--color-brand-500)]">
                <Icon className="size-6" aria-hidden />
              </span>
              <span className="text-sm font-medium">{t(key)}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: 'brand' | 'success' | 'muted';
}) {
  const toneCls =
    tone === 'success'
      ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
      : tone === 'muted'
        ? 'bg-[var(--color-surface-2)] text-[var(--color-muted)]'
        : 'bg-[var(--color-brand-600)]/20 text-[var(--color-brand-500)]';
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className={'grid size-14 shrink-0 place-items-center rounded-xl ' + toneCls}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-[var(--color-muted)]">{label}</p>
        <p className="tnum truncate text-xl font-extrabold">{value}</p>
      </div>
    </Card>
  );
}
