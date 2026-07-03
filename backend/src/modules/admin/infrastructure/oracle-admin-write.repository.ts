import { Injectable } from '@nestjs/common';
import oracledb from 'oracledb';
import type { BindParameters } from 'oracledb';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import {
  AdminWriteRepository,
  MachineOverlayRow,
  PermRole,
  RolePermission,
  UpsertMachineOverlay,
  UpsertUserOverlay,
  UserOverlayRow,
} from '../domain/ports/admin-write-repository.port';

/** First id used for locally-created users (well above ERP U_IDs). */
const LOCAL_USER_ID_BASE = 9000;

type UserRowDb = {
  ID: string;
  USER_ID: number;
  ORIGIN: string;
  AR_NAME: string | null;
  EN_NAME: string | null;
  CODE: string | null;
  ROLE: string | null;
  EMAIL: string | null;
  AUTH_USERNAME: string | null;
  INACTIVE: number;
};

type MachineRowDb = {
  ID: string;
  MACHINE_NO: number;
  ORIGIN: string;
  TERMINAL: string | null;
  BRANCH_NO: number | null;
  WAREHOUSE: number | null;
  IP_ADDRESS: string | null;
  PRICE_LEVEL: number | null;
  USE_VAT: number | null;
  CURRENCY: string | null;
  INACTIVE: number;
};

/**
 * OracleAdminWriteRepository — writes ONLY to MOTECH_POS (USERS_OVERLAY,
 * MACHINES_OVERLAY, ROLE_PERMISSIONS) through OracleWriteService. The live
 * YSPOS23 / IAS202623 schemas are never touched. Schema-qualified SQL, bind
 * variables only, MERGE for idempotent upserts (same pattern as settings).
 */
@Injectable()
export class OracleAdminWriteRepository implements AdminWriteRepository {
  constructor(private readonly write: OracleWriteService) {}

  private get schema(): string {
    return this.write.schema();
  }

  //==========================================================================
  // Users overlay
  //==========================================================================

  private mapUser(r: UserRowDb): UserOverlayRow {
    return {
      id: r.ID,
      userId: Number(r.USER_ID),
      origin: r.ORIGIN === 'EDIT' ? 'EDIT' : 'LOCAL',
      arName: r.AR_NAME ?? null,
      enName: r.EN_NAME ?? null,
      code: r.CODE ?? null,
      role: (r.ROLE as PermRole | null) ?? null,
      email: r.EMAIL ?? null,
      authUsername: r.AUTH_USERNAME ?? null,
      inactive: Number(r.INACTIVE) === 1,
    };
  }

  private readonly userCols =
    'ID, USER_ID, ORIGIN, AR_NAME, EN_NAME, CODE, ROLE, EMAIL, AUTH_USERNAME, INACTIVE';

  async listUserOverlays(): Promise<UserOverlayRow[]> {
    const rows = await this.write.query<UserRowDb>(
      `SELECT ${this.userCols} FROM ${this.schema}.USERS_OVERLAY ORDER BY USER_ID`,
    );
    return rows.map((r) => this.mapUser(r));
  }

  async getUserOverlay(userId: number): Promise<UserOverlayRow | null> {
    const row = await this.write.queryOne<UserRowDb>(
      `SELECT ${this.userCols} FROM ${this.schema}.USERS_OVERLAY WHERE USER_ID = :b_uid`,
      { b_uid: userId } as BindParameters,
    );
    return row ? this.mapUser(row) : null;
  }

  async nextLocalUserId(): Promise<number> {
    const row = await this.write.queryOne<{ MX: number | null }>(
      `SELECT MAX(USER_ID) AS MX FROM ${this.schema}.USERS_OVERLAY WHERE USER_ID >= :base`,
      { base: LOCAL_USER_ID_BASE } as BindParameters,
    );
    const mx = row?.MX == null ? null : Number(row.MX);
    return mx == null ? LOCAL_USER_ID_BASE : mx + 1;
  }

