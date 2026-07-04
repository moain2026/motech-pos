import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ReturnCountService } from './application/return-count.service';
import { RETURN_COUNT_REPOSITORY } from './domain/ports/return-count.port';
import { OracleReturnCountRepository } from './infrastructure/oracle-return-count.repository';
import { ReturnCountController } from './presentation/return-count.controller';

/**
 * ReturnCountsModule — POST022 جرد أصناف مردود المبيعات. Sessions live in
 * MOTECH_POS (V026); the system side reads the REAL return tables
 * (YSPOS23.IAS_POS_RT_BILL_MST/DTL) live. Variance/audit only — no stock
 * mutation.
 */
@Module({
  imports: [AuthModule],
  controllers: [ReturnCountController],
  providers: [
    ReturnCountService,
    { provide: RETURN_COUNT_REPOSITORY, useClass: OracleReturnCountRepository },
  ],
})
export class ReturnCountsModule {}
