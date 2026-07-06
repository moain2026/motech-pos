import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PosConfigService } from './application/pos-config.service';
import { SettingsService } from './application/settings.service';
import { POS_CONFIG_REPOSITORY } from './domain/ports/pos-config.port';
import { SETTINGS_REPOSITORY } from './domain/ports/settings-repository.port';
import { OraclePosConfigRepository } from './infrastructure/oracle-pos-config.repository';
import { OracleSettingsRepository } from './infrastructure/oracle-settings.repository';
import { PosConfigController } from './presentation/pos-config.controller';
import { SettingsController } from './presentation/settings.controller';

/**
 * SettingsModule — POS system settings (POSS001 / IAS_PARA_POS). Reads live
 * YSPOS23 settings (read-only) and stores admin overrides in a local
 * MOTECH_POS overlay. OracleService + OracleWriteService come from the global
 * OracleModule; AuthModule provides the JWT/RBAC guards.
 */
@Module({
  imports: [AuthModule],
  controllers: [SettingsController, PosConfigController],
  providers: [
    SettingsService,
    PosConfigService,
    { provide: SETTINGS_REPOSITORY, useClass: OracleSettingsRepository },
    { provide: POS_CONFIG_REPOSITORY, useClass: OraclePosConfigRepository },
  ],
  exports: [SettingsService, PosConfigService],
})
export class SettingsModule {}
