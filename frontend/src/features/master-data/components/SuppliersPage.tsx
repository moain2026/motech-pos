import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, Search, Plus, Pencil } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { OriginBadge } from '@/shared/ui/OriginBadge';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  type Supplier,
} from '../api/master-data.api';
import { Field, CheckField, MdDialog, errorText } from './MdShared';

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

/**
 * الموردون (POSI001/002 supplier master) — list + search + create/edit.
 * GET/POST /suppliers · PUT /suppliers/{code}. ERP rows (V_DETAILS) merge
 * with the MOTECH_POS overlay; edits create an EDIT override (origin badge).
 * supervisor/admin (RBAC route + nav).
 */
export function SuppliersPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const debounced = useDebounced(search, 300);
  const query = useSuppliers(debounced);
  const [dialog, setDialog] = useState<{ supplier: Supplier | null } | null>(null);

  const rows = query.data ?? [];

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Truck className="size-6 text-[var(--color-brand-500)]" aria-hidden />
          {t('suppliers.title')}
        </h1>
        <Button variant="primary" onClick={() => setDialog({ supplier: null })}>
          <Plus className="size-4" />
          {t('suppliers.new')}
        </Button>
      </div>

      <div className="relative max-w-lg">
        <Search
          className="pointer-events-none absolute inset-y-0 end-3 my-auto size-5 text-[var(--color-muted)]"
          aria-hidden
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('suppliers.search')}
          className="h-11 pe-10"
          aria-label={t('suppliers.search')}
        />
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
                  <th className="px-3 py-2 text-start font-semibold">{t('suppliers.name')}</th>
                  <th className="px-3 py-2 text-start font-semibold">{t('suppliers.code')}</th>
                  <th className="hidden px-3 py-2 text-start font-semibold md:table-cell">
                    {t('suppliers.phone')}
                  </th>
                  <th className="hidden px-3 py-2 text-start font-semibold lg:table-cell">
                    {t('suppliers.contact')}
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">{t('md.origin')}</th>
                  <th className="px-3 py-2 text-end font-semibold">{t('md.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((s) => (
                  <tr
                    key={s.code}
                    className={`hover:bg-[var(--color-surface-2)] ${s.inactive ? 'opacity-50' : ''}`}
                  >
                    <td className="px-3 py-2 font-medium">
                      {s.arName?.trim() || s.enName?.trim() || '—'}
                      {s.inactive ? (
                        <span className="ms-2 rounded-full bg-[var(--color-danger)]/15 px-2 py-0.5 text-[10px] text-[var(--color-danger)]">
                          {t('md.inactive')}
                        </span>
                      ) : null}
                    </td>
                    <td className="tnum px-3 py-2 text-[var(--color-muted)]">{s.code}</td>
                    <td className="tnum hidden px-3 py-2 text-[var(--color-muted)] md:table-cell">
                      {s.phone || s.mobile || '—'}
                    </td>
                    <td className="hidden px-3 py-2 text-[var(--color-muted)] lg:table-cell">
                      {s.contact || '—'}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <OriginBadge origin={s.origin} />
                    </td>
                    <td className="px-3 py-2 text-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t('md.edit')}
                        title={t('md.edit')}
                        onClick={() => setDialog({ supplier: s })}
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
        <SupplierDialog supplier={dialog.supplier} onClose={() => setDialog(null)} />
      ) : null}
    </div>
  );
}

function SupplierDialog({
  supplier,
  onClose,
}: {
  supplier: Supplier | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const isEdit = !!supplier;
  const create = useCreateSupplier();
  const update = useUpdateSupplier();
  const pending = create.isPending || update.isPending;

  const [code, setCode] = useState(supplier?.code ?? '');
  const [arName, setArName] = useState(supplier?.arName ?? '');
  const [enName, setEnName] = useState(supplier?.enName ?? '');
  const [phone, setPhone] = useState(supplier?.phone ?? '');
  const [mobile, setMobile] = useState(supplier?.mobile ?? '');
  const [email, setEmail] = useState(supplier?.email ?? '');
  const [address, setAddress] = useState(supplier?.address ?? '');
  const [taxCode, setTaxCode] = useState(supplier?.taxCode ?? '');
  const [contact, setContact] = useState(supplier?.contact ?? '');
  const [creditPeriod, setCreditPeriod] = useState(
    supplier?.creditPeriod != null ? String(supplier.creditPeriod) : '',
  );
  const [inactive, setInactive] = useState(supplier?.inactive ?? false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const canSubmit = arName.trim().length > 0;

  const submit = async () => {
    setError(null);
    const dto = {
      arName: arName.trim(),
      enName: enName.trim() || undefined,
      phone: phone.trim() || undefined,
      mobile: mobile.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      taxCode: taxCode.trim() || undefined,
      contact: contact.trim() || undefined,
      creditPeriod: creditPeriod.trim() ? Number(creditPeriod) : undefined,
      inactive,
    };
    try {
      if (isEdit && supplier) {
        const saved = await update.mutateAsync({ code: supplier.code, dto });
        setDone(`${t('suppliers.updated')} ${saved.code}`);
      } else {
        const saved = await create.mutateAsync({
          ...dto,
          code: code.trim() || undefined,
        });
        setDone(`${t('suppliers.created')} ${saved.code}`);
      }
    } catch (e) {
      setError(errorText(e, t('md.saveError')));
    }
  };

  return (
    <MdDialog
      title={isEdit ? t('suppliers.editTitle') : t('suppliers.newTitle')}
      icon={<Truck className="size-5 text-[var(--color-brand-500)]" aria-hidden />}
      origin={supplier?.origin}
      onClose={onClose}
      done={done}
      error={error}
      pending={pending}
      canSubmit={canSubmit}
      onSubmit={submit}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label={t('suppliers.code')}>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isEdit}
            className="tnum h-10"
            placeholder={t('suppliers.codePlaceholder')}
          />
        </Field>
        <Field label={t('suppliers.creditPeriod')}>
          <Input
            type="number"
            min={0}
            value={creditPeriod}
            onChange={(e) => setCreditPeriod(e.target.value)}
            className="tnum h-10 text-end"
            placeholder="0"
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
        <Field label={t('suppliers.phone')}>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="tnum h-10" dir="ltr" />
        </Field>
        <Field label={t('suppliers.mobile')}>
          <Input value={mobile} onChange={(e) => setMobile(e.target.value)} className="tnum h-10" dir="ltr" />
        </Field>
      </div>
      <Field label={t('suppliers.email')}>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10"
          dir="ltr"
        />
      </Field>
      <Field label={t('suppliers.address')}>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} className="h-10" />
      </Field>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label={t('suppliers.taxCode')}>
          <Input value={taxCode} onChange={(e) => setTaxCode(e.target.value)} className="tnum h-10" />
        </Field>
        <Field label={t('suppliers.contact')}>
          <Input value={contact} onChange={(e) => setContact(e.target.value)} className="h-10" />
        </Field>
      </div>
      <CheckField label={t('md.inactive')} checked={inactive} onChange={setInactive} />
    </MdDialog>
  );
}
