import { Injectable } from '@nestjs/common';
import { OracleService } from '../../../infrastructure/oracle/oracle.service';
import {
  ItemReference,
  ItemReferenceReader,
} from '../domain/ports/item-reference.port';

/**
 * OracleItemReferenceRepository — reads item price + VAT% from YSPOS23 via the
 * READ-ONLY MOTECH_RO connection (OracleService). Mirrors the catalog repo's
 * "real data only" approach: the canonical item master lives in the absent
 * IAS202623 schema, so price/unit/barcode are reconstructed from the most
 * recent real sale line (IAS_POS_BILL_DTL), and VAT% from VAT_PER there.
 *
 * This is the new system READING references from the live DB — never writing.
 */
@Injectable()
export class OracleItemReferenceRepository implements ItemReferenceReader {
  constructor(private readonly oracle: OracleService) {}

  private get schema(): string {
    return this.oracle.schema();
  }

  async findByCode(itemCode: string): Promise<ItemReference | null> {
    const row = await this.oracle.queryOne<{
      I_CODE: string;
      LAST_PRICE: number | null;
      LAST_VAT: number | null;
      LAST_UNIT: string | null;
    }>(
      `SELECT I_CODE, LAST_PRICE, LAST_VAT, LAST_UNIT FROM (
         SELECT d.I_CODE, d.I_PRICE AS LAST_PRICE, d.VAT_PER AS LAST_VAT,
                d.ITM_UNT AS LAST_UNIT,
                ROW_NUMBER() OVER (
                  PARTITION BY d.I_CODE ORDER BY d.BILL_NO DESC, d.BILL_SRL DESC
                ) AS RN
         FROM ${this.schema}.IAS_POS_BILL_DTL d
         WHERE d.I_CODE = :code
       ) WHERE RN = 1`,
      { code: itemCode },
    );

    if (!row) {
      // Fall back to MV_ITEM_AVL_QTY existence (item exists but never sold) —
      // price unknown, VAT 0. Returns null only if the code is entirely unknown.
      const exists = await this.oracle.queryOne<{ N: number }>(
        `SELECT COUNT(*) AS N FROM ${this.schema}.MV_ITEM_AVL_QTY WHERE I_CODE = :code`,
        { code: itemCode },
      );
      if (!exists || Number(exists.N) === 0) return null;
      return {
        itemCode,
        unitPrice: null,
        vatPercent: 0,
        unit: null,
        name: null,
      };
    }

    return {
      itemCode: row.I_CODE,
      unitPrice: row.LAST_PRICE == null ? null : Number(row.LAST_PRICE),
      vatPercent: row.LAST_VAT == null ? 0 : Number(row.LAST_VAT),
      unit: row.LAST_UNIT,
      name: null,
    };
  }
}
