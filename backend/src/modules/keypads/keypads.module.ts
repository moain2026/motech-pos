import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CatalogModule } from '../catalog/catalog.module';
import { KeypadsService } from './application/keypads.service';
import { KEYPADS_REPOSITORY } from './domain/ports/keypads.port';
import { OracleKeypadsRepository } from './infrastructure/oracle-keypads.repository';
import { KeypadsController } from './presentation/keypads.controller';

/**
 * KeypadsModule — POSI002/POSI003 extra touch keypads + item keys.
 * MOTECH_POS.KEYPADS/KEYPAD_KEYS (V016) are authoritative; item validation
 * and name/price enrichment go through CatalogModule (read-only ERP).
 */
@Module({
  imports: [AuthModule, CatalogModule],
  controllers: [KeypadsController],
  providers: [
    KeypadsService,
    { provide: KEYPADS_REPOSITORY, useClass: OracleKeypadsRepository },
  ],
  exports: [KeypadsService],
})
export class KeypadsModule {}
