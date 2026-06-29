import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AccessClaims, TokenService } from '../application/token.service';

/** Authenticated request shape (claims attached by the guard). */
export interface AuthenticatedRequest extends Request {
  user?: AccessClaims;
}

/**
 * JwtAuthGuard — requires a valid `Authorization: Bearer <access JWT>`.
 * Attaches verified claims to `req.user`. Rejects refresh tokens.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly tokens: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }
    const token = header.slice('Bearer '.length).trim();
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
    return true;
  }
}
