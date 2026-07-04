import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  InvalidOverlayError,
  ItemNotFoundError,
  OverlayConflictError,
} from '../../../shared/errors/domain-error';
import { Item } from '../domain/entities/item.entity';
import { parseWeightedBarcode } from '../domain/weighted-barcode';
import {
  ItemOverlayRepository,
  ItemOverlayRow,
  ITEM_OVERLAY_REPOSITORY,
} from '../domain/ports/item-overlay.port';
import {
  ItemDetail,
  ItemListFilter,
  ItemRepository,
  ITEM_REPOSITORY,
} from '../domain/ports/item-repository.port';
import {
  AddItemBarcodeInput,
  ItemBarcodesRepository,
  ITEM_BARCODES_REPOSITORY,
} from '../domain/ports/item-barcodes.port';

export interface UpsertItemInput {
  code: string;
  name?: string | null;
  barcode?: string | null;
  unit?: string | null;
  price?: number | null;
  vatPercent?: number | null;
  minLimitQty?: number | null;
  maxLimitQty?: number | null;
  reorderLimitQty?: number | null;
  inactive?: boolean;
}

/**
 * CatalogService (application layer) — orchestrates item read use cases.
 * No SQL here; depends on the ItemRepository port (Dependency Inversion).
 */
@Injectable()
export class CatalogService {
  constructor(
    @Inject(ITEM_REPOSITORY) private readonly repo: ItemRepository,
    @Inject(ITEM_OVERLAY_REPOSITORY)
    private readonly overlay: ItemOverlayRepository,
    @Inject(ITEM_BARCODES_REPOSITORY)
    private readonly barcodes: ItemBarcodesRepository,
  ) {}

  async list(filter: ItemListFilter) {
    const { items, nextCursor } = await this.repo.list(filter);
    const dtos = items.map((i) => this.toListDto(i));
    const overlays = await this.overlay.findByCodes(dtos.map((d) => d.code));
    const merged = dtos.map((d) =>
      this.applyOverlayToList(d, overlays.get(d.code) ?? null),
    );
    // Surface LOCAL-only items (created here, absent from ERP) — only on the
    // first page (no cursor) to keep pagination stable.
    if (!filter.cursor) {
      const seen = new Set(merged.map((m) => m.code));
      const locals = await this.overlay.listLocal(filter.search, filter.limit);
      for (const l of locals) {
        if (!seen.has(l.code)) merged.push(this.overlayToListDto(l));
      }
    }
    return { items: merged.slice(0, filter.limit), nextCursor };
  }

  /** All price levels for an item (IAS_ITEM_PRICE — POS_ITM_PRICE screen). */
  async listPrices(code: string) {
    const prices = await this.repo.listPrices(code);
    if (prices.length === 0) {
      // Distinguish "item unknown" from "item has no price list rows".
      const exists =
        (await this.repo.findByCode(code)) ??
        (await this.overlay.findByCode(code));
      if (!exists) {
        throw new ItemNotFoundError(`Item ${code} not found`, { code });
      }
    }
    const levels = [...new Set(prices.map((p) => p.levNo))].sort(
      (a, b) => a - b,
    );
    return { code, levels, prices };
  }

  /** Price for a chosen level (sale-time price-level selection). */
  async getPriceAtLevel(code: string, levNo: number, unit?: string | null) {
    const price = await this.repo.findPriceAtLevel(code, levNo, unit);
    if (!price) {
      throw new ItemNotFoundError(
        `No price for item ${code} at level ${levNo}${unit ? ` unit ${unit}` : ''}`,
        { code, levNo, unit: unit ?? null },
      );
    }
    return { code, ...price };
  }

  /** All units of measure for an item, with conversion factors + barcodes. */
  async listUnits(code: string) {
    const units = await this.repo.listUnits(code);
    if (units.length === 0) {
      const exists =
        (await this.repo.findByCode(code)) ??
        (await this.overlay.findByCode(code));
      if (!exists) {
        throw new ItemNotFoundError(`Item ${code} not found`, { code });
      }
    }
    const base = units.find((u) => u.isMainUnit) ?? units[0] ?? null;
    return { code, baseUnit: base?.unit ?? null, units };
  }

  /** Category tree (main groups → sub groups) with item counts. */
  async listCategories() {
    return this.repo.listCategories();
  }

  /** Item nature types (ITEM_TYPES: stocked / service …). */
  async listItemTypes() {
    return this.repo.listItemTypes();
  }

  async getByCode(code: string) {
    const found = await this.repo.findByCode(code);
    const ov = await this.overlay.findByCode(code);
    if (!found && !ov) {
      throw new ItemNotFoundError(`Item ${code} not found`, { code });
    }
    if (!found && ov) return this.overlayToDetailDto(ov);
    return this.applyOverlayToDetail(this.toDetailDto(found as ItemDetail), ov);
  }

