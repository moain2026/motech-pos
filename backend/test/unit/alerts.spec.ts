import { describe, expect, it } from 'vitest';
import { AlertsService } from '../../src/modules/alerts/application/alerts.service';
import {
  AlertsRepository,
  CreateAlertInput,
  PosAlert,
  UpdateAlertInput,
} from '../../src/modules/alerts/domain/ports/alerts.port';
import { AlertNotFoundError } from '../../src/shared/errors/domain-error';

class FakeRepo implements AlertsRepository {
  store = new Map<string, PosAlert>();
  acks = new Set<string>(); // `${alert}@${user}`
  private seq = 0;

  create(input: CreateAlertInput): Promise<PosAlert> {
    const id = `al-${++this.seq}`;
    const a: PosAlert = {
      id,
      title: input.title,
      body: input.body,
      active: true,
      showFrom: input.showFrom,
      showUntil: input.showUntil,
      createdBy: input.createdBy,
      createdAt: new Date().toISOString(),
    };
    this.store.set(id, a);
    return Promise.resolve(a);
  }

  update(id: string, input: UpdateAlertInput): Promise<PosAlert | null> {
    const a = this.store.get(id);
    if (!a) return Promise.resolve(null);
    if (input.title !== undefined) a.title = input.title;
    if (input.body !== undefined) a.body = input.body ?? null;
    if (input.active !== undefined) a.active = input.active;
    return Promise.resolve(a);
  }

  findById(id: string): Promise<PosAlert | null> {
    return Promise.resolve(this.store.get(id) ?? null);
  }

  listAll(limit: number): Promise<PosAlert[]> {
    return Promise.resolve([...this.store.values()].slice(0, limit));
  }

  pendingFor(username: string, limit: number): Promise<PosAlert[]> {
    return Promise.resolve(
      [...this.store.values()]
        .filter((a) => a.active && !this.acks.has(`${a.id}@${username}`))
        .slice(0, limit),
    );
  }

  acknowledge(alertId: string, username: string): Promise<void> {
    this.acks.add(`${alertId}@${username}`);
    return Promise.resolve();
  }
}

function makeSvc() {
  const repo = new FakeRepo();
  return { repo, svc: new AlertsService(repo) };
}

describe('AlertsService (POS_ALRT_SCR)', () => {
  it('creates alerts; pending until acknowledged; ack is per-user', async () => {
    const { svc } = makeSvc();
    const a = await svc.create({
      title: 'صيانة',
      body: null,
      showFrom: null,
      showUntil: null,
      createdBy: 'admin',
    });
    expect(await svc.pendingFor('cashier1', 10)).toHaveLength(1);
    await svc.acknowledge(a.id, 'cashier1');
    expect(await svc.pendingFor('cashier1', 10)).toHaveLength(0);
    expect(await svc.pendingFor('cashier2', 10)).toHaveLength(1); // other user
    await svc.acknowledge(a.id, 'cashier1'); // idempotent
  });

  it('deactivating hides the alert; 404 on unknown ids', async () => {
    const { svc } = makeSvc();
    const a = await svc.create({
      title: 'تنبيه',
      body: 'نص',
      showFrom: null,
      showUntil: null,
      createdBy: 'admin',
    });
    await svc.update(a.id, { active: false });
    expect(await svc.pendingFor('u', 10)).toHaveLength(0);
    await expect(svc.update('missing', { title: 'x' })).rejects.toBeInstanceOf(
      AlertNotFoundError,
    );
    await expect(svc.acknowledge('missing', 'u')).rejects.toBeInstanceOf(
      AlertNotFoundError,
    );
  });
});
