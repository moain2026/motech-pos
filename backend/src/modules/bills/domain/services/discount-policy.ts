import { Money } from '../../../../shared/domain/money';

/**
 * DiscountPolicy — re-implements head-discount proportional allocation from
 * PKG_POS_API_PKG.CLC_DISC_VAT_AMT_PRC (PACKAGES_ANALYSIS §1.4):
 *
 *   P_DIS_AMT_MST = (DISC_AMT_MST / (TOT_ITEM_PRICE - TOT_DISC)) * (I_PRICE - DIS_AMT_DTL)
 *
 * i.e. the bill-header discount (DISC_AMT_MST) is spread across lines in
 * proportion to each line's net-of-detail-discount value.
 */
export interface AllocInput {
  /** line gross (qty * price), excl VAT */
  lineGross: Money;
  /** line detail discount (qty * DIS_AMT_DTL) */
  lineDetailDiscount: Money;
}

export class DiscountPolicy {
  /**
   * Allocate a header discount over lines proportionally.
   * Returns the per-line head-discount amount (line total, not per-unit).
   * The last line absorbs any rounding remainder so the sum equals headDiscount.
   */
  static allocateHeadDiscount(lines: AllocInput[], headDiscount: Money): Money[] {
    if (headDiscount.isZero() || lines.length === 0) {
      return lines.map(() => Money.zero());
    }

    // Base = TOT_ITEM_PRICE - TOT_DISC (sum of net-of-detail-discount line values)
    const base = lines.reduce(
      (acc, l) => acc.add(l.lineGross.subtract(l.lineDetailDiscount)),
      Money.zero(),
    );
    if (base.isZero()) {
      return lines.map(() => Money.zero());
    }

    const baseNum = base.toNumber();
    const headNum = headDiscount.toNumber();

    const result: Money[] = [];
    let allocated = Money.zero();
    for (let i = 0; i < lines.length; i++) {
      if (i === lines.length - 1) {
        // last line gets the remainder to guarantee exact sum
        result.push(headDiscount.subtract(allocated));
      } else {
        const lineNet = lines[i].lineGross.subtract(lines[i].lineDetailDiscount);
        const share = (headNum / baseNum) * lineNet.toNumber();
        const m = Money.of(share);
        result.push(m);
        allocated = allocated.add(m);
      }
    }
    return result;
  }
}
