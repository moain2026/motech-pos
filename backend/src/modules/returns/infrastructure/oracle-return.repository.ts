import { Injectable } from '@nestjs/common';
import type { BindParameters } from 'oracledb';
import { OracleService } from '../../../infrastructure/oracle/oracle.service';
import { Return } from '../domain/entities/return.entity';
import {
  ReturnLine,
  ReturnVatCalcType,
} from '../domain/entities/return-line.entity';
import {
  ReturnListFilter,
  ReturnListItem,
  ReturnRepository,
  StoredReturnTotals,
} from '../domain/ports/return-repository.port';

interface RtMstRow {
  RT_BILL_NO: number;
  BILL_NO: number | null;
  RT_BILL_DATE: Date | null;
  RT_BILL_TIME: string | null;
  RT_BILL_TYPE: number;
  RETURN_TYPE: number | null;
  RT_BILL_AMT: number | null;
  VAT_AMT: number | null;
  DISC_AMT: number | null;
  PAYED_AMT: number | null;
  C_NAME: string | null;
  C_CODE: string | null;
  MACHINE_NO: number | null;
  CLC_VAT_AMT_TYP: number | null;
}

interface RtDtlRow {
  I_CODE: string;
  I_QTY: number;
  I_PRICE: number | null;
  DIS_AMT_DTL: number | null;
  DIS_AMT_MST: number | null;
  VAT_PER: number | null;
  RT_RPLC_AMT: number | null;
  ITM_UNT: string | null;
}

/**
 * OracleReturnRepository — reads the real YSPOS23.IAS_POS_RT_BILL_MST / _DTL
 * (return / مردود مبيعات) tables. Schema-qualified, bind variables only.
 * READ-ONLY (MOTECH_RO): no INSERT/UPDATE/DELETE.
 */
@Injectable()
export class OracleReturnRepository implements ReturnRepository {
  constructor(private readonly oracle: OracleService) {}

  private get schema(): string {
    return this.oracle.schema();
  }

  private rebuild(
    mst: RtMstRow,
    dtls: RtDtlRow[],
  ): { ret: Return; stored: StoredReturnTotals } {
    const lines = dtls.map(
      (d) =>
        new ReturnLine({
          iCode: d.I_CODE,
          qty: Number(d.I_QTY),
          price: Number(d.I_PRICE ?? 0),
          discDtl: Number(d.DIS_AMT_DTL ?? 0),
          discMst: Number(d.DIS_AMT_MST ?? 0),
          vatPercent: Number(d.VAT_PER ?? 0),
          replaceAmount: Number(d.RT_RPLC_AMT ?? 0),
          itmUnit: d.ITM_UNT ?? undefined,
        }),
    );
    const ret = new Return({
      rtBillNo: String(mst.RT_BILL_NO),
      originalBillNo: mst.BILL_NO == null ? '' : String(mst.BILL_NO),
      rtBillDate: mst.RT_BILL_DATE ?? undefined,
      returnType: mst.RETURN_TYPE == null ? undefined : Number(mst.RETURN_TYPE),
      cCode: mst.C_CODE ?? undefined,
      cName: mst.C_NAME ?? undefined,
      machineNo: mst.MACHINE_NO ?? undefined,
      vatCalcType:
        Number(mst.CLC_VAT_AMT_TYP) === 1
          ? ReturnVatCalcType.ON_PRICE
          : ReturnVatCalcType.AFTER_DISCOUNT,
      lines,
    });
    const stored: StoredReturnTotals = {
      rtBillNo: String(mst.RT_BILL_NO),
      rtBillAmt: Number(mst.RT_BILL_AMT ?? 0),
      vatAmt: Number(mst.VAT_AMT ?? 0),
      discAmt: Number(mst.DISC_AMT ?? 0),
      payedAmt: mst.PAYED_AMT == null ? null : Number(mst.PAYED_AMT),
    };
    return { ret, stored };
  }

  private async loadLines(rtBillNo: string | number): Promise<RtDtlRow[]> {
    return this.oracle.query<RtDtlRow>(
      `SELECT I_CODE, I_QTY, I_PRICE, DIS_AMT_DTL, DIS_AMT_MST, VAT_PER,
              RT_RPLC_AMT, ITM_UNT
       FROM ${this.schema}.IAS_POS_RT_BILL_DTL
       WHERE RT_BILL_NO = :rtBillNo
       ORDER BY RCRD_NO NULLS LAST, I_CODE`,
      { rtBillNo },
    );
  }

