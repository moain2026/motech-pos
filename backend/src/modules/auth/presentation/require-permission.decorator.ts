import { SetMetadata } from '@nestjs/common';
import { Permission } from '../domain/permission';

export const PERMISSION_KEY = 'permission';

/**
 * @RequirePermission('CODE') — dynamic RBAC (POSS002). Restricts a route to
 * roles that hold the given permission in MOTECH_POS.ROLE_PERMISSIONS
 * (evaluated at request time by PermissionsGuard). Unlike @Roles() (a static
 * role list), this consults the admin-editable matrix, so an admin can change
 * what each role may do WITHOUT redeploying.
 *
 * Use ALONGSIDE JwtAuthGuard (which populates req.user):
 *   @UseGuards(JwtAuthGuard, PermissionsGuard)
 *   @RequirePermission('SETTINGS')
 */
export const RequirePermission = (permission: Permission) =>
  SetMetadata(PERMISSION_KEY, permission);
