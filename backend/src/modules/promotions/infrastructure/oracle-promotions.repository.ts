import { Injectable, Logger } from '@nestjs/common';
import { OracleService } from '../../../infrastructure/oracle/oracle.service';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import {
  CreateLocalPromotionInput,
  LocalPromotion,
  PromotionLine,
  PromotionMaster,
  PromotionsRepository,
} from '../domain/ports/promotions-repository.port';

interface MstRow {
  QUOT_NO: number;
  QUOT_SER: number;
  QT_PRM_TYPE: number | null;
  QT_PRM_METHOD: number | null;
  F_DATE: Date;
  T_DATE: Date;
  F_TIME: string | null;
  T_TIME: string | null;
  A_DESC: string | null;
  BY_INVC_AMT_FLG: number | null;
  APPRVD_FREEQTY_AS_DSCNT: number | null;
  FLD_DAY1: number | null;
  FLD_DAY2: number | null;
  FLD_DAY3: number | null;
  FLD_DAY4: number | null;
  FLD_DAY5: number | null;
  FLD_DAY6: number | null;
  FLD_DAY7: number | null;
}

interface LocalMstRow {
  QUOT_NO: number;
  DESCRIPTION: string | null;
  PRM_TYPE: number;
  PRM_METHOD: number | null;
  FROM_DATE: string;
  TO_DATE: string;
  FROM_TIME: string | null;
  TO_TIME: string | null;
  DOW_MASK: string | null;
  BY_INVOICE_AMT: number | null;
  FREE_AS_DISC: number | null;
}

interface DtlRow {
  QUOT_NO: number;
  RCRD_NO: number;
  I_CODE: string | null;
  ITM_UNT: string | null;
  F_QTY: number | null;
  T_QTY: number | null;
  F_AMT: number | null;
  T_AMT: number | null;
  DISC_TYPE: number | null;
  DISC_AMT_PER: number | null;
  LEV_PRICE: number | null;
  QT_I_CODE: string | null;
  QT_ITM_UNT: string | null;
  FREE_QTY: number | null;
  COMP_QTY: number | null;
  QT_QTY: number | null;
}

/**
 * OraclePromotionsRepository — reads the real Onyx promotion tables
 * (IAS202623.IAS_QUT_PRM_MST / _DTL, exposed as YSPOS23 synonyms). READ-ONLY:
 * the ERP promotion catalog is sacred; the POS only *reads* and applies it.
 *
 * "Active for POS today" = INACTIVE=0 AND USE_QTN_PRM_IN_POS_SYS_FLG=1 AND
 * APPROVED<>0 AND F_DATE<=onDate<=T_DATE (+ optional day-of-week / time window).
 * Bind variables only, schema-qualified.
 */
@Injectable()
export class OraclePromotionsRepository implements PromotionsRepository {
  private readonly logger = new Logger(OraclePromotionsRepository.name);

  constructor(
    private readonly oracle: OracleService,
    private readonly write: OracleWriteService,
  ) {}

  private get schema(): string {
    return this.oracle.schema();
  }

  async activePromotions(onDate: Date): Promise<PromotionMaster[]> {
    // Day-of-week 1..7 (Onyx FLD_DAY convention: 1=Sunday … 7=Saturday, matching
    // Oracle TO_CHAR(D)). We pass the numeric day and match it against any of
    // the FLD_DAY1..7 columns (a promo lists the days it is valid).
    const dow = this.onyxDayOfWeek(onDate);
    const hhmm = this.hhmm(onDate);

    const masters = await this.oracle.query<MstRow>(
      `SELECT QUOT_NO, QUOT_SER, QT_PRM_TYPE, QT_PRM_METHOD, F_DATE, T_DATE,
              F_TIME, T_TIME, A_DESC, BY_INVC_AMT_FLG, APPRVD_FREEQTY_AS_DSCNT,
              FLD_DAY1, FLD_DAY2, FLD_DAY3, FLD_DAY4, FLD_DAY5, FLD_DAY6, FLD_DAY7
         FROM ${this.schema}.IAS_QUT_PRM_MST
        WHERE NVL(INACTIVE,0) = 0
          AND NVL(USE_QTN_PRM_IN_POS_SYS_FLG,0) = 1
          AND NVL(APPROVED,0) <> 0
          AND TRUNC(:onDate) BETWEEN TRUNC(F_DATE) AND TRUNC(T_DATE)
        ORDER BY QUOT_NO`,
      { onDate },
    );

    if (masters.length === 0) return [];

    const active = masters.filter(
      (m) => this.dayMatches(m, dow) && this.timeMatches(m, hhmm),
    );
    if (active.length === 0) return [];

    const nos = active.map((m) => m.QUOT_NO);
    const lines = await this.detailsFor(nos);
    const byNo = new Map<number, PromotionLine[]>();
    for (const l of lines) {
      const arr = byNo.get(l.quotNo) ?? [];
      arr.push(l);
      byNo.set(l.quotNo, arr);
    }

    const erp = active.map((m) => this.toMaster(m, byNo.get(m.QUOT_NO) ?? []));
    const local = await this.localActive(onDate, dow, hhmm);
    return [...erp, ...local];
  }

