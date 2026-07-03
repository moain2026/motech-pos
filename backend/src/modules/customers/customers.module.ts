import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { CreditCollectionsService } from './application/credit-collections.service';
import { CustomersService } from './application/customers.service';
import { CREDIT_COLLECTIONS_REPOSITORY } from './domain/ports/credit-collections.port';
import { CUSTOMER_OVERLAY_REPOSITORY } from './domain/ports/customer-overlay.port';
import { CUSTOMERS_REPOSITORY } from './domain/ports/customers-repository.port';
import { OracleCreditCollectionsRepository } from './infrastructure/oracle-credit-collections.repository';
import { OracleCustomerOverlayRepository } from './infrastructure/oracle-customer-overlay.repository';
import { OracleCustomersRepository } from './infrastructure/oracle-customers.repository';
import { CustomersController } from './presentation/customers.controller';

@Module({
  imports: [AuthModule, LoyaltyModule],
  controllers: [CustomersController],
  providers: [
    CustomersService,
    CreditCollectionsService,
    { provide: CUSTOMERS_REPOSITORY, useClass: OracleCustomersRepository },
    {
      provide: CUSTOMER_OVERLAY_REPOSITORY,
      useClass: OracleCustomerOverlayRepository,
    },
    {
      provide: CREDIT_COLLECTIONS_REPOSITORY,
      useClass: OracleCreditCollectionsRepository,
    },
  ],
  exports: [CustomersService],
})
export class CustomersModule {}
