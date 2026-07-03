import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TypedConfigService } from '../../src/config/config.module';
import { OracleService } from '../../src/infrastructure/oracle/oracle.service';
import { OracleItemRepository } from '../../src/modules/catalog/infrastructure/oracle-item.repository';

/**
 * CATALOG INTEGRATION — proof-not-assumption (live Oracle, READ-ONLY).
 *
 * Exercises OracleItemRepository against the REAL YSPOS23 data that exists
 * locally (MV_ITEM_AVL_QTY + IAS_POS_BILL_DTL). Requires the same ORACLE_*
 * env as the app:  set -a && . ./.env && set +a && npm run test:golden
 */

function configFromEnv(): TypedConfigService {
  const values: Record<string, unknown> = {
    ORACLE_USER: process.env.ORACLE_USER ?? 'MOTECH_RO',
    ORACLE_PASSWORD: process.env.ORACLE_PASSWORD ?? 'motech_ro_2026',
    ORACLE_CONNECT_STRING:
      process.env.ORACLE_CONNECT_STRING ?? '127.0.0.1:1521/xe',
    ORACLE_SCHEMA: process.env.ORACLE_SCHEMA ?? 'YSPOS23',
    ORACLE_MASTER_SCHEMA: process.env.ORACLE_MASTER_SCHEMA ?? 'IAS202623',
    ORACLE_POOL_MIN: 1,
    ORACLE_POOL_MAX: 2,
    ORACLE_POOL_TIMEOUT: 30,
  };
  return { get: (k: string) => values[k] } as unknown as TypedConfigService;
}

let oracle: OracleService;
let repo: OracleItemRepository;

beforeAll(async () => {
  oracle = new OracleService(configFromEnv());
  await oracle.onModuleInit();
  repo = new OracleItemRepository(oracle);
});

afterAll(async () => {
  if (oracle) await oracle.onApplicationShutdown();
});

describe('Catalog — OracleItemRepository against real data', () => {
  it('lists real items with cursor pagination', async () => {
    const page1 = await repo.list({ limit: 5 });
    expect(page1.items.length).toBe(5);
    // codes are ascending and unique
    const codes = page1.items.map((i) => i.code);
    expect([...codes].sort()).toEqual(codes);
    expect(page1.nextCursor).toBeTruthy();

    const page2 = await repo.list({ limit: 5, cursor: page1.nextCursor });
    expect(page2.items.length).toBeGreaterThan(0);
    // no overlap with page1
    expect(page2.items[0].code > page1.items[4].code).toBe(true);
  });

  it('finds a real item by code with per-warehouse stock', async () => {
    const first = (await repo.list({ limit: 1 })).items[0];
    const detail = await repo.findByCode(first.code);
    expect(detail).not.toBeNull();
    expect(detail!.item.code).toBe(first.code);
    expect(Array.isArray(detail!.stock)).toBe(true);
    // total equals the sum of per-warehouse quantities
    const sum = detail!.stock.reduce((a, s) => a + s.availableQty, 0);
    expect(detail!.totalAvailableQty).toBe(sum);
  });

  it('resolves a real barcode back to its item code', async () => {
    // find an item that actually has a barcode from sale history
    let withBarcode: string | null = null;
    let cursor: string | undefined;
    for (let i = 0; i < 20 && !withBarcode; i++) {
      const page = await repo.list({ limit: 50, cursor });
      const hit = page.items.find((it) => it.barcode);
      if (hit) withBarcode = hit.barcode;
      cursor = page.nextCursor;
      if (!cursor) break;
    }
    expect(withBarcode).toBeTruthy();
    const byBc = await repo.findByBarcode(withBarcode!);
    expect(byBc).not.toBeNull();
    expect(byBc!.item.barcode).toBe(withBarcode);
  });

  it('returns null for an unknown item code', async () => {
    const missing = await repo.findByCode('___NO_SUCH_CODE___');
    expect(missing).toBeNull();
  });

  it('resolves the real Arabic item name from IAS202623.IAS_ITM_MST', async () => {
    // 1020060001 → "بيض" (proven via sqlplus on the live master)
    const detail = await repo.findByCode('1020060001');
    expect(detail).not.toBeNull();
    expect(detail!.item.name).toBe('بيض');
  });

  it('lists items WITH their Arabic names (master join)', async () => {
    const page = await repo.list({ limit: 10 });
    const named = page.items.filter((i) => i.name && i.name.trim().length > 0);
    // the vast majority of catalog items have a name in the master now
    expect(named.length).toBeGreaterThan(0);
  });

  it('searches items by Arabic name substring', async () => {
    const res = await repo.list({ limit: 5, search: 'ارز' });
    expect(res.items.length).toBeGreaterThan(0);
    expect(res.items.every((i) => (i.name ?? '').includes('ارز'))).toBe(true);
  });

  it('search filters by code substring', async () => {
    const first = (await repo.list({ limit: 1 })).items[0];
    const prefix = first.code.slice(0, 4);
    const res = await repo.list({ limit: 10, search: prefix });
    expect(res.items.length).toBeGreaterThan(0);
    expect(res.items.every((i) => i.code.includes(prefix) || i.barcode)).toBe(
      true,
    );
  });
});

