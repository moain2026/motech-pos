import { Injectable } from '@nestjs/common';
import oracledb from 'oracledb';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import {
  ImportBatchRow,
  ImportRepository,
  ImportRowError,
  SaveImportBatch,
  UpsertOpeningBalance,
} from '../domain/ports/import.port';

/**
 * OracleImportRepository — MOTECH_POS.IMPORT_BATCHES + ITEM_OPENING_BALANCES
 * (V029). Writes only to our own schema via MOTECH_RW.
 */
@Injectable()
export class OracleImportRepository implements ImportRepository {
  constructor(private readonly db: OracleWriteService) {}

  private get schema(): string {
    return this.db.schema();
  }

  private mapBatch(r: Record<string, unknown>, errors: string): ImportBatchRow {
    let parsed: ImportRowError[] = [];
    try {
      parsed = errors ? (JSON.parse(errors) as ImportRowError[]) : [];
    } catch {
      parsed = [];
    }
    return {
      id: r.ID as string,
      kind: r.KIND as ImportBatchRow['kind'],
      fileName: (r.FILE_NAME as string) ?? null,
      totalRows: Number(r.TOTAL_ROWS ?? 0),
      okRows: Number(r.OK_ROWS ?? 0),
      errorRows: Number(r.ERROR_ROWS ?? 0),
      status: r.STATUS as ImportBatchRow['status'],
      errors: parsed,
      createdBy: r.CREATED_BY == null ? null : Number(r.CREATED_BY),
      createdAt:
        r.CREATED_AT instanceof Date
          ? r.CREATED_AT.toISOString()
          : String(r.CREATED_AT ?? ''),
    };
  }

  async saveBatch(input: SaveImportBatch): Promise<ImportBatchRow> {
    const id = uuidv7();
    const errorsJson = JSON.stringify(input.errors ?? []);
    await this.db.execute(
      `INSERT INTO ${this.schema}.IMPORT_BATCHES
         (ID, KIND, FILE_NAME, TOTAL_ROWS, OK_ROWS, ERROR_ROWS, STATUS, ERROR_JSON, CREATED_BY)
       VALUES
         (:id, :kind, :fileName, :total, :ok, :err, :status, :errors, :createdBy)`,
      {
        id,
        kind: input.kind,
        fileName: input.fileName ?? null,
        total: input.totalRows,
        ok: input.okRows,
        err: input.errorRows,
        status: input.status,
        errors: { val: errorsJson, type: oracledb.CLOB },
        createdBy: { val: input.createdBy ?? null, type: oracledb.NUMBER },
      },
    );
    return (await this.getBatch(id))!;
  }

  async listBatches(limit: number): Promise<ImportBatchRow[]> {
    const rows = await this.db.queryWith(
      `SELECT ID, KIND, FILE_NAME, TOTAL_ROWS, OK_ROWS, ERROR_ROWS, STATUS,
              ERROR_JSON, CREATED_BY, CREATED_AT
         FROM ${this.schema}.IMPORT_BATCHES
        ORDER BY CREATED_AT DESC
        FETCH FIRST :lim ROWS ONLY`,
      { lim: limit },
      { fetchInfo: { ERROR_JSON: { type: oracledb.STRING } } },
    );
    return rows.map((r) => this.mapBatch(r, (r.ERROR_JSON as string) ?? ''));
  }

  async getBatch(id: string): Promise<ImportBatchRow | null> {
    const rows = await this.db.queryWith(
      `SELECT ID, KIND, FILE_NAME, TOTAL_ROWS, OK_ROWS, ERROR_ROWS, STATUS,
              ERROR_JSON, CREATED_BY, CREATED_AT
         FROM ${this.schema}.IMPORT_BATCHES WHERE ID = :id`,
      { id },
      { fetchInfo: { ERROR_JSON: { type: oracledb.STRING } } },
    );
    if (rows.length === 0) return null;
    const r = rows[0];
    return this.mapBatch(r, (r.ERROR_JSON as string) ?? '');
  }

  async upsertOpeningBalance(input: UpsertOpeningBalance): Promise<void> {
    await this.db.execute(
      `MERGE INTO ${this.schema}.ITEM_OPENING_BALANCES t
       USING (SELECT :iCode AS I_CODE, :wCode AS W_CODE FROM DUAL) s
       ON (t.I_CODE = s.I_CODE AND t.W_CODE = s.W_CODE)
       WHEN MATCHED THEN UPDATE SET
         QTY = :qty, SOURCE = 'IMPORT', BATCH_ID = :batchId, UPDATED_AT = SYSTIMESTAMP
       WHEN NOT MATCHED THEN INSERT (ID, I_CODE, W_CODE, QTY, SOURCE, BATCH_ID)
         VALUES (:id, :iCode, :wCode, :qty, 'IMPORT', :batchId)`,
      {
        id: uuidv7(),
        iCode: input.iCode,
        wCode: { val: input.wCode, type: oracledb.NUMBER },
        qty: { val: input.qty, type: oracledb.NUMBER },
        batchId: input.batchId,
      },
    );
  }
}