  async list(
    filter: ReturnListFilter,
  ): Promise<{ items: ReturnListItem[]; nextCursor?: string }> {
    const binds: Record<string, unknown> = { lim: filter.limit + 1 };
    const where: string[] = ['NVL(m.HUNG,0) = 0'];
    if (filter.from) {
      where.push("m.RT_BILL_DATE >= TO_DATE(:fromD, 'YYYY-MM-DD')");
      binds.fromD = filter.from;
    }
    if (filter.to) {
      where.push("m.RT_BILL_DATE < TO_DATE(:toD, 'YYYY-MM-DD') + 1");
      binds.toD = filter.to;
    }
    if (filter.machineNo != null) {
      where.push('m.MACHINE_NO = :mchn');
      binds.mchn = filter.machineNo;
    }
    if (filter.originalBillNo != null) {
      where.push('m.BILL_NO = :obn');
      binds.obn = filter.originalBillNo;
    }
    if (filter.cursor) {
      where.push('m.RT_BILL_NO < :cur');
      binds.cur = filter.cursor;
    }
    const sql = `
      SELECT * FROM (
        SELECT m.RT_BILL_NO, m.BILL_NO, m.RT_BILL_DATE, m.RETURN_TYPE,
               m.RT_BILL_AMT, m.VAT_AMT, m.DISC_AMT, m.C_NAME, m.MACHINE_NO,
               (SELECT COUNT(*) FROM ${this.schema}.IAS_POS_RT_BILL_DTL d
                 WHERE d.RT_BILL_NO = m.RT_BILL_NO) AS LINE_COUNT
        FROM ${this.schema}.IAS_POS_RT_BILL_MST m
        WHERE ${where.join(' AND ')}
        ORDER BY m.RT_BILL_NO DESC
      ) WHERE ROWNUM <= :lim`;
    type ListRow = RtMstRow & { LINE_COUNT: number };
    const rows = await this.oracle.query<ListRow>(sql, binds as BindParameters);

    let nextCursor: string | undefined;
    const sliced = rows.slice(0, filter.limit);
    if (rows.length > filter.limit) {
      nextCursor = String(sliced[sliced.length - 1].RT_BILL_NO);
    }
    const items: ReturnListItem[] = sliced.map((r) => ({
      id: String(r.RT_BILL_NO),
      source: 'YSPOS23' as const,
      rtBillNo: String(r.RT_BILL_NO),
      originalBillNo: r.BILL_NO == null ? null : String(r.BILL_NO),
      rtBillDate: r.RT_BILL_DATE ? r.RT_BILL_DATE.toISOString() : null,
      returnType: r.RETURN_TYPE == null ? null : Number(r.RETURN_TYPE),
      rtBillAmt: Number(r.RT_BILL_AMT ?? 0),
      vatAmt: Number(r.VAT_AMT ?? 0),
      discAmt: Number(r.DISC_AMT ?? 0),
      cName: r.C_NAME,
      machineNo: r.MACHINE_NO == null ? null : Number(r.MACHINE_NO),
      lineCount: Number(r.LINE_COUNT),
    }));
    return { items, nextCursor };
  }

  async findByNo(
    rtBillNo: string,
  ): Promise<{ ret: Return; stored: StoredReturnTotals } | null> {
    const mst = await this.oracle.queryOne<RtMstRow>(
      `SELECT RT_BILL_NO, BILL_NO, RT_BILL_DATE, RT_BILL_TIME, RT_BILL_TYPE,
              RETURN_TYPE, RT_BILL_AMT, VAT_AMT, DISC_AMT, PAYED_AMT,
              C_NAME, C_CODE, MACHINE_NO, CLC_VAT_AMT_TYP
       FROM ${this.schema}.IAS_POS_RT_BILL_MST WHERE RT_BILL_NO = :rtBillNo`,
      { rtBillNo },
    );
    if (!mst) return null;
    const dtls = await this.loadLines(mst.RT_BILL_NO);
    return this.rebuild(mst, dtls);
  }
}
