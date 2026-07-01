--------------------------------------------------------------------------------
-- V007 — MOTECH_POS settings overlay (إعدادات النظام) — POSS001 / IAS_PARA_POS
--------------------------------------------------------------------------------
-- Run as MOTECH_POS:
--   sudo docker exec -i oracle12 sqlplus -S "MOTECH_POS/motech_pos_2026@//localhost:1521/xe" @V007__create_settings_overlay.sql
--
-- Purpose:
--   The LIVE Onyx POS settings live in YSPOS23.IAS_PARA_POS (a single-row
--   parameters profile: shop name, currency, numbering, print/tax/point
--   options) plus YSPOS23.POS_DFLT_STNG_MST/DTL and per-machine overrides in
--   YSPOS23.IAS_POS_MACHINE. YSPOS23 is SACRED read-only — we never write there.
--
--   To let an admin CHANGE settings from the Motech UI without touching the
--   live Onyx DB, we keep a LOCAL key/value OVERLAY here in MOTECH_POS. A read
--   of GET /settings returns the original Onyx values MERGED with any overlay
--   values (overlay wins). This is the same pattern the app uses everywhere:
--   read the live system, write only to MOTECH_POS.
--
-- Design principles (mirror V002..V006 / DATA_MODEL.md):
--   * Simple flat KEY/VALUE store (settings are heterogeneous scalars).
--   * KEY is the canonical setting key (e.g. 'CURR_DFLT', 'PRINT_BILL',
--     'shopName', or a machine-scoped 'machine.<no>.CURR_DFLT').
--   * VALUE stored as text (VARCHAR2) — the read layer coerces per key.
--   * UPDATED_AT = TIMESTAMP (audit); UPDATED_BY records the admin user id.
--   * PK on KEY (one current value per key — UPSERT/MERGE semantics).
--------------------------------------------------------------------------------

SET ECHO ON
WHENEVER SQLERROR EXIT FAILURE

--==============================================================================
-- SETTINGS_OVERLAY — local overrides for POS settings (admin-editable)
--==============================================================================
CREATE TABLE SETTINGS_OVERLAY (
  SETTING_KEY   VARCHAR2(120)  NOT NULL,          -- canonical setting key
  SETTING_VALUE VARCHAR2(4000),                   -- scalar value as text (NULL clears)
  UPDATED_BY    NUMBER(10,0),                      -- admin user id (from JWT)
  UPDATED_AT    TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_SETTINGS_OVERLAY PRIMARY KEY (SETTING_KEY)
);

PROMPT MOTECH_POS settings overlay table created (SETTINGS_OVERLAY).
EXIT
