import { Injectable } from '@nestjs/common';
import oracledb, { type BindParameters } from 'oracledb';
import { OracleService } from '../../../infrastructure/oracle/oracle.service';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import {
  AddKeypadKeyInput,
  KeypadKeyRow,
  KeypadRow,
  KeypadsRepository,
  UpsertKeypadInput,
} from '../domain/ports/keypads.port';

interface PadRow {
  ID: string;
  KEYPAD_NO: number;
  AR_NAME: string | null;
  EN_NAME: string | null;
  INACTIVE: number;
  KEY_COUNT: number;
}

interface KeyRow {
  ID: string;
  KEYPAD_NO: number;
  GRP_NO: number;
  GRP_NAME: string | null;
  I_CODE: string;
  POS_NO: number | null;
  COLOR: string | null;
  LABEL: string | null;
  I_NAME: string | null;
  LIST_PRICE: number | null;
}

/**
 * OracleKeypadsRepository — POSI002/POSI003 extra touch keypads.
 * The live YSPOS23 keypad tables (IAS_POS_EXTRA_KEYPAD / IAS_POS_KEY_BRD_*)
 * are EMPTY, so MOTECH_POS.KEYPADS/KEYPAD_KEYS (V016) are authoritative.
 * Item names/prices are resolved read-only from the ERP master at read time.
 */
@Injectable()
export class OracleKeypadsRepository implements KeypadsRepository {
  constructor(
    private readonly readDb: OracleService,
    private readonly writeDb: OracleWriteService,
  ) {}

  private get schema(): string {
    return this.writeDb.schema();
  }

  private get masterSchema(): string {
    return this.readDb.masterSchema();
  }

  async list(): Promise<KeypadRow[]> {
    const rows = await this.writeDb.query<PadRow>(
      `SELECT k.ID, k.KEYPAD_NO, k.AR_NAME, k.EN_NAME, k.INACTIVE,
              NVL(c.CNT, 0) AS KEY_COUNT
       FROM ${this.schema}.KEYPADS k
       LEFT JOIN (
         SELECT KEYPAD_NO, COUNT(*) AS CNT
         FROM ${this.schema}.KEYPAD_KEYS
         GROUP BY KEYPAD_NO
       ) c ON c.KEYPAD_NO = k.KEYPAD_NO
       ORDER BY k.KEYPAD_NO`,
    );
    return rows.map((r) => this.mapPad(r));
  }

  async find(keypadNo: number): Promise<KeypadRow | null> {
    const row = await this.writeDb.queryOne<PadRow>(
      `SELECT k.ID, k.KEYPAD_NO, k.AR_NAME, k.EN_NAME, k.INACTIVE,
              NVL(c.CNT, 0) AS KEY_COUNT
       FROM ${this.schema}.KEYPADS k
       LEFT JOIN (
         SELECT KEYPAD_NO, COUNT(*) AS CNT
         FROM ${this.schema}.KEYPAD_KEYS
         GROUP BY KEYPAD_NO
       ) c ON c.KEYPAD_NO = k.KEYPAD_NO
       WHERE k.KEYPAD_NO = :no`,
      { no: keypadNo },
    );
    return row ? this.mapPad(row) : null;
  }

  async nextKeypadNo(): Promise<number> {
    const row = await this.writeDb.queryOne<{ MX: number | null }>(
      `SELECT MAX(KEYPAD_NO) AS MX FROM ${this.schema}.KEYPADS`,
    );
    const mx = row?.MX == null ? 0 : Number(row.MX);
    return mx + 1;
  }

  async upsert(input: UpsertKeypadInput): Promise<KeypadRow> {
    await this.writeDb.execute(
      `MERGE INTO ${this.schema}.KEYPADS t
       USING (SELECT :no AS KEYPAD_NO FROM DUAL) s
       ON (t.KEYPAD_NO = s.KEYPAD_NO)
       WHEN MATCHED THEN UPDATE SET
         AR_NAME    = COALESCE(:arName, t.AR_NAME),
         EN_NAME    = COALESCE(:enName, t.EN_NAME),
         INACTIVE   = COALESCE(:inactive, t.INACTIVE),
         UPDATED_AT = SYSTIMESTAMP
       WHEN NOT MATCHED THEN INSERT (ID, KEYPAD_NO, AR_NAME, EN_NAME, INACTIVE)
       VALUES (:id, :no, :arName, :enName, NVL(:inactive, 0))`,
      {
        id: uuidv7(),
        no: input.keypadNo,
        arName: input.arName ?? null,
        enName: input.enName ?? null,
        // Explicit NUMBER: a null bind defaults to STRING which breaks
        // COALESCE(:x, NUMBER_col) with ORA-00932.
        inactive: {
          val: input.inactive == null ? null : input.inactive ? 1 : 0,
          type: oracledb.NUMBER,
        },
      } as BindParameters,
    );
    const row = await this.find(input.keypadNo);
    if (!row) throw new Error(`Keypad upsert failed: ${input.keypadNo}`);
    return row;
  }

