import { NotFoundException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { SettingsService } from '../../src/modules/settings/application/settings.service';
import {
  DefaultSetting,
  MachineSettings,
  SettingOverride,
  SettingsRepository,
} from '../../src/modules/settings/domain/ports/settings-repository.port';

class FakeRepo implements SettingsRepository {
  defaults: DefaultSetting[] = [
    { no: 1, value: 'live-1', comment: 'طريقة الدفع الافتراضية' },
    { no: 13, value: '0', comment: 'استخدام شاشة اختيار الأصناف' },
  ];
  overlay = new Map<string, string | null>();
  writes: { overrides: SettingOverride[]; updatedBy: number | null }[] = [];

  readLiveSettings() {
    return Promise.resolve({ para: {}, defaults: this.defaults });
  }

  readOverlay(): Promise<Map<string, string | null>> {
    return Promise.resolve(new Map(this.overlay));
  }

  readMachine(): Promise<MachineSettings | null> {
    return Promise.resolve(null);
  }

  writeOverlay(
    overrides: SettingOverride[],
    updatedBy: number | null,
  ): Promise<number> {
    this.writes.push({ overrides, updatedBy });
    for (const o of overrides) {
      if (o.value === null) this.overlay.delete(o.key);
      else this.overlay.set(o.key, o.value);
    }
    return Promise.resolve(overrides.length);
  }
}

describe('SettingsService defaults (POSS005)', () => {
  it('returns live defaults with overridden=false when no overlay', async () => {
    const svc = new SettingsService(new FakeRepo());
    const { defaults, overrideCount } = await svc.getDefaults();
    expect(defaults).toHaveLength(2);
    expect(overrideCount).toBe(0);
    expect(defaults[0]).toMatchObject({
      no: 1,
      value: 'live-1',
      liveValue: 'live-1',
      overridden: false,
    });
  });

  it('applies an override (overlay wins) and reports liveValue', async () => {
    const repo = new FakeRepo();
    const svc = new SettingsService(repo);
    const res = await svc.saveDefaults([{ no: 13, value: '1' }], 3);
    const d13 = res.defaults.find((d) => d.no === 13)!;
    expect(d13.value).toBe('1');
    expect(d13.liveValue).toBe('0');
    expect(d13.overridden).toBe(true);
    expect(res.overrideCount).toBe(1);
    expect(repo.writes[0].updatedBy).toBe(3);
    expect(repo.writes[0].overrides[0].key).toBe('default.13');
  });

  it('value:null clears the override (revert to live)', async () => {
    const repo = new FakeRepo();
    const svc = new SettingsService(repo);
    await svc.saveDefaults([{ no: 13, value: '1' }], 3);
    const res = await svc.saveDefaults([{ no: 13, value: null }], 3);
    const d13 = res.defaults.find((d) => d.no === 13)!;
    expect(d13.value).toBe('0');
    expect(d13.overridden).toBe(false);
    expect(res.overrideCount).toBe(0);
  });

  it('404s for an unknown STNG_NO (no orphan overlay keys)', async () => {
    const repo = new FakeRepo();
    const svc = new SettingsService(repo);
    await expect(
      svc.saveDefaults([{ no: 999, value: 'x' }], 3),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.writes).toHaveLength(0);
  });
});

describe('SettingsService classified catalog (GET /settings/all)', () => {
  it('returns all 179 settings classified into the 10 groups', async () => {
    const repo = new FakeRepo();
    const svc = new SettingsService(repo);
    const { groups, total, overrideCount } = await svc.getAllClassified();
    expect(total).toBe(179);
    expect(overrideCount).toBe(0);
    const counts = Object.fromEntries(
      Object.entries(groups).map(([g, l]) => [g, l.length]),
    );
    expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(179);
    expect(counts.numbering).toBe(15);
    expect(counts.printing).toBe(29);
    expect(counts.tax).toBe(1);
    expect(counts.points).toBe(13);
    expect(counts.behavior).toBe(91);
    // Arabic descriptions on common settings
    const printBill = groups.printing.find((s) => s.key === 'PRINT_BILL')!;
    expect(printBill.description).toContain('طباعة');
  });

  it('saveOne writes an override under the raw column key and reflects it', async () => {
    const repo = new FakeRepo();
    const svc = new SettingsService(repo);
    const saved = await svc.saveOne('PRINT_BILL', '0', 7);
    expect(saved).toMatchObject({
      key: 'PRINT_BILL',
      value: '0',
      overridden: true,
      group: 'printing',
    });
    expect(repo.writes[0]).toMatchObject({
      updatedBy: 7,
      overrides: [{ key: 'PRINT_BILL', value: '0' }],
    });
    // Canonical alias maps to the same column
    const viaCanonical = await svc.saveOne('printing.printBill', '1', 7);
    expect(viaCanonical.key).toBe('PRINT_BILL');
    expect(viaCanonical.value).toBe('1');
  });

  it('saveOne rejects an unknown key with 404', async () => {
    const svc = new SettingsService(new FakeRepo());
    await expect(svc.saveOne('NOT_A_COLUMN', '1', 1)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
