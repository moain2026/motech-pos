--------------------------------------------------------------------------------
-- V018 — MATERIAL_TRANSFERS + MATERIAL_TRANSFER_LINES (طلب صرف/تحويل مواد — POST019)
--------------------------------------------------------------------------------
-- Run as MOTECH_POS:
--   sudo docker exec -i oracle12 sqlplus -S "MOTECH_POS/motech_pos_2026@//localhost:1521/xe" @V018__material_transfers.sql
--
-- Purpose:
--   Onyx POST019 (طلب صرف/تحويل مواد) raises a TRANSFER REQUEST from the POS
--   point: goods are requested FROM a source warehouse TO the requesting
--   point's warehouse. In Onyx the request lands in IAS_OUT_REQUEST_MST/DTL
--   and is forwarded to the ERP for approval (MOV_RQST_TO_SRVR_PRC).
--   YSPOS23 is SACRED read-only, so our requests live ONLY in MOTECH_POS with
--   an OPEN → (CANCELLED) lifecycle; forwarding/approval belongs to the sync
--   layer (SYNC_OUTBOX pattern) once the ERP link exists.
--
--   * REQ_NO is a human-friendly sequential number (SEQ_TRANSFER_NO).
--   * Warehouses validated LIVE against YSPOS23.WAREHOUSE_DETAILS at POST
--     time; source ≠ destination enforced here too (CK).
--   * Item availability at the source is snapshotted (MV_ITEM_AVL_QTY) for
--     the approver's benefit — requests do NOT reserve or mutate stock.
--------------------------------------------------------------------------------

SET ECHO ON
WHENEVER SQLERROR EXIT FAILURE

CREATE TABLE MATERIAL_TRANSFERS (
  ID            VARCHAR2(36)   NOT NULL,
  REQ_NO        NUMBER(12,0)   NOT NULL,             -- human-friendly serial
  FROM_W_CODE   NUMBER(10,0)   NOT NULL,             -- المخزن المطلوب منه (source)
  TO_W_CODE     NUMBER(10,0)   NOT NULL,             -- المخزن الطالب (destination)
  STATUS        VARCHAR2(12)   DEFAULT 'OPEN' NOT NULL, -- OPEN | CANCELLED
  REQ_SIDE      VARCHAR2(120),                       -- جهة الطلب
  PURPOSE       VARCHAR2(250),                       -- الغرض من الطلب
  REF_NO        VARCHAR2(60),                        -- رقم المرجع (مستند يدوي)
  NOTE          VARCHAR2(500),
  CREATED_BY    VARCHAR2(50)   NOT NULL,             -- username (JWT sub)
  CREATED_AT    TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  CANCELLED_BY  VARCHAR2(50),
  CANCELLED_AT  TIMESTAMP,
  CONSTRAINT PK_MATERIAL_TRANSFERS PRIMARY KEY (ID),
  CONSTRAINT UQ_MTR_REQ_NO UNIQUE (REQ_NO),
  CONSTRAINT CK_MTR_STATUS CHECK (STATUS IN ('OPEN','CANCELLED')),
  CONSTRAINT CK_MTR_DIFF_WH CHECK (FROM_W_CODE <> TO_W_CODE),
  CONSTRAINT CK_MTR_CANCELLED CHECK (
    (STATUS = 'OPEN'      AND CANCELLED_AT IS NULL) OR
    (STATUS = 'CANCELLED' AND CANCELLED_AT IS NOT NULL
                          AND CANCELLED_BY IS NOT NULL)
  )
);

CREATE TABLE MATERIAL_TRANSFER_LINES (
  ID           VARCHAR2(36)   NOT NULL,
  TRANSFER_ID  VARCHAR2(36)   NOT NULL,              -- FK → MATERIAL_TRANSFERS
  ITEM_CODE    VARCHAR2(30)   NOT NULL,
  ITEM_NAME    VARCHAR2(250),                        -- Arabic name snapshot
  QTY          NUMBER(18,4)   NOT NULL,              -- requested qty
  AVL_QTY      NUMBER(18,4),                         -- source availability snapshot
  NOTE         VARCHAR2(250),
  CONSTRAINT PK_MTR_LINES PRIMARY KEY (ID),
  CONSTRAINT FK_MTRL_TRANSFER FOREIGN KEY (TRANSFER_ID)
    REFERENCES MATERIAL_TRANSFERS (ID),
  CONSTRAINT UQ_MTRL_ITEM UNIQUE (TRANSFER_ID, ITEM_CODE),
  CONSTRAINT CK_MTRL_QTY CHECK (QTY > 0)
);

CREATE SEQUENCE SEQ_TRANSFER_NO START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE INDEX IX_MTR_STATUS ON MATERIAL_TRANSFERS (STATUS, CREATED_AT);
CREATE INDEX IX_MTRL_TRANSFER ON MATERIAL_TRANSFER_LINES (TRANSFER_ID);

GRANT SELECT, INSERT, UPDATE ON MATERIAL_TRANSFERS TO MOTECH_RW;
GRANT SELECT, INSERT ON MATERIAL_TRANSFER_LINES TO MOTECH_RW;
GRANT SELECT ON SEQ_TRANSFER_NO TO MOTECH_RW;

EXIT