describe('Catalog — advanced (prices / units / categories / filters)', () => {
  it('lists ALL price-list rows for a real item (IAS_ITEM_PRICE)', async () => {
    // 1010010013 has two price rows: كيس (base, 850) and قطمه (20-pack, 17000)
    const prices = await repo.listPrices('1010010013');
    expect(prices.length).toBeGreaterThanOrEqual(2);
    expect(prices.every((p) => p.levNo >= 1 && p.price > 0)).toBe(true);
    const base = prices.find((p) => p.packSize === 1);
    const pack = prices.find((p) => (p.packSize ?? 0) > 1);
    expect(base?.price).toBe(850);
    expect(pack?.price).toBe(17000);
  });

  it('resolves the price for a chosen level (base unit by default)', async () => {
    const p = await repo.findPriceAtLevel('1010010013', 1);
    expect(p).not.toBeNull();
    expect(p?.levNo).toBe(1);
    expect(p?.packSize).toBe(1); // smallest pack → base unit
    expect(p?.price).toBe(850);
  });

  it('resolves the price for a chosen level + explicit unit', async () => {
    const all = await repo.listPrices('1010010013');
    const pack = all.find((r) => (r.packSize ?? 0) > 1);
    expect(pack).toBeTruthy();
    const p = await repo.findPriceAtLevel('1010010013', 1, pack?.unit);
    expect(p?.unit).toBe(pack?.unit);
    expect(p?.price).toBe(pack?.price);
  });

  it('returns null for a price level that does not exist', async () => {
    const p = await repo.findPriceAtLevel('1010010013', 99);
    expect(p).toBeNull();
  });

  it('lists units of measure with conversion factors (IAS_ITM_DTL)', async () => {
    const units = await repo.listUnits('1010010013');
    expect(units.length).toBeGreaterThanOrEqual(2);
    const main = units.find((u) => u.isMainUnit);
    expect(main).toBeTruthy();
    expect(main?.packSize).toBe(1);
    expect(main?.barcode).toBe('6287002861172');
    const pack = units.find((u) => u.packSize > 1);
    expect(pack?.packSize).toBe(20); // 1 قطمه = 20 كيس
    // ordered ascending by pack size (base first)
    const sizes = units.map((u) => u.packSize);
    expect([...sizes].sort((a, b) => a - b)).toEqual(sizes);
  });

  it('builds the category tree with item counts (GROUP_DETAILS)', async () => {
    const tree = await repo.listCategories();
    expect(tree.length).toBeGreaterThan(0);
    const total = tree.reduce((a, g) => a + g.itemCount, 0);
    expect(total).toBeGreaterThan(2000); // 2,391 items in the master
    const withChildren = tree.find((g) => g.children.length > 0);
    expect(withChildren).toBeTruthy();
    expect(withChildren?.name).toBeTruthy(); // Arabic names present
  });

  it('lists item nature types (ITEM_TYPES)', async () => {
    const types = await repo.listItemTypes();
    expect(types.length).toBe(2); // موزونة / غير موزونة
    expect(types.every((t) => t.name)).toBe(true);
  });

  it('filters the item list by category (G_CODE)', async () => {
    const tree = await repo.listCategories();
    const g = tree.find((x) => x.itemCount > 0);
    expect(g).toBeTruthy();
    const res = await repo.list({ limit: 10, category: g?.code });
    expect(res.items.length).toBeGreaterThan(0);
  });

  it('filters weighted (scale) items only', async () => {
    const res = await repo.list({ limit: 10, weighted: true });
    expect(res.items.length).toBeGreaterThan(0); // 18 weighted items exist
    expect(res.items.length).toBeLessThanOrEqual(10);
  });

  it('filters by price range using the live price list', async () => {
    const res = await repo.list({ limit: 10, minPrice: 500, maxPrice: 1000 });
    expect(res.items.length).toBeGreaterThan(0);
    for (const i of res.items) {
      const p = i.lastPrice()?.toNumber();
      expect(p).not.toBeNull();
      expect(p!).toBeGreaterThanOrEqual(500);
      expect(p!).toBeLessThanOrEqual(1000);
    }
  });

  it('item detail prefers the LIVE price list over last-sale price', async () => {
    const detail = await repo.findByCode('1010010013');
    expect(detail?.item.lastPrice()?.toNumber()).toBe(850); // IAS_ITEM_PRICE LEV 1
  });
});
