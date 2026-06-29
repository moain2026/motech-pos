import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Banknote, CreditCard, Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { formatMoney } from '@/shared/lib/format';
import { useCart } from '../store/cart.store';
import { useCartTotals } from '../hooks/useCartTotals';

/**
 * Bill summary + payment actions.
 * NOTE: the backend in this phase is READ-ONLY (no POST /bills yet — verified
 * against openapi.json). So "pay" computes & shows the sale locally and surfaces
 * a clear notice rather than faking a save. Totals math matches the backend
 * domain (gross - discount + vat).
 */
export function SaleSummary() {
  const { t } = useTranslation();
  const totals = useCartTotals();
  const billDiscount = useCart((s) => s.billDiscount);
  const setBillDiscount = useCart((s) => s.setBillDiscount);
  const clear = useCart((s) => s.clear);
  const lineCount = useCart((s) => s.lines.length);
  const [notice, setNotice] = useState<string | null>(null);

  const disabled = lineCount === 0;

  const onPay = () => {
    // Read-only backend: no save endpoint. Surface the computed sale + notice.
    setNotice(t('pos.saveDisabled'));
  };

  return (
    <div className="flex flex-col gap-3 border-t p-4">
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

      {notice ? (
        <p
          role="status"
          className="rounded-md bg-[var(--color-warning)]/15 p-2 text-center text-xs text-[var(--color-warning)]"
        >
          {notice}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <Button size="lg" variant="success" disabled={disabled} onClick={onPay}>
          <Banknote className="size-5" />
          {t('pos.pay')}
        </Button>
        <Button size="lg" variant="primary" disabled={disabled} onClick={onPay}>
          <CreditCard className="size-5" />
          {t('pos.payCard')}
        </Button>
      </div>

      <Button
        variant="ghost"
        className="text-[var(--color-danger)]"
        disabled={disabled}
        onClick={() => {
          clear();
          setNotice(null);
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
