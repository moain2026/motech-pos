import { Inject, Injectable } from '@nestjs/common';
import { NoOpenShiftError } from '../../../shared/errors/domain-error';
import {
  ShiftRepository,
  SHIFT_REPOSITORY,
} from '../domain/ports/shift-repository.port';

@Injectable()
export class ShiftsService {
  constructor(
    @Inject(SHIFT_REPOSITORY) private readonly repo: ShiftRepository,
  ) {}

  /** Current open shift for a cashier; 409 if none (selling precondition). */
  async current(cshrNo: number) {
    const shift = await this.repo.findOpenByCashier(cshrNo);
    if (!shift) {
      throw new NoOpenShiftError(
        `Cashier ${cshrNo} has no open work shift; open a shift before selling`,
        { cshrNo },
      );
    }
    return shift;
  }
}
