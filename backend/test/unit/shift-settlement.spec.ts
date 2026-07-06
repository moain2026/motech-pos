import { beforeEach, describe, expect, it } from 'vitest';
import { ShiftsService } from '../../src/modules/shifts/application/shifts.service';
import {
  CloseShiftInput,
  CustodyMovement,
  CustodyTotals,
  InsertCustodyInput,
  InsertVarianceInput,
  OpenShiftInput,
  PaymentMethodBreakdown,
  PostedVariance,
  SaveShiftCountInput,
  SettleShiftInput,
  ShiftCashTotals,
  ShiftDenomination,
  ShiftRecord,
  ShiftWriteRepository,
} from '../../src/modules/shifts/domain/ports/shift-repository.port';
import {
  ShiftAlreadySettledError,
  ShiftCountRequiredError,
  ShiftNotClosedError,
} from '../../src/shared/errors/domain-error';

/**
 * POST013 — settlement by denominations, proven without a DB:
 * count sum = actual cash, over/short math, and settle-once immutability.
 */
class FakeShiftRepo implements ShiftWriteRepository {
  shift: ShiftRecord = {
    id: 's1',
    shiftNo: 1,
    shiftCode: null,
    cashierNo: 12,
    machineNo: 1,
    openingBalance: 1000,
    currency: 'YER',
    status: 'CLOSED',
    openedAt: new Date().toISOString(),
    closedAt: new Date().toISOString(),
    closingBalance: 8000,
    expectedCash: 8000,
    cashDifference: 0,
    closeNote: null,
    countedCash: null,
    settleDifference: null,
    settledAt: null,
    settledBy: null,
    settleNote: null,
  };
  denoms: ShiftDenomination[] = [];
  totals: ShiftCashTotals = {
    billCount: 3,
    netSalesTotal: 7000,
    cashTotal: 7000,
    cardTotal: 0,
    creditTotal: 0,
  };

  findOpenByCashier(): Promise<ShiftRecord | null> {
    return Promise.resolve(this.shift.status === 'OPEN' ? this.shift : null);
  }
  findById(id: string): Promise<ShiftRecord | null> {
    return Promise.resolve(id === this.shift.id ? this.shift : null);
  }
  open(_i: OpenShiftInput): Promise<ShiftRecord> {
    return Promise.resolve(this.shift);
  }
  close(_i: CloseShiftInput): Promise<ShiftRecord> {
    return Promise.resolve(this.shift);
  }
  cashTotals(): Promise<ShiftCashTotals> {
    return Promise.resolve(this.totals);
  }
  paymentBreakdown(): Promise<PaymentMethodBreakdown[]> {
    return Promise.resolve([]);
  }
  saveCount(input: SaveShiftCountInput): Promise<ShiftDenomination[]> {
    this.denoms = input.denominations.map((d) => ({
      currency: input.currency,
      value: d.value,
      count: d.count,
      amount: Math.round(d.value * d.count * 10000) / 10000,
    }));
    return Promise.resolve(this.denoms);
  }
  findDenominations(): Promise<ShiftDenomination[]> {
    return Promise.resolve(this.denoms);
  }
  settle(input: SettleShiftInput): Promise<ShiftRecord> {
    if (this.shift.status !== 'CLOSED') {
      throw new ShiftAlreadySettledError('already settled', {});
    }
    this.shift = {
      ...this.shift,
      status: 'SETTLED',
      countedCash: input.countedCash,
      expectedCash: input.expectedCash,
      settleDifference: input.difference,
      settledAt: new Date().toISOString(),
      settledBy: input.settledBy ?? null,
      settleNote: input.note ?? null,
    };
    return Promise.resolve(this.shift);
  }
  insertCustody(_i: InsertCustodyInput): Promise<CustodyMovement> {
    return Promise.reject(new Error('not used'));
  }
  findCustodyByIdempotencyKey(): Promise<CustodyMovement | null> {
    return Promise.resolve(null);
  }
  listCustody(): Promise<CustodyMovement[]> {
    return Promise.resolve([]);
  }
  custodyTotals(): Promise<CustodyTotals> {
    return Promise.resolve({
      deposits: 0,
      withdrawals: 0,
      net: 0,
      depositCount: 0,
      withdrawCount: 0,
    });
  }
  variance: PostedVariance | null = null;
  insertVariance(input: InsertVarianceInput): Promise<PostedVariance> {
    if (this.variance) return Promise.resolve(this.variance);
    this.variance = {
      id: 'var1',
      varianceNo: 1,
      shiftId: input.shiftId,
      cashierNo: input.cashierNo,
      currency: input.currency,
      expectedCash: input.expectedCash,
      countedCash: input.countedCash,
      difference: input.difference,
      kind: input.kind,
      note: input.note,
      postedBy: input.postedBy,
      postedAt: new Date().toISOString(),
    };
    return Promise.resolve(this.variance);
  }
  findVariance(): Promise<PostedVariance | null> {
    return Promise.resolve(this.variance);
  }
}

