import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus, UserCheck, X } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { CustomerPicker, customerLabel } from '@/features/customers';
import { useCart } from '../store/cart.store';

/**
 * POS "attach customer" control. Shows the currently-attached customer (or a
 * prompt) and opens a modal picker to search & attach one for loyalty/credit.
 */
export function CustomerAttach() {
  const { t } = useTranslation();
  const customer = useCart((s) => s.customer);
  const setCustomer = useCart((s) => s.setCustomer);
  const [open, setOpen] = useState(false);

  return (
    <>
      {customer ? (
        <div className="flex items-center justify-between gap-2 rounded-[var(--radius)] border bg-[var(--color-surface-2)] px-3 py-2">
          <span className="flex min-w-0 items-center gap-2 text-sm">
            <UserCheck className="size-4 shrink-0 text-[var(--color-success)]" aria-hidden />
            <span className="truncate font-medium">{customer.name}</span>
          </span>
          <button
            onClick={() => setCustomer(null)}
            className="text-[var(--color-muted)] hover:text-[var(--color-danger)]"
            aria-label={t('pos.removeCustomer')}
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <Button variant="outline" className="w-full justify-start" onClick={() => setOpen(true)}>
          <UserPlus className="size-4" />
          {t('pos.addCustomer')}
        </Button>
      )}

      {open ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t('pos.addCustomer')}
        >
          <div className="flex h-[70vh] w-full max-w-md flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="font-bold">{t('pos.addCustomer')}</h2>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label={t('returns.close')}>
                <X className="size-5" />
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden p-3">
              <CustomerPicker
                selectedCode={customer?.code ?? null}
                onSelect={(c) => {
                  setCustomer({ code: c.code, name: customerLabel(c, t('customers.noName')) });
                  setOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
