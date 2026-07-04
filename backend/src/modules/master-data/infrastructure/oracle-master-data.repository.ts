import { Injectable } from '@nestjs/common';
import { OracleService } from '../../../infrastructure/oracle/oracle.service';
import {
  CurrencyRow,
  ItemGroupRow,
  MasterDataRepository,
  UnitRow,
  WarehouseRow,
} from '../domain/ports/master-data.port';

/**
 * OracleMasterDataRepository — READ-ONLY reads of the live ERP master data:
 *   - IAS202623.WAREHOUSE_DETAILS (2 rows)  → warehouses (POSI003)
 *   - IAS202623.GROUP_DETAILS     (23 rows) → item groups (POSI004)
 *   - IAS202623.MEASUREMENT       (25 rows) → units of measure (POSI005)
 *   - IAS202623.EX_RATE           (3 rows)  → currencies + rates (POSI011)
 * MOTECH_RO connection; schema-qualified SQL only.
 */
@Injectable()
export class OracleMasterDataRepository implements MasterDataRepository {
  constructor(private readonly oracle: OracleService) {}

  private get masterSchema(): string {
    return this.oracle.masterSchema();
  }

  //==========================================================================
  // Warehouses
  //==========================================================================
  private readonly whCols = `W_CODE, W_NAME, W_E_NAME, LOCATION, TEL_NO,
    WH_KEEPER, NVL(NO_SALE, 0) AS NO_SALE, PRICE_LVL,
    NVL(INACTIVE, 0) AS INACTIVE`;

  private mapWarehouse(r: Record<string, unknown>): WarehouseRow {
    return {
      code: Number(r.W_CODE),
      arName: (r.W_NAME as string) ?? null,
      enName: (r.W_E_NAME as string) ?? null,
      location: (r.LOCATION as string) ?? null,
      tel: (r.TEL_NO as string) ?? null,
      keeper: (r.WH_KEEPER as string) ?? null,
      noSale: Number(r.NO_SALE ?? 0) === 1,
      priceLevel: r.PRICE_LVL == null ? null : Number(r.PRICE_LVL),
      inactive: Number(r.INACTIVE ?? 0) === 1,
    };
  }

  async listWarehouses(): Promise<WarehouseRow[]> {
    const rows = await this.oracle.query(
      `SELECT ${this.whCols}
       FROM ${this.masterSchema}.WAREHOUSE_DETAILS
       ORDER BY W_CODE`,
    );
    return rows.map((r) => this.mapWarehouse(r));
  }

  async findWarehouse(code: number): Promise<WarehouseRow | null> {
    const row = await this.oracle.queryOne(
      `SELECT ${this.whCols}
       FROM ${this.masterSchema}.WAREHOUSE_DETAILS
       WHERE W_CODE = :c`,
      { c: code },
    );
    return row ? this.mapWarehouse(row) : null;
  }

  //==========================================================================
  // Item groups
  //==========================================================================
  private readonly grpSql = (where: string) => `
    SELECT g.G_CODE, g.G_A_NAME, g.G_E_NAME, g.TAX_PRCNT_DFLT,
           g.ALLOW_DISC_FLG, g.G_ORDR, NVL(c.CNT, 0) AS ITEM_COUNT
    FROM ${this.masterSchema}.GROUP_DETAILS g
    LEFT JOIN (
      SELECT G_CODE, COUNT(*) AS CNT
      FROM ${this.masterSchema}.IAS_ITM_MST
      GROUP BY G_CODE
    ) c ON c.G_CODE = g.G_CODE
    ${where}
    ORDER BY g.G_ORDR NULLS LAST, g.G_CODE`;

