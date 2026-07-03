import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminService } from './application/admin.service';
import { AdminWriteService } from './application/admin-write.service';
import { ADMIN_REPOSITORY } from './domain/ports/admin-repository.port';
import { ADMIN_WRITE_REPOSITORY } from './domain/ports/admin-write-repository.port';
import { OracleAdminRepository } from './infrastructure/oracle-admin.repository';
import { OracleAdminWriteRepository } from './infrastructure/oracle-admin-write.repository';
import { AdminController } from './presentation/admin.controller';

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [
    AdminService,
    AdminWriteService,
    { provide: ADMIN_REPOSITORY, useClass: OracleAdminRepository },
    { provide: ADMIN_WRITE_REPOSITORY, useClass: OracleAdminWriteRepository },
  ],
  exports: [AdminService, AdminWriteService],
})
export class AdminModule {}
