import { beforeEach, describe, expect, it } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { CustomersService } from '../../src/modules/customers/application/customers.service';
import {
  CustomerOverlayRepository,
  CustomerOverlayRow,
  UpsertCustomerOverlayInput,
} from '../../src/modules/customers/domain/ports/customer-overlay.port';
import {
  CustomerRow,
  CustomersRepository,
  PointsBalance,
  PointsTxnRow,
} from '../../src/modules/customers/domain/ports/customers-repository.port';
import { OverlayConflictError } from '../../src/shared/errors/domain-error';

class FakeErp implements CustomersRepository {
  rows = new Map<string, CustomerRow>();
  search(): Promise<CustomerRow[]> {
    return Promise.resolve([...this.rows.values()]);
  }
  findByCode(code: string): Promise<CustomerRow | null> {
    return Promise.resolve(this.rows.get(code) ?? null);
  }
  pointsTxns(): Promise<PointsTxnRow[]> {
    return Promise.resolve([]);
  }
  pointsBalance(code: string): Promise<PointsBalance> {
    return Promise.resolve({ code, totalPoints: 0, txnCount: 0 });
  }
}

class FakeOverlay implements CustomerOverlayRepository {
  rows = new Map<string, CustomerOverlayRow>();
  findByCode(code: string): Promise<CustomerOverlayRow | null> {
    return Promise.resolve(this.rows.get(code) ?? null);
  }
  findByCodes(codes: string[]): Promise<Map<string, CustomerOverlayRow>> {
    const m = new Map<string, CustomerOverlayRow>();
    for (const c of codes) if (this.rows.has(c)) m.set(c, this.rows.get(c)!);
    return Promise.resolve(m);
  }
  listLocal(): Promise<CustomerOverlayRow[]> {
    return Promise.resolve(
      [...this.rows.values()].filter((r) => r.origin === 'LOCAL'),
    );
  }
  upsert(input: UpsertCustomerOverlayInput): Promise<CustomerOverlayRow> {
    const now = new Date().toISOString();
    const row: CustomerOverlayRow = {
      code: input.code,
      origin: input.origin,
      arName: input.arName ?? null,
      enName: input.enName ?? null,
      mobile: input.mobile ?? null,
      whatsapp: input.whatsapp ?? null,
      phone: input.phone ?? null,
      inactive: input.inactive ?? false,
      createdAt: now,
      updatedAt: now,
    };
    this.rows.set(input.code, row);
    return Promise.resolve(row);
  }
}

function erpRow(code: string, arName: string): CustomerRow {
  return {
    code,
    arName,
    enName: null,
    mobile: '111',
    whatsapp: null,
    phone: null,
    inactive: false,
  };
}

describe('CustomersService overlay merge (POSI010)', () => {
  let erp: FakeErp;
  let ov: FakeOverlay;
  let svc: CustomersService;

  beforeEach(() => {
    erp = new FakeErp();
    ov = new FakeOverlay();
    svc = new CustomersService(erp, ov);
  });

  it('creates a LOCAL customer not present in ERP', async () => {
    const c = await svc.create({ code: 'L1', arName: 'محلي' });
    expect(c.origin).toBe('LOCAL');
    const back = await svc.findByCode('L1');
    expect(back.arName).toBe('محلي');
  });

  it('rejects creating a code that already exists in ERP (409)', async () => {
    erp.rows.set('E1', erpRow('E1', 'ERP'));
    await expect(svc.create({ code: 'E1' })).rejects.toBeInstanceOf(
      OverlayConflictError,
    );
  });

  it('EDIT overlays an ERP record (overlay name wins)', async () => {
    erp.rows.set('E1', erpRow('E1', 'ERP name'));
    const c = await svc.update('E1', { arName: 'معدّل' });
    expect(c.origin).toBe('EDIT');
    const back = await svc.findByCode('E1');
    expect(back.arName).toBe('معدّل');
    expect(back.mobile).toBe('111'); // untouched ERP field preserved
  });

  it('404 when editing an unknown customer', async () => {
    await expect(svc.update('ZZ', { arName: 'x' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('search surfaces LOCAL-only customers alongside ERP', async () => {
    erp.rows.set('E1', erpRow('E1', 'ERP'));
    await svc.create({ code: 'L1', arName: 'محلي' });
    const list = await svc.search({ limit: 50 });
    const codes = list.map((c) => c.code).sort();
    expect(codes).toContain('E1');
    expect(codes).toContain('L1');
  });
});
