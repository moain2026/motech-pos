import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/shared/lib/cn';

/*
 * Dialog متجاوب موحّد على الـtokens (المرحلة 1).
 * - جوال: ينزلق كـbottom-sheet من الأسفل (أسهل للإبهام) بارتفاع أقصى 90vh.
 * - تابلت/ديسكتوب: نافذة مركزية.
 * - إغلاق بـEsc + النقر على الخلفية + زر ×. يقفل تمرير الجسم أثناء الفتح.
 * أهداف اللمس في الترويسة/الأزرار ≥44px.
 */
export function Dialog({
  title,
  onClose,
  children,
  footer,
  size = 'md',
  className,
}: {
  title?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const maxW = size === 'sm' ? 'sm:max-w-sm' : size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-md';

  return (
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex items-end justify-center bg-black/50 sm:items-center sm:p-4 animate-fade-in"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        className={cn(
          'flex max-h-[90vh] w-full flex-col overflow-hidden border bg-[var(--color-surface)] shadow-[var(--shadow-xl)]',
          'rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-xl)]',
          'animate-sheet-up sm:animate-fade-in',
          maxW,
          className,
        )}
      >
        {title != null ? (
          <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
            <h2 className="text-[length:var(--text-lg)] font-bold">{title}</h2>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="إغلاق">
              <X className="size-5" />
            </Button>
          </div>
        ) : null}
        <div className="min-h-0 flex-1 overflow-y-auto scroll-thin p-4">{children}</div>
        {footer != null ? <div className="border-t p-4 pb-safe">{footer}</div> : null}
      </div>
    </div>
  );
}
