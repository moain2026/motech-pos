import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SettingsService } from '../application/settings.service';

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

/** Runtime guard: a key must be a known editable key or a `default.<n>` key. */
export function isAllowedSettingKey(key: string): boolean {
  return (
    SettingsService.EDITABLE_KEYS.includes(key) || ALLOWED_KEY.test(key)
  );
}
