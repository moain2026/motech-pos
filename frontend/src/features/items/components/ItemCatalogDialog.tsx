import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Layers,
  Ruler,
  CheckCircle2,
  XCircle,
  Barcode,
  Gauge,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { OriginBadge } from '@/shared/ui/OriginBadge';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { ApiError } from '@/shared/lib/api-client';
import { formatMoney, formatNumber } from '@/shared/lib/format';
import { useItemPrices, useItemUnits } from '@/features/pos-terminal/api/items.api';
import {
  useItemBarcodes,
  useItemLimits,
  useAddItemBarcode,
  useRemoveItemBarcode,
  useUpdateItemLimits,
  usePriceAtLevel,
} from '../api/item-extras.api';
import type { Item } from '@/shared/lib/types';

type CatalogTab = 'pricing' | 'barcodes' | 'limits';

const TABS: { key: CatalogTab; icon: typeof Layers }[] = [
  { key: 'pricing', icon: Layers },
  { key: 'barcodes', icon: Barcode },
  { key: 'limits', icon: Gauge },
];

function errText(e: unknown, fallback: string): string {
  if (e instanceof ApiError) {
    const trace = e.problem.traceId ? ` (traceId: ${e.problem.traceId})` : '';
    return `${e.problem.detail || e.problem.title}${trace}`;
  }
  return fallback;
}

/**
 * Advanced-catalog detail (POS_ITM_PRICE / POSI2000 / POSI006-008-009):
 *  • Pricing tab: all price levels (LEV_NO × unit) + units of measure with
 *    conversion factors (P_SIZE) — GET /items/{code}/prices · /units.
 *  • Barcodes tab: multi-barcode per unit (ERP + LOCAL overlay), add LOCAL
 *    barcode / disable LOCAL barcode — GET/POST/DELETE /items/{code}/barcodes.
 *  • Limits tab: min/max/reorder stock limits (merged ERP + overlay), edited
 *    via PUT /items/{code} — GET /items/{code}/limits.
 */
