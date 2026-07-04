import { Injectable } from '@nestjs/common';
import type { BindParameters } from 'oracledb';
import { OracleService } from '../../../infrastructure/oracle/oracle.service';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import {
  BillItem,
  CreatePrescriptionInput,
  ListPrescriptionsFilter,
  PrescriptionDetail,
  PrescriptionHeader,
  PrescriptionLine,
  PrescriptionRepository,
} from '../domain/ports/prescription.port';

interface HeadRow {
  ID: string;
  BILL_NO: string;
  DOCTOR_NAME: string;
  PATIENT_NAME: string;
  PATIENT_REF: string | null;
  RX_DATE: Date;
  NOTE: string | null;
  CREATED_BY: string;
  CREATED_AT: Date;
  LINE_CNT: number;
}

interface LineRow {
  ID: string;
  ITEM_CODE: string;
  ITEM_NAME: string | null;
  QTY: number;
  DOSAGE: string | null;
  USAGE_NOTES: string | null;
  DURATION: string | null;
}

/**
 * OraclePrescriptionRepository — POST023 persistence. Prescription rows live
 * ONLY in MOTECH_POS (PRESCRIPTIONS + PRESCRIPTION_LINES, V017); the linked
 * sale bill is read LIVE from YSPOS23.IAS_POS_BILL_DTL via the read-only
 * MOTECH_RO pool, with Arabic item names from the ERP master (IAS202623).
 * Header + lines are inserted in ONE transaction (all-or-nothing).
 */
@Injectable()
export class OraclePrescriptionRepository implements PrescriptionRepository {
  constructor(
    private readonly read: OracleService,
    private readonly write: OracleWriteService,
  ) {}

  private get schema(): string {
    return this.write.schema();
  }

  async create(input: CreatePrescriptionInput): Promise<PrescriptionDetail> {
    const id = uuidv7();
    await this.write.withTransaction(async (conn) => {
      await conn.execute(
        `INSERT INTO ${this.schema}.PRESCRIPTIONS
           (ID, BILL_NO, DOCTOR_NAME, PATIENT_NAME, PATIENT_REF, RX_DATE,
            NOTE, CREATED_BY)
         VALUES
           (:id, :billNo, :doctorName, :patientName, :patientRef,
            NVL(TO_DATE(:rxDate, 'YYYY-MM-DD'), TRUNC(SYSDATE)),
            :note, :createdBy)`,
        {
          id,
          billNo: input.billNo,
          doctorName: input.doctorName,
          patientName: input.patientName,
          patientRef: input.patientRef,
          rxDate: input.rxDate,
          note: input.note,
          createdBy: input.createdBy,
        },
      );
      for (const line of input.lines) {
        await conn.execute(
          `INSERT INTO ${this.schema}.PRESCRIPTION_LINES
             (ID, RX_ID, ITEM_CODE, ITEM_NAME, QTY, DOSAGE, USAGE_NOTES,
              DURATION)
           VALUES
             (:id, :rxId, :itemCode, :itemName, :qty, :dosage, :usageNotes,
              :duration)`,
          {
            id: uuidv7(),
            rxId: id,
            itemCode: line.itemCode,
            itemName: line.itemName,
            qty: line.qty,
            dosage: line.dosage,
            usageNotes: line.usageNotes,
            duration: line.duration,
          },
        );
      }
    });
    const created = await this.findById(id);
    if (!created) throw new Error('create: prescription vanished after insert');
    return created;
  }

  async findById(id: string): Promise<PrescriptionDetail | null> {
    const row = await this.write.queryOne<HeadRow>(
      `${this.headSelect()} WHERE p.ID = :k`,
      { k: id },
    );
    if (!row) return null;
    return { ...this.toHeader(row), lines: await this.linesOf(id) };
  }

