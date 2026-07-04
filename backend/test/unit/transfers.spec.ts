import { describe, expect, it } from 'vitest';
import { TransferService } from '../../src/modules/transfers/application/transfer.service';
import {
  CreateTransferInput,
  ListTransfersFilter,
  TransferDetail,
  TransferHeader,
  TransferRepository,
} from '../../src/modules/transfers/domain/ports/transfer.port';
import {
  TransferNotFoundError,
  TransferSameWarehouseError,
  TransferStateError,
  TransferWarehouseNotFoundError,
} from '../../src/shared/errors/domain-error';

class FakeRepo implements TransferRepository {
  warehouses = new Set<number>([1, 2]);
  stock = new Map<string, number>(); // `${itemCode}@${wCode}` → qty
  names = new Map<string, string>();
  store = new Map<string, TransferDetail>();
  private seq = 0;

  create(input: CreateTransferInput): Promise<TransferDetail> {
    const id = `tr-${++this.seq}`;
    const t: TransferDetail = {
      id,
      reqNo: this.seq,
      fromWarehouse: input.fromWarehouse,
      toWarehouse: input.toWarehouse,
      status: 'OPEN',
      reqSide: input.reqSide,
      purpose: input.purpose,
      refNo: input.refNo,
      note: input.note,
      createdBy: input.createdBy,
      createdAt: new Date().toISOString(),
      cancelledBy: null,
      cancelledAt: null,
      lineCount: input.lines.length,
      lines: input.lines.map((l, i) => ({
        lineId: `${id}-l${i}`,
        itemCode: l.itemCode,
        itemName: l.itemName,
        qty: l.qty,
        avlQty: l.avlQty,
        note: l.note,
      })),
    };
    this.store.set(id, t);
    return Promise.resolve(t);
  }

  findById(id: string): Promise<TransferDetail | null> {
    return Promise.resolve(this.store.get(id) ?? null);
  }

  list(filter: ListTransfersFilter): Promise<TransferHeader[]> {
    const all = [...this.store.values()].filter(
      (t) =>
        (!filter.status || t.status === filter.status) &&
        (filter.warehouse == null ||
          t.fromWarehouse === filter.warehouse ||
          t.toWarehouse === filter.warehouse),
    );
    return Promise.resolve(all.slice(0, filter.limit));
  }

  cancel(id: string, cancelledBy: string): Promise<TransferDetail | null> {
    const t = this.store.get(id);
    if (!t || t.status !== 'OPEN') return Promise.resolve(null);
    t.status = 'CANCELLED';
    t.cancelledBy = cancelledBy;
    t.cancelledAt = new Date().toISOString();
    return Promise.resolve(t);
  }

  warehouseExists(wCode: number): Promise<boolean> {
    return Promise.resolve(this.warehouses.has(wCode));
  }

  availableQty(itemCode: string, wCode: number): Promise<number | null> {
    return Promise.resolve(this.stock.get(`${itemCode}@${wCode}`) ?? null);
  }

  itemName(itemCode: string): Promise<string | null> {
    return Promise.resolve(this.names.get(itemCode) ?? null);
  }
}

function makeSvc() {
  const repo = new FakeRepo();
  repo.stock.set('ITM-1@1', 40);
  repo.names.set('ITM-1', 'صنف تجريبي');
  return { repo, svc: new TransferService(repo) };
}

describe('TransferService (POST019)', () => {
  it('creates a request with availability + name snapshots', async () => {
    const { svc } = makeSvc();
    const t = await svc.create({
      fromWarehouse: 1,
      toWarehouse: 2,
      purpose: 'تعويض نواقص',
      createdBy: 'cashier1',
      lines: [
        { itemCode: 'ITM-1', qty: 12 },
        { itemCode: 'ITM-UNKNOWN', qty: 3 },
      ],
    });
    expect(t.status).toBe('OPEN');
    expect(t.reqNo).toBe(1);
    expect(t.lines[0].avlQty).toBe(40); // snapshot from source warehouse
    expect(t.lines[0].itemName).toBe('صنف تجريبي');
    expect(t.lines[1].avlQty).toBeNull(); // unknown item there → null
  });

  it('rejects same source/destination warehouse (422)', async () => {
    const { svc } = makeSvc();
    await expect(
      svc.create({
        fromWarehouse: 1,
        toWarehouse: 1,
        createdBy: 'c',
        lines: [{ itemCode: 'ITM-1', qty: 1 }],
      }),
    ).rejects.toBeInstanceOf(TransferSameWarehouseError);
  });

  it('rejects an unknown warehouse (404)', async () => {
    const { svc } = makeSvc();
    await expect(
      svc.create({
        fromWarehouse: 99,
        toWarehouse: 2,
        createdBy: 'c',
        lines: [{ itemCode: 'ITM-1', qty: 1 }],
      }),
    ).rejects.toBeInstanceOf(TransferWarehouseNotFoundError);
  });

  it('cancels an OPEN request; second cancel is a 409 state error', async () => {
    const { svc } = makeSvc();
    const t = await svc.create({
      fromWarehouse: 1,
      toWarehouse: 2,
      createdBy: 'c',
      lines: [{ itemCode: 'ITM-1', qty: 1 }],
    });
    const cancelled = await svc.cancel(t.id, 'supervisor1');
    expect(cancelled.status).toBe('CANCELLED');
    expect(cancelled.cancelledBy).toBe('supervisor1');
    await expect(svc.cancel(t.id, 'x')).rejects.toBeInstanceOf(
      TransferStateError,
    );
  });

  it('404s on unknown transfer id', async () => {
    const { svc } = makeSvc();
    await expect(svc.byId('nope')).rejects.toBeInstanceOf(
      TransferNotFoundError,
    );
  });

  it('filters list by status and warehouse', async () => {
    const { svc } = makeSvc();
    const a = await svc.create({
      fromWarehouse: 1,
      toWarehouse: 2,
      createdBy: 'c',
      lines: [{ itemCode: 'ITM-1', qty: 1 }],
    });
    await svc.cancel(a.id, 'c');
    await svc.create({
      fromWarehouse: 2,
      toWarehouse: 1,
      createdBy: 'c',
      lines: [{ itemCode: 'ITM-1', qty: 2 }],
    });
    expect(await svc.list({ status: 'OPEN', limit: 10 })).toHaveLength(1);
    expect(await svc.list({ status: 'CANCELLED', limit: 10 })).toHaveLength(1);
    expect(await svc.list({ warehouse: 1, limit: 10 })).toHaveLength(2);
  });
});
