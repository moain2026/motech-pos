import { Inject, Injectable } from '@nestjs/common';
import {
  AdminRepository,
  ADMIN_REPOSITORY,
  SessionsFilter,
} from '../domain/ports/admin-repository.port';

/**
 * AdminService (application layer) — orchestrates read access to POS machines,
 * system users and login history. No SQL here; depends on the AdminRepository
 * port (Dependency Inversion). Admin-only via RBAC at the controller.
 */
@Injectable()
export class AdminService {
  constructor(
    @Inject(ADMIN_REPOSITORY) private readonly repo: AdminRepository,
  ) {}

  /** POS cashier machines with their status. */
  listMachines() {
    return this.repo.listMachines();
  }

  /** System users (Arabic names, status flags). */
  listUsers() {
    return this.repo.listUsers();
  }

  /** Login/logout history (most recent first). */
  listSessions(filter: SessionsFilter) {
    return this.repo.listSessions(filter);
  }
}
