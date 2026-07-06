import { beforeEach, describe, expect, it } from 'vitest';
import { ShiftsService } from '../../src/modules/shifts/application/shifts.service';
import {
  CloseShiftInput,
  CustodyIdempotencyUniqueViolation,
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
  CustodyExceedsDrawerError,
  ShiftNotOpenError,
} from '../../src/shared/errors/domain-error';

/** In-memory shift repo covering custody (POST014) + variance (POST015). */
class FakeRepo implements ShiftWriteRepository {
  shift: ShiftRecord = {
    id: 's1',
    shiftNo: 1,
    shiftCode: null,
    cashierNo: 91,
    machineNo: 1,
    openingBalance: 1000,
    currency: 'YER',
    status: 'OPEN',
    openedAt: new Date().toISOString(),
    closedAt: null,
    closingBalance: null,
    expectedCash: null,
    cashDifference: null,
    closeNote: null,
    countedCash: null,
    settleDifference: null,
    settledAt: null,
    settledBy: null,
    settleNote: null,
  };
  totals: ShiftCashTotals = {
    billCount: 1,
    netSalesTotal: 5000,
    cashTotal: 5000,
    cardTotal: 0,
    creditTotal: 0,
  };
  custody: CustodyMovement[] = [];
  variance: PostedVariance | null = null;
  private n = 0;

