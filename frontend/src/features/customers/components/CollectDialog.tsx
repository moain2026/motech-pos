import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { ApiError } from '@/shared/lib/api-client';
import { formatMoney } from '@/shared/lib/format';
import type { CreditBillRow } from '@/shared/lib/types';
import { usePosSettings } from '@/features/pos-terminal/store/pos-settings.store';
import { useCollectCredit } from '../api/customers.api';

/**
 * POST010/011 — Collection receipt dialog (POST /customers/{code}/collect,
 * Idempotency-Key mandatory server-side). Shared by CustomersPage's credit tab
 * and BillDetailPage's direct "سداد" button.
 */
export function CollectDialog({
  customerCode,
  bill,
  onClose,
}: {
  customerCode: string;
  bill: CreditBillRow;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const cashierNo = usePosSettings((s) => s.cashierNo);
  const collect = useCollectCredit();
  const [amount, setAmount] = useState(String(bill.outstanding));
  const [method, setMethod] = useState<'CASH' | 'CARD'>('CASH');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ outstanding: number } | null>(null);

  const amountNum = Number(amount) || 0;
  const canSubmit = amountNum > 0 && amountNum <= bill.outstanding && !collect.isPending;

  const submit = async () => {
    setError(null);
    if (amountNum <= 0) {
      setError(t('credit.needAmount'));
      return;
    }
    try {
      const res = await collect.mutateAsync({
        code: customerCode,
        dto: {
          billId: bill.billId,
          amount: amountNum,
          method,
          currency: bill.currency,
          cashierNo,
          note: note.trim() || undefined,
        },
      });
      setDone({ outstanding: res.bill.outstanding });
    } catch (e) {
      if (e instanceof ApiError) {
        const trace = e.problem.traceId ? ` (traceId: ${e.problem.traceId})` : '';
        setError(`${e.problem.detail || e.problem.title}${trace}`);
      } else {
        setError(t('credit.collectError'));
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('credit.collectTitle')}
    >
      <div className="flex w-full max-w-sm flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-bold">
            {t('credit.collectTitle')} · {bill.billNo}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('returns.close')}>
            <X className="size-5" />
          </Button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-4 p-6 text-center">
            <CheckCircle2 className="size-12 text-[var(--color-success)]" aria-hidden />
            <p className="font-bold">
              {t('credit.collected')}: {formatMoney(done.outstanding)}
            </p>
            <Button variant="primary" className="w-full" onClick={onClose}>
              {t('returns.close')}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-4">
            <p className="text-sm text-[var(--color-muted)]">
              {t('credit.outstanding')}:{' '}
              <span className="tnum font-bold text-[var(--color-fg)]">
                {formatMoney(bill.outstanding)}
              </span>
            </p>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-[var(--color-muted)]">{t('credit.amount')}</span>
              <Input
                type="number"
                min={0}
                max={bill.outstanding}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="tnum h-10 text-end"
                autoFocus
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-[var(--color-muted)]">{t('credit.method')}</span>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as 'CASH' | 'CARD')}
                className="h-10 rounded-md border bg-[var(--color-surface)] px-2 text-sm"
              >
                <option value="CASH">{t('pos.methodCash')}</option>
                <option value="CARD">{t('pos.methodCard')}</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-[var(--color-muted)]">{t('credit.note')}</span>
              <Input value={note} onChange={(e) => setNote(e.target.value)} className="h-10" />
            </label>

            {error ? (
              <p
                role="alert"
                className="rounded-md bg-[var(--color-danger)]/15 p-2 text-center text-xs text-[var(--color-danger)]"
              >
                {error}
              </p>
            ) : null}

            <Button variant="success" size="lg" disabled={!canSubmit} onClick={submit}>
              <CheckCircle2 className="size-5" />
              {collect.isPending ? t('credit.collecting') : t('credit.submit')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
