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

/** One requested item. */
export class TransferLineDto {
  @ApiProperty({ example: '1030020018' })
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  itemCode!: string;

  @ApiProperty({ example: 12 })
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

/** POST /transfers — raise a transfer request between two warehouses. */
export class CreateTransferDto {
  @ApiProperty({ example: 1, description: 'المخزن المطلوب منه (source)' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  fromWarehouse!: number;

  @ApiProperty({ example: 2, description: 'المخزن الطالب (destination)' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  toWarehouse!: number;

  @ApiProperty({ example: 'نقطة البيع 3', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  reqSide?: string;

  @ApiProperty({ example: 'تعويض نواقص الرف', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  purpose?: string;

  @ApiProperty({ example: 'REF-2026-018', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  refNo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiProperty({ type: [TransferLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => TransferLineDto)
  lines!: TransferLineDto[];
}

/** GET /transfers — list filters. */
export class ListTransfersQuery {
  @IsOptional()
  @IsIn(['OPEN', 'CANCELLED'])
  status?: 'OPEN' | 'CANCELLED';

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
