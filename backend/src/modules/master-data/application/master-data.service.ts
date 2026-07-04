import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CurrencyOverlayRow,
  CurrencyRow,
  ItemGroupOverlayRow,
  ItemGroupRow,
  MasterDataOverlayRepository,
  MasterDataRepository,
  MASTER_DATA_OVERLAY_REPOSITORY,
  MASTER_DATA_REPOSITORY,
  Origin,
  UnitOverlayRow,
  UnitRow,
  WarehouseOverlayRow,
  WarehouseRow,
} from '../domain/ports/master-data.port';

export interface MergedWarehouse extends WarehouseRow {
  origin: Origin;
}
export interface MergedItemGroup extends ItemGroupRow {
  origin: Origin;
}
export interface MergedUnit extends UnitRow {
  origin: Origin;
}
export interface MergedCurrency extends CurrencyRow {
  origin: Origin;
}

export interface UpsertWarehouseInput {
  code?: number;
  arName?: string;
  enName?: string;
  location?: string;
  tel?: string;
  keeper?: string;
  noSale?: boolean;
  priceLevel?: number;
  inactive?: boolean;
}

export interface UpsertItemGroupInput {
  code?: string;
  arName?: string;
  enName?: string;
  taxPercent?: number;
  allowDiscount?: boolean;
  sortOrder?: number;
  inactive?: boolean;
}

export interface UpsertUnitInput {
  code?: string;
  arName?: string;
  enName?: string;
  defaultSize?: number;
  inactive?: boolean;
}

export interface UpsertCurrencyInput {
  code?: string;
  arName?: string;
  enName?: string;
  rate?: number;
  ratePos?: number;
  fractionNo?: number;
  isLocal?: boolean;
  inactive?: boolean;
}

/** Local warehouse codes start at 900 (ERP has 1..2). */
const LOCAL_WAREHOUSE_BASE = 900;

/**
 * MasterDataService — POSI003/004/005/011 master data (warehouses, item
 * groups, units, currencies). Reads MERGE the live ERP with the MOTECH_POS
 * overlay (overlay wins; overlay-only rows surface as LOCAL). Writes land
 * ONLY in MOTECH_POS.
 */
@Injectable()
export class MasterDataService {
  constructor(
    @Inject(MASTER_DATA_REPOSITORY)
    private readonly erp: MasterDataRepository,
    @Inject(MASTER_DATA_OVERLAY_REPOSITORY)
    private readonly overlay: MasterDataOverlayRepository,
  ) {}

  //==========================================================================
  // Warehouses (POSI003)
  //==========================================================================
  private mergeWh(
    erp: WarehouseRow | null,
    ov: WarehouseOverlayRow,
  ): MergedWarehouse {
    return {
      code: ov.code,
      arName: ov.arName ?? erp?.arName ?? null,
      enName: ov.enName ?? erp?.enName ?? null,
      location: ov.location ?? erp?.location ?? null,
      tel: ov.tel ?? erp?.tel ?? null,
      keeper: ov.keeper ?? erp?.keeper ?? null,
      noSale: ov.noSale ?? erp?.noSale ?? false,
      priceLevel: ov.priceLevel ?? erp?.priceLevel ?? null,
      inactive: ov.inactive,
      origin: ov.origin,
    };
  }

  async listWarehouses(): Promise<MergedWarehouse[]> {
    const [erp, overlays] = await Promise.all([
      this.erp.listWarehouses(),
      this.overlay.listWarehouses(),
    ]);
    const byCode = new Map(erp.map((w) => [w.code, w]));
    const ovCodes = new Set(overlays.map((o) => o.code));
    const merged: MergedWarehouse[] = erp
      .filter((w) => !ovCodes.has(w.code))
      .map((w) => ({ ...w, origin: 'ERP' as const }));
    for (const o of overlays) {
      merged.push(this.mergeWh(byCode.get(o.code) ?? null, o));
    }
    merged.sort((a, b) => a.code - b.code);
    return merged;
  }

