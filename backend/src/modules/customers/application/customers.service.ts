import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CustomerRow,
  CustomersRepository,
  CUSTOMERS_REPOSITORY,
  PointsBalance,
  PointsTxnRow,
} from '../domain/ports/customers-repository.port';

/**
 * CustomersService (application layer) — orchestrates the read-only customer
 * lookups. No SQL here; depends on the CustomersRepository port (Dependency
 * Inversion). A missing customer surfaces as a 404 (RFC 9457 ProblemDetails).
 */
@Injectable()
export class CustomersService {
  constructor(
    @Inject(CUSTOMERS_REPOSITORY) private readonly repo: CustomersRepository,
  ) {}

  search(filter: { search?: string; limit: number }): Promise<CustomerRow[]> {
    return this.repo.search(filter);
  }

  async findByCode(code: string): Promise<CustomerRow> {
    const customer = await this.repo.findByCode(code);
    if (!customer) {
      throw new NotFoundException(`Customer '${code}' not found`);
    }
    return customer;
  }

  async points(
    code: string,
    limit: number,
  ): Promise<{ balance: PointsBalance; txns: PointsTxnRow[] }> {
    // Ensure the customer exists first (404 otherwise).
    await this.findByCode(code);
    const [balance, txns] = await Promise.all([
      this.repo.pointsBalance(code),
      this.repo.pointsTxns(code, limit),
    ]);
    return { balance, txns };
  }
}
