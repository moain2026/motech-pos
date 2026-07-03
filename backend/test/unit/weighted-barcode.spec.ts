import { describe, expect, it } from 'vitest';
import {
  DEFAULT_WEIGHTED_CONFIG,
  parseWeightedBarcode,
} from '../../src/modules/catalog/domain/weighted-barcode';

describe('parseWeightedBarcode (Onyx IAS_PARA_POS: 02 / 12 / 5 / 1000)', () => {
  it('decodes a weighted barcode: item code + weight ÷ 1000', () => {
    // 02 + 90001 (item) + 01250 (1.250 kg)
    const d = parseWeightedBarcode('029000101250');
    expect(d).not.toBeNull();
    expect(d!.isWeighted).toBe(true);
    expect(d!.itemCode).toBe('90001');
    expect(d!.quantity).toBeCloseTo(1.25, 6);
    expect(d!.raw).toBe('029000101250');
  });

  it('strips leading zeros from the embedded item code', () => {
    // 02 + 00042 → item code "42", tail 00500 → 0.5 kg
    const d = parseWeightedBarcode('020004200500');
    expect(d!.itemCode).toBe('42');
    expect(d!.itemCodeRaw).toBe('00042');
    expect(d!.quantity).toBeCloseTo(0.5, 6);
  });

  it('returns null for non-weighted barcodes (wrong prefix/length/digits/zero qty)', () => {
    expect(parseWeightedBarcode('6281100210148')).toBeNull(); // normal EAN-13
    expect(parseWeightedBarcode('0290001')).toBeNull(); // too short
    expect(parseWeightedBarcode('129000101250')).toBeNull(); // prefix != 02
    expect(parseWeightedBarcode('02900A101250')).toBeNull(); // non-digit
    expect(parseWeightedBarcode('029000100000')).toBeNull(); // zero weight
  });

  it('honours a custom config (defensive against future PARA changes)', () => {
    const cfg = { ...DEFAULT_WEIGHTED_CONFIG, divisor: 100 };
    const d = parseWeightedBarcode('029000101250', cfg);
    expect(d!.quantity).toBeCloseTo(12.5, 6);
  });
});
