import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CatalogService } from './application/catalog.service';
import { ITEM_REPOSITORY } from './domain/ports/item-repository.port';
import { OracleItemRepository } from './infrastructure/oracle-item.repository';
import { CatalogController } from './presentation/catalog.controller';

@Module({
  imports: [AuthModule],
  controllers: [CatalogController],
  providers: [
    CatalogService,
    { provide: ITEM_REPOSITORY, useClass: OracleItemRepository },
  ],
  exports: [CatalogService],
})
export class CatalogModule {}
