import { Bill } from '../entities/bill.entity';

/** DI token for the BillRepository port. */
export const BILL_REPOSITORY = Symbol('BILL_REPOSITORY');

export interface StoredBillTotals {
  billNo: string;
  billAmt: number;
  vatAmt: number;
  discAmt: number;
  payedAmt: number | null;
}

export interface BillListItem {
  billNo: string;
  billDate: string | null;
  billTime: string | null;
  billType: number;
  billAmt: number;
  vatAmt: number;
  discAmt: number;
  cName: string | null;
  machineNo: number | null;
  lineCount: number;
}

export interface BillListFilter {
  from?: string; // ISO date
  to?: string;
  machineNo?: number;
  limit: number;
  cursor?: string; // last seen BILL_NO (descending)
}

export interface DailySummaryRow {
  day: string;
  billCount: number;
  totalAmt: number;
  totalVat: number;
  totalDisc: number;
}

export interface BillRepository {
  /** Paginated list of bills (header info), newest first. */
  list(filter: BillListFilter): Promise<{ items: BillListItem[]; nextCursor?: string }>;

  /** Full bill (header + lines) rebuilt into the domain aggregate, or null. */
  findByNo(billNo: string): Promise<{ bill: Bill; stored: StoredBillTotals } | null>;

  /** Daily aggregated sales summary. */
  dailySummary(from?: string, to?: string): Promise<DailySummaryRow[]>;

  /**
   * Read N sample bills (with lines) for golden testing.
   * Returns the rebuilt aggregate plus the stored header totals to compare.
   */
  sampleForGolden(
    limit: number,
  ): Promise<Array<{ bill: Bill; stored: StoredBillTotals }>>;
}
