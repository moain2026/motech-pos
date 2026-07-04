import { beforeEach, describe, expect, it } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { SuppliersService } from '../../src/modules/suppliers/application/suppliers.service';
import {
  SupplierErpRow,
  SupplierOverlayRow,
  SuppliersOverlayRepository,
  SuppliersRepository,
  UpsertSupplierOverlay,
} from '../../src/modules/suppliers/domain/ports/suppliers-repository.port';

function erpRow(code: string, arName: string): SupplierErpRow {
  return {
    code,
    arName,
    enName: null,
    phone: null,
    mobile: null,
    email: null,
    address: null,
    taxCode: null,
    contact: null,
    creditPeriod: null,
    inactive: false,
  };
}

class FakeErp implements SuppliersRepository {
  rows = new Map<string, SupplierErpRow>();
  list(search: string | undefined, limit: number): Promise<SupplierErpRow[]> {
    let out = [...this.rows.values()];
    if (search) out = out.filter((r) => (r.arName ?? '').includes(search));
    return Promise.resolve(out.slice(0, limit));
  }
  findByCode(code: string): Promise<SupplierErpRow | null> {
    return Promise.resolve(this.rows.get(code) ?? null);
  }
}

class FakeOverlay implements SuppliersOverlayRepository {
  rows = new Map<string, SupplierOverlayRow>();
  list(): Promise<SupplierOverlayRow[]> {
    return Promise.resolve([...this.rows.values()]);
  }
  findByCode(code: string): Promise<SupplierOverlayRow | null> {
    return Promise.resolve(this.rows.get(code) ?? null);
  }
  nextLocalCode(): Promise<string> {
    const locals = [...this.rows.values()]
      .filter((r) => r.origin === 'LOCAL' && /^\d+$/.test(r.code))
      .map((r) => Number(r.code))
      .filter((n) => n >= 9000);
    return Promise.resolve(String(locals.length ? Math.max(...locals) + 1 : 9000));
  }
  upsert(input: UpsertSupplierOverlay): Promise<SupplierOverlayRow> {
    const prev = this.rows.get(input.code);
    const row: SupplierOverlayRow = {
      id: prev?.id ?? `id-${input.code}`,
      code: input.code,
      origin: input.origin,
      arName: input.arName ?? prev?.arName ?? null,
      enName: input.enName ?? prev?.enName ?? null,
      phone: input.phone ?? prev?.phone ?? null,
      mobile: input.mobile ?? prev?.mobile ?? null,
      email: input.email ?? prev?.email ?? null,
      address: input.address ?? prev?.address ?? null,
      taxCode: input.taxCode ?? prev?.taxCode ?? null,
      contact: input.contact ?? prev?.contact ?? null,
      creditPeriod: input.creditPeriod ?? prev?.creditPeriod ?? null,
      inactive: input.inactive ?? prev?.inactive ?? false,
    };
    this.rows.set(input.code, row);
    return Promise.resolve(row);
  }
}

describe('SuppliersService (POSI001/002 الموردون)', () => {
  let erp: FakeErp;
  let overlay: FakeOverlay;
  let svc: SuppliersService;

  beforeEach(() => {
    erp = new FakeErp();
    overlay = new FakeOverlay();
    erp.rows.set('1', erpRow('1', 'محلات محمد النجار'));
    erp.rows.set('2', erpRow('2', 'محلات احمد النجار'));
    svc = new SuppliersService(erp, overlay);
  });

  it('lists ERP suppliers with origin ERP', async () => {
    const list = await svc.list();
    expect(list).toHaveLength(2);
    expect(list.every((s) => s.origin === 'ERP')).toBe(true);
  });

  it('creates a LOCAL supplier with an auto code >= 9000', async () => {
    const s = await svc.create({ arName: 'مؤسسة الأمل', creditPeriod: 30 });
    expect(s.code).toBe('9000');
    expect(s.origin).toBe('LOCAL');
    const list = await svc.list();
    expect(list).toHaveLength(3);
  });

  it('rejects creating a code that exists in the ERP (409)', async () => {
    await expect(svc.create({ code: '2', arName: 'مكرر' })).rejects.toThrow(
      ConflictException,
    );
  });

  it('EDIT-overlays an ERP supplier: overlay field wins, rest fall through', async () => {
    const s = await svc.update('2', { phone: '04-217788' });
    expect(s.origin).toBe('EDIT');
    expect(s.phone).toBe('04-217788');
    expect(s.arName).toBe('محلات احمد النجار'); // from ERP
  });

  it('404s on updating an unknown supplier', async () => {
    await expect(svc.update('777', { phone: 'x' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('merged list surfaces the EDIT row exactly once', async () => {
    await svc.update('2', { contact: 'أحمد' });
    const list = await svc.list();
    const twos = list.filter((s) => s.code === '2');
    expect(twos).toHaveLength(1);
    expect(twos[0].origin).toBe('EDIT');
  });
});
