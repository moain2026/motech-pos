import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ArrowLeftRight, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { ApiError } from '@/shared/lib/api-client';
import { useCreateTransfer, useWarehouses } from '../api/transfers.api';

interface LineDraft {
  itemCode: string;
  qty: string;
  note: string;
}

const EMPTY_LINE: LineDraft = { itemCode: '', qty: '', note: '' };

/**
 * POST019 — raise a material transfer request between two warehouses:
 * from/to pickers (GET /warehouses), free item lines (code + qty + note),
 * then POST /transfers.
 */
export function TransferDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const warehouses = useWarehouses();
  const create = useCreateTransfer();

  const [fromWarehouse, setFromWarehouse] = useState('');
  const [toWarehouse, setToWarehouse] = useState('');
  const [reqSide, setReqSide] = useState('');
  const [purpose, setPurpose] = useState('');
  const [refNo, setRefNo] = useState('');
  const [lines, setLines] = useState<LineDraft[]>([{ ...EMPTY_LINE }]);
  const [error, setError] = useState<string | null>(null);
  const [doneNo, setDoneNo] = useState<number | null>(null);

  const whOptions = (warehouses.data ?? []).filter((w) => !w.inactive);

  const setLine = (idx: number, patch: Partial<LineDraft>) => {
    setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };

  const validLines = lines.filter((l) => l.itemCode.trim() && Number(l.qty) > 0);
  const sameWh = !!fromWarehouse && fromWarehouse === toWarehouse;
  const canSubmit =
    !create.isPending && !!fromWarehouse && !!toWarehouse && !sameWh && validLines.length > 0;

  const submit = async () => {
    setError(null);
    if (!canSubmit) return;
    try {
      const res = await create.mutateAsync({
        fromWarehouse: Number(fromWarehouse),
        toWarehouse: Number(toWarehouse),
        reqSide: reqSide.trim() || undefined,
        purpose: purpose.trim() || undefined,
        refNo: refNo.trim() || undefined,
        lines: validLines.map((l) => ({
          itemCode: l.itemCode.trim(),
          qty: Number(l.qty),
          note: l.note.trim() || undefined,
        })),
      });
      setDoneNo(res.reqNo);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.problem.detail || e.problem.title);
      } else {
        setError(t('transfers.createError'));
      }
    }
  };

  const whSelect = (value: string, set: (v: string) => void, label: string) => (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-[var(--color-muted)]">
        {label}
        <span className="text-[var(--color-danger)]"> *</span>
      </span>
      <select
        value={value}
        onChange={(e) => set(e.target.value)}
        className="h-9 rounded-[var(--radius)] border bg-[var(--color-surface)] px-2 text-sm"
      >
        <option value="">{t('transfers.pickWarehouse')}</option>
        {whOptions.map((w) => (
          <option key={w.code} value={w.code}>
            {w.arName?.trim() || w.enName?.trim() || `#${w.code}`}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('transfers.new')}
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="flex items-center gap-2 font-bold">
            <ArrowLeftRight className="size-5 text-[var(--color-brand-500)]" aria-hidden />
            {t('transfers.new')}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('transfers.close')}>
            <X className="size-5" />
          </Button>
        </div>

        {doneNo != null ? (
          <div className="flex flex-col items-center gap-4 p-6 text-center">
            <CheckCircle2 className="size-12 text-[var(--color-success)]" aria-hidden />
            <p className="font-bold">
              {t('transfers.created')} #{doneNo}
            </p>
            <Button variant="primary" className="w-full max-w-xs" onClick={onClose}>
              {t('transfers.close')}
            </Button>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto scroll-thin p-4">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {whSelect(fromWarehouse, setFromWarehouse, t('transfers.from'))}
                  {whSelect(toWarehouse, setToWarehouse, t('transfers.to'))}
                </div>
                {sameWh ? (
                  <p className="text-xs text-[var(--color-danger)]">{t('transfers.sameWh')}</p>
                ) : null}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Field label={t('transfers.reqSide')}>
                    <Input value={reqSide} onChange={(e) => setReqSide(e.target.value)} className="h-9" />
                  </Field>
                  <Field label={t('transfers.purpose')}>
                    <Input value={purpose} onChange={(e) => setPurpose(e.target.value)} className="h-9" />
                  </Field>
                  <Field label={t('transfers.refNo')}>
                    <Input value={refNo} onChange={(e) => setRefNo(e.target.value)} className="tnum h-9" />
                  </Field>
                </div>

                {/* Lines */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{t('transfers.lines')}</p>
                    <Button
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => setLines((ls) => [...ls, { ...EMPTY_LINE }])}
                    >
                      <Plus className="size-4" />
                      {t('transfers.addLine')}
                    </Button>
                  </div>
                  {lines.map((l, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        value={l.itemCode}
                        onChange={(e) => setLine(i, { itemCode: e.target.value })}
                        placeholder={t('transfers.itemCode')}
                        className="tnum h-9 flex-1"
                        aria-label={t('transfers.itemCode')}
                      />
                      <Input
                        type="number"
                        min={0}
                        value={l.qty}
                        onChange={(e) => setLine(i, { qty: e.target.value })}
                        placeholder={t('transfers.qty')}
                        className="tnum h-9 w-24 text-end"
                        aria-label={t('transfers.qty')}
                      />
                      <Input
                        value={l.note}
                        onChange={(e) => setLine(i, { note: e.target.value })}
                        placeholder={t('transfers.lineNote')}
                        className="h-9 flex-1"
                        aria-label={t('transfers.lineNote')}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={lines.length === 1}
                        onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))}
                        aria-label={t('transfers.removeLine')}
                      >
                        <Trash2 className="size-4 text-[var(--color-danger)]" />
                      </Button>
                    </div>
                  ))}
                </div>

                {error ? (
                  <p role="alert" className="rounded-md bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]">
                    {error}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex gap-2 border-t p-4">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                {t('transfers.cancelBtn')}
              </Button>
              <Button variant="primary" className="flex-1" disabled={!canSubmit} onClick={() => void submit()}>
                {create.isPending ? t('transfers.saving') : t('transfers.submit')}
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
      <span className="text-xs text-[var(--color-muted)]">{label}</span>
      {children}
    </label>
  );
}
