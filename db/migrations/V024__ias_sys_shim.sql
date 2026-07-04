--==============================================================================
-- V024 — IAS_SYS shim schema (run as SYSTEM/DBA)
--
-- WHY: the restored ERP dump (IAS202623) references a companion schema
-- IAS_SYS (language defs + UI labels/messages: LANG_DEF, IAS_LABELS,
-- IAS_MSGS) that was NOT part of the dump. 556 IAS202623 objects are INVALID
-- because of it — including IAS_PRMTR_PKG → IAS_ITM_PKG, whose invalidity
-- breaks the ITEM_MOVEMENT triggers (IAS_INCR/DECR_AVLQTY_STRGE_TGR raise
-- ORA-20302 "IAS_ITM_PKG has errors" on ANY insert). That blocks the stock
-- receiving module (POST029) — and would equally block any future ERP-side
-- stock write.
--
-- WHAT: create IAS_SYS with the three tiny reference tables (structure
-- matches every %TYPE / column reference found in DBA_SOURCE:
--   LANG_DEF(LANG_NO, LANG_DFLT, LANG_ABRV)
--   IAS_LABELS(LABEL_NO, LANG_NO, CAPTION_DET)
--   IAS_MSGS(MSG_NO, LANG_NO, CAPTION_DET, STATUS_CODE)
-- ), seed Arabic as default language, grant SELECT to IAS202623 + YSPOS23,
-- then recompile the invalid schemas (UTL_RECOMP).
--
-- Effects are additive-only: no existing object is modified. IAS202623
-- callers read these tables via "Ias_Sys.<table>" exactly as written.
--==============================================================================

CREATE USER ias_sys IDENTIFIED BY ias_sys_shim_2026
  DEFAULT TABLESPACE users QUOTA 10M ON users;

CREATE TABLE ias_sys.lang_def (
  lang_no    NUMBER(4)    NOT NULL,
  lang_dflt  NUMBER(1)    DEFAULT 0,
  lang_abrv  VARCHAR2(10),
  CONSTRAINT pk_lang_def PRIMARY KEY (lang_no)
);

CREATE TABLE ias_sys.ias_labels (
  label_no    NUMBER(10)     NOT NULL,
  lang_no     NUMBER(4)      NOT NULL,
  caption_det VARCHAR2(500),
  CONSTRAINT pk_ias_labels PRIMARY KEY (label_no, lang_no)
);

CREATE TABLE ias_sys.ias_msgs (
  msg_no      NUMBER(10)     NOT NULL,
  lang_no     NUMBER(4)      NOT NULL,
  caption_det VARCHAR2(500),
  status_code NUMBER(6),
  CONSTRAINT pk_ias_msgs PRIMARY KEY (msg_no, lang_no)
);

-- Seed: Arabic (1) as the default language + English (2).
INSERT INTO ias_sys.lang_def (lang_no, lang_dflt, lang_abrv) VALUES (1, 1, 'AR');
INSERT INTO ias_sys.lang_def (lang_no, lang_dflt, lang_abrv) VALUES (2, 0, 'EN');
COMMIT;

GRANT SELECT ON ias_sys.lang_def   TO IAS202623, YSPOS23;
GRANT SELECT ON ias_sys.ias_labels TO IAS202623, YSPOS23;
GRANT SELECT ON ias_sys.ias_msgs   TO IAS202623, YSPOS23;

-- IAS202623 code references the tables BOTH as "Ias_Sys.<t>" AND unqualified
-- ("LANG_DEF.LANG_NO%TYPE") — private synonyms cover the second form.
CREATE OR REPLACE SYNONYM IAS202623.LANG_DEF   FOR IAS_SYS.LANG_DEF;
CREATE OR REPLACE SYNONYM IAS202623.IAS_LABELS FOR IAS_SYS.IAS_LABELS;
CREATE OR REPLACE SYNONYM IAS202623.IAS_MSGS   FOR IAS_SYS.IAS_MSGS;

-- Recompile everything that was pending on IAS_SYS.
-- NOTE: run via "sqlplus / as sysdba" INSIDE the container (the SYSTEM
-- account lacks UTL_RECOMP execute in this XE image):
--   sudo docker exec -u oracle -it oracle12 bash -c 'export ORACLE_SID=xe ORACLE_HOME=/u01/app/oracle/product/12.1.0/xe PATH=$PATH:$ORACLE_HOME/bin; sqlplus / as sysdba'
EXEC UTL_RECOMP.RECOMP_SERIAL('IAS202623');
EXEC UTL_RECOMP.RECOMP_SERIAL('YSPOS23');
-- Result on 2026-07-04: IAS202623 invalid 556 → 398 (IAS_ITM_PKG spec+body
-- VALID — the ITEM_MOVEMENT triggers work; the leftovers are db-link/FGAC/
-- APEX-era objects untouched by POS flows). YSPOS23: 48 → 46.

-- Report what is still invalid (FYI only — db-links/FGAC leftovers expected).
SELECT owner, COUNT(*) AS invalid_left
FROM dba_objects WHERE status='INVALID' AND owner IN ('IAS202623','YSPOS23')
GROUP BY owner;

EXIT
