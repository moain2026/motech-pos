import { Money } from '../../../../shared/domain/money';
import { BillLine, VatCalcType } from './bill-line.entity';

export interface BillTotals {
  /** SUM(I_QTY * I_PRICE) — matches BILL_AMT in the no-tax dataset */
  gross: Money;
  /** total discount = SUM(qty * (DIS_AMT_DTL + DIS_AMT_MST)) — matches DISC_AMT */
  discount: Money;
  /** total VAT — matches VAT_AMT */
  vat: Money;
  /** net payable = gross - discount + vat */
  net: Money;
}

export interface BillProps {
  billNo: string;
  billDate?: Date;
  billType?: number;
  cCode?: string;
  cName?: string;
  machineNo?: number;
  vatCalcType?: VatCalcType;
  taxFreeQtyFlag?: number;
  lines: BillLine[];
}

/**
 * Bill — aggregate root. Owns its lines and computes header totals exactly as
 * UPDT_BILL_IN_SAV_PRC re-aggregates them after save (PACKAGES_ANALYSIS §1.5,
 * SALES_FLOW step 7). This is the single source of truth for invoice money.
 */
export class Bill {
  readonly billNo: string;
  readonly billDate?: Date;
  readonly billType: number;
  readonly cCode?: string;
  readonly cName?: string;
  readonly machineNo?: number;
  readonly vatCalcType: VatCalcType;
  readonly taxFreeQtyFlag: number;
  readonly lines: BillLine[];

  constructor(props: BillProps) {
    if (!props.billNo) throw new Error('Bill: billNo required');
    this.billNo = props.billNo;
    this.billDate = props.billDate;
    this.billType = props.billType ?? 1;
    this.cCode = props.cCode;
    this.cName = props.cName;
    this.machineNo = props.machineNo;
    this.vatCalcType = props.vatCalcType ?? VatCalcType.AFTER_DISCOUNT;
    this.taxFreeQtyFlag = props.taxFreeQtyFlag ?? 0;
    this.lines = props.lines;
  }

  /** Re-aggregate totals from detail lines (UPDT_BILL_IN_SAV_PRC logic). */
  totals(): BillTotals {
    const gross = this.lines.reduce((a, l) => a.add(l.lineGross()), Money.zero());
    const discount = this.lines.reduce(
      (a, l) => a.add(l.lineDiscount()),
      Money.zero(),
    );
    const vat = this.lines.reduce(
      (a, l) => a.add(l.lineVat(this.vatCalcType, this.taxFreeQtyFlag)),
      Money.zero(),
    );
    const net = gross.subtract(discount).add(vat);
    return { gross, discount, vat, net };
  }
}
