import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import bcrypt from 'bcryptjs';
import { describe, expect, it } from 'vitest';
import { TypedConfigService } from '../../src/config/config.module';
import { AuthService } from '../../src/modules/auth/application/auth.service';
import { LoginThrottleService } from '../../src/modules/auth/application/login-throttle.service';
import { TokenService } from '../../src/modules/auth/application/token.service';
import { AuthUser } from '../../src/modules/auth/domain/user.entity';
import { UserRepository } from '../../src/modules/auth/domain/user-repository.port';
import { RolesGuard } from '../../src/modules/auth/presentation/roles.guard';
import { ROLES_KEY } from '../../src/modules/auth/presentation/roles.decorator';

/** Minimal fake TypedConfigService for token tests. */
function fakeConfig(): TypedConfigService {
  const values: Record<string, string> = {
    JWT_SECRET: 'test-secret-at-least-16-chars-long-xx',
    JWT_ISSUER: 'motech-pos-test',
    JWT_ACCESS_TTL: '15m',
    JWT_REFRESH_TTL: '7d',
  };
  return { get: (k: string) => values[k] } as unknown as TypedConfigService;
}

/** In-memory user repo seeded with a bcrypt-hashed password. */
function fakeUserRepo(): UserRepository & { persisted: string[] } {
  const user: AuthUser = {
    id: 7,
    username: 'cashier1',
    passwordHash: bcrypt.hashSync('secret123', 10),
    role: 'cashier',
    displayName: 'Cashier One',
    branchNo: 1,
    active: true,
  };
  const persisted: string[] = [];
  return {
    persisted,
    findByUsername: async (u) =>
      u.toLowerCase() === user.username ? user : null,
    findById: async (id) => (id === user.id ? user : null),
    updatePassword: async (id, hash) => {
      if (id !== user.id) throw new Error('unknown user');
      user.passwordHash = hash;
      persisted.push(hash);
    },
  };
}

describe('TokenService', () => {
  const tokens = new TokenService(fakeConfig());

  it('signs and verifies an access token round-trip', () => {
    const t = tokens.signAccess({
      sub: 1,
      username: 'a',
      role: 'admin',
      branchNo: 1,
    });
    const claims = tokens.verify(t);
    expect(claims.sub).toBe(1);
    expect(claims.role).toBe('admin');
    expect(claims.typ).toBe('access');
  });

  it('tags refresh tokens with typ=refresh', () => {
    const t = tokens.signRefresh({
      sub: 2,
      username: 'b',
      role: 'cashier',
      branchNo: 1,
    });
    expect(tokens.verify(t).typ).toBe('refresh');
  });

  it('rejects a tampered token', () => {
    const t = tokens.signAccess({
      sub: 1,
      username: 'a',
      role: 'admin',
      branchNo: 1,
    });
    expect(() => tokens.verify(t + 'x')).toThrow();
  });
});

describe('AuthService', () => {
  const svc = new AuthService(fakeUserRepo(), new TokenService(fakeConfig()), new LoginThrottleService());

  it('logs in with correct credentials and issues tokens', async () => {
    const res = await svc.login('cashier1', 'secret123');
    expect(res.user.username).toBe('cashier1');
    expect(res.user.role).toBe('cashier');
    expect(res.accessToken.length).toBeGreaterThan(20);
    expect(res.refreshToken.length).toBeGreaterThan(20);
  });

  it('rejects a wrong password with InvalidCredentialsError', async () => {
    await expect(svc.login('cashier1', 'nope')).rejects.toThrow(
      /Invalid username or password/,
    );
  });

  it('rejects an unknown user (no enumeration difference)', async () => {
    await expect(svc.login('ghost', 'whatever')).rejects.toThrow(
      /Invalid username or password/,
    );
  });

  it('refreshes a valid refresh token into new tokens', async () => {
    const login = await svc.login('cashier1', 'secret123');
    const refreshed = await svc.refresh(login.refreshToken);
    expect(refreshed.user.id).toBe(7);
    expect(refreshed.accessToken.length).toBeGreaterThan(20);
  });

  it('rejects using an access token as a refresh token', async () => {
    const login = await svc.login('cashier1', 'secret123');
    await expect(svc.refresh(login.accessToken)).rejects.toThrow();
  });
});

describe('AuthService.changePassword (POSS004)', () => {
  it('changes the password: old stops working, new works, hash is bcrypt-12', async () => {
    const repo = fakeUserRepo();
    const svc2 = new AuthService(repo, new TokenService(fakeConfig()), new LoginThrottleService());
    const res = await svc2.changePassword(7, 'secret123', 'NewPass456!');
    expect(res.username).toBe('cashier1');
    expect(repo.persisted).toHaveLength(1);
    // bcrypt cost 12 encoded in the hash prefix.
    expect(repo.persisted[0]).toMatch(/^\$2[aby]\$12\$/);
    await expect(svc2.login('cashier1', 'secret123')).rejects.toThrow(
      /Invalid username or password/,
    );
    const login = await svc2.login('cashier1', 'NewPass456!');
    expect(login.user.id).toBe(7);
  });

  it('rejects a wrong current password (401, no persist)', async () => {
    const repo = fakeUserRepo();
    const svc2 = new AuthService(repo, new TokenService(fakeConfig()), new LoginThrottleService());
    await expect(
      svc2.changePassword(7, 'wrong-old', 'NewPass456!'),
    ).rejects.toThrow(/Current password is incorrect/);
    expect(repo.persisted).toHaveLength(0);
  });

  it('rejects reusing the same password (422)', async () => {
    const repo = fakeUserRepo();
    const svc2 = new AuthService(repo, new TokenService(fakeConfig()), new LoginThrottleService());
    await expect(
      svc2.changePassword(7, 'secret123', 'secret123'),
    ).rejects.toThrow(/must differ/);
    expect(repo.persisted).toHaveLength(0);
  });

  it('rejects an unknown user id with invalid-credentials', async () => {
    const repo = fakeUserRepo();
    const svc2 = new AuthService(repo, new TokenService(fakeConfig()), new LoginThrottleService());
    await expect(
      svc2.changePassword(999, 'secret123', 'NewPass456!'),
    ).rejects.toThrow(/Current password is incorrect/);
  });
});

describe('RolesGuard', () => {
  function ctx(role: string | undefined, required: string[] | undefined) {
    const reflector = {
      getAllAndOverride: () => required,
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    const execCtx = {
      getHandler: () => undefined,
      getClass: () => undefined,
      switchToHttp: () => ({
        getRequest: () => ({ user: role ? { role } : undefined }),
      }),
    } as unknown as ExecutionContext;
    return { guard, execCtx };
  }

  it('allows when no roles required', () => {
    const { guard, execCtx } = ctx('cashier', undefined);
    expect(guard.canActivate(execCtx)).toBe(true);
  });

  it('allows when user role is in required set', () => {
    const { guard, execCtx } = ctx('supervisor', ['supervisor', 'admin']);
    expect(guard.canActivate(execCtx)).toBe(true);
  });

  it('forbids when user role is not allowed', () => {
    const { guard, execCtx } = ctx('cashier', ['admin']);
    expect(() => guard.canActivate(execCtx)).toThrow(/Insufficient role/);
  });

  it('uses the ROLES_KEY metadata key', () => {
    expect(ROLES_KEY).toBe('roles');
  });
});
