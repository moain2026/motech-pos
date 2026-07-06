import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CatalogService } from './application/catalog.service';
import { CatalogPullService } from './application/catalog-pull.service';
import { CATALOG_CACHE_REPOSITORY } from './domain/ports/catalog-cache.port';
import { ITEM_BARCODES_REPOSITORY } from './domain/ports/item-barcodes.port';
import { ITEM_OVERLAY_REPOSITORY } from './domain/ports/item-overlay.port';
import { ITEM_REPOSITORY } from './domain/ports/item-repository.port';
import { OracleCatalogCacheRepository } from './infrastructure/oracle-catalog-cache.repository';
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
    CatalogPullService,
    { provide: ITEM_REPOSITORY, useClass: OracleItemRepository },
    { provide: ITEM_OVERLAY_REPOSITORY, useClass: OracleItemOverlayRepository },
    {
      provide: ITEM_BARCODES_REPOSITORY,
      useClass: OracleItemBarcodesRepository,
    },
    {
      provide: CATALOG_CACHE_REPOSITORY,
      useClass: OracleCatalogCacheRepository,
    },
  ],
  exports: [CatalogService, CatalogPullService],
})
export class CatalogModule {}
