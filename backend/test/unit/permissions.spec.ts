import { describe, expect, it } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from '../../src/modules/auth/application/permissions.service';
import { PermissionsGuard } from '../../src/modules/auth/presentation/permissions.guard';
import { PERMISSION_KEY } from '../../src/modules/auth/presentation/require-permission.decorator';
import { fallbackAllows } from '../../src/modules/auth/domain/permission';
import type { OracleWriteService } from '../../src/infrastructure/oracle/oracle-write.service';

//============================================================================
// fallbackAllows — the safe coarse defaults (used when matrix is unavailable)
//============================================================================

describe('fallbackAllows (coarse RBAC defaults)', () => {
  it('admin may do everything', () => {
    expect(fallbackAllows('admin', 'SETTINGS')).toBe(true);
    expect(fallbackAllows('admin', 'VOID')).toBe(true);
    expect(fallbackAllows('admin', 'PRICE_OVERRIDE')).toBe(true);
  });
  it('non-admins are denied the sensitive actions by default', () => {
    expect(fallbackAllows('cashier', 'SETTINGS')).toBe(false);
    expect(fallbackAllows('supervisor', 'SETTINGS')).toBe(false);
    expect(fallbackAllows('cashier', 'PRICE_OVERRIDE')).toBe(false);
    expect(fallbackAllows('cashier', 'VOID')).toBe(false);
  });
  it('everyone gets the ordinary actions by default', () => {
    expect(fallbackAllows('cashier', 'SALE')).toBe(true);
    expect(fallbackAllows('cashier', 'RETURN')).toBe(true);
    expect(fallbackAllows('supervisor', 'VOID')).toBe(true);
  });
});

//============================================================================
// PermissionsService — matrix cache + fallback
//============================================================================

/** A fake OracleWriteService returning a controllable ROLE_PERMISSIONS set. */
function fakeWrite(
  rows: Array<{ ROLE: string; PERMISSION: string; ALLOWED: number }> | Error,
): OracleWriteService {
  return {
    schema: () => 'MOTECH_POS',
    query: () => (rows instanceof Error ? Promise.reject(rows) : Promise.resolve(rows)),
  } as unknown as OracleWriteService;
}

describe('PermissionsService', () => {
  it('honours an explicit matrix row (deny overrides the coarse allow)', async () => {
    const svc = new PermissionsService(
      fakeWrite([{ ROLE: 'cashier', PERMISSION: 'DISCOUNT', ALLOWED: 0 }]),
    );
    // Coarse default would allow DISCOUNT; the explicit matrix denies it.
    expect(await svc.can('cashier', 'DISCOUNT')).toBe(false);
  });

  it('honours an explicit grant (allow beyond coarse default)', async () => {
    const svc = new PermissionsService(
      fakeWrite([{ ROLE: 'cashier', PERMISSION: 'SETTINGS', ALLOWED: 1 }]),
    );
    expect(await svc.can('cashier', 'SETTINGS')).toBe(true);
  });

  it('falls back to coarse defaults for pairs missing from the matrix', async () => {
    const svc = new PermissionsService(fakeWrite([]));
    expect(await svc.can('cashier', 'SETTINGS')).toBe(false); // coarse deny
    expect(await svc.can('admin', 'SETTINGS')).toBe(true); // coarse allow
  });

  it('falls back safely when the matrix DB read fails', async () => {
    const svc = new PermissionsService(fakeWrite(new Error('DB down')));
    expect(await svc.can('cashier', 'SETTINGS')).toBe(false);
    expect(await svc.can('admin', 'REPORTS')).toBe(true);
  });
});

//============================================================================
// PermissionsGuard — request-time enforcement
//============================================================================

function ctxFor(role: string | undefined, required: string | undefined): {
  ctx: ExecutionContext;
  reflector: Reflector;
} {
  const reflector = {
    getAllAndOverride: (key: string) =>
      key === PERMISSION_KEY ? required : undefined,
  } as unknown as Reflector;
  const ctx = {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => ({ user: role ? { role } : undefined }) }),
  } as unknown as ExecutionContext;
  return { ctx, reflector };
}

describe('PermissionsGuard', () => {
  it('passes routes without @RequirePermission', async () => {
    const { ctx, reflector } = ctxFor('cashier', undefined);
    const guard = new PermissionsGuard(reflector, {
      can: () => Promise.resolve(false),
    } as unknown as PermissionsService);
    expect(await guard.canActivate(ctx)).toBe(true);
  });

  it('allows when the matrix grants the permission', async () => {
    const { ctx, reflector } = ctxFor('admin', 'SETTINGS');
    const guard = new PermissionsGuard(reflector, {
      can: () => Promise.resolve(true),
    } as unknown as PermissionsService);
    expect(await guard.canActivate(ctx)).toBe(true);
  });

  it('forbids when the matrix denies the permission', async () => {
    const { ctx, reflector } = ctxFor('cashier', 'SETTINGS');
    const guard = new PermissionsGuard(reflector, {
      can: () => Promise.resolve(false),
    } as unknown as PermissionsService);
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('forbids when no role is present', async () => {
    const { ctx, reflector } = ctxFor(undefined, 'SETTINGS');
    const guard = new PermissionsGuard(reflector, {
      can: () => Promise.resolve(true),
    } as unknown as PermissionsService);
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
