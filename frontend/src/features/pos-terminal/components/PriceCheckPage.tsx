import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScanBarcode, Search, PackageSearch } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { LoadingView, ErrorView } from '@/shared/ui/StateView';
import { formatMoney } from '@/shared/lib/format';
import { useItemDetail } from '../api/items.api';

/**
 * قارئ الأسعار (Price checker / POST price inquiry).
 * A cashier types/scans a code or barcode → shows name + price + available qty.
 * Uses GET /items/{code} (detail incl. total available stock). Barcodes that
 * are not the item code fall through to the same lookup (backend resolves both
 * via the items search path used elsewhere).
 */
export function PriceCheckPage() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [code, setCode] = useState<string | null>(null);

  const detail = useItemDetail(code);
  const item = detail.data;

  const lookup = () => {
    const c = input.trim();
    if (c) setCode(c);
  };

  return (
    <div className="mx-auto grid max-w-xl gap-4 p-4">
      <h1 className="flex items-center gap-2 text-lg font-bold">
        <ScanBarcode className="size-6 text-[var(--color-brand-500)]" aria-hidden />
        {t('priceCheck.title')}
      </h1>

      <Card className="p-4">
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            lookup();
          }}
        >
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-sm text-[var(--color-muted)]">{t('priceCheck.input')}</span>
            <Input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('priceCheck.placeholder')}
              className="h-11"
              aria-label={t('priceCheck.input')}
            />
          </label>
          <Button type="submit" variant="primary" className="h-11" disabled={!input.trim()}>
            <Search className="size-5" />
            {t('priceCheck.lookup')}
          </Button>
        </form>
        <p className="mt-2 text-xs text-[var(--color-muted)]">{t('priceCheck.hint')}</p>
      </Card>

      {code ? (
        <Card className="p-4">
          {detail.isLoading ? (
            <LoadingView />
          ) : detail.isError ? (
            <ErrorView error={detail.error} onRetry={() => detail.refetch()} />
          ) : item ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[var(--color-surface-2)] text-[var(--color-brand-500)]">
                  <PackageSearch className="size-6" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-lg font-bold">{item.name?.trim() || item.code}</p>
                  <p className="tnum text-xs text-[var(--color-muted)]">
                    {t('priceCheck.code')}: {item.code}
                    {item.barcode ? ` · ${t('priceCheck.barcode')}: ${item.barcode}` : ''}
                    {item.unit ? ` · ${item.unit}` : ''}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label={t('priceCheck.price')} tone="brand">
                  {formatMoney(item.lastPrice)}
                </Field>
                <Field label={t('priceCheck.available')} tone="success">
                  {new Intl.NumberFormat('ar').format(item.totalAvailableQty)}
                </Field>
              </div>
            </div>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}

function Field({
  label,
  children,
  tone,
}: {
  label: string;
  children: React.ReactNode;
  tone: 'brand' | 'success';
}) {
  const color =
    tone === 'brand' ? 'text-[var(--color-brand-100)]' : 'text-[var(--color-success)]';
  return (
    <div className="rounded-[var(--radius)] border bg-[var(--color-surface-2)] p-3 text-center">
      <p className="text-xs text-[var(--color-muted)]">{label}</p>
      <p className={`tnum mt-1 text-2xl font-extrabold ${color}`}>{children}</p>
    </div>
  );
}