  /**
   * LOCAL promotions overlay (MOTECH_POS.PROMO_MST/_DTL, V030). Same active
   * filter (INACTIVE=0, date window) + day/time window applied in JS. The ERP
   * catalog is never touched; these are POS-defined promos merged on top.
   */
  private async localActive(
    onDate: Date,
    dow: number,
    hhmm: string,
  ): Promise<PromotionMaster[]> {
    let mst: LocalMstRow[];
    try {
      mst = await this.write.query<LocalMstRow>(
        `SELECT QUOT_NO, DESCRIPTION, PRM_TYPE, PRM_METHOD,
                TO_CHAR(FROM_DATE,'YYYY-MM-DD') AS FROM_DATE,
                TO_CHAR(TO_DATE,'YYYY-MM-DD') AS TO_DATE,
                FROM_TIME, TO_TIME, DOW_MASK, BY_INVOICE_AMT, FREE_AS_DISC
           FROM ${this.write.schema()}.PROMO_MST
          WHERE INACTIVE = 0
            AND TRUNC(:onDate) BETWEEN TRUNC(FROM_DATE) AND TRUNC(TO_DATE)
          ORDER BY QUOT_NO`,
        { onDate },
      );
    } catch (err) {
      this.logger.warn({ err }, 'PROMO_MST overlay lookup failed; skipping');
      return [];
    }
    if (mst.length === 0) return [];

    const active = mst.filter(
      (m) =>
        this.localDayMatches(m.DOW_MASK, dow) &&
        this.timeMatches(
          { F_TIME: m.FROM_TIME, T_TIME: m.TO_TIME } as MstRow,
          hhmm,
        ),
    );
    if (active.length === 0) return [];

    const binds: Record<string, number> = {};
    const placeholders = active
      .map((m, i) => {
        binds[`n${i}`] = Number(m.QUOT_NO);
        return `:n${i}`;
      })
      .join(',');
    const dtl = await this.write.query<DtlRow>(
      `SELECT QUOT_NO, RCRD_NO, I_CODE, ITM_UNT, F_QTY, T_QTY, F_AMT, T_AMT,
              DISC_TYPE, DISC_AMT_PER, LEV_PRICE, QT_I_CODE, QT_ITM_UNT,
              FREE_QTY, COMP_QTY, QT_QTY
         FROM ${this.write.schema()}.PROMO_DTL
        WHERE QUOT_NO IN (${placeholders})
        ORDER BY QUOT_NO, RCRD_NO`,
      binds,
    );
    const byNo = new Map<number, PromotionLine[]>();
    for (const r of dtl) {
      const l: PromotionLine = {
        quotNo: Number(r.QUOT_NO),
        rcrdNo: Number(r.RCRD_NO),
        iCode: r.I_CODE ?? null,
        itemUnit: r.ITM_UNT ?? null,
        fQty: num(r.F_QTY),
        tQty: num(r.T_QTY),
        fAmt: num(r.F_AMT),
        tAmt: num(r.T_AMT),
        discType: num(r.DISC_TYPE),
        discAmtPer: num(r.DISC_AMT_PER),
        levPrice: num(r.LEV_PRICE),
        qtItemCode: r.QT_I_CODE ?? null,
        qtItemUnit: r.QT_ITM_UNT ?? null,
        freeQty: num(r.FREE_QTY),
        compQty: num(r.COMP_QTY),
        qtQty: num(r.QT_QTY),
      };
      const arr = byNo.get(l.quotNo) ?? [];
      arr.push(l);
      byNo.set(l.quotNo, arr);
    }

    return active.map((m) => ({
      quotNo: Number(m.QUOT_NO),
      quotSer: Number(m.QUOT_NO),
      prmType: Number(m.PRM_TYPE),
      prmMethod: m.PRM_METHOD == null ? null : Number(m.PRM_METHOD),
      fromDate: m.FROM_DATE,
      toDate: m.TO_DATE,
      fromTime: m.FROM_TIME ?? null,
      toTime: m.TO_TIME ?? null,
      desc: m.DESCRIPTION ?? null,
      byInvoiceAmount: Number(m.BY_INVOICE_AMT ?? 0) === 1,
      freeQtyAsDiscount: Number(m.FREE_AS_DISC ?? 0) === 1,
      lines: byNo.get(Number(m.QUOT_NO)) ?? [],
    }));
  }

