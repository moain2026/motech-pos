import { Inject, Injectable, Optional } from '@nestjs/common';
import { CardsService } from '../../cards/application/cards.service';
import { LoyaltyService } from '../../loyalty/application/loyalty.service';
import {
  BillImmutableError,
  BillNotFoundError,
  CouponNotFoundError,
  InsufficientPointsError,
  InvalidBillError,
  PaymentExceedsBalanceError,
} from '../../../shared/errors/domain-error';
import {
  AddPaymentInput,
  BillWriteRepository,
  BILL_WRITE_REPOSITORY,
  PaymentMethod,
  PersistedBill,
} from '../domain/ports/bill-write-repository.port';

export interface PaymentTenderRequest {
  method: PaymentMethod;
  /**
   * Amount in the payment currency (converted via rate to the bill currency).
   * For POINTS this is the NUMBER OF POINTS to redeem (converted to money via
   * the loyalty rule's pointValue). Optional for COUPON (defaults to the
   * coupon's face value).
   */
  amount?: number;
  currency?: string;
  /** Exchange rate to the bill currency (default 1). */
  rate?: number;
  cardNo?: string;
  customerCode?: string;
  /** Coupon number (COUPON tenders). */
  couponNo?: string;
}

export interface AddPaymentRequest extends PaymentTenderRequest {
  billId: string;
}

export interface AddPaymentsRequest {
  billId: string;
  tenders: PaymentTenderRequest[];
}

/**
 * Bill + settlement view. Returns the FULL persisted bill (backward-compatible:
 * still exposes billNo/paidAmt/netAmt/payments/...) AUGMENTED with settlement
 * fields (outstanding / change / fullyPaid) and a nested `bill` alias.
 */
export type BillSettlement = PersistedBill & {
  /** Remaining amount still owed (>= 0). */
  outstanding: number;
  /** Overtender / change due (fakka) on cash overpayment (>= 0). */
  change: number;
  fullyPaid: boolean;
  /** Alias to the persisted bill (for callers preferring an explicit nesting). */
  bill: PersistedBill;
};

const CHANGE_METHODS = new Set(['CASH']);

/**
 * AddPaymentUseCase — records payment(s) for a posted bill and reconciles the
 * settlement (multi-tender, partial, multi-currency).
 *
 * Rules (mirrors POST001 payment canvases / IAS_POS_PAY_BILLS, FLOW_PAYMENT):
 *   - The bill totals are IMMUTABLE; only PAID_AMT is recomputed from the
 *     payment lines (single source of truth).
 *   - Several methods may settle one bill (cash + card + credit), accumulating
 *     across calls until the bill net is reached (partial payments).
 *   - Each tender may be in a different currency; AMOUNT_IN_BILL = amount * rate
 *     is what counts toward the bill total (IAS_DEPOSIT_CURRENCY_MST semantics).
 *   - The bill-currency total of non-CASH tenders may NOT exceed the outstanding
 *     balance (no overpay on card/credit → 422). CASH may overtender; the excess
 *     is reported as `change` (fakka) and does NOT inflate PAID_AMT beyond net.
 *   - CREDIT requires a customerCode (credit account).
 */
@Injectable()
export class AddPaymentUseCase {
  constructor(
    @Inject(BILL_WRITE_REPOSITORY) private readonly repo: BillWriteRepository,
    @Optional() private readonly loyalty?: LoyaltyService,
    @Optional() private readonly cards?: CardsService,
  ) {}

  /** Add a single payment tender. */
  async execute(req: AddPaymentRequest): Promise<BillSettlement> {
    return this.executeMany({ billId: req.billId, tenders: [req] });
  }

