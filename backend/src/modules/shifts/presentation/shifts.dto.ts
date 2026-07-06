import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  ValidateNested,
} from 'class-validator';

export class OpenShiftDto {
  @ApiProperty({ example: 12, description: 'Cashier number (CSHR_NO)' })
  @IsInt()
  @IsPositive()
  cashierNo!: number;

  @ApiPropertyOptional({ example: 'M', description: 'Shift code (POS_WRK_SHFT)' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  shiftCode?: string;

  @ApiPropertyOptional({ example: 1, description: 'POS machine number' })
  @IsOptional()
  @IsInt()
  machineNo?: number;

  @ApiPropertyOptional({ example: 1000, description: 'Opening cash balance' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  openingBalance?: number;

  @ApiPropertyOptional({ example: 'YER' })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  currency?: string;
}

export class CloseShiftDto {
  @ApiPropertyOptional({
    example: 4250.5,
    description: 'Counted closing cash (defaults to expected if omitted)',
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(1_000_000_000)
  closingBalance?: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'Cash paid out of the drawer during the shift (reduces expected cash)',
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  cashExpenses?: number;

  @ApiPropertyOptional({ example: 'End of morning shift' })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  closeNote?: string;
}

/** One counted denomination line (POST013): face value × count. */
export class DenominationLineDto {
  @ApiProperty({ example: 1000, description: 'Denomination face value' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  value!: number;

  @ApiProperty({ example: 5, description: 'How many notes/coins counted' })
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  count!: number;
}

export class ShiftCountDto {
  @ApiPropertyOptional({ example: 'YER', description: 'Currency of the count (defaults to shift currency)' })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  currency?: string;

  @ApiProperty({
    type: [DenominationLineDto],
    example: [
      { value: 1000, count: 5 },
      { value: 500, count: 10 },
      { value: 250, count: 8 },
      { value: 100, count: 20 },
    ],
    description: 'Counted cash by denomination; the sum is the actual cash',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => DenominationLineDto)
  denominations!: DenominationLineDto[];
}

export class SettleShiftDto {
  @ApiPropertyOptional({ example: 12, description: 'Approving user/cashier number' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  settledBy?: number;

  @ApiPropertyOptional({ example: 'End-of-day settlement' })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  note?: string;

  @ApiPropertyOptional({ example: 0, description: 'Override cash expenses when computing expected cash' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  cashExpenses?: number;
}

/** POST014 — record a cash custody movement (deposit/withdraw). */
export class CustodyMovementDto {
  @ApiProperty({ enum: ['DEPOSIT', 'WITHDRAW'], example: 'DEPOSIT' })
  @IsIn(['DEPOSIT', 'WITHDRAW'])
  direction!: 'DEPOSIT' | 'WITHDRAW';

  @ApiProperty({ example: 500, description: 'Amount (> 0), in the given currency' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  amount!: number;

  @ApiPropertyOptional({ example: 'YER', description: 'Currency (defaults to shift currency)' })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  currency?: string;

  @ApiPropertyOptional({ example: 1, description: 'Exchange rate to shift currency (default 1)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 6 })
  @IsPositive()
  rate?: number;

  @ApiPropertyOptional({ example: 'إيداع عهدة افتتاحية', description: 'سبب الإيداع/السحب' })
  @IsOptional()
  @IsString()
  @MaxLength(400)
  reason?: string;

  @ApiPropertyOptional({ description: 'Client-generated operation id (uuid v7)' })
  @IsOptional()
  @IsString()
  clientOperationId?: string;
}

export class ReconciliationQuery {
  @ApiPropertyOptional({
    example: 4250.5,
    description: 'Counted actual cash (for a live X-report over/short); optional',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  actualCash?: number;

  @ApiPropertyOptional({ example: 0, description: 'Cash expenses paid out during the shift' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  cashExpenses?: number;
}
