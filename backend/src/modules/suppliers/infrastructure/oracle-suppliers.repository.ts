import { Injectable } from '@nestjs/common';
import type { BindParameters } from 'oracledb';
import { OracleService } from '../../../infrastructure/oracle/oracle.service';
import {
  SupplierErpRow,
  SuppliersRepository,
} from '../domain/ports/suppliers-repository.port';

interface Row {
  V_CODE: string;
  V_A_NAME: string | null;
  V_E_NAME: string | null;
  V_PHONE: string | null;
  V_MOBILE: string | null;
  V_E_MAIL: string | null;
  V_ADDRESS: string | null;
  V_TAX_CODE: string | null;
  V_PERSON: string | null;
  CREDIT_PERIOD: number | null;
  INACTIVE: number | null;
}

/**
 * OracleSuppliersRepository — READ-ONLY reads of the live supplier master
 * IAS202623.V_DETAILS (38 rows, Arabic names). MOTECH_RO connection;
 * schema-qualified SQL, bind variables only (POSI001/POSI002 suppliers).
 */
@Injectable()
export class OracleSuppliersRepository implements SuppliersRepository {
  constructor(private readonly oracle: OracleService) {}

  private get masterSchema(): string {
    return this.oracle.masterSchema();
  }

  private readonly cols = `V_CODE, V_A_NAME, V_E_NAME, V_PHONE, V_MOBILE,
    V_E_MAIL, V_ADDRESS, V_TAX_CODE, V_PERSON, CREDIT_PERIOD,
    NVL(INACTIVE, 0) AS INACTIVE`;

  async list(
    search: string | undefined,
    limit: number,
  ): Promise<SupplierErpRow[]> {
    const binds: Record<string, unknown> = { lim: limit };
    let where = '';
    if (search && search.trim().length > 0) {
      binds.q = `%${search.trim()}%`;
      where = `WHERE (V_A_NAME LIKE :q OR V_E_NAME LIKE :q OR V_CODE LIKE :q)`;
    }
    const rows = await this.oracle.query<Row>(
      `SELECT * FROM (
         SELECT ${this.cols}
         FROM ${this.masterSchema}.V_DETAILS
         ${where}
         ORDER BY TO_NUMBER(REGEXP_SUBSTR(V_CODE, '^\\d+')) NULLS LAST, V_CODE
       ) WHERE ROWNUM <= :lim`,
      binds as BindParameters,
    );
    return rows.map((r) => this.map(r));
  }

  async findByCode(code: string): Promise<SupplierErpRow | null> {
    const row = await this.oracle.queryOne<Row>(
      `SELECT ${this.cols}
       FROM ${this.masterSchema}.V_DETAILS
       WHERE V_CODE = :c`,
      { c: code },
    );
    return row ? this.map(row) : null;
  }

  private map(r: Row): SupplierErpRow {
    return {
      code: r.V_CODE,
      arName: r.V_A_NAME ?? null,
      enName: r.V_E_NAME ?? null,
      phone: r.V_PHONE ?? null,
      mobile: r.V_MOBILE ?? null,
      email: r.V_E_MAIL ?? null,
      address: r.V_ADDRESS ?? null,
      taxCode: r.V_TAX_CODE ?? null,
      contact: r.V_PERSON ?? null,
      creditPeriod: r.CREDIT_PERIOD == null ? null : Number(r.CREDIT_PERIOD),
      inactive: Number(r.INACTIVE ?? 0) === 1,
    };
  }
}