  /** Create a LOCAL item (must not already exist in ERP or overlay). */
  async create(input: UpsertItemInput) {
    if (!input.code || input.code.trim().length === 0) {
      throw new InvalidOverlayError('Item code is required', {});
    }
    const [erp, ov] = await Promise.all([
      this.repo.findByCode(input.code),
      this.overlay.findByCode(input.code),
    ]);
    if (erp || ov) {
      throw new OverlayConflictError(`Item '${input.code}' already exists`, {
        code: input.code,
      });
    }
    const row = await this.overlay.upsert({ ...input, origin: 'LOCAL' });
    return this.overlayToDetailDto(row);
  }

  /** Edit an item: local override of ERP price/name, or update a LOCAL row. */
  async update(code: string, input: Omit<UpsertItemInput, 'code'>) {
    const erp = await this.repo.findByCode(code);
    const existing = await this.overlay.findByCode(code);
    if (!erp && !existing) {
      throw new NotFoundException(`Item '${code}' not found`);
    }
    const origin: 'LOCAL' | 'EDIT' =
      existing?.origin === 'LOCAL' || !erp ? 'LOCAL' : 'EDIT';
    const erpDto = erp ? this.toDetailDto(erp) : null;
    const row = await this.overlay.upsert({
      code,
      origin,
      name: input.name ?? existing?.name ?? erpDto?.name ?? null,
      barcode: input.barcode ?? existing?.barcode ?? erpDto?.barcode ?? null,
      unit: input.unit ?? existing?.unit ?? erpDto?.unit ?? null,
      price: input.price ?? existing?.price ?? erpDto?.lastPrice ?? null,
      vatPercent: input.vatPercent ?? existing?.vatPercent ?? null,
      minLimitQty: input.minLimitQty ?? null,
      maxLimitQty: input.maxLimitQty ?? null,
      reorderLimitQty: input.reorderLimitQty ?? null,
      inactive: input.inactive ?? existing?.inactive ?? false,
    });
    return erpDto
      ? this.applyOverlayToDetail(erpDto, row)
      : this.overlayToDetailDto(row);
  }

  private applyOverlayToList(
    d: ReturnType<CatalogService['toListDto']>,
    ov: ItemOverlayRow | null,
  ) {
    if (!ov) return { ...d, origin: 'ERP' as const };
    return {
      code: d.code,
      name: ov.name ?? d.name,
      barcode: ov.barcode ?? d.barcode,
      unit: ov.unit ?? d.unit,
      packSize: d.packSize,
      lastPrice: ov.price ?? d.lastPrice,
      origin: ov.origin,
    };
  }

  private applyOverlayToDetail(
    d: ReturnType<CatalogService['toDetailDto']>,
    ov: ItemOverlayRow | null,
  ) {
    if (!ov) return { ...d, origin: 'ERP' as const };
    return {
      ...d,
      name: ov.name ?? d.name,
      barcode: ov.barcode ?? d.barcode,
      unit: ov.unit ?? d.unit,
      lastPrice: ov.price ?? d.lastPrice,
      vatPercent: ov.vatPercent ?? null,
      origin: ov.origin,
    };
  }

  private overlayToListDto(ov: ItemOverlayRow) {
    return {
      code: ov.code,
      name: ov.name,
      barcode: ov.barcode,
      unit: ov.unit,
      packSize: 1,
      lastPrice: ov.price,
      origin: ov.origin,
    };
  }

  private overlayToDetailDto(ov: ItemOverlayRow) {
    return {
      code: ov.code,
      name: ov.name,
      barcode: ov.barcode,
      unit: ov.unit,
      packSize: 1,
      lastPrice: ov.price,
      vatPercent: ov.vatPercent,
      totalAvailableQty: 0,
      stock: [] as { warehouseCode: string; availableQty: number }[],
      origin: ov.origin,
    };
  }

  /**
   * All barcodes of an item (POSI006/008/009 multi-barcode):
   * ERP rows (IAS_ITM_UNT_BARCODE) + local additions (overlay).
   */
  async listBarcodes(code: string) {
    const rows = await this.barcodes.listByItem(code);
    if (rows.length === 0) {
      const exists =
        (await this.repo.findByCode(code)) ??
        (await this.overlay.findByCode(code));
      if (!exists) {
        throw new ItemNotFoundError(`Item ${code} not found`, { code });
      }
    }
    return { code, barcodes: rows };
  }

