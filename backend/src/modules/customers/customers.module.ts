import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CustomersService } from './application/customers.service';
import { CUSTOMERS_REPOSITORY } from './domain/ports/customers-repository.port';
import { OracleCustomersRepository } from './infrastructure/oracle-customers.repository';
import { CustomersController } from './presentation/customers.controller';

@Module({
  imports: [AuthModule],
  controllers: [CustomersController],
  providers: [
    CustomersService,
    { provide: CUSTOMERS_REPOSITORY, useClass: OracleCustomersRepository },
  ],
  exports: [CustomersService],
})
export class CustomersModule {}
