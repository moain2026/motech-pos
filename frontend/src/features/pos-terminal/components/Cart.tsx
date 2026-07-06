import { useTranslation } from 'react-i18next';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { formatMoney } from '@/shared/lib/format';
import { useCart, lineTotal } from '../store/cart.store';

export function Cart() {
  const { t } = useTranslation();
  const lines = useCart((s) => s.lines);
  const incQty = useCart((s) => s.incQty);
  const setQty = useCart((s) => s.setQty);
  const removeLine = useCart((s) => s.removeLine);

  if (lines.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-[var(--color-muted)]">
        <ShoppingCart className="size-10" aria-hidden />
        <p className="text-sm">{t('pos.cartEmpty')}</p>
      </div>
    );
  }

  return (
    <ul className="flex-1 divide-y overflow-y-auto scroll-thin" aria-label={t('pos.cart')}>
      {lines.map((l) => (
        <li key={l.code} className="flex items-center gap-2 p-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {l.name?.trim() || l.code}
            </p>
            <p className="tnum text-xs text-[var(--color-muted)]">
              {l.code} · {formatMoney(l.price)}
              {l.unit ? ` / ${l.unit}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-10 shrink-0"
              onClick={() => incQty(l.code, -1)}
              aria-label={t('pos.qty') + ' -'}
            >
              <Minus className="size-4" />
            </Button>
            <input
              type="number"
              min={0}
              value={l.qty}
              onChange={(e) => setQty(l.code, Number(e.target.value))}
              className="tnum h-10 w-12 rounded-md border bg-[var(--color-surface-2)] text-center text-[length:var(--text-sm)]"
              aria-label={t('pos.qty')}
            />
            <Button
              variant="outline"
              size="icon"
              className="size-10 shrink-0"
              onClick={() => incQty(l.code, 1)}
              aria-label={t('pos.qty') + ' +'}
            >
              <Plus className="size-4" />
            </Button>
          </div>

          <div className="tnum w-20 shrink-0 text-end text-[length:var(--text-sm)] font-bold sm:w-24">
            {formatMoney(lineTotal(l))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="size-10 shrink-0 text-[var(--color-danger)]"
            onClick={() => removeLine(l.code)}
            aria-label={t('pos.remove')}
          >
            <Trash2 className="size-4" />
          </Button>
        </li>
      ))}
    </ul>
  );
}
