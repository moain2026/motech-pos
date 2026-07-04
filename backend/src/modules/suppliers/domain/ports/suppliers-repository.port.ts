/** DI token for the read-side suppliers repository (live ERP). */
export const SUPPLIERS_REPOSITORY = Symbol('SUPPLIERS_REPOSITORY');
/** DI token for the write-side suppliers overlay repository (MOTECH_POS). */
export const SUPPLIERS_OVERLAY_REPOSITORY = Symbol(
  'SUPPLIERS_OVERLAY_REPOSITORY',
);

/** A supplier as read from the live ERP (IAS202623.V_DETAILS). */
export interface SupplierErpRow {
  code: string; // V_CODE
  arName: string | null; // V_A_NAME
  enName: string | null; // V_E_NAME
  phone: string | null;
  mobile: string | null;
  email: string | null;
  address: string | null;
  taxCode: string | null;
  contact: string | null; // V_PERSON
  creditPeriod: number | null;
  inactive: boolean;
}

export interface SuppliersRepository {
  list(search: string | undefined, limit: number): Promise<SupplierErpRow[]>;
  findByCode(code: string): Promise<SupplierErpRow | null>;
}

/** One MOTECH_POS.SUPPLIERS_OVERLAY row. */
export interface SupplierOverlayRow {
  id: string;
  code: string;
  origin: 'LOCAL' | 'EDIT';
  arName: string | null;
  enName: string | null;
  phone: string | null;
  mobile: string | null;
  email: string | null;
  address: string | null;
  taxCode: string | null;
  contact: string | null;
  creditPeriod: number | null;
  inactive: boolean;
}

export interface UpsertSupplierOverlay {
  code: string;
  origin: 'LOCAL' | 'EDIT';
  arName?: string | null;
  enName?: string | null;
  phone?: string | null;
  mobile?: string | null;
  email?: string | null;
  address?: string | null;
  taxCode?: string | null;
  contact?: string | null;
  creditPeriod?: number | null;
  inactive?: boolean | null;
}

export interface SuppliersOverlayRepository {
  list(): Promise<SupplierOverlayRow[]>;
  findByCode(code: string): Promise<SupplierOverlayRow | null>;
  upsert(input: UpsertSupplierOverlay): Promise<SupplierOverlayRow>;
  nextLocalCode(): Promise<string>;
}
