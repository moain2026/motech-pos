import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, History } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { ApiError } from '@/shared/lib/api-client';
import {
  useRunImport,
  useImportBatches,
  type ImportKind,
  type ImportResult,
} from '../api/import.api';

/**
 * POS_IMPXLS — استيراد Excel/CSV: upload a spreadsheet of items / prices /
 * opening balances, preview (dry-run) the validated rows + per-row error
 * report, then commit. supervisor/admin.
 */
export function ImportXlsDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const run = useRunImport();
  const [kind, setKind] = useState<ImportKind>('items');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const batches = useImportBatches(showHistory);

  const columnsHint =
    kind === 'items'
      ? t('importXls.columnsItems')
      : kind === 'prices'
        ? t('importXls.columnsPrices')
        : t('importXls.columnsBalances');

  const exec = async (commit: boolean) => {
    setError(null);
    if (!file) {
      setError(t('importXls.noFile'));
      return;
    }
    try {
      const r = await run.mutateAsync({ kind, file, commit });
      setResult(r);
    } catch (e) {
      if (e instanceof ApiError) {
        const trace = e.problem.traceId ? ` (traceId: ${e.problem.traceId})` : '';
        setError(`${e.problem.detail || e.problem.title}${trace}`);
      } else setError(t('importXls.importError'));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('importXls.title')}
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="flex items-center gap-2 font-bold">
            <FileSpreadsheet className="size-5 text-[var(--color-brand-500)]" aria-hidden />
            {t('importXls.title')}
          </h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHistory((v) => !v)}
              aria-label={t('importXls.batches')}
            >
              <History className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('shortcuts.cancel')}>
              <X className="size-5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto p-4">
          <p className="text-xs text-[var(--color-muted)]">{t('importXls.subtitle')}</p>

          {/* Kind selector */}
          <div className="flex flex-wrap gap-2" role="tablist">
            {(['items', 'prices', 'balances'] as ImportKind[]).map((k) => (
              <button
                key={k}
                role="tab"
                aria-selected={kind === k}
                onClick={() => {
                  setKind(k);
                  setResult(null);
                }}
                className={
                  'rounded-[var(--radius)] border px-3 py-1.5 text-sm font-medium transition-colors ' +
                  (kind === k
                    ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-600)] text-white'
                    : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-2)]')
                }
              >
                {t(
                  k === 'items'
                    ? 'importXls.kindItems'
                    : k === 'prices'
                      ? 'importXls.kindPrices'
                      : 'importXls.kindBalances',
                )}
              </button>
            ))}
          </div>
          <p className="rounded-md bg-[var(--color-surface-2)] px-3 py-2 font-mono text-xs text-[var(--color-muted)]">
            {columnsHint}
          </p>

          {/* File picker */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.csv,text/csv"
              className="hidden"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setResult(null);
              }}
            />
            <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload className="size-4" />
              {t('importXls.choose')}
            </Button>
            {file ? (
              <span className="text-sm text-[var(--color-fg)]">{file.name}</span>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => exec(false)} disabled={run.isPending || !file}>
              {t('importXls.preview')}
            </Button>
            <Button
              variant="success"
              onClick={() => exec(true)}
              disabled={run.isPending || !file || !result || result.okRows === 0}
            >
              <CheckCircle2 className="size-4" />
              {t('importXls.commit')}
            </Button>
            <span className="self-center text-xs text-[var(--color-muted)]">
              {t('importXls.dryRunNote')}
            </span>
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-md bg-[var(--color-danger)]/15 p-2 text-center text-xs text-[var(--color-danger)]"
            >
              {error}
            </p>
          ) : null}

          {result ? <ResultView result={result} /> : null}

          {showHistory ? (
            <div className="mt-2 border-t pt-2">
              <h3 className="mb-2 flex items-center gap-1 text-sm font-semibold">
                <History className="size-4" aria-hidden />
                {t('importXls.batches')}
              </h3>
              {batches.isLoading ? (
                <p className="text-xs text-[var(--color-muted)]">…</p>
              ) : (batches.data ?? []).length === 0 ? (
                <p className="text-xs text-[var(--color-muted)]">{t('importXls.empty')}</p>
              ) : (
                <ul className="flex flex-col gap-1 text-xs">
                  {(batches.data ?? []).map((b) => (
                    <li key={b.id} className="flex justify-between rounded bg-[var(--color-surface-2)] px-2 py-1">
                      <span>{b.fileName ?? b.kind}</span>
                      <span className="tnum text-[var(--color-muted)]">
                        {t('importXls.ok')}: {b.okRows} · {t('importXls.errorRows')}: {b.errorRows}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex justify-end border-t px-4 py-3">
          <Button variant="ghost" onClick={onClose}>
            {t('shortcuts.cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ResultView({ result }: { result: ImportResult }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3 rounded-md border p-3">
      <div className="flex flex-wrap gap-3 text-sm">
        <Stat label={t('importXls.total')} value={result.totalRows} />
        <Stat label={t('importXls.ok')} value={result.okRows} tone="success" />
        <Stat label={t('importXls.errorRows')} value={result.errorRows} tone="danger" />
        {result.committed ? (
          <span className="flex items-center gap-1 rounded-full bg-[var(--color-success)]/15 px-3 py-0.5 text-xs text-[var(--color-success)]">
            <CheckCircle2 className="size-3.5" /> {t('importXls.committed')}
          </span>
        ) : null}
      </div>

      {result.errors.length > 0 ? (
        <div>
          <h4 className="mb-1 flex items-center gap-1 text-xs font-semibold text-[var(--color-danger)]">
            <AlertTriangle className="size-3.5" aria-hidden />
            {t('importXls.errorsTitle')}
          </h4>
          <div className="max-h-40 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="text-[var(--color-muted)]">
                <tr>
                  <th className="px-2 py-1 text-start">{t('importXls.row')}</th>
                  <th className="px-2 py-1 text-start">{t('importXls.message')}</th>
                </tr>
              </thead>
              <tbody>
                {result.errors.map((e, i) => (
                  <tr key={i} className="border-t">
                    <td className="tnum px-2 py-1">{e.row}</td>
                    <td className="px-2 py-1">{e.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {result.sample.length > 0 ? (
        <div>
          <h4 className="mb-1 text-xs font-semibold">{t('importXls.sample')}</h4>
          <div className="max-h-40 overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-[var(--color-muted)]">
                <tr>
                  {Object.keys(result.sample[0]).map((k) => (
                    <th key={k} className="px-2 py-1 text-start font-mono">
                      {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.sample.map((r, i) => (
                  <tr key={i} className="border-t">
                    {Object.keys(result.sample[0]).map((k) => (
                      <td key={k} className="px-2 py-1">
                        {r[k] == null ? '—' : String(r[k])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: 'success' | 'danger';
}) {
  const color =
    tone === 'success'
      ? 'text-[var(--color-success)]'
      : tone === 'danger'
        ? 'text-[var(--color-danger)]'
        : 'text-[var(--color-fg)]';
  return (
    <span className="flex items-center gap-1">
      <span className="text-[var(--color-muted)]">{label}:</span>
      <b className={'tnum ' + color}>{value}</b>
    </span>
  );
}
