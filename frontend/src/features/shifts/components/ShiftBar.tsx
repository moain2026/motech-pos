import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, LockKeyhole, PlayCircle } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { ApiError } from '@/shared/lib/api-client';
import { formatMoney } from '@/shared/lib/format';
import { useSession } from '@/features/auth';
import { usePosSettings } from '@/features/pos-terminal/store/pos-settings.store';
import { useCurrentShift, useOpenShift, useCloseShift } from '../api/shifts.api';

/**
 * Shift header + open/close controls (POST027 context).
 * Selling requires an open shift for the configured cashierNo. This bar lets
 * the cashier open one (cashierNo / machineNo / shiftCode / opening balance)
 * and close it (counted cash → expected + difference).
 */
export function ShiftBar() {
  const { t } = useTranslation();
  const user = useSession((s) => s.user);
  const cashierNo = usePosSettings((s) => s.cashierNo);
  const machineNo = usePosSettings((s) => s.machineNo);
  const shiftCode = usePosSettings((s) => s.shiftCode);
  const setCashierNo = usePosSettings((s) => s.setCashierNo);
  const setMachineNo = usePosSettings((s) => s.setMachineNo);
  const setShiftCode = usePosSettings((s) => s.setShiftCode);
  const setLastShift = usePosSettings((s) => s.setLastShift);

  const current = useCurrentShift(cashierNo);
  const openShift = useOpenShift();
  const closeShift = useCloseShift();

  const [openingBalance, setOpeningBalance] = useState('');
  const [closingBalance, setClosingBalance] = useState('');
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const shift = current.data?.shift ?? null;
  const noShift = current.data?.noShift ?? false;

  const onOpen = async () => {
    setMsg(null);
    try {
      const s = await openShift.mutateAsync({
        cashierNo,
        machineNo,
        shiftCode,
        openingBalance: Number(openingBalance) || 0,
        currency: 'YER',
      });
      setMsg({ kind: 'ok', text: `${t('shift.opened')} #${s.shiftNo}` });
      setLastShift(s.id, s.shiftNo);
      setOpeningBalance('');
    } catch (e) {
      const detail = e instanceof ApiError ? e.problem.detail || e.problem.title : '';
      setMsg({ kind: 'err', text: `${t('shift.openError')}${detail ? ` — ${detail}` : ''}` });
    }
  };

  const onClose = async () => {
    if (!shift) return;
    if (!window.confirm(t('shift.confirmClose'))) return;
    setMsg(null);
    try {
      const s = await closeShift.mutateAsync({
        id: shift.id,
        dto: closingBalance ? { closingBalance: Number(closingBalance) } : {},
      });
      setMsg({
        kind: 'ok',
        text: `${t('shift.closed')} — ${t('shift.cashDifference')}: ${formatMoney(s.cashDifference ?? 0)}`,
      });
      // Keep the closed shift reachable for POST013 settlement.
      setLastShift(s.id, s.shiftNo);
      setClosingBalance('');
    } catch (e) {
      const detail = e instanceof ApiError ? e.problem.detail || e.problem.title : '';
      setMsg({ kind: 'err', text: `${t('shift.closeError')}${detail ? ` — ${detail}` : ''}` });
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-[var(--radius)] border bg-[var(--color-surface)] px-4 py-2 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-semibold">
          {t('shift.cashier')}: {user?.displayName ?? user?.username}
        </span>

        {current.isLoading ? (
          <span className="text-[var(--color-muted)]">{t('status.loading')}</span>
        ) : shift ? (
          <span className="flex items-center gap-2 text-[var(--color-muted)]">
            <Clock className="size-4 text-[var(--color-success)]" aria-hidden />
            {t('shift.no')} #{shift.shiftNo} · {t('shift.cashierNo')} {shift.cashierNo} ·{' '}
            {t('shift.openingBalance')} {formatMoney(shift.openingBalance)}
          </span>
        ) : (
          <span className="text-[var(--color-warning)]">
            {t('shift.none')} — {t('shift.noneHint')}
          </span>
        )}
      </div>

      {/* Controls */}
      {noShift ? (
        <div className="flex flex-wrap items-end gap-2">
          <Field label={t('shift.cashierNo')}>
            <Input
              type="number"
              min={0}
              value={cashierNo || ''}
              onChange={(e) => setCashierNo(Number(e.target.value))}
              className="h-9 w-24 text-end tnum"
            />
          </Field>
          <Field label={t('shift.machineNo')}>
            <Input
              type="number"
              min={0}
              value={machineNo || ''}
              onChange={(e) => setMachineNo(Number(e.target.value))}
              className="h-9 w-20 text-end tnum"
            />
          </Field>
          <Field label={t('shift.shiftCode')}>
            <Input
              value={shiftCode}
              onChange={(e) => setShiftCode(e.target.value)}
              className="h-9 w-16 text-center"
            />
          </Field>
          <Field label={t('shift.openingBalance')}>
            <Input
              type="number"
              min={0}
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
              placeholder="0"
              className="h-9 w-28 text-end tnum"
            />
          </Field>
          <Button
            variant="success"
            onClick={onOpen}
            disabled={openShift.isPending}
            className="h-9"
          >
            <PlayCircle className="size-4" />
            {openShift.isPending ? t('shift.opening') : t('shift.open')}
          </Button>
        </div>
      ) : shift ? (
        <div className="flex flex-wrap items-end gap-2">
          <Field label={t('shift.closingBalance')}>
            <Input
              type="number"
              min={0}
              value={closingBalance}
              onChange={(e) => setClosingBalance(e.target.value)}
              placeholder={t('shift.expectedCash')}
              className="h-9 w-36 text-end tnum"
            />
          </Field>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={closeShift.isPending}
            className="h-9 text-[var(--color-danger)]"
          >
            <LockKeyhole className="size-4" />
            {closeShift.isPending ? t('shift.closing') : t('shift.close')}
          </Button>
        </div>
      ) : null}

      {msg ? (
        <p
          role="status"
          className={
            msg.kind === 'ok'
              ? 'text-xs text-[var(--color-success)]'
              : 'text-xs text-[var(--color-danger)]'
          }
        >
          {msg.text}
        </p>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-[var(--color-muted)]">{label}</span>
      {children}
    </label>
  );
}
