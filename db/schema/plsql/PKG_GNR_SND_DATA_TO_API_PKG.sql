-- =============================================
-- PACKAGE SPEC: GNR_SND_DATA_TO_API_PKG  (status: VALID)
-- =============================================
CREATE OR REPLACE
PACKAGE GNR_SND_DATA_TO_API_PKG AS
    G_SRVC_NO	    NUMBER;
    G_SRVC_URL	    VARCHAR2(1000);
    G_USERNAME	    VARCHAR2(100);
    G_PASSWORD	    VARCHAR2(100);
    G_PROXY_URL     VARCHAR2(100);

  --##Types Decclarations
 type http_hdr is record (
     header_attr varchar2(1000),
     header_value varchar2(4000)
   );

type http_hdr_tbl is table of http_hdr;
--##End Type Declarations

FUNCTION GET_API_VLU_FNC (P_STR IN VARCHAR2,P_PRMTR IN VARCHAR2,P_TYP IN NUMBER) RETURN VARCHAR2;
PROCEDURE SND_ITMS_TO_API_PRC  (P_DOC_TYP NUMBER,P_BRN_NO NUMBER,P_DOC_SRL NUMBER,P_HTTP_STATUS_CODE OUT NUMBER,P_RESPONSE OUT VARCHAR2);
PROCEDURE SND_ITMS_TO_PRNTR_PRC(P_DOC_TYP NUMBER,P_BRN_NO NUMBER,P_DOC_SRL NUMBER,P_HTTP_STATUS_CODE OUT NUMBER,P_RESPONSE OUT VARCHAR2);
PROCEDURE GET_WEB_SRVC_INFO_PRC(P_DOC_TYP NUMBER,P_BRN_NO NUMBER);
FUNCTION GET_SND_DATA_TYP_FNC (P_BRN_NO NUMBER) RETURN NUMBER;
PROCEDURE CALL_API(P_URL		IN	VARCHAR2,
		   P_METHOD		IN	VARCHAR2,
		   P_CONTENT		IN	VARCHAR2,
		   P_CONTENT_TYPE	IN	VARCHAR2,
		   P_HTTP_STATUS_CODE	OUT	NUMBER,
		   P_RESPONSE		OUT	VARCHAR2);
PROCEDURE SND_DATA_API_PRNTR_PRC (P_DOC_TYP IN NUMBER,
				  P_DOC_SRL IN NUMBER,
				  P_BRN_NO  IN NUMBER,
				  P_HTTP_STATUS_CODE   OUT   NUMBER,
				  P_RESPONSE	       OUT   VARCHAR2);
procedure Call_Web_Service_blob(p_url	  varchar2,
		  p_method  varchar2 default 'GET',
		  p_content_type varchar2,
		  p_content VARCHAR2,
		  p_response_blob out VARCHAR2,
		  p_http_rspons_code out number,
		  p_file_name	     out varchar2,
		  p_wallet_path varchar2,
		  p_wallet_pwd varchar2,
		  p_header  http_hdr_tbl default null,
		  p_username varchar2 default null,
		  p_password  varchar2 default null,
		  p_token varchar2 default null
		  ) ;
END GNR_SND_DATA_TO_API_PKG;
/

-- ---------------------------------------------
-- PACKAGE BODY: GNR_SND_DATA_TO_API_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE BODY GNR_SND_DATA_TO_API_PKG AS
FUNCTION GET_API_VLU_FNC (P_STR IN VARCHAR2,P_PRMTR IN VARCHAR2,P_TYP IN NUMBER) RETURN VARCHAR2
IS
   V_RET_TXT VARCHAR2(1000);
BEGIN
    IF P_TYP=1 THEN
	V_RET_TXT:=SUBSTR(P_STR, INSTR( P_STR,P_PRMTR)+LENGTH(P_PRMTR)+3,(INSTR(P_STR,'"',INSTR( P_STR,P_PRMTR)+LENGTH(P_PRMTR)+3)-(INSTR( P_STR,P_PRMTR)+LENGTH(P_PRMTR)+3))) ;
    ELSIF P_TYP=2 THEN
	V_RET_TXT:=SUBSTR(P_STR, INSTR( P_STR,P_PRMTR)+LENGTH(P_PRMTR)+2,(INSTR(P_STR,',',INSTR( P_STR,P_PRMTR)+LENGTH(P_PRMTR)+2)-(INSTR( P_STR,P_PRMTR)+LENGTH(P_PRMTR)+2))) ;
    ELSIF P_TYP=3 THEN
	V_RET_TXT:=SUBSTR(P_STR, INSTR( P_STR,P_PRMTR)+LENGTH(P_PRMTR)+2,(INSTR(P_STR,'}',INSTR( P_STR,P_PRMTR)+LENGTH(P_PRMTR)+2)-(INSTR( P_STR,P_PRMTR)+LENGTH(P_PRMTR)+2))) ;
    END IF;
    RETURN V_RET_TXT;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END GET_API_VLU_FNC;
