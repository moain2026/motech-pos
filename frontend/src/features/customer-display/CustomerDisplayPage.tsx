/**
 * POSADVS_SCND — Customer-facing display (شاشة العميل).
 *
 * Runs full-screen in a second window/monitor/tablet facing the customer and
 * mirrors the cashier's cart in real time over a BroadcastChannel (see
 * channel.ts). Three states:
 *   idle      → welcome branding screen
 *   cart      → live invoice lines + big running total
 *   sale-done → thank-you + paid/change + e-invoice QR
 *
 * Standalone route (/customer-display): no app chrome, no auth — it renders
 * nothing but what the cashier broadcasts inside the same browser profile.
 */
import { useEffect, useMemo, useRef, useState } from 'react';

import { Store, ShoppingBasket, Sparkles } from 'lucide-react';
import { formatMoney } from '@/shared/lib/format';
import { useStoreConfig } from '@/shared/config/store-config.store';
import {
  CUSTOMER_DISPLAY_CHANNEL,
  displayChannelSupported,
  type CartMessage,
  type DisplayMessage,
  type SaleDoneMessage,
} from './channel';

type ViewState =
  | { kind: 'idle' }
  | { kind: 'cart'; cart: CartMessage }
  | { kind: 'done'; done: SaleDoneMessage };

