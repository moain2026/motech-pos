import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Award, Plus, Pencil, Trash2, X, CheckCircle2 } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { ApiError } from '@/shared/lib/api-client';
import {
  useLoyaltyPrograms,
  useCreateLoyaltyProgram,
  useUpdateLoyaltyProgram,
  useDeleteLoyaltyProgram,
  type LoyaltyProgram,
  type UpsertLoyaltyProgram,
} from '../api/loyalty-programs.api';

/**
 * POSI008 — loyalty programs CRUD. Define the earning rule (calc method +
 * limits + validity window). The ACTIVE program of a point type drives the
 * points engine (earnOnSale). Writes are supervisor/admin (RBAC on the API).
 */
export function LoyaltyProgramsTable({ canEdit }: { canEdit: boolean }) {
  const { t } = useTranslation();
  const q = useLoyaltyPrograms();
  const del = useDeleteLoyaltyProgram();
  const [editing, setEditing] = useState<LoyaltyProgram | null>(null);
  const [creating, setCreating] = useState(false);

  if (q.isLoading) return <LoadingView />;
  if (q.isError) return <ErrorView error={q.error} onRetry={() => q.refetch()} />;
  const rows = q.data ?? [];

  return (
    <Card className="mt-3 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-bold text-[var(--color-fg)]">
          <Award className="size-5 text-[var(--color-brand-500)]" aria-hidden />
          {t('loyaltyPrograms.title')}
        </h2>
        {canEdit ? (
          <Button variant="primary" size="sm" onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            {t('loyaltyPrograms.add')}
          </Button>
        ) : null}
      </div>
      <p className="mb-3 text-xs text-[var(--color-muted)]">{t('loyaltyPrograms.subtitle')}</p>

      {rows.length === 0 ? (
        <EmptyView label={t('loyaltyPrograms.empty')} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-2)] text-[var(--color-muted)]">
              <tr>
                <th className="px-3 py-2 text-start font-semibold">{t('loyaltyPrograms.name')}</th>
                <th className="px-3 py-2 text-start font-semibold">{t('loyaltyPrograms.rule')}</th>
                <th className="px-3 py-2 text-end font-semibold">{t('loyaltyPrograms.minBillAmt')}</th>
                <th className="px-3 py-2 text-end font-semibold">{t('loyaltyPrograms.maxPointsPerBill')}</th>
                <th className="px-3 py-2 text-start font-semibold">{t('loyaltyPrograms.validity')}</th>
                <th className="px-3 py-2 text-center font-semibold">{t('loyaltyPrograms.active')}</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((p) => (
                <tr key={p.id} className="hover:bg-[var(--color-surface-2)]">
                  <td className="px-3 py-2 font-medium">{p.name}</td>
                  <td className="px-3 py-2 text-[var(--color-muted)]">
                    {p.calcType === 1
                      ? `1 / ${p.amt4Point}`
                      : `${p.pointCnt} × / ${p.amt4Point}`}
                  </td>
                  <td className="tnum px-3 py-2 text-end">
                    {p.minBillAmt > 0 ? p.minBillAmt : t('loyaltyPrograms.noLimit')}
                  </td>
                  <td className="tnum px-3 py-2 text-end">
                    {p.maxPointsPerBill > 0 ? p.maxPointsPerBill : t('loyaltyPrograms.noLimit')}
                  </td>
                  <td className="tnum px-3 py-2 text-[var(--color-muted)]">
                    {p.startDate ?? '—'} … {p.endDate ?? '—'}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span
                      className={
                        'rounded-full px-2 py-0.5 text-xs ' +
                        (p.active
                          ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
                          : 'bg-[var(--color-surface-2)] text-[var(--color-muted)]')
                      }
                    >
                      {p.active ? t('loyaltyPrograms.active') : '—'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-end">
                    {canEdit ? (
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditing(p)}
                          aria-label={t('loyaltyPrograms.edit')}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(t('loyaltyPrograms.confirmDelete'))) del.mutate(p.id);
                          }}
                          aria-label={t('loyaltyPrograms.delete')}
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

      {creating ? (
        <ProgramDialog onClose={() => setCreating(false)} />
      ) : null}
      {editing ? (
        <ProgramDialog program={editing} onClose={() => setEditing(null)} />
      ) : null}
    </Card>
  );
}

function ProgramDialog({
  program,
  onClose,
}: {
  program?: LoyaltyProgram;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const create = useCreateLoyaltyProgram();
  const update = useUpdateLoyaltyProgram();
  const [form, setForm] = useState<UpsertLoyaltyProgram>({
    name: program?.name ?? '',
    pointTypNo: program?.pointTypNo ?? 1,
    calcType: program?.calcType ?? 1,
    amt4Point: program?.amt4Point ?? 100,
    pointCnt: program?.pointCnt ?? 1,
    truncate: program?.truncate ?? true,
    pointValue: program?.pointValue ?? 1,
    minBillAmt: program?.minBillAmt ?? 0,
    maxPointsPerBill: program?.maxPointsPerBill ?? 0,
    startDate: program?.startDate ?? null,
    endDate: program?.endDate ?? null,
    active: program?.active ?? true,
  });
  const [error, setError] = useState<string | null>(null);
  const pending = create.isPending || update.isPending;

  const set = <K extends keyof UpsertLoyaltyProgram>(k: K, v: UpsertLoyaltyProgram[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setError(null);
    if (!form.name.trim()) {
      setError(t('loyaltyPrograms.name'));
      return;
    }
    try {
      if (program) await update.mutateAsync({ id: program.id, dto: form });
      else await create.mutateAsync(form);
      onClose();
    } catch (e) {
      if (e instanceof ApiError) {
        const trace = e.problem.traceId ? ` (traceId: ${e.problem.traceId})` : '';
        setError(`${e.problem.detail || e.problem.title}${trace}`);
      } else {
        setError(t('loyaltyPrograms.saveError'));
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={program ? t('loyaltyPrograms.edit') : t('loyaltyPrograms.add')}
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-bold">
            {program ? t('loyaltyPrograms.edit') : t('loyaltyPrograms.add')}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('loyaltyPrograms.cancel')}>
            <X className="size-5" />
          </Button>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto p-4">
          <Field label={t('loyaltyPrograms.name')}>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} autoFocus />
          </Field>
          <Field label={t('loyaltyPrograms.calcType')}>
            <select
              value={form.calcType}
              onChange={(e) => set('calcType', Number(e.target.value) as 1 | 2)}
              className="h-10 rounded-md border bg-[var(--color-surface)] px-2 text-sm"
            >
              <option value={1}>{t('loyaltyPrograms.calc1')}</option>
              <option value={2}>{t('loyaltyPrograms.calc2')}</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('loyaltyPrograms.amt4Point')}>
              <NumInput value={form.amt4Point} onChange={(v) => set('amt4Point', v)} />
            </Field>
            {form.calcType === 2 ? (
              <Field label={t('loyaltyPrograms.pointCnt')}>
                <NumInput value={form.pointCnt ?? 1} onChange={(v) => set('pointCnt', v)} />
              </Field>
            ) : (
              <Field label={t('loyaltyPrograms.pointValue')}>
                <NumInput value={form.pointValue ?? 1} onChange={(v) => set('pointValue', v)} />
              </Field>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('loyaltyPrograms.minBillAmt')}>
              <NumInput value={form.minBillAmt ?? 0} onChange={(v) => set('minBillAmt', v)} />
            </Field>
            <Field label={t('loyaltyPrograms.maxPointsPerBill')}>
              <NumInput
                value={form.maxPointsPerBill ?? 0}
                onChange={(v) => set('maxPointsPerBill', v)}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('loyaltyPrograms.startDate')}>
              <Input
                type="date"
                value={form.startDate ?? ''}
                onChange={(e) => set('startDate', e.target.value || null)}
              />
            </Field>
            <Field label={t('loyaltyPrograms.endDate')}>
              <Input
                type="date"
                value={form.endDate ?? ''}
                onChange={(e) => set('endDate', e.target.value || null)}
              />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.truncate ?? true}
              onChange={(e) => set('truncate', e.target.checked)}
            />
            {t('loyaltyPrograms.truncate')}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active ?? true}
              onChange={(e) => set('active', e.target.checked)}
            />
            {t('loyaltyPrograms.active')}
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
            {t('loyaltyPrograms.cancel')}
          </Button>
          <Button variant="success" onClick={submit} disabled={pending}>
            <CheckCircle2 className="size-4" />
            {t('loyaltyPrograms.save')}
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
