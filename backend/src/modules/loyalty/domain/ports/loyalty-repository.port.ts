import { LoyaltyRule } from '../points-policy';

export const LOYALTY_REPOSITORY = Symbol('LOYALTY_REPOSITORY');

/**
 * A named loyalty program (POSI008 — ترميز برامج نقاطي). Extends the bare
 * earning rule with limits + a validity window + a display name. The ACTIVE
 * program of a point type drives earnOnSale (superseding LOYALTY_CONFIG).
 */
export interface LoyaltyProgramRow {
  id: string;
  name: string;
  pointTypNo: number;
  calcType: number; // 1 | 2
  amt4Point: number;
  pointCnt: number;
  truncate: boolean;
  pointValue: number;
  /** Ignore bills below this net amount (0 = no minimum). */
  minBillAmt: number;
  /** Cap points granted per bill (0 = no cap). */
  maxPointsPerBill: number;
  /** Validity window (YYYY-MM-DD | null = open-ended). */
  startDate: string | null;
  endDate: string | null;
  active: boolean;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertLoyaltyProgramInput {
  name: string;
  pointTypNo: number;
  calcType: number;
  amt4Point: number;
  pointCnt: number;
  truncate: boolean;
  pointValue: number;
  minBillAmt: number;
  maxPointsPerBill: number;
  startDate: string | null;
  endDate: string | null;
  active: boolean;
  createdBy: number | null;
}

/** One loyalty ledger movement (MOTECH_POS.POINTS_LEDGER). */
export interface PointsLedgerRow {
  id: string;
  customerCode: string;
  pointTypNo: number;
  trnsType: number; // 1 earn, 2 redeem, 3 expire, 4 adjust
  billId: string | null;
  billNo: string | null;
  docAmt: number;
  pointCnt: number;
  pointAmt: number;
  shiftId: string | null;
  cashierNo: number | null;
  note: string | null;
  createdAt: string;
}

/** Chain-wide loyalty totals (POST021 — إجماليات النقاط). */
export interface LoyaltySummary {
  /** Total points granted (TRNS_TYPE=1). */
  totalEarned: number;
  /** Total points redeemed, as a positive number (TRNS_TYPE=2). */
  totalRedeemed: number;
  /** Net outstanding points across all customers (SUM(POINT_CNT)). */
  netOutstanding: number;
  /** Monetary value granted (SUM(POINT_AMT) of earns). */
  totalEarnedAmt: number;
  /** Monetary value redeemed (SUM(POINT_AMT) of redeems). */
  totalRedeemedAmt: number;
  earnCount: number;
  redeemCount: number;
  customerCount: number;
}

/** Aggregated earned-points balance for a customer (from MOTECH_POS). */
export interface EarnedPointsBalance {
  customerCode: string;
  earnedPoints: number; // SUM(POINT_CNT) over the ledger
  txnCount: number;
}

export interface InsertEarnInput {
  customerCode: string;
  pointTypNo: number;
  billId: string | null;
  billNo: string | null;
  docAmt: number;
  pointCnt: number;
  pointAmt: number;
  shiftId: string | null;
  cashierNo: number | null;
  note: string | null;
}

export interface InsertRedeemInput {
  customerCode: string;
  pointTypNo: number;
  billId: string | null;
  billNo: string | null;
  docAmt: number;
  /** Points to deduct (positive number; stored negated in the ledger). */
  pointCnt: number;
  pointAmt: number;
  shiftId: string | null;
  cashierNo: number | null;
  note: string | null;
}

export interface LoyaltyRepository {
  /** Active earning rule for a point type (defaults to type 1), or null. */
  activeRule(pointTypNo?: number): Promise<LoyaltyRule | null>;

  //========================================================================
  // POSI008 — loyalty programs CRUD (MOTECH_POS.LOYALTY_PROGRAMS)
  //========================================================================

  /** List all loyalty programs (newest first). */
  listPrograms(): Promise<LoyaltyProgramRow[]>;

  /** One program by id, or null. */
  findProgramById(id: string): Promise<LoyaltyProgramRow | null>;

  /**
   * The ACTIVE program of a point type whose validity window contains `on`
   * (a YYYY-MM-DD date, defaults to today), or null. Drives earnOnSale.
   */
  activeProgram(
    pointTypNo: number,
    on?: string,
  ): Promise<LoyaltyProgramRow | null>;

  /** Insert a new program. Throws on the one-active-per-type unique index. */
  insertProgram(input: UpsertLoyaltyProgramInput): Promise<LoyaltyProgramRow>;

  /** Update a program by id (full replace of editable fields). Null if gone. */
  updateProgram(
    id: string,
    input: UpsertLoyaltyProgramInput,
  ): Promise<LoyaltyProgramRow | null>;

  /** Delete a program by id. Returns true if a row was removed. */
  deleteProgram(id: string): Promise<boolean>;

  /**
   * Insert an EARN movement. Idempotent per (billId, trnsType=1): a duplicate
   * insert for the same bill is silently ignored (returns the existing row).
   * Returns null if pointCnt <= 0 (nothing earned).
   */
  insertEarn(input: InsertEarnInput): Promise<PointsLedgerRow | null>;

  /**
   * Insert a REDEEM movement (TRNS_TYPE=2, negative POINT_CNT). Idempotent
   * per (billId, trnsType=2): a duplicate redeem for the same bill returns
   * the existing row instead of double-deducting.
   */
  insertRedeem(input: InsertRedeemInput): Promise<PointsLedgerRow>;

  /** Earned-points balance (MOTECH_POS ledger) for a customer. */
  earnedBalance(customerCode: string): Promise<EarnedPointsBalance>;

  /** Ledger movements for a customer (newest first). */
  ledger(customerCode: string, limit: number): Promise<PointsLedgerRow[]>;

  /** Chain-wide granted/redeemed totals over the whole ledger. */
  summary(): Promise<LoyaltySummary>;
}
