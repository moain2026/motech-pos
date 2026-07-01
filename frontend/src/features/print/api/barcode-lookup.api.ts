import { getData, ApiError } from '@/shared/lib/api-client';
import type { ItemDetail } from '@/shared/lib/types';
import { db } from '@/shared/offline/db';

/**
 * Resolve a scanned barcode to an item (STANDARDS/13 §4).
 * Online: GET /items/barcode/{bc} (proof-verified endpoint, returns ItemDetail).
 * Offline: fall back to the Dexie catalog cache (barcode index) so scanning
 * still works with no network (offline-first, STANDARDS/13 §1).
 */
export async function lookupBarcode(bc: string): Promise<ItemDetail | null> {
  const code = bc.trim();
  if (!code) return null;
  try {
    return await getData<ItemDetail>(`/items/barcode/${encodeURIComponent(code)}`);
  } catch (e) {
    // 404 = not found; anything else (network/offline) → try the local cache.
    if (e instanceof ApiError && e.problem.status === 404) {
      return lookupBarcodeOffline(code);
    }
    return lookupBarcodeOffline(code);
  }
}

/** Local catalog-cache lookup by barcode, then by code. */
async function lookupBarcodeOffline(bc: string): Promise<ItemDetail | null> {
  const byBarcode = await db.catalog.where('barcode').equals(bc).first();
  const hit = byBarcode ?? (await db.catalog.get(bc));
  if (!hit) return null;
  return {
    ...hit,
    totalAvailableQty: 0,
    stock: [],
  };
}

/** Warm the offline catalog cache from any item list (best-effort). */
export async function cacheItems(
  items: { code: string; barcode: string | null; name?: string | null }[],
) {
  try {
    await db.catalog.bulkPut(
      items.map((i) => ({
        code: i.code,
        barcode: i.barcode,
        name: i.name ?? null,
        unit: null,
        packSize: 1,
        lastPrice: 0,
        cachedAt: Date.now(),
      })),
    );
  } catch {
    /* non-fatal */
  }
}
