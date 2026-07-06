import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, HelpCircle } from 'lucide-react';
import { Button } from './Button';
import { Dialog } from './Dialog';

/*
 * ConfirmDialog — بديل موحّد وفاخر لـwindow.confirm (C2 من EXCELLENCE_AUDIT).
 * - promise-based: `const ok = await confirmDialog({...})` — بديل مباشر
 *   لسطر window.confirm بلا إعادة هيكلة للمستدعين.
 * - على design tokens (سمة داكنة/RTL/أهداف لمس ≥44px) بدل صندوق النظام.
 * - variant: 'danger' (حذف/إلغاء نهائي) أو 'primary' (اعتماد/تأكيد).
 * - يرث من Dialog: Esc + backdrop + focus trap + إرجاع التركيز.
 */

export interface ConfirmOptions {
  /** نص السؤال (إلزامي). */
  message: string;
  /** عنوان الحوار — الافتراضي «تأكيد». */
  title?: string;
  /** نص زر التأكيد — الافتراضي «تأكيد». */
  confirmLabel?: string;
  /** نص زر الإلغاء — الافتراضي «إلغاء». */
  cancelLabel?: string;
  /** danger = عمليات لا رجعة فيها (أحمر) · primary = اعتماد عادي. */
  variant?: 'danger' | 'primary';
}

type PendingRequest = ConfirmOptions & {
  resolve: (ok: boolean) => void;
};

let enqueue: ((req: PendingRequest) => void) | null = null;

/**
 * افتح حوار تأكيد وانتظر قرار المستخدم.
 * يتطلب تركيب `<ConfirmDialogHost />` مرة واحدة في شجرة التطبيق.
 * لو لم يكن الـhost مركّباً (حالة قصوى) نعود لـwindow.confirm حتى لا نعطّل
 * عملية حرجة.
 */
export function confirmDialog(opts: ConfirmOptions): Promise<boolean> {
  if (!enqueue) {
    return Promise.resolve(window.confirm(opts.message));
  }
  return new Promise<boolean>((resolve) => {
    enqueue?.({ ...opts, resolve });
  });
}

/** مضيف وحيد يعرض طلبات التأكيد واحداً تلو الآخر. */
export function ConfirmDialogHost() {
  const { t } = useTranslation();
  const [queue, setQueue] = useState<PendingRequest[]>([]);
  const current = queue[0] ?? null;

  useEffect(() => {
    enqueue = (req) => setQueue((q) => [...q, req]);
    return () => {
      enqueue = null;
    };
  }, []);

  if (!current) return null;

  const settle = (ok: boolean) => {
    current.resolve(ok);
    setQueue((q) => q.slice(1));
  };

  const danger = current.variant === 'danger';

  return (
    <Dialog
      size="sm"
      title={
        <span className="flex items-center gap-2">
          {danger ? (
            <AlertTriangle className="size-5 text-[var(--color-danger)]" aria-hidden />
          ) : (
            <HelpCircle className="size-5 text-[var(--color-brand-400)]" aria-hidden />
          )}
          {current.title ?? t('confirm.title')}
        </span>
      }
      onClose={() => settle(false)}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="touch" onClick={() => settle(false)}>
            {current.cancelLabel ?? t('confirm.cancel')}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            size="touch"
            autoFocus
            onClick={() => settle(true)}
          >
            {current.confirmLabel ?? t('confirm.ok')}
          </Button>
        </div>
      }
    >
      <p className="whitespace-pre-line text-[length:var(--text-base)] leading-relaxed text-[var(--color-fg)]">
        {current.message}
      </p>
    </Dialog>
  );
}
