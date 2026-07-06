import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Banknote } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { LoadingView, ErrorView } from '@/shared/ui/StateView';
import { formatMoney, formatDate } from '@/shared/lib/format';
import type { CreditBillRow } from '@/shared/lib/types';
import { useCreditBills } from '@/features/customers/api/customers.api';
import { CollectDialog } from '@/features/customers/components/CollectDialog';
import { useBillDetail } from '../api/bills.api';

export function BillDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { billNo } = useParams<{ billNo: string }>();
  const query = useBillDetail(billNo ?? null);

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label={t('bills.back')}>
          <ArrowRight className="size-5" />
        </Button>
        <h1 className="text-xl font-bold">
          {t('bills.detailTitle')} <span className="tnum">#{billNo}</span>
        </h1>
      </div>

      {query.isLoading ? (
        <LoadingView />
      ) : query.isError ? (
        <ErrorView error={query.error} onRetry={() => query.refetch()} />
      ) : query.data ? (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Lines */}
          <Card className="min-h-0 overflow-auto scroll-thin">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
                <tr>
                  <th className="px-3 py-2 text-start font-semibold">{t('pos.code')}</th>
                  <th className="px-3 py-2 text-start font-semibold">{t('pos.unit')}</th>
                  <th className="px-3 py-2 text-end font-semibold">{t('pos.qty')}</th>
                  <th className="px-3 py-2 text-end font-semibold">{t('pos.price')}</th>
                  <th className="px-3 py-2 text-end font-semibold">{t('pos.lineTotal')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {query.data.lines.map((l, i) => (
                  <tr key={`${l.iCode}-${i}`}>
                    <td className="tnum px-3 py-2 font-medium">{l.iCode}</td>
                    <td className="px-3 py-2">{l.itmUnit ?? '—'}</td>
                    <td className="tnum px-3 py-2 text-end">{l.qty}</td>
                    <td className="tnum px-3 py-2 text-end">{formatMoney(l.price)}</td>
                    <td className="tnum px-3 py-2 text-end font-bold">{formatMoney(l.net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Totals + meta */}
          <div className="flex flex-col gap-4">
            <Card className="flex flex-col gap-2 p-4">
              <Meta label={t('bills.date')} value={formatDate(query.data.billDate)} />
              <Meta label={t('bills.machine')} value={String(query.data.machineNo)} />
              <Meta
                label={t('bills.type')}
                value={t(`bills.typeName.${query.data.billType}`, String(query.data.billType))}
              />
              <Meta
                label={t('bills.customer')}
                value={query.data.customer.name ?? query.data.customer.code ?? '—'}
              />
            </Card>

            <Card className="flex flex-col gap-2 p-4">
              <p className="mb-1 text-xs font-semibold text-[var(--color-muted)]">
                {t('bills.recomputed')}
              </p>
              <Meta label={t('bills.gross')} value={formatMoney(query.data.totals.gross)} />
              <Meta label={t('pos.discount')} value={formatMoney(query.data.totals.discount)} />
              <Meta label={t('pos.vat')} value={formatMoney(query.data.totals.vat)} />
              <div className="flex items-center justify-between border-t pt-2">
                <span className="font-bold">{t('bills.net')}</span>
                <span className="tnum text-lg font-extrabold text-[var(--color-brand-100)]">
                  {formatMoney(query.data.totals.net)}
                </span>
              </div>
              <p className="mt-2 text-xs text-[var(--color-muted)]">
                {t('bills.stored')}: <span className="tnum">{formatMoney(query.data.stored.billAmt)}</span>
              </p>
            </Card>

            {/* POST011 — direct سداد for credit (آجل) bills, right on the bill page */}
            {query.data.customer.code && billNo ? (
              <CreditCollectCard customerCode={query.data.customer.code} billNo={billNo} />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * POST011 — if this bill is one of the customer's open credit bills, show its
 * outstanding balance and a direct "سداد" (collect) button.
 */
function CreditCollectCard({ customerCode, billNo }: { customerCode: string; billNo: string }) {
  const { t } = useTranslation();
  const [collectFor, setCollectFor] = useState<CreditBillRow | null>(null);
  const bills = useCreditBills(customerCode, 'open');
  const bill = bills.data?.bills.find((b) => b.billNo === billNo || b.billId === billNo);
  if (!bill || bill.outstanding <= 0) return null;

  return (
    <Card className="flex flex-col gap-2 p-4">
      <p className="text-xs font-semibold text-[var(--color-muted)]">{t('credit.title')}</p>
      <Meta label={t('credit.outstanding')} value={formatMoney(bill.outstanding)} />
      <Meta label={t('credit.collectedAmt')} value={formatMoney(bill.collectedAmt)} />
      <Button variant="success" onClick={() => setCollectFor(bill)}>
        <Banknote className="size-4" />
        {t('credit.collect')}
      </Button>
      {collectFor ? (
        <CollectDialog
          customerCode={customerCode}
          bill={collectFor}
          onClose={() => setCollectFor(null)}
        />
      ) : null}
    </Card>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[var(--color-muted)]">{label}</span>
      <span className="tnum font-medium">{value}</span>
    </div>
  );
}