  /** Add a LOCAL barcode to an item (must be globally unique). */
  async addBarcode(input: AddItemBarcodeInput) {
    const exists =
      (await this.repo.findByCode(input.itemCode)) ??
      (await this.overlay.findByCode(input.itemCode));
    if (!exists) {
      throw new ItemNotFoundError(`Item ${input.itemCode} not found`, {
        code: input.itemCode,
      });
    }
    const dup = await this.barcodes.findByBarcode(input.barcode);
    if (dup) {
      throw new OverlayConflictError(
        `Barcode ${input.barcode} already maps to item ${dup.itemCode}`,
        { barcode: input.barcode, itemCode: dup.itemCode },
      );
    }
    return this.barcodes.add(input);
  }

  /** Disable a LOCAL barcode (ERP barcodes cannot be removed from here). */
  async removeBarcode(barcode: string) {
    const row = await this.barcodes.findByBarcode(barcode);
    if (!row) {
      throw new ItemNotFoundError(`Barcode ${barcode} not found`, { barcode });
    }
    if (row.origin === 'ERP') {
      throw new InvalidOverlayError(
        `Barcode ${barcode} belongs to the ERP master and cannot be removed here`,
        { barcode },
      );
    }
    const ok = await this.barcodes.deactivate(barcode);
    return { barcode, removed: ok };
  }

  /**
   * Stock limits for an item (POSI2000 advanced): ERP IAS_ITM_MST limits
   * merged with the local overlay (overlay wins).
   */
  async getStockLimits(code: string) {
    const [erp, ov] = await Promise.all([
      this.repo.findStockLimits(code),
      this.overlay.findByCode(code),
    ]);
    if (!erp && !ov) {
      throw new ItemNotFoundError(`Item ${code} not found`, { code });
    }
    return {
      code,
      minLimitQty: ov?.minLimitQty ?? erp?.minLimitQty ?? null,
      maxLimitQty: ov?.maxLimitQty ?? erp?.maxLimitQty ?? null,
      reorderLimitQty: ov?.reorderLimitQty ?? erp?.reorderLimitQty ?? null,
      origin: ov?.minLimitQty != null || ov?.maxLimitQty != null || ov?.reorderLimitQty != null
        ? (ov.origin as 'LOCAL' | 'EDIT')
        : ('ERP' as const),
    };
  }

  async getByBarcode(barcode: string) {
    // Weighted (scale) barcode? Decode → resolve by embedded item code and
    // surface the embedded quantity so the cashier's cart line is pre-filled.
    const weighted = parseWeightedBarcode(barcode);
    if (weighted) {
      const detail = await this.resolveDetailByCode(weighted.itemCode);
      if (detail) {
        return {
          ...detail,
          scanned: {
            isWeighted: true as const,
            barcode: weighted.raw,
            itemCode: weighted.itemCode,
            quantity: weighted.quantity,
          },
        };
      }
      throw new ItemNotFoundError(
        `No item for weighted barcode ${barcode} (item code ${weighted.itemCode})`,
        { barcode, itemCode: weighted.itemCode },
      );
    }
    const found = await this.repo.findByBarcode(barcode);
    if (found) {
      return {
        ...this.toDetailDto(found),
        scanned: { isWeighted: false as const, barcode, quantity: 1 },
      };
    }
    // Fallback: the real barcode master (IAS_ITM_UNT_BARCODE + local overlay)
    // — covers barcodes never yet observed in sale history (POSI006/008/009).
    const bcRow = await this.barcodes.findByBarcode(barcode);
    if (bcRow && !bcRow.inactive && bcRow.itemCode) {
      const detail = await this.resolveDetailByCode(bcRow.itemCode);
      if (detail) {
        return {
          ...detail,
          scanned: { isWeighted: false as const, barcode, quantity: 1 },
        };
      }
    }
    throw new ItemNotFoundError(`No item for barcode ${barcode}`, {
      barcode,
    });
  }

  /** getByCode variant that returns null instead of throwing (scan path). */
  private async resolveDetailByCode(code: string) {
    const found = await this.repo.findByCode(code);
    const ov = await this.overlay.findByCode(code);
    if (!found && !ov) return null;
    if (!found && ov) return this.overlayToDetailDto(ov);
    return this.applyOverlayToDetail(this.toDetailDto(found as ItemDetail), ov);
  }

  private toListDto(i: Item) {
    return {
      code: i.code,
      name: i.name,
      barcode: i.barcode,
      unit: i.unit,
      packSize: i.packSize,
      lastPrice: i.lastPrice()?.toNumber() ?? null,
    };
  }

  private toDetailDto(d: ItemDetail) {
    return {
      code: d.item.code,
      name: d.item.name,
      barcode: d.item.barcode,
      unit: d.item.unit,
      packSize: d.item.packSize,
      lastPrice: d.item.lastPrice()?.toNumber() ?? null,
      totalAvailableQty: d.totalAvailableQty,
      stock: d.stock.map((s) => ({
        warehouseCode: s.warehouseCode,
        availableQty: s.availableQty,
      })),
    };
  }
}
