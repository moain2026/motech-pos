import { Injectable } from '@nestjs/common';
import oracledb from 'oracledb';
import type { BindParameters } from 'oracledb';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import {
  BackupRepository,
  BackupRun,
  BackupStatus,
  BackupTrigger,
  ExportedTable,
  FinishBackupInput,
  StartBackupInput,
} from '../domain/ports/backup-repository.port';

type RunRowDb = {
  ID: string;
  BACKUP_NO: number;
  TRIGGER_KIND: string;
  FORMAT: string;
  STATUS: string;
  FILE_NAME: string | null;
  FILE_PATH: string | null;
  FILE_BYTES: number | null;
  TABLE_COUNT: number | null;
  ROW_COUNT: number | null;
  SCHEMA_NAME: string | null;
  ERROR_MESSAGE: string | null;
  CREATED_BY: string | null;
  STARTED_AT: Date | string;
  FINISHED_AT: Date | string | null;
  DURATION_MS: number | null;
};

/** Backup history table lives in the write schema. */
const RUNS_TABLE = 'BACKUP_RUNS';

/**
 * OracleBackupRepository — enumerates and exports the MOTECH_POS write schema
 * (our own data) and records BACKUP_RUNS history, all through
 * OracleWriteService. The live YSPOS23 / IAS202623 ERP schemas are NEVER read
 * or written here — the backup is strictly of MOTECH_POS. Schema-qualified
 * SQL + bind variables only.
 */
@Injectable()
export class OracleBackupRepository implements BackupRepository {
  constructor(private readonly write: OracleWriteService) {}

  private get schema(): string {
    return this.write.schema();
  }

  schemaName(): string {
    return this.schema;
  }

  //==========================================================================
  // Schema enumeration + per-table export (MOTECH_POS only)
  //==========================================================================

  /** All base tables owned by the write schema (alphabetical). */
  async listTableNames(): Promise<string[]> {
    const rows = await this.write.query<{ TABLE_NAME: string }>(
      `SELECT TABLE_NAME
         FROM ALL_TABLES
        WHERE OWNER = :owner
        ORDER BY TABLE_NAME`,
      { owner: this.schema } as BindParameters,
    );
    return rows.map((r) => r.TABLE_NAME);
  }

  /** Column names + data types of a table in the write schema. */
  private async columnsOf(
    table: string,
  ): Promise<{ name: string; type: string }[]> {
    const rows = await this.write.query<{
      COLUMN_NAME: string;
      DATA_TYPE: string;
    }>(
      `SELECT COLUMN_NAME, DATA_TYPE
         FROM ALL_TAB_COLUMNS
        WHERE OWNER = :owner AND TABLE_NAME = :tbl
        ORDER BY COLUMN_ID`,
      { owner: this.schema, tbl: table } as BindParameters,
    );
    return rows.map((r) => ({ name: r.COLUMN_NAME, type: r.DATA_TYPE }));
  }

  /**
   * Export a single table's rows as plain objects. CLOB/NCLOB columns are
   * fetched as strings (materialised), dates as JS Date (serialised by the
   * service). The table name is validated against the real column catalog
   * before it is interpolated (it is an Oracle identifier, never user input).
   */
  async exportTable(table: string): Promise<ExportedTable> {
    const cols = await this.columnsOf(table);
    if (cols.length === 0) {
      // Unknown/empty table — return an empty export rather than throwing so a
      // single odd table never aborts the whole backup.
      return { table, rowCount: 0, rows: [] };
    }
    // Materialise LOB columns to strings so JSON.stringify sees plain text.
    const fetchInfo: NonNullable<oracledb.ExecuteOptions['fetchInfo']> = {};
    for (const c of cols) {
      if (c.type === 'CLOB' || c.type === 'NCLOB') {
        fetchInfo[c.name] = { type: oracledb.STRING };
      }
    }
    // Identifier is schema-qualified and drawn from the catalog (safe).
    const rows = await this.write.queryWith<Record<string, unknown>>(
      `SELECT * FROM ${this.schema}."${table}"`,
      {},
      Object.keys(fetchInfo).length > 0 ? { fetchInfo } : {},
    );
    return { table, rowCount: rows.length, rows };
  }

  //==========================================================================
  // BACKUP_RUNS history
  //==========================================================================

  private toIso(v: Date | string | null): string | null {
    if (v == null) return null;
    return v instanceof Date ? v.toISOString() : String(v);
  }

