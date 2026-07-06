import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Gift, Tag } from 'lucide-react';
import { formatMoney } from '@/shared/lib/format';
import type { ApplyPromotionLineDto } from '@/shared/lib/types';
import { useCart } from '../store/cart.store';
import { usePromotions } from '../api/promotions.api';

/**
 * PromotionsBanner (POST001 — GNR_QTN_PRM_PKG) — evaluates the active POS
 * promotions against the current cart and:
 *   • pushes the total discount + free items into the cart store (so the net
 *     reflects the promo and the posted bill carries the discount), and
 *   • renders a compact banner of applied discounts / free items.
 * Read-only against the ERP promo catalog + LOCAL overlay (server-side).
 */
export function PromotionsBanner() {
  const { t } = useTranslation();
  // Subscribe to the RAW lines array (stable ref between store updates unless
  // lines actually change) — then derive the promo-apply payload with useMemo
  // keyed on a serialized signature (avoids the new-array-every-render churn
  // that can trigger React #185 when combined with a store write).
  const rawLines = useCart((s) => s.lines);
  const setPromotions = useCart((s) => s.setPromotions);

  const linesSig = rawLines
    .map((l) => `${l.code}:${l.qty}:${l.price}`)
    .join('|');
  const lines = useMemo<ApplyPromotionLineDto[]>(
    () =>
      rawLines.map((l) => ({
        itemCode: l.code,
        itemUnit: l.unit,
        qty: l.qty,
        unitPrice: l.price,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [linesSig],
  );

  const { data } = usePromotions(lines);

  const totalDiscount = data?.totalDiscount ?? 0;
  const promoNos = data?.appliedPromoNos ?? [];
  const freeItems = data?.freeItems ?? [];
  const empty = lines.length === 0;

  // Serialized signature of the promo RESULT — stable string dep so the effect
  // only fires when the result actually changes (prevents the set → rerender
  // → set loop, React #185).
  const sig = empty
    ? 'empty'
    : `${totalDiscount}|${promoNos.join(',')}|${freeItems
        .map((f) => `${f.itemCode}:${f.freeQty}:${f.itemUnit ?? ''}:${f.description ?? ''}`)
        .join(',')}`;

  useEffect(() => {
    if (empty) {
      setPromotions(0, [], []);
      return;
    }
    setPromotions(
      totalDiscount,
      promoNos,
      freeItems.map((f) => ({
        itemCode: f.itemCode,
        itemUnit: f.itemUnit,
        freeQty: f.freeQty,
        description: f.description,
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, empty, setPromotions]);

  if (!data || (totalDiscount <= 0 && freeItems.length === 0)) return null;

  return (
    <div className="mx-4 mt-2 rounded-[var(--radius)] border border-[var(--color-success)]/40 bg-[var(--color-success-soft)] p-2 text-[length:var(--text-xs)]">
      <div className="flex items-center gap-1.5 font-bold text-[var(--color-success)]">
        <Tag className="size-4" aria-hidden />
        {t('pos.promoApplied')}
        {totalDiscount > 0 ? (
          <span className="tnum ms-auto">
            {t('pos.promoDiscount')}: −{formatMoney(totalDiscount)}
          </span>
        ) : null}
      </div>
      {freeItems.length > 0 ? (
        <ul className="mt-1 space-y-0.5">
          {freeItems.map((f, i) => (
            <li key={`${f.itemCode}-${i}`} className="flex items-center gap-1.5">
              <Gift className="size-3.5 text-[var(--color-success)]" aria-hidden />
              <span className="truncate">
                {f.description?.trim() || f.itemCode}
              </span>
              <span className="tnum ms-auto font-semibold">
                +{f.freeQty} {t('pos.promoFree')}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
