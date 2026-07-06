import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminService } from './application/admin.service';
import { AdminWriteService } from './application/admin-write.service';
import { BackupService } from './application/backup.service';
import { BackupScheduler } from './application/backup-scheduler.service';
import { ADMIN_REPOSITORY } from './domain/ports/admin-repository.port';
import { ADMIN_WRITE_REPOSITORY } from './domain/ports/admin-write-repository.port';
import { BACKUP_REPOSITORY } from './domain/ports/backup-repository.port';
import { OracleAdminRepository } from './infrastructure/oracle-admin.repository';
import { OracleAdminWriteRepository } from './infrastructure/oracle-admin-write.repository';
import { OracleBackupRepository } from './infrastructure/oracle-backup.repository';
import { AdminController } from './presentation/admin.controller';

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [
    AdminService,
    AdminWriteService,
    BackupService,
    BackupScheduler,
    { provide: ADMIN_REPOSITORY, useClass: OracleAdminRepository },
    { provide: ADMIN_WRITE_REPOSITORY, useClass: OracleAdminWriteRepository },
    { provide: BACKUP_REPOSITORY, useClass: OracleBackupRepository },
  ],
  exports: [AdminService, AdminWriteService, BackupService],
})
export class AdminModule {}
