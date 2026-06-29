import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Package } from 'lucide-react';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { formatMoney } from '@/shared/lib/format';
import type { Item } from '@/shared/lib/types';
import { useItemSearch } from '../api/items.api';
import { useCart } from '../store/cart.store';

/** Debounce a value. */
function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

function itemLabel(item: Item, noName: string): string {
  return item.name?.trim() || item.barcode || item.code || noName;
}

export function ItemGrid() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const debounced = useDebounced(search, 300);
  const addItem = useCart((s) => s.addItem);
  const inputRef = useRef<HTMLInputElement>(null);

  const query = useItemSearch(debounced);
  const items = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
    [query.data],
  );

  // Barcode-scanner / Enter: if exactly one match, add it and clear search.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const term = search.trim();
    if (!term) return;
    const exact =
      items.find((i) => i.barcode === term) ?? items.find((i) => i.code === term);
    const pick = exact ?? (items.length === 1 ? items[0] : undefined);
    if (pick) {
      addItem(pick);
      setSearch('');
      inputRef.current?.focus();
    }
  };

  return (
    <section className="flex h-full flex-col gap-3" aria-label={t('pos.itemsGrid')}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute inset-y-0 end-3 my-auto size-5 text-[var(--color-muted)]"
          aria-hidden
        />
        <Input
          ref={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t('pos.search')}
          className="h-12 pe-10 text-base"
          aria-label={t('pos.search')}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto scroll-thin">
        {query.isLoading ? (
          <LoadingView />
        ) : query.isError ? (
          <ErrorView error={query.error} onRetry={() => query.refetch()} />
        ) : items.length === 0 ? (
          <EmptyView />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {items.map((item) => (
                <button
                  key={item.code}
                  onClick={() => addItem(item)}
                  className="flex flex-col gap-1 rounded-[var(--radius)] border bg-[var(--color-surface)] p-3 text-start transition-colors hover:border-[var(--color-brand-500)] hover:bg-[var(--color-surface-2)]"
                  aria-label={`${itemLabel(item, t('pos.noName'))} — ${formatMoney(item.lastPrice)}`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <Package className="size-4 shrink-0 text-[var(--color-brand-500)]" aria-hidden />
                    <Plus className="size-4 shrink-0 text-[var(--color-muted)]" aria-hidden />
                  </div>
                  <span className="line-clamp-2 min-h-10 text-sm font-medium">
                    {itemLabel(item, t('pos.noName'))}
                  </span>
                  <span className="tnum text-xs text-[var(--color-muted)]">{item.code}</span>
                  <span className="tnum mt-1 text-base font-bold text-[var(--color-brand-100)]">
                    {formatMoney(item.lastPrice)}
                  </span>
                  {item.unit ? (
                    <span className="text-xs text-[var(--color-muted)]">{item.unit}</span>
                  ) : null}
                </button>
              ))}
            </div>

            {query.hasNextPage ? (
              <div className="mt-3 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => query.fetchNextPage()}
                  disabled={query.isFetchingNextPage}
                >
                  {query.isFetchingNextPage ? t('status.loading') : t('bills.loadMore')}
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
