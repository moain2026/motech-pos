import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * POST006 — issue the cash refund voucher (سند صرف) for a MOTECH_POS return.
 * Idempotent: one return produces at most one voucher, so no Idempotency-Key
 * header is needed (the returnId itself is the natural key).
 */
export class RefundVoucherDto {
  @ApiProperty({ description: 'The MOTECH_POS return id (UUID) to refund' })
  @IsString()
  @MaxLength(36)
  returnId!: string;

  @ApiProperty({ description: 'Cashier issuing the refund (drawer owner)' })
  @IsInt()
  @Min(0)
  cashierNo!: number;

  @ApiPropertyOptional({ description: 'POS machine number' })
  @IsOptional()
  @IsInt()
  @Min(0)
  machineNo?: number;

  @ApiPropertyOptional({ description: 'Optional note appended to the البيان' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;
}
