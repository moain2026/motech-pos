import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class CreateReturnLineDto {
  @ApiProperty({ example: '1060080003', description: 'Item code (YSPOS23 I_CODE)' })
  @IsString()
  @MaxLength(120)
  itemCode!: string;

  @ApiProperty({ example: 1, description: 'Quantity to return (<= sold remaining)' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  qty!: number;

  @ApiPropertyOptional({ example: 300, description: 'Override price (else original)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  unitPrice?: number;

  @ApiPropertyOptional({ example: 15, description: 'Override VAT% (else original)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  vatPercent?: number;

  @ApiPropertyOptional({ example: 0, description: 'Replacement amount (item swap)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  replaceAmount?: number;
}

export class CreateReturnDto {
  @ApiProperty({ example: '26201300078', description: 'Original bill being returned' })
  @IsString()
  @MaxLength(40)
  originalBillNo!: string;

  @ApiProperty({ example: 12, description: 'Cashier number (must have open shift)' })
  @IsInt()
  @IsPositive()
  cashierNo!: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  machineNo?: number;

  @ApiPropertyOptional({ example: 3, description: 'RETURN_TYPE (default 3 = cash refund)' })
  @IsOptional()
  @IsInt()
  returnType?: number;

  @ApiPropertyOptional({ example: 'YER' })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  currency?: string;

  @ApiPropertyOptional({ example: '018f2c1a-...uuidv7', description: 'Client op id' })
  @IsOptional()
  @IsString()
  @MaxLength(36)
  clientOperationId?: string;

  @ApiProperty({ type: [CreateReturnLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateReturnLineDto)
  lines!: CreateReturnLineDto[];
}
