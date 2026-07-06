import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AccessClaims, TokenService } from '../application/token.service';
import { ACCESS_COOKIE } from './auth-cookies';

/** Authenticated request shape (claims attached by the guard). */
export interface AuthenticatedRequest extends Request {
  user?: AccessClaims;
  /** How the request authenticated — 'bearer' header or httpOnly cookie. */
  authVia?: 'bearer' | 'cookie';
}

/** Methods that can mutate state — cookie auth gets a CSRF check on these. */
const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * JwtAuthGuard — requires a valid access JWT via `Authorization: Bearer`
 * (primary, backward-compatible) or the `mp_at` httpOnly cookie (web client,
 * XSS-hardened). Attaches verified claims to `req.user`. Rejects refresh
 * tokens.
 *
 * CSRF defence for the cookie path (Bearer is immune by construction):
 * 1. The cookie is SameSite=Strict — browsers never attach it cross-site.
 * 2. Defence-in-depth: on state-changing methods, if the browser supplied a
 *    `Sec-Fetch-Site` fetch-metadata header it must be same-origin/none.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly tokens: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = req.headers.authorization;
    let token: string | undefined;
    let via: 'bearer' | 'cookie';
    if (header?.startsWith('Bearer ')) {
      token = header.slice('Bearer '.length).trim();
      via = 'bearer';
    } else {
      const cookies = (req as { cookies?: Record<string, string> }).cookies;
      token = cookies?.[ACCESS_COOKIE];
      via = 'cookie';
    }
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }
    if (via === 'cookie' && UNSAFE_METHODS.has(req.method)) {
      const site = req.headers['sec-fetch-site'];
      if (typeof site === 'string' && site !== 'same-origin' && site !== 'none') {
        throw new UnauthorizedException('Cross-site request rejected');
      }
    }
    let claims: AccessClaims;
    try {
      claims = this.tokens.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    if (claims.typ !== 'access') {
      throw new UnauthorizedException('Not an access token');
    }
    req.user = claims;
    req.authVia = via;
    return true;
  }
}
