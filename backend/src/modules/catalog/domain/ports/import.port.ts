export const IMPORT_REPOSITORY = Symbol('IMPORT_REPOSITORY');

export type ImportKind = 'ITEMS' | 'PRICES' | 'BALANCES';

export interface ImportRowError {
  row: number; // 1-based data row number (excludes the header)
  code: string; // machine-readable error code
  message: string; // Arabic-friendly message
}

export interface ImportBatchRow {
  id: string;
  kind: ImportKind;
  fileName: string | null;
  totalRows: number;
  okRows: number;
  errorRows: number;
  status: 'DONE' | 'FAILED';
  errors: ImportRowError[];
  createdBy: number | null;
  createdAt: string;
}

export interface SaveImportBatch {
  kind: ImportKind;
  fileName: string | null;
  totalRows: number;
  okRows: number;
  errorRows: number;
  status: 'DONE' | 'FAILED';
  errors: ImportRowError[];
  createdBy: number | null;
}

export interface UpsertOpeningBalance {
  iCode: string;
  wCode: number;
  qty: number;
  batchId: string;
}

/**
 * ImportRepository — POS_IMPXLS audit batches (IMPORT_BATCHES) + opening-stock
 * balances (ITEM_OPENING_BALANCES). Writes to MOTECH_POS only. (V029)
 */
export interface ImportRepository {
  saveBatch(input: SaveImportBatch): Promise<ImportBatchRow>;
  listBatches(limit: number): Promise<ImportBatchRow[]>;
  getBatch(id: string): Promise<ImportBatchRow | null>;
  upsertOpeningBalance(input: UpsertOpeningBalance): Promise<void>;
}
