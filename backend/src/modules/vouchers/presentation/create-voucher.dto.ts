import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import {
  VoucherMethod,
  VoucherType,
} from '../domain/entities/voucher.entity';

export class CreateVoucherDto {
  @ApiProperty({ enum: VoucherType, description: 'RECEIPT (قبض) or EXPENSE (صرف)' })
  @IsEnum(VoucherType)
  type!: VoucherType;

  @ApiProperty({ description: 'Cashier number (must have an open shift)' })
  @IsInt()
  @Min(0)
  cashierNo!: number;

  @ApiPropertyOptional({ description: 'POS machine number' })
  @IsOptional()
  @IsInt()
  @Min(0)
  machineNo?: number;

  @ApiProperty({ description: 'Voucher amount (> 0), in the given currency' })
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiPropertyOptional({ description: 'Currency code (default: shift currency)' })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  currency?: string;

  @ApiPropertyOptional({ description: 'Exchange rate to shift currency (default 1)' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  rate?: number;

  @ApiPropertyOptional({
    enum: VoucherMethod,
    description: 'Tender channel (default CASH). Only CASH affects drawer cash.',
  })
  @IsOptional()
  @IsEnum(VoucherMethod)
  paymentMethod?: VoucherMethod;

  @ApiPropertyOptional({ description: 'البيان / reason' })
  @IsOptional()
  @IsString()
  @MaxLength(400)
  description?: string;

  @ApiPropertyOptional({ description: 'المستفيد / الدافع — party name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  partyName?: string;

  @ApiPropertyOptional({ description: 'Optional classification/category' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  category?: string;

  @ApiPropertyOptional({ description: 'Client-generated operation id (uuid v7)' })
  @IsOptional()
  @IsString()
  clientOperationId?: string;
}
