import { describe, expect, it } from 'vitest';
import { AdminService } from '../../src/modules/admin/application/admin.service';
import {
  AdminRepository,
  MachineRow,
  SessionRow,
  SessionsFilter,
  UserRow,
} from '../../src/modules/admin/domain/ports/admin-repository.port';

class FakeAdmin implements AdminRepository {
  lastSessionsFilter?: SessionsFilter;

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
      {
        machineNo: 2,
        terminal: 'POS1',
        inactive: true,
        defWarehouse: 2,
        defBranch: 1,
        ipAddress: '10.0.0.2',
        lastBillDate: null,
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
        loggedOn: true,
        locked: false,
        email: null,
      },
      {
        userId: 2,
        arabicName: 'كاشير أول',
        englishName: null,
        code: null,
        inactive: false,
        isAdmin: false,
        userType: 1,
        loggedOn: false,
        locked: false,
        email: null,
      },
    ]);
  }

  listSessions(filter: SessionsFilter): Promise<SessionRow[]> {
    this.lastSessionsFilter = filter;
    return Promise.resolve([
      {
        userId: 1,
        terminal: 'SERVER3',
        loginType: 0,
        eventAt: '2026-06-28 15:07:00',
        branchNo: 1,
      },
    ]);
  }
}

describe('AdminService', () => {
  it('listMachines returns machines with status flags', async () => {
    const svc = new AdminService(new FakeAdmin());
    const rows = await svc.listMachines();
    expect(rows).toHaveLength(2);
    expect(rows[0].terminal).toBe('SERVER3');
    expect(rows[0].inactive).toBe(false);
    expect(rows[1].inactive).toBe(true);
    expect(rows[0].useVat).toBe(true);
  });

  it('listUsers returns users with Arabic names and admin flag', async () => {
    const svc = new AdminService(new FakeAdmin());
    const rows = await svc.listUsers();
    expect(rows[0].arabicName).toBe('مدير النظام');
    expect(rows[0].isAdmin).toBe(true);
    expect(rows[0].loggedOn).toBe(true);
    expect(rows[1].isAdmin).toBe(false);
  });

  it('listSessions forwards the filter and returns history rows', async () => {
    const repo = new FakeAdmin();
    const svc = new AdminService(repo);
    const rows = await svc.listSessions({ userId: 1, limit: 50 });
    expect(repo.lastSessionsFilter).toEqual({ userId: 1, limit: 50 });
    expect(rows[0].terminal).toBe('SERVER3');
    expect(rows[0].eventAt).toBe('2026-06-28 15:07:00');
  });
});
