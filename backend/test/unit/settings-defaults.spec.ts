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
