-- =============================================
-- PACKAGE SPEC: YS_PAYMENT_GATEWAY_PKG  (status: VALID)
-- =============================================
CREATE OR REPLACE
Package YS_PAYMENT_GATEWAY_PKG
AS
G_BASE_URL	VARCHAR2(1024);
G_LANG_NO	NUMBER;

--This procedure creates a payment session for the customer to pay for the order.
--If the payment session is created successfully, the customer will get an sms with a link to pay for the order.
PROCEDURE CREATE_CHECKOUT_SESSION(P_CNTRY_CODE	    IN	    VARCHAR2,	--Three -letters Country Code
				  P_BRN_NO	    IN	    NUMBER,
				  P_DOC_TYPE	    IN	    NUMBER,
				  P_DOC_SER	    IN	    NUMBER,
				  P_DOC_M_SQ	    IN	    NUMBER,
				  P_Doc_No	    In	    Number,
				  P_GATEWAY_TYPE    IN	    VARCHAR2,	--Payment Gateway: Tamara : 1 or tamara Tabby : 2 or tabby
				  P_AMOUNT	    IN	    NUMBER DEFAULT NULL,    --Temporary parameter stores the 'Payable Amount' for the invoice, serving as a hostfix for decimal inconsistencies.
				  P_IS_SUCCESS	    OUT     BOOLEAN,
				  P_ORDER_ID	    OUT     VARCHAR2,
				  P_CHECKOUT_ID     OUT     VARCHAR2,
				  P_PAYMENT_URL     OUT     VARCHAR2,	--The payment url that needed to be sent to the customer to compelete the payment
				  P_PAYMENT_QR	    OUT     VARCHAR2,	--The same payment url as QR image encoded as base64 string
				  P_RESPONSE_CODE   OUT     VARCHAR2,	--000 success, others faild
				  P_STATUS	    OUT     VARCHAR2,	--new: The order has been created but the customer has not paid yet.
									--sucess: The customer has paid for the order successfully.
									--failed: The customer has tried to pay for the order but the payment failed.
									--voided: The payment has been voided by the merchant.
									--expired: The payment session has been expired.
									--partially_refunded: The payment has been partially refunded.
									--fully_refunded: The payment has been fully refunded.

				  P_MESSAGE	    OUT     VARCHAR2);

--This procedure checks the payment status.
--After the customer pays for the order, this procedure should be called in order to check that the payment is successful
PROCEDURE CHECK_PAYMENT_STATUS(P_BRN_NO 	    IN	    NUMBER,
			       P_CURR_CODE	    IN	    VARCHAR2,
			       P_AMOUNT 	    IN	    NUMBER,
			       P_GATEWAY_TYPE	    IN	    VARCHAR2,	--Payment Gateway: Tamara : 1 or tamara Tabby : 2 or tabby
			       P_ORDER_ID	    IN	    VARCHAR2,
			       P_CHECKOUT_ID	    IN	    VARCHAR2,
			       P_IS_SUCCESS	    OUT     BOOLEAN,
			       P_RESPONSE_CODE	    OUT     VARCHAR2,	--000 success, others faild
			       P_STATUS 	    OUT     VARCHAR2,	--sucess: The customer has paid for the order successfully.
									--failed: The customer has tried to pay for the order but the payment failed.
									--voided: The payment has been voided by the merchant.
									--expired: The payment session has been expired.
									--partially_refunded: The payment has been partially refunded.
									--fully_refunded: The payment has been fully refunded.
			       P_MESSAGE	    OUT     VARCHAR2);

--This procedure will refunds (fully or partially) a successfully compeleted payment.
PROCEDURE REFUND_PAYMENT(P_BRN_NO	      IN      NUMBER,
			 P_CURR_CODE	      IN      VARCHAR2,
			 P_AMOUNT	      IN      NUMBER,
			 P_REASON	      IN      VARCHAR2,
			 P_GATEWAY_TYPE       IN      VARCHAR2, 	--Payment Gateway: Tamara : 1 or tamara Tabby : 2 or tabby
			 P_ORDER_ID	      IN      VARCHAR2,
			 P_CHECKOUT_ID	      IN      VARCHAR2,
			 P_IS_SUCCESS	      OUT     BOOLEAN,
			 P_RESPONSE_CODE      OUT     VARCHAR2, 	--000 success, others faild
			 P_STATUS	      OUT     VARCHAR2, 	--sucess: The customer has paid for the order successfully.
									--failed: The customer has tried to pay for the order but the payment failed.
									--voided: The payment has been voided by the merchant.
									--expired: The payment session has been expired.
									--partially_refunded: The payment has been partially refunded.
									--fully_refunded: The payment has been fully refunded.
			 P_MESSAGE	      OUT     VARCHAR2);


