import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminService } from './application/admin.service';
import { ADMIN_REPOSITORY } from './domain/ports/admin-repository.port';
import { OracleAdminRepository } from './infrastructure/oracle-admin.repository';
import { AdminController } from './presentation/admin.controller';

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [
    AdminService,
    { provide: ADMIN_REPOSITORY, useClass: OracleAdminRepository },
  ],
  exports: [AdminService],
})
export class AdminModule {}
