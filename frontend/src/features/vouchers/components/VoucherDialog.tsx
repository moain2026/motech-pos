import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, CheckCircle2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { ApiError } from '@/shared/lib/api-client';
import { usePosSettings } from '@/features/pos-terminal/store/pos-settings.store';
import type { VoucherType, VoucherMethod } from '@/shared/lib/types';
import { useCreateVoucher } from '../api/vouchers.api';

/**
 * Create-voucher dialog — سند قبض (RECEIPT) or سند صرف (EXPENSE).
 * POST /vouchers (Idempotency-Key mandatory, open shift required).
 */
export function VoucherDialog({
  type,
  onClose,
}: {
  type: VoucherType;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const cashierNo = usePosSettings((s) => s.cashierNo);
  const machineNo = usePosSettings((s) => s.machineNo);
  const create = useCreateVoucher();

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<VoucherMethod>('CASH');
  const [description, setDescription] = useState('');
  const [partyName, setPartyName] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [doneNo, setDoneNo] = useState<string | null>(null);

  const isReceipt = type === 'RECEIPT';
  const Icon = isReceipt ? ArrowDownCircle : ArrowUpCircle;
  const amt = Number(amount) || 0;

  const submit = async () => {
    setError(null);
    if (amt <= 0) {
      setError(t('vouchers.needAmount'));
      return;
    }
    try {
      const v = await create.mutateAsync({
        type,
        cashierNo,
        machineNo,
        amount: amt,
        currency: 'YER',
        paymentMethod: method,
        description: description.trim() || undefined,
        partyName: partyName.trim() || undefined,
        category: category.trim() || undefined,
      });
      setDoneNo(v.voucherNo);
    } catch (e) {
      if (e instanceof ApiError) {
        const trace = e.problem.traceId ? ` (traceId: ${e.problem.traceId})` : '';
        setError(`${e.problem.detail || e.problem.title}${trace}`);
      } else {
        setError(t('vouchers.createError'));
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isReceipt ? t('vouchers.newReceipt') : t('vouchers.newExpense')}
    >
      <div className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="flex items-center gap-2 font-bold">
            <Icon
              className={
                'size-5 ' +
                (isReceipt ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]')
              }
              aria-hidden
            />
            {isReceipt ? t('vouchers.newReceipt') : t('vouchers.newExpense')}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('returns.close')}>
            <X className="size-5" />
          </Button>
        </div>

        {doneNo ? (
          <div className="flex flex-col items-center gap-4 p-6 text-center">
            <CheckCircle2 className="size-12 text-[var(--color-success)]" aria-hidden />
            <p className="font-bold">
              {t('vouchers.created')} {doneNo}
            </p>
            <Button variant="primary" className="w-full" onClick={onClose}>
              {t('returns.close')}
            </Button>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto scroll-thin p-4">
              <div className="flex flex-col gap-3">
                <Field label={t('vouchers.amount')}>
                  <Input
                    autoFocus
                    type="number"
                    min={0}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="tnum h-10 text-end"
                    placeholder="0"
                  />
                </Field>

                <Field label={t('vouchers.method')}>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as VoucherMethod)}
                    className="h-10 w-full rounded-md border bg-[var(--color-surface-2)] px-2 text-sm"
                  >
                    <option value="CASH">{t('vouchers.methodCash')}</option>
                    <option value="CARD">{t('vouchers.methodCard')}</option>
                    <option value="BANK">{t('vouchers.methodBank')}</option>
                  </select>
                </Field>

                <Field label={t('vouchers.party')}>
                  <Input
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                    className="h-10"
                    placeholder={t('vouchers.partyPlaceholder')}
                  />
                </Field>

                <Field label={t('vouchers.description')}>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="h-10"
                    placeholder={t('vouchers.descriptionPlaceholder')}
                  />
                </Field>

                <Field label={t('vouchers.category')}>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-10"
                    placeholder={t('vouchers.categoryPlaceholder')}
                  />
                </Field>

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
                variant={isReceipt ? 'success' : 'primary'}
                className="w-full"
                disabled={amt <= 0 || create.isPending}
                onClick={submit}
              >
                <CheckCircle2 className="size-5" />
                {create.isPending ? t('vouchers.saving') : t('vouchers.submit')}
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
