import { beforeEach, describe, expect, it } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MasterDataService } from '../../src/modules/master-data/application/master-data.service';
import {
  CurrencyOverlayRow,
  CurrencyRow,
  ItemGroupOverlayRow,
  ItemGroupRow,
  MasterDataOverlayRepository,
  MasterDataRepository,
  UnitOverlayRow,
  UnitRow,
  UpsertCurrencyOverlay,
  UpsertItemGroupOverlay,
  UpsertUnitOverlay,
  UpsertWarehouseOverlay,
  WarehouseOverlayRow,
  WarehouseRow,
} from '../../src/modules/master-data/domain/ports/master-data.port';

class FakeErp implements MasterDataRepository {
  warehouses: WarehouseRow[] = [];
  groups: ItemGroupRow[] = [];
  units: UnitRow[] = [];
  currencies: CurrencyRow[] = [];
  listWarehouses() {
    return Promise.resolve(this.warehouses);
  }
  findWarehouse(code: number) {
    return Promise.resolve(this.warehouses.find((w) => w.code === code) ?? null);
  }
  listItemGroups() {
    return Promise.resolve(this.groups);
  }
  findItemGroup(code: string) {
    return Promise.resolve(this.groups.find((g) => g.code === code) ?? null);
  }
  listUnits() {
    return Promise.resolve(this.units);
  }
  findUnit(code: string) {
    return Promise.resolve(this.units.find((u) => u.code === code) ?? null);
  }
  listCurrencies() {
    return Promise.resolve(this.currencies);
  }
  findCurrency(code: string) {
    return Promise.resolve(this.currencies.find((c) => c.code === code) ?? null);
  }
}

class FakeOverlay implements MasterDataOverlayRepository {
  wh = new Map<number, WarehouseOverlayRow>();
  grp = new Map<string, ItemGroupOverlayRow>();
  unt = new Map<string, UnitOverlayRow>();
  cur = new Map<string, CurrencyOverlayRow>();

  listWarehouses() {
    return Promise.resolve([...this.wh.values()]);
  }
  findWarehouse(code: number) {
    return Promise.resolve(this.wh.get(code) ?? null);
  }
  upsertWarehouse(i: UpsertWarehouseOverlay): Promise<WarehouseOverlayRow> {
    const prev = this.wh.get(i.code);
    const row: WarehouseOverlayRow = {
      id: prev?.id ?? `wh-${i.code}`,
      code: i.code,
      origin: i.origin,
      arName: i.arName ?? prev?.arName ?? null,
      enName: i.enName ?? prev?.enName ?? null,
      location: i.location ?? prev?.location ?? null,
      tel: i.tel ?? prev?.tel ?? null,
      keeper: i.keeper ?? prev?.keeper ?? null,
      noSale: i.noSale ?? prev?.noSale ?? null,
      priceLevel: i.priceLevel ?? prev?.priceLevel ?? null,
      inactive: i.inactive ?? prev?.inactive ?? false,
    };
    this.wh.set(i.code, row);
    return Promise.resolve(row);
  }
  listItemGroups() {
    return Promise.resolve([...this.grp.values()]);
  }
  findItemGroup(code: string) {
    return Promise.resolve(this.grp.get(code) ?? null);
  }
  upsertItemGroup(i: UpsertItemGroupOverlay): Promise<ItemGroupOverlayRow> {
    const prev = this.grp.get(i.code);
    const row: ItemGroupOverlayRow = {
      id: prev?.id ?? `g-${i.code}`,
      code: i.code,
      origin: i.origin,
      arName: i.arName ?? prev?.arName ?? null,
      enName: i.enName ?? prev?.enName ?? null,
      taxPercent: i.taxPercent ?? prev?.taxPercent ?? null,
      allowDiscount: i.allowDiscount ?? prev?.allowDiscount ?? null,
      sortOrder: i.sortOrder ?? prev?.sortOrder ?? null,
      inactive: i.inactive ?? prev?.inactive ?? false,
    };
    this.grp.set(i.code, row);
    return Promise.resolve(row);
  }
  listUnits() {
    return Promise.resolve([...this.unt.values()]);
  }
  findUnit(code: string) {
    return Promise.resolve(this.unt.get(code) ?? null);
  }
  upsertUnit(i: UpsertUnitOverlay): Promise<UnitOverlayRow> {
    const prev = this.unt.get(i.code);
    const row: UnitOverlayRow = {
      id: prev?.id ?? `u-${i.code}`,
      code: i.code,
      origin: i.origin,
      arName: i.arName ?? prev?.arName ?? null,
      enName: i.enName ?? prev?.enName ?? null,
      defaultSize: i.defaultSize ?? prev?.defaultSize ?? null,
      inactive: i.inactive ?? prev?.inactive ?? false,
    };
    this.unt.set(i.code, row);
    return Promise.resolve(row);
  }
  listCurrencies() {
    return Promise.resolve([...this.cur.values()]);
  }
  findCurrency(code: string) {
    return Promise.resolve(this.cur.get(code) ?? null);
  }
  upsertCurrency(i: UpsertCurrencyOverlay): Promise<CurrencyOverlayRow> {
    const prev = this.cur.get(i.code);
    const row: CurrencyOverlayRow = {
      id: prev?.id ?? `c-${i.code}`,
      code: i.code,
      origin: i.origin,
      arName: i.arName ?? prev?.arName ?? null,
      enName: i.enName ?? prev?.enName ?? null,
      rate: i.rate ?? prev?.rate ?? null,
      ratePos: i.ratePos ?? prev?.ratePos ?? null,
      fractionNo: i.fractionNo ?? prev?.fractionNo ?? null,
      isLocal: i.isLocal ?? prev?.isLocal ?? null,
      inactive: i.inactive ?? prev?.inactive ?? false,
    };
    this.cur.set(i.code, row);
    return Promise.resolve(row);
  }
}

