import { useShallow } from 'zustand/react/shallow';
import { useCart, computeTotals, type CartTotals } from '../store/cart.store';

/** Derived totals from the cart store (recomputed on line/discount changes). */
export function useCartTotals(): CartTotals {
  return useCart(
    useShallow((s) => computeTotals(s.lines, s.billDiscount, s.promoDiscount)),
  );
}
