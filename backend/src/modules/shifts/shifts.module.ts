import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ShiftsService } from './application/shifts.service';
import {
  SHIFT_REPOSITORY,
  SHIFT_WRITE_REPOSITORY,
} from './domain/ports/shift-repository.port';
import { OracleShiftRepository } from './infrastructure/oracle-shift.repository';
import { OracleShiftWriteRepository } from './infrastructure/oracle-shift-write.repository';
import { ShiftsController } from './presentation/shifts.controller';

@Module({
  imports: [AuthModule],
  controllers: [ShiftsController],
  providers: [
    ShiftsService,
    { provide: SHIFT_REPOSITORY, useClass: OracleShiftRepository },
    { provide: SHIFT_WRITE_REPOSITORY, useClass: OracleShiftWriteRepository },
  ],
  exports: [ShiftsService],
})
export class ShiftsModule {}
