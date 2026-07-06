import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Undo2, Receipt, CheckCircle2 } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { LoadingView, ErrorView } from '@/shared/ui/StateView';
import { formatMoney, formatDate } from '@/shared/lib/format';
import { usePosSettings } from '@/features/pos-terminal/store/pos-settings.store';
import {
  useRefundVoucherForReturn,
  useCreateRefundVoucher,
} from '@/features/vouchers/api/vouchers.api';
import { ApiError } from '@/shared/lib/api-client';
import { useReturnDetail } from '../api/returns.api';

/**
 * POST005 — Return-bill detail page, the RT_BILL counterpart of BillDetailPage:
 * full lines table + recomputed totals vs the stored (posted) ERP amounts,
 * original-bill link and machine/customer meta. Route: /returns/:id.
 */
export function ReturnDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const query = useReturnDetail(id ?? null);
  const d = query.data;

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label={t('bills.back')}>
          <ArrowRight className="size-5" />
        </Button>
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Undo2 className="size-6 text-[var(--color-brand-500)]" aria-hidden />
          {t('returns.detailTitle')} <span className="tnum">#{id}</span>
        </h1>
      </div>

      {query.isLoading ? (
        <LoadingView />
      ) : query.isError ? (
        <ErrorView error={query.error} onRetry={() => query.refetch()} />
      ) : d ? (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Lines */}
          <Card className="min-h-0 overflow-auto scroll-thin">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
                <tr>
                  <th className="px-3 py-2 text-start font-semibold">{t('pos.code')}</th>
                  <th className="px-3 py-2 text-start font-semibold">{t('pos.unit')}</th>
                  <th className="px-3 py-2 text-end font-semibold">{t('returns.returnQty')}</th>
                  <th className="px-3 py-2 text-end font-semibold">{t('pos.price')}</th>
                  <th className="px-3 py-2 text-end font-semibold">{t('pos.discount')}</th>
                  <th className="px-3 py-2 text-end font-semibold">{t('pos.vat')}</th>
                  <th className="px-3 py-2 text-end font-semibold">{t('returns.net')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {d.lines.map((l, i) => (
                  <tr key={`${l.iCode}-${i}`}>
                    <td className="tnum px-3 py-2 font-medium">{l.iCode}</td>
                    <td className="px-3 py-2">{l.itmUnit ?? '—'}</td>
                    <td className="tnum px-3 py-2 text-end">{l.qty}</td>
                    <td className="tnum px-3 py-2 text-end">{formatMoney(l.price)}</td>
                    <td className="tnum px-3 py-2 text-end">{formatMoney(l.discount)}</td>
                    <td className="tnum px-3 py-2 text-end">{formatMoney(l.vat)}</td>
                    <td className="tnum px-3 py-2 text-end font-bold">{formatMoney(l.net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Totals + meta */}
          <div className="flex flex-col gap-4">
            <Card className="flex flex-col gap-2 p-4">
              <Meta label={t('returns.date')} value={formatDate(d.rtBillDate)} />
              <Meta label={t('returns.machine')} value={`#${d.machineNo}`} />
              <Meta
                label={t('returns.originalBill')}
                value={
                  d.originalBillNo ? (
                    <button
                      type="button"
                      className="tnum font-medium text-[var(--color-brand-500)] underline-offset-2 hover:underline"
                      onClick={() => navigate(`/bills/${d.originalBillNo}`)}
                    >
                      {d.originalBillNo}
                    </button>
                  ) : (
                    '—'
                  )
                }
              />
              <Meta
                label={t('bills.customer')}
                value={d.customer.name ?? d.customer.code ?? '—'}
              />
            </Card>

            <Card className="flex flex-col gap-2 p-4">
              <p className="mb-1 text-xs font-semibold text-[var(--color-muted)]">
                {t('bills.recomputed')}
              </p>
              <Meta label={t('bills.gross')} value={formatMoney(d.totals.gross)} />
              <Meta label={t('pos.discount')} value={formatMoney(d.totals.discount)} />
              <Meta label={t('pos.vat')} value={formatMoney(d.totals.vat)} />
              <div className="flex items-center justify-between border-t pt-2">
                <span className="font-bold">{t('returns.net')}</span>
                <span className="tnum text-lg font-extrabold text-[var(--color-brand-100)]">
                  {formatMoney(d.totals.net)}
                </span>
              </div>
            </Card>

            {/* Stored (posted) ERP amounts — the "ترحيل" proof */}
            <Card className="flex flex-col gap-2 p-4">
              <p className="mb-1 text-xs font-semibold text-[var(--color-muted)]">
                {t('returns.storedTitle')}
              </p>
              <Meta label={t('returns.storedAmt')} value={formatMoney(d.stored.rtBillAmt)} />
              <Meta label={t('pos.vat')} value={formatMoney(d.stored.vatAmt)} />
              <Meta label={t('pos.discount')} value={formatMoney(d.stored.discAmt)} />
              <Meta label={t('returns.payedAmt')} value={formatMoney(d.stored.payedAmt)} />
            </Card>

            {/* POST006 — cash refund voucher (سند صرف) for this return */}
            <RefundVoucherCard returnId={id ?? null} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * POST006 — issue the cash refund voucher (سند صرف) for this return. Works only
 * for MOTECH_POS returns (UUID id). Idempotent: once issued, shows the voucher
 * number. Legacy YSPOS23 RT numbers return 404 (handled gracefully).
 */
function RefundVoucherCard({ returnId }: { returnId: string | null }) {
  const { t } = useTranslation();
  const cashierNo = usePosSettings((s) => s.cashierNo);
  const machineNo = usePosSettings((s) => s.machineNo);
  const probe = useRefundVoucherForReturn(returnId);
  const create = useCreateRefundVoucher();

  // Legacy RT numbers are all-digits; MOTECH_POS returns are UUIDs.
  const isMotechReturn = !!returnId && returnId.includes('-');
  if (!isMotechReturn) return null;

  const voucher = create.data ?? probe.data ?? null;
  const err =
    create.error instanceof ApiError ? create.error.message : null;

  return (
    <Card className="flex flex-col gap-2 p-4">
      <p className="mb-1 flex items-center gap-2 text-xs font-semibold text-[var(--color-muted)]">
        <Receipt className="size-4" aria-hidden />
        {t('returns.refundVoucherTitle')}
      </p>
      {voucher ? (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-success,#16a34a)]">
            <CheckCircle2 className="size-4" aria-hidden />
            {t('returns.refundIssued')}
          </div>
          <Meta label={t('returns.refundVoucherNo')} value={voucher.voucherNo} />
          <Meta label={t('bills.amount')} value={formatMoney(voucher.amount)} />
        </div>
      ) : (
        <>
          <p className="text-xs text-[var(--color-muted)]">
            {t('returns.refundVoucherHint')}
          </p>
          <Button
            disabled={create.isPending || cashierNo == null}
            onClick={() =>
              returnId &&
              cashierNo != null &&
              create.mutate({ returnId, cashierNo, machineNo: machineNo ?? undefined })
            }
          >
            <Receipt className="size-4" aria-hidden />
            {create.isPending ? t('common.saving') : t('returns.issueRefundVoucher')}
          </Button>
          {err && <p className="text-xs text-[var(--color-danger,#dc2626)]">{err}</p>}
        </>
      )}
    </Card>
  );
}

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[var(--color-muted)]">{label}</span>
      <span className="tnum font-medium">{value}</span>
    </div>
  );
}
