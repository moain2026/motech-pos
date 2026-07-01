--------------------------------------------------------------------------------
-- V005 — MOTECH_POS vouchers (سندات قبض/صرف) — Receipts & Expenses
--         (POST025 المقبوضات / POST026 المصروفات)
--------------------------------------------------------------------------------
-- Run as MOTECH_POS:
--   sudo docker exec -i oracle12 sqlplus -S "MOTECH_POS/motech_pos_2026@//localhost:1521/xe" @V005__create_vouchers.sql
--
-- Purpose (mirrors YSPOS23 POS_GNR_RCPTS / POS_GNR_EXPNS +
--          PKG_POS_RCPTS_EXPNS_API_PKG.INSRT_RCPTS / INSRT_EXPNS):
--   A cash voucher records money moving IN (RECEIPT / قبض) or OUT (EXPENSE / صرف)
--   of the drawer, OUTSIDE the sale flow (e.g. supplier payment, owner draw,
--   miscellaneous income). Vouchers are attached to a shift and feed the
--   shift-close cash reconciliation (expected cash = opening + cash sales
--   + cash receipts - cash expenses).
--
-- Design principles (mirror V002/V003/V004 / DATA_MODEL.md):
--   * PK = UUID v7 (VARCHAR2(36), offline-generatable, time-ordered).
--   * Money = NUMBER(18,4) (NUMERIC — never float). Currency + rate kept.
--   * created_at = TIMESTAMP (immutable audit).
--   * idempotency_key UNIQUE (anti-duplicate for offline-sync retries).
--   * No FK back to YSPOS23. CHECK constraints enforce type/amount invariants.
--------------------------------------------------------------------------------

SET ECHO ON
WHENEVER SQLERROR EXIT FAILURE

--==============================================================================
-- VOUCHERS — cash receipt / expense voucher (immutable after save)
--==============================================================================
CREATE TABLE VOUCHERS (
  ID               VARCHAR2(36)   NOT NULL,
  VOUCHER_NO       VARCHAR2(40)   NOT NULL,            -- our generated no.
  VOUCHER_TYPE     VARCHAR2(10)   NOT NULL,            -- RECEIPT (قبض) | EXPENSE (صرف)
  SHIFT_ID         VARCHAR2(36),                       -- ref SHIFTS.ID
  CASHIER_NO       NUMBER(10,0)   NOT NULL,
  MACHINE_NO       NUMBER(10,0),
  AMOUNT           NUMBER(18,4)   NOT NULL,            -- tender amount (> 0)
  CURRENCY         VARCHAR2(7)    DEFAULT 'YER' NOT NULL,
  RATE             NUMBER(18,6)   DEFAULT 1  NOT NULL, -- currency rate to bill currency
  AMOUNT_IN_SHIFT  NUMBER(18,4)   NOT NULL,            -- AMOUNT*RATE (shift currency)
  PAYMENT_METHOD   VARCHAR2(10)   DEFAULT 'CASH' NOT NULL, -- CASH | CARD | BANK
  DESCRIPTION      VARCHAR2(400),                      -- البيان / السبب
  PARTY_NAME       VARCHAR2(200),                      -- المستفيد / الدافع
  CATEGORY         VARCHAR2(60),                       -- تصنيف اختياري
  STATUS           VARCHAR2(10)   DEFAULT 'POSTED' NOT NULL,
  IDEMPOTENCY_KEY  VARCHAR2(64)   NOT NULL,            -- anti-duplicate
  CLIENT_OP_ID     VARCHAR2(64),                       -- request hash / uuid v7
  ISSUED_AT        TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  CREATED_AT       TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_VOUCHERS PRIMARY KEY (ID),
  CONSTRAINT UQ_VOUCHERS_NO          UNIQUE (VOUCHER_NO),
  CONSTRAINT UQ_VOUCHERS_IDEMPOTENCY UNIQUE (IDEMPOTENCY_KEY),
  CONSTRAINT CK_VOUCHERS_TYPE   CHECK (VOUCHER_TYPE IN ('RECEIPT','EXPENSE')),
  CONSTRAINT CK_VOUCHERS_METHOD CHECK (PAYMENT_METHOD IN ('CASH','CARD','BANK')),
  CONSTRAINT CK_VOUCHERS_STATUS CHECK (STATUS IN ('POSTED','VOID')),
  CONSTRAINT CK_VOUCHERS_AMT    CHECK (AMOUNT > 0 AND RATE > 0 AND AMOUNT_IN_SHIFT > 0)
);

CREATE INDEX IX_VOUCHERS_SHIFT  ON VOUCHERS (SHIFT_ID);
CREATE INDEX IX_VOUCHERS_TYPE   ON VOUCHERS (VOUCHER_TYPE);
CREATE INDEX IX_VOUCHERS_ISSUED ON VOUCHERS (ISSUED_AT);

-- Voucher numbering: server-side safe sequence (serializable insert guards dup).
CREATE SEQUENCE SEQ_VOUCHER_NO START WITH 1 INCREMENT BY 1 NOCACHE;

PROMPT MOTECH_POS voucher table created (VOUCHERS, SEQ_VOUCHER_NO).
EXIT
