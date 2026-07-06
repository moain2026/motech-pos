import type {
  ScaleDefinitionRow,
  ScaleMode,
} from './ports/pos-config.port';

/**
 * Scale (weighing) barcode decoding driven by the configurable
 * SCALE_DEFINITIONS table (POSI005/006). Generalises the old hard-coded
 * weighted-barcode decoder: a store may define several schemes (a WEIGHT
 * scale that embeds quantity, and/or a PRICE scale that embeds the line
 * price) — each with its own prefix, length, item-code slot, value slot and
 * divisor. Mirrors the real Onyx IAS_PARA_POS WEIGHTED/LENGTHED columns.
 *
 * Pure & deterministic (no I/O) — the caller passes the enabled definitions
 * loaded from the repository.
 */
export interface DecodedScaleBarcode {
  isScale: true;
  raw: string;
  /** Which definition matched (name for diagnostics). */
  scaleName: string;
  mode: ScaleMode;
  /** Embedded item code with leading zeros stripped (matches I_CODE). */
  itemCode: string;
  itemCodeRaw: string;
  /** For WEIGHT scales: quantity in the item unit (tail ÷ divisor). */
  quantity: number | null;
  /** For PRICE scales: the line price in local currency (tail ÷ divisor). */
  price: number | null;
}

/** Try each enabled definition (sorted) and return the first that matches. */
export function decodeScaleBarcode(
  barcode: string,
  defs: readonly ScaleDefinitionRow[],
): DecodedScaleBarcode | null {
  const raw = (barcode ?? '').trim();
  if (raw.length === 0 || !/^\d+$/.test(raw)) return null;

  const enabled = defs
    .filter((d) => d.enabled)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);

  for (const d of enabled) {
    const decoded = decodeWith(raw, d);
    if (decoded) return decoded;
  }
  return null;
}

function decodeWith(
  raw: string,
  d: ScaleDefinitionRow,
): DecodedScaleBarcode | null {
  if (raw.length !== d.barcodeLength) return null;
  if (!raw.startsWith(d.prefix)) return null;

  const itemStart = d.itemCodeStart;
  const itemEnd = itemStart + d.itemCodeLen;
  if (itemEnd > raw.length) return null;

  const itemCodeRaw = raw.slice(itemStart, itemEnd);
  const itemCode = itemCodeRaw.replace(/^0+/, '') || '0';

  // Value slot: fixed length after the item code, or the rest of the barcode.
  const valueStart = itemEnd;
  const valueEnd =
    d.valueLen != null && d.valueLen > 0 ? valueStart + d.valueLen : raw.length;
  if (valueEnd > raw.length || valueStart >= valueEnd) return null;

  const tail = raw.slice(valueStart, valueEnd);
  const numeric = Number(tail) / d.divisor;
  if (!Number.isFinite(numeric) || numeric <= 0) return null;

  return {
    isScale: true,
    raw,
    scaleName: d.name,
    mode: d.mode,
    itemCode,
    itemCodeRaw,
    quantity: d.mode === 'WEIGHT' ? numeric : null,
    price: d.mode === 'PRICE' ? numeric : null,
  };
}
