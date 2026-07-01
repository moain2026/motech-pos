/** DI token for the SettingsRepository port (reads YSPOS23, writes MOTECH_POS overlay). */
export const SETTINGS_REPOSITORY = Symbol('SETTINGS_REPOSITORY');

/**
 * PosSettings — the effective POS system settings (POSS001 / IAS_PARA_POS),
 * projected into a stable, typed shape for the frontend. Values originate from
 * the LIVE YSPOS23.IAS_PARA_POS single-row parameters profile and are then
 * MERGED with any local admin overrides stored in MOTECH_POS.SETTINGS_OVERLAY.
 */
export interface PosSettings {
  /** Shop / parameters-profile name (IAS_PARA_POS.SETTING_NAME). */
  shopName: string | null;
  /** Default currency code (IAS_PARA_POS.CURR_DFLT), e.g. 'YER'. */
  currency: string | null;
  /** Default price level (IAS_PARA_POS.PRICE_LEVEL). */
  priceLevel: string | null;
  /** POS pricing type (IAS_PARA_POS.POS_PRICING_TYPE). */
  pricingType: number | null;
  /** Bill footer text (IAS_PARA_POS.FTR_BILL). */
  billFooter: string | null;

  /** Numbering digits. */
  numbering: {
    machineDigit: number | null; // MACHINE_DIGIT
    userDigit: number | null; // USER_DIGIT
    serialDigit: number | null; // SERIAL_DIGIT
    posBillSerial: number | null; // POS_BILL_SERIAL
  };

  /** Print options. */
  printing: {
    printBill: boolean | null; // PRINT_BILL
    printBillBeforeSave: boolean | null; // PRINT_BILL_B4SAV
    openDrawer: boolean | null; // OPEN_DRAWER
  };

  /** Hung / held bills options. */
  hungBills: {
    useHungBills: boolean | null; // USE_HUNG_BILLS
    maxHungs: number | null; // MAXHUNGS
    allowPrintHungBill: boolean | null; // ALLOW_PRINT_HUNG_BILL
  };

  /** Tax / VAT + rounding + returns options. */
  tax: {
    roundAmtFraction: number | null; // ROUND_AMT_FRCTION
    useCheckSum: boolean | null; // USE_CHECK_SUM
    returnPeriod: number | null; // RETURN_PERIOD
    changePeriod: number | null; // CHANGE_PERIOD
  };

  /** Loyalty / points options. */
  points: {
    usePosPointSys: boolean | null; // USE_POS_POINT_SYS
    pointCalcType: number | null; // POINT_CALC_TYP
  };

  /** Misc feature flags. */
  features: {
    useSaleOrder: boolean | null; // USE_SALE_ORDER
    useDiscCard: boolean | null; // USE_DISC_CARD
    allowChangeBillCurr: boolean | null; // ALLOW_CHANGE_BILL_CURR
  };

  /** Numbered default settings (POS_DFLT_STNG_MST). */
  defaults: DefaultSetting[];

  /** Whether any overlay override is currently applied. */
  hasOverrides: boolean;
}

/** One numbered default setting (POS_DFLT_STNG_MST). */
export interface DefaultSetting {
  no: number; // STNG_NO
  value: string | null; // STNG_VAL (overlay may override)
  comment: string | null; // COMNT
}

/** Cashier-machine settings (POST009 / IAS_POS_MACHINE). */
export interface MachineSettings {
  machineNo: number;
  terminal: string | null; // TERMINAL
  branchNo: number | null; // DEF_BRN_NO
  priceLevel: number | null; // PRICE_LEVEL
  useVat: boolean | null; // USE_VAT
  currency: string | null; // CURR_DFLT
  saleSerial: number | null; // SALE_SER
  rtSaleSerial: number | null; // RT_SALE_SER
  returnPeriod: number | null; // RETURN_PERIOD
  changePeriod: number | null; // CHANGE_PERIOD
  address: string | null; // ADDRESS
  addressForeign: string | null; // ADDRESS_F
  telNo: string | null; // TEL_NO
  faxNo: string | null; // FAX_NO
  email: string | null; // E_MAIL
  billFooter: string | null; // BILL_FTR_REP
  useShop: boolean | null; // USE_SHOP_FLG
  inactive: boolean | null; // INACTIVE
}

/** A single overlay override to persist (POST/PUT /settings). */
export interface SettingOverride {
  key: string;
  value: string | null; // null clears the override
}

/**
 * SettingsRepository — reads live POS settings from YSPOS23 (read-only) and
 * reads/writes the local MOTECH_POS.SETTINGS_OVERLAY store. All SQL uses
 * schema-qualified names and bind variables (never concatenation).
 */
export interface SettingsRepository {
  /** Read IAS_PARA_POS (single row) + POS_DFLT_STNG_MST from YSPOS23. */
  readLiveSettings(): Promise<{
    para: Record<string, unknown> | null;
    defaults: DefaultSetting[];
  }>;

  /** Read the whole local overlay (key -> value). */
  readOverlay(): Promise<Map<string, string | null>>;

  /** Read one cashier machine (IAS_POS_MACHINE) by MACHINE_NO. */
  readMachine(machineNo: number): Promise<MachineSettings | null>;

  /**
   * Upsert (MERGE) overlay overrides atomically into MOTECH_POS. `null` value
   * deletes the override (revert to the live value). Returns count written.
   */
  writeOverlay(
    overrides: SettingOverride[],
    updatedBy: number | null,
  ): Promise<number>;
}
