import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { CustomersService } from './application/customers.service';
import { CUSTOMER_OVERLAY_REPOSITORY } from './domain/ports/customer-overlay.port';
import { CUSTOMERS_REPOSITORY } from './domain/ports/customers-repository.port';
import { OracleCustomerOverlayRepository } from './infrastructure/oracle-customer-overlay.repository';
import { OracleCustomersRepository } from './infrastructure/oracle-customers.repository';
import { CustomersController } from './presentation/customers.controller';

@Module({
  imports: [AuthModule, LoyaltyModule],
  controllers: [CustomersController],
  providers: [
    CustomersService,
    { provide: CUSTOMERS_REPOSITORY, useClass: OracleCustomersRepository },
    {
      provide: CUSTOMER_OVERLAY_REPOSITORY,
      useClass: OracleCustomerOverlayRepository,
    },
  ],
  exports: [CustomersService],
})
export class CustomersModule {}
