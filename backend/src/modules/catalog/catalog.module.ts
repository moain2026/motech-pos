import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CatalogService } from './application/catalog.service';
import { ITEM_OVERLAY_REPOSITORY } from './domain/ports/item-overlay.port';
import { ITEM_REPOSITORY } from './domain/ports/item-repository.port';
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
  ],
  exports: [CatalogService],
})
export class CatalogModule {}
