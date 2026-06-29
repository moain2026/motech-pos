import { Inject, Injectable } from '@nestjs/common';
import { BillNotFoundError } from '../../../shared/errors/domain-error';
import {
  BillListFilter,
  BillRepository,
  BILL_REPOSITORY,
} from '../domain/ports/bill-repository.port';

/**
 * BillsService (application layer) — orchestrates use cases. No SQL here;
 * depends on the BillRepository port (Dependency Inversion, STANDARDS/03 §6).
 */
@Injectable()
export class BillsService {
  constructor(
    @Inject(BILL_REPOSITORY) private readonly repo: BillRepository,
  ) {}

  list(filter: BillListFilter) {
    return this.repo.list(filter);
  }

  async getByNo(billNo: string) {
    const found = await this.repo.findByNo(billNo);
    if (!found) {
      throw new BillNotFoundError(`Bill ${billNo} not found`, { billNo });
    }
    const totals = found.bill.totals();
    return {
      billNo: found.bill.billNo,
      billDate: found.bill.billDate?.toISOString() ?? null,
      billType: found.bill.billType,
      customer: { code: found.bill.cCode ?? null, name: found.bill.cName ?? null },
      machineNo: found.bill.machineNo ?? null,
      lines: found.bill.lines.map((l) => ({
        iCode: l.iCode,
        qty: l.qty,
        freeQty: l.freeQty,
        price: l.price.toNumber(),
        discount: l.lineDiscount().toNumber(),
        vat: l.lineVat(found.bill.vatCalcType, found.bill.taxFreeQtyFlag).toNumber(),
        net: l.lineNet().toNumber(),
        itmUnit: l.itmUnit ?? null,
      })),
      // Re-computed totals (domain truth) alongside the stored header values.
      totals: {
        gross: totals.gross.toNumber(),
        discount: totals.discount.toNumber(),
        vat: totals.vat.toNumber(),
        net: totals.net.toNumber(),
      },
      stored: {
        billAmt: found.stored.billAmt,
        vatAmt: found.stored.vatAmt,
        discAmt: found.stored.discAmt,
        payedAmt: found.stored.payedAmt,
      },
    };
  }

  dailySummary(from?: string, to?: string) {
    return this.repo.dailySummary(from, to);
  }
}
