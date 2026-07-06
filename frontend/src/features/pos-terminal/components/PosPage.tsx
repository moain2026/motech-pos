import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Maximize2,
  Minimize2,
  MonitorSmartphone,
  ShoppingCart,
  X,
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { formatMoney } from '@/shared/lib/format';
import { ShiftBar } from '@/features/shifts/components/ShiftBar';
// Direct module imports (not the barrel) so the customer-display PAGE (and
// its lazy QR dep) stays out of the eager POS chunk.
import { openCustomerDisplay } from '@/features/customer-display/channel';
import { useCustomerDisplaySync } from '@/features/customer-display/useCustomerDisplaySync';
import { ItemGrid } from './ItemGrid';
import { Cart } from './Cart';
import { SaleSummary } from './SaleSummary';
import { PromotionsBanner } from './PromotionsBanner';
import { useCartTotals } from '../hooks/useCartTotals';
import { useScannerToCart } from '../hooks/useScannerToCart';
import { usePosSettings } from '../store/pos-settings.store';

/**
 * POST001 — شاشة فاتورة البيع (قلب النظام) — mobile-first (المرحلة 3).
 *
 * ثلاث حالات تخطيط من نفس الكود:
 *   • ديسكتوب (≥1024): شبكة أصناف + لوحة سلة جانبية ثابتة.
 *   • تابلت (816–1024): شبكة أوسع + لوحة سلة أضيق جانبية.
 *   • جوال (<816): الأصناف تملأ الشاشة + شريط ملخّص سفلي ثابت يفتح السلة
 *     كـsheet سفلي منزلق. أزرار الدفع كبيرة وثابتة داخل الـsheet.
 * صفر overflow أفقي على 390px (minmax(0,1fr) + overflow-x-hidden في الـshell).
 */
