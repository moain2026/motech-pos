import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrescriptionService } from './application/prescription.service';
import { PRESCRIPTION_REPOSITORY } from './domain/ports/prescription.port';
import { OraclePrescriptionRepository } from './infrastructure/oracle-prescription.repository';
import { PrescriptionController } from './presentation/prescription.controller';

/**
 * PrescriptionsModule — POST023 الوصفة الطبية (pharmacy sector). Links a
 * medical prescription to an existing sale bill; data lives ONLY in
 * MOTECH_POS (V017), the bill is validated live against read-only YSPOS23.
 */
@Module({
  imports: [AuthModule],
  controllers: [PrescriptionController],
  providers: [
    PrescriptionService,
    { provide: PRESCRIPTION_REPOSITORY, useClass: OraclePrescriptionRepository },
  ],
})
export class PrescriptionsModule {}