--##-----------------------------------------------------------------------------------------##--
PROCEDURE SND_ITMS_TO_API_PRC (P_DOC_TYP NUMBER,P_BRN_NO NUMBER,P_DOC_SRL NUMBER,P_HTTP_STATUS_CODE OUT NUMBER,P_RESPONSE OUT VARCHAR2) IS
    REQ      UTL_HTTP.REQ;
    RES      UTL_HTTP.RESP;
    --URL      VARCHAR2 (32000) := 'http://testapi.totalvfd.co.tz/sales';
    BUFFER     VARCHAR2 (32000);
    RESULT     VARCHAR2(32000);
    RCTVNUM VARCHAR2(200);
    VERIFICATIONLINK VARCHAR2(500);
    V_MSG VARCHAR2(4000);
    V_STM VARCHAR2(32000);
    V_PAID_AMT NUMBER;
    V_PAID_AMT2 NUMBER;
    V_TOTAL_AMT NUMBER;
    V_CARD_AMT NUMBER;
    V_BILL_TYP NUMBER;
    V_CRDT_AMT NUMBER;
    V_FLG NUMBER;
    V_BILL_DATE DATE;
    V_C_CODE VARCHAR2(30);
    V_CST_NM VARCHAR2(500);
    V_CST_PHONE VARCHAR2(50);
    V_ID_TYP  VARCHAR2(2) :=1;
    V_ID_NO VARCHAR2(50);
    V_DISCOUNT_MST NUMBER;
    V_SUM_AMT_WITH_VAT NUMBER;
    V_SUM_AMT_WITHOUT_VAT NUMBER;
    V_REPLACE_AMT NUMBER;
    V_HTTP_STATUS_CODE NUMBER;
