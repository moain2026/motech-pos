import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, CheckCircle2, Package } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { OriginBadge } from '@/shared/ui/OriginBadge';
import { ApiError } from '@/shared/lib/api-client';
import type { Item } from '@/shared/lib/types';
import { useCreateItem, useUpdateItem } from '@/features/pos-terminal/api/items.api';

/**
 * Create / edit an item. In create mode the code is required and editable; in
 * edit mode the code is locked (PUT keys by code). Editing an ERP item creates
 * a local EDIT override (price/name/unit) — surfaced via the origin badge.
 * POST/PUT /items · supervisor/admin (RBAC on route + nav).
 */
export function ItemDialog({
  item,
  onClose,
}: {
  /** null → create a new LOCAL item; otherwise edit this one. */
  item: Item | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const isEdit = !!item;
  const create = useCreateItem();
  const update = useUpdateItem();
  const pending = create.isPending || update.isPending;

  const [code, setCode] = useState(item?.code ?? '');
  const [name, setName] = useState(item?.name ?? '');
  const [barcode, setBarcode] = useState(item?.barcode ?? '');
  const [unit, setUnit] = useState(item?.unit ?? '');
  const [price, setPrice] = useState(item ? String(item.lastPrice) : '');
  const [inactive, setInactive] = useState(!!item && 'inactive' in item ? false : false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const priceNum = Number(price) || 0;
  const canSubmit =
    (isEdit || code.trim().length > 0) && name.trim().length > 0 && priceNum >= 0;

  const submit = async () => {
    setError(null);
    if (!canSubmit) {
      setError(t('items.validation'));
      return;
    }
    try {
      if (isEdit && item) {
        const saved = await update.mutateAsync({
          code: item.code,
          dto: {
            name: name.trim(),
            barcode: barcode.trim() || undefined,
            unit: unit.trim() || undefined,
            price: priceNum,
            inactive,
          },
        });
        setDone(saved.code);
      } else {
        const saved = await create.mutateAsync({
          code: code.trim(),
          name: name.trim(),
          barcode: barcode.trim() || undefined,
          unit: unit.trim() || undefined,
          price: priceNum,
          inactive,
        });
        setDone(saved.code);
      }
    } catch (e) {
      if (e instanceof ApiError) {
        const trace = e.problem.traceId ? ` (traceId: ${e.problem.traceId})` : '';
        setError(`${e.problem.detail || e.problem.title}${trace}`);
      } else {
        setError(t('items.saveError'));
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? t('items.editTitle') : t('items.newTitle')}
    >
      <div className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="flex items-center gap-2 font-bold">
            <Package className="size-5 text-[var(--color-brand-500)]" aria-hidden />
            {isEdit ? t('items.editTitle') : t('items.newTitle')}
            {item?.origin ? <OriginBadge origin={item.origin} /> : null}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('returns.close')}>
            <X className="size-5" />
          </Button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-4 p-6 text-center">
            <CheckCircle2 className="size-12 text-[var(--color-success)]" aria-hidden />
            <p className="font-bold">
              {isEdit ? t('items.updated') : t('items.created')} {done}
            </p>
            <Button variant="primary" className="w-full" onClick={onClose}>
              {t('returns.close')}
            </Button>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto scroll-thin p-4">
              <div className="flex flex-col gap-3">
                <Field label={t('items.code')}>
                  <Input
                    autoFocus={!isEdit}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={isEdit}
                    className="tnum h-10"
                    placeholder={t('items.codePlaceholder')}
                  />
                </Field>
                <Field label={t('items.name')}>
                  <Input
                    autoFocus={isEdit}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10"
                    placeholder={t('items.namePlaceholder')}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t('items.price')}>
                    <Input
                      type="number"
                      min={0}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="tnum h-10 text-end"
                      placeholder="0"
                    />
                  </Field>
                  <Field label={t('items.unit')}>
                    <Input
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="h-10"
                      placeholder={t('items.unitPlaceholder')}
                    />
                  </Field>
                </div>
                <Field label={t('items.barcode')}>
                  <Input
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="tnum h-10"
                    placeholder={t('items.barcodePlaceholder')}
                  />
                </Field>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={inactive}
                    onChange={(e) => setInactive(e.target.checked)}
                    className="size-4"
                  />
                  {t('items.inactive')}
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
            </div>

            <div className="border-t p-4">
              <Button
                size="lg"
                variant="primary"
                className="w-full"
                disabled={!canSubmit || pending}
                onClick={submit}
              >
                <CheckCircle2 className="size-5" />
                {pending ? t('items.saving') : t('items.save')}
              </Button>
            </div>
          </>
        )}
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