  async createWarehouse(input: UpsertWarehouseInput): Promise<MergedWarehouse> {
    let code = input.code;
    if (code != null) {
      const [dupOv, dupErp] = await Promise.all([
        this.overlay.findWarehouse(code),
        this.erp.findWarehouse(code),
      ]);
      if (dupOv || dupErp) {
        throw new ConflictException(`Warehouse ${code} already exists`);
      }
    } else {
      const all = await this.overlay.listWarehouses();
      const mx = all
        .filter((w) => w.origin === 'LOCAL' && w.code >= LOCAL_WAREHOUSE_BASE)
        .reduce((m, w) => Math.max(m, w.code), LOCAL_WAREHOUSE_BASE - 1);
      code = mx + 1;
    }
    const row = await this.overlay.upsertWarehouse({
      code,
      origin: 'LOCAL',
      arName: input.arName ?? null,
      enName: input.enName ?? null,
      location: input.location ?? null,
      tel: input.tel ?? null,
      keeper: input.keeper ?? null,
      noSale: input.noSale ?? null,
      priceLevel: input.priceLevel ?? null,
      inactive: input.inactive ?? false,
    });
    return this.mergeWh(null, row);
  }

  async updateWarehouse(
    code: number,
    input: UpsertWarehouseInput,
  ): Promise<MergedWarehouse> {
    const [erp, existing] = await Promise.all([
      this.erp.findWarehouse(code),
      this.overlay.findWarehouse(code),
    ]);
    if (!erp && !existing) {
      throw new NotFoundException(`Warehouse ${code} not found`);
    }
    const row = await this.overlay.upsertWarehouse({
      code,
      origin: existing?.origin ?? (erp ? 'EDIT' : 'LOCAL'),
      arName: input.arName,
      enName: input.enName,
      location: input.location,
      tel: input.tel,
      keeper: input.keeper,
      noSale: input.noSale,
      priceLevel: input.priceLevel,
      inactive: input.inactive,
    });
    return this.mergeWh(erp, row);
  }

  //==========================================================================
  // Item groups (POSI004)
  //==========================================================================
  private mergeGrp(
    erp: ItemGroupRow | null,
    ov: ItemGroupOverlayRow,
  ): MergedItemGroup {
    return {
      code: ov.code,
      arName: ov.arName ?? erp?.arName ?? null,
      enName: ov.enName ?? erp?.enName ?? null,
      taxPercent: ov.taxPercent ?? erp?.taxPercent ?? null,
      allowDiscount: ov.allowDiscount ?? erp?.allowDiscount ?? null,
      sortOrder: ov.sortOrder ?? erp?.sortOrder ?? null,
      itemCount: erp?.itemCount ?? 0,
      inactive: ov.inactive,
      origin: ov.origin,
    };
  }

  async listItemGroups(): Promise<MergedItemGroup[]> {
    const [erp, overlays] = await Promise.all([
      this.erp.listItemGroups(),
      this.overlay.listItemGroups(),
    ]);
    const byCode = new Map(erp.map((g) => [g.code, g]));
    const ovCodes = new Set(overlays.map((o) => o.code));
    const merged: MergedItemGroup[] = erp
      .filter((g) => !ovCodes.has(g.code))
      .map((g) => ({ ...g, origin: 'ERP' as const }));
    for (const o of overlays) {
      merged.push(this.mergeGrp(byCode.get(o.code) ?? null, o));
    }
    merged.sort((a, b) =>
      a.code.localeCompare(b.code, undefined, { numeric: true }),
    );
    return merged;
  }