BEGIN
  GET_WEB_SRVC_INFO_PRC (P_DOC_TYP =>P_DOC_TYP,P_BRN_NO=>P_BRN_NO);
     BEGIN
	SELECT BILL_TYPE,BILL_DATE,C_CODE,(NVL(CR_CARD_AMT,0) +NVL(CR_CARD_AMT_SCND,0) +NVL(CR_CARD_AMT_THRD,0)) CRDT_CARD,ROUND(NVL(DISC_AMT,0)) DISC_AMT,RET_AMT,
	       C_NAME,MOBILE_NO,C_TAX_CODE,FIELD4
	  INTO V_BILL_TYP,V_BILL_DATE,V_C_CODE,V_CARD_AMT,V_DISCOUNT_MST,V_REPLACE_AMT,
	       V_CST_NM,V_CST_PHONE,V_ID_NO,V_ID_TYP
       FROM POS_BILL_MST_ALL_VW WHERE BILL_NO=P_DOC_SRL;
     EXCEPTION WHEN OTHERS THEN
	RAISE_APPLICATION_ERROR (-20001,'Err when get data from bill= '||P_DOC_SRL);
     END;
   /* BEGIN
    SELECT BILL_TYPE,BILL_DATE,C_CODE,CRDT_CARD,DISC_AMT,RET_AMT
      INTO V_BILL_TYP,V_BILL_DATE,V_C_CODE,V_CARD_AMT,V_DISCOUNT_MST,V_REPLACE_AMT
      FROM (select BILL_TYPE,BILL_DATE,C_CODE,(NVL(CR_CARD_AMT,0) +NVL(CR_CARD_AMT_SCND,0) +NVL(CR_CARD_AMT_THRD,0)) CRDT_CARD,BILL_NO,ROUND(NVL(DISC_AMT,0)) DISC_AMT,RET_AMT
       From IAS_POS_BILL_MST WHERE BILL_NO=P_DOC_SRL
	    Union
	    Select BILL_TYPE,BILL_DATE,C_CODE,(NVL(CR_CARD_AMT,0) +NVL(CR_CARD_AMT_SCND,0) +NVL(CR_CARD_AMT_THRD,0)) CRDT_CARD,BILL_NO,ROUND(NVL(DISC_AMT,0)) DISC_AMT,RET_AMT
	    From IAS_POS_HST_BILL_MST WHERE BILL_NO=P_DOC_SRL)
     WHERE BILL_NO=P_DOC_SRL;
     EXCEPTION WHEN OTHERS THEN
	RAISE_APPLICATION_ERROR (-20001,'Err when get data from bill '||P_DOC_SRL);
     END;
    SELECT FIELD1,FIELD2,FIELD3,FIELD4
	INTO V_CST_NM,V_CST_PHONE,V_ID_NO,V_ID_TYP
	FROM (SELECT FIELD1 ,FIELD2 ,FIELD3,FIELD4 FROM IAS_POS_BILL_MST WHERE BILL_NO=P_DOC_SRL
	UNION
	SELECT FIELD1 ,FIELD2 ,FIELD3,FIELD4 FROM IAS_POS_HST_BILL_MST WHERE BILL_NO=P_DOC_SRL ) ;
	*/
    SELECT ROUND(SUM(I_PRICE_VAT-DIS_AMT),2) PAID INTO V_PAID_AMT FROM
       (SELECT ROUND((I_QTY*I_PRICE_VAT),2) I_PRICE_VAT,ROUND((I_QTY*NVL(DIS_AMT_MST_VAT,0)),2) DIS_AMT FROM IAS_POS_BILL_DTL WHERE  BILL_NO=P_DOC_SRL
	UNION
	SELECT ROUND((I_QTY*I_PRICE_VAT),2) I_PRICE_VAT,ROUND((I_QTY*NVL(DIS_AMT_MST_VAT,0)),2) DIS_AMT FROM IAS_POS_HST_BILL_DTL WHERE  BILL_NO=P_DOC_SRL);

      SELECT ROUND(SUM((I_PRICE_VAT-DIS_AMT)),2) INTO V_PAID_AMT2 FROM
    (SELECT I_NAME,CODE,I_QTY,(I_PRICE_VAT-RPLC) I_PRICE_VAT,ITM_UNT,VAT,BILL_NO,DIS_AMT FROM
    (SELECT I_NAME,CODE,I_QTY,I_PRICE_VAT,ITM_UNT,VAT,BILL_NO,DIS_AMT,ROUND(((I_PRICE_VAT-DIS_AMT)/V_PAID_AMT)*(NVL(V_REPLACE_AMT,0)),2) RPLC FROM
       (SELECT I_CODE CODE,I_QTY I_QTY,ROUND((I_QTY*I_PRICE_VAT),2) I_PRICE_VAT,ITM_UNT,DECODE(NVL(VAT_AMT,0),0,'C','A') VAT,BILL_NO,ROUND((I_QTY*NVL(DIS_AMT_MST_VAT,0)),2) DIS_AMT,RCRD_NO FROM IAS_POS_BILL_DTL WHERE BILL_NO=P_DOC_SRL
	UNION
	SELECT I_CODE CODE,I_QTY I_QTY,ROUND((I_QTY*I_PRICE_VAT),2) I_PRICE_VAT,ITM_UNT,DECODE(NVL(VAT_AMT,0),0,'C','A') VAT,BILL_NO,ROUND((I_QTY*NVL(DIS_AMT_MST_VAT,0)),2) DIS_AMT,RCRD_NO FROM IAS_POS_HST_BILL_DTL WHERE BILL_NO=P_DOC_SRL), IAS_ITM_MST T WHERE T.I_CODE=CODE AND BILL_NO=P_DOC_SRL));

   V_TOTAL_AMT:=V_PAID_AMT2;
   IF NVL(V_CARD_AMT,0)> NVL(V_PAID_AMT2,0) THEN
     V_CARD_AMT:=V_PAID_AMT2;
   END IF;
   IF NVL(V_CARD_AMT,0) >0 THEN

    V_TOTAL_AMT:=NVL(V_TOTAL_AMT,0)-NVL(V_CARD_AMT,0);
   END IF;
     V_FLG:=0;
     V_STM:=	'{
   "serial": "10TZ100614",
    "items": [';
     FOR DTL IN
    (SELECT I_NAME,CODE,I_QTY,ROUND((NVL(I_PRICE_VAT,0)-RPLC),2) I_PRICE_VAT,ITM_UNT,VAT,BILL_NO,DIS_AMT FROM
    (SELECT I_NAME,CODE,I_QTY,I_PRICE_VAT,ITM_UNT,VAT,BILL_NO,DIS_AMT,ROUND(((I_PRICE_VAT-DIS_AMT)/V_PAID_AMT)*(NVL(V_REPLACE_AMT,0)),2) RPLC FROM
       (SELECT I_CODE CODE,I_QTY I_QTY,ROUND((I_QTY*I_PRICE_VAT),2) I_PRICE_VAT,ITM_UNT,DECODE(NVL(VAT_AMT,0),0,'C','A') VAT,BILL_NO,ROUND((I_QTY*NVL(DIS_AMT_MST_VAT,0)),2) DIS_AMT,RCRD_NO FROM IAS_POS_BILL_DTL WHERE  BILL_NO=P_DOC_SRL
	UNION
	SELECT I_CODE CODE,I_QTY I_QTY,ROUND((I_QTY*I_PRICE_VAT),2) I_PRICE_VAT,ITM_UNT,DECODE(NVL(VAT_AMT,0),0,'C','A') VAT,BILL_NO,ROUND((I_QTY*NVL(DIS_AMT_MST_VAT,0)),2) DIS_AMT,RCRD_NO FROM IAS_POS_HST_BILL_DTL WHERE BILL_NO=P_DOC_SRL ), IAS_ITM_MST T WHERE T.I_CODE=CODE AND BILL_NO=P_DOC_SRL))
     LOOP
	IF V_FLG = 1 THEN
	    V_STM:=V_STM||',';
	END IF;
	V_STM:=V_STM||'{
	    "id": "0002",
	    "name": '||'"'||TRIM(REPLACE(DTL.I_NAME,'"',''))||'"'||',
	    "price": '||DTL.I_PRICE_VAT||',
	    "qty": '||DTL.I_QTY||',
	    "vatGroup": '||'"'||DTL.VAT||'"'||',
	    "discount": '||DTL.DIS_AMT||'
	}';
    V_FLG:=1;
    END LOOP;

    IF V_ID_NO IS NULL THEN
	  V_ID_TYP:=6;
    END IF;

    V_STM:=V_STM||'],
    "customer": {
	"name": "'||V_CST_NM||'",
	"mobile": "'||V_CST_PHONE||'",
	"idType": "'||V_ID_TYP||'",
	"idValue": "'||V_ID_NO||'"
    },
    "payments": [';
    IF NVL(V_TOTAL_AMT,0) >0 THEN
	V_STM:=V_STM||'{
	    "type": "cash",';
	IF V_TOTAL_AMT<1 THEN
	    V_STM:=V_STM||'
	    "amount": '||TO_CHAR(V_TOTAL_AMT,'0D99');
	ELSE
	    V_STM:=V_STM||'
	    "amount": '||V_TOTAL_AMT;
	END IF;
	V_STM:=V_STM||'
	}';

	IF NVL(V_CARD_AMT,0)>0 THEN
	    V_STM:=V_STM||',';
	END IF;
    END IF;
    IF NVL(V_CARD_AMT,0) >0 THEN
	V_STM:=V_STM||'{
	    "type": "ccard",';
	IF V_CARD_AMT<1 THEN
	    V_STM:=V_STM||'
	    "amount": '||TO_CHAR(V_CARD_AMT,'0D99');
	ELSE
	    V_STM:=V_STM||'
	    "amount": '||V_CARD_AMT;
	END IF;
	V_STM:=V_STM||'
	}';
    END IF;

    V_STM:=V_STM||']
}';

    /*REQ			 := UTL_HTTP.BEGIN_REQUEST (G_SRVC_URL, 'POST', UTL_HTTP.HTTP_VERSION_1_1);
    UTL_HTTP.SET_HEADER (REQ, 'content-type', 'application/json; charset=utf-8');
    --UTL_HTTP.SET_HEADER(REQ, 'CONTENT-TYPE', 'APPLICATION/JSON; CHARSET=AL32UTF8');
    UTL_HTTP.SET_HEADER (REQ, 'Content-Length', LENGTH (V_STM) );
    --UTL_HTTP.SET_HEADER (REQ, 'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyYWQ4MDU4NTNhNmY0YWE1OTljYjk2NiIsInJvbGUiOiJwcm9wcmlldG9yIiwiaWF0IjoxNzAwOTk3NDAzfQ.-2JGlalAbxneTzfmMx2Qb2RXqwGY7Af-g_mtnGpeCi4');
    --UTL_HTTP.SET_HEADER (REQ, 'x-active-business', '62f21fd6de3e190a6c34ef37');
    UTL_HTTP.SET_HEADER (REQ, 'Authorization', G_USERNAME);
    UTL_HTTP.SET_HEADER (REQ, 'x-active-business',G_PASSWORD );
    UTL_HTTP.WRITE_TEXT (REQ, V_STM);
    RES 		       := UTL_HTTP.GET_RESPONSE (REQ);
    -- PROCESS THE RESPONSE FROM THE HTTP CALL
    BEGIN
	LOOP
	    UTL_HTTP.READ_LINE (RES, BUFFER);
	    RESULT:=RESULT||BUFFER;
	    --DBMS_OUTPUT.PUT_LINE (BUFFER);
	END LOOP;
	UTL_HTTP.END_RESPONSE (RES);
    EXCEPTION WHEN UTL_HTTP.END_OF_BODY THEN
	UTL_HTTP.END_RESPONSE (RES);
    END;    */

    CALL_API(P_URL		  => G_SRVC_URL,
	     P_METHOD		  => 'POST',
	     P_CONTENT		  => V_STM,
	     P_CONTENT_TYPE	  => 'application/json; charset=utf-8',
	     P_HTTP_STATUS_CODE   => P_HTTP_STATUS_CODE,--V_HTTP_STATUS_CODE,
	     P_RESPONSE 	  => P_RESPONSE); --RESULT);

    V_MSG:=GET_API_VLU_FNC(RESULT,'msg',1);
    --DBMS_OUTPUT.PUT_LINE (RESULT);
    IF V_MSG IS NOT NULL THEN
	RAISE_APPLICATION_ERROR(-20601,'ERR WHEN SEND DATA TO API '|| V_MSG);
    END IF;
    RCTVNUM:=GET_API_VLU_FNC(RESULT,'rctvnum',1);
    --DBMS_OUTPUT.PUT_LINE (CHR(10)||RCTVNUM);
    VERIFICATIONLINK:=GET_API_VLU_FNC(RESULT,'verificationLink',1);
    BEGIN
       UPDATE IAS_POS_BILL_MST SET  WEB_SRVC_TRNSFR_DATA_FLG=1,WEB_SRVC_UUID=RCTVNUM,WEB_SRVC_TRNSFR_DATA_DSC=VERIFICATIONLINK
       WHERE BILL_NO=P_DOC_SRL;

       UPDATE IAS_POS_HST_BILL_MST SET	WEB_SRVC_TRNSFR_DATA_FLG=1,WEB_SRVC_UUID=RCTVNUM,WEB_SRVC_TRNSFR_DATA_DSC=VERIFICATIONLINK
       WHERE BILL_NO=P_DOC_SRL;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
    --DBMS_OUTPUT.PUT_LINE (CHR(10)||VERIFICATIONLINK);
   /* INSERT INTO VFD_BILL_DATA_TEST (BILL_NO,BILL_NO_VFD,URL,BILL_DATE)
    VALUES
    (P_DOC_SRL,RCTVNUM,VERIFICATIONLINK,V_BILL_DATE);
    COMMIT;
    */
