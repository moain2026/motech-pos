--------------------------------------------------------------------------------
-- V003 — MOTECH_POS returns (مردود المبيعات) write-side tables
--------------------------------------------------------------------------------
-- Run as MOTECH_POS:
--   sudo docker exec -i oracle12 sqlplus -S "MOTECH_POS/motech_pos_2026@//localhost:1521/xe" @V003__create_returns_tables.sql
--
-- Design principles (mirror V002 / DATA_MODEL.md / FLOW_RETURN.md):
--   * A return is a SEPARATE, immutable document that REFERENCES the original
--     sale bill (ORIGINAL_BILL_NO) — the original sale is never mutated.
--   * PK = UUID v7 stored as VARCHAR2(36) (offline-generatable, time-ordered).
--   * Money = NUMBER(18,4). created_at = TIMESTAMP (immutable audit).
--   * idempotency_key UNIQUE (anti-duplicate for offline-sync retries).
--   * No FK back to YSPOS23 (cross-schema, read-only). ORIGINAL_BILL_NO stored
--     as a plain reference value; sold-qty / existence checks are enforced in
--     the domain against YSPOS23 (read-only) at write time.
--   * CHECK constraints enforce money/qty invariants at the DB layer too.
--------------------------------------------------------------------------------

SET ECHO ON
WHENEVER SQLERROR EXIT FAILURE

--==============================================================================
-- RETURNS — return (refund) header (immutable after save)
--==============================================================================
CREATE TABLE RETURNS (
  ID                VARCHAR2(36)  NOT NULL,
  RT_BILL_NO        VARCHAR2(40)  NOT NULL,            -- our generated legal no.
  ORIGINAL_BILL_NO  VARCHAR2(40)  NOT NULL,            -- ref YSPOS23 original BILL_NO
  ORIGINAL_BILL_ID  VARCHAR2(36),                      -- ref MOTECH_POS BILLS.ID (if ours)
  SHIFT_ID          VARCHAR2(36),                      -- ref SHIFTS.ID
  CASHIER_NO        NUMBER(10,0)  NOT NULL,
  MACHINE_NO        NUMBER(10,0),
  RETURN_TYPE       NUMBER(3,0)   DEFAULT 3  NOT NULL, -- 3=cash refund (RETURN_TYPE)
  CUSTOMER_CODE     VARCHAR2(15),
  CUSTOMER_NAME     VARCHAR2(100),
  CURRENCY          VARCHAR2(7)   DEFAULT 'YER' NOT NULL,
  TAX_CALC_TYPE     NUMBER(1,0)   DEFAULT 2  NOT NULL, -- 1=on price,2=after discount
  GROSS_AMT         NUMBER(18,4)  DEFAULT 0  NOT NULL, -- SUM(qty*price) returned
  DISCOUNT_AMT      NUMBER(18,4)  DEFAULT 0  NOT NULL, -- reversed discount
  VAT_AMT           NUMBER(18,4)  DEFAULT 0  NOT NULL, -- reversed VAT
  NET_AMT           NUMBER(18,4)  DEFAULT 0  NOT NULL, -- gross - discount + vat
  REFUND_AMT        NUMBER(18,4)  DEFAULT 0  NOT NULL, -- net - replacement value
  STATUS            VARCHAR2(10)  DEFAULT 'POSTED' NOT NULL,
  IDEMPOTENCY_KEY   VARCHAR2(64)  NOT NULL,            -- anti-duplicate
  CLIENT_OP_ID      VARCHAR2(36),                      -- request hash / uuid v7
  ISSUED_AT         TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  CREATED_AT        TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_RETURNS PRIMARY KEY (ID),
  CONSTRAINT UQ_RETURNS_NO          UNIQUE (RT_BILL_NO),
  CONSTRAINT UQ_RETURNS_IDEMPOTENCY UNIQUE (IDEMPOTENCY_KEY),
  CONSTRAINT CK_RETURNS_STATUS      CHECK (STATUS IN ('POSTED','VOID')),
  CONSTRAINT CK_RETURNS_TAXTYPE     CHECK (TAX_CALC_TYPE IN (1,2)),
  CONSTRAINT CK_RETURNS_AMTS        CHECK (GROSS_AMT >= 0 AND DISCOUNT_AMT >= 0
                                          AND VAT_AMT >= 0)
);

CREATE INDEX IX_RETURNS_ORIGINAL ON RETURNS (ORIGINAL_BILL_NO);
CREATE INDEX IX_RETURNS_SHIFT    ON RETURNS (SHIFT_ID);
CREATE INDEX IX_RETURNS_ISSUED   ON RETURNS (ISSUED_AT);

-- Return numbering: server-side safe sequence (serializable insert guards dup).
CREATE SEQUENCE SEQ_RETURN_NO START WITH 1 INCREMENT BY 1 NOCACHE;

--==============================================================================
-- RETURN_LINES — return detail (immutable; child of RETURNS)
--==============================================================================
CREATE TABLE RETURN_LINES (
  ID               VARCHAR2(36)  NOT NULL,
  RETURN_ID        VARCHAR2(36)  NOT NULL,
  LINE_NO          NUMBER(6,0)   NOT NULL,             -- order (RCRD_NO analogue)
  ITEM_CODE        VARCHAR2(30)  NOT NULL,             -- ref YSPOS23 I_CODE
  ITEM_NAME        VARCHAR2(200),
  QTY              NUMBER(18,4)  NOT NULL,             -- returned qty (> 0)
  UNIT_PRICE       NUMBER(18,4)  NOT NULL,             -- I_PRICE excl VAT
  DISC_DTL         NUMBER(18,4)  DEFAULT 0  NOT NULL,  -- per-unit detail discount
  DISC_MST         NUMBER(18,4)  DEFAULT 0  NOT NULL,  -- per-unit allocated head disc
  VAT_PERCENT      NUMBER(7,4)   DEFAULT 0  NOT NULL,
  LINE_GROSS       NUMBER(18,4)  NOT NULL,             -- qty*price
  LINE_DISCOUNT    NUMBER(18,4)  DEFAULT 0  NOT NULL,
  LINE_VAT         NUMBER(18,4)  DEFAULT 0  NOT NULL,
  LINE_NET         NUMBER(18,4)  NOT NULL,             -- gross-disc (excl vat)
  REPLACE_AMOUNT   NUMBER(18,4)  DEFAULT 0  NOT NULL,  -- RT_RPLC_AMT (item swap)
  ITEM_UNIT        VARCHAR2(20),
  CREATED_AT       TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_RETURN_LINES PRIMARY KEY (ID),
  CONSTRAINT UQ_RETURN_LINE_NO UNIQUE (RETURN_ID, LINE_NO),
  CONSTRAINT FK_RETURN_LINES_RETURN FOREIGN KEY (RETURN_ID)
    REFERENCES RETURNS (ID),
  CONSTRAINT CK_RETURN_LINES_QTY   CHECK (QTY > 0),
  CONSTRAINT CK_RETURN_LINES_PRICE CHECK (UNIT_PRICE >= 0 AND REPLACE_AMOUNT >= 0)
);

CREATE INDEX IX_RETURN_LINES_RETURN ON RETURN_LINES (RETURN_ID);

PROMPT MOTECH_POS returns tables created (RETURNS, RETURN_LINES, SEQ_RETURN_NO).
EXIT