  private mapRun(r: RunRowDb): BackupRun {
    return {
      id: r.ID,
      backupNo: Number(r.BACKUP_NO),
      triggerKind: (r.TRIGGER_KIND as BackupTrigger) ?? 'MANUAL',
      format: r.FORMAT === 'SQL' ? 'SQL' : 'JSON',
      status: (r.STATUS as BackupStatus) ?? 'RUNNING',
      fileName: r.FILE_NAME ?? null,
      filePath: r.FILE_PATH ?? null,
      fileBytes: r.FILE_BYTES == null ? null : Number(r.FILE_BYTES),
      tableCount: r.TABLE_COUNT == null ? null : Number(r.TABLE_COUNT),
      rowCount: r.ROW_COUNT == null ? null : Number(r.ROW_COUNT),
      schemaName: r.SCHEMA_NAME ?? null,
      errorMessage: r.ERROR_MESSAGE ?? null,
      createdBy: r.CREATED_BY ?? null,
      startedAt: this.toIso(r.STARTED_AT) ?? new Date().toISOString(),
      finishedAt: this.toIso(r.FINISHED_AT),
      durationMs: r.DURATION_MS == null ? null : Number(r.DURATION_MS),
    };
  }

  private readonly runCols =
    'ID, BACKUP_NO, TRIGGER_KIND, FORMAT, STATUS, FILE_NAME, FILE_PATH, FILE_BYTES, TABLE_COUNT, ROW_COUNT, SCHEMA_NAME, ERROR_MESSAGE, CREATED_BY, STARTED_AT, FINISHED_AT, DURATION_MS';

  async startRun(
    input: StartBackupInput,
  ): Promise<{ id: string; backupNo: number }> {
    const id = uuidv7();
    const seqRow = await this.write.queryOne<{ N: number }>(
      `SELECT ${this.schema}.SEQ_BACKUP_NO.NEXTVAL AS N FROM DUAL`,
    );
    const backupNo = seqRow ? Number(seqRow.N) : 0;
    await this.write.execute(
      // NB: :by is an Oracle reserved word as a bind name (ORA-01745) — use
      // :createdBy. Same lesson as V018's :cancelledBy.
      `INSERT INTO ${this.schema}.${RUNS_TABLE}
         (ID, BACKUP_NO, TRIGGER_KIND, FORMAT, STATUS, SCHEMA_NAME, CREATED_BY)
       VALUES (:id, :no, :trig, :fmt, 'RUNNING', :schemaName, :createdBy)`,
      {
        id,
        no: backupNo,
        trig: input.triggerKind,
        fmt: input.format,
        schemaName: input.schemaName,
        createdBy: input.createdBy,
      } as BindParameters,
    );
    return { id, backupNo };
  }

  async finishRun(input: FinishBackupInput): Promise<void> {
    await this.write.execute(
      `UPDATE ${this.schema}.${RUNS_TABLE}
          SET STATUS        = :status,
              FILE_NAME     = :fileName,
              FILE_PATH     = :filePath,
              FILE_BYTES    = :fileBytes,
              TABLE_COUNT   = :tableCount,
              ROW_COUNT     = :rowCount,
              ERROR_MESSAGE = :err,
              FINISHED_AT   = SYSTIMESTAMP,
              DURATION_MS   = :dur
        WHERE ID = :id`,
      {
        id: input.id,
        status: input.status,
        fileName: input.fileName ?? null,
        filePath: input.filePath ?? null,
        fileBytes: { val: input.fileBytes ?? null, type: oracledb.NUMBER },
        tableCount: { val: input.tableCount ?? null, type: oracledb.NUMBER },
        rowCount: { val: input.rowCount ?? null, type: oracledb.NUMBER },
        err: input.errorMessage ?? null,
        dur: { val: input.durationMs, type: oracledb.NUMBER },
      } as BindParameters,
    );
  }

  async listRuns(limit: number): Promise<BackupRun[]> {
    const rows = await this.write.query<RunRowDb>(
      `SELECT ${this.runCols}
         FROM ${this.schema}.${RUNS_TABLE}
        ORDER BY STARTED_AT DESC
        FETCH FIRST :lim ROWS ONLY`,
      { lim: limit } as BindParameters,
    );
    return rows.map((r) => this.mapRun(r));
  }

  async getRun(id: string): Promise<BackupRun | null> {
    const row = await this.write.queryOne<RunRowDb>(
      `SELECT ${this.runCols}
         FROM ${this.schema}.${RUNS_TABLE}
        WHERE ID = :id`,
      { id } as BindParameters,
    );
    return row ? this.mapRun(row) : null;
  }
}
