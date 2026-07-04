import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ClassifiedSetting,
  DefaultSetting,
  MachineSettings,
  PosSettings,
  SettingGroup,
  SettingOverride,
  SettingsRepository,
  SETTINGS_REPOSITORY,
} from '../domain/ports/settings-repository.port';
import {
  SETTINGS_CATALOG,
  SETTINGS_CATALOG_BY_COLUMN,
} from '../domain/settings-catalog';

/**
 * SettingsService (application layer) — orchestrates the READ of live YSPOS23
 * settings MERGED with the local MOTECH_POS overlay, and the WRITE of overlay
 * overrides. No SQL here; depends on the SettingsRepository port (DIP).
 *
 * Merge semantics: for each projected field we read the live Onyx value, then
 * if an overlay override exists for that field's canonical key, the overlay
 * value WINS. Numbered defaults (POS_DFLT_STNG) can be overridden with the key
 * `default.<no>`. Machine values are not overridden by the global overlay.
 */
@Injectable()
export class SettingsService {
  constructor(
    @Inject(SETTINGS_REPOSITORY) private readonly repo: SettingsRepository,
  ) {}

  /** Canonical keys that map to IAS_PARA_POS columns (source of truth). */
  static readonly EDITABLE_KEYS: readonly string[] = [
    'shopName',
    'currency',
    'priceLevel',
    'pricingType',
    'billFooter',
    'numbering.machineDigit',
    'numbering.userDigit',
    'numbering.serialDigit',
    'numbering.posBillSerial',
    'printing.printBill',
    'printing.printBillBeforeSave',
    'printing.openDrawer',
    'hungBills.useHungBills',
    'hungBills.maxHungs',
    'hungBills.allowPrintHungBill',
    'tax.roundAmtFraction',
    'tax.useCheckSum',
    'tax.returnPeriod',
    'tax.changePeriod',
    'points.usePosPointSys',
    'points.pointCalcType',
    'features.useSaleOrder',
    'features.useDiscCard',
    'features.allowChangeBillCurr',
  ];

  /**
   * Canonical camelCase key -> IAS_PARA_POS column, so raw-column reads
   * (GET /settings/all) also honour overrides written via canonical keys.
   */
  static readonly CANONICAL_TO_COLUMN: Readonly<Record<string, string>> = {
    shopName: 'SETTING_NAME',
    currency: 'CURR_DFLT',
    priceLevel: 'PRICE_LEVEL',
    pricingType: 'POS_PRICING_TYPE',
    billFooter: 'FTR_BILL',
    'numbering.machineDigit': 'MACHINE_DIGIT',
    'numbering.userDigit': 'USER_DIGIT',
    'numbering.serialDigit': 'SERIAL_DIGIT',
    'numbering.posBillSerial': 'POS_BILL_SERIAL',
    'printing.printBill': 'PRINT_BILL',
    'printing.printBillBeforeSave': 'PRINT_BILL_B4SAV',
    'printing.openDrawer': 'OPEN_DRAWER',
    'hungBills.useHungBills': 'USE_HUNG_BILLS',
    'hungBills.maxHungs': 'MAXHUNGS',
    'hungBills.allowPrintHungBill': 'ALLOW_PRINT_HUNG_BILL',
    'tax.roundAmtFraction': 'ROUND_AMT_FRCTION',
    'tax.useCheckSum': 'USE_CHECK_SUM',
    'tax.returnPeriod': 'RETURN_PERIOD',
    'tax.changePeriod': 'CHANGE_PERIOD',
    'points.usePosPointSys': 'USE_POS_POINT_SYS',
    'points.pointCalcType': 'POINT_CALC_TYP',
    'features.useSaleOrder': 'USE_SALE_ORDER',
    'features.useDiscCard': 'USE_DISC_CARD',
    'features.allowChangeBillCurr': 'ALLOW_CHANGE_BILL_CURR',
  };

  /** Column -> canonical key (reverse of CANONICAL_TO_COLUMN). */
  private static readonly COLUMN_TO_CANONICAL: ReadonlyMap<string, string> =
    new Map(
      Object.entries(SettingsService.CANONICAL_TO_COLUMN).map(([k, c]) => [
        c,
        k,
      ]),
    );

  /** True when `key` is one of the 179 raw IAS_PARA_POS column names. */
  static isCatalogColumn(key: string): boolean {
    return SETTINGS_CATALOG_BY_COLUMN.has(key);
  }

