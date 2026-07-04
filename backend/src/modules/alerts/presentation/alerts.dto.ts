import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const DATE_RX = /^\d{4}-\d{2}-\d{2}$/;

/** POST /alerts — create a login alert. */
export class CreateAlertDto {
  @ApiProperty({ example: 'صيانة مجدولة' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;

  @ApiProperty({ required: false, example: 'سيتوقف النظام الليلة 11م—12م' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  body?: string;

  @ApiProperty({ required: false, example: '2026-07-04' })
  @IsOptional()
  @Matches(DATE_RX, { message: 'showFrom must be yyyy-mm-dd' })
  showFrom?: string;

  @ApiProperty({ required: false, example: '2026-07-10' })
  @IsOptional()
  @Matches(DATE_RX, { message: 'showUntil must be yyyy-mm-dd' })
  showUntil?: string;
}

/** PUT /alerts/{id}. */
export class UpdateAlertDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  body?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  active?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @Matches(DATE_RX, { message: 'showFrom must be yyyy-mm-dd' })
  showFrom?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Matches(DATE_RX, { message: 'showUntil must be yyyy-mm-dd' })
  showUntil?: string;
}

/** GET /alerts + /alerts/pending — limit. */
export class ListAlertsQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50;
}
