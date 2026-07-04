import { Injectable } from '@nestjs/common';
import oracledb, { type BindParameters } from 'oracledb';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import {
  SupplierOverlayRow,
  SuppliersOverlayRepository,
  UpsertSupplierOverlay,
} from '../domain/ports/suppliers-repository.port';

interface Row {
  ID: string;
  CODE: string;
  ORIGIN: 'LOCAL' | 'EDIT';
  AR_NAME: string | null;
  EN_NAME: string | null;
  PHONE: string | null;
  MOBILE: string | null;
  EMAIL: string | null;
  ADDRESS: string | null;
  TAX_CODE: string | null;
  CONTACT: string | null;
  CREDIT_PERIOD: number | null;
  INACTIVE: number;
}

/** Local supplier codes start at 9000 to never collide with ERP V_CODEs. */
const LOCAL_SUPPLIER_CODE_BASE = 9000;

/**
 * OracleSuppliersOverlayRepository — supplier creates/edits in
 * MOTECH_POS.SUPPLIERS_OVERLAY. Writes ONLY to our own schema
 * (the live ERP V_DETAILS is never mutated).
 */
@Injectable()
export class OracleSuppliersOverlayRepository
  implements SuppliersOverlayRepository
{
  constructor(private readonly db: OracleWriteService) {}

  private get schema(): string {
    return this.db.schema();
  }

  private readonly cols = `ID, CODE, ORIGIN, AR_NAME, EN_NAME, PHONE, MOBILE,
    EMAIL, ADDRESS, TAX_CODE, CONTACT, CREDIT_PERIOD, INACTIVE`;

  async list(): Promise<SupplierOverlayRow[]> {
    const rows = await this.db.query<Row>(
      `SELECT ${this.cols} FROM ${this.schema}.SUPPLIERS_OVERLAY ORDER BY CODE`,
    );
    return rows.map((r) => this.map(r));
  }

  async findByCode(code: string): Promise<SupplierOverlayRow | null> {
    const row = await this.db.queryOne<Row>(
      `SELECT ${this.cols} FROM ${this.schema}.SUPPLIERS_OVERLAY WHERE CODE = :c`,
      { c: code },
    );
    return row ? this.map(row) : null;
  }

  async nextLocalCode(): Promise<string> {
    const row = await this.db.queryOne<{ MX: number | null }>(
      `SELECT MAX(TO_NUMBER(CODE)) AS MX
       FROM ${this.schema}.SUPPLIERS_OVERLAY
       WHERE ORIGIN = 'LOCAL' AND REGEXP_LIKE(CODE, '^\\d+$')
         AND TO_NUMBER(CODE) >= :base`,
      { base: LOCAL_SUPPLIER_CODE_BASE } as BindParameters,
    );
    const mx = row?.MX == null ? null : Number(row.MX);
    return String(mx == null ? LOCAL_SUPPLIER_CODE_BASE : mx + 1);
  }

  async upsert(input: UpsertSupplierOverlay): Promise<SupplierOverlayRow> {
    // MERGE keeps one row per CODE. COALESCE on update: only overwrite the
    // fields the caller sent (undefined → bind NULL → keep existing value).
    await this.db.execute(
      `MERGE INTO ${this.schema}.SUPPLIERS_OVERLAY t
       USING (SELECT :code AS CODE FROM DUAL) s
       ON (t.CODE = s.CODE)
       WHEN MATCHED THEN UPDATE SET
         AR_NAME       = COALESCE(:arName, t.AR_NAME),
         EN_NAME       = COALESCE(:enName, t.EN_NAME),
         PHONE         = COALESCE(:phone, t.PHONE),
         MOBILE        = COALESCE(:mobile, t.MOBILE),
         EMAIL         = COALESCE(:email, t.EMAIL),
         ADDRESS       = COALESCE(:address, t.ADDRESS),
         TAX_CODE      = COALESCE(:taxCode, t.TAX_CODE),
         CONTACT       = COALESCE(:contact, t.CONTACT),
         CREDIT_PERIOD = COALESCE(:creditPeriod, t.CREDIT_PERIOD),
         INACTIVE      = COALESCE(:inactive, t.INACTIVE),
         UPDATED_AT    = SYSTIMESTAMP
       WHEN NOT MATCHED THEN INSERT
         (ID, CODE, ORIGIN, AR_NAME, EN_NAME, PHONE, MOBILE, EMAIL, ADDRESS,
          TAX_CODE, CONTACT, CREDIT_PERIOD, INACTIVE)
       VALUES
         (:id, :code, :origin, :arName, :enName, :phone, :mobile, :email,
          :address, :taxCode, :contact, :creditPeriod, NVL(:inactive, 0))`,
      {
        id: uuidv7(),
        code: input.code,
        origin: input.origin,
        arName: input.arName ?? null,
        enName: input.enName ?? null,
        phone: input.phone ?? null,
        mobile: input.mobile ?? null,
        email: input.email ?? null,
        address: input.address ?? null,
        taxCode: input.taxCode ?? null,
        contact: input.contact ?? null,
        // Explicit NUMBER types: a JS null bind defaults to STRING, which
        // breaks COALESCE(:x, NUMBER_col) with ORA-00932.
        creditPeriod: {
          val: input.creditPeriod ?? null,
          type: oracledb.NUMBER,
        },
        inactive: {
          val: input.inactive == null ? null : input.inactive ? 1 : 0,
          type: oracledb.NUMBER,
        },
      } as BindParameters,
    );
    const row = await this.findByCode(input.code);
    if (!row) throw new Error(`Supplier overlay upsert failed: ${input.code}`);
    return row;
  }

  private map(r: Row): SupplierOverlayRow {
    return {
      id: r.ID,
      code: r.CODE,
      origin: r.ORIGIN,
      arName: r.AR_NAME ?? null,
      enName: r.EN_NAME ?? null,
      phone: r.PHONE ?? null,
      mobile: r.MOBILE ?? null,
      email: r.EMAIL ?? null,
      address: r.ADDRESS ?? null,
      taxCode: r.TAX_CODE ?? null,
      contact: r.CONTACT ?? null,
      creditPeriod: r.CREDIT_PERIOD == null ? null : Number(r.CREDIT_PERIOD),
      inactive: Number(r.INACTIVE ?? 0) === 1,
    };
  }
}