END SND_ITMS_TO_API_PRC;
--##-----------------------------------------------------------------------##--
PROCEDURE SND_ITMS_TO_PRNTR_PRC (P_DOC_TYP NUMBER,P_BRN_NO NUMBER,P_DOC_SRL NUMBER,P_HTTP_STATUS_CODE OUT NUMBER,P_RESPONSE OUT VARCHAR2)  IS
    REQ      UTL_HTTP.REQ;
    RES      UTL_HTTP.RESP;
    --URL      VARCHAR2 (32000) := 'http://localhost/FPAPrinterApi/api/PrintReport';
    BUFFER   VARCHAR2 (32000);
    CONTENT  VARCHAR2 (32000);
    V_STM VARCHAR2(32000);
    V_PAID_AMT NUMBER;
    V_CASH_AMT NUMBER;
    V_CARD_AMT NUMBER;
    V_BILL_TYP NUMBER;
    V_CRDT_AMT NUMBER;
    V_FLG NUMBER;
    V_C_CODE VARCHAR2(30);
    V_CST_NM VARCHAR2(500);
    V_CST_PHONE VARCHAR2(50);
    V_ID_TYP VARCHAR2(2):=1;
    V_ID_NO VARCHAR2(50);
    V_HTTP_STATUS_CODE NUMBER;
    RESULT  VARCHAR2(32000);
