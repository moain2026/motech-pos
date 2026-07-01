import { Inject, Injectable, Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';
import {
  IdempotencyConflictError,
  InvalidBillError,
  ItemNotOnOriginalBillError,
  OriginalBillNotFoundError,
  ReturnQtyExceededError,
} from '../../../shared/errors/domain-error';
import { ShiftsService } from '../../shifts/application/shifts.service';
import { Return } from '../domain/entities/return.entity';
import {
  ReturnLine,
  ReturnVatCalcType,
} from '../domain/entities/return-line.entity';
import {
  OriginalBillReader,
  ORIGINAL_BILL_REFERENCE,
} from '../domain/ports/original-bill.port';
import {
  InsertReturnInput,
  PersistedReturn,
  PersistedReturnLine,
  ReturnIdempotencyUniqueViolation,
  ReturnWriteRepository,
  RETURN_WRITE_REPOSITORY,
} from '../domain/ports/return-write-repository.port';

/** One requested return line (from the client). */
export interface CreateReturnLineInput {
  itemCode: string;
  qty: number;
  /** Optional override price; when omitted, the original sale price is used. */
  unitPrice?: number;
  /** Optional override VAT% (else taken from the original line). */
  vatPercent?: number;
  /** Replacement amount (RT_RPLC_AMT) for item-swap returns. */
  replaceAmount?: number;
}

export interface CreateReturnInput {
  idempotencyKey: string;
  /** the ORIGINAL bill being (partially) returned. */
  originalBillNo: string;
  cashierNo: number;
  machineNo?: number;
  /** RETURN_TYPE classifier (default 3 = cash refund). */
  returnType?: number;
  currency?: string;
  clientOperationId?: string;
  lines: CreateReturnLineInput[];
}

/**
 * CreateReturnUseCase — the return write-side core (analogue of
 * EXTRCT_POS_RT_BILL_PRC / FLOW_RETURN.md).
 *
 * Pipeline (guarded by Idempotency-Key):
 *   1. Idempotency replay: same key + same body → return the original doc.
 *      Same key + different body → 409 idempotency-conflict.
 *   2. Selling precondition: cashier MUST have an OPEN shift.
 *   3. Verify the ORIGINAL bill exists (CHK_BILL_NO_ST_PRC analogue).
 *   4. For each returned line: it must have been sold; the returned qty must
 *      not exceed sold qty minus what was already returned (over-return guard).
 *   5. Compute reversed totals via the Return aggregate (gross/discount/vat/net).
 *   6. Persist header + lines atomically into MOTECH_POS.
 */
@Injectable()
export class CreateReturnUseCase {
  private readonly logger = new Logger(CreateReturnUseCase.name);

  constructor(
    @Inject(RETURN_WRITE_REPOSITORY)
    private readonly repo: ReturnWriteRepository,
    @Inject(ORIGINAL_BILL_REFERENCE)
    private readonly originalBills: OriginalBillReader,
    private readonly shifts: ShiftsService,
  ) {}

  async execute(
    input: CreateReturnInput,
  ): Promise<{ ret: PersistedReturn; replayed: boolean }> {
    if (!input.lines || input.lines.length === 0) {
      throw new InvalidBillError('Return must have at least one line', {});
    }
    if (!input.originalBillNo) {
      throw new InvalidBillError('Return requires an originalBillNo', {});
    }

    const requestHash = this.hashRequest(input);

    // (1) Idempotency replay.
    const existing = await this.repo.findByIdempotencyKey(input.idempotencyKey);
    if (existing) {
      if (existing.clientOpId && existing.clientOpId !== requestHash) {
        throw new IdempotencyConflictError(
          'Idempotency-Key was used with a different request body',
          { idempotencyKey: input.idempotencyKey },
        );
      }
      return { ret: existing, replayed: true };
    }

    // (2) Selling precondition: open shift (throws 409 if none).
    const shift = await this.shifts.current(input.cashierNo);
    const currency = input.currency ?? shift.currency ?? 'YER';

    // (3) Verify the original bill exists.
    const original = await this.originalBills.findByNo(input.originalBillNo);
    if (!original) {
      throw new OriginalBillNotFoundError(
        `Original bill ${input.originalBillNo} not found`,
        { originalBillNo: input.originalBillNo },
      );
    }
    const soldByCode = new Map(original.lines.map((l) => [l.itemCode, l]));

    // (4) Over-return guard: sum previously-returned qty from MOTECH_POS.
    const alreadyReturned = await this.repo.returnedQtyForOriginal(
      input.originalBillNo,
    );
    const returnedByCode = new Map(
      alreadyReturned.map((r) => [r.itemCode, r.qtyReturned]),
    );

    const taxCalcType =
      original.vatCalcType === 1
        ? ReturnVatCalcType.ON_PRICE
        : ReturnVatCalcType.AFTER_DISCOUNT;

    const domainLines: ReturnLine[] = [];
    const resolvedMeta: Array<{ name: string | null; unit: string | null }> =
      [];

    for (const line of input.lines) {
      const sold = soldByCode.get(line.itemCode);
      if (!sold) {
        throw new ItemNotOnOriginalBillError(
          `Item ${line.itemCode} was not sold on bill ${input.originalBillNo}`,
          { itemCode: line.itemCode, originalBillNo: input.originalBillNo },
        );
      }
      const previously = returnedByCode.get(line.itemCode) ?? 0;
      const remaining = sold.qtySold - previously;
      if (line.qty > remaining + 1e-9) {
        throw new ReturnQtyExceededError(
          `Cannot return ${line.qty} of ${line.itemCode}: sold ${sold.qtySold}, already returned ${previously}, remaining ${remaining}`,
          {
            itemCode: line.itemCode,
            qtyRequested: line.qty,
            qtySold: sold.qtySold,
            qtyAlreadyReturned: previously,
            qtyRemaining: remaining,
          },
        );
      }

      domainLines.push(
        new ReturnLine({
          iCode: line.itemCode,
          qty: line.qty,
          price: line.unitPrice ?? sold.unitPrice,
          discDtl: sold.discDtl,
          discMst: sold.discMst,
          vatPercent: line.vatPercent ?? sold.vatPercent,
          replaceAmount: line.replaceAmount ?? 0,
          itmUnit: sold.itemUnit ?? undefined,
        }),
      );
      resolvedMeta.push({ name: null, unit: sold.itemUnit });
    }

    const ret = new Return({
      rtBillNo: 'PENDING',
      originalBillNo: input.originalBillNo,
      returnType: input.returnType ?? 3,
      vatCalcType: taxCalcType,
      lines: domainLines,
    });
    const totals = ret.totals();

    const persistLines: PersistedReturnLine[] = domainLines.map((l, i) => ({
      lineNo: i + 1,
      itemCode: l.iCode,
      itemName: resolvedMeta[i].name,
      qty: l.qty,
      unitPrice: l.price.toNumber(),
      discDtl: l.discDtl.toNumber(),
      discMst: l.discMst.toNumber(),
      vatPercent: l.vatPercent,
      lineGross: l.lineGross().toNumber(),
      lineDiscount: l.lineDiscount().toNumber(),
      lineVat: l.lineVat(taxCalcType).toNumber(),
      lineNet: l.lineNet().toNumber(),
      replaceAmount: l.replaceAmount.toNumber(),
      itemUnit: l.itmUnit ?? null,
    }));

    // Refund amount = net reversed minus any replacement value (item swap).
    const replaceTotal = domainLines.reduce(
      (a, l) => a + l.replaceAmount.toNumber(),
      0,
    );
    const refundAmt = round4(totals.net.toNumber() - replaceTotal);

    const insert: InsertReturnInput = {
      originalBillNo: input.originalBillNo,
      originalBillId: null,
      shiftId: shift.id,
      cashierNo: input.cashierNo,
      machineNo: input.machineNo ?? shift.machineNo ?? original.machineNo ?? null,
      returnType: input.returnType ?? 3,
      customerCode: original.cCode,
      customerName: original.cName,
      currency,
      taxCalcType,
      grossAmt: totals.gross.toNumber(),
      discountAmt: totals.discount.toNumber(),
      vatAmt: totals.vat.toNumber(),
      netAmt: totals.net.toNumber(),
      refundAmt,
      idempotencyKey: input.idempotencyKey,
      clientOpId: requestHash,
      lines: persistLines,
    };

    try {
      const persisted = await this.repo.insertReturn(insert);
      return { ret: persisted, replayed: false };
    } catch (err) {
      if (err instanceof ReturnIdempotencyUniqueViolation) {
        const winner = await this.repo.findByIdempotencyKey(
          input.idempotencyKey,
        );
        if (winner) {
          this.logger.warn(
            { idempotencyKey: input.idempotencyKey },
            'Return idempotency race resolved to existing document',
          );
          return { ret: winner, replayed: true };
        }
      }
      throw err;
    }
  }

  /** Stable hash of the value-affecting request fields (idempotency body check). */
  private hashRequest(input: CreateReturnInput): string {
    const canonical = JSON.stringify({
      originalBillNo: input.originalBillNo,
      cashierNo: input.cashierNo,
      machineNo: input.machineNo ?? null,
      returnType: input.returnType ?? 3,
      lines: input.lines.map((l) => ({
        itemCode: l.itemCode,
        qty: l.qty,
        unitPrice: l.unitPrice ?? null,
        vatPercent: l.vatPercent ?? null,
        replaceAmount: l.replaceAmount ?? 0,
      })),
    });
    return createHash('sha256').update(canonical).digest('hex').slice(0, 36);
  }
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
