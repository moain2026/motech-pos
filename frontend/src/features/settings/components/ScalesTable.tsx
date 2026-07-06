import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Scale, Plus, Pencil, Trash2, X, CheckCircle2, ScanBarcode } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { ApiError } from '@/shared/lib/api-client';
import {
  useScales,
  useCreateScale,
  useUpdateScale,
  useDeleteScale,
  decodeScaleBarcode,
  type ScaleDefinition,
  type UpsertScale,
  type DecodedScale,
} from '../api/pos-config.api';

/**
 * POSI005/006 — أنواع الموازين ومفاتيح أصناف الموزنات: define scale barcode
 * schemes (prefix + geometry + divisor + WEIGHT|PRICE mode). The enabled
 * schemes drive the sale-time barcode decode. Writes are admin (SETTINGS).
 */
export function ScalesTable({ canEdit }: { canEdit: boolean }) {
  const { t } = useTranslation();
  const q = useScales();
  const del = useDeleteScale();
  const [editing, setEditing] = useState<ScaleDefinition | null>(null);
  const [creating, setCreating] = useState(false);

  if (q.isLoading) return <LoadingView />;
  if (q.isError) return <ErrorView error={q.error} onRetry={() => q.refetch()} />;
  const rows = q.data ?? [];

  return (
    <Card className="mt-3 p-4">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-bold text-[var(--color-fg)]">
          <Scale className="size-5 text-[var(--color-brand-500)]" aria-hidden />
          {t('scales.title')}
        </h2>
        {canEdit ? (
          <Button variant="primary" size="sm" onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            {t('scales.add')}
          </Button>
        ) : null}
      </div>
      <p className="mb-3 text-xs text-[var(--color-muted)]">{t('scales.subtitle')}</p>

      <DecodePreview />

      {rows.length === 0 ? (
        <EmptyView label={t('scales.empty')} />
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-2)] text-[var(--color-muted)]">
              <tr>
                <th className="px-3 py-2 text-start font-semibold">{t('scales.name')}</th>
                <th className="px-3 py-2 text-center font-semibold">{t('scales.prefix')}</th>
                <th className="px-3 py-2 text-center font-semibold">{t('scales.layout')}</th>
                <th className="px-3 py-2 text-end font-semibold">{t('scales.divisor')}</th>
                <th className="px-3 py-2 text-center font-semibold">{t('scales.mode')}</th>
                <th className="px-3 py-2 text-center font-semibold">{t('scales.enabled')}</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((s) => (
                <tr key={s.id} className="hover:bg-[var(--color-surface-2)]">
                  <td className="px-3 py-2 font-medium">{s.name}</td>
                  <td className="px-3 py-2 text-center font-mono">{s.prefix}</td>
                  <td className="px-3 py-2 text-center font-mono text-xs text-[var(--color-muted)]">
                    L{s.barcodeLength} · I[{s.itemCodeStart}..{s.itemCodeStart + s.itemCodeLen})
                    {' · V'}
                    {s.valueLen ? s.valueLen : '∞'}
                  </td>
                  <td className="tnum px-3 py-2 text-end">{s.divisor}</td>
                  <td className="px-3 py-2 text-center">
                    <span
                      className={
                        'rounded-full px-2 py-0.5 text-xs ' +
                        (s.mode === 'WEIGHT'
                          ? 'bg-[var(--color-info)]/15 text-[var(--color-info)]'
                          : 'bg-[var(--color-brand-600)]/15 text-[var(--color-brand-500)]')
                      }
                    >
                      {s.mode === 'WEIGHT' ? t('scales.weight') : t('scales.price')}
                    </span>
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
                      {s.enabled ? t('scales.on') : t('scales.off')}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-end">
                    {canEdit ? (
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditing(s)}
                          aria-label={t('scales.edit')}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(t('scales.confirmDelete'))) del.mutate(s.id);
                          }}
                          aria-label={t('scales.delete')}
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

      {creating ? <ScaleDialog onClose={() => setCreating(false)} /> : null}
      {editing ? <ScaleDialog scale={editing} onClose={() => setEditing(null)} /> : null}
    </Card>
  );
}

