/** DI token for the read-only CustomersRepository port (IAS202623 master). */
export const CUSTOMERS_REPOSITORY = Symbol('CUSTOMERS_REPOSITORY');

/** One customer row (IAS202623.CUSTOMER), Arabic name + contact. */
export interface CustomerRow {
  code: string; // C_CODE
  arName: string | null; // C_A_NAME
  enName: string | null; // C_E_NAME
  mobile: string | null; // C_MOBILE
  whatsapp: string | null; // C_WHATSAPP_NO
  phone: string | null; // C_PHONE
  inactive: boolean; // INACTIVE = 1
}

/** One loyalty-points movement row (IAS202623.IAS_POINT_CALC_TRNS). */
export interface PointsTxnRow {
  trnsNo: number;
  trnsDate: string | null; // YYYY-MM-DD
  custCode: string | null;
  billNo: number | null;
  trnsType: number | null;
  pointCount: number;
  pointAmt: number;
  docAmt: number;
  billAmt: number;
}

/** Aggregated loyalty balance for one customer. */
export interface PointsBalance {
  code: string;
  totalPoints: number;
  txnCount: number;
}

export interface CustomerSearchFilter {
  search?: string;
  limit: number;
}

/**
 * CustomersRepository — read-only access to the IAS202623 ERP master
 * (CUSTOMER, IAS_CASH_CUSTMR, IAS_POINT_CALC_TRNS) through the least-privilege
 * MOTECH_RO connection. All SQL uses schema-qualified names and bind
 * variables. STRICTLY read-only: no INSERT/UPDATE/DELETE.
 */
export interface CustomersRepository {
  /** Search customers by Arabic/English name or code. */
  search(filter: CustomerSearchFilter): Promise<CustomerRow[]>;

  /** Fetch a single customer by C_CODE (null if not found). */
  findByCode(code: string): Promise<CustomerRow | null>;

  /** Loyalty-points movements for a customer (may be empty). */
  pointsTxns(code: string, limit: number): Promise<PointsTxnRow[]>;

  /** Aggregated loyalty balance for a customer. */
  pointsBalance(code: string): Promise<PointsBalance>;
}
