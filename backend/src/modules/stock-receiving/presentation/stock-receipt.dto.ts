import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

/** One received item. */
export class StockReceiptLineDto {
  @ApiProperty({ example: '1050010023' })
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  itemCode!: string;

  @ApiProperty({ example: 5, description: 'الكمية المستلمة (بوحدة البيع)' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  qty!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  note?: string;
}

/** POST /stock-receipts — record an incoming stock receipt (POST029). */
export class CreateStockReceiptDto {
  @ApiProperty({ example: 2, description: 'المخزن المستلِم (destination)' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  warehouseCode!: number;

  @ApiProperty({ required: false, example: 1, description: 'المخزن المحول منه' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  sourceWarehouseCode?: number;

  @ApiProperty({
    required: false,
    description: 'ربط اختياري بطلب تحويل POST019 (MATERIAL_TRANSFERS.ID)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(36)
  transferId?: string;

  @ApiProperty({ required: false, example: 'GRN-2026-051' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  refNo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiProperty({ type: [StockReceiptLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => StockReceiptLineDto)
  lines!: StockReceiptLineDto[];
}

/** GET /stock-receipts — list filters. */
export class ListStockReceiptsQuery {
  @IsOptional()
  @IsIn(['DRAFT', 'POSTED', 'CANCELLED'])
  status?: 'DRAFT' | 'POSTED' | 'CANCELLED';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  warehouse?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50;
}
