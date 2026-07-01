import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SettingsService } from './application/settings.service';
import { SETTINGS_REPOSITORY } from './domain/ports/settings-repository.port';
import { OracleSettingsRepository } from './infrastructure/oracle-settings.repository';
import { SettingsController } from './presentation/settings.controller';

/**
 * SettingsModule — POS system settings (POSS001 / IAS_PARA_POS). Reads live
 * YSPOS23 settings (read-only) and stores admin overrides in a local
 * MOTECH_POS overlay. OracleService + OracleWriteService come from the global
 * OracleModule; AuthModule provides the JWT/RBAC guards.
 */
@Module({
  imports: [AuthModule],
  controllers: [SettingsController],
  providers: [
    SettingsService,
    { provide: SETTINGS_REPOSITORY, useClass: OracleSettingsRepository },
  ],
  exports: [SettingsService],
})
export class SettingsModule {}
