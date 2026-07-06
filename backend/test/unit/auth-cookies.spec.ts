import type { Response } from 'express';
import { describe, expect, it } from 'vitest';
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  clearAuthCookies,
  refreshCookiePath,
  setAuthCookies,
  ttlToMs,
} from '../../src/modules/auth/presentation/auth-cookies';
import { TokenService } from '../../src/modules/auth/application/token.service';
import {
  AuthenticatedRequest,
  JwtAuthGuard,
} from '../../src/modules/auth/presentation/jwt-auth.guard';
import { TypedConfigService } from '../../src/config/config.module';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

const CFG = {
  secure: true,
  apiPrefix: 'api/v1',
  accessTtl: '15m',
  refreshTtl: '7d',
};

/** Record res.cookie/clearCookie calls. */
function fakeRes() {
  const cookies: Array<{ name: string; value: string; opts: Record<string, unknown> }> = [];
  const cleared: Array<{ name: string; opts: Record<string, unknown> }> = [];
  const res = {
    cookie: (name: string, value: string, opts: Record<string, unknown>) => {
      cookies.push({ name, value, opts });
    },
    clearCookie: (name: string, opts: Record<string, unknown>) => {
      cleared.push({ name, opts });
    },
  } as unknown as Response;
  return { res, cookies, cleared };
}

describe('auth-cookies (httpOnly JWT hardening)', () => {
  it('ttlToMs parses s/m/h/d and rejects garbage', () => {
    expect(ttlToMs('30s')).toBe(30_000);
    expect(ttlToMs('15m')).toBe(900_000);
    expect(ttlToMs('12h')).toBe(43_200_000);
    expect(ttlToMs('7d')).toBe(604_800_000);
    expect(() => ttlToMs('soon')).toThrow(/Unsupported TTL/);
  });

  it('sets httpOnly Secure SameSite=Strict cookies with scoped paths', () => {
    const { res, cookies } = fakeRes();
    setAuthCookies(res, { accessToken: 'AT', refreshToken: 'RT' }, CFG);
    const at = cookies.find((c) => c.name === ACCESS_COOKIE)!;
    const rt = cookies.find((c) => c.name === REFRESH_COOKIE)!;
    expect(at.value).toBe('AT');
    expect(at.opts).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 900_000,
    });
    // Refresh cookie only ever travels to /auth/* — never regular endpoints.
    expect(rt.opts).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/api/v1/auth',
      maxAge: 604_800_000,
    });
    expect(refreshCookiePath('/api/v1/')).toBe('/api/v1/auth');
  });

  it('clears both cookies with matching paths on logout', () => {
    const { res, cleared } = fakeRes();
    clearAuthCookies(res, CFG);
    expect(cleared.map((c) => c.name).sort()).toEqual([ACCESS_COOKIE, REFRESH_COOKIE].sort());
    expect(cleared.find((c) => c.name === REFRESH_COOKIE)!.opts.path).toBe('/api/v1/auth');
  });
});

describe('JwtAuthGuard cookie support', () => {
  const config = {
    get: (k: string) =>
      ({
        JWT_SECRET: 'test-secret-at-least-16-chars-long-xx',
        JWT_ISSUER: 'motech-pos-test',
        JWT_ACCESS_TTL: '15m',
        JWT_REFRESH_TTL: '7d',
      })[k],
  } as unknown as TypedConfigService;
  const tokens = new TokenService(config);
  const guard = new JwtAuthGuard(tokens);
  const access = tokens.signAccess({ sub: 1, username: 'a', role: 'admin', branchNo: 1 });

  function ctx(req: Partial<AuthenticatedRequest>): ExecutionContext {
    return {
      switchToHttp: () => ({ getRequest: () => req }),
    } as unknown as ExecutionContext;
  }

  it('accepts a valid mp_at cookie when no Authorization header is present', () => {
    const req = {
      method: 'GET',
      headers: {},
      cookies: { [ACCESS_COOKIE]: access },
    } as unknown as AuthenticatedRequest;
    expect(guard.canActivate(ctx(req))).toBe(true);
    expect(req.user?.sub).toBe(1);
    expect(req.authVia).toBe('cookie');
  });

  it('prefers the Bearer header over the cookie (backward compatible)', () => {
    const req = {
      method: 'GET',
      headers: { authorization: `Bearer ${access}` },
      cookies: { [ACCESS_COOKIE]: 'garbage' },
    } as unknown as AuthenticatedRequest;
    expect(guard.canActivate(ctx(req))).toBe(true);
    expect(req.authVia).toBe('bearer');
  });

  it('rejects cookie-authed state-changing requests with cross-site fetch metadata (CSRF)', () => {
    const req = {
      method: 'POST',
      headers: { 'sec-fetch-site': 'cross-site' },
      cookies: { [ACCESS_COOKIE]: access },
    } as unknown as AuthenticatedRequest;
    expect(() => guard.canActivate(ctx(req))).toThrow(UnauthorizedException);
    // Same-origin passes.
    const ok = {
      method: 'POST',
      headers: { 'sec-fetch-site': 'same-origin' },
      cookies: { [ACCESS_COOKIE]: access },
    } as unknown as AuthenticatedRequest;
    expect(guard.canActivate(ctx(ok))).toBe(true);
  });

  it('still rejects when neither header nor cookie carries a token', () => {
    const req = { method: 'GET', headers: {}, cookies: {} } as unknown as AuthenticatedRequest;
    expect(() => guard.canActivate(ctx(req))).toThrow(UnauthorizedException);
  });

  it('rejects a refresh token presented via cookie as access', () => {
    const refresh = tokens.signRefresh({ sub: 1, username: 'a', role: 'admin', branchNo: 1 });
    const req = {
      method: 'GET',
      headers: {},
      cookies: { [ACCESS_COOKIE]: refresh },
    } as unknown as AuthenticatedRequest;
    expect(() => guard.canActivate(ctx(req))).toThrow(/Not an access token/);
  });
});
