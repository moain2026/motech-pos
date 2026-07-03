--==============================================================================
-- V010 — Onyx (YSPOS23) returns + stock integration  (run as SYSTEM/DBA)
--
-- 1) Returns are now written into the REAL Onyx RT tables
--    (IAS_POS_RT_BILL_MST/DTL) — same tables EXTRCT_POS_RT_BILL_PRC fills.
-- 2) Stock (MV_ITEM_AVL_QTY) is refreshed after every sale/return so the
--    available qty reflects the new document immediately. The MV computes:
--      ITEM_MOVEMENT  −  unposted BILL_DTL qty  +  unposted RT_BILL_DTL qty
--    → a sale decrements, a return increments. The MV container has
--    EXPIRE_DATE/BATCH_NO NOT NULL, so writers must use the legacy "no batch"
--    convention: BATCH_NO='0', EXPIRE_DATE=DATE '1900-01-01' (never NULL).
--==============================================================================

-- Backfill any Motech-written bill lines that predate the convention.
UPDATE yspos23.ias_pos_bill_dtl SET expire_date = DATE '1900-01-01' WHERE expire_date IS NULL;
UPDATE yspos23.ias_pos_bill_dtl SET batch_no = '0' WHERE batch_no IS NULL;
COMMIT;

-- Definer-rights refresh helper: MOTECH_RW gets EXECUTE only (no direct
-- DBMS_MVIEW / MV privileges).
CREATE OR REPLACE PROCEDURE yspos23.motech_refresh_avl_qty AS
BEGIN
  DBMS_MVIEW.REFRESH('YSPOS23.MV_ITEM_AVL_QTY', 'C');
END;
/
GRANT EXECUTE ON yspos23.motech_refresh_avl_qty TO MOTECH_RW;

-- RT (returns) numbering: header sequence mirrors POS_BILLS_SEQ; the line
-- sequence POS_RT_BILL_DTL_SEQ already exists in YSPOS23.
CREATE SEQUENCE yspos23.pos_rt_bills_seq START WITH 1 INCREMENT BY 1 NOCACHE;

-- Least-privilege grants for the writer.
GRANT SELECT, INSERT, UPDATE ON yspos23.ias_pos_rt_bill_mst TO MOTECH_RW;
GRANT SELECT, INSERT, UPDATE ON yspos23.ias_pos_rt_bill_dtl TO MOTECH_RW;
GRANT SELECT ON yspos23.pos_rt_bills_seq    TO MOTECH_RW;
GRANT SELECT ON yspos23.pos_rt_bill_dtl_seq TO MOTECH_RW;
