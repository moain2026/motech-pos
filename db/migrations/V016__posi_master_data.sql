--------------------------------------------------------------------------------
-- V016 — POSI master-data overlays (الموجة E: شاشات الإدخال والإعدادات)
--------------------------------------------------------------------------------
-- Run as MOTECH_POS:
--   sudo docker exec -i oracle12 sqlplus -S "MOTECH_POS/motech_pos_2026@//localhost:1521/xe" @V016__posi_master_data.sql
--
-- Purpose (same overlay pattern as V007/V008/V013 — the live ERP is SACRED,
-- read-only; every create/edit lands ONLY in MOTECH_POS and reads MERGE the
-- ERP master with the local overlay, overlay wins):
--
--   * SUPPLIERS_OVERLAY      — suppliers (IAS202623.V_DETAILS merge)
--   * WAREHOUSES_OVERLAY     — warehouses (IAS202623.WAREHOUSE_DETAILS merge)
--   * ITEM_GROUPS_OVERLAY    — item groups (IAS202623.GROUP_DETAILS merge)
--   * UNITS_OVERLAY          — units of measure (IAS202623.MEASUREMENT merge)
--   * CURRENCIES_OVERLAY     — currencies + POS exchange rates
--                              (IAS202623.EX_RATE merge; POSI011/POSR009)
--   * ITEM_BARCODES_OVERLAY  — extra per-unit barcodes
--                              (IAS202623.IAS_ITM_UNT_BARCODE merge; POSI006/8/9)
--   * ITEMS_OVERLAY          + MIN/MAX/reorder limit columns (IAS_ITM_MST
--                              ITM_MIN_LMT_QTY/ITM_MAX_LMT_QTY/ITM_ROL_LMT_QTY)
--   * KEYPADS / KEYPAD_KEYS  — extra touch keypads + item keys
--                              (POSI002/POSI003: IAS_POS_EXTRA_KEYPAD +
--                               IAS_POS_KEY_BRD_GRPS_MST/DTL are empty in the
--                               live YSPOS23, so these are authoritative here)
--------------------------------------------------------------------------------

SET ECHO ON
WHENEVER SQLERROR EXIT FAILURE

--==============================================================================
-- SUPPLIERS_OVERLAY — local supplier creates/edits (merged with V_DETAILS)
--==============================================================================
CREATE TABLE SUPPLIERS_OVERLAY (
  ID            VARCHAR2(36)   NOT NULL,
  CODE          VARCHAR2(15)   NOT NULL,             -- business key (V_CODE)
  ORIGIN        VARCHAR2(6)    DEFAULT 'LOCAL' NOT NULL, -- LOCAL | EDIT
  AR_NAME       VARCHAR2(200),                       -- V_A_NAME
  EN_NAME       VARCHAR2(200),                       -- V_E_NAME
  PHONE         VARCHAR2(30),                        -- V_PHONE
  MOBILE        VARCHAR2(30),                        -- V_MOBILE
  EMAIL         VARCHAR2(100),                       -- V_E_MAIL
  ADDRESS       VARCHAR2(1000),                      -- V_ADDRESS
  TAX_CODE      VARCHAR2(30),                        -- V_TAX_CODE
  CONTACT       VARCHAR2(100),                       -- V_PERSON
  CREDIT_PERIOD NUMBER(3,0),
  INACTIVE      NUMBER(1,0)    DEFAULT 0 NOT NULL,
  CREATED_AT    TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  UPDATED_AT    TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_SUPPLIERS_OVERLAY PRIMARY KEY (ID),
  CONSTRAINT UQ_SUPPLIERS_OVERLAY_CODE UNIQUE (CODE),
  CONSTRAINT CK_SUPPLIERS_OVERLAY_ORIGIN CHECK (ORIGIN IN ('LOCAL','EDIT'))
);

--==============================================================================
-- WAREHOUSES_OVERLAY — local warehouse creates/edits (WAREHOUSE_DETAILS merge)
--==============================================================================
CREATE TABLE WAREHOUSES_OVERLAY (
  ID          VARCHAR2(36)  NOT NULL,
  W_CODE      NUMBER(10,0)  NOT NULL,                -- business key (W_CODE)
  ORIGIN      VARCHAR2(6)   DEFAULT 'LOCAL' NOT NULL,
  AR_NAME     VARCHAR2(100),                         -- W_NAME
  EN_NAME     VARCHAR2(100),                         -- W_E_NAME
  LOCATION    VARCHAR2(100),
  TEL         VARCHAR2(30),                          -- TEL_NO
  KEEPER      VARCHAR2(100),                         -- WH_KEEPER
  NO_SALE     NUMBER(1,0),
  PRICE_LEVEL NUMBER(3,0),                           -- PRICE_LVL
  INACTIVE    NUMBER(1,0)   DEFAULT 0 NOT NULL,
  CREATED_AT  TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  UPDATED_AT  TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_WAREHOUSES_OVERLAY PRIMARY KEY (ID),
  CONSTRAINT UQ_WAREHOUSES_OVERLAY_CODE UNIQUE (W_CODE),
  CONSTRAINT CK_WAREHOUSES_OVERLAY_ORIGIN CHECK (ORIGIN IN ('LOCAL','EDIT'))
);

