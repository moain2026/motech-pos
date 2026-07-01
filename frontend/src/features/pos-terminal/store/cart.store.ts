import { create } from 'zustand';
import type { Item } from '@/shared/lib/types';

/**
 * Cart (client state — Zustand). One open sale at a time.
 *
 * Totals math mirrors the backend domain (`Bill.totals()` /
 * IAS_POS_BILL_DTL): per line  net = qty*price - lineDiscount + lineVat.
 * Bill-level discount is applied on top of the gross. The current YSPOS23
 * dataset has zero VAT/discount, so VAT defaults to 0; the shape is kept so
 * tax can be enabled without restructuring.
 */
export interface CartLine {
  code: string;
  name: string | null;
  barcode: string | null;
  unit: string | null;
  price: number;
  qty: number;
  /** per-line discount amount (absolute). */
  lineDiscount: number;
  /** per-line vat amount (absolute). */
  lineVat: number;
}

export interface CartTotals {
  gross: number; // Σ qty*price
  discount: number; // line discounts + bill discount
  vat: number; // Σ line vat
  net: number; // gross - discount + vat
  itemCount: number; // distinct lines
  qtyCount: number; // total quantity
}

/** Customer attached to the open sale (optional). */
export interface CartCustomer {
  code: string;
  name: string;
}

interface CartState {
  lines: CartLine[];
  billDiscount: number;
  customer: CartCustomer | null;
  addItem: (item: Item) => void;
  setQty: (code: string, qty: number) => void;
  incQty: (code: string, delta: number) => void;
  removeLine: (code: string) => void;
  setBillDiscount: (amount: number) => void;
  setCustomer: (c: CartCustomer | null) => void;
  clear: () => void;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export const useCart = create<CartState>((set) => ({
  lines: [],
  billDiscount: 0,
  customer: null,
  addItem: (item) =>
    set((state) => {
      const existing = state.lines.find((l) => l.code === item.code);
      if (existing) {
        return {
          lines: state.lines.map((l) =>
            l.code === item.code ? { ...l, qty: l.qty + 1 } : l,
          ),
        };
      }
      const line: CartLine = {
        code: item.code,
        name: item.name,
        barcode: item.barcode,
        unit: item.unit,
        price: item.lastPrice ?? 0,
        qty: 1,
        lineDiscount: 0,
        lineVat: 0,
      };
      return { lines: [...state.lines, line] };
    }),
  setQty: (code, qty) =>
    set((state) => ({
      lines: state.lines
        .map((l) => (l.code === code ? { ...l, qty: Math.max(0, qty) } : l))
        .filter((l) => l.qty > 0),
    })),
  incQty: (code, delta) =>
    set((state) => ({
      lines: state.lines
        .map((l) => (l.code === code ? { ...l, qty: Math.max(0, l.qty + delta) } : l))
        .filter((l) => l.qty > 0),
    })),
  removeLine: (code) =>
    set((state) => ({ lines: state.lines.filter((l) => l.code !== code) })),
  setBillDiscount: (amount) => set({ billDiscount: Math.max(0, amount) }),
  setCustomer: (c) => set({ customer: c }),
  clear: () => set({ lines: [], billDiscount: 0, customer: null }),
}));

/** Pure totals selector (used by useCartTotals hook). */
export function computeTotals(lines: CartLine[], billDiscount: number): CartTotals {
  let gross = 0;
  let lineDisc = 0;
  let vat = 0;
  let qtyCount = 0;
  for (const l of lines) {
    gross += l.price * l.qty;
    lineDisc += l.lineDiscount;
    vat += l.lineVat;
    qtyCount += l.qty;
  }
  const discount = lineDisc + billDiscount;
  const net = Math.max(0, gross - discount + vat);
  return {
    gross: round2(gross),
    discount: round2(discount),
    vat: round2(vat),
    net: round2(net),
    itemCount: lines.length,
    qtyCount,
  };
}

export function lineTotal(l: CartLine): number {
  return round2(l.price * l.qty - l.lineDiscount + l.lineVat);
}
