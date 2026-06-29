import { describe, expect, it } from 'vitest';
import { Bill } from '../../src/modules/bills/domain/entities/bill.entity';
import { BillLine, VatCalcType } from '../../src/modules/bills/domain/entities/bill-line.entity';

describe('Bill aggregate totals (UPDT_BILL_IN_SAV_PRC)', () => {
  it('no-tax no-discount: gross = SUM(qty*price), vat=0, disc=0', () => {
    const bill = new Bill({
      billNo: '1',
      lines: [
        new BillLine({ iCode: 'A', qty: 1, price: 50 }),
        new BillLine({ iCode: 'B', qty: 2, price: 100 }),
      ],
    });
    const t = bill.totals();
    expect(t.gross.toNumber()).toBe(250);
    expect(t.discount.toNumber()).toBe(0);
    expect(t.vat.toNumber()).toBe(0);
    expect(t.net.toNumber()).toBe(250);
  });

  it('with VAT type 2 + discounts aggregates correctly', () => {
    const bill = new Bill({
      billNo: '2',
      vatCalcType: VatCalcType.AFTER_DISCOUNT,
      lines: [
        new BillLine({ iCode: 'A', qty: 2, price: 100, discDtl: 10, vatPercent: 15 }),
      ],
    });
    const t = bill.totals();
    // gross 200, disc 20, net 180, vat = (100-10)*15% * 2 = 13.5*2 = 27
    expect(t.gross.toNumber()).toBe(200);
    expect(t.discount.toNumber()).toBe(20);
    expect(t.vat.toNumber()).toBe(27);
    expect(t.net.toNumber()).toBe(207);
  });
});
