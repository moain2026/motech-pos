import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ClipboardList, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { ApiError } from '@/shared/lib/api-client';
import { useCreateSalesOrder } from '../api/sales-orders.api';

interface LineDraft {
  itemCode: string;
  qty: string;
  note: string;
}

const EMPTY_LINE: LineDraft = { itemCode: '', qty: '', note: '' };

/**
 * POST024 — record a customer order: optional customer code/name + refNo +
 * expire date, free item lines (code + qty + note), then POST /sales-orders.
 * The server snapshots Arabic names and retail prices per line.
 */
export function SalesOrderDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const create = useCreateSalesOrder();

  const [customerCode, setCustomerCode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [refNo, setRefNo] = useState('');
  const [expireDate, setExpireDate] = useState('');
  const [note, setNote] = useState('');
  const [lines, setLines] = useState<LineDraft[]>([{ ...EMPTY_LINE }]);
  const [error, setError] = useState<string | null>(null);
  const [doneNo, setDoneNo] = useState<number | null>(null);

  const setLine = (idx: number, patch: Partial<LineDraft>) => {
    setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };

  const validLines = lines.filter((l) => l.itemCode.trim() && Number(l.qty) > 0);
  const canSubmit = !create.isPending && validLines.length > 0;

  const submit = async () => {
    setError(null);
    if (!canSubmit) return;
    try {
      const res = await create.mutateAsync({
        customerCode: customerCode.trim() || undefined,
        customerName: customerName.trim() || undefined,
        refNo: refNo.trim() || undefined,
        expireDate: expireDate || undefined,
        note: note.trim() || undefined,
        lines: validLines.map((l) => ({
          itemCode: l.itemCode.trim(),
          qty: Number(l.qty),
          note: l.note.trim() || undefined,
        })),
      });
      setDoneNo(res.orderNo);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.problem.detail || e.problem.title : t('salesOrders.createError'),
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('salesOrders.new')}
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="flex items-center gap-2 font-bold">
            <ClipboardList className="size-5 text-[var(--color-brand-500)]" aria-hidden />
            {t('salesOrders.new')}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('salesOrders.close')}>
            <X className="size-5" />
          </Button>
        </div>

        {doneNo != null ? (
          <div className="flex flex-col items-center gap-4 p-6 text-center">
            <CheckCircle2 className="size-12 text-[var(--color-success)]" aria-hidden />
            <p className="font-bold">
              {t('salesOrders.created')} #{doneNo}
            </p>
            <Button variant="primary" className="w-full max-w-xs" onClick={onClose}>
              {t('salesOrders.close')}
            </Button>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto scroll-thin p-4">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label={t('salesOrders.customerCode')}>
                    <Input
                      value={customerCode}
                      onChange={(e) => setCustomerCode(e.target.value)}
                      className="tnum h-9"
                      dir="ltr"
                    />
                  </Field>
                  <Field label={t('salesOrders.customerName')}>
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="h-9"
                    />
                  </Field>
                  <Field label={t('salesOrders.refNo')}>
                    <Input value={refNo} onChange={(e) => setRefNo(e.target.value)} className="tnum h-9" />
                  </Field>
                  <Field label={t('salesOrders.expireDate')}>
                    <Input
                      type="date"
                      value={expireDate}
                      onChange={(e) => setExpireDate(e.target.value)}
                      className="tnum h-9"
                    />
                  </Field>
                </div>
                <Field label={t('salesOrders.note')}>
                  <Input value={note} onChange={(e) => setNote(e.target.value)} className="h-9" />
                </Field>

                {/* Lines */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{t('salesOrders.lines')}</p>
                    <Button
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => setLines((ls) => [...ls, { ...EMPTY_LINE }])}
                    >
                      <Plus className="size-4" />
                      {t('salesOrders.addLine')}
                    </Button>
                  </div>
                  {lines.map((l, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        value={l.itemCode}
                        onChange={(e) => setLine(i, { itemCode: e.target.value })}
                        placeholder={t('salesOrders.itemCode')}
                        className="tnum h-9 flex-1"
                        aria-label={t('salesOrders.itemCode')}
                        dir="ltr"
                      />
                      <Input
                        type="number"
                        min={0}
                        value={l.qty}
                        onChange={(e) => setLine(i, { qty: e.target.value })}
                        placeholder={t('salesOrders.qty')}
                        className="tnum h-9 w-24 text-end"
                        aria-label={t('salesOrders.qty')}
                      />
                      <Input
                        value={l.note}
                        onChange={(e) => setLine(i, { note: e.target.value })}
                        placeholder={t('salesOrders.lineNote')}
                        className="hidden h-9 flex-1 sm:block"
                        aria-label={t('salesOrders.lineNote')}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={lines.length === 1}
                        onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))}
                        aria-label={t('salesOrders.removeLine')}
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
                {t('salesOrders.cancelBtn')}
              </Button>
              <Button variant="primary" className="flex-1" disabled={!canSubmit} onClick={() => void submit()}>
                {create.isPending ? t('salesOrders.saving') : t('salesOrders.submit')}
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
