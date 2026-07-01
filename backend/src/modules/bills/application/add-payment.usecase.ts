import { Inject, Injectable } from '@nestjs/common';
import {
  BillImmutableError,
  BillNotFoundError,
  InvalidBillError,
  PaymentExceedsBalanceError,
} from '../../../shared/errors/domain-error';
import {
  AddPaymentInput,
  BillWriteRepository,
  BILL_WRITE_REPOSITORY,
  PersistedBill,
} from '../domain/ports/bill-write-repository.port';

export interface PaymentTenderRequest {
  method: 'CASH' | 'CARD' | 'CREDIT';
  /** Amount in the payment currency (converted via rate to the bill currency). */
  amount: number;
  currency?: string;
  /** Exchange rate to the bill currency (default 1). */
  rate?: number;
  cardNo?: string;
  customerCode?: string;
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
      if (!Number.isFinite(t.amount) || t.amount <= 0) {
        throw new InvalidBillError('Payment amount must be positive', {
          billId: req.billId,
        });
      }
      const rate = t.rate ?? 1;
      if (!Number.isFinite(rate) || rate <= 0) {
        throw new InvalidBillError('Exchange rate must be positive', {
          billId: req.billId,
        });
      }
    }

    // Running outstanding balance in the bill currency.
    let outstanding = round4(bill.netAmt - bill.paidAmt);
    let change = 0;

    for (const t of req.tenders) {
      const rate = t.rate ?? 1;
      const inBill = round4(t.amount * rate);

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

      const input: AddPaymentInput = {
        billId: bill.id,
        shiftId: bill.shiftId,
        method: t.method,
        currency: t.currency ?? bill.currency,
        amount: t.amount,
        rate,
        cardNo: t.cardNo ?? null,
        customerCode: t.customerCode ?? null,
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

const EPS = 0.0001;

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
