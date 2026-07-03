import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { InventoryService } from './application/inventory.service';
import { StockCountService } from './application/stock-count.service';
import { INVENTORY_REPOSITORY } from './domain/ports/inventory-repository.port';
import { STOCK_COUNT_REPOSITORY } from './domain/ports/stock-count.port';
import { OracleInventoryRepository } from './infrastructure/oracle-inventory.repository';
import { OracleStockCountRepository } from './infrastructure/oracle-stock-count.repository';
import { InventoryController } from './presentation/inventory.controller';
import { StockCountController } from './presentation/stock-count.controller';

@Module({
  imports: [AuthModule],
  // StockCountController FIRST — its static '/inventory/counts' routes must
  // register before InventoryController's catch-all '/inventory/:code'.
  controllers: [StockCountController, InventoryController],
  providers: [
    InventoryService,
    StockCountService,
    { provide: INVENTORY_REPOSITORY, useClass: OracleInventoryRepository },
    { provide: STOCK_COUNT_REPOSITORY, useClass: OracleStockCountRepository },
  ],
  exports: [InventoryService],
})
export class InventoryModule {}