  /**
   * GET /settings/all — ALL 179 IAS_PARA_POS settings, classified by group
   * (docs/SETTINGS_CLASSIFIED.txt). For every column we report the effective
   * value (overlay wins — checked under both the raw column key and, when one
   * exists, the canonical camelCase key), the live value, type, group,
   * override flag and Arabic description for the common settings.
   */
  async getAllClassified(): Promise<{
    groups: Record<SettingGroup, ClassifiedSetting[]>;
    total: number;
    overrideCount: number;
  }> {
    const [{ para }, overlay] = await Promise.all([
      this.repo.readLiveSettings(),
      this.repo.readOverlay(),
    ]);
    const p = para ?? {};

    const toText = (v: unknown): string | null => {
      if (v == null) return null;
      if (v instanceof Date) return v.toISOString();
      return String(v);
    };

    const groups = {} as Record<SettingGroup, ClassifiedSetting[]>;
    let overrideCount = 0;
    for (const entry of SETTINGS_CATALOG) {
      const liveValue = toText(p[entry.column]);
      // Overlay lookup: raw column key first, then the canonical key alias.
      const canonical = SettingsService.COLUMN_TO_CANONICAL.get(entry.column);
      let overridden = false;
      let value = liveValue;
      if (overlay.has(entry.column)) {
        overridden = true;
        value = overlay.get(entry.column) ?? null;
      } else if (canonical && overlay.has(canonical)) {
        overridden = true;
        value = overlay.get(canonical) ?? null;
      }
      if (overridden) overrideCount += 1;
      const item: ClassifiedSetting = {
        key: entry.column,
        value,
        liveValue,
        type: entry.type,
        group: entry.group,
        overridden,
        ...(entry.description ? { description: entry.description } : {}),
      };
      (groups[entry.group] ??= []).push(item);
    }
    return { groups, total: SETTINGS_CATALOG.length, overrideCount };
  }

  /**
   * PUT /settings/:key — upsert a single overlay override for any of the 179
   * raw column keys (or a canonical camelCase key). `value: null` reverts to
   * the live YSPOS23 value. Returns the refreshed classified view of the key.
   */
  async saveOne(
    key: string,
    value: string | null,
    updatedBy: number | null,
  ): Promise<ClassifiedSetting> {
    const column = SettingsService.isCatalogColumn(key)
      ? key
      : SettingsService.CANONICAL_TO_COLUMN[key];
    if (!column) {
      throw new NotFoundException(`Unknown setting key: ${key}`);
    }
    // Persist under the raw column key (single canonical storage key).
    await this.repo.writeOverlay([{ key: column, value }], updatedBy);
    const { groups } = await this.getAllClassified();
    const entry = SETTINGS_CATALOG_BY_COLUMN.get(column)!;
    const found = groups[entry.group].find((s) => s.key === column)!;
    return found;
  }

