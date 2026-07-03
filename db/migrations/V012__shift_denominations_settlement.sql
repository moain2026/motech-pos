--------------------------------------------------------------------------------
-- V012 — Shift cash count by denominations + approved settlement (POST013)
--------------------------------------------------------------------------------
-- Run as MOTECH_POS:
--   sudo docker exec -i oracle12 sqlplus -S "MOTECH_POS/motech_pos_2026@//localhost:1521/xe" @V012__shift_denominations_settlement.sql
--
-- Purpose (POST013 — تصفية مبيعات الكاشيرات):
--   * SHIFT_DENOMINATIONS — counted cash broken down by currency denomination
--     (e.g. 1000×5, 500×10 …). Sum = actual counted cash for the shift.
--   * SHIFTS gains a SETTLED lifecycle state (approved settlement): counted
--     cash, over/short difference, settle timestamp/actor/note. A SETTLED
--     shift is immutable — settlement cannot be repeated.
--------------------------------------------------------------------------------

SET ECHO ON
WHENEVER SQLERROR EXIT FAILURE

CREATE TABLE SHIFT_DENOMINATIONS (
  ID                  VARCHAR2(36)   NOT NULL,
  SHIFT_ID            VARCHAR2(36)   NOT NULL,
  CURRENCY            VARCHAR2(7)    NOT NULL,
  DENOMINATION_VALUE  NUMBER(18,4)   NOT NULL,            -- face value (1000, 500 …)
  DENOM_COUNT         NUMBER(9,0)    NOT NULL,            -- how many notes/coins
  AMOUNT              NUMBER(18,4)   NOT NULL,            -- value × count
  CREATED_AT          TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_SHIFT_DENOMS PRIMARY KEY (ID),
  CONSTRAINT FK_SHIFT_DENOMS_SHIFT FOREIGN KEY (SHIFT_ID) REFERENCES SHIFTS (ID),
  CONSTRAINT UX_SHIFT_DENOMS UNIQUE (SHIFT_ID, CURRENCY, DENOMINATION_VALUE),
  CONSTRAINT CK_SHIFT_DENOMS_VALUE CHECK (DENOMINATION_VALUE > 0),
  CONSTRAINT CK_SHIFT_DENOMS_COUNT CHECK (DENOM_COUNT >= 0)
);

CREATE INDEX IX_SHIFT_DENOMS_SHIFT ON SHIFT_DENOMINATIONS (SHIFT_ID);

-- SHIFTS: SETTLED lifecycle (OPEN -> CLOSED -> SETTLED)
ALTER TABLE SHIFTS ADD COUNTED_CASH      NUMBER(18,4);
ALTER TABLE SHIFTS ADD SETTLE_DIFFERENCE NUMBER(18,4);
ALTER TABLE SHIFTS ADD SETTLED_AT        TIMESTAMP;
ALTER TABLE SHIFTS ADD SETTLED_BY        NUMBER(6,0);
ALTER TABLE SHIFTS ADD SETTLE_NOTE       VARCHAR2(250);

ALTER TABLE SHIFTS DROP CONSTRAINT CK_SHIFTS_STATUS;
ALTER TABLE SHIFTS ADD CONSTRAINT CK_SHIFTS_STATUS
  CHECK (STATUS IN ('OPEN','CLOSED','SETTLED'));

-- App users: MOTECH_RW writes, MOTECH_RO reads.
GRANT SELECT, INSERT, UPDATE, DELETE ON SHIFT_DENOMINATIONS TO MOTECH_RW;
GRANT SELECT ON SHIFT_DENOMINATIONS TO MOTECH_RO;

PROMPT SHIFT_DENOMINATIONS created; SHIFTS extended with SETTLED settlement.
EXIT
