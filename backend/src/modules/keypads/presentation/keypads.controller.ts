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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { JwtAuthGuard } from '../../auth/presentation/jwt-auth.guard';
import { Roles } from '../../auth/presentation/roles.decorator';
import { RolesGuard } from '../../auth/presentation/roles.guard';
import { KeypadsService } from '../application/keypads.service';

class UpsertKeypadDto {
  @ApiPropertyOptional({
    description: 'Keypad number. Omit on create to auto-assign.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  keypadNo?: number;

  @ApiPropertyOptional({ description: 'Arabic name (e.g. لوحة الخضروات)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  arName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  enName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  inactive?: boolean;
}

class AddKeypadKeyDto {
  @ApiProperty({ description: 'Item business code (I_CODE)' })
  @IsString()
  @MaxLength(30)
  itemCode!: string;

  @ApiPropertyOptional({ description: 'Key group inside the pad (default 1)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(999)
  grpNo?: number;

  @ApiPropertyOptional({ description: 'Group caption (e.g. خضروات)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  grpName?: string;

  @ApiPropertyOptional({ description: 'Ordering inside the group' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  posNo?: number;

  @ApiPropertyOptional({ description: 'UI color hint (hex, e.g. #4caf50)' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9a-fA-F]{3,8}$/, { message: 'color must be a hex color' })
  color?: string;

  @ApiPropertyOptional({ description: 'Key caption (defaults to item name)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  label?: string;
}

/**
 * KeypadsController — POSI002 لوحة المفاتيح الإضافية + POSI003 أصناف اللوحة.
 * Touch keypads for barcode-less items; MOTECH_POS authoritative (V016).
 * Reads all roles (the POS grid renders from them); mutations supervisor/admin.
 */
@ApiTags('keypads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('cashier', 'supervisor', 'admin')
@Controller('keypads')
export class KeypadsController {
  constructor(private readonly svc: KeypadsService) {}

  @Get()
  @ApiOperation({ summary: 'List keypads with key counts (POSI002)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async list() {
    const data = await this.svc.list();
    return { data, meta: { count: data.length } };
  }

  @Get(':no')
  @ApiOperation({
    summary:
      'Keypad detail + keys with resolved item names/prices (POSI003 grid)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async get(@Param('no', ParseIntPipe) no: number) {
    const data = await this.svc.get(no);
    return { data, meta: { keys: data.keys.length } };
  }

  @Post()
  @HttpCode(201)
  @Roles('supervisor', 'admin')
  @ApiOperation({ summary: 'Create a keypad' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async create(@Body() dto: UpsertKeypadDto) {
    const data = await this.svc.create(dto);
    return { data };
  }

  @Put(':no')
  @Roles('supervisor', 'admin')
  @ApiOperation({ summary: 'Edit a keypad (name/status)' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async update(
    @Param('no', ParseIntPipe) no: number,
    @Body() dto: UpsertKeypadDto,
  ) {
    const data = await this.svc.update(no, {
      arName: dto.arName ?? null,
      enName: dto.enName ?? null,
      inactive: dto.inactive ?? null,
    });
    return { data };
  }

  @Post(':no/keys')
  @HttpCode(201)
  @Roles('supervisor', 'admin')
  @ApiOperation({
    summary: 'Link an item to the keypad (POSI003) — item must exist',
  })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async addKey(
    @Param('no', ParseIntPipe) no: number,
    @Body() dto: AddKeypadKeyDto,
  ) {
    const data = await this.svc.addKey({
      keypadNo: no,
      itemCode: dto.itemCode,
      grpNo: dto.grpNo,
      grpName: dto.grpName ?? null,
      posNo: dto.posNo ?? null,
      color: dto.color ?? null,
      label: dto.label ?? null,
    });
    return { data };
  }

  @Delete(':no/keys/:keyId')
  @Roles('supervisor', 'admin')
  @ApiOperation({ summary: 'Remove a key from the keypad' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async removeKey(
    @Param('no', ParseIntPipe) no: number,
    @Param('keyId') keyId: string,
  ) {
    const data = await this.svc.removeKey(no, keyId);
    return { data };
  }
}
