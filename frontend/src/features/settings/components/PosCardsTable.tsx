import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, Plus, Pencil, X, CheckCircle2 } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { ApiError } from '@/shared/lib/api-client';
import {
  usePosCards,
  useCreatePosCard,
  useUpdatePosCard,
  type PosCard,
  type UpsertPosCard,
} from '../api/pos-cards.api';

/**
 * POSI012 — POS card types CRUD. The ERP master (CREDIT_CARD_TYPES) is SACRED
 * read-only; edits/creates land in the MOTECH_POS overlay (origin ERP|LOCAL|
 * EDIT). Writes are supervisor/admin (RBAC on the API).
 */
export function PosCardsTable({ canEdit }: { canEdit: boolean }) {
  const { t } = useTranslation();
  const q = usePosCards();
  const [editing, setEditing] = useState<PosCard | null>(null);
  const [creating, setCreating] = useState(false);

  if (q.isLoading) return <LoadingView />;
  if (q.isError) return <ErrorView error={q.error} onRetry={() => q.refetch()} />;
  const rows = q.data ?? [];

  return (
    <Card className="mt-3 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-bold text-[var(--color-fg)]">
          <CreditCard className="size-5 text-[var(--color-brand-500)]" aria-hidden />
          {t('posCards.title')}
        </h2>
        {canEdit ? (
          <Button variant="primary" size="sm" onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            {t('posCards.add')}
          </Button>
        ) : null}
      </div>
      <p className="mb-3 text-xs text-[var(--color-muted)]">{t('posCards.subtitle')}</p>

      {rows.length === 0 ? (
        <EmptyView label={t('posCards.empty')} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-2)] text-[var(--color-muted)]">
              <tr>
                <th className="px-3 py-2 text-end font-semibold">{t('posCards.cardNo')}</th>
                <th className="px-3 py-2 text-start font-semibold">{t('posCards.arName')}</th>
                <th className="px-3 py-2 text-end font-semibold">{t('posCards.cardType')}</th>
                <th className="px-3 py-2 text-end font-semibold">{t('posCards.bankNo')}</th>
                <th className="px-3 py-2 text-end font-semibold">{t('posCards.commissionPct')}</th>
                <th className="px-3 py-2 text-center font-semibold">{t('posCards.origin')}</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((c) => (
                <tr key={c.cardNo} className="hover:bg-[var(--color-surface-2)]">
                  <td className="tnum px-3 py-2 text-end">{c.cardNo}</td>
                  <td className="px-3 py-2 font-medium">
                    {c.arName?.trim() || c.enName?.trim() || `#${c.cardNo}`}
                    {c.inactive ? (
                      <span className="ms-2 rounded-full bg-[var(--color-danger)]/15 px-2 py-0.5 text-xs text-[var(--color-danger)]">
                        {t('posCards.inactive')}
                      </span>
                    ) : null}
                  </td>
                  <td className="tnum px-3 py-2 text-end text-[var(--color-muted)]">
                    {c.cardType ?? '—'}
                  </td>
                  <td className="tnum px-3 py-2 text-end text-[var(--color-muted)]">
                    {c.bankNo ?? '—'}
                  </td>
                  <td className="tnum px-3 py-2 text-end">
                    {c.commissionPct != null ? `${c.commissionPct}%` : '—'}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <OriginBadge origin={c.origin} />
                  </td>
                  <td className="px-3 py-2 text-end">
                    {canEdit ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditing(c)}
                        aria-label={t('posCards.edit')}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creating ? <CardDialog onClose={() => setCreating(false)} /> : null}
      {editing ? <CardDialog card={editing} onClose={() => setEditing(null)} /> : null}
    </Card>
  );
}

function OriginBadge({ origin }: { origin: PosCard['origin'] }) {
  const { t } = useTranslation();
  const cls =
    origin === 'ERP'
      ? 'bg-[var(--color-surface-2)] text-[var(--color-muted)]'
      : origin === 'LOCAL'
        ? 'bg-[var(--color-brand-600)]/15 text-[var(--color-brand-500)]'
        : 'bg-[var(--color-warning,#b45309)]/15 text-[var(--color-fg)]';
  return (
    <span className={'rounded-full px-2 py-0.5 text-xs ' + cls}>
      {t(`origin.${origin}`, origin)}
    </span>
  );
}

function CardDialog({ card, onClose }: { card?: PosCard; onClose: () => void }) {
  const { t } = useTranslation();
  const create = useCreatePosCard();
  const update = useUpdatePosCard();
  const [form, setForm] = useState<UpsertPosCard>({
    cardNo: card?.cardNo,
    arName: card?.arName ?? '',
    enName: card?.enName ?? '',
    cardType: card?.cardType ?? null,
    bankNo: card?.bankNo ?? null,
    commissionPct: card?.commissionPct ?? null,
    duePeriod: card?.duePeriod ?? null,
    bankAc: card?.bankAc ?? '',
    inactive: card?.inactive ?? false,
  });
  const [error, setError] = useState<string | null>(null);
  const pending = create.isPending || update.isPending;

  const set = <K extends keyof UpsertPosCard>(k: K, v: UpsertPosCard[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setError(null);
    if (!form.arName.trim()) {
      setError(t('posCards.arName'));
      return;
    }
    try {
      if (card) await update.mutateAsync({ cardNo: card.cardNo, dto: form });
      else await create.mutateAsync(form);
      onClose();
    } catch (e) {
      if (e instanceof ApiError) {
        const trace = e.problem.traceId ? ` (traceId: ${e.problem.traceId})` : '';
        setError(`${e.problem.detail || e.problem.title}${trace}`);
      } else {
        setError(t('posCards.saveError'));
      }
    }
  };

  const numField = (
    label: string,
    key: 'cardType' | 'bankNo' | 'commissionPct' | 'duePeriod',
  ) => (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-[var(--color-muted)]">{label}</span>
      <Input
        type="number"
        value={form[key] == null ? '' : String(form[key])}
        onChange={(e) => set(key, e.target.value === '' ? null : Number(e.target.value))}
        className="tnum text-end"
      />
    </label>
  );

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={card ? t('posCards.edit') : t('posCards.add')}
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-bold">{card ? t('posCards.edit') : t('posCards.add')}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('posCards.cancel')}>
            <X className="size-5" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 overflow-y-auto p-4">
          <label className="col-span-2 flex flex-col gap-1">
            <span className="text-sm text-[var(--color-muted)]">{t('posCards.arName')}</span>
            <Input value={form.arName} onChange={(e) => set('arName', e.target.value)} autoFocus />
          </label>
          <label className="col-span-2 flex flex-col gap-1">
            <span className="text-sm text-[var(--color-muted)]">{t('posCards.enName')}</span>
            <Input value={form.enName ?? ''} onChange={(e) => set('enName', e.target.value)} />
          </label>
          {numField(t('posCards.cardType'), 'cardType')}
          {numField(t('posCards.bankNo'), 'bankNo')}
          {numField(t('posCards.commissionPct'), 'commissionPct')}
          {numField(t('posCards.duePeriod'), 'duePeriod')}
          <label className="col-span-2 flex flex-col gap-1">
            <span className="text-sm text-[var(--color-muted)]">{t('posCards.bankAc')}</span>
            <Input value={form.bankAc ?? ''} onChange={(e) => set('bankAc', e.target.value)} />
          </label>
          <label className="col-span-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.inactive ?? false}
              onChange={(e) => set('inactive', e.target.checked)}
            />
            {t('posCards.inactive')}
          </label>

          {error ? (
            <p
              role="alert"
              className="col-span-2 rounded-md bg-[var(--color-danger)]/15 p-2 text-center text-xs text-[var(--color-danger)]"
            >
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t px-4 py-3">
          <Button variant="ghost" onClick={onClose}>
            {t('posCards.cancel')}
          </Button>
          <Button variant="success" onClick={submit} disabled={pending}>
            <CheckCircle2 className="size-4" />
            {t('posCards.save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
