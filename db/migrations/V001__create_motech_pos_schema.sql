--------------------------------------------------------------------------------
-- V001 — Create the MOTECH_POS write schema (our own DB, separate from YSPOS23)
--------------------------------------------------------------------------------
-- Run as SYSDBA:
--   sudo docker exec -i oracle12 sqlplus -S "sys/oracle@//localhost:1521/xe as sysdba" @V001__create_motech_pos_schema.sql
--
-- WHY a separate schema?
--   YSPOS23 is the LIVE Onyx database — SACRED, read-only (accessed via the
--   least-privilege MOTECH_RO user, SELECT-only). The new Motech POS system
--   READS reference data (items/prices/tax/shifts definitions) from YSPOS23 but
--   WRITES all of its own new invoices/payments/shifts into THIS schema.
--
-- This script is idempotent-ish: it drops & recreates the user. Safe because
-- MOTECH_POS holds only our own (app-owned) data.
--------------------------------------------------------------------------------

SET ECHO ON
SET SERVEROUTPUT ON
WHENEVER SQLERROR CONTINUE

-- Drop existing (clean slate for dev). In prod, use forward-only migrations.
BEGIN
  EXECUTE IMMEDIATE 'DROP USER MOTECH_POS CASCADE';
EXCEPTION WHEN OTHERS THEN
  IF SQLCODE != -1918 THEN RAISE; END IF; -- ORA-01918: user does not exist
END;
/

WHENEVER SQLERROR EXIT FAILURE

-- The write-owner schema. Owns tables; quota on USERS tablespace.
CREATE USER MOTECH_POS IDENTIFIED BY "motech_pos_2026"
  DEFAULT TABLESPACE USERS
  TEMPORARY TABLESPACE TEMP
  QUOTA UNLIMITED ON USERS;

-- Minimal privileges: own its objects, connect, create sequences/tables.
GRANT CREATE SESSION        TO MOTECH_POS;
GRANT CREATE TABLE          TO MOTECH_POS;
GRANT CREATE SEQUENCE       TO MOTECH_POS;
GRANT CREATE VIEW           TO MOTECH_POS;
GRANT CREATE PROCEDURE      TO MOTECH_POS;

-- The application connects as a dedicated WRITE user that is NOT a DBA and has
-- NO access to YSPOS23 (writes are confined to MOTECH_POS). It reuses the
-- MOTECH_POS owner for simplicity in this phase; YSPOS23 reads stay on MOTECH_RO.

-- Reference reads (catalog/prices/tax/shift defs) are still served by MOTECH_RO
-- (SELECT ANY TABLE) — unchanged. MOTECH_POS does NOT get any grant on YSPOS23,
-- enforcing "writes only to MOTECH_POS" at the privilege level.

PROMPT MOTECH_POS schema created.
EXIT
