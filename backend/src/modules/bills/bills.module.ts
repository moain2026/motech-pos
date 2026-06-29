import { Module } from '@nestjs/common';
import { BillsService } from './application/bills.service';
import { BILL_REPOSITORY } from './domain/ports/bill-repository.port';
import { OracleBillRepository } from './infrastructure/oracle-bill.repository';
import { BillsController } from './presentation/bills.controller';

@Module({
  controllers: [BillsController],
  providers: [
    BillsService,
    { provide: BILL_REPOSITORY, useClass: OracleBillRepository },
  ],
  exports: [BillsService],
})
export class BillsModule {}
