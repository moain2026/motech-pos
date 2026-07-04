import { beforeEach, describe, expect, it } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { KeypadsService } from '../../src/modules/keypads/application/keypads.service';
import {
  AddKeypadKeyInput,
  KeypadKeyRow,
  KeypadRow,
  KeypadsRepository,
  UpsertKeypadInput,
} from '../../src/modules/keypads/domain/ports/keypads.port';
import { ItemNotFoundError } from '../../src/shared/errors/domain-error';

class FakeRepo implements KeypadsRepository {
  pads = new Map<number, KeypadRow>();
  keys = new Map<string, KeypadKeyRow>();
  private seq = 0;

  list() {
    return Promise.resolve([...this.pads.values()]);
  }
  find(no: number) {
    return Promise.resolve(this.pads.get(no) ?? null);
  }
  nextKeypadNo() {
    const mx = Math.max(0, ...this.pads.keys());
    return Promise.resolve(mx + 1);
  }
  upsert(input: UpsertKeypadInput): Promise<KeypadRow> {
    const prev = this.pads.get(input.keypadNo);
    const row: KeypadRow = {
      id: prev?.id ?? `pad-${input.keypadNo}`,
      keypadNo: input.keypadNo,
      arName: input.arName ?? prev?.arName ?? null,
      enName: input.enName ?? prev?.enName ?? null,
      inactive: input.inactive ?? prev?.inactive ?? false,
      keyCount: prev?.keyCount ?? 0,
    };
    this.pads.set(input.keypadNo, row);
    return Promise.resolve(row);
  }
  listKeys(no: number) {
    return Promise.resolve(
      [...this.keys.values()].filter((k) => k.keypadNo === no),
    );
  }
  addKey(input: AddKeypadKeyInput): Promise<KeypadKeyRow> {
    const id = `key-${++this.seq}`;
    const row: KeypadKeyRow = {
      id,
      keypadNo: input.keypadNo,
      grpNo: input.grpNo ?? 1,
      grpName: input.grpName ?? null,
      itemCode: input.itemCode,
      itemName: `اسم ${input.itemCode}`,
      price: 100,
      posNo: input.posNo ?? null,
      color: input.color ?? null,
      label: input.label ?? null,
    };
    this.keys.set(id, row);
    return Promise.resolve(row);
  }
  removeKey(id: string) {
    return Promise.resolve(this.keys.delete(id));
  }
}

/** Catalog stand-in: knows one item, 404s otherwise (like the real one). */
class FakeCatalog {
  known = new Set(['1040010011']);
  getByCode(code: string) {
    if (!this.known.has(code)) {
      throw new ItemNotFoundError(`Item ${code} not found`, { code });
    }
    return Promise.resolve({ code });
  }
}

describe('KeypadsService (POSI002/POSI003 لوحات المفاتيح)', () => {
  let repo: FakeRepo;
  let svc: KeypadsService;

  beforeEach(() => {
    repo = new FakeRepo();
    svc = new KeypadsService(repo, new FakeCatalog() as never);
  });

  it('creates a keypad with an auto number and lists it', async () => {
    const pad = await svc.create({ arName: 'لوحة الخضروات' });
    expect(pad.keypadNo).toBe(1);
    expect((await svc.list())).toHaveLength(1);
  });

  it('rejects a duplicate keypad number (409)', async () => {
    await svc.create({ keypadNo: 1 });
    await expect(svc.create({ keypadNo: 1 })).rejects.toThrow(
      ConflictException,
    );
  });

  it('links only existing items (POSI003) — unknown item 404s', async () => {
    await svc.create({ keypadNo: 1 });
    const key = await svc.addKey({
      keypadNo: 1,
      itemCode: '1040010011',
      grpName: 'حلويات',
    });
    expect(key.itemName).toContain('1040010011');
    await expect(
      svc.addKey({ keypadNo: 1, itemCode: 'NOPE' }),
    ).rejects.toThrow(ItemNotFoundError);
  });

  it('get returns pad + keys; unknown pad 404s', async () => {
    await svc.create({ keypadNo: 1 });
    await svc.addKey({ keypadNo: 1, itemCode: '1040010011' });
    const pad = await svc.get(1);
    expect(pad.keys).toHaveLength(1);
    await expect(svc.get(99)).rejects.toThrow(NotFoundException);
  });

  it('removes keys; missing key 404s', async () => {
    await svc.create({ keypadNo: 1 });
    const key = await svc.addKey({ keypadNo: 1, itemCode: '1040010011' });
    const res = await svc.removeKey(1, key.id);
    expect(res.removed).toBe(true);
    await expect(svc.removeKey(1, key.id)).rejects.toThrow(NotFoundException);
  });
});
