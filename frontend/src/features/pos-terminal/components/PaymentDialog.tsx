import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Banknote,
  CreditCard,
  Clock,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  Star,
  Ticket,
  Wallet,
} from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { ApiError } from '@/shared/lib/api-client';
import { formatMoney } from '@/shared/lib/format';
import { usePayBillMulti } from '@/features/bills/api/bills.api';
import type { PaymentMethod, PaymentTenderDto } from '@/shared/lib/types';

interface TenderRow {
  method: PaymentMethod;
  amount: string;
  currency: string;
  rate: string;
  cardNo?: string;
  couponNo?: string;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Enhanced multi-tender payment dialog for a POSTED bill.
 * Methods: cash / card / credit / POINTS (loyalty redeem — amount = number of
 * points, requires an attached customer) / COUPON (IAS_CPN_MST — amount
 * optional, defaults to face value). Per-tender currency + exchange rate,
 * live remaining / change readout, then POST /bills/{id}/payments/multi.
 * The amount that counts toward the bill is amount × rate (amountInBill).
 */
export function PaymentDialog({
  billId,
  billNo,
  billCurrency,
  netAmt,
  customerCode,
  onClose,
  onSettled,
}: {
  billId: string;
  billNo: string;
  billCurrency: string;
  netAmt: number;
  /** Loyalty customer attached to the bill (required for POINTS tenders). */
  customerCode?: string | null;
  onClose: () => void;
  onSettled: (paidAmt: number) => void;
}) {
  const { t } = useTranslation();
  const payMulti = usePayBillMulti();

  const [rows, setRows] = useState<TenderRow[]>([
    { method: 'CASH', amount: String(netAmt), currency: billCurrency, rate: '1' },
  ]);
  const [error, setError] = useState<string | null>(null);

  // amountInBill = amount × rate (rate = tender→bill currency). CASH change only.
  const { paidInBill, remaining, change, cashInBill } = useMemo(() => {
    let paid = 0;
    let cash = 0;
    for (const r of rows) {
      const amt = Number(r.amount) || 0;
      const rate = Number(r.rate) || 1;
      const inBill = round2(amt * rate);
      paid += inBill;
      if (r.method === 'CASH') cash += inBill;
    }
    paid = round2(paid);
    const rem = round2(Math.max(0, netAmt - paid));
    // Change is only ever given from cash overpayment.
    const over = round2(Math.max(0, paid - netAmt));
    const chg = round2(Math.min(over, cash));
    return { paidInBill: paid, remaining: rem, change: chg, cashInBill: cash };
  }, [rows, netAmt]);

  void cashInBill;

  const setRow = (i: number, patch: Partial<TenderRow>) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const addRow = (method: PaymentMethod) =>
    setRows((rs) => [
      ...rs,
      { method, amount: String(remaining || ''), currency: billCurrency, rate: '1' },
    ]);
  const removeRow = (i: number) => setRows((rs) => rs.filter((_, idx) => idx !== i));

  // COUPON with no amount = full face value (server-resolved) — allow submit
  // even when the client-side paid total is short.
  const hasOpenCoupon = rows.some(
    (r) => r.method === 'COUPON' && (r.couponNo ?? '').trim() && !(Number(r.amount) > 0),
  );
  const canSubmit = (paidInBill >= netAmt || hasOpenCoupon) && rows.length > 0 && !payMulti.isPending;

  const submit = async () => {
    setError(null);
    if (rows.some((r) => r.method === 'POINTS' && (Number(r.amount) || 0) > 0) && !customerCode) {
      setError(t('payMulti.needCustomerForPoints'));
      return;
    }
    if (
      rows.some(
        (r) => r.method === 'PREPAID' && !(r.cardNo ?? '').trim(),
      )
    ) {
      setError(t('payMulti.needCardForPrepaid'));
      return;
    }
    const tenders: PaymentTenderDto[] = rows
      .filter((r) =>
        r.method === 'COUPON'
          ? (r.couponNo ?? '').trim().length > 0
          : (Number(r.amount) || 0) > 0,
      )
      .map((r) => ({
        method: r.method,
        // COUPON: omit amount to redeem the full face value.
        amount:
          r.method === 'COUPON' && !(Number(r.amount) > 0) ? undefined : Number(r.amount),
        currency: r.currency || billCurrency,
        rate: Number(r.rate) || 1,
        cardNo:
          (r.method === 'CARD' || r.method === 'PREPAID') && r.cardNo
            ? r.cardNo.trim()
            : undefined,
        customerCode: r.method === 'POINTS' ? (customerCode ?? undefined) : undefined,
        couponNo: r.method === 'COUPON' ? r.couponNo?.trim() : undefined,
      }));
    if (tenders.length === 0) {
      setError(t('payMulti.needTender'));
      return;
    }
    try {
      const bill = await payMulti.mutateAsync({ id: billId, dto: { tenders } });
      onSettled(bill.paidAmt);
    } catch (e) {
      if (e instanceof ApiError) {
        const trace = e.problem.traceId ? ` (traceId: ${e.problem.traceId})` : '';
        setError(`${e.problem.detail || e.problem.title}${trace}`);
      } else {
        setError(t('pos.saleError'));
      }
    }
  };

  const methodMeta: Record<PaymentMethod, { icon: typeof Banknote; label: string }> = {
    CASH: { icon: Banknote, label: t('pos.methodCash') },
    CARD: { icon: CreditCard, label: t('pos.methodCard') },
    CREDIT: { icon: Clock, label: t('pos.methodCredit') },
    POINTS: { icon: Star, label: t('pos.methodPoints') },
    COUPON: { icon: Ticket, label: t('pos.methodCoupon') },
    PREPAID: { icon: Wallet, label: t('pos.methodPrepaid') },
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('payMulti.title')}
    >
      <div className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-bold">
            {t('payMulti.title')} · {billNo}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('returns.close')}>
            <X className="size-5" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scroll-thin p-4">
          {/* Totals readout */}
          <div className="mb-3 grid grid-cols-3 gap-2 text-center">
            <Stat label={t('pos.total')} value={formatMoney(netAmt)} />
            <Stat label={t('payMulti.paid')} value={formatMoney(paidInBill)} tone="brand" />
            <Stat
              label={change > 0 ? t('payMulti.change') : t('payMulti.remaining')}
              value={formatMoney(change > 0 ? change : remaining)}
              tone={remaining > 0 ? 'warning' : change > 0 ? 'success' : 'muted'}
            />
          </div>

