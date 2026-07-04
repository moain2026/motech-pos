import { Inject, Injectable, Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';
import {
  EInvoiceBillNotFoundError,
  EInvoiceNotFoundError,
} from '../../../shared/errors/domain-error';
import { buildEInvoice, SellerInfo } from '../domain/einvoice-policy';
import {
  EInvoiceRepository,
  EINVOICE_REPOSITORY,
  EInvoiceUniqueViolation,
  PersistedEInvoice,
} from '../domain/ports/einvoice-repository.port';

/**
 * EInvoiceService — generate + fetch the electronic tax document (الفوترة
 * الإلكترونية). Analogue of PKG_GNR_E_INVC_OP + the SUBMITDOCUMENT step, but the
 * external submission is SIMULATED (no gateway call). Generation is idempotent
 * per bill (UNIQUE BILL_ID); a re-request returns the original document.
 *
 * A generated e-invoice is what LIFTS the -20001 sync guard for a bill.
 */
@Injectable()
export class EInvoiceService {
  private readonly logger = new Logger(EInvoiceService.name);

  constructor(
    @Inject(EINVOICE_REPOSITORY) private readonly repo: EInvoiceRepository,
  ) {}

  private seller(): SellerInfo {
    return {
      name: process.env.EINVOICE_SELLER_NAME ?? 'Motech POS Store',
      vatNumber: process.env.EINVOICE_VAT_NUMBER ?? '300000000000003',
    };
  }

  /**
   * Generate (or replay) the e-invoice for a posted bill. Also simulates the
   * SUBMITDOCUMENT upload (marks it submitted + assigns an FDA_CODE analogue).
   */
  async generate(
    billId: string,
  ): Promise<{ einvoice: PersistedEInvoice; replayed: boolean }> {
    // Replay: already generated → return the original (idempotent).
    const existing = await this.repo.findByBillId(billId);
    if (existing) {
      return { einvoice: existing, replayed: true };
    }

    const facts = await this.repo.findBillFacts(billId);
    if (!facts) {
      throw new EInvoiceBillNotFoundError(
        `Bill ${billId} not found in MOTECH_POS`,
        { billId },
      );
    }

    const seller = this.seller();
    const doc = buildEInvoice(seller, facts);
    // FDA_CODE analogue — the tax authority's returned document id. Simulated
    // deterministically from the content hash so it is stable per bill.
    const fdaCode = this.fdaCode(facts.billId, doc.docHash);

    try {
      await this.repo.insert({
        billId: facts.billId,
        billNo: facts.billNo,
        sellerName: seller.name,
        vatNumber: seller.vatNumber,
        invoiceTs: doc.invoiceTs,
        totalAmount: doc.totalAmount,
        vatAmount: doc.vatAmount,
        qrTlvBase64: doc.qrTlvBase64,
        docHash: doc.docHash,
        docJson: doc.docJson,
        fdaCode,
      });
      // Simulate SUBMITDOCUMENT: no external gateway call — just flip status.
      const submitted = await this.repo.markSubmitted(facts.billId);
      this.logger.log(
        { billId: facts.billId, fdaCode },
        'E-invoice generated + submitted (simulated)',
      );
      return { einvoice: submitted, replayed: false };
    } catch (err) {
      if (err instanceof EInvoiceUniqueViolation) {
        const winner = await this.repo.findByBillId(billId);
        if (winner) return { einvoice: winner, replayed: true };
      }
      throw err;
    }
  }

  async getByBillId(billId: string): Promise<PersistedEInvoice> {
    const found = await this.repo.findByBillId(billId);
    if (!found) {
      throw new EInvoiceNotFoundError(
        `No e-invoice generated for bill ${billId}`,
        { billId },
      );
    }
    return found;
  }

  /** True when the bill has a generated e-invoice (lifts the sync guard). */
  async isIssued(billId: string): Promise<boolean> {
    return (await this.repo.findByBillId(billId)) != null;
  }

  /** Deterministic FDA_CODE analogue (authority document id). */
  private fdaCode(billId: string, docHash: string): string {
    return createHash('sha256')
      .update(`${billId}:${docHash}`)
      .digest('hex')
      .slice(0, 24)
      .toUpperCase();
  }
}
