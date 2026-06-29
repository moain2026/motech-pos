import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OracleService } from '../infrastructure/oracle/oracle.service';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(private readonly oracle: OracleService) {}

  @Get('health')
  @ApiOperation({ summary: 'Liveness + Oracle connectivity (SELECT 1 FROM DUAL)' })
  async health() {
    let dbConnected = false;
    let error: string | undefined;
    try {
      dbConnected = await this.oracle.ping();
    } catch (e) {
      error = e instanceof Error ? e.message : 'unknown';
    }
    return {
      status: dbConnected ? 'ok' : 'degraded',
      db: dbConnected ? 'connected' : 'down',
      schema: this.oracle.schema(),
      ...(error ? { error } : {}),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  async ready() {
    const ok = await this.oracle.ping().catch(() => false);
    return { ready: ok };
  }
}
