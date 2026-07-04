import { beforeEach, describe, expect, it } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrepaidCardsService } from '../../src/modules/cards/application/prepaid-cards.service';
import {
  CreatePrepaidCardInput,
  PrepaidCardRow,
  PrepaidCardsRepository,
  PrepaidMovementRow,
  PrepaidMoveType,
} from '../../src/modules/cards/domain/ports/prepaid-cards.port';
import { InsufficientCardBalanceError } from '../../src/shared/errors/domain-error';

class FakeRepo implements PrepaidCardsRepository {
  cards = new Map<string, PrepaidCardRow>();
  moves: PrepaidMovementRow[] = [];
  private seq = 0;

  list(filter: { customerCode?: string; limit: number }) {
    let out = [...this.cards.values()];
    if (filter.customerCode) {
      out = out.filter((c) => c.customerCode === filter.customerCode);
    }
    return Promise.resolve(out.slice(0, filter.limit));
  }
  findByCardNo(no: string) {
    return Promise.resolve(this.cards.get(no) ?? null);
  }
  create(input: CreatePrepaidCardInput): Promise<PrepaidCardRow> {
    const row: PrepaidCardRow = {
      id: `c-${++this.seq}`,
      cardNo: input.cardNo,
      cardType: input.cardType,
      currency: input.currency,
      amount: input.amount,
      remaining: input.amount,
      customerCode: input.customerCode ?? null,
      description: input.description ?? null,
      expireDate: input.expireDate ?? null,
      inactive: false,
      createdBy: input.createdBy,
      createdAt: new Date().toISOString(),
    };
    this.cards.set(input.cardNo, row);
    this.recordMove(input.cardNo, 'ISSUE', input.amount, input.amount, input.createdBy);
    return Promise.resolve(row);
  }
  move(
    cardNo: string,
    moveType: Exclude<PrepaidMoveType, 'ISSUE'>,
    amount: number,
    actor: string,
    ref?: string | null,
  ): Promise<PrepaidCardRow> {
    const card = this.cards.get(cardNo);
    if (!card) throw new Error('CARD_NOT_FOUND');
    const delta =
      moveType === 'TOPUP'
        ? Math.abs(amount)
        : moveType === 'REDEEM'
          ? -Math.abs(amount)
          : amount;
    const newBal = card.remaining + delta;
    if (newBal < 0) {
      throw new InsufficientCardBalanceError('insufficient', {
        cardNo,
        remaining: card.remaining,
      });
    }
    card.remaining = newBal;
    this.recordMove(cardNo, moveType, delta, newBal, actor, ref ?? null);
    return Promise.resolve(card);
  }
  setStatus(cardNo: string, inactive: boolean) {
    const card = this.cards.get(cardNo);
    if (!card) return Promise.resolve(null);
    card.inactive = inactive;
    return Promise.resolve(card);
  }
  listMovements(cardNo: string, limit: number) {
    return Promise.resolve(
      this.moves.filter((m) => m.cardNo === cardNo).slice(0, limit),
    );
  }
  private recordMove(
    cardNo: string,
    moveType: PrepaidMoveType,
    amount: number,
    balance: number,
    actor: string,
    ref: string | null = null,
  ) {
    this.moves.push({
      id: `m-${this.moves.length + 1}`,
      cardNo,
      moveType,
      amount,
      balance,
      ref,
      note: null,
      createdBy: actor,
      createdAt: new Date().toISOString(),
    });
  }
}

describe('PrepaidCardsService (POSI007/POSI200 بطاقات الدفع المسبق)', () => {
  let repo: FakeRepo;
  let svc: PrepaidCardsService;

  const issue = (over: Partial<CreatePrepaidCardInput> = {}) =>
    svc.create({
      cardNo: 'GC-1',
      cardType: 'CARD',
      currency: 'YER',
      amount: 50000,
      createdBy: 'supervisor1',
      ...over,
    });

  beforeEach(() => {
    repo = new FakeRepo();
    svc = new PrepaidCardsService(repo);
  });

  it('issues a card with an ISSUE movement and full balance', async () => {
    const card = await issue();
    expect(card.remaining).toBe(50000);
    const { movements } = await svc.movements('GC-1');
    expect(movements).toHaveLength(1);
    expect(movements[0].moveType).toBe('ISSUE');
  });

  it('rejects a duplicate card number (409)', async () => {
    await issue();
    await expect(issue()).rejects.toThrow(ConflictException);
  });

  it('topup adds, redeem subtracts, ledger keeps running balance', async () => {
    await issue();
    await svc.topup('GC-1', 10000, 'supervisor1');
    const after = await svc.redeem('GC-1', 15000, 'cashier1', 'BILL-9');
    expect(after.remaining).toBe(45000);
    const { movements } = await svc.movements('GC-1');
    expect(movements.map((m) => m.balance)).toEqual([50000, 60000, 45000]);
  });

  it('never overdraws: redeem beyond balance throws 422', async () => {
    await issue({ amount: 100 });
    await expect(svc.redeem('GC-1', 101, 'cashier1')).rejects.toThrow(
      InsufficientCardBalanceError,
    );
  });

  it('blocks redemption on inactive and expired cards (409)', async () => {
    await issue();
    await svc.setStatus('GC-1', true);
    await expect(svc.redeem('GC-1', 1, 'cashier1')).rejects.toThrow(
      ConflictException,
    );
    await svc.setStatus('GC-1', false);
    await issue({ cardNo: 'GC-EXP', expireDate: '2020-01-01' });
    await expect(svc.redeem('GC-EXP', 1, 'cashier1')).rejects.toThrow(
      ConflictException,
    );
  });

  it('404s on unknown cards', async () => {
    await expect(svc.get('nope')).rejects.toThrow(NotFoundException);
    await expect(svc.setStatus('nope', true)).rejects.toThrow(
      NotFoundException,
    );
  });
});
