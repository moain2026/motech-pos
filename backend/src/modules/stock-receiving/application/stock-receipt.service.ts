import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  ItemNotFoundError,
  StockReceiptEmptyError,
  StockReceiptNotFoundError,
  StockReceiptStateError,
  TransferWarehouseNotFoundError,
} from '../../../shared/errors/domain-error';
import {
  CreateStockReceiptInput,
  ListStockReceiptsFilter,
  StockReceiptDetail,
  StockReceiptHeader,
  StockReceiptPostIdempotencyViolation,
  StockReceiptRepository,
  STOCK_RECEIPT_REPOSITORY,
} from '../domain/ports/stock-receipt.port';

export interface CreateReceiptRequestLine {
  itemCode: string;
  qty: number;
  note?: string | null;
}

export interface CreateReceiptRequest {
  warehouseCode: number;
  sourceWarehouseCode?: number | null;
  transferId?: string | null;
  refNo?: string | null;
  note?: string | null;
  createdBy: string;
  lines: CreateReceiptRequestLine[];
}

export interface PostReceiptResult {
  receipt: StockReceiptDetail;
  replayed: boolean;
}

/**
 * StockReceiptService — POST029 (الاستلام المخزني): record incoming goods as
 * a DRAFT document, then a supervisor/admin POSTS it — approval writes the
 * REAL stock effect (ITEM_MOVEMENT DOC_TYPE=8 / IN_OUT=+1) and refreshes
 * MV_ITEM_AVL_QTY, so the received quantity is immediately sellable
 * (Onyx INSTALL_TR analogue).
 *
 * Guards:
 *  - destination (and optional source) warehouse must exist LIVE in YSPOS23
 *    (404); source ≠ destination (DB CK too);
 *  - every line item must exist in the ERP master (404) — name/unit/pack/cost
 *    are snapshotted at entry;
 *  - posting is guarded DRAFT-only (409) and idempotent per Idempotency-Key
 *    (replay returns the already-posted receipt; UNIQUE key is the backstop);
 *  - cancel is a guarded DRAFT-only flip (409 otherwise).
 */
@Injectable()
export class StockReceiptService {
  private readonly logger = new Logger(StockReceiptService.name);

  constructor(
    @Inject(STOCK_RECEIPT_REPOSITORY)
    private readonly repo: StockReceiptRepository,
  ) {}

  async create(input: CreateReceiptRequest): Promise<StockReceiptDetail> {
    if (
      input.sourceWarehouseCode != null &&
      input.sourceWarehouseCode === input.warehouseCode
    ) {
      throw new StockReceiptStateError(
        'sourceWarehouseCode and warehouseCode must differ',
        { warehouseCode: input.warehouseCode },
      );
    }
    const toCheck = [input.warehouseCode];
    if (input.sourceWarehouseCode != null) {
      toCheck.push(input.sourceWarehouseCode);
    }
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

    const toCreate: CreateStockReceiptInput = {
      warehouseCode: input.warehouseCode,
      sourceWarehouseCode: input.sourceWarehouseCode ?? null,
      transferId: input.transferId ?? null,
      refNo: input.refNo ?? null,
      note: input.note ?? null,
      createdBy: input.createdBy,
      lines,
    };
    return this.repo.create(toCreate);
  }

  async byId(id: string): Promise<StockReceiptDetail> {
    const receipt = await this.repo.findById(id);
    if (!receipt) {
      throw new StockReceiptNotFoundError(`Stock receipt ${id} not found`, {
        id,
      });
    }
    return receipt;
  }

  list(filter: ListStockReceiptsFilter): Promise<StockReceiptHeader[]> {
    return this.repo.list(filter);
  }

  /**
   * Post (approve) the receipt — writes the ITEM_MOVEMENT rows and increases
   * available stock. Idempotent per Idempotency-Key.
   */
  async post(
    id: string,
    postedBy: string,
    idempotencyKey: string,
  ): Promise<PostReceiptResult> {
    const replay = await this.repo.findByPostKey(idempotencyKey);
    if (replay) return { receipt: replay, replayed: true };

    const receipt = await this.byId(id);
    if (receipt.status !== 'DRAFT') {
      throw new StockReceiptStateError(
        `Stock receipt ${id} is ${receipt.status} — only DRAFT receipts can be posted`,
        { id, currentStatus: receipt.status },
      );
    }
    if (receipt.lines.length === 0) {
      throw new StockReceiptEmptyError(
        `Stock receipt ${id} has no lines to post`,
        { id },
      );
    }

    try {
      const posted = await this.repo.post(id, postedBy, idempotencyKey);
      if (!posted) {
        throw new StockReceiptStateError(
          `Stock receipt ${id} could not be posted (concurrent update)`,
          { id },
        );
      }
      this.logger.log(
        `Stock receipt ${posted.receiptNo} posted → ITEM_MOVEMENT doc ${posted.onyxDocNo} (wh ${posted.warehouseCode})`,
      );
      return { receipt: posted, replayed: false };
    } catch (err) {
      if (err instanceof StockReceiptPostIdempotencyViolation) {
        const winner = await this.repo.findByPostKey(idempotencyKey);
        if (winner) return { receipt: winner, replayed: true };
      }
      throw err;
    }
  }

  /** Cancel a DRAFT receipt (guarded flip). */
  async cancel(id: string, cancelledBy: string): Promise<StockReceiptDetail> {
    const receipt = await this.byId(id);
    if (receipt.status !== 'DRAFT') {
      throw new StockReceiptStateError(
        `Stock receipt ${id} is ${receipt.status} — only DRAFT receipts can be cancelled`,
        { id, currentStatus: receipt.status },
      );
    }
    const cancelled = await this.repo.cancel(id, cancelledBy);
    if (!cancelled) {
      throw new StockReceiptStateError(
        `Stock receipt ${id} could not be cancelled`,
        { id },
      );
    }
    return cancelled;
  }
}
