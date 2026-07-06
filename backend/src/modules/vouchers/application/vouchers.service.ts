import { Inject, Injectable } from '@nestjs/common';
import { VoucherNotFoundError } from '../../../shared/errors/domain-error';
import {
  PersistedVoucher,
  VoucherListFilter,
  VoucherRepository,
  VoucherShiftTotals,
  VOUCHER_REPOSITORY,
} from '../domain/ports/voucher-repository.port';

/**
 * VouchersService — read orchestration for cash vouchers. Also exposes the
 * per-shift cash totals used by the shift-close reconciliation.
 */
@Injectable()
export class VouchersService {
  constructor(
    @Inject(VOUCHER_REPOSITORY) private readonly repo: VoucherRepository,
  ) {}

  list(filter: VoucherListFilter): Promise<PersistedVoucher[]> {
    return this.repo.list(filter);
  }

  async getById(id: string): Promise<PersistedVoucher> {
    const v = await this.repo.findById(id);
    if (!v) {
      throw new VoucherNotFoundError(`Voucher ${id} not found`, { id });
    }
    return v;
  }

  /** Cash receipts/expenses for a shift (feeds reconciliation). */
  shiftCashTotals(shiftId: string): Promise<VoucherShiftTotals> {
    return this.repo.shiftCashTotals(shiftId);
  }

  /** POST006: the refund voucher already issued for a return, or null. */
  findByRefundReturnId(returnId: string): Promise<PersistedVoucher | null> {
    return this.repo.findByRefundReturnId(returnId);
  }
}
