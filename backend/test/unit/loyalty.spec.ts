import { beforeEach, describe, expect, it } from 'vitest';
import { LoyaltyService } from '../../src/modules/loyalty/application/loyalty.service';
import {
  EarnedPointsBalance,
  InsertEarnInput,
  InsertRedeemInput,
  LoyaltyRepository,
  LoyaltySummary,
  PointsLedgerRow,
} from '../../src/modules/loyalty/domain/ports/loyalty-repository.port';
import { earnPoints, LoyaltyRule } from '../../src/modules/loyalty/domain/points-policy';

const RULE_1: LoyaltyRule = {
  calcType: 1,
  amt4Point: 100,
  pointCnt: 1,
  truncate: true,
  pointValue: 1,
};

describe('earnPoints (Get_Point_Cnt calc types)', () => {
  it('calc-type 1: TRUNC(amount / amt4Point)', () => {
    expect(earnPoints(23400, RULE_1).points).toBe(234);
    expect(earnPoints(23499, RULE_1).points).toBe(234); // truncated, not rounded
  });
  it('calc-type 2: TRUNC((amount / amt4Point) * pointCnt)', () => {
    const rule2: LoyaltyRule = { ...RULE_1, calcType: 2, pointCnt: 3 };
    expect(earnPoints(1000, rule2).points).toBe(30); // (1000/100)*3
  });
  it('no truncation keeps fractional points', () => {
    const rule: LoyaltyRule = { ...RULE_1, truncate: false };
    expect(earnPoints(150, rule).points).toBeCloseTo(1.5, 4);
  });
  it('zero/invalid amounts earn nothing', () => {
    expect(earnPoints(0, RULE_1).points).toBe(0);
    expect(earnPoints(50, { ...RULE_1, amt4Point: 0 }).points).toBe(0);
  });
});

class FakeRepo implements LoyaltyRepository {
  rows: PointsLedgerRow[] = [];
  rule: LoyaltyRule | null = RULE_1;
  activeRule(): Promise<LoyaltyRule | null> {
    return Promise.resolve(this.rule);
  }
  insertEarn(input: InsertEarnInput): Promise<PointsLedgerRow | null> {
    if (!(input.pointCnt > 0)) return Promise.resolve(null);
    // enforce UQ (billId, earn)
    const dup = this.rows.find(
      (r) => r.billId && r.billId === input.billId && r.trnsType === 1,
    );
    if (dup) return Promise.resolve(dup);
    const row: PointsLedgerRow = {
      id: `l${this.rows.length + 1}`,
      customerCode: input.customerCode,
      pointTypNo: input.pointTypNo,
      trnsType: 1,
      billId: input.billId,
      billNo: input.billNo,
      docAmt: input.docAmt,
      pointCnt: input.pointCnt,
      pointAmt: input.pointAmt,
      shiftId: input.shiftId,
      cashierNo: input.cashierNo,
      note: input.note,
      createdAt: new Date().toISOString(),
    };
    this.rows.push(row);
    return Promise.resolve(row);
  }
  earnedBalance(customerCode: string): Promise<EarnedPointsBalance> {
    const mine = this.rows.filter((r) => r.customerCode === customerCode);
    return Promise.resolve({
      customerCode,
      earnedPoints: mine.reduce((a, r) => a + r.pointCnt, 0),
      txnCount: mine.length,
    });
  }
  insertRedeem(input: InsertRedeemInput): Promise<PointsLedgerRow> {
    const dup = this.rows.find(
      (r) => r.billId && r.billId === input.billId && r.trnsType === 2,
    );
    if (dup) return Promise.resolve(dup);
    const row: PointsLedgerRow = {
      id: `l${this.rows.length + 1}`,
      customerCode: input.customerCode,
      pointTypNo: input.pointTypNo,
      trnsType: 2,
      billId: input.billId,
      billNo: input.billNo,
      docAmt: input.docAmt,
      pointCnt: -Math.abs(input.pointCnt),
      pointAmt: input.pointAmt,
      shiftId: input.shiftId,
      cashierNo: input.cashierNo,
      note: input.note,
      createdAt: new Date().toISOString(),
    };
    this.rows.push(row);
    return Promise.resolve(row);
  }
  ledger(customerCode: string, limit = 100): Promise<PointsLedgerRow[]> {
    // Newest first, like the Oracle repo (ORDER BY CREATED_AT DESC).
    const mine = this.rows
      .filter((r) => r.customerCode === customerCode)
      .slice()
      .reverse()
      .slice(0, limit);
    return Promise.resolve(mine);
  }
  summary(): Promise<LoyaltySummary> {
    const earns = this.rows.filter((r) => r.trnsType === 1);
    const redeems = this.rows.filter((r) => r.trnsType === 2);
    return Promise.resolve({
      totalEarned: earns.reduce((a, r) => a + r.pointCnt, 0),
      totalRedeemed: redeems.reduce((a, r) => a - r.pointCnt, 0),
      netOutstanding: this.rows.reduce((a, r) => a + r.pointCnt, 0),
      totalEarnedAmt: earns.reduce((a, r) => a + r.pointAmt, 0),
      totalRedeemedAmt: redeems.reduce((a, r) => a + r.pointAmt, 0),
      earnCount: earns.length,
      redeemCount: redeems.length,
      customerCount: new Set(this.rows.map((r) => r.customerCode)).size,
    });
  }
}

