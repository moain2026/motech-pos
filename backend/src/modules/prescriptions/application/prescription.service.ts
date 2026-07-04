import { Inject, Injectable } from '@nestjs/common';
import {
  PrescriptionBillNotFoundError,
  PrescriptionItemNotOnBillError,
  PrescriptionNotFoundError,
} from '../../../shared/errors/domain-error';
import {
  CreatePrescriptionInput,
  ListPrescriptionsFilter,
  PrescriptionDetail,
  PrescriptionHeader,
  PrescriptionRepository,
  PRESCRIPTION_REPOSITORY,
} from '../domain/ports/prescription.port';

export interface CreateRxLineInput {
  itemCode: string;
  dosage?: string | null;
  usageNotes?: string | null;
  duration?: string | null;
}

export interface CreateRxInput {
  billNo: string;
  doctorName: string;
  patientName: string;
  patientRef?: string | null;
  rxDate?: string | null;
  note?: string | null;
  createdBy: string;
  lines: CreateRxLineInput[];
}

/**
 * PrescriptionService — POST023 (الوصفة الطبية): attach a medical
 * prescription (doctor + patient + per-item dosage/usage/duration
 * instructions) to an EXISTING sale bill. Mirrors the Onyx flow: the screen
 * opens on a past sale bill, loads its items and the doctor annotates them.
 *
 * Guards:
 *  - the bill must exist in LIVE YSPOS23 (404 prescription-bill-not-found);
 *  - every annotated item must be ON that bill (422
 *    prescription-item-not-on-bill) — qty/name are snapshotted server-side
 *    from the bill, never client-supplied.
 * Writes land only in MOTECH_POS (YSPOS23 stays read-only).
 */
@Injectable()
export class PrescriptionService {
  constructor(
    @Inject(PRESCRIPTION_REPOSITORY)
    private readonly repo: PrescriptionRepository,
  ) {}

  async create(input: CreateRxInput): Promise<PrescriptionDetail> {
    const billItems = await this.repo.billItems(input.billNo);
    if (!billItems) {
      throw new PrescriptionBillNotFoundError(
        `Sale bill ${input.billNo} not found in the live POS data`,
        { billNo: input.billNo },
      );
    }
    const byCode = new Map(billItems.map((b) => [b.itemCode, b]));

    const missing = input.lines
      .map((l) => l.itemCode)
      .filter((code) => !byCode.has(code));
    if (missing.length > 0) {
      throw new PrescriptionItemNotOnBillError(
        `Item(s) not on bill ${input.billNo}: ${missing.join(', ')}`,
        { billNo: input.billNo, itemCodes: missing },
      );
    }

    const toCreate: CreatePrescriptionInput = {
      billNo: input.billNo,
      doctorName: input.doctorName,
      patientName: input.patientName,
      patientRef: input.patientRef ?? null,
      rxDate: input.rxDate ?? null,
      note: input.note ?? null,
      createdBy: input.createdBy,
      lines: input.lines.map((l) => {
        const sold = byCode.get(l.itemCode)!;
        return {
          itemCode: l.itemCode,
          itemName: sold.itemName,
          qty: sold.qty,
          dosage: l.dosage ?? null,
          usageNotes: l.usageNotes ?? null,
          duration: l.duration ?? null,
        };
      }),
    };
    return this.repo.create(toCreate);
  }

  async byId(id: string): Promise<PrescriptionDetail> {
    const rx = await this.repo.findById(id);
    if (!rx) {
      throw new PrescriptionNotFoundError(`Prescription ${id} not found`, {
        id,
      });
    }
    return rx;
  }

  list(filter: ListPrescriptionsFilter): Promise<PrescriptionHeader[]> {
    return this.repo.list(filter);
  }

  /** Items of a live bill — used by the UI to pre-fill the annotate screen. */
  async billItems(billNo: string) {
    const items = await this.repo.billItems(billNo);
    if (!items) {
      throw new PrescriptionBillNotFoundError(
        `Sale bill ${billNo} not found in the live POS data`,
        { billNo },
      );
    }
    return items;
  }
}
