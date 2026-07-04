import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Boxes, Search, AlertTriangle, PackageSearch, ClipboardCheck } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { formatNumber } from '@/shared/lib/format';
import type { InventoryItem } from '@/shared/lib/types';
import { useInventory, useLowStock } from '../api/inventory.api';
import { InventoryDetailDialog } from './InventoryDetailDialog';
import { StockCountsTab } from './StockCountsTab';

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

type Tab = 'all' | 'low' | 'counts';

/**
 * المخزون (Inventory) — aggregated available quantities per item (Arabic
 * names), a low-stock tab, a stock-counts (جرد POST018) tab, and a
 * per-warehouse detail drill-down.
 * GET /inventory · /inventory/low-stock · /inventory/{code} ·
 * /inventory/counts. supervisor/admin.
 */
export function InventoryPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const debounced = useDebounced(search, 300);
  const [detailCode, setDetailCode] = useState<string | null>(null);

  const all = useInventory(debounced);
  const low = useLowStock(60);

  const allItems = useMemo(
    () => all.data?.pages.flatMap((p) => p.data) ?? [],
    [all.data],
  );
  const lowItems = low.data?.data ?? [];
  const lowThreshold = low.data?.meta?.threshold;

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Boxes className="size-6 text-[var(--color-brand-500)]" aria-hidden />
          {t('inventory.title')}
        </h1>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label={t('inventory.title')}>
        <TabBtn active={tab === 'all'} onClick={() => setTab('all')} icon={<PackageSearch className="size-4" />}>
          {t('inventory.tab.all')}
        </TabBtn>
        <TabBtn active={tab === 'low'} onClick={() => setTab('low')} icon={<AlertTriangle className="size-4" />}>
          {t('inventory.tab.low')}
          {lowItems.length ? (
            <span className="tnum ms-1 rounded-full bg-[var(--color-warning)]/20 px-2 text-xs text-[var(--color-warning)]">
              {formatNumber(lowItems.length)}
            </span>
          ) : null}
        </TabBtn>
        <TabBtn active={tab === 'counts'} onClick={() => setTab('counts')} icon={<ClipboardCheck className="size-4" />}>
          {t('inventory.tab.counts')}
        </TabBtn>
      </div>

      {tab === 'all' ? (
        <>
          <div className="relative max-w-lg">
            <Search
              className="pointer-events-none absolute inset-y-0 end-3 my-auto size-5 text-[var(--color-muted)]"
              aria-hidden
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('inventory.search')}
              className="h-11 pe-10"
              aria-label={t('inventory.search')}
            />
          </div>
          <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="min-h-0 flex-1 overflow-auto scroll-thin">
              {all.isLoading ? (
                <LoadingView />
              ) : all.isError ? (
                <ErrorView error={all.error} onRetry={() => all.refetch()} />
              ) : allItems.length === 0 ? (
                <EmptyView />
              ) : (
                <InvTable rows={allItems} onOpen={setDetailCode} />
              )}
            </div>
            {all.hasNextPage ? (
              <div className="border-t p-3 text-center">
                <Button
                  variant="outline"
                  onClick={() => all.fetchNextPage()}
                  disabled={all.isFetchingNextPage}
                >
                  {all.isFetchingNextPage ? t('status.loading') : t('bills.loadMore')}
                </Button>
              </div>
            ) : null}
          </Card>
        </>
      ) : tab === 'counts' ? (
        <StockCountsTab />
      ) : (
        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {lowThreshold != null ? (
            <div className="flex items-center gap-2 border-b bg-[var(--color-warning)]/10 px-3 py-2 text-xs text-[var(--color-warning)]">
              <AlertTriangle className="size-4" aria-hidden />
              {t('inventory.lowHint', { threshold: lowThreshold })}
            </div>
          ) : null}
          <div className="min-h-0 flex-1 overflow-auto scroll-thin">
            {low.isLoading ? (
              <LoadingView />
            ) : low.isError ? (
              <ErrorView error={low.error} onRetry={() => low.refetch()} />
            ) : lowItems.length === 0 ? (
              <EmptyView />
            ) : (
              <InvTable rows={lowItems} onOpen={setDetailCode} lowlight />
            )}
          </div>
        </Card>
      )}

      {detailCode ? (
        <InventoryDetailDialog code={detailCode} onClose={() => setDetailCode(null)} />
      ) : null}
    </div>
  );
}

function InvTable({
  rows,
  onOpen,
  lowlight,
}: {
  rows: InventoryItem[];
  onOpen: (code: string) => void;
  lowlight?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <table className="w-full text-sm">
      <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
        <tr>
          <th className="px-3 py-2 text-start font-semibold">{t('inventory.name')}</th>
          <th className="px-3 py-2 text-start font-semibold">{t('inventory.code')}</th>
          <th className="px-3 py-2 text-end font-semibold">{t('inventory.qty')}</th>
          <th className="px-3 py-2 text-end font-semibold">{t('inventory.warehouses')}</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {rows.map((it) => {
          const negative = it.totalAvailableQty <= 0;
          return (
            <tr
              key={it.code}
              className="cursor-pointer hover:bg-[var(--color-surface-2)]"
              onClick={() => onOpen(it.code)}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpen(it.code);
                }
              }}
            >
              <td className="px-3 py-2 font-medium">{it.name?.trim() || it.code}</td>
              <td className="tnum px-3 py-2 text-[var(--color-muted)]">{it.code}</td>
              <td
                className={
                  'tnum px-3 py-2 text-end font-bold ' +
                  ((lowlight || negative) ? 'text-[var(--color-danger)]' : '')
                }
              >
                {formatNumber(it.totalAvailableQty)}
              </td>
              <td className="tnum px-3 py-2 text-end text-[var(--color-muted)]">
                {formatNumber(it.warehouseCount)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        'flex items-center gap-2 rounded-[var(--radius)] border px-4 py-2 text-sm font-medium transition-colors ' +
        (active
          ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-600)] text-white'
          : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-2)]')
      }
    >
      {icon}
      {children}
    </button>
  );
}
