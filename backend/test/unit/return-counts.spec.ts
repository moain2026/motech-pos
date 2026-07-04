import { describe, expect, it } from 'vitest';
import { ReturnCountService } from '../../src/modules/return-counts/application/return-count.service';
import {
  CreateReturnCountInput,
  ListReturnCountsFilter,
  ReturnCountDetail,
  ReturnCountHeader,
  ReturnCountLine,
  ReturnCountRepository,
  UpsertReturnCountLineInput,
} from '../../src/modules/return-counts/domain/ports/return-count.port';
import {
  ItemNotFoundError,
  StockCountEmptyError,
  StockCountNotFoundError,
  StockCountPostedError,
  TransferWarehouseNotFoundError,
} from '../../src/shared/errors/domain-error';

class FakeRepo implements ReturnCountRepository {
  machines = new Set<number>([1, 3]);
  names = new Map<string, string>();
  returned = new Map<string, number>(); // `${item}@${machine}@${date}` → qty
  store = new Map<string, ReturnCountDetail & { postKey?: string }>();
  private seq = 0;

  create(input: CreateReturnCountInput): Promise<ReturnCountDetail> {
    const id = `rc-${++this.seq}`;
    const c: ReturnCountDetail = {
      id,
      countNo: this.seq,
      machineNo: input.machineNo,
      countDate: input.countDate,
      status: 'DRAFT',
      refNo: input.refNo,
      note: input.note,
      createdBy: input.createdBy,
      createdAt: new Date().toISOString(),
      postedBy: null,
      postedAt: null,
      lineCount: 0,
      lines: [],
    };
    this.store.set(id, c);
    return Promise.resolve(c);
  }

  findById(id: string): Promise<ReturnCountDetail | null> {
    return Promise.resolve(this.store.get(id) ?? null);
  }

  findByPostKey(key: string): Promise<ReturnCountDetail | null> {
    const hit = [...this.store.values()].find((c) => c.postKey === key);
    return Promise.resolve(hit ?? null);
  }

  list(filter: ListReturnCountsFilter): Promise<ReturnCountHeader[]> {
    const all = [...this.store.values()].filter(
      (c) =>
        (!filter.status || c.status === filter.status) &&
        (filter.machineNo == null || c.machineNo === filter.machineNo),
    );
    return Promise.resolve(all.slice(0, filter.limit));
  }

  upsertLine(input: UpsertReturnCountLineInput): Promise<ReturnCountLine> {
    const c = this.store.get(input.countId);
    if (!c) throw new Error('missing count');
    const line: ReturnCountLine = {
      lineId: `${input.countId}-${input.itemCode}`,
      itemCode: input.itemCode,
      itemName: input.itemName,
      systemQty: input.systemQty,
      countedQty: input.countedQty,
      diffQty: input.countedQty - input.systemQty,
    };
    const idx = c.lines.findIndex((l) => l.itemCode === input.itemCode);
    if (idx >= 0) c.lines[idx] = line;
    else c.lines.push(line);
    c.lineCount = c.lines.length;
    return Promise.resolve(line);
  }

  post(
    id: string,
    postedBy: string,
    idempotencyKey: string,
  ): Promise<ReturnCountDetail | null> {
    const c = this.store.get(id);
    if (!c || c.status !== 'DRAFT') return Promise.resolve(null);
    c.status = 'POSTED';
    c.postedBy = postedBy;
    c.postedAt = new Date().toISOString();
    c.postKey = idempotencyKey;
    return Promise.resolve(c);
  }

  machineExists(machineNo: number): Promise<boolean> {
    return Promise.resolve(this.machines.has(machineNo));
  }

  systemReturnedQty(
    itemCode: string,
    machineNo: number,
    countDate: string,
  ): Promise<number> {
    return Promise.resolve(
      this.returned.get(`${itemCode}@${machineNo}@${countDate}`) ?? 0,
    );
  }

  itemName(itemCode: string): Promise<string | null> {
    return Promise.resolve(this.names.get(itemCode) ?? null);
  }
}

function makeSvc() {
  const repo = new FakeRepo();
  repo.names.set('ITM-1', 'صنف مردود');
  repo.returned.set('ITM-1@1@2026-07-03', 5);
  return { repo, svc: new ReturnCountService(repo) };
}

const KEY = '01980000-0000-7000-8000-0000000000c1';

describe('ReturnCountService (POST022)', () => {
  it('opens a session; 404 on unknown machine', async () => {
    const { svc } = makeSvc();
    const c = await svc.start({
      machineNo: 1,
      countDate: '2026-07-03',
      createdBy: 'u',
    });
    expect(c.status).toBe('DRAFT');
    await expect(
      svc.start({ machineNo: 9, countDate: '2026-07-03', createdBy: 'u' }),
    ).rejects.toBeInstanceOf(TransferWarehouseNotFoundError);
  });

  it('counts a line: diff = counted − system returned qty', async () => {
    const { svc } = makeSvc();
    const c = await svc.start({
      machineNo: 1,
      countDate: '2026-07-03',
      createdBy: 'u',
    });
    const line = await svc.countLine({
      countId: c.id,
      itemCode: 'ITM-1',
      countedQty: 3,
    });
    expect(line.systemQty).toBe(5);
    expect(line.diffQty).toBe(-2); // 2 returned units missing physically
  });

  it('rejects items with no name AND no returns that day', async () => {
    const { svc } = makeSvc();
    const c = await svc.start({
      machineNo: 1,
      countDate: '2026-07-03',
      createdBy: 'u',
    });
    await expect(
      svc.countLine({ countId: c.id, itemCode: 'GHOST', countedQty: 1 }),
    ).rejects.toBeInstanceOf(ItemNotFoundError);
  });

  it('posting freezes the session; empty session 422; replay-safe', async () => {
    const { svc } = makeSvc();
    const c = await svc.start({
      machineNo: 1,
      countDate: '2026-07-03',
      createdBy: 'u',
    });
    await expect(svc.post(c.id, 's', KEY)).rejects.toBeInstanceOf(
      StockCountEmptyError,
    );
    await svc.countLine({ countId: c.id, itemCode: 'ITM-1', countedQty: 5 });
    const { count, replayed } = await svc.post(c.id, 's', KEY);
    expect(replayed).toBe(false);
    expect(count.status).toBe('POSTED');
    const again = await svc.post(c.id, 's', KEY);
    expect(again.replayed).toBe(true);
    await expect(
      svc.countLine({ countId: c.id, itemCode: 'ITM-1', countedQty: 9 }),
    ).rejects.toBeInstanceOf(StockCountPostedError);
    await expect(
      svc.post(c.id, 's', '01980000-0000-7000-8000-0000000000c2'),
    ).rejects.toBeInstanceOf(StockCountPostedError);
  });

  it('404s on unknown ids; filters lists', async () => {
    const { svc } = makeSvc();
    await expect(svc.byId('missing')).rejects.toBeInstanceOf(
      StockCountNotFoundError,
    );
    await svc.start({ machineNo: 1, countDate: '2026-07-03', createdBy: 'u' });
    await svc.start({ machineNo: 3, countDate: '2026-07-03', createdBy: 'u' });
    expect(await svc.list({ machineNo: 1, limit: 10 })).toHaveLength(1);
    expect(await svc.list({ limit: 10 })).toHaveLength(2);
  });
});
