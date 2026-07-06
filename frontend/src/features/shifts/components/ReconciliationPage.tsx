import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Scale,
  Banknote,
  CreditCard,
  Clock,
  Calculator,
  Coins,
  Plus,
  Trash2,
  BadgeCheck,
  Star,
  Ticket,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { ApiError } from '@/shared/lib/api-client';
import { formatDateTime, formatMoney, formatNumber } from '@/shared/lib/format';
import { usePosSettings } from '@/features/pos-terminal/store/pos-settings.store';
import { useSession } from '@/features/auth';
import type { PaymentMethod } from '@/shared/lib/types';
import type { CustodyDirection } from '@/shared/lib/types';
import {
  useCurrentShift,
  useShiftReconciliation,
  useShiftCount,
  useSettleShift,
  useShiftSettlement,
  useShiftCustody,
  useRecordCustody,
  useShiftVariance,
} from '../api/shifts.api';

/**
 * مطابقة إقفال الوردية (Cashier reconciliation / Z-X report).
 * Shows expected vs actual cash, over/short, and a per-payment-method
 * breakdown for the open shift. GET /shifts/{id}/reconciliation with optional
 * counted actualCash + cashExpenses (live X-report). Proof-verified :3000.
 */
export function ReconciliationPage() {
  const { t } = useTranslation();
  const cashierNo = usePosSettings((s) => s.cashierNo);
  const lastShiftId = usePosSettings((s) => s.lastShiftId);
  const lastShiftNo = usePosSettings((s) => s.lastShiftNo);
  const shiftQ = useCurrentShift(cashierNo);
  const shift = shiftQ.data?.shift ?? null;
  // After close there is no "current" shift — fall back to the last known one
  // so the POST013 count/settle flow stays reachable.
  const effectiveShiftId = shift?.id ?? lastShiftId;
  const effectiveShiftNo = shift?.shiftNo ?? lastShiftNo;

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
      POINTS: { icon: Star, label: t('pos.methodPoints') },
      COUPON: { icon: Ticket, label: t('pos.methodCoupon') },
      PREPAID: { icon: CreditCard, label: t('pos.methodPrepaid') },
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
  if (!effectiveShiftId) {
    return (
      <div className="p-4">
        <EmptyView label={t('recon.noShift')} />
      </div>
    );
  }

  // Closed shift (no open one): show the settlement flow only.
  if (!shift) {
    return (
      <div className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)] gap-4 p-4">
        <h1 className="flex items-center gap-2 text-lg font-bold">
          <Scale className="size-6 text-[var(--color-brand-500)]" aria-hidden />
          {t('recon.title')}
          {effectiveShiftNo != null ? <> — {t('shift.no')} #{effectiveShiftNo}</> : null}
        </h1>
        <DenominationSettlement shiftId={effectiveShiftId} currency="YER" />
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)] gap-4 p-4">
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
              <Line label={t('recon.custodyDeposits')} value={formatMoney(r.custodyDeposits)} />
              <Line
                label={t('recon.custodyWithdrawals')}
                value={`- ${formatMoney(r.custodyWithdrawals)}`}
              />
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
                    : r.overShort === 'SHORT'
                      ? 'bg-[var(--color-danger)]/15 text-[var(--color-danger)]'
                      : 'bg-[var(--color-surface-2)] text-[var(--color-muted)]')
              }
            >
              <span className="font-bold">
                {t('recon.difference')} ·{' '}
                {r.overShort ? t(`recon.status.${r.overShort}`) : t('recon.status.PENDING')}
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
              <Line label={t('recon.billCount')} value={formatNumber(r.billCount)} />
              <Line label={t('recon.netSales')} value={formatMoney(r.netSalesTotal)} />
              <Line label={t('recon.cardTotal')} value={formatMoney(r.cardTotal)} />
              <Line label={t('recon.creditTotal')} value={formatMoney(r.creditTotal)} />
              <Line label={t('recon.tenderTotal')} value={formatMoney(r.tenderTotal)} strong />
            </div>
          </Card>

          {/* POST014 — cashier custody (deposit/withdraw during the shift) */}
          <CustodyPanel shiftId={shift.id} currency={shift.currency} />

          {/* POST013 — cash count by denominations + approved settlement */}
          <DenominationSettlement shiftId={shift.id} currency={shift.currency} />

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
                                {formatNumber(c.amount)} → {formatMoney(c.amountInBill)}
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

/**
 * POST014 — عهدة الكاشيرات: record cash deposits into / withdrawals from the drawer
 * during an open shift. Each movement adjusts the expected cash used by the
 * settlement. POST /shifts/{id}/custody + GET /shifts/{id}/custody.
 */
