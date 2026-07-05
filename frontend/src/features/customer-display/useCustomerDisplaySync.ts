/**
 * Cashier-side publisher — mounts inside PosPage and mirrors every cart
 * mutation to the customer display over the BroadcastChannel.
 *
 * Implementation notes:
 * - Subscribes to the Zustand cart store directly (`useCart.subscribe`), so
 *   ANY mutation path (scanner, item grid, qty steppers, held-bill resume,
 *   clear) is broadcast without touching those call-sites.
 * - Answers the display's 'hello' message with a fresh snapshot so a display
 *   opened mid-sale catches up instantly (late-join).
 */
import { useEffect } from 'react';
import {
  useCart,
  computeTotals,
  lineTotal,
  type CartLine,
  type CartCustomer,
} from '@/features/pos-terminal/store/cart.store';
import {
  CUSTOMER_DISPLAY_CHANNEL,
  displayChannelSupported,
  type CartMessage,
  type DisplayLine,
  type DisplayMessage,
} from './channel';

function toDisplayLines(lines: CartLine[]): DisplayLine[] {
  return lines.map((l) => ({
    code: l.code,
    name: l.name?.trim() || l.code,
    qty: l.qty,
    unit: l.unit,
    price: l.price,
    lineTotal: lineTotal(l),
  }));
}

function snapshotMessage(
  lines: CartLine[],
  billDiscount: number,
  customer: CartCustomer | null,
): CartMessage {
  return {
    type: 'cart',
    lines: toDisplayLines(lines),
    totals: computeTotals(lines, billDiscount),
    customerName: customer?.name ?? null,
  };
}

export function useCustomerDisplaySync(): void {
  useEffect(() => {
    if (!displayChannelSupported()) return;
    const ch = new BroadcastChannel(CUSTOMER_DISPLAY_CHANNEL);

    const publish = () => {
      const s = useCart.getState();
      ch.postMessage(snapshotMessage(s.lines, s.billDiscount, s.customer));
    };

    // Push the current state immediately (display may already be open),
    // then mirror every store mutation.
    publish();
    const unsubscribe = useCart.subscribe(publish);

    // Late-join: a freshly-opened display asks for the current state.
    ch.onmessage = (ev: MessageEvent<DisplayMessage>) => {
      if (ev.data?.type === 'hello') publish();
    };

    return () => {
      unsubscribe();
      ch.close();
    };
  }, []);
}
