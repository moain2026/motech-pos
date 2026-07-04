import { Injectable } from '@nestjs/common';
import type { BindParameters } from 'oracledb';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import {
  AlertsRepository,
  CreateAlertInput,
  PosAlert,
  UpdateAlertInput,
} from '../domain/ports/alerts.port';

interface AlertRow {
  ID: string;
  TITLE: string;
  BODY: string | null;
  ACTIVE: number;
  SHOW_FROM_STR: string | null;
  SHOW_UNTIL_STR: string | null;
  CREATED_BY: string;
  CREATED_AT: Date;
}

/** OracleAlertsRepository — POS_ALERTS + POS_ALERT_ACKS (V026). */
@Injectable()
export class OracleAlertsRepository implements AlertsRepository {
  constructor(private readonly write: OracleWriteService) {}

  private get schema(): string {
    return this.write.schema();
  }

  private get cols(): string {
    return `ID, TITLE, BODY, ACTIVE,
            TO_CHAR(SHOW_FROM, 'YYYY-MM-DD') AS SHOW_FROM_STR,
            TO_CHAR(SHOW_UNTIL, 'YYYY-MM-DD') AS SHOW_UNTIL_STR,
            CREATED_BY, CREATED_AT`;
  }

  async create(input: CreateAlertInput): Promise<PosAlert> {
    const id = uuidv7();
    await this.write.execute(
      `INSERT INTO ${this.schema}.POS_ALERTS
         (ID, TITLE, BODY, SHOW_FROM, SHOW_UNTIL, CREATED_BY)
       VALUES
         (:id, :title, :body,
          CASE WHEN :showFrom IS NULL THEN NULL
               ELSE TO_DATE(:showFrom2, 'YYYY-MM-DD') END,
          CASE WHEN :showUntil IS NULL THEN NULL
               ELSE TO_DATE(:showUntil2, 'YYYY-MM-DD') END,
          :createdBy)`,
      {
        id,
        title: input.title,
        body: input.body,
        showFrom: input.showFrom,
        showFrom2: input.showFrom,
        showUntil: input.showUntil,
        showUntil2: input.showUntil,
        createdBy: input.createdBy,
      },
    );
    const created = await this.findById(id);
    if (!created) throw new Error('create: alert vanished after insert');
    return created;
  }

  async update(id: string, input: UpdateAlertInput): Promise<PosAlert | null> {
    const sets: string[] = [];
    const binds: Record<string, unknown> = { id };
    if (input.title !== undefined) {
      sets.push('TITLE = :title');
      binds.title = input.title;
    }
    if (input.body !== undefined) {
      sets.push('BODY = :body');
      binds.body = input.body;
    }
    if (input.active !== undefined) {
      sets.push('ACTIVE = :active');
      binds.active = input.active ? 1 : 0;
    }
    if (input.showFrom !== undefined) {
      sets.push(`SHOW_FROM = CASE WHEN :showFrom IS NULL THEN NULL
                 ELSE TO_DATE(:showFrom2, 'YYYY-MM-DD') END`);
      binds.showFrom = input.showFrom;
      binds.showFrom2 = input.showFrom;
    }
    if (input.showUntil !== undefined) {
      sets.push(`SHOW_UNTIL = CASE WHEN :showUntil IS NULL THEN NULL
                 ELSE TO_DATE(:showUntil2, 'YYYY-MM-DD') END`);
      binds.showUntil = input.showUntil;
      binds.showUntil2 = input.showUntil;
    }
    if (sets.length === 0) return this.findById(id);
    const res = await this.write.execute(
      `UPDATE ${this.schema}.POS_ALERTS SET ${sets.join(', ')} WHERE ID = :id`,
      binds as BindParameters,
    );
    if ((res.rowsAffected ?? 0) === 0) return null;
    return this.findById(id);
  }

  async findById(id: string): Promise<PosAlert | null> {
    const row = await this.write.queryOne<AlertRow>(
      `SELECT ${this.cols} FROM ${this.schema}.POS_ALERTS WHERE ID = :id`,
      { id },
    );
    return row ? this.toAlert(row) : null;
  }

  async listAll(limit: number): Promise<PosAlert[]> {
    const rows = await this.write.query<AlertRow>(
      `SELECT * FROM (
         SELECT ${this.cols} FROM ${this.schema}.POS_ALERTS
         ORDER BY CREATED_AT DESC
       ) WHERE ROWNUM <= :lim`,
      { lim: limit },
    );
    return rows.map((r) => this.toAlert(r));
  }

  async pendingFor(username: string, limit: number): Promise<PosAlert[]> {
    const rows = await this.write.query<AlertRow>(
      `SELECT * FROM (
         SELECT ${this.cols} FROM ${this.schema}.POS_ALERTS a
         WHERE a.ACTIVE = 1
           AND (a.SHOW_FROM IS NULL OR a.SHOW_FROM <= TRUNC(SYSDATE))
           AND (a.SHOW_UNTIL IS NULL OR a.SHOW_UNTIL >= TRUNC(SYSDATE))
           AND NOT EXISTS (
             SELECT 1 FROM ${this.schema}.POS_ALERT_ACKS k
             WHERE k.ALERT_ID = a.ID AND k.USERNAME = :u
           )
         ORDER BY a.CREATED_AT DESC
       ) WHERE ROWNUM <= :lim`,
      { u: username, lim: limit },
    );
    return rows.map((r) => this.toAlert(r));
  }

  async acknowledge(alertId: string, username: string): Promise<void> {
    try {
      await this.write.execute(
        `INSERT INTO ${this.schema}.POS_ALERT_ACKS (ID, ALERT_ID, USERNAME)
         VALUES (:id, :alertId, :username)`,
        { id: uuidv7(), alertId, username },
      );
    } catch (err) {
      // UNIQUE (alert, user) — a second ack is a no-op (idempotent).
      const e = err as { errorNum?: number; message?: string };
      const dup =
        e?.errorNum === 1 ||
        (typeof e?.message === 'string' && e.message.includes('ORA-00001'));
      if (!dup) throw err;
    }
  }

  private toAlert(r: AlertRow): PosAlert {
    return {
      id: r.ID,
      title: r.TITLE,
      body: r.BODY,
      active: Number(r.ACTIVE) === 1,
      showFrom: r.SHOW_FROM_STR,
      showUntil: r.SHOW_UNTIL_STR,
      createdBy: r.CREATED_BY,
      createdAt: r.CREATED_AT.toISOString(),
    };
  }
}
