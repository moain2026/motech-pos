import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateItemDto {
  @ApiProperty({ description: 'Item business code (I_CODE) — must be unique' })
  @IsString()
  @MaxLength(30)
  code!: string;

  @ApiPropertyOptional({ description: 'Local name (I_NAME)' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  barcode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @ApiPropertyOptional({ description: 'Local price (excl VAT), >= 0' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: 'Local VAT percent' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  vatPercent?: number;

  @ApiPropertyOptional({ description: 'Min stock limit (ITM_MIN_LMT_QTY)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minLimitQty?: number;

  @ApiPropertyOptional({ description: 'Max stock limit (ITM_MAX_LMT_QTY)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxLimitQty?: number;

  @ApiPropertyOptional({ description: 'Reorder limit (ITM_ROL_LMT_QTY)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reorderLimitQty?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  inactive?: boolean;
}

export class UpdateItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  barcode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @ApiPropertyOptional({ description: 'Local price (excl VAT), >= 0' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  vatPercent?: number;

  @ApiPropertyOptional({ description: 'Min stock limit (ITM_MIN_LMT_QTY)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minLimitQty?: number;

  @ApiPropertyOptional({ description: 'Max stock limit (ITM_MAX_LMT_QTY)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxLimitQty?: number;

  @ApiPropertyOptional({ description: 'Reorder limit (ITM_ROL_LMT_QTY)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reorderLimitQty?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  inactive?: boolean;
}

export class AddItemBarcodeDto {
  @ApiProperty({ description: 'The new barcode (globally unique)' })
  @IsString()
  @MaxLength(100)
  barcode!: string;

  @ApiPropertyOptional({ description: 'Unit of measure (ITM_UNT), e.g. حبة' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  unit?: string;

  @ApiPropertyOptional({ description: 'Pack size for the unit (P_SIZE)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  packSize?: number;

  @ApiPropertyOptional({ description: 'Mark as the main barcode' })
  @IsOptional()
  @IsBoolean()
  isMain?: boolean;

  @ApiPropertyOptional({ description: 'Barcode blocked from sale' })
  @IsOptional()
  @IsBoolean()
  noSale?: boolean;
}