--This procedure voids or cancels the payment befor the customer completes the payment.
--If it's called successfully the payment session will be expired and the customer will not be able to pay for the order.
PROCEDURE VOID_PAYMENT(P_BRN_NO 	    IN	    NUMBER,
		       P_GATEWAY_TYPE	    IN	    VARCHAR2,		--Payment Gateway: Tamara : 1 or tamara Tabby : 2 or tabby
		       P_ORDER_ID	    IN	    VARCHAR2,
		       P_CHECKOUT_ID	    IN	    VARCHAR2,
		       P_IS_SUCCESS	    OUT     BOOLEAN,
		       P_RESPONSE_CODE	    OUT     VARCHAR2,		--000 success, others faild
		       P_STATUS 	    OUT     VARCHAR2,		--sucess: The customer has paid for the order successfully.
									--failed: The customer has tried to pay for the order but the payment failed.
									--voided: The payment has been voided by the merchant.
									--expired: The payment session has been expired.
									--partially_refunded: The payment has been partially refunded.
									--fully_refunded: The payment has been fully refunded.
		       P_MESSAGE	    OUT     VARCHAR2);

PROCEDURE SET_WEB_SRVC_PRMTR(P_BRN_NO	  IN	  NUMBER);

PROCEDURE CALL_API(P_URL		in	VARCHAR2,
		   P_METHOD		in	VARCHAR2,
		   P_CONTENT		in	CLOB,
		   P_CONTENT_TYPE	in	VARCHAR2,
		   P_HTTP_STATUS_CODE	out	NUMBER,
		   P_RESPONSE		out	CLOB);
END YS_PAYMENT_GATEWAY_PKG;
/

-- ---------------------------------------------
-- PACKAGE BODY: YS_PAYMENT_GATEWAY_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE BODY YS_PAYMENT_GATEWAY_PKG
AS
--This procedure creates a payment session for the customer to pay for the order.
--If the payment session is created successfully, the customer will get an sms with a link to pay for the order.
PROCEDURE CREATE_CHECKOUT_SESSION(P_CNTRY_CODE	    IN	    VARCHAR2,	--Three -letters Country Code
				  P_BRN_NO	    IN	    NUMBER,
				  P_DOC_TYPE	    IN	    NUMBER,
				  P_DOC_SER	    IN	    NUMBER,
				  P_DOC_M_SQ	    IN	    NUMBER,
				  P_Doc_No	    In	    Number,
				  P_GATEWAY_TYPE    IN	    VARCHAR2,	--Payment Gateway: Tamara : 1 or tamara Tabby : 2 or tabby
				  P_AMOUNT	    IN	    NUMBER DEFAULT NULL,    --Temporary parameter stores the 'Payable Amount' for the invoice, serving as a hostfix for decimal inconsistencies.
				  P_IS_SUCCESS	    OUT     BOOLEAN,
				  P_ORDER_ID	    OUT     VARCHAR2,
				  P_CHECKOUT_ID     OUT     VARCHAR2,
				  P_PAYMENT_URL     OUT     VARCHAR2,	--The payment url that needed to be sent to the customer to compelete the payment
				  P_PAYMENT_QR	    OUT     VARCHAR2,	--The same payment url as QR image encoded as base64 string
				  P_RESPONSE_CODE   OUT     VARCHAR2,	--000 success, others faild
				  P_STATUS	    OUT     VARCHAR2,	--new: The order has been created but the customer has not paid yet.
									--sucess: The customer has paid for the order successfully.
									--failed: The customer has tried to pay for the order but the payment failed.
									--voided: The payment has been voided by the merchant.
									--expired: The payment session has been expired.
									--partially_refunded: The payment has been partially refunded.
									--fully_refunded: The payment has been fully refunded.
				  P_MESSAGE	    OUT     VARCHAR2)