/** Live decode tester — scan/paste a barcode, see how the schemes decode it. */
function DecodePreview() {
  const { t } = useTranslation();
  const [bc, setBc] = useState('');
  const [result, setResult] = useState<DecodedScale | null | 'none'>('none');
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (!bc.trim()) return;
    setBusy(true);
    try {
      const d = await decodeScaleBarcode(bc.trim());
      setResult(d);
    } catch {
      setResult(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-2 flex flex-wrap items-end gap-2 rounded-md border border-dashed p-3">
      <label className="flex min-w-[180px] flex-1 flex-col gap-1">
        <span className="text-xs text-[var(--color-muted)]">{t('scales.testBarcode')}</span>
        <Input
          value={bc}
          onChange={(e) => setBc(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && run()}
          placeholder="020000102500"
          className="font-mono"
          inputMode="numeric"
        />
      </label>
      <Button variant="secondary" size="sm" onClick={run} disabled={busy}>
        <ScanBarcode className="size-4" />
        {t('scales.decode')}
      </Button>
      {result !== 'none' ? (
        result ? (
          <p className="text-xs text-[var(--color-success)]">
            {t('scales.decodedItem')}: <b>{result.itemCode}</b> ·{' '}
            {result.mode === 'WEIGHT'
              ? `${t('scales.qty')}: ${result.quantity}`
              : `${t('scales.priceVal')}: ${result.price}`}{' '}
            · {result.scaleName}
          </p>
        ) : (
          <p className="text-xs text-[var(--color-muted)]">{t('scales.notScale')}</p>
        )
      ) : null}
    </div>
  );
}

function ScaleDialog({ scale, onClose }: { scale?: ScaleDefinition; onClose: () => void }) {
  const { t } = useTranslation();
  const create = useCreateScale();
  const update = useUpdateScale();
  const [form, setForm] = useState<UpsertScale>({
    name: scale?.name ?? '',
    prefix: scale?.prefix ?? '02',
    barcodeLength: scale?.barcodeLength ?? 12,
    itemCodeStart: scale?.itemCodeStart ?? 2,
    itemCodeLen: scale?.itemCodeLen ?? 5,
    valueLen: scale?.valueLen ?? null,
    divisor: scale?.divisor ?? 1000,
    mode: scale?.mode ?? 'WEIGHT',
    enabled: scale?.enabled ?? true,
    sortOrder: scale?.sortOrder ?? 100,
  });
  const [error, setError] = useState<string | null>(null);
  const pending = create.isPending || update.isPending;

  const set = <K extends keyof UpsertScale>(k: K, v: UpsertScale[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setError(null);
    if (!form.name.trim()) {
      setError(t('scales.name'));
      return;
    }
    try {
      if (scale) await update.mutateAsync({ id: scale.id, dto: form });
      else await create.mutateAsync(form);
      onClose();
    } catch (e) {
      if (e instanceof ApiError) {
        const trace = e.problem.traceId ? ` (traceId: ${e.problem.traceId})` : '';
        setError(`${e.problem.detail || e.problem.title}${trace}`);
      } else setError(t('scales.saveError'));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={scale ? t('scales.edit') : t('scales.add')}
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-bold">{scale ? t('scales.edit') : t('scales.add')}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('scales.cancel')}>
            <X className="size-5" />
          </Button>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto p-4">
          <Field label={t('scales.name')}>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} autoFocus />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('scales.prefix')}>
              <Input
                value={form.prefix}
                onChange={(e) => set('prefix', e.target.value)}
                className="font-mono"
                inputMode="numeric"
              />
            </Field>
            <Field label={t('scales.mode')}>
              <select
                value={form.mode}
                onChange={(e) => set('mode', e.target.value as 'WEIGHT' | 'PRICE')}
                className="h-10 rounded-md border bg-[var(--color-surface)] px-2 text-sm"
              >
                <option value="WEIGHT">{t('scales.weight')}</option>
                <option value="PRICE">{t('scales.price')}</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('scales.barcodeLength')}>
              <NumInput value={form.barcodeLength} onChange={(v) => set('barcodeLength', v)} />
            </Field>
            <Field label={t('scales.divisor')}>
              <NumInput value={form.divisor} onChange={(v) => set('divisor', v)} />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label={t('scales.itemStart')}>
              <NumInput value={form.itemCodeStart ?? 2} onChange={(v) => set('itemCodeStart', v)} />
            </Field>
            <Field label={t('scales.itemLen')}>
              <NumInput value={form.itemCodeLen} onChange={(v) => set('itemCodeLen', v)} />
            </Field>
            <Field label={t('scales.valueLen')}>
              <Input
                type="number"
                value={form.valueLen == null ? '' : String(form.valueLen)}
                onChange={(e) =>
                  set('valueLen', e.target.value === '' ? null : Number(e.target.value) || null)
                }
                placeholder="∞"
                className="tnum text-end"
              />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.enabled ?? true}
              onChange={(e) => set('enabled', e.target.checked)}
            />
            {t('scales.enabled')}
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
            {t('scales.cancel')}
          </Button>
          <Button variant="success" onClick={submit} disabled={pending}>
            <CheckCircle2 className="size-4" />
            {t('scales.save')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-[var(--color-muted)]">{label}</span>
      {children}
    </label>
  );
}

function NumInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <Input
      type="number"
      value={String(value)}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className="tnum text-end"
    />
  );
}
