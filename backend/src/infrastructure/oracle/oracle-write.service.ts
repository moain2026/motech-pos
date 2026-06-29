import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import oracledb from 'oracledb';
import { TypedConfigService } from '../../config/config.module';

/**
 * OracleWriteService — owns a SEPARATE node-oracledb pool for the MOTECH_POS
 * write schema (our own DB). This is intentionally distinct from OracleService
 * (which connects read-only to YSPOS23 via MOTECH_RO):
 *
 *   - YSPOS23 is the LIVE Onyx DB — SACRED, read-only. We never write there.
 *   - MOTECH_POS holds our new bills/payments/shifts. The write user has NO
 *     privilege on YSPOS23 (enforced at the DB level — see V001 migration).
 *
 * Provides `withTransaction` so a use-case can insert header + lines + payments
 * atomically (single commit / single rollback), which is how the original
 * EXTRCT_POS_BILL_PRC behaves (the whole sale is one unit of work).
 */
@Injectable()
export class OracleWriteService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(OracleWriteService.name);
  private pool?: oracledb.Pool;

  constructor(private readonly config: TypedConfigService) {}

  async onModuleInit(): Promise<void> {
    this.pool = await oracledb.createPool({
      user: this.config.get('ORACLE_WRITE_USER'),
      password: this.config.get('ORACLE_WRITE_PASSWORD'),
      connectString: this.config.get('ORACLE_CONNECT_STRING'),
      poolMin: this.config.get('ORACLE_POOL_MIN'),
      poolMax: this.config.get('ORACLE_POOL_MAX'),
      poolTimeout: this.config.get('ORACLE_POOL_TIMEOUT'),
      poolAlias: 'motech-write',
    });
    this.logger.log(
      `Oracle WRITE pool created (thin) → ${this.config.get(
        'ORACLE_WRITE_SCHEMA',
      )}@${this.config.get('ORACLE_CONNECT_STRING')}`,
    );
  }

  async onApplicationShutdown(): Promise<void> {
    if (this.pool) {
      await this.pool.close(5);
      this.logger.log('Oracle WRITE pool closed');
    }
  }

  private getPool(): oracledb.Pool {
    if (!this.pool) throw new Error('Oracle write pool not initialised');
    return this.pool;
  }

  /** Parameterized read (used within the write schema, e.g. idempotency lookup). */
  async query<T = Record<string, unknown>>(
    sql: string,
    binds: oracledb.BindParameters = {},
  ): Promise<T[]> {
    const conn = await this.getPool().getConnection();
    try {
      const r = await conn.execute<T>(sql, binds, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });
      return (r.rows ?? []) as T[];
    } finally {
      await conn.close();
    }
  }

  async queryOne<T = Record<string, unknown>>(
    sql: string,
    binds: oracledb.BindParameters = {},
  ): Promise<T | null> {
    const rows = await this.query<T>(sql, binds);
    return rows.length > 0 ? rows[0] : null;
  }

  /** Single autonomous DML (auto-commit) — for standalone inserts/updates. */
  async execute(
    sql: string,
    binds: oracledb.BindParameters = {},
  ): Promise<oracledb.Result<unknown>> {
    const conn = await this.getPool().getConnection();
    try {
      const r = await conn.execute(sql, binds, { autoCommit: true });
      return r;
    } finally {
      await conn.close();
    }
  }

  /**
   * Run `work` inside a single transaction on one connection. Commits on
   * success, rolls back on any throw. The callback receives the raw connection
   * so it can run multiple DML statements that must succeed or fail together.
   *
   * SERIALIZABLE isolation makes the bill-numbering + idempotency insert safe
   * against concurrent duplicate posts (the UNIQUE idempotency_key is the final
   * backstop — a duplicate insert raises ORA-00001).
   */
  async withTransaction<T>(
    work: (conn: oracledb.Connection) => Promise<T>,
  ): Promise<T> {
    const conn = await this.getPool().getConnection();
    try {
      await conn.execute('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
      const result = await work(conn);
      await conn.commit();
      return result;
    } catch (err) {
      try {
        await conn.rollback();
      } catch {
        /* ignore rollback errors */
      }
      throw err;
    } finally {
      await conn.close();
    }
  }

  /** Liveness probe for the write DB. */
  async ping(): Promise<boolean> {
    const row = await this.queryOne<{ OK: number }>('SELECT 1 AS OK FROM DUAL');
    return row?.OK === 1;
  }

  schema(): string {
    return this.config.get('ORACLE_WRITE_SCHEMA');
  }
}