  async list(filter: ListPrescriptionsFilter): Promise<PrescriptionHeader[]> {
    const binds: Record<string, unknown> = { lim: filter.limit };
    const where: string[] = [];
    if (filter.billNo) {
      where.push('p.BILL_NO = :billNo');
      binds.billNo = filter.billNo;
    }
    if (filter.patient) {
      where.push('UPPER(p.PATIENT_NAME) LIKE UPPER(:patient)');
      binds.patient = `%${filter.patient}%`;
    }
    const rows = await this.write.query<HeadRow>(
      `SELECT * FROM (
         ${this.headSelect()}
         ${where.length > 0 ? 'WHERE ' + where.join(' AND ') : ''}
         ORDER BY p.CREATED_AT DESC
       ) WHERE ROWNUM <= :lim`,
      binds as BindParameters,
    );
    return rows.map((r) => this.toHeader(r));
  }

  async billItems(billNo: string): Promise<BillItem[] | null> {
    const exists = await this.read.queryOne<{ ONE: number }>(
      `SELECT 1 AS ONE FROM ${this.read.schema()}.IAS_POS_BILL_MST
       WHERE BILL_NO = :billNo`,
      { billNo },
    );
    if (!exists) return null;

    type Row = { I_CODE: string; I_QTY: number; I_NAME: string | null };
    const rows = await this.read.query<Row>(
      `SELECT d.I_CODE, SUM(d.I_QTY) AS I_QTY, MAX(m.I_NAME) AS I_NAME
       FROM ${this.read.schema()}.IAS_POS_BILL_DTL d
       LEFT JOIN ${this.read.masterSchema()}.IAS_ITM_MST m
         ON m.I_CODE = d.I_CODE
       WHERE d.BILL_NO = :billNo
       GROUP BY d.I_CODE
       ORDER BY d.I_CODE`,
      { billNo },
    );
    return rows.map((r) => ({
      itemCode: String(r.I_CODE),
      qty: Number(r.I_QTY ?? 0),
      itemName: r.I_NAME ?? null,
    }));
  }

  // ---- helpers ----

  private headSelect(): string {
    return `
      SELECT p.ID, p.BILL_NO, p.DOCTOR_NAME, p.PATIENT_NAME, p.PATIENT_REF,
             p.RX_DATE, p.NOTE, p.CREATED_BY, p.CREATED_AT,
             NVL(l.LINE_CNT, 0) AS LINE_CNT
      FROM ${this.schema}.PRESCRIPTIONS p
      LEFT JOIN (
        SELECT RX_ID, COUNT(*) AS LINE_CNT
        FROM ${this.schema}.PRESCRIPTION_LINES GROUP BY RX_ID
      ) l ON l.RX_ID = p.ID`;
  }

  private async linesOf(rxId: string): Promise<PrescriptionLine[]> {
    const rows = await this.write.query<LineRow>(
      `SELECT ID, ITEM_CODE, ITEM_NAME, QTY, DOSAGE, USAGE_NOTES, DURATION
       FROM ${this.schema}.PRESCRIPTION_LINES
       WHERE RX_ID = :rxId
       ORDER BY ITEM_CODE`,
      { rxId },
    );
    return rows.map((r) => ({
      lineId: r.ID,
      itemCode: r.ITEM_CODE,
      itemName: r.ITEM_NAME,
      qty: Number(r.QTY),
      dosage: r.DOSAGE,
      usageNotes: r.USAGE_NOTES,
      duration: r.DURATION,
    }));
  }

  private toHeader(r: HeadRow): PrescriptionHeader {
    return {
      id: r.ID,
      billNo: String(r.BILL_NO),
      doctorName: r.DOCTOR_NAME,
      patientName: r.PATIENT_NAME,
      patientRef: r.PATIENT_REF,
      rxDate: r.RX_DATE.toISOString().slice(0, 10),
      note: r.NOTE,
      createdBy: r.CREATED_BY,
      createdAt: r.CREATED_AT.toISOString(),
      lineCount: Number(r.LINE_CNT),
    };
  }
}
