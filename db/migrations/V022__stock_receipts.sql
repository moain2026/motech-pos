--------------------------------------------------------------------------------
-- V022 — STOCK_RECEIPTS + STOCK_RECEIPT_LINES (الاستلام المخزني — POST029)
--------------------------------------------------------------------------------
-- Run as MOTECH_POS:
--   sudo docker exec -i oracle12 sqlplus -S "MOTECH_POS/motech_pos_2026@//localhost:1521/xe" @V022__stock_receipts.sql
--
-- Purpose:
--   Onyx POST029 (الاستلام المخزني) receives incoming warehouse transfers:
--   the document lands in IAS_WHTRNS_MST/DTL (TR_INOUT_TYPE=2) and the STOCK
--   effect is the ITEM_MOVEMENT rows with DOC_TYPE=8 / IN_OUT=+1 (proven by
--   the live rows: transfer-out = DOC_TYPE 7 / IN_OUT −1, receipt-in =
--   DOC_TYPE 8 / IN_OUT +1 — MV_ITEM_AVL_QTY sums exactly these).
--
--   Motech keeps the receipt DOCUMENT here (DRAFT → POSTED | CANCELLED);
--   POSTING writes the real ITEM_MOVEMENT rows (V023 grants) in the same
--   transaction and then refreshes MV_ITEM_AVL_QTY — approval truly
--   increases available stock, exactly like Onyx's INSTALL_TR.
--
--   * RECEIPT_NO is a human-friendly serial (SEQ_STOCK_RECEIPT_NO).
--   * Warehouse validated LIVE against YSPOS23.WAREHOUSE_DETAILS.
--   * POST_IDEMPOTENCY_KEY makes approval replay-safe (POST018 pattern).
--   * Optional TRANSFER_ID links the receipt to a Motech POST019 request.
--------------------------------------------------------------------------------

SET ECHO ON
WHENEVER SQLERROR EXIT FAILURE

CREATE TABLE STOCK_RECEIPTS (
  ID              VARCHAR2(36)  NOT NULL,
  RECEIPT_NO      NUMBER(12,0)  NOT NULL,               -- human-friendly serial
  W_CODE          NUMBER(10,0)  NOT NULL,               -- المخزن المستلِم (destination)
  SOURCE_W_CODE   NUMBER(10,0),                         -- المخزن المحول منه (optional)
  TRANSFER_ID     VARCHAR2(36),                         -- MOTECH_POS.MATERIAL_TRANSFERS.ID (optional link)
  STATUS          VARCHAR2(12)  DEFAULT 'DRAFT' NOT NULL, -- DRAFT | POSTED | CANCELLED
  REF_NO          VARCHAR2(60),                         -- رقم المرجع (مستند يدوي)
  NOTE            VARCHAR2(500),
  CREATED_BY      VARCHAR2(50)  NOT NULL,               -- username (JWT sub)
  CREATED_AT      TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  POSTED_BY       VARCHAR2(50),
  POSTED_AT       TIMESTAMP,
  POST_IDEMPOTENCY_KEY VARCHAR2(64),                    -- replay-safe approval
  ONYX_DOC_NO     NUMBER(15,0),                         -- ITEM_MOVEMENT.DOC_NO (DOC_TYPE=8)
  ONYX_DOC_SER    NUMBER(38,0),                         -- ITEM_MOVEMENT.DOC_SER (GNR_DOC_PST_SQ)
  CANCELLED_BY    VARCHAR2(50),
  CANCELLED_AT    TIMESTAMP,
  CONSTRAINT PK_STOCK_RECEIPTS PRIMARY KEY (ID),
  CONSTRAINT UQ_SR_RECEIPT_NO UNIQUE (RECEIPT_NO),
  CONSTRAINT UQ_SR_POST_KEY UNIQUE (POST_IDEMPOTENCY_KEY),
  CONSTRAINT CK_SR_STATUS CHECK (STATUS IN ('DRAFT','POSTED','CANCELLED')),
  CONSTRAINT CK_SR_DIFF_WH CHECK (SOURCE_W_CODE IS NULL OR SOURCE_W_CODE <> W_CODE),
  CONSTRAINT CK_SR_POSTED CHECK (
    (STATUS <> 'POSTED' AND POSTED_AT IS NULL) OR
    (STATUS =  'POSTED' AND POSTED_AT IS NOT NULL AND POSTED_BY IS NOT NULL
                        AND ONYX_DOC_NO IS NOT NULL AND ONYX_DOC_SER IS NOT NULL)
  ),
  CONSTRAINT CK_SR_CANCELLED CHECK (
    (STATUS <> 'CANCELLED' AND CANCELLED_AT IS NULL) OR
    (STATUS =  'CANCELLED' AND CANCELLED_AT IS NOT NULL AND CANCELLED_BY IS NOT NULL)
  )
);

CREATE TABLE STOCK_RECEIPT_LINES (
  ID          VARCHAR2(36)  NOT NULL,
  RECEIPT_ID  VARCHAR2(36)  NOT NULL,                   -- FK → STOCK_RECEIPTS
  ITEM_CODE   VARCHAR2(30)  NOT NULL,
  ITEM_NAME   VARCHAR2(250),                            -- Arabic name snapshot
  QTY         NUMBER(18,4)  NOT NULL,                   -- received qty (sale units)
  ITM_UNT     VARCHAR2(10),                             -- unit snapshot (default unit)
  P_SIZE      NUMBER(18,4)  DEFAULT 1 NOT NULL,         -- pack size snapshot
  UNIT_COST   NUMBER(18,4),                             -- cost snapshot (last known)
  NOTE        VARCHAR2(250),
  CONSTRAINT PK_SR_LINES PRIMARY KEY (ID),
  CONSTRAINT FK_SRL_RECEIPT FOREIGN KEY (RECEIPT_ID) REFERENCES STOCK_RECEIPTS (ID),
  CONSTRAINT UQ_SRL_ITEM UNIQUE (RECEIPT_ID, ITEM_CODE),
  CONSTRAINT CK_SRL_QTY CHECK (QTY > 0)
);

CREATE SEQUENCE SEQ_STOCK_RECEIPT_NO START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE INDEX IX_SR_STATUS ON STOCK_RECEIPTS (STATUS, CREATED_AT);
CREATE INDEX IX_SRL_RECEIPT ON STOCK_RECEIPT_LINES (RECEIPT_ID);

GRANT SELECT, INSERT, UPDATE ON STOCK_RECEIPTS      TO MOTECH_RW;
GRANT SELECT, INSERT         ON STOCK_RECEIPT_LINES TO MOTECH_RW;
GRANT SELECT ON SEQ_STOCK_RECEIPT_NO TO MOTECH_RW;

PROMPT V022 stock receipts tables created.
EXIT
