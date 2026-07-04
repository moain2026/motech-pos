import { useTranslation } from 'react-i18next';
import { X, ClipboardList } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { LoadingView, ErrorView } from '@/shared/ui/StateView';
import { formatDateTime, formatMoney, formatNumber } from '@/shared/lib/format';
import { useSalesOrder } from '../api/sales-orders.api';
import { OrderStatusBadge } from './SalesOrdersPage';

/** Read-only sales-order detail — GET /sales-orders/{id} (header + lines). */
export function SalesOrderDetailDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const { t } = useTranslation();
  const q = useSalesOrder(id);
  const o = q.data;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('salesOrders.detailTitle')}
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="flex items-center gap-2 font-bold">
            <ClipboardList className="size-5 text-[var(--color-brand-500)]" aria-hidden />
            {t('salesOrders.detailTitle')}
            {o ? (
              <>
                <span className="tnum text-[var(--color-muted)]">#{o.orderNo}</span>
                <OrderStatusBadge status={o.status} />
              </>
            ) : null}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('salesOrders.close')}>
            <X className="size-5" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scroll-thin p-4">
          {q.isLoading ? (
            <LoadingView />
          ) : q.isError ? (
            <ErrorView error={q.error} onRetry={() => q.refetch()} />
          ) : o ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-2 rounded-md border bg-[var(--color-surface-2)] p-3 text-sm sm:grid-cols-2">
                <Info
                  label={t('salesOrders.customer')}
                  value={o.customerName?.trim() || o.customerCode || '—'}
                />
                <Info label={t('salesOrders.createdBy')} value={o.createdBy} />
                <Info label={t('salesOrders.createdAt')} value={formatDateTime(o.createdAt)} mono />
                {o.refNo ? <Info label={t('salesOrders.refNo')} value={o.refNo} mono /> : null}
                {o.expireDate ? (
                  <Info label={t('salesOrders.expireDate')} value={o.expireDate} mono />
                ) : null}
                {o.convertedBillNo ? (
                  <Info label={t('salesOrders.billNo')} value={o.convertedBillNo} mono />
                ) : null}
                {o.convertedAt ? (
                  <Info
                    label={t('salesOrders.convertedAt')}
                    value={`${formatDateTime(o.convertedAt)} (${o.convertedBy ?? '—'})`}
                    mono
                  />
                ) : null}
                {o.cancelledAt ? (
                  <Info
                    label={t('salesOrders.cancelledAt')}
                    value={`${formatDateTime(o.cancelledAt)} (${o.cancelledBy ?? '—'})`}
                    mono
                  />
                ) : null}
              </div>
              {o.note ? (
                <p className="rounded-md bg-[var(--color-surface-2)] p-2 text-xs text-[var(--color-muted)]">
                  {o.note}
                </p>
              ) : null}

              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--color-surface-2)] text-[var(--color-muted)]">
                    <tr>
                      <th className="px-2 py-2 text-start font-semibold">{t('salesOrders.item')}</th>
                      <th className="px-2 py-2 text-end font-semibold">{t('salesOrders.qty')}</th>
                      <th className="hidden px-2 py-2 text-end font-semibold sm:table-cell">
                        {t('salesOrders.unitPrice')}
                      </th>
                      <th className="hidden px-2 py-2 text-start font-semibold sm:table-cell">
                        {t('salesOrders.lineNote')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {o.lines.map((l) => (
                      <tr key={l.lineId}>
                        <td className="px-2 py-2">
                          <p className="font-medium">{l.itemName?.trim() || l.itemCode}</p>
                          <p className="tnum text-xs text-[var(--color-muted)]" dir="ltr">
                            {l.itemCode}
                          </p>
                        </td>
                        <td className="tnum px-2 py-2 text-end font-bold">{formatNumber(l.qty)}</td>
                        <td className="tnum hidden px-2 py-2 text-end sm:table-cell">
                          {l.unitPrice != null ? formatMoney(l.unitPrice) : '—'}
                        </td>
                        <td className="hidden max-w-40 truncate px-2 py-2 text-[var(--color-muted)] sm:table-cell">
                          {l.note ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-[var(--color-muted)]">{label}</p>
      <p className={'font-medium ' + (mono ? 'tnum' : '')}>{value}</p>
    </div>
  );
}
