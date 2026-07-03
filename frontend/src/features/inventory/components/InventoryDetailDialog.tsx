import { useTranslation } from 'react-i18next';
import { X, Boxes, Warehouse } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { formatNumber } from '@/shared/lib/format';
import { useInventoryDetail } from '../api/inventory.api';

/** Per-warehouse / per-batch stock breakdown for a single item. */
export function InventoryDetailDialog({
  code,
  onClose,
}: {
  code: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const q = useInventoryDetail(code);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('inventory.detailTitle')}
    >
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="flex items-center gap-2 font-bold">
            <Boxes className="size-5 text-[var(--color-brand-500)]" aria-hidden />
            {q.data?.name?.trim() || t('inventory.detailTitle')}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('returns.close')}>
            <X className="size-5" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scroll-thin p-4">
          {q.isLoading ? (
            <LoadingView />
          ) : q.isError ? (
            <ErrorView error={q.error} onRetry={() => q.refetch()} />
          ) : q.data ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Stat label={t('inventory.code')} value={q.data.code} tnum />
                <Stat
                  label={t('inventory.qty')}
                  value={formatNumber(q.data.totalAvailableQty)}
                  tnum
                  danger={q.data.totalAvailableQty <= 0}
                />
              </div>

              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--color-muted)]">
                  <Warehouse className="size-4" aria-hidden />
                  {t('inventory.byWarehouse')}
                </h3>
                {q.data.stock.length === 0 ? (
                  <EmptyView />
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-[var(--color-surface-2)] text-[var(--color-muted)]">
                      <tr>
                        <th className="px-3 py-2 text-start font-semibold">
                          {t('inventory.warehouse')}
                        </th>
                        <th className="px-3 py-2 text-start font-semibold">{t('inventory.batch')}</th>
                        <th className="px-3 py-2 text-start font-semibold">{t('inventory.expiry')}</th>
                        <th className="px-3 py-2 text-end font-semibold">{t('inventory.qty')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {q.data.stock.map((s, i) => (
                        <tr key={`${s.warehouseCode}-${s.batchNo}-${i}`}>
                          <td className="tnum px-3 py-2 font-medium">#{s.warehouseCode}</td>
                          <td className="tnum px-3 py-2 text-[var(--color-muted)]">
                            {s.batchNo && s.batchNo !== '0' ? s.batchNo : '—'}
                          </td>
                          <td className="tnum px-3 py-2 text-[var(--color-muted)]">
                            {s.expireDate && !s.expireDate.startsWith('1900') ? s.expireDate : '—'}
                          </td>
                          <td
                            className={
                              'tnum px-3 py-2 text-end font-bold ' +
                              (s.availableQty <= 0 ? 'text-[var(--color-danger)]' : '')
                            }
                          >
                            {formatNumber(s.availableQty)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tnum,
  danger,
}: {
  label: string;
  value: string;
  tnum?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-md border bg-[var(--color-surface-2)] p-3">
      <span className="text-xs text-[var(--color-muted)]">{label}</span>
      <span
        className={
          (tnum ? 'tnum ' : '') +
          'text-lg font-extrabold ' +
          (danger ? 'text-[var(--color-danger)]' : '')
        }
      >
        {value}
      </span>
    </div>
  );
}
