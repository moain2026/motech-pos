import { useTranslation } from 'react-i18next';
import type { ItemOrigin } from '@/shared/lib/types';

/**
 * Provenance badge for items/customers:
 *   ERP  → reference record from Oracle YSPOS23 (read-only reference)
 *   LOCAL→ created locally in MOTECH_POS
 *   EDIT → ERP record with a local override applied
 * Labels live in i18n (`origin.*`). Absent origin renders nothing.
 */
const STYLES: Record<ItemOrigin, string> = {
  ERP: 'bg-[var(--color-surface-2)] text-[var(--color-muted)] border',
  LOCAL: 'bg-[var(--color-success)]/15 text-[var(--color-success)]',
  EDIT: 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]',
};

export function OriginBadge({ origin }: { origin?: ItemOrigin }) {
  const { t } = useTranslation();
  if (!origin) return null;
  return (
    <span
      className={
        'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ' +
        (STYLES[origin] ?? STYLES.ERP)
      }
      title={t(`origin.${origin}Hint`, { defaultValue: origin })}
    >
      {t(`origin.${origin}`, { defaultValue: origin })}
    </span>
  );
}
