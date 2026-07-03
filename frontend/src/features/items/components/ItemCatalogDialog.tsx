import { useTranslation } from 'react-i18next';
import { X, Layers, Ruler, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { formatMoney, formatNumber } from '@/shared/lib/format';
import { useItemPrices, useItemUnits } from '@/features/pos-terminal/api/items.api';
import type { Item } from '@/shared/lib/types';

/**
 * Advanced-catalog detail (POS_ITM_PRICE / POSI2000):
 *  • All price levels (LEV_NO × unit) from GET /items/{code}/prices.
 *  • All units of measure with conversion factors (P_SIZE), per-unit barcode
 *    and price from GET /items/{code}/units (e.g. حبة/كرتون).
 */
export function ItemCatalogDialog({ item, onClose }: { item: Item; onClose: () => void }) {
  const { t } = useTranslation();
  const prices = useItemPrices(item.code);
  const units = useItemUnits(item.code);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('catalog.details')}
    >
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-bold">
            {item.name?.trim() || item.code}
            <span className="tnum ms-2 text-xs text-[var(--color-muted)]">{item.code}</span>
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('returns.close')}>
            <X className="size-5" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scroll-thin p-4">
          {/* Price levels */}
          <section aria-label={t('catalog.pricesTitle')}>
            <h3 className="mb-2 flex items-center gap-2 font-bold">
              <Layers className="size-4 text-[var(--color-brand-500)]" aria-hidden />
              {t('catalog.pricesTitle')}
            </h3>
            {prices.isLoading ? (
              <LoadingView />
            ) : prices.isError ? (
              <ErrorView error={prices.error} onRetry={() => prices.refetch()} />
            ) : !prices.data || prices.data.prices.length === 0 ? (
              <EmptyView label={t('catalog.noPrices')} />
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-[var(--color-surface-2)] text-[var(--color-muted)]">
                  <tr>
                    <th className="px-3 py-1.5 text-start font-semibold">{t('catalog.level')}</th>
                    <th className="px-3 py-1.5 text-start font-semibold">{t('catalog.unit')}</th>
                    <th className="px-3 py-1.5 text-end font-semibold">{t('catalog.packSize')}</th>
                    <th className="px-3 py-1.5 text-end font-semibold">{t('catalog.price')}</th>
                    <th className="px-3 py-1.5 text-end font-semibold">{t('catalog.minPrice')}</th>
                    <th className="px-3 py-1.5 text-end font-semibold">{t('catalog.maxPrice')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {prices.data.prices.map((p, i) => (
                    <tr key={`${p.levNo}-${p.unit}-${i}`} className="hover:bg-[var(--color-surface-2)]">
                      <td className="tnum px-3 py-1.5">{p.levNo}</td>
                      <td className="px-3 py-1.5">{p.unit ?? '—'}</td>
                      <td className="tnum px-3 py-1.5 text-end">
                        {p.packSize != null ? formatNumber(p.packSize) : '—'}
                      </td>
                      <td className="tnum px-3 py-1.5 text-end font-bold">{formatMoney(p.price)}</td>
                      <td className="tnum px-3 py-1.5 text-end text-[var(--color-muted)]">
                        {p.minPrice != null ? formatMoney(p.minPrice) : '—'}
                      </td>
                      <td className="tnum px-3 py-1.5 text-end text-[var(--color-muted)]">
                        {p.maxPrice != null ? formatMoney(p.maxPrice) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* Units of measure */}
          <section className="mt-5" aria-label={t('catalog.unitsTitle')}>
            <h3 className="mb-2 flex items-center gap-2 font-bold">
              <Ruler className="size-4 text-[var(--color-brand-500)]" aria-hidden />
              {t('catalog.unitsTitle')}
              {units.data?.baseUnit ? (
                <span className="text-xs font-normal text-[var(--color-muted)]">
                  ({t('catalog.baseUnit')}: {units.data.baseUnit})
                </span>
              ) : null}
            </h3>
            {units.isLoading ? (
              <LoadingView />
            ) : units.isError ? (
              <ErrorView error={units.error} onRetry={() => units.refetch()} />
            ) : !units.data || units.data.units.length === 0 ? (
              <EmptyView label={t('catalog.noUnits')} />
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-[var(--color-surface-2)] text-[var(--color-muted)]">
                  <tr>
                    <th className="px-3 py-1.5 text-start font-semibold">{t('catalog.unit')}</th>
                    <th className="px-3 py-1.5 text-end font-semibold">{t('catalog.packSize')}</th>
                    <th className="px-3 py-1.5 text-start font-semibold">{t('catalog.unitBarcode')}</th>
                    <th className="px-3 py-1.5 text-end font-semibold">{t('catalog.price')}</th>
                    <th className="px-3 py-1.5 text-center font-semibold">{t('catalog.mainUnit')}</th>
                    <th className="px-3 py-1.5 text-center font-semibold">{t('catalog.saleUnit')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {units.data.units.map((u) => (
                    <tr key={u.unit} className="hover:bg-[var(--color-surface-2)]">
                      <td className="px-3 py-1.5 font-medium">
                        {u.unit}
                        {u.noSale ? (
                          <span className="ms-2 rounded-full bg-[var(--color-danger)]/15 px-2 py-0.5 text-[10px] text-[var(--color-danger)]">
                            {t('catalog.noSale')}
                          </span>
                        ) : null}
                      </td>
                      <td className="tnum px-3 py-1.5 text-end">{formatNumber(u.packSize)}</td>
                      <td className="tnum px-3 py-1.5 text-[var(--color-muted)]">{u.barcode ?? '—'}</td>
                      <td className="tnum px-3 py-1.5 text-end font-bold">
                        {u.price != null ? formatMoney(u.price) : '—'}
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        <BoolIcon value={u.isMainUnit} />
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        <BoolIcon value={u.isSaleUnit} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function BoolIcon({ value }: { value: boolean }) {
  return value ? (
    <CheckCircle2 className="mx-auto size-4 text-[var(--color-success)]" aria-hidden />
  ) : (
    <XCircle className="mx-auto size-4 text-[var(--color-muted)]" aria-hidden />
  );
}
