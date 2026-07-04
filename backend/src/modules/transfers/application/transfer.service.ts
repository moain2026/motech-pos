import { Inject, Injectable } from '@nestjs/common';
import {
  TransferNotFoundError,
  TransferSameWarehouseError,
  TransferStateError,
  TransferWarehouseNotFoundError,
} from '../../../shared/errors/domain-error';
import {
  CreateTransferInput,
  ListTransfersFilter,
  TransferDetail,
  TransferHeader,
  TransferRepository,
  TRANSFER_REPOSITORY,
} from '../domain/ports/transfer.port';

export interface CreateTransferRequestLine {
  itemCode: string;
  qty: number;
  note?: string | null;
}

export interface CreateTransferRequest {
  fromWarehouse: number;
  toWarehouse: number;
  reqSide?: string | null;
  purpose?: string | null;
  refNo?: string | null;
  note?: string | null;
  createdBy: string;
  lines: CreateTransferRequestLine[];
}

/**
 * TransferService — POST019 (طلب صرف/تحويل مواد): raise a transfer request
 * for goods FROM a source warehouse TO the requesting point's warehouse.
 * Mirrors Onyx IAS_OUT_REQUEST_MST/DTL semantics with an OPEN → CANCELLED
 * lifecycle (ERP approval/fulfilment belongs to the sync layer).
 *
 * Guards:
 *  - both warehouses must exist in LIVE YSPOS23 (404);
 *  - source ≠ destination (422);
 *  - per-line source availability is snapshotted (MV_ITEM_AVL_QTY) for the
 *    approver — the request never reserves or mutates stock.
 */
@Injectable()
export class TransferService {
  constructor(
    @Inject(TRANSFER_REPOSITORY) private readonly repo: TransferRepository,
  ) {}

  async create(input: CreateTransferRequest): Promise<TransferDetail> {
    if (input.fromWarehouse === input.toWarehouse) {
      throw new TransferSameWarehouseError(
        'fromWarehouse and toWarehouse must differ',
        { fromWarehouse: input.fromWarehouse },
      );
    }
    for (const w of [input.fromWarehouse, input.toWarehouse]) {
      if (!(await this.repo.warehouseExists(w))) {
        throw new TransferWarehouseNotFoundError(`Warehouse ${w} not found`, {
          warehouse: w,
        });
      }
    }

    const lines = await Promise.all(
      input.lines.map(async (l) => {
        const [itemName, avlQty] = await Promise.all([
          this.repo.itemName(l.itemCode),
          this.repo.availableQty(l.itemCode, input.fromWarehouse),
        ]);
        return {
          itemCode: l.itemCode,
          itemName,
          qty: l.qty,
          avlQty,
          note: l.note ?? null,
        };
      }),
    );

    const toCreate: CreateTransferInput = {
      fromWarehouse: input.fromWarehouse,
      toWarehouse: input.toWarehouse,
      reqSide: input.reqSide ?? null,
      purpose: input.purpose ?? null,
      refNo: input.refNo ?? null,
      note: input.note ?? null,
      createdBy: input.createdBy,
      lines,
    };
    return this.repo.create(toCreate);
  }

  async byId(id: string): Promise<TransferDetail> {
    const t = await this.repo.findById(id);
    if (!t) {
      throw new TransferNotFoundError(`Transfer request ${id} not found`, {
        id,
      });
    }
    return t;
  }

  list(filter: ListTransfersFilter): Promise<TransferHeader[]> {
    return this.repo.list(filter);
  }

  /** Cancel an OPEN request (creator's undo — Onyx DELETE_PROC analogue). */
  async cancel(id: string, cancelledBy: string): Promise<TransferDetail> {
    const t = await this.byId(id);
    if (t.status !== 'OPEN') {
      throw new TransferStateError(
        `Transfer request ${id} is ${t.status} — only OPEN requests can be cancelled`,
        // NOTE: key must not be `status` — problem() spreads meta over the
        // RFC 9457 body and would clobber the numeric HTTP status.
        { id, currentStatus: t.status },
      );
    }
    const cancelled = await this.repo.cancel(id, cancelledBy);
    if (!cancelled) {
      // Guarded UPDATE matched zero rows — concurrent cancel won.
      throw new TransferStateError(
        `Transfer request ${id} could not be cancelled`,
        { id },
      );
    }
    return cancelled;
  }
}
