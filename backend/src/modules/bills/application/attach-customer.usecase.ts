import { Inject, Injectable, Logger } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import {
  AttachCustomerNotFoundError,
  BillAlreadyHasCustomerError,
  BillNotFoundError,
} from '../../../shared/errors/domain-error';
import { CustomersService } from '../../customers/application/customers.service';
import { LoyaltyService } from '../../loyalty/application/loyalty.service';
import {
  BillWriteRepository,
  BILL_WRITE_REPOSITORY,
  PersistedBill,
} from '../domain/ports/bill-write-repository.port';

export interface AttachCustomerInput {
  billId: string;
  customerCode: string;
  cashierNo?: number | null;
}

export interface AttachCustomerResult {
  bill: PersistedBill;
  /** Points earned by the retroactive attach (0 when already earned/none). */
  pointsEarned: number;
  /** True when the customer was already attached (no-op replay). */
  alreadyAttached: boolean;
}

/**
 * AttachCustomerUseCase — POST020 (ربط الفاتورة بعميل نقاطي رجعياً).
 *
 * Attaches a loyalty customer to an ALREADY-POSTED bill that has no customer,
 * then earns its points retroactively. Safeguards:
 *   * The bill must exist in MOTECH_POS (404).
 *   * The bill must NOT already have a customer (409) — no double-attach.
 *   * The customer must exist (ERP or overlay) (404).
 *   * Earning is idempotent per (billId, TRNS_TYPE=1): the loyalty ledger's
 *     UNIQUE(BILL_ID, TRNS_TYPE) means a re-attach never double-earns. If the
 *     bill somehow already earned points, the attach is still safe.
 */
@Injectable()
export class AttachCustomerUseCase {
  private readonly logger = new Logger(AttachCustomerUseCase.name);

  constructor(
    @Inject(BILL_WRITE_REPOSITORY) private readonly repo: BillWriteRepository,
    private readonly customers: CustomersService,
    private readonly loyalty: LoyaltyService,
  ) {}

  async execute(input: AttachCustomerInput): Promise<AttachCustomerResult> {
    // The path param may be the MOTECH_POS uuid OR the display BILL_NO.
    let bill =
      (await this.repo.findById(input.billId)) ??
      (await this.repo.findByBillNo(input.billId));
    if (!bill) {
      throw new BillNotFoundError(`Bill ${input.billId} not found`, {
        billId: input.billId,
      });
    }

    // Idempotent no-op: same customer already attached → return as-is.
    if (bill.customerCode) {
      if (bill.customerCode === input.customerCode) {
        return { bill, pointsEarned: 0, alreadyAttached: true };
      }
      throw new BillAlreadyHasCustomerError(
        `Bill ${bill.billNo} already has customer ${bill.customerCode}; detach is not permitted`,
        { billId: input.billId, existingCustomer: bill.customerCode },
      );
    }

    // Validate the target customer exists (ERP master merged with overlay).
    let customerName: string | null = null;
    try {
      const cust = await this.customers.findByCode(input.customerCode);
      customerName = cust.arName ?? cust.enName ?? null;
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new AttachCustomerNotFoundError(
          `Customer ${input.customerCode} not found`,
          { customerCode: input.customerCode },
        );
      }
      throw err;
    }

    // Persist the attachment (MOTECH_POS + Onyx header mirror) using the
    // RESOLVED MOTECH_POS id (not the raw path param, which may be a BILL_NO).
    const updated = await this.repo.attachCustomer(
      bill.id,
      input.customerCode,
      customerName,
    );

    // Earn points retroactively — idempotent per bill (never double-earns).
    let pointsEarned = 0;
    const ledger = await this.loyalty.earnOnSale({
      customerCode: input.customerCode,
      billId: updated.id,
      billNo: updated.billNo,
      billAmount: updated.netAmt,
      shiftId: updated.shiftId,
      cashierNo: input.cashierNo ?? updated.cashierNo ?? null,
    });
    if (ledger && ledger.trnsType === 1) {
      pointsEarned = ledger.pointCnt;
    }

    return { bill: updated, pointsEarned, alreadyAttached: false };
  }
}
