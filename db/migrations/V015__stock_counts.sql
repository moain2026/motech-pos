--------------------------------------------------------------------------------
-- V015 — STOCK_COUNTS + STOCK_COUNT_LINES (الجرد الفعلي — POST018/POST022)
--------------------------------------------------------------------------------
-- Run as MOTECH_POS:
--   sudo docker exec -i oracle12 sqlplus -S "MOTECH_POS/motech_pos_2026@//localhost:1521/xe" @V015__stock_counts.sql
--
-- Purpose:
--   * A stock count (جرد) session: header per warehouse with DRAFT/POSTED
--     lifecycle; lines capture the SYSTEM qty (snapshot of
--     YSPOS23.MV_ITEM_AVL_QTY at entry time), the physically COUNTED qty and
--     the variance (DIFF = COUNTED − SYSTEM).
--   * Posting freezes the count (POSTED is terminal — no edits, no repost).
--     POST_IDEMPOTENCY_KEY UNIQUE = anti-duplicate backstop for retries.
--   * Count data lives ONLY in MOTECH_POS (audit record). No stock mutation
--     in YSPOS23 — variances feed reports/adjustment decisions, mirroring
--     Onyx POST018 (IAS_POS_AUD_ITEM) semantics.
--------------------------------------------------------------------------------

SET ECHO ON
WHENEVER SQLERROR EXIT FAILURE

CREATE TABLE STOCK_COUNTS (
  ID                    VARCHAR2(36)  NOT NULL,
  W_CODE                NUMBER(10,0)  NOT NULL,              -- warehouse being counted
  STATUS                VARCHAR2(10)  DEFAULT 'DRAFT' NOT NULL, -- DRAFT | POSTED
  NOTE                  VARCHAR2(250),
  CREATED_BY            VARCHAR2(50)  NOT NULL,              -- username (JWT sub)
  CREATED_AT            TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  POSTED_BY             VARCHAR2(50),                        -- approver username
  POSTED_AT             TIMESTAMP,
  POST_IDEMPOTENCY_KEY  VARCHAR2(64),                        -- set on approval
  CONSTRAINT PK_STOCK_COUNTS PRIMARY KEY (ID),
  CONSTRAINT UQ_STKCNT_POST_IDEMP UNIQUE (POST_IDEMPOTENCY_KEY),
  CONSTRAINT CK_STKCNT_STATUS CHECK (STATUS IN ('DRAFT','POSTED')),
  CONSTRAINT CK_STKCNT_POSTED CHECK (
    (STATUS = 'DRAFT'  AND POSTED_AT IS NULL) OR
    (STATUS = 'POSTED' AND POSTED_AT IS NOT NULL
                       AND POSTED_BY IS NOT NULL
                       AND POST_IDEMPOTENCY_KEY IS NOT NULL)
  )
);

CREATE TABLE STOCK_COUNT_LINES (
  ID           VARCHAR2(36)  NOT NULL,
  COUNT_ID     VARCHAR2(36)  NOT NULL,          -- FK → STOCK_COUNTS
  ITEM_CODE    VARCHAR2(30)  NOT NULL,
  ITEM_NAME    VARCHAR2(250),                   -- Arabic name snapshot (IAS_ITM_MST)
  SYSTEM_QTY   NUMBER(18,4)  NOT NULL,          -- MV_ITEM_AVL_QTY at entry time
  COUNTED_QTY  NUMBER(18,4)  NOT NULL,          -- physical count (>= 0)
  DIFF_QTY     NUMBER(18,4)  NOT NULL,          -- COUNTED_QTY - SYSTEM_QTY
  COUNTED_AT   TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_STOCK_COUNT_LINES PRIMARY KEY (ID),
  CONSTRAINT FK_STKCNTL_COUNT FOREIGN KEY (COUNT_ID) REFERENCES STOCK_COUNTS (ID),
  CONSTRAINT UQ_STKCNTL_ITEM UNIQUE (COUNT_ID, ITEM_CODE),
  CONSTRAINT CK_STKCNTL_COUNTED CHECK (COUNTED_QTY >= 0)
);

CREATE INDEX IX_STKCNT_STATUS ON STOCK_COUNTS (STATUS, CREATED_AT);
CREATE INDEX IX_STKCNTL_COUNT ON STOCK_COUNT_LINES (COUNT_ID);

-- The app connects as MOTECH_RW — grant it DML on the new tables.
GRANT SELECT, INSERT, UPDATE ON STOCK_COUNTS TO MOTECH_RW;
GRANT SELECT, INSERT, UPDATE ON STOCK_COUNT_LINES TO MOTECH_RW;

PROMPT STOCK_COUNTS + STOCK_COUNT_LINES created (POST018 stock count).
EXIT
