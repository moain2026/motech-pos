import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings2,
  Store,
  Coins,
  Printer,
  Award,
  ToggleLeft,
  Save,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { LoadingView, ErrorView } from '@/shared/ui/StateView';
import { ApiError } from '@/shared/lib/api-client';
import type { Settings, SettingsOverride } from '@/shared/lib/types';
import { useSettings, useUpdateSettings } from '../api/settings.api';

/**
 * الإعدادات (Settings) — view/edit system settings. Reads GET /settings;
 * admin-only edits are persisted as local overrides via PUT /settings.
 * The only editable fields exposed here are the store identity (shop name,
 * footer), currency and the loyalty-points toggle — everything else is shown
 * read-only so we never fabricate keys the backend doesn't accept.
 */
export function SettingsPage() {
  const q = useSettings();

  if (q.isLoading) return <LoadingView />;
  if (q.isError) return <ErrorView error={q.error} onRetry={() => q.refetch()} />;
  if (!q.data) return null;
  return <SettingsForm data={q.data} />;
}

/** Override keys the backend accepts (mirror of GET field names). */
const KEY = {
  shopName: 'shopName',
  billFooter: 'billFooter',
  currency: 'currency',
  usePosPointSys: 'points.usePosPointSys',
} as const;

function SettingsForm({ data }: { data: Settings }) {
  const { t } = useTranslation();
  const update = useUpdateSettings();

  const [shopName, setShopName] = useState(data.shopName ?? '');
  const [billFooter, setBillFooter] = useState(data.billFooter ?? '');
  const [currency, setCurrency] = useState(data.currency ?? '');
  const [usePoints, setUsePoints] = useState(data.points.usePosPointSys);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Re-sync when the underlying data changes (after a successful save refetch).
  useEffect(() => {
    setShopName(data.shopName ?? '');
    setBillFooter(data.billFooter ?? '');
    setCurrency(data.currency ?? '');
    setUsePoints(data.points.usePosPointSys);
  }, [data]);

  const dirty =
    shopName !== (data.shopName ?? '') ||
    billFooter !== (data.billFooter ?? '') ||
    currency !== (data.currency ?? '') ||
    usePoints !== data.points.usePosPointSys;

  const save = async () => {
    setError(null);
    setSaved(false);
    const overrides: SettingsOverride[] = [];
    if (shopName !== (data.shopName ?? '')) overrides.push({ key: KEY.shopName, value: shopName });
    if (billFooter !== (data.billFooter ?? ''))
      overrides.push({ key: KEY.billFooter, value: billFooter });
    if (currency !== (data.currency ?? '')) overrides.push({ key: KEY.currency, value: currency });
    if (usePoints !== data.points.usePosPointSys)
      overrides.push({ key: KEY.usePosPointSys, value: usePoints });
    if (overrides.length === 0) return;
    try {
      await update.mutateAsync({ overrides });
      setSaved(true);
    } catch (e) {
      if (e instanceof ApiError) {
        const trace = e.problem.traceId ? ` (traceId: ${e.problem.traceId})` : '';
        setError(`${e.problem.detail || e.problem.title}${trace}`);
      } else {
        setError(t('settings.saveError'));
      }
    }
  };

  return (
    <div className="mx-auto grid max-w-3xl gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Settings2 className="size-6 text-[var(--color-brand-500)]" aria-hidden />
          {t('settings.title')}
        </h1>
        {data.hasOverrides ? (
          <span className="flex items-center gap-1 rounded-full bg-[var(--color-brand-600)]/15 px-3 py-1 text-xs text-[var(--color-brand-500)]">
            <Info className="size-3.5" aria-hidden />
            {t('settings.hasOverrides')}
          </span>
        ) : null}
      </div>

      {/* Store identity */}
      <Section icon={<Store className="size-5" />} title={t('settings.storeSection')}>
        <Field label={t('settings.shopName')}>
          <Input value={shopName} onChange={(e) => setShopName(e.target.value)} className="h-10" />
        </Field>
        <Field label={t('settings.billFooter')}>
          <Input
            value={billFooter}
            onChange={(e) => setBillFooter(e.target.value)}
            className="h-10"
            placeholder={t('settings.billFooterPlaceholder')}
          />
        </Field>
      </Section>

      {/* Currency & pricing */}
      <Section icon={<Coins className="size-5" />} title={t('settings.currencySection')}>
        <Field label={t('settings.currency')}>
          <Input
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="h-10"
            placeholder="YER"
          />
        </Field>
        <ReadOnly label={t('settings.priceLevel')} value={data.priceLevel ?? '—'} />
        <ReadOnly label={t('settings.pricingType')} value={String(data.pricingType ?? '—')} />
      </Section>

      {/* Loyalty points */}
      <Section icon={<Award className="size-5" />} title={t('settings.pointsSection')}>
        <Toggle
          label={t('settings.usePoints')}
          checked={usePoints}
          onChange={setUsePoints}
        />
        <ReadOnly
          label={t('settings.pointCalcType')}
          value={data.points.pointCalcType != null ? String(data.points.pointCalcType) : '—'}
        />
      </Section>

      {/* Printing (read-only view of current values) */}
      <Section icon={<Printer className="size-5" />} title={t('settings.printSection')}>
        <ReadOnly label={t('settings.printBill')} value={yesNo(t, data.printing.printBill)} />
        <ReadOnly
          label={t('settings.printBeforeSave')}
          value={yesNo(t, data.printing.printBillBeforeSave)}
        />
        <ReadOnly label={t('settings.openDrawer')} value={yesNo(t, data.printing.openDrawer)} />
      </Section>

      {/* Features */}
      <Section icon={<ToggleLeft className="size-5" />} title={t('settings.featuresSection')}>
        <ReadOnly label={t('settings.useSaleOrder')} value={yesNo(t, data.features.useSaleOrder)} />
        <ReadOnly label={t('settings.useDiscCard')} value={yesNo(t, data.features.useDiscCard)} />
        <ReadOnly
          label={t('settings.allowChangeCurr')}
          value={yesNo(t, data.features.allowChangeBillCurr)}
        />
      </Section>

      {error ? (
        <p
          role="alert"
          className="rounded-md bg-[var(--color-danger)]/15 p-2 text-center text-sm text-[var(--color-danger)]"
        >
          {error}
        </p>
      ) : null}
      {saved && !dirty ? (
        <p
          role="status"
          className="flex items-center justify-center gap-2 rounded-md bg-[var(--color-success)]/15 p-2 text-center text-sm text-[var(--color-success)]"
        >
          <CheckCircle2 className="size-4" aria-hidden />
          {t('settings.saved')}
        </p>
      ) : null}

      <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-[var(--color-surface)] py-3">
        <Button
          size="lg"
          variant="primary"
          disabled={!dirty || update.isPending}
          onClick={save}
        >
          <Save className="size-5" />
          {update.isPending ? t('settings.saving') : t('settings.save')}
        </Button>
      </div>
    </div>
  );
}

function yesNo(t: (k: string) => string, v: boolean): string {
  return v ? t('settings.yes') : t('settings.no');
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <h2 className="mb-3 flex items-center gap-2 font-bold text-[var(--color-fg)]">
        <span className="text-[var(--color-brand-500)]">{icon}</span>
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-[var(--color-muted)]">{label}</span>
      {children}
    </label>
  );
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-[var(--color-muted)]">{label}</span>
      <div className="flex h-10 items-center rounded-md border bg-[var(--color-surface-2)] px-3 text-sm text-[var(--color-muted)]">
        {value}
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-md border p-3 sm:col-span-2">
      <span className="text-sm font-medium">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={
          'relative h-6 w-11 shrink-0 rounded-full transition-colors ' +
          (checked ? 'bg-[var(--color-brand-600)]' : 'bg-[var(--color-surface-2)] border')
        }
      >
        <span
          className={
            'absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ' +
            (checked ? 'start-0.5 translate-x-0' : 'end-0.5')
          }
        />
      </button>
    </label>
  );
}
