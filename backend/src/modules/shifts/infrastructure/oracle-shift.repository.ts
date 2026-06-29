import { Injectable } from '@nestjs/common';
import { OracleService } from '../../../infrastructure/oracle/oracle.service';
import { OpenShift, ShiftRepository } from '../domain/ports/shift-repository.port';

interface ShiftRow {
  SHFT_SRL: number;
  SHFT_CODE: string | null;
  CSHR_NO: number | null;
  OPN_DATE: Date | null;
  SHFT_DATE: Date | null;
}

/**
 * OracleShiftRepository — reads YSPOS23.POS_WRK_SHFT_CSHR.
 * READ-ONLY phase: open/close (INSRT_WRK_SHFTS) writes are deferred.
 */
@Injectable()
export class OracleShiftRepository implements ShiftRepository {
  constructor(private readonly oracle: OracleService) {}

  async findOpenByCashier(cshrNo: number): Promise<OpenShift | null> {
    const schema = this.oracle.schema();
    const row = await this.oracle.queryOne<ShiftRow>(
      `SELECT SHFT_SRL, SHFT_CODE, CSHR_NO, OPN_DATE, SHFT_DATE
       FROM ${schema}.POS_WRK_SHFT_CSHR
       WHERE CSHR_NO = :cshr
         AND CLS_DATE IS NULL
         AND NVL(CLS_FLG, 0) = 0
       ORDER BY SHFT_SRL ASC
       FETCH FIRST 1 ROWS ONLY`,
      { cshr: cshrNo },
    );
    if (!row) return null;
    return {
      shftSrl: String(row.SHFT_SRL),
      shftCode: row.SHFT_CODE,
      cshrNo: row.CSHR_NO == null ? null : Number(row.CSHR_NO),
      opnDate: row.OPN_DATE ? row.OPN_DATE.toISOString() : null,
      shftDate: row.SHFT_DATE ? row.SHFT_DATE.toISOString() : null,
    };
  }
}
