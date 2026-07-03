import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CardsModule } from '../cards/cards.module';
import { ShiftsModule } from '../shifts/shifts.module';
import { AddPaymentUseCase } from './application/add-payment.usecase';
import { BillsService } from './application/bills.service';
import { HoldBillUseCase } from './application/hold-bill.usecase';
import { PostBillUseCase } from './application/post-bill.usecase';
import { BILL_REPOSITORY } from './domain/ports/bill-repository.port';
import { BILL_WRITE_REPOSITORY } from './domain/ports/bill-write-repository.port';
import { HELD_BILL_REPOSITORY } from './domain/ports/held-bill-repository.port';
import { ITEM_REFERENCE } from './domain/ports/item-reference.port';
import { OracleBillRepository } from './infrastructure/oracle-bill.repository';
import { OracleBillWriteRepository } from './infrastructure/oracle-bill-write.repository';
import { OracleHeldBillRepository } from './infrastructure/oracle-held-bill.repository';
import { OracleItemReferenceRepository } from './infrastructure/oracle-item-reference.repository';
import { BillsController } from './presentation/bills.controller';

@Module({
  imports: [AuthModule, CardsModule, ShiftsModule],
  controllers: [BillsController],
  providers: [
    BillsService,
    PostBillUseCase,
    AddPaymentUseCase,
    HoldBillUseCase,
    { provide: BILL_REPOSITORY, useClass: OracleBillRepository },
    { provide: BILL_WRITE_REPOSITORY, useClass: OracleBillWriteRepository },
    { provide: HELD_BILL_REPOSITORY, useClass: OracleHeldBillRepository },
    { provide: ITEM_REFERENCE, useClass: OracleItemReferenceRepository },
  ],
  exports: [BillsService],
})
export class BillsModule {}