export function CustomerDisplayPage() {
  const storeName = useStoreConfig((s) => s.storeName);
  const storeSubtitle = useStoreConfig((s) => s.storeSubtitle);
  const footerNote = useStoreConfig((s) => s.footerNote);

  const [view, setView] = useState<ViewState>({ kind: 'idle' });
  const [clock, setClock] = useState(() => new Date());
  const listEndRef = useRef<HTMLDivElement | null>(null);

  // Live clock in the header (nice touch for an idle screen).
  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Subscribe to the cashier channel + late-join handshake.
  useEffect(() => {
    if (!displayChannelSupported()) return;
    const ch = new BroadcastChannel(CUSTOMER_DISPLAY_CHANNEL);
    ch.onmessage = (ev: MessageEvent<DisplayMessage>) => {
      const msg = ev.data;
      if (!msg || typeof msg !== 'object') return;
      if (msg.type === 'cart') {
        // While the thank-you screen is up, ignore empty-cart echoes (the
        // cashier clears the cart right after payment); a real new sale
        // arrives either as 'new-sale' or a cart with lines.
        setView((v) => {
          if (v.kind === 'done' && msg.lines.length === 0) return v;
          return msg.lines.length > 0 ? { kind: 'cart', cart: msg } : { kind: 'idle' };
        });
      } else if (msg.type === 'sale-done') {
        setView({ kind: 'done', done: msg });
      } else if (msg.type === 'new-sale') {
        setView({ kind: 'idle' });
      }
    };
    // Ask the cashier window for the current state (late-join).
    ch.postMessage({ type: 'hello' } satisfies DisplayMessage);
    return () => ch.close();
  }, []);

  // Keep the newest line visible on long invoices.
  useEffect(() => {
    if (view.kind === 'cart') {
      listEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [view]);

  return (
    <div
      dir="rtl"
      className="flex h-dvh flex-col overflow-hidden bg-gradient-to-br from-[#07101f] via-[#0b1a2e] to-[#0c2321] text-[var(--color-fg)]"
    >
      {/* Header — branding */}
      <header className="flex items-center justify-between gap-4 border-b border-white/10 bg-white/[0.03] px-8 py-5 backdrop-blur">
        <div className="flex items-center gap-4">
          <div className="grid size-14 place-items-center rounded-2xl bg-[var(--color-brand-500)]/20 ring-1 ring-[var(--color-brand-500)]/40">
            <Store className="size-8 text-[var(--color-brand-500)]" aria-hidden />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{storeName}</h1>
            <p className="text-sm text-[var(--color-muted)]">{storeSubtitle}</p>
          </div>
        </div>
        <time className="tnum text-2xl font-bold text-[var(--color-muted)]">
          {clock.toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
        </time>
      </header>

      {view.kind === 'idle' ? <IdleView storeName={storeName} /> : null}
      {view.kind === 'cart' ? <CartView cart={view.cart} endRef={listEndRef} /> : null}
      {view.kind === 'done' ? <DoneView done={view.done} footerNote={footerNote} /> : null}
    </div>
  );
}

/* ---------------------------------- idle --------------------------------- */

function IdleView({ storeName }: { storeName: string }) {
  return (
    <main className="grid flex-1 place-items-center p-8 text-center">
      <div className="flex flex-col items-center gap-6">
        <div className="grid size-28 animate-pulse place-items-center rounded-full bg-[var(--color-brand-500)]/15 ring-2 ring-[var(--color-brand-500)]/30">
          <Sparkles className="size-14 text-[var(--color-brand-500)]" aria-hidden />
        </div>
        <h2 className="text-5xl font-extrabold leading-tight">
          أهلاً وسهلاً بكم في
          <span className="mt-2 block text-[var(--color-brand-500)]">{storeName}</span>
        </h2>
        <p className="text-xl text-[var(--color-muted)]">يسعدنا خدمتكم — تفضّلوا</p>
      </div>
    </main>
  );
}

/* ---------------------------------- cart --------------------------------- */

function CartView({
  cart,
  endRef,
}: {
  cart: CartMessage;
  endRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { lines, totals } = cart;
  return (
    <main className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto]">
      {/* Invoice lines */}
      <section className="min-h-0 overflow-y-auto px-6 py-4 md:px-10" aria-label="أصناف الفاتورة">
        <table className="w-full border-separate border-spacing-y-2 text-lg md:text-xl">
          <thead className="sticky top-0 z-10 bg-[var(--color-surface)]/95 text-sm text-[var(--color-muted)] md:text-base">
            <tr>
              <th className="pb-2 pe-2 text-start font-semibold">الصنف</th>
              <th className="pb-2 px-2 text-center font-semibold">الكمية</th>
              <th className="pb-2 px-2 text-end font-semibold">السعر</th>
              <th className="pb-2 ps-2 text-end font-semibold">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (
              <tr
                key={l.code}
                className={`rounded-xl ${i === lines.length - 1 ? 'bg-[var(--color-brand-500)]/10 ring-1 ring-[var(--color-brand-500)]/30' : 'bg-white/[0.04]'}`}
              >
                <td className="rounded-e-xl px-4 py-3 font-semibold">
                  {l.name}
                  {l.unit ? (
                    <span className="ms-2 text-sm font-normal text-[var(--color-muted)]">
                      ({l.unit})
                    </span>
                  ) : null}
                </td>
                <td className="tnum px-2 py-3 text-center">{formatQty(l.qty)}</td>
                <td className="tnum px-2 py-3 text-end text-[var(--color-muted)]">
                  {formatMoney(l.price)}
                </td>
                <td className="tnum rounded-s-xl px-4 py-3 text-end font-bold">
                  {formatMoney(l.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div ref={endRef} />
      </section>

      {/* Totals bar */}
      <section className="border-t border-white/10 bg-white/[0.04] px-6 py-5 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex items-center gap-6 text-lg text-[var(--color-muted)]">
            <span className="flex items-center gap-2">
              <ShoppingBasket className="size-6" aria-hidden />
              <span className="tnum font-bold text-[var(--color-fg)]">{totals.itemCount}</span> صنف
            </span>
            {totals.discount > 0 ? (
              <span>
                الخصم{' '}
                <span className="tnum font-bold text-[var(--color-warning)]">
                  {formatMoney(totals.discount)}
                </span>
              </span>
            ) : null}
            {totals.vat > 0 ? (
              <span>
                الضريبة{' '}
                <span className="tnum font-bold text-[var(--color-fg)]">
                  {formatMoney(totals.vat)}
                </span>
              </span>
            ) : null}
          </div>
          <div className="text-end">
            <p className="text-lg text-[var(--color-muted)]">الإجمالي المطلوب</p>
            <p className="tnum text-6xl font-black leading-tight text-[var(--color-brand-500)] md:text-7xl">
              {formatMoney(totals.net)}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------------------------------- done --------------------------------- */

function DoneView({ done, footerNote }: { done: SaleDoneMessage; footerNote: string }) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    if (!done.qrPayload) {
      setQrUrl(null);
      return;
    }
    // qrcode is loaded lazily (own chunk) — only needed on the thank-you view.
    import('qrcode')
      .then(({ default: QRCode }) =>
        QRCode.toDataURL(done.qrPayload, {
          errorCorrectionLevel: 'M',
          margin: 1,
          width: 280,
        }),
      )
      .then((url) => {
        if (alive) setQrUrl(url);
      })
      .catch(() => setQrUrl(null));
    return () => {
      alive = false;
    };
  }, [done.qrPayload]);

  const rows = useMemo(
    () =>
      [
        { label: 'الإجمالي', value: done.net, strong: true },
        { label: 'المدفوع', value: done.paid, strong: false },
        { label: 'الباقي', value: done.change, strong: false },
      ].filter((r) => r.strong || r.value > 0),
    [done],
  );

  return (
    <main className="grid flex-1 place-items-center overflow-y-auto p-8">
      <div className="flex w-full max-w-3xl flex-col items-center gap-8 text-center">
        <div className="grid size-24 place-items-center rounded-full bg-[var(--color-success)]/15 ring-2 ring-[var(--color-success)]/40">
          <Sparkles className="size-12 text-[var(--color-success)]" aria-hidden />
        </div>
        <div>
          <h2 className="text-5xl font-extrabold">{footerNote}</h2>
          <p className="mt-2 text-xl text-[var(--color-muted)]">
            فاتورة رقم <span className="tnum font-bold text-[var(--color-fg)]">{done.billNo}</span>
          </p>
        </div>

        <dl className="grid w-full max-w-md gap-3">
          {rows.map((r) => (
            <div
              key={r.label}
              className={`flex items-center justify-between rounded-2xl px-6 py-4 ${
                r.strong
                  ? 'bg-[var(--color-brand-500)]/15 ring-1 ring-[var(--color-brand-500)]/40'
                  : 'bg-white/[0.05]'
              }`}
            >
              <dt className="text-xl text-[var(--color-muted)]">{r.label}</dt>
              <dd
                className={`tnum font-black ${r.strong ? 'text-4xl text-[var(--color-brand-500)]' : 'text-2xl'}`}
              >
                {formatMoney(r.value)}
              </dd>
            </div>
          ))}
        </dl>

        {qrUrl ? (
          <figure className="flex flex-col items-center gap-3">
            <img
              src={qrUrl}
              alt="رمز الفاتورة الإلكترونية"
              className="size-56 rounded-2xl bg-white p-3 shadow-2xl"
            />
            <figcaption className="text-sm text-[var(--color-muted)]">
              امسح الرمز للتحقق من الفاتورة الإلكترونية
            </figcaption>
          </figure>
        ) : null}
      </div>
    </main>
  );
}

/* --------------------------------- utils --------------------------------- */

/** Show weighted quantities with up to 3 decimals, plain integers otherwise. */
function formatQty(qty: number): string {
  return Number.isInteger(qty) ? String(qty) : qty.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
}