  private localDayMatches(mask: string | null, dow: number): boolean {
    if (!mask || !mask.trim()) return true;
    const days = mask
      .split(',')
      .map((x) => Number(x.trim()))
      .filter((x) => Number.isFinite(x) && x > 0);
    if (days.length === 0) return true;
    return days.includes(dow);
  }

  async findByQuotNo(quotNo: number): Promise<PromotionMaster | null> {
    const rows = await this.oracle.query<MstRow>(
      `SELECT QUOT_NO, QUOT_SER, QT_PRM_TYPE, QT_PRM_METHOD, F_DATE, T_DATE,
              F_TIME, T_TIME, A_DESC, BY_INVC_AMT_FLG, APPRVD_FREEQTY_AS_DSCNT,
              FLD_DAY1, FLD_DAY2, FLD_DAY3, FLD_DAY4, FLD_DAY5, FLD_DAY6, FLD_DAY7
         FROM ${this.schema}.IAS_QUT_PRM_MST WHERE QUOT_NO = :no`,
      { no: quotNo },
    );
    if (rows.length === 0) return null;
    const lines = await this.detailsFor([quotNo]);
    return this.toMaster(rows[0], lines);
  }

  // ====================== LOCAL overlay CRUD ============================

  async listLocal(): Promise<LocalPromotion[]> {
    const mst = await this.write.query<LocalMstRow & { INACTIVE: number }>(
      `SELECT QUOT_NO, DESCRIPTION, PRM_TYPE, PRM_METHOD,
              TO_CHAR(FROM_DATE,'YYYY-MM-DD') AS FROM_DATE,
              TO_CHAR(TO_DATE,'YYYY-MM-DD') AS TO_DATE,
              FROM_TIME, TO_TIME, DOW_MASK, BY_INVOICE_AMT, FREE_AS_DISC, INACTIVE
         FROM ${this.write.schema()}.PROMO_MST ORDER BY QUOT_NO DESC`,
    );
    if (mst.length === 0) return [];
    const nos = mst.map((m) => Number(m.QUOT_NO));
    const byNo = await this.localDetails(nos);
    return mst.map((m) => this.toLocal(m, byNo.get(Number(m.QUOT_NO)) ?? []));
  }

  async createLocal(input: CreateLocalPromotionInput): Promise<LocalPromotion> {
    const quotNo = await this.nextLocalNo();
    await this.write.withTransaction(async (conn) => {
      await conn.execute(
        `INSERT INTO ${this.write.schema()}.PROMO_MST
           (ID, QUOT_NO, DESCRIPTION, PRM_TYPE, PRM_METHOD, FROM_DATE, TO_DATE,
            FROM_TIME, TO_TIME, DOW_MASK, BY_INVOICE_AMT, FREE_AS_DISC, CREATED_BY)
         VALUES (:id, :qno, :descr, :ptype, :pmethod,
                 TO_DATE(:fdate,'YYYY-MM-DD'), TO_DATE(:tdate,'YYYY-MM-DD'),
                 :ftime, :ttime, :dow, :inv, :fad, :actor)`,
        {
          id: uuidv7(),
          qno: quotNo,
          descr: input.description ?? null,
          ptype: input.prmType,
          pmethod: input.prmMethod ?? 1,
          fdate: input.fromDate,
          tdate: input.toDate,
          ftime: input.fromTime ?? null,
          ttime: input.toTime ?? null,
          dow: input.dowMask ?? null,
          inv: input.byInvoiceAmount ? 1 : 0,
          fad: input.freeQtyAsDiscount ? 1 : 0,
          actor: input.createdBy ?? null,
        },
      );
      let rcrd = 1;
      for (const l of input.lines) {
        await conn.execute(
          `INSERT INTO ${this.write.schema()}.PROMO_DTL
             (ID, QUOT_NO, RCRD_NO, I_CODE, ITM_UNT, F_QTY, T_QTY, F_AMT, T_AMT,
              DISC_TYPE, DISC_AMT_PER, LEV_PRICE, QT_I_CODE, QT_ITM_UNT,
              FREE_QTY, COMP_QTY, QT_QTY)
           VALUES (:id, :qno, :rcrd, :icode, :unit, :fqty, :tqty, :famt, :tamt,
                   :dtype, :dper, :lev, :qtic, :qtunit, :free, :comp, :qtqty)`,
          {
            id: uuidv7(),
            qno: quotNo,
            rcrd: rcrd++,
            icode: l.iCode ?? null,
            unit: l.itemUnit ?? null,
            fqty: l.fQty ?? null,
            tqty: l.tQty ?? null,
            famt: l.fAmt ?? null,
            tamt: l.tAmt ?? null,
            dtype: l.discType ?? null,
            dper: l.discAmtPer ?? null,
            lev: l.levPrice ?? null,
            qtic: l.qtItemCode ?? null,
            qtunit: l.qtItemUnit ?? null,
            free: l.freeQty ?? null,
            comp: l.compQty ?? null,
            qtqty: l.qtQty ?? null,
          },
        );
      }
    });
    const rows = await this.listLocal();
    const created = rows.find((r) => r.quotNo === quotNo);
    if (!created) throw new Error(`Local promo create failed: ${quotNo}`);
    return created;
  }

