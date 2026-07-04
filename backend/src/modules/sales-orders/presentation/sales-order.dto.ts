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
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

/** One ordered item. */
export class SalesOrderLineDto {
  @ApiProperty({ example: '1030020018' })
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  itemCode!: string;

  @ApiProperty({ example: 3 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  qty!: number;

  @ApiProperty({ required: false, description: 'خصم تفصيلي لكل وحدة' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  discDtl?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  note?: string;
}

/** POST /sales-orders — record a customer order (POST024). */
export class CreateSalesOrderDto {
  @ApiProperty({ required: false, example: 'C0001' })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  customerCode?: string;

  @ApiProperty({ required: false, example: 'محمد العباسي' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  customerName?: string;

  @ApiProperty({ required: false, example: 'YER' })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  currency?: string;

  @ApiProperty({ required: false, example: 'SO-2026-104' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  refNo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiProperty({ required: false, example: '2026-07-15', description: 'تاريخ انتهاء الطلب' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'expireDate must be yyyy-mm-dd' })
  expireDate?: string;

  @ApiProperty({ type: [SalesOrderLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => SalesOrderLineDto)
  lines!: SalesOrderLineDto[];
}

/** POST /sales-orders/{id}/convert — تنزيل الطلب في فاتورة. */
export class ConvertSalesOrderDto {
  @ApiProperty({ example: 3, description: 'رقم الكاشير (وردية مفتوحة مطلوبة)' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  cashierNo!: number;

  @ApiProperty({ required: false, example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  machineNo?: number;
}

/** GET /sales-orders — list filters. */
export class ListSalesOrdersQuery {
  @IsOptional()
  @IsIn(['OPEN', 'CONVERTED', 'CANCELLED'])
  status?: 'OPEN' | 'CONVERTED' | 'CANCELLED';

  @IsOptional()
  @IsString()
  @MaxLength(15)
  customer?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50;
}
