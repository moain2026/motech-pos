import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { StockIssueService } from './application/stock-issue.service';
import { StockReceiptService } from './application/stock-receipt.service';
import { STOCK_ISSUE_REPOSITORY } from './domain/ports/stock-issue.port';
import { STOCK_RECEIPT_REPOSITORY } from './domain/ports/stock-receipt.port';
import { OracleStockIssueRepository } from './infrastructure/oracle-stock-issue.repository';
import { OracleStockReceiptRepository } from './infrastructure/oracle-stock-receipt.repository';
import { StockIssueController } from './presentation/stock-issue.controller';
import { StockReceiptController } from './presentation/stock-receipt.controller';

/**
 * StockReceivingModule — POST029 الاستلام المخزني + POST028 التحويل المخزني.
 * Documents live in MOTECH_POS (V022/V025); approval writes the REAL stock
 * effect into IAS202623.ITEM_MOVEMENT (DOC_TYPE=8 in / 7 out, V023 grants)
 * and refreshes MV_ITEM_AVL_QTY — quantities move for real, with an
 * availability guard on outgoing issues.
 */
@Module({
  imports: [AuthModule],
  controllers: [StockReceiptController, StockIssueController],
  providers: [
    StockReceiptService,
    StockIssueService,
    { provide: STOCK_RECEIPT_REPOSITORY, useClass: OracleStockReceiptRepository },
    { provide: STOCK_ISSUE_REPOSITORY, useClass: OracleStockIssueRepository },
  ],
})
export class StockReceivingModule {}
