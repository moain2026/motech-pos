--------------------------------------------------------------------------------
-- V021 — SALES_ORDERS + SALES_ORDER_LINES (طلبات العملاء / أوامر البيع — POST024)
--------------------------------------------------------------------------------
-- Run as MOTECH_POS:
--   sudo docker exec -i oracle12 sqlplus -S "MOTECH_POS/motech_pos_2026@//localhost:1521/xe" @V021__sales_orders.sql
--
-- Purpose:
--   Onyx POST024 (طلبات العملاء) records a customer order BEFORE the sale;
--   later the order is "أُنزل في فاتورة" (loaded into a sales bill). In Onyx
--   the order lives in YSPOS23.SALES_ORDER/ORDER_DETAIL (read-only for us —
--   POSR015 already reads them). New Motech orders live ONLY in MOTECH_POS
--   with an OPEN → CONVERTED | CANCELLED lifecycle:
--
--   * ORDER_NO is a human-friendly serial (SEQ_SALES_ORDER_NO).
--   * Item existence is validated LIVE against the ERP master at POST time;
--     ITEM_NAME + UNIT_PRICE (retail level 1) are snapshotted for display.
--   * Conversion (POST /sales-orders/{id}/convert) posts a REAL bill through
--     the proven PostBillUseCase (server-side prices, open-shift guard,
--     YSPOS23 twin write) and freezes the order as CONVERTED with the bill
--     linkage. CONVERT_IDEMPOTENCY_KEY makes conversion replay-safe.
--------------------------------------------------------------------------------

SET ECHO ON
WHENEVER SQLERROR EXIT FAILURE

CREATE TABLE SALES_ORDERS (
  ID                 VARCHAR2(36)   NOT NULL,
  ORDER_NO           NUMBER(12,0)   NOT NULL,            -- human-friendly serial
  STATUS             VARCHAR2(12)   DEFAULT 'OPEN' NOT NULL, -- OPEN|CONVERTED|CANCELLED
  CUSTOMER_CODE      VARCHAR2(15),                       -- C_CODE (ERP or overlay)
  CUSTOMER_NAME      VARCHAR2(100),                      -- snapshot
  CURRENCY           VARCHAR2(7)    DEFAULT 'YER' NOT NULL,
  REF_NO             VARCHAR2(60),                       -- رقم المرجع
  NOTE               VARCHAR2(500),
  EXPIRE_DATE        DATE,                               -- ORDER_EXPIRE_DATE analogue
  CREATED_BY         VARCHAR2(50)   NOT NULL,            -- username (JWT sub)
  CREATED_AT         TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  CONVERTED_BILL_ID  VARCHAR2(36),                       -- MOTECH_POS.BILLS.ID
  CONVERTED_BILL_NO  VARCHAR2(20),                       -- YSPOS23 bill number
  CONVERTED_BY       VARCHAR2(50),
  CONVERTED_AT       TIMESTAMP,
  CONVERT_IDEMPOTENCY_KEY VARCHAR2(64),                  -- replay-safe conversion
  CANCELLED_BY       VARCHAR2(50),
  CANCELLED_AT       TIMESTAMP,
  CONSTRAINT PK_SALES_ORDERS PRIMARY KEY (ID),
  CONSTRAINT UQ_SO_ORDER_NO UNIQUE (ORDER_NO),
  CONSTRAINT UQ_SO_CONVERT_KEY UNIQUE (CONVERT_IDEMPOTENCY_KEY),
  CONSTRAINT CK_SO_STATUS CHECK (STATUS IN ('OPEN','CONVERTED','CANCELLED')),
  CONSTRAINT CK_SO_CONVERTED CHECK (
    (STATUS <> 'CONVERTED' AND CONVERTED_AT IS NULL) OR
    (STATUS =  'CONVERTED' AND CONVERTED_AT IS NOT NULL
                           AND CONVERTED_BILL_ID IS NOT NULL
                           AND CONVERTED_BILL_NO IS NOT NULL)
  ),
  CONSTRAINT CK_SO_CANCELLED CHECK (
    (STATUS <> 'CANCELLED' AND CANCELLED_AT IS NULL) OR
    (STATUS =  'CANCELLED' AND CANCELLED_AT IS NOT NULL
                           AND CANCELLED_BY IS NOT NULL)
  )
);

CREATE TABLE SALES_ORDER_LINES (
  ID          VARCHAR2(36)   NOT NULL,
  ORDER_ID    VARCHAR2(36)   NOT NULL,                   -- FK → SALES_ORDERS
  ITEM_CODE   VARCHAR2(30)   NOT NULL,
  ITEM_NAME   VARCHAR2(250),                             -- Arabic name snapshot
  QTY         NUMBER(18,4)   NOT NULL,
  UNIT_PRICE  NUMBER(18,4),                              -- retail L1 snapshot (display)
  DISC_DTL    NUMBER(18,4)   DEFAULT 0 NOT NULL,         -- per-unit detail discount
  NOTE        VARCHAR2(250),
  CONSTRAINT PK_SO_LINES PRIMARY KEY (ID),
  CONSTRAINT FK_SOL_ORDER FOREIGN KEY (ORDER_ID) REFERENCES SALES_ORDERS (ID),
  CONSTRAINT UQ_SOL_ITEM UNIQUE (ORDER_ID, ITEM_CODE),
  CONSTRAINT CK_SOL_QTY CHECK (QTY > 0),
  CONSTRAINT CK_SOL_DISC CHECK (DISC_DTL >= 0)
);

CREATE SEQUENCE SEQ_SALES_ORDER_NO START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE INDEX IX_SO_STATUS   ON SALES_ORDERS (STATUS, CREATED_AT);
CREATE INDEX IX_SO_CUSTOMER ON SALES_ORDERS (CUSTOMER_CODE);
CREATE INDEX IX_SOL_ORDER   ON SALES_ORDER_LINES (ORDER_ID);

GRANT SELECT, INSERT, UPDATE ON SALES_ORDERS      TO MOTECH_RW;
GRANT SELECT, INSERT         ON SALES_ORDER_LINES TO MOTECH_RW;
GRANT SELECT ON SEQ_SALES_ORDER_NO TO MOTECH_RW;

PROMPT V021 sales orders tables created.
EXIT
