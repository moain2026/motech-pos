import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import oracledb from 'oracledb';
import { TypedConfigService } from '../../config/config.module';

/**
 * OracleService — owns a node-oracledb connection pool in THIN mode
 * (pure JS, no Oracle Instant Client needed; verified against Oracle 12.1).
 *
 * Read-only phase: connects as a least-privilege user (MOTECH_RO) that can
 * only SELECT (STANDARDS/07 §3). All queries use bind variables — never
 * string concatenation (STANDARDS/07 §A05 SQL injection).
 */
@Injectable()
export class OracleService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(OracleService.name);
  private pool?: oracledb.Pool;

  constructor(private readonly config: TypedConfigService) {
    // Thin mode is the default in node-oracledb 6 (no initOracleClient call).
    oracledb.fetchAsString = [oracledb.CLOB];
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
  }

  async onModuleInit(): Promise<void> {
    this.pool = await oracledb.createPool({
      user: this.config.get('ORACLE_USER'),
      password: this.config.get('ORACLE_PASSWORD'),
      connectString: this.config.get('ORACLE_CONNECT_STRING'),
      poolMin: this.config.get('ORACLE_POOL_MIN'),
      poolMax: this.config.get('ORACLE_POOL_MAX'),
      poolTimeout: this.config.get('ORACLE_POOL_TIMEOUT'),
    });
    this.logger.log(
      `Oracle pool created (thin mode) → ${this.config.get('ORACLE_CONNECT_STRING')}`,
    );
  }

  async onApplicationShutdown(): Promise<void> {
    if (this.pool) {
      await this.pool.close(5);
      this.logger.log('Oracle pool closed');
    }
  }

  private getPool(): oracledb.Pool {
    if (!this.pool) {
      throw new Error('Oracle pool not initialised');
    }
    return this.pool;
  }

  /**
   * Execute a parameterized query and return typed rows.
   * @param sql   SQL with :bind placeholders.
   * @param binds bind values (object or array).
   */
  async query<T = Record<string, unknown>>(
    sql: string,
    binds: oracledb.BindParameters = {},
    opts: oracledb.ExecuteOptions = {},
  ): Promise<T[]> {
    const conn = await this.getPool().getConnection();
    try {
      const result = await conn.execute<T>(sql, binds, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        ...opts,
      });
      return (result.rows ?? []) as T[];
    } finally {
      await conn.close();
    }
  }

  /** Convenience: first row or null. */
  async queryOne<T = Record<string, unknown>>(
    sql: string,
    binds: oracledb.BindParameters = {},
  ): Promise<T | null> {
    const rows = await this.query<T>(sql, binds);
    return rows.length > 0 ? rows[0] : null;
  }

  /** Liveness probe used by /health — selects 1 from DUAL. */
  async ping(): Promise<boolean> {
    const row = await this.queryOne<{ OK: number }>('SELECT 1 AS OK FROM DUAL');
    return row?.OK === 1;
  }

  /** The schema that owns the POS tables (for schema-qualified queries). */
  schema(): string {
    return this.config.get('ORACLE_SCHEMA');
  }

  /** The ERP master schema that owns the canonical item/customer master. */
  masterSchema(): string {
    return this.config.get('ORACLE_MASTER_SCHEMA');
  }
}