--==============================================================================
-- ITEM_GROUPS_OVERLAY — item group creates/edits (GROUP_DETAILS merge)
--==============================================================================
CREATE TABLE ITEM_GROUPS_OVERLAY (
  ID          VARCHAR2(36)  NOT NULL,
  G_CODE      VARCHAR2(10)  NOT NULL,                -- business key (G_CODE)
  ORIGIN      VARCHAR2(6)   DEFAULT 'LOCAL' NOT NULL,
  AR_NAME     VARCHAR2(100),                         -- G_A_NAME
  EN_NAME     VARCHAR2(100),                         -- G_E_NAME
  TAX_PERCENT NUMBER(6,3),                           -- TAX_PRCNT_DFLT
  ALLOW_DISC  NUMBER(1,0),                           -- ALLOW_DISC_FLG
  SORT_ORDER  NUMBER(10,0),                          -- G_ORDR
  INACTIVE    NUMBER(1,0)   DEFAULT 0 NOT NULL,
  CREATED_AT  TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  UPDATED_AT  TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_ITEM_GROUPS_OVERLAY PRIMARY KEY (ID),
  CONSTRAINT UQ_ITEM_GROUPS_OVERLAY_CODE UNIQUE (G_CODE),
  CONSTRAINT CK_ITEM_GROUPS_OVERLAY_ORGN CHECK (ORIGIN IN ('LOCAL','EDIT'))
);

--==============================================================================
-- UNITS_OVERLAY — unit-of-measure creates/edits (MEASUREMENT merge)
--==============================================================================
CREATE TABLE UNITS_OVERLAY (
  ID          VARCHAR2(36)  NOT NULL,
  CODE        VARCHAR2(10)  NOT NULL,                -- business key (MEASURE_CODE)
  ORIGIN      VARCHAR2(6)   DEFAULT 'LOCAL' NOT NULL,
  AR_NAME     VARCHAR2(30),                          -- MEASURE
  EN_NAME     VARCHAR2(30),                          -- MEASURE_F_NM
  DFLT_SIZE   NUMBER,                                -- DFLT_SIZE
  INACTIVE    NUMBER(1,0)   DEFAULT 0 NOT NULL,
  CREATED_AT  TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  UPDATED_AT  TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_UNITS_OVERLAY PRIMARY KEY (ID),
  CONSTRAINT UQ_UNITS_OVERLAY_CODE UNIQUE (CODE),
  CONSTRAINT CK_UNITS_OVERLAY_ORIGIN CHECK (ORIGIN IN ('LOCAL','EDIT'))
);

--==============================================================================
-- CURRENCIES_OVERLAY — currency + POS exchange-rate edits (EX_RATE merge)
--==============================================================================
CREATE TABLE CURRENCIES_OVERLAY (
  ID          VARCHAR2(36)  NOT NULL,
  CUR_CODE    VARCHAR2(7)   NOT NULL,                -- business key (CUR_CODE)
  ORIGIN      VARCHAR2(6)   DEFAULT 'LOCAL' NOT NULL,
  AR_NAME     VARCHAR2(60),                          -- CUR_NAME
  EN_NAME     VARCHAR2(60),                          -- CUR_E_NAME
  RATE        NUMBER(24,9),                          -- CUR_RATE (accounting)
  RATE_POS    NUMBER(24,9),                          -- CUR_RATE_POS (POS rate)
  FRACTION_NO NUMBER(1,0),                           -- CUR_FRC_NO (decimals)
  IS_LOCAL    NUMBER(1,0),                           -- L_F
  INACTIVE    NUMBER(1,0)   DEFAULT 0 NOT NULL,
  CREATED_AT  TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  UPDATED_AT  TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_CURRENCIES_OVERLAY PRIMARY KEY (ID),
  CONSTRAINT UQ_CURRENCIES_OVERLAY_CODE UNIQUE (CUR_CODE),
  CONSTRAINT CK_CURRENCIES_OVERLAY_ORGN CHECK (ORIGIN IN ('LOCAL','EDIT'))
);

