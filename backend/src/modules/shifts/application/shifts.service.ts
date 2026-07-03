import { Inject, Injectable, Optional } from '@nestjs/common';
import {
  NoOpenShiftError,
  ShiftAlreadySettledError,
  ShiftCountRequiredError,
  ShiftNotClosedError,
  ShiftNotFoundError,
} from '../../../shared/errors/domain-error';
import {
  VoucherCashTotalsProvider,
  VOUCHER_CASH_TOTALS,
} from '../domain/ports/voucher-cash-totals.port';
import {
  CloseShiftInput,
  DenominationLine,
  OpenShiftInput,
  ShiftDenomination,
  ShiftReconciliation,
  ShiftRecord,
  ShiftRepository,
  ShiftSettlement,
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
        : shift.status !== 'OPEN'
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

  //============================================================================
  // POST013 — تصفية مبيعات الكاشيرات: count by denominations + settle
  //============================================================================

  /**
   * Save the counted cash broken down by currency denominations
   * (1000×5, 500×10 …). Replaces any previous count for that currency.
   * Blocked once the shift is SETTLED (settlement is immutable).
   */
  async saveCount(
    shiftId: string,
    input: { currency?: string; denominations: DenominationLine[] },
  ): Promise<{ denominations: ShiftDenomination[]; countedCash: number }> {
    const shift = await this.mustFind(shiftId);
    if (shift.status === 'SETTLED') {
      throw new ShiftAlreadySettledError(
        `Shift ${shiftId} is already settled; the count is frozen`,
        { shiftId },
      );
    }
    const denominations = await this.repo.saveCount({
      shiftId,
      currency: input.currency ?? shift.currency,
      denominations: input.denominations,
    });
    return { denominations, countedCash: sumAmounts(denominations) };
  }

  /**
   * Approve the settlement (POST013): expected vs counted (from the saved
   * denominations) → over/short, persisted as SETTLED. One-shot — a settled
   * shift can never be re-settled.
   */
  async settle(
    shiftId: string,
    opts?: { settledBy?: number; note?: string; cashExpenses?: number },
  ): Promise<ShiftSettlement> {
    const shift = await this.mustFind(shiftId);
    if (shift.status === 'SETTLED') {
      throw new ShiftAlreadySettledError(
        `Shift ${shiftId} is already settled`,
        { shiftId },
      );
    }
    if (shift.status !== 'CLOSED') {
      throw new ShiftNotClosedError(
        `Shift ${shiftId} must be closed before settlement`,
        { shiftId, status: shift.status },
      );
    }
    const denominations = await this.repo.findDenominations(shiftId);
    if (denominations.length === 0) {
      throw new ShiftCountRequiredError(
        `Shift ${shiftId} has no saved denomination count; POST /shifts/${shiftId}/count first`,
        { shiftId },
      );
    }
    const countedCash = sumAmounts(denominations);
    // Expected cash from the same reconciliation math (vouchers included).
    const recon = await this.reconciliation(shiftId, {
      cashExpenses: opts?.cashExpenses,
    });
    const difference = round4(countedCash - recon.expectedCash);
    const settled = await this.repo.settle({
      shiftId,
      expectedCash: recon.expectedCash,
      countedCash,
      difference,
      settledBy: opts?.settledBy,
      note: opts?.note,
    });
    return this.toSettlement(settled, denominations, recon.expectedCash);
  }

  /** Final settlement view: expected, counted (by denominations), diff, status. */
  async settlement(shiftId: string): Promise<ShiftSettlement> {
    const shift = await this.mustFind(shiftId);
    const denominations = await this.repo.findDenominations(shiftId);
    if (shift.status === 'SETTLED') {
      // Frozen figures as approved.
      return this.toSettlement(shift, denominations, shift.expectedCash);
    }
    // Not yet settled: live expected + provisional counted (if any).
    const recon = await this.reconciliation(shiftId);
    const countedCash =
      denominations.length > 0 ? sumAmounts(denominations) : null;
    const difference =
      countedCash == null ? null : round4(countedCash - recon.expectedCash);
    return {
      shiftId: shift.id,
      shiftNo: shift.shiftNo,
      cashierNo: shift.cashierNo,
      currency: shift.currency,
      status: shift.status,
      expectedCash: recon.expectedCash,
      countedCash,
      difference,
      overShort: overShortOf(difference),
      denominations,
      settledAt: null,
      settledBy: null,
      settleNote: null,
    };
  }

  private toSettlement(
    shift: ShiftRecord,
    denominations: ShiftDenomination[],
    expectedCash: number | null,
  ): ShiftSettlement {
    return {
      shiftId: shift.id,
      shiftNo: shift.shiftNo,
      cashierNo: shift.cashierNo,
      currency: shift.currency,
      status: shift.status,
      expectedCash,
      countedCash: shift.countedCash,
      difference: shift.settleDifference,
      overShort: overShortOf(shift.settleDifference),
      denominations,
      settledAt: shift.settledAt,
      settledBy: shift.settledBy,
      settleNote: shift.settleNote,
    };
  }

  private async mustFind(shiftId: string): Promise<ShiftRecord> {
    const shift = await this.repo.findById(shiftId);
    if (!shift) {
      throw new ShiftNotFoundError(`Shift ${shiftId} not found`, { shiftId });
    }
    return shift;
  }
}

const EPS = 0.0001;

function sumAmounts(denoms: ShiftDenomination[]): number {
  return round4(denoms.reduce((a, d) => a + d.amount, 0));
}

function overShortOf(
  diff: number | null,
): 'OVER' | 'SHORT' | 'BALANCED' | null {
  if (diff == null) return null;
  return diff > EPS ? 'OVER' : diff < -EPS ? 'SHORT' : 'BALANCED';
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
