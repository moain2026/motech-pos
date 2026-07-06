--------------------------------------------------------------------------------
-- V029 — PREPAID payment method (الدفع بالبطاقة المسبقة الدفع)
--------------------------------------------------------------------------------
-- Run as MOTECH_POS:
--   sudo docker exec -i oracle12 sqlplus -S "MOTECH_POS/motech_pos_2026@//localhost:1521/xe" @V029__payments_prepaid_method.sql
--
-- Purpose (Lane E — POST001 advanced payments):
--   * PAYMENTS.METHOD now also accepts PREPAID — settle a bill by redeeming
--     from a stored-value prepaid card (PREPAID_CARDS, V019). The redeemed card
--     number is stored in the existing CARD_NO column. The redeem itself is a
--     row-locked, balance-guarded REDEEM movement in PREPAID_CARD_MOVEMENTS
--     (referenced by the bill no), so a prepaid tender is idempotent per bill.
--------------------------------------------------------------------------------

SET ECHO ON
WHENEVER SQLERROR EXIT FAILURE

ALTER TABLE PAYMENTS DROP CONSTRAINT CK_PAYMENTS_METHOD;
ALTER TABLE PAYMENTS ADD CONSTRAINT CK_PAYMENTS_METHOD
  CHECK (METHOD IN ('CASH','CARD','CREDIT','POINTS','COUPON','PREPAID'));

PROMPT PAYMENTS extended (PREPAID method for stored-value card redemption).
EXIT
