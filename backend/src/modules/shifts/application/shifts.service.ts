import { Inject, Injectable } from '@nestjs/common';
import {
  NoOpenShiftError,
  ShiftNotFoundError,
} from '../../../shared/errors/domain-error';
import {
  CloseShiftInput,
  OpenShiftInput,
  ShiftRecord,
  ShiftRepository,
  ShiftWriteRepository,
  SHIFT_REPOSITORY,
  SHIFT_WRITE_REPOSITORY,
} from '../domain/ports/shift-repository.port';

@Injectable()
export class ShiftsService {
  constructor(
    @Inject(SHIFT_REPOSITORY) private readonly legacy: ShiftRepository,
    @Inject(SHIFT_WRITE_REPOSITORY)
    private readonly repo: ShiftWriteRepository,
  ) {}

  /**
   * Current open shift for a cashier (our DB first; selling precondition).
   * 409 if none. This is what the bills use-case relies on.
   */
  async current(cashierNo: number): Promise<ShiftRecord> {
    const shift = await this.repo.findOpenByCashier(cashierNo);
    if (!shift) {
      throw new NoOpenShiftError(
        `Cashier ${cashierNo} has no open work shift; open a shift before selling`,
        { cashierNo },
      );
    }
    return shift;
  }

  /** Legacy YSPOS23 open-shift lookup (reference / migration aid). */
  legacyCurrent(cashierNo: number) {
    return this.legacy.findOpenByCashier(cashierNo);
  }

  /** Open a new shift in MOTECH_POS (409 if one is already open). */
  open(input: OpenShiftInput): Promise<ShiftRecord> {
    return this.repo.open(input);
  }

  /** Close a shift (computes expected cash + difference). */
  close(input: CloseShiftInput): Promise<ShiftRecord> {
    return this.repo.close(input);
  }

  /** X/Z-style summary: shift record + cash totals. */
  async summary(shiftId: string) {
    const shift = await this.repo.findById(shiftId);
    if (!shift) {
      throw new ShiftNotFoundError(`Shift ${shiftId} not found`, { shiftId });
    }
    const totals = await this.repo.cashTotals(shiftId);
    return { shift, totals };
  }
}
