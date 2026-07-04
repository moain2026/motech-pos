import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Coins, Plus, Pencil, Star } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { OriginBadge } from '@/shared/ui/OriginBadge';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { formatNumber } from '@/shared/lib/format';
import {
  useCurrencies,
  useCreateCurrency,
  useUpdateCurrency,
  type Currency,
} from '../api/master-data.api';
import { Field, CheckField, MdDialog, errorText } from './MdShared';

/**
 * العملات وأسعار الصرف (POSI011 currencies) — list + create/edit with both
 * exchange rates: accounting (CUR_RATE) and POS/cashier (CUR_RATE_POS).
 * GET/POST /currencies · PUT /currencies/{code}. ERP EX_RATE merged with the
 * MOTECH_POS overlay (origin badge). supervisor/admin.
 */
export function CurrenciesPage() {
  const { t } = useTranslation();
  const query = useCurrencies();
  const [dialog, setDialog] = useState<{ currency: Currency | null } | null>(null);

  const rows = query.data ?? [];

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Coins className="size-6 text-[var(--color-brand-500)]" aria-hidden />
          {t('currencies.title')}
        </h1>
        <Button variant="primary" onClick={() => setDialog({ currency: null })}>
          <Plus className="size-4" />
          {t('currencies.new')}
        </Button>
      </div>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-auto scroll-thin">
          {query.isLoading ? (
            <LoadingView />
          ) : query.isError ? (
            <ErrorView error={query.error} onRetry={() => query.refetch()} />
          ) : rows.length === 0 ? (
            <EmptyView />
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
                <tr>
                  <th className="px-3 py-2 text-start font-semibold">{t('currencies.name')}</th>
                  <th className="px-3 py-2 text-start font-semibold">{t('currencies.code')}</th>
                  <th className="px-3 py-2 text-end font-semibold">{t('currencies.rate')}</th>
                  <th className="px-3 py-2 text-end font-semibold">{t('currencies.ratePos')}</th>
                  <th className="hidden px-3 py-2 text-end font-semibold md:table-cell">
                    {t('currencies.fractionNo')}
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">{t('md.origin')}</th>
                  <th className="px-3 py-2 text-end font-semibold">{t('md.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((c) => (
                  <tr
                    key={c.code}
                    className={`hover:bg-[var(--color-surface-2)] ${c.inactive ? 'opacity-50' : ''}`}
                  >
                    <td className="px-3 py-2 font-medium">
                      {c.arName?.trim() || c.enName?.trim() || c.code}
                      {c.isLocal ? (
                        <span
                          className="ms-2 inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-600)]/15 px-2 py-0.5 text-[10px] text-[var(--color-brand-500)]"
                          title={t('currencies.localHint')}
                        >
                          <Star className="size-3" aria-hidden />
                          {t('currencies.local')}
                        </span>
                      ) : null}
                      {c.inactive ? (
                        <span className="ms-2 rounded-full bg-[var(--color-danger)]/15 px-2 py-0.5 text-[10px] text-[var(--color-danger)]">
                          {t('md.inactive')}
                        </span>
                      ) : null}
                    </td>
                    <td className="tnum px-3 py-2 text-[var(--color-muted)]" dir="ltr">
                      {c.code}
                    </td>
                    <td className="tnum px-3 py-2 text-end font-bold">
                      {c.rate != null ? formatNumber(c.rate) : '—'}
                    </td>
                    <td className="tnum px-3 py-2 text-end font-bold">
                      {c.ratePos != null ? formatNumber(c.ratePos) : '—'}
                    </td>
                    <td className="tnum hidden px-3 py-2 text-end md:table-cell">
                      {c.fractionNo ?? '—'}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <OriginBadge origin={c.origin} />
                    </td>
                    <td className="px-3 py-2 text-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t('md.edit')}
                        title={t('md.edit')}
                        onClick={() => setDialog({ currency: c })}
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
      </Card>

      {dialog ? (
        <CurrencyDialog currency={dialog.currency} onClose={() => setDialog(null)} />
      ) : null}
    </div>
  );
}

function CurrencyDialog({
  currency,
  onClose,
}: {
  currency: Currency | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const isEdit = !!currency;
  const create = useCreateCurrency();
  const update = useUpdateCurrency();
  const pending = create.isPending || update.isPending;

  const [code, setCode] = useState(currency?.code ?? '');
  const [arName, setArName] = useState(currency?.arName ?? '');
  const [enName, setEnName] = useState(currency?.enName ?? '');
  const [rate, setRate] = useState(currency?.rate != null ? String(currency.rate) : '');
  const [ratePos, setRatePos] = useState(currency?.ratePos != null ? String(currency.ratePos) : '');
  const [fractionNo, setFractionNo] = useState(
    currency?.fractionNo != null ? String(currency.fractionNo) : '',
  );
  const [inactive, setInactive] = useState(currency?.inactive ?? false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const canSubmit =
    (isEdit || /^[A-Za-z]{2,7}$/.test(code.trim())) && arName.trim().length > 0;

  const submit = async () => {
    setError(null);
    const dto = {
      arName: arName.trim(),
      enName: enName.trim() || undefined,
      rate: rate.trim() ? Number(rate) : undefined,
      ratePos: ratePos.trim() ? Number(ratePos) : undefined,
      fractionNo: fractionNo.trim() ? Number(fractionNo) : undefined,
      inactive,
    };
    try {
      if (isEdit && currency) {
        const saved = await update.mutateAsync({ code: currency.code, dto });
        setDone(`${t('currencies.updated')} ${saved.code}`);
      } else {
        const saved = await create.mutateAsync({ ...dto, code: code.trim().toUpperCase() });
        setDone(`${t('currencies.created')} ${saved.code}`);
      }
    } catch (e) {
      setError(errorText(e, t('md.saveError')));
    }
  };

  return (
    <MdDialog
      title={isEdit ? t('currencies.editTitle') : t('currencies.newTitle')}
      icon={<Coins className="size-5 text-[var(--color-brand-500)]" aria-hidden />}
      origin={currency?.origin}
      onClose={onClose}
      done={done}
      error={error}
      pending={pending}
      canSubmit={canSubmit}
      onSubmit={submit}
    >
      <Field label={t('currencies.code')}>
        <Input
          autoFocus={!isEdit}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={isEdit}
          className="tnum h-10 uppercase"
          placeholder="USD"
          dir="ltr"
          maxLength={7}
        />
      </Field>
      <Field label={t('md.arName')}>
        <Input
          autoFocus={isEdit}
          value={arName}
          onChange={(e) => setArName(e.target.value)}
          className="h-10"
        />
      </Field>
      <Field label={t('md.enName')}>
        <Input value={enName} onChange={(e) => setEnName(e.target.value)} className="h-10" dir="ltr" />
      </Field>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label={t('currencies.rate')}>
          <Input
            type="number"
            min={0}
            step="any"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="tnum h-10 text-end"
            placeholder="1"
          />
        </Field>
        <Field label={t('currencies.ratePos')}>
          <Input
            type="number"
            min={0}
            step="any"
            value={ratePos}
            onChange={(e) => setRatePos(e.target.value)}
            className="tnum h-10 text-end"
            placeholder="1"
          />
        </Field>
      </div>
      <Field label={t('currencies.fractionNo')}>
        <Input
          type="number"
          min={0}
          max={6}
          value={fractionNo}
          onChange={(e) => setFractionNo(e.target.value)}
          className="tnum h-10 text-end"
          placeholder="2"
        />
      </Field>
      <CheckField label={t('md.inactive')} checked={inactive} onChange={setInactive} />
    </MdDialog>
  );
}
