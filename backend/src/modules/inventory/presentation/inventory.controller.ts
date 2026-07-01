import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/presentation/jwt-auth.guard';
import { InventoryService } from '../application/inventory.service';
import { ListInventoryQuery, LowStockQuery } from './inventory.query';

/**
 * InventoryController — READ-side stock/availability over the live YSPOS23
 * MV_ITEM_AVL_QTY view (POSAVLQTY). JWT-protected; RFC 9457 errors via the
 * global filter. Envelope shape { data, meta } mirrors reports/catalog.
 */
@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}

  @Get('low-stock')
  @ApiOperation({
    summary: 'Low-stock items (total qty <= threshold, ascending)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async lowStock(@Query() q: LowStockQuery) {
    const data = await this.inventory.lowStock({
      threshold: q.threshold ?? 5,
      limit: q.limit ?? 50,
    });
    return {
      data,
      meta: { count: data.length, threshold: q.threshold ?? 5 },
    };
  }

  @Get(':code')
  @ApiOperation({
    summary: 'Item stock detail (per-warehouse / batch available qty)',
  })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async byCode(@Param('code') code: string) {
    const data = await this.inventory.getByCode(code);
    return { data };
  }

  @Get()
  @ApiOperation({
    summary: 'List items with aggregated available quantities (Arabic names)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async list(@Query() q: ListInventoryQuery) {
    const { items, nextCursor } = await this.inventory.list({
      search: q.search,
      cursor: q.cursor,
      limit: q.limit ?? 50,
    });
    return {
      data: items,
      meta: { count: items.length, nextCursor: nextCursor ?? null },
    };
  }
}