  /** Add several payment tenders in one settlement (cash + card + credit …). */
  async executeMany(req: AddPaymentsRequest): Promise<BillSettlement> {
    if (!req.tenders || req.tenders.length === 0) {
      throw new InvalidBillError('At least one payment tender is required', {
        billId: req.billId,
      });
    }

    const bill = await this.repo.findById(req.billId);
    if (!bill) {
      throw new BillNotFoundError(`Bill ${req.billId} not found`, {
        billId: req.billId,
      });
    }
    if (bill.status !== 'POSTED') {
      throw new BillImmutableError(
        `Bill ${req.billId} is ${bill.status}; cannot add payment`,
        { billId: req.billId, status: bill.status },
      );
    }

    // Validate every tender BEFORE writing any (all-or-nothing at the request
    // level; each repo.addPayment recomputes PAID_AMT from the lines).
    for (const t of req.tenders) {
      if (t.method === 'CREDIT' && !t.customerCode) {
        throw new InvalidBillError(
          'Credit payment requires a customerCode (credit account)',
          { billId: req.billId },
        );
      }
      if (t.method === 'POINTS') {
        const custCode = t.customerCode ?? bill.customerCode;
        if (!custCode) {
          throw new InvalidBillError(
            'Points payment requires a customerCode (loyalty account)',
            { billId: req.billId },
          );
        }
        if (!this.loyalty) {
          throw new InvalidBillError('Points payment is not available', {
            billId: req.billId,
          });
        }
      }
      if (t.method === 'COUPON') {
        if (!t.couponNo) {
          throw new InvalidBillError('Coupon payment requires a couponNo', {
            billId: req.billId,
          });
        }
        if (!this.cards) {
          throw new InvalidBillError('Coupon payment is not available', {
            billId: req.billId,
          });
        }
      }
      if (t.method !== 'COUPON' || t.amount != null) {
        if (!Number.isFinite(t.amount) || (t.amount as number) <= 0) {
          throw new InvalidBillError('Payment amount must be positive', {
            billId: req.billId,
          });
        }
      }
      const rate = t.rate ?? 1;
      if (!Number.isFinite(rate) || rate <= 0) {
        throw new InvalidBillError('Exchange rate must be positive', {
          billId: req.billId,
        });
      }
    }

    // Resolve non-cash tender amounts (points → money, coupon → face value)
    // BEFORE any write. POINTS: amount = points * pointValue (loyalty rule).
    // COUPON: verified against IAS_CPN_MST; unknown coupon → 422.
    const resolved: ResolvedTender[] = [];
    for (const t of req.tenders) {
      if (t.method === 'POINTS') {
        const custCode = (t.customerCode ?? bill.customerCode) as string;
        const points = t.amount as number;
        const value = await this.loyalty!.pointValue();
        const balance = await this.loyalty!.earnedBalance(custCode);
        if (balance.earnedPoints < points) {
          // Surface insufficiency early (redeemForPayment re-checks on write).
          throw new InsufficientPointsError(
            `Customer ${custCode} has ${balance.earnedPoints} points; ${points} requested`,
            {
              billId: req.billId,
              customerCode: custCode,
              available: balance.earnedPoints,
              requested: points,
            },
          );
        }
        resolved.push({
          tender: t,
          amount: round4(points * value),
          points,
          customerCode: custCode,
        });
      } else if (t.method === 'COUPON') {
        const coupon = await this.cards!.findCoupon(t.couponNo as string);
        if (!coupon) {
          throw new CouponNotFoundError(
            `Coupon ${t.couponNo} not found in IAS_CPN_MST`,
            { billId: req.billId, couponNo: t.couponNo },
          );
        }
        const amount = t.amount ?? coupon.value ?? 0;
        if (!(amount > 0)) {
          throw new InvalidBillError(
            `Coupon ${t.couponNo} has no usable value`,
            { billId: req.billId, couponNo: t.couponNo },
          );
        }
        resolved.push({ tender: t, amount });
      } else {
        resolved.push({ tender: t, amount: t.amount as number });
      }
    }

    // Running outstanding balance in the bill currency.
    let outstanding = round4(bill.netAmt - bill.paidAmt);
    let change = 0;

    for (const r of resolved) {
      const t = r.tender;
      const rate = t.rate ?? 1;
      const inBill = round4(r.amount * rate);

      if (CHANGE_METHODS.has(t.method)) {
        // Cash may overtender: the excess becomes change (fakka).
        if (inBill - outstanding > EPS) {
          change = round4(change + (inBill - outstanding));
        }
      } else if (inBill - outstanding > EPS) {
        // Non-cash must not exceed the outstanding balance.
        throw new PaymentExceedsBalanceError(
          `${t.method} payment ${inBill} exceeds outstanding balance ${outstanding}`,
          {
            billId: req.billId,
            method: t.method,
            amountInBill: inBill,
            outstanding,
          },
        );
      }

      // POINTS: deduct from the ledger FIRST (redeem write validates balance
      // and is idempotent per bill) — if it fails, no payment row is written.
      if (t.method === 'POINTS') {
        await this.loyalty!.redeemForPayment({
          customerCode: r.customerCode as string,
          billId: bill.id,
          billNo: bill.billNo,
          points: r.points as number,
          shiftId: bill.shiftId,
          cashierNo: bill.cashierNo,
        });
      }

      const input: AddPaymentInput = {
        billId: bill.id,
        shiftId: bill.shiftId,
        method: t.method,
        currency: t.currency ?? bill.currency,
        amount: r.amount,
        rate,
        cardNo: t.cardNo ?? null,
        customerCode: (t.customerCode ?? r.customerCode) ?? null,
        couponNo: t.couponNo ?? null,
      };
      await this.repo.addPayment(input);
      outstanding = round4(Math.max(0, outstanding - inBill));
    }

    const updated = await this.repo.findById(bill.id);
    if (!updated) throw new Error('addPayment: bill vanished after write');
    return this.settlement(updated, change);
  }

  private settlement(bill: PersistedBill, change: number): BillSettlement {
    // PAID_AMT is the raw sum of tenders; cap the "counted toward net" at net so
    // outstanding never goes negative and overtender shows as change.
    const paidTowardNet = Math.min(bill.paidAmt, bill.netAmt);
    const outstanding = round4(Math.max(0, bill.netAmt - paidTowardNet));
    return {
      ...bill,
      bill,
      outstanding,
      change: round4(change),
      fullyPaid: outstanding <= EPS,
    };
  }
}

/** A tender with its resolved bill-currency-side amount. */
interface ResolvedTender {
  tender: PaymentTenderRequest;
  /** Monetary amount in the tender currency (points/coupon already valued). */
  amount: number;
  /** POINTS only: number of points to redeem. */
  points?: number;
  /** POINTS only: the loyalty customer. */
  customerCode?: string;
}

const EPS = 0.0001;

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
