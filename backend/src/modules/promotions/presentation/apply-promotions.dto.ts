import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class ApplyPromotionLineDto {
  @IsString()
  itemCode!: string;

  @IsOptional()
  @IsString()
  itemUnit?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  qty!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitPrice!: number;
}

export class ApplyPromotionsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ApplyPromotionLineDto)
  lines!: ApplyPromotionLineDto[];
}

export class LocalPromotionLineDto {
  @IsOptional()
  @IsString()
  iCode?: string;

  @IsOptional()
  @IsString()
  itemUnit?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  fQty?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tQty?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  fAmt?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tAmt?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discType?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discAmtPer?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  levPrice?: number;

  @IsOptional()
  @IsString()
  qtItemCode?: string;

  @IsOptional()
  @IsString()
  qtItemUnit?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  freeQty?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  compQty?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  qtQty?: number;
}

export class CreateLocalPromotionDto {
  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  prmType!: number; // 1 = buy-X, 2 = tier

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  prmMethod?: number;

  @IsString()
  fromDate!: string; // YYYY-MM-DD

  @IsString()
  toDate!: string;

  @IsOptional()
  @IsString()
  fromTime?: string;

  @IsOptional()
  @IsString()
  toTime?: string;

  @IsOptional()
  @IsString()
  dowMask?: string;

  @IsOptional()
  @IsBoolean()
  byInvoiceAmount?: boolean;

  @IsOptional()
  @IsBoolean()
  freeQtyAsDiscount?: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LocalPromotionLineDto)
  lines!: LocalPromotionLineDto[];
}

export class SetPromotionStatusDto {
  @IsBoolean()
  inactive!: boolean;
}
