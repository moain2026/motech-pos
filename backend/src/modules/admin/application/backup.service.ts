import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { TypedConfigService } from '../../../config/config.module';
import {
  BackupRepository,
  BACKUP_REPOSITORY,
  BackupRun,
  BackupTrigger,
} from '../domain/ports/backup-repository.port';

/** Result of a single "backup now" operation. */
export interface BackupResult {
  run: BackupRun;
  /** True when a backup was already running and this call was skipped. */
  skipped?: boolean;
}

/** Shape of the JSON snapshot file written to disk. */
interface SnapshotFile {
  motechBackup: true;
  schema: string;
  format: 'JSON';
  createdAt: string;
  backupNo: number;
  tableCount: number;
  rowCount: number;
  tables: { table: string; rowCount: number; rows: Record<string, unknown>[] }[];
}

/**
 * BackupService — POSS003. Takes a logical export of the MOTECH_POS write
 * schema (our own data: BILLS/PAYMENTS/CATALOG_CACHE and the overlays) as a
 * downloadable JSON snapshot, records the run in BACKUP_RUNS, and lists past
 * backups. The live YSPOS23 / IAS202623 ERP is NEVER exported — production is
 * strictly read-only.
 *
 * A single in-flight guard prevents two backups running at once (so a slow
 * export never overlaps a scheduled tick). Old snapshot files are pruned to
 * BACKUP_RETENTION most-recent files.
 */
@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private running = false;

  constructor(
    @Inject(BACKUP_REPOSITORY) private readonly repo: BackupRepository,
    private readonly config: TypedConfigService,
  ) {}

  /** Absolute backup directory (created lazily). */
  private backupDir(): string {
    const dir = this.config.get('BACKUP_DIR');
    return path.isAbsolute(dir) ? dir : path.resolve(process.cwd(), dir);
  }

  /**
   * JSON dates: node-oracledb returns DATE/TIMESTAMP as JS Date. Serialise
   * them to ISO so the snapshot is portable and re-importable.
   */
  private jsonReplacer(_key: string, value: unknown): unknown {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'bigint') return value.toString();
    if (Buffer.isBuffer(value)) return value.toString('base64');
    return value;
  }

  /** Take a backup now (manual or scheduled). Returns the recorded run. */
  async runBackup(
    trigger: BackupTrigger,
    createdBy: string | null,
  ): Promise<BackupResult> {
    if (this.running) {
      // Surface the most recent run so the caller has something to show.
      const [latest] = await this.repo.listRuns(1);
      return { run: latest, skipped: true };
    }
    this.running = true;
    const startedAt = Date.now();
    const schema = this.repo.schemaName();
    const { id, backupNo } = await this.repo.startRun({
      triggerKind: trigger,
      format: 'JSON',
      schemaName: schema,
      createdBy,
    });
    try {
      const tables = await this.repo.listTableNames();
      const exported: SnapshotFile['tables'] = [];
      let totalRows = 0;
      for (const table of tables) {
        const t = await this.repo.exportTable(table);
        totalRows += t.rowCount;
        exported.push({ table: t.table, rowCount: t.rowCount, rows: t.rows });
      }

      const snapshot: SnapshotFile = {
        motechBackup: true,
        schema,
        format: 'JSON',
        createdAt: new Date().toISOString(),
        backupNo,
        tableCount: tables.length,
        rowCount: totalRows,
        tables: exported,
      };

      const dir = this.backupDir();
      await fs.mkdir(dir, { recursive: true });
      const stamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .slice(0, 19);
      const fileName = `motech-backup-${String(backupNo).padStart(
        5,
        '0',
      )}-${stamp}.json`;
      const filePath = path.join(dir, fileName);
      const body = JSON.stringify(snapshot, this.jsonReplacer, 0);
      await fs.writeFile(filePath, body, 'utf8');
      const bytes = Buffer.byteLength(body, 'utf8');

      await this.repo.finishRun({
        id,
        status: 'SUCCESS',
        fileName,
        filePath,
        fileBytes: bytes,
        tableCount: tables.length,
        rowCount: totalRows,
        durationMs: Date.now() - startedAt,
      });

      this.logger.log(
        `Backup #${backupNo} OK: ${tables.length} tables, ${totalRows} rows, ${bytes} bytes → ${fileName}`,
      );
      await this.pruneOldFiles(dir).catch((e) =>
        this.logger.warn(`Backup prune failed: ${String(e)}`),
      );

      const run = await this.repo.getRun(id);
      if (!run) throw new Error('Backup run vanished after finish');
      return { run };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Backup #${backupNo} FAILED: ${msg}`);
      await this.repo
        .finishRun({
          id,
          status: 'FAILED',
          errorMessage: msg.slice(0, 1990),
          durationMs: Date.now() - startedAt,
        })
        .catch(() => undefined);
      const run = await this.repo.getRun(id);
      if (run) return { run };
      throw err;
    } finally {
      this.running = false;
    }
  }

  /** Keep only the newest BACKUP_RETENTION files in the backup directory. */
  private async pruneOldFiles(dir: string): Promise<void> {
    const keep = this.config.get('BACKUP_RETENTION');
    const entries = await fs.readdir(dir);
    const files = entries.filter(
      (f) => f.startsWith('motech-backup-') && f.endsWith('.json'),
    );
    if (files.length <= keep) return;
    // Names embed a zero-padded serial → lexical sort == chronological.
    files.sort();
    const toDelete = files.slice(0, files.length - keep);
    for (const f of toDelete) {
      await fs.unlink(path.join(dir, f)).catch(() => undefined);
    }
    if (toDelete.length > 0) {
      this.logger.log(`Pruned ${toDelete.length} old backup file(s)`);
    }
  }

  /** List past backup runs, newest first. */
  listRuns(limit: number): Promise<BackupRun[]> {
    return this.repo.listRuns(Math.min(Math.max(limit, 1), 500));
  }

  /**
   * Resolve a run to its on-disk file for download. Throws 404 when the run is
   * unknown, unfinished, or its file is missing.
   */
  async getDownload(
    id: string,
  ): Promise<{ run: BackupRun; filePath: string; fileName: string }> {
    const run = await this.repo.getRun(id);
    if (!run) throw new NotFoundException(`Backup ${id} not found`);
    if (run.status !== 'SUCCESS' || !run.filePath || !run.fileName) {
      throw new NotFoundException(`Backup ${id} has no downloadable file`);
    }
    try {
      await fs.access(run.filePath);
    } catch {
      throw new NotFoundException(
        `Backup ${id} file is no longer on disk (may have been pruned)`,
      );
    }
    return { run, filePath: run.filePath, fileName: run.fileName };
  }
}
