import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { InventoryService } from './application/inventory.service';
import { INVENTORY_REPOSITORY } from './domain/ports/inventory-repository.port';
import { OracleInventoryRepository } from './infrastructure/oracle-inventory.repository';
import { InventoryController } from './presentation/inventory.controller';

@Module({
  imports: [AuthModule],
  controllers: [InventoryController],
  providers: [
    InventoryService,
    { provide: INVENTORY_REPOSITORY, useClass: OracleInventoryRepository },
  ],
  exports: [InventoryService],
})
export class InventoryModule {}
