import { Inject, Injectable, Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';
import {
  RefundNotPayableError,
  ReturnNotFoundError,
} from '../../../shared/errors/domain-error';
import { ReturnsService } from '../../returns/application/returns.service';
import { VoucherMethod, VoucherType } from '../domain/entities/voucher.entity';
import { Voucher } from '../domain/entities/voucher.entity';
import {
  PersistedVoucher,
  RefundReturnUniqueViolation,
  VoucherRepository,
  VOUCHER_REPOSITORY,
} from '../domain/ports/voucher-repository.port';

export interface RefundVoucherInput {
  /** The MOTECH_POS return (UUID) to refund. */
  returnId: string;
  /** Cashier issuing the refund (drawer owner). */
  cashierNo: number;
  machineNo?: number;
  /** Optional free-text note appended to the description. */
  note?: string;
}

/**
 * RefundVoucherUseCase (POST006 — الدفع النقدي للمرتجعات).
 *
 * Turns a MOTECH_POS sales return into a cash-out EXPENSE voucher whose
 * CATEGORY='REFUND' and REFUND_RETURN_ID = the return id. Money leaves the
 * drawer (an EXPENSE), so it flows straight into the shift-close cash
 * reconciliation exactly like any other cash expense.
 *
 * Idempotency is enforced at TWO levels so one return can never produce more
 * than one voucher:
 *   1. Application: if a refund voucher already exists for the return, return
 *      it (replayed=true) — no second insert is attempted.
 *   2. Database: UX_VOUCHERS_REFUND_RET UNIQUE index on REFUND_RETURN_ID is the
 *      race backstop (a concurrent second request resolves to the winner).
 */
@Injectable()
export class RefundVoucherUseCase {
  private readonly logger = new Logger(RefundVoucherUseCase.name);

  constructor(
    @Inject(VOUCHER_REPOSITORY) private readonly repo: VoucherRepository,
    private readonly returns: ReturnsService,
  ) {}

  async execute(
    input: RefundVoucherInput,
  ): Promise<{ voucher: PersistedVoucher; replayed: boolean }> {
    // (1) Idempotency (app level): one voucher per return.
    const existing = await this.repo.findByRefundReturnId(input.returnId);
    if (existing) {
      return { voucher: existing, replayed: true };
    }

    // (2) Load the return (must be one of OURS in MOTECH_POS — UUID id).
    const result = await this.returns.getById(input.returnId);
    if (result.source !== 'MOTECH_POS') {
      // Legacy YSPOS23 RT bills are historical and already settled in Onyx;
      // we only issue refund vouchers for returns we created.
      throw new ReturnNotFoundError(
        `Return ${input.returnId} is not a MOTECH_POS return; cannot issue a refund voucher`,
        { returnId: input.returnId },
      );
    }
    const ret = result.data as {
      id: string;
      rtBillNo: string;
      originalBillNo: string;
      shiftId: string | null;
      machineNo: number | null;
      currency: string;
      refundAmt: number;
    };

    const refundAmt = round4(Number(ret.refundAmt ?? 0));
    if (!(refundAmt > 0)) {
      throw new RefundNotPayableError(
        `Return ${input.returnId} has no positive refund amount (${refundAmt})`,
        { returnId: input.returnId, refundAmt },
      );
    }

    // (3) Compute amount-in-shift via the aggregate (CASH, rate 1 in currency).
    const voucher = new Voucher({
      type: VoucherType.EXPENSE,
      amount: refundAmt,
      rate: 1,
      method: VoucherMethod.CASH,
    });
    const amountInShift = voucher.amountInShift().toNumber();

    const description = [
      `استرداد مرتجع ${ret.rtBillNo} (فاتورة ${ret.originalBillNo})`,
      input.note,
    ]
      .filter(Boolean)
      .join(' — ');

    // A deterministic idempotency key so replays never collide with other
    // vouchers: refund:<returnId>.
    const idempotencyKey = `refund:${input.returnId}`;
    const requestHash = createHash('sha256')
      .update(`refund|${input.returnId}|${refundAmt}`)
      .digest('hex')
      .slice(0, 36);

    try {
      const persisted = await this.repo.insertVoucher({
        type: 'EXPENSE',
        shiftId: ret.shiftId,
        cashierNo: input.cashierNo,
        machineNo: input.machineNo ?? ret.machineNo ?? null,
        amount: refundAmt,
        currency: ret.currency ?? 'YER',
        rate: 1,
        amountInShift,
        paymentMethod: 'CASH',
        description,
        partyName: null,
        category: 'REFUND',
        idempotencyKey,
        clientOpId: requestHash,
        refundReturnId: input.returnId,
      });
      return { voucher: persisted, replayed: false };
    } catch (err) {
      // DB backstop: a concurrent request already created the refund voucher.
      if (err instanceof RefundReturnUniqueViolation) {
        const winner = await this.repo.findByRefundReturnId(input.returnId);
        if (winner) {
          this.logger.warn(
            { returnId: input.returnId },
            'Refund voucher race resolved to existing document',
          );
          return { voucher: winner, replayed: true };
        }
      }
      throw err;
    }
  }
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