  findOpenByCashier(): Promise<ShiftRecord | null> {
    return Promise.resolve(this.shift.status === 'OPEN' ? this.shift : null);
  }
  findById(id: string): Promise<ShiftRecord | null> {
    return Promise.resolve(id === this.shift.id ? this.shift : null);
  }
  open(_i: OpenShiftInput): Promise<ShiftRecord> {
    return Promise.resolve(this.shift);
  }
  close(input: CloseShiftInput): Promise<ShiftRecord> {
    const expected =
      this.shift.openingBalance +
      this.totals.cashTotal +
      (input.cashReceipts ?? 0) -
      (input.cashExpenses ?? 0);
    const closing = input.closingBalance ?? expected;
    this.shift = {
      ...this.shift,
      status: 'CLOSED',
      closingBalance: closing,
      expectedCash: expected,
      cashDifference: closing - expected,
    };
    return Promise.resolve(this.shift);
  }
  cashTotals(): Promise<ShiftCashTotals> {
    return Promise.resolve(this.totals);
  }
  paymentBreakdown(): Promise<PaymentMethodBreakdown[]> {
    return Promise.resolve([]);
  }
  saveCount(input: SaveShiftCountInput): Promise<ShiftDenomination[]> {
    return Promise.resolve(
      input.denominations.map((d) => ({
        currency: input.currency,
        value: d.value,
        count: d.count,
        amount: d.value * d.count,
      })),
    );
  }
  findDenominations(): Promise<ShiftDenomination[]> {
    return Promise.resolve([
      { currency: 'YER', value: 1000, count: 6, amount: 6000 },
    ]);
  }
  settle(input: SettleShiftInput): Promise<ShiftRecord> {
    this.shift = {
      ...this.shift,
      status: 'SETTLED',
      countedCash: input.countedCash,
      expectedCash: input.expectedCash,
      settleDifference: input.difference,
      settledBy: input.settledBy ?? null,
    };
    return Promise.resolve(this.shift);
  }
  insertCustody(input: InsertCustodyInput): Promise<CustodyMovement> {
    if (this.custody.some((c) => c.idempotencyKey === input.idempotencyKey)) {
      return Promise.reject(new CustodyIdempotencyUniqueViolation());
    }
    this.n += 1;
    const m: CustodyMovement = {
      id: `c${this.n}`,
      custodyNo: this.n,
      shiftId: input.shiftId,
      cashierNo: input.cashierNo,
      machineNo: input.machineNo,
      direction: input.direction,
      amount: input.amount,
      currency: input.currency,
      rate: input.rate,
      amountInShift: input.amountInShift,
      reason: input.reason,
      status: 'POSTED',
      idempotencyKey: input.idempotencyKey,
      clientOpId: input.clientOpId,
      createdBy: input.createdBy,
      issuedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.custody.push(m);
    return Promise.resolve(m);
  }
  findCustodyByIdempotencyKey(key: string): Promise<CustodyMovement | null> {
    return Promise.resolve(
      this.custody.find((c) => c.idempotencyKey === key) ?? null,
    );
  }
  listCustody(): Promise<CustodyMovement[]> {
    return Promise.resolve(this.custody);
  }
  custodyTotals(): Promise<CustodyTotals> {
    const deposits = this.custody
      .filter((c) => c.direction === 'DEPOSIT')
      .reduce((a, c) => a + c.amountInShift, 0);
    const withdrawals = this.custody
      .filter((c) => c.direction === 'WITHDRAW')
      .reduce((a, c) => a + c.amountInShift, 0);
    return Promise.resolve({
      deposits,
      withdrawals,
      net: deposits - withdrawals,
      depositCount: this.custody.filter((c) => c.direction === 'DEPOSIT').length,
      withdrawCount: this.custody.filter((c) => c.direction === 'WITHDRAW')
        .length,
    });
  }
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

const legacy = { findOpenByCashier: () => Promise.resolve(null) };

describe('ShiftsService — POST014 cashier custody', () => {
  let repo: FakeRepo;
  let svc: ShiftsService;
  beforeEach(() => {
    repo = new FakeRepo();
    svc = new ShiftsService(legacy, repo);
  });

  it('records a deposit and folds it into expected cash', async () => {
    const { movement } = await svc.recordCustody({
      shiftId: 's1',
      direction: 'DEPOSIT',
      amount: 2000,
      idempotencyKey: 'k1',
    });
    expect(movement.direction).toBe('DEPOSIT');
    expect(movement.amountInShift).toBe(2000);
    // expected = 1000 opening + 5000 cash sales + 2000 net custody = 8000.
    const recon = await svc.reconciliation('s1');
    expect(recon.custodyDeposits).toBe(2000);
    expect(recon.expectedCash).toBe(8000);
  });

  it('records a withdrawal (reduces expected cash)', async () => {
    await svc.recordCustody({
      shiftId: 's1',
      direction: 'DEPOSIT',
      amount: 2000,
      idempotencyKey: 'k1',
    });
    await svc.recordCustody({
      shiftId: 's1',
      direction: 'WITHDRAW',
      amount: 500,
      idempotencyKey: 'k2',
    });
    const recon = await svc.reconciliation('s1');
    expect(recon.custodyWithdrawals).toBe(500);
    // 1000 + 5000 + (2000 - 500) = 7500.
    expect(recon.expectedCash).toBe(7500);
  });

  it('is idempotent on the key (replay returns same movement)', async () => {
    const first = await svc.recordCustody({
      shiftId: 's1',
      direction: 'DEPOSIT',
      amount: 100,
      idempotencyKey: 'kx',
    });
    const second = await svc.recordCustody({
      shiftId: 's1',
      direction: 'DEPOSIT',
      amount: 100,
      idempotencyKey: 'kx',
    });
    expect(second.replayed).toBe(true);
    expect(second.movement.id).toBe(first.movement.id);
    expect(repo.custody).toHaveLength(1);
  });

  it('rejects a withdrawal exceeding drawer cash (422)', async () => {
    // Drawer expected = 6000 (1000 + 5000). Withdraw 999999 → guard.
    await expect(
      svc.recordCustody({
        shiftId: 's1',
        direction: 'WITHDRAW',
        amount: 999999,
        idempotencyKey: 'kbig',
      }),
    ).rejects.toBeInstanceOf(CustodyExceedsDrawerError);
  });

  it('rejects custody on a non-open shift (409)', async () => {
    repo.shift = { ...repo.shift, status: 'CLOSED' };
    await expect(
      svc.recordCustody({
        shiftId: 's1',
        direction: 'DEPOSIT',
        amount: 10,
        idempotencyKey: 'kc',
      }),
    ).rejects.toBeInstanceOf(ShiftNotOpenError);
  });
});

describe('ShiftsService — POST015 settlement variance', () => {
  it('posts an over/short variance on settle (short by 50)', async () => {
    const repo = new FakeRepo();
    // Close first (expected = 6000; no custody/vouchers).
    repo.shift = { ...repo.shift, status: 'CLOSED', expectedCash: 6000 };
    const svc = new ShiftsService(legacy, repo);
    // findDenominations returns 6000; expected reconciliation = 6000 → diff 0.
    // Override counted via denominations = 6000 (BALANCED) — adjust to short:
    repo.findDenominations = () =>
      Promise.resolve([
        { currency: 'YER', value: 1000, count: 5, amount: 5000 },
        { currency: 'YER', value: 950, count: 1, amount: 950 },
      ]);
    const settlement = await svc.settle('s1', { settledBy: 2, note: 'eod' });
    expect(settlement.difference).toBe(-50); // 5950 - 6000
    expect(settlement.overShort).toBe('SHORT');
    const variance = await svc.variance('s1');
    expect(variance).not.toBeNull();
    expect(variance?.kind).toBe('SHORT');
    expect(variance?.difference).toBe(-50);
    expect(variance?.postedBy).toBe(2);
  });
});
