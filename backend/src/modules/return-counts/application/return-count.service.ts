import { Inject, Injectable } from '@nestjs/common';
import {
  ItemNotFoundError,
  StockCountEmptyError,
  StockCountNotFoundError,
  StockCountPostedError,
  TransferWarehouseNotFoundError,
} from '../../../shared/errors/domain-error';
import {
  ListReturnCountsFilter,
  ReturnCountDetail,
  ReturnCountHeader,
  ReturnCountLine,
  ReturnCountPostIdempotencyViolation,
  ReturnCountRepository,
  RETURN_COUNT_REPOSITORY,
} from '../domain/ports/return-count.port';

export interface StartReturnCountInput {
  machineNo: number;
  countDate: string; // yyyy-mm-dd
  refNo?: string | null;
  note?: string | null;
  createdBy: string;
}

export interface CountReturnLineInput {
  countId: string;
  itemCode: string;
  countedQty: number;
}

export interface PostReturnCountResult {
  count: ReturnCountDetail;
  replayed: boolean;
}

/**
 * ReturnCountService — POST022 (جرد أصناف مردود المبيعات): open a count
 * session for one machine + day, record the physically counted RETURNED
 * quantities — the system side is snapshotted live from the REAL return
 * tables (YSPOS23.IAS_POS_RT_BILL_MST/DTL) at entry time, DIFF = counted −
 * system — then post (freeze) the variances. Mirrors the POST018 stock-count
 * pattern (idempotent post, POSTED terminal, never mutates stock).
 */
@Injectable()
export class ReturnCountService {
  constructor(
    @Inject(RETURN_COUNT_REPOSITORY)
    private readonly repo: ReturnCountRepository,
  ) {}

  async start(input: StartReturnCountInput): Promise<ReturnCountDetail> {
    if (!(await this.repo.machineExists(input.machineNo))) {
      // Machine unknown in the live ERP + overlay — same 404 family as the
      // warehouse guard (reuses the transfer-warehouse slug semantics).
      throw new TransferWarehouseNotFoundError(
        `Machine ${input.machineNo} not found`,
        { machineNo: input.machineNo },
      );
    }
    return this.repo.create({
      machineNo: input.machineNo,
      countDate: input.countDate,
      refNo: input.refNo ?? null,
      note: input.note ?? null,
      createdBy: input.createdBy,
    });
  }

  async byId(id: string): Promise<ReturnCountDetail> {
    const count = await this.repo.findById(id);
    if (!count) {
      throw new StockCountNotFoundError(`Return count ${id} not found`, { id });
    }
    return count;
  }

  list(filter: ListReturnCountsFilter): Promise<ReturnCountHeader[]> {
    return this.repo.list(filter);
  }

  /** Record (or re-record) the physical count of one returned item. */
  async countLine(input: CountReturnLineInput): Promise<ReturnCountLine> {
    const count = await this.byId(input.countId);
    if (count.status === 'POSTED') {
      throw new StockCountPostedError(
        `Return count ${input.countId} is posted and immutable`,
        { id: input.countId },
      );
    }
    const [itemName, systemQty] = await Promise.all([
      this.repo.itemName(input.itemCode),
      this.repo.systemReturnedQty(
        input.itemCode,
        count.machineNo,
        count.countDate,
      ),
    ]);
    // POST022 counts real returned goods — the item must be known in the ERP
    // master OR actually appear among that day's returns.
    if (itemName == null && systemQty === 0) {
      throw new ItemNotFoundError(
        `Item ${input.itemCode} not found in reference catalog and has no returns on ${count.countDate}`,
        { itemCode: input.itemCode },
      );
    }
    return this.repo.upsertLine({
      countId: input.countId,
      itemCode: input.itemCode,
      itemName,
      systemQty,
      countedQty: input.countedQty,
    });
  }

  /** Post (freeze) the count — idempotent per Idempotency-Key. */
  async post(
    id: string,
    postedBy: string,
    idempotencyKey: string,
  ): Promise<PostReturnCountResult> {
    const replay = await this.repo.findByPostKey(idempotencyKey);
    if (replay) return { count: replay, replayed: true };

    const count = await this.byId(id);
    if (count.status === 'POSTED') {
      throw new StockCountPostedError(`Return count ${id} is already posted`, {
        id,
        postedAt: count.postedAt,
      });
    }
    if (count.lines.length === 0) {
      throw new StockCountEmptyError(
        `Return count ${id} has no counted lines to post`,
        { id },
      );
    }
    try {
      const posted = await this.repo.post(id, postedBy, idempotencyKey);
      if (!posted) {
        throw new StockCountPostedError(
          `Return count ${id} could not be posted`,
          { id },
        );
      }
      return { count: posted, replayed: false };
    } catch (err) {
      if (err instanceof ReturnCountPostIdempotencyViolation) {
        const winner = await this.repo.findByPostKey(idempotencyKey);
        if (winner) return { count: winner, replayed: true };
      }
      throw err;
    }
  }
}
