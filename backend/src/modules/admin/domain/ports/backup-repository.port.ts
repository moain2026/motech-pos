/** DI token for the BackupRepository port (MOTECH_POS write schema only). */
export const BACKUP_REPOSITORY = Symbol('BACKUP_REPOSITORY');

/** How a backup was triggered. */
export type BackupTrigger = 'MANUAL' | 'SCHEDULED';

/** Lifecycle status of a backup run. */
export type BackupStatus = 'RUNNING' | 'SUCCESS' | 'FAILED';

/** One recorded backup run (row in MOTECH_POS.BACKUP_RUNS). */
export interface BackupRun {
  id: string;
  backupNo: number;
  triggerKind: BackupTrigger;
  format: 'JSON' | 'SQL';
  status: BackupStatus;
  fileName: string | null;
  filePath: string | null;
  fileBytes: number | null;
  tableCount: number | null;
  rowCount: number | null;
  schemaName: string | null;
  errorMessage: string | null;
  createdBy: string | null;
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
}

/** Fields captured when a run starts. */
export interface StartBackupInput {
  triggerKind: BackupTrigger;
  format: 'JSON';
  schemaName: string;
  createdBy: string | null;
}

/** Fields patched when a run finishes (success or failure). */
export interface FinishBackupInput {
  id: string;
  status: 'SUCCESS' | 'FAILED';
  fileName?: string | null;
  filePath?: string | null;
  fileBytes?: number | null;
  tableCount?: number | null;
  rowCount?: number | null;
  errorMessage?: string | null;
  durationMs: number;
}

/** A single MOTECH_POS table exported as an array of plain-object rows. */
export interface ExportedTable {
  table: string;
  rowCount: number;
  rows: Record<string, unknown>[];
}

/**
 * BackupRepository — enumerates and exports the MOTECH_POS WRITE schema and
 * records the BACKUP_RUNS history. It reads ONLY the MOTECH_POS schema (our
 * own data) through OracleWriteService; the live YSPOS23 / IAS202623 ERP
 * schemas are never touched. Schema-qualified SQL, bind variables only.
 */
export interface BackupRepository {
  /** The MOTECH_POS schema name being backed up. */
  schemaName(): string;

  /** List all base table names owned by the write schema (alphabetical). */
  listTableNames(): Promise<string[]>;

  /** Export a single table's rows as plain objects (CLOBs materialised). */
  exportTable(table: string): Promise<ExportedTable>;

  /** Insert a RUNNING backup row; returns its id + serial number. */
  startRun(input: StartBackupInput): Promise<{ id: string; backupNo: number }>;

  /** Patch a run to SUCCESS/FAILED with the final metrics. */
  finishRun(input: FinishBackupInput): Promise<void>;

  /** List past backup runs, newest first. */
  listRuns(limit: number): Promise<BackupRun[]>;

  /** Fetch a single run by id (for download / metadata). */
  getRun(id: string): Promise<BackupRun | null>;
}