  async createItemGroup(input: UpsertItemGroupInput): Promise<MergedItemGroup> {
    let code = input.code?.trim();
    if (code) {
      const [dupOv, dupErp] = await Promise.all([
        this.overlay.findItemGroup(code),
        this.erp.findItemGroup(code),
      ]);
      if (dupOv || dupErp) {
        throw new ConflictException(`Item group ${code} already exists`);
      }
    } else {
      const all = await this.overlay.listItemGroups();
      const mx = all
        .filter((g) => g.origin === 'LOCAL' && /^\d+$/.test(g.code))
        .reduce((m, g) => Math.max(m, Number(g.code)), 899);
      code = String(mx + 1); // local groups start at 900
    }
    const row = await this.overlay.upsertItemGroup({
      code,
      origin: 'LOCAL',
      arName: input.arName ?? null,
      enName: input.enName ?? null,
      taxPercent: input.taxPercent ?? null,
      allowDiscount: input.allowDiscount ?? null,
      sortOrder: input.sortOrder ?? null,
      inactive: input.inactive ?? false,
    });
    return this.mergeGrp(null, row);
  }

  async updateItemGroup(
    code: string,
    input: UpsertItemGroupInput,
  ): Promise<MergedItemGroup> {
    const [erp, existing] = await Promise.all([
      this.erp.findItemGroup(code),
      this.overlay.findItemGroup(code),
    ]);
    if (!erp && !existing) {
      throw new NotFoundException(`Item group ${code} not found`);
    }
    const row = await this.overlay.upsertItemGroup({
      code,
      origin: existing?.origin ?? (erp ? 'EDIT' : 'LOCAL'),
      arName: input.arName,
      enName: input.enName,
      taxPercent: input.taxPercent,
      allowDiscount: input.allowDiscount,
      sortOrder: input.sortOrder,
      inactive: input.inactive,
    });
    return this.mergeGrp(erp, row);
  }

  //==========================================================================
  // Units (POSI005)
  //==========================================================================
  private mergeUnit(erp: UnitRow | null, ov: UnitOverlayRow): MergedUnit {
    return {
      code: ov.code,
      arName: ov.arName ?? erp?.arName ?? null,
      enName: ov.enName ?? erp?.enName ?? null,
      defaultSize: ov.defaultSize ?? erp?.defaultSize ?? null,
      inactive: ov.inactive,
      origin: ov.origin,
    };
  }

  async listUnits(): Promise<MergedUnit[]> {
    const [erp, overlays] = await Promise.all([
      this.erp.listUnits(),
      this.overlay.listUnits(),
    ]);
    const byCode = new Map(erp.map((u) => [u.code, u]));
    const ovCodes = new Set(overlays.map((o) => o.code));
    const merged: MergedUnit[] = erp
      .filter((u) => !ovCodes.has(u.code))
      .map((u) => ({ ...u, origin: 'ERP' as const }));
    for (const o of overlays) {
      merged.push(this.mergeUnit(byCode.get(o.code) ?? null, o));
    }
    merged.sort((a, b) => a.code.localeCompare(b.code));
    return merged;
  }

  async createUnit(input: UpsertUnitInput): Promise<MergedUnit> {
    const code = input.code?.trim();
    if (!code) {
      throw new ConflictException(
        'Unit code is required (Arabic unit name, e.g. حبة)',
      );
    }
    const [dupOv, dupErp] = await Promise.all([
      this.overlay.findUnit(code),
      this.erp.findUnit(code),
    ]);
    if (dupOv || dupErp) {
      throw new ConflictException(`Unit ${code} already exists`);
    }
    const row = await this.overlay.upsertUnit({
      code,
      origin: 'LOCAL',
      arName: input.arName ?? code,
      enName: input.enName ?? null,
      defaultSize: input.defaultSize ?? null,
      inactive: input.inactive ?? false,
    });
    return this.mergeUnit(null, row);
  }

