import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  User,
  Phone,
  MessageCircle,
  Award,
  Star,
  Plus,
  Pencil,
  History,
  Wallet,
  Banknote,
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { OriginBadge } from '@/shared/ui/OriginBadge';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { formatMoney, formatNumber, formatDateTime } from '@/shared/lib/format';
import type { CreditBillRow, Customer } from '@/shared/lib/types';
import { CustomerPicker } from './CustomerPicker';
import { CustomerDialog } from './CustomerDialog';
import { CollectDialog } from './CollectDialog';
import {
  useCustomer,
  useCustomerPoints,
  useCustomerLedger,
  useCreditBills,
  customerLabel,
} from '../api/customers.api';

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

type DetailTab = 'info' | 'ledger' | 'credit';

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
  const [tab, setTab] = useState<DetailTab>('info');

  const tabs: { key: DetailTab; icon: typeof User; label: string }[] = [
    { key: 'info', icon: User, label: t('loyalty.tabInfo') },
    { key: 'ledger', icon: History, label: t('loyalty.tabLedger') },
    { key: 'credit', icon: Wallet, label: t('loyalty.tabCredit') },
  ];

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

      {/* Detail tabs: info / points ledger (POST021) / credit bills (POST010/011) */}
      <div className="flex gap-2" role="tablist">
        {tabs.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={
              'flex items-center gap-2 rounded-[var(--radius)] border px-3 py-1.5 text-sm font-medium transition-colors ' +
              (tab === key
                ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-600)] text-white'
                : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-2)]')
            }
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        ))}
      </div>

      {tab === 'ledger' ? <LedgerTab code={code} /> : null}
      {tab === 'credit' ? <CreditTab code={code} /> : null}

      {tab !== 'info' ? null : (
        <>
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
        </>
      )}
    </div>
  );
}

/**
 * POST021 — حركة النقاط: full points ledger with a running balance per
 * movement (GET /loyalty/customers/{code}/ledger).
 */
