import { Module } from '@nestjs/common';
import { AuthService } from './application/auth.service';
import { LoginThrottleService } from './application/login-throttle.service';
import { PermissionsService } from './application/permissions.service';
import { TokenService } from './application/token.service';
import { USER_REPOSITORY } from './domain/user-repository.port';
import { LocalUserRepository } from './infrastructure/local-user.repository';
import { OracleUserRepository } from './infrastructure/oracle-user.repository';
import { CompositeUserRepository } from './infrastructure/composite-user.repository';
import { AuthController } from './presentation/auth.controller';
import { JwtAuthGuard } from './presentation/jwt-auth.guard';
import { PermissionsGuard } from './presentation/permissions.guard';
import { RolesGuard } from './presentation/roles.guard';

/**
 * AuthModule — JWT auth + RBAC.
 * Exports TokenService + guards so other modules (catalog, etc.) can protect
 * their routes with @UseGuards(JwtAuthGuard, RolesGuard).
 */
@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    LoginThrottleService,
    TokenService,
    PermissionsService,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    LocalUserRepository,
    OracleUserRepository,
    { provide: USER_REPOSITORY, useClass: CompositeUserRepository },
  ],
  exports: [
    TokenService,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    PermissionsService,
    AuthService,
  ],
})
export class AuthModule {}
