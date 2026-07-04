import { describe, expect, it } from 'vitest';
import { StockReceiptService } from '../../src/modules/stock-receiving/application/stock-receipt.service';
import {
  CreateStockReceiptInput,
  ListStockReceiptsFilter,
  ReceiptItemSnapshot,
  StockReceiptDetail,
  StockReceiptHeader,
  StockReceiptRepository,
} from '../../src/modules/stock-receiving/domain/ports/stock-receipt.port';
import {
  ItemNotFoundError,
  StockReceiptNotFoundError,
  StockReceiptStateError,
  TransferWarehouseNotFoundError,
} from '../../src/shared/errors/domain-error';

class FakeRepo implements StockReceiptRepository {
  warehouses = new Set<number>([1, 2]);
  items = new Map<string, ReceiptItemSnapshot>();
  stock = new Map<string, number>(); // `${item}@${wh}` → qty
  store = new Map<string, StockReceiptDetail & { postKey?: string }>();
  movements: Array<{ itemCode: string; qty: number; wCode: number }> = [];
  private seq = 0;

  create(input: CreateStockReceiptInput): Promise<StockReceiptDetail> {
    const id = `sr-${++this.seq}`;
    const r: StockReceiptDetail = {
      id,
      receiptNo: this.seq,
      warehouseCode: input.warehouseCode,
      sourceWarehouseCode: input.sourceWarehouseCode,
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
    this.store.set(id, r);
    return Promise.resolve(r);
  }

  findById(id: string): Promise<StockReceiptDetail | null> {
    return Promise.resolve(this.store.get(id) ?? null);
  }

  findByPostKey(key: string): Promise<StockReceiptDetail | null> {
    const hit = [...this.store.values()].find((r) => r.postKey === key);
    return Promise.resolve(hit ?? null);
  }

  list(filter: ListStockReceiptsFilter): Promise<StockReceiptHeader[]> {
    const all = [...this.store.values()].filter(
      (r) =>
        (!filter.status || r.status === filter.status) &&
        (filter.warehouse == null ||
          r.warehouseCode === filter.warehouse ||
          r.sourceWarehouseCode === filter.warehouse),
    );
    return Promise.resolve(all.slice(0, filter.limit));
  }

  post(
    id: string,
    postedBy: string,
    idempotencyKey: string,
  ): Promise<StockReceiptDetail | null> {
    const r = this.store.get(id);
    if (!r || r.status !== 'DRAFT') return Promise.resolve(null);
    r.status = 'POSTED';
    r.postedBy = postedBy;
    r.postedAt = new Date().toISOString();
    r.postKey = idempotencyKey;
    r.onyxDocNo = 100 + this.seq;
    r.onyxDocSer = 20260000011200 + this.seq;
    // Simulate the ITEM_MOVEMENT effect: stock goes UP at the warehouse.
    for (const l of r.lines) {
      const k = `${l.itemCode}@${r.warehouseCode}`;
      this.stock.set(k, (this.stock.get(k) ?? 0) + l.qty * l.pSize);
      this.movements.push({
        itemCode: l.itemCode,
        qty: l.qty * l.pSize,
        wCode: r.warehouseCode,
      });
    }
    return Promise.resolve(r);
  }

  cancel(id: string, cancelledBy: string): Promise<StockReceiptDetail | null> {
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
    itemName: 'صنف مستلم',
    itmUnt: 'CTN',
    pSize: 20,
    unitCost: 1670,
  });
  return { repo, svc: new StockReceiptService(repo) };
}

const KEY = '01980000-0000-7000-8000-00000000000a';

