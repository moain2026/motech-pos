import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CatalogModule } from '../catalog/catalog.module';
import { EInvoiceModule } from '../einvoice/einvoice.module';
import { CatalogSyncScheduler } from './application/catalog-sync-scheduler.service';
import { SyncService } from './application/sync.service';
import { SYNC_REPOSITORY } from './domain/ports/sync-repository.port';
import { OracleSyncRepository } from './infrastructure/oracle-sync.repository';
import { SyncController } from './presentation/sync.controller';

/**
 * SyncModule — internal transfer/sync of bills to the center (المزامنة).
 * Depends on EInvoiceModule (global) to enforce the -20001 guard: a taxable
 * bill cannot be synced before its e-invoice is issued.
 */
@Module({
  imports: [AuthModule, EInvoiceModule, CatalogModule],
  controllers: [SyncController],
  providers: [
    SyncService,
    CatalogSyncScheduler,
    { provide: SYNC_REPOSITORY, useClass: OracleSyncRepository },
  ],
  exports: [SyncService],
})
export class SyncModule {}
