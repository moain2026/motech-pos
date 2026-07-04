import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { readFile, rename, writeFile } from 'node:fs/promises';
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
  /** Resolved seed-file path (set on init); null when the file was absent. */
  private filePath: string | null = null;
  /** Serializes writes so concurrent password changes never interleave. */
  private writeChain: Promise<void> = Promise.resolve();

  constructor(private readonly config: TypedConfigService) {}

  async onModuleInit(): Promise<void> {
    const file = this.config.get('AUTH_USERS_FILE');
    const path = isAbsolute(file) ? file : resolve(process.cwd(), file);
    this.filePath = path;
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

  /**
   * Persist a new bcrypt hash for one user — updates the in-memory maps AND
   * atomically rewrites AUTH_USERS_FILE (tmp + rename, mode 0600) so the
   * change survives restarts. Writes are serialized via a promise chain.
   */
  async updatePassword(id: number, passwordHash: string): Promise<void> {
    const user = this.byId.get(id);
    if (!user) {
      throw new Error(`updatePassword: user ${id} not found`);
    }
    const updated: AuthUser = { ...user, passwordHash };
    this.byId.set(id, updated);
    this.byUsername.set(updated.username.toLowerCase(), updated);

    const run = this.writeChain.then(() => this.flushToFile());
    // Keep the chain alive even if this write fails.
    this.writeChain = run.catch(() => undefined);
    await run;
  }

  /** Atomic write-back of ALL users to the seed file (0600, tmp + rename). */
  private async flushToFile(): Promise<void> {
    if (!this.filePath) {
      throw new Error(
        'AUTH_USERS_FILE was not loaded at boot — cannot persist password change',
      );
    }
    const users = [...this.byId.values()].sort((a, b) => a.id - b.id);
    const json = JSON.stringify(users, null, 2) + '\n';
    const tmp = `${this.filePath}.tmp`;
    await writeFile(tmp, json, { encoding: 'utf8', mode: 0o600 });
    await rename(tmp, this.filePath);
    this.logger.log(`Persisted ${users.length} user(s) to ${this.filePath}`);
  }
}
