import { beforeEach, describe, expect, it } from 'vitest';
import { LoyaltyService } from '../../src/modules/loyalty/application/loyalty.service';
import {
  EarnedPointsBalance,
  InsertEarnInput,
  InsertRedeemInput,
  LoyaltyProgramRow,
  LoyaltyRepository,
  LoyaltySummary,
  PointsLedgerRow,
  UpsertLoyaltyProgramInput,
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
  it('POSI008 minBillAmt floor: bills below the minimum earn nothing', () => {
    const rule: LoyaltyRule = { ...RULE_1, minBillAmt: 5000 };
    expect(earnPoints(4999, rule).points).toBe(0);
    expect(earnPoints(5000, rule).points).toBe(50);
  });
  it('POSI008 maxPointsPerBill cap: points are capped per bill', () => {
    const rule: LoyaltyRule = { ...RULE_1, maxPointsPerBill: 10 };
    expect(earnPoints(23400, rule).points).toBe(10); // would be 234, capped to 10
    expect(earnPoints(500, rule).points).toBe(5); // below cap, unchanged
  });
});

class FakeRepo implements LoyaltyRepository {
  rows: PointsLedgerRow[] = [];
  rule: LoyaltyRule | null = RULE_1;
  programs: LoyaltyProgramRow[] = [];
  private pid = 0;
  activeRule(pointTypNo = 1): Promise<LoyaltyRule | null> {
    // Mirror the Oracle repo: an active program supersedes the config rule.
    const p = this.programs.find(
      (x) => x.pointTypNo === pointTypNo && x.active,
    );
    if (p) {
      return Promise.resolve({
        calcType: p.calcType,
        amt4Point: p.amt4Point,
        pointCnt: p.pointCnt,
        truncate: p.truncate,
        pointValue: p.pointValue,
        minBillAmt: p.minBillAmt,
        maxPointsPerBill: p.maxPointsPerBill,
      });
    }
    return Promise.resolve(this.rule);
  }
  listPrograms(): Promise<LoyaltyProgramRow[]> {
    return Promise.resolve(this.programs.slice().reverse());
  }
  findProgramById(id: string): Promise<LoyaltyProgramRow | null> {
    return Promise.resolve(this.programs.find((p) => p.id === id) ?? null);
  }
  activeProgram(pointTypNo: number): Promise<LoyaltyProgramRow | null> {
    return Promise.resolve(
      this.programs.find((p) => p.pointTypNo === pointTypNo && p.active) ?? null,
    );
  }
  insertProgram(input: UpsertLoyaltyProgramInput): Promise<LoyaltyProgramRow> {
    if (
      input.active &&
      this.programs.some((p) => p.pointTypNo === input.pointTypNo && p.active)
    ) {
      const e = new Error('ORA-00001') as Error & { errorNum: number };
      e.errorNum = 1;
      return Promise.reject(e);
    }
    const row: LoyaltyProgramRow = {
      id: `p${++this.pid}`,
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.programs.push(row);
    return Promise.resolve(row);
  }
  updateProgram(
    id: string,
    input: UpsertLoyaltyProgramInput,
  ): Promise<LoyaltyProgramRow | null> {
    const idx = this.programs.findIndex((p) => p.id === id);
    if (idx < 0) return Promise.resolve(null);
    const row: LoyaltyProgramRow = {
      ...this.programs[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    this.programs[idx] = row;
    return Promise.resolve(row);
  }
  deleteProgram(id: string): Promise<boolean> {
    const before = this.programs.length;
    this.programs = this.programs.filter((p) => p.id !== id);
    return Promise.resolve(this.programs.length < before);
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

describe('LoyaltyService loyalty programs CRUD (POSI008)', () => {
  let repo: FakeRepo;
  let svc: LoyaltyService;
  const base = {
    name: 'برنامج الذهبي',
    pointTypNo: 1,
    calcType: 1 as const,
    amt4Point: 100,
    pointCnt: 1,
    truncate: true,
    pointValue: 1,
    minBillAmt: 0,
    maxPointsPerBill: 0,
    startDate: null,
    endDate: null,
    active: true,
    createdBy: 3,
  };
  beforeEach(() => {
    repo = new FakeRepo();
    svc = new LoyaltyService(repo);
  });

  it('creates, lists, gets, updates, deletes a program', async () => {
    const created = await svc.createProgram(base);
    expect(created.name).toBe('برنامج الذهبي');
    const list = await svc.listPrograms();
    expect(list).toHaveLength(1);
    const got = await svc.getProgram(created.id);
    expect(got.id).toBe(created.id);
    const updated = await svc.updateProgram(created.id, {
      ...base,
      amt4Point: 50,
    });
    expect(updated.amt4Point).toBe(50);
    await svc.deleteProgram(created.id);
    await expect(svc.listPrograms()).resolves.toHaveLength(0);
  });

  it('rejects a second ACTIVE program for the same point type (409)', async () => {
    await svc.createProgram(base);
    await expect(svc.createProgram({ ...base, name: 'ثاني' })).rejects.toThrow(
      /already exists/i,
    );
  });

  it('validates payload (422 on bad calcType / amounts / dates)', async () => {
    await expect(
      svc.createProgram({ ...base, calcType: 3 as unknown as 1 }),
    ).rejects.toThrow(/calcType/i);
    await expect(svc.createProgram({ ...base, amt4Point: 0 })).rejects.toThrow(
      /amt4Point/i,
    );
    await expect(
      svc.createProgram({ ...base, startDate: '2026-12-01', endDate: '2026-01-01' }),
    ).rejects.toThrow(/endDate/i);
  });

  it('getProgram / deleteProgram throw 404 for unknown id', async () => {
    await expect(svc.getProgram('nope')).rejects.toThrow(/not found/i);
    await expect(svc.deleteProgram('nope')).rejects.toThrow(/not found/i);
  });

  it('an active program supersedes the config rule in earnOnSale', async () => {
    // program: 1 point per 50 riyals (double the default 100).
    await svc.createProgram({ ...base, amt4Point: 50 });
    const row = await svc.earnOnSale({
      customerCode: 'C1',
      billId: 'b1',
      billNo: 'B1',
      billAmount: 1000,
    });
    expect(row?.pointCnt).toBe(20); // 1000/50 = 20 (not 10 from the config rule)
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
