import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/presentation/roles.decorator';
import { JwtAuthGuard } from '../../auth/presentation/jwt-auth.guard';
import { RolesGuard } from '../../auth/presentation/roles.guard';
import { CatalogService } from '../application/catalog.service';
import { ListItemsQuery } from './list-items.query';

@ApiTags('catalog')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('cashier', 'supervisor', 'admin')
@Controller('items')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  @ApiOperation({ summary: 'List/search items (code ascending, cursor paginated)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async list(@Query() q: ListItemsQuery) {
    const { items, nextCursor } = await this.catalog.list({
      search: q.search,
      cursor: q.cursor,
      limit: q.limit ?? 50,
    });
    return {
      data: items,
      meta: { count: items.length, nextCursor: nextCursor ?? null },
    };
  }

  @Get('barcode/:bc')
  @ApiOperation({ summary: 'Resolve an item by barcode (detail + price + stock)' })
  async byBarcode(@Param('bc') bc: string) {
    const data = await this.catalog.getByBarcode(bc);
    return { data };
  }

  @Get(':code')
  @ApiOperation({ summary: 'Item detail: price + per-warehouse available quantity' })
  async byCode(@Param('code') code: string) {
    const data = await this.catalog.getByCode(code);
    return { data };
  }
}
