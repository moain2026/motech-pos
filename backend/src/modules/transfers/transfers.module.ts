import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TransferService } from './application/transfer.service';
import { TRANSFER_REPOSITORY } from './domain/ports/transfer.port';
import { OracleTransferRepository } from './infrastructure/oracle-transfer.repository';
import { TransferController } from './presentation/transfer.controller';

/**
 * TransfersModule — POST019 طلب صرف/تحويل مواد. Transfer requests live ONLY
 * in MOTECH_POS (V018); warehouses + availability validated live against
 * read-only YSPOS23. ERP forwarding/approval belongs to the sync layer.
 */
@Module({
  imports: [AuthModule],
  controllers: [TransferController],
  providers: [
    TransferService,
    { provide: TRANSFER_REPOSITORY, useClass: OracleTransferRepository },
  ],
})
export class TransfersModule {}
