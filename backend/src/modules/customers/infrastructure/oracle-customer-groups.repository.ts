import { Injectable } from '@nestjs/common';
import oracledb, { type BindParameters } from 'oracledb';
import { OracleService } from '../../../infrastructure/oracle/oracle.service';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import {
  CustomerGroupRow,
  CustomerGroupsRepository,
  GroupMemberRow,
  UpsertCustomerGroupInput,
} from '../domain/ports/customer-groups.port';

interface GrpDb {
  ID: string;
  GRP_CODE: number;
  AR_NAME: string | null;
  EN_NAME: string | null;
  SEND_MSG: number;
  INACTIVE: number;
  MEMBER_COUNT: number;
}

interface MemberDb {
  ID: string;
  GRP_CODE: number;
  CUSTOMER_CODE: string;
}

/**
 * OracleCustomerGroupsRepository — POSI009 customer groups.
 * IAS_CASH_CUSTMR_GRP is EMPTY in the live ERP → MOTECH_POS.CUSTOMER_GROUPS /
 * CUSTOMER_GROUP_MEMBERS (V020) are authoritative. Member names resolve
 * read-only from IAS202623.CUSTOMER.
 */
@Injectable()
export class OracleCustomerGroupsRepository
  implements CustomerGroupsRepository
{
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

  private readonly grpSql = (where: string) => `
    SELECT g.ID, g.GRP_CODE, g.AR_NAME, g.EN_NAME, g.SEND_MSG, g.INACTIVE,
           NVL(c.CNT, 0) AS MEMBER_COUNT
    FROM ${this.schema}.CUSTOMER_GROUPS g
    LEFT JOIN (
      SELECT GRP_CODE, COUNT(*) AS CNT
      FROM ${this.schema}.CUSTOMER_GROUP_MEMBERS
      GROUP BY GRP_CODE
    ) c ON c.GRP_CODE = g.GRP_CODE
    ${where}
    ORDER BY g.GRP_CODE`;

  async list(): Promise<CustomerGroupRow[]> {
    const rows = await this.writeDb.query<GrpDb>(this.grpSql(''));
    return rows.map((r) => this.mapGrp(r));
  }

  async find(grpCode: number): Promise<CustomerGroupRow | null> {
    const rows = await this.writeDb.query<GrpDb>(
      this.grpSql('WHERE g.GRP_CODE = :no'),
      { no: grpCode },
    );
    return rows.length ? this.mapGrp(rows[0]) : null;
  }

  async nextGrpCode(): Promise<number> {
    const row = await this.writeDb.queryOne<{ MX: number | null }>(
      `SELECT MAX(GRP_CODE) AS MX FROM ${this.schema}.CUSTOMER_GROUPS`,
    );
    return (row?.MX == null ? 0 : Number(row.MX)) + 1;
  }

  async upsert(input: UpsertCustomerGroupInput): Promise<CustomerGroupRow> {
    await this.writeDb.execute(
      `MERGE INTO ${this.schema}.CUSTOMER_GROUPS t
       USING (SELECT :no AS GRP_CODE FROM DUAL) s
       ON (t.GRP_CODE = s.GRP_CODE)
       WHEN MATCHED THEN UPDATE SET
         AR_NAME    = COALESCE(:arName, t.AR_NAME),
         EN_NAME    = COALESCE(:enName, t.EN_NAME),
         SEND_MSG   = COALESCE(:sendMsg, t.SEND_MSG),
         INACTIVE   = COALESCE(:inactive, t.INACTIVE),
         UPDATED_AT = SYSTIMESTAMP
       WHEN NOT MATCHED THEN INSERT (ID, GRP_CODE, AR_NAME, EN_NAME, SEND_MSG, INACTIVE)
       VALUES (:id, :no, :arName, :enName, NVL(:sendMsg, 0), NVL(:inactive, 0))`,
      {
        id: uuidv7(),
        no: input.grpCode,
        arName: input.arName ?? null,
        enName: input.enName ?? null,
        sendMsg: {
          val: input.sendMsg == null ? null : input.sendMsg ? 1 : 0,
          type: oracledb.NUMBER,
        },
        inactive: {
          val: input.inactive == null ? null : input.inactive ? 1 : 0,
          type: oracledb.NUMBER,
        },
      } as BindParameters,
    );
    const row = await this.find(input.grpCode);
    if (!row) throw new Error(`Customer group upsert failed: ${input.grpCode}`);
    return row;
  }

  async listMembers(grpCode: number): Promise<GroupMemberRow[]> {
    const members = await this.writeDb.query<MemberDb>(
      `SELECT ID, GRP_CODE, CUSTOMER_CODE
       FROM ${this.schema}.CUSTOMER_GROUP_MEMBERS
       WHERE GRP_CODE = :no
       ORDER BY CUSTOMER_CODE`,
      { no: grpCode },
    );
    return this.enrich(members);
  }

  async assign(grpCode: number, customerCode: string): Promise<GroupMemberRow> {
    // One group per customer: MERGE reassigns if already grouped.
    await this.writeDb.execute(
      `MERGE INTO ${this.schema}.CUSTOMER_GROUP_MEMBERS t
       USING (SELECT :cust AS CUSTOMER_CODE FROM DUAL) s
       ON (t.CUSTOMER_CODE = s.CUSTOMER_CODE)
       WHEN MATCHED THEN UPDATE SET GRP_CODE = :no
       WHEN NOT MATCHED THEN INSERT (ID, GRP_CODE, CUSTOMER_CODE)
       VALUES (:id, :no2, :cust2)`,
      {
        id: uuidv7(),
        no: grpCode,
        no2: grpCode,
        cust: customerCode,
        cust2: customerCode,
      } as BindParameters,
    );
    const rows = await this.writeDb.query<MemberDb>(
      `SELECT ID, GRP_CODE, CUSTOMER_CODE
       FROM ${this.schema}.CUSTOMER_GROUP_MEMBERS
       WHERE CUSTOMER_CODE = :cust`,
      { cust: customerCode },
    );
    const [row] = await this.enrich(rows);
    if (!row) throw new Error(`Member assign failed: ${customerCode}`);
    return row;
  }

  async unassign(customerCode: string): Promise<boolean> {
    const r = await this.writeDb.execute(
      `DELETE FROM ${this.schema}.CUSTOMER_GROUP_MEMBERS
       WHERE CUSTOMER_CODE = :cust`,
      { cust: customerCode },
    );
    return (r.rowsAffected ?? 0) > 0;
  }

  async groupOf(customerCode: string): Promise<CustomerGroupRow | null> {
    const m = await this.writeDb.queryOne<{ GRP_CODE: number }>(
      `SELECT GRP_CODE FROM ${this.schema}.CUSTOMER_GROUP_MEMBERS
       WHERE CUSTOMER_CODE = :cust`,
      { cust: customerCode },
    );
    if (!m) return null;
    return this.find(Number(m.GRP_CODE));
  }

  /** Resolve customer Arabic names from the ERP master (read-only). */
  private async enrich(members: MemberDb[]): Promise<GroupMemberRow[]> {
    if (members.length === 0) return [];
    const codes = [...new Set(members.map((m) => m.CUSTOMER_CODE))];
    const binds: Record<string, unknown> = {};
    const names = codes.map((c, i) => {
      binds[`c${i}`] = c;
      return `:c${i}`;
    });
    const rows = await this.readDb.query<{
      C_CODE: string;
      C_A_NAME: string | null;
    }>(
      `SELECT C_CODE, C_A_NAME FROM ${this.masterSchema}.CUSTOMER
       WHERE C_CODE IN (${names.join(',')})`,
      binds as BindParameters,
    );
    const nameOf = new Map(rows.map((r) => [r.C_CODE, r.C_A_NAME]));
    return members.map((m) => ({
      id: m.ID,
      grpCode: Number(m.GRP_CODE),
      customerCode: m.CUSTOMER_CODE,
      customerName: nameOf.get(m.CUSTOMER_CODE) ?? null,
    }));
  }

  private mapGrp(r: GrpDb): CustomerGroupRow {
    return {
      id: r.ID,
      grpCode: Number(r.GRP_CODE),
      arName: r.AR_NAME ?? null,
      enName: r.EN_NAME ?? null,
      sendMsg: Number(r.SEND_MSG ?? 0) === 1,
      inactive: Number(r.INACTIVE ?? 0) === 1,
      memberCount: Number(r.MEMBER_COUNT ?? 0),
    };
  }
}
