import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Search, CheckCircle2, Undo2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { LoadingView, ErrorView } from '@/shared/ui/StateView';
import { ApiError } from '@/shared/lib/api-client';
import { formatMoney } from '@/shared/lib/format';
import { useBillDetail } from '@/features/bills/api/bills.api';
import { usePosSettings } from '@/features/pos-terminal/store/pos-settings.store';
import type { PostReturnLineDto } from '@/shared/lib/types';
import { useCreateReturn } from '../api/returns.api';

/**
 * Create-return flow:
 *   1) enter the ORIGINAL bill number → load its lines (GET /bills/{no}),
 *   2) choose a return qty per line (0..sold),
 *   3) submit POST /returns with a uuid Idempotency-Key.
 * Requires an open shift for the configured cashierNo (backend precondition).
 */
export function CreateReturnDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const cashierNo = usePosSettings((s) => s.cashierNo);
  const machineNo = usePosSettings((s) => s.machineNo);

  const [billInput, setBillInput] = useState('');
  const [billNo, setBillNo] = useState<string | null>(null);
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ rtBillNo: string; net: number } | null>(null);

  const detail = useBillDetail(billNo);
  const createReturn = useCreateReturn();

  const lines = useMemo(() => detail.data?.lines ?? [], [detail.data]);

  const selected = useMemo(
    () =>
      lines
        .map((l) => ({ line: l, qty: qtys[l.iCode] ?? 0 }))
        .filter((x) => x.qty > 0),
    [lines, qtys],
  );

  const refundTotal = useMemo(
    () => selected.reduce((n, x) => n + x.line.price * x.qty, 0),
    [selected],
  );

  const loadBill = () => {
    setError(null);
    setQtys({});
    setBillNo(billInput.trim() || null);
  };

  const submit = async () => {
    setError(null);
    if (selected.length === 0) {
      setError(t('returns.pickLines'));
      return;
    }
    const dtoLines: PostReturnLineDto[] = selected.map((x) => ({
      itemCode: x.line.iCode,
      qty: x.qty,
    }));
    try {
      const res = await createReturn.mutateAsync({
        cashierNo,
        machineNo,
        originalBillNo: billNo!,
        currency: 'YER',
        lines: dtoLines,
      });
      setDone({ rtBillNo: res.rtBillNo, net: res.netAmt });
    } catch (e) {
      if (e instanceof ApiError) {
        const trace = e.problem.traceId ? ` (traceId: ${e.problem.traceId})` : '';
        setError(`${e.problem.detail || e.problem.title}${trace}`);
      } else {
        setError(t('returns.createError'));
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('returns.createTitle')}
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="flex items-center gap-2 font-bold">
            <Undo2 className="size-5 text-[var(--color-brand-500)]" aria-hidden />
            {t('returns.createTitle')}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('returns.close')}>
            <X className="size-5" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto scroll-thin p-4">
          {done ? (
            <div className="flex flex-col items-center gap-4 p-6 text-center">
              <CheckCircle2 className="size-12 text-[var(--color-success)]" aria-hidden />
              <div>
                <p className="font-bold">
                  {t('returns.created')} {done.rtBillNo}
                </p>
                <p className="tnum mt-1 text-2xl font-extrabold text-[var(--color-brand-100)]">
                  {formatMoney(done.net)}
                </p>
              </div>
              <Button variant="primary" className="w-full" onClick={onClose}>
                {t('returns.close')}
              </Button>
            </div>
          ) : (
            <>
              {/* Step 1: original bill */}
              <label htmlFor="orig-bill" className="mb-1 block text-sm font-medium">
                {t('returns.originalBillNo')}
              </label>
              <div className="flex gap-2">
                <Input
                  id="orig-bill"
                  value={billInput}
                  onChange={(e) => setBillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadBill()}
                  placeholder={t('returns.originalBillPlaceholder')}
                  className="tnum flex-1"
                />
                <Button variant="outline" onClick={loadBill} disabled={!billInput.trim()}>
                  <Search className="size-4" />
                  {t('returns.load')}
                </Button>
              </div>

              {/* Step 2: lines */}
              {billNo ? (
                <div className="mt-4">
                  {detail.isLoading ? (
                    <LoadingView />
                  ) : detail.isError ? (
                    <ErrorView error={detail.error} onRetry={() => detail.refetch()} />
                  ) : lines.length === 0 ? (
                    <p className="text-sm text-[var(--color-muted)]">{t('status.empty')}</p>
                  ) : (
                    <div className="overflow-hidden rounded-[var(--radius)] border">
                      <table className="w-full text-sm">
                        <thead className="bg-[var(--color-surface-2)] text-[var(--color-muted)]">
                          <tr>
                            <th className="px-3 py-2 text-start font-semibold">{t('returns.item')}</th>
                            <th className="px-3 py-2 text-end font-semibold">{t('returns.price')}</th>
                            <th className="px-3 py-2 text-end font-semibold">{t('returns.sold')}</th>
                            <th className="px-3 py-2 text-end font-semibold">{t('returns.returnQty')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {lines.map((l) => (
                            <tr key={l.iCode}>
                              <td className="px-3 py-2">
                                <span className="font-medium">{l.iCode}</span>
                                {l.itmUnit ? (
                                  <span className="ms-1 text-xs text-[var(--color-muted)]">/ {l.itmUnit}</span>
                                ) : null}
                              </td>
                              <td className="tnum px-3 py-2 text-end">{formatMoney(l.price)}</td>
                              <td className="tnum px-3 py-2 text-end">{l.qty}</td>
                              <td className="px-3 py-2 text-end">
                                <input
                                  type="number"
                                  min={0}
                                  max={l.qty}
                                  value={qtys[l.iCode] ?? 0}
                                  onChange={(e) => {
                                    const raw = Math.floor(Number(e.target.value) || 0);
                                    const q = Math.max(0, Math.min(l.qty, raw));
                                    setQtys((prev) => ({ ...prev, [l.iCode]: q }));
                                  }}
                                  className="tnum h-9 w-20 rounded-md border bg-[var(--color-surface-2)] text-center"
                                  aria-label={`${t('returns.returnQty')} ${l.iCode}`}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : null}

              {error ? (
                <p
                  role="alert"
                  className="mt-4 rounded-md bg-[var(--color-danger)]/15 p-2 text-center text-sm text-[var(--color-danger)]"
                >
                  {error}
                </p>
              ) : null}
            </>
          )}
        </div>

        {!done && billNo ? (
          <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
            <div>
              <p className="text-xs text-[var(--color-muted)]">{t('returns.refundTotal')}</p>
              <p className="tnum text-xl font-extrabold text-[var(--color-brand-100)]">
                {formatMoney(refundTotal)}
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={submit}
              disabled={selected.length === 0 || createReturn.isPending}
            >
              {createReturn.isPending ? t('returns.creating') : t('returns.submit')}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
