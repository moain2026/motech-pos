import { Injectable, Logger } from '@nestjs/common';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { Role } from '../../auth/domain/user.entity';

/**
 * PricePolicyService — decides whether an actor may OVERRIDE the canonical
 * server-side price/VAT of an item (security fix for the free-price exploit:
 * a cashier could previously sell any item at 0.01 by sending `unitPrice`).
 *
 * Source of truth: MOTECH_POS.ROLE_PERMISSIONS (PERMISSION = 'PRICE_OVERRIDE'),
 * the same matrix managed by the admin screen. Results are cached briefly to
 * avoid a DB round-trip per sale line.
 *
 * Fail-safe: if the matrix cannot be read, only supervisor/admin may override
 * (mirrors the seeded matrix; never silently grants cashier the permission).
 */
@Injectable()
export class PricePolicyService {
  private readonly logger = new Logger(PricePolicyService.name);
  private cache: { at: number; allowed: Set<string> } | null = null;
  private static readonly TTL_MS = 60_000;

  constructor(private readonly write: OracleWriteService) {}

  /** May this role override the reference price / VAT of a sale line? */
  async canOverridePrice(role: Role | undefined): Promise<boolean> {
    if (!role) return false;
    const allowed = await this.allowedRoles();
    return allowed.has(role);
  }

  private async allowedRoles(): Promise<Set<string>> {
    const now = Date.now();
    if (this.cache && now - this.cache.at < PricePolicyService.TTL_MS) {
      return this.cache.allowed;
    }
    try {
      const rows = await this.write.query<{ ROLE: string }>(
        `SELECT ROLE FROM ${this.write.schema()}.ROLE_PERMISSIONS
         WHERE PERMISSION = 'PRICE_OVERRIDE' AND ALLOWED = 1`,
      );
      const allowed = new Set(rows.map((r) => String(r.ROLE)));
      this.cache = { at: now, allowed };
      return allowed;
    } catch (err) {
      this.logger.error(
        { err },
        'ROLE_PERMISSIONS lookup failed — falling back to supervisor/admin only',
      );
      return new Set(['supervisor', 'admin']);
    }
  }
}
