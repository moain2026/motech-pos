import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, User, Phone, MessageCircle, Award, Star, Plus, Pencil } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { OriginBadge } from '@/shared/ui/OriginBadge';
import { LoadingView, ErrorView } from '@/shared/ui/StateView';
import { formatNumber, formatDateTime } from '@/shared/lib/format';
import type { Customer } from '@/shared/lib/types';
import { CustomerPicker } from './CustomerPicker';
import { CustomerDialog } from './CustomerDialog';
import { useCustomer, useCustomerPoints, customerLabel } from '../api/customers.api';

/**
 * Customers screen — search + select on the left, detail + loyalty points on
 * the right. Points come from GET /customers/{code}/points.
 */
export function CustomersPage() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Customer | null>(null);
  const [dialog, setDialog] = useState<{ customer: Customer | null } | null>(null);

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Users className="size-6 text-[var(--color-brand-500)]" aria-hidden />
          {t('customers.title')}
        </h1>
        <Button variant="primary" onClick={() => setDialog({ customer: null })}>
          <Plus className="size-4" />
          {t('customers.new')}
        </Button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <Card className="flex min-h-0 flex-col overflow-hidden p-3">
          <CustomerPicker onSelect={setSelected} selectedCode={selected?.code} />
        </Card>

        <Card className="min-h-0 overflow-auto scroll-thin p-4">
          {selected ? (
            <CustomerDetail
              code={selected.code}
              fallback={selected}
              onEdit={() => setDialog({ customer: selected })}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-[var(--color-muted)]">
              <User className="size-10" aria-hidden />
              <p className="text-sm">{t('customers.selectHint')}</p>
            </div>
          )}
        </Card>
      </div>

      {dialog ? (
        <CustomerDialog
          customer={dialog.customer}
          onClose={() => setDialog(null)}
          onSaved={(c) => setSelected(c)}
        />
      ) : null}
    </div>
  );
}

function CustomerDetail({
  code,
  fallback,
  onEdit,
}: {
  code: string;
  fallback: Customer;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  const detail = useCustomer(code);
  const points = useCustomerPoints(code);
  const c = detail.data ?? fallback;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <span className="grid size-16 shrink-0 place-items-center rounded-full bg-[var(--color-brand-600)]/20 text-[var(--color-brand-500)]">
          <User className="size-8" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="flex items-center gap-2 truncate text-lg font-bold">
            {customerLabel(c, t('customers.noName'))}
            <OriginBadge origin={c.origin} />
          </h2>
          <p className="tnum text-sm text-[var(--color-muted)]">
            {t('customers.code')}: {c.code}
          </p>
        </div>
        <Button variant="outline" onClick={onEdit}>
          <Pencil className="size-4" />
          {t('customers.edit')}
        </Button>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field icon={<User className="size-4" />} label={t('customers.enName')} value={c.enName || '—'} />
        <Field icon={<Phone className="size-4" />} label={t('customers.mobile')} value={c.mobile || '—'} />
        <Field icon={<Phone className="size-4" />} label={t('customers.phone')} value={c.phone || '—'} />
        <Field icon={<MessageCircle className="size-4" />} label={t('customers.whatsapp')} value={c.whatsapp || '—'} />
      </div>

      {/* Loyalty points */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 font-bold">
          <Award className="size-5 text-[var(--color-brand-500)]" aria-hidden />
          {t('customers.points')}
        </h3>
        {points.isLoading ? (
          <LoadingView />
        ) : points.isError ? (
          <ErrorView error={points.error} onRetry={() => points.refetch()} />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Card className="flex items-center gap-3 p-4">
                <Star className="size-6 text-[var(--color-warning)]" aria-hidden />
                <div>
                  <p className="text-xs text-[var(--color-muted)]">{t('customers.totalPoints')}</p>
                  <p className="tnum text-2xl font-extrabold">
                    {formatNumber(points.data?.balance.totalPoints ?? 0)}
                  </p>
                </div>
              </Card>
              <Card className="flex items-center gap-3 p-4">
                <Award className="size-6 text-[var(--color-brand-500)]" aria-hidden />
                <div>
                  <p className="text-xs text-[var(--color-muted)]">{t('customers.txnCount')}</p>
                  <p className="tnum text-2xl font-extrabold">
                    {formatNumber(points.data?.balance.txnCount ?? 0)}
                  </p>
                </div>
              </Card>
            </div>

            {points.data && points.data.txns.length > 0 ? (
              <Card className="mt-3 overflow-auto scroll-thin">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--color-surface-2)] text-[var(--color-muted)]">
                    <tr>
                      <th className="px-3 py-2 text-start font-semibold">{t('customers.date')}</th>
                      <th className="px-3 py-2 text-end font-semibold">{t('customers.pointsCol')}</th>
                      <th className="px-3 py-2 text-start font-semibold">{t('customers.note')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {points.data.txns.map((tx, i) => (
                      <tr key={i}>
                        <td className="tnum px-3 py-2">{tx.date ? formatDateTime(tx.date) : '—'}</td>
                        <td className="tnum px-3 py-2 text-end font-bold">{formatNumber(tx.points ?? 0)}</td>
                        <td className="px-3 py-2">{tx.note ?? tx.billNo ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            ) : (
              <p className="mt-3 text-sm text-[var(--color-muted)]">{t('customers.noTxns')}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[var(--radius)] border p-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--color-surface-2)] text-[var(--color-muted)]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-[var(--color-muted)]">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
