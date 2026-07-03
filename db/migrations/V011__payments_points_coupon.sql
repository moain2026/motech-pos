--------------------------------------------------------------------------------
-- V011 — POINTS + COUPON payment methods (طرق دفع: نقاط الولاء + كوبون)
--------------------------------------------------------------------------------
-- Run as MOTECH_POS:
--   sudo docker exec -i oracle12 sqlplus -S "MOTECH_POS/motech_pos_2026@//localhost:1521/xe" @V011__payments_points_coupon.sql
--
-- Purpose:
--   * PAYMENTS.METHOD now also accepts POINTS (redeem loyalty points as tender,
--     mirrors PKG_POS_POINT_PKG redeem semantics / TRNS_TYPE=2 in POINTS_LEDGER)
--     and COUPON (settle with an IAS202623.IAS_CPN_MST coupon).
--   * COUPON_NO stores the redeemed coupon number (COUPON tenders).
--------------------------------------------------------------------------------

SET ECHO ON
WHENEVER SQLERROR EXIT FAILURE

ALTER TABLE PAYMENTS ADD COUPON_NO VARCHAR2(50);

ALTER TABLE PAYMENTS DROP CONSTRAINT CK_PAYMENTS_METHOD;
ALTER TABLE PAYMENTS ADD CONSTRAINT CK_PAYMENTS_METHOD
  CHECK (METHOD IN ('CASH','CARD','CREDIT','POINTS','COUPON'));

PROMPT PAYMENTS extended (POINTS/COUPON methods, COUPON_NO column).
EXIT
