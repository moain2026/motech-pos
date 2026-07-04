/** DI token for the read-side master-data repository (live ERP). */
export const MASTER_DATA_REPOSITORY = Symbol('MASTER_DATA_REPOSITORY');
/** DI token for the write-side master-data overlay repository (MOTECH_POS). */
export const MASTER_DATA_OVERLAY_REPOSITORY = Symbol(
  'MASTER_DATA_OVERLAY_REPOSITORY',
);

export type Origin = 'ERP' | 'LOCAL' | 'EDIT';
export type OverlayOrigin = 'LOCAL' | 'EDIT';

//============================================================================
// Warehouses (POSI003 — المخازن) — IAS202623.WAREHOUSE_DETAILS
//============================================================================
export interface WarehouseRow {
  code: number; // W_CODE
  arName: string | null; // W_NAME
  enName: string | null; // W_E_NAME
  location: string | null;
  tel: string | null;
  keeper: string | null; // WH_KEEPER
  noSale: boolean;
  priceLevel: number | null; // PRICE_LVL
  inactive: boolean;
}

export interface WarehouseOverlayRow extends Omit<WarehouseRow, 'noSale'> {
  id: string;
  origin: OverlayOrigin;
  noSale: boolean | null;
}

export interface UpsertWarehouseOverlay {
  code: number;
  origin: OverlayOrigin;
  arName?: string | null;
  enName?: string | null;
  location?: string | null;
  tel?: string | null;
  keeper?: string | null;
  noSale?: boolean | null;
  priceLevel?: number | null;
  inactive?: boolean | null;
}

//============================================================================
// Item groups (POSI004 — المجموعات) — IAS202623.GROUP_DETAILS
//============================================================================
export interface ItemGroupRow {
  code: string; // G_CODE
  arName: string | null; // G_A_NAME
  enName: string | null; // G_E_NAME
  taxPercent: number | null; // TAX_PRCNT_DFLT
  allowDiscount: boolean | null; // ALLOW_DISC_FLG
  sortOrder: number | null; // G_ORDR
  itemCount: number; // derived (IAS_ITM_MST per G_CODE)
  inactive: boolean;
}

export interface ItemGroupOverlayRow {
  id: string;
  code: string;
  origin: OverlayOrigin;
  arName: string | null;
  enName: string | null;
  taxPercent: number | null;
  allowDiscount: boolean | null;
  sortOrder: number | null;
  inactive: boolean;
}

export interface UpsertItemGroupOverlay {
  code: string;
  origin: OverlayOrigin;
  arName?: string | null;
  enName?: string | null;
  taxPercent?: number | null;
  allowDiscount?: boolean | null;
  sortOrder?: number | null;
  inactive?: boolean | null;
}

//============================================================================
// Units of measure (POSI005 — الوحدات) — IAS202623.MEASUREMENT
//============================================================================
export interface UnitRow {
  code: string; // MEASURE_CODE
  arName: string | null; // MEASURE
  enName: string | null; // MEASURE_F_NM
  defaultSize: number | null; // DFLT_SIZE
  inactive: boolean;
}

export interface UnitOverlayRow extends UnitRow {
  id: string;
  origin: OverlayOrigin;
}

export interface UpsertUnitOverlay {
  code: string;
  origin: OverlayOrigin;
  arName?: string | null;
  enName?: string | null;
  defaultSize?: number | null;
  inactive?: boolean | null;
}

//============================================================================
// Currencies + POS exchange rates (POSI011 — العملات) — IAS202623.EX_RATE
//============================================================================
export interface CurrencyRow {
  code: string; // CUR_CODE (e.g. YER, SAR, USD)
  no: number | null; // CUR_NO
  arName: string | null; // CUR_NAME
  enName: string | null; // CUR_E_NAME
  rate: number | null; // CUR_RATE (accounting rate)
  ratePos: number | null; // CUR_RATE_POS (POS-specific rate)
  fractionNo: number | null; // CUR_FRC_NO (decimal places)
  isLocal: boolean; // L_F
  inactive: boolean;
}

export interface CurrencyOverlayRow {
  id: string;
  code: string;
  origin: OverlayOrigin;
  arName: string | null;
  enName: string | null;
  rate: number | null;
  ratePos: number | null;
  fractionNo: number | null;
  isLocal: boolean | null;
  inactive: boolean;
}

export interface UpsertCurrencyOverlay {
  code: string;
  origin: OverlayOrigin;
  arName?: string | null;
  enName?: string | null;
  rate?: number | null;
  ratePos?: number | null;
  fractionNo?: number | null;
  isLocal?: boolean | null;
  inactive?: boolean | null;
}

//============================================================================
// Ports
//============================================================================
export interface MasterDataRepository {
  listWarehouses(): Promise<WarehouseRow[]>;
  findWarehouse(code: number): Promise<WarehouseRow | null>;
  listItemGroups(): Promise<ItemGroupRow[]>;
  findItemGroup(code: string): Promise<ItemGroupRow | null>;
  listUnits(): Promise<UnitRow[]>;
  findUnit(code: string): Promise<UnitRow | null>;
  listCurrencies(): Promise<CurrencyRow[]>;
  findCurrency(code: string): Promise<CurrencyRow | null>;
}

export interface MasterDataOverlayRepository {
  listWarehouses(): Promise<WarehouseOverlayRow[]>;
  findWarehouse(code: number): Promise<WarehouseOverlayRow | null>;
  upsertWarehouse(input: UpsertWarehouseOverlay): Promise<WarehouseOverlayRow>;
  listItemGroups(): Promise<ItemGroupOverlayRow[]>;
  findItemGroup(code: string): Promise<ItemGroupOverlayRow | null>;
  upsertItemGroup(input: UpsertItemGroupOverlay): Promise<ItemGroupOverlayRow>;
  listUnits(): Promise<UnitOverlayRow[]>;
  findUnit(code: string): Promise<UnitOverlayRow | null>;
  upsertUnit(input: UpsertUnitOverlay): Promise<UnitOverlayRow>;
  listCurrencies(): Promise<CurrencyOverlayRow[]>;
  findCurrency(code: string): Promise<CurrencyOverlayRow | null>;
  upsertCurrency(input: UpsertCurrencyOverlay): Promise<CurrencyOverlayRow>;
}
