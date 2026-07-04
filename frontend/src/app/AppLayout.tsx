import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { useSession, ChangePasswordDialog } from '@/features/auth';
import { OnlineBadge } from '@/shared/ui/OnlineBadge';
import { cn } from '@/shared/lib/cn';
import type { Role } from '@/shared/lib/types';

/**
 * Role-based navigation (RBAC). `roles` lists who may see each entry:
 *   cashier    → sell, bills, returns
 *   supervisor → + reports, customers
 *   admin      → everything
 */
interface NavItem {
  to: string;
  key: string;
  icon: typeof ShoppingCart;
  roles: Role[];
}

const NAV: NavItem[] = [
  { to: '/', key: 'nav.dashboard', icon: LayoutDashboard, roles: ['cashier', 'supervisor', 'admin'] },
  { to: '/pos', key: 'nav.pos', icon: ShoppingCart, roles: ['cashier', 'supervisor', 'admin'] },
  { to: '/price-check', key: 'nav.priceCheck', icon: ScanBarcode, roles: ['cashier', 'supervisor', 'admin'] },
  { to: '/bills', key: 'nav.bills', icon: Receipt, roles: ['cashier', 'supervisor', 'admin'] },
  { to: '/returns', key: 'nav.returns', icon: Undo2, roles: ['cashier', 'supervisor', 'admin'] },
  { to: '/vouchers', key: 'nav.vouchers', icon: ReceiptText, roles: ['cashier', 'supervisor', 'admin'] },
  { to: '/reconciliation', key: 'nav.reconciliation', icon: Scale, roles: ['cashier', 'supervisor', 'admin'] },
  { to: '/prescriptions', key: 'nav.prescriptions', icon: ClipboardList, roles: ['cashier', 'supervisor', 'admin'] },
  { to: '/transfers', key: 'nav.transfers', icon: ArrowLeftRight, roles: ['cashier', 'supervisor', 'admin'] },
  { to: '/prepaid-cards', key: 'nav.prepaidCards', icon: CreditCard, roles: ['cashier', 'supervisor', 'admin'] },
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
  { to: '/admin', key: 'nav.admin', icon: ShieldCheck, roles: ['admin'] },
  { to: '/settings', key: 'nav.settings', icon: Settings2, roles: ['admin'] },
];

/** Authenticated app shell: side nav (RTL) + content outlet. */
export function AppLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useSession((s) => s.user);
  const clear = useSession((s) => s.clear);
  const [showChangePw, setShowChangePw] = useState(false);
  const role = user?.role;
  const nav = NAV.filter((n) => !role || n.roles.includes(role));

  const logout = () => {
    clear();
    navigate('/login', { replace: true });
  };

  return (
    <div className="grid h-full grid-cols-[68px_minmax(0,1fr)] lg:grid-cols-[220px_minmax(0,1fr)]">
      {/* Sidebar */}
      <aside className="flex flex-col border-e bg-[var(--color-surface)]">
        <div className="flex items-center gap-2 border-b px-3 py-4">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--color-brand-600)] text-white">
            <ShoppingCart className="size-5" aria-hidden />
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-bold leading-tight">{t('app.name')}</p>
            <p className="text-xs text-[var(--color-muted)]">{t('app.tagline')}</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-2">
          {nav.map(({ to, key, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-[var(--radius)] px-3 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[var(--color-brand-600)] text-white'
                    : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-fg)]',
                )
              }
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              <span className="hidden lg:inline">{t(key)}</span>
            </NavLink>
          ))}
        </nav>

        <button
          onClick={logout}
          className="flex items-center gap-3 border-t px-3 py-3 text-sm text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-danger)]"
        >
          <LogOut className="size-5 shrink-0" aria-hidden />
          <span className="hidden lg:inline">{t('nav.logout')}</span>
        </button>
      </aside>

      {/* Content */}
      <div className="flex min-h-0 flex-col">
        <header className="flex items-center justify-between border-b bg-[var(--color-surface)] px-4 py-2">
          <OnlineBadge />
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--color-muted)]">
              {user?.displayName ?? user?.username} · {user?.role}
            </span>
            <button
              onClick={() => setShowChangePw(true)}
              title={t('changePw.title')}
              aria-label={t('changePw.title')}
              className="grid size-8 place-items-center rounded-md text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-fg)]"
            >
              <KeyRound className="size-4" aria-hidden />
            </button>
          </div>
        </header>
        {showChangePw ? <ChangePasswordDialog onClose={() => setShowChangePw(false)} /> : null}
        <main className="min-h-0 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
