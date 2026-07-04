import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Megaphone, Plus, X, CheckCircle2, PowerOff, Power } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { ApiError } from '@/shared/lib/api-client';
import { formatDateTime } from '@/shared/lib/format';
import type { PosAlert } from '@/shared/lib/types';
import { useAllAlerts, useCreateAlert, useUpdateAlert } from '../api/alerts.api';

/**
 * POS_ALRT_SCR admin — supervisors/admins manage the login alerts: list all,
 * create a new alert (title/body + optional show window) and toggle active.
 * Every user sees pending alerts once at login (PendingAlertsBanner) and
 * acknowledges them.
 */
export function AlertsAdminPage() {
  const { t } = useTranslation();
  const [showCreate, setShowCreate] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const list = useAllAlerts();
  const update = useUpdateAlert();
  const rows = list.data ?? [];

  const toggleActive = async (a: PosAlert) => {
    setActionError(null);
    try {
      await update.mutateAsync({ id: a.id, dto: { active: !a.active } });
    } catch (e) {
      setActionError(
        e instanceof ApiError ? e.problem.detail || e.problem.title : t('alerts.updateError'),
      );
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Megaphone className="size-6 text-[var(--color-brand-500)]" aria-hidden />
          {t('alerts.title')}
        </h1>
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          <Plus className="size-4" />
          {t('alerts.new')}
        </Button>
      </div>

      {actionError ? (
        <p role="alert" className="rounded-md bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]">
          {actionError}
        </p>
      ) : null}

      {list.isLoading ? (
        <LoadingView />
      ) : list.isError ? (
        <ErrorView error={list.error} onRetry={() => list.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyView label={t('alerts.empty')} />
      ) : (
        <Card className="min-h-0 flex-1 overflow-auto scroll-thin">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
              <tr>
                <th className="px-3 py-2 text-start font-semibold">{t('alerts.alertTitle')}</th>
                <th className="hidden px-3 py-2 text-start font-semibold md:table-cell">
                  {t('alerts.window')}
                </th>
                <th className="px-3 py-2 text-center font-semibold">{t('alerts.activeL')}</th>
                <th className="hidden px-3 py-2 text-start font-semibold sm:table-cell">
                  {t('alerts.createdAt')}
                </th>
                <th className="px-3 py-2 text-end font-semibold">{t('alerts.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((a) => (
                <tr key={a.id} className="hover:bg-[var(--color-surface-2)]">
                  <td className="px-3 py-2">
                    <p className="font-medium">{a.title}</p>
                    {a.body ? (
                      <p className="max-w-md truncate text-xs text-[var(--color-muted)]">
                        {a.body}
                      </p>
                    ) : null}
                  </td>
                  <td className="tnum hidden px-3 py-2 text-[var(--color-muted)] md:table-cell" dir="ltr">
                    {a.showFrom ?? '…'} → {a.showUntil ?? '…'}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span
                      className={
                        'rounded-full px-2 py-0.5 text-xs font-medium ' +
                        (a.active
                          ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
                          : 'bg-[var(--color-danger)]/15 text-[var(--color-danger)]')
                      }
                    >
                      {a.active ? t('alerts.active') : t('alerts.inactive')}
                    </span>
                  </td>
                  <td className="tnum hidden px-3 py-2 text-[var(--color-muted)] sm:table-cell">
                    {formatDateTime(a.createdAt)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        className="h-8 text-xs"
                        disabled={update.isPending}
                        onClick={() => void toggleActive(a)}
                      >
                        {a.active ? (
                          <>
                            <PowerOff className="size-4" />
                            {t('alerts.deactivate')}
                          </>
                        ) : (
                          <>
                            <Power className="size-4" />
                            {t('alerts.activate')}
                          </>
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {showCreate ? <CreateAlertDialog onClose={() => setShowCreate(false)} /> : null}
    </div>
  );
}

function CreateAlertDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const create = useCreateAlert();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [showFrom, setShowFrom] = useState('');
  const [showUntil, setShowUntil] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const canSubmit = !create.isPending && !!title.trim();

  const submit = async () => {
    setError(null);
    if (!canSubmit) return;
    try {
      await create.mutateAsync({
        title: title.trim(),
        body: body.trim() || undefined,
        showFrom: showFrom || undefined,
        showUntil: showUntil || undefined,
      });
      setDone(true);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.problem.detail || e.problem.title : t('alerts.createError'),
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('alerts.new')}
    >
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="flex items-center gap-2 font-bold">
            <Megaphone className="size-5 text-[var(--color-brand-500)]" aria-hidden />
            {t('alerts.new')}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('alerts.close')}>
            <X className="size-5" />
          </Button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-4 p-6 text-center">
            <CheckCircle2 className="size-12 text-[var(--color-success)]" aria-hidden />
            <p className="font-bold">{t('alerts.created')}</p>
            <Button variant="primary" className="w-full max-w-xs" onClick={onClose}>
              {t('alerts.close')}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 p-4">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-[var(--color-muted)]">
                  {t('alerts.alertTitle')}
                  <span className="text-[var(--color-danger)]"> *</span>
                </span>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-9" maxLength={120} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-[var(--color-muted)]">{t('alerts.body')}</span>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  className="rounded-[var(--radius)] border bg-[var(--color-surface)] p-2 text-sm"
                />
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-[var(--color-muted)]">{t('alerts.showFrom')}</span>
                  <Input
                    type="date"
                    value={showFrom}
                    onChange={(e) => setShowFrom(e.target.value)}
                    className="tnum h-9"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-[var(--color-muted)]">{t('alerts.showUntil')}</span>
                  <Input
                    type="date"
                    value={showUntil}
                    onChange={(e) => setShowUntil(e.target.value)}
                    className="tnum h-9"
                  />
                </label>
              </div>

              {error ? (
                <p role="alert" className="rounded-md bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]">
                  {error}
                </p>
              ) : null}
            </div>

            <div className="flex gap-2 border-t p-4">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                {t('alerts.cancelBtn')}
              </Button>
              <Button variant="primary" className="flex-1" disabled={!canSubmit} onClick={() => void submit()}>
                {create.isPending ? t('alerts.saving') : t('alerts.submit')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
