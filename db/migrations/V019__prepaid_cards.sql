--------------------------------------------------------------------------------
-- V019 — PREPAID_CARDS + PREPAID_CARD_MOVEMENTS (POSI007/POSI200 بطاقات الدفع المسبق)
--------------------------------------------------------------------------------
-- Run as MOTECH_POS:
--   sudo docker exec -i oracle12 sqlplus -S "MOTECH_POS/motech_pos_2026@//localhost:1521/xe" @V019__prepaid_cards.sql
--
-- Purpose:
--   * POSI007 codes prepaid cards & coupons used as a tender in multi-pay:
--     card number (unique), currency, amount, remaining amount, customer link.
--     Live YSPOS23.IAS_POS_CUSTOMER_CARD_AMOUNT is EMPTY → MOTECH_POS is
--     authoritative (same decision as keypads).
--   * POSI200 shows customer card balances + movement history — served from
--     PREPAID_CARD_MOVEMENTS (every top-up / redemption / adjustment).
--------------------------------------------------------------------------------

SET ECHO ON
WHENEVER SQLERROR EXIT FAILURE

CREATE TABLE PREPAID_CARDS (
  ID            VARCHAR2(36)   NOT NULL,
  CARD_NO       VARCHAR2(60)   NOT NULL,             -- business key (unique)
  CARD_TYPE     VARCHAR2(10)   DEFAULT 'CARD' NOT NULL, -- CARD | COUPON
  CURRENCY      VARCHAR2(7)    DEFAULT 'YER' NOT NULL,  -- A_CY
  AMOUNT        NUMBER(18,3)   NOT NULL,             -- CARD_AMT (face value)
  REMAINING     NUMBER(18,3)   NOT NULL,             -- REM_CARD_AMT
  CUSTOMER_CODE VARCHAR2(15),                        -- C_CODE (optional link)
  DESCRIPTION   VARCHAR2(250),                       -- CARD_DESC
  EXPIRE_DATE   DATE,
  INACTIVE      NUMBER(1,0)    DEFAULT 0 NOT NULL,
  CREATED_BY    VARCHAR2(50)   NOT NULL,             -- username (JWT sub)
  CREATED_AT    TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  UPDATED_AT    TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_PREPAID_CARDS PRIMARY KEY (ID),
  CONSTRAINT UQ_PREPAID_CARDS_NO UNIQUE (CARD_NO),
  CONSTRAINT CK_PREPAID_CARDS_TYPE CHECK (CARD_TYPE IN ('CARD','COUPON')),
  CONSTRAINT CK_PREPAID_CARDS_AMT CHECK (AMOUNT >= 0),
  CONSTRAINT CK_PREPAID_CARDS_REM CHECK (REMAINING >= 0)
);
CREATE INDEX IX_PREPAID_CARDS_CUST ON PREPAID_CARDS (CUSTOMER_CODE);

CREATE TABLE PREPAID_CARD_MOVEMENTS (
  ID          VARCHAR2(36)  NOT NULL,
  CARD_NO     VARCHAR2(60)  NOT NULL,
  MOVE_TYPE   VARCHAR2(10)  NOT NULL,                -- ISSUE | TOPUP | REDEEM | ADJUST
  AMOUNT      NUMBER(18,3)  NOT NULL,                -- signed delta on REMAINING
  BALANCE     NUMBER(18,3)  NOT NULL,                -- REMAINING after the move
  REF         VARCHAR2(60),                          -- e.g. bill no / note ref
  NOTE        VARCHAR2(250),
  CREATED_BY  VARCHAR2(50)  NOT NULL,
  CREATED_AT  TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_PREPAID_CARD_MOVES PRIMARY KEY (ID),
  CONSTRAINT FK_PREPAID_CARD_MOVES FOREIGN KEY (CARD_NO)
    REFERENCES PREPAID_CARDS (CARD_NO),
  CONSTRAINT CK_PREPAID_MOVE_TYPE
    CHECK (MOVE_TYPE IN ('ISSUE','TOPUP','REDEEM','ADJUST'))
);
CREATE INDEX IX_PREPAID_MOVES_CARD ON PREPAID_CARD_MOVEMENTS (CARD_NO, CREATED_AT);

GRANT SELECT, INSERT, UPDATE, DELETE ON PREPAID_CARDS          TO MOTECH_RW;
GRANT SELECT, INSERT, UPDATE, DELETE ON PREPAID_CARD_MOVEMENTS TO MOTECH_RW;

PROMPT V019 prepaid cards tables created.
EXIT
