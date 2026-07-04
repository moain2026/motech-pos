import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/presentation/jwt-auth.guard';
import { Roles } from '../../auth/presentation/roles.decorator';
import { RolesGuard } from '../../auth/presentation/roles.guard';
import { MasterDataService } from '../application/master-data.service';
import {
  UpsertCurrencyDto,
  UpsertItemGroupDto,
  UpsertUnitDto,
  UpsertWarehouseDto,
} from './master-data.dto';

/**
 * MasterDataController — POSI003/004/005/011 master data screens:
 *   /warehouses  → IAS202623.WAREHOUSE_DETAILS + WAREHOUSES_OVERLAY
 *   /item-groups → IAS202623.GROUP_DETAILS     + ITEM_GROUPS_OVERLAY
 *   /units       → IAS202623.MEASUREMENT       + UNITS_OVERLAY
 *   /currencies  → IAS202623.EX_RATE           + CURRENCIES_OVERLAY
 * Reads for all roles; mutations supervisor/admin (same policy as the
 * other master screens). RFC 9457 errors, envelope { data, meta }.
 */
@ApiTags('master-data')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('cashier', 'supervisor', 'admin')
@Controller()
export class MasterDataController {
  constructor(private readonly svc: MasterDataService) {}

  //==========================================================================
  // Warehouses (POSI003)
  //==========================================================================

  @Get('warehouses')
  @ApiOperation({
    summary: 'List warehouses (WAREHOUSE_DETAILS merged with overlay)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async warehouses() {
    const data = await this.svc.listWarehouses();
    return { data, meta: { count: data.length } };
  }

  @Post('warehouses')
  @HttpCode(201)
  @Roles('supervisor', 'admin')
  @ApiOperation({ summary: 'Create a LOCAL warehouse (MOTECH_POS overlay)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async createWarehouse(@Body() dto: UpsertWarehouseDto) {
    const data = await this.svc.createWarehouse(dto);
    return { data, meta: { origin: data.origin } };
  }

  @Put('warehouses/:code')
  @Roles('supervisor', 'admin')
  @ApiOperation({ summary: 'Edit a warehouse (overlay; ERP never mutated)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async updateWarehouse(
    @Param('code', ParseIntPipe) code: number,
    @Body() dto: UpsertWarehouseDto,
  ) {
    const data = await this.svc.updateWarehouse(code, dto);
    return { data, meta: { origin: data.origin } };
  }

  //==========================================================================
  // Item groups (POSI004)
  //==========================================================================

  @Get('item-groups')
  @ApiOperation({
    summary: 'List item groups (GROUP_DETAILS merged with overlay) + item counts',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async itemGroups() {
    const data = await this.svc.listItemGroups();
    return { data, meta: { count: data.length } };
  }

  @Post('item-groups')
  @HttpCode(201)
  @Roles('supervisor', 'admin')
  @ApiOperation({ summary: 'Create a LOCAL item group (MOTECH_POS overlay)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async createItemGroup(@Body() dto: UpsertItemGroupDto) {
    const data = await this.svc.createItemGroup(dto);
    return { data, meta: { origin: data.origin } };
  }

  @Put('item-groups/:code')
  @Roles('supervisor', 'admin')
  @ApiOperation({ summary: 'Edit an item group (overlay; ERP never mutated)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async updateItemGroup(
    @Param('code') code: string,
    @Body() dto: UpsertItemGroupDto,
  ) {
    const data = await this.svc.updateItemGroup(code, dto);
    return { data, meta: { origin: data.origin } };
  }

  //==========================================================================
  // Units of measure (POSI005)
  //==========================================================================

  @Get('units')
  @ApiOperation({
    summary: 'List units of measure (MEASUREMENT merged with overlay)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async units() {
    const data = await this.svc.listUnits();
    return { data, meta: { count: data.length } };
  }

  @Post('units')
  @HttpCode(201)
  @Roles('supervisor', 'admin')
  @ApiOperation({ summary: 'Create a LOCAL unit (MOTECH_POS overlay)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async createUnit(@Body() dto: UpsertUnitDto) {
    const data = await this.svc.createUnit(dto);
    return { data, meta: { origin: data.origin } };
  }

  @Put('units/:code')
  @Roles('supervisor', 'admin')
  @ApiOperation({ summary: 'Edit a unit (overlay; ERP never mutated)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async updateUnit(@Param('code') code: string, @Body() dto: UpsertUnitDto) {
    const data = await this.svc.updateUnit(code, dto);
    return { data, meta: { origin: data.origin } };
  }

  //==========================================================================
  // Currencies + POS exchange rates (POSI011)
  //==========================================================================

  @Get('currencies')
  @ApiOperation({
    summary:
      'List currencies + exchange rates (EX_RATE merged with overlay: ' +
      'rate = accounting, ratePos = POS rate)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async currencies() {
    const data = await this.svc.listCurrencies();
    return { data, meta: { count: data.length } };
  }

  @Post('currencies')
  @HttpCode(201)
  @Roles('supervisor', 'admin')
  @ApiOperation({ summary: 'Add a currency (MOTECH_POS overlay)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async createCurrency(@Body() dto: UpsertCurrencyDto) {
    const data = await this.svc.createCurrency(dto);
    return { data, meta: { origin: data.origin } };
  }

  @Put('currencies/:code')
  @Roles('supervisor', 'admin')
  @ApiOperation({
    summary: 'Edit a currency / set the POS exchange rate',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async updateCurrency(
    @Param('code') code: string,
    @Body() dto: UpsertCurrencyDto,
  ) {
    const data = await this.svc.updateCurrency(code, dto);
    return { data, meta: { origin: data.origin } };
  }
}
