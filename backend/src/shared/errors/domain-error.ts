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