  async setLocalStatus(
    quotNo: number,
    inactive: boolean,
  ): Promise<LocalPromotion | null> {
    await this.write.execute(
      `UPDATE ${this.write.schema()}.PROMO_MST
       SET INACTIVE = :ia, UPDATED_AT = SYSTIMESTAMP WHERE QUOT_NO = :qno`,
      { ia: inactive ? 1 : 0, qno: quotNo },
    );
    const rows = await this.listLocal();
    return rows.find((r) => r.quotNo === quotNo) ?? null;
  }

  async deleteLocal(quotNo: number): Promise<boolean> {
    const r = await this.write.execute(
      `DELETE FROM ${this.write.schema()}.PROMO_MST WHERE QUOT_NO = :qno`,
      { qno: quotNo },
    );
    return (r.rowsAffected ?? 0) > 0;
  }

  private async nextLocalNo(): Promise<number> {
    const row = await this.write.queryOne<{ N: number }>(
      `SELECT ${this.write.schema()}.SEQ_LOCAL_PROMO_NO.NEXTVAL AS N FROM DUAL`,
    );
    return Number(row!.N);
  }

  private async localDetails(
    quotNos: number[],
  ): Promise<Map<number, PromotionLine[]>> {
    const byNo = new Map<number, PromotionLine[]>();
    if (quotNos.length === 0) return byNo;
    const binds: Record<string, number> = {};
    const placeholders = quotNos
      .map((n, i) => {
        binds[`n${i}`] = n;
        return `:n${i}`;
      })
      .join(',');
    const dtl = await this.write.query<DtlRow>(
      `SELECT QUOT_NO, RCRD_NO, I_CODE, ITM_UNT, F_QTY, T_QTY, F_AMT, T_AMT,
              DISC_TYPE, DISC_AMT_PER, LEV_PRICE, QT_I_CODE, QT_ITM_UNT,
              FREE_QTY, COMP_QTY, QT_QTY
         FROM ${this.write.schema()}.PROMO_DTL
        WHERE QUOT_NO IN (${placeholders})
        ORDER BY QUOT_NO, RCRD_NO`,
      binds,
    );
    for (const r of dtl) {
      const l: PromotionLine = {
        quotNo: Number(r.QUOT_NO),
        rcrdNo: Number(r.RCRD_NO),
        iCode: r.I_CODE ?? null,
        itemUnit: r.ITM_UNT ?? null,
        fQty: num(r.F_QTY),
        tQty: num(r.T_QTY),
        fAmt: num(r.F_AMT),
        tAmt: num(r.T_AMT),
        discType: num(r.DISC_TYPE),
        discAmtPer: num(r.DISC_AMT_PER),
        levPrice: num(r.LEV_PRICE),
        qtItemCode: r.QT_I_CODE ?? null,
        qtItemUnit: r.QT_ITM_UNT ?? null,
        freeQty: num(r.FREE_QTY),
        compQty: num(r.COMP_QTY),
        qtQty: num(r.QT_QTY),
      };
      const arr = byNo.get(l.quotNo) ?? [];
      arr.push(l);
      byNo.set(l.quotNo, arr);
    }
    return byNo;
  }

  private toLocal(
    m: LocalMstRow & { INACTIVE: number },
    lines: PromotionLine[],
  ): LocalPromotion {
    return {
      quotNo: Number(m.QUOT_NO),
      quotSer: Number(m.QUOT_NO),
      prmType: Number(m.PRM_TYPE),
      prmMethod: m.PRM_METHOD == null ? null : Number(m.PRM_METHOD),
      fromDate: m.FROM_DATE,
      toDate: m.TO_DATE,
      fromTime: m.FROM_TIME ?? null,
      toTime: m.TO_TIME ?? null,
      desc: m.DESCRIPTION ?? null,
      byInvoiceAmount: Number(m.BY_INVOICE_AMT ?? 0) === 1,
      freeQtyAsDiscount: Number(m.FREE_AS_DISC ?? 0) === 1,
      lines,
      inactive: Number(m.INACTIVE ?? 0) === 1,
      origin: 'LOCAL',
    };
  }

