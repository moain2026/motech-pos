import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings2,
  Search,
  Hash,
  Printer,
  Percent,
  Award,
  CreditCard,
  Ticket,
  Users,
  Coins,
  MessageSquare,
  SlidersHorizontal,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Info,
  Lock,
  CalendarClock,
  ListOrdered,
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { ApiError } from '@/shared/lib/api-client';
import { useSession } from '@/features/auth';
import {
  useAllSettings,
  useSaveSetting,
  useDefaults,
  useSaveDefaults,
  type ClassifiedSetting,
  type SettingGroup,
} from '../api/settings.api';
import type { DefaultSetting } from '@/shared/lib/types';
import { useCards } from '../api/cards.api';

/**
 * الإعدادات (POSS001) — full admin settings screen. Renders ALL 179
 * IAS_PARA_POS settings from GET /settings/all in ten group tabs, with a
 * live search across every group, per-type controls (text / number / 0-1
 * toggle / read-only date), instant per-key persistence via
 * PUT /settings/:key, an override badge + revert-to-live action, and
 * toast feedback. Writes are admin-only (RBAC on the route + defensive
 * read-only mode here for any non-admin who reaches the page).
 */

const GROUPS: { key: SettingGroup; icon: typeof Hash }[] = [
  { key: 'numbering', icon: Hash },
  { key: 'printing', icon: Printer },
  { key: 'tax', icon: Percent },
  { key: 'points', icon: Award },
  { key: 'cards', icon: CreditCard },
  { key: 'coupons', icon: Ticket },
  { key: 'customers', icon: Users },
  { key: 'currency', icon: Coins },
  { key: 'messages', icon: MessageSquare },
  { key: 'behavior', icon: SlidersHorizontal },
];

type ToastState = { kind: 'success' | 'error'; text: string } | null;

export function SettingsPage() {
  const q = useAllSettings();

  if (q.isLoading) return <LoadingView />;
  if (q.isError) return <ErrorView error={q.error} onRetry={() => q.refetch()} />;
  if (!q.data) return null;
  return <SettingsView groups={q.data.groups} meta={q.data.meta} />;
}

