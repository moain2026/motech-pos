import { Return } from '../entities/return.entity';

/** DI token for the read-only ReturnRepository port (YSPOS23 RT tables). */
export const RETURN_REPOSITORY = Symbol('RETURN_REPOSITORY');

export interface StoredReturnTotals {
  rtBillNo: string;
  rtBillAmt: number;
  vatAmt: number;
  discAmt: number;
  payedAmt: number | null;
}

export interface ReturnListItem {
  /** unified id: rtBillNo for legacy, UUID id for MOTECH_POS rows. */
  id: string;
  source: 'YSPOS23' | 'MOTECH_POS';
  rtBillNo: string;
  originalBillNo: string | null;
  rtBillDate: string | null;
  returnType: number | null;
  rtBillAmt: number;
  vatAmt: number;
  discAmt: number;
  cName: string | null;
  machineNo: number | null;
  lineCount: number;
}

export interface ReturnListFilter {
  from?: string; // ISO date
  to?: string;
  machineNo?: number;
  originalBillNo?: string;
  limit: number;
  cursor?: string; // last seen RT_BILL_NO (descending)
}

/**
 * ReturnRepository (READ side) — reads the real YSPOS23 RT bill tables
 * (IAS_POS_RT_BILL_MST/DTL). STRICTLY read-only (MOTECH_RO). No writes.
 */
export interface ReturnRepository {
  /** Paginated list of legacy returns (header info), newest first. */
  list(
    filter: ReturnListFilter,
  ): Promise<{ items: ReturnListItem[]; nextCursor?: string }>;

  /** Full legacy return (header + lines) as a domain aggregate, or null. */
  findByNo(
    rtBillNo: string,
  ): Promise<{ ret: Return; stored: StoredReturnTotals } | null>;
}
