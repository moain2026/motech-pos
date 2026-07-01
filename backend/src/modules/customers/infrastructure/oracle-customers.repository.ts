import { Injectable } from '@nestjs/common';
import type { BindParameters } from 'oracledb';
import { OracleService } from '../../../infrastructure/oracle/oracle.service';
import {
  CustomerRow,
  CustomerSearchFilter,
  CustomersRepository,
  PointsBalance,
  PointsTxnRow,
} from '../domain/ports/customers-repository.port';

/**
 * OracleCustomersRepository — reads the IAS202623 ERP master customer tables
 * (CUSTOMER for the canonical customer record with Arabic names, and
 * IAS_POINT_CALC_TRNS for loyalty-points movements) through the READ-ONLY
 * MOTECH_RO connection. All SQL is schema-qualified against the master schema
 * and uses bind variables (no concatenation → STANDARDS/07 §A05). READ-ONLY:
 * no INSERT/UPDATE/DELETE.
 */
@Injectable()
export class OracleCustomersRepository implements CustomersRepository {
  constructor(private readonly oracle: OracleService) {}

  /** The ERP master schema (IAS202623) that owns the customer tables. */
  private get masterSchema(): string {
    return this.oracle.masterSchema();
  }

  private mapCustomer(r: {
    C_CODE: string;
    C_A_NAME: string | null;
    C_E_NAME: string | null;
    C_MOBILE: string | null;
    C_WHATSAPP_NO: string | null;
    C_PHONE: string | null;
    INACTIVE: number | null;
  }): CustomerRow {
    return {
      code: r.C_CODE,
      arName: r.C_A_NAME,
      enName: r.C_E_NAME,
      mobile: r.C_MOBILE,
      whatsapp: r.C_WHATSAPP_NO,
      phone: r.C_PHONE,
      inactive: Number(r.INACTIVE ?? 0) === 1,
    };
  }

  async search(filter: CustomerSearchFilter): Promise<CustomerRow[]> {
    type Row = Parameters<OracleCustomersRepository['mapCustomer']>[0];
    const binds: Record<string, unknown> = { lim: filter.limit };
    const where: string[] = [];
    if (filter.search && filter.search.trim().length > 0) {
      binds.q = `%${filter.search.trim()}%`;
      where.push(
        '(C_A_NAME LIKE :q OR C_E_NAME LIKE :q OR C_CODE LIKE :q OR C_MOBILE LIKE :q)',
      );
    }
    const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const rows = await this.oracle.query<Row>(
      `SELECT * FROM (
         SELECT C_CODE, C_A_NAME, C_E_NAME, C_MOBILE,
                C_WHATSAPP_NO, C_PHONE, INACTIVE
         FROM ${this.masterSchema}.CUSTOMER
         ${whereSql}
         ORDER BY C_A_NAME
       ) WHERE ROWNUM <= :lim`,
      binds as BindParameters,
    );
    return rows.map((r) => this.mapCustomer(r));
  }

  async findByCode(code: string): Promise<CustomerRow | null> {
    type Row = Parameters<OracleCustomersRepository['mapCustomer']>[0];
    const row = await this.oracle.queryOne<Row>(
      `SELECT C_CODE, C_A_NAME, C_E_NAME, C_MOBILE,
              C_WHATSAPP_NO, C_PHONE, INACTIVE
       FROM ${this.masterSchema}.CUSTOMER
       WHERE C_CODE = :code`,
      { code } as BindParameters,
    );
    return row ? this.mapCustomer(row) : null;
  }

  async pointsTxns(code: string, limit: number): Promise<PointsTxnRow[]> {
    type Row = {
      TRNS_NO: number;
      TRNS_DATE: string | null;
      CUST_CODE: string | null;
      BILL_NO: number | null;
      TRNS_TYPE: number | null;
      POINT_CNT: number | null;
      POINT_AMT: number | null;
      DOC_AMT: number | null;
      BILL_AMT: number | null;
    };
    const rows = await this.oracle.query<Row>(
      `SELECT * FROM (
         SELECT TRNS_NO,
                TO_CHAR(TRNS_DATE, 'YYYY-MM-DD') AS TRNS_DATE,
                CUST_CODE, BILL_NO, TRNS_TYPE,
                POINT_CNT, POINT_AMT, DOC_AMT, BILL_AMT
         FROM ${this.masterSchema}.IAS_POINT_CALC_TRNS
         WHERE CUST_CODE = :code
         ORDER BY TRNS_DATE DESC, TRNS_NO DESC
       ) WHERE ROWNUM <= :lim`,
      { code, lim: limit } as BindParameters,
    );
    return rows.map((r) => ({
      trnsNo: Number(r.TRNS_NO),
      trnsDate: r.TRNS_DATE,
      custCode: r.CUST_CODE,
      billNo: r.BILL_NO == null ? null : Number(r.BILL_NO),
      trnsType: r.TRNS_TYPE == null ? null : Number(r.TRNS_TYPE),
      pointCount: Number(r.POINT_CNT ?? 0),
      pointAmt: Number(r.POINT_AMT ?? 0),
      docAmt: Number(r.DOC_AMT ?? 0),
      billAmt: Number(r.BILL_AMT ?? 0),
    }));
  }

  async pointsBalance(code: string): Promise<PointsBalance> {
    type Row = { TOTAL_POINTS: number | null; TXN_COUNT: number };
    const row = await this.oracle.queryOne<Row>(
      `SELECT SUM(NVL(POINT_CNT, 0)) AS TOTAL_POINTS,
              COUNT(*)               AS TXN_COUNT
       FROM ${this.masterSchema}.IAS_POINT_CALC_TRNS
       WHERE CUST_CODE = :code`,
      { code } as BindParameters,
    );
    return {
      code,
      totalPoints: Number(row?.TOTAL_POINTS ?? 0),
      txnCount: Number(row?.TXN_COUNT ?? 0),
    };
  }
}
