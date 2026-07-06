import { Inject, Injectable } from '@nestjs/common';
import {
  InvalidOverlayError,
  OverlayConflictError,
  OverlayNotFoundError,
} from '../../../shared/errors/domain-error';
import {
  PosCardRow,
  PosCardsRepository,
  POS_CARDS_REPOSITORY,
  UpsertPosCardInput,
} from '../domain/ports/pos-cards.port';

/**
 * PosCardsService — CRUD for POS card types (POSI012), overlay pattern.
 * ERP (CREDIT_CARD_TYPES) is SACRED read-only; all writes land in the
 * MOTECH_POS overlay. Reads merge both. Creating without a cardNo allocates a
 * LOCAL number; editing an ERP card creates an EDIT overlay; editing a LOCAL
 * card updates its overlay row.
 */
@Injectable()
export class PosCardsService {
  constructor(
    @Inject(POS_CARDS_REPOSITORY) private readonly repo: PosCardsRepository,
  ) {}

  list(): Promise<PosCardRow[]> {
    return this.repo.listMerged();
  }

  async get(cardNo: number): Promise<PosCardRow> {
    const row = await this.repo.findMerged(cardNo);
    if (!row) {
      throw new OverlayNotFoundError(`POS card ${cardNo} not found`, { cardNo });
    }
    return row;
  }

  async create(input: UpsertPosCardInput): Promise<PosCardRow> {
    this.validate(input);
    let cardNo = input.cardNo;
    let origin: 'LOCAL' | 'EDIT';
    if (cardNo == null) {
      // New local card → allocate a LOCAL number (well above ERP range).
      cardNo = await this.repo.nextLocalCardNo();
      origin = 'LOCAL';
    } else {
      // Explicit number: reject if it already has an overlay row; if it maps
      // to an ERP card, treat as an EDIT override, else it's a LOCAL create.
      if (await this.repo.overlayExists(cardNo)) {
        throw new OverlayConflictError(
          `A card override for number ${cardNo} already exists`,
          { cardNo },
        );
      }
      origin = (await this.repo.erpCardExists(cardNo)) ? 'EDIT' : 'LOCAL';
    }
    await this.repo.insertOverlay(cardNo, origin, input);
    return this.get(cardNo);
  }

  async update(cardNo: number, input: UpsertPosCardInput): Promise<PosCardRow> {
    this.validate(input);
    const existsOverlay = await this.repo.overlayExists(cardNo);
    if (existsOverlay) {
      await this.repo.updateOverlay(cardNo, input);
      return this.get(cardNo);
    }
    // No overlay yet — editing a pure ERP card creates an EDIT override.
    if (await this.repo.erpCardExists(cardNo)) {
      await this.repo.insertOverlay(cardNo, 'EDIT', input);
      return this.get(cardNo);
    }
    throw new OverlayNotFoundError(`POS card ${cardNo} not found`, { cardNo });
  }

  private validate(input: UpsertPosCardInput): void {
    if (!input.arName || !input.arName.trim()) {
      throw new InvalidOverlayError('Card name (arName) is required', {});
    }
    if (input.commissionPct != null && input.commissionPct < 0) {
      throw new InvalidOverlayError('commissionPct must be >= 0', {});
    }
    if (input.duePeriod != null && input.duePeriod < 0) {
      throw new InvalidOverlayError('duePeriod must be >= 0', {});
    }
  }
}
