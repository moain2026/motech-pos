import { Global, Module } from '@nestjs/common';
import { OracleService } from './oracle.service';
import { OracleWriteService } from './oracle-write.service';

@Global()
@Module({
  providers: [OracleService, OracleWriteService],
  exports: [OracleService, OracleWriteService],
})
export class OracleModule {}
