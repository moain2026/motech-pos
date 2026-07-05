/**
 * Customer-facing display — live sync channel (POSADVS_SCND).
 *
 * The cashier screen (PosPage) is the single publisher; the customer display
 * (/customer-display, opened in a second window/monitor) is the subscriber.
 * Transport: BroadcastChannel (same-origin tabs/windows — exactly the
 * "second screen on the same POS machine" topology). No backend round-trip:
 * every cart mutation is pushed instantly (<1ms), which is what makes this a
 * genuinely *live* display (a feature classic Onyx POST001 never had).
 *
 * Protocol (all messages are plain JSON-serializable objects):
 *   cashier → display : 'cart'      full cart snapshot + totals
 *   cashier → display : 'sale-done' payment settled (bill no, amounts, QR TLV)
 *   cashier → display : 'new-sale'  cashier started a fresh sale (reset to welcome)
 *   display → cashier : 'hello'     late-join request → cashier re-sends state
 */
import type { CartTotals } from '@/features/pos-terminal/store/cart.store';

export const CUSTOMER_DISPLAY_CHANNEL = 'motech-pos-customer-display';

/** Slim line shape sent over the wire (only what the customer needs to see). */
export interface DisplayLine {
  code: string;
  name: string;
  qty: number;
  unit: string | null;
  price: number;
  lineTotal: number;
}

export interface CartMessage {
  type: 'cart';
  lines: DisplayLine[];
  totals: CartTotals;
  customerName: string | null;
}

export interface SaleDoneMessage {
  type: 'sale-done';
  billNo: string;
  net: number;
  paid: number;
  change: number;
  vat: number;
  /** Base64 ZATCA-style TLV payload for the e-invoice QR (may be empty). */
  qrPayload: string;
}

export interface NewSaleMessage {
  type: 'new-sale';
}

export interface HelloMessage {
  type: 'hello';
}

export type DisplayMessage = CartMessage | SaleDoneMessage | NewSaleMessage | HelloMessage;

/** Feature-detect (BroadcastChannel is universal in evergreen browsers). */
export function displayChannelSupported(): boolean {
  return typeof BroadcastChannel !== 'undefined';
}

let publisher: BroadcastChannel | null = null;

/** Lazy singleton channel for one-off publishes (sale-done / new-sale). */
function getPublisher(): BroadcastChannel | null {
  if (!displayChannelSupported()) return null;
  if (!publisher) publisher = new BroadcastChannel(CUSTOMER_DISPLAY_CHANNEL);
  return publisher;
}

export function publishToDisplay(msg: DisplayMessage): void {
  getPublisher()?.postMessage(msg);
}

/** Open (or focus) the customer display in a separate window. */
export function openCustomerDisplay(): void {
  window.open(
    '/customer-display',
    'motech-customer-display',
    'noopener=no,width=1024,height=768',
  );
}
