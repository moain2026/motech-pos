import { beforeEach, describe, expect, it } from 'vitest';
import { PosCardsService } from '../../src/modules/cards/application/pos-cards.service';
import {
  PosCardRow,
  PosCardsRepository,
  UpsertPosCardInput,
} from '../../src/modules/cards/domain/ports/pos-cards.port';

/**
 * In-memory POS cards repo: `erp` are read-only ERP master rows;
 * `overlay` are the MOTECH_POS overrides. Merge = overlay wins.
 */
class FakePosCards implements PosCardsRepository {
  erp = new Map<number, { arName: string }>([
    [1, { arName: 'فيزا' }],
    [2, { arName: 'ماستر' }],
  ]);
  overlay = new Map<number, UpsertPosCardInput & { origin: 'LOCAL' | 'EDIT' }>();
  private seq = 900;

  private merge(cardNo: number): PosCardRow | null {
    const o = this.overlay.get(cardNo);
    const e = this.erp.get(cardNo);
    if (!o && !e) return null;
    return {
      cardNo,
      arName: o?.arName ?? e?.arName ?? null,
      enName: o?.enName ?? null,
      cardType: o?.cardType ?? null,
      bankNo: o?.bankNo ?? null,
      commissionPct: o?.commissionPct ?? null,
      commCalcType: o?.commCalcType ?? null,
      duePeriod: o?.duePeriod ?? null,
      bankAc: o?.bankAc ?? null,
      inactive: o?.inactive ?? false,
      origin: o ? o.origin : 'ERP',
    };
  }

  listMerged(): Promise<PosCardRow[]> {
    const nos = new Set([...this.erp.keys(), ...this.overlay.keys()]);
    return Promise.resolve(
      [...nos].sort((a, b) => a - b).map((n) => this.merge(n)!),
    );
  }
  findMerged(cardNo: number): Promise<PosCardRow | null> {
    return Promise.resolve(this.merge(cardNo));
  }
  erpCardExists(cardNo: number): Promise<boolean> {
    return Promise.resolve(this.erp.has(cardNo));
  }
  overlayExists(cardNo: number): Promise<boolean> {
    return Promise.resolve(this.overlay.has(cardNo));
  }
  nextLocalCardNo(): Promise<number> {
    return Promise.resolve(++this.seq);
  }
  insertOverlay(
    cardNo: number,
    origin: 'LOCAL' | 'EDIT',
    input: UpsertPosCardInput,
  ): Promise<void> {
    this.overlay.set(cardNo, { ...input, origin });
    return Promise.resolve();
  }
  updateOverlay(cardNo: number, input: UpsertPosCardInput): Promise<boolean> {
    const cur = this.overlay.get(cardNo);
    if (!cur) return Promise.resolve(false);
    this.overlay.set(cardNo, { ...cur, ...input });
    return Promise.resolve(true);
  }
}

describe('PosCardsService (POSI012 CRUD, overlay)', () => {
  let repo: FakePosCards;
  let svc: PosCardsService;
  beforeEach(() => {
    repo = new FakePosCards();
    svc = new PosCardsService(repo);
  });

  it('lists ERP master rows with origin ERP', async () => {
    const list = await svc.list();
    expect(list.map((c) => c.cardNo)).toEqual([1, 2]);
    expect(list.every((c) => c.origin === 'ERP')).toBe(true);
  });

  it('creates a LOCAL card with an auto-allocated number', async () => {
    const card = await svc.create({ arName: 'بطاقة محلية', commissionPct: 2 });
    expect(card.cardNo).toBe(901);
    expect(card.origin).toBe('LOCAL');
    expect(card.commissionPct).toBe(2);
  });

  it('editing an ERP card produces an EDIT override (ERP untouched)', async () => {
    const edited = await svc.update(1, { arName: 'فيزا (معدّل)', bankNo: 5 });
    expect(edited.origin).toBe('EDIT');
    expect(edited.arName).toBe('فيزا (معدّل)');
    expect(edited.bankNo).toBe(5);
    // ERP master still has its original name.
    expect(repo.erp.get(1)?.arName).toBe('فيزا');
  });

  it('rejects a duplicate overlay for the same number (409)', async () => {
    await svc.create({ cardNo: 3, arName: 'شبكة جديدة' });
    await expect(
      svc.create({ cardNo: 3, arName: 'مكرر' }),
    ).rejects.toThrow(/already exists/i);
  });

  it('requires arName (422)', async () => {
    await expect(svc.create({ arName: '  ' })).rejects.toThrow(/required/i);
  });

  it('404 for an unknown card on get', async () => {
    await expect(svc.get(999)).rejects.toThrow(/not found/i);
  });
});
