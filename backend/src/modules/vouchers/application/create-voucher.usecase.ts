import { Inject, Injectable, Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';
import {
  IdempotencyConflictError,
  InvalidVoucherError,
} from '../../../shared/errors/domain-error';
import { ShiftsService } from '../../shifts/application/shifts.service';
import {
  Voucher,
  VoucherMethod,
  VoucherType,
} from '../domain/entities/voucher.entity';
import {
  PersistedVoucher,
  VoucherIdempotencyUniqueViolation,
  VoucherRepository,
  VOUCHER_REPOSITORY,
} from '../domain/ports/voucher-repository.port';

export interface CreateVoucherInput {
  idempotencyKey: string;
  type: VoucherType;
  cashierNo: number;
  machineNo?: number;
  amount: number;
  currency?: string;
  rate?: number;
  paymentMethod?: VoucherMethod;
  description?: string;
  partyName?: string;
  category?: string;
  clientOperationId?: string;
}

/**
 * CreateVoucherUseCase — write-side core for cash vouchers (POST025/POST026,
 * analogue of PKG_POS_RCPTS_EXPNS_API_PKG.INSRT_RCPTS / INSRT_EXPNS).
 *
 * Pipeline (guarded by Idempotency-Key):
 *   1. Validate amount > 0.
 *   2. Idempotency replay: same key + same body → same voucher; different
 *      body → 409 idempotency-conflict.
 *   3. Selling precondition: cashier MUST have an OPEN shift (vouchers attach
 *      to the drawer of the current shift) — else 409 no-open-shift.
 *   4. Compute AMOUNT_IN_SHIFT via the Voucher aggregate (amount × rate).
 *   5. Persist into MOTECH_POS (idempotency UNIQUE = anti-dup backstop).
 */
@Injectable()
export class CreateVoucherUseCase {
  private readonly logger = new Logger(CreateVoucherUseCase.name);

  constructor(
    @Inject(VOUCHER_REPOSITORY) private readonly repo: VoucherRepository,
    private readonly shifts: ShiftsService,
  ) {}

  async execute(
    input: CreateVoucherInput,
  ): Promise<{ voucher: PersistedVoucher; replayed: boolean }> {
    if (!(input.amount > 0)) {
      throw new InvalidVoucherError('Voucher amount must be greater than zero', {
        amount: input.amount,
      });
    }
    const rate = input.rate ?? 1;
    if (!(rate > 0)) {
      throw new InvalidVoucherError('Voucher rate must be greater than zero', {
        rate,
      });
    }

    const requestHash = this.hashRequest(input);

    // (1) Idempotency replay.
    const existing = await this.repo.findByIdempotencyKey(input.idempotencyKey);
    if (existing) {
      if (existing.clientOpId && existing.clientOpId !== requestHash) {
        throw new IdempotencyConflictError(
          'Idempotency-Key was used with a different request body',
          { idempotencyKey: input.idempotencyKey },
        );
      }
      return { voucher: existing, replayed: true };
    }

    // (2) Selling precondition: open shift (throws 409 if none).
    const shift = await this.shifts.current(input.cashierNo);
    const currency = input.currency ?? shift.currency ?? 'YER';

    // (3) Compute amount-in-shift via the aggregate.
    const voucher = new Voucher({
      type: input.type,
      amount: input.amount,
      rate,
      method: input.paymentMethod ?? VoucherMethod.CASH,
    });
    const amountInShift = voucher.amountInShift().toNumber();

    // (4) Persist atomically; race → replay via idempotency key.
    try {
      const persisted = await this.repo.insertVoucher({
        type: input.type,
        shiftId: shift.id,
        cashierNo: input.cashierNo,
        machineNo: input.machineNo ?? shift.machineNo ?? null,
        amount: input.amount,
        currency,
        rate,
        amountInShift,
        paymentMethod: input.paymentMethod ?? VoucherMethod.CASH,
        description: input.description ?? null,
        partyName: input.partyName ?? null,
        category: input.category ?? null,
        idempotencyKey: input.idempotencyKey,
        clientOpId: requestHash,
      });
      return { voucher: persisted, replayed: false };
    } catch (err) {
      if (err instanceof VoucherIdempotencyUniqueViolation) {
        const winner = await this.repo.findByIdempotencyKey(
          input.idempotencyKey,
        );
        if (winner) {
          this.logger.warn(
            { idempotencyKey: input.idempotencyKey },
            'Voucher idempotency race resolved to existing document',
          );
          return { voucher: winner, replayed: true };
        }
      }
      throw err;
    }
  }

  /** Stable hash of the value-affecting request fields (idempotency body check). */
  private hashRequest(input: CreateVoucherInput): string {
    const canonical = JSON.stringify({
      type: input.type,
      cashierNo: input.cashierNo,
      machineNo: input.machineNo ?? null,
      amount: input.amount,
      currency: input.currency ?? null,
      rate: input.rate ?? 1,
      paymentMethod: input.paymentMethod ?? VoucherMethod.CASH,
      description: input.description ?? null,
      partyName: input.partyName ?? null,
      category: input.category ?? null,
    });
    return createHash('sha256').update(canonical).digest('hex').slice(0, 36);
  }
}