BEGIN

  GET_WEB_SRVC_INFO_PRC (P_DOC_TYP =>P_DOC_TYP,P_BRN_NO=>P_BRN_NO);

   BEGIN
	/*SELECT BILL_TYPE,BILL_DATE,C_CODE,(NVL(CR_CARD_AMT,0) +NVL(CR_CARD_AMT_SCND,0) +NVL(CR_CARD_AMT_THRD,0)) CRDT_CARD,ROUND(NVL(DISC_AMT,0)) DISC_AMT,RET_AMT,
	       C_NAME,MOBILE_NO,C_TAX_CODE,FIELD4
	  INTO V_BILL_TYP,V_BILL_DATE,V_C_CODE,V_CARD_AMT,V_DISCOUNT_MST,V_REPLACE_AMT,
	       V_CST_NM,V_CST_PHONE,V_ID_NO,V_ID_TYP
       FROM POS_BILL_MST_ALL_VW WHERE BILL_NO=P_DOC_SRL;*/
       select BILL_TYPE,NVL(PAYED_AMT,0) PAYD_AMT,C_CODE,(NVL(CR_CARD_AMT,0) +NVL(CR_CARD_AMT_SCND,0) +NVL(CR_CARD_AMT_THRD,0)) CRDT_CARD,
	      C_NAME,MOBILE_NO,C_TAX_CODE,FIELD4
	 into V_BILL_TYP,V_PAID_AMT,V_C_CODE,V_CARD_AMT,
	      V_CST_NM,V_CST_PHONE,V_ID_NO,V_ID_TYP
       from POS_BILL_MST_ALL_VW
	     WHERE BILL_NO=P_DOC_SRL;
     EXCEPTION WHEN OTHERS THEN
	RAISE_APPLICATION_ERROR (-20001,'Err when get data from bill= '||P_DOC_SRL);
     END;

    /*SELECT BILL_TYPE,PAYD_AMT,C_CODE,
	   CRDT_CARD
      INTO V_BILL_TYP,V_PAID_AMT,V_C_CODE,V_CARD_AMT
      FROM (select BILL_TYPE,NVL(PAYED_AMT,0) PAYD_AMT,C_CODE,(NVL(CR_CARD_AMT,0) +NVL(CR_CARD_AMT_SCND,0) +NVL(CR_CARD_AMT_THRD,0)) CRDT_CARD,BILL_NO from IAS_POS_BILL_MST
	     WHERE BILL_NO=P_DOC_SRL
	    union
	    select BILL_TYPE,NVL(PAYED_AMT,0) PAYD_AMT,C_CODE,(NVL(CR_CARD_AMT,0) +NVL(CR_CARD_AMT_SCND,0) +NVL(CR_CARD_AMT_THRD,0)) CRDT_CARD,BILL_NO from IAS_POS_HST_BILL_MST
	     WHERE BILL_NO=P_DOC_SRL )
     WHERE BILL_NO=P_DOC_SRL;


	SELECT FIELD3,FIELD1 INTO V_CST_NM,V_ID_NO FROM(SELECT FIELD3 FIELD3,FIELD1 FIELD1,BILL_NO FROM IAS_POS_BILL_MST WHERE BILL_NO=P_DOC_SRL
	UNION
	SELECT FIELD3 FIELD3,FIELD1 FIELD1,BILL_NO FROM IAS_POS_HST_BILL_MST WHERE BILL_NO=P_DOC_SRL  ) WHERE BILL_NO=P_DOC_SRL ;
    --END IF;
    */
    IF V_BILL_TYP =1 THEN
	V_CASH_AMT:=V_PAID_AMT-V_CARD_AMT;
	IF V_CASH_AMT>0 THEN
	    V_CASH_AMT:=V_PAID_AMT;
	    V_CARD_AMT:=0;
	END IF;

    ELSIF V_BILL_TYP=2 THEN
	V_CRDT_AMT:=V_PAID_AMT;
	V_CASH_AMT:=0;
	V_CARD_AMT:=0;
    END IF;
    V_STM:='{
	      "custName": "'||V_CST_NM||'",
	      "idTyp": "'||V_ID_TYP||'",
	      "idNo": "'||V_ID_NO||'",
	      "custPhone": "'||V_CST_PHONE||'",
	      "itemData": [';
    V_FLG:=0;
    FOR DTL IN
    (SELECT I_NAME,CODE,I_QTY,I_PRICE_VAT,ITM_UNT,VAT,BILL_NO FROM (SELECT I_CODE CODE,I_QTY I_QTY,I_PRICE_VAT,ITM_UNT,DECODE(NVL(VAT_AMT,0),0,'C','A') VAT,BILL_NO,RCRD_NO FROM IAS_POS_BILL_DTL Where BILL_NO=P_DOC_SRL
	UNION
	SELECT I_CODE CODE,I_QTY I_QTY,I_PRICE_VAT,ITM_UNT,DECODE(NVL(VAT_AMT,0),0,'C','A') VAT,BILL_NO,RCRD_NO FROM IAS_POS_HST_BILL_DTL Where BILL_NO=P_DOC_SRL ),IAS_ITM_MST T WHERE T.I_CODE=CODE AND BILL_NO=P_DOC_SRL)
    LOOP
	IF V_FLG = 1 THEN
	    V_STM:=V_STM||',';
	END IF;
	V_STM:=V_STM||'{
			  "itemName": "'||TRIM(REPLACE(DTL.I_NAME,'"',''))||'",
			  "taxCd": "'||DTL.VAT||'",
			  "price": "'||DTL.I_PRICE_VAT||'",
			  "qty": "'||DTL.I_QTY||'",
			  "itemUnit": "'||DTL.ITM_UNT||'"
			}';

	V_FLG:=1;
    END LOOP;
    V_STM:=V_STM||'],
	   "paymentData": [';

    IF V_CRDT_AMT >0 THEN
	V_STM:=V_STM||'{
			  "paymentType": "P",
			  "paymentAmount": "'||V_CRDT_AMT||'"
			}';
    END IF;
    V_FLG:=0;
    IF V_CASH_AMT >0 THEN
	V_FLG:=1;
	V_STM:=V_STM||'{
			  "paymentType": "P",
			  "paymentAmount": "'||V_CASH_AMT||'"
			}';
    END IF;
    IF V_CARD_AMT >0 THEN

	V_STM:=V_STM||'{
			  "paymentType": "N",
			  "paymentAmount": "'||V_CARD_AMT||'"
			}';
    END IF;
    V_STM:=V_STM||'],
	      "description": [
		"Invoice NO:'||P_DOC_SRL||'"
	      ]
	    }';

    CONTENT:=V_STM;
    ---------CALL API
    REQ  := UTL_HTTP.BEGIN_REQUEST (G_SRVC_URL, 'POST', UTL_HTTP.HTTP_VERSION_1_1);

    UTL_HTTP.SET_HEADER (REQ, 'content-type', 'application/json; charset=utf-8');
    --UTL_HTTP.SET_HEADER(REQ, 'CONTENT-TYPE', 'APPLICATION/JSON; CHARSET=AL32UTF8');
    UTL_HTTP.SET_HEADER (REQ, 'Content-Length', LENGTH (CONTENT) );
    UTL_HTTP.WRITE_TEXT (REQ, CONTENT);
    RES 		       := UTL_HTTP.GET_RESPONSE (REQ);
    -- PROCESS THE RESPONSE FROM THE HTTP CALL
    BEGIN
	LOOP
	    UTL_HTTP.READ_LINE (RES, BUFFER);
	    DBMS_OUTPUT.PUT_LINE (BUFFER);
	END LOOP;

	UTL_HTTP.END_RESPONSE (RES);
    EXCEPTION WHEN UTL_HTTP.END_OF_BODY THEN
	UTL_HTTP.END_RESPONSE (RES);
    END;

    /*
    CALL_API(P_URL		  => G_SRVC_URL,
	     P_METHOD		  => 'POST',
	     P_CONTENT		  => CONTENT,
	     P_CONTENT_TYPE	  => 'application/json; charset=utf-8',
	     P_HTTP_STATUS_CODE   => P_HTTP_STATUS_CODE,--V_HTTP_STATUS_CODE,
	     P_RESPONSE 	  => P_RESPONSE); --RESULT);
	     */
