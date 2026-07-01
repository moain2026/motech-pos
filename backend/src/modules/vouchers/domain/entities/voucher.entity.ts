import { Money } from '../../../../shared/domain/money';

/** Voucher direction: money IN (قبض) or OUT (صرف) of the drawer. */
export enum VoucherType {
  RECEIPT = 'RECEIPT',
  EXPENSE = 'EXPENSE',
}

/** Tender channel for the voucher (mirrors payment methods). */
export enum VoucherMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  BANK = 'BANK',
}

export interface VoucherProps {
  type: VoucherType;
  amount: number;
  rate?: number;
  method?: VoucherMethod;
}

/**
 * Voucher — the money-movement aggregate (POS_GNR_RCPTS / POS_GNR_EXPNS).
 * The only computed value is AMOUNT_IN_SHIFT = amount × rate, expressed in the
 * shift currency. All money math goes through Money (NUMERIC, never float).
 */
export class Voucher {
  readonly type: VoucherType;
  readonly amount: Money;
  readonly rate: Money;
  readonly method: VoucherMethod;

  constructor(props: VoucherProps) {
    this.type = props.type;
    this.amount = Money.of(props.amount);
    this.rate = Money.of(props.rate ?? 1);
    this.method = props.method ?? VoucherMethod.CASH;
  }

  /** Amount converted into the shift/bill currency (AMOUNT × RATE). */
  amountInShift(): Money {
    return this.amount.multiply(this.rate.toNumber());
  }

  /** Signed cash effect on the drawer: +receipt, -expense (only CASH counts). */
  cashEffectInShift(): Money {
    if (this.method !== VoucherMethod.CASH) return Money.of(0);
    const v = this.amountInShift();
    return this.type === VoucherType.RECEIPT
      ? v
      : Money.of(0).subtract(v);
  }
}
