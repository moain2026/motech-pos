/**
 * SyncGuard — the critical -20001 architectural guard, extracted from YSPOS23
 * PKG_POS_MOV_TRNS_PKG.MOV_BILLS_PRC (proof: docs/flows/FLOW_SYNC.md §3 step 7
 * + §4 note 1):
 *
 *   RAISE_APPLICATION_ERROR(-20001,'There are tax bills not Sync. to tax
 *   authority bills count='||V_Cnt);
 *
 * A taxable bill MUST have its e-invoice issued (WEB_SRVC_TRNSFR_DATA_FLG=1 +
 * FDA_CODE) before it can be transferred to the center. This is a pure
 * predicate so it is fully unit testable, independent of DB/IO.
 */

/** The minimal per-bill facts needed to evaluate the sync guard. */
export interface BillSyncFacts {
  billId: string;
  /** VAT amount on the bill — > 0 means taxable. */
  vatAmount: number;
  /** Whether an e-invoice has been issued for this bill (analogue of FLG=1). */
  eInvoiceIssued: boolean;
}

/**
 * Returns true when the bill MAY be synced to the center, i.e. it is either
 * non-taxable (VAT = 0) or its e-invoice has already been issued.
 */
export function canSync(bill: BillSyncFacts): boolean {
  if (!(bill.vatAmount > 0)) return true; // non-taxable → no e-invoice needed
  return bill.eInvoiceIssued;
}

/** The -20001 message text (mirrors the Onyx RAISE_APPLICATION_ERROR). */
export function taxBillsNotSyncedMessage(count: number): string {
  return `There are tax bills not Sync. to tax authority bills count=${count}`;
}
