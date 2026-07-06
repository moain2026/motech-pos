import { Inject, Injectable } from '@nestjs/common';
import { InvalidOverlayError } from '../../../shared/errors/domain-error';
import {
  ImportBatchRow,
  ImportKind,
  ImportRepository,
  ImportRowError,
  IMPORT_REPOSITORY,
} from '../domain/ports/import.port';
import {
  ItemRepository,
  ITEM_REPOSITORY,
} from '../domain/ports/item-repository.port';
import {
  ItemOverlayRepository,
  ITEM_OVERLAY_REPOSITORY,
} from '../domain/ports/item-overlay.port';
import { parseSpreadsheet, SheetMatrix } from '../domain/spreadsheet-parser';

export interface ImportPreview {
  kind: ImportKind;
  fileName: string;
  headers: string[];
  totalRows: number;
  okRows: number;
  errorRows: number;
  /** First N valid rows mapped to their target shape (preview). */
  sample: Record<string, unknown>[];
  errors: ImportRowError[];
}

export interface ImportResult extends ImportPreview {
  committed: boolean;
  batch: ImportBatchRow | null;
}

interface ColumnSpec {
  /** canonical field name */
  field: string;
  /** accepted header aliases (case-insensitive, Arabic + English) */
  aliases: string[];
  required: boolean;
}

/** Column definitions per import kind (header → canonical field). */
const COLUMNS: Record<ImportKind, ColumnSpec[]> = {
  ITEMS: [
    { field: 'code', aliases: ['code', 'كود', 'الكود', 'i_code', 'itemcode', 'رقم الصنف'], required: true },
    { field: 'name', aliases: ['name', 'الاسم', 'اسم', 'اسم الصنف', 'i_name'], required: false },
    { field: 'barcode', aliases: ['barcode', 'باركود', 'الباركود'], required: false },
    { field: 'unit', aliases: ['unit', 'وحدة', 'الوحدة'], required: false },
    { field: 'price', aliases: ['price', 'سعر', 'السعر', 'سعر البيع'], required: false },
    { field: 'vatPercent', aliases: ['vat', 'ضريبة', 'الضريبة', 'vatpercent', 'نسبة الضريبة'], required: false },
  ],
  PRICES: [
    { field: 'code', aliases: ['code', 'كود', 'الكود', 'i_code', 'itemcode', 'رقم الصنف'], required: true },
    { field: 'price', aliases: ['price', 'سعر', 'السعر', 'سعر البيع'], required: true },
  ],
  BALANCES: [
    { field: 'code', aliases: ['code', 'كود', 'الكود', 'i_code', 'itemcode', 'رقم الصنف'], required: true },
    { field: 'qty', aliases: ['qty', 'quantity', 'كمية', 'الكمية', 'الرصيد', 'رصيد'], required: true },
    { field: 'warehouse', aliases: ['warehouse', 'مخزن', 'المخزن', 'w_code', 'wcode'], required: false },
  ],
};

const norm = (s: string) => (s ?? '').trim().toLowerCase();

/**
 * ImportService — POS_IMPXLS Excel/CSV import for items, prices and opening
 * balances. Parses the file (dependency-free XLSX/CSV), maps columns by header,
 * validates every row, and either previews (dry-run) or commits the valid rows
 * to MOTECH_POS overlays — collecting a per-row error report either way.
 */
@Injectable()
export class ImportService {
  static readonly SAMPLE_SIZE = 20;
  static readonly MAX_ROWS = 20000;

  constructor(
    @Inject(IMPORT_REPOSITORY) private readonly repo: ImportRepository,
    @Inject(ITEM_REPOSITORY) private readonly items: ItemRepository,
    @Inject(ITEM_OVERLAY_REPOSITORY)
    private readonly overlay: ItemOverlayRepository,
  ) {}

  /** Map header row to canonical field → column index. */
  private mapHeaders(
    kind: ImportKind,
    headerRow: string[],
  ): { map: Record<string, number>; missing: string[] } {
    const specs = COLUMNS[kind];
    const headerNorm = headerRow.map((h) => norm(h));
    const map: Record<string, number> = {};
    for (const spec of specs) {
      const idx = headerNorm.findIndex((h) => spec.aliases.includes(h));
      if (idx >= 0) map[spec.field] = idx;
    }
    const missing = specs
      .filter((s) => s.required && !(s.field in map))
      .map((s) => s.field);
    return { map, missing };
  }

