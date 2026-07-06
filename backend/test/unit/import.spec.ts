import { beforeEach, describe, expect, it } from 'vitest';
import { ImportService } from '../../src/modules/catalog/application/import.service';
import type {
  ImportBatchRow,
  ImportRepository,
  SaveImportBatch,
  UpsertOpeningBalance,
} from '../../src/modules/catalog/domain/ports/import.port';
import type {
  ItemDetail,
  ItemRepository,
} from '../../src/modules/catalog/domain/ports/item-repository.port';
import type {
  ItemOverlayRepository,
  ItemOverlayRow,
  UpsertItemOverlayInput,
} from '../../src/modules/catalog/domain/ports/item-overlay.port';
import { InvalidOverlayError } from '../../src/shared/errors/domain-error';

class FakeImportRepo implements ImportRepository {
  batches: ImportBatchRow[] = [];
  balances: UpsertOpeningBalance[] = [];
  saveBatch(input: SaveImportBatch) {
    const row: ImportBatchRow = {
      id: `b${this.batches.length + 1}`,
      kind: input.kind,
      fileName: input.fileName,
      totalRows: input.totalRows,
      okRows: input.okRows,
      errorRows: input.errorRows,
      status: input.status,
      errors: input.errors,
      createdBy: input.createdBy,
      createdAt: new Date().toISOString(),
    };
    this.batches.push(row);
    return Promise.resolve(row);
  }
  listBatches() {
    return Promise.resolve(this.batches);
  }
  getBatch(id: string) {
    return Promise.resolve(this.batches.find((b) => b.id === id) ?? null);
  }
  upsertOpeningBalance(input: UpsertOpeningBalance) {
    this.balances.push(input);
    return Promise.resolve();
  }
}

class FakeItemRepo implements Partial<ItemRepository> {
  erpCodes = new Set<string>(['90001', '90002']);
  findByCode(code: string): Promise<ItemDetail | null> {
    return Promise.resolve(
      this.erpCodes.has(code) ? ({ code } as unknown as ItemDetail) : null,
    );
  }
}

class FakeOverlayRepo implements ItemOverlayRepository {
  rows = new Map<string, ItemOverlayRow>();
  findByCode(code: string) {
    return Promise.resolve(this.rows.get(code) ?? null);
  }
  findByCodes(codes: string[]) {
    const m = new Map<string, ItemOverlayRow>();
    for (const c of codes) if (this.rows.has(c)) m.set(c, this.rows.get(c)!);
    return Promise.resolve(m);
  }
  listLocal() {
    return Promise.resolve([] as ItemOverlayRow[]);
  }
  upsert(input: UpsertItemOverlayInput) {
    const row: ItemOverlayRow = {
      code: input.code,
      origin: input.origin,
      name: input.name ?? null,
      barcode: input.barcode ?? null,
      unit: input.unit ?? null,
      price: input.price ?? null,
      vatPercent: input.vatPercent ?? null,
      minLimitQty: input.minLimitQty ?? null,
      maxLimitQty: input.maxLimitQty ?? null,
      reorderLimitQty: input.reorderLimitQty ?? null,
      inactive: input.inactive ?? false,
      createdAt: '',
      updatedAt: '',
    };
    this.rows.set(input.code, row);
    return Promise.resolve(row);
  }
}

function svcOf() {
  const repo = new FakeImportRepo();
  const items = new FakeItemRepo();
  const overlay = new FakeOverlayRepo();
  const svc = new ImportService(
    repo,
    items as unknown as ItemRepository,
    overlay,
  );
  return { svc, repo, items, overlay };
}

const buf = (s: string) => Buffer.from(s, 'utf8');

describe('ImportService (ITEMS)', () => {
  it('previews without writing (dry-run) and reports per-row errors', async () => {
    const { svc, overlay, repo } = svcOf();
    const csv =
      'code,name,price\nA1,Foo,10\nA2,Bad,abc\n,NoCode,5\nA4,Neg,-1\n';
    const r = await svc.run('ITEMS', buf(csv), 'x.csv', false, 1);
    expect(r.totalRows).toBe(4);
    expect(r.okRows).toBe(1);
    expect(r.errorRows).toBe(3);
    expect(r.errors.map((e) => e.row)).toEqual([2, 3, 4]);
    expect(r.committed).toBe(false);
    expect(overlay.rows.size).toBe(0);
    expect(repo.batches.length).toBe(0);
  });

  it('commits valid rows to the overlay + records a batch', async () => {
    const { svc, overlay, repo } = svcOf();
    const csv = 'code,name,price\nNEW1,Foo,10\n';
    const r = await svc.run('ITEMS', buf(csv), 'x.csv', true, 7);
    expect(r.committed).toBe(true);
    expect(overlay.rows.get('NEW1')?.origin).toBe('LOCAL');
    expect(overlay.rows.get('NEW1')?.price).toBe(10);
    expect(repo.batches.length).toBe(1);
    expect(repo.batches[0].createdBy).toBe(7);
  });

  it('marks an ERP item edit as origin EDIT', async () => {
    const { svc, overlay } = svcOf();
    const csv = 'code,price\n90001,999\n';
    await svc.run('PRICES', buf(csv), 'p.csv', true, 1);
    expect(overlay.rows.get('90001')?.origin).toBe('EDIT');
    expect(overlay.rows.get('90001')?.price).toBe(999);
  });

  it('reports unknown items for PRICES', async () => {
    const { svc, overlay } = svcOf();
    const csv = 'code,price\n90001,10\nGHOST,20\n';
    const r = await svc.run('PRICES', buf(csv), 'p.csv', true, 1);
    expect(r.okRows).toBe(1);
    expect(r.errorRows).toBe(1);
    expect(r.errors[0].code).toBe('unknown-item');
    expect(r.errors[0].row).toBe(2);
    expect(overlay.rows.has('GHOST')).toBe(false);
  });

  it('imports opening balances per item+warehouse', async () => {
    const { svc, repo } = svcOf();
    const csv = 'code,qty,warehouse\n90001,120,1\n90002,55.5,2\n';
    const r = await svc.run('BALANCES', buf(csv), 'b.csv', true, 1);
    expect(r.okRows).toBe(2);
    expect(repo.balances).toHaveLength(2);
    expect(repo.balances[0]).toMatchObject({ iCode: '90001', wCode: 1, qty: 120 });
  });

  it('rejects a file missing a required column', async () => {
    const { svc } = svcOf();
    await expect(
      svc.run('ITEMS', buf('name,price\nFoo,10\n'), 'x.csv', false, 1),
    ).rejects.toBeInstanceOf(InvalidOverlayError);
  });

  it('rejects an empty file', async () => {
    const { svc } = svcOf();
    await expect(
      svc.run('ITEMS', buf(''), 'x.csv', false, 1),
    ).rejects.toBeInstanceOf(InvalidOverlayError);
  });

  it('maps Arabic header aliases', async () => {
    const { svc } = svcOf();
    const csv = 'الكود,الاسم,السعر\nZ1,صنف,90\n';
    const r = await svc.run('ITEMS', buf(csv), 'ar.csv', false, 1);
    expect(r.okRows).toBe(1);
    expect(r.sample[0]).toMatchObject({ code: 'Z1', price: 90 });
  });
});