function LedgerTab({ code }: { code: string }) {
  const { t } = useTranslation();
  const ledger = useCustomerLedger(code);

  if (ledger.isLoading) return <LoadingView />;
  if (ledger.isError) return <ErrorView error={ledger.error} onRetry={() => ledger.refetch()} />;
  const v = ledger.data;
  if (!v || v.entries.length === 0) return <EmptyView label={t('loyalty.empty')} />;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Card className="flex items-center gap-3 p-4">
          <Star className="size-6 text-[var(--color-warning)]" aria-hidden />
          <div>
            <p className="text-xs text-[var(--color-muted)]">{t('loyalty.balance')}</p>
            <p className="tnum text-2xl font-extrabold">{formatNumber(v.balance.earnedPoints)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <History className="size-6 text-[var(--color-brand-500)]" aria-hidden />
          <div>
            <p className="text-xs text-[var(--color-muted)]">{t('loyalty.movements')}</p>
            <p className="tnum text-2xl font-extrabold">{formatNumber(v.entries.length)}</p>
          </div>
        </Card>
      </div>

      <Card className="overflow-auto scroll-thin">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-surface-2)] text-[var(--color-muted)]">
            <tr>
              <th className="px-3 py-2 text-start font-semibold">{t('loyalty.date')}</th>
              <th className="px-3 py-2 text-start font-semibold">{t('loyalty.kindCol')}</th>
              <th className="px-3 py-2 text-start font-semibold">{t('loyalty.billNo')}</th>
              <th className="px-3 py-2 text-end font-semibold">{t('loyalty.docAmt')}</th>
              <th className="px-3 py-2 text-end font-semibold">{t('loyalty.points')}</th>
              <th className="px-3 py-2 text-end font-semibold">{t('loyalty.balanceAfter')}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {v.entries.map((e) => (
              <tr key={e.id} className="hover:bg-[var(--color-surface-2)]">
                <td className="tnum px-3 py-2">{formatDateTime(e.createdAt)}</td>
                <td className="px-3 py-2">
                  <span
                    className={
                      'rounded-full px-2 py-0.5 text-xs font-medium ' +
                      (e.kind === 'EARN'
                        ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
                        : e.kind === 'REDEEM'
                          ? 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]'
                          : 'bg-[var(--color-muted)]/15 text-[var(--color-muted)]')
                    }
                  >
                    {t(`loyalty.kind.${e.kind}`)}
                  </span>
                </td>
                <td className="tnum px-3 py-2 text-[var(--color-muted)]">{e.billNo ?? '—'}</td>
                <td className="tnum px-3 py-2 text-end">{formatMoney(e.docAmt)}</td>
                <td
                  className={`tnum px-3 py-2 text-end font-bold ${
                    e.pointCnt < 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'
                  }`}
                >
                  {formatNumber(e.pointCnt)}
                </td>
                <td className="tnum px-3 py-2 text-end font-semibold">
                  {formatNumber(e.balanceAfter)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/**
 * POST010/011 — تحصيل الفواتير الآجلة: the customer's credit bills with
 * outstanding amounts (GET /customers/{code}/credit-bills) + a collection
 * receipt dialog (POST /customers/{code}/collect, idempotent).
 */
function CreditTab({ code }: { code: string }) {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);
  const bills = useCreditBills(code, showAll ? 'all' : 'open');
  const [collectFor, setCollectFor] = useState<CreditBillRow | null>(null);

  if (bills.isLoading) return <LoadingView />;
  if (bills.isError) return <ErrorView error={bills.error} onRetry={() => bills.refetch()} />;
  const v = bills.data;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Card className="flex items-center gap-3 p-4">
          <Wallet className="size-6 text-[var(--color-danger)]" aria-hidden />
          <div>
            <p className="text-xs text-[var(--color-muted)]">{t('credit.totalOutstanding')}</p>
            <p className="tnum text-2xl font-extrabold">
              {formatMoney(v?.totalOutstanding ?? 0)}
            </p>
          </div>
        </Card>
        <label className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
          <input
            type="checkbox"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
            className="size-4"
          />
          {t('credit.showAll')}
        </label>
      </div>

      {!v || v.bills.length === 0 ? (
        <EmptyView label={t('credit.empty')} />
      ) : (
        <Card className="overflow-auto scroll-thin">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-2)] text-[var(--color-muted)]">
              <tr>
                <th className="px-3 py-2 text-start font-semibold">{t('credit.billNo')}</th>
                <th className="px-3 py-2 text-start font-semibold">{t('credit.issuedAt')}</th>
                <th className="px-3 py-2 text-end font-semibold">{t('credit.creditAmt')}</th>
                <th className="px-3 py-2 text-end font-semibold">{t('credit.collectedAmt')}</th>
                <th className="px-3 py-2 text-end font-semibold">{t('credit.outstanding')}</th>
                <th className="px-3 py-2 text-center font-semibold">{t('credit.statusL')}</th>
                <th className="px-3 py-2 text-end font-semibold">{t('credit.collect')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {v.bills.map((b) => (
                <tr key={b.billId} className="hover:bg-[var(--color-surface-2)]">
                  <td className="tnum px-3 py-2 font-medium">{b.billNo}</td>
                  <td className="tnum px-3 py-2 text-[var(--color-muted)]">
                    {formatDateTime(b.issuedAt)}
                  </td>
                  <td className="tnum px-3 py-2 text-end">{formatMoney(b.creditAmt)}</td>
                  <td className="tnum px-3 py-2 text-end text-[var(--color-success)]">
                    {formatMoney(b.collectedAmt)}
                  </td>
                  <td className="tnum px-3 py-2 text-end font-bold">
                    {formatMoney(b.outstanding)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span
                      className={
                        'rounded-full px-2 py-0.5 text-xs font-medium ' +
                        (b.status === 'SETTLED'
                          ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
                          : 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]')
                      }
                    >
                      {t(`credit.status.${b.status}`)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-end">
                    {b.outstanding > 0 ? (
                      <Button
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => setCollectFor(b)}
                      >
                        <Banknote className="size-4" />
                        {t('credit.collect')}
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {collectFor ? (
        <CollectDialog
          customerCode={code}
          bill={collectFor}
          onClose={() => setCollectFor(null)}
        />
      ) : null}
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
