/** DI token for the AdminWriteRepository port (MOTECH_POS overlays + permissions). */
export const ADMIN_WRITE_REPOSITORY = Symbol('ADMIN_WRITE_REPOSITORY');

/** Roles known to the permission matrix (mirrors auth Role). */
export type PermRole = 'cashier' | 'supervisor' | 'admin';

/** One USERS_OVERLAY row (local create/edit of a POS user). */
export interface UserOverlayRow {
  id: string; // UUID v7
  userId: number; // business key (U_ID; local ids >= 9000)
  origin: 'LOCAL' | 'EDIT';
  arName: string | null;
  enName: string | null;
  code: string | null;
  role: PermRole | null;
  email: string | null;
  authUsername: string | null; // linked auth-users.json account
  inactive: boolean;
}

/** Fields an admin may set when creating/updating a user overlay. */
export interface UpsertUserOverlay {
  userId: number;
  origin: 'LOCAL' | 'EDIT';
  arName?: string | null;
  enName?: string | null;
  code?: string | null;
  role?: PermRole | null;
  email?: string | null;
  authUsername?: string | null;
  inactive?: boolean | null;
}

/** One MACHINES_OVERLAY row (local create/edit of a cashier machine). */
export interface MachineOverlayRow {
  id: string;
  machineNo: number;
  origin: 'LOCAL' | 'EDIT';
  terminal: string | null;
  branchNo: number | null;
  warehouse: number | null;
  ipAddress: string | null;
  priceLevel: number | null;
  useVat: boolean | null;
  currency: string | null;
  inactive: boolean;
}

/** Fields an admin may set when creating/updating a machine overlay. */
export interface UpsertMachineOverlay {
  machineNo: number;
  origin: 'LOCAL' | 'EDIT';
  terminal?: string | null;
  branchNo?: number | null;
  warehouse?: number | null;
  ipAddress?: string | null;
  priceLevel?: number | null;
  useVat?: boolean | null;
  currency?: string | null;
  inactive?: boolean | null;
}

/** One ROLE_PERMISSIONS row: may a role perform an action? */
export interface RolePermission {
  role: PermRole;
  permission: string; // e.g. SALE, RETURN, DISCOUNT, VOID, REPORTS…
  allowed: boolean;
}

/**
 * AdminWriteRepository — WRITE-side administration on MOTECH_POS only
 * (YSPOS23/IAS202623 stay SACRED read-only):
 *   - USERS_OVERLAY     → local POS user creates/edits (merged with USER_R)
 *   - MACHINES_OVERLAY  → local machine creates/edits (merged with IAS_POS_MACHINE)
 *   - ROLE_PERMISSIONS  → fine-grained role → action matrix
 */
export interface AdminWriteRepository {
  /** All user overlay rows (by USER_ID). */
  listUserOverlays(): Promise<UserOverlayRow[]>;

  /** One user overlay by USER_ID, or null. */
  getUserOverlay(userId: number): Promise<UserOverlayRow | null>;

  /** MERGE (upsert) a user overlay row. Returns the stored row. */
  upsertUserOverlay(input: UpsertUserOverlay): Promise<UserOverlayRow>;

  /** Next free local user id (>= 9000, above any existing overlay id). */
  nextLocalUserId(): Promise<number>;

  /** All machine overlay rows (by MACHINE_NO). */
  listMachineOverlays(): Promise<MachineOverlayRow[]>;

  /** One machine overlay by MACHINE_NO, or null. */
  getMachineOverlay(machineNo: number): Promise<MachineOverlayRow | null>;

  /** MERGE (upsert) a machine overlay row. Returns the stored row. */
  upsertMachineOverlay(input: UpsertMachineOverlay): Promise<MachineOverlayRow>;

  /** Whole role-permission matrix. */
  listPermissions(): Promise<RolePermission[]>;

  /** MERGE (upsert) permission entries atomically. Returns count written. */
  setPermissions(
    entries: RolePermission[],
    updatedBy: number | null,
  ): Promise<number>;
}
