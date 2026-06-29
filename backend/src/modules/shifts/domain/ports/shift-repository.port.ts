export const SHIFT_REPOSITORY = Symbol('SHIFT_REPOSITORY');

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
