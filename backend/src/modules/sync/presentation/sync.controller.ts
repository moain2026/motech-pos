import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/presentation/jwt-auth.guard';
import { Roles } from '../../auth/presentation/roles.decorator';
import { RolesGuard } from '../../auth/presentation/roles.guard';
import { SyncService } from '../application/sync.service';

class EnqueueSyncDto {
  @IsString()
  billId!: string;
}

class SyncQueueQuery {
  @IsOptional()
  @IsIn(['pending', 'synced', 'failed'])
  status?: 'pending' | 'synced' | 'failed';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 100;
}

class SyncRunDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 100;
}

/**
 * SyncController — manage the internal-transfer queue to the center
 * (المزامنة). The transfer is SIMULATED (no live-Onyx write). Enqueue is
 * idempotent per bill. Processing enforces the -20001 guard (no sync of a
 * taxable bill before its e-invoice is issued).
 */
@ApiTags('sync')
@ApiBearerAuth()
@Controller('sync')
export class SyncController {
  constructor(private readonly sync: SyncService) {}

  @Get('status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cashier', 'supervisor', 'admin')
  @ApiOperation({ summary: 'Sync queue status (pending/synced/failed counts)' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async status() {
    const data = await this.sync.status();
    return { data };
  }

  @Get('queue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cashier', 'supervisor', 'admin')
  @ApiOperation({ summary: 'List sync queue entries (optionally by status)' })
  async queue(@Query() q: SyncQueueQuery) {
    const items = await this.sync.queue(q.status, q.limit ?? 100);
    return { data: items, meta: { count: items.length } };
  }

  @Post('enqueue')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cashier', 'supervisor', 'admin')
  @ApiOperation({ summary: 'Enqueue a bill for sync to the center (idempotent per bill)' })
  async enqueue(@Body() body: EnqueueSyncDto) {
    const { entry, replayed } = await this.sync.enqueue(body.billId);
    return { data: entry, meta: { replayed } };
  }

  @Post('run')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('supervisor', 'admin')
  @ApiOperation({
    summary:
      'Process the pending sync queue (simulated transfer; enforces the -20001 e-invoice guard)',
  })
  async run(@Body() body: SyncRunDto) {
    const result = await this.sync.run(body.limit ?? 100);
    return {
      data: result.entries,
      meta: {
        processed: result.processed,
        synced: result.synced,
        blocked: result.blocked,
        counts: result.counts,
      },
    };
  }
}
