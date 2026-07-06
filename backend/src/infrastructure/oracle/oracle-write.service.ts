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

  /**
   * Parameterized read with extra execute options (e.g. fetchInfo to pull a
   * CLOB as a plain string). Same pooling semantics as `query`.
   */
  async queryWith<T = Record<string, unknown>>(
    sql: string,
    binds: oracledb.BindParameters = {},
    options: oracledb.ExecuteOptions = {},
  ): Promise<T[]> {
    const conn = await this.getPool().getConnection();
    try {
      const r = await conn.execute<T>(sql, binds, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        ...options,
      });
      return (r.rows ?? []) as T[];
    } finally {
      await conn.close();
    }
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
    // ORA-08177 (can't serialize access) is a TRANSIENT serialization failure
    // under SERIALIZABLE isolation — the correct response is a bounded retry
    // with a small backoff (the unit of work is idempotent/side-effect-free
    // until commit). Non-serialization errors propagate immediately.
    const maxAttempts = 4;
    let lastErr: unknown;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
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
        lastErr = err;
        if (this.isSerializationFailure(err) && attempt < maxAttempts) {
          await sleep(15 * attempt);
          continue;
        }
        throw err;
      } finally {
        await conn.close();
      }
    }
    throw lastErr;
  }

  /**
   * Run `work` inside a single READ COMMITTED transaction (the Oracle default)
   * on one connection — commit on success, rollback on throw. Unlike
   * `withTransaction` this does NOT escalate to SERIALIZABLE, so it suits
   * large single-writer bulk refreshes (e.g. the downward catalog pull) that
   * would otherwise hit ORA-08177 under SERIALIZABLE contention. Use only when
   * serializable isolation is not required for correctness.
   */
  async withWork<T>(
    work: (conn: oracledb.Connection) => Promise<T>,
  ): Promise<T> {
    const conn = await this.getPool().getConnection();
    try {
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

  private isSerializationFailure(err: unknown): boolean {
    if (typeof err !== 'object' || err === null) return false;
    const e = err as { errorNum?: number; message?: string };
    // Direct ORA-08177, or wrapped in ORA-00604 (recursive SQL — e.g. delayed
    // block cleanout after another session touched the same blocks).
    return (
      e.errorNum === 8177 ||
      (typeof e.message === 'string' && e.message.includes('ORA-08177'))
    );
  }

  /**
   * Refresh Onyx's availability MV (YSPOS23.MV_ITEM_AVL_QTY) after a sale or
   * return so stock quantities reflect the new document immediately — exactly
   * how Onyx keeps its الكميات المتاحة current (MVIEW_REFRESH in
   * PKG_GNRL_FUNC_PKG). Runs the definer-rights helper proc
   * YSPOS23.MOTECH_REFRESH_AVL_QTY (MOTECH_RW has EXECUTE only). Best-effort:
   * failures are logged, never thrown — a committed bill must not be undone
   * by a stock-view refresh problem.
   */
  async refreshOnyxAvailability(): Promise<void> {
    try {
      const conn = await this.getPool().getConnection();
      try {
        await conn.execute(
          `BEGIN ${this.onyxSchema()}.MOTECH_REFRESH_AVL_QTY; END;`,
        );
      } finally {
        await conn.close();
      }
    } catch (err) {
      this.logger.warn(
        `MV_ITEM_AVL_QTY refresh failed (stock view may lag): ${String(err)}`,
      );
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

  /** Real Onyx POS schema (YSPOS23) — target of the actual bill rows. */
  onyxSchema(): string {
    return this.config.get('ORACLE_ONYX_SCHEMA');
  }

  /** ERP master schema (IAS202623) — item/customer Arabic names. */
  masterSchema(): string {
    return this.config.get('ORACLE_MASTER_SCHEMA');
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