IS
V_URL		    VARCHAR2(100) := '/api/Payment/v2/CreatePaymentSession?gatewayType='||P_GATEWAY_TYPE;
V_DOC_JSON	    CLOB;
V_HTTP_STATUS_CODE  NUMBER;
V_RESPONSE	    CLOB;
BEGIN

    IF P_BRN_NO IS NULL THEN
	RAISE_APPLICATION_ERROR(-20101, 'P_BRN_NO IS NULL');
    END IF;

    IF P_DOC_TYPE IS NULL THEN
	RAISE_APPLICATION_ERROR(-20101, 'P_DOC_TYPE IS NULL');
    END IF;

    IF P_DOC_SER IS NULL THEN
	RAISE_APPLICATION_ERROR(-20101, 'P_DOC_SER IS NULL');
    END IF;

    IF P_GATEWAY_TYPE IS NULL THEN
	RAISE_APPLICATION_ERROR(-20101, 'P_GATEWAY_TYPE IS NULL');
    END IF;

    SET_WEB_SRVC_PRMTR(P_BRN_NO => P_BRN_NO);

    V_DOC_JSON	:= YS_JSON_PKG.GNRT_E_INVC_JSON(P_DOC_TYPE	=>P_DOC_TYPE,
						P_DOC_SER	=>P_DOC_SER,
						P_OUT_TYP	=>0,
						P_UNISTR	=>0,
						P_LANG_NO	=>G_LANG_NO,
						P_CNTRY_CODE	=>P_CNTRY_CODE);

