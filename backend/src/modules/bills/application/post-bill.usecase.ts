import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { createHash } from 'node:crypto';
import {
  IdempotencyConflictError,
  InvalidBillError,
  ItemNotFoundError,
  PriceOverrideForbiddenError,
} from '../../../shared/errors/domain-error';
import { Role } from '../../auth/domain/user.entity';
import { LoyaltyService } from '../../loyalty/application/loyalty.service';
import { ShiftsService } from '../../shifts/application/shifts.service';
import { Bill } from '../domain/entities/bill.entity';
import { BillLine, VatCalcType } from '../domain/entities/bill-line.entity';
import {
  BillWriteRepository,
  BILL_WRITE_REPOSITORY,
  IdempotencyUniqueViolation,
  PersistedBill,
  PersistedBillLine,
} from '../domain/ports/bill-write-repository.port';
import {
  ItemReferenceReader,
  ITEM_REFERENCE,
} from '../domain/ports/item-reference.port';
import { PricePolicyService } from './price-policy.service';

/** Tolerance when comparing a client-echoed price to the reference (4 dp). */
const PRICE_EPSILON = 0.005;

/** One requested sale line (from the client). */
export interface PostBillLineInput {
  itemCode: string;
  qty: number;
  /**
   * SECURITY: the server-side reference price is ALWAYS authoritative.
   * A client-sent unitPrice that matches the reference is accepted (echo);
   * any DIFFERENT value is an override and requires the actor's role to hold
   * the PRICE_OVERRIDE permission (ROLE_PERMISSIONS matrix) — otherwise 403.
   */
  unitPrice?: number;
  /** Per-unit detail discount (DIS_AMT_DTL). */
  discDtl?: number;
  freeQty?: number;
  /** VAT% override — same PRICE_OVERRIDE gate as unitPrice. */
  vatPercent?: number;
}

export interface PostBillInput {
  idempotencyKey: string;
  cashierNo: number;
  machineNo?: number;
  customerCode?: string;
  customerName?: string;
  currency?: string;
  /** 1 = VAT on price, 2 = VAT after discount (default 2, matches Onyx). */
  taxCalcType?: VatCalcType;
  /** Header discount amount to allocate proportionally across lines. */
  headerDiscount?: number;
  clientOperationId?: string;
  /**
   * Role of the AUTHENTICATED actor (from the verified JWT — never from the
   * request body). Gates price/VAT overrides. Undefined → no override rights.
   */
  actorRole?: Role;
  lines: PostBillLineInput[];
}

/**
 * PostBillUseCase — the write-side core (analogue of EXTRCT_POS_BILL_PRC).
 *
 * Pipeline (single entry point, guarded by Idempotency-Key):
 *   1. Idempotency replay: same key + same body → return the original bill.
 *      Same key + different body → 409 idempotency-conflict.
 *   2. Selling precondition: the cashier MUST have an OPEN shift (no sale
 *      without an open shift) — else 409 no-open-shift.
 *   3. Read item prices / VAT% from YSPOS23 (read-only reference).
 *   4. Compute totals via the proven golden Bill aggregate (gross/discount/vat/
 *      net), including proportional header-discount allocation.
 *   5. Persist header + lines atomically into MOTECH_POS (immutable after save).
 *      Safe server-side numbering; UNIQUE idempotency_key is the dup backstop.
 */
@Injectable()
export class PostBillUseCase {
  private readonly logger = new Logger(PostBillUseCase.name);

  constructor(
    @Inject(BILL_WRITE_REPOSITORY) private readonly repo: BillWriteRepository,
    @Inject(ITEM_REFERENCE) private readonly items: ItemReferenceReader,
    private readonly shifts: ShiftsService,
    private readonly pricePolicy: PricePolicyService,
    @Optional() private readonly loyalty?: LoyaltyService,
  ) {}

