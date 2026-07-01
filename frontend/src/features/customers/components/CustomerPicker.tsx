import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, User } from 'lucide-react';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import type { Customer } from '@/shared/lib/types';
import { useCustomerSearch, customerLabel } from '../api/customers.api';

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

/**
 * Reusable customer search + select list. Used by the Customers screen and the
 * POS "attach customer" dialog. Calls onSelect with the picked customer.
 */
export function CustomerPicker({
  onSelect,
  selectedCode,
}: {
  onSelect: (c: Customer) => void;
  selectedCode?: string | null;
}) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const debounced = useDebounced(search, 300);
  const query = useCustomerSearch(debounced);

  const customers = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
    [query.data],
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute inset-y-0 end-3 my-auto size-5 text-[var(--color-muted)]"
          aria-hidden
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('customers.search')}
          className="h-11 pe-10"
          aria-label={t('customers.search')}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto scroll-thin">
        {query.isLoading ? (
          <LoadingView />
        ) : query.isError ? (
          <ErrorView error={query.error} onRetry={() => query.refetch()} />
        ) : customers.length === 0 ? (
          <EmptyView />
        ) : (
          <>
            <ul className="divide-y" aria-label={t('customers.title')}>
              {customers.map((c) => (
                <li key={c.code}>
                  <button
                    onClick={() => onSelect(c)}
                    className={
                      'flex w-full items-center gap-3 px-3 py-3 text-start transition-colors hover:bg-[var(--color-surface-2)] ' +
                      (selectedCode === c.code ? 'bg-[var(--color-brand-600)]/15' : '')
                    }
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-brand-500)]">
                      <User className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {customerLabel(c, t('customers.noName'))}
                      </span>
                      <span className="tnum block text-xs text-[var(--color-muted)]">
                        {t('customers.code')}: {c.code}
                        {c.mobile ? ` · ${c.mobile}` : ''}
                      </span>
                    </span>
                    {c.inactive ? (
                      <span className="rounded-full bg-[var(--color-danger)]/15 px-2 py-0.5 text-xs text-[var(--color-danger)]">
                        {t('customers.inactive')}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>

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
    </div>
  );
}
