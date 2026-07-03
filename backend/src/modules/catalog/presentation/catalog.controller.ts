import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/presentation/roles.decorator';
import { JwtAuthGuard } from '../../auth/presentation/jwt-auth.guard';
import { RolesGuard } from '../../auth/presentation/roles.guard';
import { CatalogService } from '../application/catalog.service';
import { ListItemsQuery } from './list-items.query';
import { CreateItemDto, UpdateItemDto } from './upsert-item.dto';

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

  @Post()
  @HttpCode(201)
  @Roles('supervisor', 'admin')
  @ApiOperation({
    summary: 'Create a LOCAL item (MOTECH_POS overlay; POSI2000)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async create(@Body() body: CreateItemDto) {
    const data = await this.catalog.create(body);
    return { data, meta: { origin: data.origin } };
  }

  @Put(':code')
  @Roles('supervisor', 'admin')
  @ApiOperation({
    summary: 'Edit an item (local overlay of price/name; POSI2000)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async update(@Param('code') code: string, @Body() body: UpdateItemDto) {
    const data = await this.catalog.update(code, body);
    return { data, meta: { origin: data.origin } };
  }

  @Get('barcode/:bc')
  @ApiOperation({
    summary:
      'Resolve an item by barcode (detail + price + stock). Weighted scale ' +
      'barcodes (prefix 02, 12 digits) are decoded: the embedded item code ' +
      'resolves the item and data.scanned.quantity carries the weight in kg.',
  })
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
