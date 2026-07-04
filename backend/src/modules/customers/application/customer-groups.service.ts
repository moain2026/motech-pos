import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CustomerGroupsRepository,
  CUSTOMER_GROUPS_REPOSITORY,
  UpsertCustomerGroupInput,
} from '../domain/ports/customer-groups.port';
import { CustomersService } from './customers.service';

export interface CreateGroupInput {
  grpCode?: number;
  arName?: string;
  enName?: string;
  sendMsg?: boolean;
  inactive?: boolean;
}

/**
 * CustomerGroupsService — POSI009 مجموعات عملاء نقاط البيع.
 * Groups customers for reporting/targeting. MOTECH_POS authoritative (V020,
 * the live IAS_CASH_CUSTMR_GRP is empty); one group per customer (reassign
 * moves them). Customer existence validates through CustomersService.
 */
@Injectable()
export class CustomerGroupsService {
  constructor(
    @Inject(CUSTOMER_GROUPS_REPOSITORY)
    private readonly repo: CustomerGroupsRepository,
    private readonly customers: CustomersService,
  ) {}

  list() {
    return this.repo.list();
  }

  async get(grpCode: number) {
    const grp = await this.repo.find(grpCode);
    if (!grp) throw new NotFoundException(`Group ${grpCode} not found`);
    const members = await this.repo.listMembers(grpCode);
    return { ...grp, members };
  }

  async create(input: CreateGroupInput) {
    let grpCode = input.grpCode;
    if (grpCode != null) {
      const dup = await this.repo.find(grpCode);
      if (dup) throw new ConflictException(`Group ${grpCode} already exists`);
    } else {
      grpCode = await this.repo.nextGrpCode();
    }
    return this.repo.upsert({
      grpCode,
      arName: input.arName ?? null,
      enName: input.enName ?? null,
      sendMsg: input.sendMsg ?? false,
      inactive: input.inactive ?? false,
    });
  }

  async update(grpCode: number, input: Omit<UpsertCustomerGroupInput, 'grpCode'>) {
    const grp = await this.repo.find(grpCode);
    if (!grp) throw new NotFoundException(`Group ${grpCode} not found`);
    return this.repo.upsert({ grpCode, ...input });
  }

  /** Assign a customer (must exist) — reassigns when already grouped. */
  async assign(grpCode: number, customerCode: string) {
    const grp = await this.repo.find(grpCode);
    if (!grp) throw new NotFoundException(`Group ${grpCode} not found`);
    // Throws 404 when the customer is unknown (ERP + overlay both miss).
    await this.customers.findByCode(customerCode);
    return this.repo.assign(grpCode, customerCode);
  }

  async unassign(customerCode: string) {
    const removed = await this.repo.unassign(customerCode);
    if (!removed) {
      throw new NotFoundException(
        `Customer ${customerCode} is not in any group`,
      );
    }
    return { customerCode, removed };
  }

  /** The group a customer belongs to (null when ungrouped). */
  groupOf(customerCode: string) {
    return this.repo.groupOf(customerCode);
  }
}
