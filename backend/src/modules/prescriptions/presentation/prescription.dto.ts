import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

/** One annotated item — dosage/usage/duration for an item ON the bill. */
export class RxLineDto {
  @ApiProperty({ example: '1030020018' })
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  itemCode!: string;

  @ApiProperty({ example: 'قرص كل 8 ساعات', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  dosage?: string;

  @ApiProperty({ example: 'بعد الأكل مع كوب ماء', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  usageNotes?: string;

  @ApiProperty({ example: '7 أيام', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  duration?: string;
}

/** POST /prescriptions — attach a prescription to an existing sale bill. */
export class CreatePrescriptionDto {
  @ApiProperty({ example: '26201300078', description: 'YSPOS23 BILL_NO' })
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  billNo!: string;

  @ApiProperty({ example: 'د. أحمد الحمادي' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  doctorName!: string;

  @ApiProperty({ example: 'محمد العباسي' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  patientName!: string;

  @ApiProperty({ example: 'F-10233', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  patientRef?: string;

  @ApiProperty({ example: '2026-07-04', required: false })
  @IsOptional()
  @IsISO8601()
  rxDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiProperty({ type: [RxLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => RxLineDto)
  lines!: RxLineDto[];
}

/** GET /prescriptions — list filters. */
export class ListPrescriptionsQuery {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  billNo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  patient?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50;
}
