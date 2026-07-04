/**
 * DomainError — base class for business-rule violations.
 * Mapped to RFC 9457 ProblemDetails by the global exception filter.
 * `type` slugs mirror the Onyx guards documented in docs/API_DESIGN.md §2.
 */
export abstract class DomainError extends Error {
  abstract readonly typeSlug: string;
  abstract readonly httpStatus: number;
  abstract readonly title: string;

  constructor(
    readonly detail: string,
    readonly meta?: Record<string, unknown>,
  ) {
    super(detail);
    this.name = this.constructor.name;
  }
}

export class NoOpenShiftError extends DomainError {
  readonly typeSlug = 'no-open-shift';
  readonly httpStatus = 409;
  readonly title = 'No open shift for cashier';
}

export class BillNotFoundError extends DomainError {
  readonly typeSlug = 'bill-not-found';
  readonly httpStatus = 404;
  readonly title = 'Bill not found';
}

export class BillNoRequiredOfflineError extends DomainError {
  readonly typeSlug = 'bill-no-required-offline';
  readonly httpStatus = 422;
  readonly title = 'BILL_NO is required for offline save';
}

export class InvalidBillError extends DomainError {
  readonly typeSlug = 'invalid-bill';
  readonly httpStatus = 422;
  readonly title = 'Invalid bill';
}

export class ItemNotFoundError extends DomainError {
  readonly typeSlug = 'item-not-found';
  readonly httpStatus = 404;
  readonly title = 'Item not found';
}

/**
 * A client-supplied unitPrice/vatPercent deviates from the server-side
 * reference price and the actor's role lacks the PRICE_OVERRIDE permission
 * (ROLE_PERMISSIONS matrix). Prices are ALWAYS resolved server-side; client
 * values are only honoured for explicitly authorized overrides.
 */
export class PriceOverrideForbiddenError extends DomainError {
  readonly typeSlug = 'price-override-forbidden';
  readonly httpStatus = 403;
  readonly title = 'Price override requires PRICE_OVERRIDE permission';
}

export class InvalidCredentialsError extends DomainError {
  readonly typeSlug = 'invalid-credentials';
  readonly httpStatus = 401;
  readonly title = 'Invalid username or password';
}

export class ShiftAlreadyOpenError extends DomainError {
  readonly typeSlug = 'shift-already-open';
  readonly httpStatus = 409;
  readonly title = 'Cashier already has an open shift';
}

export class ShiftNotFoundError extends DomainError {
  readonly typeSlug = 'shift-not-found';
  readonly httpStatus = 404;
  readonly title = 'Shift not found';
}

export class ShiftAlreadySettledError extends DomainError {
  readonly typeSlug = 'shift-already-settled';
  readonly httpStatus = 409;
  readonly title = 'Shift already settled';
}

export class ShiftNotClosedError extends DomainError {
  readonly typeSlug = 'shift-not-closed';
  readonly httpStatus = 409;
  readonly title = 'Shift must be closed before settlement';
}

export class ShiftCountRequiredError extends DomainError {
  readonly typeSlug = 'shift-count-required';
  readonly httpStatus = 409;
  readonly title = 'Counted denominations required before settlement';
}

export class ShiftAlreadyClosedError extends DomainError {
  readonly typeSlug = 'shift-already-closed';
  readonly httpStatus = 409;
  readonly title = 'Shift is already closed';
}

/**
 * Returned when the same Idempotency-Key is reused with a DIFFERENT request
 * body. Same key + same body returns the original result (not an error).
 */
export class IdempotencyConflictError extends DomainError {
  readonly typeSlug = 'idempotency-conflict';
  readonly httpStatus = 409;
  readonly title = 'Idempotency-Key reused with a different request';
}

export class IdempotencyKeyRequiredError extends DomainError {
  readonly typeSlug = 'idempotency-key-required';
  readonly httpStatus = 422;
  readonly title = 'Idempotency-Key header is required';
}

export class BillImmutableError extends DomainError {
  readonly typeSlug = 'bill-immutable';
  readonly httpStatus = 409;
  readonly title = 'Bill is immutable once posted';
}

/** The original bill referenced by a return does not exist. */
export class OriginalBillNotFoundError extends DomainError {
  readonly typeSlug = 'original-bill-not-found';
  readonly httpStatus = 404;
  readonly title = 'Original bill not found';
}

/** A return references an item that was not on the original bill. */
export class ItemNotOnOriginalBillError extends DomainError {
  readonly typeSlug = 'item-not-on-original-bill';
  readonly httpStatus = 422;
  readonly title = 'Item was not sold on the original bill';
}

/** Requested return qty exceeds the remaining (sold minus already returned) qty. */
export class ReturnQtyExceededError extends DomainError {
  readonly typeSlug = 'return-qty-exceeded';
  readonly httpStatus = 422;
  readonly title = 'Return quantity exceeds sold quantity';
}

