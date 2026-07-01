--------------------------------------------------------------------------------
-- V008 — MOTECH_POS local overlays for customers & items (POSI010 / POSI2000)
--------------------------------------------------------------------------------
-- Run as MOTECH_POS:
--   sudo docker exec -i oracle12 sqlplus -S "MOTECH_POS/motech_pos_2026@//localhost:1521/xe" @V008__create_overlays.sql
--
-- Purpose:
--   YSPOS23 / IAS202623 are the LIVE ERP (SACRED, READ-ONLY). We must still let
--   the cashier ADD a new local customer/item and EDIT a few local fields
--   (price / name / contact) without touching the ERP. We store those local
--   creates/edits in overlay tables here; READ endpoints MERGE the ERP master
--   with the overlay (overlay wins for edited fields; overlay-only rows are
--   surfaced as local/new).
--
-- Design principles (mirror V002..V006 / DATA_MODEL.md):
--   * PK = UUID v7 (VARCHAR2(36)). Money = NUMBER(18,4). created/updated TS.
--   * The natural business key (CODE) is UNIQUE so a code maps to one overlay.
--   * ORIGIN: 'LOCAL' = created here (no ERP row); 'EDIT' = local edit of an
--     existing ERP record. Merge logic uses this to decide surfacing.
--------------------------------------------------------------------------------

SET ECHO ON
WHENEVER SQLERROR EXIT FAILURE

--==============================================================================
-- CUSTOMERS_OVERLAY — local customer creates/edits (POSI010)
--==============================================================================
CREATE TABLE CUSTOMERS_OVERLAY (
  ID           VARCHAR2(36)  NOT NULL,
  CODE         VARCHAR2(15)  NOT NULL,             -- business key (C_CODE)
  ORIGIN       VARCHAR2(6)   DEFAULT 'LOCAL' NOT NULL, -- LOCAL | EDIT
  AR_NAME      VARCHAR2(200),                      -- C_A_NAME
  EN_NAME      VARCHAR2(200),                      -- C_E_NAME
  MOBILE       VARCHAR2(30),                       -- C_MOBILE
  WHATSAPP     VARCHAR2(30),                       -- C_WHATSAPP_NO
  PHONE        VARCHAR2(30),                       -- C_PHONE
  INACTIVE     NUMBER(1,0)   DEFAULT 0  NOT NULL,
  CREATED_AT   TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  UPDATED_AT   TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_CUSTOMERS_OVERLAY PRIMARY KEY (ID),
  CONSTRAINT UQ_CUSTOMERS_OVERLAY_CODE UNIQUE (CODE),
  CONSTRAINT CK_CUSTOMERS_OVERLAY_ORIGIN CHECK (ORIGIN IN ('LOCAL','EDIT'))
);

--==============================================================================
-- ITEMS_OVERLAY — local item creates/edits (price/name) (POSI2000)
--==============================================================================
CREATE TABLE ITEMS_OVERLAY (
  ID           VARCHAR2(36)  NOT NULL,
  CODE         VARCHAR2(30)  NOT NULL,             -- business key (I_CODE)
  ORIGIN       VARCHAR2(6)   DEFAULT 'LOCAL' NOT NULL, -- LOCAL | EDIT
  NAME         VARCHAR2(200),                      -- local name (I_NAME)
  BARCODE      VARCHAR2(40),
  UNIT         VARCHAR2(20),
  PRICE        NUMBER(18,4),                       -- local override price (excl VAT)
  VAT_PERCENT  NUMBER(7,4),                        -- local VAT override
  INACTIVE     NUMBER(1,0)   DEFAULT 0  NOT NULL,
  CREATED_AT   TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  UPDATED_AT   TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_ITEMS_OVERLAY PRIMARY KEY (ID),
  CONSTRAINT UQ_ITEMS_OVERLAY_CODE UNIQUE (CODE),
  CONSTRAINT CK_ITEMS_OVERLAY_ORIGIN CHECK (ORIGIN IN ('LOCAL','EDIT')),
  CONSTRAINT CK_ITEMS_OVERLAY_PRICE CHECK (PRICE IS NULL OR PRICE >= 0)
);

PROMPT MOTECH_POS overlay tables created (CUSTOMERS_OVERLAY, ITEMS_OVERLAY).
EXIT
