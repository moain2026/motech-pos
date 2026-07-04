import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CreditCard,
  Search,
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  History,
  Power,
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { formatMoney, formatDate, formatDateTime } from '@/shared/lib/format';
import { useSession } from '@/features/auth';
import {
  usePrepaidCards,
  useCreatePrepaidCard,
  useTopupPrepaidCard,
  useRedeemPrepaidCard,
  useSetPrepaidCardStatus,
  usePrepaidMovements,
  type PrepaidCard,
  type PrepaidCardType,
} from '../api/prepaid-cards.api';
import { Field, MdDialog, errorText } from '@/features/master-data/components/MdShared';

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

/**
 * بطاقات الدفع المسبق والكوبونات (POSI007 + POSI200) — list + issue +
 * topup/redeem + running-balance movement ledger. Issue/topup/status are
 * supervisor/admin; redeem is the payment action (all roles). Server-side
 * balance guard: redeem can never overdraw (422).
 */
export function PrepaidCardsPage() {
  const { t } = useTranslation();
  const role = useSession((s) => s.user?.role);
  const canManage = role === 'supervisor' || role === 'admin';

  const [customer, setCustomer] = useState('');
  const [type, setType] = useState<PrepaidCardType | ''>('');
  const [activeOnly, setActiveOnly] = useState(false);
  const debouncedCustomer = useDebounced(customer, 300);

  const query = usePrepaidCards({ customer: debouncedCustomer, type, activeOnly });
  const setStatus = useSetPrepaidCardStatus();

  const [createOpen, setCreateOpen] = useState(false);
  const [moveDialog, setMoveDialog] = useState<{ card: PrepaidCard; kind: 'topup' | 'redeem' } | null>(null);
  const [movementsCard, setMovementsCard] = useState<PrepaidCard | null>(null);

  const rows = query.data ?? [];

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <CreditCard className="size-6 text-[var(--color-brand-500)]" aria-hidden />
          {t('prepaid.title')}
        </h1>
        {canManage ? (
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            {t('prepaid.new')}
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search
            className="pointer-events-none absolute inset-y-0 end-3 my-auto size-5 text-[var(--color-muted)]"
            aria-hidden
          />
          <Input
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            placeholder={t('prepaid.filterCustomer')}
            className="h-11 pe-10"
            aria-label={t('prepaid.filterCustomer')}
          />
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as PrepaidCardType | '')}
          className="h-11 rounded-md border bg-[var(--color-surface)] px-3 text-sm"
          aria-label={t('prepaid.type')}
        >
          <option value="">{t('prepaid.allTypes')}</option>
          <option value="CARD">{t('prepaid.typeCard')}</option>
          <option value="COUPON">{t('prepaid.typeCoupon')}</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
            className="size-4 accent-[var(--color-brand-600)]"
          />
          {t('prepaid.activeOnly')}
        </label>
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
                  <th className="px-3 py-2 text-start font-semibold">{t('prepaid.cardNo')}</th>
                  <th className="px-3 py-2 text-start font-semibold">{t('prepaid.type')}</th>
                  <th className="hidden px-3 py-2 text-start font-semibold md:table-cell">
                    {t('prepaid.customer')}
                  </th>
                  <th className="hidden px-3 py-2 text-end font-semibold sm:table-cell">
                    {t('prepaid.faceValue')}
                  </th>
                  <th className="px-3 py-2 text-end font-semibold">{t('prepaid.balance')}</th>
                  <th className="hidden px-3 py-2 text-start font-semibold lg:table-cell">
                    {t('prepaid.expireDate')}
                  </th>
                  <th className="px-3 py-2 text-end font-semibold">{t('md.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((c) => (
                  <tr
                    key={c.id}
                    className={`hover:bg-[var(--color-surface-2)] ${c.inactive ? 'opacity-50' : ''}`}
                  >
                    <td className="tnum px-3 py-2 font-medium" dir="ltr">
                      {c.cardNo}
                      {c.inactive ? (
                        <span className="ms-2 rounded-full bg-[var(--color-danger)]/15 px-2 py-0.5 text-[10px] text-[var(--color-danger)]">
                          {t('prepaid.disabled')}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          'rounded-full px-2 py-0.5 text-xs font-medium ' +
                          (c.cardType === 'CARD'
                            ? 'bg-[var(--color-brand-600)]/15 text-[var(--color-brand-500)]'
                            : 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]')
                        }
                      >
                        {c.cardType === 'CARD' ? t('prepaid.typeCard') : t('prepaid.typeCoupon')}
                      </span>
                    </td>
                    <td className="tnum hidden px-3 py-2 text-[var(--color-muted)] md:table-cell">
                      {c.customerCode || '—'}
                    </td>
                    <td className="tnum hidden px-3 py-2 text-end sm:table-cell">
                      {formatMoney(c.amount)}
                    </td>
                    <td
                      className={`tnum px-3 py-2 text-end font-bold ${c.remaining <= 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'}`}
                    >
                      {formatMoney(c.remaining)}
                    </td>
                    <td className="tnum hidden px-3 py-2 text-[var(--color-muted)] lg:table-cell">
                      {formatDate(c.expireDate)}
                    </td>
                    <td className="px-3 py-2 text-end">
                      <div className="flex items-center justify-end gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={t('prepaid.movements')}
                          title={t('prepaid.movements')}
                          onClick={() => setMovementsCard(c)}
                        >
                          <History className="size-4" />
                        </Button>
                        {canManage ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t('prepaid.topup')}
                            title={t('prepaid.topup')}
                            onClick={() => setMoveDialog({ card: c, kind: 'topup' })}
                          >
                            <ArrowUpCircle className="size-4 text-[var(--color-success)]" />
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={t('prepaid.redeem')}
                          title={t('prepaid.redeem')}
                          onClick={() => setMoveDialog({ card: c, kind: 'redeem' })}
                        >
                          <ArrowDownCircle className="size-4 text-[var(--color-warning)]" />
                        </Button>
                        {canManage ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={c.inactive ? t('prepaid.enable') : t('prepaid.disable')}
                            title={c.inactive ? t('prepaid.enable') : t('prepaid.disable')}
                            disabled={setStatus.isPending}
                            onClick={() =>
                              setStatus.mutate({ cardNo: c.cardNo, inactive: !c.inactive })
                            }
                          >
                            <Power
                              className={`size-4 ${c.inactive ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}
                            />
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {createOpen ? <CreateCardDialog onClose={() => setCreateOpen(false)} /> : null}
      {moveDialog ? (
        <MoveDialog
          card={moveDialog.card}
          kind={moveDialog.kind}
          onClose={() => setMoveDialog(null)}
        />
      ) : null}
      {movementsCard ? (
        <MovementsDialog card={movementsCard} onClose={() => setMovementsCard(null)} />
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Issue a new card / coupon
// ---------------------------------------------------------------------------

function CreateCardDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const create = useCreatePrepaidCard();

  const [cardNo, setCardNo] = useState('');
  const [cardType, setCardType] = useState<PrepaidCardType>('CARD');
  const [currency, setCurrency] = useState('YER');
  const [amount, setAmount] = useState('');
  const [customerCode, setCustomerCode] = useState('');
  const [description, setDescription] = useState('');
  const [expireDate, setExpireDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const amountNum = Number(amount);
  const canSubmit = cardNo.trim().length > 0 && amountNum > 0;

  const submit = async () => {
    setError(null);
    try {
      const saved = await create.mutateAsync({
        cardNo: cardNo.trim(),
        cardType,
        currency: currency.trim().toUpperCase() || undefined,
        amount: amountNum,
        customerCode: customerCode.trim() || undefined,
        description: description.trim() || undefined,
        expireDate: expireDate || undefined,
      });
      setDone(`${t('prepaid.created')} ${saved.cardNo}`);
    } catch (e) {
      setError(errorText(e, t('md.saveError')));
    }
  };

  return (
    <MdDialog
      title={t('prepaid.newTitle')}
      icon={<CreditCard className="size-5 text-[var(--color-brand-500)]" aria-hidden />}
      onClose={onClose}
      done={done}
      error={error}
      pending={create.isPending}
      canSubmit={canSubmit}
      onSubmit={submit}
    >
      <Field label={t('prepaid.cardNo')}>
        <Input
          autoFocus
          value={cardNo}
          onChange={(e) => setCardNo(e.target.value)}
          className="tnum h-10"
          dir="ltr"
          placeholder="GC-2026-0002"
        />
      </Field>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label={t('prepaid.type')}>
          <select
            value={cardType}
            onChange={(e) => setCardType(e.target.value as PrepaidCardType)}
            className="h-10 rounded-md border bg-[var(--color-surface-2)] px-3 text-sm"
          >
            <option value="CARD">{t('prepaid.typeCard')}</option>
            <option value="COUPON">{t('prepaid.typeCoupon')}</option>
          </select>
        </Field>
        <Field label={t('prepaid.currency')}>
          <Input
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="tnum h-10 uppercase"
            dir="ltr"
            maxLength={7}
          />
        </Field>
      </div>
      <Field label={t('prepaid.faceValue')}>
        <Input
          type="number"
          min={0}
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="tnum h-10 text-end"
          placeholder="0"
        />
      </Field>
      <Field label={t('prepaid.customerOpt')}>
        <Input
          value={customerCode}
          onChange={(e) => setCustomerCode(e.target.value)}
          className="tnum h-10"
          placeholder={t('prepaid.customerPlaceholder')}
        />
      </Field>
      <Field label={t('prepaid.description')}>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} className="h-10" />
      </Field>
      <Field label={t('prepaid.expireDate')}>
        <Input
          type="date"
          value={expireDate}
          onChange={(e) => setExpireDate(e.target.value)}
          className="tnum h-10"
        />
      </Field>
    </MdDialog>
  );
}

// ---------------------------------------------------------------------------
// Top-up / redeem
// ---------------------------------------------------------------------------

function MoveDialog({
  card,
  kind,
  onClose,
}: {
  card: PrepaidCard;
  kind: 'topup' | 'redeem';
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const topup = useTopupPrepaidCard();
  const redeem = useRedeemPrepaidCard();
  const pending = topup.isPending || redeem.isPending;

  const [amount, setAmount] = useState('');
  const [ref, setRef] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const amountNum = Number(amount);
  const canSubmit = amountNum > 0 && (kind === 'topup' || amountNum <= card.remaining);

  const submit = async () => {
    setError(null);
    try {
      const saved =
        kind === 'topup'
          ? await topup.mutateAsync({ cardNo: card.cardNo, amount: amountNum, note: note.trim() })
          : await redeem.mutateAsync({
              cardNo: card.cardNo,
              amount: amountNum,
              ref: ref.trim(),
              note: note.trim(),
            });
      setDone(
        `${kind === 'topup' ? t('prepaid.topupDone') : t('prepaid.redeemDone')} — ${t('prepaid.balance')}: ${formatMoney(saved.remaining)}`,
      );
    } catch (e) {
      setError(errorText(e, t('md.saveError')));
    }
  };

  return (
    <MdDialog
      title={`${kind === 'topup' ? t('prepaid.topup') : t('prepaid.redeem')} — ${card.cardNo}`}
      icon={
        kind === 'topup' ? (
          <ArrowUpCircle className="size-5 text-[var(--color-success)]" aria-hidden />
        ) : (
          <ArrowDownCircle className="size-5 text-[var(--color-warning)]" aria-hidden />
        )
      }
      onClose={onClose}
      done={done}
      error={error}
      pending={pending}
      canSubmit={canSubmit}
      onSubmit={submit}
    >
      <p className="rounded-md bg-[var(--color-surface-2)] p-2 text-center text-sm">
        {t('prepaid.currentBalance')}:{' '}
        <strong className="tnum">{formatMoney(card.remaining)}</strong>
      </p>
      <Field label={t('prepaid.amount')}>
        <Input
          autoFocus
          type="number"
          min={0}
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="tnum h-10 text-end"
          placeholder="0"
        />
      </Field>
      {kind === 'redeem' && amountNum > card.remaining ? (
        <p className="text-center text-xs text-[var(--color-danger)]">
          {t('prepaid.overdraw')}
        </p>
      ) : null}
      {kind === 'redeem' ? (
        <Field label={t('prepaid.ref')}>
          <Input value={ref} onChange={(e) => setRef(e.target.value)} className="tnum h-10" />
        </Field>
      ) : null}
      <Field label={t('prepaid.note')}>
        <Input value={note} onChange={(e) => setNote(e.target.value)} className="h-10" />
      </Field>
    </MdDialog>
  );
}

// ---------------------------------------------------------------------------
// Movement ledger (POSI200)
// ---------------------------------------------------------------------------

const MOVE_STYLE: Record<string, string> = {
  ISSUE: 'bg-[var(--color-brand-600)]/15 text-[var(--color-brand-500)]',
  TOPUP: 'bg-[var(--color-success)]/15 text-[var(--color-success)]',
  REDEEM: 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]',
  ADJUST: 'bg-[var(--color-surface-2)] text-[var(--color-muted)] border',
};

function MovementsDialog({ card, onClose }: { card: PrepaidCard; onClose: () => void }) {
  const { t } = useTranslation();
  const query = usePrepaidMovements(card.cardNo);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('prepaid.movements')}
    >
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="flex items-center gap-2 font-bold">
            <History className="size-5 text-[var(--color-brand-500)]" aria-hidden />
            {t('prepaid.movements')}
            <span className="tnum text-sm text-[var(--color-muted)]" dir="ltr">
              {card.cardNo}
            </span>
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('returns.close')}>
            ✕
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto scroll-thin">
          {query.isLoading ? (
            <LoadingView />
          ) : query.isError ? (
            <ErrorView error={query.error} onRetry={() => query.refetch()} />
          ) : !query.data || query.data.movements.length === 0 ? (
            <EmptyView />
          ) : (
            <>
              <p className="border-b bg-[var(--color-surface-2)] px-4 py-2 text-sm">
                {t('prepaid.currentBalance')}:{' '}
                <strong className="tnum">{formatMoney(query.data.card.remaining)}</strong>
                <span className="text-[var(--color-muted)]">
                  {' '}
                  / {t('prepaid.faceValue')}: <span className="tnum">{formatMoney(query.data.card.amount)}</span>
                </span>
              </p>
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
                  <tr>
                    <th className="px-3 py-2 text-start font-semibold">{t('prepaid.moveType')}</th>
                    <th className="px-3 py-2 text-end font-semibold">{t('prepaid.amount')}</th>
                    <th className="px-3 py-2 text-end font-semibold">{t('prepaid.runningBalance')}</th>
                    <th className="hidden px-3 py-2 text-start font-semibold sm:table-cell">
                      {t('prepaid.ref')}
                    </th>
                    <th className="hidden px-3 py-2 text-start font-semibold md:table-cell">
                      {t('prepaid.byWhen')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {query.data.movements.map((m) => (
                    <tr key={m.id} className="hover:bg-[var(--color-surface-2)]">
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${MOVE_STYLE[m.moveType] ?? MOVE_STYLE.ADJUST}`}
                        >
                          {t(`prepaid.move.${m.moveType}`, { defaultValue: m.moveType })}
                        </span>
                      </td>
                      <td
                        className={`tnum px-3 py-2 text-end font-bold ${m.amount < 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'}`}
                      >
                        {formatMoney(m.amount)}
                      </td>
                      <td className="tnum px-3 py-2 text-end">{formatMoney(m.balance)}</td>
                      <td className="tnum hidden px-3 py-2 text-[var(--color-muted)] sm:table-cell">
                        {m.ref || '—'}
                      </td>
                      <td className="hidden px-3 py-2 text-[var(--color-muted)] md:table-cell">
                        {m.createdBy} · {formatDateTime(m.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
