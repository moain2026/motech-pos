--------------------------------------------------------------------------------
-- V027 — Financial Lane A: refund vouchers, cashier custody, shift variance
--------------------------------------------------------------------------------
-- Run as MOTECH_POS:
--   sudo docker exec -i oracle12 sqlplus -S "MOTECH_POS/motech_pos_2026@//localhost:1521/xe" @V027__financial_lane_a.sql
--
-- Covers four Onyx screens (all MOTECH_POS only — YSPOS23 is never touched):
--
--   POST006 (الدفع النقدي للمرتجعات) — a REFUND is cash leaving the drawer, so
--     it is modelled as an EXPENSE-direction voucher whose CATEGORY='REFUND'
--     and REFUND_RETURN_ID points at the MOTECH_POS return. A UNIQUE index on
--     REFUND_RETURN_ID enforces idempotency at the DB level: one return can
--     produce at most ONE refund voucher.
--
--   POST014 (عهدة الكاشيرات) — cash custody movements during the shift
--     (DEPOSIT into / WITHDRAW from the drawer). They adjust the expected-cash
--     figure used by the shift-close reconciliation:
--       expected = opening + cash sales + cash receipts - cash expenses
--                  + custody deposits - custody withdrawals.
--
--   POST015 (فائض/عجز الكاشيرات) — the settlement over/short (فرق التصفية) is
--     posted as an approved variance record when the shift is settled. It is a
--     permanent, immutable journal of the difference (one row per shift).
--
--   POST012 (ملخص مبيعات الكاشيرات) — no schema change; a read-only report that
--     breaks payment methods down PER CASHIER (BILLS.CASHIER_NO × PAYMENTS).
--------------------------------------------------------------------------------

SET ECHO ON
WHENEVER SQLERROR EXIT FAILURE

--==============================================================================
-- POST006 — refund vouchers linked to a return (idempotent 1:1)
--==============================================================================
-- Add the return link column (nullable — ordinary receipts/expenses keep NULL).
ALTER TABLE VOUCHERS ADD (REFUND_RETURN_ID VARCHAR2(36));

-- One return → at most one refund voucher (idempotency at the DB level).
CREATE UNIQUE INDEX UX_VOUCHERS_REFUND_RET
  ON VOUCHERS (REFUND_RETURN_ID);

--==============================================================================
-- POST014 — cashier custody movements (deposit / withdraw from the drawer)
--==============================================================================
CREATE TABLE CASHIER_CUSTODY (
  ID              VARCHAR2(36)   NOT NULL,
  CUSTODY_NO      NUMBER(12,0)   NOT NULL,               -- human-friendly serial
  SHIFT_ID        VARCHAR2(36)   NOT NULL,               -- the drawer/shift it affects
  CASHIER_NO      NUMBER(10,0)   NOT NULL,
  MACHINE_NO      NUMBER(10,0),
  DIRECTION       VARCHAR2(10)   NOT NULL,               -- DEPOSIT | WITHDRAW
  AMOUNT          NUMBER(18,4)   NOT NULL,               -- always > 0
  CURRENCY        VARCHAR2(7)    DEFAULT 'YER' NOT NULL,
  RATE            NUMBER(18,6)   DEFAULT 1 NOT NULL,
  AMOUNT_IN_SHIFT NUMBER(18,4)   NOT NULL,               -- AMOUNT * RATE
  REASON          VARCHAR2(400),                         -- سبب الإيداع/السحب
  STATUS          VARCHAR2(10)   DEFAULT 'POSTED' NOT NULL, -- POSTED | VOID
  IDEMPOTENCY_KEY VARCHAR2(64)   NOT NULL,
  CLIENT_OP_ID    VARCHAR2(64),
  CREATED_BY      VARCHAR2(50),
  ISSUED_AT       TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  CREATED_AT      TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_CASHIER_CUSTODY PRIMARY KEY (ID),
  CONSTRAINT UX_CUSTODY_IDEMPOTENCY UNIQUE (IDEMPOTENCY_KEY),
  CONSTRAINT CK_CUSTODY_DIR CHECK (DIRECTION IN ('DEPOSIT','WITHDRAW')),
  CONSTRAINT CK_CUSTODY_STATUS CHECK (STATUS IN ('POSTED','VOID')),
  CONSTRAINT CK_CUSTODY_AMT CHECK (AMOUNT > 0 AND RATE > 0 AND AMOUNT_IN_SHIFT > 0)
);

CREATE INDEX IX_CUSTODY_SHIFT ON CASHIER_CUSTODY (SHIFT_ID, STATUS);

CREATE SEQUENCE SEQ_CUSTODY_NO START WITH 1 INCREMENT BY 1 NOCACHE;

--==============================================================================
-- POST015 — shift settlement variance (over/short) posted record
--==============================================================================
CREATE TABLE SHIFT_VARIANCE (
  ID              VARCHAR2(36)   NOT NULL,
  VARIANCE_NO     NUMBER(12,0)   NOT NULL,               -- human-friendly serial
  SHIFT_ID        VARCHAR2(36)   NOT NULL,
  CASHIER_NO      NUMBER(10,0)   NOT NULL,
  CURRENCY        VARCHAR2(7)    DEFAULT 'YER' NOT NULL,
  EXPECTED_CASH   NUMBER(18,4)   NOT NULL,
  COUNTED_CASH    NUMBER(18,4)   NOT NULL,
  DIFFERENCE      NUMBER(18,4)   NOT NULL,               -- counted - expected (signed)
  KIND            VARCHAR2(10)   NOT NULL,               -- OVER | SHORT | BALANCED
  NOTE            VARCHAR2(400),
  POSTED_BY       NUMBER(10,0),                          -- supervisor/admin uid who settled
  POSTED_AT       TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_SHIFT_VARIANCE PRIMARY KEY (ID),
  -- One variance record per shift (posted once at settlement — immutable).
  CONSTRAINT UX_VARIANCE_SHIFT UNIQUE (SHIFT_ID),
  CONSTRAINT CK_VARIANCE_KIND CHECK (KIND IN ('OVER','SHORT','BALANCED'))
);

CREATE SEQUENCE SEQ_VARIANCE_NO START WITH 1 INCREMENT BY 1 NOCACHE;

--==============================================================================
-- Grants to the write user (MOTECH_RW) — same pattern as V025/V026.
-- (VOUCHERS itself already has table-level grants; the new column is covered.)
--==============================================================================
GRANT SELECT, INSERT, UPDATE ON CASHIER_CUSTODY TO MOTECH_RW;
GRANT SELECT, INSERT, UPDATE ON SHIFT_VARIANCE  TO MOTECH_RW;
GRANT SELECT ON SEQ_CUSTODY_NO  TO MOTECH_RW;
GRANT SELECT ON SEQ_VARIANCE_NO TO MOTECH_RW;

COMMIT;

PROMPT V027 applied — refund voucher link + cashier custody + shift variance.
