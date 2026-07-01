import { Injectable } from '@nestjs/common';
import type { BindParameters } from 'oracledb';
import { OracleService } from '../../../infrastructure/oracle/oracle.service';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import {
  DefaultSetting,
  MachineSettings,
  SettingOverride,
  SettingsRepository,
} from '../domain/ports/settings-repository.port';

/**
 * OracleSettingsRepository — reads the LIVE YSPOS23 settings tables through the
 * READ-ONLY MOTECH_RO connection (OracleService), and reads/writes the local
 * MOTECH_POS.SETTINGS_OVERLAY through the WRITE connection (OracleWriteService).
 *
 * YSPOS23 is SACRED read-only: no INSERT/UPDATE/DELETE ever runs there. All
 * mutations land only in MOTECH_POS. Every statement is schema-qualified and
 * uses bind variables (no string concatenation).
 */
@Injectable()
export class OracleSettingsRepository implements SettingsRepository {
  constructor(
    private readonly oracle: OracleService,
    private readonly write: OracleWriteService,
  ) {}

  private get schema(): string {
    return this.oracle.schema();
  }

  async readLiveSettings(): Promise<{
    para: Record<string, unknown> | null;
    defaults: DefaultSetting[];
  }> {
    // IAS_PARA_POS is a single-row parameters profile. Select the columns we
    // project (explicit list — no SELECT * — so the shape is stable).
    const para = await this.oracle.queryOne<Record<string, unknown>>(
      `SELECT SETTING_NAME, CURR_DFLT, PRICE_LEVEL, POS_PRICING_TYPE, FTR_BILL,
              MACHINE_DIGIT, USER_DIGIT, SERIAL_DIGIT, POS_BILL_SERIAL,
              PRINT_BILL, PRINT_BILL_B4SAV, OPEN_DRAWER,
              USE_HUNG_BILLS, MAXHUNGS, ALLOW_PRINT_HUNG_BILL,
              ROUND_AMT_FRCTION, USE_CHECK_SUM, RETURN_PERIOD, CHANGE_PERIOD,
              USE_POS_POINT_SYS, POINT_CALC_TYP,
              USE_SALE_ORDER, USE_DISC_CARD, ALLOW_CHANGE_BILL_CURR
       FROM ${this.schema}.IAS_PARA_POS
       WHERE ROWNUM = 1`,
    );

    type DfltRow = { STNG_NO: number; STNG_VAL: string | null; COMNT: string | null };
    const dfltRows = await this.oracle.query<DfltRow>(
      `SELECT STNG_NO, STNG_VAL, COMNT
       FROM ${this.schema}.POS_DFLT_STNG_MST
       WHERE NVL(INACTIVE, 0) = 0
       ORDER BY STNG_NO`,
    );
    const defaults: DefaultSetting[] = dfltRows.map((r) => ({
      no: Number(r.STNG_NO),
      value: r.STNG_VAL,
      comment: r.COMNT,
    }));

    return { para, defaults };
  }

  async readOverlay(): Promise<Map<string, string | null>> {
    type Row = { SETTING_KEY: string; SETTING_VALUE: string | null };
    const rows = await this.write.query<Row>(
      `SELECT SETTING_KEY, SETTING_VALUE FROM ${this.write.schema()}.SETTINGS_OVERLAY`,
    );
    const map = new Map<string, string | null>();
    for (const r of rows) map.set(r.SETTING_KEY, r.SETTING_VALUE);
    return map;
  }

  async readMachine(machineNo: number): Promise<MachineSettings | null> {
    type Row = {
      MACHINE_NO: number;
      TERMINAL: string | null;
      DEF_BRN_NO: number | null;
      PRICE_LEVEL: number | null;
      USE_VAT: number | null;
      CURR_DFLT: string | null;
      SALE_SER: number | null;
      RT_SALE_SER: number | null;
      RETURN_PERIOD: number | null;
      CHANGE_PERIOD: number | null;
      ADDRESS: string | null;
      ADDRESS_F: string | null;
      TEL_NO: string | null;
      FAX_NO: string | null;
      E_MAIL: string | null;
      BILL_FTR_REP: string | null;
      USE_SHOP_FLG: number | null;
      INACTIVE: number | null;
    };
    const row = await this.oracle.queryOne<Row>(
      `SELECT MACHINE_NO, TERMINAL, DEF_BRN_NO, PRICE_LEVEL, USE_VAT, CURR_DFLT,
              SALE_SER, RT_SALE_SER, RETURN_PERIOD, CHANGE_PERIOD,
              ADDRESS, ADDRESS_F, TEL_NO, FAX_NO, E_MAIL, BILL_FTR_REP,
              USE_SHOP_FLG, INACTIVE
       FROM ${this.schema}.IAS_POS_MACHINE
       WHERE MACHINE_NO = :no`,
      { no: machineNo } as BindParameters,
    );
    if (!row) return null;
    const bool = (v: number | null): boolean | null =>
      v == null ? null : Number(v) !== 0;
    const num = (v: number | null): number | null =>
      v == null ? null : Number(v);
    return {
      machineNo: Number(row.MACHINE_NO),
      terminal: row.TERMINAL,
      branchNo: num(row.DEF_BRN_NO),
      priceLevel: num(row.PRICE_LEVEL),
      useVat: bool(row.USE_VAT),
      currency: row.CURR_DFLT,
      saleSerial: num(row.SALE_SER),
      rtSaleSerial: num(row.RT_SALE_SER),
      returnPeriod: num(row.RETURN_PERIOD),
      changePeriod: num(row.CHANGE_PERIOD),
      address: row.ADDRESS,
      addressForeign: row.ADDRESS_F,
      telNo: row.TEL_NO,
      faxNo: row.FAX_NO,
      email: row.E_MAIL,
      billFooter: row.BILL_FTR_REP,
      useShop: bool(row.USE_SHOP_FLG),
      inactive: bool(row.INACTIVE),
    };
  }

  async writeOverlay(
    overrides: SettingOverride[],
    updatedBy: number | null,
  ): Promise<number> {
    if (overrides.length === 0) return 0;
    const table = `${this.write.schema()}.SETTINGS_OVERLAY`;
    return this.write.withTransaction(async (conn) => {
      let count = 0;
      for (const o of overrides) {
        if (o.value === null) {
          // Clearing an override reverts to the live YSPOS23 value.
          await conn.execute(
            `DELETE FROM ${table} WHERE SETTING_KEY = :k`,
            { k: o.key } as BindParameters,
          );
        } else {
          // MERGE = idempotent upsert (one current value per key).
          await conn.execute(
            `MERGE INTO ${table} t
             USING (SELECT :k AS SETTING_KEY FROM DUAL) s
             ON (t.SETTING_KEY = s.SETTING_KEY)
             WHEN MATCHED THEN
               UPDATE SET t.SETTING_VALUE = :v,
                          t.UPDATED_BY = :u,
                          t.UPDATED_AT = SYSTIMESTAMP
             WHEN NOT MATCHED THEN
               INSERT (SETTING_KEY, SETTING_VALUE, UPDATED_BY, UPDATED_AT)
               VALUES (:k, :v, :u, SYSTIMESTAMP)`,
            { k: o.key, v: o.value, u: updatedBy } as BindParameters,
          );
        }
        count++;
      }
      return count;
    });
  }
}
