import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SettingsService } from '../application/settings.service';
import { SETTINGS_CATALOG_BY_COLUMN } from '../domain/settings-catalog';

/** Keys that an admin may override (canonical IAS_PARA_POS-mapped keys + default.<n>). */
const ALLOWED_KEY = /^(default\.\d{1,4})$/;

/** One override entry: a canonical key and its new value (null clears it). */
export class SettingOverrideDto {
  @ApiProperty({
    description:
      'Canonical setting key (e.g. currency, printing.printBill, default.16)',
    example: 'currency',
  })
  @IsString()
  @MaxLength(120)
  key!: string;

  @ApiProperty({
    description: 'New value as text; null reverts to the live YSPOS23 value',
    nullable: true,
    required: false,
    example: 'USD',
  })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  value!: string | null;
}

/** PUT/POST /settings body — a batch of overlay overrides (admin only). */
export class UpdateSettingsDto {
  @ApiProperty({ type: [SettingOverrideDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => SettingOverrideDto)
  overrides!: SettingOverrideDto[];
}

/**
 * Runtime guard: a key must be a known canonical editable key, a raw
 * IAS_PARA_POS column name (any of the 179 catalog columns), or a
 * `default.<n>` numbered-default key.
 */
export function isAllowedSettingKey(key: string): boolean {
  return (
    SettingsService.EDITABLE_KEYS.includes(key) ||
    SETTINGS_CATALOG_BY_COLUMN.has(key) ||
    ALLOWED_KEY.test(key)
  );
}

/** PUT /settings/:key body — a single override value (null reverts to live). */
export class UpdateOneSettingDto {
  @ApiProperty({
    description: 'New value as text; null reverts to the live YSPOS23 value',
    nullable: true,
    required: false,
    example: '1',
  })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  value!: string | null;
}

/** One numbered default override (POSS005): STNG_NO + value (null reverts). */
export class DefaultEntryDto {
  @ApiProperty({ example: 13, description: 'STNG_NO (POS_DFLT_STNG_MST)' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(9999)
  no!: number;

  @ApiProperty({
    description: 'New value as text; null reverts to the live YSPOS23 value',
    nullable: true,
    required: false,
    example: '1',
  })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  value!: string | null;
}

/** PUT /settings/defaults body — batch of numbered-default overrides. */
export class UpdateDefaultsDto {
  @ApiProperty({ type: [DefaultEntryDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => DefaultEntryDto)
  defaults!: DefaultEntryDto[];
}
