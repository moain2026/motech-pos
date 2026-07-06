import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Receipt,
  BarChart3,
  LogOut,
  Users,
  Undo2,
  ScanBarcode,
  ReceiptText,
  Scale,
  LayoutDashboard,
  Package,
  Settings2,
  Boxes,
  RefreshCw,
  ShieldCheck,
  KeyRound,
  ClipboardList,
  ArrowLeftRight,
  Truck,
  Warehouse,
  FolderTree,
  Coins,
  CreditCard,
  UsersRound,
  Grid3x3,
  PackagePlus,
  PackageMinus,
  PackageSearch,
  Megaphone,
  Menu,
} from 'lucide-react';
import { useSession, ChangePasswordDialog } from '@/features/auth';
import { PendingAlertsBanner } from '@/features/alerts';
import { OnlineBadge } from '@/shared/ui/OnlineBadge';
import { cn } from '@/shared/lib/cn';
import type { Role } from '@/shared/lib/types';

/**
 * Role-based navigation (RBAC). `roles` lists who may see each entry.
 * `primary: true` marks the 4 most-used actions surfaced in the mobile
 * bottom-nav (POS UX §4 — الأكثر استخداماً أولاً).
 */
interface NavItem {
  to: string;
  key: string;
  icon: typeof ShoppingCart;
  roles: Role[];
  primary?: boolean;
}

const NAV: NavItem[] = [
  { to: '/', key: 'nav.dashboard', icon: LayoutDashboard, roles: ['cashier', 'supervisor', 'admin'], primary: true },
  { to: '/pos', key: 'nav.pos', icon: ShoppingCart, roles: ['cashier', 'supervisor', 'admin'], primary: true },
  { to: '/price-check', key: 'nav.priceCheck', icon: ScanBarcode, roles: ['cashier', 'supervisor', 'admin'] },
  { to: '/bills', key: 'nav.bills', icon: Receipt, roles: ['cashier', 'supervisor', 'admin'], primary: true },
  { to: '/returns', key: 'nav.returns', icon: Undo2, roles: ['cashier', 'supervisor', 'admin'] },
  { to: '/vouchers', key: 'nav.vouchers', icon: ReceiptText, roles: ['cashier', 'supervisor', 'admin'] },
  { to: '/reconciliation', key: 'nav.reconciliation', icon: Scale, roles: ['cashier', 'supervisor', 'admin'] },
  { to: '/prescriptions', key: 'nav.prescriptions', icon: ClipboardList, roles: ['cashier', 'supervisor', 'admin'] },
  { to: '/transfers', key: 'nav.transfers', icon: ArrowLeftRight, roles: ['cashier', 'supervisor', 'admin'] },
  { to: '/sales-orders', key: 'nav.salesOrders', icon: ClipboardList, roles: ['cashier', 'supervisor', 'admin'] },
  { to: '/stock-receipts', key: 'nav.stockReceipts', icon: PackagePlus, roles: ['cashier', 'supervisor', 'admin'] },
  { to: '/stock-issues', key: 'nav.stockIssues', icon: PackageMinus, roles: ['cashier', 'supervisor', 'admin'] },
  { to: '/return-counts', key: 'nav.returnCounts', icon: PackageSearch, roles: ['cashier', 'supervisor', 'admin'] },
  { to: '/prepaid-cards', key: 'nav.prepaidCards', icon: CreditCard, roles: ['cashier', 'supervisor', 'admin'] },
  { to: '/keypads', key: 'nav.keypads', icon: Grid3x3, roles: ['cashier', 'supervisor', 'admin'] },
  { to: '/customers', key: 'nav.customers', icon: Users, roles: ['supervisor', 'admin'] },
  { to: '/customer-groups', key: 'nav.customerGroups', icon: UsersRound, roles: ['supervisor', 'admin'] },
  { to: '/items', key: 'nav.items', icon: Package, roles: ['supervisor', 'admin'] },
  { to: '/groups-units', key: 'nav.groupsUnits', icon: FolderTree, roles: ['supervisor', 'admin'] },
  { to: '/suppliers', key: 'nav.suppliers', icon: Truck, roles: ['supervisor', 'admin'] },
  { to: '/warehouses', key: 'nav.warehouses', icon: Warehouse, roles: ['supervisor', 'admin'] },
  { to: '/currencies', key: 'nav.currencies', icon: Coins, roles: ['supervisor', 'admin'] },
  { to: '/inventory', key: 'nav.inventory', icon: Boxes, roles: ['supervisor', 'admin'] },
  { to: '/reports', key: 'nav.reports', icon: BarChart3, roles: ['supervisor', 'admin'] },
  { to: '/sync', key: 'nav.sync', icon: RefreshCw, roles: ['supervisor', 'admin'] },
  { to: '/alerts', key: 'nav.alerts', icon: Megaphone, roles: ['supervisor', 'admin'] },
  { to: '/admin', key: 'nav.admin', icon: ShieldCheck, roles: ['admin'] },
  { to: '/settings', key: 'nav.settings', icon: Settings2, roles: ['admin'] },
];

/** عنصر تنقّل واحد — يعرض الأيقونة دائماً والنص على الديسكتوب (lg+) أو عند full. */
function NavRow({
  item,
  full,
  onClick,
}: {
  item: NavItem;
  full: boolean;
  onClick?: () => void;
}) {
  const { t } = useTranslation();
  const { icon: Icon } = item;
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      onClick={onClick}
      title={t(item.key)}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-[var(--radius)] px-3 text-[length:var(--text-sm)] font-medium transition-colors',
          'min-h-[var(--touch)]',
          full ? 'justify-start' : 'justify-center lg:justify-start',
          isActive
            ? 'bg-[var(--color-brand-600)] text-white'
            : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-fg)]',
        )
      }
    >
      <Icon className="size-5 shrink-0" aria-hidden />
      <span className={full ? 'inline' : 'hidden lg:inline'}>{t(item.key)}</span>
    </NavLink>
  );
}

