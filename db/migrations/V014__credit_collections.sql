--------------------------------------------------------------------------------
-- V014 — CREDIT_COLLECTIONS (تحصيل الفواتير الآجلة — POST010/POST011)
--------------------------------------------------------------------------------
-- Run as MOTECH_POS:
--   sudo docker exec -i oracle12 sqlplus -S "MOTECH_POS/motech_pos_2026@//localhost:1521/xe" @V014__credit_collections.sql
--
-- Purpose:
--   * A bill settled with a CREDIT tender leaves the customer owing that
--     amount (receivable). Collections are LATER cash/card receipts against
--     that debt (mirrors IAS_POS_PAY_BILLS settlement semantics, POST010/011).
--   * One row per collection receipt; outstanding debt per bill =
--     SUM(PAYMENTS.AMOUNT_IN_BILL WHERE METHOD='CREDIT') − SUM(collections).
--   * IDEMPOTENCY_KEY UNIQUE = anti-duplicate backstop for offline retries.
--------------------------------------------------------------------------------

SET ECHO ON
WHENEVER SQLERROR EXIT FAILURE

CREATE TABLE CREDIT_COLLECTIONS (
  ID               VARCHAR2(36)   NOT NULL,
  BILL_ID          VARCHAR2(36)   NOT NULL,             -- FK → BILLS (the credit bill)
  CUSTOMER_CODE    VARCHAR2(15)   NOT NULL,             -- the debtor (credit account)
  METHOD           VARCHAR2(10)   DEFAULT 'CASH' NOT NULL, -- CASH | CARD receipt
  CURRENCY         VARCHAR2(7)    DEFAULT 'YER' NOT NULL,
  AMOUNT           NUMBER(18,4)   NOT NULL,             -- in receipt currency
  RATE             NUMBER(18,8)   DEFAULT 1   NOT NULL, -- rate to bill currency
  AMOUNT_IN_BILL   NUMBER(18,4)   NOT NULL,             -- amount * rate (bill ccy)
  CASHIER_NO       NUMBER(10,0),
  NOTE             VARCHAR2(250),
  IDEMPOTENCY_KEY  VARCHAR2(64)   NOT NULL,
  CREATED_AT       TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_CREDIT_COLLECTIONS PRIMARY KEY (ID),
  CONSTRAINT FK_CREDCOLL_BILL FOREIGN KEY (BILL_ID) REFERENCES BILLS (ID),
  CONSTRAINT UQ_CREDCOLL_IDEMPOTENCY UNIQUE (IDEMPOTENCY_KEY),
  CONSTRAINT CK_CREDCOLL_METHOD CHECK (METHOD IN ('CASH','CARD')),
  CONSTRAINT CK_CREDCOLL_AMOUNT CHECK (AMOUNT > 0 AND AMOUNT_IN_BILL > 0)
);

CREATE INDEX IX_CREDCOLL_BILL ON CREDIT_COLLECTIONS (BILL_ID);
CREATE INDEX IX_CREDCOLL_CUST ON CREDIT_COLLECTIONS (CUSTOMER_CODE);

-- The app connects as MOTECH_RW — grant it DML on the new table.
GRANT SELECT, INSERT ON CREDIT_COLLECTIONS TO MOTECH_RW;

PROMPT CREDIT_COLLECTIONS created (POST010/011 credit-bill collection).
EXIT
