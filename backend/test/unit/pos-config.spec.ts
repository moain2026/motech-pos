import { beforeEach, describe, expect, it } from 'vitest';
import { PosConfigService } from '../../src/modules/settings/application/pos-config.service';
import type {
  PosConfigRepository,
  ScaleDefinitionRow,
  ShortcutRow,
  UpsertScaleDefinition,
  UpsertShortcut,
} from '../../src/modules/settings/domain/ports/pos-config.port';
import {
  InvalidOverlayError,
  OverlayNotFoundError,
} from '../../src/shared/errors/domain-error';

class FakeRepo implements PosConfigRepository {
  shortcuts: ShortcutRow[] = [];
  scales: ScaleDefinitionRow[] = [];

  listShortcuts() {
    return Promise.resolve(this.shortcuts);
  }
  upsertShortcut(input: UpsertShortcut) {
    const row: ShortcutRow = {
      id: 'x',
      action: input.action,
      keyCombo: input.keyCombo,
      arLabel: input.arLabel ?? null,
      sortOrder: input.sortOrder ?? 100,
      enabled: input.enabled ?? true,
    };
    this.shortcuts.push(row);
    return Promise.resolve(row);
  }
  deleteShortcut(action: string) {
    const before = this.shortcuts.length;
    this.shortcuts = this.shortcuts.filter((s) => s.action !== action);
    return Promise.resolve(this.shortcuts.length < before);
  }
  listScales() {
    return Promise.resolve(this.scales);
  }
  findScale(id: string) {
    return Promise.resolve(this.scales.find((s) => s.id === id) ?? null);
  }
  createScale(input: UpsertScaleDefinition) {
    const row: ScaleDefinitionRow = {
      id: 'new',
      name: input.name,
      prefix: input.prefix,
      barcodeLength: input.barcodeLength,
      itemCodeStart: input.itemCodeStart ?? 2,
      itemCodeLen: input.itemCodeLen,
      valueLen: input.valueLen ?? null,
      divisor: input.divisor,
      mode: input.mode,
      enabled: input.enabled ?? true,
      sortOrder: input.sortOrder ?? 100,
    };
    this.scales.push(row);
    return Promise.resolve(row);
  }
  updateScale(id: string, input: UpsertScaleDefinition) {
    const existing = this.scales.find((s) => s.id === id);
    if (!existing) return Promise.resolve(null);
    Object.assign(existing, input, { valueLen: input.valueLen ?? null });
    return Promise.resolve(existing);
  }
  deleteScale(id: string) {
    const before = this.scales.length;
    this.scales = this.scales.filter((s) => s.id !== id);
    return Promise.resolve(this.scales.length < before);
  }
}

describe('PosConfigService', () => {
  let repo: FakeRepo;
  let svc: PosConfigService;
  beforeEach(() => {
    repo = new FakeRepo();
    svc = new PosConfigService(repo);
  });

  it('accepts a whitelisted shortcut action', async () => {
    const r = await svc.upsertShortcut({ action: 'pay', keyCombo: 'F9' });
    expect(r.action).toBe('pay');
  });

  it('rejects an unknown shortcut action', async () => {
    await expect(
      svc.upsertShortcut({ action: 'nuke', keyCombo: 'F5' }),
    ).rejects.toBeInstanceOf(InvalidOverlayError);
  });

  it('rejects an empty key combo', async () => {
    await expect(
      svc.upsertShortcut({ action: 'pay', keyCombo: '' }),
    ).rejects.toBeInstanceOf(InvalidOverlayError);
  });

  it('deletes a shortcut, 404 when absent', async () => {
    await svc.upsertShortcut({ action: 'pay', keyCombo: 'F9' });
    await svc.deleteShortcut('pay');
    await expect(svc.deleteShortcut('pay')).rejects.toBeInstanceOf(
      OverlayNotFoundError,
    );
  });

  it('creates a valid scale', async () => {
    const r = await svc.createScale({
      name: 'w',
      prefix: '02',
      barcodeLength: 12,
      itemCodeStart: 2,
      itemCodeLen: 5,
      valueLen: null,
      divisor: 1000,
      mode: 'WEIGHT',
    });
    expect(r.prefix).toBe('02');
  });

  it('rejects a non-numeric prefix', async () => {
    await expect(
      svc.createScale({
        name: 'x',
        prefix: 'AB',
        barcodeLength: 12,
        itemCodeLen: 5,
        divisor: 1000,
        mode: 'WEIGHT',
      }),
    ).rejects.toBeInstanceOf(InvalidOverlayError);
  });

  it('rejects a slot that exceeds the barcode length', async () => {
    await expect(
      svc.createScale({
        name: 'x',
        prefix: '02',
        barcodeLength: 5,
        itemCodeStart: 2,
        itemCodeLen: 10,
        divisor: 1000,
        mode: 'WEIGHT',
      }),
    ).rejects.toBeInstanceOf(InvalidOverlayError);
  });

  it('rejects a value slot that overflows the barcode', async () => {
    await expect(
      svc.createScale({
        name: 'x',
        prefix: '21',
        barcodeLength: 13,
        itemCodeStart: 2,
        itemCodeLen: 6,
        valueLen: 6,
        divisor: 100,
        mode: 'PRICE',
      }),
    ).rejects.toBeInstanceOf(InvalidOverlayError);
  });

  it('updates → 404 for unknown id', async () => {
    await expect(
      svc.updateScale('nope', {
        name: 'x',
        prefix: '02',
        barcodeLength: 12,
        itemCodeLen: 5,
        divisor: 1000,
        mode: 'WEIGHT',
      }),
    ).rejects.toBeInstanceOf(OverlayNotFoundError);
  });

  it('decode uses the configured definitions', async () => {
    await svc.createScale({
      name: 'w',
      prefix: '02',
      barcodeLength: 12,
      itemCodeStart: 2,
      itemCodeLen: 5,
      valueLen: null,
      divisor: 1000,
      mode: 'WEIGHT',
    });
    const d = await svc.decode('020000102500');
    expect(d?.itemCode).toBe('1');
    expect(d?.quantity).toBe(2.5);
  });
});
