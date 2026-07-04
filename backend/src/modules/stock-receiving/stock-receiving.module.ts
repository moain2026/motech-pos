import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { StockReceiptService } from './application/stock-receipt.service';
import { STOCK_RECEIPT_REPOSITORY } from './domain/ports/stock-receipt.port';
import { OracleStockReceiptRepository } from './infrastructure/oracle-stock-receipt.repository';
import { StockReceiptController } from './presentation/stock-receipt.controller';

/**
 * StockReceivingModule — POST029 الاستلام المخزني. Receipt documents live in
 * MOTECH_POS (V022); approval writes the REAL stock effect into
 * IAS202623.ITEM_MOVEMENT (DOC_TYPE=8, V023 grants) and refreshes
 * MV_ITEM_AVL_QTY — received quantities become immediately available.
 */
@Module({
  imports: [AuthModule],
  controllers: [StockReceiptController],
  providers: [
    StockReceiptService,
    { provide: STOCK_RECEIPT_REPOSITORY, useClass: OracleStockReceiptRepository },
  ],
})
export class StockReceivingModule {}
