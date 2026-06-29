import { Inject, Injectable } from '@nestjs/common';
import { ItemNotFoundError } from '../../../shared/errors/domain-error';
import { Item } from '../domain/entities/item.entity';
import {
  ItemDetail,
  ItemListFilter,
  ItemRepository,
  ITEM_REPOSITORY,
} from '../domain/ports/item-repository.port';

/**
 * CatalogService (application layer) — orchestrates item read use cases.
 * No SQL here; depends on the ItemRepository port (Dependency Inversion).
 */
@Injectable()
export class CatalogService {
  constructor(
    @Inject(ITEM_REPOSITORY) private readonly repo: ItemRepository,
  ) {}

  async list(filter: ItemListFilter) {
    const { items, nextCursor } = await this.repo.list(filter);
    return { items: items.map((i) => this.toListDto(i)), nextCursor };
  }

  async getByCode(code: string) {
    const found = await this.repo.findByCode(code);
    if (!found) {
      throw new ItemNotFoundError(`Item ${code} not found`, { code });
    }
    return this.toDetailDto(found);
  }

  async getByBarcode(barcode: string) {
    const found = await this.repo.findByBarcode(barcode);
    if (!found) {
      throw new ItemNotFoundError(`No item for barcode ${barcode}`, {
        barcode,
      });
    }
    return this.toDetailDto(found);
  }

  private toListDto(i: Item) {
    return {
      code: i.code,
      name: i.name,
      barcode: i.barcode,
      unit: i.unit,
      packSize: i.packSize,
      lastPrice: i.lastPrice()?.toNumber() ?? null,
    };
  }

  private toDetailDto(d: ItemDetail) {
    return {
      code: d.item.code,
      name: d.item.name,
      barcode: d.item.barcode,
      unit: d.item.unit,
      packSize: d.item.packSize,
      lastPrice: d.item.lastPrice()?.toNumber() ?? null,
      totalAvailableQty: d.totalAvailableQty,
      stock: d.stock.map((s) => ({
        warehouseCode: s.warehouseCode,
        availableQty: s.availableQty,
      })),
    };
  }
}