--==============================================================================
-- ITEM_BARCODES_OVERLAY — extra per-unit barcodes for an item
-- (merged with IAS202623.IAS_ITM_UNT_BARCODE; POSI006/008/009 advanced item)
--==============================================================================
CREATE TABLE ITEM_BARCODES_OVERLAY (
  ID          VARCHAR2(36)   NOT NULL,
  I_CODE      VARCHAR2(30)   NOT NULL,
  BARCODE     VARCHAR2(100)  NOT NULL,               -- business key
  ITM_UNT     VARCHAR2(10),
  P_SIZE      NUMBER,
  IS_MAIN     NUMBER(1,0)    DEFAULT 0 NOT NULL,
  NO_SALE     NUMBER(1,0)    DEFAULT 0 NOT NULL,
  INACTIVE    NUMBER(1,0)    DEFAULT 0 NOT NULL,
  CREATED_AT  TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  UPDATED_AT  TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_ITEM_BARCODES_OVERLAY PRIMARY KEY (ID),
  CONSTRAINT UQ_ITEM_BARCODES_OVERLAY UNIQUE (BARCODE),
  CONSTRAINT CK_ITEM_BARCODES_MAIN CHECK (IS_MAIN IN (0,1))
);
CREATE INDEX IX_ITEM_BARCODES_ICODE ON ITEM_BARCODES_OVERLAY (I_CODE);

--==============================================================================
-- ITEMS_OVERLAY — add min/max/reorder stock limits (POSI2000 advanced fields;
-- ERP columns: ITM_MIN_LMT_QTY / ITM_MAX_LMT_QTY / ITM_ROL_LMT_QTY)
--==============================================================================
ALTER TABLE ITEMS_OVERLAY ADD (
  MIN_LMT_QTY NUMBER,
  MAX_LMT_QTY NUMBER,
  ROL_LMT_QTY NUMBER
);

--==============================================================================
-- KEYPADS + KEYPAD_KEYS — extra touch keypads (POSI002) and their item keys
-- (POSI003). YSPOS23.IAS_POS_EXTRA_KEYPAD & IAS_POS_KEY_BRD_GRPS_* are empty
-- in the live DB, so MOTECH_POS is authoritative (reads still UNION the ERP).
--==============================================================================
CREATE TABLE KEYPADS (
  ID          VARCHAR2(36)   NOT NULL,
  KEYPAD_NO   NUMBER(10,0)   NOT NULL,               -- business key
  AR_NAME     VARCHAR2(100),
  EN_NAME     VARCHAR2(100),
  INACTIVE    NUMBER(1,0)    DEFAULT 0 NOT NULL,
  CREATED_AT  TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  UPDATED_AT  TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_KEYPADS PRIMARY KEY (ID),
  CONSTRAINT UQ_KEYPADS_NO UNIQUE (KEYPAD_NO)
);

CREATE TABLE KEYPAD_KEYS (
  ID          VARCHAR2(36)   NOT NULL,
  KEYPAD_NO   NUMBER(10,0)   NOT NULL,
  GRP_NO      NUMBER(10,0)   DEFAULT 1 NOT NULL,     -- key group inside the pad
  GRP_NAME    VARCHAR2(100),                         -- e.g. خضروات / فواكه
  I_CODE      VARCHAR2(30)   NOT NULL,               -- linked item
  POS_NO      NUMBER(6,0),                           -- ordering inside the group
  COLOR       VARCHAR2(20),                          -- UI hint (hex)
  LABEL       VARCHAR2(100),                         -- key caption (defaults to item name)
  CREATED_AT  TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_KEYPAD_KEYS PRIMARY KEY (ID),
  CONSTRAINT FK_KEYPAD_KEYS_PAD FOREIGN KEY (KEYPAD_NO)
    REFERENCES KEYPADS (KEYPAD_NO) ON DELETE CASCADE
);
CREATE INDEX IX_KEYPAD_KEYS_PAD ON KEYPAD_KEYS (KEYPAD_NO, GRP_NO, POS_NO);

--==============================================================================
-- The API writes through the least-privilege MOTECH_RW user — grant DML.
--==============================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON SUPPLIERS_OVERLAY     TO MOTECH_RW;
GRANT SELECT, INSERT, UPDATE, DELETE ON WAREHOUSES_OVERLAY    TO MOTECH_RW;
GRANT SELECT, INSERT, UPDATE, DELETE ON ITEM_GROUPS_OVERLAY   TO MOTECH_RW;
GRANT SELECT, INSERT, UPDATE, DELETE ON UNITS_OVERLAY         TO MOTECH_RW;
GRANT SELECT, INSERT, UPDATE, DELETE ON CURRENCIES_OVERLAY    TO MOTECH_RW;
GRANT SELECT, INSERT, UPDATE, DELETE ON ITEM_BARCODES_OVERLAY TO MOTECH_RW;
GRANT SELECT, INSERT, UPDATE, DELETE ON KEYPADS               TO MOTECH_RW;
GRANT SELECT, INSERT, UPDATE, DELETE ON KEYPAD_KEYS           TO MOTECH_RW;

PROMPT V016 POSI master-data tables created.
EXIT