V_DOC_JSON := REGEXP_REPLACE(V_DOC_JSON,
'"PayableAmount":{
"Value":([^,]+)
,"CurrencyID":+',
'"PayableAmount":{
"Value":'||P_AMOUNT||'
,"CurrencyID":');

   /* V_DOC_JSON := REGEXP_REPLACE(V_DOC_JSON,
				 ',"ID":"([^,]+)"
,"IssueDateTime"',
				 ',"ID":"'||P_Doc_No||P_DOC_M_SQ||'"
,"IssueDateTime"');*/

V_DOC_JSON := REGEXP_REPLACE(V_DOC_JSON,
				 '("ID":"[^"]*")',
				 '\1'||chr(10)||',"UUID":"'||P_Doc_M_Sq||'"');

    IF	INSTR(V_DOC_JSON,'AccountingCustomerParty') = 0 THEN
		    DECLARE
		    	V_MOBILE_NO	    VARCHAR2(20);
		    BEGIN
		    	 SELECT MOBILE_NO INTO V_MOBILE_NO FROM IAS_POS_BILL_MST WHERE BILL_SRL=P_DOC_SER;
		    	 V_DOC_JSON := REPLACE(V_DOC_JSON, ',"Delivery"',',"AccountingCustomerParty":{"Party":{"Contact":{"Telephone":"'||V_MOBILE_NO||'", "ElectronicMail":"user@user.com"}}},"Delivery"');
		    END;
    END IF;

    BEGIN
    CALL_API(P_URL		  => G_BASE_URL || V_URL,
	     P_METHOD		  => 'POST',
	     P_CONTENT		  => V_DOC_JSON,
	     P_CONTENT_TYPE	  => 'application/json',
	     P_HTTP_STATUS_CODE   => V_HTTP_STATUS_CODE,
	     P_RESPONSE 	  => V_RESPONSE);
    EXCEPTION WHEN OTHERS THEN
	P_IS_SUCCESS := FALSE;
	P_MESSAGE := SQLERRM;
	RETURN;
    END;

    P_IS_SUCCESS := TRUE;

    SELECT ORDER_ID,
	   CHECKOUT_ID,
	   PAYMENT_URL,
	   PAYMENT_QR,
	   '000',
	   'new'
    INTO
	   P_ORDER_ID,
	   P_CHECKOUT_ID,
	   P_PAYMENT_URL,
	   P_PAYMENT_QR,
	   P_RESPONSE_CODE,
	   P_STATUS
    FROM JSON_TABLE(V_RESPONSE, '$' COLUMNS(
			ORDER_ID	    VARCHAR2(1024)  PATH '$.orderId',
			CHECKOUT_ID	    VARCHAR2(1024)  PATH '$.checkoutId',
			PAYMENT_URL	    VARCHAR2(1024)  PATH '$.paymentSessionUrl',
			PAYMENT_QR	    VARCHAR2(4000)  PATH '$.paymentQr')
		) AS JSON;
END CREATE_CHECKOUT_SESSION;

--This procedure checks the payment status.
--After the customer pays for the order, this procedure should be called in order to check that the payment is successful
PROCEDURE CHECK_PAYMENT_STATUS(P_BRN_NO 	    IN	    NUMBER,
			       P_CURR_CODE	    IN	    VARCHAR2,
			       P_AMOUNT 	    IN	    NUMBER,
			       P_GATEWAY_TYPE	    IN	    VARCHAR2,	--Payment Gateway: Tamara : 1 or tamara Tabby : 2 or tabby
			       P_ORDER_ID	    IN	    VARCHAR2,
			       P_CHECKOUT_ID	    IN	    VARCHAR2,
			       P_IS_SUCCESS	    OUT     BOOLEAN,
			       P_RESPONSE_CODE	    OUT     VARCHAR2,	--000 success, others faild
			       P_STATUS 	    OUT     VARCHAR2,	--sucess: The customer has paid for the order successfully.
									--failed: The customer has tried to pay for the order but the payment failed.
									--voided: The payment has been voided by the merchant.
									--expired: The payment session has been expired.
									--partially_refunded: The payment has been partially refunded.
									--fully_refunded: The payment has been fully refunded.
			       P_MESSAGE	    OUT     VARCHAR2)
IS
V_URL		    VARCHAR2(100) := '/api/Payment/checkPaymentStatus';
V_DOC_JSON	    CLOB;
V_HTTP_STATUS_CODE  NUMBER;
V_RESPONSE	    CLOB;
BEGIN

    IF P_BRN_NO IS NULL THEN
	RAISE_APPLICATION_ERROR(-20101, 'P_BRN_NO IS NULL');
    END IF;

    IF P_GATEWAY_TYPE IS NULL THEN
	RAISE_APPLICATION_ERROR(-20101, 'P_GATEWAY_TYPE IS NULL');
    END IF;

    SET_WEB_SRVC_PRMTR(P_BRN_NO => P_BRN_NO);

    V_DOC_JSON := '{
			"gatewayType": "'||P_GATEWAY_TYPE||'",
			"orderId": "'||P_ORDER_ID||'",
			"checkoutId": "'||P_CHECKOUT_ID||'",
			"currencyCode":"'||P_CURR_CODE||'",
			"amount":"'||P_AMOUNT||'"
		   }';

    BEGIN
    CALL_API(P_URL		  => G_BASE_URL || V_URL,
	     P_METHOD		  => 'POST',
	     P_CONTENT		  => V_DOC_JSON,
	     P_CONTENT_TYPE	  => 'application/json',
	     P_HTTP_STATUS_CODE   => V_HTTP_STATUS_CODE,
	     P_RESPONSE 	  => V_RESPONSE);
    EXCEPTION WHEN OTHERS THEN
	P_IS_SUCCESS := FALSE;
	P_MESSAGE := SQLERRM;
	RETURN;
    END;

    P_IS_SUCCESS := TRUE;

    SELECT STATUS,
	   CASE STATUS
		WHEN 'new'		    THEN    '000'
		WHEN 'success'		    THEN    '000'
		WHEN 'partially_refunded'   THEN    '000'
		WHEN 'fully_refunded'	    THEN    '000'
		ELSE  '999'
	   END RESPONSE_CODE
    INTO
	   P_STATUS,
	   P_RESPONSE_CODE
    FROM JSON_TABLE(V_RESPONSE, '$' COLUMNS(
			STATUS		  VARCHAR2(1024)  PATH '$.status',
			IS_SUCCESS	  VARCHAR2(1024)  PATH '$.isSuccess')
		) AS JSON;


END CHECK_PAYMENT_STATUS;

--This procedure will refunds (fully or partially) a successfully compeleted payment.
PROCEDURE REFUND_PAYMENT(P_BRN_NO	      IN      NUMBER,
			 P_CURR_CODE	      IN      VARCHAR2,
			 P_AMOUNT	      IN      NUMBER,
			 P_REASON	      IN      VARCHAR2,
			 P_GATEWAY_TYPE       IN      VARCHAR2, 	--Payment Gateway: Tamara : 1 or tamara Tabby : 2 or tabby
			 P_ORDER_ID	      IN      VARCHAR2,
			 P_CHECKOUT_ID	      IN      VARCHAR2,
			 P_IS_SUCCESS	      OUT     BOOLEAN,
			 P_RESPONSE_CODE      OUT     VARCHAR2, 	--000 success, others faild
			 P_STATUS	      OUT     VARCHAR2, 	--sucess: The customer has paid for the order successfully.
									--failed: The customer has tried to pay for the order but the payment failed.
									--voided: The payment has been voided by the merchant.
									--expired: The payment session has been expired.
									--partially_refunded: The payment has been partially refunded.
									--fully_refunded: The payment has been fully refunded.
			 P_MESSAGE	      OUT     VARCHAR2)
