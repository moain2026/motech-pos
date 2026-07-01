import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ReportsService } from './application/reports.service';
import { POS_REPORTS_REPOSITORY } from './domain/ports/pos-reports-repository.port';
import { REPORTS_REPOSITORY } from './domain/ports/reports-repository.port';
import { OraclePosReportsRepository } from './infrastructure/oracle-pos-reports.repository';
import { OracleReportsRepository } from './infrastructure/oracle-reports.repository';
import { ReportsController } from './presentation/reports.controller';

@Module({
  imports: [AuthModule],
  controllers: [ReportsController],
  providers: [
    ReportsService,
    { provide: REPORTS_REPOSITORY, useClass: OracleReportsRepository },
    { provide: POS_REPORTS_REPOSITORY, useClass: OraclePosReportsRepository },
  ],
  exports: [ReportsService],
})
export class ReportsModule {}
