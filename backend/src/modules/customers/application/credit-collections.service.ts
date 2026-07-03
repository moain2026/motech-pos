import { Inject, Injectable } from '@nestjs/common';
import {
  CollectionExceedsDebtError,
  CreditBillNotFoundError,
  InvalidCollectionError,
} from '../../../shared/errors/domain-error';
import {
  CollectionRow,
  CreditBillRow,
  CreditCollectionsRepository,
  CREDIT_COLLECTIONS_REPOSITORY,
} from '../domain/ports/credit-collections.port';

export interface CollectInput {
  customerCode: string;
  billId: string;
  method?: 'CASH' | 'CARD';
  /** Amount in the receipt currency. */
  amount: number;
  currency?: string;
  /** Exchange rate to the bill currency (default 1). */
  rate?: number;
  cashierNo?: number | null;
  note?: string | null;
  idempotencyKey: string;
}

export interface CollectResult {
  collection: CollectionRow;
  /** The credit bill AFTER the receipt (fresh outstanding/status). */
  bill: CreditBillRow;
  replayed: boolean;
}

export interface CreditBillsView {
  customerCode: string;
  bills: CreditBillRow[];
  /** Total remaining debt across the listed bills. */
  totalOutstanding: number;
}

const EPS = 0.0001;

/**
 * CreditCollectionsService — POST010/011: collecting credit (آجل) bills.
 * A CREDIT tender leaves the customer owing the amount; this service lists
 * that debt per bill and records later CASH/CARD receipts against it, never
 * letting collections exceed the outstanding debt. Idempotent per key.
 */
@Injectable()
export class CreditCollectionsService {
  constructor(
    @Inject(CREDIT_COLLECTIONS_REPOSITORY)
    private readonly repo: CreditCollectionsRepository,
  ) {}

  /** Customer's credit bills + debtor balance. openOnly=true → unsettled only. */
  async creditBills(
    customerCode: string,
    openOnly: boolean,
  ): Promise<CreditBillsView> {
    const bills = await this.repo.creditBills(customerCode, openOnly);
    const totalOutstanding = round4(
      bills.reduce((s, b) => s + b.outstanding, 0),
    );
    return { customerCode, bills, totalOutstanding };
  }

  /**
   * Record a collection receipt against one credit bill.
   * Guards: bill must belong to the customer and carry CREDIT debt (404),
   * amount/rate positive (422), receipt must not exceed the outstanding
   * debt (422). Replays via idempotencyKey return the original receipt.
   */
  async collect(input: CollectInput): Promise<CollectResult> {
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      throw new InvalidCollectionError('Collection amount must be positive', {
        customerCode: input.customerCode,
        billId: input.billId,
      });
    }
    const rate = input.rate ?? 1;
    if (!Number.isFinite(rate) || rate <= 0) {
      throw new InvalidCollectionError('Exchange rate must be positive', {
        customerCode: input.customerCode,
        billId: input.billId,
      });
    }

    // Idempotent replay: same key → same receipt, no double-collect.
    const existing = await this.repo.findByIdempotencyKey(
      input.idempotencyKey,
    );
    if (existing) {
      const bill = await this.repo.creditBill(
        input.customerCode,
        existing.billId,
      );
      if (!bill) throw new Error('collect: bill vanished on replay');
      return { collection: existing, bill, replayed: true };
    }

    const bill = await this.repo.creditBill(input.customerCode, input.billId);
    if (!bill) {
      throw new CreditBillNotFoundError(
        `Bill ${input.billId} has no credit debt for customer ${input.customerCode}`,
        { customerCode: input.customerCode, billId: input.billId },
      );
    }

    const amountInBill = round4(input.amount * rate);
    if (amountInBill - bill.outstanding > EPS) {
      throw new CollectionExceedsDebtError(
        `Collection ${amountInBill} exceeds outstanding debt ${bill.outstanding} on bill ${bill.billNo}`,
        {
          customerCode: input.customerCode,
          billId: input.billId,
          billNo: bill.billNo,
          amountInBill,
          outstanding: bill.outstanding,
        },
      );
    }

    const collection = await this.repo.insertCollection({
      billId: input.billId,
      customerCode: input.customerCode,
      method: input.method ?? 'CASH',
      currency: input.currency ?? bill.currency,
      amount: input.amount,
      rate,
      amountInBill,
      cashierNo: input.cashierNo ?? null,
      note: input.note ?? null,
      idempotencyKey: input.idempotencyKey,
    });

    const updated = await this.repo.creditBill(
      input.customerCode,
      input.billId,
    );
    if (!updated) throw new Error('collect: bill vanished after receipt');
    return { collection, bill: updated, replayed: false };
  }
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
