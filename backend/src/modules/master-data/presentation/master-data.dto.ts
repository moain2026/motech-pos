import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

//============================================================================
// Warehouses (POSI003)
//============================================================================
export class UpsertWarehouseDto {
  @ApiPropertyOptional({
    description: 'Warehouse code (W_CODE). Omit on create to auto-assign (>= 900).',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  code?: number;

  @ApiPropertyOptional({ description: 'Arabic name (W_NAME)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  arName?: string;

  @ApiPropertyOptional({ description: 'English name (W_E_NAME)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  enName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  tel?: string;

  @ApiPropertyOptional({ description: 'Warehouse keeper (WH_KEEPER)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  keeper?: string;

  @ApiPropertyOptional({ description: 'true = sales blocked from this warehouse' })
  @IsOptional()
  @IsBoolean()
  noSale?: boolean;

  @ApiPropertyOptional({ description: 'Default price level (PRICE_LVL)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(999)
  priceLevel?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  inactive?: boolean;
}

//============================================================================
// Item groups (POSI004)
//============================================================================
export class UpsertItemGroupDto {
  @ApiPropertyOptional({
    description: 'Group code (G_CODE). Omit on create to auto-assign (>= 900).',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  code?: string;

  @ApiPropertyOptional({ description: 'Arabic name (G_A_NAME)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  arName?: string;

  @ApiPropertyOptional({ description: 'English name (G_E_NAME)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  enName?: string;

  @ApiPropertyOptional({ description: 'Default VAT % (TAX_PRCNT_DFLT)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  taxPercent?: number;

  @ApiPropertyOptional({ description: 'Allow discounts on the group' })
  @IsOptional()
  @IsBoolean()
  allowDiscount?: boolean;

  @ApiPropertyOptional({ description: 'Display order (G_ORDR)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  inactive?: boolean;
}

//============================================================================
// Units of measure (POSI005)
//============================================================================
export class UpsertUnitDto {
  @ApiPropertyOptional({
    description: 'Unit code (MEASURE_CODE, usually the Arabic name e.g. حبة). Required on create.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  code?: string;

  @ApiPropertyOptional({ description: 'Arabic name (MEASURE)' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  arName?: string;

  @ApiPropertyOptional({ description: 'English name (MEASURE_F_NM)' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  enName?: string;

  @ApiPropertyOptional({ description: 'Default pack size (DFLT_SIZE)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  defaultSize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  inactive?: boolean;
}

//============================================================================
// Currencies (POSI011)
//============================================================================
export class UpsertCurrencyDto {
  @ApiPropertyOptional({
    description: 'Currency code (CUR_CODE, e.g. EUR). Required on create.',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z]{2,7}$/, { message: 'code must be 2-7 letters' })
  code?: string;

  @ApiPropertyOptional({ description: 'Arabic name (CUR_NAME)' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  arName?: string;

  @ApiPropertyOptional({ description: 'English name (CUR_E_NAME)' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  enName?: string;

  @ApiPropertyOptional({ description: 'Accounting exchange rate (CUR_RATE)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.000000001)
  rate?: number;

  @ApiPropertyOptional({ description: 'POS exchange rate (CUR_RATE_POS)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.000000001)
  ratePos?: number;

  @ApiPropertyOptional({ description: 'Decimal places (CUR_FRC_NO)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(9)
  fractionNo?: number;

  @ApiPropertyOptional({ description: 'true = the local/base currency (L_F)' })
  @IsOptional()
  @IsBoolean()
  isLocal?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  inactive?: boolean;
}
