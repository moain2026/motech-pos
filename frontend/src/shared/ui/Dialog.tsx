import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/shared/lib/cn';

/*
 * Dialog متجاوب موحّد على الـtokens (المرحلة 1).
 * - جوال: ينزلق كـbottom-sheet من الأسفل (أسهل للإبهام) بارتفاع أقصى 90vh.
 * - تابلت/ديسكتوب: نافذة مركزية.
 * - إغلاق بـEsc + النقر على الخلفية + زر ×. يقفل تمرير الجسم أثناء الفتح.
 * - a11y (U1 من EXCELLENCE_AUDIT): focus trap — تركيز أول عنصر قابل
 *   للتفاعل عند الفتح، حبس Tab/Shift+Tab داخل الحوار، وإرجاع التركيز
 *   للعنصر المُطلِق عند الإغلاق + aria-labelledby للعنوان.
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
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const focusables = (): HTMLElement[] =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);

    // تركيز أولي: العنصر الموسوم autofocus إن وُجد، وإلا أول قابل للتفاعل.
    const list = focusables();
    const preferred =
      list.find((el) => el.hasAttribute('autofocus') || el.autofocus) ?? list[0];
    preferred?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      // حبس Tab داخل الحوار (focus trap).
      const els = focusables();
      if (els.length === 0) return;
      const first = els[0];
      const last = els[els.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (active === first || !panelRef.current?.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !panelRef.current?.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      // إرجاع التركيز للعنصر الذي فتح الحوار.
      opener?.focus?.();
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
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        aria-labelledby={title != null && typeof title !== 'string' ? titleId : undefined}
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
            <h2 id={titleId} className="text-[length:var(--text-lg)] font-bold">{title}</h2>
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
