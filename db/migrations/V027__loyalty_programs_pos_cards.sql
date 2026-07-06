--------------------------------------------------------------------------------
-- V027 — Loyalty programs CRUD (POSI008) + POS card types overlay (POSI012)
--------------------------------------------------------------------------------
-- Run as MOTECH_POS:
--   sudo docker exec -i oracle12 sqlplus -S "MOTECH_POS/motech_pos_2026@//localhost:1521/xe" @V027__loyalty_programs_pos_cards.sql
--
-- Lane B — الولاء والبطاقات:
--   1) POSI008 (ترميز برامج نقاطي): a loyalty PROGRAM is a named, versioned
--      earning rule (calc method + limits + validity window). It supersedes
--      the single-row LOYALTY_CONFIG overlay (V006): the ACTIVE program of a
--      point type drives earnOnSale. LOYALTY_CONFIG stays as a legacy fallback
--      so nothing breaks if no program is defined.
--   2) POSI012 (بطاقات POS — IAS_POS_CARD): the ERP table IAS_POS_CARD does
--      NOT exist in this environment (verified via ALL_OBJECTS). The real card
--      master is IAS202623.CREDIT_CARD_TYPES (8 rows, SACRED read-only). So we
--      follow the proven overlay pattern (V016 SUPPLIERS_OVERLAY, etc.): a
--      CARD_TYPES_OVERLAY in MOTECH_POS; reads MERGE the ERP master with the
--      overlay (overlay wins), origin = ERP | LOCAL | EDIT.
--
-- Golden rules honoured: proof-not-assumption (real DDL verified), NUMERIC for
-- money (NUMBER(18,x)), UUID v7 PK, created_at TS, no ERP writes.
--------------------------------------------------------------------------------

SET ECHO ON
WHENEVER SQLERROR EXIT FAILURE

--==============================================================================
-- LOYALTY_PROGRAMS — named loyalty programs (POSI008)
--   * calcType 1 = points per AMT_4POINT riyals (TRUNC/round per TRUNCATE_FLAG)
--   * calcType 2 = (billAmount / AMT_4POINT) * POINT_CNT
--   * MIN_BILL_AMT : ignore bills below this threshold (0 = no minimum)
--   * MAX_POINTS_PER_BILL : cap points granted per bill (0 = no cap)
--   * START_DATE / END_DATE : validity window (NULL = open-ended)
--   * ONE active program per POINT_TYP_NO (partial unique via trigger-free
--     approach: unique index on (POINT_TYP_NO) WHERE ACTIVE=1 is emulated by a
--     function-based unique index).
--==============================================================================
CREATE TABLE LOYALTY_PROGRAMS (
  ID                  VARCHAR2(36)  NOT NULL,
  NAME                VARCHAR2(120) NOT NULL,             -- برنامج النقاط (اسم)
  POINT_TYP_NO        NUMBER(6,0)   DEFAULT 1  NOT NULL,  -- ref IAS_POINT_TYP_MST
  CALC_TYPE           NUMBER(1,0)   DEFAULT 1  NOT NULL,  -- 1 | 2
  AMT_4POINT          NUMBER(18,4)  DEFAULT 100 NOT NULL, -- riyals per point block
  POINT_CNT           NUMBER(18,4)  DEFAULT 1  NOT NULL,  -- points per unit (calc 2)
  TRUNCATE_FLAG       NUMBER(1,0)   DEFAULT 1  NOT NULL,  -- TRUNC earned points
  POINT_VALUE         NUMBER(18,6)  DEFAULT 1  NOT NULL,  -- monetary value of 1 point (redeem)
  MIN_BILL_AMT        NUMBER(18,4)  DEFAULT 0  NOT NULL,  -- floor to earn (0 = none)
  MAX_POINTS_PER_BILL NUMBER(18,4)  DEFAULT 0  NOT NULL,  -- cap per bill (0 = none)
  START_DATE          DATE,                               -- validity from (NULL = open)
  END_DATE            DATE,                               -- validity to   (NULL = open)
  ACTIVE              NUMBER(1,0)   DEFAULT 1  NOT NULL,
  CREATED_BY          NUMBER(10,0),
  CREATED_AT          TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  UPDATED_AT          TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_LOYALTY_PROGRAMS PRIMARY KEY (ID),
  CONSTRAINT CK_LP_CALC   CHECK (CALC_TYPE IN (1,2)),
  CONSTRAINT CK_LP_AMT    CHECK (AMT_4POINT > 0 AND POINT_CNT > 0),
  CONSTRAINT CK_LP_MIN    CHECK (MIN_BILL_AMT >= 0),
  CONSTRAINT CK_LP_MAX    CHECK (MAX_POINTS_PER_BILL >= 0),
  CONSTRAINT CK_LP_TRUNC  CHECK (TRUNCATE_FLAG IN (0,1)),
  CONSTRAINT CK_LP_ACTIVE CHECK (ACTIVE IN (0,1)),
  CONSTRAINT CK_LP_DATES  CHECK (START_DATE IS NULL OR END_DATE IS NULL OR END_DATE >= START_DATE)
);

