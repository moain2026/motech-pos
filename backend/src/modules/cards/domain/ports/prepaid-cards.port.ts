/** DI token for the prepaid-cards repository (MOTECH_POS authoritative). */
export const PREPAID_CARDS_REPOSITORY = Symbol('PREPAID_CARDS_REPOSITORY');

export type PrepaidCardType = 'CARD' | 'COUPON';
export type PrepaidMoveType = 'ISSUE' | 'TOPUP' | 'REDEEM' | 'ADJUST';

/** One prepaid card / coupon (POSI007) with its live balance. */
export interface PrepaidCardRow {
  id: string;
  cardNo: string;
  cardType: PrepaidCardType;
  currency: string;
  amount: number; // face value (CARD_AMT)
  remaining: number; // live balance (REM_CARD_AMT)
  customerCode: string | null;
  description: string | null;
  expireDate: string | null; // YYYY-MM-DD
  inactive: boolean;
  createdBy: string;
  createdAt: string;
}

/** One balance movement (POSI200 حركة بطاقة العميل). */
export interface PrepaidMovementRow {
  id: string;
  cardNo: string;
  moveType: PrepaidMoveType;
  amount: number; // signed delta
  balance: number; // remaining AFTER the move
  ref: string | null;
  note: string | null;
  createdBy: string;
  createdAt: string;
}

export interface CreatePrepaidCardInput {
  cardNo: string;
  cardType: PrepaidCardType;
  currency: string;
  amount: number;
  customerCode?: string | null;
  description?: string | null;
  expireDate?: string | null; // YYYY-MM-DD
  createdBy: string;
}

export interface PrepaidCardsRepository {
  list(filter: {
    customerCode?: string;
    cardType?: PrepaidCardType;
    activeOnly?: boolean;
    limit: number;
  }): Promise<PrepaidCardRow[]>;
  findByCardNo(cardNo: string): Promise<PrepaidCardRow | null>;
  /** Create the card + its ISSUE movement atomically. */
  create(input: CreatePrepaidCardInput): Promise<PrepaidCardRow>;
  /**
   * Apply a balance movement atomically (row-locked): TOPUP adds, REDEEM
   * subtracts (guarded: never below zero), ADJUST sets a signed delta.
   * Returns the card with its new balance.
   */
  move(
    cardNo: string,
    moveType: Exclude<PrepaidMoveType, 'ISSUE'>,
    amount: number,
    actor: string,
    ref?: string | null,
    note?: string | null,
  ): Promise<PrepaidCardRow>;
  setStatus(cardNo: string, inactive: boolean): Promise<PrepaidCardRow | null>;
  listMovements(cardNo: string, limit: number): Promise<PrepaidMovementRow[]>;
}