  async execute(
    input: PostBillInput,
  ): Promise<{ bill: PersistedBill; replayed: boolean }> {
    if (!input.lines || input.lines.length === 0) {
      throw new InvalidBillError('Bill must have at least one line', {});
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
      return { bill: existing, replayed: true };
    }

    // (2) Selling precondition: open shift (throws 409 if none).
    const shift = await this.shifts.current(input.cashierNo);

    const taxCalcType = input.taxCalcType ?? VatCalcType.AFTER_DISCOUNT;
    const currency = input.currency ?? shift.currency ?? 'YER';

    // (3) Resolve prices/tax SERVER-SIDE (security: the client can never set
    // the price of a sale line — see docs/FINAL_AUDIT_FABLE5.md P0-5).
    // The reference is ALWAYS read for every line; a client-sent unitPrice/
    // vatPercent is honoured only when it matches the reference (UI echo) or
    // when the authenticated actor's role holds PRICE_OVERRIDE.
    let canOverride: boolean | null = null; // lazy — one lookup per request
    const mayOverride = async (): Promise<boolean> => {
      if (canOverride == null) {
        canOverride = await this.pricePolicy.canOverridePrice(input.actorRole);
      }
      return canOverride;
    };

    const resolved: Array<{ ref: PostBillLineInput; price: number; vat: number; name: string | null; unit: string | null }> = [];
    for (const line of input.lines) {
      const ref = await this.items.findByCode(line.itemCode);
      if (!ref) {
        throw new ItemNotFoundError(
          `Item ${line.itemCode} not found in reference catalog`,
          { itemCode: line.itemCode },
        );
      }

      // --- Price: reference is authoritative ---
      let price = ref.unitPrice;
      if (line.unitPrice != null) {
        const matchesRef =
          price != null && Math.abs(line.unitPrice - price) < PRICE_EPSILON;
        if (!matchesRef) {
          if (!(await mayOverride())) {
            throw new PriceOverrideForbiddenError(
              `unitPrice ${line.unitPrice} for item ${line.itemCode} differs from the server reference price` +
                (price == null ? ' (none on file)' : ` ${price}`) +
                ' — overriding prices requires the PRICE_OVERRIDE permission',
              {
                itemCode: line.itemCode,
                suppliedPrice: line.unitPrice,
                referencePrice: price,
              },
            );
          }
          price = line.unitPrice; // authorized override
        }
      }
      if (price == null) {
        throw new InvalidBillError(
          `No reference price for item ${line.itemCode}; a PRICE_OVERRIDE-authorized user must supply unitPrice`,
          { itemCode: line.itemCode },
        );
      }

      // --- VAT%: same gate (a fake 0% VAT also changes the net) ---
      let vat = ref.vatPercent ?? 0;
      if (line.vatPercent != null && Math.abs(line.vatPercent - vat) >= PRICE_EPSILON) {
        if (!(await mayOverride())) {
          throw new PriceOverrideForbiddenError(
            `vatPercent ${line.vatPercent} for item ${line.itemCode} differs from the reference ${vat} — requires PRICE_OVERRIDE`,
            {
              itemCode: line.itemCode,
              suppliedVat: line.vatPercent,
              referenceVat: vat,
            },
          );
        }
        vat = line.vatPercent;
      }

      resolved.push({ ref: line, price, vat, name: ref.name, unit: ref.unit });
    }

    // (4a) Allocate header discount proportionally (if any), then build lines.
    const headerDiscount = input.headerDiscount ?? 0;
    const grossPerLine = resolved.map((r) => r.price * (r.ref.qty ?? 0));
    const detailDiscPerLine = resolved.map(
      (r) => (r.ref.discDtl ?? 0) * (r.ref.qty ?? 0),
    );
    const discMstPerUnit = this.allocateHeaderDiscount(
      grossPerLine,
      detailDiscPerLine,
      headerDiscount,
      resolved.map((r) => r.ref.qty ?? 0),
    );

    const domainLines = resolved.map(
      (r, i) =>
        new BillLine({
          iCode: r.ref.itemCode,
          qty: r.ref.qty,
          price: r.price,
          discDtl: r.ref.discDtl ?? 0,
          discMst: discMstPerUnit[i],
          vatPercent: r.vat,
          freeQty: r.ref.freeQty ?? 0,
          itmUnit: r.unit ?? undefined,
        }),
    );

    const bill = new Bill({
      billNo: 'PENDING',
      vatCalcType: taxCalcType,
      lines: domainLines,
    });
    const totals = bill.totals();

    // (4b) Snapshot per-line computed amounts for persistence.
    const persistLines: PersistedBillLine[] = domainLines.map((l, i) => ({
      lineNo: i + 1,
      itemCode: l.iCode,
      itemName: resolved[i].name,
      qty: l.qty,
      freeQty: l.freeQty,
      unitPrice: l.price.toNumber(),
      discDtl: l.discDtl.toNumber(),
      discMst: l.discMst.toNumber(),
      vatPercent: l.vatPercent,
      lineGross: l.lineGross().toNumber(),
      lineDiscount: l.lineDiscount().toNumber(),
      lineVat: l.lineVat(taxCalcType, bill.taxFreeQtyFlag).toNumber(),
      lineNet: l.lineNet().toNumber(),
      itemUnit: l.itmUnit ?? null,
    }));

    // (5) Persist atomically (immutable). Race → replay via idempotency key.
    try {
      const persisted = await this.repo.insertBill({
        shiftId: shift.id,
        cashierNo: input.cashierNo,
        machineNo: input.machineNo ?? shift.machineNo ?? null,
        billType: 1,
        customerCode: input.customerCode ?? null,
        customerName: input.customerName ?? null,
        currency,
        taxCalcType,
        grossAmt: totals.gross.toNumber(),
        discountAmt: totals.discount.toNumber(),
        vatAmt: totals.vat.toNumber(),
        netAmt: totals.net.toNumber(),
        idempotencyKey: input.idempotencyKey,
        clientOpId: requestHash,
        lines: persistLines,
      });

      // (6) Loyalty (POST020): earn points when the sale is attached to a
      // customer. Best-effort + idempotent per bill; never fails the sale.
      if (this.loyalty && persisted.customerCode) {
        await this.loyalty.earnOnSale({
          customerCode: persisted.customerCode,
          billId: persisted.id,
          billNo: persisted.billNo,
          billAmount: persisted.netAmt,
          shiftId: persisted.shiftId,
          cashierNo: persisted.cashierNo,
        });
      }

      return { bill: persisted, replayed: false };
    } catch (err) {
      if (err instanceof IdempotencyUniqueViolation) {
        // Concurrent duplicate beat us to it — return the winner (no dup).
        const winner = await this.repo.findByIdempotencyKey(
          input.idempotencyKey,
        );
        if (winner) {
          this.logger.warn(
            { idempotencyKey: input.idempotencyKey },
            'Idempotency race resolved to existing bill',
          );
          return { bill: winner, replayed: true };
        }
      }
      throw err;
    }
  }

  /**
   * Allocate the header discount across lines in proportion to each line's
   * net-of-detail-discount value (CLC_DISC_VAT_AMT_PRC), returning the PER-UNIT
   * head discount for each line (so it sums back via qty in the aggregate).
   */
  private allocateHeaderDiscount(
    gross: number[],
    detailDisc: number[],
    headerDiscount: number,
    qty: number[],
  ): number[] {
    if (headerDiscount <= 0) return gross.map(() => 0);
    const base = gross.reduce(
      (a, g, i) => a + (g - detailDisc[i]),
      0,
    );
    if (base <= 0) return gross.map(() => 0);
    return gross.map((g, i) => {
      const lineNet = g - detailDisc[i];
      const lineShare = (headerDiscount / base) * lineNet; // total for the line
      const q = qty[i] || 1;
      return round4(lineShare / q); // per-unit
    });
  }

  /** Stable hash of the price-affecting request fields (idempotency body check). */
  private hashRequest(input: PostBillInput): string {
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