  private async detailsFor(quotNos: number[]): Promise<PromotionLine[]> {
    if (quotNos.length === 0) return [];
    // Bind each number individually (small set — active promos are few).
    const binds: Record<string, number> = {};
    const placeholders = quotNos
      .map((n, i) => {
        binds[`n${i}`] = n;
        return `:n${i}`;
      })
      .join(',');
    const rows = await this.oracle.query<DtlRow>(
      `SELECT QUOT_NO, RCRD_NO, I_CODE, ITM_UNT, F_QTY, T_QTY, F_AMT, T_AMT,
              DISC_TYPE, DISC_AMT_PER, LEV_PRICE, QT_I_CODE, QT_ITM_UNT,
              FREE_QTY, COMP_QTY, QT_QTY
         FROM ${this.schema}.IAS_QUT_PRM_DTL
        WHERE QUOT_NO IN (${placeholders})
        ORDER BY QUOT_NO, RCRD_NO`,
      binds,
    );
    return rows.map((r) => ({
      quotNo: Number(r.QUOT_NO),
      rcrdNo: Number(r.RCRD_NO),
      iCode: r.I_CODE ?? null,
      itemUnit: r.ITM_UNT ?? null,
      fQty: num(r.F_QTY),
      tQty: num(r.T_QTY),
      fAmt: num(r.F_AMT),
      tAmt: num(r.T_AMT),
      discType: num(r.DISC_TYPE),
      discAmtPer: num(r.DISC_AMT_PER),
      levPrice: num(r.LEV_PRICE),
      qtItemCode: r.QT_I_CODE ?? null,
      qtItemUnit: r.QT_ITM_UNT ?? null,
      freeQty: num(r.FREE_QTY),
      compQty: num(r.COMP_QTY),
      qtQty: num(r.QT_QTY),
    }));
  }

  private toMaster(m: MstRow, lines: PromotionLine[]): PromotionMaster {
    return {
      quotNo: Number(m.QUOT_NO),
      quotSer: Number(m.QUOT_SER),
      prmType: m.QT_PRM_TYPE == null ? 2 : Number(m.QT_PRM_TYPE),
      prmMethod: num(m.QT_PRM_METHOD),
      fromDate: isoDate(m.F_DATE),
      toDate: isoDate(m.T_DATE),
      fromTime: m.F_TIME ?? null,
      toTime: m.T_TIME ?? null,
      desc: m.A_DESC ?? null,
      byInvoiceAmount: Number(m.BY_INVC_AMT_FLG ?? 0) === 1,
      freeQtyAsDiscount: Number(m.APPRVD_FREEQTY_AS_DSCNT ?? 0) === 1,
      lines,
    };
  }

  /** Onyx day-of-week: Oracle TO_CHAR(date,'D') semantics (1..7). */
  private onyxDayOfWeek(d: Date): number {
    // getDay(): 0=Sunday..6=Saturday → Onyx 1=Sunday..7=Saturday.
    return d.getDay() + 1;
  }

  private hhmm(d: Date): string {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  private dayMatches(m: MstRow, dow: number): boolean {
    const days = [
      m.FLD_DAY1,
      m.FLD_DAY2,
      m.FLD_DAY3,
      m.FLD_DAY4,
      m.FLD_DAY5,
      m.FLD_DAY6,
      m.FLD_DAY7,
    ]
      .map((x) => (x == null ? null : Number(x)))
      .filter((x): x is number => x != null && x > 0);
    // No day restriction configured → valid every day.
    if (days.length === 0) return true;
    return days.includes(dow);
  }

  private timeMatches(m: MstRow, hhmm: string): boolean {
    const f = (m.F_TIME ?? '').trim();
    const t = (m.T_TIME ?? '').trim();
    if (!f || !t) return true; // all-day
    // Compare lexicographically (HH:MI, zero-padded). Handles same-day windows.
    if (f <= t) return hhmm >= f && hhmm <= t;
    // Overnight window (e.g. 22:00..02:00).
    return hhmm >= f || hhmm <= t;
  }
}

function num(v: number | null | undefined): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function isoDate(d: Date | string): string {
  if (typeof d === 'string') return d.slice(0, 10);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
