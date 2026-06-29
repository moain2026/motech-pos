import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class PostBillLineDto {
  @ApiProperty({ example: '100001', description: 'Item code (YSPOS23 I_CODE)' })
  @IsString()
  @MaxLength(30)
  itemCode!: string;

  @ApiProperty({ example: 2 })
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  qty!: number;

  @ApiPropertyOptional({ example: 150, description: 'Override price (else reference)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  unitPrice?: number;

  @ApiPropertyOptional({ example: 0, description: 'Per-unit detail discount' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  discDtl?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  freeQty?: number;

  @ApiPropertyOptional({ example: 15, description: 'Override VAT% (else reference)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  vatPercent?: number;
}

export class PostBillDto {
  @ApiProperty({ example: 12, description: 'Cashier number (must have open shift)' })
  @IsInt()
  @IsPositive()
  cashierNo!: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  machineNo?: number;

  @ApiPropertyOptional({ example: 'C001' })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  customerCode?: string;

  @ApiPropertyOptional({ example: 'Walk-in' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  customerName?: string;

  @ApiPropertyOptional({ example: 'YER' })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  currency?: string;

  @ApiPropertyOptional({ example: 2, enum: [1, 2], description: '1=on price, 2=after discount' })
  @IsOptional()
  @IsIn([1, 2])
  taxCalcType?: number;

  @ApiPropertyOptional({ example: 0, description: 'Header discount allocated across lines' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  headerDiscount?: number;

  @ApiPropertyOptional({ example: '018f2c1a-...uuidv7', description: 'Client op id' })
  @IsOptional()
  @IsString()
  @MaxLength(36)
  clientOperationId?: string;

  @ApiProperty({ type: [PostBillLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PostBillLineDto)
  lines!: PostBillLineDto[];
}

export class AddPaymentDto {
  @ApiProperty({ example: 'CASH', enum: ['CASH', 'CARD', 'CREDIT'] })
  @IsIn(['CASH', 'CARD', 'CREDIT'])
  method!: 'CASH' | 'CARD' | 'CREDIT';

  @ApiProperty({ example: 300 })
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  amount!: number;

  @ApiPropertyOptional({ example: 'YER' })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  currency?: string;

  @ApiPropertyOptional({ example: 1, description: 'Exchange rate to bill currency' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @IsPositive()
  rate?: number;

  @ApiPropertyOptional({ example: '****1234' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  cardNo?: string;

  @ApiPropertyOptional({ example: 'C001' })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  customerCode?: string;
}
