import oracledb from 'oracledb';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Bill } from '../../src/modules/bills/domain/entities/bill.entity';
import { BillLine, VatCalcType } from '../../src/modules/bills/domain/entities/bill-line.entity';

/**
 * GOLDEN TEST — proof-not-assumption.
 *
 * Reads a sample of REAL bills from YSPOS23.IAS_POS_BILL_MST/DTL and verifies
 * that the re-implemented domain calculation (Bill.totals()) reproduces the
 * stored header values BILL_AMT / VAT_AMT / DISC_AMT within a tiny tolerance.
 *
 * Connection comes from the same env the app uses (.env loaded by dotenv-less
 * process.env; vitest inherits the shell env). We connect read-only.
 */

const SAMPLE = Number(process.env.GOLDEN_SAMPLE ?? 50);
const TOLERANCE = 0.01; // currency units

const user = process.env.ORACLE_USER ?? 'MOTECH_RO';
const password = process.env.ORACLE_PASSWORD ?? 'motech_ro_2026';
const connectString = process.env.ORACLE_CONNECT_STRING ?? '127.0.0.1:1521/xe';
const schema = process.env.ORACLE_SCHEMA ?? 'YSPOS23';

let pool: oracledb.Pool;

interface MstRow {
  BILL_NO: number;
  BILL_AMT: number;
  VAT_AMT: number;
  DISC_AMT: number;
  CLC_VAT_AMT_TYP: number | null;
  CLC_TAX_FREE_QTY_FLG: number | null;
}
interface DtlRow {
  I_CODE: string;
  I_QTY: number;
  I_PRICE: number;
  DIS_AMT_DTL: number | null;
  DIS_AMT_MST: number | null;
  VAT_PER: number | null;
  FREE_QTY: number | null;
}

beforeAll(async () => {
  oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
  pool = await oracledb.createPool({ user, password, connectString, poolMin: 1, poolMax: 2 });
});

afterAll(async () => {
  if (pool) await pool.close(2);
});

async function query<T>(sql: string, binds: oracledb.BindParameters = {}): Promise<T[]> {
  const conn = await pool.getConnection();
  try {
    const r = await conn.execute<T>(sql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return (r.rows ?? []) as T[];
  } finally {
    await conn.close();
  }
}

describe('Golden — real bills vs recomputed totals', () => {
  it('connects to Oracle (DUAL)', async () => {
    const rows = await query<{ OK: number }>('SELECT 1 AS OK FROM DUAL');
    expect(rows[0].OK).toBe(1);
  });

  it(`recomputes BILL_AMT/VAT_AMT/DISC_AMT for ${SAMPLE} real bills`, async () => {
    const heads = await query<MstRow>(
      `SELECT * FROM (
         SELECT m.BILL_NO, m.BILL_AMT, m.VAT_AMT, m.DISC_AMT, m.CLC_VAT_AMT_TYP, m.CLC_TAX_FREE_QTY_FLG
         FROM ${schema}.IAS_POS_BILL_MST m
         WHERE m.HUNG = 0
           AND EXISTS (SELECT 1 FROM ${schema}.IAS_POS_BILL_DTL d WHERE d.BILL_NO = m.BILL_NO)
         ORDER BY m.BILL_NO DESC
       ) WHERE ROWNUM <= :lim`,
      { lim: SAMPLE },
    );

    expect(heads.length).toBeGreaterThan(0);

    const mismatches: Array<{
      billNo: number;
      field: string;
      stored: number;
      computed: number;
    }> = [];

    for (const mst of heads) {
      const dtls = await query<DtlRow>(
        `SELECT I_CODE, I_QTY, I_PRICE, DIS_AMT_DTL, DIS_AMT_MST, VAT_PER, FREE_QTY
         FROM ${schema}.IAS_POS_BILL_DTL WHERE BILL_NO = :b ORDER BY I_CODE`,
        { b: mst.BILL_NO },
      );
      const bill = new Bill({
        billNo: String(mst.BILL_NO),
        vatCalcType:
          Number(mst.CLC_VAT_AMT_TYP) === 1 ? VatCalcType.ON_PRICE : VatCalcType.AFTER_DISCOUNT,
        taxFreeQtyFlag: Number(mst.CLC_TAX_FREE_QTY_FLG ?? 0),
        lines: dtls.map(
          (d) =>
            new BillLine({
              iCode: d.I_CODE,
              qty: Number(d.I_QTY),
              price: Number(d.I_PRICE ?? 0),
              discDtl: Number(d.DIS_AMT_DTL ?? 0),
              discMst: Number(d.DIS_AMT_MST ?? 0),
              vatPercent: Number(d.VAT_PER ?? 0),
              freeQty: Number(d.FREE_QTY ?? 0),
            }),
        ),
      });
      const t = bill.totals();
      const checks: Array<[string, number, number]> = [
        ['BILL_AMT', Number(mst.BILL_AMT), t.gross.toNumber()],
        ['VAT_AMT', Number(mst.VAT_AMT ?? 0), t.vat.toNumber()],
        ['DISC_AMT', Number(mst.DISC_AMT ?? 0), t.discount.toNumber()],
      ];
      for (const [field, stored, computed] of checks) {
        if (Math.abs(stored - computed) > TOLERANCE) {
          mismatches.push({ billNo: mst.BILL_NO, field, stored, computed });
        }
      }
    }

    if (mismatches.length > 0) {
      // surface details for analysis
      // eslint-disable-next-line no-console
      console.error('GOLDEN MISMATCHES:', JSON.stringify(mismatches.slice(0, 20), null, 2));
    }
    expect(mismatches).toEqual([]);
  });
});
