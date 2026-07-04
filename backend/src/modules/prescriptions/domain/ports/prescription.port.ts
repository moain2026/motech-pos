/** DI token for the PrescriptionRepository port. */
export const PRESCRIPTION_REPOSITORY = Symbol('PRESCRIPTION_REPOSITORY');

/** One dispensed item with the doctor's instructions (POST023 sub-record). */
export interface PrescriptionLine {
  lineId: string;
  itemCode: string;
  itemName: string | null; // Arabic name snapshot (IAS_ITM_MST)
  qty: number; // dispensed qty (aggregated from the bill)
  dosage: string | null; // الجرعة
  usageNotes: string | null; // طريقة الاستخدام
  duration: string | null; // مدة الاستخدام
}

/** Prescription header (POST023 الوصفة الطبية) — always linked to a bill. */
export interface PrescriptionHeader {
  id: string;
  billNo: string; // YSPOS23.IAS_POS_BILL_MST.BILL_NO
  doctorName: string;
  patientName: string;
  patientRef: string | null;
  rxDate: string; // ISO date
  note: string | null;
  createdBy: string;
  createdAt: string;
  lineCount: number;
}

export interface PrescriptionDetail extends PrescriptionHeader {
  lines: PrescriptionLine[];
}

export interface CreatePrescriptionLineInput {
  itemCode: string;
  itemName: string | null;
  qty: number;
  dosage: string | null;
  usageNotes: string | null;
  duration: string | null;
}

export interface CreatePrescriptionInput {
  billNo: string;
  doctorName: string;
  patientName: string;
  patientRef: string | null;
  rxDate: string | null; // ISO date; defaults to today
  note: string | null;
  createdBy: string;
  lines: CreatePrescriptionLineInput[];
}

export interface ListPrescriptionsFilter {
  billNo?: string;
  patient?: string; // substring match on PATIENT_NAME
  limit: number;
}

/** One item as sold on the linked YSPOS23 bill (validation source). */
export interface BillItem {
  itemCode: string;
  qty: number;
  itemName: string | null;
}

/**
 * PrescriptionRepository — persistence port. Writes land ONLY in
 * MOTECH_POS.PRESCRIPTIONS(+_LINES); the linked bill is read live from
 * YSPOS23 (read-only) for validation and qty/name snapshots.
 */
export interface PrescriptionRepository {
  /** Insert header + lines atomically. */
  create(input: CreatePrescriptionInput): Promise<PrescriptionDetail>;
  findById(id: string): Promise<PrescriptionDetail | null>;
  list(filter: ListPrescriptionsFilter): Promise<PrescriptionHeader[]>;
  /**
   * Items of the linked sale bill from LIVE YSPOS23 (aggregated per item,
   * Arabic names joined from the ERP master). Null when the bill is unknown.
   */
  billItems(billNo: string): Promise<BillItem[] | null>;
}