          {/* Tender rows */}
          <ul className="flex flex-col gap-2">
            {rows.map((r, i) => {
              const Icon = methodMeta[r.method].icon;
              return (
                <li key={i} className="rounded-[var(--radius)] border bg-[var(--color-surface-2)] p-2">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 shrink-0 text-[var(--color-brand-500)]" aria-hidden />
                    <select
                      value={r.method}
                      onChange={(e) => setRow(i, { method: e.target.value as PaymentMethod })}
                      className="h-9 rounded-md border bg-[var(--color-surface)] px-2 text-sm"
                      aria-label={t('pos.method')}
                    >
                      <option value="CASH">{t('pos.methodCash')}</option>
                      <option value="CARD">{t('pos.methodCard')}</option>
                      <option value="CREDIT">{t('pos.methodCredit')}</option>
                      <option value="POINTS" disabled={!customerCode}>
                        {t('pos.methodPoints')}
                      </option>
                      <option value="COUPON">{t('pos.methodCoupon')}</option>
                      <option value="PREPAID">{t('pos.methodPrepaid')}</option>
                    </select>
                    <Input
                      type="number"
                      min={0}
                      value={r.amount}
                      onChange={(e) => setRow(i, { amount: e.target.value })}
                      className="tnum h-9 flex-1 text-end"
                      placeholder="0"
                      aria-label={t('payMulti.amount')}
                    />
                    {rows.length > 1 ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-9 text-[var(--color-danger)]"
                        onClick={() => removeRow(i)}
                        aria-label={t('pos.remove')}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    ) : null}
                  </div>

                  {/* currency + rate (multi-currency) + card no */}
                  <div className="mt-2 flex items-center gap-2">
                    <label className="flex items-center gap-1 text-xs text-[var(--color-muted)]">
                      {t('payMulti.currency')}
                      <Input
                        value={r.currency}
                        onChange={(e) => setRow(i, { currency: e.target.value.toUpperCase() })}
                        className="h-8 w-20 text-center uppercase"
                        aria-label={t('payMulti.currency')}
                      />
                    </label>
                    <label className="flex items-center gap-1 text-xs text-[var(--color-muted)]">
                      {t('payMulti.rate')}
                      <Input
                        type="number"
                        min={0}
                        value={r.rate}
                        onChange={(e) => setRow(i, { rate: e.target.value })}
                        className="tnum h-8 w-20 text-end"
                        aria-label={t('payMulti.rate')}
                      />
                    </label>
                    {r.method === 'CARD' || r.method === 'PREPAID' ? (
                      <Input
                        value={r.cardNo ?? ''}
                        onChange={(e) => setRow(i, { cardNo: e.target.value })}
                        className="h-8 flex-1"
                        placeholder={
                          r.method === 'PREPAID'
                            ? t('payMulti.prepaidCardNo')
                            : t('payMulti.cardNo')
                        }
                        aria-label={t('payMulti.cardNo')}
                      />
                    ) : null}
                    {r.method === 'COUPON' ? (
                      <Input
                        value={r.couponNo ?? ''}
                        onChange={(e) => setRow(i, { couponNo: e.target.value })}
                        className="h-8 flex-1"
                        placeholder={t('payMulti.couponNo')}
                        aria-label={t('payMulti.couponNo')}
                      />
                    ) : null}
                  </div>
                  {r.method === 'POINTS' ? (
                    <p className="mt-1 text-[10px] text-[var(--color-muted)]">
                      {t('payMulti.pointsHint')}
                    </p>
                  ) : null}
                  {r.method === 'COUPON' ? (
                    <p className="mt-1 text-[10px] text-[var(--color-muted)]">
                      {t('payMulti.couponHint')}
                    </p>
                  ) : null}
                  {r.method === 'PREPAID' ? (
                    <p className="mt-1 text-[10px] text-[var(--color-muted)]">
                      {t('payMulti.prepaidHint')}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>

          {/* Add-tender shortcuts */}
          <div className="mt-3 flex flex-wrap gap-2">
            {(
              ['CASH', 'CARD', 'CREDIT', 'POINTS', 'COUPON', 'PREPAID'] as PaymentMethod[]
            ).map((m) => {
              const Icon = methodMeta[m].icon;
              return (
                <Button
                  key={m}
                  variant="ghost"
                  className="h-8 text-xs"
                  disabled={m === 'POINTS' && !customerCode}
                  onClick={() => addRow(m)}
                >
                  <Plus className="size-3" />
                  <Icon className="size-4" />
                  {methodMeta[m].label}
                </Button>
              );
            })}
          </div>

          {error ? (
            <p
              role="alert"
              className="mt-3 rounded-md bg-[var(--color-danger)]/15 p-2 text-center text-xs text-[var(--color-danger)]"
            >
              {error}
            </p>
          ) : null}
        </div>

        <div className="border-t p-4">
          <Button
            size="lg"
            variant="success"
            className="w-full"
            disabled={!canSubmit}
            onClick={submit}
          >
            <CheckCircle2 className="size-5" />
            {payMulti.isPending ? t('pos.paying') : t('payMulti.confirm')}
          </Button>
          {remaining > 0 ? (
            <p className="mt-2 text-center text-xs text-[var(--color-warning)]">
              {t('payMulti.underpaid')}: {formatMoney(remaining)}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = 'muted',
}: {
  label: string;
  value: string;
  tone?: 'muted' | 'brand' | 'success' | 'warning';
}) {
  const color =
    tone === 'brand'
      ? 'text-[var(--color-brand-100)]'
      : tone === 'success'
        ? 'text-[var(--color-success)]'
        : tone === 'warning'
          ? 'text-[var(--color-warning)]'
          : 'text-[var(--color-fg)]';
  return (
    <div className="rounded-[var(--radius)] border bg-[var(--color-surface-2)] p-2">
      <p className="text-[10px] text-[var(--color-muted)]">{label}</p>
      <p className={`tnum text-sm font-bold ${color}`}>{value}</p>
    </div>
  );
}
