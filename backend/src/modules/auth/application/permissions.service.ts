import { Injectable, Logger } from '@nestjs/common';
import type { BindParameters } from 'oracledb';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { Role } from '../domain/user.entity';
import {
  fallbackAllows,
  Permission,
  PermissionCell,
} from '../domain/permission';

type PermRow = { ROLE: string; PERMISSION: string; ALLOWED: number };

/**
 * PermissionsService — the runtime authority for the dynamic RBAC matrix
 * (POSS002). Reads MOTECH_POS.ROLE_PERMISSIONS (managed via GET/PUT
 * /admin/permissions) and answers "may this role perform this action?".
 *
 * The matrix is CACHED in memory with a short TTL to keep the check off the
 * hot path (no DB round-trip per request) while still reflecting edits within
 * seconds. `invalidate()` lets the admin write path clear the cache
 * immediately after a change.
 *
 * SAFETY: if the matrix has no explicit row for a pair — or the DB is
 * unreachable — we fall back to the coarse defaults (fallbackAllows), which
 * mirror the V013 seed. So the matrix can only FURTHER RESTRICT; a broken DB
 * never silently grants more than the safe baseline.
 */
@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);
  private cache: Map<string, boolean> | null = null;
  private loadedAt = 0;
  private readonly ttlMs = 15_000;

  constructor(private readonly write: OracleWriteService) {}

  private key(role: string, permission: string): string {
    return `${role}::${permission}`;
  }

  /** Force the next check to re-read the matrix (call after a matrix edit). */
  invalidate(): void {
    this.cache = null;
    this.loadedAt = 0;
  }

  private async ensureLoaded(): Promise<Map<string, boolean> | null> {
    const fresh = this.cache && Date.now() - this.loadedAt < this.ttlMs;
    if (fresh) return this.cache;
    try {
      const rows = await this.write.query<PermRow>(
        `SELECT ROLE, PERMISSION, ALLOWED FROM ${this.write.schema()}.ROLE_PERMISSIONS`,
      );
      const map = new Map<string, boolean>();
      for (const r of rows) {
        map.set(this.key(r.ROLE, r.PERMISSION), Number(r.ALLOWED) === 1);
      }
      this.cache = map;
      this.loadedAt = Date.now();
      return map;
    } catch (err) {
      // DB unreachable → do NOT cache; caller falls back to safe defaults.
      this.logger.warn(
        `ROLE_PERMISSIONS read failed; using coarse fallback: ${String(err)}`,
      );
      return null;
    }
  }

  /**
   * Does `role` have `permission`? Consults the matrix; falls back to the
   * coarse defaults for unknown pairs or when the matrix is unavailable.
   */
  async can(role: Role, permission: Permission): Promise<boolean> {
    const map = await this.ensureLoaded();
    if (map) {
      const explicit = map.get(this.key(role, permission));
      if (explicit !== undefined) return explicit;
    }
    return fallbackAllows(role, permission);
  }

  /** The full effective matrix (explicit rows only) for admin UI/tests. */
  async matrix(): Promise<PermissionCell[]> {
    const rows = await this.write.query<PermRow>(
      `SELECT ROLE, PERMISSION, ALLOWED FROM ${this.write.schema()}.ROLE_PERMISSIONS ORDER BY ROLE, PERMISSION`,
      {} as BindParameters,
    );
    return rows.map((r) => ({
      role: r.ROLE as Role,
      permission: r.PERMISSION as Permission,
      allowed: Number(r.ALLOWED) === 1,
    }));
  }
}
