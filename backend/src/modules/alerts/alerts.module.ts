import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AlertsService } from './application/alerts.service';
import { ALERTS_REPOSITORY } from './domain/ports/alerts.port';
import { OracleAlertsRepository } from './infrastructure/oracle-alerts.repository';
import { AlertsController } from './presentation/alerts.controller';

/**
 * AlertsModule — POS_ALRT_SCR تنبيهات الدخول. Admin-managed notes shown to
 * each user once at sign-in (acknowledge = never shown again). Tables in
 * MOTECH_POS (V026).
 */
@Module({
  imports: [AuthModule],
  controllers: [AlertsController],
  providers: [
    AlertsService,
    { provide: ALERTS_REPOSITORY, useClass: OracleAlertsRepository },
  ],
})
export class AlertsModule {}
