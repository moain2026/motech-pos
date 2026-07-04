--==============================================================================
-- V023 — ITEM_MOVEMENT receipt grants (الاستلام المخزني POST029) — run as SYSTEM/DBA
--
-- Precedent: V010 granted MOTECH_RW write access to the REAL Onyx returns
-- tables (IAS_POS_RT_BILL_MST/DTL). Stock receiving needs the same treatment:
-- in Onyx, a saved receipt (POST029 / INSTALL_TR) materialises as
-- ITEM_MOVEMENT rows with DOC_TYPE=8 / IN_OUT=+1 — and MV_ITEM_AVL_QTY sums
-- exactly ITEM_MOVEMENT (± unposted POS bills/returns). Writing those rows is
-- the ONLY honest way for an approval to truly increase available stock.
--
-- YSPOS23.ITEM_MOVEMENT is a synonym for IAS202623.ITEM_MOVEMENT (verified
-- via DBA_OBJECTS). Least-privilege: INSERT only (no UPDATE/DELETE — receipts
-- are append-only movements) + SELECT (DOC_NO numbering + cost snapshots) +
-- SELECT on the three numbering sequences the live rows use:
--   IAS_SERIAL_SEQ   → SERIAL        (PK ITMMOV_PK)
--   IAS_DOC_SEQ      → DOC_SEQUENCE  (INV_ITMMV_DOC_SQ_INDX)
--   GNR_DOC_PST_SQ   → DOC_SER       (ITMMOV_UQ member, YYYY + 10-digit)
--==============================================================================

GRANT SELECT, INSERT ON ias202623.item_movement TO MOTECH_RW;
GRANT SELECT ON ias202623.ias_serial_seq  TO MOTECH_RW;
GRANT SELECT ON ias202623.ias_doc_seq     TO MOTECH_RW;
GRANT SELECT ON ias202623.gnr_doc_pst_sq  TO MOTECH_RW;

EXIT
