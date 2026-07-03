--------------------------------------------------------------------------------
-- V013 — MOTECH_POS admin CRUD overlays + role permissions
--------------------------------------------------------------------------------
-- Run as MOTECH_POS:
--   sudo docker exec -i oracle12 sqlplus -S "MOTECH_POS/motech_pos_2026@//localhost:1521/xe" @V013__admin_crud.sql
--
-- Purpose:
--   YSPOS23 / IAS202623 are the LIVE ERP (SACRED, READ-ONLY). The admin screens
--   must still let an administrator CREATE/EDIT POS users and cashier machines
--   and manage fine-grained role permissions, without touching the ERP.
--   Same overlay pattern as V007/V008: reads MERGE live ERP + local overlay
--   (overlay wins; overlay-only rows surface as LOCAL).
--
-- Tables:
--   * USERS_OVERLAY     — local user creates/edits (USER_R merge; POSI011)
--   * MACHINES_OVERLAY  — local machine creates/edits (IAS_POS_MACHINE merge; POST009)
--   * ROLE_PERMISSIONS  — fine-grained role → action permission matrix
--------------------------------------------------------------------------------

SET ECHO ON
WHENEVER SQLERROR EXIT FAILURE

--==============================================================================
-- USERS_OVERLAY — local POS user creates/edits (merged with IAS202623.USER_R)
--==============================================================================
CREATE TABLE USERS_OVERLAY (
  ID            VARCHAR2(36)  NOT NULL,
  USER_ID       NUMBER(10,0)  NOT NULL,            -- business key (U_ID; local ids >= 9000)
  ORIGIN        VARCHAR2(6)   DEFAULT 'LOCAL' NOT NULL, -- LOCAL | EDIT
  AR_NAME       VARCHAR2(200),                     -- U_A_NAME
  EN_NAME       VARCHAR2(200),                     -- U_E_NAME
  CODE          VARCHAR2(30),                      -- U_CODE
  ROLE          VARCHAR2(20),                      -- cashier | supervisor | admin
  EMAIL         VARCHAR2(200),                     -- E_MAIL
  AUTH_USERNAME VARCHAR2(60),                      -- linked auth-users.json account
  INACTIVE      NUMBER(1,0)   DEFAULT 0 NOT NULL,
  CREATED_AT    TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  UPDATED_AT    TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_USERS_OVERLAY PRIMARY KEY (ID),
  CONSTRAINT UQ_USERS_OVERLAY_UID UNIQUE (USER_ID),
  CONSTRAINT CK_USERS_OVERLAY_ORIGIN CHECK (ORIGIN IN ('LOCAL','EDIT')),
  CONSTRAINT CK_USERS_OVERLAY_ROLE CHECK (ROLE IS NULL OR ROLE IN ('cashier','supervisor','admin'))
);

--==============================================================================
-- MACHINES_OVERLAY — local cashier machine creates/edits (IAS_POS_MACHINE merge)
--==============================================================================
CREATE TABLE MACHINES_OVERLAY (
  ID           VARCHAR2(36)  NOT NULL,
  MACHINE_NO   NUMBER(10,0)  NOT NULL,             -- business key (MACHINE_NO)
  ORIGIN       VARCHAR2(6)   DEFAULT 'LOCAL' NOT NULL, -- LOCAL | EDIT
  TERMINAL     VARCHAR2(60),                       -- TERMINAL name
  BRANCH_NO    NUMBER(10,0),                       -- DEF_BRN_NO
  WAREHOUSE    NUMBER(10,0),                       -- DEF_WCODE
  IP_ADDRESS   VARCHAR2(60),
  PRICE_LEVEL  NUMBER(4,0),
  USE_VAT      NUMBER(1,0),
  CURRENCY     VARCHAR2(10),                       -- CURR_DFLT
  INACTIVE     NUMBER(1,0)   DEFAULT 0 NOT NULL,
  CREATED_AT   TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  UPDATED_AT   TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_MACHINES_OVERLAY PRIMARY KEY (ID),
  CONSTRAINT UQ_MACHINES_OVERLAY_NO UNIQUE (MACHINE_NO),
  CONSTRAINT CK_MACHINES_OVERLAY_ORIGIN CHECK (ORIGIN IN ('LOCAL','EDIT'))
);

