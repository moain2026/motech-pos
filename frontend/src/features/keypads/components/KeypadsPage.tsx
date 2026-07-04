import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grid3x3,
  Plus,
  X,
  Pencil,
  Trash2,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { ApiError } from '@/shared/lib/api-client';
import { formatMoney, formatNumber } from '@/shared/lib/format';
import { useSession } from '@/features/auth';
import { useItemSearch } from '@/features/pos-terminal/api/items.api';
import type { KeypadKeyRow, KeypadRow } from '@/shared/lib/types';
import {
  useAddKeypadKey,
  useCreateKeypad,
  useKeypad,
  useKeypads,
  useRemoveKeypadKey,
  useUpdateKeypad,
} from '../api/keypads.api';

/** Preset key colors (hex) for the cashier grid. */
const KEY_COLORS = ['#4caf50', '#2196f3', '#ff9800', '#e91e63', '#9c27b0', '#607d8b'];

function errText(e: unknown, fallback: string): string {
  return e instanceof ApiError ? e.problem.detail || e.problem.title : fallback;
}

/**
 * لوحات المفاتيح (POSI002/POSI003) — touch keypads for barcode-less items:
 * keypad list + create/edit, and a per-keypad button grid (grouped keys with
 * colors and resolved item names/prices) with add-from-item-search and
 * remove-key actions. Reads all roles; mutations supervisor/admin.
 * GET/POST/PUT /keypads · POST/DELETE /keypads/{no}/keys.
 */
export function KeypadsPage() {
  const { t } = useTranslation();
  const role = useSession((s) => s.user?.role);
  const canEdit = role === 'supervisor' || role === 'admin';

  const keypads = useKeypads();
  const [selected, setSelected] = useState<number | null>(null);
  const [editPad, setEditPad] = useState<KeypadRow | 'new' | null>(null);

  const rows = keypads.data ?? [];

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Grid3x3 className="size-6 text-[var(--color-brand-500)]" aria-hidden />
          {t('keypads.title')}
        </h1>
        {canEdit ? (
          <Button variant="primary" onClick={() => setEditPad('new')}>
            <Plus className="size-4" />
            {t('keypads.new')}
          </Button>
        ) : null}
      </div>

      {keypads.isLoading ? (
        <LoadingView />
      ) : keypads.isError ? (
        <ErrorView error={keypads.error} onRetry={() => keypads.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyView label={t('keypads.empty')} />
      ) : (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label={t('keypads.title')}>
          {rows.map((p) => (
            <button
              key={p.id}
              role="tab"
              aria-selected={selected === p.keypadNo}
              onClick={() => setSelected(p.keypadNo)}
              className={
                'flex items-center gap-2 rounded-[var(--radius)] border px-4 py-2 text-sm font-medium transition-colors ' +
                (selected === p.keypadNo
                  ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-600)] text-white'
                  : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-2)]') +
                (p.inactive ? ' opacity-50' : '')
              }
            >
              {p.arName?.trim() || p.enName?.trim() || `#${p.keypadNo}`}
              <span className="tnum rounded-full bg-black/15 px-2 text-xs">
                {formatNumber(p.keyCount)}
              </span>
              {canEdit ? (
                <Pencil
                  className="size-3.5 opacity-70 hover:opacity-100"
                  aria-label={t('keypads.edit')}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditPad(p);
                  }}
                />
              ) : null}
            </button>
          ))}
        </div>
      )}

      {selected != null ? (
        <KeypadDetail no={selected} canEdit={canEdit} />
      ) : rows.length > 0 ? (
        <p className="text-sm text-[var(--color-muted)]">{t('keypads.pickHint')}</p>
      ) : null}

      {editPad ? (
        <KeypadDialog
          pad={editPad === 'new' ? null : editPad}
          onClose={() => setEditPad(null)}
          onCreated={(no) => {
            setEditPad(null);
            setSelected(no);
          }}
        />
      ) : null}
    </div>
  );
}

/* ---------- keypad detail: grouped button grid + add/remove keys ---------- */

