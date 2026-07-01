import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CardsService } from './application/cards.service';
import { CARDS_REPOSITORY } from './domain/ports/cards-repository.port';
import { OracleCardsRepository } from './infrastructure/oracle-cards.repository';
import { CardsController } from './presentation/cards.controller';

@Module({
  imports: [AuthModule],
  controllers: [CardsController],
  providers: [
    CardsService,
    { provide: CARDS_REPOSITORY, useClass: OracleCardsRepository },
  ],
  exports: [CardsService],
})
export class CardsModule {}
