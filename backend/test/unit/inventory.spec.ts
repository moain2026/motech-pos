import { describe, expect, it } from 'vitest';
import { InventoryService } from '../../src/modules/inventory/application/inventory.service';
import {
  InventoryItemDetail,
  InventoryItemRow,
  InventoryListFilter,
  InventoryListResult,
  InventoryRepository,
  LowStockFilter,
} from '../../src/modules/inventory/domain/ports/inventory-repository.port';
import { ItemNotFoundError } from '../../src/shared/errors/domain-error';

class FakeInventory implements InventoryRepository {
  lastListFilter?: InventoryListFilter;
  lastLowStock?: LowStockFilter;
  private readonly detail: InventoryItemDetail | null;

  constructor(detail: InventoryItemDetail | null = null) {
    this.detail = detail;
  }

  list(filter: InventoryListFilter): Promise<InventoryListResult> {
    this.lastListFilter = filter;
    return Promise.resolve({
      items: [
        {
          code: '1010010004',
          name: 'صنف تجريبي',
          totalAvailableQty: 12.5,
          warehouseCount: 2,
        },
      ],
      nextCursor: '1010010004',
    });
  }

  findByCode(): Promise<InventoryItemDetail | null> {
    return Promise.resolve(this.detail);
  }

  lowStock(filter: LowStockFilter): Promise<InventoryItemRow[]> {
    this.lastLowStock = filter;
    return Promise.resolve([
      {
        code: '1200040024',
        name: 'صنف منخفض',
        totalAvailableQty: 1,
        warehouseCount: 1,
      },
    ]);
  }
}

describe('InventoryService', () => {
  it('list forwards the filter and returns aggregated rows with Arabic names', async () => {
    const repo = new FakeInventory();
    const svc = new InventoryService(repo);
    const res = await svc.list({ limit: 50, search: 'صنف' });
    expect(repo.lastListFilter).toEqual({ limit: 50, search: 'صنف' });
    expect(res.items).toHaveLength(1);
    expect(res.items[0].name).toBe('صنف تجريبي');
    expect(res.items[0].totalAvailableQty).toBe(12.5);
    expect(res.nextCursor).toBe('1010010004');
  });

  it('getByCode returns per-warehouse stock detail when the item exists', async () => {
    const detail: InventoryItemDetail = {
      code: '1010010004',
      name: 'بيض',
      totalAvailableQty: 30,
      warehouseCount: 2,
      stock: [
        {
          warehouseCode: 2,
          batchNo: null,
          expireDate: null,
          availableQty: 20,
        },
        {
          warehouseCode: 5,
          batchNo: 'B1',
          expireDate: '2026-12-31',
          availableQty: 10,
        },
      ],
    };
    const svc = new InventoryService(new FakeInventory(detail));
    const res = await svc.getByCode('1010010004');
    expect(res.stock).toHaveLength(2);
    expect(res.totalAvailableQty).toBe(30);
    expect(res.stock[1].warehouseCode).toBe(5);
  });

  it('getByCode throws ItemNotFoundError (RFC 9457) for an unknown code', async () => {
    const svc = new InventoryService(new FakeInventory(null));
    await expect(svc.getByCode('nope')).rejects.toBeInstanceOf(
      ItemNotFoundError,
    );
  });

  it('lowStock forwards threshold + limit and returns ascending low items', async () => {
    const repo = new FakeInventory();
    const svc = new InventoryService(repo);
    const rows = await svc.lowStock({ threshold: 5, limit: 20 });
    expect(repo.lastLowStock).toEqual({ threshold: 5, limit: 20 });
    expect(rows[0].totalAvailableQty).toBe(1);
    expect(rows[0].name).toBe('صنف منخفض');
  });
});
