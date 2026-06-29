import { Injectable } from '@nestjs/common';
import type { BindParameters } from 'oracledb';
import { OracleService } from '../../../infrastructure/oracle/oracle.service';
import { Bill } from '../domain/entities/bill.entity';
import { BillLine, VatCalcType } from '../domain/entities/bill-line.entity';
import {
  BillListFilter,
  BillListItem,
  BillRepository,
  DailySummaryRow,
  StoredBillTotals,
} from '../domain/ports/bill-repository.port';

interface MstRow {
  BILL_NO: number;
  BILL_DATE: Date | null;
  BILL_TIME: string | null;
  BILL_TYPE: number;
  BILL_AMT: number;
  VAT_AMT: number;
  DISC_AMT: number;
  DISC_AMT_MST: number | null;
  DISC_AMT_DTL: number | null;
  PAYED_AMT: number | null;
  C_NAME: string | null;
  C_CODE: string | null;
  MACHINE_NO: number | null;
  CLC_VAT_AMT_TYP: number | null;
  CLC_TAX_FREE_QTY_FLG: number | null;
}

interface DtlRow {
  I_CODE: string;
  I_QTY: number;
  I_PRICE: number;
  DIS_AMT_DTL: number | null;
  DIS_AMT_MST: number | null;
  VAT_PER: number | null;
  FREE_QTY: number | null;
  ITM_UNT: string | null;
}

/**
 * OracleBillRepository — reads the real YSPOS23.IAS_POS_BILL_MST / _DTL tables.
 * All SQL is schema-qualified and uses bind variables (no concatenation).
 * READ-ONLY: no INSERT/UPDATE/DELETE in this phase.
 */
@Injectable()
export class OracleBillRepository implements BillRepository {
  constructor(private readonly oracle: OracleService) {}

  private get schema(): string {
    return this.oracle.schema();
  }

  private rebuild(mst: MstRow, dtls: DtlRow[]): { bill: Bill; stored: StoredBillTotals } {
    const lines = dtls.map(
      (d) =>
        new BillLine({
          iCode: d.I_CODE,
          qty: Number(d.I_QTY),
          price: Number(d.I_PRICE ?? 0),
          discDtl: Number(d.DIS_AMT_DTL ?? 0),
          discMst: Number(d.DIS_AMT_MST ?? 0),
          vatPercent: Number(d.VAT_PER ?? 0),
          freeQty: Number(d.FREE_QTY ?? 0),
          itmUnit: d.ITM_UNT ?? undefined,
        }),
    );
    const bill = new Bill({
      billNo: String(mst.BILL_NO),
      billDate: mst.BILL_DATE ?? undefined,
      billType: Number(mst.BILL_TYPE),
      cCode: mst.C_CODE ?? undefined,
      cName: mst.C_NAME ?? undefined,
      machineNo: mst.MACHINE_NO ?? undefined,
      vatCalcType:
        Number(mst.CLC_VAT_AMT_TYP) === 1
          ? VatCalcType.ON_PRICE
          : VatCalcType.AFTER_DISCOUNT,
      taxFreeQtyFlag: Number(mst.CLC_TAX_FREE_QTY_FLG ?? 0),
      lines,
    });
    const stored: StoredBillTotals = {
      billNo: String(mst.BILL_NO),
      billAmt: Number(mst.BILL_AMT),
      vatAmt: Number(mst.VAT_AMT ?? 0),
      discAmt: Number(mst.DISC_AMT ?? 0),
      payedAmt: mst.PAYED_AMT == null ? null : Number(mst.PAYED_AMT),
    };
    return { bill, stored };
  }

  private async loadLines(billNo: string | number): Promise<DtlRow[]> {
    return this.oracle.query<DtlRow>(
      `SELECT I_CODE, I_QTY, I_PRICE, DIS_AMT_DTL, DIS_AMT_MST, VAT_PER, FREE_QTY, ITM_UNT
       FROM ${this.schema}.IAS_POS_BILL_DTL
       WHERE BILL_NO = :billNo
       ORDER BY I_CODE`,
      { billNo },
    );
  }

