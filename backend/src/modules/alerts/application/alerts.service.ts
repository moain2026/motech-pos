import { Inject, Injectable } from '@nestjs/common';
import { AlertNotFoundError } from '../../../shared/errors/domain-error';
import {
  AlertsRepository,
  ALERTS_REPOSITORY,
  CreateAlertInput,
  PosAlert,
  UpdateAlertInput,
} from '../domain/ports/alerts.port';

/**
 * AlertsService — POS_ALRT_SCR (تنبيهات الدخول): admin creates notes; each
 * user sees pending (unacknowledged, active, in-window) alerts at sign-in and
 * acknowledges them once (idempotent).
 */
@Injectable()
export class AlertsService {
  constructor(
    @Inject(ALERTS_REPOSITORY) private readonly repo: AlertsRepository,
  ) {}

  create(input: CreateAlertInput): Promise<PosAlert> {
    return this.repo.create(input);
  }

  async update(id: string, input: UpdateAlertInput): Promise<PosAlert> {
    const updated = await this.repo.update(id, input);
    if (!updated) {
      throw new AlertNotFoundError(`Alert ${id} not found`, { id });
    }
    return updated;
  }

  listAll(limit: number): Promise<PosAlert[]> {
    return this.repo.listAll(limit);
  }

  pendingFor(username: string, limit: number): Promise<PosAlert[]> {
    return this.repo.pendingFor(username, limit);
  }

  async acknowledge(alertId: string, username: string): Promise<void> {
    const alert = await this.repo.findById(alertId);
    if (!alert) {
      throw new AlertNotFoundError(`Alert ${alertId} not found`, {
        id: alertId,
      });
    }
    await this.repo.acknowledge(alertId, username);
  }
}
