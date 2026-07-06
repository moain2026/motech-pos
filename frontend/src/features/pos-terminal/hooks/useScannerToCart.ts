import { useCallback, useState } from 'react';
import { useBarcodeScanner } from '@/shared/hooks/useBarcodeScanner';
// Direct module import (not the print barrel) — keeps print-only deps out of
// the critical POS path chunk.
import { lookupBarcode } from '@/features/print/api/barcode-lookup.api';
import type { Item } from '@/shared/lib/types';
import { useCart } from '../store/cart.store';

/**
 * Bridges the HID barcode scanner to the cart (STANDARDS/13 §4, §10):
 * a hardware scan → GET /items/barcode/{bc} (or offline cache) → add to cart,
 * targeting the < 100ms scan-to-add UX goal. Returns transient feedback for
 * the UI (found item name / not-found code).
 */
export function useScannerToCart(disabled = false) {
  const addItem = useCart((s) => s.addItem);
  const [feedback, setFeedback] = useState<
    { kind: 'added' | 'notfound'; label: string } | null
  >(null);

  const onScan = useCallback(
    async (bc: string) => {
      const detail = await lookupBarcode(bc);
      if (detail) {
        const item: Item = {
          code: detail.code,
          name: detail.name,
          barcode: detail.barcode,
          unit: detail.unit,
          packSize: detail.packSize,
          lastPrice: detail.lastPrice,
        };
        // Weighted (scale) barcode → the backend decodes the embedded weight
        // (kg) into scanned.quantity; the cart line is pre-filled with it.
        const qty =
          detail.scanned?.isWeighted && detail.scanned.quantity > 0
            ? detail.scanned.quantity
            : 1;
        addItem(item, qty);
        const name = detail.name?.trim() || detail.code;
        setFeedback({
          kind: 'added',
          label: detail.scanned?.isWeighted ? `${name} × ${qty}` : name,
        });
      } else {
        setFeedback({ kind: 'notfound', label: bc });
      }
      // Auto-clear feedback shortly after.
      setTimeout(() => setFeedback(null), 2500);
    },
    [addItem],
  );

  useBarcodeScanner({ onScan, disabled });

  return feedback;
}
