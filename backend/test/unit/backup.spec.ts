import { promises as fs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BackupService } from '../../src/modules/admin/application/backup.service';
import {
  BackupRepository,
  BackupRun,
  ExportedTable,
  FinishBackupInput,
  StartBackupInput,
} from '../../src/modules/admin/domain/ports/backup-repository.port';

/** In-memory fake of the MOTECH_POS backup repository. */
class FakeBackupRepo implements BackupRepository {
  runs: BackupRun[] = [];
  tables: Record<string, Record<string, unknown>[]> = {};
  private seq = 0;
  // Hook: make exportTable throw for a given table (simulate a DB error).
  failTable: string | null = null;

  schemaName(): string {
    return 'MOTECH_POS';
  }
  listTableNames(): Promise<string[]> {
    return Promise.resolve(Object.keys(this.tables).sort());
  }
  exportTable(table: string): Promise<ExportedTable> {
    if (this.failTable === table) {
      return Promise.reject(new Error(`ORA-00942 on ${table}`));
    }
    const rows = this.tables[table] ?? [];
    return Promise.resolve({ table, rowCount: rows.length, rows });
  }
  startRun(input: StartBackupInput): Promise<{ id: string; backupNo: number }> {
    const backupNo = ++this.seq;
    const id = `bk${backupNo}`;
    this.runs.unshift({
      id,
      backupNo,
      triggerKind: input.triggerKind,
      format: input.format,
      status: 'RUNNING',
      fileName: null,
      filePath: null,
      fileBytes: null,
      tableCount: null,
      rowCount: null,
      schemaName: input.schemaName,
      errorMessage: null,
      createdBy: input.createdBy,
      startedAt: new Date().toISOString(),
      finishedAt: null,
      durationMs: null,
    });
    return Promise.resolve({ id, backupNo });
  }
  finishRun(input: FinishBackupInput): Promise<void> {
    const run = this.runs.find((r) => r.id === input.id);
    if (run) {
      run.status = input.status;
      run.fileName = input.fileName ?? null;
      run.filePath = input.filePath ?? null;
      run.fileBytes = input.fileBytes ?? null;
      run.tableCount = input.tableCount ?? null;
      run.rowCount = input.rowCount ?? null;
      run.errorMessage = input.errorMessage ?? null;
      run.durationMs = input.durationMs;
      run.finishedAt = new Date().toISOString();
    }
    return Promise.resolve();
  }
  listRuns(limit: number): Promise<BackupRun[]> {
    return Promise.resolve(this.runs.slice(0, limit));
  }
  getRun(id: string): Promise<BackupRun | null> {
    return Promise.resolve(this.runs.find((r) => r.id === id) ?? null);
  }
}

/** Minimal fake config exposing only the keys BackupService reads. */
function fakeConfig(dir: string, retention = 30) {
  const map: Record<string, unknown> = {
    BACKUP_DIR: dir,
    BACKUP_RETENTION: retention,
  };
  return {
    get: (k: string) => map[k],
  } as unknown as ConstructorParameters<typeof BackupService>[1];
}

describe('BackupService (POSS003 data backup)', () => {
  let repo: FakeBackupRepo;
  let dir: string;
  let svc: BackupService;

  beforeEach(async () => {
    repo = new FakeBackupRepo();
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'motech-bk-'));
    svc = new BackupService(repo, fakeConfig(dir));
  });

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => undefined);
  });

  it('exports MOTECH_POS tables to a JSON file and records a SUCCESS run', async () => {
    repo.tables = {
      BILLS: [{ ID: '1', BILL_NO: '260700100000001', NET_AMT: 100 }],
      PAYMENTS: [{ ID: 'p1', METHOD: 'CASH', AMOUNT: 100 }],
      CATALOG_CACHE: [],
    };
    const { run, skipped } = await svc.runBackup('MANUAL', '2');
    expect(skipped).toBeFalsy();
    expect(run.status).toBe('SUCCESS');
    expect(run.tableCount).toBe(3);
    expect(run.rowCount).toBe(2);
    expect(run.createdBy).toBe('2');
    expect(run.fileName).toMatch(/^motech-backup-\d{5}-.*\.json$/);
    expect(run.fileBytes).toBeGreaterThan(0);

    // The file exists on disk and round-trips as a valid snapshot.
    const body = await fs.readFile(run.filePath!, 'utf8');
    const snap = JSON.parse(body);
    expect(snap.motechBackup).toBe(true);
    expect(snap.schema).toBe('MOTECH_POS');
    expect(snap.tableCount).toBe(3);
    expect(snap.rowCount).toBe(2);
    const bills = snap.tables.find((t: { table: string }) => t.table === 'BILLS');
    expect(bills.rows[0].BILL_NO).toBe('260700100000001');
  });

  it('serialises Date values to ISO strings in the snapshot', async () => {
    const when = new Date('2026-07-06T01:00:00.000Z');
    repo.tables = { SHIFTS: [{ ID: 's1', OPENED_AT: when }] };
    const { run } = await svc.runBackup('SCHEDULED', null);
    const snap = JSON.parse(await fs.readFile(run.filePath!, 'utf8'));
    expect(snap.tables[0].rows[0].OPENED_AT).toBe('2026-07-06T01:00:00.000Z');
  });

  it('records a FAILED run when a table export throws', async () => {
    repo.tables = { BILLS: [{ ID: '1' }], BADTBL: [{ ID: 'x' }] };
    repo.failTable = 'BADTBL';
    const { run } = await svc.runBackup('MANUAL', null);
    expect(run.status).toBe('FAILED');
    expect(run.errorMessage).toMatch(/ORA-00942/);
  });

  it('lists past runs newest-first', async () => {
    repo.tables = { BILLS: [] };
    await svc.runBackup('MANUAL', null);
    await svc.runBackup('SCHEDULED', null);
    const runs = await svc.listRuns(10);
    expect(runs.length).toBe(2);
    expect(runs[0].backupNo).toBeGreaterThan(runs[1].backupNo);
  });

  it('getDownload resolves a SUCCESS run to its file; 404s otherwise', async () => {
    repo.tables = { BILLS: [{ ID: '1' }] };
    const { run } = await svc.runBackup('MANUAL', null);
    const dl = await svc.getDownload(run.id);
    expect(dl.fileName).toBe(run.fileName);
    await expect(svc.getDownload('nope')).rejects.toThrow(/not found/i);
    // Deleting the file makes download 404 (pruned).
    await fs.unlink(run.filePath!);
    await expect(svc.getDownload(run.id)).rejects.toThrow(/no longer on disk/i);
  });

  it('prunes old snapshot files beyond the retention limit', async () => {
    svc = new BackupService(repo, fakeConfig(dir, 2));
    repo.tables = { BILLS: [] };
    await svc.runBackup('MANUAL', null);
    await svc.runBackup('MANUAL', null);
    await svc.runBackup('MANUAL', null);
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.json'));
    expect(files.length).toBe(2); // oldest pruned
  });
});
