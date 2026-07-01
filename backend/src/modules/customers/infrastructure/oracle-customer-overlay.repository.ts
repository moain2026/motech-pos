import { Injectable } from '@nestjs/common';
import oracledb from 'oracledb';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import {
  CustomerOverlayRepository,
  CustomerOverlayRow,
  UpsertCustomerOverlayInput,
} from '../domain/ports/customer-overlay.port';

interface Row {
  CODE: string;
  ORIGIN: 'LOCAL' | 'EDIT';
  AR_NAME: string | null;
  EN_NAME: string | null;
  MOBILE: string | null;
  WHATSAPP: string | null;
  PHONE: string | null;
  INACTIVE: number;
  CREATED_AT: Date;
  UPDATED_AT: Date;
}

/**
 * OracleCustomerOverlayRepository — local customer creates/edits in
 * MOTECH_POS.CUSTOMERS_OVERLAY. Writes ONLY to our own schema.
 */
@Injectable()
export class OracleCustomerOverlayRepository
  implements CustomerOverlayRepository
{
  constructor(private readonly db: OracleWriteService) {}

  private get schema(): string {
    return this.db.schema();
  }

  private readonly cols = `CODE, ORIGIN, AR_NAME, EN_NAME, MOBILE, WHATSAPP,
    PHONE, INACTIVE, CREATED_AT, UPDATED_AT`;

  async findByCode(code: string): Promise<CustomerOverlayRow | null> {
    const row = await this.db.queryOne<Row>(
      `SELECT ${this.cols} FROM ${this.schema}.CUSTOMERS_OVERLAY WHERE CODE = :c`,
      { c: code },
    );
    return row ? this.map(row) : null;
  }

  async findByCodes(
    codes: string[],
  ): Promise<Map<string, CustomerOverlayRow>> {
    const out = new Map<string, CustomerOverlayRow>();
    if (codes.length === 0) return out;
    // bind list safely
    const binds: Record<string, unknown> = {};
    const names = codes.map((c, i) => {
      binds[`c${i}`] = c;
      return `:c${i}`;
    });
    const rows = await this.db.query<Row>(
      `SELECT ${this.cols} FROM ${this.schema}.CUSTOMERS_OVERLAY
       WHERE CODE IN (${names.join(',')})`,
      binds as oracledb.BindParameters,
    );
    for (const r of rows) out.set(r.CODE, this.map(r));
    return out;
  }

  async listLocal(
    search: string | undefined,
    limit: number,
  ): Promise<CustomerOverlayRow[]> {
    const binds: Record<string, unknown> = { lim: limit };
    const where: string[] = [`ORIGIN = 'LOCAL'`];
    if (search && search.trim().length > 0) {
      binds.q = `%${search.trim()}%`;
      where.push('(AR_NAME LIKE :q OR EN_NAME LIKE :q OR CODE LIKE :q OR MOBILE LIKE :q)');
    }
    const rows = await this.db.query<Row>(
      `SELECT * FROM (
         SELECT ${this.cols} FROM ${this.schema}.CUSTOMERS_OVERLAY
         WHERE ${where.join(' AND ')}
         ORDER BY AR_NAME
       ) WHERE ROWNUM <= :lim`,
      binds as oracledb.BindParameters,
    );
    return rows.map((r) => this.map(r));
  }

  async upsert(
    input: UpsertCustomerOverlayInput,
  ): Promise<CustomerOverlayRow> {
    await this.db.execute(
      `MERGE INTO ${this.schema}.CUSTOMERS_OVERLAY t
       USING (SELECT :code AS CODE FROM DUAL) s
       ON (t.CODE = s.CODE)
       WHEN MATCHED THEN UPDATE SET
         ORIGIN = :origin, AR_NAME = :arName, EN_NAME = :enName,
         MOBILE = :mobile, WHATSAPP = :whatsapp, PHONE = :phone,
         INACTIVE = :inactive, UPDATED_AT = SYSTIMESTAMP
       WHEN NOT MATCHED THEN INSERT
         (ID, CODE, ORIGIN, AR_NAME, EN_NAME, MOBILE, WHATSAPP, PHONE, INACTIVE)
       VALUES
         (:id, :code, :origin, :arName, :enName, :mobile, :whatsapp, :phone, :inactive)`,
      {
        id: uuidv7(),
        code: input.code,
        origin: input.origin,
        arName: input.arName ?? null,
        enName: input.enName ?? null,
        mobile: input.mobile ?? null,
        whatsapp: input.whatsapp ?? null,
        phone: input.phone ?? null,
        inactive: input.inactive ? 1 : 0,
      },
    );
    const row = await this.findByCode(input.code);
    if (!row) throw new Error('upsert: customer overlay vanished after commit');
    return row;
  }

  private map(r: Row): CustomerOverlayRow {
    return {
      code: r.CODE,
      origin: r.ORIGIN,
      arName: r.AR_NAME,
      enName: r.EN_NAME,
      mobile: r.MOBILE,
      whatsapp: r.WHATSAPP,
      phone: r.PHONE,
      inactive: Number(r.INACTIVE) === 1,
      createdAt: r.CREATED_AT.toISOString(),
      updatedAt: r.UPDATED_AT.toISOString(),
    };
  }
}
