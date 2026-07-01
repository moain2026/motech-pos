import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useSession } from '@/features/auth';
import { LoginPage } from '@/features/auth';
import { AppLayout } from './AppLayout';
import { LoadingView } from '@/shared/ui/StateView';
import type { Role } from '@/shared/lib/types';

// POS is the primary screen → eager. Everything else → lazy (code-split).
import { PosPage } from '@/features/pos-terminal';
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
      { index: true, element: <Navigate to="/pos" replace /> },
      { path: 'pos', element: <PosPage /> },
      { path: 'bills', element: <Lazy><BillsPage /></Lazy> },
      { path: 'bills/:billNo', element: <Lazy><BillDetailPage /></Lazy> },
      { path: 'returns', element: <Lazy><ReturnsPage /></Lazy> },
      {
        path: 'customers',
        element: (
          <RequireRole roles={PRIVILEGED}>
            <Lazy><CustomersPage /></Lazy>
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
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
