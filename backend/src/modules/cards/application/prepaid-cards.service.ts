import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreatePrepaidCardInput,
  PrepaidCardsRepository,
  PrepaidCardType,
  PREPAID_CARDS_REPOSITORY,
} from '../domain/ports/prepaid-cards.port';

/**
 * PrepaidCardsService — POSI007 (code prepaid cards/coupons as a tender)
 * + POSI200 (customer card balances & movements). MOTECH_POS authoritative
 * (V019); balance mutations are transactional + row-locked in the repo.
 */
@Injectable()
export class PrepaidCardsService {
  constructor(
    @Inject(PREPAID_CARDS_REPOSITORY)
    private readonly repo: PrepaidCardsRepository,
  ) {}

  list(filter: {
    customerCode?: string;
    cardType?: PrepaidCardType;
    activeOnly?: boolean;
    limit?: number;
  }) {
    return this.repo.list({ ...filter, limit: filter.limit ?? 100 });
  }

  async get(cardNo: string) {
    const card = await this.repo.findByCardNo(cardNo);
    if (!card) throw new NotFoundException(`Card ${cardNo} not found`);
    return card;
  }

  async create(input: CreatePrepaidCardInput) {
    const dup = await this.repo.findByCardNo(input.cardNo);
    if (dup) {
      throw new ConflictException(`Card ${input.cardNo} already exists`);
    }
    return this.repo.create(input);
  }

  /** Top-up: add funds to the card. */
  async topup(cardNo: string, amount: number, actor: string, note?: string) {
    await this.get(cardNo);
    return this.repo.move(cardNo, 'TOPUP', amount, actor, null, note ?? null);
  }

  /** Redeem: spend from the card (e.g. as a payment tender; ref = bill no). */
  async redeem(
    cardNo: string,
    amount: number,
    actor: string,
    ref?: string,
    note?: string,
  ) {
    const card = await this.get(cardNo);
    if (card.inactive) {
      throw new ConflictException(`Card ${cardNo} is inactive`);
    }
    if (card.expireDate && card.expireDate < new Date().toISOString().slice(0, 10)) {
      throw new ConflictException(`Card ${cardNo} expired on ${card.expireDate}`);
    }
    return this.repo.move(
      cardNo,
      'REDEEM',
      amount,
      actor,
      ref ?? null,
      note ?? null,
    );
  }

  async setStatus(cardNo: string, inactive: boolean) {
    const row = await this.repo.setStatus(cardNo, inactive);
    if (!row) throw new NotFoundException(`Card ${cardNo} not found`);
    return row;
  }

  /** POSI200: balance + movement history of one card. */
  async movements(cardNo: string, limit = 100) {
    const card = await this.get(cardNo);
    const moves = await this.repo.listMovements(cardNo, limit);
    return { card, movements: moves };
  }
}
