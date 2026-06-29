import { describe, expect, it } from 'vitest';
import { Money } from '../../src/shared/domain/money';
import { DiscountPolicy } from '../../src/modules/bills/domain/services/discount-policy';

describe('DiscountPolicy (CLC_DISC_VAT_AMT_PRC head-discount allocation)', () => {
  it('allocates head discount proportionally', () => {
    // two lines: 100 and 300 (no detail disc) -> base = 400
    // head discount 40 -> line1 gets 10, line2 gets 30
    const lines = [
      { lineGross: Money.of(100), lineDetailDiscount: Money.zero() },
      { lineGross: Money.of(300), lineDetailDiscount: Money.zero() },
    ];
    const out = DiscountPolicy.allocateHeadDiscount(lines, Money.of(40));
    expect(out[0].toNumber()).toBe(10);
    expect(out[1].toNumber()).toBe(30);
  });

  it('sum of allocations equals head discount exactly (remainder on last line)', () => {
    const lines = [
      { lineGross: Money.of(33.33), lineDetailDiscount: Money.zero() },
      { lineGross: Money.of(33.33), lineDetailDiscount: Money.zero() },
      { lineGross: Money.of(33.34), lineDetailDiscount: Money.zero() },
    ];
    const head = Money.of(10);
    const out = DiscountPolicy.allocateHeadDiscount(lines, head);
    const total = out.reduce((a, m) => a.add(m), Money.zero());
    expect(total.toNumber()).toBe(10);
  });

  it('zero head discount yields zeros', () => {
    const lines = [{ lineGross: Money.of(100), lineDetailDiscount: Money.zero() }];
    const out = DiscountPolicy.allocateHeadDiscount(lines, Money.zero());
    expect(out[0].isZero()).toBe(true);
  });

  it('subtracts detail discount from base', () => {
    // line1 net = 100-20=80, line2 net = 100 -> base 180; head 18
    // line1 = 18/180*80 = 8 ; line2 = remainder 10
    const lines = [
      { lineGross: Money.of(100), lineDetailDiscount: Money.of(20) },
      { lineGross: Money.of(100), lineDetailDiscount: Money.zero() },
    ];
    const out = DiscountPolicy.allocateHeadDiscount(lines, Money.of(18));
    expect(out[0].toNumber()).toBe(8);
    expect(out[1].toNumber()).toBe(10);
  });
});
