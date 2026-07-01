/**
 * Receipt model — the single normalized shape consumed by BOTH the browser
 * print template (80mm CSS) and the ESC/POS byte encoder. Building this once
 * (from a posted bill + cart lines + store config) keeps the two renderers in
 * sync (STANDARDS/13 §3 — configurable receipt template).
 */
import type { PostedBill } from '@/shared/lib/types';
import type { CartLine } from '@/features/pos-terminal/store/cart.store';
import { storeConfigSnapshot } from '@/shared/config/store-config.store';
import { encodeEInvoiceQr } from '@/shared/einvoice/zatca-tlv';

export interface ReceiptLine {
  name: string;
  code: string;
  qty: number;
  unitPrice: number;
  lineNet: number;
  unit: string | null;
}

export interface ReceiptModel {
  store: {
    name: string;
    subtitle: string;
    vatNumber: string;
    phone: string;
    address: string;
    footerNote: string;
  };
  billNo: string;
  issuedAt: string; // ISO
  cashierNo: number;
  machineNo: number;
  customerName: string | null;
  paymentMethod: string | null;
  currency: string;
  lines: ReceiptLine[];
  totals: {
    gross: number;
    discount: number;
    vat: number;
    net: number;
    paid: number;
    change: number;
  };
  /** Base64 TLV string for the e-invoice QR. */
  qrPayload: string;
}

/** Prefer the cart's Arabic name; posted-bill lines carry null names. */
function resolveName(code: string, cartLines: CartLine[]): { name: string; unit: string | null } {
  const c = cartLines.find((l) => l.code === code);
  return { name: c?.name?.trim() || code, unit: c?.unit ?? null };
}

/**
 * Build a receipt from a posted bill (server truth for amounts + billNo) plus
 * the cart lines (source of Arabic names, since the bill response nulls them).
 */
export function buildReceipt(params: {
  bill: PostedBill;
  cartLines: CartLine[];
  paidAmount?: number;
}): ReceiptModel {
  const cfg = storeConfigSnapshot();
  const { bill, cartLines } = params;
  const paid = params.paidAmount ?? bill.paidAmt ?? bill.netAmt;

  const lines: ReceiptLine[] = bill.lines.map((l) => {
    const { name, unit } = resolveName(l.itemCode, cartLines);
    return {
      name: l.itemName?.trim() || name,
      code: l.itemCode,
      qty: l.qty,
      unitPrice: l.unitPrice,
      lineNet: l.lineNet,
      unit: l.itemUnit ?? unit,
    };
  });

  const method = bill.payments?.[0]?.method ?? null;

  const qrPayload = encodeEInvoiceQr({
    sellerName: cfg.storeName,
    vatNumber: cfg.vatNumber,
    timestamp: bill.issuedAt || new Date().toISOString(),
    total: bill.netAmt,
    vat: bill.vatAmt,
  });

  return {
    store: {
      name: cfg.storeName,
      subtitle: cfg.storeSubtitle,
      vatNumber: cfg.vatNumber,
      phone: cfg.phone,
      address: cfg.address,
      footerNote: cfg.footerNote,
    },
    billNo: bill.billNo,
    issuedAt: bill.issuedAt || new Date().toISOString(),
    cashierNo: bill.cashierNo,
    machineNo: bill.machineNo,
    customerName: bill.customerName,
    paymentMethod: method,
    currency: bill.currency || cfg.currency,
    lines,
    totals: {
      gross: bill.grossAmt,
      discount: bill.discountAmt,
      vat: bill.vatAmt,
      net: bill.netAmt,
      paid,
      change: Math.max(0, paid - bill.netAmt),
    },
    qrPayload,
  };
}
