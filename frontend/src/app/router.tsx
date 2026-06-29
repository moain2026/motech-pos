import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useSession } from '@/features/auth';
import { LoginPage } from '@/features/auth';
import { AppLayout } from './AppLayout';
import { LoadingView } from '@/shared/ui/StateView';

// POS is the primary screen → eager. Bills/reports → lazy (code-split).
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

function RequireAuth({ children }: { children: ReactNode }) {
  const token = useSession((s) => s.accessToken);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LoadingView />}>{children}</Suspense>;
}

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
      { path: 'reports', element: <Lazy><ReportsPage /></Lazy> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