describe('StockReceiptService (POST029)', () => {
  it('creates a DRAFT receipt with item snapshots (name/unit/pack/cost)', async () => {
    const { svc } = makeSvc();
    const r = await svc.create({
      warehouseCode: 2,
      sourceWarehouseCode: 1,
      createdBy: 'cashier1',
      lines: [{ itemCode: 'ITM-1', qty: 5 }],
    });
    expect(r.status).toBe('DRAFT');
    expect(r.lines[0].itemName).toBe('صنف مستلم');
    expect(r.lines[0].itmUnt).toBe('CTN');
    expect(r.lines[0].pSize).toBe(20);
    expect(r.lines[0].unitCost).toBe(1670);
  });

  it('rejects unknown warehouses (404) and same source/destination (409)', async () => {
    const { svc } = makeSvc();
    await expect(
      svc.create({
        warehouseCode: 99,
        createdBy: 'u',
        lines: [{ itemCode: 'ITM-1', qty: 1 }],
      }),
    ).rejects.toBeInstanceOf(TransferWarehouseNotFoundError);
    await expect(
      svc.create({
        warehouseCode: 2,
        sourceWarehouseCode: 2,
        createdBy: 'u',
        lines: [{ itemCode: 'ITM-1', qty: 1 }],
      }),
    ).rejects.toBeInstanceOf(StockReceiptStateError);
  });

  it('rejects unknown items (404)', async () => {
    const { svc } = makeSvc();
    await expect(
      svc.create({
        warehouseCode: 2,
        createdBy: 'u',
        lines: [{ itemCode: 'NOPE', qty: 1 }],
      }),
    ).rejects.toBeInstanceOf(ItemNotFoundError);
  });

  it('posting a DRAFT increases available stock (P_QTY = qty × pSize)', async () => {
    const { svc, repo } = makeSvc();
    const r = await svc.create({
      warehouseCode: 2,
      createdBy: 'u',
      lines: [{ itemCode: 'ITM-1', qty: 5 }],
    });
    expect(await repo.availableQty('ITM-1', 2)).toBeNull();
    const { receipt, replayed } = await svc.post(r.id, 'supervisor1', KEY);
    expect(replayed).toBe(false);
    expect(receipt.status).toBe('POSTED');
    expect(receipt.onyxDocNo).not.toBeNull();
    expect(await repo.availableQty('ITM-1', 2)).toBe(100); // 5 × 20
    expect(repo.movements).toEqual([{ itemCode: 'ITM-1', qty: 100, wCode: 2 }]);
  });

  it('replays posting with the same Idempotency-Key (no double stock)', async () => {
    const { svc, repo } = makeSvc();
    const r = await svc.create({
      warehouseCode: 2,
      createdBy: 'u',
      lines: [{ itemCode: 'ITM-1', qty: 5 }],
    });
    await svc.post(r.id, 'supervisor1', KEY);
    const second = await svc.post(r.id, 'supervisor1', KEY);
    expect(second.replayed).toBe(true);
    expect(await repo.availableQty('ITM-1', 2)).toBe(100); // unchanged
  });

  it('409s when posting a non-DRAFT with a NEW key, or cancelling POSTED', async () => {
    const { svc } = makeSvc();
    const r = await svc.create({
      warehouseCode: 2,
      createdBy: 'u',
      lines: [{ itemCode: 'ITM-1', qty: 1 }],
    });
    await svc.post(r.id, 's', KEY);
    await expect(
      svc.post(r.id, 's', '01980000-0000-7000-8000-00000000000b'),
    ).rejects.toBeInstanceOf(StockReceiptStateError);
    await expect(svc.cancel(r.id, 's')).rejects.toBeInstanceOf(
      StockReceiptStateError,
    );
  });

  it('cancels a DRAFT, 404s on unknown ids, filters lists', async () => {
    const { svc } = makeSvc();
    const r = await svc.create({
      warehouseCode: 2,
      createdBy: 'u',
      lines: [{ itemCode: 'ITM-1', qty: 1 }],
    });
    const cancelled = await svc.cancel(r.id, 'u');
    expect(cancelled.status).toBe('CANCELLED');
    await expect(svc.byId('missing')).rejects.toBeInstanceOf(
      StockReceiptNotFoundError,
    );
    expect(await svc.list({ status: 'CANCELLED', limit: 10 })).toHaveLength(1);
    expect(await svc.list({ warehouse: 2, limit: 10 })).toHaveLength(1);
    expect(await svc.list({ warehouse: 7, limit: 10 })).toHaveLength(0);
  });
});
