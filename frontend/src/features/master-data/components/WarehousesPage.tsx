import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Warehouse as WarehouseIcon, Plus, Pencil, Ban } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { OriginBadge } from '@/shared/ui/OriginBadge';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import {
  useWarehouses,
  useCreateWarehouse,
  useUpdateWarehouse,
  type Warehouse,
} from '../api/master-data.api';
import { Field, CheckField, MdDialog, errorText } from './MdShared';

/**
 * المخازن (POSI003 warehouses) — list + create/edit.
 * GET/POST /warehouses · PUT /warehouses/{code}. ERP WAREHOUSE_DETAILS merged
 * with the MOTECH_POS overlay (origin badge). supervisor/admin.
 */
export function WarehousesPage() {
  const { t } = useTranslation();
  const query = useWarehouses();
  const [dialog, setDialog] = useState<{ warehouse: Warehouse | null } | null>(null);

  const rows = query.data ?? [];

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <WarehouseIcon className="size-6 text-[var(--color-brand-500)]" aria-hidden />
          {t('warehouses.title')}
        </h1>
        <Button variant="primary" onClick={() => setDialog({ warehouse: null })}>
          <Plus className="size-4" />
          {t('warehouses.new')}
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
                  <th className="px-3 py-2 text-start font-semibold">{t('warehouses.name')}</th>
                  <th className="px-3 py-2 text-start font-semibold">{t('warehouses.code')}</th>
                  <th className="hidden px-3 py-2 text-start font-semibold md:table-cell">
                    {t('warehouses.keeper')}
                  </th>
                  <th className="hidden px-3 py-2 text-start font-semibold lg:table-cell">
                    {t('warehouses.tel')}
                  </th>
                  <th className="hidden px-3 py-2 text-end font-semibold sm:table-cell">
                    {t('warehouses.priceLevel')}
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">{t('md.origin')}</th>
                  <th className="px-3 py-2 text-end font-semibold">{t('md.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((w) => (
                  <tr
                    key={w.code}
                    className={`hover:bg-[var(--color-surface-2)] ${w.inactive ? 'opacity-50' : ''}`}
                  >
                    <td className="px-3 py-2 font-medium">
                      {w.arName?.trim() || w.enName?.trim() || '—'}
                      {w.noSale ? (
                        <span
                          className="ms-2 inline-flex items-center gap-1 rounded-full bg-[var(--color-warning)]/15 px-2 py-0.5 text-[10px] text-[var(--color-warning)]"
                          title={t('warehouses.noSaleHint')}
                        >
                          <Ban className="size-3" aria-hidden />
                          {t('warehouses.noSale')}
                        </span>
                      ) : null}
                      {w.inactive ? (
                        <span className="ms-2 rounded-full bg-[var(--color-danger)]/15 px-2 py-0.5 text-[10px] text-[var(--color-danger)]">
                          {t('md.inactive')}
                        </span>
                      ) : null}
                    </td>
                    <td className="tnum px-3 py-2 text-[var(--color-muted)]">{w.code}</td>
                    <td className="hidden px-3 py-2 text-[var(--color-muted)] md:table-cell">
                      {w.keeper || '—'}
                    </td>
                    <td className="tnum hidden px-3 py-2 text-[var(--color-muted)] lg:table-cell">
                      {w.tel || '—'}
                    </td>
                    <td className="tnum hidden px-3 py-2 text-end sm:table-cell">
                      {w.priceLevel ?? '—'}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <OriginBadge origin={w.origin} />
                    </td>
                    <td className="px-3 py-2 text-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t('md.edit')}
                        title={t('md.edit')}
                        onClick={() => setDialog({ warehouse: w })}
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
        <WarehouseDialog warehouse={dialog.warehouse} onClose={() => setDialog(null)} />
      ) : null}
    </div>
  );
}

function WarehouseDialog({
  warehouse,
  onClose,
}: {
  warehouse: Warehouse | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const isEdit = !!warehouse;
  const create = useCreateWarehouse();
  const update = useUpdateWarehouse();
  const pending = create.isPending || update.isPending;

  const [code, setCode] = useState(warehouse ? String(warehouse.code) : '');
  const [arName, setArName] = useState(warehouse?.arName ?? '');
  const [enName, setEnName] = useState(warehouse?.enName ?? '');
  const [location, setLocation] = useState(warehouse?.location ?? '');
  const [tel, setTel] = useState(warehouse?.tel ?? '');
  const [keeper, setKeeper] = useState(warehouse?.keeper ?? '');
  const [priceLevel, setPriceLevel] = useState(
    warehouse?.priceLevel != null ? String(warehouse.priceLevel) : '',
  );
  const [noSale, setNoSale] = useState(warehouse?.noSale ?? false);
  const [inactive, setInactive] = useState(warehouse?.inactive ?? false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const canSubmit = arName.trim().length > 0;

  const submit = async () => {
    setError(null);
    const dto = {
      arName: arName.trim(),
      enName: enName.trim() || undefined,
      location: location.trim() || undefined,
      tel: tel.trim() || undefined,
      keeper: keeper.trim() || undefined,
      priceLevel: priceLevel.trim() ? Number(priceLevel) : undefined,
      noSale,
      inactive,
    };
    try {
      if (isEdit && warehouse) {
        const saved = await update.mutateAsync({ code: warehouse.code, dto });
        setDone(`${t('warehouses.updated')} ${saved.code}`);
      } else {
        const saved = await create.mutateAsync({
          ...dto,
          code: code.trim() ? Number(code) : undefined,
        });
        setDone(`${t('warehouses.created')} ${saved.code}`);
      }
    } catch (e) {
      setError(errorText(e, t('md.saveError')));
    }
  };

  return (
    <MdDialog
      title={isEdit ? t('warehouses.editTitle') : t('warehouses.newTitle')}
      icon={<WarehouseIcon className="size-5 text-[var(--color-brand-500)]" aria-hidden />}
      origin={warehouse?.origin}
      onClose={onClose}
      done={done}
      error={error}
      pending={pending}
      canSubmit={canSubmit}
      onSubmit={submit}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label={t('warehouses.code')}>
          <Input
            type="number"
            min={1}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isEdit}
            className="tnum h-10"
            placeholder={t('warehouses.codePlaceholder')}
          />
        </Field>
        <Field label={t('warehouses.priceLevel')}>
          <Input
            type="number"
            min={1}
            max={999}
            value={priceLevel}
            onChange={(e) => setPriceLevel(e.target.value)}
            className="tnum h-10 text-end"
            placeholder="1"
          />
        </Field>
      </div>
      <Field label={t('md.arName')}>
        <Input
          autoFocus
          value={arName}
          onChange={(e) => setArName(e.target.value)}
          className="h-10"
        />
      </Field>
      <Field label={t('md.enName')}>
        <Input value={enName} onChange={(e) => setEnName(e.target.value)} className="h-10" dir="ltr" />
      </Field>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label={t('warehouses.location')}>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} className="h-10" />
        </Field>
        <Field label={t('warehouses.tel')}>
          <Input value={tel} onChange={(e) => setTel(e.target.value)} className="tnum h-10" dir="ltr" />
        </Field>
      </div>
      <Field label={t('warehouses.keeper')}>
        <Input value={keeper} onChange={(e) => setKeeper(e.target.value)} className="h-10" />
      </Field>
      <CheckField label={t('warehouses.noSale')} checked={noSale} onChange={setNoSale} />
      <CheckField label={t('md.inactive')} checked={inactive} onChange={setInactive} />
    </MdDialog>
  );
}
