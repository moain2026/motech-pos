import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  ItemNotFoundError,
  SalesOrderNotFoundError,
  SalesOrderStateError,
} from '../../../shared/errors/domain-error';
import { Role } from '../../auth/domain/user.entity';
import { PostBillUseCase } from '../../bills/application/post-bill.usecase';
import {
  CreateSalesOrderInput,
  ListSalesOrdersFilter,
  SalesOrderDetail,
  SalesOrderHeader,
  SalesOrderRepository,
  SALES_ORDER_REPOSITORY,
} from '../domain/ports/sales-order.port';

export interface CreateOrderRequestLine {
  itemCode: string;
  qty: number;
  discDtl?: number | null;
  note?: string | null;
}

export interface CreateOrderRequest {
  customerCode?: string | null;
  customerName?: string | null;
  currency?: string | null;
  refNo?: string | null;
  note?: string | null;
  expireDate?: string | null; // yyyy-mm-dd
  createdBy: string;
  lines: CreateOrderRequestLine[];
}

export interface ConvertOrderRequest {
  orderId: string;
  idempotencyKey: string; // Idempotency-Key header (uuid) — replay-safe
  cashierNo: number;
  machineNo?: number;
  actorRole?: Role;
  convertedBy: string;
}

export interface ConvertOrderResult {
  order: SalesOrderDetail;
  replayed: boolean;
}

/**
 * SalesOrderService — POST024 (طلبات العملاء): record a customer order
 * BEFORE the sale, then "أنزله في فاتورة" — conversion posts a REAL bill
 * through the proven PostBillUseCase (server-side price authority, open-shift
 * guard, YSPOS23 twin write, loyalty earn) and freezes the order.
 *
 * Guards:
 *  - every line item must exist in the ERP master or the local overlay (404);
 *  - name + retail-L1 price are snapshotted for display — the bill REPRICES
 *    server-side at conversion time (orders never lock a price);
 *  - convert/cancel are guarded OPEN-only flips (409 otherwise);
 *  - conversion is idempotent per Idempotency-Key: a replay returns the same
 *    converted order (and the bill idempotency inside PostBillUseCase makes
 *    the underlying sale replay-safe too).
 */
@Injectable()
export class SalesOrderService {
  private readonly logger = new Logger(SalesOrderService.name);

  constructor(
    @Inject(SALES_ORDER_REPOSITORY)
    private readonly repo: SalesOrderRepository,
    private readonly postBill: PostBillUseCase,
  ) {}

  async create(input: CreateOrderRequest): Promise<SalesOrderDetail> {
    const lines = [];
    for (const l of input.lines) {
      if (!(await this.repo.itemExists(l.itemCode))) {
        throw new ItemNotFoundError(
          `Item ${l.itemCode} not found in reference catalog`,
          { itemCode: l.itemCode },
        );
      }
      const snap = await this.repo.itemSnapshot(l.itemCode);
      lines.push({
        itemCode: l.itemCode,
        itemName: snap.itemName,
        qty: l.qty,
        unitPrice: snap.unitPrice,
        discDtl: l.discDtl ?? 0,
        note: l.note ?? null,
      });
    }

    let customerName = input.customerName ?? null;
    if (input.customerCode && !customerName) {
      customerName = await this.repo.customerName(input.customerCode);
    }

    const toCreate: CreateSalesOrderInput = {
      customerCode: input.customerCode ?? null,
      customerName,
      currency: input.currency ?? 'YER',
      refNo: input.refNo ?? null,
      note: input.note ?? null,
      expireDate: input.expireDate ?? null,
      createdBy: input.createdBy,
      lines,
    };
    return this.repo.create(toCreate);
  }

  async byId(id: string): Promise<SalesOrderDetail> {
    const order = await this.repo.findById(id);
    if (!order) {
      throw new SalesOrderNotFoundError(`Sales order ${id} not found`, { id });
    }
    return order;
  }

  list(filter: ListSalesOrdersFilter): Promise<SalesOrderHeader[]> {
    return this.repo.list(filter);
  }

  /**
   * Convert (تنزيل الطلب في فاتورة): post a REAL sale bill from the order
   * lines, then freeze the order as CONVERTED with the bill linkage.
   */
  async convert(input: ConvertOrderRequest): Promise<ConvertOrderResult> {
    // (1) Idempotency replay — the order already converted with this key.
    const replay = await this.repo.findByConvertKey(input.idempotencyKey);
    if (replay) return { order: replay, replayed: true };

    const order = await this.byId(input.orderId);
    if (order.status !== 'OPEN') {
      throw new SalesOrderStateError(
        `Sales order ${input.orderId} is ${order.status} — only OPEN orders can be converted`,
        { id: input.orderId, currentStatus: order.status },
      );
    }

    // (2) Post the REAL bill (open-shift guard + server-side pricing inside).
    // The bill reuses the same Idempotency-Key, so a crash between bill-post
    // and order-flip replays into the SAME bill (no duplicate sale).
    const { bill } = await this.postBill.execute({
      idempotencyKey: input.idempotencyKey,
      cashierNo: input.cashierNo,
      machineNo: input.machineNo,
      customerCode: order.customerCode ?? undefined,
      customerName: order.customerName ?? undefined,
      currency: order.currency,
      actorRole: input.actorRole,
      lines: order.lines.map((l) => ({
        itemCode: l.itemCode,
        qty: l.qty,
        discDtl: l.discDtl > 0 ? l.discDtl : undefined,
      })),
    });

    // (3) Guarded OPEN → CONVERTED flip with the bill linkage.
    const converted = await this.repo.markConverted({
      orderId: input.orderId,
      billId: bill.id,
      billNo: bill.billNo,
      convertedBy: input.convertedBy,
      idempotencyKey: input.idempotencyKey,
    });
    if (!converted) {
      // Concurrent convert won the flip — surface the winner if it used the
      // same key, otherwise report the conflict (bill is idempotent-safe).
      const winner = await this.repo.findByConvertKey(input.idempotencyKey);
      if (winner) return { order: winner, replayed: true };
      throw new SalesOrderStateError(
        `Sales order ${input.orderId} could not be converted (concurrent update)`,
        { id: input.orderId },
      );
    }
    this.logger.log(
      `Sales order ${converted.orderNo} converted → bill ${bill.billNo}`,
    );
    return { order: converted, replayed: false };
  }

  /** Cancel an OPEN order (guarded flip — Onyx DELETE_PROC analogue). */
  async cancel(id: string, cancelledBy: string): Promise<SalesOrderDetail> {
    const order = await this.byId(id);
    if (order.status !== 'OPEN') {
      throw new SalesOrderStateError(
        `Sales order ${id} is ${order.status} — only OPEN orders can be cancelled`,
        { id, currentStatus: order.status },
      );
    }
    const cancelled = await this.repo.cancel(id, cancelledBy);
    if (!cancelled) {
      throw new SalesOrderStateError(
        `Sales order ${id} could not be cancelled`,
        { id },
      );
    }
    return cancelled;
  }
}
