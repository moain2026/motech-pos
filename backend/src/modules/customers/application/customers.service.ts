import { Inject, Injectable, NotFoundException, Optional } from '@nestjs/common';
import {
  InvalidOverlayError,
  OverlayConflictError,
} from '../../../shared/errors/domain-error';
import { LoyaltyService } from '../../loyalty/application/loyalty.service';
import {
  CustomerOverlayRepository,
  CUSTOMER_OVERLAY_REPOSITORY,
} from '../domain/ports/customer-overlay.port';
import {
  CustomerRow,
  CustomersRepository,
  CUSTOMERS_REPOSITORY,
  PointsBalance,
  PointsTxnRow,
} from '../domain/ports/customers-repository.port';

/** A customer row enriched with overlay/origin metadata. */
export type MergedCustomerRow = CustomerRow & {
  origin: 'ERP' | 'LOCAL' | 'EDIT';
};

export interface UpsertCustomerInput {
  code: string;
  arName?: string | null;
  enName?: string | null;
  mobile?: string | null;
  whatsapp?: string | null;
  phone?: string | null;
  inactive?: boolean;
}

/**
 * CustomersService (application layer) — orchestrates the read-only customer
 * lookups. No SQL here; depends on the CustomersRepository port (Dependency
 * Inversion). A missing customer surfaces as a 404 (RFC 9457 ProblemDetails).
 */
@Injectable()
export class CustomersService {
  constructor(
    @Inject(CUSTOMERS_REPOSITORY) private readonly repo: CustomersRepository,
    @Inject(CUSTOMER_OVERLAY_REPOSITORY)
    private readonly overlay: CustomerOverlayRepository,
    @Optional() private readonly loyalty?: LoyaltyService,
  ) {}

  async search(filter: {
    search?: string;
    limit: number;
  }): Promise<MergedCustomerRow[]> {
    const erp = await this.repo.search(filter);
    const overlays = await this.overlay.findByCodes(erp.map((c) => c.code));
    const merged: MergedCustomerRow[] = erp.map((c) =>
      this.mergeOne(c, overlays.get(c.code) ?? null),
    );
    // Surface LOCAL-only customers (created here, absent from ERP).
    const seen = new Set(merged.map((m) => m.code));
    const locals = await this.overlay.listLocal(filter.search, filter.limit);
    for (const l of locals) {
      if (!seen.has(l.code)) {
        merged.push(this.overlayToRow(l));
      }
    }
    return merged.slice(0, filter.limit);
  }

  async findByCode(code: string): Promise<MergedCustomerRow> {
    const erp = await this.repo.findByCode(code);
    const ov = await this.overlay.findByCode(code);
    if (!erp && !ov) {
      throw new NotFoundException(`Customer '${code}' not found`);
    }
    if (!erp && ov) return this.overlayToRow(ov);
    return this.mergeOne(erp as CustomerRow, ov);
  }

  /** Create a LOCAL customer (must not already exist in ERP or overlay). */
  async create(input: UpsertCustomerInput): Promise<MergedCustomerRow> {
    if (!input.code || input.code.trim().length === 0) {
      throw new InvalidOverlayError('Customer code is required', {});
    }
    const [erp, ov] = await Promise.all([
      this.repo.findByCode(input.code),
      this.overlay.findByCode(input.code),
    ]);
    if (erp || ov) {
      throw new OverlayConflictError(
        `Customer '${input.code}' already exists`,
        { code: input.code },
      );
    }
    const row = await this.overlay.upsert({ ...input, origin: 'LOCAL' });
    return this.overlayToRow(row);
  }

  /** Edit a customer: local override of ERP fields, or update a LOCAL row. */
  async update(
    code: string,
    input: Omit<UpsertCustomerInput, 'code'>,
  ): Promise<MergedCustomerRow> {
    const erp = await this.repo.findByCode(code);
    const existing = await this.overlay.findByCode(code);
    if (!erp && !existing) {
      throw new NotFoundException(`Customer '${code}' not found`);
    }
    // Preserve LOCAL origin for locally-created rows; else it's an EDIT overlay.
    const origin: 'LOCAL' | 'EDIT' =
      existing?.origin === 'LOCAL' || !erp ? 'LOCAL' : 'EDIT';
    const row = await this.overlay.upsert({
      code,
      origin,
      arName: input.arName ?? existing?.arName ?? erp?.arName ?? null,
      enName: input.enName ?? existing?.enName ?? erp?.enName ?? null,
      mobile: input.mobile ?? existing?.mobile ?? erp?.mobile ?? null,
      whatsapp: input.whatsapp ?? existing?.whatsapp ?? erp?.whatsapp ?? null,
      phone: input.phone ?? existing?.phone ?? erp?.phone ?? null,
      inactive: input.inactive ?? existing?.inactive ?? erp?.inactive ?? false,
    });
    return erp ? this.mergeOne(erp, row) : this.overlayToRow(row);
  }

  /** ERP row with overlay fields applied on top (overlay wins where set). */
  private mergeOne(
    erp: CustomerRow,
    ov: import('../domain/ports/customer-overlay.port').CustomerOverlayRow | null,
  ): MergedCustomerRow {
    if (!ov) return { ...erp, origin: 'ERP' };
    return {
      code: erp.code,
      arName: ov.arName ?? erp.arName,
      enName: ov.enName ?? erp.enName,
      mobile: ov.mobile ?? erp.mobile,
      whatsapp: ov.whatsapp ?? erp.whatsapp,
      phone: ov.phone ?? erp.phone,
      inactive: ov.inactive,
      origin: ov.origin,
    };
  }

  private overlayToRow(
    ov: import('../domain/ports/customer-overlay.port').CustomerOverlayRow,
  ): MergedCustomerRow {
    return {
      code: ov.code,
      arName: ov.arName,
      enName: ov.enName,
      mobile: ov.mobile,
      whatsapp: ov.whatsapp,
      phone: ov.phone,
      inactive: ov.inactive,
      origin: ov.origin,
    };
  }

  async points(
    code: string,
    limit: number,
  ): Promise<{
    balance: PointsBalance;
    txns: PointsTxnRow[];
    earned?: { earnedPoints: number; txnCount: number };
  }> {
    // Ensure the customer exists first (404 otherwise).
    await this.findByCode(code);
    const [balance, txns] = await Promise.all([
      this.repo.pointsBalance(code),
      this.repo.pointsTxns(code, limit),
    ]);
    // Merge points actually EARNED by our own sales (MOTECH_POS ledger).
    let earned: { earnedPoints: number; txnCount: number } | undefined;
    if (this.loyalty) {
      const b = await this.loyalty.earnedBalance(code);
      earned = { earnedPoints: b.earnedPoints, txnCount: b.txnCount };
    }
    return { balance, txns, earned };
  }
}
