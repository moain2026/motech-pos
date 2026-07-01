import { Global, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EInvoiceService } from './application/einvoice.service';
import { EINVOICE_REPOSITORY } from './domain/ports/einvoice-repository.port';
import { OracleEInvoiceRepository } from './infrastructure/oracle-einvoice.repository';
import { EInvoiceController } from './presentation/einvoice.controller';

/**
 * EInvoiceModule — electronic invoicing (الفوترة الإلكترونية). Global so the
 * SyncModule can consume EInvoiceService to enforce the -20001 guard (no
 * internal sync before the e-invoice is issued) without a circular import.
 */
@Global()
@Module({
  imports: [AuthModule],
  controllers: [EInvoiceController],
  providers: [
    EInvoiceService,
    { provide: EINVOICE_REPOSITORY, useClass: OracleEInvoiceRepository },
  ],
  exports: [EInvoiceService],
})
export class EInvoiceModule {}
