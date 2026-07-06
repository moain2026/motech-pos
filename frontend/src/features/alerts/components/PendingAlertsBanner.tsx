import { useTranslation } from 'react-i18next';
import { Megaphone, Check } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { useSession } from '@/features/auth';
import { useAckAlert, usePendingAlerts } from '../api/alerts.api';

/**
 * POS_ALRT_SCR تنبيهات الدخول — banner shown under the app header for every
 * alert the signed-in user has not acknowledged yet (once per user; the ack
 * is idempotent server-side). Renders nothing when there is nothing pending.
 */
export function PendingAlertsBanner() {
  const { t } = useTranslation();
  const user = useSession((s) => s.user);
  const pending = usePendingAlerts(!!user);
  const ack = useAckAlert();

  const alerts = pending.data ?? [];
  if (alerts.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 border-b bg-[var(--color-warning)]/10 px-4 py-2">
      {alerts.map((a) => (
        <div key={a.id} role="alert" className="flex flex-wrap items-center gap-3">
          <Megaphone className="size-5 shrink-0 text-[var(--color-warning)]" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">{a.title}</p>
            {a.body ? (
              <p className="whitespace-pre-line text-xs text-[var(--color-muted)]">{a.body}</p>
            ) : null}
          </div>
          <Button
            variant="outline"
            className="h-8 shrink-0 text-xs"
            disabled={ack.isPending}
            onClick={() => ack.mutate(a.id)}
          >
            <Check className="size-4" />
            {t('alerts.ack')}
          </Button>
        </div>
      ))}
    </div>
  );
}
