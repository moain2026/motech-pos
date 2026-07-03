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
  CouponNotFoundError,
  InsufficientPointsError,
  InvalidBillError,
  PaymentExceedsBalanceError,
} from '../../src/shared/errors/domain-error';
import type { LoyaltyService } from '../../src/modules/loyalty/application/loyalty.service';
import type { CardsService } from '../../src/modules/cards/application/cards.service';

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
      couponNo: input.couponNo ?? null,
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

//============================================================================
// POINTS + COUPON tenders
//============================================================================

/** Fake loyalty engine: balance ledger in memory, pointValue = 2 riyals. */
function fakeLoyalty(balance: number, pointValue = 2) {
  const state = { balance, redeemed: [] as number[] };
  const svc = {
    pointValue: () => Promise.resolve(pointValue),
    earnedBalance: (customerCode: string) =>
      Promise.resolve({ customerCode, earnedPoints: state.balance, txnCount: 1 }),
    redeemForPayment: (input: { points: number; customerCode: string }) => {
      if (state.balance < input.points) {
        return Promise.reject(
          new InsufficientPointsError('insufficient', {}),
        );
      }
      state.balance -= input.points;
      state.redeemed.push(input.points);
      return Promise.resolve({
        ledger: {} as never,
        amount: input.points * pointValue,
        pointValue,
      });
    },
  } as unknown as LoyaltyService;
  return { svc, state };
}

function fakeCards(coupons: Record<string, number>) {
  return {
    findCoupon: (couponNo: string) =>
      Promise.resolve(
        couponNo in coupons
          ? { docNo: 1, couponNo, value: coupons[couponNo], bookNo: null, description: null }
          : null,
      ),
  } as unknown as CardsService;
}

describe('AddPaymentUseCase (POINTS + COUPON tenders)', () => {
  let bill: PersistedBill;

  beforeEach(() => {
    bill = makeBill(200);
    bill.customerCode = 'C1';
  });

  it('pays with POINTS: converts points via pointValue and deducts the balance', async () => {
    const { svc, state } = fakeLoyalty(100, 2); // 100 pts worth 200
    const uc = new AddPaymentUseCase(new FakeRepo(bill), svc, fakeCards({}));
    // Redeem 30 points → 60 in bill currency.
    const s = await uc.execute({ billId: 'bill-1', method: 'POINTS', amount: 30 });
    expect(s.paidAmt).toBeCloseTo(60, 4);
    expect(s.outstanding).toBeCloseTo(140, 4);
    expect(state.balance).toBe(70); // deducted
    expect(state.redeemed).toEqual([30]);
    expect(s.bill.payments[0].method).toBe('POINTS');
    expect(s.bill.payments[0].customerCode).toBe('C1');
  });

  it('rejects POINTS when the balance is insufficient (nothing written)', async () => {
    const { svc, state } = fakeLoyalty(10, 2);
    const uc = new AddPaymentUseCase(new FakeRepo(bill), svc, fakeCards({}));
    await expect(
      uc.execute({ billId: 'bill-1', method: 'POINTS', amount: 50 }),
    ).rejects.toBeInstanceOf(InsufficientPointsError);
    expect(state.balance).toBe(10); // untouched
    expect(bill.payments).toHaveLength(0); // no payment row
  });

  it('rejects POINTS without a loyalty customer on the bill or tender', async () => {
    bill.customerCode = null;
    const { svc } = fakeLoyalty(100);
    const uc = new AddPaymentUseCase(new FakeRepo(bill), svc, fakeCards({}));
    await expect(
      uc.execute({ billId: 'bill-1', method: 'POINTS', amount: 10 }),
    ).rejects.toBeInstanceOf(InvalidBillError);
  });

  it('pays with a COUPON at its face value', async () => {
    const uc = new AddPaymentUseCase(
      new FakeRepo(bill),
      fakeLoyalty(0).svc,
      fakeCards({ 'CPN-7': 50 }),
    );
    const s = await uc.execute({
      billId: 'bill-1',
      method: 'COUPON',
      couponNo: 'CPN-7',
    });
    expect(s.paidAmt).toBeCloseTo(50, 4);
    expect(s.outstanding).toBeCloseTo(150, 4);
    expect(s.bill.payments[0].method).toBe('COUPON');
    expect(s.bill.payments[0].couponNo).toBe('CPN-7');
  });

  it('rejects an unknown coupon with coupon-not-found (422)', async () => {
    const uc = new AddPaymentUseCase(
      new FakeRepo(bill),
      fakeLoyalty(0).svc,
      fakeCards({}),
    );
    await expect(
      uc.execute({ billId: 'bill-1', method: 'COUPON', couponNo: 'NOPE' }),
    ).rejects.toBeInstanceOf(CouponNotFoundError);
    expect(bill.payments).toHaveLength(0);
  });

  it('mixes POINTS + COUPON + CASH in one multi settlement', async () => {
    const { svc, state } = fakeLoyalty(100, 2);
    const uc = new AddPaymentUseCase(
      new FakeRepo(bill),
      svc,
      fakeCards({ 'CPN-1': 40 }),
    );
    const s = await uc.executeMany({
      billId: 'bill-1',
      tenders: [
        { method: 'POINTS', amount: 30 }, // 60
        { method: 'COUPON', couponNo: 'CPN-1' }, // 40
        { method: 'CASH', amount: 100 }, // 100 → total 200
      ],
    });
    expect(s.fullyPaid).toBe(true);
    expect(s.paidAmt).toBeCloseTo(200, 4);
    expect(state.balance).toBe(70);
    expect(s.bill.payments).toHaveLength(3);
  });
});