  async updateUnit(code: string, input: UpsertUnitInput): Promise<MergedUnit> {
    const [erp, existing] = await Promise.all([
      this.erp.findUnit(code),
      this.overlay.findUnit(code),
    ]);
    if (!erp && !existing) {
      throw new NotFoundException(`Unit ${code} not found`);
    }
    const row = await this.overlay.upsertUnit({
      code,
      origin: existing?.origin ?? (erp ? 'EDIT' : 'LOCAL'),
      arName: input.arName,
      enName: input.enName,
      defaultSize: input.defaultSize,
      inactive: input.inactive,
    });
    return this.mergeUnit(erp, row);
  }

  //==========================================================================
  // Currencies (POSI011 currencies + exchange rates)
  //==========================================================================
  private mergeCur(
    erp: CurrencyRow | null,
    ov: CurrencyOverlayRow,
  ): MergedCurrency {
    return {
      code: ov.code,
      no: erp?.no ?? null,
      arName: ov.arName ?? erp?.arName ?? null,
      enName: ov.enName ?? erp?.enName ?? null,
      rate: ov.rate ?? erp?.rate ?? null,
      ratePos: ov.ratePos ?? erp?.ratePos ?? erp?.rate ?? null,
      fractionNo: ov.fractionNo ?? erp?.fractionNo ?? null,
      isLocal: ov.isLocal ?? erp?.isLocal ?? false,
      inactive: ov.inactive,
      origin: ov.origin,
    };
  }

  async listCurrencies(): Promise<MergedCurrency[]> {
    const [erp, overlays] = await Promise.all([
      this.erp.listCurrencies(),
      this.overlay.listCurrencies(),
    ]);
    const byCode = new Map(erp.map((c) => [c.code, c]));
    const ovCodes = new Set(overlays.map((o) => o.code));
    const merged: MergedCurrency[] = erp
      .filter((c) => !ovCodes.has(c.code))
      .map((c) => ({ ...c, ratePos: c.ratePos ?? c.rate, origin: 'ERP' as const }));
    for (const o of overlays) {
      merged.push(this.mergeCur(byCode.get(o.code) ?? null, o));
    }
    merged.sort((a, b) => (a.no ?? 999) - (b.no ?? 999) || a.code.localeCompare(b.code));
    return merged;
  }

  async createCurrency(input: UpsertCurrencyInput): Promise<MergedCurrency> {
    const code = input.code?.trim().toUpperCase();
    if (!code) {
      throw new ConflictException('Currency code is required (e.g. EUR)');
    }
    const [dupOv, dupErp] = await Promise.all([
      this.overlay.findCurrency(code),
      this.erp.findCurrency(code),
    ]);
    if (dupOv || dupErp) {
      throw new ConflictException(`Currency ${code} already exists`);
    }
    const row = await this.overlay.upsertCurrency({
      code,
      origin: 'LOCAL',
      arName: input.arName ?? null,
      enName: input.enName ?? null,
      rate: input.rate ?? null,
      ratePos: input.ratePos ?? input.rate ?? null,
      fractionNo: input.fractionNo ?? null,
      isLocal: input.isLocal ?? false,
      inactive: input.inactive ?? false,
    });
    return this.mergeCur(null, row);
  }

  /** Edit a currency — notably the POS exchange rate (CUR_RATE_POS). */
  async updateCurrency(
    code: string,
    input: UpsertCurrencyInput,
  ): Promise<MergedCurrency> {
    const [erp, existing] = await Promise.all([
      this.erp.findCurrency(code),
      this.overlay.findCurrency(code),
    ]);
    if (!erp && !existing) {
      throw new NotFoundException(`Currency ${code} not found`);
    }
    const row = await this.overlay.upsertCurrency({
      code,
      origin: existing?.origin ?? (erp ? 'EDIT' : 'LOCAL'),
      arName: input.arName,
      enName: input.enName,
      rate: input.rate,
      ratePos: input.ratePos,
      fractionNo: input.fractionNo,
      isLocal: input.isLocal,
      inactive: input.inactive,
    });
    return this.mergeCur(erp, row);
  }
}