describe('LoyaltyService.earnOnSale', () => {
  let repo: FakeRepo;
  let svc: LoyaltyService;
  beforeEach(() => {
    repo = new FakeRepo();
    svc = new LoyaltyService(repo);
  });

  it('earns points on a customer sale', async () => {
    const m = await svc.earnOnSale({
      customerCode: 'C1',
      billId: 'b1',
      billNo: 'B1',
      billAmount: 23400,
    });
    expect(m?.pointCnt).toBe(234);
    const bal = await svc.earnedBalance('C1');
    expect(bal.earnedPoints).toBe(234);
  });

  it('is idempotent per bill (no double-earn on replay)', async () => {
    await svc.earnOnSale({ customerCode: 'C1', billId: 'b1', billNo: 'B1', billAmount: 1000 });
    await svc.earnOnSale({ customerCode: 'C1', billId: 'b1', billNo: 'B1', billAmount: 1000 });
    const bal = await svc.earnedBalance('C1');
    expect(bal.earnedPoints).toBe(10);
    expect(bal.txnCount).toBe(1);
  });

  it('earns nothing when no rule is configured', async () => {
    repo.rule = null;
    const m = await svc.earnOnSale({
      customerCode: 'C1',
      billId: 'b1',
      billNo: 'B1',
      billAmount: 1000,
    });
    expect(m).toBeNull();
  });

  it('never throws — a repo failure yields null (sale unaffected)', async () => {
    repo.insertEarn = () => Promise.reject(new Error('db down'));
    const m = await svc.earnOnSale({
      customerCode: 'C1',
      billId: 'b1',
      billNo: 'B1',
      billAmount: 1000,
    });
    expect(m).toBeNull();
  });
});

describe('LoyaltyService.customerLedger (POST021 movement history)', () => {
  let repo: FakeRepo;
  let svc: LoyaltyService;
  beforeEach(() => {
    repo = new FakeRepo();
    svc = new LoyaltyService(repo);
  });

  it('returns movements newest-first with an exact running balance', async () => {
    await svc.earnOnSale({ customerCode: 'C1', billId: 'b1', billNo: 'B1', billAmount: 10000 }); // +100
    await svc.earnOnSale({ customerCode: 'C1', billId: 'b2', billNo: 'B2', billAmount: 5000 }); // +50
    await svc.redeemForPayment({ customerCode: 'C1', billId: 'b3', billNo: 'B3', points: 30 }); // -30

    const view = await svc.customerLedger('C1', 100);
    expect(view.balance.earnedPoints).toBe(120);
    expect(view.entries.map((e) => e.kind)).toEqual(['REDEEM', 'EARN', 'EARN']);
    // Running balance after each movement, walking back in time: 120, 150, 100.
    expect(view.entries.map((e) => e.balanceAfter)).toEqual([120, 150, 100]);
    expect(view.entries[0].pointCnt).toBe(-30);
  });

  it('running balance stays exact when the page is limited', async () => {
    await svc.earnOnSale({ customerCode: 'C1', billId: 'b1', billNo: 'B1', billAmount: 10000 }); // +100
    await svc.earnOnSale({ customerCode: 'C1', billId: 'b2', billNo: 'B2', billAmount: 5000 }); // +50
    const view = await svc.customerLedger('C1', 1); // only newest row fetched
    expect(view.entries).toHaveLength(1);
    expect(view.entries[0].balanceAfter).toBe(150); // total includes older rows
  });

  it('empty ledger → zero balance, no entries', async () => {
    const view = await svc.customerLedger('NOBODY', 100);
    expect(view.balance.earnedPoints).toBe(0);
    expect(view.entries).toEqual([]);
  });
});

describe('LoyaltyService.summary (POST021 chain totals)', () => {
  it('aggregates granted vs redeemed across customers', async () => {
    const repo = new FakeRepo();
    const svc = new LoyaltyService(repo);
    await svc.earnOnSale({ customerCode: 'C1', billId: 'b1', billNo: 'B1', billAmount: 10000 }); // +100
    await svc.earnOnSale({ customerCode: 'C2', billId: 'b2', billNo: 'B2', billAmount: 20000 }); // +200
    await svc.redeemForPayment({ customerCode: 'C2', billId: 'b3', billNo: 'B3', points: 50 }); // -50

    const s = await svc.summary();
    expect(s.totalEarned).toBe(300);
    expect(s.totalRedeemed).toBe(50);
    expect(s.netOutstanding).toBe(250);
    expect(s.earnCount).toBe(2);
    expect(s.redeemCount).toBe(1);
    expect(s.customerCount).toBe(2);
  });
});