export function PosPage() {
  const { t } = useTranslation();
  const totals = useCartTotals();
  const qtyCount = totals.qtyCount;
  const [sheetOpen, setSheetOpen] = useState(false);

  // POSADVS — full touch/kiosk mode: enlarges targets + requests browser
  // Fullscreen. Persisted so a dedicated touch terminal stays in kiosk mode.
  const kioskMode = usePosSettings((s) => s.kioskMode);
  const setKioskMode = usePosSettings((s) => s.setKioskMode);

  const enterFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen?.();
      }
    } catch {
      /* fullscreen may be blocked (no gesture / iframe) — kiosk skin still applies */
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen?.();
    } catch {
      /* ignore */
    }
  }, []);

  const toggleKiosk = useCallback(() => {
    const next = !kioskMode;
    setKioskMode(next);
    if (next) void enterFullscreen();
    else void exitFullscreen();
  }, [kioskMode, setKioskMode, enterFullscreen, exitFullscreen]);

  // Keep the kiosk skin in sync if the user leaves fullscreen via Esc/F11.
  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement && kioskMode) setKioskMode(false);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, [kioskMode, setKioskMode]);

  // HID barcode scanner → cart (works with no search-box focus).
  const scanFeedback = useScannerToCart();
  // Mirror the cart live to the customer-facing display (POSADVS_SCND).
  useCustomerDisplaySync();

  /** لوحة السلة الكاملة (رأس + بنود + ملخّص/دفع) — مشتركة بين الديسكتوب والـsheet. */
  const cartPanel = (
    <>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="flex items-center gap-2 text-[length:var(--text-base)] font-bold">
          <ShoppingCart className="size-5 text-[var(--color-brand-500)]" aria-hidden />
          {t('pos.cart')}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCustomerDisplay}
            title={t('pos.customerDisplay')}
            className="flex min-h-11 items-center gap-1.5 rounded-full bg-[var(--color-surface-2)] px-2.5 text-[length:var(--text-xs)] font-semibold text-[var(--color-muted)] transition-colors hover:bg-[var(--color-brand-500)]/15 hover:text-[var(--color-brand-500)]"
          >
            <MonitorSmartphone className="size-4" aria-hidden />
            <span className="hidden sm:inline">{t('pos.customerDisplay')}</span>
          </button>
          <span className="tnum rounded-full bg-[var(--color-surface-2)] px-2 py-0.5 text-[length:var(--text-xs)]">
            {qtyCount}
          </span>
          {/* زر إغلاق الـsheet — جوال فقط */}
          <button
            type="button"
            onClick={() => setSheetOpen(false)}
            aria-label={t('returns.close')}
            className="grid size-9 place-items-center rounded-full text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] tab:hidden"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
      </div>
      <PromotionsBanner />
      <Cart />
      <SaleSummary />
    </>
  );

  return (
    <div
      data-kiosk={kioskMode ? 'on' : undefined}
      className={`pos-terminal grid h-full grid-rows-[auto_minmax(0,1fr)] gap-3 p-3 sm:gap-4 sm:p-4 ${
        kioskMode ? 'pos-kiosk' : ''
      }`}
    >
      {/* رأس الوردية/الكاشير (سياق POST027) + زر وضع اللمس */}
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <ShiftBar />
        </div>
        <button
          type="button"
          onClick={toggleKiosk}
          title={kioskMode ? t('pos.kioskExit') : t('pos.kiosk')}
          aria-pressed={kioskMode}
          className={`grid size-11 shrink-0 place-items-center rounded-full transition-colors ${
            kioskMode
              ? 'bg-[var(--color-brand-600)] text-white'
              : 'bg-[var(--color-surface-2)] text-[var(--color-muted)] hover:bg-[var(--color-brand-500)]/15 hover:text-[var(--color-brand-500)]'
          }`}
        >
          {kioskMode ? (
            <Minimize2 className="size-5" aria-hidden />
          ) : (
            <Maximize2 className="size-5" aria-hidden />
          )}
        </button>
      </div>

      {/* تغذية راجعة فورية للمسح (POS §7) — live region دائمة حتى يلتقط
          قارئ الشاشة التحديثات (U2 من EXCELLENCE_AUDIT) */}
      <div role="status" aria-live="polite" aria-atomic="true">
        {scanFeedback ? (
          <div
            className={`pointer-events-none fixed inset-x-0 top-4 z-[var(--z-toast)] mx-auto w-fit max-w-[90vw] rounded-full px-4 py-2 text-[length:var(--text-sm)] font-semibold shadow-[var(--shadow-lg)] ${
              scanFeedback.kind === 'added'
                ? 'bg-[var(--color-success)] text-white'
                : 'bg-[var(--color-danger)] text-white'
            }`}
          >
            {scanFeedback.kind === 'added'
              ? `${t('pos.scanAdded')}: ${scanFeedback.label}`
              : `${t('pos.scanNotFound')}: ${scanFeedback.label}`}
          </div>
        ) : null}
      </div>

      {/* الشبكة: أصناف + سلة (السلة تختفي على الجوال وتظهر كـsheet) */}
      <div className="grid min-h-0 grid-cols-1 gap-3 sm:gap-4 tab:grid-cols-[minmax(0,1fr)_320px] lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="min-h-0 overflow-hidden p-2 sm:p-3">
          <ItemGrid />
        </Card>

        {/* لوحة السلة الجانبية — تابلت/ديسكتوب فقط */}
        <Card className="hidden min-h-0 flex-col overflow-hidden tab:flex">{cartPanel}</Card>
      </div>

      {/* شريط ملخّص السلة السفلي الثابت — جوال فقط */}
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="fixed inset-x-0 bottom-[calc(var(--touch-lg)+var(--safe-bottom))] z-[var(--z-sticky)] mx-3 flex items-center justify-between gap-3 rounded-[var(--radius-lg)] bg-[var(--color-brand-600)] px-4 py-3 text-white shadow-[var(--shadow-lg)] tab:hidden"
        aria-label={t('pos.cart')}
      >
        <span className="flex items-center gap-2 font-bold">
          <ShoppingCart className="size-5" aria-hidden />
          <span className="tnum grid size-6 place-items-center rounded-full bg-white/25 text-[length:var(--text-xs)]">
            {qtyCount}
          </span>
          {t('pos.cart')}
        </span>
        <span className="tnum text-[length:var(--text-lg)] font-extrabold">
          {formatMoney(totals.net)}
        </span>
      </button>

      {/* السلة كـsheet سفلي منزلق — جوال فقط */}
      {sheetOpen ? (
        <div
          className="fixed inset-0 z-[var(--z-modal)] flex flex-col justify-end tab:hidden"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSheetOpen(false);
          }}
        >
          <div className="absolute inset-0 bg-black/50 animate-fade-in" />
          <div className="animate-sheet-up relative flex max-h-[92vh] flex-col overflow-hidden rounded-t-[var(--radius-xl)] border-t bg-[var(--color-surface)] shadow-[var(--shadow-xl)] pb-safe">
            {/* مقبض السحب */}
            <div className="flex justify-center pt-2">
              <span className="h-1.5 w-10 rounded-full bg-[var(--color-border-strong)]" aria-hidden />
            </div>
            {cartPanel}
          </div>
        </div>
      ) : null}
    </div>
  );
}
