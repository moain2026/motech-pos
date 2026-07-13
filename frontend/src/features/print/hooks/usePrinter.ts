/**
 * usePrinter — hook اختيار الناقل والطباعة (STANDARDS/13 §3).
 *
 * - يكتشف الناقلات المتاحة (Web Serial → WebUSB → المتصفح) ويختار تلقائياً
 *   تفضيل المستخدم المخزَّن أو الأفضل المتاح.
 * - `print(model)` يطبع عبر الناقل الفعّال؛ عند فشل ناقل خام يسقط تلقائياً
 *   لطباعة المتصفح (window.print) — الطباعة لا تكسر البيع أبداً.
 * - `pair(id)` يفتح حوار الاقتران (Web Serial/WebUSB — يتطلب إيماءة مستخدم)
 *   ويخزّن الاختيار في localStorage.
 */
import { useCallback, useMemo, useState } from 'react';
import type { PrintTransport, TransportId } from '../transport';
import {
  detectTransports,
  setPreferredTransportId,
  resolveActiveTransport,
  printViaTransport,
  type PrintViaTransportOptions,
} from '../transport';
import type { ReceiptModel } from '../receipt-model';

export type PrintOutcome = 'sent' | 'fallback' | 'failed';

export interface UsePrinter {
  /** الناقلات المدعومة في هذه البيئة، مرتّبة بالأفضلية. */
  transports: PrintTransport[];
  /** معرّف الناقل الفعّال (تفضيل المستخدم أو الأفضل المتاح). */
  activeId: TransportId;
  /** هل يوجد ناقل خام (طباعة حرارية مباشرة) متاح؟ */
  hasRawTransport: boolean;
  /** طباعة إيصال عبر الناقل الفعّال مع fallback تلقائي للمتصفح. */
  print(model: ReceiptModel, opts?: PrintViaTransportOptions): Promise<PrintOutcome>;
  /** اقتران/اختيار جهاز لناقل معيّن + حفظ التفضيل. يتطلب إيماءة مستخدم. */
  pair(id: TransportId): Promise<boolean>;
  /** تغيير التفضيل بدون حوار اقتران. */
  select(id: TransportId): void;
}

export function usePrinter(): UsePrinter {
  const transports = useMemo(() => detectTransports(), []);
  const [activeId, setActiveId] = useState<TransportId>(
    () => resolveActiveTransport().id,
  );

  const hasRawTransport = useMemo(
    () => transports.some((t) => t.raw),
    [transports],
  );

  const print = useCallback(
    async (model: ReceiptModel, opts?: PrintViaTransportOptions): Promise<PrintOutcome> => {
      const active = resolveActiveTransport();
      try {
        await printViaTransport(active, model, opts);
        return 'sent';
      } catch {
        if (!active.raw) return 'failed';
        // فشل الناقل الخام (إذن مرفوض/جهاز غير موصول) → fallback للمتصفح.
        const browser = transports.find((t) => !t.raw);
        if (!browser) return 'failed';
        try {
          await printViaTransport(browser, model, opts);
          return 'fallback';
        } catch {
          return 'failed';
        }
      }
    },
    [transports],
  );

  const pair = useCallback(
    async (id: TransportId): Promise<boolean> => {
      const t = transports.find((x) => x.id === id);
      if (!t) return false;
      try {
        if (t.pair) await t.pair();
        setPreferredTransportId(id);
        setActiveId(id);
        return true;
      } catch {
        // المستخدم أغلق الحوار أو فشل الفتح — لا نغيّر التفضيل.
        return false;
      }
    },
    [transports],
  );

  const select = useCallback((id: TransportId): void => {
    setPreferredTransportId(id);
    setActiveId(id);
  }, []);

  return {
    transports,
    activeId,
    hasRawTransport,
    print,
    pair,
    select,
  };
}
