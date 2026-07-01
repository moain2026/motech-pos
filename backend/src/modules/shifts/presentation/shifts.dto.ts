import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
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
