--------------------------------------------------------------------------------
-- V006 — MOTECH_POS loyalty points (نقاط الولاء) — POST020/POST021
--------------------------------------------------------------------------------
-- Run as MOTECH_POS:
--   sudo docker exec -i oracle12 sqlplus -S "MOTECH_POS/motech_pos_2026@//localhost:1521/xe" @V006__create_loyalty_points.sql
--
-- Purpose (mirrors YSPOS23 PKG_POS_POINT_PKG + Pos_Point_Calc_trns):
--   When a sale is attached to a loyalty customer, points are EARNED and a
--   movement row is written. The earning rule mirrors Get_Point_Cnt calc-type 1
--   (the common configuration): points = TRUNC(bill_amount / AMT_4POINT).
--   YSPOS23's IAS_POINT_TYP_MST is EMPTY in this environment (0 rows), so the
--   earning rate lives here as our own overlay config (LOYALTY_CONFIG). Points
--   history + balance are derived from POINTS_LEDGER.
--
-- Design principles (mirror V002..V005 / DATA_MODEL.md):
--   * PK = UUID v7 (VARCHAR2(36)). Money/amount = NUMBER(18,4). created_at TS.
--   * A ledger row is UNIQUE per (BILL_ID, TRNS_TYPE) so re-posting the same
--     bill never double-earns (idempotent earning tied to the immutable bill).
--   * TRNS_TYPE: 1 = EARN (كسب), 2 = REDEEM (استبدال), 3 = EXPIRE, 4 = ADJUST.
--------------------------------------------------------------------------------

SET ECHO ON
WHENEVER SQLERROR EXIT FAILURE

--==============================================================================
-- LOYALTY_CONFIG — earning-rule overlay (single active row per point type)
--==============================================================================
CREATE TABLE LOYALTY_CONFIG (
  ID             VARCHAR2(36)  NOT NULL,
  POINT_TYP_NO   NUMBER(6,0)   DEFAULT 1  NOT NULL,   -- ref IAS_POINT_TYP_MST
  CALC_TYPE      NUMBER(1,0)   DEFAULT 1  NOT NULL,   -- 1 = points per amount
  AMT_4POINT     NUMBER(18,4)  DEFAULT 100 NOT NULL,  -- riyals per 1 point
  POINT_CNT      NUMBER(18,4)  DEFAULT 1  NOT NULL,   -- points granted per unit (calc 2)
  TRUNCATE_FLAG  NUMBER(1,0)   DEFAULT 1  NOT NULL,   -- TRUNC earned points
  POINT_VALUE    NUMBER(18,6)  DEFAULT 1  NOT NULL,   -- monetary value of 1 point (redeem)
  ACTIVE         NUMBER(1,0)   DEFAULT 1  NOT NULL,
  CREATED_AT     TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_LOYALTY_CONFIG PRIMARY KEY (ID),
  CONSTRAINT UQ_LOYALTY_CONFIG_TYP UNIQUE (POINT_TYP_NO),
  CONSTRAINT CK_LOYALTY_CALC  CHECK (CALC_TYPE IN (1,2)),
  CONSTRAINT CK_LOYALTY_AMT   CHECK (AMT_4POINT > 0 AND POINT_CNT > 0)
);

-- Seed a sensible default (1 point per 100 riyals, truncated) — editable later.
INSERT INTO LOYALTY_CONFIG (ID, POINT_TYP_NO, CALC_TYPE, AMT_4POINT, POINT_CNT,
                            TRUNCATE_FLAG, POINT_VALUE, ACTIVE)
VALUES ('00000000-0000-7000-8000-000000000001', 1, 1, 100, 1, 1, 1, 1);

--==============================================================================
-- POINTS_LEDGER — loyalty movement history (analogue of Pos_Point_Calc_trns)
--==============================================================================
CREATE TABLE POINTS_LEDGER (
  ID             VARCHAR2(36)  NOT NULL,
  CUSTOMER_CODE  VARCHAR2(15)  NOT NULL,             -- ref IAS_CASH_CUSTMR / CUSTOMER
  POINT_TYP_NO   NUMBER(6,0)   DEFAULT 1  NOT NULL,
  TRNS_TYPE      NUMBER(1,0)   NOT NULL,             -- 1 earn,2 redeem,3 expire,4 adjust
  BILL_ID        VARCHAR2(36),                       -- ref MOTECH_POS BILLS.ID
  BILL_NO        VARCHAR2(40),                       -- ref BILL_NO (display)
  DOC_AMT        NUMBER(18,4)  DEFAULT 0  NOT NULL,  -- bill amount that generated points
  POINT_CNT      NUMBER(18,4)  NOT NULL,             -- +earn / -redeem
  POINT_AMT      NUMBER(18,4)  DEFAULT 0  NOT NULL,  -- monetary value moved
  SHIFT_ID       VARCHAR2(36),
  CASHIER_NO     NUMBER(10,0),
  NOTE           VARCHAR2(300),
  CREATED_AT     TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_POINTS_LEDGER PRIMARY KEY (ID),
  CONSTRAINT UQ_POINTS_BILL_TYP UNIQUE (BILL_ID, TRNS_TYPE),
  CONSTRAINT CK_POINTS_TRNS CHECK (TRNS_TYPE IN (1,2,3,4))
);

CREATE INDEX IX_POINTS_CUST  ON POINTS_LEDGER (CUSTOMER_CODE);
CREATE INDEX IX_POINTS_BILL  ON POINTS_LEDGER (BILL_ID);

PROMPT MOTECH_POS loyalty tables created (LOYALTY_CONFIG seeded, POINTS_LEDGER).
EXIT
