import { describe, expect, it } from 'vitest';
import { CardsService } from '../../src/modules/cards/application/cards.service';
import {
  CardsRepository,
  CardTypeRow,
  CouponRow,
} from '../../src/modules/cards/domain/ports/cards-repository.port';

class FakeCards implements CardsRepository {
  lastLimit?: number;
  private readonly coupons: CouponRow[];
  constructor(coupons: CouponRow[] = []) {
    this.coupons = coupons;
  }
  listCardTypes(): Promise<CardTypeRow[]> {
    return Promise.resolve([
      {
        cardNo: 1,
        cardName: 'جوالي',
        cardEName: null,
        commissionPct: 0,
        cardType: 1,
        bankNo: 1,
      },
      {
        cardNo: 3,
        cardName: 'حاسب',
        cardEName: null,
        commissionPct: 1.5,
        cardType: 2,
        bankNo: 2,
      },
    ]);
  }
  listCoupons(limit: number): Promise<CouponRow[]> {
    this.lastLimit = limit;
    return Promise.resolve(this.coupons);
  }
}

describe('CardsService', () => {
  it('listCardTypes returns Arabic-named payment cards', async () => {
    const svc = new CardsService(new FakeCards());
    const rows = await svc.listCardTypes();
    expect(rows).toHaveLength(2);
    expect(rows[0].cardName).toBe('جوالي');
    expect(rows[1].commissionPct).toBe(1.5);
  });

  it('listCoupons forwards the limit and returns empty gracefully', async () => {
    const repo = new FakeCards();
    const svc = new CardsService(repo);
    const rows = await svc.listCoupons(100);
    expect(repo.lastLimit).toBe(100);
    expect(rows).toEqual([]);
  });

  it('listCoupons returns coupon headers when present', async () => {
    const repo = new FakeCards([
      {
        docNo: 5,
        docDate: '2026-06-01',
        couponTypeNo: 2,
        couponCount: 50,
        bookNo: 'BK-1',
        fromCoupon: '001',
        toCoupon: '050',
        description: 'صيف',
      },
    ]);
    const svc = new CardsService(repo);
    const rows = await svc.listCoupons(10);
    expect(rows[0].docNo).toBe(5);
    expect(rows[0].couponCount).toBe(50);
  });
});
