import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CatalogService } from './application/catalog.service';
import { ITEM_BARCODES_REPOSITORY } from './domain/ports/item-barcodes.port';
import { ITEM_OVERLAY_REPOSITORY } from './domain/ports/item-overlay.port';
import { ITEM_REPOSITORY } from './domain/ports/item-repository.port';
import { OracleItemBarcodesRepository } from './infrastructure/oracle-item-barcodes.repository';
import { OracleItemOverlayRepository } from './infrastructure/oracle-item-overlay.repository';
import { OracleItemRepository } from './infrastructure/oracle-item.repository';
import {
  CatalogController,
  CategoriesController,
} from './presentation/catalog.controller';

@Module({
  imports: [AuthModule],
  controllers: [CatalogController, CategoriesController],
  providers: [
    CatalogService,
    { provide: ITEM_REPOSITORY, useClass: OracleItemRepository },
    { provide: ITEM_OVERLAY_REPOSITORY, useClass: OracleItemOverlayRepository },
    {
      provide: ITEM_BARCODES_REPOSITORY,
      useClass: OracleItemBarcodesRepository,
    },
  ],
  exports: [CatalogService],
})
export class CatalogModule {}
