import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  EarnedPointsBalance,
  LoyaltyRepository,
  LOYALTY_REPOSITORY,
  LoyaltySummary,
  PointsLedgerRow,
} from '../domain/ports/loyalty-repository.port';
import { earnPoints } from '../domain/points-policy';
import { InsufficientPointsError } from '../../../shared/errors/domain-error';

export interface EarnOnSaleInput {
  customerCode: string;
  billId: string | null;
  billNo: string | null;
  billAmount: number;
  shiftId?: string | null;
  cashierNo?: number | null;
  pointTypNo?: number;
}

export interface RedeemForPaymentInput {
  customerCode: string;
  billId: string | null;
  billNo: string | null;
  /** Points to redeem (positive). */
  points: number;
  shiftId?: string | null;
  cashierNo?: number | null;
  pointTypNo?: number;
}

/** A ledger movement + the customer's running balance AFTER it (POST021). */
export type LedgerEntryWithBalance = PointsLedgerRow & {
  /** نوع الحركة — human-readable kind derived from TRNS_TYPE. */
  kind: 'EARN' | 'REDEEM' | 'EXPIRE' | 'ADJUST';
  /** Customer balance after this movement (running balance, newest-first). */
  balanceAfter: number;
};

export interface CustomerLedgerView {
  balance: EarnedPointsBalance;
  entries: LedgerEntryWithBalance[];
}

export interface RedeemResult {
  ledger: PointsLedgerRow;
  /** Monetary value of the redeemed points (points * pointValue). */
  amount: number;
  pointValue: number;
}

/**
 * LoyaltyService — the points engine (POST020 earn / POST021 history).
 * Earning is best-effort and idempotent per bill: it never breaks the sale.
 */
@Injectable()
export class LoyaltyService {
  private readonly logger = new Logger(LoyaltyService.name);

  constructor(
    @Inject(LOYALTY_REPOSITORY) private readonly repo: LoyaltyRepository,
  ) {}

  /**
   * Earn points for a completed sale attached to a customer. Returns the
   * ledger movement (or null if nothing earned / no rule). Errors are caught
   * and logged so a loyalty hiccup never fails the underlying sale.
   */
  async earnOnSale(input: EarnOnSaleInput): Promise<PointsLedgerRow | null> {
    try {
      const pointTypNo = input.pointTypNo ?? 1;
      const rule = await this.repo.activeRule(pointTypNo);
      if (!rule) return null;
      const { points, docAmt } = earnPoints(input.billAmount, rule);
      if (!(points > 0)) return null;
      const pointAmt = round4(points * rule.pointValue);
      return await this.repo.insertEarn({
        customerCode: input.customerCode,
        pointTypNo,
        billId: input.billId,
        billNo: input.billNo,
        docAmt,
        pointCnt: points,
        pointAmt,
        shiftId: input.shiftId ?? null,
        cashierNo: input.cashierNo ?? null,
        note: 'earn on sale',
      });
    } catch (err) {
      this.logger.warn(
        { err, customerCode: input.customerCode, billNo: input.billNo },
        'Loyalty earn failed (sale unaffected)',
      );
      return null;
    }
  }

  /**
   * Monetary value of one point (redeem rate) from the active loyalty rule.
   * Defaults to 1 when no rule is configured.
   */
  async pointValue(pointTypNo = 1): Promise<number> {
    const rule = await this.repo.activeRule(pointTypNo);
    return rule?.pointValue ?? 1;
  }

  /**
   * Redeem points as a bill payment (POINTS tender). Verifies the customer's
   * ledger balance covers the requested points, then writes a REDEEM
   * (TRNS_TYPE=2, negative POINT_CNT) movement. UNLIKE earning, a redeem
   * failure MUST fail the payment — no best-effort here.
   */
  async redeemForPayment(input: RedeemForPaymentInput): Promise<RedeemResult> {
    const pointTypNo = input.pointTypNo ?? 1;
    const value = await this.pointValue(pointTypNo);
    const balance = await this.repo.earnedBalance(input.customerCode);
    if (balance.earnedPoints < input.points) {
      throw new InsufficientPointsError(
        `Customer ${input.customerCode} has ${balance.earnedPoints} points; ${input.points} requested`,
        {
          customerCode: input.customerCode,
          available: balance.earnedPoints,
          requested: input.points,
        },
      );
    }
    const amount = round4(input.points * value);
    const ledger = await this.repo.insertRedeem({
      customerCode: input.customerCode,
      pointTypNo,
      billId: input.billId,
      billNo: input.billNo,
      docAmt: amount,
      pointCnt: input.points,
      pointAmt: amount,
      shiftId: input.shiftId ?? null,
      cashierNo: input.cashierNo ?? null,
      note: 'redeem as payment',
    });
    return { ledger, amount, pointValue: value };
  }

  earnedBalance(customerCode: string): Promise<EarnedPointsBalance> {
    return this.repo.earnedBalance(customerCode);
  }

  ledger(customerCode: string, limit: number): Promise<PointsLedgerRow[]> {
    return this.repo.ledger(customerCode, limit);
  }

  /**
   * POST021 — full movement history (earn + redeem/expire/adjust) with a
   * running balance per row. Rows come newest-first; the running balance is
   * derived by walking DOWN from the current total (exact even when the page
   * is limited — older, unfetched rows are already baked into the total).
   */
  async customerLedger(
    customerCode: string,
    limit: number,
  ): Promise<CustomerLedgerView> {
    const [balance, rows] = await Promise.all([
      this.repo.earnedBalance(customerCode),
      this.repo.ledger(customerCode, limit),
    ]);
    let running = balance.earnedPoints;
    const entries: LedgerEntryWithBalance[] = rows.map((r) => {
      const entry: LedgerEntryWithBalance = {
        ...r,
        kind: kindOf(r.trnsType),
        balanceAfter: running,
      };
      running = round4(running - r.pointCnt);
      return entry;
    });
    return { balance, entries };
  }

  /** POST021 — chain-wide granted/redeemed totals. */
  summary(): Promise<LoyaltySummary> {
    return this.repo.summary();
  }
}

function kindOf(trnsType: number): LedgerEntryWithBalance['kind'] {
  switch (trnsType) {
    case 1:
      return 'EARN';
    case 2:
      return 'REDEEM';
    case 3:
      return 'EXPIRE';
    default:
      return 'ADJUST';
  }
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