function SettingsView({
  groups,
  meta,
}: {
  groups: Record<SettingGroup, ClassifiedSetting[]>;
  meta: { total: number; overrideCount: number };
}) {
  const { t } = useTranslation();
  const role = useSession((s) => s.user?.role);
  const canEdit = role === 'admin';

  const [tab, setTab] = useState<SettingGroup | 'defaults'>('numbering');
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState<ToastState>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (kind: 'success' | 'error', text: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ kind, text });
    toastTimer.current = setTimeout(() => setToast(null), kind === 'success' ? 2500 : 5000);
  };
  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const trimmed = query.trim().toLowerCase();
  const searching = trimmed.length > 0;

  /** Search across ALL groups (key + Arabic description). */
  const searchResults = useMemo(() => {
    if (!searching) return [];
    const out: ClassifiedSetting[] = [];
    for (const { key } of GROUPS) {
      for (const s of groups[key] ?? []) {
        if (
          s.key.toLowerCase().includes(trimmed) ||
          (s.description ?? '').toLowerCase().includes(trimmed)
        ) {
          out.push(s);
        }
      }
    }
    return out;
  }, [groups, searching, trimmed]);

  const visible = searching || tab === 'defaults' ? searchResults : (groups[tab] ?? []);

  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Settings2 className="size-6 text-[var(--color-brand-500)]" aria-hidden />
          {t('settings.title')}
          <span className="tnum rounded-full bg-[var(--color-surface-2)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-muted)]">
            {t('settings.totalCount', { count: meta.total })}
          </span>
        </h1>
        {meta.overrideCount > 0 ? (
          <span className="flex items-center gap-1 rounded-full bg-[var(--color-brand-600)]/15 px-3 py-1 text-xs text-[var(--color-brand-500)]">
            <Info className="size-3.5" aria-hidden />
            {t('settings.overrideCount', { count: meta.overrideCount })}
          </span>
        ) : null}
      </div>

      {/* Read-only notice for non-admins (route is admin-only; defensive) */}
      {!canEdit ? (
        <p
          role="note"
          className="flex items-center gap-2 rounded-md bg-[var(--color-warning,#b45309)]/15 p-3 text-sm text-[var(--color-fg)]"
        >
          <Lock className="size-4 shrink-0" aria-hidden />
          {t('settings.readOnlyNotice')}
        </p>
      ) : null}

      {/* Search */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-muted)]"
          aria-hidden
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('settings.searchPlaceholder')}
          aria-label={t('settings.searchPlaceholder')}
          className="ps-9"
        />
      </div>

      {/* Group tabs (hidden while searching — search spans all groups) */}
      {!searching ? (
        <div
          role="tablist"
          aria-label={t('settings.title')}
          className="flex flex-wrap items-center gap-2"
        >
          {GROUPS.map(({ key, icon: Icon }) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={
                'flex items-center gap-2 rounded-[var(--radius)] border px-3 py-2 text-sm font-medium transition-colors ' +
                (tab === key
                  ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-600)] text-white'
                  : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-2)]')
              }
            >
              <Icon className="size-4" aria-hidden />
              {t(`settings.group.${key}`)}
              <span className="tnum text-xs opacity-70">{(groups[key] ?? []).length}</span>
            </button>
          ))}
          {/* POSS005 — numbered system defaults (GET/PUT /settings/defaults) */}
          <button
            role="tab"
            aria-selected={tab === 'defaults'}
            onClick={() => setTab('defaults')}
            className={
              'flex items-center gap-2 rounded-[var(--radius)] border px-3 py-2 text-sm font-medium transition-colors ' +
              (tab === 'defaults'
                ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-600)] text-white'
                : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-2)]')
            }
          >
            <ListOrdered className="size-4" aria-hidden />
            {t('settings.group.defaults')}
          </button>
        </div>
      ) : (
        <p className="text-sm text-[var(--color-muted)]" role="status">
          {t('settings.searchResults', { count: searchResults.length })}
        </p>
      )}

      {/* Settings list */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {!searching && tab === 'defaults' ? (
          <DefaultsTable canEdit={canEdit} onToast={showToast} />
        ) : visible.length === 0 ? (
          <EmptyView label={t('settings.noResults')} />
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {visible.map((s) => (
              <SettingRow
                key={s.key}
                setting={s}
                canEdit={canEdit}
                showGroup={searching}
                onToast={showToast}
              />
            ))}
          </div>
        )}
        {!searching && tab === 'cards' ? <CardTypesTable /> : null}
      </div>

      {/* Toast */}
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className={
            'fixed bottom-6 start-1/2 z-50 flex max-w-[90vw] -translate-x-1/2 items-center gap-2 rounded-lg px-4 py-3 text-sm text-white shadow-lg ' +
            (toast.kind === 'success' ? 'bg-[var(--color-success)]' : 'bg-[var(--color-danger)]')
          }
        >
          {toast.kind === 'success' ? (
            <CheckCircle2 className="size-4 shrink-0" aria-hidden />
          ) : (
            <XCircle className="size-4 shrink-0" aria-hidden />
          )}
          {toast.text}
        </div>
      ) : null}
    </div>
  );
}

//============================================================================
// One setting row — control chosen by Oracle type + value shape
//============================================================================

/** A NUMBER setting whose effective+live values are only 0/1/null is a flag. */
function isToggle(s: ClassifiedSetting): boolean {
  const zeroOne = (v: string | null) => v == null || v === '0' || v === '1';
  return s.type === 'NUMBER' && zeroOne(s.value) && zeroOne(s.liveValue);
}