  async list(
    filter: BillListFilter,
  ): Promise<{ items: BillListItem[]; nextCursor?: string }> {
    const binds: Record<string, unknown> = { lim: filter.limit + 1 };
    const where: string[] = ['m.HUNG = 0'];
    if (filter.from) {
      where.push('m.BILL_DATE >= TO_DATE(:fromD, \'YYYY-MM-DD\')');
      binds.fromD = filter.from;
    }
    if (filter.to) {
      where.push('m.BILL_DATE < TO_DATE(:toD, \'YYYY-MM-DD\') + 1');
      binds.toD = filter.to;
    }
    if (filter.machineNo != null) {
      where.push('m.MACHINE_NO = :mchn');
      binds.mchn = filter.machineNo;
    }
    if (filter.cursor) {
      where.push('m.BILL_NO < :cur');
      binds.cur = filter.cursor;
    }
    const sql = `
      SELECT * FROM (
        SELECT m.BILL_NO, m.BILL_DATE, m.BILL_TIME, m.BILL_TYPE, m.BILL_AMT,
               m.VAT_AMT, m.DISC_AMT, m.C_NAME, m.MACHINE_NO,
               (SELECT COUNT(*) FROM ${this.schema}.IAS_POS_BILL_DTL d
                 WHERE d.BILL_NO = m.BILL_NO) AS LINE_COUNT
        FROM ${this.schema}.IAS_POS_BILL_MST m
        WHERE ${where.join(' AND ')}
        ORDER BY m.BILL_NO DESC
      ) WHERE ROWNUM <= :lim`;
    type ListRow = MstRow & { LINE_COUNT: number };
    const rows = await this.oracle.query<ListRow>(sql, binds as BindParameters);

    let nextCursor: string | undefined;
    const sliced = rows.slice(0, filter.limit);
    if (rows.length > filter.limit) {
      nextCursor = String(sliced[sliced.length - 1].BILL_NO);
    }
    const items: BillListItem[] = sliced.map((r: ListRow) => ({
      billNo: String(r.BILL_NO),
      billDate: r.BILL_DATE ? r.BILL_DATE.toISOString() : null,
      billTime: r.BILL_TIME,
      billType: Number(r.BILL_TYPE),
      billAmt: Number(r.BILL_AMT),
      vatAmt: Number(r.VAT_AMT ?? 0),
      discAmt: Number(r.DISC_AMT ?? 0),
      cName: r.C_NAME,
      machineNo: r.MACHINE_NO == null ? null : Number(r.MACHINE_NO),
      lineCount: Number(r.LINE_COUNT),
    }));
    return { items, nextCursor };
  }

  async findByNo(
    billNo: string,
  ): Promise<{ bill: Bill; stored: StoredBillTotals } | null> {
    const mst = await this.oracle.queryOne<MstRow>(
      `SELECT BILL_NO, BILL_DATE, BILL_TIME, BILL_TYPE, BILL_AMT, VAT_AMT, DISC_AMT,
              DISC_AMT_MST, DISC_AMT_DTL, PAYED_AMT, C_NAME, C_CODE, MACHINE_NO,
              CLC_VAT_AMT_TYP, CLC_TAX_FREE_QTY_FLG
       FROM ${this.schema}.IAS_POS_BILL_MST WHERE BILL_NO = :billNo`,
      { billNo },
    );
    if (!mst) return null;
    const dtls = await this.loadLines(mst.BILL_NO);
    return this.rebuild(mst, dtls);
  }

  async dailySummary(from?: string, to?: string): Promise<DailySummaryRow[]> {
    const binds: Record<string, unknown> = {};
    const where: string[] = ['HUNG = 0'];
    if (from) {
      where.push('BILL_DATE >= TO_DATE(:fromD, \'YYYY-MM-DD\')');
      binds.fromD = from;
    }
    if (to) {
      where.push('BILL_DATE < TO_DATE(:toD, \'YYYY-MM-DD\') + 1');
      binds.toD = to;
    }
    type SumRow = {
      DAY: string;
      BILL_COUNT: number;
      TOTAL_AMT: number;
      TOTAL_VAT: number;
      TOTAL_DISC: number;
    };
    const rows = await this.oracle.query<SumRow>(
      `SELECT TO_CHAR(BILL_DATE, 'YYYY-MM-DD') AS DAY,
              COUNT(*) AS BILL_COUNT,
              SUM(BILL_AMT) AS TOTAL_AMT,
              SUM(NVL(VAT_AMT,0)) AS TOTAL_VAT,
              SUM(NVL(DISC_AMT,0)) AS TOTAL_DISC
       FROM ${this.schema}.IAS_POS_BILL_MST
       WHERE ${where.join(' AND ')}
       GROUP BY TO_CHAR(BILL_DATE, 'YYYY-MM-DD')
       ORDER BY DAY DESC`,
      binds as BindParameters,
    );
    return rows.map((r: SumRow) => ({
      day: r.DAY,
      billCount: Number(r.BILL_COUNT),
      totalAmt: Number(r.TOTAL_AMT ?? 0),
      totalVat: Number(r.TOTAL_VAT ?? 0),
      totalDisc: Number(r.TOTAL_DISC ?? 0),
    }));
  }

  async sampleForGolden(
    limit: number,
  ): Promise<Array<{ bill: Bill; stored: StoredBillTotals }>> {
    // Pick bills that actually have detail lines, newest first.
    const heads = await this.oracle.query<MstRow>(
      `SELECT * FROM (
         SELECT m.BILL_NO, m.BILL_DATE, m.BILL_TIME, m.BILL_TYPE, m.BILL_AMT, m.VAT_AMT,
                m.DISC_AMT, m.DISC_AMT_MST, m.DISC_AMT_DTL, m.PAYED_AMT, m.C_NAME, m.C_CODE,
                m.MACHINE_NO, m.CLC_VAT_AMT_TYP, m.CLC_TAX_FREE_QTY_FLG
         FROM ${this.schema}.IAS_POS_BILL_MST m
         WHERE m.HUNG = 0
           AND EXISTS (SELECT 1 FROM ${this.schema}.IAS_POS_BILL_DTL d WHERE d.BILL_NO = m.BILL_NO)
         ORDER BY m.BILL_NO DESC
       ) WHERE ROWNUM <= :lim`,
      { lim: limit },
    );
    const out: Array<{ bill: Bill; stored: StoredBillTotals }> = [];
    for (const mst of heads) {
      const dtls = await this.loadLines(mst.BILL_NO);
      out.push(this.rebuild(mst, dtls));
    }
    return out;
  }
}
