/** Roles supported by RBAC (derived from Onyx S_BRN_USR_PRIV/PRIVILEGE_GC). */
export type Role = 'cashier' | 'supervisor' | 'admin';

export const ALL_ROLES: readonly Role[] = ['cashier', 'supervisor', 'admin'];

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ALL_ROLES as readonly string[]).includes(value);
}

/**
 * AuthUser — an authenticatable POS user.
 *
 * DATA SOURCE NOTE (proof-based — see docs/db/AUTH_DATA_NOTE.md):
 * The canonical Onyx user/credential tables (`USER_R`, `S_BRN_USR_PRIV`,
 * `PRIVILEGE_GC`) are *synonyms* in YSPOS23 that resolve to the absent
 * `IAS202623` schema, so they cannot be read locally. Onyx also stores
 * passwords encrypted via `DECRYPT_PASS`/`POS_GNR_PKG`, unavailable here.
 *
 * Therefore this phase authenticates against a LOCAL, app-owned users store
 * (bcrypt-hashed passwords, seeded from a JSON file). This keeps the strict
 * READ-ONLY contract on YSPOS23 intact and is clearly documented as temporary
 * until the real user schema/decrypt routines are reachable.
 */
export interface AuthUser {
  id: number;
  username: string;
  /** bcrypt hash (never returned to clients). */
  passwordHash: string;
  role: Role;
  displayName: string;
  branchNo: number;
  active: boolean;
}

/** Public projection of a user (no secrets). */
export interface AuthUserView {
  id: number;
  username: string;
  role: Role;
  displayName: string;
  branchNo: number;
}

export function toView(u: AuthUser): AuthUserView {
  return {
    id: u.id,
    username: u.username,
    role: u.role,
    displayName: u.displayName,
    branchNo: u.branchNo,
  };
}
