import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  MonitorSmartphone,
  Users,
  History,
  CheckCircle2,
  XCircle,
  Plus,
  Pencil,
  X,
  KeyRound,
  Power,
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { OriginBadge } from '@/shared/ui/OriginBadge';
import { ApiError } from '@/shared/lib/api-client';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import type { UseQueryResult } from '@tanstack/react-query';
import type { AdminMachine, AdminUser, Role, RolePermission } from '@/shared/lib/types';
import {
  useAdminMachines,
  useAdminUsers,
  useAdminSessions,
  useAdminPermissions,
  useCreateAdminUser,
  useUpdateAdminUser,
  useSetAdminUserStatus,
  useCreateAdminMachine,
  useUpdateAdminMachine,
  useUpdateAdminPermissions,
} from '../api/admin.api';
import { useByMachineReport } from '@/features/reports/api/reports.api';
import { formatMoney, formatNumber } from '@/shared/lib/format';

type Tab = 'machines' | 'users' | 'sessions' | 'permissions';

const TABS: { key: Tab; icon: typeof Users }[] = [
  { key: 'machines', icon: MonitorSmartphone },
  { key: 'users', icon: Users },
  { key: 'sessions', icon: History },
  { key: 'permissions', icon: KeyRound },
];

/**
 * الإدارة (Admin) — POS machines & users full CRUD (MOTECH_POS overlays),
 * login history, and the role → permission matrix (POSS002).
 * GET/POST/PUT /admin/machines · /admin/users (+/status) · /admin/sessions ·
 * GET/PUT /admin/permissions. admin-only (RBAC).
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

      <div className="min-h-0 flex-1 overflow-auto scroll-thin">
        {tab === 'machines' && <MachinesTable query={machines} />}
        {tab === 'users' && <UsersTable query={users} />}
        {tab === 'sessions' && <SessionsTable query={sessions} />}
        {tab === 'permissions' && <PermissionsMatrix />}
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
  const [dialog, setDialog] = useState<{ machine: AdminMachine | null } | null>(null);
  // POST009 — merge live sales stats (bill count + net sales) into each machine row.
  const stats = useByMachineReport();
  const statOf = new Map((stats.data ?? []).map((r) => [r.machineNo, r]));
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex justify-end">
        <Button variant="primary" onClick={() => setDialog({ machine: null })}>
          <Plus className="size-4" />
          {t('adminw.newMachine')}
        </Button>
      </div>
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
            <Th end>{t('admin.billCount')}</Th>
            <Th end>{t('admin.netSales')}</Th>
            <Th center>{t('admin.useVat')}</Th>
            <Th center>{t('adminw.origin')}</Th>
            <Th end>{t('adminw.actions')}</Th>
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
              <td className="tnum px-3 py-2 text-end">
                {statOf.get(m.machineNo) ? formatNumber(statOf.get(m.machineNo)!.billCount) : '—'}
              </td>
              <td className="tnum px-3 py-2 text-end font-semibold">
                {statOf.get(m.machineNo) ? formatMoney(statOf.get(m.machineNo)!.totalAmt) : '—'}
              </td>
              <td className="px-3 py-2 text-center"><Bool value={m.useVat} /></td>
              <td className="px-3 py-2 text-center"><OriginBadge origin={m.origin} /></td>
              <td className="px-3 py-2 text-end">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t('adminw.editMachine')}
                  onClick={() => setDialog({ machine: m })}
                >
                  <Pencil className="size-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Shell>
      {dialog ? <MachineDialog machine={dialog.machine} onClose={() => setDialog(null)} /> : null}
    </div>
  );
}

function UsersTable({ query }: { query: ReturnType<typeof useAdminUsers> }) {
  const { t } = useTranslation();
  const rows = query.data ?? [];
  const [dialog, setDialog] = useState<{ user: AdminUser | null } | null>(null);
  const setStatus = useSetAdminUserStatus();
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex justify-end">
        <Button variant="primary" onClick={() => setDialog({ user: null })}>
          <Plus className="size-4" />
          {t('adminw.newUser')}
        </Button>
      </div>
      <Shell query={query} empty={rows.length === 0}>
        <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
          <tr>
            <Th>{t('admin.userId')}</Th>
            <Th>{t('admin.userName')}</Th>
            <Th>{t('adminw.role')}</Th>
            <Th center>{t('admin.isAdmin')}</Th>
            <Th center>{t('admin.active')}</Th>
            <Th center>{t('admin.loggedOn')}</Th>
            <Th>{t('admin.email')}</Th>
            <Th center>{t('adminw.origin')}</Th>
            <Th end>{t('adminw.actions')}</Th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((u) => (
            <tr key={u.userId} className="hover:bg-[var(--color-surface-2)]">
              <td className="tnum px-3 py-2 text-[var(--color-muted)]">{u.userId}</td>
              <td className="px-3 py-2 font-medium">
                {u.arabicName?.trim() || u.englishName?.trim() || `#${u.userId}`}
              </td>
              <td className="px-3 py-2 text-[var(--color-muted)]">
                {u.role ? t(`adminw.roles.${u.role}`) : '—'}
              </td>
              <td className="px-3 py-2 text-center"><Bool value={u.isAdmin} /></td>
              <td className="px-3 py-2 text-center"><Bool value={!u.inactive} /></td>
              <td className="px-3 py-2 text-center"><Bool value={u.loggedOn} /></td>
              <td className="tnum px-3 py-2 text-[var(--color-muted)]">{u.email ?? '—'}</td>
              <td className="px-3 py-2 text-center"><OriginBadge origin={u.origin} /></td>
              <td className="px-3 py-2 text-end">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t('adminw.editUser')}
                  onClick={() => setDialog({ user: u })}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={u.inactive ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}
                  aria-label={u.inactive ? t('adminw.enable') : t('adminw.disable')}
                  title={u.inactive ? t('adminw.enable') : t('adminw.disable')}
                  disabled={setStatus.isPending}
                  onClick={() => setStatus.mutate({ id: u.userId, active: u.inactive })}
                >
                  <Power className="size-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Shell>
      {dialog ? <UserDialog user={dialog.user} onClose={() => setDialog(null)} /> : null}
    </div>
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

/* ------------------------------------------------------------------------ */
/* User create/edit dialog — POST /admin/users · PUT /admin/users/{id}.     */
/* Editing an ERP user creates an EDIT overlay (ERP stays read-only).       */
/* ------------------------------------------------------------------------ */
function UserDialog({ user, onClose }: { user: AdminUser | null; onClose: () => void }) {
  const { t } = useTranslation();
  const isEdit = !!user;
  const create = useCreateAdminUser();
  const update = useUpdateAdminUser();
  const pending = create.isPending || update.isPending;

  const [arName, setArName] = useState(user?.arabicName ?? '');
  const [enName, setEnName] = useState(user?.englishName ?? '');
  const [code, setCode] = useState(user?.code ?? '');
  const [role, setRole] = useState<Role>((user?.role as Role) ?? 'cashier');
  const [email, setEmail] = useState(user?.email ?? '');
  const [authUsername, setAuthUsername] = useState(user?.authUsername ?? '');
  const [userId, setUserId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const canSubmit = !pending && (isEdit || arName.trim().length > 0);

  const submit = async () => {
    setError(null);
    if (!canSubmit) {
      setError(t('adminw.validation'));
      return;
    }
    try {
      if (isEdit && user) {
        await update.mutateAsync({
          id: user.userId,
          dto: {
            arName: arName.trim() || undefined,
            enName: enName.trim() || undefined,
            code: code.trim() || undefined,
            role,
            email: email.trim() || undefined,
            authUsername: authUsername.trim() || undefined,
          },
        });
      } else {
        await create.mutateAsync({
          userId: userId.trim() ? Number(userId) : undefined,
          arName: arName.trim() || undefined,
          enName: enName.trim() || undefined,
          code: code.trim() || undefined,
          role,
          email: email.trim() || undefined,
          authUsername: authUsername.trim() || undefined,
        });
      }
      setDone(true);
    } catch (e) {
      if (e instanceof ApiError) {
        const trace = e.problem.traceId ? ` (traceId: ${e.problem.traceId})` : '';
        setError(`${e.problem.detail || e.problem.title}${trace}`);
      } else {
        setError(t('adminw.saveError'));
      }
    }
  };

  return (
    <AdminDialog
      title={isEdit ? t('adminw.editUser') : t('adminw.newUser')}
      done={done}
      doneText={t('adminw.saved')}
      error={error}
      pending={pending}
      canSubmit={canSubmit}
      onSubmit={submit}
      onClose={onClose}
    >
      {!isEdit ? (
        <DlgField label={t('adminw.userIdOpt')}>
          <Input
            type="number"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="tnum h-10 text-end"
          />
        </DlgField>
      ) : null}
      <DlgField label={t('adminw.arName')}>
        <Input autoFocus value={arName} onChange={(e) => setArName(e.target.value)} className="h-10" />
      </DlgField>
      <DlgField label={t('adminw.enName')}>
        <Input value={enName} onChange={(e) => setEnName(e.target.value)} className="h-10" dir="ltr" />
      </DlgField>
      <DlgField label={t('adminw.codeL')}>
        <Input value={code} onChange={(e) => setCode(e.target.value)} className="h-10" />
      </DlgField>
      <DlgField label={t('adminw.role')}>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="h-10 rounded-md border bg-[var(--color-surface)] px-2 text-sm"
        >
          <option value="cashier">{t('adminw.roles.cashier')}</option>
          <option value="supervisor">{t('adminw.roles.supervisor')}</option>
          <option value="admin">{t('adminw.roles.admin')}</option>
        </select>
      </DlgField>
      <DlgField label={t('adminw.authUsername')}>
        <Input
          value={authUsername}
          onChange={(e) => setAuthUsername(e.target.value)}
          className="h-10"
          dir="ltr"
        />
      </DlgField>
      <DlgField label={t('adminw.email')}>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} className="h-10" dir="ltr" />
      </DlgField>
    </AdminDialog>
  );
}

