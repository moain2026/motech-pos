import { beforeEach, describe, expect, it } from 'vitest';
import { LoyaltyService } from '../../src/modules/loyalty/application/loyalty.service';
import {
  EarnedPointsBalance,
  InsertEarnInput,
  LoyaltyRepository,
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
  ledger(customerCode: string): Promise<PointsLedgerRow[]> {
    return Promise.resolve(this.rows.filter((r) => r.customerCode === customerCode));
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
