/** DI token for the TransferRepository port. */
export const TRANSFER_REPOSITORY = Symbol('TRANSFER_REPOSITORY');

export type TransferStatus = 'OPEN' | 'CANCELLED';

/** One requested item inside a transfer request (POST019 detail). */
export interface TransferLine {
  lineId: string;
  itemCode: string;
  itemName: string | null; // Arabic name snapshot (IAS_ITM_MST)
  qty: number; // requested qty
  avlQty: number | null; // source-warehouse availability snapshot
  note: string | null;
}

/** Transfer request header (POST019 طلب صرف/تحويل مواد). */
export interface TransferHeader {
  id: string;
  reqNo: number; // human-friendly serial (SEQ_TRANSFER_NO)
  fromWarehouse: number; // المخزن المطلوب منه
  toWarehouse: number; // المخزن الطالب
  status: TransferStatus;
  reqSide: string | null; // جهة الطلب
  purpose: string | null; // الغرض من الطلب
  refNo: string | null; // رقم المرجع
  note: string | null;
  createdBy: string;
  createdAt: string;
  cancelledBy: string | null;
  cancelledAt: string | null;
  lineCount: number;
}

export interface TransferDetail extends TransferHeader {
  lines: TransferLine[];
}

export interface CreateTransferLineInput {
  itemCode: string;
  itemName: string | null;
  qty: number;
  avlQty: number | null;
  note: string | null;
}

export interface CreateTransferInput {
  fromWarehouse: number;
  toWarehouse: number;
  reqSide: string | null;
  purpose: string | null;
  refNo: string | null;
  note: string | null;
  createdBy: string;
  lines: CreateTransferLineInput[];
}

export interface ListTransfersFilter {
  status?: TransferStatus;
  warehouse?: number; // matches FROM or TO
  limit: number;
}

/**
 * TransferRepository — persistence port for POST019 transfer requests.
 * Requests live ONLY in MOTECH_POS (V018); warehouses + availability are read
 * live from YSPOS23 (read-only). No stock is reserved or mutated.
 */
export interface TransferRepository {
  /** Insert header + lines atomically (REQ_NO from SEQ_TRANSFER_NO). */
  create(input: CreateTransferInput): Promise<TransferDetail>;
  findById(id: string): Promise<TransferDetail | null>;
  list(filter: ListTransfersFilter): Promise<TransferHeader[]>;
  /** Guarded OPEN → CANCELLED flip; returns null when no OPEN row matched. */
  cancel(id: string, cancelledBy: string): Promise<TransferDetail | null>;
  /** True when the warehouse exists in YSPOS23.WAREHOUSE_DETAILS. */
  warehouseExists(wCode: number): Promise<boolean>;
  /** Source availability snapshot (MV_ITEM_AVL_QTY); null = item unknown there. */
  availableQty(itemCode: string, wCode: number): Promise<number | null>;
  /** Arabic item name from the ERP master (null when unknown). */
  itemName(itemCode: string): Promise<string | null>;
}
