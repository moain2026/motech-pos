import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  EarnedPointsBalance,
  LoyaltyRepository,
  LOYALTY_REPOSITORY,
  PointsLedgerRow,
} from '../domain/ports/loyalty-repository.port';
import { earnPoints } from '../domain/points-policy';

export interface EarnOnSaleInput {
  customerCode: string;
  billId: string | null;
  billNo: string | null;
  billAmount: number;
  shiftId?: string | null;
  cashierNo?: number | null;
  pointTypNo?: number;
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

  earnedBalance(customerCode: string): Promise<EarnedPointsBalance> {
    return this.repo.earnedBalance(customerCode);
  }

  ledger(customerCode: string, limit: number): Promise<PointsLedgerRow[]> {
    return this.repo.ledger(customerCode, limit);
  }
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
