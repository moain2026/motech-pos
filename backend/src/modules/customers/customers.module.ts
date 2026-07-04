import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { CreditCollectionsService } from './application/credit-collections.service';
import { CustomerGroupsService } from './application/customer-groups.service';
import { CustomersService } from './application/customers.service';
import { CREDIT_COLLECTIONS_REPOSITORY } from './domain/ports/credit-collections.port';
import { CUSTOMER_GROUPS_REPOSITORY } from './domain/ports/customer-groups.port';
import { CUSTOMER_OVERLAY_REPOSITORY } from './domain/ports/customer-overlay.port';
import { CUSTOMERS_REPOSITORY } from './domain/ports/customers-repository.port';
import { OracleCreditCollectionsRepository } from './infrastructure/oracle-credit-collections.repository';
import { OracleCustomerGroupsRepository } from './infrastructure/oracle-customer-groups.repository';
import { OracleCustomerOverlayRepository } from './infrastructure/oracle-customer-overlay.repository';
import { OracleCustomersRepository } from './infrastructure/oracle-customers.repository';
import { CustomerGroupsController } from './presentation/customer-groups.controller';
import { CustomersController } from './presentation/customers.controller';

@Module({
  imports: [AuthModule, LoyaltyModule],
  controllers: [CustomersController, CustomerGroupsController],
  providers: [
    CustomersService,
    CreditCollectionsService,
    CustomerGroupsService,
    {
      provide: CUSTOMER_GROUPS_REPOSITORY,
      useClass: OracleCustomerGroupsRepository,
    },
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