IS
V_URL		    VARCHAR2(100) := '/api/Payment/refundPayment';
V_DOC_JSON	    CLOB;
V_HTTP_STATUS_CODE  NUMBER;
V_RESPONSE	    CLOB;
BEGIN

    IF P_BRN_NO IS NULL THEN
	RAISE_APPLICATION_ERROR(-20101, 'P_BRN_NO IS NULL');
    END IF;

    IF P_GATEWAY_TYPE IS NULL THEN
	RAISE_APPLICATION_ERROR(-20101, 'P_GATEWAY_TYPE IS NULL');
    END IF;

    SET_WEB_SRVC_PRMTR(P_BRN_NO => P_BRN_NO);

    V_DOC_JSON := '{
			"gatewayType": "'||P_GATEWAY_TYPE||'",
			"orderId": "'||P_ORDER_ID||'",
			"checkoutId": "'||P_CHECKOUT_ID||'",
			"currencyCode":"'||P_CURR_CODE||'",
			"amount":"'||P_AMOUNT||'",
			"reason":"'||P_REASON||'"
		   }';

    BEGIN
    CALL_API(P_URL		  => G_BASE_URL || V_URL,
	     P_METHOD		  => 'POST',
	     P_CONTENT		  => V_DOC_JSON,
	     P_CONTENT_TYPE	  => 'application/json',
	     P_HTTP_STATUS_CODE   => V_HTTP_STATUS_CODE,
	     P_RESPONSE 	  => V_RESPONSE);
    EXCEPTION WHEN OTHERS THEN
	P_IS_SUCCESS := FALSE;
	P_MESSAGE := SQLERRM;
	RETURN;
    END;

    P_IS_SUCCESS := TRUE;

    SELECT STATUS,
	   CASE STATUS
		WHEN 'new'		    THEN    '000'
		WHEN 'success'		    THEN    '000'
		WHEN 'partially_refunded'   THEN    '000'
		WHEN 'fully_refunded'	    THEN    '000'
		ELSE  '999'
	   END RESPONSE_CODE
    INTO
	   P_STATUS,
	   P_RESPONSE_CODE
    FROM JSON_TABLE(V_RESPONSE, '$' COLUMNS(
			STATUS		  VARCHAR2(1024)  PATH '$.status',
			IS_SUCCESS	  VARCHAR2(1024)  PATH '$.isSuccess')
		) AS JSON;


END REFUND_PAYMENT;

--This procedure voids or cancels the payment befor the customer completes the payment.
--If it's called successfully the payment session will be expired and the customer will not be able to pay for the order.
PROCEDURE VOID_PAYMENT(P_BRN_NO 	    IN	    NUMBER,
		       P_GATEWAY_TYPE	    IN	    VARCHAR2,		--Payment Gateway: Tamara : 1 or tamara Tabby : 2 or tabby
		       P_ORDER_ID	    IN	    VARCHAR2,
		       P_CHECKOUT_ID	    IN	    VARCHAR2,
		       P_IS_SUCCESS	    OUT     BOOLEAN,
		       P_RESPONSE_CODE	    OUT     VARCHAR2,		--000 success, others faild
		       P_STATUS 	    OUT     VARCHAR2,		--sucess: The customer has paid for the order successfully.
									--failed: The customer has tried to pay for the order but the payment failed.
									--voided: The payment has been voided by the merchant.
									--expired: The payment session has been expired.
									--partially_refunded: The payment has been partially refunded.
									--fully_refunded: The payment has been fully refunded.
		       P_MESSAGE	    OUT     VARCHAR2)
