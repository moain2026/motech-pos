/** DI token for the read-only original-bill reference port (YSPOS23). */
export const ORIGINAL_BILL_REFERENCE = Symbol('ORIGINAL_BILL_REFERENCE');

/** One sold line of the original bill (from IAS_POS_BILL_DTL). */
export interface OriginalBillLine {
  itemCode: string;
  qtySold: number;
  unitPrice: number;
  discDtl: number;
  discMst: number;
  vatPercent: number;
  itemUnit: string | null;
}

/** The original bill header + its sold lines, read-only from YSPOS23. */
export interface OriginalBill {
  billNo: string;
  billDate: string | null;
  vatCalcType: number; // 1 | 2
  cCode: string | null;
  cName: string | null;
  machineNo: number | null;
  lines: OriginalBillLine[];
}

/**
 * OriginalBillReader — verifies the original sale exists and exposes the sold
 * quantities/prices so a return cannot exceed what was sold
 * (FLOW_RETURN.md §4.4). STRICTLY read-only (MOTECH_RO / YSPOS23).
 */
export interface OriginalBillReader {
  /** Resolve the original bill by BILL_NO, or null if it does not exist. */
  findByNo(billNo: string): Promise<OriginalBill | null>;
}
