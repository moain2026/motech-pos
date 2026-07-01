export const CUSTOMER_OVERLAY_REPOSITORY = Symbol('CUSTOMER_OVERLAY_REPOSITORY');

/** A local customer overlay record (MOTECH_POS.CUSTOMERS_OVERLAY). */
export interface CustomerOverlayRow {
  code: string;
  origin: 'LOCAL' | 'EDIT';
  arName: string | null;
  enName: string | null;
  mobile: string | null;
  whatsapp: string | null;
  phone: string | null;
  inactive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertCustomerOverlayInput {
  code: string;
  origin: 'LOCAL' | 'EDIT';
  arName?: string | null;
  enName?: string | null;
  mobile?: string | null;
  whatsapp?: string | null;
  phone?: string | null;
  inactive?: boolean;
}

/**
 * CustomerOverlayRepository — write-side local customer creates/edits in
 * MOTECH_POS (never writes YSPOS23). Read endpoints merge these on top of the
 * ERP master.
 */
export interface CustomerOverlayRepository {
  findByCode(code: string): Promise<CustomerOverlayRow | null>;
  /** All overlay codes → row, for bulk merge in search. */
  findByCodes(codes: string[]): Promise<Map<string, CustomerOverlayRow>>;
  /** LOCAL-origin rows (created here, not in ERP) for search surfacing. */
  listLocal(search: string | undefined, limit: number): Promise<CustomerOverlayRow[]>;
  /** Insert or update (by CODE) the overlay row; returns the stored row. */
  upsert(input: UpsertCustomerOverlayInput): Promise<CustomerOverlayRow>;
}
