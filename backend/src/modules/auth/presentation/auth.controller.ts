import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../application/auth.service';
import { PermissionsService } from '../application/permissions.service';
import { PERMISSION_CODES } from '../domain/permission';
import { ChangePasswordDto, LoginDto, RefreshDto } from './auth.dto';
import { AuthenticatedRequest, JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly permissions: PermissionsService,
  ) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login (username + password) → access & refresh JWT' })
  async login(@Body() dto: LoginDto, @Req() req: AuthenticatedRequest) {
    // req.ip honours `trust proxy` (Caddy on loopback forwards the real IP).
    const result = await this.auth.login(dto.username, dto.password, req.ip);
    return { data: result };
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Exchange a refresh token for new tokens' })
  async refresh(@Body() dto: RefreshDto) {
    const result = await this.auth.refresh(dto.refreshToken);
    return { data: result };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current authenticated user + role' })
  async me(@Req() req: AuthenticatedRequest) {
    const userId = req.user?.sub;
    if (userId == null) {
      throw new UnauthorizedException();
    }
    const me = await this.auth.me(userId);
    return { data: me };
  }

  @Get('permissions/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Effective fine-grained permissions for the current user (POSS002) — for UI gating',
  })
  async myPermissions(@Req() req: AuthenticatedRequest) {
    const role = req.user?.role;
    if (!role) {
      throw new UnauthorizedException();
    }
    const entries = await Promise.all(
      PERMISSION_CODES.map(async (p) => [p, await this.permissions.can(role, p)] as const),
    );
    const map = Object.fromEntries(entries) as Record<string, boolean>;
    return { data: { role, permissions: map } };
  }

  @Post('change-password')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Change own password (POSS004) — verifies the current password, stores bcrypt(12)',
  })
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.sub;
    if (userId == null) {
      throw new UnauthorizedException();
    }
    const user = await this.auth.changePassword(
      userId,
      dto.oldPassword,
      dto.newPassword,
    );
    return { data: { changed: true, user } };
  }
}
