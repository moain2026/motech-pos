import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BillsModule } from '../bills/bills.module';
import { SalesOrderService } from './application/sales-order.service';
import { SALES_ORDER_REPOSITORY } from './domain/ports/sales-order.port';
import { OracleSalesOrderRepository } from './infrastructure/oracle-sales-order.repository';
import { SalesOrderController } from './presentation/sales-order.controller';

/**
 * SalesOrdersModule — POST024 طلبات العملاء. Orders live ONLY in MOTECH_POS
 * (V021); conversion posts a REAL bill through BillsModule's PostBillUseCase
 * (YSPOS23 twin write) — the module boundary keeps the bill pipeline single.
 */
@Module({
  imports: [AuthModule, BillsModule],
  controllers: [SalesOrderController],
  providers: [
    SalesOrderService,
    { provide: SALES_ORDER_REPOSITORY, useClass: OracleSalesOrderRepository },
  ],
})
export class SalesOrdersModule {}
