import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { TypedConfigService } from '../../../config/config.module';
import { CatalogPullService } from '../../catalog/application/catalog-pull.service';

const JOB_NAME = 'catalog-downward-sync';

/**
 * CatalogSyncScheduler — the automatic scheduling of the downward catalog pull
 * (POST008). Registers a cron job (expression from CATALOG_SYNC_CRON, default
 * every 30 min) that calls CatalogPullService.pull('scheduled'). In-process
 * via @nestjs/schedule — no Redis/BullMQ broker required for this VM.
 *
 * The job is skipped automatically when a pull is already running (the pull
 * service holds a single in-flight guard), so a slow pull never overlaps the
 * next tick. Disabled entirely when CATALOG_SYNC_ENABLED=false.
 */
@Injectable()
export class CatalogSyncScheduler implements OnModuleInit {
  private readonly logger = new Logger(CatalogSyncScheduler.name);

  constructor(
    private readonly pull: CatalogPullService,
    private readonly config: TypedConfigService,
    private readonly registry: SchedulerRegistry,
  ) {}

  onModuleInit(): void {
    const enabled = this.config.get('CATALOG_SYNC_ENABLED');
    if (!enabled) {
      this.logger.log('Catalog downward sync scheduler DISABLED (config)');
      return;
    }
    const cron = this.config.get('CATALOG_SYNC_CRON');
    try {
      const job = new CronJob(cron, () => {
        void this.tick();
      });
      this.registry.addCronJob(JOB_NAME, job as unknown as CronJob);
      job.start();
      this.logger.log(`Catalog downward sync scheduled: "${cron}"`);
    } catch (err) {
      this.logger.error(
        `Failed to schedule catalog sync ("${cron}"): ${String(err)}`,
      );
    }
  }

  private async tick(): Promise<void> {
    try {
      const r = await this.pull.pull('scheduled');
      if (r.skipped) return;
      this.logger.log(
        `Scheduled catalog pull: ${r.upserted} upserted, ${r.staled} stale (${r.durationMs}ms)`,
      );
    } catch (err) {
      // Never throw out of a cron tick — the run row already records the error.
      this.logger.error(`Scheduled catalog pull error: ${String(err)}`);
    }
  }
}
