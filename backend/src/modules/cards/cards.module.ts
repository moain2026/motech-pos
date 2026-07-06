import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CardsService } from './application/cards.service';
import { PosCardsService } from './application/pos-cards.service';
import { PrepaidCardsService } from './application/prepaid-cards.service';
import { CARDS_REPOSITORY } from './domain/ports/cards-repository.port';
import { POS_CARDS_REPOSITORY } from './domain/ports/pos-cards.port';
import { PREPAID_CARDS_REPOSITORY } from './domain/ports/prepaid-cards.port';
import { OracleCardsRepository } from './infrastructure/oracle-cards.repository';
import { OraclePosCardsRepository } from './infrastructure/oracle-pos-cards.repository';
import { OraclePrepaidCardsRepository } from './infrastructure/oracle-prepaid-cards.repository';
import { CardsController } from './presentation/cards.controller';
import { PosCardsController } from './presentation/pos-cards.controller';
import { PrepaidCardsController } from './presentation/prepaid-cards.controller';

@Module({
  imports: [AuthModule],
  controllers: [CardsController, PosCardsController, PrepaidCardsController],
  providers: [
    CardsService,
    PosCardsService,
    PrepaidCardsService,
    { provide: CARDS_REPOSITORY, useClass: OracleCardsRepository },
    { provide: POS_CARDS_REPOSITORY, useClass: OraclePosCardsRepository },
    {
      provide: PREPAID_CARDS_REPOSITORY,
      useClass: OraclePrepaidCardsRepository,
    },
  ],
  exports: [CardsService, PosCardsService, PrepaidCardsService],
})
export class CardsModule {}
