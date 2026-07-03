import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

const ROLES = ['cashier', 'supervisor', 'admin'] as const;
export type DtoRole = (typeof ROLES)[number];

//============================================================================
// Users (POSI011) — overlay CRUD
//============================================================================

export class CreateAdminUserDto {
  @ApiPropertyOptional({
    description:
      'Business user id (U_ID). Omit to auto-assign a local id (>= 9000).',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId?: number;

  @ApiPropertyOptional({ description: 'Arabic name (U_A_NAME)' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  arName?: string;

  @ApiPropertyOptional({ description: 'English name (U_E_NAME)' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  enName?: string;

  @ApiPropertyOptional({ description: 'User code (U_CODE)' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  code?: string;

  @ApiProperty({ enum: ROLES, description: 'RBAC role for the user' })
  @IsIn(ROLES as unknown as string[])
  role!: DtoRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  email?: string;

  @ApiPropertyOptional({
    description: 'Linked auth-users.json username (login account)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  authUsername?: string;

  @ApiPropertyOptional({ description: 'true = disabled' })
  @IsOptional()
  @IsBoolean()
  inactive?: boolean;
}

export class UpdateAdminUserDto {
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
  code?: string;

  @ApiPropertyOptional({ enum: ROLES })
  @IsOptional()
  @IsIn(ROLES as unknown as string[])
  role?: DtoRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  authUsername?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  inactive?: boolean;
}

export class SetUserStatusDto {
  @ApiProperty({ description: 'true = active (enabled), false = disabled' })
  @IsBoolean()
  active!: boolean;
}

//============================================================================
// Machines (POST009) — overlay CRUD
//============================================================================

export class CreateAdminMachineDto {
  @ApiProperty({ description: 'Machine number (MACHINE_NO) — business key' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  machineNo!: number;

  @ApiPropertyOptional({ description: 'Terminal name (TERMINAL)' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  terminal?: string;

  @ApiPropertyOptional({ description: 'Default branch (DEF_BRN_NO)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  branchNo?: number;

  @ApiPropertyOptional({ description: 'Default warehouse (DEF_WCODE)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  warehouse?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  ipAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  priceLevel?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  useVat?: boolean;

  @ApiPropertyOptional({ description: 'Default currency (CURR_DFLT)' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({ description: 'true = disabled' })
  @IsOptional()
  @IsBoolean()
  inactive?: boolean;
}

export class UpdateAdminMachineDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  terminal?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  branchNo?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  warehouse?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  ipAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  priceLevel?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  useVat?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  inactive?: boolean;
}

//============================================================================
// Role permissions
//============================================================================

/** Permission codes managed by the matrix (whitelist). */
export const PERMISSIONS = [
  'SALE',
  'RETURN',
  'DISCOUNT',
  'VOID',
  'HOLD',
  'REPORTS',
  'SETTINGS',
  'SHIFT_OPEN',
  'SHIFT_CLOSE',
  'PRICE_OVERRIDE',
  'VOUCHERS',
  'EINVOICE',
] as const;

export class PermissionEntryDto {
  @ApiProperty({ enum: ROLES })
  @IsIn(ROLES as unknown as string[])
  role!: DtoRole;

  @ApiProperty({
    description: `Permission code (${PERMISSIONS.join(', ')})`,
    example: 'DISCOUNT',
  })
  @IsString()
  @MaxLength(40)
  @Matches(/^[A-Z][A-Z0-9_]*$/, {
    message: 'permission must be UPPER_SNAKE_CASE',
  })
  permission!: string;

  @ApiProperty({ description: 'true = role may perform the action' })
  @IsBoolean()
  allowed!: boolean;
}

export class UpdatePermissionsDto {
  @ApiProperty({ type: [PermissionEntryDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => PermissionEntryDto)
  entries!: PermissionEntryDto[];
}

export function isKnownPermission(p: string): boolean {
  return (PERMISSIONS as readonly string[]).includes(p);
}
