import { describe, expect, it } from 'vitest';
import { decodeScaleBarcode } from '../../src/modules/settings/domain/scale-barcode';
import type { ScaleDefinitionRow } from '../../src/modules/settings/domain/ports/pos-config.port';

const WEIGHT: ScaleDefinitionRow = {
  id: 'w',
  name: 'ميزان الوزن',
  prefix: '02',
  barcodeLength: 12,
  itemCodeStart: 2,
  itemCodeLen: 5,
  valueLen: null,
  divisor: 1000,
  mode: 'WEIGHT',
  enabled: true,
  sortOrder: 10,
};

const PRICE: ScaleDefinitionRow = {
  id: 'p',
  name: 'ميزان السعر',
  prefix: '21',
  barcodeLength: 13,
  itemCodeStart: 2,
  itemCodeLen: 5,
  valueLen: 6,
  divisor: 100,
  mode: 'PRICE',
  enabled: true,
  sortOrder: 5,
};

describe('decodeScaleBarcode', () => {
  it('decodes an Onyx WEIGHTED barcode → item code + kg', () => {
    const d = decodeScaleBarcode('020000102500', [WEIGHT]);
    expect(d).not.toBeNull();
    expect(d!.mode).toBe('WEIGHT');
    expect(d!.itemCode).toBe('1');
    expect(d!.itemCodeRaw).toBe('00001');
    expect(d!.quantity).toBe(2.5);
    expect(d!.price).toBeNull();
  });

  it('strips leading zeros but keeps a genuine zero code', () => {
    const d = decodeScaleBarcode('029000102500', [WEIGHT]);
    expect(d!.itemCode).toBe('90001');
  });

  it('decodes a PRICE scale → item code + line price', () => {
    const d = decodeScaleBarcode('2100005001500', [PRICE]);
    expect(d!.mode).toBe('PRICE');
    expect(d!.itemCode).toBe('5');
    expect(d!.price).toBe(15);
    expect(d!.quantity).toBeNull();
  });

  it('returns null for the wrong length', () => {
    expect(decodeScaleBarcode('0200001025', [WEIGHT])).toBeNull();
  });

  it('returns null for the wrong prefix', () => {
    expect(decodeScaleBarcode('990000102500', [WEIGHT])).toBeNull();
  });

  it('returns null for a non-numeric barcode', () => {
    expect(decodeScaleBarcode('02ABCDE02500', [WEIGHT])).toBeNull();
  });

  it('returns null when the value is zero / non-positive', () => {
    expect(decodeScaleBarcode('020000100000', [WEIGHT])).toBeNull();
  });

  it('skips disabled definitions', () => {
    const disabled = { ...WEIGHT, enabled: false };
    expect(decodeScaleBarcode('020000102500', [disabled])).toBeNull();
  });

  it('tries definitions in sortOrder and returns the first match', () => {
    // Both could match a 13-digit "21…" only for PRICE; WEIGHT needs 12 & "02".
    const d = decodeScaleBarcode('2100005001500', [WEIGHT, PRICE]);
    expect(d!.mode).toBe('PRICE');
  });

  it('honours a fixed value length (ignores trailing check digit)', () => {
    // prefix 20, len 13, item 5, value 5, divisor 1000 → last digit ignored
    const def: ScaleDefinitionRow = {
      ...WEIGHT,
      id: 'x',
      prefix: '20',
      barcodeLength: 13,
      itemCodeLen: 5,
      valueLen: 5,
      divisor: 1000,
    };
    // 20 00007 01234 9  → item 7, weight 1.234 (the 9 is outside the slot)
    const d = decodeScaleBarcode('2000007012349', [def]);
    expect(d!.itemCode).toBe('7');
    expect(d!.quantity).toBe(1.234);
  });
});
