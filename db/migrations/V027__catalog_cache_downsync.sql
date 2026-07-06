--------------------------------------------------------------------------------
-- V027 — MOTECH_POS downward catalog sync (POST008 مزامنة نزولية)
--------------------------------------------------------------------------------
-- Run as MOTECH_POS:
--   sudo docker exec -i oracle12 sqlplus -S "MOTECH_POS/motech_pos_2026@//localhost:1521/xe" @V027__catalog_cache_downsync.sql
--
-- Purpose (mirrors the "pull items/prices from the server" half of Onyx sync —
-- proof: docs/flows/FLOW_SYNC.md; the original POST008 both PUSHES bills up and
-- PULLS catalog/price data DOWN to the terminal). Until now MOTECH_POS only had
-- the UPWARD queue (V009 SYNC_QUEUE). This adds the DOWNWARD direction:
--
--   1) CATALOG_CACHE — a local snapshot of sellable items + their retail price
--      pulled from the LIVE ERP (IAS202623.IAS_ITM_MST + IAS_ITEM_PRICE +
--      YSPOS23.MV_ITEM_AVL_QTY). This is a READ CACHE only: the ERP is never
--      written; the cache lets the POS serve the catalog fast/offline and lets
--      the terminal see a consistent "as-of last pull" price snapshot.
--
--   2) CATALOG_SYNC_RUNS — an audit trail of each downward pull (when, how many
--      upserted, source counts, duration, trigger = manual|scheduled, error).
--
-- Design principles (mirror V002..V026 / DATA_MODEL.md):
--   * Money = NUMBER(18,4). created/updated TIMESTAMP. Bind variables only.
--   * CATALOG_CACHE PK = item code (one row per I_CODE) — a MERGE upsert keeps
--     it current on every pull; stale rows (missing from the ERP) are flagged.
--   * A run row = one pull; UUID v7 PK.
--------------------------------------------------------------------------------

SET ECHO ON
WHENEVER SQLERROR EXIT FAILURE

--==============================================================================
-- CATALOG_CACHE — local snapshot of items/prices pulled from the ERP
--==============================================================================
CREATE TABLE CATALOG_CACHE (
  I_CODE        VARCHAR2(30)   NOT NULL,          -- item code (business key)
  I_NAME        VARCHAR2(400),                    -- Arabic name (IAS_ITM_MST.I_NAME)
  BARCODE       VARCHAR2(60),                     -- primary barcode
  UNIT          VARCHAR2(30),                     -- base sale unit
  PACK_SIZE     NUMBER(18,4),                     -- base pack size
  PRICE         NUMBER(18,4),                     -- retail price (LEV_NO=1)
  G_CODE        VARCHAR2(30),                     -- main group
  MNG_CODE      VARCHAR2(30),                     -- sub group
  WEIGHTED      NUMBER(1,0)    DEFAULT 0 NOT NULL,
  AVL_QTY       NUMBER(18,4),                     -- total available qty (snapshot)
  INACTIVE      NUMBER(1,0)    DEFAULT 0 NOT NULL,
  STALE         NUMBER(1,0)    DEFAULT 0 NOT NULL, -- 1 = not seen on the last pull
  SYNCED_AT     TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  CREATED_AT    TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_CATALOG_CACHE PRIMARY KEY (I_CODE),
  CONSTRAINT CK_CATALOG_CACHE_WEIGHTED CHECK (WEIGHTED IN (0,1)),
  CONSTRAINT CK_CATALOG_CACHE_INACTIVE CHECK (INACTIVE IN (0,1)),
  CONSTRAINT CK_CATALOG_CACHE_STALE CHECK (STALE IN (0,1))
);

CREATE INDEX IX_CATALOG_CACHE_NAME ON CATALOG_CACHE (I_NAME);
CREATE INDEX IX_CATALOG_CACHE_BC   ON CATALOG_CACHE (BARCODE);

--==============================================================================
-- CATALOG_SYNC_RUNS — audit of each downward pull
--==============================================================================
CREATE TABLE CATALOG_SYNC_RUNS (
  ID            VARCHAR2(36)   NOT NULL,
  STATUS        VARCHAR2(12)   DEFAULT 'running' NOT NULL, -- running|success|failed
  TRIGGERED_BY  VARCHAR2(12)   DEFAULT 'manual'  NOT NULL, -- manual|scheduled
  SOURCE_COUNT  NUMBER(10,0)   DEFAULT 0 NOT NULL,   -- rows read from ERP
  UPSERTED      NUMBER(10,0)   DEFAULT 0 NOT NULL,   -- rows written to cache
  STALED        NUMBER(10,0)   DEFAULT 0 NOT NULL,   -- rows flagged stale
  DURATION_MS   NUMBER(10,0),
  ERROR         VARCHAR2(2000),
  STARTED_AT    TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  FINISHED_AT   TIMESTAMP,
  CONSTRAINT PK_CATALOG_SYNC_RUNS PRIMARY KEY (ID),
  CONSTRAINT CK_CATALOG_RUN_STATUS CHECK (STATUS IN ('running','success','failed')),
  CONSTRAINT CK_CATALOG_RUN_TRIG CHECK (TRIGGERED_BY IN ('manual','scheduled'))
);

CREATE INDEX IX_CATALOG_RUNS_STARTED ON CATALOG_SYNC_RUNS (STARTED_AT DESC);

-- The API writes through the least-privilege MOTECH_RW user — grant DML.
GRANT SELECT, INSERT, UPDATE, DELETE ON CATALOG_CACHE     TO MOTECH_RW;
GRANT SELECT, INSERT, UPDATE, DELETE ON CATALOG_SYNC_RUNS TO MOTECH_RW;

PROMPT MOTECH_POS downward catalog-sync tables created (CATALOG_CACHE, CATALOG_SYNC_RUNS).
EXIT
