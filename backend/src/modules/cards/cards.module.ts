import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CardsService } from './application/cards.service';
import { PrepaidCardsService } from './application/prepaid-cards.service';
import { CARDS_REPOSITORY } from './domain/ports/cards-repository.port';
import { PREPAID_CARDS_REPOSITORY } from './domain/ports/prepaid-cards.port';
import { OracleCardsRepository } from './infrastructure/oracle-cards.repository';
import { OraclePrepaidCardsRepository } from './infrastructure/oracle-prepaid-cards.repository';
import { CardsController } from './presentation/cards.controller';
import { PrepaidCardsController } from './presentation/prepaid-cards.controller';

@Module({
  imports: [AuthModule],
  controllers: [CardsController, PrepaidCardsController],
  providers: [
    CardsService,
    PrepaidCardsService,
    { provide: CARDS_REPOSITORY, useClass: OracleCardsRepository },
    {
      provide: PREPAID_CARDS_REPOSITORY,
      useClass: OraclePrepaidCardsRepository,
    },
  ],
  exports: [CardsService, PrepaidCardsService],
})
export class CardsModule {}
