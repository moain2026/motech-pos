import { useTranslation } from 'react-i18next';
import { ShoppingCart } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { ShiftBar } from '@/features/shifts/components/ShiftBar';
import { ItemGrid } from './ItemGrid';
import { Cart } from './Cart';
import { SaleSummary } from './SaleSummary';
import { useCart } from '../store/cart.store';

/**
 * POST001 — Sales bill screen (heart of the POS).
 * Layout inspired by the original Onyx POST001: item grid (left/main) +
 * cart & payment summary (side). Touch-first, RTL.
 */
export function PosPage() {
  const { t } = useTranslation();
  const qtyCount = useCart((s) => s.lines.reduce((n, l) => n + l.qty, 0));

  return (
    <div className="grid h-full grid-rows-[auto_minmax(0,1fr)] gap-4 p-4">
      {/* Shift / cashier header + open/close (POST027 context) */}
      <ShiftBar />

      {/* Main: items grid + cart panel */}
      <div className="grid min-h-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="min-h-0 overflow-hidden p-3">
          <ItemGrid />
        </Card>

        <Card className="flex min-h-0 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="flex items-center gap-2 font-bold">
              <ShoppingCart className="size-5 text-[var(--color-brand-500)]" aria-hidden />
              {t('pos.cart')}
            </h2>
            <span className="tnum rounded-full bg-[var(--color-surface-2)] px-2 py-0.5 text-xs">
              {qtyCount}
            </span>
          </div>
          <Cart />
          <SaleSummary />
        </Card>
      </div>
    </div>
  );
}
