import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { TypedConfigService } from '../../../config/config.module';
import { AuthService, LoginResult } from '../application/auth.service';
import { PermissionsService } from '../application/permissions.service';
import { PERMISSION_CODES } from '../domain/permission';
import {
  AuthCookieConfig,
  clearAuthCookies,
  REFRESH_COOKIE,
  setAuthCookies,
} from './auth-cookies';
import { ChangePasswordDto, LoginDto, RefreshDto } from './auth.dto';
import { AuthenticatedRequest, JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly cookieCfg: AuthCookieConfig;

  constructor(
    private readonly auth: AuthService,
    private readonly permissions: PermissionsService,
    config: TypedConfigService,
  ) {
    this.cookieCfg = {
      secure: config.get('NODE_ENV') === 'production',
      apiPrefix: config.get('API_PREFIX'),
      accessTtl: config.get('JWT_ACCESS_TTL'),
      refreshTtl: config.get('JWT_REFRESH_TTL'),
    };
  }

  /**
   * Tokens travel BOTH ways during the migration window:
   * - httpOnly SameSite=Strict cookies (web client — XSS-hardened), and
   * - the response body (backward compatibility: scripts, older clients,
   *   direct API consumers using `Authorization: Bearer`).
   */
  private issueCookies(res: Response, result: LoginResult): void {
    setAuthCookies(res, result, this.cookieCfg);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login (username + password) → access & refresh JWT' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    // req.ip honours `trust proxy` (Caddy on loopback forwards the real IP).
    const result = await this.auth.login(dto.username, dto.password, req.ip);
    this.issueCookies(res, result);
    return { data: result };
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Exchange a refresh token (body or mp_rt httpOnly cookie) for new tokens',
  })
  async refresh(
    @Body() dto: RefreshDto,
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = (req as { cookies?: Record<string, string> }).cookies;
    const token = dto.refreshToken ?? cookies?.[REFRESH_COOKIE];
    if (!token) {
      throw new UnauthorizedException('Missing refresh token');
    }
    const result = await this.auth.refresh(token);
    this.issueCookies(res, result);
    return { data: result };
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Clear httpOnly auth cookies (server-side logout)' })
  logout(@Res({ passthrough: true }) res: Response) {
    clearAuthCookies(res, this.cookieCfg);
    return { data: { loggedOut: true } };
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
