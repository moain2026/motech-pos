import { useTranslation } from 'react-i18next';
import { Wifi, WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';
import { cn } from '@/shared/lib/cn';

/** Always-visible connectivity indicator (STANDARDS/02 §4). */
export function OnlineBadge({ className }: { className?: string }) {
  const online = useOnlineStatus();
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        online
          ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
          : 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]',
        className,
      )}
      title={online ? t('status.online') : t('status.offline')}
    >
      {online ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
      {online ? t('status.online') : t('status.offline')}
    </span>
  );
}
