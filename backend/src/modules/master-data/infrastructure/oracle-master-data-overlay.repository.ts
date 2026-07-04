import { Injectable } from '@nestjs/common';
import oracledb, { type BindParameters } from 'oracledb';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import {
  CurrencyOverlayRow,
  ItemGroupOverlayRow,
  MasterDataOverlayRepository,
  UnitOverlayRow,
  UpsertCurrencyOverlay,
  UpsertItemGroupOverlay,
  UpsertUnitOverlay,
  UpsertWarehouseOverlay,
  WarehouseOverlayRow,
} from '../domain/ports/master-data.port';

const b01 = (v: boolean | null | undefined): number | null =>
  v == null ? null : v ? 1 : 0;

/**
 * NUMBER-typed bind: a JS null bind defaults to STRING which breaks
 * COALESCE(:x, NUMBER_col) with ORA-00932 — always send explicit NUMBER.
 */
const num = (v: number | null | undefined) => ({
  val: v ?? null,
  type: oracledb.NUMBER,
});

/**
 * OracleMasterDataOverlayRepository — creates/edits for warehouses, item
 * groups, units and currencies in MOTECH_POS.*_OVERLAY (V016). Writes ONLY
 * to our own schema; the live ERP masters are never mutated.
 */
@Injectable()
export class OracleMasterDataOverlayRepository
  implements MasterDataOverlayRepository
{
  constructor(private readonly db: OracleWriteService) {}

  private get schema(): string {
    return this.db.schema();
  }

  //==========================================================================
  // Warehouses (WAREHOUSES_OVERLAY)
  //==========================================================================
  private readonly whCols = `ID, W_CODE, ORIGIN, AR_NAME, EN_NAME, LOCATION,
    TEL, KEEPER, NO_SALE, PRICE_LEVEL, INACTIVE`;

  private mapWh(r: Record<string, unknown>): WarehouseOverlayRow {
    return {
      id: r.ID as string,
      code: Number(r.W_CODE),
      origin: r.ORIGIN as 'LOCAL' | 'EDIT',
      arName: (r.AR_NAME as string) ?? null,
      enName: (r.EN_NAME as string) ?? null,
      location: (r.LOCATION as string) ?? null,
      tel: (r.TEL as string) ?? null,
      keeper: (r.KEEPER as string) ?? null,
      noSale: r.NO_SALE == null ? null : Number(r.NO_SALE) === 1,
      priceLevel: r.PRICE_LEVEL == null ? null : Number(r.PRICE_LEVEL),
      inactive: Number(r.INACTIVE ?? 0) === 1,
    };
  }

  async listWarehouses(): Promise<WarehouseOverlayRow[]> {
    const rows = await this.db.query(
      `SELECT ${this.whCols} FROM ${this.schema}.WAREHOUSES_OVERLAY ORDER BY W_CODE`,
    );
    return rows.map((r) => this.mapWh(r));
  }

  async findWarehouse(code: number): Promise<WarehouseOverlayRow | null> {
    const row = await this.db.queryOne(
      `SELECT ${this.whCols} FROM ${this.schema}.WAREHOUSES_OVERLAY WHERE W_CODE = :c`,
      { c: code },
    );
    return row ? this.mapWh(row) : null;
  }

  async upsertWarehouse(
    input: UpsertWarehouseOverlay,
  ): Promise<WarehouseOverlayRow> {
    await this.db.execute(
      `MERGE INTO ${this.schema}.WAREHOUSES_OVERLAY t
       USING (SELECT :code AS W_CODE FROM DUAL) s
       ON (t.W_CODE = s.W_CODE)
       WHEN MATCHED THEN UPDATE SET
         AR_NAME     = COALESCE(:arName, t.AR_NAME),
         EN_NAME     = COALESCE(:enName, t.EN_NAME),
         LOCATION    = COALESCE(:location, t.LOCATION),
         TEL         = COALESCE(:tel, t.TEL),
         KEEPER      = COALESCE(:keeper, t.KEEPER),
         NO_SALE     = COALESCE(:noSale, t.NO_SALE),
         PRICE_LEVEL = COALESCE(:priceLevel, t.PRICE_LEVEL),
         INACTIVE    = COALESCE(:inactive, t.INACTIVE),
         UPDATED_AT  = SYSTIMESTAMP
       WHEN NOT MATCHED THEN INSERT
         (ID, W_CODE, ORIGIN, AR_NAME, EN_NAME, LOCATION, TEL, KEEPER,
          NO_SALE, PRICE_LEVEL, INACTIVE)
       VALUES
         (:id, :code, :origin, :arName, :enName, :location, :tel, :keeper,
          :noSale, :priceLevel, NVL(:inactive, 0))`,
      {
        id: uuidv7(),
        code: input.code,
        origin: input.origin,
        arName: input.arName ?? null,
        enName: input.enName ?? null,
        location: input.location ?? null,
        tel: input.tel ?? null,
        keeper: input.keeper ?? null,
        noSale: num(b01(input.noSale)),
        priceLevel: num(input.priceLevel),
        inactive: num(b01(input.inactive)),
      } as BindParameters,
    );
    const row = await this.findWarehouse(input.code);
    if (!row) throw new Error(`Warehouse overlay upsert failed: ${input.code}`);
    return row;
  }

  //==========================================================================
  // Item groups (ITEM_GROUPS_OVERLAY)
  //==========================================================================
  private readonly grpCols = `ID, G_CODE, ORIGIN, AR_NAME, EN_NAME,
    TAX_PERCENT, ALLOW_DISC, SORT_ORDER, INACTIVE`;

  private mapGrp(r: Record<string, unknown>): ItemGroupOverlayRow {
    return {
      id: r.ID as string,
      code: r.G_CODE as string,
      origin: r.ORIGIN as 'LOCAL' | 'EDIT',
      arName: (r.AR_NAME as string) ?? null,
      enName: (r.EN_NAME as string) ?? null,
      taxPercent: r.TAX_PERCENT == null ? null : Number(r.TAX_PERCENT),
      allowDiscount: r.ALLOW_DISC == null ? null : Number(r.ALLOW_DISC) === 1,
      sortOrder: r.SORT_ORDER == null ? null : Number(r.SORT_ORDER),
      inactive: Number(r.INACTIVE ?? 0) === 1,
    };
  }

  async listItemGroups(): Promise<ItemGroupOverlayRow[]> {
    const rows = await this.db.query(
      `SELECT ${this.grpCols} FROM ${this.schema}.ITEM_GROUPS_OVERLAY ORDER BY G_CODE`,
    );
    return rows.map((r) => this.mapGrp(r));
  }

  async findItemGroup(code: string): Promise<ItemGroupOverlayRow | null> {
    const row = await this.db.queryOne(
      `SELECT ${this.grpCols} FROM ${this.schema}.ITEM_GROUPS_OVERLAY WHERE G_CODE = :c`,
      { c: code },
    );
    return row ? this.mapGrp(row) : null;
  }

  async upsertItemGroup(
    input: UpsertItemGroupOverlay,
  ): Promise<ItemGroupOverlayRow> {
    await this.db.execute(
      `MERGE INTO ${this.schema}.ITEM_GROUPS_OVERLAY t
       USING (SELECT :code AS G_CODE FROM DUAL) s
       ON (t.G_CODE = s.G_CODE)
       WHEN MATCHED THEN UPDATE SET
         AR_NAME     = COALESCE(:arName, t.AR_NAME),
         EN_NAME     = COALESCE(:enName, t.EN_NAME),
         TAX_PERCENT = COALESCE(:taxPercent, t.TAX_PERCENT),
         ALLOW_DISC  = COALESCE(:allowDisc, t.ALLOW_DISC),
         SORT_ORDER  = COALESCE(:sortOrder, t.SORT_ORDER),
         INACTIVE    = COALESCE(:inactive, t.INACTIVE),
         UPDATED_AT  = SYSTIMESTAMP
       WHEN NOT MATCHED THEN INSERT
         (ID, G_CODE, ORIGIN, AR_NAME, EN_NAME, TAX_PERCENT, ALLOW_DISC,
          SORT_ORDER, INACTIVE)
       VALUES
         (:id, :code, :origin, :arName, :enName, :taxPercent, :allowDisc,
          :sortOrder, NVL(:inactive, 0))`,
      {
        id: uuidv7(),
        code: input.code,
        origin: input.origin,
        arName: input.arName ?? null,
        enName: input.enName ?? null,
        taxPercent: num(input.taxPercent),
        allowDisc: num(b01(input.allowDiscount)),
        sortOrder: num(input.sortOrder),
        inactive: num(b01(input.inactive)),
      } as BindParameters,
    );
    const row = await this.findItemGroup(input.code);
    if (!row) throw new Error(`Item group overlay upsert failed: ${input.code}`);
    return row;
  }

  //==========================================================================
  // Units (UNITS_OVERLAY)
  //==========================================================================
  private readonly unitCols = `ID, CODE, ORIGIN, AR_NAME, EN_NAME, DFLT_SIZE,
    INACTIVE`;

  private mapUnit(r: Record<string, unknown>): UnitOverlayRow {
    return {
      id: r.ID as string,
      code: r.CODE as string,
      origin: r.ORIGIN as 'LOCAL' | 'EDIT',
      arName: (r.AR_NAME as string) ?? null,
      enName: (r.EN_NAME as string) ?? null,
      defaultSize: r.DFLT_SIZE == null ? null : Number(r.DFLT_SIZE),
      inactive: Number(r.INACTIVE ?? 0) === 1,
    };
  }

  async listUnits(): Promise<UnitOverlayRow[]> {
    const rows = await this.db.query(
      `SELECT ${this.unitCols} FROM ${this.schema}.UNITS_OVERLAY ORDER BY CODE`,
    );
    return rows.map((r) => this.mapUnit(r));
  }

  async findUnit(code: string): Promise<UnitOverlayRow | null> {
    const row = await this.db.queryOne(
      `SELECT ${this.unitCols} FROM ${this.schema}.UNITS_OVERLAY WHERE CODE = :c`,
      { c: code },
    );
    return row ? this.mapUnit(row) : null;
  }

  async upsertUnit(input: UpsertUnitOverlay): Promise<UnitOverlayRow> {
    await this.db.execute(
      `MERGE INTO ${this.schema}.UNITS_OVERLAY t
       USING (SELECT :code AS CODE FROM DUAL) s
       ON (t.CODE = s.CODE)
       WHEN MATCHED THEN UPDATE SET
         AR_NAME    = COALESCE(:arName, t.AR_NAME),
         EN_NAME    = COALESCE(:enName, t.EN_NAME),
         DFLT_SIZE  = COALESCE(:dfltSize, t.DFLT_SIZE),
         INACTIVE   = COALESCE(:inactive, t.INACTIVE),
         UPDATED_AT = SYSTIMESTAMP
       WHEN NOT MATCHED THEN INSERT
         (ID, CODE, ORIGIN, AR_NAME, EN_NAME, DFLT_SIZE, INACTIVE)
       VALUES
         (:id, :code, :origin, :arName, :enName, :dfltSize, NVL(:inactive, 0))`,
      {
        id: uuidv7(),
        code: input.code,
        origin: input.origin,
        arName: input.arName ?? null,
        enName: input.enName ?? null,
        dfltSize: num(input.defaultSize),
        inactive: num(b01(input.inactive)),
      } as BindParameters,
    );
    const row = await this.findUnit(input.code);
    if (!row) throw new Error(`Unit overlay upsert failed: ${input.code}`);
    return row;
  }

  //==========================================================================
  // Currencies (CURRENCIES_OVERLAY)
  //==========================================================================
  private readonly curCols = `ID, CUR_CODE, ORIGIN, AR_NAME, EN_NAME, RATE,
    RATE_POS, FRACTION_NO, IS_LOCAL, INACTIVE`;

  private mapCur(r: Record<string, unknown>): CurrencyOverlayRow {
    return {
      id: r.ID as string,
      code: r.CUR_CODE as string,
      origin: r.ORIGIN as 'LOCAL' | 'EDIT',
      arName: (r.AR_NAME as string) ?? null,
      enName: (r.EN_NAME as string) ?? null,
      rate: r.RATE == null ? null : Number(r.RATE),
      ratePos: r.RATE_POS == null ? null : Number(r.RATE_POS),
      fractionNo: r.FRACTION_NO == null ? null : Number(r.FRACTION_NO),
      isLocal: r.IS_LOCAL == null ? null : Number(r.IS_LOCAL) === 1,
      inactive: Number(r.INACTIVE ?? 0) === 1,
    };
  }

  async listCurrencies(): Promise<CurrencyOverlayRow[]> {
    const rows = await this.db.query(
      `SELECT ${this.curCols} FROM ${this.schema}.CURRENCIES_OVERLAY ORDER BY CUR_CODE`,
    );
    return rows.map((r) => this.mapCur(r));
  }

  async findCurrency(code: string): Promise<CurrencyOverlayRow | null> {
    const row = await this.db.queryOne(
      `SELECT ${this.curCols} FROM ${this.schema}.CURRENCIES_OVERLAY WHERE CUR_CODE = :c`,
      { c: code },
    );
    return row ? this.mapCur(row) : null;
  }

  async upsertCurrency(
    input: UpsertCurrencyOverlay,
  ): Promise<CurrencyOverlayRow> {
    await this.db.execute(
      `MERGE INTO ${this.schema}.CURRENCIES_OVERLAY t
       USING (SELECT :code AS CUR_CODE FROM DUAL) s
       ON (t.CUR_CODE = s.CUR_CODE)
       WHEN MATCHED THEN UPDATE SET
         AR_NAME     = COALESCE(:arName, t.AR_NAME),
         EN_NAME     = COALESCE(:enName, t.EN_NAME),
         RATE        = COALESCE(:rate, t.RATE),
         RATE_POS    = COALESCE(:ratePos, t.RATE_POS),
         FRACTION_NO = COALESCE(:fractionNo, t.FRACTION_NO),
         IS_LOCAL    = COALESCE(:isLocal, t.IS_LOCAL),
         INACTIVE    = COALESCE(:inactive, t.INACTIVE),
         UPDATED_AT  = SYSTIMESTAMP
       WHEN NOT MATCHED THEN INSERT
         (ID, CUR_CODE, ORIGIN, AR_NAME, EN_NAME, RATE, RATE_POS, FRACTION_NO,
          IS_LOCAL, INACTIVE)
       VALUES
         (:id, :code, :origin, :arName, :enName, :rate, :ratePos, :fractionNo,
          :isLocal, NVL(:inactive, 0))`,
      {
        id: uuidv7(),
        code: input.code,
        origin: input.origin,
        arName: input.arName ?? null,
        enName: input.enName ?? null,
        rate: num(input.rate),
        ratePos: num(input.ratePos),
        fractionNo: num(input.fractionNo),
        isLocal: num(b01(input.isLocal)),
        inactive: num(b01(input.inactive)),
      } as BindParameters,
    );
    const row = await this.findCurrency(input.code);
    if (!row) throw new Error(`Currency overlay upsert failed: ${input.code}`);
    return row;
  }
}