--==============================================================================
-- ROLE_PERMISSIONS — fine-grained role → action matrix (RBAC extension)
--   Unknown (role, permission) pairs fall back to the coarse @Roles() defaults
--   (allow), so this table can only FURTHER RESTRICT what a role may do.
--==============================================================================
CREATE TABLE ROLE_PERMISSIONS (
  ROLE        VARCHAR2(20)   NOT NULL,             -- cashier | supervisor | admin
  PERMISSION  VARCHAR2(40)   NOT NULL,             -- e.g. SALE, RETURN, DISCOUNT
  ALLOWED     NUMBER(1,0)    DEFAULT 1 NOT NULL,   -- 1 = allowed, 0 = denied
  UPDATED_BY  NUMBER(10,0),                        -- admin user id (JWT sub)
  UPDATED_AT  TIMESTAMP      DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_ROLE_PERMISSIONS PRIMARY KEY (ROLE, PERMISSION),
  CONSTRAINT CK_ROLE_PERM_ROLE CHECK (ROLE IN ('cashier','supervisor','admin')),
  CONSTRAINT CK_ROLE_PERM_ALLOWED CHECK (ALLOWED IN (0,1))
);

-- Seed: mirror the current coarse RBAC behavior (everything the guards allow
-- today stays allowed). Admin gets everything.
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'cashier',    'SALE',           1 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'cashier',    'RETURN',         1 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'cashier',    'DISCOUNT',       1 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'cashier',    'VOID',           0 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'cashier',    'HOLD',           1 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'cashier',    'REPORTS',        1 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'cashier',    'SETTINGS',       0 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'cashier',    'SHIFT_OPEN',     1 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'cashier',    'SHIFT_CLOSE',    1 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'cashier',    'PRICE_OVERRIDE', 0 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'cashier',    'VOUCHERS',       1 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'cashier',    'EINVOICE',       1 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'supervisor', 'SALE',           1 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'supervisor', 'RETURN',         1 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'supervisor', 'DISCOUNT',       1 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'supervisor', 'VOID',           1 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'supervisor', 'HOLD',           1 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'supervisor', 'REPORTS',        1 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'supervisor', 'SETTINGS',       0 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'supervisor', 'SHIFT_OPEN',     1 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'supervisor', 'SHIFT_CLOSE',    1 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'supervisor', 'PRICE_OVERRIDE', 1 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'supervisor', 'VOUCHERS',       1 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'supervisor', 'EINVOICE',       1 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'admin',      'SALE',           1 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'admin',      'RETURN',         1 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'admin',      'DISCOUNT',       1 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'admin',      'VOID',           1 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'admin',      'HOLD',           1 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'admin',      'REPORTS',        1 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'admin',      'SETTINGS',       1 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'admin',      'SHIFT_OPEN',     1 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'admin',      'SHIFT_CLOSE',    1 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'admin',      'PRICE_OVERRIDE', 1 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'admin',      'VOUCHERS',       1 FROM DUAL;
INSERT INTO ROLE_PERMISSIONS (ROLE, PERMISSION, ALLOWED) SELECT 'admin',      'EINVOICE',       1 FROM DUAL;
COMMIT;

-- The API writes through the least-privilege MOTECH_RW user — grant DML.
GRANT SELECT, INSERT, UPDATE, DELETE ON USERS_OVERLAY    TO MOTECH_RW;
GRANT SELECT, INSERT, UPDATE, DELETE ON MACHINES_OVERLAY TO MOTECH_RW;
GRANT SELECT, INSERT, UPDATE, DELETE ON ROLE_PERMISSIONS TO MOTECH_RW;

PROMPT MOTECH_POS admin CRUD tables created (USERS_OVERLAY, MACHINES_OVERLAY, ROLE_PERMISSIONS).
EXIT
