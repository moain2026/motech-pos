import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Scale, Banknote, CreditCard, Clock, Calculator } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { formatMoney } from '@/shared/lib/format';
import { usePosSettings } from '@/features/pos-terminal/store/pos-settings.store';
import type { PaymentMethod } from '@/shared/lib/types';
import { useCurrentShift, useShiftReconciliation } from '../api/shifts.api';

/**
 * مطابقة إقفال الوردية (Cashier reconciliation / Z-X report).
 * Shows expected vs actual cash, over/short, and a per-payment-method
 * breakdown for the open shift. GET /shifts/{id}/reconciliation with optional
 * counted actualCash + cashExpenses (live X-report). Proof-verified :3000.
 */
export function ReconciliationPage() {
  const { t } = useTranslation();
  const cashierNo = usePosSettings((s) => s.cashierNo);
  const shiftQ = useCurrentShift(cashierNo);
  const shift = shiftQ.data?.shift ?? null;

  const [actualStr, setActualStr] = useState('');
  const [expensesStr, setExpensesStr] = useState('');
  // Applied values (only sent after the cashier confirms, to keep the query key stable).
  const [applied, setApplied] = useState<{ actualCash?: number; cashExpenses?: number }>({});

  const rec = useShiftReconciliation(shift?.id ?? null, {
    actualCash: applied.actualCash,
    cashExpenses: applied.cashExpenses,
    enabled: !!shift,
  });
  const r = rec.data;

  const methodMeta: Record<PaymentMethod, { icon: typeof Banknote; label: string }> = useMemo(
    () => ({
      CASH: { icon: Banknote, label: t('pos.methodCash') },
      CARD: { icon: CreditCard, label: t('pos.methodCard') },
      CREDIT: { icon: Clock, label: t('pos.methodCredit') },
    }),
    [t],
  );

  const apply = () => {
    setApplied({
      actualCash: actualStr.trim() === '' ? undefined : Number(actualStr),
      cashExpenses: expensesStr.trim() === '' ? undefined : Number(expensesStr),
    });
  };

  if (shiftQ.isLoading) return <LoadingView />;
  if (!shift) {
    return (
      <div className="p-4">
        <EmptyView label={t('recon.noShift')} />
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-4 p-4">
      <h1 className="flex items-center gap-2 text-lg font-bold">
        <Scale className="size-6 text-[var(--color-brand-500)]" aria-hidden />
        {t('recon.title')} — {t('shift.no')} #{shift.shiftNo}
      </h1>

      {/* Counted-cash inputs (live X-report) */}
      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-[var(--color-muted)]">{t('recon.actualCash')}</span>
            <Input
              type="number"
              min={0}
              value={actualStr}
              onChange={(e) => setActualStr(e.target.value)}
              placeholder={t('recon.actualCashPlaceholder')}
              className="tnum h-10 w-40 text-end"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-[var(--color-muted)]">{t('recon.cashExpenses')}</span>
            <Input
              type="number"
              min={0}
              value={expensesStr}
              onChange={(e) => setExpensesStr(e.target.value)}
              placeholder="0"
              className="tnum h-10 w-40 text-end"
            />
          </label>
          <Button variant="primary" className="h-10" onClick={apply}>
            <Calculator className="size-4" />
            {t('recon.compute')}
          </Button>
        </div>
      </Card>

      {rec.isLoading ? (
        <LoadingView />
      ) : rec.isError ? (
        <ErrorView error={rec.error} onRetry={() => rec.refetch()} />
      ) : r ? (
        <>
          {/* Cash reconciliation */}
          <Card className="p-4">
            <h2 className="mb-3 font-bold">{t('recon.cashSection')}</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              <Line label={t('recon.openingBalance')} value={formatMoney(r.openingBalance)} />
              <Line label={t('recon.cashSales')} value={formatMoney(r.cashSales)} />
              <Line label={t('recon.cashReceipts')} value={formatMoney(r.cashReceipts)} />
              <Line label={t('recon.cashExpenses')} value={`- ${formatMoney(r.cashExpenses)}`} />
              <Line label={t('recon.expectedCash')} value={formatMoney(r.expectedCash)} strong />
              <Line
                label={t('recon.actualCash')}
                value={r.actualCash != null ? formatMoney(r.actualCash) : '—'}
                strong
              />
            </div>

            {/* Over / short */}
            <div
              className={
                'mt-3 flex items-center justify-between rounded-[var(--radius)] p-3 ' +
                (r.overShort === 'BALANCED'
                  ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
                  : r.overShort === 'OVER'
                    ? 'bg-[var(--color-brand-600)]/15 text-[var(--color-brand-100)]'
                    : 'bg-[var(--color-danger)]/15 text-[var(--color-danger)]')
              }
            >
              <span className="font-bold">
                {t('recon.difference')} · {t(`recon.status.${r.overShort}`)}
              </span>
              <span className="tnum text-xl font-extrabold">
                {r.cashDifference != null ? formatMoney(r.cashDifference) : '—'}
              </span>
            </div>
          </Card>

          {/* Sales / tender totals */}
          <Card className="p-4">
            <h2 className="mb-3 font-bold">{t('recon.tenderSection')}</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              <Line label={t('recon.billCount')} value={String(r.billCount)} />
              <Line label={t('recon.netSales')} value={formatMoney(r.netSalesTotal)} />
              <Line label={t('recon.cardTotal')} value={formatMoney(r.cardTotal)} />
              <Line label={t('recon.creditTotal')} value={formatMoney(r.creditTotal)} />
              <Line label={t('recon.tenderTotal')} value={formatMoney(r.tenderTotal)} strong />
            </div>
          </Card>

          {/* Per-method breakdown */}
          <Card className="p-4">
            <h2 className="mb-3 font-bold">{t('recon.breakdown')}</h2>
            {r.breakdown.length === 0 ? (
              <EmptyView label={t('recon.noBreakdown')} />
            ) : (
              <ul className="flex flex-col gap-2">
                {r.breakdown.map((b) => {
                  const meta = methodMeta[b.method] ?? { icon: Banknote, label: b.method };
                  const Icon = meta.icon;
                  return (
                    <li
                      key={b.method}
                      className="rounded-[var(--radius)] border bg-[var(--color-surface-2)] p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 font-semibold">
                          <Icon className="size-4 text-[var(--color-brand-500)]" aria-hidden />
                          {meta.label}
                          <span className="text-xs text-[var(--color-muted)]">
                            ({b.count})
                          </span>
                        </span>
                        <span className="tnum font-bold">{formatMoney(b.amountInBill)}</span>
                      </div>
                      {b.byCurrency.length > 1 ||
                      (b.byCurrency[0] && b.byCurrency[0].currency !== r.currency) ? (
                        <ul className="mt-1 flex flex-col gap-0.5 ps-6 text-xs text-[var(--color-muted)]">
                          {b.byCurrency.map((c) => (
                            <li key={c.currency} className="flex justify-between">
                              <span>
                                {c.currency} × {c.count}
                              </span>
                              <span className="tnum">
                                {new Intl.NumberFormat('ar').format(c.amount)} → {formatMoney(c.amountInBill)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </>
      ) : null}
    </div>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-dashed py-1.5 last:border-0">
      <span className="text-sm text-[var(--color-muted)]">{label}</span>
      <span className={`tnum ${strong ? 'text-base font-bold' : 'text-sm font-semibold'}`}>
        {value}
      </span>
    </div>
  );
}
