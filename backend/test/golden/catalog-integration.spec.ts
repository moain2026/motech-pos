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