/** رأس العلامة داخل الشريط الجانبي. */
function Brand({ full }: { full: boolean }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2 border-b px-3 py-4">
      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--color-brand-600)] text-white">
        <ShoppingCart className="size-5" aria-hidden />
      </div>
      <div className={full ? 'block' : 'hidden lg:block'}>
        <p className="text-[length:var(--text-sm)] font-bold leading-tight">{t('app.name')}</p>
        <p className="text-[length:var(--text-xs)] text-[var(--color-muted)]">{t('app.tagline')}</p>
      </div>
    </div>
  );
}

/**
 * Authenticated app shell (المرحلة 2 — متجاوب).
 *   • جوال (<816px): محتوى بعرض كامل + hamburger يفتح Drawer + شريط سفلي (bottom-nav).
 *   • تابلت (816–1024): شريط جانبي أيقونات فقط (rail).
 *   • ديسكتوب (≥1024): شريط جانبي كامل بالنصوص.
 * صفر overflow أفقي: الأعمدة تستخدم minmax(0,1fr) والمحتوى overflow-x-hidden.
 */
export function AppLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSession((s) => s.user);
  const clear = useSession((s) => s.clear);
  const [showChangePw, setShowChangePw] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const role = user?.role;
  const nav = NAV.filter((n) => !role || n.roles.includes(role));
  const bottomNav = nav.filter((n) => n.primary).slice(0, 4);

  // إغلاق الـDrawer عند تغيّر المسار.
  useEffect(() => {
    setDrawer(false);
  }, [location.pathname]);

  const logout = () => {
    clear();
    navigate('/login', { replace: true });
  };

  const SidebarInner = ({ full }: { full: boolean }) => (
    <>
      <Brand full={full} />
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto scroll-thin p-2">
        {nav.map((item) => (
          <NavRow key={item.to} item={item} full={full} onClick={() => setDrawer(false)} />
        ))}
      </nav>
      <button
        onClick={logout}
        className={cn(
          'flex items-center gap-3 border-t px-3 text-[length:var(--text-sm)] text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-danger)]',
          'min-h-[var(--touch)]',
          full ? 'justify-start' : 'justify-center lg:justify-start',
        )}
      >
        <LogOut className="size-5 shrink-0" aria-hidden />
        <span className={full ? 'inline' : 'hidden lg:inline'}>{t('nav.logout')}</span>
      </button>
    </>
  );

  return (
    <div className="grid h-full grid-cols-1 tab:grid-cols-[72px_minmax(0,1fr)] lg:grid-cols-[228px_minmax(0,1fr)]">
      {/* شريط جانبي — يظهر من التابلت فأعلى (rail على التابلت، كامل على الديسكتوب) */}
      <aside className="hidden flex-col border-e bg-[var(--color-surface)] tab:flex">
        <SidebarInner full={false} />
      </aside>

      {/* Drawer للجوال */}
      {drawer ? (
        <div
          className="fixed inset-0 z-[var(--z-overlay)] tab:hidden"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDrawer(false);
          }}
        >
          <div className="absolute inset-0 bg-black/50 animate-fade-in" />
          <div className="absolute inset-y-0 start-0 flex w-[80%] max-w-[280px] flex-col border-e bg-[var(--color-surface)] shadow-[var(--shadow-xl)]">
            <SidebarInner full />
          </div>
        </div>
      ) : null}

      {/* المحتوى */}
      <div className="flex min-h-0 min-w-0 flex-col overflow-x-hidden">
        <header className="flex items-center justify-between gap-2 border-b bg-[var(--color-surface)] px-3 py-2 pt-safe">
          {/* hamburger — الجوال فقط */}
          <button
            onClick={() => setDrawer(true)}
            className="grid size-11 place-items-center rounded-[var(--radius)] text-[var(--color-fg)] hover:bg-[var(--color-surface-2)] tab:hidden"
            aria-label={t('nav.menu')}
          >
            <Menu className="size-6" aria-hidden />
          </button>

          <OnlineBadge />

          <div className="flex min-w-0 items-center gap-2">
            <span className="hidden truncate text-[length:var(--text-sm)] text-[var(--color-muted)] xs:inline">
              {user?.displayName ?? user?.username} · {user?.role}
            </span>
            <button
              onClick={() => setShowChangePw(true)}
              title={t('changePw.title')}
              aria-label={t('changePw.title')}
              className="grid size-11 place-items-center rounded-[var(--radius)] text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-fg)]"
            >
              <KeyRound className="size-5" aria-hidden />
            </button>
          </div>
        </header>
        {showChangePw ? <ChangePasswordDialog onClose={() => setShowChangePw(false)} /> : null}
        <PendingAlertsBanner />
        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto pb-[calc(var(--touch-lg)+var(--safe-bottom))] tab:pb-0">
          <Outlet />
        </main>

        {/* شريط سفلي (bottom-nav) — الجوال فقط، الأربع الأكثر استخداماً */}
        <nav
          className="fixed inset-x-0 bottom-0 z-[var(--z-nav)] flex items-stretch border-t bg-[var(--color-surface)] pb-safe tab:hidden"
          aria-label={t('nav.menu')}
        >
          {bottomNav.map(({ to, key, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[length:var(--text-2xs)] font-medium',
                  'min-h-[var(--touch-lg)]',
                  isActive ? 'text-[var(--color-brand-400)]' : 'text-[var(--color-muted)]',
                )
              }
            >
              <Icon className="size-5" aria-hidden />
              <span>{t(key)}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
