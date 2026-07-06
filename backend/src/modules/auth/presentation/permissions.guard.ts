import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from '../application/permissions.service';
import { Permission } from '../domain/permission';
import { AuthenticatedRequest } from './jwt-auth.guard';
import { PERMISSION_KEY } from './require-permission.decorator';

/**
 * PermissionsGuard — enforces the dynamic RBAC matrix (POSS002). Reads the
 * @RequirePermission() metadata (method then class) and asks PermissionsService
 * whether the authenticated user's role holds it in MOTECH_POS.ROLE_PERMISSIONS.
 *
 * Must run AFTER JwtAuthGuard (which sets req.user). Routes without a
 * @RequirePermission() are unaffected (returns true). This composes with
 * @Roles()/RolesGuard — a route may use either or both.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissions: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<Permission | undefined>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required) return true; // no permission restriction on this route

    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const role = req.user?.role;
    if (!role) {
      throw new ForbiddenException('Missing role');
    }
    const allowed = await this.permissions.can(role, required);
    if (!allowed) {
      throw new ForbiddenException(
        `Role '${role}' lacks permission '${required}'`,
      );
    }
    return true;
  }
}
