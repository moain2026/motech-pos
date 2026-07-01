import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { VoucherType } from '../domain/entities/voucher.entity';

export class ListVouchersQuery {
  @IsOptional()
  @IsString()
  shift?: string;

  @IsOptional()
  @IsEnum(VoucherType)
  type?: VoucherType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  cashierNo?: number;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'from must be YYYY-MM-DD' })
  from?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'to must be YYYY-MM-DD' })
  to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 100;
}
