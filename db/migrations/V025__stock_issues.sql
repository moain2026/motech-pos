--------------------------------------------------------------------------------
-- V025 — STOCK_ISSUES + STOCK_ISSUE_LINES (التحويل المخزني الصادر — POST028)
--------------------------------------------------------------------------------
-- Run as MOTECH_POS:
--   sudo docker exec -i oracle12 sqlplus -S "MOTECH_POS/motech_pos_2026@//localhost:1521/xe" @V025__stock_issues.sql
--
-- Purpose:
--   Onyx POST028 (التحويل المخزني) DISPATCHES goods from a source warehouse
--   toward a destination — the stock effect is the ITEM_MOVEMENT rows with
--   DOC_TYPE=7 / IN_OUT=−1 (proven live: transfer-out doc 1/2 = DOC_TYPE 7,
--   IN_OUT −1 — the exact mirror of the DOC_TYPE 8 receipts). Together with
--   V022 (receipts) this closes the full cycle:
--     POST019 request → POST028 dispatch (stock leaves source)
--                     → POST029 receipt  (stock enters destination).
--
--   Same lifecycle as receipts: DRAFT → POSTED | CANCELLED; posting writes
--   the real ITEM_MOVEMENT rows in the same transaction and refreshes
--   MV_ITEM_AVL_QTY. Extra guard: the source warehouse must hold enough
--   AVAILABLE stock for every line at posting time (422 otherwise) — the
--   Onyx CHECK_AVL_QTY_PRC analogue.
--------------------------------------------------------------------------------

SET ECHO ON
WHENEVER SQLERROR EXIT FAILURE

CREATE TABLE STOCK_ISSUES (
  ID              VARCHAR2(36)  NOT NULL,
  ISSUE_NO        NUMBER(12,0)  NOT NULL,               -- human-friendly serial
  W_CODE          NUMBER(10,0)  NOT NULL,               -- المخزن المحول منه (source)
  DEST_W_CODE     NUMBER(10,0),                         -- المخزن المحول إليه (info)
  TRANSFER_ID     VARCHAR2(36),                         -- MOTECH_POS.MATERIAL_TRANSFERS.ID (optional)
  STATUS          VARCHAR2(12)  DEFAULT 'DRAFT' NOT NULL, -- DRAFT | POSTED | CANCELLED
  REF_NO          VARCHAR2(60),
  NOTE            VARCHAR2(500),
  CREATED_BY      VARCHAR2(50)  NOT NULL,
  CREATED_AT      TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  POSTED_BY       VARCHAR2(50),
  POSTED_AT       TIMESTAMP,
  POST_IDEMPOTENCY_KEY VARCHAR2(64),
  ONYX_DOC_NO     NUMBER(15,0),                         -- ITEM_MOVEMENT.DOC_NO (DOC_TYPE=7)
  ONYX_DOC_SER    NUMBER(38,0),
  CANCELLED_BY    VARCHAR2(50),
  CANCELLED_AT    TIMESTAMP,
  CONSTRAINT PK_STOCK_ISSUES PRIMARY KEY (ID),
  CONSTRAINT UQ_SI_ISSUE_NO UNIQUE (ISSUE_NO),
  CONSTRAINT UQ_SI_POST_KEY UNIQUE (POST_IDEMPOTENCY_KEY),
  CONSTRAINT CK_SI_STATUS CHECK (STATUS IN ('DRAFT','POSTED','CANCELLED')),
  CONSTRAINT CK_SI_DIFF_WH CHECK (DEST_W_CODE IS NULL OR DEST_W_CODE <> W_CODE),
  CONSTRAINT CK_SI_POSTED CHECK (
    (STATUS <> 'POSTED' AND POSTED_AT IS NULL) OR
    (STATUS =  'POSTED' AND POSTED_AT IS NOT NULL AND POSTED_BY IS NOT NULL
                        AND ONYX_DOC_NO IS NOT NULL AND ONYX_DOC_SER IS NOT NULL)
  ),
  CONSTRAINT CK_SI_CANCELLED CHECK (
    (STATUS <> 'CANCELLED' AND CANCELLED_AT IS NULL) OR
    (STATUS =  'CANCELLED' AND CANCELLED_AT IS NOT NULL AND CANCELLED_BY IS NOT NULL)
  )
);

CREATE TABLE STOCK_ISSUE_LINES (
  ID          VARCHAR2(36)  NOT NULL,
  ISSUE_ID    VARCHAR2(36)  NOT NULL,
  ITEM_CODE   VARCHAR2(30)  NOT NULL,
  ITEM_NAME   VARCHAR2(250),
  QTY         NUMBER(18,4)  NOT NULL,
  ITM_UNT     VARCHAR2(10),
  P_SIZE      NUMBER(18,4)  DEFAULT 1 NOT NULL,
  UNIT_COST   NUMBER(18,4),
  NOTE        VARCHAR2(250),
  CONSTRAINT PK_SI_LINES PRIMARY KEY (ID),
  CONSTRAINT FK_SIL_ISSUE FOREIGN KEY (ISSUE_ID) REFERENCES STOCK_ISSUES (ID),
  CONSTRAINT UQ_SIL_ITEM UNIQUE (ISSUE_ID, ITEM_CODE),
  CONSTRAINT CK_SIL_QTY CHECK (QTY > 0)
);

CREATE SEQUENCE SEQ_STOCK_ISSUE_NO START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE INDEX IX_SI_STATUS ON STOCK_ISSUES (STATUS, CREATED_AT);
CREATE INDEX IX_SIL_ISSUE ON STOCK_ISSUE_LINES (ISSUE_ID);

GRANT SELECT, INSERT, UPDATE ON STOCK_ISSUES      TO MOTECH_RW;
GRANT SELECT, INSERT         ON STOCK_ISSUE_LINES TO MOTECH_RW;
GRANT SELECT ON SEQ_STOCK_ISSUE_NO TO MOTECH_RW;

PROMPT V025 stock issues tables created.
EXIT
