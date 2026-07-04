import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
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
} from 'class-validator';

/** POST /return-counts — open a return count session (POST022). */
export class StartReturnCountDto {
  @ApiProperty({ example: 1, description: 'الآلة المجرودة مردوداتها' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  machineNo!: number;

  @ApiProperty({ example: '2026-07-03', description: 'يوم المردودات المجرود' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'countDate must be yyyy-mm-dd' })
  countDate!: string;

  @ApiProperty({ required: false, example: 'RC-2026-009' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  refNo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

/** POST /return-counts/{id}/lines — record one physically counted item. */
export class CountReturnLineDto {
  @ApiProperty({ example: '1020010009' })
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  itemCode!: string;

  @ApiProperty({ example: 5, description: 'الكمية المردودة المجرودة فعلياً' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  countedQty!: number;
}

/** GET /return-counts — list filters. */
export class ListReturnCountsQuery {
  @IsOptional()
  @IsIn(['DRAFT', 'POSTED'])
  status?: 'DRAFT' | 'POSTED';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  machine?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50;
}
