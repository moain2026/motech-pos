import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ReportsService } from './application/reports.service';
import { REPORTS_REPOSITORY } from './domain/ports/reports-repository.port';
import { OracleReportsRepository } from './infrastructure/oracle-reports.repository';
import { ReportsController } from './presentation/reports.controller';

@Module({
  imports: [AuthModule],
  controllers: [ReportsController],
  providers: [
    ReportsService,
    { provide: REPORTS_REPOSITORY, useClass: OracleReportsRepository },
  ],
  exports: [ReportsService],
})
export class ReportsModule {}
