import { describe, expect, it, vi } from 'vitest';
import { PostBillUseCase } from '../../src/modules/bills/application/post-bill.usecase';
import { SalesOrderService } from '../../src/modules/sales-orders/application/sales-order.service';
import {
  CreateSalesOrderInput,
  ListSalesOrdersFilter,
  MarkConvertedInput,
  OrderItemSnapshot,
  SalesOrderDetail,
  SalesOrderHeader,
  SalesOrderRepository,
} from '../../src/modules/sales-orders/domain/ports/sales-order.port';
import {
  ItemNotFoundError,
  SalesOrderNotFoundError,
  SalesOrderStateError,
} from '../../src/shared/errors/domain-error';

class FakeRepo implements SalesOrderRepository {
  items = new Map<string, OrderItemSnapshot>();
  customers = new Map<string, string>();
  store = new Map<string, SalesOrderDetail & { convertKey?: string }>();
  private seq = 0;

  create(input: CreateSalesOrderInput): Promise<SalesOrderDetail> {
    const id = `so-${++this.seq}`;
    const o: SalesOrderDetail = {
      id,
      orderNo: this.seq,
      status: 'OPEN',
      customerCode: input.customerCode,
      customerName: input.customerName,
      currency: input.currency,
      refNo: input.refNo,
      note: input.note,
      expireDate: input.expireDate,
      createdBy: input.createdBy,
      createdAt: new Date().toISOString(),
      convertedBillId: null,
      convertedBillNo: null,
      convertedBy: null,
      convertedAt: null,
      cancelledBy: null,
      cancelledAt: null,
      lineCount: input.lines.length,
      lines: input.lines.map((l, i) => ({
        lineId: `${id}-l${i}`,
        itemCode: l.itemCode,
        itemName: l.itemName,
        qty: l.qty,
        unitPrice: l.unitPrice,
        discDtl: l.discDtl,
        note: l.note,
      })),
    };
    this.store.set(id, o);
    return Promise.resolve(o);
  }

  findById(id: string): Promise<SalesOrderDetail | null> {
    return Promise.resolve(this.store.get(id) ?? null);
  }

  findByConvertKey(key: string): Promise<SalesOrderDetail | null> {
    const hit = [...this.store.values()].find(
      (o) => o.status === 'CONVERTED' && o.convertKey === key,
    );
    return Promise.resolve(hit ?? null);
  }

  list(filter: ListSalesOrdersFilter): Promise<SalesOrderHeader[]> {
    const all = [...this.store.values()].filter(
      (o) =>
        (!filter.status || o.status === filter.status) &&
        (!filter.customerCode || o.customerCode === filter.customerCode),
    );
    return Promise.resolve(all.slice(0, filter.limit));
  }

  markConverted(input: MarkConvertedInput): Promise<SalesOrderDetail | null> {
    const o = this.store.get(input.orderId);
    if (!o || o.status !== 'OPEN') return Promise.resolve(null);
    o.status = 'CONVERTED';
    o.convertedBillId = input.billId;
    o.convertedBillNo = input.billNo;
    o.convertedBy = input.convertedBy;
    o.convertedAt = new Date().toISOString();
    o.convertKey = input.idempotencyKey;
    return Promise.resolve(o);
  }

  cancel(id: string, cancelledBy: string): Promise<SalesOrderDetail | null> {
    const o = this.store.get(id);
    if (!o || o.status !== 'OPEN') return Promise.resolve(null);
    o.status = 'CANCELLED';
    o.cancelledBy = cancelledBy;
    o.cancelledAt = new Date().toISOString();
    return Promise.resolve(o);
  }

  itemExists(itemCode: string): Promise<boolean> {
    return Promise.resolve(this.items.has(itemCode));
  }

  itemSnapshot(itemCode: string): Promise<OrderItemSnapshot> {
    return Promise.resolve(
      this.items.get(itemCode) ?? { itemName: null, unitPrice: null },
    );
  }

  customerName(customerCode: string): Promise<string | null> {
    return Promise.resolve(this.customers.get(customerCode) ?? null);
  }
}

function makeSvc() {
  const repo = new FakeRepo();
  repo.items.set('ITM-1', { itemName: 'صنف أول', unitPrice: 850 });
  repo.items.set('ITM-2', { itemName: 'صنف ثانٍ', unitPrice: 300 });
  repo.customers.set('C1', 'محمد العباسي');
  const postBill = {
    execute: vi.fn().mockResolvedValue({
      bill: { id: 'bill-1', billNo: '26070099', netAmt: 850 },
      replayed: false,
    }),
  } as unknown as PostBillUseCase;
  const svc = new SalesOrderService(repo, postBill);
  return { repo, svc, postBill };
}

const KEY = '01980000-0000-7000-8000-000000000001';

