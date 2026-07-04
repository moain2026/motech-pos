import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { OracleModule } from './infrastructure/oracle/oracle.module';
import { AdminModule } from './modules/admin/admin.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { AuthModule } from './modules/auth/auth.module';
import { BillsModule } from './modules/bills/bills.module';
import { CardsModule } from './modules/cards/cards.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { CustomersModule } from './modules/customers/customers.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { EInvoiceModule } from './modules/einvoice/einvoice.module';
import { KeypadsModule } from './modules/keypads/keypads.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { MasterDataModule } from './modules/master-data/master-data.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ReturnCountsModule } from './modules/return-counts/return-counts.module';
import { ReturnsModule } from './modules/returns/returns.module';
import { SalesOrdersModule } from './modules/sales-orders/sales-orders.module';
import { SettingsModule } from './modules/settings/settings.module';
import { StockReceivingModule } from './modules/stock-receiving/stock-receiving.module';
import { ShiftsModule } from './modules/shifts/shifts.module';
import { SyncModule } from './modules/sync/sync.module';
import { TransfersModule } from './modules/transfers/transfers.module';
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
    AlertsModule,
    CatalogModule,
    ShiftsModule,
    BillsModule,
    ReturnsModule,
    ReportsModule,
    CardsModule,
    CustomersModule,
    InventoryModule,
    AdminModule,
    KeypadsModule,
    LoyaltyModule,
    MasterDataModule,
    SuppliersModule,
    PrescriptionsModule,
    VouchersModule,
    ReturnCountsModule,
    SalesOrdersModule,
    SettingsModule,
    StockReceivingModule,
    TransfersModule,
    EInvoiceModule,
    SyncModule,
  ],
})
export class AppModule {}
