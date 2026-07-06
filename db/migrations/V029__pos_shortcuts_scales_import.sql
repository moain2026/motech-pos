--------------------------------------------------------------------------------
-- V029 — Lane F (البيانات الأساسية P2): اختصارات لوحة المفاتيح + الموازين + استيراد Excel
--------------------------------------------------------------------------------
-- Run as MOTECH_POS (⚠ set NLS_LANG=.AL32UTF8 so the seeded Arabic labels are
-- stored as UTF-8 and not mangled by the client charset):
--   sudo docker cp V029__pos_shortcuts_scales_import.sql oracle12:/tmp/
--   sudo docker exec -i -e NLS_LANG=.AL32UTF8 oracle12 \
--     sqlplus -S "MOTECH_POS/<pw>@//localhost:1521/xe" @/tmp/V029__pos_shortcuts_scales_import.sql
--
-- Purpose (three POSI P2 screens, all overlay/authoritative in MOTECH_POS —
-- the live ERP is SACRED, read-only; nothing here touches YSPOS23/IAS202623):
--
--   * POS_SHORTCUTS      — POSI004 مفاتيح المساعدة: customizable POS hotkeys
--                          (action → key binding). Seeded with sane defaults;
--                          fully editable in Settings, activated in PosPage.
--   * SCALE_DEFINITIONS  — POSI005/006 الموازين: scale barcode schemes
--                          (prefix + length + item-code slot + value slot +
--                          divisor + mode WEIGHT|PRICE). Mirrors the real Onyx
--                          IAS_PARA_POS.WEIGHTED_* / LENGTHED_* columns
--                          (verified live 2026-07-06: WEIGHTED prefix 02 len 12
--                          itemLen 5 basic 1000; LENGTHED prefix 02 len 12
--                          itemLen 5 basic 100). Seeded from those live values;
--                          the sale-time barcode decoder reads these.
--   * IMPORT_BATCHES     — POS_IMPXLS استيراد Excel: an audit header per import
--                          run (kind ITEMS|PRICES|BALANCES, counts, status).
--------------------------------------------------------------------------------

SET ECHO ON
WHENEVER SQLERROR EXIT FAILURE

--==============================================================================
-- POS_SHORTCUTS — POSI004 keyboard shortcuts (customizable hotkeys)
--==============================================================================
CREATE TABLE POS_SHORTCUTS (
  ID          VARCHAR2(36)   NOT NULL,
  ACTION      VARCHAR2(40)   NOT NULL,   -- business key: focusSearch, pay, hold, ...
  KEY_COMBO   VARCHAR2(40)   NOT NULL,   -- e.g. F2, F9, Ctrl+P, Alt+H
  AR_LABEL    VARCHAR2(100),             -- Arabic caption shown in the help modal
  SORT_ORDER  NUMBER(6,0)    DEFAULT 100 NOT NULL,
  ENABLED     NUMBER(1,0)    DEFAULT 1 NOT NULL,
  CREATED_AT  TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  UPDATED_AT  TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_POS_SHORTCUTS PRIMARY KEY (ID),
  CONSTRAINT UQ_POS_SHORTCUTS_ACTION UNIQUE (ACTION),
  CONSTRAINT CK_POS_SHORTCUTS_ENABLED CHECK (ENABLED IN (0,1))
);

