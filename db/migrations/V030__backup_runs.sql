--------------------------------------------------------------------------------
-- V030 — POSS003 Backup: history log of MOTECH_POS data backups
--------------------------------------------------------------------------------
-- Run as MOTECH_POS:
--   sudo docker exec -i oracle12 sqlplus -S "MOTECH_POS/motech_pos_2026@//localhost:1521/xe" @V030__backup_runs.sql
--
-- POSS003 (النسخ الاحتياطية) — a logical export of the MOTECH_POS WRITE schema
-- (our own data: BILLS/PAYMENTS/CATALOG_CACHE/… and the overlays). The live
-- YSPOS23 / IAS202623 ERP schemas are NEVER exported here — they are the
-- production system and remain strictly read-only.
--
-- Each "backup now" (manual or scheduled) produces one JSON snapshot file on
-- the app server and one BACKUP_RUNS row recording it. The file itself is NOT
-- stored in the DB (it can be large); BACKUP_RUNS keeps the metadata + path so
-- the API can list past backups and stream a file back for download.
--------------------------------------------------------------------------------

SET ECHO ON
WHENEVER SQLERROR EXIT FAILURE

CREATE TABLE BACKUP_RUNS (
  ID              VARCHAR2(36)   NOT NULL,
  BACKUP_NO       NUMBER(12,0)   NOT NULL,               -- human-friendly serial
  TRIGGER_KIND    VARCHAR2(12)   DEFAULT 'MANUAL' NOT NULL, -- MANUAL | SCHEDULED
  FORMAT          VARCHAR2(8)    DEFAULT 'JSON' NOT NULL,   -- JSON (SQL reserved for future)
  STATUS          VARCHAR2(10)   DEFAULT 'RUNNING' NOT NULL,-- RUNNING | SUCCESS | FAILED
  FILE_NAME       VARCHAR2(260),                          -- basename of the snapshot
  FILE_PATH       VARCHAR2(1024),                         -- absolute path on the app server
  FILE_BYTES      NUMBER(18,0),                           -- size in bytes when done
  TABLE_COUNT     NUMBER(6,0),                            -- number of tables captured
  ROW_COUNT       NUMBER(18,0),                           -- total rows across all tables
  SCHEMA_NAME     VARCHAR2(60),                           -- always the MOTECH_POS schema
  ERROR_MESSAGE   VARCHAR2(2000),                         -- failure detail (STATUS=FAILED)
  CREATED_BY      VARCHAR2(50),                           -- uid that triggered it
  STARTED_AT      TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  FINISHED_AT     TIMESTAMP,
  DURATION_MS     NUMBER(12,0),
  CONSTRAINT PK_BACKUP_RUNS PRIMARY KEY (ID),
  CONSTRAINT UX_BACKUP_NO UNIQUE (BACKUP_NO),
  CONSTRAINT CK_BACKUP_TRIGGER CHECK (TRIGGER_KIND IN ('MANUAL','SCHEDULED')),
  CONSTRAINT CK_BACKUP_FORMAT CHECK (FORMAT IN ('JSON','SQL')),
  CONSTRAINT CK_BACKUP_STATUS CHECK (STATUS IN ('RUNNING','SUCCESS','FAILED'))
);

CREATE INDEX IX_BACKUP_RUNS_STARTED ON BACKUP_RUNS (STARTED_AT DESC);

CREATE SEQUENCE SEQ_BACKUP_NO START WITH 1 INCREMENT BY 1 NOCACHE;

--==============================================================================
-- Grants to the write user (MOTECH_RW) — same pattern as V025/V026/V028.
--==============================================================================
GRANT SELECT, INSERT, UPDATE ON BACKUP_RUNS TO MOTECH_RW;
GRANT SELECT ON SEQ_BACKUP_NO TO MOTECH_RW;

COMMIT;

PROMPT V030 applied — BACKUP_RUNS history + SEQ_BACKUP_NO.
