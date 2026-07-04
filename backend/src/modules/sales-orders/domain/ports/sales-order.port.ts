/** DI token for the SalesOrderRepository port. */
export const SALES_ORDER_REPOSITORY = Symbol('SALES_ORDER_REPOSITORY');

export type SalesOrderStatus = 'OPEN' | 'CONVERTED' | 'CANCELLED';

/** One requested item on a customer order (POST024 detail). */
export interface SalesOrderLine {
  lineId: string;
  itemCode: string;
  itemName: string | null; // Arabic name snapshot (IAS_ITM_MST / overlay)
  qty: number;
  unitPrice: number | null; // retail L1 snapshot (display only — the bill reprices)
  discDtl: number; // per-unit detail discount carried into the bill
  note: string | null;
}

/** Customer order header (POST024 طلبات العملاء). */
export interface SalesOrderHeader {
  id: string;
  orderNo: number; // human-friendly serial (SEQ_SALES_ORDER_NO)
  status: SalesOrderStatus;
  customerCode: string | null;
  customerName: string | null;
  currency: string;
  refNo: string | null;
  note: string | null;
  expireDate: string | null; // ORDER_EXPIRE_DATE analogue
  createdBy: string;
  createdAt: string;
  convertedBillId: string | null; // MOTECH_POS.BILLS.ID
  convertedBillNo: string | null; // real YSPOS23 bill number
  convertedBy: string | null;
  convertedAt: string | null;
  cancelledBy: string | null;
  cancelledAt: string | null;
  lineCount: number;
}

export interface SalesOrderDetail extends SalesOrderHeader {
  lines: SalesOrderLine[];
}

export interface CreateSalesOrderLineInput {
  itemCode: string;
  itemName: string | null;
  qty: number;
  unitPrice: number | null;
  discDtl: number;
  note: string | null;
}

export interface CreateSalesOrderInput {
  customerCode: string | null;
  customerName: string | null;
  currency: string;
  refNo: string | null;
  note: string | null;
  expireDate: string | null; // ISO date (yyyy-mm-dd)
  createdBy: string;
  lines: CreateSalesOrderLineInput[];
}

export interface ListSalesOrdersFilter {
  status?: SalesOrderStatus;
  customerCode?: string;
  limit: number;
}

export interface MarkConvertedInput {
  orderId: string;
  billId: string;
  billNo: string;
  convertedBy: string;
  idempotencyKey: string;
}

/** Reference data snapshotted at order-entry time (name + display price). */
export interface OrderItemSnapshot {
  itemName: string | null;
  unitPrice: number | null;
}

/**
 * SalesOrderRepository — persistence port for POST024 customer orders.
 * Orders live ONLY in MOTECH_POS (V021); the ERP master supplies name/price
 * snapshots read-only. Conversion posts a REAL bill via PostBillUseCase and
 * then freezes the order (guarded OPEN → CONVERTED flip).
 */
export interface SalesOrderRepository {
  /** Insert header + lines atomically (ORDER_NO from SEQ_SALES_ORDER_NO). */
  create(input: CreateSalesOrderInput): Promise<SalesOrderDetail>;
  findById(id: string): Promise<SalesOrderDetail | null>;
  /** Replay lookup: the order already converted with this Idempotency-Key. */
  findByConvertKey(key: string): Promise<SalesOrderDetail | null>;
  list(filter: ListSalesOrdersFilter): Promise<SalesOrderHeader[]>;
  /** Guarded OPEN → CONVERTED flip; returns null when no OPEN row matched. */
  markConverted(input: MarkConvertedInput): Promise<SalesOrderDetail | null>;
  /** Guarded OPEN → CANCELLED flip; returns null when no OPEN row matched. */
  cancel(id: string, cancelledBy: string): Promise<SalesOrderDetail | null>;
  /** True when the item exists in the ERP master or the local overlay. */
  itemExists(itemCode: string): Promise<boolean>;
  /** Arabic name + retail L1 price snapshot for display. */
  itemSnapshot(itemCode: string): Promise<OrderItemSnapshot>;
  /** Customer name from IAS_CASH_CUSTMR / overlay (null when unknown). */
  customerName(customerCode: string): Promise<string | null>;
}
