import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { isAbsolute, resolve } from 'node:path';
import { TypedConfigService } from '../../../config/config.module';
import { AuthUser, isRole } from '../domain/user.entity';
import { UserRepository } from '../domain/user-repository.port';

/**
 * LocalUserRepository — TEMPORARY app-owned user store.
 *
 * Loads users (with bcrypt-hashed passwords) from a JSON seed file at boot.
 * This exists because the real Onyx user tables live in the absent IAS202623
 * schema and YSPOS23 is strictly READ-ONLY (see user.entity.ts header).
 *
 * When the real user schema + DECRYPT_PASS routine become reachable, swap
 * this adapter for an OracleUserRepository behind the same port — no change
 * to the application/presentation layers.
 */
@Injectable()
export class LocalUserRepository implements UserRepository, OnModuleInit {
  private readonly logger = new Logger(LocalUserRepository.name);
  private byUsername = new Map<string, AuthUser>();
  private byId = new Map<number, AuthUser>();

  constructor(private readonly config: TypedConfigService) {}

  async onModuleInit(): Promise<void> {
    const file = this.config.get('AUTH_USERS_FILE');
    const path = isAbsolute(file) ? file : resolve(process.cwd(), file);
    let raw: string;
    try {
      raw = await readFile(path, 'utf8');
    } catch {
      this.logger.warn(
        `AUTH_USERS_FILE not found at ${path}; auth will reject all logins until a seed is provided`,
      );
      return;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error(`AUTH_USERS_FILE ${path} must contain a JSON array`);
    }
    let loaded = 0;
    for (const entry of parsed) {
      const u = this.coerce(entry);
      if (!u) continue;
      this.byUsername.set(u.username.toLowerCase(), u);
      this.byId.set(u.id, u);
      loaded += 1;
    }
    this.logger.log(`Loaded ${loaded} local user(s) from ${path}`);
  }

  private coerce(entry: unknown): AuthUser | null {
    if (typeof entry !== 'object' || entry === null) return null;
    const e = entry as Record<string, unknown>;
    if (
      typeof e.id !== 'number' ||
      typeof e.username !== 'string' ||
      typeof e.passwordHash !== 'string' ||
      !isRole(e.role)
    ) {
      this.logger.warn(`Skipping malformed user entry: ${JSON.stringify(e.username)}`);
      return null;
    }
    return {
      id: e.id,
      username: e.username,
      passwordHash: e.passwordHash,
      role: e.role,
      displayName: typeof e.displayName === 'string' ? e.displayName : e.username,
      branchNo: typeof e.branchNo === 'number' ? e.branchNo : 0,
      active: e.active !== false,
    };
  }

  async findByUsername(username: string): Promise<AuthUser | null> {
    const u = this.byUsername.get(username.trim().toLowerCase());
    return u && u.active ? u : null;
  }

  async findById(id: number): Promise<AuthUser | null> {
    const u = this.byId.get(id);
    return u && u.active ? u : null;
  }
}
