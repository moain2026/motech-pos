import { Inject, Injectable, Optional } from '@nestjs/common';
import {
  NoOpenShiftError,
  ShiftNotFoundError,
} from '../../../shared/errors/domain-error';
import {
  VoucherCashTotalsProvider,
  VOUCHER_CASH_TOTALS,
} from '../domain/ports/voucher-cash-totals.port';
import {
  CloseShiftInput,
  OpenShiftInput,
  ShiftReconciliation,
  ShiftRecord,
  ShiftRepository,
  ShiftWriteRepository,
  SHIFT_REPOSITORY,
  SHIFT_WRITE_REPOSITORY,
} from '../domain/ports/shift-repository.port';

@Injectable()
export class ShiftsService {
  constructor(
    @Inject(SHIFT_REPOSITORY) private readonly legacy: ShiftRepository,
    @Inject(SHIFT_WRITE_REPOSITORY)
    private readonly repo: ShiftWriteRepository,
    @Optional()
    @Inject(VOUCHER_CASH_TOTALS)
    private readonly vouchers?: VoucherCashTotalsProvider,
  ) {}

  /**
   * Current open shift for a cashier (our DB first; selling precondition).
   * 409 if none. This is what the bills use-case relies on.
   */
  async current(cashierNo: number): Promise<ShiftRecord> {
    const shift = await this.repo.findOpenByCashier(cashierNo);
    if (!shift) {
      throw new NoOpenShiftError(
        `Cashier ${cashierNo} has no open work shift; open a shift before selling`,
        { cashierNo },
      );
    }
    return shift;
  }

  /** Legacy YSPOS23 open-shift lookup (reference / migration aid). */
  legacyCurrent(cashierNo: number) {
    return this.legacy.findOpenByCashier(cashierNo);
  }

  /** Open a new shift in MOTECH_POS (409 if one is already open). */
  open(input: OpenShiftInput): Promise<ShiftRecord> {
    return this.repo.open(input);
  }

  /** Close a shift (computes expected cash + difference). */
  close(input: CloseShiftInput): Promise<ShiftRecord> {
    return this.repo.close(input);
  }

  /** X/Z-style summary: shift record + cash totals. */
  async summary(shiftId: string) {
    const shift = await this.repo.findById(shiftId);
    if (!shift) {
      throw new ShiftNotFoundError(`Shift ${shiftId} not found`, { shiftId });
    }
    const totals = await this.repo.cashTotals(shiftId);
    return { shift, totals };
  }

  /**
   * Cashier reconciliation / Z-report (POST013/POST015 + POSR001):
   * expected vs actual cash, over/short, and per-method (× currency) breakdown.
   * Works for OPEN shifts (X-report, live) and CLOSED shifts (Z-report, final).
   */
  async reconciliation(
    shiftId: string,
    opts?: { actualCash?: number; cashExpenses?: number },
  ): Promise<ShiftReconciliation> {
    const shift = await this.repo.findById(shiftId);
    if (!shift) {
      throw new ShiftNotFoundError(`Shift ${shiftId} not found`, { shiftId });
    }
    const totals = await this.repo.cashTotals(shiftId);
    const breakdown = await this.repo.paymentBreakdown(shiftId);

    // Cash vouchers (POST025/POST026): receipts add to the drawer, expenses
    // remove from it. Pulled from the vouchers module when present.
    const voucherTotals = this.vouchers
      ? await this.vouchers.shiftCashTotals(shiftId)
      : { cashReceipts: 0, cashExpenses: 0, netCashEffect: 0, receiptCount: 0, expenseCount: 0 };
    const cashReceipts = voucherTotals.cashReceipts;
    // Expenses: explicit override wins; else voucher-sourced cash expenses.
    const cashExpenses = opts?.cashExpenses ?? voucherTotals.cashExpenses;
    // Expected cash = opening + cash sales + cash receipts - cash expenses.
    const expectedCash = round4(
      shift.openingBalance + totals.cashTotal + cashReceipts - cashExpenses,
    );
    // Actual cash: for a CLOSED shift use the recorded closing balance; for an
    // OPEN shift use the optional counted figure if supplied.
    const actualCash =
      opts?.actualCash != null
        ? opts.actualCash
        : shift.status === 'CLOSED'
          ? shift.closingBalance
          : null;
    const cashDifference =
      actualCash == null ? null : round4(actualCash - expectedCash);
    const overShort: ShiftReconciliation['overShort'] =
      cashDifference == null
        ? null
        : cashDifference > EPS
          ? 'OVER'
          : cashDifference < -EPS
            ? 'SHORT'
            : 'BALANCED';
    const tenderTotal = round4(
      breakdown.reduce((a, b) => a + b.amountInBill, 0),
    );

    return {
      shiftId: shift.id,
      shiftNo: shift.shiftNo,
      cashierNo: shift.cashierNo,
      machineNo: shift.machineNo,
      currency: shift.currency,
      status: shift.status,
      openedAt: shift.openedAt,
      closedAt: shift.closedAt,
      openingBalance: shift.openingBalance,
      billCount: totals.billCount,
      netSalesTotal: totals.netSalesTotal,
      cashSales: totals.cashTotal,
      cashReceipts,
      cashExpenses,
      expectedCash,
      actualCash,
      cashDifference,
      overShort,
      cardTotal: totals.cardTotal,
      creditTotal: totals.creditTotal,
      tenderTotal,
      breakdown,
    };
  }
}

const EPS = 0.0001;

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
