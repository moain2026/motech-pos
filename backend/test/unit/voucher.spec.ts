import { beforeEach, describe, expect, it } from 'vitest';
import { CreateVoucherUseCase } from '../../src/modules/vouchers/application/create-voucher.usecase';
import {
  Voucher,
  VoucherMethod,
  VoucherType,
} from '../../src/modules/vouchers/domain/entities/voucher.entity';
import {
  InsertVoucherInput,
  PersistedVoucher,
  VoucherListFilter,
  VoucherRepository,
  VoucherShiftTotals,
} from '../../src/modules/vouchers/domain/ports/voucher-repository.port';
import {
  IdempotencyConflictError,
  InvalidVoucherError,
  NoOpenShiftError,
} from '../../src/shared/errors/domain-error';

/** In-memory fake repo + shifts service so the logic is proven without a DB. */
class FakeRepo implements VoucherRepository {
  rows: PersistedVoucher[] = [];
  private n = 0;
  findByIdempotencyKey(key: string): Promise<PersistedVoucher | null> {
    return Promise.resolve(
      this.rows.find((r) => r.idempotencyKey === key) ?? null,
    );
  }
  findByRefundReturnId(returnId: string): Promise<PersistedVoucher | null> {
    return Promise.resolve(
      this.rows.find((r) => r.refundReturnId === returnId) ?? null,
    );
  }
  findById(id: string): Promise<PersistedVoucher | null> {
    return Promise.resolve(this.rows.find((r) => r.id === id) ?? null);
  }
  insertVoucher(input: InsertVoucherInput): Promise<PersistedVoucher> {
    this.n += 1;
    const v: PersistedVoucher = {
      id: `v${this.n}`,
      voucherNo: `NO${this.n}`,
      type: input.type,
      shiftId: input.shiftId,
      cashierNo: input.cashierNo,
      machineNo: input.machineNo,
      amount: input.amount,
      currency: input.currency,
      rate: input.rate,
      amountInShift: input.amountInShift,
      paymentMethod: input.paymentMethod,
      description: input.description,
      partyName: input.partyName,
      category: input.category,
      status: 'POSTED',
      idempotencyKey: input.idempotencyKey,
      clientOpId: input.clientOpId,
      refundReturnId: input.refundReturnId ?? null,
      issuedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.rows.push(v);
    return Promise.resolve(v);
  }
  list(_f: VoucherListFilter): Promise<PersistedVoucher[]> {
    return Promise.resolve(this.rows);
  }
  shiftCashTotals(_shiftId: string): Promise<VoucherShiftTotals> {
    return Promise.resolve({
      cashReceipts: 0,
      cashExpenses: 0,
      netCashEffect: 0,
      receiptCount: 0,
      expenseCount: 0,
    });
  }
}

const shiftsOpen = {
  current: () =>
    Promise.resolve({
      id: 'shift-1',
      machineNo: 7,
      currency: 'YER',
    }),
} as unknown as import('../../src/modules/shifts/application/shifts.service').ShiftsService;

const shiftsNone = {
  current: () => {
    throw new NoOpenShiftError('no shift', {});
  },
} as unknown as import('../../src/modules/shifts/application/shifts.service').ShiftsService;

describe('Voucher aggregate (amount × rate, cash effect)', () => {
  it('computes amountInShift = amount × rate', () => {
    const v = new Voucher({ type: VoucherType.RECEIPT, amount: 10, rate: 250 });
    expect(v.amountInShift().toNumber()).toBeCloseTo(2500, 4);
  });
  it('receipt cash effect is positive, expense negative', () => {
    const r = new Voucher({ type: VoucherType.RECEIPT, amount: 100 });
    const e = new Voucher({ type: VoucherType.EXPENSE, amount: 100 });
    expect(r.cashEffectInShift().toNumber()).toBeCloseTo(100, 4);
    expect(e.cashEffectInShift().toNumber()).toBeCloseTo(-100, 4);
  });
  it('non-cash tenders have zero cash effect', () => {
    const v = new Voucher({
      type: VoucherType.RECEIPT,
      amount: 100,
      method: VoucherMethod.CARD,
    });
    expect(v.cashEffectInShift().toNumber()).toBe(0);
  });
});

describe('CreateVoucherUseCase', () => {
  let repo: FakeRepo;
  let uc: CreateVoucherUseCase;

  beforeEach(() => {
    repo = new FakeRepo();
    uc = new CreateVoucherUseCase(repo, shiftsOpen);
  });

  it('creates a receipt voucher when a shift is open', async () => {
    const { voucher, replayed } = await uc.execute({
      idempotencyKey: 'k1',
      type: VoucherType.RECEIPT,
      cashierNo: 1,
      amount: 500,
    });
    expect(replayed).toBe(false);
    expect(voucher.type).toBe('RECEIPT');
    expect(voucher.amountInShift).toBeCloseTo(500, 4);
    expect(voucher.shiftId).toBe('shift-1');
  });

  it('converts a foreign-currency voucher via rate', async () => {
    const { voucher } = await uc.execute({
      idempotencyKey: 'k2',
      type: VoucherType.EXPENSE,
      cashierNo: 1,
      amount: 4,
      currency: 'USD',
      rate: 250,
    });
    expect(voucher.amountInShift).toBeCloseTo(1000, 4);
  });

  it('replays the same voucher for a repeated key + body (no dup)', async () => {
    const first = await uc.execute({
      idempotencyKey: 'k3',
      type: VoucherType.RECEIPT,
      cashierNo: 1,
      amount: 300,
    });
    const second = await uc.execute({
      idempotencyKey: 'k3',
      type: VoucherType.RECEIPT,
      cashierNo: 1,
      amount: 300,
    });
    expect(second.replayed).toBe(true);
    expect(second.voucher.id).toBe(first.voucher.id);
    expect(repo.rows).toHaveLength(1);
  });

  it('rejects the same key with a different body (409)', async () => {
    await uc.execute({
      idempotencyKey: 'k4',
      type: VoucherType.RECEIPT,
      cashierNo: 1,
      amount: 300,
    });
    await expect(
      uc.execute({
        idempotencyKey: 'k4',
        type: VoucherType.RECEIPT,
        cashierNo: 1,
        amount: 999,
      }),
    ).rejects.toBeInstanceOf(IdempotencyConflictError);
  });

  it('rejects a non-positive amount (422)', async () => {
    await expect(
      uc.execute({
        idempotencyKey: 'k5',
        type: VoucherType.RECEIPT,
        cashierNo: 1,
        amount: 0,
      }),
    ).rejects.toBeInstanceOf(InvalidVoucherError);
  });

  it('requires an open shift (409)', async () => {
    const uc2 = new CreateVoucherUseCase(repo, shiftsNone);
    await expect(
      uc2.execute({
        idempotencyKey: 'k6',
        type: VoucherType.RECEIPT,
        cashierNo: 1,
        amount: 100,
      }),
    ).rejects.toBeInstanceOf(NoOpenShiftError);
  });
});
