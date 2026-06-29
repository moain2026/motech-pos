import { AuthUser } from './user.entity';

/** DI token for the UserRepository port. */
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepository {
  /** Find an active user by username (case-insensitive), or null. */
  findByUsername(username: string): Promise<AuthUser | null>;

  /** Find an active user by id, or null. */
  findById(id: number): Promise<AuthUser | null>;
}
