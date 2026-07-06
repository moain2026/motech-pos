import { Global, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PromotionsService } from './application/promotions.service';
import { PROMOTIONS_REPOSITORY } from './domain/ports/promotions-repository.port';
import { OraclePromotionsRepository } from './infrastructure/oracle-promotions.repository';
import { PromotionsController } from './presentation/promotions.controller';

/**
 * PromotionsModule — POST001 promotion engine (GNR_QTN_PRM_PKG). Global so the
 * bills use-case can consume PromotionsService if it later applies promos
 * server-side at post time, without a hard module coupling.
 */
@Global()
@Module({
  imports: [AuthModule],
  controllers: [PromotionsController],
  providers: [
    PromotionsService,
    { provide: PROMOTIONS_REPOSITORY, useClass: OraclePromotionsRepository },
  ],
  exports: [PromotionsService],
})
export class PromotionsModule {}
