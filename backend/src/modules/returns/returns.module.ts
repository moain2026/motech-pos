import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ShiftsModule } from '../shifts/shifts.module';
import { CreateReturnUseCase } from './application/create-return.usecase';
import { ReturnsService } from './application/returns.service';
import { ORIGINAL_BILL_REFERENCE } from './domain/ports/original-bill.port';
import { RETURN_REPOSITORY } from './domain/ports/return-repository.port';
import { RETURN_WRITE_REPOSITORY } from './domain/ports/return-write-repository.port';
import { OracleOriginalBillRepository } from './infrastructure/oracle-original-bill.repository';
import { OracleReturnRepository } from './infrastructure/oracle-return.repository';
import { OracleReturnWriteRepository } from './infrastructure/oracle-return-write.repository';
import { ReturnsController } from './presentation/returns.controller';

@Module({
  imports: [AuthModule, ShiftsModule],
  controllers: [ReturnsController],
  providers: [
    ReturnsService,
    CreateReturnUseCase,
    { provide: RETURN_REPOSITORY, useClass: OracleReturnRepository },
    { provide: RETURN_WRITE_REPOSITORY, useClass: OracleReturnWriteRepository },
    { provide: ORIGINAL_BILL_REFERENCE, useClass: OracleOriginalBillRepository },
  ],
  exports: [ReturnsService],
})
export class ReturnsModule {}
