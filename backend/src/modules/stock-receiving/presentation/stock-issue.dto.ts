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

/** One dispatched item. */
export class StockIssueLineDto {
  @ApiProperty({ example: '1050010023' })
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  itemCode!: string;

  @ApiProperty({ example: 3, description: 'الكمية المحوّلة (بوحدة المخزون)' })
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

/** POST /stock-issues — record an outgoing warehouse transfer (POST028). */
export class CreateStockIssueDto {
  @ApiProperty({ example: 1, description: 'المخزن المحول منه (source)' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  warehouseCode!: number;

  @ApiProperty({ required: false, example: 2, description: 'المخزن المحول إليه' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  destWarehouseCode?: number;

  @ApiProperty({
    required: false,
    description: 'ربط اختياري بطلب تحويل POST019 (MATERIAL_TRANSFERS.ID)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(36)
  transferId?: string;

  @ApiProperty({ required: false, example: 'TRN-2026-014' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  refNo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiProperty({ type: [StockIssueLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => StockIssueLineDto)
  lines!: StockIssueLineDto[];
}

/** GET /stock-issues — list filters. */
export class ListStockIssuesQuery {
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
