--------------------------------------------------------------------------------
-- V017 — PRESCRIPTIONS + PRESCRIPTION_LINES (الوصفة الطبية — POST023)
--------------------------------------------------------------------------------
-- Run as MOTECH_POS:
--   sudo docker exec -i oracle12 sqlplus -S "MOTECH_POS/motech_pos_2026@//localhost:1521/xe" @V017__prescriptions.sql
--
-- Purpose:
--   Onyx POST023 (الوصفة الطبية) links an existing SALE BILL to a medical
--   prescription: doctor + patient + per-item dosage/usage instructions
--   (pharmacy sector). In Onyx the instructions live on IAS_POS_BILL_DTL
--   free-form columns (FIELD_DTL1..4 / USG_ITM); YSPOS23 is SACRED read-only,
--   so the prescription record lives ONLY in MOTECH_POS and references the
--   Onyx bill by BILL_NO (validated live at POST time via MOTECH_RO).
--
--   * One prescription per (BILL_NO) is NOT enforced — Onyx allows revisiting
--     a bill; each save is a new prescription version. The API surfaces the
--     newest first.
--   * Lines must reference items that exist on the linked bill (service-level
--     guard; the item snapshot columns keep the record self-contained).
--------------------------------------------------------------------------------

SET ECHO ON
WHENEVER SQLERROR EXIT FAILURE

CREATE TABLE PRESCRIPTIONS (
  ID            VARCHAR2(36)   NOT NULL,
  BILL_NO       VARCHAR2(40)   NOT NULL,           -- YSPOS23.IAS_POS_BILL_MST.BILL_NO
  DOCTOR_NAME   VARCHAR2(120)  NOT NULL,           -- الطبيب المعالج
  PATIENT_NAME  VARCHAR2(120)  NOT NULL,           -- المريض
  PATIENT_REF   VARCHAR2(60),                      -- رقم ملف/هوية المريض (اختياري)
  RX_DATE       DATE           DEFAULT TRUNC(SYSDATE) NOT NULL, -- تاريخ الوصفة
  NOTE          VARCHAR2(500),                     -- تعليمات عامة
  CREATED_BY    VARCHAR2(50)   NOT NULL,           -- username (JWT sub)
  CREATED_AT    TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_PRESCRIPTIONS PRIMARY KEY (ID)
);

CREATE TABLE PRESCRIPTION_LINES (
  ID           VARCHAR2(36)   NOT NULL,
  RX_ID        VARCHAR2(36)   NOT NULL,            -- FK → PRESCRIPTIONS
  ITEM_CODE    VARCHAR2(30)   NOT NULL,            -- item on the linked bill
  ITEM_NAME    VARCHAR2(250),                      -- Arabic name snapshot
  QTY          NUMBER(18,4)   NOT NULL,            -- dispensed qty (from bill)
  DOSAGE       VARCHAR2(120),                      -- الجرعة (مثال: قرص كل 8 ساعات)
  USAGE_NOTES  VARCHAR2(500),                      -- طريقة الاستخدام
  DURATION     VARCHAR2(60),                       -- مدة الاستخدام (مثال: 7 أيام)
  CONSTRAINT PK_PRESCRIPTION_LINES PRIMARY KEY (ID),
  CONSTRAINT FK_RXL_RX FOREIGN KEY (RX_ID) REFERENCES PRESCRIPTIONS (ID),
  CONSTRAINT UQ_RXL_ITEM UNIQUE (RX_ID, ITEM_CODE),
  CONSTRAINT CK_RXL_QTY CHECK (QTY > 0)
);

CREATE INDEX IX_RX_BILL ON PRESCRIPTIONS (BILL_NO);
CREATE INDEX IX_RX_CREATED ON PRESCRIPTIONS (CREATED_AT);
CREATE INDEX IX_RXL_RX ON PRESCRIPTION_LINES (RX_ID);

GRANT SELECT, INSERT ON PRESCRIPTIONS TO MOTECH_RW;
GRANT SELECT, INSERT ON PRESCRIPTION_LINES TO MOTECH_RW;

EXIT
