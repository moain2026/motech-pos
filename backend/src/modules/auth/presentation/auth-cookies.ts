import type { CookieOptions, Response } from 'express';

/**
 * httpOnly auth cookies (XSS hardening — STANDARDS/07 §A07).
 *
 * Tokens are ALSO returned in the response body for backward compatibility
 * (older clients / direct API consumers use `Authorization: Bearer`), but the
 * web frontend no longer persists them to localStorage — the browser keeps
 * them only in these httpOnly cookies, unreachable from JavaScript.
 *
 * - `mp_at` (access):  path=/           — sent with every API call.
 * - `mp_rt` (refresh): path=<prefix>/auth — sent ONLY to /auth/* (refresh &
 *   logout), never leaks to regular endpoints.
 * - SameSite=Strict: the browser refuses to attach them to any cross-site
 *   request (primary CSRF defence; see also the Sec-Fetch-Site check in
 *   JwtAuthGuard for defence-in-depth).
 */
export const ACCESS_COOKIE = 'mp_at';
export const REFRESH_COOKIE = 'mp_rt';

/** Parse a JWT-style TTL ('15m', '7d', '12h', '30s') into milliseconds. */
export function ttlToMs(ttl: string): number {
  const m = /^(\d+)([smhd])$/.exec(ttl.trim());
  if (!m) {
    throw new Error(`Unsupported TTL format: ${ttl}`);
  }
  const n = Number(m[1]);
  const unit = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 }[
    m[2] as 's' | 'm' | 'h' | 'd'
  ];
  return n * unit;
}

export interface AuthCookieConfig {
  /** Secure flag — on in production (TLS via Caddy). */
  secure: boolean;
  /** Global API prefix, e.g. 'api/v1' (scopes the refresh cookie path). */
  apiPrefix: string;
  accessTtl: string;
  refreshTtl: string;
}

function baseOptions(cfg: AuthCookieConfig): CookieOptions {
  return {
    httpOnly: true,
    secure: cfg.secure,
    sameSite: 'strict',
  };
}

/** Path that scopes the refresh cookie to the auth endpoints only. */
export function refreshCookiePath(apiPrefix: string): string {
  return `/${apiPrefix.replace(/^\/|\/$/g, '')}/auth`;
}

/** Set both auth cookies after a successful login/refresh. */
export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
  cfg: AuthCookieConfig,
): void {
  res.cookie(ACCESS_COOKIE, tokens.accessToken, {
    ...baseOptions(cfg),
    path: '/',
    maxAge: ttlToMs(cfg.accessTtl),
  });
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...baseOptions(cfg),
    path: refreshCookiePath(cfg.apiPrefix),
    maxAge: ttlToMs(cfg.refreshTtl),
  });
}

/** Clear both auth cookies (logout). Options must match the set call. */
export function clearAuthCookies(res: Response, cfg: AuthCookieConfig): void {
  res.clearCookie(ACCESS_COOKIE, { ...baseOptions(cfg), path: '/' });
  res.clearCookie(REFRESH_COOKIE, {
    ...baseOptions(cfg),
    path: refreshCookiePath(cfg.apiPrefix),
  });
}
