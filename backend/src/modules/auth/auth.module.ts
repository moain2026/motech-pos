import { Module } from '@nestjs/common';
import { AuthService } from './application/auth.service';
import { TokenService } from './application/token.service';
import { USER_REPOSITORY } from './domain/user-repository.port';
import { LocalUserRepository } from './infrastructure/local-user.repository';
import { AuthController } from './presentation/auth.controller';
import { JwtAuthGuard } from './presentation/jwt-auth.guard';
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
    TokenService,
    JwtAuthGuard,
    RolesGuard,
    { provide: USER_REPOSITORY, useClass: LocalUserRepository },
  ],
  exports: [TokenService, JwtAuthGuard, RolesGuard, AuthService],
})
export class AuthModule {}
