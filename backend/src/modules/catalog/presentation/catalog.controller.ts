import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
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
import {
  AddItemBarcodeDto,
  CreateItemDto,
  UpdateItemDto,
} from './upsert-item.dto';

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
      category: q.category,
      subCategory: q.subCategory,
      weighted: q.weighted,
      active: q.active,
      minPrice: q.minPrice,
      maxPrice: q.maxPrice,
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

  @Get(':code/prices')
  @ApiOperation({
    summary:
      'All price levels for an item (IAS_ITEM_PRICE): every LEV_NO × unit ' +
      'combination — retail/wholesale/promo lists (POS_ITM_PRICE screen).',
  })
  async prices(@Param('code') code: string) {
    const data = await this.catalog.listPrices(code);
    return { data, meta: { levels: data.levels.length, rows: data.prices.length } };
  }

  @Get(':code/prices/:levNo')
  @ApiOperation({
    summary:
      'Price for a specific price level (sale-time level selection). ' +
      'Optional ?unit= picks the unit; defaults to the base (smallest) unit.',
  })
  async priceAtLevel(
    @Param('code') code: string,
    @Param('levNo', ParseIntPipe) levNo: number,
    @Query('unit') unit?: string,
  ) {
    const data = await this.catalog.getPriceAtLevel(code, levNo, unit ?? null);
    return { data };
  }

  @Get(':code/units')
  @ApiOperation({
    summary:
      'All units of measure for an item (IAS_ITM_DTL) with conversion ' +
      'factors (P_SIZE), per-unit barcode and price — e.g. حبة/كرتون.',
  })
  async units(@Param('code') code: string) {
    const data = await this.catalog.listUnits(code);
    return { data, meta: { count: data.units.length } };
  }

  @Get(':code/barcodes')
  @ApiOperation({
    summary:
      'All barcodes of an item (POSI006/008/009 multi-barcode): ERP ' +
      'IAS_ITM_UNT_BARCODE rows merged with local additions.',
  })
  async barcodes(@Param('code') code: string) {
    const data = await this.catalog.listBarcodes(code);
    return { data, meta: { count: data.barcodes.length } };
  }

  @Post(':code/barcodes')
  @HttpCode(201)
  @Roles('supervisor', 'admin')
  @ApiOperation({
    summary: 'Add a LOCAL barcode to an item (MOTECH_POS overlay only)',
  })
  async addBarcode(
    @Param('code') code: string,
    @Body() dto: AddItemBarcodeDto,
  ) {
    const data = await this.catalog.addBarcode({
      itemCode: code,
      barcode: dto.barcode,
      unit: dto.unit ?? null,
      packSize: dto.packSize ?? null,
      isMain: dto.isMain ?? false,
      noSale: dto.noSale ?? false,
    });
    return { data, meta: { origin: data.origin } };
  }

  @Delete(':code/barcodes/:bc')
  @Roles('supervisor', 'admin')
  @ApiOperation({
    summary:
      'Disable a LOCAL barcode (soft delete; ERP barcodes are immutable)',
  })
  async removeBarcode(@Param('bc') bc: string) {
    const data = await this.catalog.removeBarcode(bc);
    return { data };
  }

  @Get(':code/limits')
  @ApiOperation({
    summary:
      'Stock limits (min/max/reorder — ITM_MIN/MAX/ROL_LMT_QTY) merged ' +
      'ERP + overlay (POSI2000 advanced item settings).',
  })
  async limits(@Param('code') code: string) {
    const data = await this.catalog.getStockLimits(code);
    return { data, meta: { origin: data.origin } };
  }

  @Get(':code')
  @ApiOperation({ summary: 'Item detail: price + per-warehouse available quantity' })
  async byCode(@Param('code') code: string) {
    const data = await this.catalog.getByCode(code);
    return { data };
  }
}

@ApiTags('catalog')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('cashier', 'supervisor', 'admin')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  @ApiOperation({
    summary:
      'Category tree: main item groups (GROUP_DETAILS) with sub-groups ' +
      '(IAS_MAINSUB_GRP_DTL) and item counts. Use ?category= on GET /items.',
  })
  async tree() {
    const data = await this.catalog.listCategories();
    return {
      data,
      meta: {
        groups: data.length,
        items: data.reduce((a, g) => a + g.itemCount, 0),
      },
    };
  }

  @Get('item-types')
  @ApiOperation({ summary: 'Item nature types (ITEM_TYPES: stocked/service)' })
  async itemTypes() {
    const data = await this.catalog.listItemTypes();
    return { data, meta: { count: data.length } };
  }
}