export class ReturnNotFoundError extends DomainError {
  readonly typeSlug = 'return-not-found';
  readonly httpStatus = 404;
  readonly title = 'Return not found';
}

/** A held (hung) bill was not found. */
export class HeldBillNotFoundError extends DomainError {
  readonly typeSlug = 'held-bill-not-found';
  readonly httpStatus = 404;
  readonly title = 'Held bill not found';
}

/** A held bill was already resumed or cancelled (cannot resume again). */
export class HeldBillNotResumableError extends DomainError {
  readonly typeSlug = 'held-bill-not-resumable';
  readonly httpStatus = 409;
  readonly title = 'Held bill is not in a resumable state';
}

/** A payment would exceed the bill's outstanding balance. */
export class PaymentExceedsBalanceError extends DomainError {
  readonly typeSlug = 'payment-exceeds-balance';
  readonly httpStatus = 422;
  readonly title = 'Payment exceeds the outstanding bill balance';
}

/** Customer's loyalty points balance cannot cover a POINTS payment. */
export class InsufficientPointsError extends DomainError {
  readonly typeSlug = 'insufficient-points';
  readonly httpStatus = 422;
  readonly title = 'Insufficient loyalty points balance';
}

/** Coupon not found (or not valid) in IAS_CPN_MST. */
export class CouponNotFoundError extends DomainError {
  readonly typeSlug = 'coupon-not-found';
  readonly httpStatus = 422;
  readonly title = 'Coupon not found';
}

/** A cash voucher (receipt/expense) was not found. */
export class VoucherNotFoundError extends DomainError {
  readonly typeSlug = 'voucher-not-found';
  readonly httpStatus = 404;
  readonly title = 'Voucher not found';
}

/** Invalid voucher payload (bad amount/type/etc). */
export class InvalidVoucherError extends DomainError {
  readonly typeSlug = 'invalid-voucher';
  readonly httpStatus = 422;
  readonly title = 'Invalid voucher';
}

/** A customer/item overlay record was not found. */
export class OverlayNotFoundError extends DomainError {
  readonly typeSlug = 'overlay-not-found';
  readonly httpStatus = 404;
  readonly title = 'Record not found';
}

/** Invalid overlay payload (customer/item local edit). */
export class InvalidOverlayError extends DomainError {
  readonly typeSlug = 'invalid-overlay';
  readonly httpStatus = 422;
  readonly title = 'Invalid record';
}

/** Attempt to create an overlay that already exists (duplicate local code). */
export class OverlayConflictError extends DomainError {
  readonly typeSlug = 'overlay-conflict';
  readonly httpStatus = 409;
  readonly title = 'Record already exists';
}

/** An e-invoice was requested for a bill that does not exist in MOTECH_POS. */
export class EInvoiceBillNotFoundError extends DomainError {
  readonly typeSlug = 'einvoice-bill-not-found';
  readonly httpStatus = 404;
  readonly title = 'Bill not found for e-invoice';
}

/** No generated e-invoice was found for the requested bill. */
export class EInvoiceNotFoundError extends DomainError {
  readonly typeSlug = 'einvoice-not-found';
  readonly httpStatus = 404;
  readonly title = 'E-invoice not found';
}

/**
 * The critical -20001 guard: an internal sync/transfer to the center was
 * attempted while taxable bills still have no issued e-invoice. Mirrors
 * MOV_BILLS_PRC RAISE_APPLICATION_ERROR(-20001,'There are tax bills not Sync...').
 */
export class TaxBillsNotSyncedError extends DomainError {
  readonly typeSlug = 'tax-bills-not-synced';
  readonly httpStatus = 409;
  readonly title = 'There are tax bills not synced to the tax authority';
}

/** A bill was requested for sync but does not exist in MOTECH_POS. */
export class SyncBillNotFoundError extends DomainError {
  readonly typeSlug = 'sync-bill-not-found';
  readonly httpStatus = 404;
  readonly title = 'Bill not found for sync';
}

/** The requested credit (آجل) bill does not exist / has no CREDIT debt. */
export class CreditBillNotFoundError extends DomainError {
  readonly typeSlug = 'credit-bill-not-found';
  readonly httpStatus = 404;
  readonly title = 'Credit bill not found for customer';
}

/** A collection receipt would exceed the remaining credit debt. */
export class CollectionExceedsDebtError extends DomainError {
  readonly typeSlug = 'collection-exceeds-debt';
  readonly httpStatus = 422;
  readonly title = 'Collection exceeds outstanding credit debt';
}

/** Invalid collection input (amount/rate/method). */
export class InvalidCollectionError extends DomainError {
  readonly typeSlug = 'invalid-collection';
  readonly httpStatus = 422;
  readonly title = 'Invalid collection';
}

