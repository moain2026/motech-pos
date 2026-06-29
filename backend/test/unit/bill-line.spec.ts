import { describe, expect, it } from 'vitest';
import { BillLine, VatCalcType } from '../../src/modules/bills/domain/entities/bill-line.entity';

describe('BillLine VAT (CLC_ITM_TAX)', () => {
  it('type 1: VAT on full price, ignores discount', () => {
    const line = new BillLine({
      iCode: 'X',
      qty: 2,
      price: 100,
      discDtl: 10,
      vatPercent: 15,
    });
    // unit VAT = 100 * 15% = 15 ; line VAT = 15 * 2 = 30
    expect(line.unitVat(VatCalcType.ON_PRICE).toNumber()).toBe(15);
    expect(line.lineVat(VatCalcType.ON_PRICE).toNumber()).toBe(30);
  });

  it('type 2: VAT on price after discount', () => {
    const line = new BillLine({
      iCode: 'X',
      qty: 2,
      price: 100,
      discDtl: 10,
      discMst: 5,
      vatPercent: 15,
    });
    // net unit = 100 - (10+5) = 85 ; unit VAT = 85*15% = 12.75 ; line = 25.5
    expect(line.netUnitPrice().toNumber()).toBe(85);
    expect(line.unitVat(VatCalcType.AFTER_DISCOUNT).toNumber()).toBe(12.75);
    expect(line.lineVat(VatCalcType.AFTER_DISCOUNT).toNumber()).toBe(25.5);
  });

  it('no VAT when percent is 0', () => {
    const line = new BillLine({ iCode: 'X', qty: 3, price: 50 });
    expect(line.lineVat(VatCalcType.AFTER_DISCOUNT).toNumber()).toBe(0);
    expect(line.lineGross().toNumber()).toBe(150);
  });

  it('free qty taxed only when flag = 1', () => {
    const line = new BillLine({ iCode: 'X', qty: 2, price: 100, freeQty: 1, vatPercent: 10 });
    expect(line.lineVat(VatCalcType.ON_PRICE, 0).toNumber()).toBe(20); // 2 * 10
    expect(line.lineVat(VatCalcType.ON_PRICE, 1).toNumber()).toBe(30); // 3 * 10
  });

  it('rejects negative qty/price', () => {
    expect(() => new BillLine({ iCode: 'X', qty: -1, price: 10 })).toThrow();
    expect(() => new BillLine({ iCode: 'X', qty: 1, price: -10 })).toThrow();
  });
});
