import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticatedRequest } from '../../auth/presentation/jwt-auth.guard';
import { JwtAuthGuard } from '../../auth/presentation/jwt-auth.guard';
import { Roles } from '../../auth/presentation/roles.decorator';
import { RolesGuard } from '../../auth/presentation/roles.guard';
import { SettingsService } from '../application/settings.service';
import {
  isAllowedSettingKey,
  UpdateDefaultsDto,
  UpdateSettingsDto,
} from './update-settings.dto';

/**
 * SettingsController — POS system settings (POSS001 / IAS_PARA_POS).
 *
 * READ (GET) is available to any authenticated user (the cashier UI needs
 * currency/numbering/print options). WRITE (POST/PUT) applies a local overlay
 * in MOTECH_POS and is restricted to admins via RBAC. All routes are
 * JWT-protected; errors surface as RFC 9457 ProblemDetails via the global
 * exception filter. Envelope shape { data, meta } mirrors bills/reports.
 */
@ApiTags('settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  @ApiOperation({
    summary:
      'Effective POS settings (live YSPOS23.IAS_PARA_POS merged with local overrides)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async get() {
    const data = await this.settings.getSettings();
    return { data, meta: { hasOverrides: data.hasOverrides } };
  }

  @Get('defaults')
  @ApiOperation({
    summary:
      'Numbered system defaults (POSS005 الإعدادات الافتراضية) — live POS_DFLT_STNG_MST merged with local overrides',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async defaults() {
    const { defaults, overrideCount } = await this.settings.getDefaults();
    return { data: defaults, meta: { count: defaults.length, overrideCount } };
  }

  @Get('machine/:no')
  @ApiOperation({ summary: 'Settings for a specific cashier machine (IAS_POS_MACHINE)' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async machine(@Param('no', ParseIntPipe) no: number) {
    const data = await this.settings.getMachine(no);
    return { data };
  }

  //==========================================================================
  // WRITE side (MOTECH_POS overlay) — admin only
  //==========================================================================

  @Put()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Upsert POS setting overrides (overlay in MOTECH_POS) — admin only',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta } with merged settings' })
  async update(
    @Body() dto: UpdateSettingsDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.applyOverrides(dto, req);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Create/upsert POS setting overrides (alias of PUT) — admin only',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta } with merged settings' })
  async create(
    @Body() dto: UpdateSettingsDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.applyOverrides(dto, req);
  }

  @Put('defaults')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary:
      'Upsert numbered-default overrides (POSS005) — admin only; value:null reverts to live',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta } with merged defaults' })
  async updateDefaults(
    @Body() dto: UpdateDefaultsDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const updatedBy = req.user?.sub ?? null;
    const { defaults, overrideCount } = await this.settings.saveDefaults(
      dto.defaults.map((d) => ({ no: d.no, value: d.value ?? null })),
      updatedBy,
    );
    return {
      data: defaults,
      meta: {
        applied: dto.defaults.length,
        count: defaults.length,
        overrideCount,
      },
    };
  }

  private async applyOverrides(
    dto: UpdateSettingsDto,
    req: AuthenticatedRequest,
  ) {
    // Whitelist keys — reject anything not in the canonical editable set.
    const invalid = dto.overrides
      .map((o) => o.key)
      .filter((k) => !isAllowedSettingKey(k));
    if (invalid.length > 0) {
      throw new BadRequestException(
        `Unknown setting key(s): ${invalid.join(', ')}`,
      );
    }
    const updatedBy = req.user?.sub ?? null;
    const overrides = dto.overrides.map((o) => ({
      key: o.key,
      value: o.value ?? null,
    }));
    const data = await this.settings.saveOverrides(overrides, updatedBy);
    return {
      data,
      meta: { applied: overrides.length, hasOverrides: data.hasOverrides },
    };
  }
}
