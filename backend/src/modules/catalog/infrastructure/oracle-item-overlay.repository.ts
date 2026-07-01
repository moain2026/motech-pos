import { Injectable } from '@nestjs/common';
import oracledb from 'oracledb';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import {
  ItemOverlayRepository,
  ItemOverlayRow,
  UpsertItemOverlayInput,
} from '../domain/ports/item-overlay.port';

interface Row {
  CODE: string;
  ORIGIN: 'LOCAL' | 'EDIT';
  NAME: string | null;
  BARCODE: string | null;
  UNIT: string | null;
  PRICE: number | null;
  VAT_PERCENT: number | null;
  INACTIVE: number;
  CREATED_AT: Date;
  UPDATED_AT: Date;
}

/**
 * OracleItemOverlayRepository — local item creates/edits in
 * MOTECH_POS.ITEMS_OVERLAY. Writes ONLY to our own schema.
 */
@Injectable()
export class OracleItemOverlayRepository implements ItemOverlayRepository {
  constructor(private readonly db: OracleWriteService) {}

  private get schema(): string {
    return this.db.schema();
  }

  private readonly cols = `CODE, ORIGIN, NAME, BARCODE, UNIT, PRICE,
    VAT_PERCENT, INACTIVE, CREATED_AT, UPDATED_AT`;

  async findByCode(code: string): Promise<ItemOverlayRow | null> {
    const row = await this.db.queryOne<Row>(
      `SELECT ${this.cols} FROM ${this.schema}.ITEMS_OVERLAY WHERE CODE = :c`,
      { c: code },
    );
    return row ? this.map(row) : null;
  }

  async findByCodes(codes: string[]): Promise<Map<string, ItemOverlayRow>> {
    const out = new Map<string, ItemOverlayRow>();
    if (codes.length === 0) return out;
    const binds: Record<string, unknown> = {};
    const names = codes.map((c, i) => {
      binds[`c${i}`] = c;
      return `:c${i}`;
    });
    const rows = await this.db.query<Row>(
      `SELECT ${this.cols} FROM ${this.schema}.ITEMS_OVERLAY
       WHERE CODE IN (${names.join(',')})`,
      binds as oracledb.BindParameters,
    );
    for (const r of rows) out.set(r.CODE, this.map(r));
    return out;
  }

  async listLocal(
    search: string | undefined,
    limit: number,
  ): Promise<ItemOverlayRow[]> {
    const binds: Record<string, unknown> = { lim: limit };
    const where: string[] = [`ORIGIN = 'LOCAL'`];
    if (search && search.trim().length > 0) {
      binds.q = `%${search.trim()}%`;
      where.push('(NAME LIKE :q OR CODE LIKE :q OR BARCODE LIKE :q)');
    }
    const rows = await this.db.query<Row>(
      `SELECT * FROM (
         SELECT ${this.cols} FROM ${this.schema}.ITEMS_OVERLAY
         WHERE ${where.join(' AND ')}
         ORDER BY CODE
       ) WHERE ROWNUM <= :lim`,
      binds as oracledb.BindParameters,
    );
    return rows.map((r) => this.map(r));
  }

  async upsert(input: UpsertItemOverlayInput): Promise<ItemOverlayRow> {
    await this.db.execute(
      `MERGE INTO ${this.schema}.ITEMS_OVERLAY t
       USING (SELECT :code AS CODE FROM DUAL) s
       ON (t.CODE = s.CODE)
       WHEN MATCHED THEN UPDATE SET
         ORIGIN = :origin, NAME = :name, BARCODE = :barcode, UNIT = :unit,
         PRICE = :price, VAT_PERCENT = :vatPercent, INACTIVE = :inactive,
         UPDATED_AT = SYSTIMESTAMP
       WHEN NOT MATCHED THEN INSERT
         (ID, CODE, ORIGIN, NAME, BARCODE, UNIT, PRICE, VAT_PERCENT, INACTIVE)
       VALUES
         (:id, :code, :origin, :name, :barcode, :unit, :price, :vatPercent, :inactive)`,
      {
        id: uuidv7(),
        code: input.code,
        origin: input.origin,
        name: input.name ?? null,
        barcode: input.barcode ?? null,
        unit: input.unit ?? null,
        price: input.price ?? null,
        vatPercent: input.vatPercent ?? null,
        inactive: input.inactive ? 1 : 0,
      },
    );
    const row = await this.findByCode(input.code);
    if (!row) throw new Error('upsert: item overlay vanished after commit');
    return row;
  }

  private map(r: Row): ItemOverlayRow {
    return {
      code: r.CODE,
      origin: r.ORIGIN,
      name: r.NAME,
      barcode: r.BARCODE,
      unit: r.UNIT,
      price: r.PRICE == null ? null : Number(r.PRICE),
      vatPercent: r.VAT_PERCENT == null ? null : Number(r.VAT_PERCENT),
      inactive: Number(r.INACTIVE) === 1,
      createdAt: r.CREATED_AT.toISOString(),
      updatedAt: r.UPDATED_AT.toISOString(),
    };
  }
}
