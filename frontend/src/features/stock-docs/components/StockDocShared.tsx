import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  CheckCircle2,
  Plus,
  Trash2,
  Eye,
  Ban,
  ShieldCheck,
  Lock,
  PackagePlus,
  PackageMinus,
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { ApiError } from '@/shared/lib/api-client';
import { formatDateTime, formatNumber } from '@/shared/lib/format';
import type { StockDocLine, StockDocStatus } from '@/shared/lib/types';
import { useSession } from '@/features/auth';
import { useWarehouses } from '@/features/master-data/api/master-data.api';
import { confirmDialog } from '@/shared/ui/ConfirmDialog';

/**
 * Shared UI for the two warehouse documents:
 *   - POST029 receipts (استلام مخزني): otherWh = source, posting ADDS stock.
 *   - POST028 issues (تحويل صادر): otherWh = destination, posting REMOVES
 *     stock behind the availability guard.
 * Same lifecycle: DRAFT → POSTED (supervisor/admin) or DRAFT → CANCELLED.
 */
export type DocKind = 'receipts' | 'issues';

export interface DocHeaderVM {
  id: string;
  docNo: number;
  warehouseCode: number;
  otherWarehouseCode: number | null;
  status: StockDocStatus;
  refNo: string | null;
  note: string | null;
  createdBy: string;
  createdAt: string;
  postedBy: string | null;
  postedAt: string | null;
  cancelledBy: string | null;
  cancelledAt: string | null;
  lineCount: number;
}

export interface DocDetailVM extends DocHeaderVM {
  lines: StockDocLine[];
}

export interface CreateDocInput {
  warehouseCode: number;
  otherWarehouseCode?: number;
  refNo?: string;
  note?: string;
  lines: { itemCode: string; qty: number; note?: string }[];
}

export function DocStatusBadge({ status }: { status: StockDocStatus }) {
  const { t } = useTranslation();
  const cls =
    status === 'DRAFT'
      ? 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]'
      : status === 'POSTED'
        ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
        : 'bg-[var(--color-danger)]/15 text-[var(--color-danger)]';
  return (
    <span className={'rounded-full px-2 py-0.5 text-xs font-medium ' + cls}>
      {t(`stockDocs.status.${status}`)}
    </span>
  );
}

export function useWarehouseName() {
  const warehouses = useWarehouses();
  return useMemo(() => {
    const map = new Map<number, string>();
    for (const w of warehouses.data ?? []) {
      map.set(w.code, w.arName?.trim() || w.enName?.trim() || `#${w.code}`);
    }
    return (code: number | null) => (code == null ? '—' : (map.get(code) ?? `#${code}`));
  }, [warehouses.data]);
}

/* ------------------------------- list page ------------------------------- */

