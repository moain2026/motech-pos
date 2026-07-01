import { Inject, Injectable } from '@nestjs/common';
import { ReturnNotFoundError } from '../../../shared/errors/domain-error';
import {
  ReturnListFilter,
  ReturnRepository,
  RETURN_REPOSITORY,
} from '../domain/ports/return-repository.port';
import {
  ReturnWriteRepository,
  RETURN_WRITE_REPOSITORY,
} from '../domain/ports/return-write-repository.port';

/**
 * ReturnsService (application layer) — orchestrates read use cases. No SQL;
 * depends on the ReturnRepository ports (Dependency Inversion). Returns list
 * unifies our own MOTECH_POS returns with the legacy YSPOS23 RT bills.
 */
@Injectable()
export class ReturnsService {
  constructor(
    @Inject(RETURN_REPOSITORY) private readonly repo: ReturnRepository,
    @Inject(RETURN_WRITE_REPOSITORY)
    private readonly writeRepo: ReturnWriteRepository,
  ) {}

  /** List returns — legacy YSPOS23 RT bills (paginated). */
  list(filter: ReturnListFilter) {
    return this.repo.list(filter);
  }

  /**
   * Fetch a single return by id.
   *  - UUID id  → our MOTECH_POS return (header + lines).
   *  - RT number → legacy YSPOS23 RT bill (header + lines, recomputed totals).
   */
  async getById(id: string) {
    // Try our own write schema first (UUID-shaped ids).
    const persisted = await this.writeRepo.findById(id);
    if (persisted) {
      return { source: 'MOTECH_POS' as const, data: persisted };
    }

    const legacy = await this.repo.findByNo(id);
    if (!legacy) {
      throw new ReturnNotFoundError(`Return ${id} not found`, { id });
    }
    const totals = legacy.ret.totals();
    return {
      source: 'YSPOS23' as const,
      data: {
        rtBillNo: legacy.ret.rtBillNo,
        originalBillNo: legacy.ret.originalBillNo || null,
        rtBillDate: legacy.ret.rtBillDate?.toISOString() ?? null,
        returnType: legacy.ret.returnType,
        customer: {
          code: legacy.ret.cCode ?? null,
          name: legacy.ret.cName ?? null,
        },
        machineNo: legacy.ret.machineNo ?? null,
        lines: legacy.ret.lines.map((l) => ({
          iCode: l.iCode,
          qty: l.qty,
          price: l.price.toNumber(),
          discount: l.lineDiscount().toNumber(),
          vat: l.lineVat(legacy.ret.vatCalcType).toNumber(),
          net: l.lineNet().toNumber(),
          replaceAmount: l.replaceAmount.toNumber(),
          itmUnit: l.itmUnit ?? null,
        })),
        totals: {
          gross: totals.gross.toNumber(),
          discount: totals.discount.toNumber(),
          vat: totals.vat.toNumber(),
          net: totals.net.toNumber(),
        },
        stored: {
          rtBillAmt: legacy.stored.rtBillAmt,
          vatAmt: legacy.stored.vatAmt,
          discAmt: legacy.stored.discAmt,
          payedAmt: legacy.stored.payedAmt,
        },
      },
    };
  }
}
