import { Injectable } from '@nestjs/common';
import { OracleService } from '../../../infrastructure/oracle/oracle.service';
import {
  OriginalBill,
  OriginalBillLine,
  OriginalBillReader,
} from '../domain/ports/original-bill.port';

interface MstRow {
  BILL_NO: number;
  BILL_DATE: Date | null;
  CLC_VAT_AMT_TYP: number | null;
  C_CODE: string | null;
  C_NAME: string | null;
  MACHINE_NO: number | null;
}

interface DtlRow {
  I_CODE: string;
  I_QTY: number;
  I_PRICE: number | null;
  DIS_AMT_DTL: number | null;
  DIS_AMT_MST: number | null;
  VAT_PER: number | null;
  ITM_UNT: string | null;
}

/**
 * OracleOriginalBillRepository — reads a sale bill (IAS_POS_BILL_MST/_DTL) from
 * the LIVE YSPOS23 schema so a return can verify the original exists and cannot
 * exceed the sold quantity (FLOW_RETURN.md §1 CHK_BILL_NO_ST_PRC + §4.4).
 * READ-ONLY (MOTECH_RO). Multiple sold rows of the same item are aggregated.
 */
@Injectable()
export class OracleOriginalBillRepository implements OriginalBillReader {
  constructor(private readonly oracle: OracleService) {}

  private get schema(): string {
    return this.oracle.schema();
  }

  async findByNo(billNo: string): Promise<OriginalBill | null> {
    const mst = await this.oracle.queryOne<MstRow>(
      `SELECT BILL_NO, BILL_DATE, CLC_VAT_AMT_TYP, C_CODE, C_NAME, MACHINE_NO
       FROM ${this.schema}.IAS_POS_BILL_MST WHERE BILL_NO = :billNo`,
      { billNo },
    );
    if (!mst) return null;

    const dtls = await this.oracle.query<DtlRow>(
      `SELECT I_CODE, SUM(I_QTY) AS I_QTY,
              MAX(I_PRICE) AS I_PRICE,
              MAX(NVL(DIS_AMT_DTL,0)) AS DIS_AMT_DTL,
              MAX(NVL(DIS_AMT_MST,0)) AS DIS_AMT_MST,
              MAX(NVL(VAT_PER,0)) AS VAT_PER,
              MAX(ITM_UNT) AS ITM_UNT
       FROM ${this.schema}.IAS_POS_BILL_DTL
       WHERE BILL_NO = :billNo
       GROUP BY I_CODE`,
      { billNo },
    );

    const lines: OriginalBillLine[] = dtls.map((d) => ({
      itemCode: d.I_CODE,
      qtySold: Number(d.I_QTY ?? 0),
      unitPrice: Number(d.I_PRICE ?? 0),
      discDtl: Number(d.DIS_AMT_DTL ?? 0),
      discMst: Number(d.DIS_AMT_MST ?? 0),
      vatPercent: Number(d.VAT_PER ?? 0),
      itemUnit: d.ITM_UNT ?? null,
    }));

    return {
      billNo: String(mst.BILL_NO),
      billDate: mst.BILL_DATE ? mst.BILL_DATE.toISOString() : null,
      vatCalcType: Number(mst.CLC_VAT_AMT_TYP) === 1 ? 1 : 2,
      cCode: mst.C_CODE,
      cName: mst.C_NAME,
      machineNo: mst.MACHINE_NO == null ? null : Number(mst.MACHINE_NO),
      lines,
    };
  }
}
