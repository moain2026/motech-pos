import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { TypedConfigService } from '../../../config/config.module';
import { Role } from '../domain/user.entity';

export interface AccessClaims {
  sub: number;
  username: string;
  role: Role;
  branchNo: number;
  typ: 'access' | 'refresh';
}

/**
 * TokenService — issues and verifies JWTs (HS256).
 * Secret + TTLs come from validated env (STANDARDS/07: no secrets in code).
 */
@Injectable()
export class TokenService {
  private readonly secret: string;
  private readonly issuer: string;
  private readonly accessTtl: string;
  private readonly refreshTtl: string;

  constructor(config: TypedConfigService) {
    this.secret = config.get('JWT_SECRET');
    this.issuer = config.get('JWT_ISSUER');
    this.accessTtl = config.get('JWT_ACCESS_TTL');
    this.refreshTtl = config.get('JWT_REFRESH_TTL');
  }

  signAccess(payload: Omit<AccessClaims, 'typ'>): string {
    return jwt.sign({ ...payload, typ: 'access' }, this.secret, {
      issuer: this.issuer,
      expiresIn: this.accessTtl as jwt.SignOptions['expiresIn'],
    });
  }

  signRefresh(payload: Omit<AccessClaims, 'typ'>): string {
    return jwt.sign({ ...payload, typ: 'refresh' }, this.secret, {
      issuer: this.issuer,
      expiresIn: this.refreshTtl as jwt.SignOptions['expiresIn'],
    });
  }

  /** Verify a token; throws jwt errors on invalid/expired/wrong-issuer. */
  verify(token: string): AccessClaims {
    return jwt.verify(token, this.secret, {
      issuer: this.issuer,
    }) as unknown as AccessClaims;
  }
}