  async upsertUserOverlay(input: UpsertUserOverlay): Promise<UserOverlayRow> {
    const table = `${this.schema}.USERS_OVERLAY`;
    // MERGE keeps one row per USER_ID. COALESCE on update: only overwrite the
    // fields the caller sent (undefined → bind NULL → keep existing value).
    await this.write.execute(
      `MERGE INTO ${table} t
       USING (SELECT :b_uid AS USER_ID FROM DUAL) s
       ON (t.USER_ID = s.USER_ID)
       WHEN MATCHED THEN UPDATE SET
         t.AR_NAME       = COALESCE(:arName, t.AR_NAME),
         t.EN_NAME       = COALESCE(:enName, t.EN_NAME),
         t.CODE          = COALESCE(:code, t.CODE),
         t.ROLE          = COALESCE(:b_role, t.ROLE),
         t.EMAIL         = COALESCE(:email, t.EMAIL),
         t.AUTH_USERNAME = COALESCE(:authUsername, t.AUTH_USERNAME),
         t.INACTIVE      = COALESCE(:inactive, t.INACTIVE),
         t.UPDATED_AT    = SYSTIMESTAMP
       WHEN NOT MATCHED THEN INSERT
         (ID, USER_ID, ORIGIN, AR_NAME, EN_NAME, CODE, ROLE, EMAIL,
          AUTH_USERNAME, INACTIVE)
       VALUES
         (:id, :b_uid, :origin, :arName, :enName, :code, :b_role, :email,
          :authUsername, NVL(:inactive, 0))`,
      {
        id: uuidv7(),
        b_uid: input.userId,
        origin: input.origin,
        arName: input.arName ?? null,
        enName: input.enName ?? null,
        code: input.code ?? null,
        b_role: input.role ?? null,
        email: input.email ?? null,
        authUsername: input.authUsername ?? null,
        // Explicit NUMBER type: a JS null bind defaults to STRING, which
        // breaks COALESCE(:x, NUMBER_col) with ORA-00932.
        inactive: {
          val: input.inactive == null ? null : input.inactive ? 1 : 0,
          type: oracledb.NUMBER,
        },
      } as BindParameters,
    );
    const row = await this.getUserOverlay(input.userId);
    if (!row) throw new Error('USERS_OVERLAY upsert failed to persist');
    return row;
  }

  //==========================================================================
  // Machines overlay
  //==========================================================================

  private mapMachine(r: MachineRowDb): MachineOverlayRow {
    return {
      id: r.ID,
      machineNo: Number(r.MACHINE_NO),
      origin: r.ORIGIN === 'EDIT' ? 'EDIT' : 'LOCAL',
      terminal: r.TERMINAL ?? null,
      branchNo: r.BRANCH_NO == null ? null : Number(r.BRANCH_NO),
      warehouse: r.WAREHOUSE == null ? null : Number(r.WAREHOUSE),
      ipAddress: r.IP_ADDRESS ?? null,
      priceLevel: r.PRICE_LEVEL == null ? null : Number(r.PRICE_LEVEL),
      useVat: r.USE_VAT == null ? null : Number(r.USE_VAT) === 1,
      currency: r.CURRENCY ?? null,
      inactive: Number(r.INACTIVE) === 1,
    };
  }

  private readonly machineCols =
    'ID, MACHINE_NO, ORIGIN, TERMINAL, BRANCH_NO, WAREHOUSE, IP_ADDRESS, PRICE_LEVEL, USE_VAT, CURRENCY, INACTIVE';

  async listMachineOverlays(): Promise<MachineOverlayRow[]> {
    const rows = await this.write.query<MachineRowDb>(
      `SELECT ${this.machineCols} FROM ${this.schema}.MACHINES_OVERLAY ORDER BY MACHINE_NO`,
    );
    return rows.map((r) => this.mapMachine(r));
  }

  async getMachineOverlay(machineNo: number): Promise<MachineOverlayRow | null> {
    const row = await this.write.queryOne<MachineRowDb>(
      `SELECT ${this.machineCols} FROM ${this.schema}.MACHINES_OVERLAY WHERE MACHINE_NO = :no`,
      { no: machineNo } as BindParameters,
    );
    return row ? this.mapMachine(row) : null;
  }

