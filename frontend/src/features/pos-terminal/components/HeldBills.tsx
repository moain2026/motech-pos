import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PauseCircle, X, ClipboardList, RotateCcw, CheckCheck } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { ApiError } from '@/shared/lib/api-client';
import { formatMoney } from '@/shared/lib/format';
import { useHoldBill, useHeldBills, useResumeBill } from '@/features/bills/api/bills.api';
import type { HeldBill } from '@/shared/lib/types';
import { useCart, type CartLine } from '../store/cart.store';
import { useCartTotals } from '../hooks/useCartTotals';
import { usePosSettings } from '../store/pos-settings.store';

/** Map a held-bill line back into a cart line (best-effort; names may be null). */
function heldLineToCart(l: HeldBill['lines'][number]): CartLine {
  return {
    code: l.itemCode,
    name: l.itemName,
    barcode: null,
    unit: null,
    price: l.unitPrice ?? 0,
    qty: l.qty,
    lineDiscount: l.discDtl ?? 0,
    lineVat: 0,
  };
}

/**
 * "Hold" (park) the current sale + a drawer listing held bills to resume.
 * Wave 1 — proof-verified endpoints:
 *   POST /bills/hold · GET /bills/held · POST /bills/held/{id}/resume.
 *
 * Resume offers two paths:
 *  • "restore to cart" (استئناف للسلة) — loads the parked lines back into the
 *    open cart so the cashier continues/settles normally (client-side).
 *  • "resume & post" (ترحيل) — calls the backend resume, which posts it as a
 *    real sale immediately (returns the posted bill).
 */
export function HeldBillsControls({ hasShift }: { hasShift: boolean }) {
  const { t } = useTranslation();
  const cashierNo = usePosSettings((s) => s.cashierNo);
  const machineNo = usePosSettings((s) => s.machineNo);

  const lines = useCart((s) => s.lines);
  const billDiscount = useCart((s) => s.billDiscount);
  const customer = useCart((s) => s.customer);
  const clear = useCart((s) => s.clear);
  const loadLines = useCart((s) => s.loadLines);
  const totals = useCartTotals();

  const holdBill = useHoldBill();
  const resumeBill = useResumeBill();

  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [resumedNo, setResumedNo] = useState<string | null>(null);

  const empty = lines.length === 0;

  const onHold = async () => {
    setMsg(null);
    try {
      const held = await holdBill.mutateAsync({
        cashierNo,
        machineNo,
        label: label.trim() || undefined,
        customerCode: customer?.code,
        customerName: customer?.name,
        currency: 'YER',
        taxCalcType: 2,
        headerDiscount: billDiscount || 0,
        lines: lines.map((l) => ({
          itemCode: l.code,
          qty: l.qty,
          unitPrice: l.price,
          discDtl: l.lineDiscount > 0 ? l.lineDiscount / Math.max(1, l.qty) : 0,
          itemName: l.name ?? undefined,
        })),
      });
      setMsg({ kind: 'ok', text: `${t('held.heldOk')} #${held.holdNo}` });
      setLabel('');
      clear();
    } catch (e) {
      const detail = e instanceof ApiError ? e.problem.detail || e.problem.title : '';
      setMsg({ kind: 'err', text: `${t('held.holdError')}${detail ? ` — ${detail}` : ''}` });
    }
  };

  const onRestoreToCart = (h: HeldBill) => {
    loadLines(
      h.lines.map(heldLineToCart),
      h.headerDiscount || 0,
      h.customerCode ? { code: h.customerCode, name: h.customerName ?? h.customerCode } : null,
    );
    setOpen(false);
  };

  const onResumePost = async (h: HeldBill) => {
    setMsg(null);
    setResumedNo(null);
    try {
      const r = await resumeBill.mutateAsync({ id: h.id, dto: { cashierNo } });
      setResumedNo(r.bill.billNo);
      setMsg({ kind: 'ok', text: `${t('held.resumedOk')} ${r.bill.billNo}` });
    } catch (e) {
      const detail = e instanceof ApiError ? e.problem.detail || e.problem.title : '';
      setMsg({ kind: 'err', text: `${t('held.resumeError')}${detail ? ` — ${detail}` : ''}` });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Optional label + hold + open-drawer buttons */}
      <div className="flex items-center gap-2">
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={t('held.labelPlaceholder')}
          className="h-9 flex-1"
          aria-label={t('held.label')}
          disabled={empty || !hasShift}
        />
        <Button
          variant="outline"
          className="h-9 shrink-0"
          disabled={empty || !hasShift || holdBill.isPending}
          onClick={onHold}
          title={t('pos.hold')}
        >
          <PauseCircle className="size-4" />
          {holdBill.isPending ? t('held.holding') : t('pos.hold')}
        </Button>
        <Button
          variant="ghost"
          className="h-9 shrink-0"
          onClick={() => {
            setMsg(null);
            setResumedNo(null);
            setOpen(true);
          }}
          title={t('held.title')}
        >
          <ClipboardList className="size-4" />
          {t('held.open')}
        </Button>
      </div>

      {msg && !open ? (
        <p
          role="status"
          className={
            msg.kind === 'ok'
              ? 'text-xs text-[var(--color-success)]'
              : 'rounded-md bg-[var(--color-danger)]/15 p-2 text-center text-xs text-[var(--color-danger)]'
          }
        >
          {msg.text}
        </p>
      ) : null}

      {open ? (
        <HeldDrawer
          cashierNo={cashierNo}
          onClose={() => setOpen(false)}
          onRestore={onRestoreToCart}
          onResumePost={onResumePost}
          resuming={resumeBill.isPending}
          resumedNo={resumedNo}
          msg={msg}
        />
      ) : null}
    </div>
  );
}

