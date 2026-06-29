import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OracleWriteService } from '../infrastructure/oracle/oracle-write.service';
import { OracleService } from '../infrastructure/oracle/oracle.service';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(
    private readonly oracle: OracleService,
    private readonly write: OracleWriteService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Liveness + Oracle connectivity (read + write DBs)' })
  async health() {
    let readOk = false;
    let writeOk = false;
    let error: string | undefined;
    try {
      readOk = await this.oracle.ping();
    } catch (e) {
      error = e instanceof Error ? e.message : 'unknown';
    }
    try {
      writeOk = await this.write.ping();
    } catch (e) {
      error = error ?? (e instanceof Error ? e.message : 'unknown');
    }
    const ok = readOk && writeOk;
    return {
      status: ok ? 'ok' : 'degraded',
      db: {
        read: readOk ? 'connected' : 'down',
        write: writeOk ? 'connected' : 'down',
      },
      schema: { read: this.oracle.schema(), write: this.write.schema() },
      ...(error ? { error } : {}),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe (read + write DBs)' })
  async ready() {
    const readOk = await this.oracle.ping().catch(() => false);
    const writeOk = await this.write.ping().catch(() => false);
    return { ready: readOk && writeOk };
  }
}
