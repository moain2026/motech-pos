import { Injectable } from '@nestjs/common';
import type { BindParameters } from 'oracledb';
import { OracleService } from '../../../infrastructure/oracle/oracle.service';
import {
  CardsRepository,
  CardTypeRow,
  CouponRow,
} from '../domain/ports/cards-repository.port';

/**
 * OracleCardsRepository — reads the real IAS202623 master tables:
 *   - CREDIT_CARD_TYPES : configured payment-card types (POSI007/POSI012)
 *   - IAS_CPN_MST       : coupon document headers
 * STRICTLY read-only (MOTECH_RO connection). Schema-qualified, bind variables.
 * Empty tables surface as an empty array (never an error).
 */
@Injectable()
export class OracleCardsRepository implements CardsRepository {
  constructor(private readonly oracle: OracleService) {}

  private get masterSchema(): string {
    return this.oracle.masterSchema();
  }

  async listCardTypes(): Promise<CardTypeRow[]> {
    type Row = {
      CR_CARD_NO: number;
      CR_CARD_NAME: string | null;
      CR_CARD_E_NAME: string | null;
      COMM_PER: number | null;
      CR_CARD_TYPE: number | null;
      BANK_NO: number | null;
    };
    const rows = await this.oracle.query<Row>(
      `SELECT CR_CARD_NO, CR_CARD_NAME, CR_CARD_E_NAME,
              NVL(COMM_PER, 0) AS COMM_PER, CR_CARD_TYPE, BANK_NO
       FROM ${this.masterSchema}.CREDIT_CARD_TYPES
       ORDER BY CR_CARD_NO`,
    );
    return rows.map((r) => ({
      cardNo: Number(r.CR_CARD_NO),
      cardName: r.CR_CARD_NAME,
      cardEName: r.CR_CARD_E_NAME,
      commissionPct: Number(r.COMM_PER ?? 0),
      cardType: r.CR_CARD_TYPE == null ? null : Number(r.CR_CARD_TYPE),
      bankNo: r.BANK_NO == null ? null : Number(r.BANK_NO),
    }));
  }

  async listCoupons(limit: number): Promise<CouponRow[]> {
    type Row = {
      DOC_NO: number;
      DOC_DATE: string | null;
      CPN_TYP_NO: number | null;
      CPN_CNT: number | null;
      CPN_BOOK_NO: string | null;
      F_CPN_NO: string | null;
      T_CPN_NO: string | null;
      DOC_DSC: string | null;
    };
    const rows = await this.oracle.query<Row>(
      `SELECT * FROM (
         SELECT DOC_NO,
                TO_CHAR(DOC_DATE, 'YYYY-MM-DD') AS DOC_DATE,
                CPN_TYP_NO, CPN_CNT, CPN_BOOK_NO,
                F_CPN_NO, T_CPN_NO, DOC_DSC
         FROM ${this.masterSchema}.IAS_CPN_MST
         ORDER BY DOC_NO DESC
       ) WHERE ROWNUM <= :lim`,
      { lim: limit } as BindParameters,
    );
    return rows.map((r) => ({
      docNo: Number(r.DOC_NO),
      docDate: r.DOC_DATE,
      couponTypeNo: r.CPN_TYP_NO == null ? null : Number(r.CPN_TYP_NO),
      couponCount: Number(r.CPN_CNT ?? 0),
      bookNo: r.CPN_BOOK_NO,
      fromCoupon: r.F_CPN_NO,
      toCoupon: r.T_CPN_NO,
      description: r.DOC_DSC,
    }));
  }
}
