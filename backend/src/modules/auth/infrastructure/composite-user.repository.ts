import { Injectable } from '@nestjs/common';
import { AuthUser } from '../domain/user.entity';
import { UserRepository } from '../domain/user-repository.port';
import { LocalUserRepository } from './local-user.repository';
import { OracleUserRepository } from './oracle-user.repository';

/**
 * CompositeUserRepository — tries the local bcrypt store first (our own
 * strong accounts: admin/cashier1/supervisor1), then falls back to the real
 * Onyx USER_R table so existing Onyx operators can sign in unchanged.
 *
 * Same UserRepository port — application/presentation layers are untouched.
 */
@Injectable()
export class CompositeUserRepository implements UserRepository {
  constructor(
    private readonly local: LocalUserRepository,
    private readonly oracle: OracleUserRepository,
  ) {}

  async findByUsername(username: string): Promise<AuthUser | null> {
    const local = await this.local.findByUsername(username);
    if (local) return local;
    return this.oracle.findByUsername(username);
  }

  async findById(id: number): Promise<AuthUser | null> {
    // Onyx ids are offset to >= 900000 by OracleUserRepository.
    if (id >= 900000) return this.oracle.findById(id);
    return this.local.findById(id);
  }

  async updatePassword(id: number, passwordHash: string): Promise<void> {
    // Only local accounts support password change (POSS004).
    if (id >= 900000) {
      throw new Error('Onyx users are read-only; change password in Onyx');
    }
    return this.local.updatePassword(id, passwordHash);
  }
}