  async listKeys(keypadNo: number): Promise<KeypadKeyRow[]> {
    // Keys live in MOTECH_POS; enrich with the ERP item name + level-1 price.
    const keys = await this.writeDb.query<Omit<KeyRow, 'I_NAME' | 'LIST_PRICE'>>(
      `SELECT ID, KEYPAD_NO, GRP_NO, GRP_NAME, I_CODE, POS_NO, COLOR, LABEL
       FROM ${this.schema}.KEYPAD_KEYS
       WHERE KEYPAD_NO = :no
       ORDER BY GRP_NO, POS_NO NULLS LAST, I_CODE`,
      { no: keypadNo },
    );
    if (keys.length === 0) return [];
    const codes = [...new Set(keys.map((k) => k.I_CODE))];
    const binds: Record<string, unknown> = {};
    const names = codes.map((c, i) => {
      binds[`c${i}`] = c;
      return `:c${i}`;
    });
    const enrich = await this.readDb.query<{
      I_CODE: string;
      I_NAME: string | null;
      LIST_PRICE: number | null;
    }>(
      `SELECT m.I_CODE, m.I_NAME, p.I_PRICE AS LIST_PRICE
       FROM ${this.masterSchema}.IAS_ITM_MST m
       LEFT JOIN (
         SELECT I_CODE, MIN(I_PRICE) KEEP (DENSE_RANK FIRST ORDER BY P_SIZE) AS I_PRICE
         FROM ${this.masterSchema}.IAS_ITEM_PRICE
         WHERE LEV_NO = 1
         GROUP BY I_CODE
       ) p ON p.I_CODE = m.I_CODE
       WHERE m.I_CODE IN (${names.join(',')})`,
      binds as BindParameters,
    );
    const info = new Map(enrich.map((e) => [e.I_CODE, e]));
    return keys.map((k) => {
      const e = info.get(k.I_CODE);
      return {
        id: k.ID,
        keypadNo: Number(k.KEYPAD_NO),
        grpNo: Number(k.GRP_NO),
        grpName: k.GRP_NAME ?? null,
        itemCode: k.I_CODE,
        itemName: e?.I_NAME ?? null,
        price: e?.LIST_PRICE == null ? null : Number(e.LIST_PRICE),
        posNo: k.POS_NO == null ? null : Number(k.POS_NO),
        color: k.COLOR ?? null,
        label: k.LABEL ?? null,
      };
    });
  }

  async addKey(input: AddKeypadKeyInput): Promise<KeypadKeyRow> {
    const id = uuidv7();
    await this.writeDb.execute(
      `INSERT INTO ${this.schema}.KEYPAD_KEYS
         (ID, KEYPAD_NO, GRP_NO, GRP_NAME, I_CODE, POS_NO, COLOR, LABEL)
       VALUES (:id, :no, :grpNo, :grpName, :iCode, :posNo, :color, :label)`,
      {
        id,
        no: input.keypadNo,
        grpNo: input.grpNo ?? 1,
        grpName: input.grpName ?? null,
        iCode: input.itemCode,
        posNo: input.posNo ?? null,
        color: input.color ?? null,
        label: input.label ?? null,
      } as BindParameters,
    );
    const rows = await this.listKeys(input.keypadNo);
    const row = rows.find((r) => r.id === id);
    if (!row) throw new Error(`Keypad key insert failed: ${input.itemCode}`);
    return row;
  }

  async removeKey(id: string): Promise<boolean> {
    const r = await this.writeDb.execute(
      `DELETE FROM ${this.schema}.KEYPAD_KEYS WHERE ID = :id`,
      { id },
    );
    return (r.rowsAffected ?? 0) > 0;
  }

  private mapPad(r: PadRow): KeypadRow {
    return {
      id: r.ID,
      keypadNo: Number(r.KEYPAD_NO),
      arName: r.AR_NAME ?? null,
      enName: r.EN_NAME ?? null,
      inactive: Number(r.INACTIVE ?? 0) === 1,
      keyCount: Number(r.KEY_COUNT ?? 0),
    };
  }
}
