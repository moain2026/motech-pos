import { beforeEach, describe, expect, it } from 'vitest';
import { StockCountService } from '../../src/modules/inventory/application/stock-count.service';
import {
  CreateStockCountInput,
  ListStockCountsFilter,
  StockCountDetail,
  StockCountHeader,
  StockCountLine,
  StockCountRepository,
  UpsertLineInput,
} from '../../src/modules/inventory/domain/ports/stock-count.port';
import {
  StockCountEmptyError,
  StockCountNotFoundError,
  StockCountPostedError,
} from '../../src/shared/errors/domain-error';

class FakeRepo implements StockCountRepository {
  counts = new Map<string, StockCountDetail>();
  stock = new Map<string, number>(); // `${itemCode}@${wCode}` → qty
  names = new Map<string, string>();
  private seq = 0;

  create(input: CreateStockCountInput): Promise<StockCountDetail> {
    const id = `sc-${++this.seq}`;
    const c: StockCountDetail = {
      id,
      warehouseCode: input.warehouseCode,
      status: 'DRAFT',
      note: input.note,
      createdBy: input.createdBy,
      createdAt: new Date().toISOString(),
      postedBy: null,
      postedAt: null,
      lineCount: 0,
      varianceCount: 0,
      lines: [],
    };
    this.counts.set(id, c);
    return Promise.resolve(c);
  }

  findById(id: string): Promise<StockCountDetail | null> {
    return Promise.resolve(this.counts.get(id) ?? null);
  }

  findByPostIdempotencyKey(key: string): Promise<StockCountDetail | null> {
    for (const c of this.counts.values()) {
      if ((c as { postKey?: string } & StockCountDetail).postKey === key) {
        return Promise.resolve(c);
      }
    }
    return Promise.resolve(null);
  }

  list(filter: ListStockCountsFilter): Promise<StockCountHeader[]> {
    const all = [...this.counts.values()].filter(
      (c) => !filter.status || c.status === filter.status,
    );
    return Promise.resolve(all.slice(0, filter.limit));
  }

  upsertLine(input: UpsertLineInput): Promise<StockCountLine> {
    const c = this.counts.get(input.countId)!;
    const diff = input.countedQty - input.systemQty;
    const existing = c.lines.find((l) => l.itemCode === input.itemCode);
    const line: StockCountLine = {
      lineId: existing?.lineId ?? `ln-${c.lines.length + 1}`,
      itemCode: input.itemCode,
      itemName: input.itemName,
      systemQty: input.systemQty,
      countedQty: input.countedQty,
      diffQty: diff,
      countedAt: new Date().toISOString(),
    };
    if (existing) {
      c.lines[c.lines.indexOf(existing)] = line;
    } else {
      c.lines.push(line);
    }
    c.lineCount = c.lines.length;
    c.varianceCount = c.lines.filter((l) => l.diffQty !== 0).length;
    return Promise.resolve(line);
  }

  post(id: string, postedBy: string, key: string): Promise<StockCountDetail> {
    const c = this.counts.get(id)!;
    if (c.status === 'DRAFT') {
      c.status = 'POSTED';
      c.postedBy = postedBy;
      c.postedAt = new Date().toISOString();
      (c as { postKey?: string } & StockCountDetail).postKey = key;
    }
    return Promise.resolve(c);
  }

  systemQty(itemCode: string, warehouseCode: number): Promise<number> {
    return Promise.resolve(this.stock.get(`${itemCode}@${warehouseCode}`) ?? 0);
  }

  itemName(itemCode: string): Promise<string | null> {
    return Promise.resolve(this.names.get(itemCode) ?? null);
  }
}

describe('StockCountService (POST018 جرد المخزون)', () => {
  let repo: FakeRepo;
  let svc: StockCountService;

  beforeEach(() => {
    repo = new FakeRepo();
    svc = new StockCountService(repo);
    repo.stock.set('ITEM1@2', 12);
    repo.names.set('ITEM1', 'صنف تجريبي');
  });

  it('starts a DRAFT count and records a line with the variance', async () => {
    const c = await svc.start({ warehouseCode: 2, createdBy: 'sup1' });
    expect(c.status).toBe('DRAFT');

    const line = await svc.countLine({
      countId: c.id,
      itemCode: 'ITEM1',
      countedQty: 10,
    });
    expect(line.systemQty).toBe(12);
    expect(line.diffQty).toBe(-2);
    expect(line.itemName).toBe('صنف تجريبي');

    // Re-count of the same item replaces the line (upsert, no duplicate).
    const again = await svc.countLine({
      countId: c.id,
      itemCode: 'ITEM1',
      countedQty: 12,
    });
    expect(again.diffQty).toBe(0);
    const detail = await svc.byId(c.id);
    expect(detail.lineCount).toBe(1);
    expect(detail.varianceCount).toBe(0);
  });

  it('posts once, replays idempotently, and blocks further mutation', async () => {
    const c = await svc.start({ warehouseCode: 2, createdBy: 'sup1' });
    await svc.countLine({ countId: c.id, itemCode: 'ITEM1', countedQty: 9 });

    const first = await svc.post(c.id, 'sup1', 'key-1');
    expect(first.replayed).toBe(false);
    expect(first.count.status).toBe('POSTED');
    expect(first.count.postedBy).toBe('sup1');

    // Same key → replay of the original posting (no error, no double post).
    const replay = await svc.post(c.id, 'sup1', 'key-1');
    expect(replay.replayed).toBe(true);

    // Different key on a POSTED session → 409; counting more lines too.
    await expect(svc.post(c.id, 'sup1', 'key-2')).rejects.toBeInstanceOf(
      StockCountPostedError,
    );
    await expect(
      svc.countLine({ countId: c.id, itemCode: 'ITEM1', countedQty: 1 }),
    ).rejects.toBeInstanceOf(StockCountPostedError);
  });

  it('rejects posting an empty count and unknown ids', async () => {
    const c = await svc.start({ warehouseCode: 2, createdBy: 'sup1' });
    await expect(svc.post(c.id, 'sup1', 'key-x')).rejects.toBeInstanceOf(
      StockCountEmptyError,
    );
    await expect(svc.byId('nope')).rejects.toBeInstanceOf(
      StockCountNotFoundError,
    );
  });
});
