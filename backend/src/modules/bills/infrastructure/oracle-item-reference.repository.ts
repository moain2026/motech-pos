import { Injectable, Logger } from '@nestjs/common';
import { OracleService } from '../../../infrastructure/oracle/oracle.service';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import {
  ItemReference,
  ItemReferenceReader,
} from '../domain/ports/item-reference.port';

/**
 * OracleItemReferenceRepository — resolves the CANONICAL server-side price +
 * VAT% for a sale line. This is the price authority for the write side: since
 * the free-price security fix, the client can no longer dictate prices, so
 * this resolution order matters:
 *
 *   1. MOTECH_POS.ITEMS_OVERLAY.PRICE — explicit local override/create set by
 *      admin/supervisor via the items screen (also the only source for LOCAL
 *      items that don't exist in the ERP master at all).
 *   2. IAS202623.IAS_ITEM_PRICE (LEV_NO = 1, base unit) — the live retail
 *      price list (GET_ITEM_PRICE analogue). Authoritative ERP price.
 *   3. Last real sale line in YSPOS23.IAS_POS_BILL_DTL — fallback for items
 *      that have no price-list row (legacy behaviour). NOTE: our own posted
 *      bills land in YSPOS23 too (Onyx-twin), so this source alone was
 *      poisonable by a single fake-price sale — hence sources 1 and 2 win.
 *
 * VAT%: overlay VAT_PERCENT, else last-sale VAT_PER, else 0.
 * Reads are schema-qualified; YSPOS23/IAS202623 access is read-only.
 */
@Injectable()
export class OracleItemReferenceRepository implements ItemReferenceReader {
  private readonly logger = new Logger(OracleItemReferenceRepository.name);

  constructor(
    private readonly oracle: OracleService,
    private readonly write: OracleWriteService,
  ) {}

  private get schema(): string {
    return this.oracle.schema();
  }

  private get masterSchema(): string {
    return this.oracle.masterSchema();
  }

  async findByCode(itemCode: string): Promise<ItemReference | null> {
    // (1) Local overlay (authoritative local price / LOCAL items).
    const overlay = await this.findOverlay(itemCode);
    if (overlay && overlay.price != null) {
      return {
        itemCode,
        unitPrice: overlay.price,
        vatPercent: overlay.vatPercent ?? (await this.lastSaleVat(itemCode)),
        unit: overlay.unit,
        name: overlay.name,
      };
    }

    // (2) Live retail price list (LEV_NO 1, base unit).
    const list = await this.oracle.queryOne<{
      I_PRICE: number;
      ITM_UNT: string | null;
    }>(
      `SELECT I_PRICE, ITM_UNT FROM (
         SELECT pr.I_PRICE, pr.ITM_UNT,
                ROW_NUMBER() OVER (ORDER BY pr.P_SIZE ASC, pr.ITM_UNT) AS RN
         FROM ${this.masterSchema}.IAS_ITEM_PRICE pr
         WHERE pr.I_CODE = :code AND pr.LEV_NO = 1
       ) WHERE RN = 1`,
      { code: itemCode },
    );

    // (3) Most recent real sale line (price fallback + VAT source).
    const last = await this.oracle.queryOne<{
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

    if (list) {
      return {
        itemCode,
        unitPrice: Number(list.I_PRICE),
        vatPercent:
          overlay?.vatPercent ??
          (last?.LAST_VAT == null ? 0 : Number(last.LAST_VAT)),
        unit: list.ITM_UNT ?? last?.LAST_UNIT ?? null,
        name: overlay?.name ?? null,
      };
    }

    if (last) {
      return {
        itemCode: last.I_CODE,
        unitPrice: last.LAST_PRICE == null ? null : Number(last.LAST_PRICE),
        vatPercent:
          overlay?.vatPercent ??
          (last.LAST_VAT == null ? 0 : Number(last.LAST_VAT)),
        unit: last.LAST_UNIT,
        name: overlay?.name ?? null,
      };
    }

    if (overlay) {
      // Overlay row exists but has no price set.
      return {
        itemCode,
        unitPrice: null,
        vatPercent: overlay.vatPercent ?? 0,
        unit: overlay.unit,
        name: overlay.name,
      };
    }

    // Item exists in the availability MV but was never sold/priced → price
    // unknown. Entirely unknown code → null.
    const exists = await this.oracle.queryOne<{ N: number }>(
      `SELECT COUNT(*) AS N FROM ${this.schema}.MV_ITEM_AVL_QTY WHERE I_CODE = :code`,
      { code: itemCode },
    );
    if (!exists || Number(exists.N) === 0) return null;
    return { itemCode, unitPrice: null, vatPercent: 0, unit: null, name: null };
  }

  private async findOverlay(itemCode: string): Promise<{
    price: number | null;
    vatPercent: number | null;
    unit: string | null;
    name: string | null;
  } | null> {
    try {
      const row = await this.write.queryOne<{
        PRICE: number | null;
        VAT_PERCENT: number | null;
        UNIT: string | null;
        NAME: string | null;
        INACTIVE: number;
      }>(
        `SELECT PRICE, VAT_PERCENT, UNIT, NAME, INACTIVE
         FROM ${this.write.schema()}.ITEMS_OVERLAY WHERE CODE = :code`,
        { code: itemCode },
      );
      if (!row || Number(row.INACTIVE) === 1) return null;
      return {
        price: row.PRICE == null ? null : Number(row.PRICE),
        vatPercent: row.VAT_PERCENT == null ? null : Number(row.VAT_PERCENT),
        unit: row.UNIT,
        name: row.NAME,
      };
    } catch (err) {
      this.logger.warn({ err }, 'ITEMS_OVERLAY lookup failed; skipping overlay');
      return null;
    }
  }

  private async lastSaleVat(itemCode: string): Promise<number> {
    const row = await this.oracle.queryOne<{ LAST_VAT: number | null }>(
      `SELECT LAST_VAT FROM (
         SELECT d.VAT_PER AS LAST_VAT,
                ROW_NUMBER() OVER (ORDER BY d.BILL_NO DESC, d.BILL_SRL DESC) AS RN
         FROM ${this.schema}.IAS_POS_BILL_DTL d
         WHERE d.I_CODE = :code
       ) WHERE RN = 1`,
      { code: itemCode },
    );
    return row?.LAST_VAT == null ? 0 : Number(row.LAST_VAT);
  }
}
