import { beforeEach, describe, expect, it } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CustomerGroupsService } from '../../src/modules/customers/application/customer-groups.service';
import {
  CustomerGroupRow,
  CustomerGroupsRepository,
  GroupMemberRow,
  UpsertCustomerGroupInput,
} from '../../src/modules/customers/domain/ports/customer-groups.port';

class FakeRepo implements CustomerGroupsRepository {
  groups = new Map<number, CustomerGroupRow>();
  members = new Map<string, GroupMemberRow>(); // key = customerCode
  private seq = 0;

  list() {
    return Promise.resolve(
      [...this.groups.values()].map((g) => ({
        ...g,
        memberCount: [...this.members.values()].filter(
          (m) => m.grpCode === g.grpCode,
        ).length,
      })),
    );
  }
  async find(no: number) {
    const g = this.groups.get(no);
    if (!g) return null;
    return (await this.list()).find((x) => x.grpCode === no) ?? null;
  }
  nextGrpCode() {
    return Promise.resolve(Math.max(0, ...this.groups.keys()) + 1);
  }
  upsert(input: UpsertCustomerGroupInput): Promise<CustomerGroupRow> {
    const prev = this.groups.get(input.grpCode);
    const row: CustomerGroupRow = {
      id: prev?.id ?? `g-${input.grpCode}`,
      grpCode: input.grpCode,
      arName: input.arName ?? prev?.arName ?? null,
      enName: input.enName ?? prev?.enName ?? null,
      sendMsg: input.sendMsg ?? prev?.sendMsg ?? false,
      inactive: input.inactive ?? prev?.inactive ?? false,
      memberCount: prev?.memberCount ?? 0,
    };
    this.groups.set(input.grpCode, row);
    return Promise.resolve(row);
  }
  listMembers(no: number) {
    return Promise.resolve(
      [...this.members.values()].filter((m) => m.grpCode === no),
    );
  }
  assign(no: number, customerCode: string): Promise<GroupMemberRow> {
    const row: GroupMemberRow = {
      id: this.members.get(customerCode)?.id ?? `m-${++this.seq}`,
      grpCode: no,
      customerCode,
      customerName: `عميل ${customerCode}`,
    };
    this.members.set(customerCode, row);
    return Promise.resolve(row);
  }
  unassign(customerCode: string) {
    return Promise.resolve(this.members.delete(customerCode));
  }
  async groupOf(customerCode: string) {
    const m = this.members.get(customerCode);
    return m ? this.find(m.grpCode) : null;
  }
}

/** Customer master stand-in: knows codes 1 and 2 (like the live ERP). */
class FakeCustomers {
  known = new Set(['1', '2']);
  findByCode(code: string) {
    if (!this.known.has(code)) {
      throw new NotFoundException(`Customer ${code} not found`);
    }
    return Promise.resolve({ code });
  }
}

describe('CustomerGroupsService (POSI009 مجموعات العملاء)', () => {
  let repo: FakeRepo;
  let svc: CustomerGroupsService;

  beforeEach(() => {
    repo = new FakeRepo();
    svc = new CustomerGroupsService(repo, new FakeCustomers() as never);
  });

  it('creates groups with auto codes and rejects duplicates', async () => {
    const g1 = await svc.create({ arName: 'عملاء الجملة' });
    expect(g1.grpCode).toBe(1);
    await expect(svc.create({ grpCode: 1 })).rejects.toThrow(
      ConflictException,
    );
  });

  it('assigns only existing customers (404 otherwise)', async () => {
    await svc.create({ grpCode: 1 });
    const m = await svc.assign(1, '1');
    expect(m.customerName).toContain('1');
    await expect(svc.assign(1, 'ZZZ')).rejects.toThrow(NotFoundException);
  });

  it('enforces one group per customer: assign reassigns', async () => {
    await svc.create({ grpCode: 1 });
    await svc.create({ grpCode: 2 });
    await svc.assign(1, '2');
    await svc.assign(2, '2');
    const g1 = await svc.get(1);
    const g2 = await svc.get(2);
    expect(g1.members).toHaveLength(0);
    expect(g2.members).toHaveLength(1);
    expect((await svc.groupOf('2'))?.grpCode).toBe(2);
  });

  it('unassign removes membership; missing membership 404s', async () => {
    await svc.create({ grpCode: 1 });
    await svc.assign(1, '1');
    expect((await svc.unassign('1')).removed).toBe(true);
    await expect(svc.unassign('1')).rejects.toThrow(NotFoundException);
  });

  it('404s on unknown group for get/update/assign', async () => {
    await expect(svc.get(9)).rejects.toThrow(NotFoundException);
    await expect(svc.update(9, {})).rejects.toThrow(NotFoundException);
    await expect(svc.assign(9, '1')).rejects.toThrow(NotFoundException);
  });
});
