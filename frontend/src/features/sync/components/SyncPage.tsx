import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RefreshCw,
  Play,
  Clock,
  CheckCircle2,
  XCircle,
  ListChecks,
  AlertTriangle,
  Download,
  PackageSearch,
  Boxes,
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { formatDateTime, formatNumber } from '@/shared/lib/format';
import { ApiError } from '@/shared/lib/api-client';
import type { SyncEntryStatus } from '@/shared/lib/types';
import { useCan } from '@/features/auth';
import {
  useSyncStatus,
  useSyncQueue,
  useRunSync,
  useCatalogSyncStatus,
  useCatalogSyncRuns,
  useRunCatalogPull,
} from '../api/sync.api';

const STATUS_FILTERS: (SyncEntryStatus | 'all')[] = ['all', 'pending', 'failed', 'synced'];

/**
 * حالة المزامنة (Sync) — queue counters, entry list (filterable), and a manual
 * run trigger (enforces the e-invoice guard on the backend).
 * GET /sync/status · /sync/queue · POST /sync/run. admin/supervisor (RBAC).
 */
export function SyncPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<SyncEntryStatus | 'all'>('all');
  const [runMsg, setRunMsg] = useState<string | null>(null);
  const [runErr, setRunErr] = useState<string | null>(null);

  const status = useSyncStatus();
  const queue = useSyncQueue(filter === 'all' ? undefined : filter);
  const run = useRunSync();

  const doRun = async () => {
    setRunMsg(null);
    setRunErr(null);
    try {
      const r = await run.mutateAsync();
      setRunMsg(t('sync.runDone', { processed: r.processed, synced: r.synced, blocked: r.blocked }));
    } catch (e) {
      if (e instanceof ApiError) {
        const trace = e.problem.traceId ? ` (traceId: ${e.problem.traceId})` : '';
        setRunErr(`${e.problem.detail || e.problem.title}${trace}`);
      } else {
        setRunErr(t('sync.runError'));
      }
    }
  };

  const s = status.data;
  const rows = queue.data ?? [];

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <RefreshCw className="size-6 text-[var(--color-brand-500)]" aria-hidden />
          {t('sync.title')}
        </h1>
        <Button variant="primary" onClick={doRun} disabled={run.isPending}>
          <Play className="size-4" />
          {run.isPending ? t('sync.running') : t('sync.run')}
        </Button>
      </div>

      {/* Downward catalog sync (POST008 المزامنة النزولية) */}
      <CatalogSyncSection />

      {/* KPIs */}
      {status.isLoading ? (
        <LoadingView />
      ) : status.isError ? (
        <ErrorView error={status.error} onRetry={() => status.refetch()} />
      ) : s ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Kpi icon={<Clock className="size-5" />} label={t('sync.pending')} value={s.pending} tone="warning" />
          <Kpi icon={<CheckCircle2 className="size-5" />} label={t('sync.synced')} value={s.synced} tone="success" />
          <Kpi icon={<XCircle className="size-5" />} label={t('sync.failed')} value={s.failed} tone="danger" />
          <Kpi icon={<ListChecks className="size-5" />} label={t('sync.total')} value={s.total} />
        </div>
      ) : null}

      {runMsg ? (
        <p role="status" className="rounded-md bg-[var(--color-success)]/15 p-2 text-center text-sm text-[var(--color-success)]">
          {runMsg}
        </p>
      ) : null}
      {runErr ? (
        <p role="alert" className="flex items-center justify-center gap-2 rounded-md bg-[var(--color-danger)]/15 p-2 text-center text-sm text-[var(--color-danger)]">
          <AlertTriangle className="size-4" aria-hidden />
          {runErr}
        </p>
      ) : null}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={
              'rounded-[var(--radius)] border px-3 py-1.5 text-sm font-medium transition-colors ' +
              (filter === f
                ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-600)] text-white'
                : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-2)]')
            }
          >
            {t(`sync.filter.${f}`)}
          </button>
        ))}
      </div>

      {/* Queue */}
      <Card className="min-h-0 flex-1 overflow-auto scroll-thin">
        {queue.isLoading ? (
          <LoadingView />
        ) : queue.isError ? (
          <ErrorView error={queue.error} onRetry={() => queue.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyView />
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
              <tr>
                <th className="px-3 py-2 text-start font-semibold">{t('sync.billNo')}</th>
                <th className="px-3 py-2 text-center font-semibold">{t('sync.status')}</th>
                <th className="px-3 py-2 text-end font-semibold">{t('sync.retries')}</th>
                <th className="px-3 py-2 text-start font-semibold">{t('sync.enqueuedAt')}</th>
                <th className="px-3 py-2 text-start font-semibold">{t('sync.lastError')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((e) => (
                <tr key={e.id} className="hover:bg-[var(--color-surface-2)]">
                  <td className="tnum px-3 py-2 font-medium">{e.billNo}</td>
                  <td className="px-3 py-2 text-center"><StatusBadge status={e.status} label={t(`sync.st.${e.status}`)} /></td>
                  <td className="tnum px-3 py-2 text-end text-[var(--color-muted)]">
                    {formatNumber(e.rtryCnt)}/{formatNumber(e.allwdRtryCnt)}
                  </td>
                  <td className="tnum px-3 py-2 text-[var(--color-muted)]">
                    {formatDateTime(e.enqueuedAt)}
                  </td>
                  <td className="px-3 py-2 text-xs text-[var(--color-danger)]">{e.lastError ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

/** Downward catalog-sync panel: cache status + manual pull + last run. */
function CatalogSyncSection() {
  const { t } = useTranslation();
  const status = useCatalogSyncStatus();
  const runs = useCatalogSyncRuns();
  const pull = useRunCatalogPull();
  const canPull = useCan('EINVOICE');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const doPull = async () => {
    setMsg(null);
    setErr(null);
    try {
      const r = await pull.mutateAsync();
      setMsg(
        r.skipped
          ? t('sync.dn.skipped')
          : t('sync.dn.done', {
              upserted: r.upserted,
              staled: r.staled,
              ms: r.durationMs,
            }),
      );
    } catch (e) {
      if (e instanceof ApiError) {
        const trace = e.problem.traceId ? ` (traceId: ${e.problem.traceId})` : '';
        setErr(`${e.problem.detail || e.problem.title}${trace}`);
      } else {
        setErr(t('sync.dn.error'));
      }
    }
  };

  const st = status.data;
  const lastRun = st?.lastRun ?? runs.data?.[0] ?? null;

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <Download className="size-5 text-[var(--color-brand-500)]" aria-hidden />
          {t('sync.dn.title')}
        </h2>
        <Button
          variant="outline"
          onClick={doPull}
          disabled={pull.isPending || !canPull}
          title={!canPull ? t('sync.dn.noPerm') : undefined}
        >
          <RefreshCw className={'size-4' + (pull.isPending ? ' animate-spin' : '')} />
          {pull.isPending ? t('sync.dn.pulling') : t('sync.dn.pull')}
        </Button>
      </div>

      {status.isLoading ? (
        <LoadingView />
      ) : status.isError ? (
        <ErrorView error={status.error} onRetry={() => status.refetch()} />
      ) : st ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Kpi icon={<Boxes className="size-5" />} label={t('sync.dn.total')} value={st.total} />
          <Kpi icon={<CheckCircle2 className="size-5" />} label={t('sync.dn.active')} value={st.active} tone="success" />
          <Kpi icon={<PackageSearch className="size-5" />} label={t('sync.dn.stale')} value={st.stale} tone="warning" />
          <Card className="flex flex-col justify-center p-3">
            <p className="text-xs text-[var(--color-muted)]">{t('sync.dn.lastSync')}</p>
            <p className="tnum text-sm font-semibold">
              {st.lastSyncedAt ? formatDateTime(st.lastSyncedAt) : '—'}
            </p>
          </Card>
        </div>
      ) : null}

      {msg ? (
        <p role="status" className="rounded-md bg-[var(--color-success)]/15 p-2 text-center text-sm text-[var(--color-success)]">
          {msg}
        </p>
      ) : null}
      {err ? (
        <p role="alert" className="flex items-center justify-center gap-2 rounded-md bg-[var(--color-danger)]/15 p-2 text-center text-sm text-[var(--color-danger)]">
          <AlertTriangle className="size-4" aria-hidden />
          {err}
        </p>
      ) : null}

      {lastRun ? (
        <p className="text-xs text-[var(--color-muted)]">
          {t('sync.dn.lastRun', {
            trigger: t(`sync.dn.trig.${lastRun.triggeredBy}`),
            status: t(`sync.dn.rst.${lastRun.status}`),
            upserted: lastRun.upserted,
            staled: lastRun.staled,
          })}
          {lastRun.error ? ` — ${lastRun.error}` : ''}
        </p>
      ) : null}
    </Card>
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
  value: number;
  tone?: 'success' | 'warning' | 'danger';
}) {
  const color =
    tone === 'success'
      ? 'text-[var(--color-success)]'
      : tone === 'warning'
        ? 'text-[var(--color-warning)]'
        : tone === 'danger'
          ? 'text-[var(--color-danger)]'
          : 'text-[var(--color-brand-500)]';
  return (
    <Card className="flex items-center gap-3 p-4">
      <div className={`grid size-11 place-items-center rounded-xl bg-[var(--color-surface-2)] ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-[var(--color-muted)]">{label}</p>
        <p className={`tnum text-xl font-extrabold ${color}`}>{formatNumber(value)}</p>
      </div>
    </Card>
  );
}

function StatusBadge({ status, label }: { status: SyncEntryStatus; label: string }) {
  const cls =
    status === 'synced'
      ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
      : status === 'failed'
        ? 'bg-[var(--color-danger)]/15 text-[var(--color-danger)]'
        : 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
}
