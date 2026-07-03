import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Search, Plus, Pencil, Layers } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { OriginBadge } from '@/shared/ui/OriginBadge';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { formatMoney } from '@/shared/lib/format';
import type { Item } from '@/shared/lib/types';
import { useItemSearch, useCategories } from '@/features/pos-terminal/api/items.api';
import { ItemDialog } from './ItemDialog';
import { ItemCatalogDialog } from './ItemCatalogDialog';

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

/**
 * إدارة الأصناف (Items management) — search + create/edit. Prices/names can be
 * set locally; ERP items get a local EDIT override. Origin badge shows source.
 * GET/POST/PUT /items · supervisor/admin.
 */
export function ItemsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const debounced = useDebounced(search, 300);
  const categories = useCategories();
  const query = useItemSearch(debounced, { category });

  const [dialog, setDialog] = useState<{ item: Item | null } | null>(null);
  const [catalogItem, setCatalogItem] = useState<Item | null>(null);

  const items = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
    [query.data],
  );

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Package className="size-6 text-[var(--color-brand-500)]" aria-hidden />
          {t('items.title')}
        </h1>
        <Button variant="primary" onClick={() => setDialog({ item: null })}>
          <Plus className="size-4" />
          {t('items.new')}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-lg flex-1">
          <Search
            className="pointer-events-none absolute inset-y-0 end-3 my-auto size-5 text-[var(--color-muted)]"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('items.search')}
            className="h-11 pe-10"
            aria-label={t('items.search')}
          />
        </div>
        {/* Category filter (GET /categories → ?category= on GET /items) */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-11 rounded-md border bg-[var(--color-surface)] px-3 text-sm"
          aria-label={t('catalog.categories')}
        >
          <option value="">{t('catalog.allCategories')}</option>
          {(categories.data ?? []).map((c) => (
            <option key={c.code} value={c.code}>
              {c.name?.trim() || c.code} ({c.itemCount})
            </option>
          ))}
        </select>
      </div>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-auto scroll-thin">
          {query.isLoading ? (
            <LoadingView />
          ) : query.isError ? (
            <ErrorView error={query.error} onRetry={() => query.refetch()} />
          ) : items.length === 0 ? (
            <EmptyView />
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
                <tr>
                  <th className="px-3 py-2 text-start font-semibold">{t('items.name')}</th>
                  <th className="px-3 py-2 text-start font-semibold">{t('items.code')}</th>
                  <th className="px-3 py-2 text-start font-semibold">{t('items.unit')}</th>
                  <th className="px-3 py-2 text-end font-semibold">{t('items.price')}</th>
                  <th className="px-3 py-2 text-center font-semibold">{t('items.origin')}</th>
                  <th className="px-3 py-2 text-end font-semibold">{t('items.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((it) => (
                  <tr key={it.code} className="hover:bg-[var(--color-surface-2)]">
                    <td className="px-3 py-2 font-medium">{it.name?.trim() || t('pos.noName')}</td>
                    <td className="tnum px-3 py-2 text-[var(--color-muted)]">{it.code}</td>
                    <td className="px-3 py-2 text-[var(--color-muted)]">{it.unit || '—'}</td>
                    <td className="tnum px-3 py-2 text-end font-bold">{formatMoney(it.lastPrice)}</td>
                    <td className="px-3 py-2 text-center">
                      <OriginBadge origin={it.origin} />
                    </td>
                    <td className="px-3 py-2 text-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t('catalog.details')}
                        title={t('catalog.details')}
                        onClick={() => setCatalogItem(it)}
                      >
                        <Layers className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t('items.edit')}
                        onClick={() => setDialog({ item: it })}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {query.hasNextPage ? (
          <div className="border-t p-3 text-center">
            <Button
              variant="outline"
              onClick={() => query.fetchNextPage()}
              disabled={query.isFetchingNextPage}
            >
              {query.isFetchingNextPage ? t('status.loading') : t('bills.loadMore')}
            </Button>
          </div>
        ) : null}
      </Card>

      {dialog ? (
        <ItemDialog
          item={dialog.item}
          onClose={() => setDialog(null)}
        />
      ) : null}

      {catalogItem ? (
        <ItemCatalogDialog item={catalogItem} onClose={() => setCatalogItem(null)} />
      ) : null}
    </div>
  );
}
