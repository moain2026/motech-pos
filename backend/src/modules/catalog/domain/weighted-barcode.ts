/**
 * Weighted (scale) barcode decoding — Onyx POS compatible.
 *
 * Live Onyx configuration (IAS202623 IAS_PARA_POS, verified 2026-07-03):
 *   - WEIGHTED_PERFIX     = '02'  → prefix marking a scale-printed barcode
 *   - WEIGHTED_LENGTH     = 12    → full barcode length
 *   - WEIGHTED_ITEM_LENGTH = 5    → item-code digits right after the prefix
 *   - WEIGHTED_BASIC      = 1000  → divisor turning the numeric tail into kg
 *
 * Layout (12 digits): [02][IIIII][WWWWW]
 *   - positions 0-1  → prefix '02'
 *   - positions 2-6  → embedded item code (5 digits, may be zero-padded)
 *   - positions 7-11 → weight/qty ×1000 (e.g. '01250' → 1.250 kg)
 *
 * Pure, deterministic, no I/O — safe to unit test exhaustively.
 */

export interface WeightedBarcodeConfig {
  /** Barcode prefix that marks a weighted barcode (Onyx WEIGHTED_PERFIX). */
  prefix: string;
  /** Full barcode length (Onyx WEIGHTED_LENGTH). */
  length: number;
  /** Item-code digits after the prefix (Onyx WEIGHTED_ITEM_LENGTH). */
  itemCodeLength: number;
  /** Divisor for the numeric tail → weight in kg (Onyx WEIGHTED_BASIC). */
  divisor: number;
}

/** Defaults mirror the live IAS_PARA_POS values. */
export const DEFAULT_WEIGHTED_CONFIG: WeightedBarcodeConfig = {
  prefix: '02',
  length: 12,
  itemCodeLength: 5,
  divisor: 1000,
};

export interface DecodedWeightedBarcode {
  isWeighted: true;
  /** Raw scanned barcode. */
  raw: string;
  /** Embedded item code exactly as printed (zero padding preserved). */
  itemCodeRaw: string;
  /** Embedded item code with leading zeros stripped (matches I_CODE). */
  itemCode: string;
  /** Decoded weight/quantity in kg (tail ÷ divisor). */
  quantity: number;
}

/**
 * Decode a weighted barcode. Returns null when the barcode is NOT a
 * weighted one (wrong prefix/length/non-digits) — caller falls back to
 * the normal barcode lookup.
 */
export function parseWeightedBarcode(
  barcode: string,
  cfg: WeightedBarcodeConfig = DEFAULT_WEIGHTED_CONFIG,
): DecodedWeightedBarcode | null {
  const raw = (barcode ?? '').trim();
  if (raw.length !== cfg.length) return null;
  if (!raw.startsWith(cfg.prefix)) return null;
  if (!/^\d+$/.test(raw)) return null;

  const itemStart = cfg.prefix.length;
  const itemEnd = itemStart + cfg.itemCodeLength;
  const itemCodeRaw = raw.slice(itemStart, itemEnd);
  const itemCode = itemCodeRaw.replace(/^0+/, '') || '0';

  const tail = raw.slice(itemEnd);
  const quantity = Number(tail) / cfg.divisor;
  if (!Number.isFinite(quantity) || quantity <= 0) return null;

  return { isWeighted: true, raw, itemCodeRaw, itemCode, quantity };
}
