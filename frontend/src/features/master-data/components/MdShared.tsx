import { useTranslation } from 'react-i18next';
import { X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { OriginBadge } from '@/shared/ui/OriginBadge';
import { ApiError } from '@/shared/lib/api-client';
import type { ItemOrigin } from '@/shared/lib/types';

/** Small shared building blocks for the wave-E master-data screens. */

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-sm text-[var(--color-muted)]">{label}</span>
      {children}
    </label>
  );
}

export function CheckField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-[var(--color-brand-600)]"
      />
      {label}
    </label>
  );
}

export function errorText(e: unknown, fallback: string): string {
  if (e instanceof ApiError) {
    const trace = e.problem.traceId ? ` (traceId: ${e.problem.traceId})` : '';
    return `${e.problem.detail || e.problem.title}${trace}`;
  }
  return fallback;
}

/**
 * Generic modal shell used by all the master-data create/edit dialogs:
 * header (title + origin badge + close), scrollable body, footer submit.
 */
export function MdDialog({
  title,
  icon,
  origin,
  onClose,
  done,
  error,
  pending,
  canSubmit,
  onSubmit,
  children,
  wide,
}: {
  title: string;
  icon?: React.ReactNode;
  origin?: ItemOrigin;
  onClose: () => void;
  /** Success message; when set the body is replaced by a success state. */
  done: string | null;
  error: string | null;
  pending: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`flex max-h-[85vh] w-full flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl ${wide ? 'max-w-2xl' : 'max-w-md'}`}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="flex items-center gap-2 font-bold">
            {icon}
            {title}
            {origin ? <OriginBadge origin={origin} /> : null}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('returns.close')}>
            <X className="size-5" />
          </Button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-4 p-6 text-center">
            <CheckCircle2 className="size-12 text-[var(--color-success)]" aria-hidden />
            <p className="font-bold">{done}</p>
            <Button variant="primary" className="w-full" onClick={onClose}>
              {t('returns.close')}
            </Button>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto scroll-thin p-4">
              <div className="flex flex-col gap-3">
                {children}
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
                onClick={onSubmit}
              >
                <CheckCircle2 className="size-5" />
                {pending ? t('md.saving') : t('md.save')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