  private mapGroup(r: Record<string, unknown>): ItemGroupRow {
    return {
      code: r.G_CODE as string,
      arName: (r.G_A_NAME as string) ?? null,
      enName: (r.G_E_NAME as string) ?? null,
      taxPercent: r.TAX_PRCNT_DFLT == null ? null : Number(r.TAX_PRCNT_DFLT),
      allowDiscount:
        r.ALLOW_DISC_FLG == null ? null : Number(r.ALLOW_DISC_FLG) === 1,
      sortOrder: r.G_ORDR == null ? null : Number(r.G_ORDR),
      itemCount: Number(r.ITEM_COUNT ?? 0),
      inactive: false, // GROUP_DETAILS has no INACTIVE column
    };
  }

  async listItemGroups(): Promise<ItemGroupRow[]> {
    const rows = await this.oracle.query(this.grpSql(''));
    return rows.map((r) => this.mapGroup(r));
  }

  async findItemGroup(code: string): Promise<ItemGroupRow | null> {
    const rows = await this.oracle.query(this.grpSql('WHERE g.G_CODE = :c'), {
      c: code,
    });
    return rows.length ? this.mapGroup(rows[0]) : null;
  }

  //==========================================================================
  // Units of measure
  //==========================================================================
  private readonly unitCols = `MEASURE_CODE, MEASURE, MEASURE_F_NM, DFLT_SIZE`;

  private mapUnit(r: Record<string, unknown>): UnitRow {
    return {
      code: r.MEASURE_CODE as string,
      arName: (r.MEASURE as string) ?? null,
      enName: (r.MEASURE_F_NM as string) ?? null,
      defaultSize: r.DFLT_SIZE == null ? null : Number(r.DFLT_SIZE),
      inactive: false, // MEASUREMENT has no INACTIVE column
    };
  }

  async listUnits(): Promise<UnitRow[]> {
    const rows = await this.oracle.query(
      `SELECT ${this.unitCols}
       FROM ${this.masterSchema}.MEASUREMENT
       ORDER BY MEASURE_CODE`,
    );
    return rows.map((r) => this.mapUnit(r));
  }

  async findUnit(code: string): Promise<UnitRow | null> {
    const row = await this.oracle.queryOne(
      `SELECT ${this.unitCols}
       FROM ${this.masterSchema}.MEASUREMENT
       WHERE MEASURE_CODE = :c`,
      { c: code },
    );
    return row ? this.mapUnit(row) : null;
  }

  //==========================================================================
  // Currencies
  //==========================================================================
  private readonly curCols = `CUR_NO, CUR_CODE, CUR_NAME, CUR_E_NAME,
    CUR_RATE, CUR_RATE_POS, CUR_FRC_NO, NVL(L_F, 0) AS L_F`;

  private mapCurrency(r: Record<string, unknown>): CurrencyRow {
    return {
      code: r.CUR_CODE as string,
      no: r.CUR_NO == null ? null : Number(r.CUR_NO),
      arName: (r.CUR_NAME as string) ?? null,
      enName: (r.CUR_E_NAME as string) ?? null,
      rate: r.CUR_RATE == null ? null : Number(r.CUR_RATE),
      ratePos: r.CUR_RATE_POS == null ? null : Number(r.CUR_RATE_POS),
      fractionNo: r.CUR_FRC_NO == null ? null : Number(r.CUR_FRC_NO),
      isLocal: Number(r.L_F ?? 0) === 1,
      inactive: false, // EX_RATE has no INACTIVE column
    };
  }

  async listCurrencies(): Promise<CurrencyRow[]> {
    const rows = await this.oracle.query(
      `SELECT ${this.curCols}
       FROM ${this.masterSchema}.EX_RATE
       ORDER BY CUR_NO`,
    );
    return rows.map((r) => this.mapCurrency(r));
  }

  async findCurrency(code: string): Promise<CurrencyRow | null> {
    const row = await this.oracle.queryOne(
      `SELECT ${this.curCols}
       FROM ${this.masterSchema}.EX_RATE
       WHERE CUR_CODE = :c`,
      { c: code },
    );
    return row ? this.mapCurrency(row) : null;
  }
}
