--------------------------------------------------------------------------------
-- V030 — Local promotions overlay (عروض محلية على متجر Motech)
--------------------------------------------------------------------------------
-- Run as MOTECH_POS:
--   sudo docker exec -i oracle12 sqlplus -S "MOTECH_POS/motech_pos_2026@//localhost:1521/xe" < V030__promotions_overlay.sql
--
-- Purpose (Lane E — POST001 promotion engine):
--   The ERP promotion catalog (IAS202623.IAS_QUT_PRM_MST/_DTL) is SACRED and
--   read-only. To let the POS define/refine promotions locally (and to have a
--   working discount promo for the live proof), we add a MOTECH_POS overlay
--   mirroring the header/detail shape the engine consumes. The engine merges
--   ERP promotions + LOCAL overlay promotions (same evaluation rules).
--
--   PROMO_MST: one promotion (period, type, POS/day/time window, invoice-amount
--              & free-as-discount flags).
--   PROMO_DTL: rules bound to items (or whole bill): qty/amount tier, LEV_PRICE,
--              DISC_TYPE/DISC_AMT_PER, buy-X (COMP_QTY) get-Y (FREE_QTY) [of
--              QT_I_CODE].
--------------------------------------------------------------------------------

SET ECHO ON
WHENEVER SQLERROR EXIT FAILURE

CREATE TABLE PROMO_MST (
  ID              VARCHAR2(36)   PRIMARY KEY,             -- uuid v7
  QUOT_NO         NUMBER(15)     NOT NULL,                -- local promo no (9000+)
  DESCRIPTION     VARCHAR2(250),
  PRM_TYPE        NUMBER(2)      DEFAULT 2 NOT NULL,       -- 1 = buy-X, 2 = tier
  PRM_METHOD      NUMBER(2)      DEFAULT 1,
  FROM_DATE       DATE           NOT NULL,
  TO_DATE         DATE           NOT NULL,
  FROM_TIME       VARCHAR2(5),                            -- HH24:MI or null
  TO_TIME         VARCHAR2(5),
  DOW_MASK        VARCHAR2(20),                            -- e.g. '1,2,3' or null=every day
  BY_INVOICE_AMT  NUMBER(1)      DEFAULT 0 NOT NULL,
  FREE_AS_DISC    NUMBER(1)      DEFAULT 0 NOT NULL,
  INACTIVE        NUMBER(1)      DEFAULT 0 NOT NULL,
  CREATED_BY      VARCHAR2(50),
  CREATED_AT      TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  UPDATED_AT      TIMESTAMP,
  CONSTRAINT CK_PROMO_MST_TYPE  CHECK (PRM_TYPE IN (1,2)),
  CONSTRAINT CK_PROMO_MST_INV   CHECK (BY_INVOICE_AMT IN (0,1)),
  CONSTRAINT CK_PROMO_MST_FAD   CHECK (FREE_AS_DISC IN (0,1)),
  CONSTRAINT CK_PROMO_MST_IA    CHECK (INACTIVE IN (0,1)),
  CONSTRAINT CK_PROMO_MST_DATES CHECK (TO_DATE >= FROM_DATE),
  CONSTRAINT UQ_PROMO_MST_QUOTNO UNIQUE (QUOT_NO)
);

CREATE SEQUENCE SEQ_LOCAL_PROMO_NO START WITH 9000 INCREMENT BY 1 NOCACHE;

CREATE TABLE PROMO_DTL (
  ID            VARCHAR2(36)   PRIMARY KEY,               -- uuid v7
  QUOT_NO       NUMBER(15)     NOT NULL,
  RCRD_NO       NUMBER(10)     NOT NULL,
  I_CODE        VARCHAR2(30),                             -- null = whole bill
  ITM_UNT       VARCHAR2(10),
  F_QTY         NUMBER(18,4),
  T_QTY         NUMBER(18,4),
  F_AMT         NUMBER(18,4),
  T_AMT         NUMBER(18,4),
  DISC_TYPE     NUMBER(2),                                -- 1 = %, 2 = fixed/unit
  DISC_AMT_PER  NUMBER(18,4),
  LEV_PRICE     NUMBER(18,4),
  QT_I_CODE     VARCHAR2(30),
  QT_ITM_UNT    VARCHAR2(10),
  FREE_QTY      NUMBER(18,4),
  COMP_QTY      NUMBER(18,4),
  QT_QTY        NUMBER(18,4),
  CONSTRAINT FK_PROMO_DTL_MST FOREIGN KEY (QUOT_NO)
    REFERENCES PROMO_MST (QUOT_NO) ON DELETE CASCADE
);

CREATE INDEX IX_PROMO_DTL_QUOTNO ON PROMO_DTL (QUOT_NO);
CREATE INDEX IX_PROMO_DTL_ICODE  ON PROMO_DTL (I_CODE);

-- Grants to the write user (MOTECH_RW) — same pattern as V025/V026/V028.
GRANT SELECT, INSERT, UPDATE, DELETE ON PROMO_MST TO MOTECH_RW;
GRANT SELECT, INSERT, UPDATE, DELETE ON PROMO_DTL TO MOTECH_RW;
GRANT SELECT ON SEQ_LOCAL_PROMO_NO TO MOTECH_RW;

PROMPT PROMO_MST / PROMO_DTL overlay created (+ SEQ_LOCAL_PROMO_NO + grants).
EXIT
