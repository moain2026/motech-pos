import { Module } from '@nestjs/common';
import { ShiftsService } from './application/shifts.service';
import { SHIFT_REPOSITORY } from './domain/ports/shift-repository.port';
import { OracleShiftRepository } from './infrastructure/oracle-shift.repository';
import { ShiftsController } from './presentation/shifts.controller';

@Module({
  controllers: [ShiftsController],
  providers: [
    ShiftsService,
    { provide: SHIFT_REPOSITORY, useClass: OracleShiftRepository },
  ],
  exports: [ShiftsService],
})
export class ShiftsModule {}
