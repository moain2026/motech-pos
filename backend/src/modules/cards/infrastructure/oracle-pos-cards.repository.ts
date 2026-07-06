import { Injectable } from '@nestjs/common';
import oracledb from 'oracledb';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import {
  PosCardRow,
  PosCardsRepository,
  UpsertPosCardInput,
} from '../domain/ports/pos-cards.port';

/**
 * Merged row shape returned by the ERP⟕overlay query. NULL-safe: the ERP master
 * (IAS202623.CREDIT_CARD_TYPES) is joined LEFT with our overlay so LOCAL cards
 * (no ERP row) also surface. Overlay columns win where present.
 */
interface MergedRow {
  CARD_NO: number;
  AR_NAME: string | null;
  EN_NAME: string | null;
  CARD_TYPE: number | null;
  BANK_NO: number | null;
  COMM_PCT: number | null;
  COMM_CALC_TYPE: number | null;
  DUE_PERIOD: number | null;
  BANK_AC: string | null;
  INACTIVE: number;
  ORIGIN: string; // ERP | LOCAL | EDIT
}

/**
 * OraclePosCardsRepository — POS card types (POSI012). The ERP table
 * IAS_POS_CARD does not exist; the real master is CREDIT_CARD_TYPES (SACRED
 * read-only). Reads MERGE that master with MOTECH_POS.CARD_TYPES_OVERLAY;
 * writes land ONLY in the overlay. All access goes through MOTECH_RW (which
 * can read the ERP master and write our schema). Bind variables everywhere.
 */
@Injectable()
export class OraclePosCardsRepository implements PosCardsRepository {
  constructor(private readonly db: OracleWriteService) {}

  private get schema(): string {
    return this.db.schema();
  }

  private get master(): string {
    return this.db.masterSchema();
  }

  /**
   * FULL OUTER JOIN of ERP master and overlay (by card number). Overlay values
   * override the ERP where present; origin is derived from which side exists.
   */
  private mergeSql(where = ''): string {
    return `
      SELECT
        NVL(o.CARD_NO, e.CR_CARD_NO)                       AS CARD_NO,
        NVL(o.AR_NAME, e.CR_CARD_NAME)                     AS AR_NAME,
        NVL(o.EN_NAME, e.CR_CARD_E_NAME)                   AS EN_NAME,
        NVL(o.CARD_TYPE, e.CR_CARD_TYPE)                   AS CARD_TYPE,
        NVL(o.BANK_NO, e.BANK_NO)                          AS BANK_NO,
        NVL(o.COMM_PCT, e.COMM_PER)                        AS COMM_PCT,
        NVL(o.COMM_CALC_TYPE, e.COMM_CALC_TYPE)            AS COMM_CALC_TYPE,
        NVL(o.DUE_PERIOD, e.DUE_PERIOD)                    AS DUE_PERIOD,
        NVL(o.BANK_AC, e.BANK_AC)                          AS BANK_AC,
        NVL(o.INACTIVE, 0)                                 AS INACTIVE,
        CASE
          WHEN o.CARD_NO IS NULL THEN 'ERP'
          WHEN e.CR_CARD_NO IS NULL THEN 'LOCAL'
          ELSE 'EDIT'
        END                                                AS ORIGIN
      FROM ${this.master}.CREDIT_CARD_TYPES e
      FULL OUTER JOIN ${this.schema}.CARD_TYPES_OVERLAY o
        ON o.CARD_NO = e.CR_CARD_NO
      ${where}`;
  }

  async listMerged(): Promise<PosCardRow[]> {
    const rows = await this.db.query<MergedRow>(
      `${this.mergeSql()} ORDER BY CARD_NO`,
    );
    return rows.map((r) => this.map(r));
  }

  async findMerged(cardNo: number): Promise<PosCardRow | null> {
    const rows = await this.db.query<MergedRow>(
      this.mergeSql('WHERE NVL(o.CARD_NO, e.CR_CARD_NO) = :n'),
      { n: { val: cardNo, type: oracledb.NUMBER } },
    );
    return rows.length ? this.map(rows[0]) : null;
  }