function CustodyPanel({ shiftId, currency }: { shiftId: string; currency: string }) {
  const { t } = useTranslation();
  const custodyQ = useShiftCustody(shiftId);
  const record = useRecordCustody();
  const [dir, setDir] = useState<CustodyDirection>('DEPOSIT');
  const [amountStr, setAmountStr] = useState('');
  const [reason, setReason] = useState('');
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const totals = custodyQ.data?.totals;
  const movements = custodyQ.data?.movements ?? [];

  const onRecord = async () => {
    setMsg(null);
    const amount = Number(amountStr);
    if (!(amount > 0)) return;
    try {
      await record.mutateAsync({
        id: shiftId,
        dto: { direction: dir, amount, currency, reason: reason.trim() || undefined },
      });
      setAmountStr('');
      setReason('');
      setMsg({ kind: 'ok', text: t('recon.custodySaved') });
    } catch (e) {
      const detail = e instanceof ApiError ? e.problem.detail || e.problem.title : '';
      setMsg({ kind: 'err', text: `${t('recon.custodyError')}${detail ? ` — ${detail}` : ''}` });
    }
  };

  return (
    <Card className="p-4">
      <h2 className="mb-3 flex items-center gap-2 font-bold">
        <Wallet className="size-5 text-[var(--color-brand-500)]" aria-hidden />
        {t('recon.custodySection')}
      </h2>

      <div className="flex flex-wrap items-end gap-2">
        <div className="flex overflow-hidden rounded-[var(--radius)] border">
          <button
            type="button"
            onClick={() => setDir('DEPOSIT')}
            className={`flex items-center gap-1 px-3 py-2 text-sm ${
              dir === 'DEPOSIT'
                ? 'bg-[var(--color-success)]/20 font-bold text-[var(--color-success)]'
                : 'text-[var(--color-muted)]'
            }`}
          >
            <ArrowDownToLine className="size-4" />
            {t('recon.custodyDeposit')}
          </button>
          <button
            type="button"
            onClick={() => setDir('WITHDRAW')}
            className={`flex items-center gap-1 px-3 py-2 text-sm ${
              dir === 'WITHDRAW'
                ? 'bg-[var(--color-danger)]/20 font-bold text-[var(--color-danger)]'
                : 'text-[var(--color-muted)]'
            }`}
          >
            <ArrowUpFromLine className="size-4" />
            {t('recon.custodyWithdraw')}
          </button>
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-[var(--color-muted)]">{t('bills.amount')}</span>
          <Input
            type="number"
            min={0}
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            className="tnum h-10 w-32 text-end"
            placeholder="0"
          />
        </label>
        <label className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-sm text-[var(--color-muted)]">{t('recon.custodyReason')}</span>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="h-10 w-full min-w-0"
          />
        </label>
        <Button
          className="h-10"
          disabled={record.isPending || !(Number(amountStr) > 0)}
          onClick={onRecord}
        >
          {record.isPending ? t('common.saving') : t('recon.custodyRecord')}
        </Button>
      </div>

      {totals ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <Line label={t('recon.custodyDeposits')} value={formatMoney(totals.deposits)} />
          <Line label={t('recon.custodyWithdrawals')} value={formatMoney(totals.withdrawals)} />
          <Line label={t('recon.custodyNet')} value={formatMoney(totals.net)} strong />
        </div>
      ) : null}

      {movements.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-1 text-sm">
          {movements.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between rounded-[var(--radius)] bg-[var(--color-surface-2)] px-3 py-1.5"
            >
              <span className="flex items-center gap-2">
                {m.direction === 'DEPOSIT' ? (
                  <ArrowDownToLine className="size-4 text-[var(--color-success)]" aria-hidden />
                ) : (
                  <ArrowUpFromLine className="size-4 text-[var(--color-danger)]" aria-hidden />
                )}
                <span>{m.reason || (m.direction === 'DEPOSIT' ? t('recon.custodyDeposit') : t('recon.custodyWithdraw'))}</span>
              </span>
              <span className="tnum font-semibold">
                {m.direction === 'WITHDRAW' ? '- ' : ''}
                {formatMoney(m.amountInShift)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {msg ? (
        <p
          role={msg.kind === 'err' ? 'alert' : 'status'}
          className={`mt-3 rounded-md p-2 text-center text-xs ${
            msg.kind === 'ok'
              ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
              : 'bg-[var(--color-danger)]/15 text-[var(--color-danger)]'
          }`}
        >
          {msg.text}
        </p>
      ) : null}
    </Card>
  );
}

/**
 * POST013 — تصفية مبيعات الكاشيرات: enter the counted cash by currency
 * denominations (value × count → amount), save it (POST /shifts/{id}/count),
 * then a supervisor/admin approves the final settlement
 * (POST /shifts/{id}/settle → status SETTLED, irreversible). The live view
 * comes from GET /shifts/{id}/settlement.
 */
function DenominationSettlement({ shiftId, currency }: { shiftId: string; currency: string }) {
  const { t } = useTranslation();
  const role = useSession((s) => s.user?.role);
  const canSettle = role === 'supervisor' || role === 'admin';

  const settlement = useShiftSettlement(shiftId);
  const saveCount = useShiftCount();
  const settle = useSettleShift();

  const [rows, setRows] = useState<{ value: string; count: string }[]>([
    { value: '1000', count: '' },
    { value: '500', count: '' },
    { value: '250', count: '' },
    { value: '100', count: '' },
    { value: '50', count: '' },
  ]);
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const s = settlement.data;
  const settled = s?.status === 'SETTLED';

  const countedTotal = useMemo(
    () =>
      rows.reduce((sum, r) => {
        const v = Number(r.value) || 0;
        const c = Number(r.count) || 0;
        return sum + v * c;
      }, 0),
    [rows],
  );

  const setRow = (i: number, patch: Partial<{ value: string; count: string }>) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const onSaveCount = async () => {
    setMsg(null);
    const denominations = rows
      .map((r) => ({ value: Number(r.value) || 0, count: Number(r.count) || 0 }))
      .filter((d) => d.value > 0 && d.count > 0);
    if (denominations.length === 0) return;
    try {
      await saveCount.mutateAsync({ id: shiftId, dto: { currency, denominations } });
      setMsg({ kind: 'ok', text: t('recon.countSaved') });
    } catch (e) {
      const detail = e instanceof ApiError ? e.problem.detail || e.problem.title : '';
      setMsg({ kind: 'err', text: `${t('recon.countError')}${detail ? ` — ${detail}` : ''}` });
    }
  };

  const onSettle = async () => {
    setMsg(null);
    try {
      const res = await settle.mutateAsync({
        id: shiftId,
        dto: note.trim() ? { note: note.trim() } : {},
      });
      setMsg({
        kind: 'ok',
        text: `${t('recon.settled')} — ${t('recon.difference')}: ${formatMoney(res.difference ?? 0)}`,
      });
    } catch (e) {
      const detail = e instanceof ApiError ? e.problem.detail || e.problem.title : '';
      setMsg({ kind: 'err', text: `${t('recon.settleError')}${detail ? ` — ${detail}` : ''}` });
    }
  };

  return (
    <Card className="p-4">
      <h2 className="mb-3 flex items-center gap-2 font-bold">
        <Coins className="size-5 text-[var(--color-brand-500)]" aria-hidden />
        {t('recon.countSection')}
      </h2>

      {settlement.isLoading ? (
        <LoadingView />
      ) : settled && s ? (
        /* Frozen, approved settlement */
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 rounded-[var(--radius)] bg-[var(--color-success)]/15 p-3 text-[var(--color-success)]">
            <BadgeCheck className="size-5" aria-hidden />
            <span className="font-bold">
              {t('recon.settled')} · {t('recon.shiftStatus.SETTLED')}
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Line label={t('recon.expectedCash')} value={formatMoney(s.expectedCash ?? 0)} />
            <Line label={t('recon.countedTotal')} value={formatMoney(s.countedCash ?? 0)} strong />
            <Line
              label={`${t('recon.difference')}${s.overShort ? ` · ${t(`recon.status.${s.overShort}`)}` : ''}`}
              value={formatMoney(s.difference ?? 0)}
              strong
            />
            <Line label={t('recon.settledAt')} value={s.settledAt ? formatDateTime(s.settledAt) : '—'} />
            {s.settledBy != null ? (
              <Line label={t('recon.settledBy')} value={`#${s.settledBy}`} />
            ) : null}
            {s.settleNote ? <Line label={t('recon.settleNote')} value={s.settleNote} /> : null}
          </div>

          {/* POST015 — posted over/short variance record */}
          <VarianceBadge shiftId={shiftId} />
          {s.denominations.length > 0 ? (
            <table className="mt-2 w-full text-sm">
              <thead className="bg-[var(--color-surface-2)] text-[var(--color-muted)]">
                <tr>
                  <th className="px-3 py-1.5 text-start font-semibold">{t('recon.denomValue')}</th>
                  <th className="px-3 py-1.5 text-end font-semibold">{t('recon.denomCount')}</th>
                  <th className="px-3 py-1.5 text-end font-semibold">{t('recon.denomAmount')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {s.denominations.map((d) => (
                  <tr key={`${d.currency}-${d.value}`}>
                    <td className="tnum px-3 py-1.5">
                      {formatNumber(d.value)} {d.currency}
                    </td>
                    <td className="tnum px-3 py-1.5 text-end">{formatNumber(d.count)}</td>
                    <td className="tnum px-3 py-1.5 text-end font-bold">{formatMoney(d.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
      ) : (
        <>
          {/* Denomination entry */}
          <ul className="flex flex-col gap-2">
            {rows.map((r, i) => {
              const amount = (Number(r.value) || 0) * (Number(r.count) || 0);
              return (
                <li key={i} className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    value={r.value}
                    onChange={(e) => setRow(i, { value: e.target.value })}
                    className="tnum h-9 w-full min-w-0 max-w-28 flex-1 text-end"
                    aria-label={t('recon.denomValue')}
                  />
                  <span className="text-xs text-[var(--color-muted)]">×</span>
                  <Input
                    type="number"
                    min={0}
                    value={r.count}
                    onChange={(e) => setRow(i, { count: e.target.value })}
                    className="tnum h-9 w-full min-w-0 max-w-24 flex-1 text-end"
                    placeholder="0"
                    aria-label={t('recon.denomCount')}
                  />
                  <span className="tnum ms-auto text-sm font-semibold">
                    {amount > 0 ? formatMoney(amount) : '—'}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-[var(--color-danger)]"
                    onClick={() => setRows((rs) => rs.filter((_, idx) => idx !== i))}
                    aria-label={t('pos.remove')}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              );
            })}
          </ul>

          <div className="mt-2 flex items-center justify-between">
            <Button
              variant="ghost"
              className="h-8 text-xs"
              onClick={() => setRows((rs) => [...rs, { value: '', count: '' }])}
            >
              <Plus className="size-4" />
              {t('recon.addDenom')}
            </Button>
            <p className="text-sm">
              {t('recon.countedTotal')}:{' '}
              <span className="tnum font-extrabold">{formatMoney(countedTotal)}</span>
            </p>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              className="h-10"
              disabled={countedTotal <= 0 || saveCount.isPending}
              onClick={onSaveCount}
            >
              {saveCount.isPending ? t('recon.savingCount') : t('recon.saveCount')}
            </Button>
            {s?.countedCash != null ? (
              <span className="text-xs text-[var(--color-muted)]">
                {t('recon.countedTotal')} ({t('recon.statusLabel')}):{' '}
                <span className="tnum font-bold">{formatMoney(s.countedCash)}</span>
                {s.difference != null ? (
                  <>
                    {' · '}
                    {t('recon.difference')}:{' '}
                    <span className="tnum font-bold">{formatMoney(s.difference)}</span>
                  </>
                ) : null}
              </span>
            ) : null}
          </div>

          {/* Approved settlement (supervisor/admin, shift must be CLOSED) */}
          {canSettle ? (
            <div className="mt-4 border-t pt-3">
              <h3 className="mb-2 font-bold">{t('recon.settleSection')}</h3>
              <p className="mb-2 text-xs text-[var(--color-muted)]">{t('recon.settleHint')}</p>
              <div className="flex flex-wrap items-end gap-2">
                <label className="flex min-w-0 flex-col gap-1">
                  <span className="text-sm text-[var(--color-muted)]">{t('recon.settleNote')}</span>
                  <Input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="h-10 w-full min-w-0 max-w-64"
                  />
                </label>
                <Button
                  variant="success"
                  className="h-10"
                  disabled={settle.isPending}
                  onClick={onSettle}
                >
                  <BadgeCheck className="size-4" />
                  {settle.isPending ? t('recon.settling') : t('recon.settle')}
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}

      {msg ? (
        <p
          role={msg.kind === 'err' ? 'alert' : 'status'}
          className={`mt-3 rounded-md p-2 text-center text-xs ${
            msg.kind === 'ok'
              ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
              : 'bg-[var(--color-danger)]/15 text-[var(--color-danger)]'
          }`}
        >
          {msg.text}
        </p>
      ) : null}
    </Card>
  );
}

/**
 * POST015 — فائض/عجز الكاشيرات: shows the posted over/short variance record
 * for a settled shift (GET /shifts/{id}/variance).
 */
function VarianceBadge({ shiftId }: { shiftId: string }) {
  const { t } = useTranslation();
  const q = useShiftVariance(shiftId);
  const v = q.data;
  if (!v) return null;
  const tone =
    v.kind === 'BALANCED'
      ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
      : v.kind === 'OVER'
        ? 'bg-[var(--color-brand-600)]/15 text-[var(--color-brand-100)]'
        : 'bg-[var(--color-danger)]/15 text-[var(--color-danger)]';
  return (
    <div className={`mt-1 flex items-center justify-between rounded-[var(--radius)] p-3 ${tone}`}>
      <span className="flex items-center gap-2 font-bold">
        <AlertTriangle className="size-4" aria-hidden />
        {t('recon.variancePosted')} #{v.varianceNo} · {t(`recon.status.${v.kind}`)}
      </span>
      <span className="tnum text-lg font-extrabold">{formatMoney(v.difference)}</span>
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