-- At most ONE active program per point type (function-based unique index:
-- ACTIVE rows collapse to POINT_TYP_NO, inactive rows map to NULL → not unique).
CREATE UNIQUE INDEX UX_LP_ONE_ACTIVE
  ON LOYALTY_PROGRAMS (CASE WHEN ACTIVE = 1 THEN POINT_TYP_NO END);

--==============================================================================
-- CARD_TYPES_OVERLAY — POS card types (POSI012), merged with the ERP master
-- IAS202623.CREDIT_CARD_TYPES (which stays SACRED read-only).
--   business key = CARD_NO (CR_CARD_NO in the ERP).
--   ORIGIN LOCAL = new card only in MOTECH_POS; EDIT = local override of an
--   ERP card. Reads merge ERP + overlay; overlay wins (origin ERP|LOCAL|EDIT).
--==============================================================================
CREATE TABLE CARD_TYPES_OVERLAY (
  ID          VARCHAR2(36)   NOT NULL,
  CARD_NO     NUMBER(5,0)    NOT NULL,               -- business key (CR_CARD_NO)
  ORIGIN      VARCHAR2(6)    DEFAULT 'LOCAL' NOT NULL, -- LOCAL | EDIT
  AR_NAME     VARCHAR2(100),                          -- CR_CARD_NAME
  EN_NAME     VARCHAR2(100),                          -- CR_CARD_E_NAME
  CARD_TYPE   NUMBER(5,0),                            -- CR_CARD_TYPE (network kind)
  BANK_NO     NUMBER(10,0),                           -- BANK_NO
  COMM_PCT    NUMBER(9,4),                            -- COMM_PER (commission %)
  COMM_CALC_TYPE NUMBER(1,0),                         -- COMM_CALC_TYPE (0/1)
  DUE_PERIOD  NUMBER(3,0),                            -- DUE_PERIOD (settlement days)
  BANK_AC     VARCHAR2(30),                           -- BANK_AC
  INACTIVE    NUMBER(1,0)    DEFAULT 0 NOT NULL,
  CREATED_AT  TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  UPDATED_AT  TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_CARD_TYPES_OVERLAY PRIMARY KEY (ID),
  CONSTRAINT UQ_CARD_TYPES_OVERLAY_NO UNIQUE (CARD_NO),
  CONSTRAINT CK_CARD_TYPES_OVERLAY_ORGN CHECK (ORIGIN IN ('LOCAL','EDIT')),
  CONSTRAINT CK_CARD_TYPES_OVERLAY_INAC CHECK (INACTIVE IN (0,1))
);

-- Local card-number allocator (LOCAL cards start well above ERP range to avoid
-- collisions with CR_CARD_NO). ERP currently maxes at 8.
CREATE SEQUENCE SEQ_LOCAL_CARD_NO START WITH 900 INCREMENT BY 1 NOCACHE;

--==============================================================================
-- Grants: the API writes through the least-privilege MOTECH_RW user.
--==============================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON LOYALTY_PROGRAMS  TO MOTECH_RW;
GRANT SELECT, INSERT, UPDATE, DELETE ON CARD_TYPES_OVERLAY TO MOTECH_RW;
GRANT SELECT ON SEQ_LOCAL_CARD_NO TO MOTECH_RW;

PROMPT V027 loyalty programs + POS card types overlay created.
EXIT