export function ItemCatalogDialog({ item, onClose }: { item: Item; onClose: () => void }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<CatalogTab>('pricing');
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

        <div
          className="flex flex-wrap gap-2 border-b px-4 py-2"
          role="tablist"
          aria-label={t('catalog.details')}
        >
          {TABS.map(({ key, icon: Icon }) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={
                'flex items-center gap-2 rounded-[var(--radius)] border px-3 py-1.5 text-sm font-medium transition-colors ' +
                (tab === key
                  ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-600)] text-white'
                  : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-2)]')
              }
            >
              <Icon className="size-4" aria-hidden />
              {t(`catalog.tab.${key}`)}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scroll-thin p-4">
          {tab === 'barcodes' ? (
            <BarcodesTab item={item} />
          ) : tab === 'limits' ? (
            <LimitsTab item={item} />
          ) : (
            <>
          {/* Price levels */}
          <section aria-label={t('catalog.pricesTitle')}>
            <h3 className="mb-2 flex items-center gap-2 font-bold">
              <Layers className="size-4 text-[var(--color-brand-500)]" aria-hidden />
              {t('catalog.pricesTitle')}
            </h3>
            {prices.data && prices.data.levels.length > 0 ? (
              <PriceLevelPicker
                code={item.code}
                levels={prices.data.levels}
                units={(units.data?.units ?? []).map((u) => u.unit)}
              />
            ) : null}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Barcodes tab (POSI006/008/009 multi-barcode)
// ---------------------------------------------------------------------------

function BarcodesTab({ item }: { item: Item }) {
  const { t } = useTranslation();
  const query = useItemBarcodes(item.code);
  const add = useAddItemBarcode();
  const remove = useRemoveItemBarcode();

  const [barcode, setBarcode] = useState('');
  const [unit, setUnit] = useState('');
  const [packSize, setPackSize] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const bc = barcode.trim();
    if (!bc) return;
    setError(null);
    try {
      await add.mutateAsync({
        code: item.code,
        dto: {
          barcode: bc,
          unit: unit.trim() || undefined,
          packSize: packSize.trim() ? Number(packSize) : undefined,
        },
      });
      setBarcode('');
      setUnit('');
      setPackSize('');
    } catch (e) {
      setError(errText(e, t('catalog.barcodeAddError')));
    }
  };

  const disable = async (bc: string) => {
    setError(null);
    try {
      await remove.mutateAsync({ code: item.code, barcode: bc });
    } catch (e) {
      setError(errText(e, t('catalog.barcodeAddError')));
    }
  };

  return (
    <section aria-label={t('catalog.tab.barcodes')}>
      {/* Add a LOCAL barcode */}
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)_minmax(0,1fr)_auto]">
        <Input
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void submit();
          }}
          placeholder={t('catalog.newBarcode')}
          className="tnum h-10"
          dir="ltr"
          aria-label={t('catalog.newBarcode')}
        />
        <Input
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder={t('catalog.unit')}
          className="h-10"
          aria-label={t('catalog.unit')}
        />
        <Input
          type="number"
          min={0}
          value={packSize}
          onChange={(e) => setPackSize(e.target.value)}
          placeholder={t('catalog.packSize')}
          className="tnum h-10 text-end"
          aria-label={t('catalog.packSize')}
        />
        <Button
          variant="primary"
          className="h-10"
          disabled={!barcode.trim() || add.isPending}
          onClick={() => void submit()}
        >
          <Plus className="size-4" />
          {t('catalog.addBarcode')}
        </Button>
      </div>
      {error ? (
        <p
          role="alert"
          className="mb-3 rounded-md bg-[var(--color-danger)]/15 p-2 text-center text-xs text-[var(--color-danger)]"
        >
          {error}
        </p>
      ) : null}

      {query.isLoading ? (
        <LoadingView />
      ) : query.isError ? (
        <ErrorView error={query.error} onRetry={() => query.refetch()} />
      ) : !query.data || query.data.barcodes.length === 0 ? (
        <EmptyView label={t('catalog.noBarcodes')} />
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-surface-2)] text-[var(--color-muted)]">
            <tr>
              <th className="px-3 py-1.5 text-start font-semibold">{t('items.barcode')}</th>
              <th className="px-3 py-1.5 text-start font-semibold">{t('catalog.unit')}</th>
              <th className="hidden px-3 py-1.5 text-end font-semibold sm:table-cell">
                {t('catalog.packSize')}
              </th>
              <th className="px-3 py-1.5 text-center font-semibold">{t('catalog.mainUnit')}</th>
              <th className="px-3 py-1.5 text-center font-semibold">{t('items.origin')}</th>
              <th className="px-3 py-1.5 text-end font-semibold">{t('items.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {query.data.barcodes.map((b) => (
              <tr
                key={b.barcode}
                className={`hover:bg-[var(--color-surface-2)] ${b.inactive ? 'opacity-50' : ''}`}
              >
                <td className="tnum px-3 py-1.5 font-medium" dir="ltr">
                  {b.barcode}
                  {b.noSale ? (
                    <span className="ms-2 rounded-full bg-[var(--color-danger)]/15 px-2 py-0.5 text-[10px] text-[var(--color-danger)]">
                      {t('catalog.noSale')}
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-1.5">{b.unit ?? '—'}</td>
                <td className="tnum hidden px-3 py-1.5 text-end sm:table-cell">
                  {b.packSize != null ? formatNumber(b.packSize) : '—'}
                </td>
                <td className="px-3 py-1.5 text-center">
                  <BoolIcon value={b.isMain} />
                </td>
                <td className="px-3 py-1.5 text-center">
                  <OriginBadge origin={b.origin} />
                </td>
                <td className="px-3 py-1.5 text-end">
                  {b.origin === 'LOCAL' && !b.inactive ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t('catalog.removeBarcode')}
                      title={t('catalog.removeBarcode')}
                      disabled={remove.isPending}
                      onClick={() => void disable(b.barcode)}
                    >
                      <Trash2 className="size-4 text-[var(--color-danger)]" />
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Stock limits tab (POSI2000 min/max/reorder)
// ---------------------------------------------------------------------------

function LimitsTab({ item }: { item: Item }) {
  const { t } = useTranslation();
  const query = useItemLimits(item.code);
  const update = useUpdateItemLimits();

  const [minQty, setMinQty] = useState<string | null>(null);
  const [maxQty, setMaxQty] = useState<string | null>(null);
  const [reorderQty, setReorderQty] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (query.isLoading) return <LoadingView />;
  if (query.isError) return <ErrorView error={query.error} onRetry={() => query.refetch()} />;
  if (!query.data) return <EmptyView />;

  const d = query.data;
  const minV = minQty ?? (d.minLimitQty != null ? String(d.minLimitQty) : '');
  const maxV = maxQty ?? (d.maxLimitQty != null ? String(d.maxLimitQty) : '');
  const reoV = reorderQty ?? (d.reorderLimitQty != null ? String(d.reorderLimitQty) : '');

  const submit = async () => {
    setError(null);
    setSaved(false);
    const dto: { minLimitQty?: number; maxLimitQty?: number; reorderLimitQty?: number } = {};
    if (minV.trim()) dto.minLimitQty = Number(minV);
    if (maxV.trim()) dto.maxLimitQty = Number(maxV);
    if (reoV.trim()) dto.reorderLimitQty = Number(reoV);
    try {
      await update.mutateAsync({ code: item.code, dto });
      setSaved(true);
    } catch (e) {
      setError(errText(e, t('catalog.limitsSaveError')));
    }
  };

  return (
    <section aria-label={t('catalog.tab.limits')} className="mx-auto max-w-md">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-bold">
          <Gauge className="size-4 text-[var(--color-brand-500)]" aria-hidden />
          {t('catalog.limitsTitle')}
        </h3>
        <OriginBadge origin={d.origin} />
      </div>

      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-[var(--color-muted)]">{t('catalog.minLimit')}</span>
          <Input
            type="number"
            min={0}
            value={minV}
            onChange={(e) => setMinQty(e.target.value)}
            className="tnum h-10 text-end"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-[var(--color-muted)]">{t('catalog.maxLimit')}</span>
          <Input
            type="number"
            min={0}
            value={maxV}
            onChange={(e) => setMaxQty(e.target.value)}
            className="tnum h-10 text-end"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-[var(--color-muted)]">{t('catalog.reorderLimit')}</span>
          <Input
            type="number"
            min={0}
            value={reoV}
            onChange={(e) => setReorderQty(e.target.value)}
            className="tnum h-10 text-end"
          />
        </label>

        {error ? (
          <p
            role="alert"
            className="rounded-md bg-[var(--color-danger)]/15 p-2 text-center text-xs text-[var(--color-danger)]"
          >
            {error}
          </p>
        ) : null}
        {saved ? (
          <p className="rounded-md bg-[var(--color-success)]/15 p-2 text-center text-xs text-[var(--color-success)]">
            {t('catalog.limitsSaved')}
          </p>
        ) : null}

        <Button variant="primary" disabled={update.isPending} onClick={() => void submit()}>
          <CheckCircle2 className="size-4" />
          {update.isPending ? t('items.saving') : t('items.save')}
        </Button>
      </div>
    </section>
  );
}

function BoolIcon({ value }: { value: boolean }) {
  return value ? (
    <CheckCircle2 className="mx-auto size-4 text-[var(--color-success)]" aria-hidden />
  ) : (
    <XCircle className="mx-auto size-4 text-[var(--color-muted)]" aria-hidden />
  );
}

/**
 * Sale-time price-level picker (POS_ITM_PRICE) — pick a LEV_NO (and optional
 * unit) → live resolved price via GET /items/{code}/prices/{levNo}?unit=.
 */
function PriceLevelPicker({
  code,
  levels,
  units,
}: {
  code: string;
  levels: number[];
  units: string[];
}) {
  const { t } = useTranslation();
  const [levNo, setLevNo] = useState<number | null>(null);
  const [unit, setUnit] = useState('');
  const q = usePriceAtLevel(code, levNo, unit || undefined);

  return (
    <div className="mb-3 flex flex-wrap items-end gap-2 rounded-md border bg-[var(--color-surface-2)]/50 p-2">
      <label className="flex flex-col gap-1">
        <span className="text-xs text-[var(--color-muted)]">{t('catalog.pickLevel')}</span>
        <select
          value={levNo ?? ''}
          onChange={(e) => setLevNo(e.target.value === '' ? null : Number(e.target.value))}
          className="h-9 rounded-md border bg-[var(--color-surface)] px-2 text-sm"
          aria-label={t('catalog.pickLevel')}
        >
          <option value="">—</option>
          {levels.map((l) => (
            <option key={l} value={l}>
              {t('catalog.level')} {l}
            </option>
          ))}
        </select>
      </label>
      {units.length > 0 ? (
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[var(--color-muted)]">{t('catalog.unit')}</span>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="h-9 rounded-md border bg-[var(--color-surface)] px-2 text-sm"
            aria-label={t('catalog.unit')}
          >
            <option value="">{t('catalog.baseUnit')}</option>
            {units.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {levNo != null ? (
        <div className="flex h-9 items-center rounded-md border bg-[var(--color-surface)] px-3">
          {q.isLoading ? (
            <span className="text-xs text-[var(--color-muted)]">{t('status.loading')}</span>
          ) : q.isError ? (
            <span className="text-xs text-[var(--color-danger)]">{t('catalog.noPriceAtLevel')}</span>
          ) : q.data ? (
            <span className="tnum text-sm font-bold text-[var(--color-brand-500)]">
              {formatMoney(q.data.price)}
              {q.data.unit ? (
                <span className="ms-1 text-xs font-normal text-[var(--color-muted)]">
                  / {q.data.unit}
                </span>
              ) : null}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
