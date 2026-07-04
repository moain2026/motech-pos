import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ClipboardList, CheckCircle2, Search } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Spinner } from '@/shared/ui/StateView';
import { ApiError } from '@/shared/lib/api-client';
import type { RxLineInput } from '@/shared/lib/types';
import { useCreatePrescription, useRxBillItems } from '../api/prescriptions.api';

interface LineDraft extends RxLineInput {
  itemName: string | null;
  qty: number;
  selected: boolean;
}

/**
 * POST023 — create a prescription linked to an existing sale bill:
 * load the bill items (pre-fill), annotate dosage/usage/duration per item,
 * add doctor + patient, then POST /prescriptions.
 */
export function PrescriptionDialog({
  onClose,
  initialBillNo,
}: {
  onClose: () => void;
  initialBillNo?: string;
}) {
  const { t } = useTranslation();
  const create = useCreatePrescription();

  const [billInput, setBillInput] = useState(initialBillNo ?? '');
  const [billNo, setBillNo] = useState<string | null>(initialBillNo ?? null);
  const items = useRxBillItems(billNo);

  const [doctorName, setDoctorName] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientRef, setPatientRef] = useState('');
  const [rxDate, setRxDate] = useState('');
  const [note, setNote] = useState('');
  const [lines, setLines] = useState<LineDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Pre-fill the annotate grid from the loaded bill items.
  useEffect(() => {
    if (items.data) {
      setLines(
        items.data.map((i) => ({
          itemCode: i.itemCode,
          itemName: i.itemName,
          qty: i.qty,
          selected: true,
          dosage: '',
          usageNotes: '',
          duration: '',
        })),
      );
    }
  }, [items.data]);

  const setLine = (idx: number, patch: Partial<LineDraft>) => {
    setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };

  const selected = lines.filter((l) => l.selected);
  const canSubmit =
    !create.isPending &&
    !!billNo &&
    doctorName.trim().length > 0 &&
    patientName.trim().length > 0 &&
    selected.length > 0;

  const submit = async () => {
    setError(null);
    if (!canSubmit || !billNo) return;
    try {
      await create.mutateAsync({
        billNo,
        doctorName: doctorName.trim(),
        patientName: patientName.trim(),
        patientRef: patientRef.trim() || undefined,
        rxDate: rxDate || undefined,
        note: note.trim() || undefined,
        lines: selected.map((l) => ({
          itemCode: l.itemCode,
          dosage: l.dosage?.trim() || undefined,
          usageNotes: l.usageNotes?.trim() || undefined,
          duration: l.duration?.trim() || undefined,
        })),
      });
      setDone(true);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.problem.detail || e.problem.title);
      } else {
        setError(t('rx.createError'));
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('rx.new')}
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="flex items-center gap-2 font-bold">
            <ClipboardList className="size-5 text-[var(--color-brand-500)]" aria-hidden />
            {t('rx.new')}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('rx.close')}>
            <X className="size-5" />
          </Button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-4 p-6 text-center">
            <CheckCircle2 className="size-12 text-[var(--color-success)]" aria-hidden />
            <p className="font-bold">{t('rx.created')}</p>
            <Button variant="primary" className="w-full max-w-xs" onClick={onClose}>
              {t('rx.close')}
            </Button>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto scroll-thin p-4">
              <div className="flex flex-col gap-4">
                {/* Bill lookup */}
                <div className="flex flex-wrap items-end gap-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-[var(--color-muted)]">{t('rx.billNo')}</span>
                    <Input
                      autoFocus
                      value={billInput}
                      onChange={(e) => setBillInput(e.target.value)}
                      placeholder={t('rx.billNoPlaceholder')}
                      className="tnum h-9 w-52"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setBillNo(billInput.trim() || null);
                      }}
                    />
                  </label>
                  <Button
                    variant="outline"
                    className="h-9"
                    disabled={!billInput.trim()}
                    onClick={() => setBillNo(billInput.trim())}
                  >
                    <Search className="size-4" />
                    {t('rx.loadBill')}
                  </Button>
                  {items.isLoading ? <Spinner className="size-5" /> : null}
                </div>
                {items.isError ? (
                  <p className="text-sm text-[var(--color-danger)]">{t('rx.billNotFound')}</p>
                ) : null}

                {/* Doctor / patient */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label={t('rx.doctor')} required>
                    <Input value={doctorName} onChange={(e) => setDoctorName(e.target.value)} className="h-9" />
                  </Field>
                  <Field label={t('rx.patient')} required>
                    <Input value={patientName} onChange={(e) => setPatientName(e.target.value)} className="h-9" />
                  </Field>
                  <Field label={t('rx.patientRef')}>
                    <Input value={patientRef} onChange={(e) => setPatientRef(e.target.value)} className="h-9" />
                  </Field>
                  <Field label={t('rx.rxDate')}>
                    <Input type="date" value={rxDate} onChange={(e) => setRxDate(e.target.value)} className="h-9" />
                  </Field>
                </div>
                <Field label={t('rx.note')}>
                  <Input value={note} onChange={(e) => setNote(e.target.value)} className="h-9" />
                </Field>

                {/* Annotate grid */}
                {lines.length > 0 ? (
                  <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-sm">
                      <thead className="bg-[var(--color-surface-2)] text-[var(--color-muted)]">
                        <tr>
                          <th className="px-2 py-2 text-center font-semibold">✓</th>
                          <th className="px-2 py-2 text-start font-semibold">{t('rx.item')}</th>
                          <th className="px-2 py-2 text-end font-semibold">{t('rx.qty')}</th>
                          <th className="px-2 py-2 text-start font-semibold">{t('rx.dosage')}</th>
                          <th className="px-2 py-2 text-start font-semibold">{t('rx.usage')}</th>
                          <th className="px-2 py-2 text-start font-semibold">{t('rx.duration')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {lines.map((l, i) => (
                          <tr key={l.itemCode} className={l.selected ? '' : 'opacity-50'}>
                            <td className="px-2 py-1 text-center">
                              <input
                                type="checkbox"
                                checked={l.selected}
                                onChange={(e) => setLine(i, { selected: e.target.checked })}
                                className="size-4"
                                aria-label={l.itemName ?? l.itemCode}
                              />
                            </td>
                            <td className="px-2 py-1">
                              <p className="font-medium">{l.itemName?.trim() || l.itemCode}</p>
                              <p className="tnum text-xs text-[var(--color-muted)]">{l.itemCode}</p>
                            </td>
                            <td className="tnum px-2 py-1 text-end">{l.qty}</td>
                            <td className="px-2 py-1">
                              <Input
                                value={l.dosage ?? ''}
                                onChange={(e) => setLine(i, { dosage: e.target.value })}
                                placeholder={t('rx.dosagePh')}
                                className="h-8 min-w-28 text-xs"
                                disabled={!l.selected}
                              />
                            </td>
                            <td className="px-2 py-1">
                              <Input
                                value={l.usageNotes ?? ''}
                                onChange={(e) => setLine(i, { usageNotes: e.target.value })}
                                placeholder={t('rx.usagePh')}
                                className="h-8 min-w-28 text-xs"
                                disabled={!l.selected}
                              />
                            </td>
                            <td className="px-2 py-1">
                              <Input
                                value={l.duration ?? ''}
                                onChange={(e) => setLine(i, { duration: e.target.value })}
                                placeholder={t('rx.durationPh')}
                                className="h-8 min-w-20 text-xs"
                                disabled={!l.selected}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : billNo && !items.isLoading && !items.isError ? (
                  <p className="text-sm text-[var(--color-muted)]">{t('rx.noItems')}</p>
                ) : null}

                {error ? (
                  <p role="alert" className="rounded-md bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]">
                    {error}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex gap-2 border-t p-4">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                {t('rx.cancel')}
              </Button>
              <Button variant="primary" className="flex-1" disabled={!canSubmit} onClick={() => void submit()}>
                {create.isPending ? t('rx.saving') : t('rx.submit')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-[var(--color-muted)]">
        {label}
        {required ? <span className="text-[var(--color-danger)]"> *</span> : null}
      </span>
      {children}
    </label>
  );
}
