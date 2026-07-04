import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useSession } from '@/features/auth';
import { LoginPage } from '@/features/auth';
import { AppLayout } from './AppLayout';
import { LoadingView } from '@/shared/ui/StateView';
import type { Role } from '@/shared/lib/types';

// POS is the primary screen → eager. Everything else → lazy (code-split).
import { PosPage } from '@/features/pos-terminal';
const PriceCheckPage = lazy(() =>
  import('@/features/pos-terminal').then((m) => ({ default: m.PriceCheckPage })),
);
const VouchersPage = lazy(() =>
  import('@/features/vouchers').then((m) => ({ default: m.VouchersPage })),
);
const ReconciliationPage = lazy(() =>
  import('@/features/shifts/components/ReconciliationPage').then((m) => ({
    default: m.ReconciliationPage,
  })),
);
const BillsPage = lazy(() =>
  import('@/features/bills').then((m) => ({ default: m.BillsPage })),
);
const BillDetailPage = lazy(() =>
  import('@/features/bills').then((m) => ({ default: m.BillDetailPage })),
);
const ReportsPage = lazy(() =>
  import('@/features/reports').then((m) => ({ default: m.ReportsPage })),
);
const CustomersPage = lazy(() =>
  import('@/features/customers').then((m) => ({ default: m.CustomersPage })),
);
const ReturnsPage = lazy(() =>
  import('@/features/returns').then((m) => ({ default: m.ReturnsPage })),
);
const ItemsPage = lazy(() =>
  import('@/features/items').then((m) => ({ default: m.ItemsPage })),
);
const SettingsPage = lazy(() =>
  import('@/features/settings').then((m) => ({ default: m.SettingsPage })),
);
const DashboardPage = lazy(() =>
  import('@/features/dashboard').then((m) => ({ default: m.DashboardPage })),
);
const InventoryPage = lazy(() =>
  import('@/features/inventory').then((m) => ({ default: m.InventoryPage })),
);
const AdminPage = lazy(() =>
  import('@/features/admin').then((m) => ({ default: m.AdminPage })),
);
const SyncPage = lazy(() =>
  import('@/features/sync').then((m) => ({ default: m.SyncPage })),
);
const PrescriptionsPage = lazy(() =>
  import('@/features/prescriptions').then((m) => ({ default: m.PrescriptionsPage })),
);
const TransfersPage = lazy(() =>
  import('@/features/transfers').then((m) => ({ default: m.TransfersPage })),
);
const SuppliersPage = lazy(() =>
  import('@/features/master-data').then((m) => ({ default: m.SuppliersPage })),
);
const WarehousesPage = lazy(() =>
  import('@/features/master-data').then((m) => ({ default: m.WarehousesPage })),
);
const GroupsUnitsPage = lazy(() =>
  import('@/features/master-data').then((m) => ({ default: m.GroupsUnitsPage })),
);
const CurrenciesPage = lazy(() =>
  import('@/features/master-data').then((m) => ({ default: m.CurrenciesPage })),
);
const PrepaidCardsPage = lazy(() =>
  import('@/features/prepaid-cards').then((m) => ({ default: m.PrepaidCardsPage })),
);
const CustomerGroupsPage = lazy(() =>
  import('@/features/customer-groups').then((m) => ({ default: m.CustomerGroupsPage })),
);
const KeypadsPage = lazy(() =>
  import('@/features/keypads').then((m) => ({ default: m.KeypadsPage })),
);

function RequireAuth({ children }: { children: ReactNode }) {
  const token = useSession((s) => s.accessToken);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/** Route-level RBAC: redirect to /pos if the user's role is not permitted. */
function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const role = useSession((s) => s.user?.role);
  if (role && !roles.includes(role)) return <Navigate to="/pos" replace />;
  return <>{children}</>;
}

function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LoadingView />}>{children}</Suspense>;
}

const PRIVILEGED: Role[] = ['supervisor', 'admin'];
const ADMIN_ONLY: Role[] = ['admin'];

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Lazy><DashboardPage /></Lazy> },
      { path: 'pos', element: <PosPage /> },
      { path: 'price-check', element: <Lazy><PriceCheckPage /></Lazy> },
      { path: 'vouchers', element: <Lazy><VouchersPage /></Lazy> },
      { path: 'reconciliation', element: <Lazy><ReconciliationPage /></Lazy> },
      { path: 'bills', element: <Lazy><BillsPage /></Lazy> },
      { path: 'bills/:billNo', element: <Lazy><BillDetailPage /></Lazy> },
      { path: 'returns', element: <Lazy><ReturnsPage /></Lazy> },
      { path: 'prescriptions', element: <Lazy><PrescriptionsPage /></Lazy> },
      { path: 'transfers', element: <Lazy><TransfersPage /></Lazy> },
      {
        path: 'customers',
        element: (
          <RequireRole roles={PRIVILEGED}>
            <Lazy><CustomersPage /></Lazy>
          </RequireRole>
        ),
      },
      {
        path: 'items',
        element: (
          <RequireRole roles={PRIVILEGED}>
            <Lazy><ItemsPage /></Lazy>
          </RequireRole>
        ),
      },
      {
        path: 'inventory',
        element: (
          <RequireRole roles={PRIVILEGED}>
            <Lazy><InventoryPage /></Lazy>
          </RequireRole>
        ),
      },
      {
        path: 'suppliers',
        element: (
          <RequireRole roles={PRIVILEGED}>
            <Lazy><SuppliersPage /></Lazy>
          </RequireRole>
        ),
      },
      {
        path: 'warehouses',
        element: (
          <RequireRole roles={PRIVILEGED}>
            <Lazy><WarehousesPage /></Lazy>
          </RequireRole>
        ),
      },
      {
        path: 'groups-units',
        element: (
          <RequireRole roles={PRIVILEGED}>
            <Lazy><GroupsUnitsPage /></Lazy>
          </RequireRole>
        ),
      },
      {
        path: 'currencies',
        element: (
          <RequireRole roles={PRIVILEGED}>
            <Lazy><CurrenciesPage /></Lazy>
          </RequireRole>
        ),
      },
      {
        path: 'prepaid-cards',
        element: <Lazy><PrepaidCardsPage /></Lazy>,
      },
      { path: 'keypads', element: <Lazy><KeypadsPage /></Lazy> },
      {
        path: 'customer-groups',
        element: (
          <RequireRole roles={PRIVILEGED}>
            <Lazy><CustomerGroupsPage /></Lazy>
          </RequireRole>
        ),
      },
      {
        path: 'sync',
        element: (
          <RequireRole roles={PRIVILEGED}>
            <Lazy><SyncPage /></Lazy>
          </RequireRole>
        ),
      },
      {
        path: 'admin',
        element: (
          <RequireRole roles={ADMIN_ONLY}>
            <Lazy><AdminPage /></Lazy>
          </RequireRole>
        ),
      },
      {
        path: 'reports',
        element: (
          <RequireRole roles={PRIVILEGED}>
            <Lazy><ReportsPage /></Lazy>
          </RequireRole>
        ),
      },
      {
        path: 'settings',
        element: (
          <RequireRole roles={ADMIN_ONLY}>
            <Lazy><SettingsPage /></Lazy>
          </RequireRole>
        ),
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
