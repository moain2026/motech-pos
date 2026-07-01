import { beforeEach, describe, expect, it } from 'vitest';
import { AddPaymentUseCase } from '../../src/modules/bills/application/add-payment.usecase';
import {
  AddPaymentInput,
  BillWriteRepository,
  InsertBillInput,
  PersistedBill,
  PersistedPayment,
} from '../../src/modules/bills/domain/ports/bill-write-repository.port';
import {
  BillImmutableError,
  BillNotFoundError,
  InvalidBillError,
  PaymentExceedsBalanceError,
} from '../../src/shared/errors/domain-error';

/**
 * Unit tests for the multi/partial/multi-currency payment settlement logic
 * (task 2). Uses an in-memory fake BillWriteRepository so the math is proven in
 * isolation (no DB). PAID_AMT is recomputed from the recorded payment lines,
 * exactly like the Oracle repo does.
 */
function makeBill(netAmt: number): PersistedBill {
  return {
    id: 'bill-1',
    billNo: 'B1',
    shiftId: 'shift-1',
    cashierNo: 1,
    machineNo: 1,
    billType: 1,
    customerCode: null,
    customerName: null,
    currency: 'YER',
    taxCalcType: 2,
    grossAmt: netAmt,
    discountAmt: 0,
    vatAmt: 0,
    netAmt,
    paidAmt: 0,
    status: 'POSTED',
    idempotencyKey: 'k',
    clientOpId: null,
    issuedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    lines: [],
    payments: [],
  };
}

class FakeRepo implements BillWriteRepository {
  constructor(private bill: PersistedBill) {}
  findByIdempotencyKey(): Promise<PersistedBill | null> {
    return Promise.resolve(null);
  }
  findById(id: string): Promise<PersistedBill | null> {
    return Promise.resolve(id === this.bill.id ? this.bill : null);
  }
  insertBill(_i: InsertBillInput): Promise<PersistedBill> {
    return Promise.resolve(this.bill);
  }
  addPayment(input: AddPaymentInput): Promise<PersistedBill> {
    const amountInBill = Math.round(input.amount * input.rate * 10000) / 10000;
    const pay: PersistedPayment = {
      id: `p${this.bill.payments.length + 1}`,
      method: input.method,
      currency: input.currency,
      amount: input.amount,
      rate: input.rate,
      amountInBill,
      cardNo: input.cardNo ?? null,
      customerCode: input.customerCode ?? null,
      createdAt: new Date().toISOString(),
    };
    this.bill.payments.push(pay);
    this.bill.paidAmt =
      Math.round(
        this.bill.payments.reduce((a, p) => a + p.amountInBill, 0) * 10000,
      ) / 10000;
    return Promise.resolve(this.bill);
  }
}

describe('AddPaymentUseCase (multi/partial/multi-currency)', () => {
  let bill: PersistedBill;
  let uc: AddPaymentUseCase;

  beforeEach(() => {
    bill = makeBill(200);
    uc = new AddPaymentUseCase(new FakeRepo(bill));
  });

  it('records a partial payment and reports outstanding', async () => {
    const s = await uc.execute({ billId: 'bill-1', method: 'CASH', amount: 50 });
    expect(s.paidAmt).toBeCloseTo(50, 4);
    expect(s.outstanding).toBeCloseTo(150, 4);
    expect(s.fullyPaid).toBe(false);
    expect(s.change).toBeCloseTo(0, 4);
  });

  it('settles fully with multiple tenders (cash + card + credit)', async () => {
    const s = await uc.executeMany({
      billId: 'bill-1',
      tenders: [
        { method: 'CARD', amount: 80 },
        { method: 'CREDIT', amount: 20, customerCode: 'C1' },
        { method: 'CASH', amount: 100 },
      ],
    });
    expect(s.paidAmt).toBeCloseTo(200, 4);
    expect(s.outstanding).toBeCloseTo(0, 4);
    expect(s.fullyPaid).toBe(true);
    expect(s.change).toBeCloseTo(0, 4);
    expect(s.bill.payments).toHaveLength(3);
  });

  it('allows cash overtender and reports change (fakka)', async () => {
    const s = await uc.execute({ billId: 'bill-1', method: 'CASH', amount: 250 });
    expect(s.change).toBeCloseTo(50, 4);
    expect(s.outstanding).toBeCloseTo(0, 4);
    expect(s.fullyPaid).toBe(true);
  });

  it('converts a foreign-currency tender via rate (multi-currency)', async () => {
    // 200 YER bill paid with 1 USD @ 250 → 250 YER, 50 change.
    const s = await uc.execute({
      billId: 'bill-1',
      method: 'CASH',
      amount: 1,
      currency: 'USD',
      rate: 250,
    });
    expect(s.bill.payments[0].amountInBill).toBeCloseTo(250, 4);
    expect(s.change).toBeCloseTo(50, 4);
    expect(s.fullyPaid).toBe(true);
  });

  it('rejects a non-cash tender that exceeds the outstanding balance', async () => {
    await expect(
      uc.execute({ billId: 'bill-1', method: 'CARD', amount: 300 }),
    ).rejects.toBeInstanceOf(PaymentExceedsBalanceError);
  });

  it('rejects credit without a customerCode', async () => {
    await expect(
      uc.execute({ billId: 'bill-1', method: 'CREDIT', amount: 50 }),
    ).rejects.toBeInstanceOf(InvalidBillError);
  });

  it('rejects payment on a non-existent bill', async () => {
    await expect(
      uc.execute({ billId: 'nope', method: 'CASH', amount: 10 }),
    ).rejects.toBeInstanceOf(BillNotFoundError);
  });

  it('rejects payment on a VOID (immutable) bill', async () => {
    bill.status = 'VOID';
    await expect(
      uc.execute({ billId: 'bill-1', method: 'CASH', amount: 10 }),
    ).rejects.toBeInstanceOf(BillImmutableError);
  });

  it('accumulates partial payments across calls until fully paid', async () => {
    await uc.execute({ billId: 'bill-1', method: 'CASH', amount: 120 });
    const s = await uc.execute({ billId: 'bill-1', method: 'CARD', amount: 80 });
    expect(s.paidAmt).toBeCloseTo(200, 4);
    expect(s.fullyPaid).toBe(true);
  });
});
