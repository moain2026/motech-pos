import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { OracleModule } from './infrastructure/oracle/oracle.module';
import { AuthModule } from './modules/auth/auth.module';
import { BillsModule } from './modules/bills/bills.module';
import { CardsModule } from './modules/cards/cards.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { CustomersModule } from './modules/customers/customers.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ReturnsModule } from './modules/returns/returns.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ShiftsModule } from './modules/shifts/shifts.module';
import { VouchersModule } from './modules/vouchers/vouchers.module';

@Module({
  imports: [
    ConfigModule,
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        transport:
          process.env.NODE_ENV === 'production'
            ? undefined
            : { target: 'pino-pretty', options: { singleLine: true } },
        autoLogging: true,
        redact: ['req.headers.authorization', 'req.headers.cookie'],
      },
    }),
    OracleModule,
    HealthModule,
    AuthModule,
    CatalogModule,
    ShiftsModule,
    BillsModule,
    ReturnsModule,
    ReportsModule,
    CardsModule,
    CustomersModule,
    LoyaltyModule,
    VouchersModule,
    SettingsModule,
  ],
})
export class AppModule {}
