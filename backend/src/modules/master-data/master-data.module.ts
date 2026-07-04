import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MasterDataService } from './application/master-data.service';
import {
  MASTER_DATA_OVERLAY_REPOSITORY,
  MASTER_DATA_REPOSITORY,
} from './domain/ports/master-data.port';
import { OracleMasterDataOverlayRepository } from './infrastructure/oracle-master-data-overlay.repository';
import { OracleMasterDataRepository } from './infrastructure/oracle-master-data.repository';
import { MasterDataController } from './presentation/master-data.controller';

/**
 * MasterDataModule — POSI003/004/005/011 master data:
 * warehouses, item groups, units of measure, currencies + POS rates.
 * Reads: live ERP (read-only). Writes: MOTECH_POS overlays only (V016).
 */
@Module({
  imports: [AuthModule],
  controllers: [MasterDataController],
  providers: [
    MasterDataService,
    { provide: MASTER_DATA_REPOSITORY, useClass: OracleMasterDataRepository },
    {
      provide: MASTER_DATA_OVERLAY_REPOSITORY,
      useClass: OracleMasterDataOverlayRepository,
    },
  ],
  exports: [MasterDataService],
})
export class MasterDataModule {}