  async erpCardExists(cardNo: number): Promise<boolean> {
    const row = await this.db.queryOne<{ C: number }>(
      `SELECT COUNT(*) AS C FROM ${this.master}.CREDIT_CARD_TYPES
       WHERE CR_CARD_NO = :n`,
      { n: { val: cardNo, type: oracledb.NUMBER } },
    );
    return Number(row?.C ?? 0) > 0;
  }

  async overlayExists(cardNo: number): Promise<boolean> {
    const row = await this.db.queryOne<{ C: number }>(
      `SELECT COUNT(*) AS C FROM ${this.schema}.CARD_TYPES_OVERLAY
       WHERE CARD_NO = :n`,
      { n: { val: cardNo, type: oracledb.NUMBER } },
    );
    return Number(row?.C ?? 0) > 0;
  }

  async nextLocalCardNo(): Promise<number> {
    const row = await this.db.queryOne<{ N: number }>(
      `SELECT ${this.schema}.SEQ_LOCAL_CARD_NO.NEXTVAL AS N FROM DUAL`,
    );
    if (!row) throw new Error('nextLocalCardNo: sequence returned no value');
    return Number(row.N);
  }

  async insertOverlay(
    cardNo: number,
    origin: 'LOCAL' | 'EDIT',
    input: UpsertPosCardInput,
  ): Promise<void> {
    await this.db.execute(
      `INSERT INTO ${this.schema}.CARD_TYPES_OVERLAY
         (ID, CARD_NO, ORIGIN, AR_NAME, EN_NAME, CARD_TYPE, BANK_NO,
          COMM_PCT, COMM_CALC_TYPE, DUE_PERIOD, BANK_AC, INACTIVE)
       VALUES (:id, :cardNo, :origin, :arName, :enName, :cardType, :bankNo,
          :commPct, :commCalcType, :duePeriod, :bankAc, :inactive)`,
      this.binds(cardNo, input, { id: uuidv7(), origin }),
    );
  }

  async updateOverlay(
    cardNo: number,
    input: UpsertPosCardInput,
  ): Promise<boolean> {
    const res = await this.db.execute(
      `UPDATE ${this.schema}.CARD_TYPES_OVERLAY SET
         AR_NAME = :arName, EN_NAME = :enName, CARD_TYPE = :cardType,
         BANK_NO = :bankNo, COMM_PCT = :commPct,
         COMM_CALC_TYPE = :commCalcType, DUE_PERIOD = :duePeriod,
         BANK_AC = :bankAc, INACTIVE = :inactive, UPDATED_AT = SYSTIMESTAMP
       WHERE CARD_NO = :cardNo`,
      this.binds(cardNo, input, {}),
    );
    return Number(res.rowsAffected ?? 0) > 0;
  }

  private binds(
    cardNo: number,
    input: UpsertPosCardInput,
    extra: Record<string, unknown>,
  ): oracledb.BindParameters {
    const num = (v: number | null | undefined) =>
      v == null ? { val: null, type: oracledb.NUMBER } : { val: v, type: oracledb.NUMBER };
    return {
      ...extra,
      cardNo: { val: cardNo, type: oracledb.NUMBER },
      arName: input.arName,
      enName: input.enName ?? null,
      cardType: num(input.cardType),
      bankNo: num(input.bankNo),
      commPct: num(input.commissionPct),
      commCalcType: num(input.commCalcType),
      duePeriod: num(input.duePeriod),
      bankAc: input.bankAc ?? null,
      inactive: { val: input.inactive ? 1 : 0, type: oracledb.NUMBER },
    } as oracledb.BindParameters;
  }

  private map(r: MergedRow): PosCardRow {
    return {
      cardNo: Number(r.CARD_NO),
      arName: r.AR_NAME,
      enName: r.EN_NAME,
      cardType: r.CARD_TYPE == null ? null : Number(r.CARD_TYPE),
      bankNo: r.BANK_NO == null ? null : Number(r.BANK_NO),
      commissionPct: r.COMM_PCT == null ? null : Number(r.COMM_PCT),
      commCalcType: r.COMM_CALC_TYPE == null ? null : Number(r.COMM_CALC_TYPE),
      duePeriod: r.DUE_PERIOD == null ? null : Number(r.DUE_PERIOD),
      bankAc: r.BANK_AC,
      inactive: Number(r.INACTIVE) === 1,
      origin: r.ORIGIN as PosCardRow['origin'],
    };
  }
}