-- Seed the common POS operations (matches the actions PosPage exposes).
INSERT INTO POS_SHORTCUTS (ID, ACTION, KEY_COMBO, AR_LABEL, SORT_ORDER) VALUES ('s0000000-0000-0000-0000-000000000001', 'focusSearch', 'F2',  'البحث عن صنف',        10);
INSERT INTO POS_SHORTCUTS (ID, ACTION, KEY_COMBO, AR_LABEL, SORT_ORDER) VALUES ('s0000000-0000-0000-0000-000000000002', 'pay',         'F9',  'الدفع',               20);
INSERT INTO POS_SHORTCUTS (ID, ACTION, KEY_COMBO, AR_LABEL, SORT_ORDER) VALUES ('s0000000-0000-0000-0000-000000000003', 'hold',        'F4',  'تعليق الفاتورة',      30);
INSERT INTO POS_SHORTCUTS (ID, ACTION, KEY_COMBO, AR_LABEL, SORT_ORDER) VALUES ('s0000000-0000-0000-0000-000000000004', 'heldList',    'F6',  'الفواتير المعلّقة',   40);
INSERT INTO POS_SHORTCUTS (ID, ACTION, KEY_COMBO, AR_LABEL, SORT_ORDER) VALUES ('s0000000-0000-0000-0000-000000000005', 'clearCart',   'F8',  'إفراغ السلة',         50);
INSERT INTO POS_SHORTCUTS (ID, ACTION, KEY_COMBO, AR_LABEL, SORT_ORDER) VALUES ('s0000000-0000-0000-0000-000000000006', 'customer',    'F7',  'ربط عميل',            60);
INSERT INTO POS_SHORTCUTS (ID, ACTION, KEY_COMBO, AR_LABEL, SORT_ORDER) VALUES ('s0000000-0000-0000-0000-000000000007', 'help',        'F1',  'عرض الاختصارات',      70);

--==============================================================================
-- SCALE_DEFINITIONS — POSI005/006 scale barcode schemes
-- MODE = 'WEIGHT' (embedded value ÷ divisor = quantity in the item unit) or
--        'PRICE'  (embedded value ÷ divisor = the line PRICE in local currency).
--==============================================================================
CREATE TABLE SCALE_DEFINITIONS (
  ID              VARCHAR2(36)  NOT NULL,
  NAME            VARCHAR2(100) NOT NULL,       -- e.g. "ميزان الوزن", "ميزان السعر"
  PREFIX          VARCHAR2(4)   NOT NULL,       -- barcode leading digits (WEIGHTED_PERFIX)
  BARCODE_LENGTH  NUMBER(3,0)   NOT NULL,       -- total length (WEIGHTED_LENGTH)
  ITEM_CODE_START NUMBER(3,0)   DEFAULT 2 NOT NULL, -- 0-based offset of item digits
  ITEM_CODE_LEN   NUMBER(3,0)   NOT NULL,       -- item digits (WEIGHTED_ITEM_LENGTH)
  VALUE_LEN       NUMBER(3,0),                  -- value digits (NULL = rest of the barcode)
  DIVISOR         NUMBER(12,0)  DEFAULT 1000 NOT NULL, -- WEIGHTED_BASIC / LENGTHED_BASIC
  SCALE_MODE      VARCHAR2(6)   DEFAULT 'WEIGHT' NOT NULL, -- WEIGHT | PRICE
  ENABLED         NUMBER(1,0)   DEFAULT 1 NOT NULL,
  SORT_ORDER      NUMBER(6,0)   DEFAULT 100 NOT NULL,
  CREATED_AT      TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  UPDATED_AT      TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_SCALE_DEFINITIONS PRIMARY KEY (ID),
  CONSTRAINT UQ_SCALE_DEF_PREFIX_LEN UNIQUE (PREFIX, BARCODE_LENGTH, SCALE_MODE),
  CONSTRAINT CK_SCALE_DEF_MODE CHECK (SCALE_MODE IN ('WEIGHT','PRICE')),
  CONSTRAINT CK_SCALE_DEF_ENABLED CHECK (ENABLED IN (0,1)),
  CONSTRAINT CK_SCALE_DEF_LENS CHECK (
    BARCODE_LENGTH > 0 AND ITEM_CODE_LEN > 0 AND DIVISOR > 0
    AND ITEM_CODE_START >= 0
  )
);

-- Seed from the LIVE Onyx IAS_PARA_POS values (proof-verified 2026-07-06).
-- WEIGHTED scheme: 02 IIIII WWWWW  → weight = tail ÷ 1000 (kg).
INSERT INTO SCALE_DEFINITIONS
  (ID, NAME, PREFIX, BARCODE_LENGTH, ITEM_CODE_START, ITEM_CODE_LEN, VALUE_LEN, DIVISOR, SCALE_MODE, SORT_ORDER)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'ميزان الوزن (Onyx WEIGHTED)', '02', 12, 2, 5, NULL, 1000, 'WEIGHT', 10);