  private parseNumber(raw: string): number | null {
    const t = (raw ?? '').trim().replace(/,/g, '');
    if (t === '') return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : NaN as unknown as number;
  }

  /**
   * Parse + validate a spreadsheet. Returns the preview (mapped valid rows +
   * per-row errors). When `commit` is true, valid rows are written to the
   * MOTECH_POS overlays and an IMPORT_BATCHES audit row is recorded.
   */
  async run(
    kind: ImportKind,
    buffer: Buffer,
    fileName: string,
    commit: boolean,
    createdBy: number | null,
  ): Promise<ImportResult> {
    let matrix: SheetMatrix;
    try {
      matrix = parseSpreadsheet(buffer, fileName);
    } catch (e) {
      throw new InvalidOverlayError(
        `Could not parse the file: ${(e as Error).message}`,
        { fileName },
      );
    }
    if (matrix.length === 0) {
      throw new InvalidOverlayError('The file is empty', { fileName });
    }
    const headerRow = matrix[0];
    const dataRows = matrix.slice(1);
    if (dataRows.length > ImportService.MAX_ROWS) {
      throw new InvalidOverlayError(
        `Too many rows (${dataRows.length}); max ${ImportService.MAX_ROWS}`,
        { rows: dataRows.length },
      );
    }

    const { map, missing } = this.mapHeaders(kind, headerRow);
    if (missing.length > 0) {
      throw new InvalidOverlayError(
        `Missing required column(s): ${missing.join(', ')}`,
        { missing, headers: headerRow },
      );
    }

    const errors: ImportRowError[] = [];
    // Each valid entry carries its 1-based data-row number for precise reports.
    const valid: Array<Record<string, unknown> & { __row: number }> = [];

    for (let i = 0; i < dataRows.length; i++) {
      const rowNo = i + 1;
      const cells = dataRows[i];
      const get = (field: string): string =>
        map[field] != null ? (cells[map[field]] ?? '').trim() : '';

      const code = get('code');
      if (!code) {
        errors.push({ row: rowNo, code: 'missing-code', message: 'كود الصنف مطلوب' });
        continue;
      }

      if (kind === 'ITEMS') {
        const priceRaw = get('price');
        const price = priceRaw ? this.parseNumber(priceRaw) : null;
        if (priceRaw && (price == null || Number.isNaN(price) || price < 0)) {
          errors.push({ row: rowNo, code: 'bad-price', message: `سعر غير صالح: '${priceRaw}'` });
          continue;
        }
        const vatRaw = get('vatPercent');
        const vat = vatRaw ? this.parseNumber(vatRaw) : null;
        if (vatRaw && (vat == null || Number.isNaN(vat) || vat < 0)) {
          errors.push({ row: rowNo, code: 'bad-vat', message: `نسبة ضريبة غير صالحة: '${vatRaw}'` });
          continue;
        }
        valid.push({
          __row: rowNo,
          code,
          name: get('name') || null,
          barcode: get('barcode') || null,
          unit: get('unit') || null,
          price: price ?? null,
          vatPercent: vat ?? null,
        });
      } else if (kind === 'PRICES') {
        const priceRaw = get('price');
        const price = this.parseNumber(priceRaw);
        if (price == null || Number.isNaN(price) || price < 0) {
          errors.push({ row: rowNo, code: 'bad-price', message: `سعر غير صالح: '${priceRaw}'` });
          continue;
        }
        valid.push({ __row: rowNo, code, price });
      } else {
        // BALANCES
        const qtyRaw = get('qty');
        const qty = this.parseNumber(qtyRaw);
        if (qty == null || Number.isNaN(qty)) {
          errors.push({ row: rowNo, code: 'bad-qty', message: `كمية غير صالحة: '${qtyRaw}'` });
          continue;
        }
        const whRaw = get('warehouse');
        let wCode = 0;
        if (whRaw) {
          const w = this.parseNumber(whRaw);
          if (w == null || Number.isNaN(w) || w < 0 || !Number.isInteger(w)) {
            errors.push({ row: rowNo, code: 'bad-warehouse', message: `مخزن غير صالح: '${whRaw}'` });
            continue;
          }
          wCode = w;
        }
        valid.push({ __row: rowNo, code, qty, wCode });
      }
    }

    // For PRICES/BALANCES the item must exist (ERP or overlay). Batched lookup
    // (overlay in one query, ERP per unique code) to avoid N+1, then move any
    // unknown-item rows to the error list keeping their original row numbers.
    if ((kind === 'PRICES' || kind === 'BALANCES') && valid.length > 0) {
      const codes = [...new Set(valid.map((v) => v.code as string))];
      const overlayHits = await this.overlay.findByCodes(codes);
      const unknownCodes = new Set<string>();
      for (const code of codes) {
        if (overlayHits.has(code)) continue;
        const erp = await this.items.findByCode(code);
        if (!erp) unknownCodes.add(code);
      }
      if (unknownCodes.size > 0) {
        for (let i = valid.length - 1; i >= 0; i--) {
          const v = valid[i];
          if (unknownCodes.has(v.code as string)) {
            errors.push({
              row: v.__row,
              code: 'unknown-item',
              message: `الصنف غير موجود: '${v.code as string}'`,
            });
            valid.splice(i, 1);
          }
        }
      }
    }

    errors.sort((a, b) => a.row - b.row);

    // Strip the internal row tag before persisting / returning.
    const validClean = valid.map(({ __row, ...rest }) => {
      void __row;
      return rest;
    });

    let committed = false;
    let batch: ImportBatchRow | null = null;
    if (commit && validClean.length > 0) {
      await this.commitRows(kind, validClean);
      committed = true;
    }
    if (commit) {
      batch = await this.repo.saveBatch({
        kind,
        fileName,
        totalRows: dataRows.length,
        okRows: validClean.length,
        errorRows: errors.length,
        status: 'DONE',
        errors,
        createdBy,
      });
    }

    return {
      kind,
      fileName,
      headers: headerRow,
      totalRows: dataRows.length,
      okRows: validClean.length,
      errorRows: errors.length,
      sample: validClean.slice(0, ImportService.SAMPLE_SIZE),
      errors,
      committed,
      batch,
    };
  }

