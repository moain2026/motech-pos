import { Injectable } from '@nestjs/common';
import oracledb from 'oracledb';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import {
  PosConfigRepository,
  ScaleDefinitionRow,
  ShortcutRow,
  UpsertScaleDefinition,
  UpsertShortcut,
} from '../domain/ports/pos-config.port';

const num = (v: number | null | undefined) => ({
  val: v ?? null,
  type: oracledb.NUMBER,
});

/**
 * OraclePosConfigRepository — MOTECH_POS.POS_SHORTCUTS + SCALE_DEFINITIONS
 * (V029). Writes only to our own schema (via MOTECH_RW); the live ERP is
 * untouched. Every statement is bind-parameterized and schema-qualified.
 */
@Injectable()
export class OraclePosConfigRepository implements PosConfigRepository {
  constructor(private readonly db: OracleWriteService) {}

  private get schema(): string {
    return this.db.schema();
  }

  //==========================================================================
  // Shortcuts (POS_SHORTCUTS)
  //==========================================================================
  private mapShortcut(r: Record<string, unknown>): ShortcutRow {
    return {
      id: r.ID as string,
      action: r.ACTION as string,
      keyCombo: r.KEY_COMBO as string,
      arLabel: (r.AR_LABEL as string) ?? null,
      sortOrder: Number(r.SORT_ORDER ?? 100),
      enabled: Number(r.ENABLED ?? 1) === 1,
    };
  }

  async listShortcuts(): Promise<ShortcutRow[]> {
    const rows = await this.db.query(
      `SELECT ID, ACTION, KEY_COMBO, AR_LABEL, SORT_ORDER, ENABLED
         FROM ${this.schema}.POS_SHORTCUTS ORDER BY SORT_ORDER, ACTION`,
    );
    return rows.map((r) => this.mapShortcut(r));
  }

  async upsertShortcut(input: UpsertShortcut): Promise<ShortcutRow> {
    await this.db.execute(
      `MERGE INTO ${this.schema}.POS_SHORTCUTS t
       USING (SELECT :action AS ACTION FROM DUAL) s
       ON (t.ACTION = s.ACTION)
       WHEN MATCHED THEN UPDATE SET
         KEY_COMBO  = :keyCombo,
         AR_LABEL   = :arLabel,
         SORT_ORDER = COALESCE(:sortOrder, t.SORT_ORDER),
         ENABLED    = COALESCE(:enabled, t.ENABLED),
         UPDATED_AT = SYSTIMESTAMP
       WHEN NOT MATCHED THEN INSERT (ID, ACTION, KEY_COMBO, AR_LABEL, SORT_ORDER, ENABLED)
         VALUES (:id, :action, :keyCombo, :arLabel, COALESCE(:sortOrder, 100), COALESCE(:enabled, 1))`,
      {
        id: uuidv7(),
        action: input.action,
        keyCombo: input.keyCombo,
        arLabel: input.arLabel ?? null,
        sortOrder: num(input.sortOrder),
        enabled: num(
          input.enabled == null ? null : input.enabled ? 1 : 0,
        ),
      },
    );
    const row = await this.db.queryOne(
      `SELECT ID, ACTION, KEY_COMBO, AR_LABEL, SORT_ORDER, ENABLED
         FROM ${this.schema}.POS_SHORTCUTS WHERE ACTION = :a`,
      { a: input.action },
    );
    return this.mapShortcut(row!);
  }

  async deleteShortcut(action: string): Promise<boolean> {
    const r = await this.db.execute(
      `DELETE FROM ${this.schema}.POS_SHORTCUTS WHERE ACTION = :a`,
      { a: action },
    );
    return (r.rowsAffected ?? 0) > 0;
  }

  //==========================================================================
  // Scale definitions (SCALE_DEFINITIONS)
  //==========================================================================
  private readonly scaleCols = `ID, NAME, PREFIX, BARCODE_LENGTH, ITEM_CODE_START,
    ITEM_CODE_LEN, VALUE_LEN, DIVISOR, SCALE_MODE, ENABLED, SORT_ORDER`;

