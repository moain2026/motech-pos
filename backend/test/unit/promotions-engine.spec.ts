import { describe, expect, it } from 'vitest';
import { PromotionsEngine } from '../../src/modules/promotions/domain/promotions-engine';
import {
  PromotionMaster,
} from '../../src/modules/promotions/domain/ports/promotions-repository.port';

const engine = new PromotionsEngine();

/** Helper to build a minimal active promo master. */
function promo(over: Partial<PromotionMaster>): PromotionMaster {
  return {
    quotNo: 1,
    quotSer: 1,
    prmType: 2,
    prmMethod: 1,
    fromDate: '2026-01-01',
    toDate: '2026-12-31',
    fromTime: null,
    toTime: null,
    desc: 'promo',
    byInvoiceAmount: false,
    freeQtyAsDiscount: false,
    lines: [],
    ...over,
  };
}

describe('PromotionsEngine (POST001 GNR_QTN_PRM_PKG)', () => {
  it('quantity tier: charges LEV_PRICE as the promo unit price when < base', () => {
    // Buy 2..50 of item at base 330 → promo price 300 (discount 30/unit).
    const p = promo({
      quotNo: 10,
      prmType: 2,
      lines: [
        {
          quotNo: 10,
          rcrdNo: 1,
          iCode: 'A',
          itemUnit: null,
          fQty: 2,
          tQty: 50,
          fAmt: null,
          tAmt: null,
          discType: null,
          discAmtPer: null,
          levPrice: 300,
          qtItemCode: null,
          qtItemUnit: null,
          freeQty: null,
          compQty: null,
          qtQty: null,
        },
      ],
    });
    const res = engine.evaluate(
      [p],
      [{ itemCode: 'A', qty: 3, unitPrice: 330 }],
      990,
    );
    expect(res.lineDiscounts).toHaveLength(1);
    expect(res.lineDiscounts[0].discountAmount).toBe(90); // (330-300)*3
    expect(res.lineDiscounts[0].kind).toBe('tier-price');
    expect(res.totalDiscount).toBe(90);
    expect(res.appliedPromoNos).toEqual([10]);
  });

  it('quantity tier: no discount when qty is below the F_QTY threshold', () => {
    const p = promo({
      lines: [
        {
          quotNo: 1,
          rcrdNo: 1,
          iCode: 'A',
          itemUnit: null,
          fQty: 5,
          tQty: 50,
          fAmt: null,
          tAmt: null,
          discType: null,
          discAmtPer: null,
          levPrice: 300,
          qtItemCode: null,
          qtItemUnit: null,
          freeQty: null,
          compQty: null,
          qtQty: null,
        },
      ],
    });
    const res = engine.evaluate([p], [{ itemCode: 'A', qty: 2, unitPrice: 330 }], 660);
    expect(res.lineDiscounts).toHaveLength(0);
    expect(res.totalDiscount).toBe(0);
  });

  it('percentage discount tier (DISC_TYPE=1)', () => {
    const p = promo({
      lines: [
        {
          quotNo: 2,
          rcrdNo: 1,
          iCode: 'B',
          itemUnit: null,
          fQty: 1,
          tQty: null,
          fAmt: null,
          tAmt: null,
          discType: 1,
          discAmtPer: 10, // 10%
          levPrice: null,
          qtItemCode: null,
          qtItemUnit: null,
          freeQty: null,
          compQty: null,
          qtQty: null,
        },
      ],
    });
    const res = engine.evaluate([p], [{ itemCode: 'B', qty: 4, unitPrice: 100 }], 400);
    expect(res.lineDiscounts[0].discountAmount).toBe(40); // 10% of 400
    expect(res.lineDiscounts[0].kind).toBe('tier-discount');
  });

  it('fixed per-unit discount (DISC_TYPE=2)', () => {
    const p = promo({
      lines: [
        {
          quotNo: 3,
          rcrdNo: 1,
          iCode: 'C',
          itemUnit: null,
          fQty: null,
          tQty: null,
          fAmt: null,
          tAmt: null,
          discType: 2,
          discAmtPer: 5, // 5 per unit
          levPrice: null,
          qtItemCode: null,
          qtItemUnit: null,
          freeQty: null,
          compQty: null,
          qtQty: null,
        },
      ],
    });
    const res = engine.evaluate([p], [{ itemCode: 'C', qty: 3, unitPrice: 100 }], 300);
    expect(res.lineDiscounts[0].discountAmount).toBe(15); // 5*3
  });

  it('buy X get Y free: same item (buy 4 get 1 free), 2 triggers', () => {
    const p = promo({
      quotNo: 20,
      prmType: 1,
      lines: [
        {
          quotNo: 20,
          rcrdNo: 1,
          iCode: 'D',
          itemUnit: 'حبة',
          fQty: null,
          tQty: null,
          fAmt: null,
          tAmt: null,
          discType: null,
          discAmtPer: null,
          levPrice: null,
          qtItemCode: null,
          qtItemUnit: null,
          freeQty: 1,
          compQty: 4,
          qtQty: null,
        },
      ],
    });
    const res = engine.evaluate([p], [{ itemCode: 'D', qty: 9, unitPrice: 100 }], 900);
    expect(res.freeItems).toHaveLength(1);
    expect(res.freeItems[0].itemCode).toBe('D');
    expect(res.freeItems[0].sameItem).toBe(true);
    expect(res.freeItems[0].freeQty).toBe(2); // floor(9/4)=2 triggers * 1
  });

  it('buy X get Y free: bonus is a DIFFERENT item (QT_I_CODE)', () => {
    const p = promo({
      prmType: 1,
      lines: [
        {
          quotNo: 21,
          rcrdNo: 1,
          iCode: 'E',
          itemUnit: null,
          fQty: null,
          tQty: null,
          fAmt: null,
          tAmt: null,
          discType: null,
          discAmtPer: null,
          levPrice: null,
          qtItemCode: 'GIFT',
          qtItemUnit: 'حبة',
          freeQty: 1,
          compQty: 3,
          qtQty: null,
        },
      ],
    });
    const res = engine.evaluate([p], [{ itemCode: 'E', qty: 6, unitPrice: 50 }], 300);
    expect(res.freeItems[0].itemCode).toBe('GIFT');
    expect(res.freeItems[0].sameItem).toBe(false);
    expect(res.freeItems[0].freeQty).toBe(2);
  });

  it('free-qty-as-discount: expresses the bonus as a discount on the line', () => {
    const p = promo({
      prmType: 1,
      freeQtyAsDiscount: true,
      lines: [
        {
          quotNo: 22,
          rcrdNo: 1,
          iCode: 'F',
          itemUnit: null,
          fQty: null,
          tQty: null,
          fAmt: null,
          tAmt: null,
          discType: null,
          discAmtPer: null,
          levPrice: null,
          qtItemCode: null,
          qtItemUnit: null,
          freeQty: 1,
          compQty: 4,
          qtQty: null,
        },
      ],
    });
    const res = engine.evaluate([p], [{ itemCode: 'F', qty: 8, unitPrice: 100 }], 800);
    expect(res.freeItems).toHaveLength(0);
    expect(res.lineDiscounts[0].kind).toBe('free-as-discount');
    expect(res.lineDiscounts[0].discountAmount).toBe(200); // 2 free * 100
  });

  it('invoice-amount discount: 5% when bill gross within [1000,∞)', () => {
    const p = promo({
      byInvoiceAmount: true,
      lines: [
        {
          quotNo: 30,
          rcrdNo: 1,
          iCode: null,
          itemUnit: null,
          fQty: null,
          tQty: null,
          fAmt: 1000,
          tAmt: null,
          discType: 1,
          discAmtPer: 5,
          levPrice: null,
          qtItemCode: null,
          qtItemUnit: null,
          freeQty: null,
          compQty: null,
          qtQty: null,
        },
      ],
    });
    const res = engine.evaluate(
      [p],
      [{ itemCode: 'X', qty: 1, unitPrice: 2000 }],
      2000,
    );
    expect(res.lineDiscounts[0].kind).toBe('invoice-discount');
    expect(res.lineDiscounts[0].discountAmount).toBe(100); // 5% of 2000
  });

  it('does not stack: keeps the single best discount per item', () => {
    const p1 = promo({
      quotNo: 40,
      lines: [
        {
          quotNo: 40,
          rcrdNo: 1,
          iCode: 'G',
          itemUnit: null,
          fQty: 1,
          tQty: null,
          fAmt: null,
          tAmt: null,
          discType: 1,
          discAmtPer: 5,
          levPrice: null,
          qtItemCode: null,
          qtItemUnit: null,
          freeQty: null,
          compQty: null,
          qtQty: null,
        },
      ],
    });
    const p2 = promo({
      quotNo: 41,
      lines: [
        {
          quotNo: 41,
          rcrdNo: 1,
          iCode: 'G',
          itemUnit: null,
          fQty: 1,
          tQty: null,
          fAmt: null,
          tAmt: null,
          discType: 1,
          discAmtPer: 20,
          levPrice: null,
          qtItemCode: null,
          qtItemUnit: null,
          freeQty: null,
          compQty: null,
          qtQty: null,
        },
      ],
    });
    const res = engine.evaluate([p1, p2], [{ itemCode: 'G', qty: 1, unitPrice: 100 }], 100);
    expect(res.lineDiscounts).toHaveLength(1);
    expect(res.lineDiscounts[0].discountAmount).toBe(20); // best (20%) wins
  });

  it('empty when no promos or no matching items', () => {
    const res = engine.evaluate([], [{ itemCode: 'Z', qty: 1, unitPrice: 10 }], 10);
    expect(res.totalDiscount).toBe(0);
    expect(res.freeItems).toHaveLength(0);
    expect(res.appliedPromoNos).toHaveLength(0);
  });
});
