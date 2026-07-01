import { Injectable } from '@nestjs/common';
import type { BindParameters } from 'oracledb';
import { OracleService } from '../../../infrastructure/oracle/oracle.service';
import {
  AdminRepository,
  MachineRow,
  SessionRow,
  SessionsFilter,
  UserRow,
} from '../domain/ports/admin-repository.port';

/**
 * OracleAdminRepository — reads the REAL, PRESENT administration tables:
 *   - YSPOS23.IAS_POS_MACHINE      (3 machines)     → cashier terminals + status
 *   - IAS202623.USER_R             (4 users)        → system users, Arabic names
 *   - YSPOS23.IAS_USR_LGN_HSTRY    (608 rows)       → login/logout history
 *
 * STRICTLY READ-ONLY (MOTECH_RO connection, which holds SELECT ANY TABLE).
 * Schema-qualified, bind variables only. Numeric flags → booleans.
 */
@Injectable()
export class OracleAdminRepository implements AdminRepository {
  constructor(private readonly oracle: OracleService) {}

  private get schema(): string {
    return this.oracle.schema();
  }

  private get masterSchema(): string {
    return this.oracle.masterSchema();
  }

  async listMachines(): Promise<MachineRow[]> {
    type Row = {
      MACHINE_NO: number;
      TERMINAL: string | null;
      INACTIVE: number | null;
      DEF_WCODE: number | null;
      DEF_BRN_NO: number | null;
      IP_ADDRESS: string | null;
      LAST_BILL_DATE: string | null;
      USE_VAT: number | null;
      PRICE_LEVEL: number | null;
    };
    const rows = await this.oracle.query<Row>(
      `SELECT MACHINE_NO, TERMINAL, NVL(INACTIVE, 0) AS INACTIVE,
              DEF_WCODE, DEF_BRN_NO, IP_ADDRESS,
              TO_CHAR(LAST_BILL_DATE, 'YYYY-MM-DD') AS LAST_BILL_DATE,
              NVL(USE_VAT, 0) AS USE_VAT, PRICE_LEVEL
       FROM ${this.schema}.IAS_POS_MACHINE
       ORDER BY MACHINE_NO`,
    );
    return rows.map((r) => ({
      machineNo: Number(r.MACHINE_NO),
      terminal: r.TERMINAL ?? null,
      inactive: Number(r.INACTIVE ?? 0) === 1,
      defWarehouse: r.DEF_WCODE == null ? null : Number(r.DEF_WCODE),
      defBranch: r.DEF_BRN_NO == null ? null : Number(r.DEF_BRN_NO),
      ipAddress: r.IP_ADDRESS ?? null,
      lastBillDate: r.LAST_BILL_DATE ?? null,
      useVat: Number(r.USE_VAT ?? 0) === 1,
      priceLevel: r.PRICE_LEVEL == null ? null : Number(r.PRICE_LEVEL),
    }));
  }

  async listUsers(): Promise<UserRow[]> {
    type Row = {
      U_ID: number;
      U_A_NAME: string | null;
      U_E_NAME: string | null;
      U_CODE: string | null;
      INACTIVE: number | null;
      ADMIN_USER: number | null;
      USER_TYPE: number | null;
      LOGGED_ON: number | null;
      USER_LOCKED: number | null;
      E_MAIL: string | null;
    };
    const rows = await this.oracle.query<Row>(
      `SELECT U_ID, U_A_NAME, U_E_NAME, U_CODE,
              NVL(INACTIVE, 0) AS INACTIVE, NVL(ADMIN_USER, 0) AS ADMIN_USER,
              USER_TYPE, NVL(LOGGED_ON, 0) AS LOGGED_ON,
              NVL(USER_LOCKED, 0) AS USER_LOCKED, E_MAIL
       FROM ${this.masterSchema}.USER_R
       ORDER BY U_ID`,
    );
    return rows.map((r) => ({
      userId: Number(r.U_ID),
      arabicName: r.U_A_NAME ?? null,
      englishName: r.U_E_NAME ?? null,
      code: r.U_CODE ?? null,
      inactive: Number(r.INACTIVE ?? 0) === 1,
      isAdmin: Number(r.ADMIN_USER ?? 0) === 1,
      userType: r.USER_TYPE == null ? null : Number(r.USER_TYPE),
      loggedOn: Number(r.LOGGED_ON ?? 0) === 1,
      locked: Number(r.USER_LOCKED ?? 0) === 1,
      email: r.E_MAIL ?? null,
    }));
  }

  async listSessions(filter: SessionsFilter): Promise<SessionRow[]> {
    const binds: Record<string, unknown> = { lim: filter.limit };
    let userWhere = '';
    if (filter.userId != null) {
      userWhere = 'WHERE U_ID = :uid';
      binds.uid = filter.userId;
    }
    type Row = {
      U_ID: number;
      TRMNL_NM: string | null;
      LGN_TYP: number | null;
      EVENT_AT: string | null;
      BRN_NO: number | null;
    };
    const rows = await this.oracle.query<Row>(
      `SELECT * FROM (
         SELECT U_ID, TRMNL_NM, LGN_TYP,
                TO_CHAR(LGN_OUT_DATE, 'YYYY-MM-DD HH24:MI:SS') AS EVENT_AT,
                BRN_NO
         FROM ${this.schema}.IAS_USR_LGN_HSTRY
         ${userWhere}
         ORDER BY LGN_OUT_DATE DESC
       ) WHERE ROWNUM <= :lim`,
      binds as BindParameters,
    );
    return rows.map((r) => ({
      userId: Number(r.U_ID),
      terminal: r.TRMNL_NM ?? null,
      loginType: r.LGN_TYP == null ? null : Number(r.LGN_TYP),
      eventAt: r.EVENT_AT ?? null,
      branchNo: r.BRN_NO == null ? null : Number(r.BRN_NO),
    }));
  }
}