function SettingRow({
  setting: s,
  canEdit,
  showGroup,
  onToast,
}: {
  setting: ClassifiedSetting;
  canEdit: boolean;
  showGroup: boolean;
  onToast: (kind: 'success' | 'error', text: string) => void;
}) {
  const { t } = useTranslation();
  const save = useSaveSetting();
  const [draft, setDraft] = useState(s.value ?? '');
  const [busy, setBusy] = useState(false);

  // Re-sync the draft when the server value changes (refetch after save).
  useEffect(() => setDraft(s.value ?? ''), [s.value]);

  const persist = async (value: string | null, revert = false) => {
    setBusy(true);
    try {
      await save.mutateAsync({ key: s.key, value });
      onToast(
        'success',
        revert
          ? t('settings.revertedToast', { key: s.key })
          : t('settings.savedToast', { key: s.key }),
      );
    } catch (e) {
      const detail =
        e instanceof ApiError ? e.problem.detail || e.problem.title : t('settings.saveError');
      onToast('error', `${s.key}: ${detail}`);
      setDraft(s.value ?? ''); // roll the control back to the server value
    } finally {
      setBusy(false);
    }
  };

  /** Commit a text/number draft when it actually changed. */
  const commitDraft = () => {
    const next = draft.trim() === '' ? null : draft;
    if ((next ?? '') === (s.value ?? '')) return;
    void persist(next);
  };

  const toggle = isToggle(s);
  const isDate = s.type === 'DATE';
  const disabled = !canEdit || busy;

  return (
    <Card className="flex flex-col gap-2 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <code className="text-xs font-bold text-[var(--color-fg)]" dir="ltr">
              {s.key}
            </code>
            {s.overridden ? (
              <span className="rounded-full bg-[var(--color-brand-600)]/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-brand-500)]">
                {t('settings.overriddenBadge')}
              </span>
            ) : null}
            {showGroup ? (
              <span className="rounded-full bg-[var(--color-surface-2)] px-2 py-0.5 text-[10px] text-[var(--color-muted)]">
                {t(`settings.group.${s.group}`)}
              </span>
            ) : null}
          </div>
          {s.description ? (
            <p className="mt-1 text-xs text-[var(--color-muted)]">{s.description}</p>
          ) : null}
        </div>

        {s.overridden && canEdit ? (
          <button
            type="button"
            onClick={() => void persist(null, true)}
            disabled={busy}
            title={t('settings.revert')}
            className="flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-[11px] text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-2)] disabled:opacity-50"
          >
            <RotateCcw className="size-3" aria-hidden />
            {t('settings.revert')}
          </button>
        ) : null}
      </div>

      {/* Control by type */}
      {toggle ? (
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-[var(--color-muted)]">
            {s.value === '1' ? t('settings.enabled') : t('settings.disabled')}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={s.value === '1'}
            aria-label={s.key}
            disabled={disabled}
            onClick={() => void persist(s.value === '1' ? '0' : '1')}
            className={
              'relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ' +
              (s.value === '1'
                ? 'bg-[var(--color-brand-600)]'
                : 'border bg-[var(--color-surface-2)]')
            }
          >
            <span
              className={
                'absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ' +
                (s.value === '1' ? 'start-0.5' : 'end-0.5')
              }
            />
          </button>
        </div>
      ) : isDate ? (
        <div className="flex h-10 items-center gap-2 rounded-md border bg-[var(--color-surface-2)] px-3 text-xs text-[var(--color-muted)]">
          <CalendarClock className="size-3.5 shrink-0" aria-hidden />
          <span className="tnum truncate" dir="ltr">
            {s.value ? new Date(s.value).toLocaleString('ar') : '—'}
          </span>
        </div>
      ) : (
        <Input
          type={s.type === 'NUMBER' ? 'number' : 'text'}
          inputMode={s.type === 'NUMBER' ? 'decimal' : undefined}
          value={draft}
          disabled={disabled}
          dir="auto"
          className="h-10 text-sm"
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitDraft}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            if (e.key === 'Escape') setDraft(s.value ?? '');
          }}
          placeholder={s.liveValue ?? '—'}
          aria-label={s.key}
        />
      )}

      {/* Live-value hint when an override masks it */}
      {s.overridden && s.liveValue !== s.value ? (
        <p className="text-[10px] text-[var(--color-muted)]">
          {t('settings.liveValue')}: <span className="tnum" dir="ltr">{s.liveValue ?? '—'}</span>
        </p>
      ) : null}
    </Card>
  );
}

//============================================================================
// Payment-card types (GET /cards) — read-only table under the cards tab
//============================================================================

