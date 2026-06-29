--------------------------------------------------------------------------------
-- V002 — MOTECH_POS write-side tables (clean design from docs/DATA_MODEL.md)
--------------------------------------------------------------------------------
-- Run as MOTECH_POS:
--   sudo docker exec -i oracle12 sqlplus -S "MOTECH_POS/motech_pos_2026@//localhost:1521/xe" @V002__create_tables.sql
--
-- Design principles (DATA_MODEL.md / STANDARDS 03,04,13):
--   * PK = UUID v7 stored as VARCHAR2(36) (offline-generatable, time-ordered).
--   * Money = NUMBER(18,4) (NUMERIC — never float). Currency code kept alongside.
--   * created_at = TIMESTAMP (immutable audit). Bills are immutable after save.
--   * idempotency_key UNIQUE on bills (anti-duplicate for offline-sync retries).
--   * No FK back to YSPOS23 (cross-schema, read-only). Reference codes stored as
--     plain values (I_CODE, MACHINE_NO, CSHR_NO) — joined logically in domain.
--   * CHECK constraints enforce money/qty/status invariants at the DB layer too.
--------------------------------------------------------------------------------

SET ECHO ON
WHENEVER SQLERROR EXIT FAILURE

--==============================================================================
-- SHIFTS — our own cashier work shifts (mirrors POS_WRK_SHFT_CSHR semantics)
--==============================================================================
CREATE TABLE SHIFTS (
  ID               VARCHAR2(36)   NOT NULL,
  SHIFT_NO         NUMBER(12,0)   NOT NULL,            -- human/seq number
  SHIFT_CODE       VARCHAR2(20),                       -- ref POS_WRK_SHFT.SHFT_CODE (YSPOS23)
  CASHIER_NO       NUMBER(10,0)   NOT NULL,            -- ref USER_R/CSHR_NO
  MACHINE_NO       NUMBER(10,0),                       -- ref IAS_POS_MACHINE
  OPENING_BALANCE  NUMBER(18,4)   DEFAULT 0  NOT NULL,
  CURRENCY         VARCHAR2(7)    DEFAULT 'YER' NOT NULL,
  STATUS           VARCHAR2(10)   DEFAULT 'OPEN' NOT NULL,  -- OPEN | CLOSED
  OPENED_AT        TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  CLOSED_AT        TIMESTAMP,
  CLOSING_BALANCE  NUMBER(18,4),
  EXPECTED_CASH    NUMBER(18,4),
  CASH_DIFFERENCE  NUMBER(18,4),
  CLOSE_NOTE       VARCHAR2(250),
  CREATED_AT       TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_SHIFTS PRIMARY KEY (ID),
  CONSTRAINT CK_SHIFTS_STATUS  CHECK (STATUS IN ('OPEN','CLOSED')),
  CONSTRAINT CK_SHIFTS_OPENBAL CHECK (OPENING_BALANCE >= 0)
);

-- A cashier may have only ONE open shift at a time (selling precondition).
CREATE UNIQUE INDEX UX_SHIFTS_ONE_OPEN
  ON SHIFTS (CASE WHEN STATUS = 'OPEN' THEN CASHIER_NO END);

CREATE SEQUENCE SEQ_SHIFT_NO START WITH 1 INCREMENT BY 1 NOCACHE;

--==============================================================================
-- BILLS — invoice header (immutable after save)
--==============================================================================
CREATE TABLE BILLS (
  ID               VARCHAR2(36)   NOT NULL,
  BILL_NO          VARCHAR2(40)   NOT NULL,            -- our generated legal no.
  SHIFT_ID         VARCHAR2(36)   NOT NULL,
  CASHIER_NO       NUMBER(10,0)   NOT NULL,
  MACHINE_NO       NUMBER(10,0),
  BILL_TYPE        NUMBER(3,0)    DEFAULT 1   NOT NULL,  -- 1=sale
  CUSTOMER_CODE    VARCHAR2(15),
  CUSTOMER_NAME    VARCHAR2(100),
  CURRENCY         VARCHAR2(7)    DEFAULT 'YER' NOT NULL,
  TAX_CALC_TYPE    NUMBER(1,0)    DEFAULT 2   NOT NULL,  -- 1=on price,2=after discount
  GROSS_AMT        NUMBER(18,4)   DEFAULT 0   NOT NULL,  -- SUM(qty*price)
  DISCOUNT_AMT     NUMBER(18,4)   DEFAULT 0   NOT NULL,
  VAT_AMT          NUMBER(18,4)   DEFAULT 0   NOT NULL,
  NET_AMT          NUMBER(18,4)   DEFAULT 0   NOT NULL,  -- gross - discount + vat
  PAID_AMT         NUMBER(18,4)   DEFAULT 0   NOT NULL,
  STATUS           VARCHAR2(10)   DEFAULT 'POSTED' NOT NULL, -- POSTED (immutable)
  IDEMPOTENCY_KEY  VARCHAR2(64)   NOT NULL,            -- anti-duplicate
  CLIENT_OP_ID     VARCHAR2(36),                       -- uuid v7 from client
  ISSUED_AT        TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  CREATED_AT       TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_BILLS PRIMARY KEY (ID),
  CONSTRAINT UQ_BILLS_NO          UNIQUE (BILL_NO),
  CONSTRAINT UQ_BILLS_IDEMPOTENCY UNIQUE (IDEMPOTENCY_KEY),
  CONSTRAINT FK_BILLS_SHIFT       FOREIGN KEY (SHIFT_ID) REFERENCES SHIFTS (ID),
  CONSTRAINT CK_BILLS_STATUS      CHECK (STATUS IN ('POSTED','VOID')),
  CONSTRAINT CK_BILLS_TAXTYPE     CHECK (TAX_CALC_TYPE IN (1,2)),
  CONSTRAINT CK_BILLS_AMTS        CHECK (GROSS_AMT >= 0 AND DISCOUNT_AMT >= 0
                                        AND VAT_AMT >= 0 AND PAID_AMT >= 0)
);

