/** DI token for the read-only AdminRepository port. */
export const ADMIN_REPOSITORY = Symbol('ADMIN_REPOSITORY');

/** One POS cashier machine (IAS_POS_MACHINE; POSI001/POST009/POSR009). */
export interface MachineRow {
  machineNo: number;
  terminal: string | null;
  inactive: boolean;
  defWarehouse: number | null; // DEF_WCODE
  defBranch: number | null; // DEF_BRN_NO
  ipAddress: string | null;
  lastBillDate: string | null; // YYYY-MM-DD
  useVat: boolean;
  priceLevel: number | null;
}

/** One system user (IAS202623.USER_R; POSI011/POSR005/POSR010/POSR011). */
export interface UserRow {
  userId: number; // U_ID
  arabicName: string | null; // U_A_NAME
  englishName: string | null; // U_E_NAME
  code: string | null; // U_CODE
  inactive: boolean; // INACTIVE
  isAdmin: boolean; // ADMIN_USER
  userType: number | null; // USER_TYPE
  loggedOn: boolean; // LOGGED_ON (currently online)
  locked: boolean; // USER_LOCKED
  email: string | null; // E_MAIL
}

/** One login/logout history record (IAS_USR_LGN_HSTRY). */
export interface SessionRow {
  userId: number; // U_ID
  terminal: string | null; // TRMNL_NM
  loginType: number | null; // LGN_TYP (1 = login, 0 = logout — Onyx convention)
  eventAt: string | null; // LGN_OUT_DATE (YYYY-MM-DD HH24:MI:SS)
  branchNo: number | null; // BRN_NO
}

export interface SessionsFilter {
  /** Optional filter by user id. */
  userId?: number;
  limit: number;
}

/**
 * AdminRepository — READ-ONLY reads for administration screens:
 *   - IAS_POS_MACHINE      (YSPOS23)   → cashier machines + status
 *   - IAS202623.USER_R                 → system users (Arabic names)
 *   - IAS_USR_LGN_HSTRY    (YSPOS23)   → login/logout history
 * Served through the least-privilege MOTECH_RO connection. No mutations.
 */
export interface AdminRepository {
  /** All POS machines with their status. */
  listMachines(): Promise<MachineRow[]>;

  /** All system users (by U_ID ascending). */
  listUsers(): Promise<UserRow[]>;

  /** Recent login/logout history (most recent first). */
  listSessions(filter: SessionsFilter): Promise<SessionRow[]>;
}
