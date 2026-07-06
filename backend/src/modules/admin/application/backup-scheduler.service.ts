import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { TypedConfigService } from '../../../config/config.module';
import { BackupService } from './backup.service';

const JOB_NAME = 'motech-data-backup';

/**
 * BackupScheduler — POSS003 automatic scheduled backup. Registers a cron job
 * (BACKUP_CRON, default daily 02:00) that calls BackupService.runBackup
 * ('SCHEDULED'). In-process via @nestjs/schedule — no external broker needed
 * on this VM (same pattern as the catalog downward-sync scheduler).
 *
 * Disabled by default (BACKUP_SCHEDULE_ENABLED=false); the manual "backup now"
 * endpoint always works regardless. When a backup is already running the tick
 * is skipped by the service's in-flight guard, so ticks never overlap.
 */
@Injectable()
export class BackupScheduler implements OnModuleInit {
  private readonly logger = new Logger(BackupScheduler.name);

  constructor(
    private readonly backup: BackupService,
    private readonly config: TypedConfigService,
    private readonly registry: SchedulerRegistry,
  ) {}

  onModuleInit(): void {
    const enabled = this.config.get('BACKUP_SCHEDULE_ENABLED');
    if (!enabled) {
      this.logger.log('Scheduled data backup DISABLED (config)');
      return;
    }
    const cron = this.config.get('BACKUP_CRON');
    try {
      const job = new CronJob(cron, () => {
        void this.tick();
      });
      this.registry.addCronJob(JOB_NAME, job as unknown as CronJob);
      job.start();
      this.logger.log(`Scheduled data backup enabled: "${cron}"`);
    } catch (err) {
      this.logger.error(
        `Failed to schedule data backup ("${cron}"): ${String(err)}`,
      );
    }
  }

  private async tick(): Promise<void> {
    try {
      const r = await this.backup.runBackup('SCHEDULED', null);
      if (r.skipped) return;
      this.logger.log(
        `Scheduled backup #${r.run.backupNo}: ${r.run.rowCount} rows, ${r.run.tableCount} tables`,
      );
    } catch (err) {
      // Never throw out of a cron tick — the run row already records the error.
      this.logger.error(`Scheduled backup error: ${String(err)}`);
    }
  }
}