CREATE INDEX IX_BILLS_SHIFT  ON BILLS (SHIFT_ID);
CREATE INDEX IX_BILLS_ISSUED ON BILLS (ISSUED_AT);

-- Bill numbering: server-side safe sequence (serializable insert guards dup).
CREATE SEQUENCE SEQ_BILL_NO START WITH 1 INCREMENT BY 1 NOCACHE;

--==============================================================================
-- BILL_LINES — invoice detail (immutable; child of BILLS)
--==============================================================================
CREATE TABLE BILL_LINES (
  ID               VARCHAR2(36)   NOT NULL,
  BILL_ID          VARCHAR2(36)   NOT NULL,
  LINE_NO          NUMBER(6,0)    NOT NULL,            -- order on screen (RCRD_NO)
  ITEM_CODE        VARCHAR2(30)   NOT NULL,            -- ref YSPOS23 I_CODE
  ITEM_NAME        VARCHAR2(200),
  QTY              NUMBER(18,4)   NOT NULL,
  FREE_QTY         NUMBER(18,4)   DEFAULT 0   NOT NULL,
  UNIT_PRICE       NUMBER(18,4)   NOT NULL,            -- I_PRICE excl VAT
  DISC_DTL         NUMBER(18,4)   DEFAULT 0   NOT NULL, -- per-unit detail discount
  DISC_MST         NUMBER(18,4)   DEFAULT 0   NOT NULL, -- per-unit allocated head disc
  VAT_PERCENT      NUMBER(7,4)    DEFAULT 0   NOT NULL,
  LINE_GROSS       NUMBER(18,4)   NOT NULL,            -- qty*price
  LINE_DISCOUNT    NUMBER(18,4)   DEFAULT 0   NOT NULL,
  LINE_VAT         NUMBER(18,4)   DEFAULT 0   NOT NULL,
  LINE_NET         NUMBER(18,4)   NOT NULL,            -- gross-disc (excl vat)
  ITEM_UNIT        VARCHAR2(20),
  CREATED_AT       TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_BILL_LINES PRIMARY KEY (ID),
  CONSTRAINT UQ_BILL_LINE_NO UNIQUE (BILL_ID, LINE_NO),
  CONSTRAINT FK_BILL_LINES_BILL FOREIGN KEY (BILL_ID)
    REFERENCES BILLS (ID),
  CONSTRAINT CK_BILL_LINES_QTY   CHECK (QTY >= 0 AND FREE_QTY >= 0),
  CONSTRAINT CK_BILL_LINES_PRICE CHECK (UNIT_PRICE >= 0)
);

CREATE INDEX IX_BILL_LINES_BILL ON BILL_LINES (BILL_ID);

--==============================================================================
-- PAYMENTS — one row per payment line (cash/card/credit), child of BILLS
--==============================================================================
CREATE TABLE PAYMENTS (
  ID               VARCHAR2(36)   NOT NULL,
  BILL_ID          VARCHAR2(36)   NOT NULL,
  SHIFT_ID         VARCHAR2(36)   NOT NULL,
  METHOD           VARCHAR2(10)   NOT NULL,            -- CASH | CARD | CREDIT
  CURRENCY         VARCHAR2(7)    DEFAULT 'YER' NOT NULL,
  AMOUNT           NUMBER(18,4)   NOT NULL,            -- in payment currency
  RATE             NUMBER(18,8)   DEFAULT 1   NOT NULL, -- exchange rate to bill ccy
  AMOUNT_IN_BILL   NUMBER(18,4)   NOT NULL,            -- amount * rate (bill ccy)
  CARD_NO          VARCHAR2(30),                       -- masked card ref (CARD)
  CUSTOMER_CODE    VARCHAR2(15),                       -- credit customer (CREDIT)
  CREATED_AT       TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_PAYMENTS PRIMARY KEY (ID),
  CONSTRAINT FK_PAYMENTS_BILL  FOREIGN KEY (BILL_ID)  REFERENCES BILLS (ID),
  CONSTRAINT FK_PAYMENTS_SHIFT FOREIGN KEY (SHIFT_ID) REFERENCES SHIFTS (ID),
  CONSTRAINT CK_PAYMENTS_METHOD CHECK (METHOD IN ('CASH','CARD','CREDIT')),
  CONSTRAINT CK_PAYMENTS_AMOUNT CHECK (AMOUNT > 0)
);

CREATE INDEX IX_PAYMENTS_BILL  ON PAYMENTS (BILL_ID);
CREATE INDEX IX_PAYMENTS_SHIFT ON PAYMENTS (SHIFT_ID);

PROMPT MOTECH_POS tables created (SHIFTS, BILLS, BILL_LINES, PAYMENTS).
EXIT
