import { describe, expect, it } from 'vitest';
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
import { VoucherCashTotalsProvider } from '../../src/modules/shifts/domain/ports/voucher-cash-totals.port';

/**
 * P1 bug fix (Wave F): POST /shifts/:id/close used to compute
 *   expected = opening + cash sales - cashExpenses(body)
 * while GET /shifts/:id/reconciliation computed
 *   expected = opening + cash sales + voucher receipts - voucher expenses.
 * A shift with cash vouchers therefore closed with a DIFFERENT expected cash
 * than its own reconciliation reported. The formula is now unified in
 * ShiftsService.close(): vouchers are folded in before the repository math.
 */
class FakeRepo implements ShiftWriteRepository {
  shift: ShiftRecord = {
    id: 's1',
    shiftNo: 1,
    shiftCode: null,
    cashierNo: 12,
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
    billCount: 2,
    netSalesTotal: 5000,
    cashTotal: 5000,
    cardTotal: 0,
    creditTotal: 0,
  };
  lastCloseInput?: CloseShiftInput;

  findOpenByCashier(): Promise<ShiftRecord | null> {
    return Promise.resolve(this.shift.status === 'OPEN' ? this.shift : null);
  }
  findById(id: string): Promise<ShiftRecord | null> {
    return Promise.resolve(id === this.shift.id ? this.shift : null);
  }
  open(_i: OpenShiftInput): Promise<ShiftRecord> {
    return Promise.resolve(this.shift);
  }
  /** Mirrors OracleShiftWriteRepository.close() expected-cash math. */
  close(input: CloseShiftInput): Promise<ShiftRecord> {
    this.lastCloseInput = input;
    const expected =
      this.shift.openingBalance +
      this.totals.cashTotal +
      (input.cashReceipts ?? 0) -
      (input.cashExpenses ?? 0);
    const closing = input.closingBalance ?? expected;
    this.shift = {
      ...this.shift,
      status: 'CLOSED',
      closedAt: new Date().toISOString(),
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
  saveCount(_i: SaveShiftCountInput): Promise<ShiftDenomination[]> {
    return Promise.resolve([]);
  }
  findDenominations(): Promise<ShiftDenomination[]> {
    return Promise.resolve([]);
  }
  settle(_i: SettleShiftInput): Promise<ShiftRecord> {
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
  insertVariance(_i: InsertVarianceInput): Promise<PostedVariance> {
    return Promise.reject(new Error('not used'));
  }
  findVariance(): Promise<PostedVariance | null> {
    return Promise.resolve(null);
  }
}

/** Shift has a 500 cash receipt voucher and a 120 cash expense voucher. */
const vouchers: VoucherCashTotalsProvider = {
  shiftCashTotals: () =>
    Promise.resolve({
      cashReceipts: 500,
      cashExpenses: 120,
      netCashEffect: 380,
      receiptCount: 1,
      expenseCount: 1,
    }),
};

const legacy = { findOpenByCashier: () => Promise.resolve(null) };

describe('ShiftsService — unified expected-cash (close vs reconciliation)', () => {
  it('close() folds voucher receipts/expenses into expected cash (P1 fix)', async () => {
    const repo = new FakeRepo();
    const svc = new ShiftsService(legacy, repo, vouchers);

    const closed = await svc.close({ shiftId: 's1' });
    // expected = 1000 opening + 5000 cash sales + 500 receipts - 120 expenses.
    expect(closed.expectedCash).toBe(6380);
    expect(repo.lastCloseInput?.cashReceipts).toBe(500);
    expect(repo.lastCloseInput?.cashExpenses).toBe(120);

    // Reconciliation of the SAME closed shift must agree exactly.
    const recon = await svc.reconciliation('s1');
    expect(recon.expectedCash).toBe(6380);
    expect(recon.expectedCash).toBe(closed.expectedCash);
    expect(recon.cashReceipts).toBe(500);
    expect(recon.cashExpenses).toBe(120);
    // closingBalance defaulted to expected → difference 0 / BALANCED.
    expect(recon.cashDifference).toBe(0);
    expect(recon.overShort).toBe('BALANCED');
  });

  it('explicit cashExpenses override wins over voucher expenses in BOTH paths', async () => {
    const repo = new FakeRepo();
    const svc = new ShiftsService(legacy, repo, vouchers);

    const closed = await svc.close({ shiftId: 's1', cashExpenses: 200 });
    // expected = 1000 + 5000 + 500 receipts - 200 explicit expenses.
    expect(closed.expectedCash).toBe(6300);

    const recon = await svc.reconciliation('s1', { cashExpenses: 200 });
    expect(recon.expectedCash).toBe(6300);
    expect(recon.expectedCash).toBe(closed.expectedCash);
  });

  it('without a vouchers provider both paths fall back to zero vouchers', async () => {
    const repo = new FakeRepo();
    const svc = new ShiftsService(legacy, repo); // no provider

    const closed = await svc.close({ shiftId: 's1' });
    expect(closed.expectedCash).toBe(6000); // 1000 + 5000

    const recon = await svc.reconciliation('s1');
    expect(recon.expectedCash).toBe(6000);
    expect(recon.cashReceipts).toBe(0);
    expect(recon.cashExpenses).toBe(0);
  });
});