function KeypadDetail({ no, canEdit }: { no: number; canEdit: boolean }) {
  const { t } = useTranslation();
  const detail = useKeypad(no);
  const removeKey = useRemoveKeypadKey();
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const keys = detail.data?.keys ?? [];

  /** Group keys by grpNo (POSI003 groups, e.g. خضروات/فواكه). */
  const groups = useMemo(() => {
    const map = new Map<number, { name: string | null; keys: KeypadKeyRow[] }>();
    for (const k of keys) {
      const g = map.get(k.grpNo) ?? { name: k.grpName, keys: [] };
      if (!g.name && k.grpName) g.name = k.grpName;
      g.keys.push(k);
      map.set(k.grpNo, g);
    }
    for (const g of map.values()) {
      g.keys.sort((a, b) => (a.posNo ?? 0) - (b.posNo ?? 0));
    }
    return [...map.entries()].sort(([a], [b]) => a - b);
  }, [keys]);

  const remove = async (keyId: string) => {
    setError(null);
    try {
      await removeKey.mutateAsync({ no, keyId });
    } catch (e) {
      setError(errText(e, t('keypads.removeError')));
    }
  };

  if (detail.isLoading) return <LoadingView />;
  if (detail.isError)
    return <ErrorView error={detail.error} onRetry={() => detail.refetch()} />;

  return (
    <Card className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto scroll-thin p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-bold">
          {detail.data?.arName?.trim() || detail.data?.enName?.trim() || `#${no}`}
          <span className="tnum ms-2 text-xs text-[var(--color-muted)]">
            {t('keypads.keyCount', { count: keys.length })}
          </span>
        </h2>
        {canEdit ? (
          <Button variant="outline" className="h-9" onClick={() => setShowAdd(true)}>
            <Plus className="size-4" />
            {t('keypads.addKey')}
          </Button>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}

      {keys.length === 0 ? (
        <EmptyView label={t('keypads.noKeys')} />
      ) : (
        groups.map(([grpNo, g]) => (
          <section key={grpNo} aria-label={g.name ?? `${t('keypads.group')} ${grpNo}`}>
            {groups.length > 1 || g.name ? (
              <h3 className="mb-2 text-sm font-semibold text-[var(--color-muted)]">
                {g.name?.trim() || `${t('keypads.group')} ${grpNo}`}
              </h3>
            ) : null}
            {/* Cashier-style touch grid */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {g.keys.map((k) => (
                <div
                  key={k.id}
                  className="relative flex min-h-20 flex-col justify-between rounded-[var(--radius)] border p-2 text-white shadow-sm"
                  style={{ backgroundColor: k.color ?? '#607d8b' }}
                >
                  <p className="line-clamp-2 text-sm font-bold leading-tight">
                    {k.label?.trim() || k.itemName?.trim() || k.itemCode}
                  </p>
                  <div className="flex items-end justify-between gap-1">
                    <span className="tnum text-xs opacity-90">
                      {k.price != null ? formatMoney(k.price) : '—'}
                    </span>
                    {canEdit ? (
                      <button
                        onClick={() => void remove(k.id)}
                        disabled={removeKey.isPending}
                        aria-label={t('keypads.removeKey')}
                        title={t('keypads.removeKey')}
                        className="rounded bg-black/25 p-1 hover:bg-black/40 disabled:opacity-50"
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}

      {showAdd ? <AddKeyDialog no={no} onClose={() => setShowAdd(false)} /> : null}
    </Card>
  );
}

/* ---------- create / edit keypad ---------- */

function KeypadDialog({
  pad,
  onClose,
  onCreated,
}: {
  pad: KeypadRow | null;
  onClose: () => void;
  onCreated: (no: number) => void;
}) {
  const { t } = useTranslation();
  const create = useCreateKeypad();
  const update = useUpdateKeypad();
  const [arName, setArName] = useState(pad?.arName ?? '');
  const [enName, setEnName] = useState(pad?.enName ?? '');
  const [inactive, setInactive] = useState(pad?.inactive ?? false);
  const [error, setError] = useState<string | null>(null);

  const busy = create.isPending || update.isPending;

  const submit = async () => {
    setError(null);
    try {
      if (pad) {
        await update.mutateAsync({
          no: pad.keypadNo,
          dto: { arName: arName.trim() || undefined, enName: enName.trim() || undefined, inactive },
        });
        onClose();
      } else {
        const res = await create.mutateAsync({
          arName: arName.trim() || undefined,
          enName: enName.trim() || undefined,
          inactive,
        });
        onCreated(res.keypadNo);
      }
    } catch (e) {
      setError(errText(e, t('keypads.saveError')));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={pad ? t('keypads.edit') : t('keypads.new')}
    >
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-bold">{pad ? t('keypads.edit') : t('keypads.new')}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('keypads.close')}>
            <X className="size-5" />
          </Button>
        </div>
        <div className="flex flex-col gap-3 p-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--color-muted)]">{t('keypads.arName')}</span>
            <Input value={arName} onChange={(e) => setArName(e.target.value)} maxLength={100} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--color-muted)]">{t('keypads.enName')}</span>
            <Input value={enName} onChange={(e) => setEnName(e.target.value)} maxLength={100} dir="ltr" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={inactive}
              onChange={(e) => setInactive(e.target.checked)}
              className="size-4"
            />
            {t('keypads.inactive')}
          </label>
          {error ? (
            <p role="alert" className="text-sm text-[var(--color-danger)]">
              {error}
            </p>
          ) : null}
          <Button variant="primary" disabled={busy} onClick={() => void submit()}>
            <CheckCircle2 className="size-4" />
            {busy ? t('status.loading') : t('keypads.save')}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- add key: live item search → link to the pad ---------- */

function AddKeyDialog({ no, onClose }: { no: number; onClose: () => void }) {
  const { t } = useTranslation();
  const addKey = useAddKeypadKey();
  const [search, setSearch] = useState('');
  const [picked, setPicked] = useState<{ code: string; name: string | null } | null>(null);
  const [label, setLabel] = useState('');
  const [grpName, setGrpName] = useState('');
  const [color, setColor] = useState(KEY_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  const items = useItemSearch(search);
  const results = (items.data?.pages.flatMap((p) => p.data) ?? []).slice(0, 12);

  const submit = async () => {
    setError(null);
    if (!picked) return;
    try {
      await addKey.mutateAsync({
        no,
        dto: {
          itemCode: picked.code,
          label: label.trim() || undefined,
          grpName: grpName.trim() || undefined,
          color,
        },
      });
      onClose();
    } catch (e) {
      setError(errText(e, t('keypads.addKeyError')));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('keypads.addKey')}
    >
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-bold">{t('keypads.addKey')}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('keypads.close')}>
            <X className="size-5" />
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto scroll-thin p-4">
          {picked ? (
            <div className="flex items-center justify-between rounded-md border bg-[var(--color-surface-2)] px-3 py-2 text-sm">
              <span className="font-medium">
                {picked.name?.trim() || picked.code}
                <span className="tnum ms-2 text-xs text-[var(--color-muted)]" dir="ltr">
                  {picked.code}
                </span>
              </span>
              <Button variant="ghost" size="icon" onClick={() => setPicked(null)} aria-label={t('keypads.changeItem')}>
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute inset-y-0 end-3 my-auto size-4 text-[var(--color-muted)]"
                  aria-hidden
                />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('keypads.searchItem')}
                  className="h-10 pe-9"
                  aria-label={t('keypads.searchItem')}
                />
              </div>
              <div className="max-h-56 overflow-y-auto rounded-md border">
                {items.isLoading ? (
                  <LoadingView />
                ) : results.length === 0 ? (
                  <EmptyView label={t('keypads.noResults')} />
                ) : (
                  <ul className="divide-y text-sm">
                    {results.map((it) => (
                      <li key={it.code}>
                        <button
                          className="flex w-full items-center justify-between px-3 py-2 text-start hover:bg-[var(--color-surface-2)]"
                          onClick={() => setPicked({ code: it.code, name: it.name })}
                        >
                          <span className="min-w-0 truncate font-medium">
                            {it.name?.trim() || it.code}
                          </span>
                          <span className="tnum ms-2 shrink-0 text-xs text-[var(--color-muted)]" dir="ltr">
                            {it.code}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}

          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--color-muted)]">{t('keypads.keyLabel')}</span>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={100}
              placeholder={picked?.name?.trim() || t('keypads.keyLabelPlaceholder')}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--color-muted)]">{t('keypads.groupName')}</span>
            <Input
              value={grpName}
              onChange={(e) => setGrpName(e.target.value)}
              maxLength={100}
              placeholder={t('keypads.groupPlaceholder')}
            />
          </label>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-[var(--color-muted)]">{t('keypads.keyColor')}</span>
            <div className="flex gap-2">
              {KEY_COLORS.map((c) => (
                <button
                  key={c}
                  aria-label={c}
                  aria-pressed={color === c}
                  onClick={() => setColor(c)}
                  className={
                    'size-8 rounded-full border-2 transition-transform ' +
                    (color === c ? 'scale-110 border-[var(--color-fg)]' : 'border-transparent')
                  }
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {error ? (
            <p role="alert" className="text-sm text-[var(--color-danger)]">
              {error}
            </p>
          ) : null}

          <Button
            variant="primary"
            disabled={!picked || addKey.isPending}
            onClick={() => void submit()}
          >
            <CheckCircle2 className="size-4" />
            {addKey.isPending ? t('status.loading') : t('keypads.linkKey')}
          </Button>
        </div>
      </div>
    </div>
  );
}