function HeldDrawer({
  cashierNo,
  onClose,
  onRestore,
  onResumePost,
  resuming,
  resumedNo,
  msg,
}: {
  cashierNo: number;
  onClose: () => void;
  onRestore: (h: HeldBill) => void;
  onResumePost: (h: HeldBill) => void;
  resuming: boolean;
  resumedNo: string | null;
  msg: { kind: 'ok' | 'err'; text: string } | null;
}) {
  const { t } = useTranslation();
  const query = useHeldBills(cashierNo);
  const held = query.data ?? [];

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('held.title')}
    >
      <div className="flex h-[72vh] w-full max-w-lg flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="flex items-center gap-2 font-bold">
            <ClipboardList className="size-5 text-[var(--color-brand-500)]" aria-hidden />
            {t('held.title')}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('returns.close')}>
            <X className="size-5" />
          </Button>
        </div>

        {msg ? (
          <p
            role="status"
            className={
              'mx-4 mt-3 rounded-md p-2 text-center text-xs ' +
              (msg.kind === 'ok'
                ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
                : 'bg-[var(--color-danger)]/15 text-[var(--color-danger)]')
            }
          >
            {msg.text}
          </p>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto scroll-thin p-3">
          {query.isLoading ? (
            <LoadingView />
          ) : query.isError ? (
            <ErrorView error={query.error} onRetry={() => query.refetch()} />
          ) : held.length === 0 ? (
            <EmptyView label={t('held.empty')} />
          ) : (
            <ul className="flex flex-col gap-2" aria-label={t('held.title')}>
              {held.map((h) => {
                const posted = resumedNo != null && h.resumedBillId != null;
                return (
                  <li
                    key={h.id}
                    className="rounded-[var(--radius)] border bg-[var(--color-surface-2)] p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          #{h.holdNo}
                          {h.label ? ` · ${h.label}` : ''}
                        </p>
                        <p className="tnum text-xs text-[var(--color-muted)]">
                          {t('held.lineCount')}: {h.lineCount} · {t('held.est')}:{' '}
                          {formatMoney(h.estNetAmt)}
                        </p>
                      </div>
                      <span className="tnum shrink-0 text-xs text-[var(--color-muted)]">
                        {new Date(h.createdAt).toLocaleTimeString('ar', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {posted ? (
                      <p className="mt-2 text-center text-xs text-[var(--color-success)]">
                        {t('held.resumedOk')} {resumedNo}
                      </p>
                    ) : (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          className="h-9"
                          onClick={() => onRestore(h)}
                          title={t('held.restore')}
                        >
                          <RotateCcw className="size-4" />
                          {t('held.restore')}
                        </Button>
                        <Button
                          variant="primary"
                          className="h-9"
                          disabled={resuming}
                          onClick={() => onResumePost(h)}
                          title={t('held.resumePost')}
                        >
                          <CheckCheck className="size-4" />
                          {resuming ? t('held.resuming') : t('held.resumePost')}
                        </Button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