interface DocPageProps {
  kind: DocKind;
  rows: DocHeaderVM[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
  status: StockDocStatus | 'all';
  setStatus: (s: StockDocStatus | 'all') => void;
  onView: (id: string) => void;
  onNew: () => void;
  onCancel: (row: DocHeaderVM) => Promise<void>;
  cancelPending: boolean;
  actionError: string | null;
}

export function StockDocListPage(props: DocPageProps) {
  const { t } = useTranslation();
  const { kind } = props;
  const whName = useWarehouseName();
  const Icon = kind === 'receipts' ? PackagePlus : PackageMinus;
  const rows = props.rows ?? [];

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Icon className="size-6 text-[var(--color-brand-500)]" aria-hidden />
          {t(`stockDocs.${kind}.title`)}
        </h1>
        <Button variant="primary" onClick={props.onNew}>
          <Plus className="size-4" />
          {t(`stockDocs.${kind}.new`)}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label={t('stockDocs.statusL')}>
        {(['all', 'DRAFT', 'POSTED', 'CANCELLED'] as const).map((s) => (
          <button
            key={s}
            role="tab"
            aria-selected={props.status === s}
            onClick={() => props.setStatus(s)}
            className={
              'rounded-[var(--radius)] border px-4 py-2 text-sm font-medium transition-colors ' +
              (props.status === s
                ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-600)] text-white'
                : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-2)]')
            }
          >
            {t(`stockDocs.filter.${s}`)}
          </button>
        ))}
      </div>

      {props.actionError ? (
        <p role="alert" className="rounded-md bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]">
          {props.actionError}
        </p>
      ) : null}

      {props.isLoading ? (
        <LoadingView />
      ) : props.isError ? (
        <ErrorView error={props.error} onRetry={props.refetch} />
      ) : rows.length === 0 ? (
        <EmptyView label={t(`stockDocs.${kind}.empty`)} />
      ) : (
        <Card className="min-h-0 flex-1 overflow-auto scroll-thin">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
              <tr>
                <th className="px-3 py-2 text-start font-semibold">{t('stockDocs.docNo')}</th>
                <th className="px-3 py-2 text-start font-semibold">
                  {t(`stockDocs.${kind}.warehouse`)}
                </th>
                <th className="hidden px-3 py-2 text-start font-semibold sm:table-cell">
                  {t(`stockDocs.${kind}.otherWarehouse`)}
                </th>
                <th className="tnum px-3 py-2 text-end font-semibold">{t('stockDocs.lineCount')}</th>
                <th className="px-3 py-2 text-center font-semibold">{t('stockDocs.statusL')}</th>
                <th className="hidden px-3 py-2 text-start font-semibold md:table-cell">
                  {t('stockDocs.createdAt')}
                </th>
                <th className="px-3 py-2 text-end font-semibold">{t('stockDocs.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-[var(--color-surface-2)]">
                  <td className="tnum px-3 py-2 font-medium">#{r.docNo}</td>
                  <td className="px-3 py-2">{whName(r.warehouseCode)}</td>
                  <td className="hidden px-3 py-2 sm:table-cell">
                    {whName(r.otherWarehouseCode)}
                  </td>
                  <td className="tnum px-3 py-2 text-end">{formatNumber(r.lineCount)}</td>
                  <td className="px-3 py-2 text-center">
                    <DocStatusBadge status={r.status} />
                  </td>
                  <td className="tnum hidden px-3 py-2 text-[var(--color-muted)] md:table-cell">
                    {formatDateTime(r.createdAt)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => props.onView(r.id)}
                      >
                        <Eye className="size-4" />
                        {t('stockDocs.view')}
                      </Button>
                      {r.status === 'DRAFT' ? (
                        <Button
                          variant="outline"
                          className="h-8 text-xs text-[var(--color-danger)]"
                          disabled={props.cancelPending}
                          onClick={() => void props.onCancel(r)}
                        >
                          <Ban className="size-4" />
                          {t('stockDocs.cancel')}
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

/* ----------------------------- create dialog ----------------------------- */

interface LineDraft {
  itemCode: string;
  qty: string;
  note: string;
}

const EMPTY_LINE: LineDraft = { itemCode: '', qty: '', note: '' };

interface CreateDialogProps {
  kind: DocKind;
  onClose: () => void;
  onSubmit: (input: CreateDocInput) => Promise<{ docNo: number }>;
  pending: boolean;
}

export function StockDocCreateDialog({ kind, onClose, onSubmit, pending }: CreateDialogProps) {
  const { t } = useTranslation();
  const warehouses = useWarehouses();
  const Icon = kind === 'receipts' ? PackagePlus : PackageMinus;

  const [warehouse, setWarehouse] = useState('');
  const [otherWarehouse, setOtherWarehouse] = useState('');
  const [refNo, setRefNo] = useState('');
  const [note, setNote] = useState('');
  const [lines, setLines] = useState<LineDraft[]>([{ ...EMPTY_LINE }]);
  const [error, setError] = useState<string | null>(null);
  const [doneNo, setDoneNo] = useState<number | null>(null);

  const whOptions = (warehouses.data ?? []).filter((w) => !w.inactive);

  const setLine = (idx: number, patch: Partial<LineDraft>) => {
    setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };

  const validLines = lines.filter((l) => l.itemCode.trim() && Number(l.qty) > 0);
  const sameWh = !!warehouse && !!otherWarehouse && warehouse === otherWarehouse;
  const canSubmit = !pending && !!warehouse && !sameWh && validLines.length > 0;

  const submit = async () => {
    setError(null);
    if (!canSubmit) return;
    try {
      const res = await onSubmit({
        warehouseCode: Number(warehouse),
        otherWarehouseCode: otherWarehouse ? Number(otherWarehouse) : undefined,
        refNo: refNo.trim() || undefined,
        note: note.trim() || undefined,
        lines: validLines.map((l) => ({
          itemCode: l.itemCode.trim(),
          qty: Number(l.qty),
          note: l.note.trim() || undefined,
        })),
      });
      setDoneNo(res.docNo);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.problem.detail || e.problem.title : t('stockDocs.createError'),
      );
    }
  };

  const whSelect = (
    value: string,
    set: (v: string) => void,
    label: string,
    required: boolean,
  ) => (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-[var(--color-muted)]">
        {label}
        {required ? <span className="text-[var(--color-danger)]"> *</span> : null}
      </span>
      <select
        value={value}
        onChange={(e) => set(e.target.value)}
        className="h-9 rounded-[var(--radius)] border bg-[var(--color-surface)] px-2 text-sm"
      >
        <option value="">{t('stockDocs.pickWarehouse')}</option>
        {whOptions.map((w) => (
          <option key={w.code} value={w.code}>
            {w.arName?.trim() || w.enName?.trim() || `#${w.code}`}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t(`stockDocs.${kind}.new`)}
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="flex items-center gap-2 font-bold">
            <Icon className="size-5 text-[var(--color-brand-500)]" aria-hidden />
            {t(`stockDocs.${kind}.new`)}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('stockDocs.close')}>
            <X className="size-5" />
          </Button>
        </div>

        {doneNo != null ? (
          <div className="flex flex-col items-center gap-4 p-6 text-center">
            <CheckCircle2 className="size-12 text-[var(--color-success)]" aria-hidden />
            <p className="font-bold">
              {t(`stockDocs.${kind}.created`)} #{doneNo}
            </p>
            <p className="text-sm text-[var(--color-muted)]">{t('stockDocs.draftHint')}</p>
            <Button variant="primary" className="w-full max-w-xs" onClick={onClose}>
              {t('stockDocs.close')}
            </Button>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto scroll-thin p-4">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {whSelect(warehouse, setWarehouse, t(`stockDocs.${kind}.warehouse`), true)}
                  {whSelect(
                    otherWarehouse,
                    setOtherWarehouse,
                    t(`stockDocs.${kind}.otherWarehouse`),
                    false,
                  )}
                </div>
                {sameWh ? (
                  <p className="text-xs text-[var(--color-danger)]">{t('stockDocs.sameWh')}</p>
                ) : null}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label={t('stockDocs.refNo')}>
                    <Input value={refNo} onChange={(e) => setRefNo(e.target.value)} className="tnum h-9" />
                  </Field>
                  <Field label={t('stockDocs.note')}>
                    <Input value={note} onChange={(e) => setNote(e.target.value)} className="h-9" />
                  </Field>
                </div>

                {/* Lines */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{t('stockDocs.lines')}</p>
                    <Button
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => setLines((ls) => [...ls, { ...EMPTY_LINE }])}
                    >
                      <Plus className="size-4" />
                      {t('stockDocs.addLine')}
                    </Button>
                  </div>
                  {lines.map((l, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        value={l.itemCode}
                        onChange={(e) => setLine(i, { itemCode: e.target.value })}
                        placeholder={t('stockDocs.itemCode')}
                        className="tnum h-9 flex-1"
                        aria-label={t('stockDocs.itemCode')}
                        dir="ltr"
                      />
                      <Input
                        type="number"
                        min={0}
                        value={l.qty}
                        onChange={(e) => setLine(i, { qty: e.target.value })}
                        placeholder={t('stockDocs.qty')}
                        className="tnum h-9 w-24 text-end"
                        aria-label={t('stockDocs.qty')}
                      />
                      <Input
                        value={l.note}
                        onChange={(e) => setLine(i, { note: e.target.value })}
                        placeholder={t('stockDocs.lineNote')}
                        className="hidden h-9 flex-1 sm:block"
                        aria-label={t('stockDocs.lineNote')}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={lines.length === 1}
                        onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))}
                        aria-label={t('stockDocs.removeLine')}
                      >
                        <Trash2 className="size-4 text-[var(--color-danger)]" />
                      </Button>
                    </div>
                  ))}
                </div>

                {error ? (
                  <p role="alert" className="rounded-md bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]">
                    {error}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex gap-2 border-t p-4">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                {t('stockDocs.cancelBtn')}
              </Button>
              <Button variant="primary" className="flex-1" disabled={!canSubmit} onClick={() => void submit()}>
                {pending ? t('stockDocs.saving') : t('stockDocs.submit')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- detail dialog ----------------------------- */

interface DetailDialogProps {
  kind: DocKind;
  detail: DocDetailVM | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
  onClose: () => void;
  onPost: () => Promise<void>;
  postPending: boolean;
}

export function StockDocDetailDialog(props: DetailDialogProps) {
  const { t } = useTranslation();
  const { kind } = props;
  const whName = useWarehouseName();
  const role = useSession((s) => s.user?.role);
  const canPost = role === 'supervisor' || role === 'admin';
  const [error, setError] = useState<string | null>(null);
  const Icon = kind === 'receipts' ? PackagePlus : PackageMinus;
  const d = props.detail;

  const approve = async () => {
    setError(null);
    if (!(await confirmDialog({ message: t(`stockDocs.${kind}.postConfirm`) }))) return;
    try {
      await props.onPost();
    } catch (e) {
      setError(
        e instanceof ApiError ? e.problem.detail || e.problem.title : t('stockDocs.postError'),
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t(`stockDocs.${kind}.detailTitle`)}
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="flex items-center gap-2 font-bold">
            <Icon className="size-5 text-[var(--color-brand-500)]" aria-hidden />
            {t(`stockDocs.${kind}.detailTitle`)}
            {d ? (
              <>
                <span className="tnum text-[var(--color-muted)]">#{d.docNo}</span>
                <DocStatusBadge status={d.status} />
              </>
            ) : null}
          </h2>
          <Button variant="ghost" size="icon" onClick={props.onClose} aria-label={t('stockDocs.close')}>
            <X className="size-5" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scroll-thin p-4">
          {props.isLoading ? (
            <LoadingView />
          ) : props.isError ? (
            <ErrorView error={props.error} onRetry={props.refetch} />
          ) : d ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-2 rounded-md border bg-[var(--color-surface-2)] p-3 text-sm sm:grid-cols-2">
                <Info label={t(`stockDocs.${kind}.warehouse`)} value={whName(d.warehouseCode)} />
                <Info
                  label={t(`stockDocs.${kind}.otherWarehouse`)}
                  value={whName(d.otherWarehouseCode)}
                />
                <Info label={t('stockDocs.createdBy')} value={d.createdBy} />
                <Info label={t('stockDocs.createdAt')} value={formatDateTime(d.createdAt)} mono />
                {d.refNo ? <Info label={t('stockDocs.refNo')} value={d.refNo} mono /> : null}
                {d.cancelledAt ? (
                  <Info
                    label={t('stockDocs.cancelledAt')}
                    value={`${formatDateTime(d.cancelledAt)} (${d.cancelledBy ?? '—'})`}
                    mono
                  />
                ) : null}
              </div>
              {d.note ? (
                <p className="rounded-md bg-[var(--color-surface-2)] p-2 text-xs text-[var(--color-muted)]">
                  {d.note}
                </p>
              ) : null}
              {d.status === 'POSTED' ? (
                <p className="flex items-center gap-2 rounded-md bg-[var(--color-success)]/10 p-2 text-xs text-[var(--color-success)]">
                  <Lock className="size-3.5 shrink-0" aria-hidden />
                  {t('stockDocs.postedBy', {
                    user: d.postedBy ?? '—',
                    at: d.postedAt ? formatDateTime(d.postedAt) : '—',
                  })}
                </p>
              ) : null}

              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--color-surface-2)] text-[var(--color-muted)]">
                    <tr>
                      <th className="px-2 py-2 text-start font-semibold">{t('stockDocs.item')}</th>
                      <th className="px-2 py-2 text-end font-semibold">{t('stockDocs.qty')}</th>
                      <th className="hidden px-2 py-2 text-start font-semibold sm:table-cell">
                        {t('stockDocs.unit')}
                      </th>
                      <th className="hidden px-2 py-2 text-start font-semibold md:table-cell">
                        {t('stockDocs.lineNote')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {d.lines.map((l) => (
                      <tr key={l.lineId}>
                        <td className="px-2 py-2">
                          <p className="font-medium">{l.itemName?.trim() || l.itemCode}</p>
                          <p className="tnum text-xs text-[var(--color-muted)]" dir="ltr">
                            {l.itemCode}
                          </p>
                        </td>
                        <td className="tnum px-2 py-2 text-end font-bold">{formatNumber(l.qty)}</td>
                        <td className="hidden px-2 py-2 sm:table-cell">{l.itmUnt ?? '—'}</td>
                        <td className="hidden max-w-40 truncate px-2 py-2 text-[var(--color-muted)] md:table-cell">
                          {l.note ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {error ? (
                <p role="alert" className="text-sm text-[var(--color-danger)]">
                  {error}
                </p>
              ) : null}

              {d.status === 'DRAFT' ? (
                canPost ? (
                  <Button
                    variant="success"
                    disabled={props.postPending || d.lines.length === 0}
                    onClick={() => void approve()}
                  >
                    <ShieldCheck className="size-4" />
                    {props.postPending ? t('status.loading') : t(`stockDocs.${kind}.post`)}
                  </Button>
                ) : (
                  <p className="text-xs text-[var(--color-muted)]">
                    {t('stockDocs.postNeedsRole')}
                  </p>
                )
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
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

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-[var(--color-muted)]">{label}</p>
      <p className={'font-medium ' + (mono ? 'tnum' : '')}>{value}</p>
    </div>
  );
}
