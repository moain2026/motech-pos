import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClipboardList, Plus, Eye, Ban, FileCheck2 } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { formatDateTime, formatNumber } from '@/shared/lib/format';
import { ApiError } from '@/shared/lib/api-client';
import type { SalesOrderHeader, SalesOrderStatus } from '@/shared/lib/types';
import { usePosSettings } from '@/features/pos-terminal/store/pos-settings.store';
import {
  useCancelSalesOrder,
  useConvertSalesOrder,
  useSalesOrders,
} from '../api/sales-orders.api';
import { SalesOrderDialog } from './SalesOrderDialog';
import { SalesOrderDetailDialog } from './SalesOrderDetailDialog';
import { confirmDialog } from '@/shared/ui/ConfirmDialog';

type StatusFilter = 'all' | SalesOrderStatus;

export function OrderStatusBadge({ status }: { status: SalesOrderStatus }) {
  const { t } = useTranslation();
  const cls =
    status === 'OPEN'
      ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
      : status === 'CONVERTED'
        ? 'bg-[var(--color-brand-500)]/15 text-[var(--color-brand-500)]'
        : 'bg-[var(--color-danger)]/15 text-[var(--color-danger)]';
  return (
    <span className={'rounded-full px-2 py-0.5 text-xs font-medium ' + cls}>
      {t(`salesOrders.status.${status}`)}
    </span>
  );
}

/**
 * POST024 طلبات العملاء — customer sales orders: list + status filter,
 * create dialog (items + qty), convert-to-bill (تنزيل في فاتورة, needs an
 * open shift) and cancel (OPEN only). Detail drill-down dialog.
 */
export function SalesOrdersPage() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<StatusFilter>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [convertedNo, setConvertedNo] = useState<string | null>(null);

  const cashierNo = usePosSettings((s) => s.cashierNo);
  const machineNo = usePosSettings((s) => s.machineNo);

  const list = useSalesOrders({ status: status === 'all' ? undefined : status });
  const convert = useConvertSalesOrder();
  const cancel = useCancelSalesOrder();
  const rows = list.data ?? [];

  const doConvert = async (r: SalesOrderHeader) => {
    setActionError(null);
    setConvertedNo(null);
    if (!(await confirmDialog({ message: t('salesOrders.convertConfirm', { no: r.orderNo }) }))) return;
    try {
      const res = await convert.mutateAsync({ id: r.id, cashierNo, machineNo });
      setConvertedNo(res.convertedBillNo);
    } catch (e) {
      setActionError(
        e instanceof ApiError ? e.problem.detail || e.problem.title : t('salesOrders.convertError'),
      );
    }
  };

  const doCancel = async (r: SalesOrderHeader) => {
    setActionError(null);
    setConvertedNo(null);
    if (!(await confirmDialog({ message: t('salesOrders.cancelConfirm', { no: r.orderNo }), variant: 'danger' }))) return;
    try {
      await cancel.mutateAsync(r.id);
    } catch (e) {
      setActionError(
        e instanceof ApiError ? e.problem.detail || e.problem.title : t('salesOrders.cancelError'),
      );
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <ClipboardList className="size-6 text-[var(--color-brand-500)]" aria-hidden />
          {t('salesOrders.title')}
        </h1>
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          <Plus className="size-4" />
          {t('salesOrders.new')}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label={t('salesOrders.statusL')}>
        {(['all', 'OPEN', 'CONVERTED', 'CANCELLED'] as StatusFilter[]).map((s) => (
          <button
            key={s}
            role="tab"
            aria-selected={status === s}
            onClick={() => setStatus(s)}
            className={
              'rounded-[var(--radius)] border px-4 py-2 text-sm font-medium transition-colors ' +
              (status === s
                ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-600)] text-white'
                : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-2)]')
            }
          >
            {t(`salesOrders.filter.${s}`)}
          </button>
        ))}
      </div>

      {actionError ? (
        <p role="alert" className="rounded-md bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]">
          {actionError}
        </p>
      ) : null}
      {convertedNo ? (
        <p role="status" className="rounded-md bg-[var(--color-success)]/10 px-3 py-2 text-sm text-[var(--color-success)]">
          {t('salesOrders.converted', { bill: convertedNo })}
        </p>
      ) : null}

      {list.isLoading ? (
        <LoadingView />
      ) : list.isError ? (
        <ErrorView error={list.error} onRetry={() => list.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyView label={t('salesOrders.empty')} />
      ) : (
        <Card className="min-h-0 flex-1 overflow-auto scroll-thin">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
              <tr>
                <th className="px-3 py-2 text-start font-semibold">{t('salesOrders.orderNo')}</th>
                <th className="px-3 py-2 text-start font-semibold">{t('salesOrders.customer')}</th>
                <th className="tnum px-3 py-2 text-end font-semibold">{t('salesOrders.lineCount')}</th>
                <th className="px-3 py-2 text-center font-semibold">{t('salesOrders.statusL')}</th>
                <th className="hidden px-3 py-2 text-start font-semibold md:table-cell">
                  {t('salesOrders.billNo')}
                </th>
                <th className="hidden px-3 py-2 text-start font-semibold sm:table-cell">
                  {t('salesOrders.createdAt')}
                </th>
                <th className="px-3 py-2 text-end font-semibold">{t('salesOrders.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-[var(--color-surface-2)]">
                  <td className="tnum px-3 py-2 font-medium">#{r.orderNo}</td>
                  <td className="max-w-40 truncate px-3 py-2">
                    {r.customerName?.trim() || r.customerCode || '—'}
                  </td>
                  <td className="tnum px-3 py-2 text-end">{formatNumber(r.lineCount)}</td>
                  <td className="px-3 py-2 text-center">
                    <OrderStatusBadge status={r.status} />
                  </td>
                  <td className="tnum hidden px-3 py-2 md:table-cell" dir="ltr">
                    {r.convertedBillNo ?? '—'}
                  </td>
                  <td className="tnum hidden px-3 py-2 text-[var(--color-muted)] sm:table-cell">
                    {formatDateTime(r.createdAt)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => setDetailId(r.id)}
                      >
                        <Eye className="size-4" />
                        {t('salesOrders.view')}
                      </Button>
                      {r.status === 'OPEN' ? (
                        <>
                          <Button
                            variant="success"
                            className="h-8 text-xs"
                            disabled={convert.isPending}
                            onClick={() => void doConvert(r)}
                          >
                            <FileCheck2 className="size-4" />
                            {t('salesOrders.convert')}
                          </Button>
                          <Button
                            variant="outline"
                            className="h-8 text-xs text-[var(--color-danger)]"
                            disabled={cancel.isPending}
                            onClick={() => void doCancel(r)}
                          >
                            <Ban className="size-4" />
                            {t('salesOrders.cancel')}
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {showCreate ? <SalesOrderDialog onClose={() => setShowCreate(false)} /> : null}
      {detailId ? (
        <SalesOrderDetailDialog id={detailId} onClose={() => setDetailId(null)} />
      ) : null}
    </div>
  );
}