describe('SalesOrderService (POST024)', () => {
  it('creates an order with name/price snapshots + resolved customer name', async () => {
    const { svc } = makeSvc();
    const order = await svc.create({
      customerCode: 'C1',
      createdBy: 'cashier1',
      lines: [
        { itemCode: 'ITM-1', qty: 2 },
        { itemCode: 'ITM-2', qty: 1, discDtl: 10 },
      ],
    });
    expect(order.status).toBe('OPEN');
    expect(order.customerName).toBe('محمد العباسي');
    expect(order.currency).toBe('YER');
    expect(order.lines).toHaveLength(2);
    expect(order.lines[0].itemName).toBe('صنف أول');
    expect(order.lines[0].unitPrice).toBe(850);
    expect(order.lines[1].discDtl).toBe(10);
  });

  it('404s when a line item is unknown', async () => {
    const { svc } = makeSvc();
    await expect(
      svc.create({
        createdBy: 'cashier1',
        lines: [{ itemCode: 'NOPE', qty: 1 }],
      }),
    ).rejects.toBeInstanceOf(ItemNotFoundError);
  });

  it('converts an OPEN order into a real bill and freezes it', async () => {
    const { svc, postBill } = makeSvc();
    const order = await svc.create({
      customerCode: 'C1',
      createdBy: 'cashier1',
      lines: [{ itemCode: 'ITM-1', qty: 2 }],
    });
    const { order: converted, replayed } = await svc.convert({
      orderId: order.id,
      idempotencyKey: KEY,
      cashierNo: 3,
      convertedBy: 'cashier1',
    });
    expect(replayed).toBe(false);
    expect(converted.status).toBe('CONVERTED');
    expect(converted.convertedBillNo).toBe('26070099');
    expect(converted.convertedBillId).toBe('bill-1');
    // The bill was posted through the ONE pipeline with the order's lines.
    expect(postBill.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        idempotencyKey: KEY,
        cashierNo: 3,
        customerCode: 'C1',
        lines: [{ itemCode: 'ITM-1', qty: 2, discDtl: undefined }],
      }),
    );
  });

  it('replays conversion with the same Idempotency-Key (no second bill)', async () => {
    const { svc, postBill } = makeSvc();
    const order = await svc.create({
      createdBy: 'cashier1',
      lines: [{ itemCode: 'ITM-1', qty: 1 }],
    });
    await svc.convert({
      orderId: order.id,
      idempotencyKey: KEY,
      cashierNo: 3,
      convertedBy: 'cashier1',
    });
    const second = await svc.convert({
      orderId: order.id,
      idempotencyKey: KEY,
      cashierNo: 3,
      convertedBy: 'cashier1',
    });
    expect(second.replayed).toBe(true);
    expect(second.order.status).toBe('CONVERTED');
    expect(postBill.execute).toHaveBeenCalledTimes(1);
  });

  it('409s when converting a CANCELLED order', async () => {
    const { svc } = makeSvc();
    const order = await svc.create({
      createdBy: 'cashier1',
      lines: [{ itemCode: 'ITM-1', qty: 1 }],
    });
    await svc.cancel(order.id, 'cashier1');
    await expect(
      svc.convert({
        orderId: order.id,
        idempotencyKey: KEY,
        cashierNo: 3,
        convertedBy: 'cashier1',
      }),
    ).rejects.toBeInstanceOf(SalesOrderStateError);
  });

  it('409s when cancelling a CONVERTED order and 404s on unknown ids', async () => {
    const { svc } = makeSvc();
    const order = await svc.create({
      createdBy: 'cashier1',
      lines: [{ itemCode: 'ITM-1', qty: 1 }],
    });
    await svc.convert({
      orderId: order.id,
      idempotencyKey: KEY,
      cashierNo: 3,
      convertedBy: 'cashier1',
    });
    await expect(svc.cancel(order.id, 'x')).rejects.toBeInstanceOf(
      SalesOrderStateError,
    );
    await expect(svc.byId('missing')).rejects.toBeInstanceOf(
      SalesOrderNotFoundError,
    );
  });

  it('lists with status/customer filters', async () => {
    const { svc } = makeSvc();
    await svc.create({
      customerCode: 'C1',
      createdBy: 'u',
      lines: [{ itemCode: 'ITM-1', qty: 1 }],
    });
    const o2 = await svc.create({
      createdBy: 'u',
      lines: [{ itemCode: 'ITM-2', qty: 1 }],
    });
    await svc.cancel(o2.id, 'u');
    expect(await svc.list({ status: 'OPEN', limit: 10 })).toHaveLength(1);
    expect(
      await svc.list({ customerCode: 'C1', limit: 10 }),
    ).toHaveLength(1);
    expect(await svc.list({ limit: 10 })).toHaveLength(2);
  });
});
