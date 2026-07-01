import { Global, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LoyaltyService } from './application/loyalty.service';
import { LOYALTY_REPOSITORY } from './domain/ports/loyalty-repository.port';
import { OracleLoyaltyRepository } from './infrastructure/oracle-loyalty.repository';
import { LoyaltyController } from './presentation/loyalty.controller';

/**
 * LoyaltyModule — points earning/history (POST020/POST021). Global so the
 * bills use-case can consume LoyaltyService to earn on sale without a hard
 * module coupling / circular import.
 */
@Global()
@Module({
  imports: [AuthModule],
  controllers: [LoyaltyController],
  providers: [
    LoyaltyService,
    { provide: LOYALTY_REPOSITORY, useClass: OracleLoyaltyRepository },
  ],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
