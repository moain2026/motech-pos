import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { PermissionsGuard } from '../../auth/presentation/permissions.guard';
import { RequirePermission } from '../../auth/presentation/require-permission.decorator';
import { PosConfigService } from '../application/pos-config.service';
import {
  DecodeBarcodeDto,
  UpsertScaleDto,
  UpsertShortcutDto,
} from './pos-config.dto';

/**
 * PosConfigController — POSI004 keyboard shortcuts + POSI005/006 scale barcode
 * schemes. READ is available to any authenticated user (the cashier UI needs
 * the shortcut map + scale schemes at sale time). WRITE requires the SETTINGS
 * permission (admins/supervisors). Errors are RFC 9457 via the global filter.
 */
@ApiTags('pos-config')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pos-config')
export class PosConfigController {
  constructor(private readonly svc: PosConfigService) {}

  //==========================================================================
  // Shortcuts (POSI004)
  //==========================================================================
  @Get('shortcuts')
  @ApiOperation({ summary: 'List POS keyboard shortcuts (POSI004)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async listShortcuts() {
    const data = await this.svc.listShortcuts();
    return { data, meta: { count: data.length } };
  }

  @Put('shortcuts')
  @UseGuards(PermissionsGuard)
  @RequirePermission('SETTINGS')
  @ApiOperation({ summary: 'Create/update a POS shortcut — SETTINGS permission' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async upsertShortcut(@Body() dto: UpsertShortcutDto) {
    const data = await this.svc.upsertShortcut(dto);
    return { data };
  }

  @Delete('shortcuts/:action')
  @UseGuards(PermissionsGuard)
  @RequirePermission('SETTINGS')
  @ApiOperation({ summary: 'Delete a POS shortcut — SETTINGS permission' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async deleteShortcut(@Param('action') action: string) {
    await this.svc.deleteShortcut(action);
    return { data: { action, deleted: true } };
  }

  //==========================================================================
  // Scale definitions (POSI005/006)
  //==========================================================================
  @Get('scales')
  @ApiOperation({ summary: 'List scale barcode definitions (POSI005/006)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async listScales() {
    const data = await this.svc.listScales();
    return { data, meta: { count: data.length } };
  }

  @Post('scales')
  @UseGuards(PermissionsGuard)
  @RequirePermission('SETTINGS')
  @ApiOperation({ summary: 'Create a scale definition — SETTINGS permission' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async createScale(@Body() dto: UpsertScaleDto) {
    const data = await this.svc.createScale({ ...dto, valueLen: dto.valueLen ?? null });
    return { data };
  }

  @Put('scales/:id')
  @UseGuards(PermissionsGuard)
  @RequirePermission('SETTINGS')
  @ApiOperation({ summary: 'Update a scale definition — SETTINGS permission' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async updateScale(@Param('id') id: string, @Body() dto: UpsertScaleDto) {
    const data = await this.svc.updateScale(id, {
      ...dto,
      valueLen: dto.valueLen ?? null,
    });
    return { data };
  }

  @Delete('scales/:id')
  @UseGuards(PermissionsGuard)
  @RequirePermission('SETTINGS')
  @ApiOperation({ summary: 'Delete a scale definition — SETTINGS permission' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async deleteScale(@Param('id') id: string) {
    await this.svc.deleteScale(id);
    return { data: { id, deleted: true } };
  }

  @Post('scales/decode')
  @ApiOperation({
    summary:
      'Decode a barcode against the enabled scale schemes (diagnostics / preview)',
  })
  @ApiOkResponse({ description: 'Envelope { data } — null when not a scale barcode' })
  async decode(@Body() dto: DecodeBarcodeDto) {
    const data = await this.svc.decode(dto.barcode);
    return { data, meta: { isScale: data != null } };
  }
}
