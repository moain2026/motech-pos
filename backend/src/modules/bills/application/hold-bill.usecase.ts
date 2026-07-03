import { Inject, Injectable, Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';
import {
  HeldBillNotFoundError,
  HeldBillNotResumableError,
  InvalidBillError,
} from '../../../shared/errors/domain-error';
import { uuidv7 } from '../../../shared/domain/uuid';
import { ShiftsService } from '../../shifts/application/shifts.service';
import { Bill } from '../domain/entities/bill.entity';
import { BillLine, VatCalcType } from '../domain/entities/bill-line.entity';
import {
  HeldBillLine,
  HeldBillWriteRepository,
  HELD_BILL_REPOSITORY,
  HeldIdempotencyUniqueViolation,
  PersistedHeldBill,
} from '../domain/ports/held-bill-repository.port';
import {
  ItemReferenceReader,
  ITEM_REFERENCE,
} from '../domain/ports/item-reference.port';
import {
  BillWriteRepository,
  BILL_WRITE_REPOSITORY,
  PersistedBill,
} from '../domain/ports/bill-write-repository.port';
import { PostBillLineInput, PostBillUseCase } from './post-bill.usecase';

export interface HoldBillLineInput {
  itemCode: string;
  qty: number;
  unitPrice?: number;
  discDtl?: number;
  freeQty?: number;
  vatPercent?: number;
  itemName?: string;
}

export interface HoldBillInput {
  idempotencyKey: string;
  cashierNo: number;
  machineNo?: number;
  label?: string;
  customerCode?: string;
  customerName?: string;
  currency?: string;
  taxCalcType?: VatCalcType;
  headerDiscount?: number;
  clientOperationId?: string;
  lines: HoldBillLineInput[];
}

export interface ResumeBillInput {
  heldId: string;
  cashierNo: number;
  /** Idempotency-Key for the resulting POSTED bill. */
  idempotencyKey: string;
  /** Verified JWT role of the actor — gates price overrides on resume. */
  actorRole?: import('../../auth/domain/user.entity').Role;
}

/**
 * HoldBillUseCase — parks an in-progress sale (POST003 / IAS_POS_HUNG_BILLS).
 *
 * Hold: requires an open shift, snapshots the cart (lines + header discount +
 * customer + tax type) into MOTECH_POS.HELD_BILLS. Idempotent (replay-safe).
 * The estimated net is computed with the same domain aggregate used for a real
 * bill (display only — the authoritative totals are recomputed on resume).
 *
 * Resume: reconstructs the parked cart and posts it as a normal bill through
 * PostBillUseCase (prices/VAT resolved fresh), then marks the held record
 * RESUMED and links the produced BILLS.ID. Resuming an already-resumed hold
 * returns the previously produced bill (idempotent) rather than duplicating.
 */
@Injectable()
export class HoldBillUseCase {
  private readonly logger = new Logger(HoldBillUseCase.name);

  constructor(
    @Inject(HELD_BILL_REPOSITORY)
    private readonly repo: HeldBillWriteRepository,
    @Inject(ITEM_REFERENCE) private readonly items: ItemReferenceReader,
    @Inject(BILL_WRITE_REPOSITORY)
    private readonly bills: BillWriteRepository,
    private readonly shifts: ShiftsService,
    private readonly postBill: PostBillUseCase,
  ) {}

  //--------------------------------------------------------------------------
  // HOLD
  //--------------------------------------------------------------------------
  async hold(
    input: HoldBillInput,
  ): Promise<{ held: PersistedHeldBill; replayed: boolean }> {
    if (!input.lines || input.lines.length === 0) {
      throw new InvalidBillError('Held bill must have at least one line', {});
    }

    const requestHash = this.hashRequest(input);

    // (1) Idempotency replay.
    const existing = await this.repo.findByIdempotencyKey(input.idempotencyKey);
    if (existing) {
      return { held: existing, replayed: true };
    }

    // (2) Selling precondition: open shift (throws 409 if none).
    const shift = await this.shifts.current(input.cashierNo);
    const taxCalcType = input.taxCalcType ?? VatCalcType.AFTER_DISCOUNT;
    const currency = input.currency ?? shift.currency ?? 'YER';

    // (3) Estimate the net for display (resolve missing prices from reference).
    const estNet = await this.estimateNet(input, taxCalcType);

    const snapshotLines: HeldBillLine[] = input.lines.map((l) => ({
      itemCode: l.itemCode,
      qty: l.qty,
      unitPrice: l.unitPrice ?? null,
      discDtl: l.discDtl ?? null,
      freeQty: l.freeQty ?? null,
      vatPercent: l.vatPercent ?? null,
      itemName: l.itemName ?? null,
    }));

    try {
      const held = await this.repo.insert({
        label: input.label ?? null,
        shiftId: shift.id,
        cashierNo: input.cashierNo,
        machineNo: input.machineNo ?? shift.machineNo ?? null,
        customerCode: input.customerCode ?? null,
        customerName: input.customerName ?? null,
        currency,
        taxCalcType,
        headerDiscount: input.headerDiscount ?? 0,
        estNetAmt: estNet,
        lines: snapshotLines,
        idempotencyKey: input.idempotencyKey,
        clientOpId: input.clientOperationId ?? requestHash,
      });
      return { held, replayed: false };
    } catch (err) {
      if (err instanceof HeldIdempotencyUniqueViolation) {
        const winner = await this.repo.findByIdempotencyKey(
          input.idempotencyKey,
        );
        if (winner) return { held: winner, replayed: true };
      }
      throw err;
    }
  }

  //--------------------------------------------------------------------------
  // LIST
  //--------------------------------------------------------------------------
  listHeld(cashierNo: number): Promise<PersistedHeldBill[]> {
    return this.repo.listHeld(cashierNo);
  }

  //--------------------------------------------------------------------------
  // RESUME
  //--------------------------------------------------------------------------
  async resume(
    input: ResumeBillInput,
  ): Promise<{ bill: PersistedBill; held: PersistedHeldBill; replayed: boolean }> {
    const held = await this.repo.findById(input.heldId);
    if (!held) {
      throw new HeldBillNotFoundError(`Held bill ${input.heldId} not found`, {
        heldId: input.heldId,
      });
    }
    if (held.status !== 'HELD') {
      // Already resumed → idempotently return the produced bill (no dup).
      if (held.status === 'RESUMED' && held.resumedBillId) {
        const prior = await this.bills.findById(held.resumedBillId);
        if (prior) return { bill: prior, held, replayed: true };
      }
      throw new HeldBillNotResumableError(
        `Held bill ${input.heldId} is ${held.status}`,
        { heldId: input.heldId, status: held.status },
      );
    }

    const lines: PostBillLineInput[] = held.lines.map((l) => ({
      itemCode: l.itemCode,
      qty: l.qty,
      unitPrice: l.unitPrice ?? undefined,
      discDtl: l.discDtl ?? undefined,
      freeQty: l.freeQty ?? undefined,
      vatPercent: l.vatPercent ?? undefined,
    }));

    const { bill, replayed } = await this.postBill.execute({
      idempotencyKey: input.idempotencyKey,
      cashierNo: input.cashierNo,
      actorRole: input.actorRole,
      machineNo: held.machineNo ?? undefined,
      customerCode: held.customerCode ?? undefined,
      customerName: held.customerName ?? undefined,
      currency: held.currency,
      taxCalcType: held.taxCalcType as VatCalcType,
      headerDiscount: held.headerDiscount,
      clientOperationId: uuidv7(),
      lines,
    });

    await this.repo.markResumed(held.id, bill.id);
    const updated = (await this.repo.findById(held.id)) ?? held;
    return { bill, held: updated, replayed };
  }

  //--------------------------------------------------------------------------
  // helpers
  //--------------------------------------------------------------------------
  private async estimateNet(
    input: HoldBillInput,
    taxCalcType: VatCalcType,
  ): Promise<number> {
    try {
      const domainLines: BillLine[] = [];
      for (const line of input.lines) {
        let price = line.unitPrice;
        let vat = line.vatPercent;
        if (price == null || vat == null) {
          const ref = await this.items.findByCode(line.itemCode);
          if (price == null) price = ref?.unitPrice ?? 0;
          if (vat == null) vat = ref?.vatPercent ?? 0;
        }
        domainLines.push(
          new BillLine({
            iCode: line.itemCode,
            qty: line.qty,
            price: price ?? 0,
            discDtl: line.discDtl ?? 0,
            discMst: 0,
            vatPercent: vat ?? 0,
            freeQty: line.freeQty ?? 0,
          }),
        );
      }
      const bill = new Bill({
        billNo: 'HELD',
        vatCalcType: taxCalcType,
        lines: domainLines,
      });
      const net = bill.totals().net.toNumber();
      const head = input.headerDiscount ?? 0;
      return Math.max(0, round4(net - head));
    } catch (err) {
      this.logger.warn({ err }, 'estimateNet failed; storing 0');
      return 0;
    }
  }

  private hashRequest(input: HoldBillInput): string {
    const canonical = JSON.stringify({
      cashierNo: input.cashierNo,
      machineNo: input.machineNo ?? null,
      customerCode: input.customerCode ?? null,
      taxCalcType: input.taxCalcType ?? VatCalcType.AFTER_DISCOUNT,
      headerDiscount: input.headerDiscount ?? 0,
      lines: input.lines.map((l) => ({
        itemCode: l.itemCode,
        qty: l.qty,
        unitPrice: l.unitPrice ?? null,
        discDtl: l.discDtl ?? 0,
        freeQty: l.freeQty ?? 0,
        vatPercent: l.vatPercent ?? null,
      })),
    });
    return createHash('sha256').update(canonical).digest('hex').slice(0, 36);
  }
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
