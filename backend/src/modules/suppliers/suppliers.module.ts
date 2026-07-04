import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SuppliersService } from './application/suppliers.service';
import {
  SUPPLIERS_OVERLAY_REPOSITORY,
  SUPPLIERS_REPOSITORY,
} from './domain/ports/suppliers-repository.port';
import { OracleSuppliersOverlayRepository } from './infrastructure/oracle-suppliers-overlay.repository';
import { OracleSuppliersRepository } from './infrastructure/oracle-suppliers.repository';
import { SuppliersController } from './presentation/suppliers.controller';

/**
 * SuppliersModule — POSI001/POSI002 supplier master data.
 * Reads: IAS202623.V_DETAILS (live ERP, read-only).
 * Writes: MOTECH_POS.SUPPLIERS_OVERLAY only (overlay pattern).
 */
@Module({
  imports: [AuthModule],
  controllers: [SuppliersController],
  providers: [
    SuppliersService,
    { provide: SUPPLIERS_REPOSITORY, useClass: OracleSuppliersRepository },
    {
      provide: SUPPLIERS_OVERLAY_REPOSITORY,
      useClass: OracleSuppliersOverlayRepository,
    },
  ],
  exports: [SuppliersService],
})
export class SuppliersModule {}