  async upsertMachineOverlay(
    input: UpsertMachineOverlay,
  ): Promise<MachineOverlayRow> {
    const table = `${this.schema}.MACHINES_OVERLAY`;
    await this.write.execute(
      `MERGE INTO ${table} t
       USING (SELECT :no AS MACHINE_NO FROM DUAL) s
       ON (t.MACHINE_NO = s.MACHINE_NO)
       WHEN MATCHED THEN UPDATE SET
         t.TERMINAL    = COALESCE(:terminal, t.TERMINAL),
         t.BRANCH_NO   = COALESCE(:branchNo, t.BRANCH_NO),
         t.WAREHOUSE   = COALESCE(:warehouse, t.WAREHOUSE),
         t.IP_ADDRESS  = COALESCE(:ipAddress, t.IP_ADDRESS),
         t.PRICE_LEVEL = COALESCE(:priceLevel, t.PRICE_LEVEL),
         t.USE_VAT     = COALESCE(:useVat, t.USE_VAT),
         t.CURRENCY    = COALESCE(:currency, t.CURRENCY),
         t.INACTIVE    = COALESCE(:inactive, t.INACTIVE),
         t.UPDATED_AT  = SYSTIMESTAMP
       WHEN NOT MATCHED THEN INSERT
         (ID, MACHINE_NO, ORIGIN, TERMINAL, BRANCH_NO, WAREHOUSE, IP_ADDRESS,
          PRICE_LEVEL, USE_VAT, CURRENCY, INACTIVE)
       VALUES
         (:id, :no, :origin, :terminal, :branchNo, :warehouse, :ipAddress,
          :priceLevel, :useVat, :currency, NVL(:inactive, 0))`,
      {
        id: uuidv7(),
        no: input.machineNo,
        origin: input.origin,
        terminal: input.terminal ?? null,
        // Explicit NUMBER types (null binds default to STRING → ORA-00932
        // inside COALESCE with NUMBER columns).
        branchNo: { val: input.branchNo ?? null, type: oracledb.NUMBER },
        warehouse: { val: input.warehouse ?? null, type: oracledb.NUMBER },
        ipAddress: input.ipAddress ?? null,
        priceLevel: { val: input.priceLevel ?? null, type: oracledb.NUMBER },
        useVat: {
          val: input.useVat == null ? null : input.useVat ? 1 : 0,
          type: oracledb.NUMBER,
        },
        currency: input.currency ?? null,
        inactive: {
          val: input.inactive == null ? null : input.inactive ? 1 : 0,
          type: oracledb.NUMBER,
        },
      } as BindParameters,
    );
    const row = await this.getMachineOverlay(input.machineNo);
    if (!row) throw new Error('MACHINES_OVERLAY upsert failed to persist');
    return row;
  }

  //==========================================================================
  // Role permissions
  //==========================================================================

  async listPermissions(): Promise<RolePermission[]> {
    type Row = { ROLE: string; PERMISSION: string; ALLOWED: number };
    const rows = await this.write.query<Row>(
      `SELECT ROLE, PERMISSION, ALLOWED
       FROM ${this.schema}.ROLE_PERMISSIONS
       ORDER BY ROLE, PERMISSION`,
    );
    return rows.map((r) => ({
      role: r.ROLE as PermRole,
      permission: r.PERMISSION,
      allowed: Number(r.ALLOWED) === 1,
    }));
  }

  async setPermissions(
    entries: RolePermission[],
    updatedBy: number | null,
  ): Promise<number> {
    if (entries.length === 0) return 0;
    const table = `${this.schema}.ROLE_PERMISSIONS`;
    return this.write.withTransaction(async (conn) => {
      let count = 0;
      for (const e of entries) {
        await conn.execute(
          `MERGE INTO ${table} t
           USING (SELECT :r AS ROLE, :p AS PERMISSION FROM DUAL) s
           ON (t.ROLE = s.ROLE AND t.PERMISSION = s.PERMISSION)
           WHEN MATCHED THEN UPDATE SET
             t.ALLOWED = :a, t.UPDATED_BY = :u, t.UPDATED_AT = SYSTIMESTAMP
           WHEN NOT MATCHED THEN INSERT (ROLE, PERMISSION, ALLOWED, UPDATED_BY)
           VALUES (:r, :p, :a, :u)`,
          {
            r: e.role,
            p: e.permission,
            a: e.allowed ? 1 : 0,
            u: updatedBy,
          } as BindParameters,
        );
        count++;
      }
      return count;
    });
  }
}
