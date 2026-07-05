import { Injectable, Logger } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { OracleService } from '../../../infrastructure/oracle/oracle.service';
import { AuthUser, Role } from '../domain/user.entity';
import { UserRepository } from '../domain/user-repository.port';

/**
 * OracleUserRepository — reads real Onyx users from IAS202623.USER_R.
 *
 * Onyx stores USER_R.PASSWORD with a trivial Caesar-style shift (each char
 * shifted by +3 on write; decode with -3). This is WEAK by modern standards —
 * we only use it for COMPATIBILITY so existing Onyx operators (مدير النظام،
 * طارق العباسي…) can sign in with their existing credentials. Our own accounts
 * remain bcrypt (stronger) via the composite repository, which is tried first.
 *
 * Read-only: never writes to IAS202623 / YSPOS23.
 */
@Injectable()
export class OracleUserRepository implements UserRepository {
  private readonly logger = new Logger(OracleUserRepository.name);

  constructor(private readonly db: OracleService) {}

  private get master(): string {
    return this.db.masterSchema();
  }

  /** Decode Onyx Caesar(-3) password. */
  private decode(enc: string | null): string {
    if (!enc) return '';
    return Array.from(enc)
      .map((c) => String.fromCharCode(c.charCodeAt(0) - 3))
      .join('');
  }

  private mapRole(adminUser: number | null, userType: number | null): Role {
    if (adminUser === 1) return 'admin';
    if (userType === 3) return 'cashier';
    return 'supervisor';
  }

  private async toAuthUser(row: UserRRow): Promise<AuthUser> {
    // Onyx passwords are weak plaintext-after-decode; we wrap the decoded
    // value in a bcrypt hash at read time so the AuthService bcrypt.compare
    // path stays uniform and constant-time.
    const decoded = this.decode(row.PASSWORD);
    const passwordHash = await bcrypt.hash(decoded, 10);
    return {
      id: 900000 + row.U_ID, // offset to avoid collisions with local ids
      username: (row.U_A_NAME ?? String(row.U_ID)).trim(),
      passwordHash,
      role: this.mapRole(row.ADMIN_USER, row.USER_TYPE),
      displayName: (row.U_A_NAME ?? row.U_E_NAME ?? '').trim(),
      branchNo: row.CONN_BRN_NO ?? 1,
      active: row.INACTIVE === 0 && row.USER_LOCKED !== 1,
    };
  }

  async findByUsername(username: string): Promise<AuthUser | null> {
    try {
      const rows = await this.db.query<UserRRow>(
        `SELECT U_ID, U_A_NAME, U_E_NAME, PASSWORD, ADMIN_USER, USER_TYPE,
                NVL(INACTIVE,0) AS INACTIVE, NVL(USER_LOCKED,0) AS USER_LOCKED,
                CONN_BRN_NO
         FROM ${this.master}.USER_R
         WHERE TRIM(U_A_NAME) = :u OR TO_CHAR(U_ID) = :u`,
        { u: username.trim() },
      );
      if (!rows.length) return null;
      const user = await this.toAuthUser(rows[0]);
      return user.active ? user : null;
    } catch (err) {
      this.logger.warn(`USER_R lookup failed: ${(err as Error).message}`);
      return null;
    }
  }

  async findById(id: number): Promise<AuthUser | null> {
    if (id < 900000) return null;
    const uId = id - 900000;
    try {
      const rows = await this.db.query<UserRRow>(
        `SELECT U_ID, U_A_NAME, U_E_NAME, PASSWORD, ADMIN_USER, USER_TYPE,
                NVL(INACTIVE,0) AS INACTIVE, NVL(USER_LOCKED,0) AS USER_LOCKED,
                CONN_BRN_NO
         FROM ${this.master}.USER_R WHERE U_ID = :i`,
        { i: uId },
      );
      if (!rows.length) return null;
      const user = await this.toAuthUser(rows[0]);
      return user.active ? user : null;
    } catch {
      return null;
    }
  }

  async updatePassword(): Promise<void> {
    // Read-only source: Onyx user passwords are managed in Onyx itself.
    throw new Error('Onyx users are read-only; change password in Onyx');
  }
}

interface UserRRow {
  U_ID: number;
  U_A_NAME: string | null;
  U_E_NAME: string | null;
  PASSWORD: string | null;
  ADMIN_USER: number | null;
  USER_TYPE: number | null;
  INACTIVE: number;
  USER_LOCKED: number;
  CONN_BRN_NO: number | null;
}
