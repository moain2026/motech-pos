import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  InsufficientStockError,
  ItemNotFoundError,
  StockReceiptEmptyError,
  StockReceiptNotFoundError,
  StockReceiptStateError,
  TransferWarehouseNotFoundError,
} from '../../../shared/errors/domain-error';
import {
  CreateStockIssueInput,
  ListStockIssuesFilter,
  StockIssueDetail,
  StockIssueHeader,
  StockIssuePostIdempotencyViolation,
  StockIssueRepository,
  STOCK_ISSUE_REPOSITORY,
} from '../domain/ports/stock-issue.port';

export interface CreateIssueRequestLine {
  itemCode: string;
  qty: number;
  note?: string | null;
}

export interface CreateIssueRequest {
  warehouseCode: number;
  destWarehouseCode?: number | null;
  transferId?: string | null;
  refNo?: string | null;
  note?: string | null;
  createdBy: string;
  lines: CreateIssueRequestLine[];
}

export interface PostIssueResult {
  issue: StockIssueDetail;
  replayed: boolean;
}

/**
 * StockIssueService — POST028 (التحويل المخزني): dispatch goods FROM a source
 * warehouse. DRAFT document; posting (supervisor/admin) writes the real
 * ITEM_MOVEMENT rows (DOC_TYPE=7 / IN_OUT=−1) and refreshes availability —
 * stock truly leaves the source.
 *
 * Extra guard vs receipts: at POSTING time every line must fit within the
 * source's AVAILABLE quantity (CHECK_AVL_QTY_PRC analogue) — dispatching more
 * than is available is a 422.
 */
@Injectable()
export class StockIssueService {
  private readonly logger = new Logger(StockIssueService.name);

  constructor(
    @Inject(STOCK_ISSUE_REPOSITORY)
    private readonly repo: StockIssueRepository,
  ) {}

  async create(input: CreateIssueRequest): Promise<StockIssueDetail> {
    if (
      input.destWarehouseCode != null &&
      input.destWarehouseCode === input.warehouseCode
    ) {
      throw new StockReceiptStateError(
        'destWarehouseCode and warehouseCode must differ',
        { warehouseCode: input.warehouseCode },
      );
    }
    const toCheck = [input.warehouseCode];
    if (input.destWarehouseCode != null) toCheck.push(input.destWarehouseCode);
    for (const w of toCheck) {
      if (!(await this.repo.warehouseExists(w))) {
        throw new TransferWarehouseNotFoundError(`Warehouse ${w} not found`, {
          warehouse: w,
        });
      }
    }

    const lines = [];
    for (const l of input.lines) {
      const snap = await this.repo.itemSnapshot(l.itemCode);
      if (!snap) {
        throw new ItemNotFoundError(
          `Item ${l.itemCode} not found in reference catalog`,
          { itemCode: l.itemCode },
        );
      }
      lines.push({
        itemCode: l.itemCode,
        itemName: snap.itemName,
        qty: l.qty,
        itmUnt: snap.itmUnt,
        pSize: snap.pSize,
        unitCost: snap.unitCost,
        note: l.note ?? null,
      });
    }

    const toCreate: CreateStockIssueInput = {
      warehouseCode: input.warehouseCode,
      destWarehouseCode: input.destWarehouseCode ?? null,
      transferId: input.transferId ?? null,
      refNo: input.refNo ?? null,
      note: input.note ?? null,
      createdBy: input.createdBy,
      lines,
    };
    return this.repo.create(toCreate);
  }

  async byId(id: string): Promise<StockIssueDetail> {
    const issue = await this.repo.findById(id);
    if (!issue) {
      throw new StockReceiptNotFoundError(`Stock issue ${id} not found`, {
        id,
      });
    }
    return issue;
  }

  list(filter: ListStockIssuesFilter): Promise<StockIssueHeader[]> {
    return this.repo.list(filter);
  }

  /** Post (approve) — availability-guarded; stock leaves the source. */
  async post(
    id: string,
    postedBy: string,
    idempotencyKey: string,
  ): Promise<PostIssueResult> {
    const replay = await this.repo.findByPostKey(idempotencyKey);
    if (replay) return { issue: replay, replayed: true };

    const issue = await this.byId(id);
    if (issue.status !== 'DRAFT') {
      throw new StockReceiptStateError(
        `Stock issue ${id} is ${issue.status} — only DRAFT issues can be posted`,
        { id, currentStatus: issue.status },
      );
    }
    if (issue.lines.length === 0) {
      throw new StockReceiptEmptyError(
        `Stock issue ${id} has no lines to post`,
        { id },
      );
    }

    // Availability guard (CHECK_AVL_QTY_PRC): every line must fit within the
    // source warehouse's available quantity at posting time.
    for (const l of issue.lines) {
      const avl = await this.repo.availableQty(l.itemCode, issue.warehouseCode);
      const needed = l.qty * l.pSize;
      if (avl == null || avl < needed) {
        throw new InsufficientStockError(
          `Item ${l.itemCode}: requested ${needed} exceeds available ${avl ?? 0} at warehouse ${issue.warehouseCode}`,
          {
            itemCode: l.itemCode,
            requested: needed,
            available: avl ?? 0,
            warehouse: issue.warehouseCode,
          },
        );
      }
    }

    try {
      const posted = await this.repo.post(id, postedBy, idempotencyKey);
      if (!posted) {
        throw new StockReceiptStateError(
          `Stock issue ${id} could not be posted (concurrent update)`,
          { id },
        );
      }
      this.logger.log(
        `Stock issue ${posted.issueNo} posted → ITEM_MOVEMENT doc ${posted.onyxDocNo} (wh ${posted.warehouseCode}, out)`,
      );
      return { issue: posted, replayed: false };
    } catch (err) {
      if (err instanceof StockIssuePostIdempotencyViolation) {
        const winner = await this.repo.findByPostKey(idempotencyKey);
        if (winner) return { issue: winner, replayed: true };
      }
      throw err;
    }
  }

  async cancel(id: string, cancelledBy: string): Promise<StockIssueDetail> {
    const issue = await this.byId(id);
    if (issue.status !== 'DRAFT') {
      throw new StockReceiptStateError(
        `Stock issue ${id} is ${issue.status} — only DRAFT issues can be cancelled`,
        { id, currentStatus: issue.status },
      );
    }
    const cancelled = await this.repo.cancel(id, cancelledBy);
    if (!cancelled) {
      throw new StockReceiptStateError(
        `Stock issue ${id} could not be cancelled`,
        { id },
      );
    }
    return cancelled;
  }
}
