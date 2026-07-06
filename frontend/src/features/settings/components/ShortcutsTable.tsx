import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, Pencil, Trash2, X, CheckCircle2 } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { ApiError } from '@/shared/lib/api-client';
import {
  useShortcuts,
  useUpsertShortcut,
  useDeleteShortcut,
  type Shortcut,
  type UpsertShortcut,
} from '../api/pos-config.api';

/** POS actions that a shortcut may bind to (must match backend whitelist). */
const ACTIONS = [
  'focusSearch',
  'pay',
  'hold',
  'heldList',
  'clearCart',
  'customer',
  'help',
] as const;

/**
 * POSI004 — مفاتيح المساعدة: customizable POS keyboard shortcuts. Each row maps
 * a POS action to a key binding (F-keys / Ctrl+…); enabled shortcuts are picked
 * up by PosPage. Writes are admin (SETTINGS permission on the API).
 */
export function ShortcutsTable({ canEdit }: { canEdit: boolean }) {
  const { t } = useTranslation();
  const q = useShortcuts();
  const del = useDeleteShortcut();
  const [editing, setEditing] = useState<Shortcut | null>(null);

  if (q.isLoading) return <LoadingView />;
  if (q.isError) return <ErrorView error={q.error} onRetry={() => q.refetch()} />;
  const rows = q.data ?? [];

  return (
    <Card className="mt-3 p-4">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-bold text-[var(--color-fg)]">
          <Keyboard className="size-5 text-[var(--color-brand-500)]" aria-hidden />
          {t('shortcuts.title')}
        </h2>
      </div>
      <p className="mb-3 text-xs text-[var(--color-muted)]">{t('shortcuts.subtitle')}</p>

      {rows.length === 0 ? (
        <EmptyView label={t('shortcuts.empty')} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-2)] text-[var(--color-muted)]">
              <tr>
                <th className="px-3 py-2 text-start font-semibold">{t('shortcuts.action')}</th>
                <th className="px-3 py-2 text-start font-semibold">{t('shortcuts.label')}</th>
                <th className="px-3 py-2 text-center font-semibold">{t('shortcuts.key')}</th>
                <th className="px-3 py-2 text-center font-semibold">{t('shortcuts.enabled')}</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((s) => (
                <tr key={s.id} className="hover:bg-[var(--color-surface-2)]">
                  <td className="px-3 py-2 font-mono text-xs">{s.action}</td>
                  <td className="px-3 py-2">{s.arLabel ?? '—'}</td>
                  <td className="px-3 py-2 text-center">
                    <kbd className="rounded border bg-[var(--color-surface-2)] px-2 py-0.5 font-mono text-xs">
                      {s.keyCombo}
                    </kbd>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span
                      className={
                        'rounded-full px-2 py-0.5 text-xs ' +
                        (s.enabled
                          ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
                          : 'bg-[var(--color-surface-2)] text-[var(--color-muted)]')
                      }
                    >
                      {s.enabled ? t('shortcuts.on') : t('shortcuts.off')}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-end">
                    {canEdit ? (
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditing(s)}
                          aria-label={t('shortcuts.edit')}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(t('shortcuts.confirmDelete'))) del.mutate(s.action);
                          }}
                          aria-label={t('shortcuts.delete')}
                        >
                          <Trash2 className="size-4 text-[var(--color-danger)]" />
                        </Button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing ? <ShortcutDialog shortcut={editing} onClose={() => setEditing(null)} /> : null}
    </Card>
  );
}

function ShortcutDialog({ shortcut, onClose }: { shortcut: Shortcut; onClose: () => void }) {
  const { t } = useTranslation();
  const upsert = useUpsertShortcut();
  const [form, setForm] = useState<UpsertShortcut>({
    action: shortcut.action,
    keyCombo: shortcut.keyCombo,
    arLabel: shortcut.arLabel,
    sortOrder: shortcut.sortOrder,
    enabled: shortcut.enabled,
  });
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof UpsertShortcut>(k: K, v: UpsertShortcut[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  /** Capture a key press to fill the combo (F-keys, Ctrl/Alt/Shift + key). */
  const onKeyCapture = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const parts: string[] = [];
    if (e.ctrlKey) parts.push('Ctrl');
    if (e.altKey) parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');
    const k = e.key;
    if (!['Control', 'Alt', 'Shift', 'Meta'].includes(k)) {
      parts.push(k.length === 1 ? k.toUpperCase() : k);
      set('keyCombo', parts.join('+'));
    }
  };

  const submit = async () => {
    setError(null);
    if (!form.keyCombo.trim()) {
      setError(t('shortcuts.key'));
      return;
    }
    try {
      await upsert.mutateAsync(form);
      onClose();
    } catch (e) {
      if (e instanceof ApiError) {
        const trace = e.problem.traceId ? ` (traceId: ${e.problem.traceId})` : '';
        setError(`${e.problem.detail || e.problem.title}${trace}`);
      } else setError(t('shortcuts.saveError'));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('shortcuts.edit')}
    >
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-bold">
            {t('shortcuts.edit')}: <span className="font-mono text-sm">{form.action}</span>
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('shortcuts.cancel')}>
            <X className="size-5" />
          </Button>
        </div>

        <div className="flex flex-col gap-3 p-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-[var(--color-muted)]">{t('shortcuts.label')}</span>
            <Input
              value={form.arLabel ?? ''}
              onChange={(e) => set('arLabel', e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-[var(--color-muted)]">{t('shortcuts.key')}</span>
            <Input
              value={form.keyCombo}
              onKeyDown={onKeyCapture}
              onChange={(e) => set('keyCombo', e.target.value)}
              placeholder={t('shortcuts.keyHint')}
              className="font-mono"
              autoFocus
            />
            <span className="text-xs text-[var(--color-muted)]">{t('shortcuts.keyHint')}</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.enabled ?? true}
              onChange={(e) => set('enabled', e.target.checked)}
            />
            {t('shortcuts.enabled')}
          </label>

          {error ? (
            <p
              role="alert"
              className="rounded-md bg-[var(--color-danger)]/15 p-2 text-center text-xs text-[var(--color-danger)]"
            >
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t px-4 py-3">
          <Button variant="ghost" onClick={onClose}>
            {t('shortcuts.cancel')}
          </Button>
          <Button variant="success" onClick={submit} disabled={upsert.isPending}>
            <CheckCircle2 className="size-4" />
            {t('shortcuts.save')}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Keep ACTIONS referenced for future "add shortcut" (all 7 are seeded).
void ACTIONS;
