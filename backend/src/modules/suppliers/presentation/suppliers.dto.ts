import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateSupplierDto {
  @ApiPropertyOptional({
    description:
      'Supplier code (V_CODE). Omit to auto-assign a local code (>= 9000).',
  })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  code?: string;

  @ApiProperty({ description: 'Arabic name (V_A_NAME)' })
  @IsString()
  @MaxLength(200)
  arName!: string;

  @ApiPropertyOptional({ description: 'English name (V_E_NAME)' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  enName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  mobile?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  address?: string;

  @ApiPropertyOptional({ description: 'Tax registration (V_TAX_CODE)' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  taxCode?: string;

  @ApiPropertyOptional({ description: 'Contact person (V_PERSON)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contact?: string;

  @ApiPropertyOptional({ description: 'Credit period in days' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(999)
  creditPeriod?: number;

  @ApiPropertyOptional({ description: 'true = disabled' })
  @IsOptional()
  @IsBoolean()
  inactive?: boolean;
}

export class UpdateSupplierDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  arName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  enName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  mobile?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  taxCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contact?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(999)
  creditPeriod?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  inactive?: boolean;
}
