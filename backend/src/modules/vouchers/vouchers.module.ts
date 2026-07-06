import { Global, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ReturnsModule } from '../returns/returns.module';
import { ShiftsModule } from '../shifts/shifts.module';
import { VOUCHER_CASH_TOTALS } from '../shifts/domain/ports/voucher-cash-totals.port';
import { CreateVoucherUseCase } from './application/create-voucher.usecase';
import { RefundVoucherUseCase } from './application/refund-voucher.usecase';
import { VouchersService } from './application/vouchers.service';
import { VOUCHER_REPOSITORY } from './domain/ports/voucher-repository.port';
import { OracleVoucherRepository } from './infrastructure/oracle-voucher.repository';
import { VouchersController } from './presentation/vouchers.controller';

@Global()
@Module({
  imports: [AuthModule, ShiftsModule, ReturnsModule],
  controllers: [VouchersController],
  providers: [
    VouchersService,
    CreateVoucherUseCase,
    RefundVoucherUseCase,
    { provide: VOUCHER_REPOSITORY, useClass: OracleVoucherRepository },
    // Bind the shifts-side optional collaborator token to our service so the
    // shift-close reconciliation folds in cash receipts/expenses.
    { provide: VOUCHER_CASH_TOTALS, useExisting: VouchersService },
  ],
  exports: [VouchersService, VOUCHER_CASH_TOTALS],
})
export class VouchersModule {}
