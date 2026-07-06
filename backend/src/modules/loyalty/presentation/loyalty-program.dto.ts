import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Create/replace a loyalty program (POSI008). Money/amount fields are numeric;
 * dates are YYYY-MM-DD (validity window). One ACTIVE program per point type is
 * enforced in the DB (unique index) → 409 on conflict.
 */
export class UpsertLoyaltyProgramDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pointTypNo?: number = 1;

  @IsIn([1, 2])
  @Type(() => Number)
  calcType!: 1 | 2;

  @Type(() => Number)
  @IsNumber()
  @Min(0.0001)
  amt4Point!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.0001)
  pointCnt?: number = 1;

  @IsOptional()
  @IsBoolean()
  truncate?: boolean = true;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pointValue?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minBillAmt?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPointsPerBill?: number = 0;

  @IsOptional()
  @Matches(DATE_RE, { message: 'startDate must be YYYY-MM-DD' })
  startDate?: string | null;

  @IsOptional()
  @Matches(DATE_RE, { message: 'endDate must be YYYY-MM-DD' })
  endDate?: string | null;

  @IsOptional()
  @IsBoolean()
  active?: boolean = true;
}
