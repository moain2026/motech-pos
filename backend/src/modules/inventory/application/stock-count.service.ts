import { Inject, Injectable } from '@nestjs/common';
import {
  StockCountEmptyError,
  StockCountNotFoundError,
  StockCountPostedError,
} from '../../../shared/errors/domain-error';
import {
  ListStockCountsFilter,
  StockCountDetail,
  StockCountLine,
  StockCountPostIdempotencyViolation,
  StockCountRepository,
  STOCK_COUNT_REPOSITORY,
} from '../domain/ports/stock-count.port';

export interface StartCountInput {
  warehouseCode: number;
  note?: string | null;
  createdBy: string;
}

export interface CountLineInput {
  countId: string;
  itemCode: string;
  countedQty: number;
}

export interface PostCountResult {
  count: StockCountDetail;
  replayed: boolean;
}

/**
 * StockCountService — POST018 (جرد): start a count session per warehouse,
 * record physical counts per item (variance = counted − system snapshot from
 * MV_ITEM_AVL_QTY), then a supervisor/admin posts the session which freezes
 * it (POSTED is terminal). Posting is idempotent per Idempotency-Key.
 * Counts never mutate Onyx stock — they are audit/variance records.
 */
@Injectable()
export class StockCountService {
  constructor(
    @Inject(STOCK_COUNT_REPOSITORY)
    private readonly repo: StockCountRepository,
  ) {}

  /** Open a new DRAFT count for one warehouse. */
  start(input: StartCountInput): Promise<StockCountDetail> {
    return this.repo.create({
      warehouseCode: input.warehouseCode,
      note: input.note ?? null,
      createdBy: input.createdBy,
    });
  }

  /** Paginated list of count sessions (newest first). */
  list(filter: ListStockCountsFilter) {
    return this.repo.list(filter);
  }

  /** One count session with its lines. 404 when unknown. */
  async byId(id: string): Promise<StockCountDetail> {
    const count = await this.repo.findById(id);
    if (!count) {
      throw new StockCountNotFoundError(`Stock count ${id} not found`, { id });
    }
    return count;
  }

  /**
   * Record (or re-record) the physical count of one item. The system qty is
   * snapshotted from MV_ITEM_AVL_QTY for the count's warehouse at entry time;
   * DIFF = counted − system. Rejected once the session is POSTED.
   */
  async countLine(input: CountLineInput): Promise<StockCountLine> {
    const count = await this.byId(input.countId);
    if (count.status === 'POSTED') {
      throw new StockCountPostedError(
        `Stock count ${input.countId} is posted and immutable`,
        { id: input.countId },
      );
    }
    const [systemQty, itemName] = await Promise.all([
      this.repo.systemQty(input.itemCode, count.warehouseCode),
      this.repo.itemName(input.itemCode),
    ]);
    return this.repo.upsertLine({
      countId: input.countId,
      itemCode: input.itemCode,
      itemName,
      systemQty,
      countedQty: input.countedQty,
    });
  }

  /**
   * Approve (post) the count — records the variances permanently and locks
   * the session. Idempotent: a replay with the same key returns the already
   * posted session; a different key against a POSTED session is a 409.
   */
  async post(
    id: string,
    postedBy: string,
    idempotencyKey: string,
  ): Promise<PostCountResult> {
    const replay = await this.repo.findByPostIdempotencyKey(idempotencyKey);
    if (replay) return { count: replay, replayed: true };

    const count = await this.byId(id);
    if (count.status === 'POSTED') {
      throw new StockCountPostedError(
        `Stock count ${id} is already posted`,
        { id, postedAt: count.postedAt },
      );
    }
    if (count.lines.length === 0) {
      throw new StockCountEmptyError(
        `Stock count ${id} has no counted lines to post`,
        { id },
      );
    }
    try {
      const posted = await this.repo.post(id, postedBy, idempotencyKey);
      if (posted.status !== 'POSTED') {
        // Guarded UPDATE matched zero rows — someone else won the race.
        throw new StockCountPostedError(
          `Stock count ${id} could not be posted`,
          { id },
        );
      }
      return { count: posted, replayed: false };
    } catch (err) {
      if (err instanceof StockCountPostIdempotencyViolation) {
        const winner = await this.repo.findByPostIdempotencyKey(idempotencyKey);
        if (winner) return { count: winner, replayed: true };
      }
      throw err;
    }
  }
}
