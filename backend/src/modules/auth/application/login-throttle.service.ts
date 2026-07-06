import { Injectable } from '@nestjs/common';
import { TooManyLoginAttemptsError } from '../../../shared/errors/domain-error';

/**
 * LoginThrottleService — brute-force protection for /auth/login
 * (STANDARDS/07 §A07 Identification & Authentication Failures).
 *
 * In-memory fixed-window throttle keyed by `username|ip`:
 *   - up to MAX_ATTEMPTS failed attempts inside WINDOW_MS,
 *   - further attempts are rejected with RFC 9457 429
 *     `too-many-login-attempts` until the window expires,
 *   - a successful login clears the counter for that key.
 *
 * In-memory is intentional: single-process pm2 deployment, and bcrypt cost 12
 * already makes each attempt ~100ms — the throttle turns "slow" into "capped".
 * Entries are pruned lazily on access, and a periodic sweep caps memory.
 */
@Injectable()
export class LoginThrottleService {
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes

  private readonly attempts = new Map<
    string,
    { count: number; windowStart: number }
  >();

  /** Throws TooManyLoginAttemptsError when the key is currently blocked. */
  assertAllowed(username: string, ip: string, now = Date.now()): void {
    const key = this.key(username, ip);
    const entry = this.attempts.get(key);
    if (!entry) return;
    if (now - entry.windowStart >= LoginThrottleService.WINDOW_MS) {
      this.attempts.delete(key);
      return;
    }
    if (entry.count >= LoginThrottleService.MAX_ATTEMPTS) {
      const retryAfterSec = Math.ceil(
        (entry.windowStart + LoginThrottleService.WINDOW_MS - now) / 1000,
      );
      throw new TooManyLoginAttemptsError(
        'Too many failed login attempts — try again later',
        { retryAfterSeconds: retryAfterSec },
      );
    }
  }

  /** Record a FAILED attempt (called after credential rejection). */
  recordFailure(username: string, ip: string, now = Date.now()): void {
    const key = this.key(username, ip);
    const entry = this.attempts.get(key);
    if (!entry || now - entry.windowStart >= LoginThrottleService.WINDOW_MS) {
      this.attempts.set(key, { count: 1, windowStart: now });
      return;
    }
    entry.count += 1;
    // Opportunistic sweep so the map cannot grow unbounded under scan attacks.
    if (this.attempts.size > 10_000) this.sweep(now);
  }

  /** Clear the counter after a successful login. */
  recordSuccess(username: string, ip: string): void {
    this.attempts.delete(this.key(username, ip));
  }

  private key(username: string, ip: string): string {
    return `${username.toLowerCase().trim()}|${ip}`;
  }

  private sweep(now: number): void {
    for (const [k, v] of this.attempts) {
      if (now - v.windowStart >= LoginThrottleService.WINDOW_MS) {
        this.attempts.delete(k);
      }
    }
  }
}
