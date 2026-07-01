import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Store / seller configuration (client state, persisted per terminal).
 *
 * Sourced here (not the backend) because the receipt header + e-invoice QR
 * (STANDARDS/13 §5) need seller identity that the current read-only backend
 * does not expose. Kept configurable per country/tenant (adapter-friendly):
 * `vatNumber`, `taxCalcType`, and `country` drive the e-invoice adapter.
 *
 * Defaults reflect the YSPOS23 (Yemen) demo dataset; a real deployment sets
 * these once from an admin screen. NUMERIC-safe: no monetary state lives here.
 */
export type EInvoiceCountry = 'SA' | 'YE' | 'EG' | 'JO' | 'IQ' | 'GENERIC';

interface StoreConfigState {
  /** Shop / seller display name on the receipt header + QR (TLV tag 1). */
  storeName: string;
  /** Second header line (branch, slogan, address). */
  storeSubtitle: string;
  /** Seller VAT / tax registration number (TLV tag 2). */
  vatNumber: string;
  /** Phone shown in the receipt footer. */
  phone: string;
  /** Free-text address line. */
  address: string;
  /** ISO currency (display only — matches format.ts). */
  currency: string;
  /** E-invoice adapter selector (STANDARDS/13 §5 — per country). */
  country: EInvoiceCountry;
  /** VAT default rate (%) applied when the dataset carries none (0 = off). */
  vatRate: number;
  /** Footer thank-you note. */
  footerNote: string;

  set: (patch: Partial<Omit<StoreConfigState, 'set' | 'reset'>>) => void;
  reset: () => void;
}

const DEFAULTS = {
  storeName: 'متجر موتك',
  storeSubtitle: 'فرع الرئيسي',
  vatNumber: '',
  phone: '',
  address: '',
  currency: 'YER',
  country: 'YE' as EInvoiceCountry,
  vatRate: 0,
  footerNote: 'شكراً لزيارتكم',
};

export const useStoreConfig = create<StoreConfigState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      set: (patch) => set(patch),
      reset: () => set(DEFAULTS),
    }),
    { name: 'motech-store-config' },
  ),
);

/** Non-reactive snapshot (for print/QR building outside React). */
export function storeConfigSnapshot() {
  const s = useStoreConfig.getState();
  return {
    storeName: s.storeName,
    storeSubtitle: s.storeSubtitle,
    vatNumber: s.vatNumber,
    phone: s.phone,
    address: s.address,
    currency: s.currency,
    country: s.country,
    vatRate: s.vatRate,
    footerNote: s.footerNote,
  };
}
