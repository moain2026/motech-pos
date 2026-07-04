import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  SupplierErpRow,
  SupplierOverlayRow,
  SuppliersOverlayRepository,
  SuppliersRepository,
  SUPPLIERS_OVERLAY_REPOSITORY,
  SUPPLIERS_REPOSITORY,
} from '../domain/ports/suppliers-repository.port';

/** A supplier as surfaced by the API: ERP row merged with local overlay. */
export interface MergedSupplier extends SupplierErpRow {
  origin: 'ERP' | 'LOCAL' | 'EDIT';
}

export interface CreateSupplierInput {
  code?: string;
  arName: string;
  enName?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  address?: string;
  taxCode?: string;
  contact?: string;
  creditPeriod?: number;
  inactive?: boolean;
}

export type UpdateSupplierInput = Partial<CreateSupplierInput>;

/**
 * SuppliersService — POSI001/POSI002 supplier master. Reads MERGE the live
 * ERP (IAS202623.V_DETAILS) with the MOTECH_POS overlay (overlay wins;
 * overlay-only rows surface as LOCAL). Writes land ONLY in MOTECH_POS.
 */
@Injectable()
export class SuppliersService {
  constructor(
    @Inject(SUPPLIERS_REPOSITORY) private readonly erp: SuppliersRepository,
    @Inject(SUPPLIERS_OVERLAY_REPOSITORY)
    private readonly overlay: SuppliersOverlayRepository,
  ) {}

  private merge(
    erp: SupplierErpRow | null,
    ov: SupplierOverlayRow,
  ): MergedSupplier {
    return {
      code: ov.code,
      arName: ov.arName ?? erp?.arName ?? null,
      enName: ov.enName ?? erp?.enName ?? null,
      phone: ov.phone ?? erp?.phone ?? null,
      mobile: ov.mobile ?? erp?.mobile ?? null,
      email: ov.email ?? erp?.email ?? null,
      address: ov.address ?? erp?.address ?? null,
      taxCode: ov.taxCode ?? erp?.taxCode ?? null,
      contact: ov.contact ?? erp?.contact ?? null,
      creditPeriod: ov.creditPeriod ?? erp?.creditPeriod ?? null,
      inactive: ov.inactive,
      origin: ov.origin,
    };
  }

  /** ERP suppliers + local overlays merged (overlay wins; LOCAL appended). */
  async list(search?: string, limit = 200): Promise<MergedSupplier[]> {
    const [erp, overlays] = await Promise.all([
      this.erp.list(search, limit),
      this.overlay.list(),
    ]);
    const byCode = new Map(erp.map((s) => [s.code, s]));
    const overlayCodes = new Set(overlays.map((o) => o.code));
    const merged: MergedSupplier[] = [];
    for (const s of erp) {
      if (!overlayCodes.has(s.code)) merged.push({ ...s, origin: 'ERP' });
    }
    const q = search?.trim();
    for (const o of overlays) {
      const erpRow = byCode.get(o.code) ?? (await this.erp.findByCode(o.code));
      const m = this.merge(erpRow, o);
      // Apply the search filter to overlay rows too (ERP filter ran in SQL).
      if (
        q &&
        !(
          m.code.includes(q) ||
          (m.arName ?? '').includes(q) ||
          (m.enName ?? '').includes(q)
        )
      ) {
        continue;
      }
      merged.push(m);
    }
    merged.sort((a, b) =>
      a.code.localeCompare(b.code, undefined, { numeric: true }),
    );
    return merged.slice(0, limit);
  }

  async getByCode(code: string): Promise<MergedSupplier> {
    const [erp, ov] = await Promise.all([
      this.erp.findByCode(code),
      this.overlay.findByCode(code),
    ]);
    if (ov) return this.merge(erp, ov);
    if (erp) return { ...erp, origin: 'ERP' };
    throw new NotFoundException(`Supplier ${code} not found`);
  }

  /** Create a LOCAL supplier (overlay only; ERP untouched). */
  async create(input: CreateSupplierInput): Promise<MergedSupplier> {
    let code = input.code?.trim();
    if (code) {
      const [dupOv, dupErp] = await Promise.all([
        this.overlay.findByCode(code),
        this.erp.findByCode(code),
      ]);
      if (dupOv) {
        throw new ConflictException(`Supplier ${code} already exists (overlay)`);
      }
      if (dupErp) {
        throw new ConflictException(
          `Supplier ${code} already exists in the ERP — use PUT to edit`,
        );
      }
    } else {
      code = await this.overlay.nextLocalCode();
    }
    const row = await this.overlay.upsert({
      code,
      origin: 'LOCAL',
      arName: input.arName,
      enName: input.enName ?? null,
      phone: input.phone ?? null,
      mobile: input.mobile ?? null,
      email: input.email ?? null,
      address: input.address ?? null,
      taxCode: input.taxCode ?? null,
      contact: input.contact ?? null,
      creditPeriod: input.creditPeriod ?? null,
      inactive: input.inactive ?? false,
    });
    return this.merge(null, row);
  }

  /** Edit a supplier (overlay of an ERP supplier, or a local one). */
  async update(code: string, input: UpdateSupplierInput): Promise<MergedSupplier> {
    const [erp, existing] = await Promise.all([
      this.erp.findByCode(code),
      this.overlay.findByCode(code),
    ]);
    if (!erp && !existing) {
      throw new NotFoundException(`Supplier ${code} not found`);
    }
    const origin = existing?.origin ?? (erp ? 'EDIT' : 'LOCAL');
    const row = await this.overlay.upsert({
      code,
      origin,
      arName: input.arName,
      enName: input.enName,
      phone: input.phone,
      mobile: input.mobile,
      email: input.email,
      address: input.address,
      taxCode: input.taxCode,
      contact: input.contact,
      creditPeriod: input.creditPeriod,
      inactive: input.inactive,
    });
    return this.merge(erp, row);
  }
}
