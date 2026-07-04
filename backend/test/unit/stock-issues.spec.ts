import { describe, expect, it } from 'vitest';
import { StockIssueService } from '../../src/modules/stock-receiving/application/stock-issue.service';
import {
  CreateStockIssueInput,
  ListStockIssuesFilter,
  StockIssueDetail,
  StockIssueHeader,
  StockIssueRepository,
} from '../../src/modules/stock-receiving/domain/ports/stock-issue.port';
import type { ReceiptItemSnapshot } from '../../src/modules/stock-receiving/domain/ports/stock-receipt.port';
import {
  InsufficientStockError,
  ItemNotFoundError,
  StockReceiptStateError,
} from '../../src/shared/errors/domain-error';

class FakeRepo implements StockIssueRepository {
  warehouses = new Set<number>([1, 2]);
  items = new Map<string, ReceiptItemSnapshot>();
  stock = new Map<string, number>(); // `${item}@${wh}` → available qty
  store = new Map<string, StockIssueDetail & { postKey?: string }>();
  private seq = 0;

  create(input: CreateStockIssueInput): Promise<StockIssueDetail> {
    const id = `si-${++this.seq}`;
    const s: StockIssueDetail = {
      id,
      issueNo: this.seq,
      warehouseCode: input.warehouseCode,
      destWarehouseCode: input.destWarehouseCode,
      transferId: input.transferId,
      status: 'DRAFT',
      refNo: input.refNo,
      note: input.note,
      createdBy: input.createdBy,
      createdAt: new Date().toISOString(),
      postedBy: null,
      postedAt: null,
      onyxDocNo: null,
      onyxDocSer: null,
      cancelledBy: null,
      cancelledAt: null,
      lineCount: input.lines.length,
      lines: input.lines.map((l, i) => ({
        lineId: `${id}-l${i}`,
        itemCode: l.itemCode,
        itemName: l.itemName,
        qty: l.qty,
        itmUnt: l.itmUnt,
        pSize: l.pSize,
        unitCost: l.unitCost,
        note: l.note,
      })),
    };
    this.store.set(id, s);
    return Promise.resolve(s);
  }

  findById(id: string): Promise<StockIssueDetail | null> {
    return Promise.resolve(this.store.get(id) ?? null);
  }

  findByPostKey(key: string): Promise<StockIssueDetail | null> {
    const hit = [...this.store.values()].find((r) => r.postKey === key);
    return Promise.resolve(hit ?? null);
  }

  list(filter: ListStockIssuesFilter): Promise<StockIssueHeader[]> {
    const all = [...this.store.values()].filter(
      (r) =>
        (!filter.status || r.status === filter.status) &&
        (filter.warehouse == null ||
          r.warehouseCode === filter.warehouse ||
          r.destWarehouseCode === filter.warehouse),
    );
    return Promise.resolve(all.slice(0, filter.limit));
  }

  post(
    id: string,
    postedBy: string,
    idempotencyKey: string,
  ): Promise<StockIssueDetail | null> {
    const r = this.store.get(id);
    if (!r || r.status !== 'DRAFT') return Promise.resolve(null);
    r.status = 'POSTED';
    r.postedBy = postedBy;
    r.postedAt = new Date().toISOString();
    r.postKey = idempotencyKey;
    r.onyxDocNo = 100 + this.seq;
    r.onyxDocSer = 20260000011300 + this.seq;
    // stock LEAVES the source
    for (const l of r.lines) {
      const k = `${l.itemCode}@${r.warehouseCode}`;
      this.stock.set(k, (this.stock.get(k) ?? 0) - l.qty * l.pSize);
    }
    return Promise.resolve(r);
  }

  cancel(id: string, cancelledBy: string): Promise<StockIssueDetail | null> {
    const r = this.store.get(id);
    if (!r || r.status !== 'DRAFT') return Promise.resolve(null);
    r.status = 'CANCELLED';
    r.cancelledBy = cancelledBy;
    r.cancelledAt = new Date().toISOString();
    return Promise.resolve(r);
  }

