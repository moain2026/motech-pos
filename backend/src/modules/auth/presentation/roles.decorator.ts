import { SetMetadata } from '@nestjs/common';
import { Role } from '../domain/user.entity';

export const ROLES_KEY = 'roles';

/** Restrict a route/controller to the given roles (RBAC). */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