END SND_ITMS_TO_PRNTR_PRC;
--##-----------------------------------------------------------------------##--
PROCEDURE GET_WEB_SRVC_INFO_PRC (P_DOC_TYP NUMBER,P_BRN_NO NUMBER) IS
BEGIN
    SELECT SRVC_URL,
	   USER_NAME,
	   PASSWORD
      INTO G_SRVC_URL,
	   G_USERNAME,
	   G_PASSWORD
      FROM GNR_WEB_SRVC_MST
     WHERE DOC_TYP = P_DOC_TYP
      AND  BRN_NO=P_BRN_NO
      AND ROWNUM <= 1;
    EXCEPTION WHEN NO_DATA_FOUND THEN
	    RAISE_APPLICATION_ERROR(-20001, 'Error when getting web service parameters - No Data Found');
	    WHEN OTHERS THEN
	    RAISE_APPLICATION_ERROR(-20002, 'Error when getting web service ');
END GET_WEB_SRVC_INFO_PRC;
--##-----------------------------------------------------------------------##--
FUNCTION GET_SND_DATA_TYP_FNC (P_BRN_NO NUMBER) RETURN NUMBER IS
   V_USE_E_INVOICE NUMBER;
   V_POS_REF_CODE  S_BRN.POS_REF_CODE%TYPE;