  private async commitRows(
    kind: ImportKind,
    valid: Record<string, unknown>[],
  ): Promise<void> {
    if (kind === 'ITEMS') {
      for (const v of valid) {
        const code = v.code as string;
        const erp = await this.items.findByCode(code);
        const existing = await this.overlay.findByCode(code);
        const origin: 'LOCAL' | 'EDIT' =
          existing?.origin === 'LOCAL' || !erp ? 'LOCAL' : 'EDIT';
        await this.overlay.upsert({
          code,
          origin,
          name: (v.name as string) ?? existing?.name ?? null,
          barcode: (v.barcode as string) ?? existing?.barcode ?? null,
          unit: (v.unit as string) ?? existing?.unit ?? null,
          price: (v.price as number) ?? existing?.price ?? null,
          vatPercent: (v.vatPercent as number) ?? existing?.vatPercent ?? null,
          inactive: existing?.inactive ?? false,
        });
      }
    } else if (kind === 'PRICES') {
      for (const v of valid) {
        const code = v.code as string;
        const erp = await this.items.findByCode(code);
        const existing = await this.overlay.findByCode(code);
        const origin: 'LOCAL' | 'EDIT' =
          existing?.origin === 'LOCAL' || !erp ? 'LOCAL' : 'EDIT';
        await this.overlay.upsert({
          code,
          origin,
          name: existing?.name ?? null,
          barcode: existing?.barcode ?? null,
          unit: existing?.unit ?? null,
          price: v.price as number,
          vatPercent: existing?.vatPercent ?? null,
          inactive: existing?.inactive ?? false,
        });
      }
    } else {
      const batchId = 'pending';
      // A single batch id ties these rows; the repo generates row ids.
      for (const v of valid) {
        await this.repo.upsertOpeningBalance({
          iCode: v.code as string,
          wCode: (v.wCode as number) ?? 0,
          qty: v.qty as number,
          batchId,
        });
      }
    }
  }

  listBatches(limit: number): Promise<ImportBatchRow[]> {
    return this.repo.listBatches(Math.min(Math.max(limit, 1), 100));
  }

  getBatch(id: string): Promise<ImportBatchRow | null> {
    return this.repo.getBatch(id);
  }
}
