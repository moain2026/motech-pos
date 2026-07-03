import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/** POST /inventory/counts — open a new جرد session for one warehouse. */
export class StartCountDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  warehouseCode!: number;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  note?: string;
}

/** POST /inventory/counts/:id/lines — record the physical count of an item. */
export class CountLineDto {
  @IsString()
  @MaxLength(30)
  itemCode!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  countedQty!: number;
}

/** GET /inventory/counts — list filter. */
export class ListCountsQuery {
  @IsOptional()
  @IsIn(['DRAFT', 'POSTED'])
  status?: 'DRAFT' | 'POSTED';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50;
}