BEGIN
  IF P_BRN_NO IS NOT NULL THEN
     SELECT USE_E_INVOICE,
	    POS_REF_CODE
       INTO V_USE_E_INVOICE,
	    V_POS_REF_CODE
      FROM S_BRN
       WHERE BRN_NO=P_BRN_NO AND CNTRY_NO IN (167,220);
     IF NVL(V_USE_E_INVOICE,0)=1 THEN
	RETURN(1); --##SEND DTAT TO URL
     ELSIF NVL(V_POS_REF_CODE,0)>0 THEN
	 RETURN(2);--##SEND TO PRINTER
     ELSE
	RETURN(0);
     END IF;
  ELSE
      RETURN(0);
  END IF;
EXCEPTION WHEN OTHERS THEN
  RETURN(0);
END GET_SND_DATA_TYP_FNC;
--##-----------------------------------------------------------------------##--
PROCEDURE CALL_API(P_URL		IN	VARCHAR2,
		   P_METHOD		IN	VARCHAR2,
		   P_CONTENT		IN	VARCHAR2,
		   P_CONTENT_TYPE	IN	VARCHAR2,
		   P_HTTP_STATUS_CODE	OUT	NUMBER,
		   P_RESPONSE		OUT	VARCHAR2)
IS
V_RSPNS_BLOB	    VARCHAR2(32000);
V_FILE_NAME	    VARCHAR2(256);
V_STATUS_CODE	    NUMBER;
V_MESSAGE	    VARCHAR2(1024);
V_SUCCESS	    VARCHAR2(10);
V_USER_MESSAGE	    VARCHAR2(1024);
V_RULE_CODE	    VARCHAR2(1024);
V_JOBJ_TMP	    PLJSON;
V_PROXY_BODY	    VARCHAR2(32000);
V_CONTENT	    VARCHAR2(32000);
V_RULE_CODE_MSG     VARCHAR2(1024);
PRAGMA AUTONOMOUS_TRANSACTION;
BEGIN
    IF NVL(P_URL,'') = '' THEN
	RAISE_APPLICATION_ERROR(-20001,'Invalid value for parameter p_url');
    END IF;

    --dbms_output.put_line(p_url);
    IF P_CONTENT IS NOT NULL THEN
	V_CONTENT := REPLACE(PLJSON(P_CONTENT).TO_CHAR(FALSE),'"','\"');
    END IF;

    V_PROXY_BODY:= '{
		    "request":{
			"url":"'||P_URL||'",
			"method":"'||P_METHOD||'",
			"username":"",
			"password":"",
			"contentType":"'||P_CONTENT_TYPE||'",
			"body":"'||V_CONTENT||'",
			"header":[
			    {
				"name":"Authorization",
				"value":"'||G_USERNAME||'"
			    },
			    {
				"name":"x-active-business",
				"value":"'||G_PASSWORD||'"
			    }
			],
			"parameters":[]
		    }
		 }';

    CALL_WEB_SERVICE_BLOB(P_URL   => G_PROXY_URL,
			   P_METHOD  =>'POST',
			   P_CONTENT_TYPE => 'application/json',
			   P_CONTENT => V_PROXY_BODY,
			   P_RESPONSE_BLOB => V_RSPNS_BLOB,
			   P_HTTP_RSPONS_CODE => P_HTTP_STATUS_CODE,
			   P_FILE_NAME	      => V_FILE_NAME,
			   P_WALLET_PATH => NULL,
			   P_WALLET_PWD => NULL,
			   P_USERNAME => NULL,
			   P_PASSWORD  => NULL,
			   P_TOKEN => NULL);

    --P_RESPONSE := BLOB_TO_CLOB(V_RSPNS_BLOB);
END CALL_API;
--##---------------------------------------------------------------------------------##--
PROCEDURE SND_DATA_API_PRNTR_PRC (P_DOC_TYP IN NUMBER,
				  P_DOC_SRL IN NUMBER,
				  P_BRN_NO  IN NUMBER,
				  P_HTTP_STATUS_CODE   OUT   NUMBER,
				  P_RESPONSE	       OUT   VARCHAR2
				  ) IS
 V_USE_E_INVOICE NUMBER;
 V_POS_REF_CODE  S_BRN.POS_REF_CODE%TYPE;
 V_SND_TYP	 NUMBER;