/** The requested stock-count session does not exist. */
export class StockCountNotFoundError extends DomainError {
  readonly typeSlug = 'stock-count-not-found';
  readonly httpStatus = 404;
  readonly title = 'Stock count not found';
}

/** Mutation attempted on a POSTED (approved, immutable) stock count. */
export class StockCountPostedError extends DomainError {
  readonly typeSlug = 'stock-count-posted';
  readonly httpStatus = 409;
  readonly title = 'Stock count already posted';
}

/** Posting a stock count that has no counted lines yet. */
export class StockCountEmptyError extends DomainError {
  readonly typeSlug = 'stock-count-empty';
  readonly httpStatus = 422;
  readonly title = 'Stock count has no lines';
}

/** POSS004: the new password equals the current one. */
export class PasswordReuseError extends DomainError {
  readonly typeSlug = 'password-reuse';
  readonly httpStatus = 422;
  readonly title = 'New password must differ from the current password';
}

/** POST023: the referenced sale bill does not exist in YSPOS23. */
export class PrescriptionBillNotFoundError extends DomainError {
  readonly typeSlug = 'prescription-bill-not-found';
  readonly httpStatus = 404;
  readonly title = 'Sale bill not found for prescription';
}

/** POST023: the requested prescription does not exist. */
export class PrescriptionNotFoundError extends DomainError {
  readonly typeSlug = 'prescription-not-found';
  readonly httpStatus = 404;
  readonly title = 'Prescription not found';
}

/** POST023: a prescription line references an item not on the linked bill. */
export class PrescriptionItemNotOnBillError extends DomainError {
  readonly typeSlug = 'prescription-item-not-on-bill';
  readonly httpStatus = 422;
  readonly title = 'Item is not on the linked sale bill';
}

/** POST019: the requested transfer request does not exist. */
export class TransferNotFoundError extends DomainError {
  readonly typeSlug = 'transfer-not-found';
  readonly httpStatus = 404;
  readonly title = 'Transfer request not found';
}

/** POST019: source and destination warehouses must differ. */
export class TransferSameWarehouseError extends DomainError {
  readonly typeSlug = 'transfer-same-warehouse';
  readonly httpStatus = 422;
  readonly title = 'Source and destination warehouses must differ';
}

/** POST019: an unknown warehouse code was supplied. */
export class TransferWarehouseNotFoundError extends DomainError {
  readonly typeSlug = 'transfer-warehouse-not-found';
  readonly httpStatus = 404;
  readonly title = 'Warehouse not found';
}

/** POST019: invalid state transition (e.g. cancel a non-OPEN request). */
export class TransferStateError extends DomainError {
  readonly typeSlug = 'transfer-invalid-state';
  readonly httpStatus = 409;
  readonly title = 'Invalid transfer request state for this action';
}

/** POSI007/POSI200: a redemption exceeds the card's remaining balance. */
export class InsufficientCardBalanceError extends DomainError {
  readonly typeSlug = 'insufficient-card-balance';
  readonly httpStatus = 422;
  readonly title = 'Insufficient prepaid card balance';
}

/** POST024: the sales order id is unknown. */
export class SalesOrderNotFoundError extends DomainError {
  readonly typeSlug = 'sales-order-not-found';
  readonly httpStatus = 404;
  readonly title = 'Sales order not found';
}

/** POST024: invalid state transition (convert/cancel a non-OPEN order). */
export class SalesOrderStateError extends DomainError {
  readonly typeSlug = 'sales-order-invalid-state';
  readonly httpStatus = 409;
  readonly title = 'Invalid sales order state for this action';
}

/** POST029: the stock receipt id is unknown. */
export class StockReceiptNotFoundError extends DomainError {
  readonly typeSlug = 'stock-receipt-not-found';
  readonly httpStatus = 404;
  readonly title = 'Stock receipt not found';
}

/** POST029: invalid state transition (post/cancel a non-DRAFT receipt). */
export class StockReceiptStateError extends DomainError {
  readonly typeSlug = 'stock-receipt-invalid-state';
  readonly httpStatus = 409;
  readonly title = 'Invalid stock receipt state for this action';
}

/** POST029: a receipt without lines cannot be posted. */
export class StockReceiptEmptyError extends DomainError {
  readonly typeSlug = 'stock-receipt-empty';
  readonly httpStatus = 422;
  readonly title = 'Stock receipt has no lines to post';
}

/** POS_ALRT_SCR: the alert id is unknown. */
export class AlertNotFoundError extends DomainError {
  readonly typeSlug = 'alert-not-found';
  readonly httpStatus = 404;
  readonly title = 'Alert not found';
}

/** POST028: dispatching more than the source warehouse has available. */
export class InsufficientStockError extends DomainError {
  readonly typeSlug = 'insufficient-stock';
  readonly httpStatus = 422;
  readonly title = 'Insufficient available stock at the source warehouse';
}
