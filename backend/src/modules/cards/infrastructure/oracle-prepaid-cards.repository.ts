import { Injectable } from '@nestjs/common';
import oracledb, { type BindParameters } from 'oracledb';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import { InsufficientCardBalanceError } from '../../../shared/errors/domain-error';
import {
  CreatePrepaidCardInput,
  PrepaidCardRow,
  PrepaidCardsRepository,
  PrepaidCardType,
  PrepaidMovementRow,
  PrepaidMoveType,
} from '../domain/ports/prepaid-cards.port';

interface CardDb {
  ID: string;
  CARD_NO: string;
  CARD_TYPE: PrepaidCardType;
  CURRENCY: string;
  AMOUNT: number;
  REMAINING: number;
  CUSTOMER_CODE: string | null;
  DESCRIPTION: string | null;
  EXPIRE_DATE: string | null;
  INACTIVE: number;
  CREATED_BY: string;
  CREATED_AT: Date;
}

interface MoveDb {
  ID: string;
  CARD_NO: string;
  MOVE_TYPE: PrepaidMoveType;
  AMOUNT: number;
  BALANCE: number;
  REF: string | null;
  NOTE: string | null;
  CREATED_BY: string;
  CREATED_AT: Date;
}

/**
 * OraclePrepaidCardsRepository — POSI007/POSI200 prepaid cards & coupons.
 * MOTECH_POS.PREPAID_CARDS / PREPAID_CARD_MOVEMENTS (V019) are authoritative
 * (the live YSPOS23.IAS_POS_CUSTOMER_CARD_AMOUNT is empty). Balance moves run
 * inside a single transaction with SELECT ... FOR UPDATE row locking so
 * concurrent redemptions can never overdraw a card.
 */
@Injectable()
export class OraclePrepaidCardsRepository implements PrepaidCardsRepository {
  constructor(private readonly db: OracleWriteService) {}

  private get schema(): string {
    return this.db.schema();
  }

  private readonly cardCols = `ID, CARD_NO, CARD_TYPE, CURRENCY, AMOUNT,
    REMAINING, CUSTOMER_CODE, DESCRIPTION,
    TO_CHAR(EXPIRE_DATE, 'YYYY-MM-DD') AS EXPIRE_DATE, INACTIVE,
    CREATED_BY, CREATED_AT`;

  async list(filter: {
    customerCode?: string;
    cardType?: PrepaidCardType;
    activeOnly?: boolean;
    limit: number;
  }): Promise<PrepaidCardRow[]> {
    const binds: Record<string, unknown> = { lim: filter.limit };
    const where: string[] = [];
    if (filter.customerCode) {
      where.push('CUSTOMER_CODE = :cust');
      binds.cust = filter.customerCode;
    }
    if (filter.cardType) {
      where.push('CARD_TYPE = :ctype');
      binds.ctype = filter.cardType;
    }
    if (filter.activeOnly) where.push('INACTIVE = 0');
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const rows = await this.db.query<CardDb>(
      `SELECT * FROM (
         SELECT ${this.cardCols} FROM ${this.schema}.PREPAID_CARDS
         ${whereSql}
         ORDER BY CREATED_AT DESC
       ) WHERE ROWNUM <= :lim`,
      binds as BindParameters,
    );
    return rows.map((r) => this.mapCard(r));
  }

  async findByCardNo(cardNo: string): Promise<PrepaidCardRow | null> {
    const row = await this.db.queryOne<CardDb>(
      `SELECT ${this.cardCols} FROM ${this.schema}.PREPAID_CARDS
       WHERE CARD_NO = :no`,
      { no: cardNo },
    );
    return row ? this.mapCard(row) : null;
  }

  async create(input: CreatePrepaidCardInput): Promise<PrepaidCardRow> {
    await this.db.withTransaction(async (conn) => {
      await conn.execute(
        `INSERT INTO ${this.schema}.PREPAID_CARDS
           (ID, CARD_NO, CARD_TYPE, CURRENCY, AMOUNT, REMAINING,
            CUSTOMER_CODE, DESCRIPTION, EXPIRE_DATE, CREATED_BY)
         VALUES
           (:id, :no, :ctype, :cy, :amt, :amt2, :cust, :descr,
            TO_DATE(:exp, 'YYYY-MM-DD'), :actor)`,
        {
          id: uuidv7(),
          no: input.cardNo,
          ctype: input.cardType,
          cy: input.currency,
          amt: input.amount,
          amt2: input.amount,
          cust: input.customerCode ?? null,
          descr: input.description ?? null,
          exp: input.expireDate ?? null,
          actor: input.createdBy,
        },
      );
      await conn.execute(
        `INSERT INTO ${this.schema}.PREPAID_CARD_MOVEMENTS
           (ID, CARD_NO, MOVE_TYPE, AMOUNT, BALANCE, NOTE, CREATED_BY)
         VALUES (:id, :no, 'ISSUE', :amt, :bal, :note, :actor)`,
        {
          id: uuidv7(),
          no: input.cardNo,
          amt: input.amount,
          bal: input.amount,
          note: input.description ?? null,
          actor: input.createdBy,
        },
      );
    });
    const row = await this.findByCardNo(input.cardNo);
    if (!row) throw new Error(`Prepaid card create failed: ${input.cardNo}`);
    return row;
  }

