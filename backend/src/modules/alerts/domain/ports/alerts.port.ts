/** DI token for the AlertsRepository port. */
export const ALERTS_REPOSITORY = Symbol('ALERTS_REPOSITORY');

/** One login alert/note (POS_ALRT_SCR). */
export interface PosAlert {
  id: string;
  title: string;
  body: string | null;
  active: boolean;
  showFrom: string | null; // yyyy-mm-dd
  showUntil: string | null; // yyyy-mm-dd
  createdBy: string;
  createdAt: string;
}

export interface CreateAlertInput {
  title: string;
  body: string | null;
  showFrom: string | null;
  showUntil: string | null;
  createdBy: string;
}

export interface UpdateAlertInput {
  title?: string;
  body?: string | null;
  active?: boolean;
  showFrom?: string | null;
  showUntil?: string | null;
}

/**
 * AlertsRepository — POS_ALRT_SCR persistence (MOTECH_POS.POS_ALERTS +
 * POS_ALERT_ACKS, V026). Pending = active, within the show window, and not
 * yet acknowledged by the user.
 */
export interface AlertsRepository {
  create(input: CreateAlertInput): Promise<PosAlert>;
  update(id: string, input: UpdateAlertInput): Promise<PosAlert | null>;
  findById(id: string): Promise<PosAlert | null>;
  listAll(limit: number): Promise<PosAlert[]>;
  /** Alerts the user has not acknowledged yet (login popup source). */
  pendingFor(username: string, limit: number): Promise<PosAlert[]>;
  /** Idempotent acknowledge (UNIQUE alert+user). */
  acknowledge(alertId: string, username: string): Promise<void>;
}
