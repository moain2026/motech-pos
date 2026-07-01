import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  DefaultSetting,
  MachineSettings,
  PosSettings,
  SettingOverride,
  SettingsRepository,
  SETTINGS_REPOSITORY,
} from '../domain/ports/settings-repository.port';

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

  async getSettings(): Promise<PosSettings> {
    const [{ para, defaults }, overlay] = await Promise.all([
      this.repo.readLiveSettings(),
      this.repo.readOverlay(),
    ]);

    const p = para ?? {};

    // Read a value: overlay override wins, else the live IAS_PARA_POS column.
    const str = (key: string, col: string): string | null => {
      if (overlay.has(key)) return overlay.get(key) ?? null;
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