  private mapScale(r: Record<string, unknown>): ScaleDefinitionRow {
    return {
      id: r.ID as string,
      name: r.NAME as string,
      prefix: r.PREFIX as string,
      barcodeLength: Number(r.BARCODE_LENGTH),
      itemCodeStart: Number(r.ITEM_CODE_START ?? 2),
      itemCodeLen: Number(r.ITEM_CODE_LEN),
      valueLen: r.VALUE_LEN == null ? null : Number(r.VALUE_LEN),
      divisor: Number(r.DIVISOR ?? 1000),
      mode: (r.SCALE_MODE as ScaleDefinitionRow['mode']) ?? 'WEIGHT',
      enabled: Number(r.ENABLED ?? 1) === 1,
      sortOrder: Number(r.SORT_ORDER ?? 100),
    };
  }

  async listScales(): Promise<ScaleDefinitionRow[]> {
    const rows = await this.db.query(
      `SELECT ${this.scaleCols} FROM ${this.schema}.SCALE_DEFINITIONS
        ORDER BY SORT_ORDER, NAME`,
    );
    return rows.map((r) => this.mapScale(r));
  }

  async findScale(id: string): Promise<ScaleDefinitionRow | null> {
    const row = await this.db.queryOne(
      `SELECT ${this.scaleCols} FROM ${this.schema}.SCALE_DEFINITIONS WHERE ID = :id`,
      { id },
    );
    return row ? this.mapScale(row) : null;
  }

  async createScale(
    input: UpsertScaleDefinition,
  ): Promise<ScaleDefinitionRow> {
    const id = uuidv7();
    await this.db.execute(
      `INSERT INTO ${this.schema}.SCALE_DEFINITIONS
         (ID, NAME, PREFIX, BARCODE_LENGTH, ITEM_CODE_START, ITEM_CODE_LEN,
          VALUE_LEN, DIVISOR, SCALE_MODE, ENABLED, SORT_ORDER)
       VALUES
         (:id, :name, :prefix, :barcodeLength, COALESCE(:itemCodeStart, 2),
          :itemCodeLen, :valueLen, :divisor, :scaleMode, COALESCE(:enabled, 1),
          COALESCE(:sortOrder, 100))`,
      {
        id,
        name: input.name,
        prefix: input.prefix,
        barcodeLength: num(input.barcodeLength),
        itemCodeStart: num(input.itemCodeStart),
        itemCodeLen: num(input.itemCodeLen),
        valueLen: num(input.valueLen),
        divisor: num(input.divisor),
        scaleMode: input.mode,
        enabled: num(input.enabled == null ? null : input.enabled ? 1 : 0),
        sortOrder: num(input.sortOrder),
      },
    );
    return (await this.findScale(id))!;
  }

  async updateScale(
    id: string,
    input: UpsertScaleDefinition,
  ): Promise<ScaleDefinitionRow | null> {
    const r = await this.db.execute(
      `UPDATE ${this.schema}.SCALE_DEFINITIONS SET
         NAME            = :name,
         PREFIX          = :prefix,
         BARCODE_LENGTH  = :barcodeLength,
         ITEM_CODE_START = COALESCE(:itemCodeStart, ITEM_CODE_START),
         ITEM_CODE_LEN   = :itemCodeLen,
         VALUE_LEN       = :valueLen,
         DIVISOR         = :divisor,
         SCALE_MODE      = :scaleMode,
         ENABLED         = COALESCE(:enabled, ENABLED),
         SORT_ORDER      = COALESCE(:sortOrder, SORT_ORDER),
         UPDATED_AT      = SYSTIMESTAMP
       WHERE ID = :id`,
      {
        id,
        name: input.name,
        prefix: input.prefix,
        barcodeLength: num(input.barcodeLength),
        itemCodeStart: num(input.itemCodeStart),
        itemCodeLen: num(input.itemCodeLen),
        valueLen: num(input.valueLen),
        divisor: num(input.divisor),
        scaleMode: input.mode,
        enabled: num(input.enabled == null ? null : input.enabled ? 1 : 0),
        sortOrder: num(input.sortOrder),
      },
    );
    if ((r.rowsAffected ?? 0) === 0) return null;
    return this.findScale(id);
  }

  async deleteScale(id: string): Promise<boolean> {
    const r = await this.db.execute(
      `DELETE FROM ${this.schema}.SCALE_DEFINITIONS WHERE ID = :id`,
      { id },
    );
    return (r.rowsAffected ?? 0) > 0;
  }
}
