import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'cashier1' })
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  username!: string;

  @ApiProperty({ example: '••••••••' })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password!: string;
}

export class RefreshDto {
  /** Optional — web clients send the refresh token via the mp_rt httpOnly cookie instead. */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(10)
  refreshToken?: string;
}

/** POSS004 تغيير كلمة السر — old + new password for the authenticated user. */
export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password' })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  oldPassword!: string;

  @ApiProperty({ description: 'New password (min 8 chars)' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string;
}