/* ------------------------------------------------------------------------ */
/* Machine create/edit dialog — POST /admin/machines · PUT /{no}.           */
/* ------------------------------------------------------------------------ */
function MachineDialog({
  machine,
  onClose,
}: {
  machine: AdminMachine | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const isEdit = !!machine;
  const create = useCreateAdminMachine();
  const update = useUpdateAdminMachine();
  const pending = create.isPending || update.isPending;

  const [machineNo, setMachineNo] = useState(machine ? String(machine.machineNo) : '');
  const [terminal, setTerminal] = useState(machine?.terminal ?? '');
  const [branchNo, setBranchNo] = useState(machine?.defBranch != null ? String(machine.defBranch) : '');
  const [warehouse, setWarehouse] = useState(
    machine?.defWarehouse != null ? String(machine.defWarehouse) : '',
  );
  const [ipAddress, setIpAddress] = useState(machine?.ipAddress ?? '');
  const [priceLevel, setPriceLevel] = useState(
    machine?.priceLevel != null ? String(machine.priceLevel) : '',
  );
  const [useVat, setUseVat] = useState(machine?.useVat ?? false);
  const [currency, setCurrency] = useState(machine?.currency ?? '');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const canSubmit = !pending && (isEdit || (Number(machineNo) || 0) > 0);

  const submit = async () => {
    setError(null);
    if (!canSubmit) {
      setError(t('adminw.validation'));
      return;
    }
    const dto = {
      terminal: terminal.trim() || undefined,
      branchNo: branchNo.trim() ? Number(branchNo) : undefined,
      warehouse: warehouse.trim() ? Number(warehouse) : undefined,
      ipAddress: ipAddress.trim() || undefined,
      priceLevel: priceLevel.trim() ? Number(priceLevel) : undefined,
      useVat,
      currency: currency.trim() || undefined,
    };
    try {
      if (isEdit && machine) {
        await update.mutateAsync({ no: machine.machineNo, dto });
      } else {
        await create.mutateAsync({ machineNo: Number(machineNo), ...dto });
      }
      setDone(true);
    } catch (e) {
      if (e instanceof ApiError) {
        const trace = e.problem.traceId ? ` (traceId: ${e.problem.traceId})` : '';
        setError(`${e.problem.detail || e.problem.title}${trace}`);
      } else {
        setError(t('adminw.saveError'));
      }
    }
  };

  return (
    <AdminDialog
      title={isEdit ? t('adminw.editMachine') : t('adminw.newMachine')}
      done={done}
      doneText={t('adminw.saved')}
      error={error}
      pending={pending}
      canSubmit={canSubmit}
      onSubmit={submit}
      onClose={onClose}
    >
      <DlgField label={t('adminw.machineNo')}>
        <Input
          type="number"
          autoFocus={!isEdit}
          disabled={isEdit}
          value={machineNo}
          onChange={(e) => setMachineNo(e.target.value)}
          className="tnum h-10 text-end"
        />
      </DlgField>
      <DlgField label={t('adminw.terminal')}>
        <Input value={terminal} onChange={(e) => setTerminal(e.target.value)} className="h-10" />
      </DlgField>
      <DlgField label={t('adminw.branchNo')}>
        <Input
          type="number"
          value={branchNo}
          onChange={(e) => setBranchNo(e.target.value)}
          className="tnum h-10 text-end"
        />
      </DlgField>
      <DlgField label={t('adminw.warehouse')}>
        <Input
          type="number"
          value={warehouse}
          onChange={(e) => setWarehouse(e.target.value)}
          className="tnum h-10 text-end"
        />
      </DlgField>
      <DlgField label={t('adminw.ipAddress')}>
        <Input value={ipAddress} onChange={(e) => setIpAddress(e.target.value)} className="h-10" dir="ltr" />
      </DlgField>
      <DlgField label={t('adminw.priceLevel')}>
        <Input
          type="number"
          value={priceLevel}
          onChange={(e) => setPriceLevel(e.target.value)}
          className="tnum h-10 text-end"
        />
      </DlgField>
      <DlgField label={t('adminw.currency')}>
        <Input
          value={currency}
          onChange={(e) => setCurrency(e.target.value.toUpperCase())}
          className="h-10 uppercase"
          dir="ltr"
        />
      </DlgField>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={useVat} onChange={(e) => setUseVat(e.target.checked)} className="size-4" />
        {t('adminw.useVat')}
      </label>
    </AdminDialog>
  );
}

/* ------------------------------------------------------------------------ */
/* POSS002 — role × permission matrix. GET/PUT /admin/permissions.          */
/* ------------------------------------------------------------------------ */
const PERM_ROLES: Role[] = ['cashier', 'supervisor', 'admin'];

function PermissionsMatrix() {
  const { t } = useTranslation();
  const query = useAdminPermissions();
  const save = useUpdateAdminPermissions();

  // Local editable copy of the matrix, keyed `role:permission`.
  const [draft, setDraft] = useState<Map<string, boolean>>(new Map());
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    if (query.data) {
      setDraft(new Map(query.data.map((e) => [`${e.role}:${e.permission}`, e.allowed])));
    }
  }, [query.data]);

  if (query.isLoading) return <LoadingView />;
  if (query.isError) return <ErrorView error={query.error} onRetry={() => query.refetch()} />;
  const rows = query.data ?? [];
  if (rows.length === 0) return <EmptyView />;

  const permissions = [...new Set(rows.map((e) => e.permission))].sort();

  const dirty = rows.some((e) => draft.get(`${e.role}:${e.permission}`) !== e.allowed);

  const toggle = (role: Role, permission: string) =>
    setDraft((d) => {
      const next = new Map(d);
      const key = `${role}:${permission}`;
      next.set(key, !(next.get(key) ?? false));
      return next;
    });

  const onSave = async () => {
    setMsg(null);
    const entries: RolePermission[] = rows
      .filter((e) => draft.get(`${e.role}:${e.permission}`) !== e.allowed)
      .map((e) => ({
        role: e.role,
        permission: e.permission,
        allowed: draft.get(`${e.role}:${e.permission}`) ?? e.allowed,
      }));
    if (entries.length === 0) return;
    try {
      await save.mutateAsync(entries);
      setMsg({ kind: 'ok', text: t('adminw.permsSaved') });
    } catch (e) {
      const detail = e instanceof ApiError ? e.problem.detail || e.problem.title : '';
      setMsg({ kind: 'err', text: `${t('adminw.permsError')}${detail ? ` — ${detail}` : ''}` });
    }
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--color-muted)]">{t('adminw.permsHint')}</p>
        <Button variant="primary" disabled={!dirty || save.isPending} onClick={onSave}>
          <CheckCircle2 className="size-4" />
          {save.isPending ? t('adminw.saving') : t('adminw.permsSave')}
        </Button>
      </div>

      {msg ? (
        <p
          role={msg.kind === 'err' ? 'alert' : 'status'}
          className={`rounded-md p-2 text-center text-xs ${
            msg.kind === 'ok'
              ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
              : 'bg-[var(--color-danger)]/15 text-[var(--color-danger)]'
          }`}
        >
          {msg.text}
        </p>
      ) : null}

      <Card className="min-h-0 flex-1 overflow-auto scroll-thin">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
            <tr>
              <Th>{t('adminw.permission')}</Th>
              {PERM_ROLES.map((r) => (
                <Th key={r} center>
                  {t(`adminw.roles.${r}`)}
                </Th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {permissions.map((p) => (
              <tr key={p} className="hover:bg-[var(--color-surface-2)]">
                <td className="tnum px-3 py-2 font-medium">{p}</td>
                {PERM_ROLES.map((r) => {
                  const key = `${r}:${p}`;
                  const known = draft.has(key);
                  return (
                    <td key={r} className="px-3 py-2 text-center">
                      {known ? (
                        <input
                          type="checkbox"
                          checked={draft.get(key) ?? false}
                          onChange={() => toggle(r, p)}
                          aria-label={`${p} — ${t(`adminw.roles.${r}`)}`}
                          className="size-4 accent-[var(--color-brand-500)]"
                        />
                      ) : (
                        <span className="text-[var(--color-muted)]">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Shared dialog chrome                                                      */
/* ------------------------------------------------------------------------ */
function AdminDialog({
  title,
  done,
  doneText,
  error,
  pending,
  canSubmit,
  onSubmit,
  onClose,
  children,
}: {
  title: string;
  done: boolean;
  doneText: string;
  error: string | null;
  pending: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-bold">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('returns.close')}>
            <X className="size-5" />
          </Button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-4 p-6 text-center">
            <CheckCircle2 className="size-12 text-[var(--color-success)]" aria-hidden />
            <p className="font-bold">{doneText}</p>
            <Button variant="primary" className="w-full" onClick={onClose}>
              {t('returns.close')}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto scroll-thin p-4">
              {children}
              {error ? (
                <p
                  role="alert"
                  className="rounded-md bg-[var(--color-danger)]/15 p-2 text-center text-xs text-[var(--color-danger)]"
                >
                  {error}
                </p>
              ) : null}
            </div>
            <div className="border-t p-4">
              <Button
                size="lg"
                variant="primary"
                className="w-full"
                disabled={!canSubmit}
                onClick={onSubmit}
              >
                {pending ? t('adminw.saving') : t('adminw.save')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DlgField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-[var(--color-muted)]">{label}</span>
      {children}
    </label>
  );
}
