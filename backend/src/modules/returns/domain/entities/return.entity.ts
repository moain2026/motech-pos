import { Money } from '../../../../shared/domain/money';
import { ReturnLine, ReturnVatCalcType } from './return-line.entity';

export interface ReturnTotals {
  /** SUM(qty * price) returned — matches RT_BILL_AMT gross basis. */
  gross: Money;
  /** total reversed discount. */
  discount: Money;
  /** total reversed VAT. */
  vat: Money;
  /** net refundable = gross - discount + vat. */
  net: Money;
}

export interface ReturnProps {
  rtBillNo: string;
  /** the ORIGINAL bill this return is linked to (RT_BILL_MST.BILL_NO). */
  originalBillNo: string;
  rtBillDate?: Date;
  /** RETURN_TYPE (e.g. 3=cash refund) — passthrough classifier. */
  returnType?: number;
  cCode?: string;
  cName?: string;
  machineNo?: number;
  vatCalcType?: ReturnVatCalcType;
  lines: ReturnLine[];
}

/**
 * Return (مردود مبيعات) — aggregate root. A SEPARATE document that references
 * the original bill (FLOW_RETURN.md §4.1: never mutates the original sale).
 * Re-aggregates its own totals exactly as EXTRCT_POS_RT_BILL_PRC does after
 * save. Single source of truth for refund money.
 */
export class Return {
  readonly rtBillNo: string;
  readonly originalBillNo: string;
  readonly rtBillDate?: Date;
  readonly returnType: number;
  readonly cCode?: string;
  readonly cName?: string;
  readonly machineNo?: number;
  readonly vatCalcType: ReturnVatCalcType;
  readonly lines: ReturnLine[];

  constructor(props: ReturnProps) {
    if (!props.rtBillNo) throw new Error('Return: rtBillNo required');
    // NOTE: legacy YSPOS23 RT bills may have a NULL BILL_NO (unlinked returns);
    // originalBillNo is required on the WRITE path (enforced in the use case),
    // but the read model tolerates empty for those historical rows.
    this.rtBillNo = props.rtBillNo;
    this.originalBillNo = props.originalBillNo ?? '';
    this.rtBillDate = props.rtBillDate;
    this.returnType = props.returnType ?? 3;
    this.cCode = props.cCode;
    this.cName = props.cName;
    this.machineNo = props.machineNo;
    this.vatCalcType = props.vatCalcType ?? ReturnVatCalcType.AFTER_DISCOUNT;
    this.lines = props.lines;
  }

  totals(): ReturnTotals {
    const gross = this.lines.reduce(
      (a, l) => a.add(l.lineGross()),
      Money.zero(),
    );
    const discount = this.lines.reduce(
      (a, l) => a.add(l.lineDiscount()),
      Money.zero(),
    );
    const vat = this.lines.reduce(
      (a, l) => a.add(l.lineVat(this.vatCalcType)),
      Money.zero(),
    );
    const net = gross.subtract(discount).add(vat);
    return { gross, discount, vat, net };
  }
}
