import { LoyaltyRule } from '../points-policy';

export const LOYALTY_REPOSITORY = Symbol('LOYALTY_REPOSITORY');

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
}
