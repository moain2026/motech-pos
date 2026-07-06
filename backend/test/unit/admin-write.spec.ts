import { describe, expect, it } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AdminWriteService } from '../../src/modules/admin/application/admin-write.service';
import {
  AdminRepository,
  MachineRow,
  SessionRow,
  SessionsFilter,
  UserRow,
} from '../../src/modules/admin/domain/ports/admin-repository.port';
import {
  AdminWriteRepository,
  MachineOverlayRow,
  RolePermission,
  UpsertMachineOverlay,
  UpsertUserOverlay,
  UserOverlayRow,
} from '../../src/modules/admin/domain/ports/admin-write-repository.port';

//============================================================================
// Fakes
//============================================================================

class FakeReads implements AdminRepository {
  listMachines(): Promise<MachineRow[]> {
    return Promise.resolve([
      {
        machineNo: 1,
        terminal: 'SERVER3',
        inactive: false,
        defWarehouse: 2,
        defBranch: 1,
        ipAddress: null,
        lastBillDate: '2026-05-17',
        useVat: true,
        priceLevel: 1,
      },
    ]);
  }

  listUsers(): Promise<UserRow[]> {
    return Promise.resolve([
      {
        userId: 1,
        arabicName: 'مدير النظام',
        englishName: 'Administrator',
        code: 'ADMIN',
        inactive: false,
        isAdmin: true,
        userType: 0,
        loggedOn: false,
        locked: false,
        email: null,
      },
    ]);
  }

  listSessions(_f: SessionsFilter): Promise<SessionRow[]> {
    return Promise.resolve([]);
  }
}

class FakeWrites implements AdminWriteRepository {
  users = new Map<number, UserOverlayRow>();
  machines = new Map<number, MachineOverlayRow>();
  perms = new Map<string, RolePermission>();
  lastUpdatedBy: number | null | undefined;

  listUserOverlays(): Promise<UserOverlayRow[]> {
    return Promise.resolve([...this.users.values()]);
  }

  getUserOverlay(userId: number): Promise<UserOverlayRow | null> {
    return Promise.resolve(this.users.get(userId) ?? null);
  }

  upsertUserOverlay(input: UpsertUserOverlay): Promise<UserOverlayRow> {
    const prev = this.users.get(input.userId);
    const row: UserOverlayRow = {
      id: prev?.id ?? `id-${input.userId}`,
      userId: input.userId,
      origin: prev?.origin ?? input.origin,
      arName: input.arName ?? prev?.arName ?? null,
      enName: input.enName ?? prev?.enName ?? null,
      code: input.code ?? prev?.code ?? null,
      role: input.role ?? prev?.role ?? null,
      email: input.email ?? prev?.email ?? null,
      authUsername: input.authUsername ?? prev?.authUsername ?? null,
      inactive: input.inactive ?? prev?.inactive ?? false,
    };
    this.users.set(input.userId, row);
    return Promise.resolve(row);
  }

  nextLocalUserId(): Promise<number> {
    const ids = [...this.users.keys()].filter((k) => k >= 9000);
    return Promise.resolve(ids.length === 0 ? 9000 : Math.max(...ids) + 1);
  }

  listMachineOverlays(): Promise<MachineOverlayRow[]> {
    return Promise.resolve([...this.machines.values()]);
  }

  getMachineOverlay(no: number): Promise<MachineOverlayRow | null> {
    return Promise.resolve(this.machines.get(no) ?? null);
  }

  upsertMachineOverlay(input: UpsertMachineOverlay): Promise<MachineOverlayRow> {
    const prev = this.machines.get(input.machineNo);
    const row: MachineOverlayRow = {
      id: prev?.id ?? `m-${input.machineNo}`,
      machineNo: input.machineNo,
      origin: prev?.origin ?? input.origin,
      terminal: input.terminal ?? prev?.terminal ?? null,
      branchNo: input.branchNo ?? prev?.branchNo ?? null,
      warehouse: input.warehouse ?? prev?.warehouse ?? null,
      ipAddress: input.ipAddress ?? prev?.ipAddress ?? null,
      priceLevel: input.priceLevel ?? prev?.priceLevel ?? null,
      useVat: input.useVat ?? prev?.useVat ?? null,
      currency: input.currency ?? prev?.currency ?? null,
      inactive: input.inactive ?? prev?.inactive ?? false,
    };
    this.machines.set(input.machineNo, row);
    return Promise.resolve(row);
  }

  listPermissions(): Promise<RolePermission[]> {
    return Promise.resolve([...this.perms.values()]);
  }

  setPermissions(
    entries: RolePermission[],
    updatedBy: number | null,
  ): Promise<number> {
    this.lastUpdatedBy = updatedBy;
    for (const e of entries) this.perms.set(`${e.role}:${e.permission}`, e);
    return Promise.resolve(entries.length);
  }
}

function makeService() {
  const writes = new FakeWrites();
  // Fake PermissionsService: only invalidate() is exercised by the service.
  const permissions = { invalidate: () => {} } as unknown as import(
    '../../src/modules/auth/application/permissions.service'
  ).PermissionsService;
  const svc = new AdminWriteService(new FakeReads(), writes, permissions);
  return { svc, writes };
}

//============================================================================
// Users
//============================================================================

