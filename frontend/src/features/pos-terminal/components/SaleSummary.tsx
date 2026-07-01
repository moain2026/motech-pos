import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Banknote, CheckCircle2, CreditCard, Trash2, Wallet } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { ApiError } from '@/shared/lib/api-client';
import { formatMoney } from '@/shared/lib/format';
import { useCreateBill, usePayBill } from '@/features/bills/api/bills.api';
import { useCurrentShift } from '@/features/shifts/api/shifts.api';
import type { PaymentMethod, PostBillLineDto } from '@/shared/lib/types';
import { useCart } from '../store/cart.store';
import { useCartTotals } from '../hooks/useCartTotals';
import { usePosSettings } from '../store/pos-settings.store';
import { CustomerAttach } from './CustomerAttach';
import { HeldBillsControls } from './HeldBills';
import { PaymentDialog } from './PaymentDialog';

/**
 * Bill summary + payment actions — REAL write path (proof-verified):
 *   POST /bills (Idempotency-Key) → POST /bills/{id}/payments.
 * Selling requires an open shift for the configured cashierNo (otherwise the
 * pay buttons are disabled with a clear notice). RFC 9457 problem details
 * (incl. traceId) are surfaced on failure.
 */
export function SaleSummary() {
  const { t } = useTranslation();
  const totals = useCartTotals();
  const billDiscount = useCart((s) => s.billDiscount);
  const setBillDiscount = useCart((s) => s.setBillDiscount);
  const clear = useCart((s) => s.clear);
  const lines = useCart((s) => s.lines);
  const customer = useCart((s) => s.customer);

  const cashierNo = usePosSettings((s) => s.cashierNo);
  const machineNo = usePosSettings((s) => s.machineNo);
  const shiftQ = useCurrentShift(cashierNo);
  const hasShift = !!shiftQ.data?.shift;

  const createBill = useCreateBill();
  const payBill = usePayBill();

  const [done, setDone] = useState<{ billNo: string; net: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Enhanced multi-tender flow: bill is created (unpaid) then settled via dialog.
  const [payTarget, setPayTarget] = useState<{ id: string; billNo: string; net: number } | null>(
    null,
  );

  const busy = createBill.isPending || payBill.isPending;
  const empty = lines.length === 0;
  const disabled = empty || !hasShift || busy;

  const billLinesDto = (): PostBillLineDto[] =>
    lines.map((l) => ({
      itemCode: l.code,
      qty: l.qty,
      unitPrice: l.price,
      discDtl: l.lineDiscount > 0 ? l.lineDiscount / Math.max(1, l.qty) : 0,
    }));

  // Enhanced payment: create the bill (unpaid), then open the multi-tender dialog.
  const openMultiPay = async () => {
    setError(null);
    setDone(null);
    try {
      const bill = await createBill.mutateAsync({
        cashierNo,
        machineNo,
        customerCode: customer?.code,
        customerName: customer?.name ?? 'Walk-in',
        currency: 'YER',
        taxCalcType: 2,
        headerDiscount: billDiscount || 0,
        lines: billLinesDto(),
      });
      setPayTarget({ id: bill.id, billNo: bill.billNo, net: bill.netAmt });
    } catch (e) {
      if (e instanceof ApiError) {
        const trace = e.problem.traceId ? ` (traceId: ${e.problem.traceId})` : '';
        setError(`${t('pos.saleError')}: ${e.problem.detail || e.problem.title}${trace}`);
      } else {
        setError(t('pos.saleError'));
      }
    }
  };

  const sell = async (method: PaymentMethod) => {
    setError(null);
    setDone(null);
    const billLines: PostBillLineDto[] = lines.map((l) => ({
      itemCode: l.code,
      qty: l.qty,
      unitPrice: l.price,
      discDtl: l.lineDiscount > 0 ? l.lineDiscount / Math.max(1, l.qty) : 0,
    }));
    try {
      // 1) Create the bill (idempotent — uuid Idempotency-Key set in the hook).
      const bill = await createBill.mutateAsync({
        cashierNo,
        machineNo,
        customerCode: customer?.code,
        customerName: customer?.name ?? 'Walk-in',
        currency: 'YER',
        taxCalcType: 2,
        headerDiscount: billDiscount || 0,
        lines: billLines,
      });
      // 2) Pay the full net amount with the chosen method.
      await payBill.mutateAsync({
        id: bill.id,
        dto: { method, amount: bill.netAmt, currency: 'YER' },
      });
      setDone({ billNo: bill.billNo, net: bill.netAmt });
      clear();
    } catch (e) {
      if (e instanceof ApiError) {
        const trace = e.problem.traceId ? ` (traceId: ${e.problem.traceId})` : '';
        setError(`${t('pos.saleError')}: ${e.problem.detail || e.problem.title}${trace}`);
      } else {
        setError(t('pos.saleError'));
      }
    }
  };

  // Success screen.
  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 border-t p-6 text-center">
        <CheckCircle2 className="size-12 text-[var(--color-success)]" aria-hidden />
        <div>
          <p className="font-bold">
            {t('pos.saleDone')} {done.billNo}
          </p>
          <p className="tnum mt-1 text-2xl font-extrabold text-[var(--color-brand-100)]">
            {formatMoney(done.net)}
          </p>
        </div>
        <Button size="lg" variant="primary" className="w-full" onClick={() => setDone(null)}>
          {t('pos.newSale')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 border-t p-4">
      {payTarget ? (
        <PaymentDialog
          billId={payTarget.id}
          billNo={payTarget.billNo}
          billCurrency="YER"
          netAmt={payTarget.net}
          onClose={() => setPayTarget(null)}
          onSettled={() => {
            setDone({ billNo: payTarget.billNo, net: payTarget.net });
            setPayTarget(null);
            clear();
          }}
        />
      ) : null}

      <CustomerAttach />
      <HeldBillsControls hasShift={hasShift} />
      <Row label={t('pos.subtotal')} value={formatMoney(totals.gross)} />

      <div className="flex items-center justify-between gap-2">
        <label htmlFor="bill-disc" className="text-sm text-[var(--color-muted)]">
          {t('pos.discountInput')}
        </label>
        <Input
          id="bill-disc"
          type="number"
          min={0}
          value={billDiscount || ''}
          onChange={(e) => setBillDiscount(Number(e.target.value) || 0)}
          className="tnum h-9 w-28 text-end"
          placeholder="0"
        />
      </div>

      {totals.vat > 0 ? <Row label={t('pos.vat')} value={formatMoney(totals.vat)} /> : null}

      <div className="flex items-center justify-between border-t pt-3">
        <span className="text-base font-bold">{t('pos.total')}</span>
        <span className="tnum text-2xl font-extrabold text-[var(--color-brand-100)]">
          {formatMoney(totals.net)}
        </span>
      </div>

      {!hasShift && !empty ? (
        <p
          role="status"
          className="rounded-md bg-[var(--color-warning)]/15 p-2 text-center text-xs text-[var(--color-warning)]"
        >
          {t('pos.needShift')}
        </p>
      ) : null}

      {busy ? (
        <p role="status" className="text-center text-xs text-[var(--color-muted)]">
          {createBill.isPending ? t('pos.saving') : t('pos.paying')}
        </p>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="rounded-md bg-[var(--color-danger)]/15 p-2 text-center text-xs text-[var(--color-danger)]"
        >
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <Button size="lg" variant="success" disabled={disabled} onClick={() => sell('CASH')}>
          <Banknote className="size-5" />
          {t('pos.pay')}
        </Button>
        <Button size="lg" variant="primary" disabled={disabled} onClick={() => sell('CARD')}>
          <CreditCard className="size-5" />
          {t('pos.payCard')}
        </Button>
      </div>

      <Button size="lg" variant="outline" disabled={disabled} onClick={openMultiPay}>
        <Wallet className="size-5" />
        {t('payMulti.button')}
      </Button>

      <Button
        variant="ghost"
        className="text-[var(--color-danger)]"
        disabled={empty || busy}
        onClick={() => {
          clear();
          setError(null);
        }}
      >
        <Trash2 className="size-4" />
        {t('pos.clear')}
      </Button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[var(--color-muted)]">{label}</span>
      <span className="tnum font-semibold">{value}</span>
    </div>
  );
}
