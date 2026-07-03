import { beforeEach, describe, expect, it } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { CatalogService } from '../../src/modules/catalog/application/catalog.service';
import { Item } from '../../src/modules/catalog/domain/entities/item.entity';
import {
  ItemOverlayRepository,
  ItemOverlayRow,
  UpsertItemOverlayInput,
} from '../../src/modules/catalog/domain/ports/item-overlay.port';
import {
  ItemDetail,
  ItemListFilter,
  ItemListResult,
  ItemRepository,
} from '../../src/modules/catalog/domain/ports/item-repository.port';
import { OverlayConflictError } from '../../src/shared/errors/domain-error';

function makeItem(code: string, name: string, price: number): Item {
  return new Item({
    code,
    name,
    barcode: null,
    unit: 'حبة',
    packSize: 1,
    lastPrice: price,
  });
}

class FakeErp implements ItemRepository {
  rows = new Map<string, ItemDetail>();
  list(_f: ItemListFilter): Promise<ItemListResult> {
    return Promise.resolve({
      items: [...this.rows.values()].map((d) => d.item),
      nextCursor: undefined,
    });
  }
  findByCode(code: string): Promise<ItemDetail | null> {
    return Promise.resolve(this.rows.get(code) ?? null);
  }
  findByBarcode(): Promise<ItemDetail | null> {
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
}

class FakeOverlay implements ItemOverlayRepository {
  rows = new Map<string, ItemOverlayRow>();
  findByCode(code: string): Promise<ItemOverlayRow | null> {
    return Promise.resolve(this.rows.get(code) ?? null);
  }
  findByCodes(codes: string[]): Promise<Map<string, ItemOverlayRow>> {
    const m = new Map<string, ItemOverlayRow>();
    for (const c of codes) if (this.rows.has(c)) m.set(c, this.rows.get(c)!);
    return Promise.resolve(m);
  }
  listLocal(): Promise<ItemOverlayRow[]> {
    return Promise.resolve(
      [...this.rows.values()].filter((r) => r.origin === 'LOCAL'),
    );
  }
  upsert(input: UpsertItemOverlayInput): Promise<ItemOverlayRow> {
    const now = new Date().toISOString();
    const row: ItemOverlayRow = {
      code: input.code,
      origin: input.origin,
      name: input.name ?? null,
      barcode: input.barcode ?? null,
      unit: input.unit ?? null,
      price: input.price ?? null,
      vatPercent: input.vatPercent ?? null,
      inactive: input.inactive ?? false,
      createdAt: now,
      updatedAt: now,
    };
    this.rows.set(input.code, row);
    return Promise.resolve(row);
  }
}

function detail(code: string, name: string, price: number): ItemDetail {
  return {
    item: makeItem(code, name, price),
    stock: [],
    totalAvailableQty: 0,
  };
}

describe('CatalogService overlay merge (POSI2000)', () => {
  let erp: FakeErp;
  let ov: FakeOverlay;
  let svc: CatalogService;

  beforeEach(() => {
    erp = new FakeErp();
    ov = new FakeOverlay();
    svc = new CatalogService(erp, ov);
  });

  it('creates a LOCAL item and reads it back', async () => {
    const created = await svc.create({ code: 'L1', name: 'محلي', price: 1500 });
    expect(created.origin).toBe('LOCAL');
    const back = await svc.getByCode('L1');
    expect(back.lastPrice).toBe(1500);
  });

  it('rejects a duplicate code that exists in ERP (409)', async () => {
    erp.rows.set('E1', detail('E1', 'ERP', 100));
    await expect(svc.create({ code: 'E1' })).rejects.toBeInstanceOf(
      OverlayConflictError,
    );
  });

  it('EDIT overlays ERP price (overlay wins on read)', async () => {
    erp.rows.set('E1', detail('E1', 'ERP', 7800));
    await svc.update('E1', { price: 9999 });
    const back = await svc.getByCode('E1');
    expect(back.lastPrice).toBe(9999);
    expect(back.origin).toBe('EDIT');
  });

  it('404 when editing an unknown item', async () => {
    await expect(svc.update('ZZ', { price: 1 })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