function makeService(repo: FakeShiftRepo): ShiftsService {
  const legacy = { findOpenByCashier: () => Promise.resolve(null) };
  return new ShiftsService(legacy, repo);
}

describe('ShiftsService — POST013 settlement by denominations', () => {
  let repo: FakeShiftRepo;
  let svc: ShiftsService;

  beforeEach(() => {
    repo = new FakeShiftRepo();
    svc = makeService(repo);
  });

  it('saveCount sums denominations into countedCash (1000×5+500×10+250×8+100×20=14000)', async () => {
    const res = await svc.saveCount('s1', {
      denominations: [
        { value: 1000, count: 5 },
        { value: 500, count: 10 },
        { value: 250, count: 8 },
        { value: 100, count: 20 },
      ],
    });
    expect(res.countedCash).toBe(14000);
    expect(res.denominations).toHaveLength(4);
    // Defaults to the shift currency.
    expect(res.denominations[0].currency).toBe('YER');
  });

  it('settle computes over/short from the counted denominations and freezes SETTLED', async () => {
    // expected = opening 1000 + cash sales 7000 = 8000; counted 7950 → SHORT 50.
    await svc.saveCount('s1', {
      denominations: [
        { value: 1000, count: 7 },
        { value: 500, count: 1 },
        { value: 100, count: 4 },
        { value: 50, count: 1 },
      ],
    });
    const s = await svc.settle('s1', { settledBy: 12, note: 'EOD' });
    expect(s.status).toBe('SETTLED');
    expect(s.expectedCash).toBe(8000);
    expect(s.countedCash).toBe(7950);
    expect(s.difference).toBe(-50);
    expect(s.overShort).toBe('SHORT');
    expect(s.settledBy).toBe(12);

    // Immutable: cannot settle twice, cannot re-count.
    await expect(svc.settle('s1')).rejects.toBeInstanceOf(
      ShiftAlreadySettledError,
    );
    await expect(
      svc.saveCount('s1', { denominations: [{ value: 1000, count: 1 }] }),
    ).rejects.toBeInstanceOf(ShiftAlreadySettledError);

    // Settlement view returns the frozen approved figures.
    const view = await svc.settlement('s1');
    expect(view.status).toBe('SETTLED');
    expect(view.countedCash).toBe(7950);
    expect(view.overShort).toBe('SHORT');
    expect(view.denominations).toHaveLength(4);
  });

  it('settle guards: shift must be CLOSED and must have a saved count', async () => {
    repo.shift.status = 'OPEN';
    await expect(svc.settle('s1')).rejects.toBeInstanceOf(ShiftNotClosedError);

    repo.shift.status = 'CLOSED';
    await expect(svc.settle('s1')).rejects.toBeInstanceOf(
      ShiftCountRequiredError,
    );
  });
});