  warehouseExists(wCode: number): Promise<boolean> {
    return Promise.resolve(this.warehouses.has(wCode));
  }

  itemSnapshot(itemCode: string): Promise<ReceiptItemSnapshot | null> {
    return Promise.resolve(this.items.get(itemCode) ?? null);
  }

  availableQty(itemCode: string, wCode: number): Promise<number | null> {
    return Promise.resolve(this.stock.get(`${itemCode}@${wCode}`) ?? null);
  }
}

function makeSvc() {
  const repo = new FakeRepo();
  repo.items.set('ITM-1', {
    itemName: 'صنف محوّل',
    itmUnt: 'NO',
    pSize: 1,
    unitCost: 500,
  });
  repo.stock.set('ITM-1@1', 10);
  return { repo, svc: new StockIssueService(repo) };
}

const KEY = '01980000-0000-7000-8000-0000000000f1';

describe('StockIssueService (POST028)', () => {
  it('creates a DRAFT issue with snapshots', async () => {
    const { svc } = makeSvc();
    const s = await svc.create({
      warehouseCode: 1,
      destWarehouseCode: 2,
      createdBy: 'u',
      lines: [{ itemCode: 'ITM-1', qty: 3 }],
    });
    expect(s.status).toBe('DRAFT');
    expect(s.lines[0].itemName).toBe('صنف محوّل');
  });

  it('posting decrements source stock', async () => {
    const { svc, repo } = makeSvc();
    const s = await svc.create({
      warehouseCode: 1,
      createdBy: 'u',
      lines: [{ itemCode: 'ITM-1', qty: 3 }],
    });
    const { issue } = await svc.post(s.id, 'supervisor1', KEY);
    expect(issue.status).toBe('POSTED');
    expect(await repo.availableQty('ITM-1', 1)).toBe(7); // 10 − 3
  });

  it('422s when dispatching more than available (availability guard)', async () => {
    const { svc } = makeSvc();
    const s = await svc.create({
      warehouseCode: 1,
      createdBy: 'u',
      lines: [{ itemCode: 'ITM-1', qty: 11 }],
    });
    await expect(svc.post(s.id, 's', KEY)).rejects.toBeInstanceOf(
      InsufficientStockError,
    );
  });

  it('replays with the same key; 409 on new key after POSTED', async () => {
    const { svc, repo } = makeSvc();
    const s = await svc.create({
      warehouseCode: 1,
      createdBy: 'u',
      lines: [{ itemCode: 'ITM-1', qty: 2 }],
    });
    await svc.post(s.id, 's', KEY);
    const again = await svc.post(s.id, 's', KEY);
    expect(again.replayed).toBe(true);
    expect(await repo.availableQty('ITM-1', 1)).toBe(8); // unchanged
    await expect(
      svc.post(s.id, 's', '01980000-0000-7000-8000-0000000000f2'),
    ).rejects.toBeInstanceOf(StockReceiptStateError);
  });

  it('validates warehouses + items; cancel only DRAFT', async () => {
    const { svc } = makeSvc();
    await expect(
      svc.create({
        warehouseCode: 9,
        createdBy: 'u',
        lines: [{ itemCode: 'ITM-1', qty: 1 }],
      }),
    ).rejects.toBeInstanceOf(Error);
    await expect(
      svc.create({
        warehouseCode: 1,
        createdBy: 'u',
        lines: [{ itemCode: 'NOPE', qty: 1 }],
      }),
    ).rejects.toBeInstanceOf(ItemNotFoundError);
    const s = await svc.create({
      warehouseCode: 1,
      createdBy: 'u',
      lines: [{ itemCode: 'ITM-1', qty: 1 }],
    });
    const c = await svc.cancel(s.id, 'u');
    expect(c.status).toBe('CANCELLED');
    await expect(svc.cancel(s.id, 'u')).rejects.toBeInstanceOf(
      StockReceiptStateError,
    );
  });
});