  async getSettings(): Promise<PosSettings> {
    const [{ para, defaults }, overlay] = await Promise.all([
      this.repo.readLiveSettings(),
      this.repo.readOverlay(),
    ]);

    const p = para ?? {};

    // Read a value: overlay override wins (canonical key or raw column key),
    // else the live IAS_PARA_POS column.
    const str = (key: string, col: string): string | null => {
      if (overlay.has(key)) return overlay.get(key) ?? null;
      if (overlay.has(col)) return overlay.get(col) ?? null;
      const v = p[col];
      return v == null ? null : String(v);
    };
    const int = (key: string, col: string): number | null => {
      const raw = str(key, col);
      if (raw == null || raw === '') return null;
      const n = Number(raw);
      return Number.isNaN(n) ? null : n;
    };
    // Onyx stores flags as 0/1 NUMBER — project to boolean.
    const bool = (key: string, col: string): boolean | null => {
      const n = int(key, col);
      return n == null ? null : n !== 0;
    };

    // Apply overlay to numbered defaults (key `default.<no>`).
    const mergedDefaults: DefaultSetting[] = defaults.map((d) => {
      const key = `default.${d.no}`;
      return overlay.has(key)
        ? { ...d, value: overlay.get(key) ?? null }
        : d;
    });

    return {
      shopName: str('shopName', 'SETTING_NAME'),
      currency: str('currency', 'CURR_DFLT'),
      priceLevel: str('priceLevel', 'PRICE_LEVEL'),
      pricingType: int('pricingType', 'POS_PRICING_TYPE'),
      billFooter: str('billFooter', 'FTR_BILL'),
      numbering: {
        machineDigit: int('numbering.machineDigit', 'MACHINE_DIGIT'),
        userDigit: int('numbering.userDigit', 'USER_DIGIT'),
        serialDigit: int('numbering.serialDigit', 'SERIAL_DIGIT'),
        posBillSerial: int('numbering.posBillSerial', 'POS_BILL_SERIAL'),
      },
      printing: {
        printBill: bool('printing.printBill', 'PRINT_BILL'),
        printBillBeforeSave: bool('printing.printBillBeforeSave', 'PRINT_BILL_B4SAV'),
        openDrawer: bool('printing.openDrawer', 'OPEN_DRAWER'),
      },
      hungBills: {
        useHungBills: bool('hungBills.useHungBills', 'USE_HUNG_BILLS'),
        maxHungs: int('hungBills.maxHungs', 'MAXHUNGS'),
        allowPrintHungBill: bool('hungBills.allowPrintHungBill', 'ALLOW_PRINT_HUNG_BILL'),
      },
      tax: {
        roundAmtFraction: int('tax.roundAmtFraction', 'ROUND_AMT_FRCTION'),
        useCheckSum: bool('tax.useCheckSum', 'USE_CHECK_SUM'),
        returnPeriod: int('tax.returnPeriod', 'RETURN_PERIOD'),
        changePeriod: int('tax.changePeriod', 'CHANGE_PERIOD'),
      },
      points: {
        usePosPointSys: bool('points.usePosPointSys', 'USE_POS_POINT_SYS'),
        pointCalcType: int('points.pointCalcType', 'POINT_CALC_TYP'),
      },
      features: {
        useSaleOrder: bool('features.useSaleOrder', 'USE_SALE_ORDER'),
        useDiscCard: bool('features.useDiscCard', 'USE_DISC_CARD'),
        allowChangeBillCurr: bool('features.allowChangeBillCurr', 'ALLOW_CHANGE_BILL_CURR'),
      },
      defaults: mergedDefaults,
      hasOverrides: overlay.size > 0,
    };
  }

  /**
   * POSS005 الإعدادات الافتراضية — the numbered system defaults
   * (POS_DFLT_STNG_MST) merged with the local overlay (`default.<no>` keys,
   * overlay wins). Each row reports whether an override is active and the
   * original live value so the UI can show "reverts to X".
   */
  async getDefaults(): Promise<{
    defaults: (DefaultSetting & {
      overridden: boolean;
      liveValue: string | null;
    })[];
    overrideCount: number;
  }> {
    const [{ defaults }, overlay] = await Promise.all([
      this.repo.readLiveSettings(),
      this.repo.readOverlay(),
    ]);
    let overrideCount = 0;
    const merged = defaults.map((d) => {
      const key = `default.${d.no}`;
      const overridden = overlay.has(key);
      if (overridden) overrideCount += 1;
      return {
        ...d,
        value: overridden ? (overlay.get(key) ?? null) : d.value,
        liveValue: d.value,
        overridden,
      };
    });
    return { defaults: merged, overrideCount };
  }

  /**
   * POSS005 write side — upsert overlay overrides for numbered defaults.
   * `value: null` clears the override (revert to the live Onyx value).
   * Every STNG_NO is validated against the LIVE list (404 for unknown ones)
   * so the overlay never accumulates orphan keys.
   */
  async saveDefaults(
    entries: { no: number; value: string | null }[],
    updatedBy: number | null,
  ) {
    const { defaults } = await this.repo.readLiveSettings();
    const known = new Set(defaults.map((d) => d.no));
    const unknown = entries.map((e) => e.no).filter((no) => !known.has(no));
    if (unknown.length > 0) {
      throw new NotFoundException(
        `Unknown default setting number(s): ${unknown.join(', ')}`,
      );
    }
    const overrides: SettingOverride[] = entries.map((e) => ({
      key: `default.${e.no}`,
      value: e.value,
    }));
    await this.repo.writeOverlay(overrides, updatedBy);
    return this.getDefaults();
  }

  async getMachine(machineNo: number): Promise<MachineSettings> {
    const m = await this.repo.readMachine(machineNo);
    if (!m) {
      throw new NotFoundException(`Machine ${machineNo} not found`);
    }
    return m;
  }

  /**
   * Persist overlay overrides. Accepts a partial map of { key: value }; a null
   * value clears the override. Returns the freshly-merged settings so the
   * client sees the effective state.
   */
  async saveOverrides(
    overrides: SettingOverride[],
    updatedBy: number | null,
  ): Promise<PosSettings> {
    await this.repo.writeOverlay(overrides, updatedBy);
    return this.getSettings();
  }
}
