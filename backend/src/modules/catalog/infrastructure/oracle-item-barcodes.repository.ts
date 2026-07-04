import { Injectable } from '@nestjs/common';
import type { BindParameters } from 'oracledb';
import { OracleService } from '../../../infrastructure/oracle/oracle.service';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import {
  AddItemBarcodeInput,
  ItemBarcodeRow,
  ItemBarcodesRepository,
} from '../domain/ports/item-barcodes.port';

interface ErpRow {
  BARCODE: string;
  I_CODE: string | null;
  ITM_UNT: string | null;
  P_SIZE: number | null;
  MAIN_BARCODE: number | null;
  NO_SALE: number | null;
}

interface OvRow {
  BARCODE: string;
  I_CODE: string;
  ITM_UNT: string | null;
  P_SIZE: number | null;
  IS_MAIN: number;
  NO_SALE: number;
  INACTIVE: number;
}

/**
 * OracleItemBarcodesRepository — multi-barcode reads/writes:
 *   READ  → IAS202623.IAS_ITM_UNT_BARCODE (live ERP, read-only, 2,614 rows)
 *   WRITE → MOTECH_POS.ITEM_BARCODES_OVERLAY only (V016)
 */
@Injectable()
export class OracleItemBarcodesRepository implements ItemBarcodesRepository {
  constructor(
    private readonly readDb: OracleService,
    private readonly writeDb: OracleWriteService,
  ) {}

  private get masterSchema(): string {
    return this.readDb.masterSchema();
  }

  private get appSchema(): string {
    return this.writeDb.schema();
  }

  async listByItem(itemCode: string): Promise<ItemBarcodeRow[]> {
    const [erp, ov] = await Promise.all([
      this.readDb.query<ErpRow>(
        `SELECT BARCODE, I_CODE, ITM_UNT, P_SIZE,
                NVL(MAIN_BARCODE, 0) AS MAIN_BARCODE, NVL(NO_SALE, 0) AS NO_SALE
         FROM ${this.masterSchema}.IAS_ITM_UNT_BARCODE
         WHERE I_CODE = :c
         ORDER BY MAIN_BARCODE DESC, BARCODE`,
        { c: itemCode },
      ),
      this.writeDb.query<OvRow>(
        `SELECT BARCODE, I_CODE, ITM_UNT, P_SIZE, IS_MAIN, NO_SALE, INACTIVE
         FROM ${this.appSchema}.ITEM_BARCODES_OVERLAY
         WHERE I_CODE = :c
         ORDER BY IS_MAIN DESC, BARCODE`,
        { c: itemCode },
      ),
    ]);
    const seen = new Set<string>();
    const out: ItemBarcodeRow[] = [];
    for (const r of erp) {
      seen.add(r.BARCODE);
      out.push(this.mapErp(r));
    }
    for (const r of ov) {
      if (!seen.has(r.BARCODE)) out.push(this.mapOv(r));
    }
    return out;
  }

  async findByBarcode(barcode: string): Promise<ItemBarcodeRow | null> {
    const erp = await this.readDb.queryOne<ErpRow>(
      `SELECT BARCODE, I_CODE, ITM_UNT, P_SIZE,
              NVL(MAIN_BARCODE, 0) AS MAIN_BARCODE, NVL(NO_SALE, 0) AS NO_SALE
       FROM ${this.masterSchema}.IAS_ITM_UNT_BARCODE
       WHERE BARCODE = :bc`,
      { bc: barcode },
    );
    if (erp) return this.mapErp(erp);
    const ov = await this.writeDb.queryOne<OvRow>(
      `SELECT BARCODE, I_CODE, ITM_UNT, P_SIZE, IS_MAIN, NO_SALE, INACTIVE
       FROM ${this.appSchema}.ITEM_BARCODES_OVERLAY
       WHERE BARCODE = :bc AND INACTIVE = 0`,
      { bc: barcode },
    );
    return ov ? this.mapOv(ov) : null;
  }

  async add(input: AddItemBarcodeInput): Promise<ItemBarcodeRow> {
    await this.writeDb.execute(
      `INSERT INTO ${this.appSchema}.ITEM_BARCODES_OVERLAY
         (ID, I_CODE, BARCODE, ITM_UNT, P_SIZE, IS_MAIN, NO_SALE, INACTIVE)
       VALUES
         (:id, :iCode, :barcode, :unit, :pSize, :isMain, :noSale, :inactive)`,
      {
        id: uuidv7(),
        iCode: input.itemCode,
        barcode: input.barcode,
        unit: input.unit ?? null,
        pSize: input.packSize ?? null,
        isMain: input.isMain ? 1 : 0,
        noSale: input.noSale ? 1 : 0,
        inactive: input.inactive ? 1 : 0,
      } as BindParameters,
    );
    const row = await this.writeDb.queryOne<OvRow>(
      `SELECT BARCODE, I_CODE, ITM_UNT, P_SIZE, IS_MAIN, NO_SALE, INACTIVE
       FROM ${this.appSchema}.ITEM_BARCODES_OVERLAY
       WHERE BARCODE = :bc`,
      { bc: input.barcode },
    );
    if (!row) throw new Error(`Barcode insert failed: ${input.barcode}`);
    return this.mapOv(row);
  }

  async deactivate(barcode: string): Promise<boolean> {
    const r = await this.writeDb.execute(
      `UPDATE ${this.appSchema}.ITEM_BARCODES_OVERLAY
       SET INACTIVE = 1, UPDATED_AT = SYSTIMESTAMP
       WHERE BARCODE = :bc`,
      { bc: barcode },
    );
    return (r.rowsAffected ?? 0) > 0;
  }

  private mapErp(r: ErpRow): ItemBarcodeRow {
    return {
      barcode: r.BARCODE,
      itemCode: r.I_CODE ?? '',
      unit: r.ITM_UNT ?? null,
      packSize: r.P_SIZE == null ? null : Number(r.P_SIZE),
      isMain: Number(r.MAIN_BARCODE ?? 0) === 1,
      noSale: Number(r.NO_SALE ?? 0) === 1,
      inactive: false,
      origin: 'ERP',
    };
  }

  private mapOv(r: OvRow): ItemBarcodeRow {
    return {
      barcode: r.BARCODE,
      itemCode: r.I_CODE,
      unit: r.ITM_UNT ?? null,
      packSize: r.P_SIZE == null ? null : Number(r.P_SIZE),
      isMain: Number(r.IS_MAIN ?? 0) === 1,
      noSale: Number(r.NO_SALE ?? 0) === 1,
      inactive: Number(r.INACTIVE ?? 0) === 1,
      origin: 'LOCAL',
    };
  }
}
