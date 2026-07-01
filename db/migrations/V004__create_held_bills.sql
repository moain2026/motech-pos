--------------------------------------------------------------------------------
-- V004 — MOTECH_POS held (hung) bills — Hold/Resume (POST003 / IAS_POS_HUNG_BILLS)
--------------------------------------------------------------------------------
-- Run as MOTECH_POS:
--   sudo docker exec -i oracle12 sqlplus -S "MOTECH_POS/motech_pos_2026@//localhost:1521/xe" @V004__create_held_bills.sql
--
-- Purpose (mirrors YSPOS23 IAS_POS_HUNG_BILLS + HUNG handling in POST001):
--   A cashier parks an in-progress sale (to serve another customer), then
--   resumes it later. Held bills are TEMPORARY and MUTABLE while HELD; on resume
--   they are consumed (marked RESUMED) and turned into a real POSTED bill by the
--   normal PostBill flow. They are NOT invoices and never carry a BILL_NO.
--
-- Design principles (mirror V002/V003 / DATA_MODEL.md):
--   * PK = UUID v7 (VARCHAR2(36), offline-generatable, time-ordered).
--   * Cart payload (lines + header discount + customer + tax type) is stored as
--     a self-describing snapshot: header columns for querying + LINES_JSON CLOB
--     for faithful reconstruction on resume (no data loss / no re-pricing drift).
--   * Money = NUMBER(18,4). created_at/updated_at = TIMESTAMP.
--   * idempotency_key UNIQUE (anti-duplicate for offline-sync retries).
--   * No FK back to YSPOS23. CHECK constraints enforce status/amount invariants.
--------------------------------------------------------------------------------

SET ECHO ON
WHENEVER SQLERROR EXIT FAILURE

--==============================================================================
-- HELD_BILLS — parked (hung) sale snapshot
--==============================================================================
CREATE TABLE HELD_BILLS (
  ID               VARCHAR2(36)   NOT NULL,
  HOLD_NO          NUMBER(12,0)   NOT NULL,             -- human/seq reference
  LABEL            VARCHAR2(100),                       -- optional tag (table/customer)
  SHIFT_ID         VARCHAR2(36)   NOT NULL,             -- ref SHIFTS.ID
  CASHIER_NO       NUMBER(10,0)   NOT NULL,             -- ref USER_R/CSHR_NO
  MACHINE_NO       NUMBER(10,0),                        -- ref IAS_POS_MACHINE
  CUSTOMER_CODE    VARCHAR2(15),
  CUSTOMER_NAME    VARCHAR2(100),
  CURRENCY         VARCHAR2(7)    DEFAULT 'YER' NOT NULL,
  TAX_CALC_TYPE    NUMBER(1,0)    DEFAULT 2   NOT NULL, -- 1=on price,2=after discount
  HEADER_DISCOUNT  NUMBER(18,4)   DEFAULT 0   NOT NULL, -- head discount to allocate
  LINE_COUNT       NUMBER(6,0)    DEFAULT 0   NOT NULL, -- number of parked lines
  EST_NET_AMT      NUMBER(18,4)   DEFAULT 0   NOT NULL, -- estimated net (display only)
  LINES_JSON       CLOB           NOT NULL,             -- faithful cart snapshot (JSON)
  STATUS           VARCHAR2(10)   DEFAULT 'HELD' NOT NULL,  -- HELD | RESUMED | CANCELLED
  IDEMPOTENCY_KEY  VARCHAR2(64)   NOT NULL,             -- anti-duplicate
  CLIENT_OP_ID     VARCHAR2(36),                        -- request hash / uuid v7
  RESUMED_BILL_ID  VARCHAR2(36),                        -- BILLS.ID produced on resume
  CREATED_AT       TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  UPDATED_AT       TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_HELD_BILLS PRIMARY KEY (ID),
  CONSTRAINT UQ_HELD_BILLS_IDEMP UNIQUE (IDEMPOTENCY_KEY),
  CONSTRAINT FK_HELD_BILLS_SHIFT FOREIGN KEY (SHIFT_ID) REFERENCES SHIFTS (ID),
  CONSTRAINT CK_HELD_BILLS_STATUS CHECK (STATUS IN ('HELD','RESUMED','CANCELLED')),
  CONSTRAINT CK_HELD_BILLS_TAXTYPE CHECK (TAX_CALC_TYPE IN (1,2)),
  CONSTRAINT CK_HELD_BILLS_AMTS   CHECK (HEADER_DISCOUNT >= 0 AND LINE_COUNT >= 0
                                        AND EST_NET_AMT >= 0),
  CONSTRAINT CK_HELD_BILLS_JSON   CHECK (LINES_JSON IS JSON)
);

CREATE INDEX IX_HELD_BILLS_CASHIER ON HELD_BILLS (CASHIER_NO, STATUS);
CREATE INDEX IX_HELD_BILLS_SHIFT   ON HELD_BILLS (SHIFT_ID);
CREATE INDEX IX_HELD_BILLS_CREATED ON HELD_BILLS (CREATED_AT);

-- Held-bill numbering: server-side safe sequence.
CREATE SEQUENCE SEQ_HOLD_NO START WITH 1 INCREMENT BY 1 NOCACHE;

PROMPT MOTECH_POS held-bills table created (HELD_BILLS, SEQ_HOLD_NO).
EXIT
