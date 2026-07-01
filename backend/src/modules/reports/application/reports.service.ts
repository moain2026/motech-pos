import { Inject, Injectable } from '@nestjs/common';
import {
  DateRangeFilter,
  ReportsRepository,
  REPORTS_REPOSITORY,
} from '../domain/ports/reports-repository.port';

/**
 * ReportsService (application layer) — orchestrates the aggregate reads. No SQL
 * here; depends on the ReportsRepository port (Dependency Inversion).
 */
@Injectable()
export class ReportsService {
  constructor(
    @Inject(REPORTS_REPOSITORY) private readonly repo: ReportsRepository,
  ) {}

  daily(filter: DateRangeFilter) {
    return this.repo.daily(filter);
  }

  monthly(filter: DateRangeFilter) {
    return this.repo.monthly(filter);
  }

  byItem(filter: DateRangeFilter & { limit: number }) {
    return this.repo.byItem(filter);
  }

  byMachine(filter: DateRangeFilter) {
    return this.repo.byMachine(filter);
  }
}