-- LENGTHED scheme: 02 IIIII PPPPP  → price = tail ÷ 100 (currency). Disabled by
-- default (WEIGHT scheme has the same prefix/length; the operator enables the
-- one their scales actually print).
INSERT INTO SCALE_DEFINITIONS
  (ID, NAME, PREFIX, BARCODE_LENGTH, ITEM_CODE_START, ITEM_CODE_LEN, VALUE_LEN, DIVISOR, SCALE_MODE, ENABLED, SORT_ORDER)
VALUES
  ('c0000000-0000-0000-0000-000000000002', 'ميزان السعر (Onyx LENGTHED)', '02', 12, 2, 5, NULL, 100, 'PRICE', 0, 20);

--==============================================================================
-- IMPORT_BATCHES — POS_IMPXLS audit header for each Excel/CSV import run
--==============================================================================
CREATE TABLE IMPORT_BATCHES (
  ID           VARCHAR2(36)  NOT NULL,
  KIND         VARCHAR2(10)  NOT NULL,       -- ITEMS | PRICES | BALANCES
  FILE_NAME    VARCHAR2(260),
  TOTAL_ROWS   NUMBER(10,0)  DEFAULT 0 NOT NULL,
  OK_ROWS      NUMBER(10,0)  DEFAULT 0 NOT NULL,
  ERROR_ROWS   NUMBER(10,0)  DEFAULT 0 NOT NULL,
  STATUS       VARCHAR2(12)  DEFAULT 'DONE' NOT NULL, -- DONE | FAILED
  ERROR_JSON   CLOB,                         -- array of {row, code, message}
  CREATED_BY   NUMBER(10,0),
  CREATED_AT   TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_IMPORT_BATCHES PRIMARY KEY (ID),
  CONSTRAINT CK_IMPORT_BATCHES_KIND CHECK (KIND IN ('ITEMS','PRICES','BALANCES')),
  CONSTRAINT CK_IMPORT_BATCHES_STATUS CHECK (STATUS IN ('DONE','FAILED')),
  CONSTRAINT CK_IMPORT_BATCHES_JSON CHECK (ERROR_JSON IS JSON)
);
CREATE INDEX IX_IMPORT_BATCHES_CREATED ON IMPORT_BATCHES (CREATED_AT DESC);

--==============================================================================
-- ITEM_OPENING_BALANCES — POS_IMPXLS BALANCES target (opening stock per item /
-- warehouse). The live ERP MV_ITEM_AVL_QTY is READ-ONLY, so imported opening
-- balances land in this MOTECH_POS overlay (one row per item+warehouse).
--==============================================================================
CREATE TABLE ITEM_OPENING_BALANCES (
  ID          VARCHAR2(36)  NOT NULL,
  I_CODE      VARCHAR2(30)  NOT NULL,
  W_CODE      NUMBER(10,0)  DEFAULT 0 NOT NULL,
  QTY         NUMBER(18,4)  DEFAULT 0 NOT NULL,
  SOURCE      VARCHAR2(12)  DEFAULT 'IMPORT' NOT NULL,
  BATCH_ID    VARCHAR2(36),
  CREATED_AT  TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  UPDATED_AT  TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_ITEM_OPENING_BALANCES PRIMARY KEY (ID),
  CONSTRAINT UQ_ITEM_OPENING_BAL UNIQUE (I_CODE, W_CODE)
);
CREATE INDEX IX_ITEM_OPENING_BAL_ICODE ON ITEM_OPENING_BALANCES (I_CODE);

--==============================================================================
-- The API writes through the least-privilege MOTECH_RW user — grant DML.
--==============================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON POS_SHORTCUTS      TO MOTECH_RW;
GRANT SELECT, INSERT, UPDATE, DELETE ON SCALE_DEFINITIONS  TO MOTECH_RW;
GRANT SELECT, INSERT, UPDATE, DELETE ON IMPORT_BATCHES         TO MOTECH_RW;
GRANT SELECT, INSERT, UPDATE, DELETE ON ITEM_OPENING_BALANCES  TO MOTECH_RW;

COMMIT;
PROMPT V029 POS shortcuts + scale definitions + import batches created and seeded.
EXIT
