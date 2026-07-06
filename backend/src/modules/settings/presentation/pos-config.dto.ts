import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

//============================================================================
// POSI004 — shortcuts
//============================================================================
export class UpsertShortcutDto {
  @ApiProperty({ example: 'pay', description: 'POS action key (whitelisted)' })
  @IsString()
  @MaxLength(40)
  action!: string;

  @ApiProperty({ example: 'F9', description: 'Key binding, e.g. F9, Ctrl+P' })
  @IsString()
  @MaxLength(40)
  keyCombo!: string;

  @ApiPropertyOptional({ example: 'الدفع' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  arLabel?: string | null;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9999)
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

//============================================================================
// POSI005/006 — scale definitions
//============================================================================
export class UpsertScaleDto {
  @ApiProperty({ example: 'ميزان الوزن' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: '02', description: 'Numeric barcode prefix' })
  @IsString()
  @Matches(/^\d{1,4}$/, { message: 'prefix must be 1–4 digits' })
  prefix!: string;

  @ApiProperty({ example: 12 })
  @IsInt()
  @Min(1)
  @Max(30)
  barcodeLength!: number;

  @ApiPropertyOptional({ example: 2, description: '0-based item-code offset' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(29)
  itemCodeStart?: number;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  @Max(29)
  itemCodeLen!: number;

  @ApiPropertyOptional({
    example: 5,
    description: 'Value digits; omit/null = rest of the barcode',
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(29)
  valueLen?: number | null;

  @ApiProperty({ example: 1000, description: 'Divisor: value ÷ divisor' })
  @IsInt()
  @Min(1)
  divisor!: number;

  @ApiProperty({ example: 'WEIGHT', enum: ['WEIGHT', 'PRICE'] })
  @IsIn(['WEIGHT', 'PRICE'])
  mode!: 'WEIGHT' | 'PRICE';

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9999)
  sortOrder?: number;
}

export class DecodeBarcodeDto {
  @ApiProperty({ example: '0200001012500' })
  @IsString()
  @MaxLength(64)
  barcode!: string;
}
