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
import { PermissionsGuard } from '../../auth/presentation/permissions.guard';
import { RequirePermission } from '../../auth/presentation/require-permission.decorator';
import { Roles } from '../../auth/presentation/roles.decorator';
import { RolesGuard } from '../../auth/presentation/roles.guard';
import { CatalogPullService } from '../../catalog/application/catalog-pull.service';
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

class CatalogCachedQuery {
  @IsOptional()
  @IsString()
  search?: string;

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
  constructor(
    private readonly sync: SyncService,
    private readonly pull: CatalogPullService,
  ) {}

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

  //==========================================================================
  // Downward sync (catalog pull) — POST008 المزامنة النزولية
  //==========================================================================

  @Get('catalog/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cashier', 'supervisor', 'admin')
  @ApiOperation({
    summary:
      'Downward catalog-cache status (total/active/stale + last pull run)',
  })
  async catalogStatus() {
    const data = await this.pull.status();
    return { data, meta: { running: this.pull.isRunning() } };
  }

  @Get('catalog/runs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cashier', 'supervisor', 'admin')
  @ApiOperation({ summary: 'Recent downward catalog-pull runs (newest first)' })
  async catalogRuns() {
    const data = await this.pull.listRuns(20);
    return { data, meta: { count: data.length } };
  }

  @Get('catalog/items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cashier', 'supervisor', 'admin')
  @ApiOperation({ summary: 'Cached catalog items (local snapshot from the ERP)' })
  async catalogItems(@Query() q: CatalogCachedQuery) {
    const data = await this.pull.listCached(q.search, q.limit ?? 100);
    return { data, meta: { count: data.length } };
  }

  @Post('catalog/pull')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('supervisor', 'admin')
  @RequirePermission('EINVOICE')
  @ApiOperation({
    summary:
      'Trigger a downward catalog pull now (items/prices ERP → local cache). Idempotent while running.',
  })
  async catalogPull() {
    const result = await this.pull.pull('manual');
    return { data: result, meta: { skipped: result.skipped ?? false } };
  }
}
