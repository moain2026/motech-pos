import { beforeEach, describe, expect, it } from 'vitest';
import { RefundVoucherUseCase } from '../../src/modules/vouchers/application/refund-voucher.usecase';
import {
  InsertVoucherInput,
  PersistedVoucher,
  RefundReturnUniqueViolation,
  VoucherListFilter,
  VoucherRepository,
  VoucherShiftTotals,
} from '../../src/modules/vouchers/domain/ports/voucher-repository.port';
import {
  RefundNotPayableError,
  ReturnNotFoundError,
} from '../../src/shared/errors/domain-error';

/** In-memory voucher repo (POST006 refund path). */
class FakeRepo implements VoucherRepository {
  rows: PersistedVoucher[] = [];
  private n = 0;
  /** When true, the FIRST insert throws the refund UNIQUE violation (race). */
  raceOnce = false;
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
      voucherNo: `EXP${this.n}`,
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
    if (this.raceOnce) {
      // Simulate a concurrent writer that already inserted the row.
      this.raceOnce = false;
      this.rows.push(v);
      return Promise.reject(new RefundReturnUniqueViolation());
    }
    this.rows.push(v);
    return Promise.resolve(v);
  }
  list(_f: VoucherListFilter): Promise<PersistedVoucher[]> {
    return Promise.resolve(this.rows);
  }
  shiftCashTotals(_s: string): Promise<VoucherShiftTotals> {
    return Promise.resolve({
      cashReceipts: 0,
      cashExpenses: 0,
      netCashEffect: 0,
      receiptCount: 0,
      expenseCount: 0,
    });
  }
}

/** Fake ReturnsService.getById — returns a MOTECH_POS return with a refundAmt. */
function fakeReturns(refundAmt: number, source: 'MOTECH_POS' | 'YSPOS23' = 'MOTECH_POS') {
  return {
    getById: (id: string) =>
      Promise.resolve({
        source,
        data: {
          id,
          rtBillNo: 'RT-100',
          originalBillNo: 'B-1',
          shiftId: 'shift-1',
          machineNo: 3,
          currency: 'YER',
          refundAmt,
        },
      }),
  } as unknown as import('../../src/modules/returns/application/returns.service').ReturnsService;
}

describe('RefundVoucherUseCase (POST006)', () => {
  let repo: FakeRepo;
  beforeEach(() => {
    repo = new FakeRepo();
  });

  it('creates a REFUND EXPENSE voucher linked to the return', async () => {
    const uc = new RefundVoucherUseCase(repo, fakeReturns(7800));
    const { voucher, replayed } = await uc.execute({
      returnId: 'ret-1',
      cashierNo: 91,
    });
    expect(replayed).toBe(false);
    expect(voucher.type).toBe('EXPENSE');
    expect(voucher.category).toBe('REFUND');
    expect(voucher.amount).toBeCloseTo(7800, 4);
    expect(voucher.refundReturnId).toBe('ret-1');
    expect(voucher.shiftId).toBe('shift-1');
  });

  it('is idempotent: a second call returns the same voucher (no dup)', async () => {
    const uc = new RefundVoucherUseCase(repo, fakeReturns(500));
    const first = await uc.execute({ returnId: 'ret-2', cashierNo: 91 });
    const second = await uc.execute({ returnId: 'ret-2', cashierNo: 91 });
    expect(second.replayed).toBe(true);
    expect(second.voucher.id).toBe(first.voucher.id);
    expect(repo.rows).toHaveLength(1);
  });

  it('resolves a DB UNIQUE race to the winning voucher', async () => {
    const uc = new RefundVoucherUseCase(repo, fakeReturns(500));
    repo.raceOnce = true;
    const { voucher, replayed } = await uc.execute({
      returnId: 'ret-3',
      cashierNo: 91,
    });
    expect(replayed).toBe(true);
    expect(voucher.refundReturnId).toBe('ret-3');
    expect(repo.rows).toHaveLength(1);
  });

  it('rejects a return with no positive refund (422)', async () => {
    const uc = new RefundVoucherUseCase(repo, fakeReturns(0));
    await expect(
      uc.execute({ returnId: 'ret-4', cashierNo: 91 }),
    ).rejects.toBeInstanceOf(RefundNotPayableError);
  });

  it('refuses to refund a legacy YSPOS23 return (404)', async () => {
    const uc = new RefundVoucherUseCase(repo, fakeReturns(500, 'YSPOS23'));
    await expect(
      uc.execute({ returnId: 'rt-legacy', cashierNo: 91 }),
    ).rejects.toBeInstanceOf(ReturnNotFoundError);
  });
});
