import { describe, expect, it } from 'vitest';
import { LoginThrottleService } from '../../src/modules/auth/application/login-throttle.service';
import { TooManyLoginAttemptsError } from '../../src/shared/errors/domain-error';

const MIN = 60 * 1000;

describe('LoginThrottleService (§A07 brute-force cap)', () => {
  it('allows up to 5 failures, blocks the 6th attempt with 429 + retryAfter', () => {
    const th = new LoginThrottleService();
    const t0 = 1_000_000;
    for (let i = 0; i < 5; i++) {
      th.assertAllowed('admin', '1.2.3.4', t0 + i);
      th.recordFailure('admin', '1.2.3.4', t0 + i);
    }
    let err: unknown;
    try {
      th.assertAllowed('admin', '1.2.3.4', t0 + 5);
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(TooManyLoginAttemptsError);
    const meta = (err as TooManyLoginAttemptsError).meta;
    expect(typeof meta?.retryAfterSeconds).toBe('number');
    expect(meta?.retryAfterSeconds as number).toBeGreaterThan(0);
    expect(meta?.retryAfterSeconds as number).toBeLessThanOrEqual(15 * 60);
  });

  it('window expiry unblocks; counters are per username+IP', () => {
    const th = new LoginThrottleService();
    const t0 = 0;
    for (let i = 0; i < 5; i++) th.recordFailure('admin', '1.1.1.1', t0);
    // Blocked inside the window…
    expect(() => th.assertAllowed('admin', '1.1.1.1', t0 + MIN)).toThrow(
      TooManyLoginAttemptsError,
    );
    // …but a different IP and a different username are unaffected.
    expect(() => th.assertAllowed('admin', '2.2.2.2', t0 + MIN)).not.toThrow();
    expect(() =>
      th.assertAllowed('cashier1', '1.1.1.1', t0 + MIN),
    ).not.toThrow();
    // After the 15-minute window the key resets.
    expect(() =>
      th.assertAllowed('admin', '1.1.1.1', t0 + 15 * MIN),
    ).not.toThrow();
  });

  it('a successful login clears the failure counter', () => {
    const th = new LoginThrottleService();
    const t0 = 0;
    for (let i = 0; i < 4; i++) th.recordFailure('admin', '9.9.9.9', t0);
    th.recordSuccess('admin', '9.9.9.9');
    // Fresh window: 5 more failures allowed before blocking again.
    for (let i = 0; i < 5; i++) {
      th.assertAllowed('admin', '9.9.9.9', t0 + 1);
      th.recordFailure('admin', '9.9.9.9', t0 + 1);
    }
    expect(() => th.assertAllowed('admin', '9.9.9.9', t0 + 2)).toThrow(
      TooManyLoginAttemptsError,
    );
  });
});
