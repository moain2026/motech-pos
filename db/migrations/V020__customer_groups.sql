--------------------------------------------------------------------------------
-- V020 — CUSTOMER_GROUPS + CUSTOMER_GROUP_MEMBERS (POSI009 مجموعات عملاء نقاط البيع)
--------------------------------------------------------------------------------
-- Run as MOTECH_POS:
--   sudo docker exec -i oracle12 sqlplus -S "MOTECH_POS/motech_pos_2026@//localhost:1521/xe" @V020__customer_groups.sql
--
-- Purpose:
--   POSI009 groups POS customers for reporting/targeting (IAS_CASH_CUSTMR_GRP
--   is EMPTY in the live YSPOS23 → MOTECH_POS is authoritative). Membership is
--   a mapping table so ERP customers (IAS_CASH_CUSTMR) and local overlay
--   customers can both be grouped without mutating the ERP.
--------------------------------------------------------------------------------

SET ECHO ON
WHENEVER SQLERROR EXIT FAILURE

CREATE TABLE CUSTOMER_GROUPS (
  ID          VARCHAR2(36)  NOT NULL,
  GRP_CODE    NUMBER(5,0)   NOT NULL,                -- business key (CUST_GRP_CODE)
  AR_NAME     VARCHAR2(60),                          -- CUST_GRP_L_NM
  EN_NAME     VARCHAR2(60),                          -- CUST_GRP_F_NM
  SEND_MSG    NUMBER(1,0)   DEFAULT 0 NOT NULL,      -- SEND_MSG (marketing flag)
  INACTIVE    NUMBER(1,0)   DEFAULT 0 NOT NULL,
  CREATED_AT  TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  UPDATED_AT  TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_CUSTOMER_GROUPS PRIMARY KEY (ID),
  CONSTRAINT UQ_CUSTOMER_GROUPS_CODE UNIQUE (GRP_CODE)
);

CREATE TABLE CUSTOMER_GROUP_MEMBERS (
  ID            VARCHAR2(36)  NOT NULL,
  GRP_CODE      NUMBER(5,0)   NOT NULL,
  CUSTOMER_CODE VARCHAR2(15)  NOT NULL,              -- C_CODE (ERP or overlay)
  CREATED_AT    TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_CUST_GRP_MEMBERS PRIMARY KEY (ID),
  CONSTRAINT UQ_CUST_GRP_MEMBER UNIQUE (CUSTOMER_CODE), -- one group per customer
  CONSTRAINT FK_CUST_GRP_MEMBERS FOREIGN KEY (GRP_CODE)
    REFERENCES CUSTOMER_GROUPS (GRP_CODE) ON DELETE CASCADE
);
CREATE INDEX IX_CUST_GRP_MEMBERS_GRP ON CUSTOMER_GROUP_MEMBERS (GRP_CODE);

GRANT SELECT, INSERT, UPDATE, DELETE ON CUSTOMER_GROUPS        TO MOTECH_RW;
GRANT SELECT, INSERT, UPDATE, DELETE ON CUSTOMER_GROUP_MEMBERS TO MOTECH_RW;

PROMPT V020 customer groups tables created.
EXIT
