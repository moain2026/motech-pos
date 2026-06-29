export const SHIFT_REPOSITORY = Symbol('SHIFT_REPOSITORY');

/** Open shift as read from YSPOS23 (legacy reference, read-only). */
export interface OpenShift {
  shftSrl: string;
  shftCode: string | null;
  cshrNo: number | null;
  opnDate: string | null;
  shftDate: string | null;
}

export interface ShiftRepository {
  /**
   * Open shift for a cashier — mirrors GET_WRK_SHFT_OPN_FNC:
   *   MIN(SHFT_SRL) FROM POS_WRK_SHFT_CSHR WHERE CSHR_NO=? AND CLS_DATE IS NULL.
   * Returns null when no open shift exists.
   */
  findOpenByCashier(cshrNo: number): Promise<OpenShift | null>;
}

//==============================================================================
// WRITE side — our own MOTECH_POS.SHIFTS (separate from YSPOS23)
//==============================================================================

export const SHIFT_WRITE_REPOSITORY = Symbol('SHIFT_WRITE_REPOSITORY');

export type ShiftStatus = 'OPEN' | 'CLOSED';

export interface ShiftRecord {
  id: string;
  shiftNo: number;
  shiftCode: string | null;
  cashierNo: number;
  machineNo: number | null;
  openingBalance: number;
  currency: string;
  status: ShiftStatus;
  openedAt: string;
  closedAt: string | null;
  closingBalance: number | null;
  expectedCash: number | null;
  cashDifference: number | null;
  closeNote: string | null;
}

export interface OpenShiftInput {
  cashierNo: number;
  shiftCode?: string;
  machineNo?: number;
  openingBalance?: number;
  currency?: string;
}

export interface CloseShiftInput {
  shiftId: string;
  closingBalance?: number;
  closeNote?: string;
}

/** Aggregated cash totals for a shift (computed from PAYMENTS). */
export interface ShiftCashTotals {
  billCount: number;
  netSalesTotal: number;
  cashTotal: number;
  cardTotal: number;
  creditTotal: number;
}

export interface ShiftWriteRepository {
  /** The single OPEN shift for a cashier in our DB, or null. */
  findOpenByCashier(cashierNo: number): Promise<ShiftRecord | null>;

  /** Fetch a shift by id. */
  findById(id: string): Promise<ShiftRecord | null>;

  /** Open a new shift (fails if the cashier already has an open one). */
  open(input: OpenShiftInput): Promise<ShiftRecord>;

  /** Close an open shift, computing expected cash + difference. */
  close(input: CloseShiftInput): Promise<ShiftRecord>;

  /** Cash/sales totals for a shift (for close + summary). */
  cashTotals(shiftId: string): Promise<ShiftCashTotals>;
}