describe('MasterDataService (POSI003/004/005/011)', () => {
  let erp: FakeErp;
  let overlay: FakeOverlay;
  let svc: MasterDataService;

  beforeEach(() => {
    erp = new FakeErp();
    overlay = new FakeOverlay();
    erp.warehouses = [
      {
        code: 1,
        arName: 'المخزن الرئيسي',
        enName: null,
        location: null,
        tel: null,
        keeper: null,
        noSale: false,
        priceLevel: null,
        inactive: false,
      },
    ];
    erp.groups = [
      {
        code: '01',
        arName: 'التموينات الاساسية',
        enName: null,
        taxPercent: null,
        allowDiscount: true,
        sortOrder: 1,
        itemCount: 112,
        inactive: false,
      },
    ];
    erp.units = [
      {
        code: 'حبة',
        arName: 'حبة',
        enName: null,
        defaultSize: 1,
        inactive: false,
      },
    ];
    erp.currencies = [
      {
        code: 'YER',
        no: 1,
        arName: 'ريال يمني',
        enName: null,
        rate: 1,
        ratePos: 1,
        fractionNo: 3,
        isLocal: true,
        inactive: false,
      },
      {
        code: 'USD',
        no: 3,
        arName: 'دولار',
        enName: 'US Dollar',
        rate: 530,
        ratePos: null,
        fractionNo: 3,
        isLocal: false,
        inactive: false,
      },
    ];
    svc = new MasterDataService(erp, overlay);
  });

  it('creates a LOCAL warehouse with auto code >= 900', async () => {
    const w = await svc.createWarehouse({ arName: 'مخزن الفرع' });
    expect(w.code).toBe(900);
    expect(w.origin).toBe('LOCAL');
    expect((await svc.listWarehouses())).toHaveLength(2);
  });

  it('EDIT-overlays an ERP warehouse (keeper) keeping the ERP name', async () => {
    const w = await svc.updateWarehouse(1, { keeper: 'صالح' });
    expect(w.origin).toBe('EDIT');
    expect(w.keeper).toBe('صالح');
    expect(w.arName).toBe('المخزن الرئيسي');
  });

  it('rejects duplicate warehouse codes (ERP or overlay)', async () => {
    await expect(svc.createWarehouse({ code: 1 })).rejects.toThrow(
      ConflictException,
    );
  });

  it('item groups: keeps live ERP itemCount when EDIT-overlaid', async () => {
    const g = await svc.updateItemGroup('01', { taxPercent: 0 });
    expect(g.taxPercent).toBe(0);
    expect(g.itemCount).toBe(112);
    expect(g.origin).toBe('EDIT');
  });

  it('units: duplicate ERP code conflicts; new code creates LOCAL', async () => {
    await expect(svc.createUnit({ code: 'حبة' })).rejects.toThrow(
      ConflictException,
    );
    const u = await svc.createUnit({ code: 'طبلية', defaultSize: 30 });
    expect(u.origin).toBe('LOCAL');
    expect((await svc.listUnits())).toHaveLength(2);
  });

  it('currencies: POS rate falls back to accounting rate when unset', async () => {
    const list = await svc.listCurrencies();
    const usd = list.find((c) => c.code === 'USD');
    expect(usd?.ratePos).toBe(530); // fallback to CUR_RATE
  });

  it('currencies: overlay EDIT updates the POS rate only', async () => {
    const c = await svc.updateCurrency('USD', { ratePos: 540 });
    expect(c.origin).toBe('EDIT');
    expect(c.ratePos).toBe(540);
    expect(c.rate).toBe(530); // accounting rate untouched
  });

  it('currencies: unknown code 404s; new LOCAL currency uppercased', async () => {
    await expect(svc.updateCurrency('XXX', { ratePos: 1 })).rejects.toThrow(
      NotFoundException,
    );
    const c = await svc.createCurrency({ code: 'eur', arName: 'يورو', rate: 580 });
    expect(c.code).toBe('EUR');
    expect(c.ratePos).toBe(580); // defaults to rate
  });
});
