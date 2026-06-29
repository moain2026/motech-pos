import { Inject, Injectable } from '@nestjs/common';
import {
  BillImmutableError,
  BillNotFoundError,
  InvalidBillError,
} from '../../../shared/errors/domain-error';
import {
  AddPaymentInput,
  BillWriteRepository,
  BILL_WRITE_REPOSITORY,
  PersistedBill,
} from '../domain/ports/bill-write-repository.port';

export interface AddPaymentRequest {
  billId: string;
  method: 'CASH' | 'CARD' | 'CREDIT';
  amount: number;
  currency?: string;
  rate?: number;
  cardNo?: string;
  customerCode?: string;
}

/**
 * AddPaymentUseCase — records a payment line for a posted bill (cash/card/
 * credit). The bill totals are immutable; only PAID_AMT is recomputed from the
 * payment lines. Credit payments require a customer code.
 */
@Injectable()
export class AddPaymentUseCase {
  constructor(
    @Inject(BILL_WRITE_REPOSITORY) private readonly repo: BillWriteRepository,
  ) {}

  async execute(req: AddPaymentRequest): Promise<PersistedBill> {
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
    if (req.method === 'CREDIT' && !req.customerCode) {
      throw new InvalidBillError(
        'Credit payment requires a customerCode (credit account)',
        { billId: req.billId },
      );
    }
    if (req.amount <= 0) {
      throw new InvalidBillError('Payment amount must be positive', {
        billId: req.billId,
      });
    }

    const input: AddPaymentInput = {
      billId: bill.id,
      shiftId: bill.shiftId,
      method: req.method,
      currency: req.currency ?? bill.currency,
      amount: req.amount,
      rate: req.rate ?? 1,
      cardNo: req.cardNo ?? null,
      customerCode: req.customerCode ?? null,
    };
    return this.repo.addPayment(input);
  }
}
