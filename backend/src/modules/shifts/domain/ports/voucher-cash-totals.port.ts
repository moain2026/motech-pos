/**
 * Optional collaborator that supplies per-shift CASH voucher totals so the
 * shift-close reconciliation can fold receipts/expenses into expected cash.
 *
 * Declared in the shifts module (the consumer) to avoid a hard dependency on
 * the vouchers module. The vouchers module BINDS this token to its own service.
 * ShiftsService injects it with @Optional() so shifts still works standalone
 * (falls back to zero receipts/expenses) if vouchers is not loaded.
 */
export const VOUCHER_CASH_TOTALS = Symbol('VOUCHER_CASH_TOTALS');

export interface ShiftVoucherCashTotals {
  cashReceipts: number;
  cashExpenses: number;
  netCashEffect: number;
  receiptCount: number;
  expenseCount: number;
}

export interface VoucherCashTotalsProvider {
  shiftCashTotals(shiftId: string): Promise<ShiftVoucherCashTotals>;
}
