import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Package, Tags } from 'lucide-react';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { formatMoney } from '@/shared/lib/format';
import type { Item } from '@/shared/lib/types';
import { useItemSearch, useCategories } from '../api/items.api';
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
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [flash, setFlash] = useState<string | null>(null);
  const debounced = useDebounced(search, 300);
  const addItem = useCart((s) => s.addItem);
  const inputRef = useRef<HTMLInputElement>(null);

  // تغذية راجعة فورية بصرية عند إضافة صنف (POS §7) — ومضة قصيرة على البطاقة.
  const add = (item: Item) => {
    addItem(item);
    setFlash(item.code);
    setTimeout(() => setFlash((c) => (c === item.code ? null : c)), 320);
  };

  const categories = useCategories();
  const selectedGroup = useMemo(
    () => categories.data?.find((c) => c.code === category) ?? null,
    [categories.data, category],
  );

  const query = useItemSearch(debounced, { category, subCategory });
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
      add(pick);
      setSearch('');
      inputRef.current?.focus();
    }
  };

  const CategoryChip = ({
    active,
    label,
    onClick,
    icon,
    small,
  }: {
    active: boolean;
    label: string;
    onClick: () => void;
    icon?: boolean;
    small?: boolean;
  }) => (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1 rounded-full border px-3 ${small ? 'py-0.5 text-[11px]' : 'py-1 text-xs'} font-medium transition-colors ${
        active
          ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-600)] text-white'
          : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-2)]'
      }`}
    >
      {icon ? <Tags className="size-3" aria-hidden /> : null}
      {label}
    </button>
  );

  return (
    <section className="flex h-full flex-col gap-3" aria-label={t('pos.itemsGrid')}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute inset-y-0 end-3 my-auto size-5 text-[var(--color-muted)]"
          aria-hidden
        />
        <Input
          ref={inputRef}
          inputSize="touch"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t('pos.search')}
          className="pe-11"
          aria-label={t('pos.search')}
        />
      </div>

      {/* Category browsing (GROUP_DETAILS → sub-groups) */}
      {categories.data && categories.data.length > 0 ? (
        <div className="flex flex-col gap-1">
          <div className="flex gap-1 overflow-x-auto scroll-thin pb-1" role="tablist" aria-label={t('catalog.categories')}>
            <CategoryChip
              active={!category}
              label={t('catalog.allCategories')}
              onClick={() => {
                setCategory('');
                setSubCategory('');
              }}
              icon
            />
            {categories.data.map((c) => (
              <CategoryChip
                key={c.code}
                active={category === c.code}
                label={`${c.name?.trim() || c.code} (${c.itemCount})`}
                onClick={() => {
                  setCategory((prev) => (prev === c.code ? '' : c.code));
                  setSubCategory('');
                }}
              />
            ))}
          </div>
          {selectedGroup && selectedGroup.children.length > 0 ? (
            <div className="flex gap-1 overflow-x-auto scroll-thin pb-1" aria-label={t('catalog.subCategories')}>
              {selectedGroup.children.map((sc) => (
                <CategoryChip
                  key={sc.code}
                  active={subCategory === sc.code}
                  label={`${sc.name?.trim() || sc.code} (${sc.itemCount})`}
                  onClick={() => setSubCategory((prev) => (prev === sc.code ? '' : sc.code))}
                  small
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto scroll-thin">
        {query.isLoading ? (
          <LoadingView />
        ) : query.isError ? (
          <ErrorView error={query.error} onRetry={() => query.refetch()} />
        ) : items.length === 0 ? (
          <EmptyView />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
              {items.map((item) => (
                <button
                  key={item.code}
                  onClick={() => add(item)}
                  className={`item-card flex min-h-[var(--touch-lg)] flex-col gap-1 rounded-[var(--radius)] border p-3 text-start transition-all active:scale-[0.97] hover:border-[var(--color-brand-500)] hover:bg-[var(--color-surface-2)] ${
                    flash === item.code
                      ? 'border-[var(--color-success)] bg-[var(--color-success)]/15'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)]'
                  }`}
                  aria-label={`${itemLabel(item, t('pos.noName'))} — ${formatMoney(item.lastPrice)}`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <Package className="size-4 shrink-0 text-[var(--color-brand-500)]" aria-hidden />
                    <Plus className="size-4 shrink-0 text-[var(--color-muted)]" aria-hidden />
                  </div>
                  <span className="line-clamp-2 min-h-10 text-[length:var(--text-sm)] font-medium">
                    {itemLabel(item, t('pos.noName'))}
                  </span>
                  <span className="tnum text-[length:var(--text-xs)] text-[var(--color-muted)]">
                    {item.code}
                  </span>
                  <span className="tnum mt-1 text-[length:var(--text-base)] font-bold text-[var(--color-brand-100)]">
                    {formatMoney(item.lastPrice)}
                  </span>
                  {item.unit ? (
                    <span className="text-[length:var(--text-xs)] text-[var(--color-muted)]">
                      {item.unit}
                    </span>
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