  async move(
    cardNo: string,
    moveType: Exclude<PrepaidMoveType, 'ISSUE'>,
    amount: number,
    actor: string,
    ref?: string | null,
    note?: string | null,
  ): Promise<PrepaidCardRow> {
    await this.db.withTransaction(async (conn) => {
      // Row-lock the card so concurrent moves serialize on the balance.
      const cur = await conn.execute<{ REMAINING: number }>(
        `SELECT REMAINING FROM ${this.schema}.PREPAID_CARDS
         WHERE CARD_NO = :no FOR UPDATE`,
        { no: cardNo },
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
      );
      const rows = (cur.rows ?? []) as { REMAINING: number }[];
      if (rows.length === 0) {
        throw new Error(`CARD_NOT_FOUND:${cardNo}`);
      }
      const remaining = Number(rows[0].REMAINING);
      const delta =
        moveType === 'TOPUP'
          ? Math.abs(amount)
          : moveType === 'REDEEM'
            ? -Math.abs(amount)
            : amount; // ADJUST is signed
      const newBal = Math.round((remaining + delta) * 1000) / 1000;
      if (newBal < 0) {
        throw new InsufficientCardBalanceError(
          `Card ${cardNo} balance ${remaining} is insufficient for ${Math.abs(delta)}`,
          { cardNo, remaining, requested: Math.abs(delta) },
        );
      }
      await conn.execute(
        `UPDATE ${this.schema}.PREPAID_CARDS
         SET REMAINING = :bal, UPDATED_AT = SYSTIMESTAMP
         WHERE CARD_NO = :no`,
        { bal: newBal, no: cardNo },
      );
      await conn.execute(
        `INSERT INTO ${this.schema}.PREPAID_CARD_MOVEMENTS
           (ID, CARD_NO, MOVE_TYPE, AMOUNT, BALANCE, REF, NOTE, CREATED_BY)
         VALUES (:id, :no, :mtype, :amt, :bal, :ref, :note, :actor)`,
        {
          id: uuidv7(),
          no: cardNo,
          mtype: moveType,
          amt: delta,
          bal: newBal,
          ref: ref ?? null,
          note: note ?? null,
          actor,
        },
      );
    });
    const row = await this.findByCardNo(cardNo);
    if (!row) throw new Error(`Prepaid card vanished after move: ${cardNo}`);
    return row;
  }

  async setStatus(
    cardNo: string,
    inactive: boolean,
  ): Promise<PrepaidCardRow | null> {
    await this.db.execute(
      `UPDATE ${this.schema}.PREPAID_CARDS
       SET INACTIVE = :ia, UPDATED_AT = SYSTIMESTAMP
       WHERE CARD_NO = :no`,
      { ia: inactive ? 1 : 0, no: cardNo },
    );
    return this.findByCardNo(cardNo);
  }

  async listMovements(
    cardNo: string,
    limit: number,
  ): Promise<PrepaidMovementRow[]> {
    const rows = await this.db.query<MoveDb>(
      `SELECT * FROM (
         SELECT ID, CARD_NO, MOVE_TYPE, AMOUNT, BALANCE, REF, NOTE,
                CREATED_BY, CREATED_AT
         FROM ${this.schema}.PREPAID_CARD_MOVEMENTS
         WHERE CARD_NO = :no
         ORDER BY CREATED_AT DESC
       ) WHERE ROWNUM <= :lim`,
      { no: cardNo, lim: limit } as BindParameters,
    );
    return rows.map((r) => ({
      id: r.ID,
      cardNo: r.CARD_NO,
      moveType: r.MOVE_TYPE,
      amount: Number(r.AMOUNT),
      balance: Number(r.BALANCE),
      ref: r.REF ?? null,
      note: r.NOTE ?? null,
      createdBy: r.CREATED_BY,
      createdAt: r.CREATED_AT.toISOString(),
    }));
  }

  async findRedeemByRef(
    cardNo: string,
    ref: string,
  ): Promise<PrepaidMovementRow | null> {
    const row = await this.db.queryOne<MoveDb>(
      `SELECT ID, CARD_NO, MOVE_TYPE, AMOUNT, BALANCE, REF, NOTE,
              CREATED_BY, CREATED_AT
       FROM ${this.schema}.PREPAID_CARD_MOVEMENTS
       WHERE CARD_NO = :no AND MOVE_TYPE = 'REDEEM' AND REF = :ref
       ORDER BY CREATED_AT ASC FETCH FIRST 1 ROWS ONLY`,
      { no: cardNo, ref },
    );
    if (!row) return null;
    return {
      id: row.ID,
      cardNo: row.CARD_NO,
      moveType: row.MOVE_TYPE,
      amount: Number(row.AMOUNT),
      balance: Number(row.BALANCE),
      ref: row.REF ?? null,
      note: row.NOTE ?? null,
      createdBy: row.CREATED_BY,
      createdAt: row.CREATED_AT.toISOString(),
    };
  }

  private mapCard(r: CardDb): PrepaidCardRow {
    return {
      id: r.ID,
      cardNo: r.CARD_NO,
      cardType: r.CARD_TYPE,
      currency: r.CURRENCY,
      amount: Number(r.AMOUNT),
      remaining: Number(r.REMAINING),
      customerCode: r.CUSTOMER_CODE ?? null,
      description: r.DESCRIPTION ?? null,
      expireDate: r.EXPIRE_DATE ?? null,
      inactive: Number(r.INACTIVE ?? 0) === 1,
      createdBy: r.CREATED_BY,
      createdAt: r.CREATED_AT.toISOString(),
    };
  }
}
