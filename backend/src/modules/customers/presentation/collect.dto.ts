import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

/** POST /customers/:code/collect — record a receipt against a credit bill. */
export class CollectDto {
  @IsString()
  @MaxLength(36)
  billId!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  amount!: number;

  @IsOptional()
  @IsIn(['CASH', 'CARD'])
  method?: 'CASH' | 'CARD';

  @IsOptional()
  @IsString()
  @MaxLength(7)
  currency?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 8 })
  @IsPositive()
  rate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  cashierNo?: number;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  note?: string;
}