describe('AdminWriteService — users', () => {
  it('creates a LOCAL user with an auto-assigned id >= 9000', async () => {
    const { svc } = makeService();
    const u = await svc.createUser({ role: 'cashier', arName: 'كاشير جديد' });
    expect(u.userId).toBe(9000);
    expect(u.origin).toBe('LOCAL');
    expect(u.role).toBe('cashier');
    expect(u.arabicName).toBe('كاشير جديد');
    expect(u.inactive).toBe(false);
  });

  it('rejects creating a user whose id exists in the ERP', async () => {
    const { svc } = makeService();
    await expect(
      svc.createUser({ userId: 1, role: 'admin' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects duplicate overlay creates', async () => {
    const { svc } = makeService();
    await svc.createUser({ userId: 9500, role: 'cashier' });
    await expect(
      svc.createUser({ userId: 9500, role: 'cashier' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('edits an ERP user via an EDIT overlay (merge wins for edited fields)', async () => {
    const { svc, writes } = makeService();
    const u = await svc.updateUser(1, { enName: 'Renamed Admin', role: 'admin' });
    expect(u.origin).toBe('EDIT');
    expect(u.englishName).toBe('Renamed Admin');
    expect(u.arabicName).toBe('مدير النظام'); // untouched ERP field survives
    expect(writes.users.get(1)?.origin).toBe('EDIT');
  });

  it('404s when editing a user that exists nowhere', async () => {
    const { svc } = makeService();
    await expect(svc.updateUser(777, { enName: 'x' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('setUserStatus toggles INACTIVE (disable then enable)', async () => {
    const { svc } = makeService();
    await svc.createUser({ userId: 9100, role: 'supervisor' });
    const off = await svc.setUserStatus(9100, false);
    expect(off.inactive).toBe(true);
    const on = await svc.setUserStatus(9100, true);
    expect(on.inactive).toBe(false);
  });

  it('merged list = ERP rows + overlay rows (overlay wins, sorted by id)', async () => {
    const { svc } = makeService();
    await svc.createUser({ userId: 9001, role: 'cashier', enName: 'Local One' });
    const list = await svc.listMergedUsers();
    expect(list.map((u) => u.userId)).toEqual([1, 9001]);
    expect(list[0].origin).toBe('ERP');
    expect(list[1].origin).toBe('LOCAL');
  });
});

//============================================================================
// Machines
//============================================================================

describe('AdminWriteService — machines', () => {
  it('creates a LOCAL machine', async () => {
    const { svc } = makeService();
    const m = await svc.createMachine({
      machineNo: 5,
      terminal: 'POS5',
      branchNo: 1,
      useVat: true,
    });
    expect(m.origin).toBe('LOCAL');
    expect(m.terminal).toBe('POS5');
    expect(m.useVat).toBe(true);
  });

  it('rejects a machineNo that already exists in the ERP', async () => {
    const { svc } = makeService();
    await expect(
      svc.createMachine({ machineNo: 1, terminal: 'DUP' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('edits an ERP machine via an EDIT overlay, keeping unedited fields', async () => {
    const { svc } = makeService();
    const m = await svc.updateMachine(1, { terminal: 'SERVER3-NEW' });
    expect(m.origin).toBe('EDIT');
    expect(m.terminal).toBe('SERVER3-NEW');
    expect(m.defWarehouse).toBe(2); // ERP value preserved
    expect(m.lastBillDate).toBe('2026-05-17');
  });

  it('404s for a machine that exists nowhere', async () => {
    const { svc } = makeService();
    await expect(
      svc.updateMachine(99, { terminal: 'x' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('merged list includes ERP + LOCAL machines sorted by number', async () => {
    const { svc } = makeService();
    await svc.createMachine({ machineNo: 7, terminal: 'POS7' });
    const list = await svc.listMergedMachines();
    expect(list.map((m) => m.machineNo)).toEqual([1, 7]);
    expect(list[0].origin).toBe('ERP');
    expect(list[1].origin).toBe('LOCAL');
  });
});

//============================================================================
// Permissions
//============================================================================

describe('AdminWriteService — role permissions', () => {
  it('upserts entries and returns the refreshed matrix', async () => {
    const { svc, writes } = makeService();
    const { applied, matrix } = await svc.setPermissions(
      [
        { role: 'cashier', permission: 'DISCOUNT', allowed: false },
        { role: 'supervisor', permission: 'VOID', allowed: true },
      ],
      3,
    );
    expect(applied).toBe(2);
    expect(matrix).toHaveLength(2);
    expect(writes.lastUpdatedBy).toBe(3);
    const cashierDiscount = matrix.find(
      (p) => p.role === 'cashier' && p.permission === 'DISCOUNT',
    );
    expect(cashierDiscount?.allowed).toBe(false);
  });

  it('re-upserting the same (role, permission) overwrites allowed', async () => {
    const { svc } = makeService();
    await svc.setPermissions(
      [{ role: 'cashier', permission: 'VOID', allowed: false }],
      1,
    );
    const { matrix } = await svc.setPermissions(
      [{ role: 'cashier', permission: 'VOID', allowed: true }],
      1,
    );
    expect(matrix).toHaveLength(1);
    expect(matrix[0].allowed).toBe(true);
  });
});
