import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  MonitorSmartphone,
  Users,
  History,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import type { UseQueryResult } from '@tanstack/react-query';
import { useAdminMachines, useAdminUsers, useAdminSessions } from '../api/admin.api';

type Tab = 'machines' | 'users' | 'sessions';

const TABS: { key: Tab; icon: typeof Users }[] = [
  { key: 'machines', icon: MonitorSmartphone },
  { key: 'users', icon: Users },
  { key: 'sessions', icon: History },
];

/**
 * الإدارة (Admin) — POS machines, system users and login history.
 * GET /admin/machines · /admin/users · /admin/sessions. admin-only (RBAC).
 */
export function AdminPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('machines');

  const machines = useAdminMachines();
  const users = useAdminUsers();
  const sessions = useAdminSessions();

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <h1 className="flex items-center gap-2 text-xl font-bold">
        <ShieldCheck className="size-6 text-[var(--color-brand-500)]" aria-hidden />
        {t('admin.title')}
      </h1>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label={t('admin.title')}>
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
            {t(`admin.tab.${key}`)}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {tab === 'machines' && <MachinesTable query={machines} />}
        {tab === 'users' && <UsersTable query={users} />}
        {tab === 'sessions' && <SessionsTable query={sessions} />}
      </div>
    </div>
  );
}

function Shell<T>({
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
  return (
    <Card className="min-h-0 h-full overflow-auto scroll-thin">
      <table className="w-full text-sm">{children}</table>
    </Card>
  );
}

function Th({ children, end, center }: { children: React.ReactNode; end?: boolean; center?: boolean }) {
  return (
    <th
      className={`px-3 py-2 font-semibold ${end ? 'text-end' : center ? 'text-center' : 'text-start'}`}
    >
      {children}
    </th>
  );
}

function Bool({ value }: { value: boolean }) {
  return value ? (
    <CheckCircle2 className="mx-auto size-4 text-[var(--color-success)]" aria-hidden />
  ) : (
    <XCircle className="mx-auto size-4 text-[var(--color-muted)]" aria-hidden />
  );
}

function MachinesTable({ query }: { query: ReturnType<typeof useAdminMachines> }) {
  const { t } = useTranslation();
  const rows = query.data ?? [];
  return (
    <Shell query={query} empty={rows.length === 0}>
      <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
        <tr>
          <Th>{t('admin.machineNo')}</Th>
          <Th>{t('admin.terminal')}</Th>
          <Th center>{t('admin.active')}</Th>
          <Th end>{t('admin.warehouse')}</Th>
          <Th end>{t('admin.branch')}</Th>
          <Th>{t('admin.ip')}</Th>
          <Th>{t('admin.lastBill')}</Th>
          <Th center>{t('admin.useVat')}</Th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {rows.map((m) => (
          <tr key={m.machineNo} className="hover:bg-[var(--color-surface-2)]">
            <td className="tnum px-3 py-2 font-medium">#{m.machineNo}</td>
            <td className="px-3 py-2">{m.terminal ?? '—'}</td>
            <td className="px-3 py-2 text-center"><Bool value={!m.inactive} /></td>
            <td className="tnum px-3 py-2 text-end">{m.defWarehouse ?? '—'}</td>
            <td className="tnum px-3 py-2 text-end">{m.defBranch ?? '—'}</td>
            <td className="tnum px-3 py-2 text-[var(--color-muted)]">{m.ipAddress ?? '—'}</td>
            <td className="tnum px-3 py-2 text-[var(--color-muted)]">{m.lastBillDate ?? '—'}</td>
            <td className="px-3 py-2 text-center"><Bool value={m.useVat} /></td>
          </tr>
        ))}
      </tbody>
    </Shell>
  );
}

function UsersTable({ query }: { query: ReturnType<typeof useAdminUsers> }) {
  const { t } = useTranslation();
  const rows = query.data ?? [];
  return (
    <Shell query={query} empty={rows.length === 0}>
      <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
        <tr>
          <Th>{t('admin.userId')}</Th>
          <Th>{t('admin.userName')}</Th>
          <Th center>{t('admin.isAdmin')}</Th>
          <Th center>{t('admin.active')}</Th>
          <Th center>{t('admin.loggedOn')}</Th>
          <Th center>{t('admin.locked')}</Th>
          <Th>{t('admin.email')}</Th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {rows.map((u) => (
          <tr key={u.userId} className="hover:bg-[var(--color-surface-2)]">
            <td className="tnum px-3 py-2 text-[var(--color-muted)]">{u.userId}</td>
            <td className="px-3 py-2 font-medium">
              {u.arabicName?.trim() || u.englishName?.trim() || `#${u.userId}`}
            </td>
            <td className="px-3 py-2 text-center"><Bool value={u.isAdmin} /></td>
            <td className="px-3 py-2 text-center"><Bool value={!u.inactive} /></td>
            <td className="px-3 py-2 text-center"><Bool value={u.loggedOn} /></td>
            <td className="px-3 py-2 text-center"><Bool value={u.locked} /></td>
            <td className="tnum px-3 py-2 text-[var(--color-muted)]">{u.email ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </Shell>
  );
}

function SessionsTable({ query }: { query: ReturnType<typeof useAdminSessions> }) {
  const { t } = useTranslation();
  const rows = query.data ?? [];
  return (
    <Shell query={query} empty={rows.length === 0}>
      <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
        <tr>
          <Th>{t('admin.userId')}</Th>
          <Th>{t('admin.terminal')}</Th>
          <Th>{t('admin.event')}</Th>
          <Th>{t('admin.eventAt')}</Th>
          <Th end>{t('admin.branch')}</Th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {rows.map((s, i) => (
          <tr key={`${s.userId}-${s.eventAt}-${i}`} className="hover:bg-[var(--color-surface-2)]">
            <td className="tnum px-3 py-2 text-[var(--color-muted)]">{s.userId}</td>
            <td className="px-3 py-2">{s.terminal ?? '—'}</td>
            <td className="px-3 py-2">
              <span
                className={
                  'rounded-full px-2 py-0.5 text-xs font-medium ' +
                  (s.loginType === 0
                    ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
                    : 'bg-[var(--color-muted)]/15 text-[var(--color-muted)]')
                }
              >
                {s.loginType === 0 ? t('admin.login') : t('admin.logout')}
              </span>
            </td>
            <td className="tnum px-3 py-2">{s.eventAt}</td>
            <td className="tnum px-3 py-2 text-end text-[var(--color-muted)]">{s.branchNo ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </Shell>
  );
}
