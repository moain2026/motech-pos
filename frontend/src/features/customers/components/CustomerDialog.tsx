import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, CheckCircle2, User } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { OriginBadge } from '@/shared/ui/OriginBadge';
import { ApiError } from '@/shared/lib/api-client';
import type { Customer } from '@/shared/lib/types';
import { useCreateCustomer, useUpdateCustomer } from '../api/customers.api';

/**
 * Create / edit a customer. Code is required in create mode and locked in edit
 * mode (PUT keys by code). POST/PUT /customers · supervisor/admin.
 * On success calls onSaved with the persisted customer so the page can select it.
 */
export function CustomerDialog({
  customer,
  onClose,
  onSaved,
}: {
  customer: Customer | null;
  onClose: () => void;
  onSaved?: (c: Customer) => void;
}) {
  const { t } = useTranslation();
  const isEdit = !!customer;
  const create = useCreateCustomer();
  const update = useUpdateCustomer();
  const pending = create.isPending || update.isPending;

  const [code, setCode] = useState(customer?.code ?? '');
  const [arName, setArName] = useState(customer?.arName ?? '');
  const [enName, setEnName] = useState(customer?.enName ?? '');
  const [mobile, setMobile] = useState(customer?.mobile ?? '');
  const [whatsapp, setWhatsapp] = useState(customer?.whatsapp ?? '');
  const [phone, setPhone] = useState(customer?.phone ?? '');
  const [inactive, setInactive] = useState(customer?.inactive ?? false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const canSubmit = (isEdit || code.trim().length > 0) && arName.trim().length > 0;

  const submit = async () => {
    setError(null);
    if (!canSubmit) {
      setError(t('customers.validation'));
      return;
    }
    try {
      let saved: Customer;
      if (isEdit && customer) {
        saved = await update.mutateAsync({
          code: customer.code,
          dto: {
            arName: arName.trim(),
            enName: enName.trim() || undefined,
            mobile: mobile.trim() || undefined,
            whatsapp: whatsapp.trim() || undefined,
            phone: phone.trim() || undefined,
            inactive,
          },
        });
      } else {
        saved = await create.mutateAsync({
          code: code.trim(),
          arName: arName.trim(),
          enName: enName.trim() || undefined,
          mobile: mobile.trim() || undefined,
          whatsapp: whatsapp.trim() || undefined,
          phone: phone.trim() || undefined,
          inactive,
        });
      }
      setDone(true);
      onSaved?.(saved);
    } catch (e) {
      if (e instanceof ApiError) {
        const trace = e.problem.traceId ? ` (traceId: ${e.problem.traceId})` : '';
        setError(`${e.problem.detail || e.problem.title}${trace}`);
      } else {
        setError(t('customers.saveError'));
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? t('customers.editTitle') : t('customers.newTitle')}
    >
      <div className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="flex items-center gap-2 font-bold">
            <User className="size-5 text-[var(--color-brand-500)]" aria-hidden />
            {isEdit ? t('customers.editTitle') : t('customers.newTitle')}
            {customer?.origin ? <OriginBadge origin={customer.origin} /> : null}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('returns.close')}>
            <X className="size-5" />
          </Button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-4 p-6 text-center">
            <CheckCircle2 className="size-12 text-[var(--color-success)]" aria-hidden />
            <p className="font-bold">
              {isEdit ? t('customers.updated') : t('customers.created')}
            </p>
            <Button variant="primary" className="w-full" onClick={onClose}>
              {t('returns.close')}
            </Button>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto scroll-thin p-4">
              <div className="flex flex-col gap-3">
                <Field label={t('customers.code')}>
                  <Input
                    autoFocus={!isEdit}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={isEdit}
                    className="tnum h-10"
                    placeholder={t('customers.codePlaceholder')}
                  />
                </Field>
                <Field label={t('customers.arName')}>
                  <Input
                    autoFocus={isEdit}
                    value={arName}
                    onChange={(e) => setArName(e.target.value)}
                    className="h-10"
                    placeholder={t('customers.arNamePlaceholder')}
                  />
                </Field>
                <Field label={t('customers.enName')}>
                  <Input value={enName} onChange={(e) => setEnName(e.target.value)} className="h-10" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t('customers.mobile')}>
                    <Input
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="tnum h-10"
                      inputMode="tel"
                    />
                  </Field>
                  <Field label={t('customers.whatsapp')}>
                    <Input
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="tnum h-10"
                      inputMode="tel"
                    />
                  </Field>
                </div>
                <Field label={t('customers.phone')}>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="tnum h-10"
                    inputMode="tel"
                  />
                </Field>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={inactive}
                    onChange={(e) => setInactive(e.target.checked)}
                    className="size-4"
                  />
                  {t('customers.inactive')}
                </label>

                {error ? (
                  <p
                    role="alert"
                    className="rounded-md bg-[var(--color-danger)]/15 p-2 text-center text-xs text-[var(--color-danger)]"
                  >
                    {error}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="border-t p-4">
              <Button
                size="lg"
                variant="primary"
                className="w-full"
                disabled={!canSubmit || pending}
                onClick={submit}
              >
                <CheckCircle2 className="size-5" />
                {pending ? t('customers.saving') : t('customers.save')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
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
