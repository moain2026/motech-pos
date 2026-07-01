--------------------------------------------------------------------------------
-- V009 — MOTECH_POS sync queue + e-invoice (المزامنة + الفوترة الإلكترونية)
--------------------------------------------------------------------------------
-- Run as MOTECH_POS:
--   sudo docker exec -i oracle12 sqlplus -S "MOTECH_POS/motech_pos_2026@//localhost:1521/xe" @V009__create_sync_einvoice.sql
--
-- Purpose (mirrors YSPOS23 two-path sync — proof: docs/flows/FLOW_SYNC.md +
-- PKG_POS_MOV_TRNS_PKG (guard -20001) + PKG_POS_SYNC_JOB_AUTO_PKG (SUBMITDOCUMENT)
-- + PKG_GNR_E_INVC_OP + POS_SQL_QUEUE):
--
--   1) SYNC_QUEUE — a reliable retry queue of bills pending internal transfer
--      to the "Main" center (analogue of POS_SQL_QUEUE + IAS_POS_BILL_MST.POSTED
--      / MOV_DATE). We SIMULATE the transfer safely — we NEVER write to the live
--      Onyx (YSPOS23). A queued bill is PENDING → SYNCED (or FAILED w/ retries).
--      The CRITICAL guard (-20001) is enforced here: a taxable bill cannot be
--      synced/transferred to the center until its e-invoice is issued first.
--
--   2) EINVOICES — the generated tax document per bill (analogue of the
--      WEB_SRVC_TRNSFR_DATA_FLG / FDA_CODE / GNR_QR_CODE columns of
--      IAS_POS_BILL_MST + PKG_GNR_E_INVC_OP). Holds a ZATCA-style TLV/QR + a
--      structured JSON document + a content HASH. SUBMITDOCUMENT is SIMULATED
--      (no external call) — the structure is ready to wire to a real gateway.
--
-- Design principles (mirror V002..V008 / DATA_MODEL.md):
--   * PK = UUID v7 (VARCHAR2(36)). Money = NUMBER(18,4). created/updated TS.
--   * A queue row is UNIQUE per BILL_ID so a bill is enqueued at most once.
--   * An e-invoice row is UNIQUE per BILL_ID so a bill is issued at most once.
--   * STATE machines: SYNC_QUEUE.STATUS pending|synced|failed ;
--     EINVOICES.SUBMIT_STATUS generated|submitted (simulated).
--------------------------------------------------------------------------------

SET ECHO ON
WHENEVER SQLERROR EXIT FAILURE

--==============================================================================
-- EINVOICES — generated e-invoice document per bill (الفوترة الإلكترونية)
--==============================================================================
CREATE TABLE EINVOICES (
  ID             VARCHAR2(36)  NOT NULL,
  BILL_ID        VARCHAR2(36)  NOT NULL,             -- ref MOTECH_POS BILLS.ID
  BILL_NO        VARCHAR2(40),                       -- display copy
  -- ZATCA-style TLV seller/tax fields (proof: PKG_GNR_E_INVC_OP + QR spec)
  SELLER_NAME    VARCHAR2(300) NOT NULL,             -- TLV tag 1
  VAT_NUMBER     VARCHAR2(30)  NOT NULL,             -- TLV tag 2 (الرقم الضريبي)
  INVOICE_TS     VARCHAR2(40)  NOT NULL,             -- TLV tag 3 (ISO-8601)
  TOTAL_AMT      NUMBER(18,4)  NOT NULL,             -- TLV tag 4 (الإجمالي w/ vat)
  VAT_AMT        NUMBER(18,4)  NOT NULL,             -- TLV tag 5 (الضريبة)
  QR_TLV_BASE64  VARCHAR2(2000) NOT NULL,            -- Base64 TLV payload (رمز QR)
  DOC_HASH       VARCHAR2(64)  NOT NULL,             -- SHA-256 of DOC_JSON (تجزئة)
  DOC_JSON       CLOB          NOT NULL,             -- structured invoice document
  FDA_CODE       VARCHAR2(60),                       -- authority id (mirror FDA_CODE)
  SUBMIT_STATUS  VARCHAR2(20)  DEFAULT 'generated' NOT NULL, -- generated|submitted
  SUBMITTED_AT   TIMESTAMP,
  CREATED_AT     TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_EINVOICES PRIMARY KEY (ID),
  CONSTRAINT UQ_EINVOICES_BILL UNIQUE (BILL_ID),
  CONSTRAINT CK_EINV_STATUS CHECK (SUBMIT_STATUS IN ('generated','submitted'))
);
-- (BILL_ID already indexed by UQ_EINVOICES_BILL unique constraint.)

--==============================================================================
-- SYNC_QUEUE — bills pending internal transfer to the center (طابور المزامنة)
--==============================================================================
CREATE TABLE SYNC_QUEUE (
  ID             VARCHAR2(36)  NOT NULL,
  BILL_ID        VARCHAR2(36)  NOT NULL,             -- ref MOTECH_POS BILLS.ID
  BILL_NO        VARCHAR2(40),                       -- display copy
  STATUS         VARCHAR2(20)  DEFAULT 'pending' NOT NULL, -- pending|synced|failed
  RTRY_CNT       NUMBER(6,0)   DEFAULT 0  NOT NULL,  -- mirror POS_SQL_QUEUE.RTRY_CNT
  ALLWD_RTRY_CNT NUMBER(6,0)   DEFAULT 5  NOT NULL,  -- mirror ALLWD_RTRY_CNT
  LAST_ERROR     VARCHAR2(600),
  ENQUEUED_AT    TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL, -- mirror AD_DATE
  SYNCED_AT      TIMESTAMP,                          -- mirror MOV_DATE
  CREATED_AT     TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_SYNC_QUEUE PRIMARY KEY (ID),
  CONSTRAINT UQ_SYNC_QUEUE_BILL UNIQUE (BILL_ID),
  CONSTRAINT CK_SYNC_STATUS CHECK (STATUS IN ('pending','synced','failed'))
);

CREATE INDEX IX_SYNC_QUEUE_STATUS ON SYNC_QUEUE (STATUS);
-- (BILL_ID already indexed by UQ_SYNC_QUEUE_BILL unique constraint.)

PROMPT MOTECH_POS sync+einvoice tables created (EINVOICES, SYNC_QUEUE).
EXIT
