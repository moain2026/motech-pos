import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const toBool = ({ value }: { value: unknown }) =>
  value === 'true' || value === true
    ? true
    : value === 'false' || value === false
      ? false
      : value;

export class ListItemsQuery {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  search?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50;

  /** Category (main group) code — IAS_ITM_MST.G_CODE. */
  @IsOptional()
  @IsString()
  @MaxLength(20)
  category?: string;

  /** Sub-category code — IAS_ITM_MST.MNG_CODE. */
  @IsOptional()
  @IsString()
  @MaxLength(20)
  subCategory?: string;

  /** true → weighted (scale) items only; false → non-weighted only. */
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  weighted?: boolean;

  /** true → active items only; false → inactive only. */
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  active?: boolean;

  /** Minimum effective price (inclusive). */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  /** Maximum effective price (inclusive). */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;
}