function CardTypesTable() {
  const { t } = useTranslation();
  const q = useCards();
  const cards = q.data ?? [];
  if (q.isLoading || q.isError || cards.length === 0) return null;
  return (
    <Card className="mt-3 p-4">
      <h2 className="mb-3 flex items-center gap-2 font-bold text-[var(--color-fg)]">
        <CreditCard className="size-5 text-[var(--color-brand-500)]" aria-hidden />
        {t('settings.cardsSection')}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-surface-2)] text-[var(--color-muted)]">
            <tr>
              <th className="px-3 py-2 text-start font-semibold">{t('settings.cardName')}</th>
              <th className="px-3 py-2 text-end font-semibold">{t('settings.cardType')}</th>
              <th className="px-3 py-2 text-end font-semibold">{t('settings.cardCommission')}</th>
              <th className="px-3 py-2 text-end font-semibold">{t('settings.cardBank')}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {cards.map((c) => (
              <tr key={c.cardNo} className="hover:bg-[var(--color-surface-2)]">
                <td className="px-3 py-2 font-medium">
                  {c.cardName?.trim() || c.cardEName?.trim() || `#${c.cardNo}`}
                </td>
                <td className="tnum px-3 py-2 text-end text-[var(--color-muted)]">{c.cardType}</td>
                <td className="tnum px-3 py-2 text-end">{c.commissionPct}%</td>
                <td className="tnum px-3 py-2 text-end text-[var(--color-muted)]">
                  {c.bankNo ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

//============================================================================
// POSS005 — numbered system defaults (GET/PUT /settings/defaults)
//============================================================================

function DefaultsTable({
  canEdit,
  onToast,
}: {
  canEdit: boolean;
  onToast: (kind: 'success' | 'error', text: string) => void;
}) {
  const { t } = useTranslation();
  const q = useDefaults();

  if (q.isLoading) return <LoadingView />;
  if (q.isError) return <ErrorView error={q.error} onRetry={() => q.refetch()} />;
  const rows = q.data ?? [];
  if (rows.length === 0) return <EmptyView label={t('settings.defaults.empty')} />;

  return (
    <Card className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-[var(--color-surface-2)] text-[var(--color-muted)]">
          <tr>
            <th className="px-3 py-2 text-start font-semibold">{t('settings.defaults.no')}</th>
            <th className="px-3 py-2 text-start font-semibold">{t('settings.defaults.comment')}</th>
            <th className="px-3 py-2 text-start font-semibold">{t('settings.defaults.value')}</th>
            <th className="px-3 py-2 text-end font-semibold"></th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((d) => (
            <DefaultRow key={d.no} row={d} canEdit={canEdit} onToast={onToast} />
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function DefaultRow({
  row: d,
  canEdit,
  onToast,
}: {
  row: DefaultSetting;
  canEdit: boolean;
  onToast: (kind: 'success' | 'error', text: string) => void;
}) {
  const { t } = useTranslation();
  const save = useSaveDefaults();
  const [draft, setDraft] = useState(d.value ?? '');
  useEffect(() => setDraft(d.value ?? ''), [d.value]);

  const persist = async (value: string | null, revert = false) => {
    try {
      await save.mutateAsync([{ no: d.no, value }]);
      onToast(
        'success',
        revert
          ? t('settings.revertedToast', { key: `#${d.no}` })
          : t('settings.savedToast', { key: `#${d.no}` }),
      );
    } catch (e) {
      const detail =
        e instanceof ApiError ? e.problem.detail || e.problem.title : t('settings.saveError');
      onToast('error', `#${d.no}: ${detail}`);
      setDraft(d.value ?? '');
    }
  };

  const commit = () => {
    const next = draft.trim() === '' ? null : draft;
    if ((next ?? '') === (d.value ?? '')) return;
    void persist(next);
  };

  return (
    <tr className="hover:bg-[var(--color-surface-2)]">
      <td className="tnum px-3 py-2 font-bold">{d.no}</td>
      <td className="px-3 py-2 text-[var(--color-muted)]">
        {d.comment?.trim() || '—'}
        {d.overridden ? (
          <span className="ms-2 rounded-full bg-[var(--color-brand-600)]/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-brand-500)]">
            {t('settings.overriddenBadge')}
          </span>
        ) : null}
      </td>
      <td className="px-3 py-2">
        <Input
          value={draft}
          disabled={!canEdit || save.isPending}
          dir="auto"
          className="h-9 max-w-56 text-sm"
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            if (e.key === 'Escape') setDraft(d.value ?? '');
          }}
          placeholder={d.liveValue ?? '—'}
          aria-label={`${t('settings.defaults.no')} ${d.no}`}
        />
        {d.overridden && d.liveValue !== d.value ? (
          <p className="mt-1 text-[10px] text-[var(--color-muted)]">
            {t('settings.liveValue')}: <span className="tnum" dir="ltr">{d.liveValue ?? '—'}</span>
          </p>
        ) : null}
      </td>
      <td className="px-3 py-2 text-end">
        {d.overridden && canEdit ? (
          <button
            type="button"
            onClick={() => void persist(null, true)}
            disabled={save.isPending}
            title={t('settings.revert')}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-2)] disabled:opacity-50"
          >
            <RotateCcw className="size-3" aria-hidden />
            {t('settings.revert')}
          </button>
        ) : null}
      </td>
    </tr>
  );
}
