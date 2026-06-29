import { useTranslation } from 'react-i18next';
import { Loader2, AlertTriangle, Inbox } from 'lucide-react';
import { ApiError } from '@/shared/lib/api-client';
import { Button } from './Button';

/** Spinner. */
export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className ?? 'size-6'}`} aria-hidden />;
}

/** Centered loading state. */
export function LoadingView({ label }: { label?: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-10 text-[var(--color-muted)]">
      <Spinner className="size-8" />
      <span>{label ?? t('status.loading')}</span>
    </div>
  );
}

/** Empty state. */
export function EmptyView({ label }: { label?: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-10 text-[var(--color-muted)]">
      <Inbox className="size-8" aria-hidden />
      <span>{label ?? t('status.empty')}</span>
    </div>
  );
}

/** Error state — renders RFC 9457 detail when present, with a retry action. */
export function ErrorView({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { t } = useTranslation();
  const msg =
    error instanceof ApiError
      ? error.problem.detail || error.problem.title
      : error instanceof Error
        ? error.message
        : t('status.error');
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 p-10 text-center"
    >
      <AlertTriangle className="size-8 text-[var(--color-danger)]" aria-hidden />
      <span className="max-w-md text-[var(--color-fg)]">{msg}</span>
      {error instanceof ApiError && error.problem.traceId ? (
        <code className="text-xs text-[var(--color-muted)]">trace: {error.problem.traceId}</code>
      ) : null}
      {onRetry ? (
        <Button variant="outline" onClick={onRetry}>
          {t('status.retry')}
        </Button>
      ) : null}
    </div>
  );
}
