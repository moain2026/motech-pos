/** DI token for the customer-groups repository (MOTECH_POS authoritative). */
export const CUSTOMER_GROUPS_REPOSITORY = Symbol('CUSTOMER_GROUPS_REPOSITORY');

/** One POS customer group (POSI009 — مجموعات عملاء نقاط البيع). */
export interface CustomerGroupRow {
  id: string;
  grpCode: number;
  arName: string | null;
  enName: string | null;
  sendMsg: boolean;
  inactive: boolean;
  memberCount: number;
}

/** One group member (customer code → group). */
export interface GroupMemberRow {
  id: string;
  grpCode: number;
  customerCode: string;
  customerName: string | null; // resolved from the customer master
}

export interface UpsertCustomerGroupInput {
  grpCode: number;
  arName?: string | null;
  enName?: string | null;
  sendMsg?: boolean | null;
  inactive?: boolean | null;
}

export interface CustomerGroupsRepository {
  list(): Promise<CustomerGroupRow[]>;
  find(grpCode: number): Promise<CustomerGroupRow | null>;
  upsert(input: UpsertCustomerGroupInput): Promise<CustomerGroupRow>;
  nextGrpCode(): Promise<number>;
  listMembers(grpCode: number): Promise<GroupMemberRow[]>;
  /** Assign a customer to the group (one group per customer — reassigns). */
  assign(grpCode: number, customerCode: string): Promise<GroupMemberRow>;
  unassign(customerCode: string): Promise<boolean>;
  /** Which group (if any) a customer belongs to. */
  groupOf(customerCode: string): Promise<CustomerGroupRow | null>;
}
