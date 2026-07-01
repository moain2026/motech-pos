import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReceiptText, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { formatMoney } from '@/shared/lib/format';
import { usePosSettings } from '@/features/pos-terminal/store/pos-settings.store';
import { useCurrentShift } from '@/features/shifts/api/shifts.api';
import type { VoucherType } from '@/shared/lib/types';
import { useVouchers } from '../api/vouchers.api';
import { VoucherDialog } from './VoucherDialog';

/**
 * السندات (Vouchers) — cash receipts (سند قبض) & expenses (سند صرف).
 * Vouchers attach to the open shift and feed the shift reconciliation.
 * POST /vouchers · GET /vouchers. Proof-verified against live :3000.
 */
export function VouchersPage() {
  const { t } = useTranslation();
  const cashierNo = usePosSettings((s) => s.cashierNo);
  const shiftQ = useCurrentShift(cashierNo);
  const hasShift = !!shiftQ.data?.shift;

  const [dialogType, setDialogType] = useState<VoucherType | null>(null);
  const list = useVouchers({ cashierNo });
  const vouchers = list.data ?? [];

  return (
    <div className="mx-auto grid max-w-3xl gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-lg font-bold">
          <ReceiptText className="size-6 text-[var(--color-brand-500)]" aria-hidden />
          {t('vouchers.title')}
        </h1>
        <div className="flex gap-2">
          <Button
            variant="success"
            disabled={!hasShift}
            onClick={() => setDialogType('RECEIPT')}
          >
            <ArrowDownCircle className="size-4" />
            {t('vouchers.newReceipt')}
          </Button>
          <Button
            variant="outline"
            disabled={!hasShift}
            onClick={() => setDialogType('EXPENSE')}
            className="text-[var(--color-danger)]"
          >
            <ArrowUpCircle className="size-4" />
            {t('vouchers.newExpense')}
          </Button>
        </div>
      </div>

      {!hasShift ? (
        <p
          role="status"
          className="rounded-md bg-[var(--color-warning)]/15 p-2 text-center text-xs text-[var(--color-warning)]"
        >
          {t('vouchers.needShift')}
        </p>
      ) : null}

      <Card className="min-h-0 p-3">
        {list.isLoading ? (
          <LoadingView />
        ) : list.isError ? (
          <ErrorView error={list.error} onRetry={() => list.refetch()} />
        ) : vouchers.length === 0 ? (
          <EmptyView label={t('vouchers.empty')} />
        ) : (
          <ul className="divide-y" aria-label={t('vouchers.title')}>
            {vouchers.map((v) => {
              const isReceipt = v.type === 'RECEIPT';
              const Icon = isReceipt ? ArrowDownCircle : ArrowUpCircle;
              return (
                <li key={v.id} className="flex items-center gap-3 py-3">
                  <span
                    className={
                      'grid size-9 shrink-0 place-items-center rounded-full ' +
                      (isReceipt
                        ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
                        : 'bg-[var(--color-danger)]/15 text-[var(--color-danger)]')
                    }
                  >
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {v.voucherNo} ·{' '}
                      {isReceipt ? t('vouchers.receipt') : t('vouchers.expense')}
                    </p>
                    <p className="tnum text-xs text-[var(--color-muted)]">
                      {v.description || v.partyName || '—'}
                      {v.category ? ` · ${v.category}` : ''} · {v.paymentMethod}
                    </p>
                  </div>
                  <span
                    className={
                      'tnum shrink-0 text-sm font-bold ' +
                      (isReceipt
                        ? 'text-[var(--color-success)]'
                        : 'text-[var(--color-danger)]')
                    }
                  >
                    {isReceipt ? '+' : '-'} {formatMoney(v.amount)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {dialogType ? (
        <VoucherDialog type={dialogType} onClose={() => setDialogType(null)} />
      ) : null}
    </div>
  );
}
