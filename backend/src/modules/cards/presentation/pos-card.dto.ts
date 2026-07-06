import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Create/edit a POS card type (POSI012). On create, cardNo may be omitted to
 * auto-allocate a LOCAL number. arName (Arabic label) is required.
 */
export class UpsertPosCardDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cardNo?: number;

  @IsString()
  @MaxLength(100)
  arName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  enName?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  cardType?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  bankNo?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  commissionPct?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  commCalcType?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  duePeriod?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  bankAc?: string | null;

  @IsOptional()
  @IsBoolean()
  inactive?: boolean;
}
