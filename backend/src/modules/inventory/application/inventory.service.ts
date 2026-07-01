import { Inject, Injectable } from '@nestjs/common';
import { ItemNotFoundError } from '../../../shared/errors/domain-error';
import {
  InventoryListFilter,
  InventoryRepository,
  INVENTORY_REPOSITORY,
  LowStockFilter,
} from '../domain/ports/inventory-repository.port';

/**
 * InventoryService (application layer) — orchestrates read use cases over the
 * live stock view. No SQL here; depends on the InventoryRepository port
 * (Dependency Inversion). Errors surface as RFC 9457 via the global filter.
 */
@Injectable()
export class InventoryService {
  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly repo: InventoryRepository,
  ) {}

  /** Paginated list of items with aggregated available quantities. */
  list(filter: InventoryListFilter) {
    return this.repo.list(filter);
  }

  /** One item's stock broken down per warehouse/batch. 404 if unknown. */
  async getByCode(code: string) {
    const detail = await this.repo.findByCode(code);
    if (!detail) {
      throw new ItemNotFoundError(`Item ${code} not found in inventory`, {
        code,
      });
    }
    return detail;
  }

  /** Items at or below a low-stock threshold. */
  lowStock(filter: LowStockFilter) {
    return this.repo.lowStock(filter);
  }
}