IS
V_URL		    VARCHAR2(100) := '/api/Payment/voidPayment';
V_DOC_JSON	    CLOB;
V_HTTP_STATUS_CODE  NUMBER;
V_RESPONSE	    CLOB;
BEGIN

    IF P_BRN_NO IS NULL THEN
	RAISE_APPLICATION_ERROR(-20101, 'P_BRN_NO IS NULL');
    END IF;

    IF P_GATEWAY_TYPE IS NULL THEN
	RAISE_APPLICATION_ERROR(-20101, 'P_GATEWAY_TYPE IS NULL');
    END IF;

    SET_WEB_SRVC_PRMTR(P_BRN_NO => P_BRN_NO);
    V_DOC_JSON := '{
			"gatewayType": "'||P_GATEWAY_TYPE||'",
			"orderId": "'||P_ORDER_ID||'",
			"checkoutId": "'||P_CHECKOUT_ID||'"
		   }';

    BEGIN
    CALL_API(P_URL		  => G_BASE_URL || V_URL,
	     P_METHOD		  => 'POST',
	     P_CONTENT		  => V_DOC_JSON,
	     P_CONTENT_TYPE	  => 'application/json',
	     P_HTTP_STATUS_CODE   => V_HTTP_STATUS_CODE,
	     P_RESPONSE 	  => V_RESPONSE);
    EXCEPTION WHEN OTHERS THEN
	P_IS_SUCCESS := FALSE;
	P_MESSAGE := SQLERRM;
	RETURN;
    END;

    P_IS_SUCCESS := TRUE;

    SELECT STATUS,
	   '999' RESPONSE_CODE
    INTO
	   P_STATUS,
	   P_RESPONSE_CODE
    FROM JSON_TABLE(V_RESPONSE, '$' COLUMNS(
			STATUS		  VARCHAR2(1024)  PATH '$.status',
			IS_SUCCESS	  VARCHAR2(1024)  PATH '$.isSuccess')
		) AS JSON;


END VOID_PAYMENT;

PROCEDURE SET_WEB_SRVC_PRMTR(P_BRN_NO	  IN	  NUMBER)
IS
BEGIN
    SELECT
	SRVC_URL,
	NVL(IAS_PRMTR_PKG.GETPVAL(P_PRMTR=>'LANG_NO'), 1)
    INTO
	G_BASE_URL,
	G_LANG_NO
    FROM GNR_WEB_SRVC_MST
    WHERE (UPPER(SRVC_L_DSC) = 'YS_PAYMENT_GATEWAY' OR UPPER(SRVC_F_DSC) = 'YS_PAYMENT_GATEWAY')
    AND BRN_NO=P_BRN_NO
    AND ROWNUM<=1;
EXCEPTION WHEN
    NO_DATA_FOUND THEN
	RAISE_APPLICATION_ERROR(-20001, 'Error when getting web service parameters - No Data Found');
END;

PROCEDURE CALL_API(P_URL		in	VARCHAR2,
		   P_METHOD		in	VARCHAR2,
		   P_CONTENT		in	CLOB,
		   P_CONTENT_TYPE	in	VARCHAR2,
		   P_HTTP_STATUS_CODE	out	NUMBER,
		   P_RESPONSE		out	CLOB)
IS
V_RSPNS_BLOB	    BLOB;
V_FILE_NAME	    VARCHAR2(256);
V_CODE		    NUMBER;
V_MESSAGE	    VARCHAR2(1024);
BEGIN
    IF NVL(P_URL,'') = '' THEN
	RAISE_APPLICATION_ERROR(-20001,'Invalid value for parameter p_url');
    END IF;

    IAS_WEB_SRVC_PKG.CALL_WEB_SERVICE_BLOB(P_URL		=> P_URL,
					   P_METHOD		=> P_METHOD,
					   P_CONTENT_TYPE	=> 'application/json',
					   P_CONTENT		=> P_CONTENT,
					   P_RESPONSE_BLOB	=> V_RSPNS_BLOB,
					   P_HTTP_RSPONS_CODE	=> P_HTTP_STATUS_CODE,
					   P_FILE_NAME		=> V_FILE_NAME,
					   P_WALLET_PATH	=> NULL,
					   P_WALLET_PWD 	=> NULL,
					   P_USERNAME		=> NULL,
					   P_PASSWORD		=> NULL,
					   P_TOKEN		=> NULL);

    p_response := ias_web_srvc_pkg.BLOB_TO_CLOB(v_rspns_blob);

    if P_HTTP_STATUS_CODE not in (200,201) then
	select CODE,
	       MESSAGE
	into
	       V_CODE,
	       V_MESSAGE
	from json_table(p_response, '$' Columns(
			CODE		number		PATH '$.code',
			MESSAGE 	varchar2(1024)	PATH '$.message')--RuleCode
		) AS JSON;
	raise_application_error(To_Number('-20'||P_HTTP_STATUS_CODE),Nvl(v_message,p_response));
    end if;
END;
END YS_PAYMENT_GATEWAY_PKG;
/
