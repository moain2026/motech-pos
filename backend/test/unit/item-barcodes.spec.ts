import { beforeEach, describe, expect, it } from 'vitest';
import { CatalogService } from '../../src/modules/catalog/application/catalog.service';
import {
  AddItemBarcodeInput,
  ItemBarcodeRow,
  ItemBarcodesRepository,
} from '../../src/modules/catalog/domain/ports/item-barcodes.port';
import { Item } from '../../src/modules/catalog/domain/entities/item.entity';
import {
  ItemDetail,
  ItemRepository,
} from '../../src/modules/catalog/domain/ports/item-repository.port';
import {
  ItemOverlayRepository,
  ItemOverlayRow,
} from '../../src/modules/catalog/domain/ports/item-overlay.port';
import {
  InvalidOverlayError,
  ItemNotFoundError,
  OverlayConflictError,
} from '../../src/shared/errors/domain-error';

function detail(code: string, name: string): ItemDetail {
  return {
    item: new Item({
      code,
      name,
      barcode: null,
      unit: 'حبة',
      packSize: 1,
      lastPrice: 100,
    }),
    stock: [],
    totalAvailableQty: 0,
  };
}

class FakeErp implements ItemRepository {
  rows = new Map<string, ItemDetail>();
  limits = new Map<
    string,
    { minLimitQty: number | null; maxLimitQty: number | null; reorderLimitQty: number | null }
  >();
  list() {
    return Promise.resolve({ items: [], nextCursor: undefined });
  }
  findByCode(code: string) {
    return Promise.resolve(this.rows.get(code) ?? null);
  }
  findByBarcode() {
    return Promise.resolve(null);
  }
  listPrices() {
    return Promise.resolve([]);
  }
  listUnits() {
    return Promise.resolve([]);
  }
  listCategories() {
    return Promise.resolve([]);
  }
  listItemTypes() {
    return Promise.resolve([]);
  }
  findPriceAtLevel() {
    return Promise.resolve(null);
  }
  findStockLimits(code: string) {
    return Promise.resolve(this.limits.get(code) ?? null);
  }
}

class FakeOverlay implements ItemOverlayRepository {
  rows = new Map<string, ItemOverlayRow>();
  findByCode(code: string) {
    return Promise.resolve(this.rows.get(code) ?? null);
  }
  findByCodes() {
    return Promise.resolve(new Map<string, ItemOverlayRow>());
  }
  listLocal() {
    return Promise.resolve([]);
  }
  upsert(): never {
    throw new Error('not used');
  }
}

class FakeBarcodes implements ItemBarcodesRepository {
  rows = new Map<string, ItemBarcodeRow>();
  listByItem(itemCode: string) {
    return Promise.resolve(
      [...this.rows.values()].filter((r) => r.itemCode === itemCode),
    );
  }
  findByBarcode(bc: string) {
    return Promise.resolve(this.rows.get(bc) ?? null);
  }
  add(input: AddItemBarcodeInput) {
    const row: ItemBarcodeRow = {
      barcode: input.barcode,
      itemCode: input.itemCode,
      unit: input.unit ?? null,
      packSize: input.packSize ?? null,
      isMain: input.isMain ?? false,
      noSale: input.noSale ?? false,
      inactive: false,
      origin: 'LOCAL',
    };
    this.rows.set(input.barcode, row);
    return Promise.resolve(row);
  }
  deactivate(bc: string) {
    const r = this.rows.get(bc);
    if (!r || r.origin !== 'LOCAL') return Promise.resolve(false);
    r.inactive = true;
    return Promise.resolve(true);
  }
}

describe('CatalogService barcodes + stock limits (POSI006/008/009)', () => {
  let erp: FakeErp;
  let ov: FakeOverlay;
  let bcs: FakeBarcodes;
  let svc: CatalogService;

  beforeEach(() => {
    erp = new FakeErp();
    ov = new FakeOverlay();
    bcs = new FakeBarcodes();
    erp.rows.set('1040010011', detail('1040010011', 'شوكلاته رولادا'));
    erp.limits.set('1040010011', {
      minLimitQty: null,
      maxLimitQty: null,
      reorderLimitQty: 5,
    });
    bcs.rows.set('4600648582393', {
      barcode: '4600648582393',
      itemCode: '1040010011',
      unit: 'حبه',
      packSize: 1,
      isMain: false,
      noSale: false,
      inactive: false,
      origin: 'ERP',
    });
    svc = new CatalogService(erp, ov, bcs);
  });

  it('lists ERP + local barcodes of an item', async () => {
    await svc.addBarcode({ itemCode: '1040010011', barcode: '9900011122233' });
    const { barcodes } = await svc.listBarcodes('1040010011');
    expect(barcodes).toHaveLength(2);
    expect(barcodes.map((b) => b.origin).sort()).toEqual(['ERP', 'LOCAL']);
  });

  it('rejects a duplicate barcode (globally unique) with 409', async () => {
    await expect(
      svc.addBarcode({ itemCode: '1040010011', barcode: '4600648582393' }),
    ).rejects.toThrow(OverlayConflictError);
  });

  it('rejects adding a barcode to an unknown item (404)', async () => {
    await expect(
      svc.addBarcode({ itemCode: 'nope', barcode: 'x1' }),
    ).rejects.toThrow(ItemNotFoundError);
  });

  it('refuses removing an ERP barcode (422) but disables LOCAL ones', async () => {
    await expect(svc.removeBarcode('4600648582393')).rejects.toThrow(
      InvalidOverlayError,
    );
    await svc.addBarcode({ itemCode: '1040010011', barcode: '99000' });
    const res = await svc.removeBarcode('99000');
    expect(res.removed).toBe(true);
  });

  it('resolves a fresh LOCAL barcode at the POS scan path', async () => {
    await svc.addBarcode({ itemCode: '1040010011', barcode: '9900099988877' });
    const hit = await svc.getByBarcode('9900099988877');
    expect(hit.code).toBe('1040010011');
    expect(hit.scanned).toEqual({
      isWeighted: false,
      barcode: '9900099988877',
      quantity: 1,
    });
  });

  it('merges stock limits: ERP baseline, overlay wins', async () => {
    const erpOnly = await svc.getStockLimits('1040010011');
    expect(erpOnly).toMatchObject({
      reorderLimitQty: 5,
      minLimitQty: null,
      origin: 'ERP',
    });
    ov.rows.set('1040010011', {
      code: '1040010011',
      origin: 'EDIT',
      name: null,
      barcode: null,
      unit: null,
      price: null,
      vatPercent: null,
      minLimitQty: 10,
      maxLimitQty: null,
      reorderLimitQty: 20,
      inactive: false,
      createdAt: '',
      updatedAt: '',
    });
    const merged = await svc.getStockLimits('1040010011');
    expect(merged).toMatchObject({
      minLimitQty: 10,
      reorderLimitQty: 20,
      origin: 'EDIT',
    });
  });
});
