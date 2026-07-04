import { Inject, Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import {
  InvalidCredentialsError,
  PasswordReuseError,
} from '../../../shared/errors/domain-error';
import { AuthUser, AuthUserView, toView } from '../domain/user.entity';
import {
  UserRepository,
  USER_REPOSITORY,
} from '../domain/user-repository.port';
import { TokenService } from './token.service';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: AuthUserView;
}

/**
 * AuthService — credential verification + JWT issuance.
 * Uses constant-time bcrypt compare; identical error for unknown user vs bad
 * password (no user enumeration — STANDARDS/07 §A07).
 */
@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    private readonly tokens: TokenService,
  ) {}

  async login(username: string, password: string): Promise<LoginResult> {
    const user = await this.users.findByUsername(username);
    // Always run a bcrypt compare to avoid timing-based enumeration.
    const hash =
      user?.passwordHash ??
      '$2a$10$0000000000000000000000000000000000000000000000000000u';
    const ok = await bcrypt.compare(password, hash);
    if (!user || !ok) {
      throw new InvalidCredentialsError('Invalid username or password');
    }
    return this.issue(user);
  }

  async refresh(refreshToken: string): Promise<LoginResult> {
    let claims;
    try {
      claims = this.tokens.verify(refreshToken);
    } catch {
      throw new InvalidCredentialsError('Invalid or expired refresh token');
    }
    if (claims.typ !== 'refresh') {
      throw new InvalidCredentialsError('Not a refresh token');
    }
    const user = await this.users.findById(claims.sub);
    if (!user) {
      throw new InvalidCredentialsError('User no longer active');
    }
    return this.issue(user);
  }

  async me(userId: number): Promise<AuthUserView | null> {
    const user = await this.users.findById(userId);
    return user ? toView(user) : null;
  }

  /**
   * POSS004 تغيير كلمة السر — verify the CURRENT password, then persist a new
   * bcrypt hash (cost 12) for the authenticated user. The new password must
   * differ from the old one (mirrors the Onyx screen's confirm+change flow).
   */
  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<AuthUserView> {
    const user = await this.users.findById(userId);
    // Constant-time compare even for a missing user (no enumeration).
    const hash =
      user?.passwordHash ??
      '$2a$10$0000000000000000000000000000000000000000000000000000u';
    const ok = await bcrypt.compare(oldPassword, hash);
    if (!user || !ok) {
      throw new InvalidCredentialsError('Current password is incorrect');
    }
    if (oldPassword === newPassword) {
      throw new PasswordReuseError(
        'New password must differ from the current password',
      );
    }
    const newHash = await bcrypt.hash(newPassword, 12);
    await this.users.updatePassword(user.id, newHash);
    return toView(user);
  }

  private issue(user: AuthUser): LoginResult {
    const base = {
      sub: user.id,
      username: user.username,
      role: user.role,
      branchNo: user.branchNo,
    };
    return {
      accessToken: this.tokens.signAccess(base),
      refreshToken: this.tokens.signRefresh(base),
      user: toView(user),
    };
  }
}
