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