BEGIN
IF P_BRN_NO IS NOT NULL THEN
     SELECT USE_E_INVOICE,
	    POS_REF_CODE
       INTO V_USE_E_INVOICE,
	    V_POS_REF_CODE
      FROM S_BRN
       WHERE BRN_NO=P_BRN_NO AND CNTRY_NO IN (167,220);
     IF NVL(V_USE_E_INVOICE,0)=1 THEN
	--V_SND_TYP:=1; --##SEND DTAT TO URL
	 SND_ITMS_TO_API_PRC (P_DOC_TYP =>P_DOC_TYP,P_BRN_NO =>P_BRN_NO,P_DOC_SRL =>P_DOC_SRL,P_HTTP_STATUS_CODE=>P_HTTP_STATUS_CODE,P_RESPONSE=>P_RESPONSE);
     ELSIF V_POS_REF_CODE IS NOT NULL THEN
	 --##SEND TO PRINTER
	 SND_ITMS_TO_PRNTR_PRC (P_DOC_TYP =>P_DOC_TYP,P_BRN_NO =>P_BRN_NO,P_DOC_SRL =>P_DOC_SRL,P_HTTP_STATUS_CODE=>P_HTTP_STATUS_CODE,P_RESPONSE=>P_RESPONSE);
     END IF;
  END IF;
END SND_DATA_API_PRNTR_PRC;
--##-------------------------------------------------------------------------------##--
procedure Call_Web_Service_blob(p_url	  varchar2,
		  p_method  varchar2 default 'GET',
		  p_content_type varchar2,
		  p_content VARCHAR2,
		  p_response_blob out VARCHAR2,
		  p_http_rspons_code out number,
		  p_file_name	     out varchar2,
		  p_wallet_path varchar2,
		  p_wallet_pwd varchar2,
		  p_header  http_hdr_tbl default null,
		  p_username varchar2 default null,
		  p_password  varchar2 default null,
		  p_token varchar2 default null
		  )
as
  v_req utl_http.req;
  v_res utl_http.resp;
  v_raw    raw(32767);
  v_content_in_raw raw(32767);
  v_current_chars   INTEGER;
  v_chars_per_chunk number;
  v_clob_offset number;
  v_content_length number;
  v_clob_length number;
  v_chunk_string    VARCHAR2(32767);
  name varchar2(100);
  value varchar2(4000);
begin
  --check if the url is null or empty string
  if p_url is null or p_url='' then
     raise_application_error(-20001,'URL can not be empty');
  end if;

  if p_wallet_path is not null and p_wallet_pwd is not null then
    UTL_HTTP.set_wallet('file:'||p_wallet_path, p_wallet_pwd);
  end if;

  --v_content_in_raw:=UTL_I18N.STRING_TO_RAW(p_content,'AL32UTF8');

  v_req := utl_http.begin_request(p_url, p_method);
  utl_http.set_header(v_req, 'user-agent', 'mozilla/4.0');
  utl_http.set_header(v_req, 'content-type', p_content_type);

  if p_token is not null then
    utl_http.set_header(v_req,'Authorization','Bearer '||p_token);
  elsif p_username is not null and p_password is not null then
    utl_http.set_authentication(v_req, p_username, p_password);
  end if;

  if p_header is not null then
    for i in p_header.first .. p_header.last
    loop
	utl_http.set_header(v_req, p_header(i).header_attr, p_header(i).header_value);
    end loop;
  end if;

  utl_http.set_body_charset(v_req, 'UTF-8');
  utl_http.set_header(v_req, 'Transfer-Encoding','chunked');

  v_clob_length := dbms_lob.getlength( p_content );
  v_chars_per_chunk := FLOOR(32767/4);

  v_clob_offset := 1;
  v_content_length := 0;
  v_clob_offset := 1;

  begin
    while v_clob_offset <= v_clob_length loop
      v_current_chars := v_chars_per_chunk;
      dbms_lob.read( p_content, v_current_chars, v_clob_offset,
		     v_chunk_string );
      exit when v_current_chars < 1;
      -- Use WRITE_TEXT to assure character set conversion if DB charset is not
      -- AL32UTF8 (i.e. UTF-8)
      utl_http.write_text( v_req, v_chunk_string );
      v_clob_offset := v_clob_offset + v_current_chars;
    end loop;
  exception
    when no_data_found then null;
  end;

  v_res := utl_http.get_response(v_req);

  FOR i IN 1..UTL_HTTP.GET_HEADER_COUNT(v_res) LOOP

    UTL_HTTP.GET_HEADER(v_res, i, name, value);
    if name like 'Content-Disposition' then
	if value like '%attachment;%' then
	    p_file_name := substr(value,22);
	    p_file_name := replace(p_file_name,'"','');
	    DBMS_OUTPUT.PUT_LINE(value);
	    DBMS_OUTPUT.PUT_LINE(p_file_name);
	end if;
    end if;
  END LOOP;

  p_http_rspons_code := v_res.status_code;

  DBMS_LOB.createtemporary(p_response_blob, FALSE);
  -- process the response from the HTTP call
  begin
    loop
      UTL_HTTP.read_raw(v_res, v_raw, 32766);
      DBMS_LOB.writeappend (p_response_blob, UTL_RAW.length(v_raw), v_raw);
    end loop;
  exception
    when UTL_HTTP.end_of_body THEN
      UTL_HTTP.end_response(v_res);
  END;
end Call_Web_Service_blob;
--##-------------------------------------------------------------------------------##--
END GNR_SND_DATA_TO_API_PKG;
/
