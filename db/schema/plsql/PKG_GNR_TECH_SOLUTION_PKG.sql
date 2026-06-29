-- =============================================
-- PACKAGE SPEC: GNR_TECH_SOLUTION_PKG  (status: INVALID)
-- =============================================
CREATE OR REPLACE
PACKAGE GNR_TECH_SOLUTION_PKG
AS
    G_SRVC_NO	    NUMBER;
    G_BASE_URL	    VARCHAR2(1000);
    G_USERNAME	    VARCHAR2(100);
    G_PASSWORD	    VARCHAR2(100);
    G_WALLET_PATH   VARCHAR2(1000);
    G_WALLET_PASS   VARCHAR2(1000);
    G_USER_TOKEN    PLJSON;
    G_LNG_NO	    NUMBER := NVL(IAS_PRMTR_PKG.GETPVAL (P_PRMTR => 'LANG_NO'),1);
    PROCEDURE LOGIN(P_USERNAME VARCHAR2, P_PASSWORD VARCHAR2, P_MESSAGE OUT VARCHAR2) ;

    FUNCTION ISTOKENVALID(P_TOKEN PLJSON)
	RETURN BOOLEAN;

    PROCEDURE INITIALIZE(P_SRVC_NO IN NUMBER);

    PROCEDURE VALIDATEDOCUMENT(P_DOC_TYPE	 IN	NUMBER,
			       P_DOC_SER	 IN	NUMBER,
			       P_BRN_NO 	 IN	NUMBER,
			       P_SYS_NO 	 IN	NUMBER DEFAULT 61,
			       P_SRVC_NO	 IN	NUMBER DEFAULT NULL, --optional, it will be used only if can't get the srvc_no from POS_REF_CODE
			       P_TAX_CONFIG_NO	 IN	NUMBER DEFAULT NULL, --optional, it will be used only if can't get the tax_config_no from POS_REF_CODE
			       P_MACHINE_NO	 IN	NUMBER, --Point of Sale machine no. It's optional if both of these variables (p_tax_config_no, p_brn_or_pos_no) are passed, --Otherwise it's mandatory
			       P_USE_ASYNC_MODE  IN	NUMBER DEFAULT 1,
			       P_ERROR		    OUT VARCHAR2,
			       P_STATUS 	    OUT NUMBER);

    PROCEDURE SUBMITDOCUMENT(P_DOC_TYPE        IN     NUMBER,
			     P_DOC_SER	       IN     NUMBER,
			     P_BRN_NO	       IN     NUMBER,
			     P_SYS_NO	       IN     NUMBER DEFAULT 61,
			     P_SRVC_NO	       IN     NUMBER DEFAULT NULL, --optional, it will be used only if can't get the srvc_no from POS_REF_CODE
			     P_TAX_CONFIG_NO   IN     NUMBER DEFAULT NULL, --optional, it will be used only if can't get the tax_config_no from POS_REF_CODE
			     P_MACHINE_NO      IN     NUMBER, --Point of Sale machine no. It's optional if both of these variables (p_tax_config_no, p_brn_or_pos_no) are passed, --Otherwise it's mandatory
			     P_USE_ASYNC_MODE  IN     NUMBER DEFAULT 1,
			     P_FORCE_REQ_DPLCT IN     NUMBER DEFAULT 0,
			     P_ERROR		  OUT VARCHAR2,
			     P_STATUS		  OUT NUMBER);

    PROCEDURE SUBMITDOCUMENT(P_DOC_TYPE   IN	 NUMBER,
			     P_DOC_SER	  IN	 NUMBER,
			     P_SYS_NO	  IN	 NUMBER DEFAULT 61,
			     P_ERROR	     OUT VARCHAR2,
			     P_STATUS	     OUT NUMBER);

    PROCEDURE POSTSUBMITPROCESS(P_DOC_TYPE   IN NUMBER,
				P_DOC_SER    IN NUMBER,
				P_SYS_NO     IN NUMBER,
				P_STATUS     IN NUMBER,
				P_UUID	     IN VARCHAR2,
				P_HASH	     IN VARCHAR2);

    PROCEDURE CHECKDOCUMENTSTATUS(P_DOC_TYPE   IN     NUMBER,
				  P_DOC_SER    IN     NUMBER,
				  P_SYS_NO     IN     NUMBER DEFAULT 61,
				  P_STATUS     OUT VARCHAR2,
				  P_ERROR      OUT VARCHAR2);

    PROCEDURE CHECKDOCUMENTSTATUS(P_DOC_TYPE   IN     NUMBER,
				  P_DOC_SER    IN     NUMBER,
				  P_SRVC_NO    IN     NUMBER,
				  P_SYS_NO     IN     NUMBER DEFAULT 61,
				  P_BRN_NO     IN     NUMBER DEFAULT NULL,
				  P_ERROR      OUT VARCHAR2,
				  P_STATUS     OUT VARCHAR2);

    PROCEDURE GETDASHBOARDDATA(P_NEW	     OUT NUMBER,
			       P_SUCCESS     OUT NUMBER,
			       P_WAITING     OUT NUMBER,
			       P_DECLINED    OUT NUMBER,
			       P_SUSPECTED   OUT NUMBER,
			       P_ERROR	     OUT VARCHAR2);

    FUNCTION GETPDFA3(P_UUID	   IN  VARCHAR2,
		      P_PDF_BLOB IN  BLOB) RETURN BLOB;

    FUNCTION GETPDFA3(P_SRVC_NO    IN NUMBER,
		      P_UUID	   IN VARCHAR2,
		      P_PDF_BLOB   IN BLOB) RETURN BLOB;

    FUNCTION GETPOSTEDDOC(P_UUID IN VARCHAR2)
	RETURN CLOB;

    FUNCTION GETTAXSIGNEDDOC(P_UUID IN VARCHAR2)
	RETURN CLOB;

    FUNCTION GETQRCODE(P_UUID IN VARCHAR2, P_QR_TYPE IN VARCHAR2 DEFAULT 'text')
	RETURN VARCHAR2;

    FUNCTION GetVersion(p_srvc_no IN number)
	RETURN varchar2;

    PROCEDURE GENERATE_PDFA3(P_SRVC_NO		IN	NUMBER,
			     P_DIR		IN	VARCHAR2,
			     P_FILE_NAME	IN	VARCHAR2,
			     P_UUID		IN	VARCHAR2,
			     P_PDFA3_FILE_NAME	OUT	VARCHAR2);

    PROCEDURE CHANGEDOCUMENTSTATUS(P_DOC_TYPE	IN     NUMBER,
				   P_DOC_SER	IN     NUMBER,
				   P_SYS_NO	IN     NUMBER DEFAULT 61,
				   P_STATUS	IN     VARCHAR2,
				   P_REASON	IN     VARCHAR2 DEFAULT NULL,
				   P_ERROR	OUT VARCHAR2);

END GNR_TECH_SOLUTION_PKG;
/

-- ---------------------------------------------
-- PACKAGE BODY: GNR_TECH_SOLUTION_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE BODY GNR_TECH_SOLUTION_PKG
AS
    PROCEDURE LOGIN(P_USERNAME VARCHAR2, P_PASSWORD VARCHAR2, P_MESSAGE OUT VARCHAR2)
    IS
	V_CONTENT	  VARCHAR2(1000);
	V_RESPONSE_TEXT   VARCHAR2(32000);
	V_RESPONSE_CODE   NUMBER;
	V_OBJ		  PLJSON;
    BEGIN

	IF P_USERNAME IS NULL OR P_PASSWORD IS NULL THEN
	    RAISE_APPLICATION_ERROR(-20101, 'username and password must not be empty');
	END IF;

	V_CONTENT := '{
	"userName":"' || P_USERNAME || '",
	"password":"' || P_PASSWORD || '"
    }';

	IAS_WEB_SRVC_PKG.CALL_WEB_SERVICE_CHAR(P_URL		    => G_BASE_URL || '/login',
					       P_METHOD 	    => 'POST',
					       P_CONTENT_TYPE	    => 'application/json',
					       P_CONTENT	    => V_CONTENT,
					       P_RESPONSE_TEXT	    => V_RESPONSE_TEXT,
					       P_HTTP_RSPONS_CODE   => V_RESPONSE_CODE,
					       P_WALLET_PATH	    => G_WALLET_PATH,
					       P_WALLET_PWD	    => G_WALLET_PASS);

	V_OBJ := PLJSON(V_RESPONSE_TEXT);
	IF V_OBJ.GET_NUMBER('code') NOT IN (0, 5104, 5105) THEN
	    RAISE_APPLICATION_ERROR(-20010, V_OBJ.GET_NUMBER('code') || '-' || V_OBJ.GET_STRING('message'));
	END IF;

	IF V_OBJ.GET_NUMBER('code') IN (5104, 5105) THEN
	    P_MESSAGE := V_OBJ.GET_STRING('message');
	END IF;

	G_USER_TOKEN := V_OBJ.GET_PLJSON('content');
	G_USER_TOKEN.PUT('issueDate', TO_CHAR(SYSDATE, 'yyyy-mm-dd hh24:mi:ss'));
    --g_user_token.print;

    END LOGIN;

    FUNCTION ISTOKENVALID(P_TOKEN PLJSON)
	RETURN BOOLEAN
    IS
	V_EXPIRES_IN   NUMBER;
    BEGIN
	IF P_TOKEN IS NULL THEN
	    RETURN FALSE;
	END IF;

	V_EXPIRES_IN := P_TOKEN.GET_NUMBER('expiresIn');
	RETURN SYSDATE < (TO_DATE(P_TOKEN.GET_STRING('issueDate'), 'yyyy-mm-dd hh24:mi:ss') + (V_EXPIRES_IN / 24 / 60 / 60));
    EXCEPTION
	WHEN OTHERS THEN
	    RETURN FALSE;
    END ISTOKENVALID;

    PROCEDURE INITIALIZE(P_SRVC_NO IN NUMBER)
    IS
    BEGIN

	SELECT SRVC_URL,
	       USER_NAME,
	       PASSWORD,
	       WALT_PATH,
	       WALT_PWD
	  INTO G_BASE_URL,
	       G_USERNAME,
	       G_PASSWORD,
	       G_WALLET_PATH,
	       G_WALLET_PASS
	  FROM GNR_WEB_SRVC_MST
	 WHERE SRVC_NO = P_SRVC_NO AND ROWNUM <= 1;
	G_USER_TOKEN := NULL;
	G_SRVC_NO := P_SRVC_NO;
    EXCEPTION
	WHEN NO_DATA_FOUND THEN
	    RAISE_APPLICATION_ERROR(-20001, 'Error when getting web service parameters - No Data Found');
    END INITIALIZE;

    PROCEDURE VALIDATEDOCUMENT(P_DOC_TYPE	 IN	NUMBER,
			       P_DOC_SER	 IN	NUMBER,
			       P_BRN_NO 	 IN	NUMBER,
			       P_SYS_NO 	 IN	NUMBER DEFAULT 61,
			       P_SRVC_NO	 IN	NUMBER DEFAULT NULL, --optional, it will be used only if can't get the srvc_no from POS_REF_CODE
			       P_TAX_CONFIG_NO	 IN	NUMBER DEFAULT NULL, --optional, it will be used only if can't get the tax_config_no from POS_REF_CODE
			       P_MACHINE_NO	 IN	NUMBER, --Point of Sale machine no. It's optional if both of these variables (p_tax_config_no, p_brn_or_pos_no) are passed, --Otherwise it's mandatory
			       P_USE_ASYNC_MODE  IN	NUMBER DEFAULT 1,
			       P_ERROR		    OUT VARCHAR2,
			       P_STATUS 	    OUT NUMBER)
    IS
	V_DOC_JSON	  CLOB;
	V_RESPONSE_BLOB   BLOB;
	V_RESPONSE_CODE   NUMBER;
	V_OBJ		  PLJSON;
	V_STATUS	  NUMBER;
	V_UUID		  VARCHAR2(100);
	V_HASH		  VARCHAR2(64);
	V_CLOB		  CLOB;
	V_TBL_NM	  VARCHAR2(30) := CASE P_SYS_NO WHEN 80 THEN 'IAS_POS_MACHINE' ELSE 'S_BRN' END;
	V_WHR		  VARCHAR2(100) := CASE P_SYS_NO WHEN 80 THEN ' WHERE MACHINE_NO=' || P_MACHINE_NO ELSE 'WHERE BRN_NO=' END || P_BRN_NO  ;
	V_POS_REF_CODE	  VARCHAR2(50);
	V_SRVC_NO	  NUMBER;
	V_TAX_CONFIG_NO   NUMBER;
	V_URL		  VARCHAR2(256);
	V_CNTRY_CODE	  VARCHAR2(3);
	V_FILE_NAME	  VARCHAR2(100);
	V_MSG		  VARCHAR2(250);
	V_USE_SALE_OUTLET NUMBER:=0;
	V_OUTLET_NO	  NUMBER;
    BEGIN
	--Check mandatory parameters
	IF P_DOC_TYPE IS NULL THEN
	    RAISE_APPLICATION_ERROR(-20201, 'Parameter "p_doc_type" is null');
	END IF;
	IF P_DOC_SER IS NULL THEN
	    RAISE_APPLICATION_ERROR(-20201, 'Parameter "p_doc_ser" is null');
	END IF;
	IF P_BRN_NO IS NULL THEN
	    RAISE_APPLICATION_ERROR(-20201, 'Parameter "p_brn_no" is null');
	END IF;
	IF P_SYS_NO IS NULL THEN
	    RAISE_APPLICATION_ERROR(-20201, 'Parameter "p_sys_no" is null');
	END IF;

	--Getting cntry_code from brn_no
	V_CNTRY_CODE := IAS_BRN_PKG.GET_BRN_CNTRY_CODE(P_BRN_NO);
	/*IF V_CNTRY_CODE NOT IN ('SAU', 'EGY', 'TUR','JOR','MLS') THEN
	    RAISE_APPLICATION_ERROR(-20202, 'Invalid contry code');
	END IF;*/

	--Getting Srvc_no and Tax_Config_No from POS_REF_CODE if exsits
	BEGIN

	    EXECUTE IMMEDIATE 'select POS_REF_CODE from ' || V_TBL_NM || ' ' || V_WHR
		INTO V_POS_REF_CODE;
	EXCEPTION
	    WHEN NO_DATA_FOUND THEN
		V_POS_REF_CODE := NULL;
	END;

	IF INSTR(V_POS_REF_CODE, ';') > 0 THEN
	    V_SRVC_NO := SUBSTR(V_POS_REF_CODE, 1, INSTR(V_POS_REF_CODE, ';') - 1);
	    V_TAX_CONFIG_NO := SUBSTR(V_POS_REF_CODE, INSTR(V_POS_REF_CODE, ';') + 1);
	ELSE
	    V_SRVC_NO := V_POS_REF_CODE;
	END IF;

	V_SRVC_NO := NVL(P_SRVC_NO,V_SRVC_NO);
	IF V_SRVC_NO IS NULL THEN
	    RAISE_APPLICATION_ERROR(-20203, 'unable to get srvc_no');
	END IF;

	V_TAX_CONFIG_NO := NVL(V_TAX_CONFIG_NO, P_TAX_CONFIG_NO);

	--if this is the first call in the curent session (g_srvc_no=null) or srvc_no is different,
	-- then load the new service and loging againg
	IF G_SRVC_NO IS NULL OR G_SRVC_NO <> V_SRVC_NO THEN
	    INITIALIZE(V_SRVC_NO);
	    LOGIN(G_USERNAME, G_PASSWORD, V_MSG);
	END IF;

	--Generate json object for the document
	IF  P_SYS_NO = 170  THEN

	    EXECUTE IMMEDIATE ' SELECT REM_JSON_PKG.GNRT_E_INVC_JSON( P_DOC_TYPE    => '||P_DOC_TYPE||',
								      P_DOC_SER      => '||P_DOC_SER||',
								      P_OUT_TYP      => 0,
								      P_LANG_NO      => 1,
								      P_CNTRY_CODE   => '||''''||V_CNTRY_CODE||''''||' ) FROM DUAL ' INTO V_DOC_JSON;


	ELSIF P_SYS_NO = 175 THEN

	    EXECUTE IMMEDIATE ' SELECT PMS_JSON_PKG.GNRT_E_INVC_JSON( P_DOC_TYPE    => '||P_DOC_TYPE||',
								      P_DOC_SER      => '||P_DOC_SER||',
								      P_OUT_TYP      => 0,
								      P_LANG_NO      => 1,
								      P_CNTRY_CODE   => '||''''||V_CNTRY_CODE||''''||' ) FROM DUAL ' INTO V_DOC_JSON;

	ELSE
	    V_DOC_JSON := YS_JSON_PKG.GNRT_E_INVC_JSON( P_DOC_TYPE     => P_DOC_TYPE,
							P_DOC_SER      => P_DOC_SER,
							P_OUT_TYP      => 0,
							P_LANG_NO      => 1,
							P_CNTRY_CODE   => V_CNTRY_CODE) ; --P_CNTRY_CODE must be passed dynamically

	END IF ;
	--Check if the token is not valid, then log ing again
	IF NOT ISTOKENVALID(G_USER_TOKEN) THEN
	    LOGIN(G_USERNAME, G_PASSWORD, V_MSG);
	END IF;

	--Set the request url
	V_URL := G_BASE_URL || '/api/EInvoicing/validatedocument';
	--V_URL := V_URL || CASE WHEN V_TAX_CONFIG_NO IS NOT NULL THEN '=' || V_TAX_CONFIG_NO ELSE '' END;

	--Actual call to the technical solution
	IAS_WEB_SRVC_PKG.CALL_WEB_SERVICE_BLOB(P_URL		    => V_URL,
					       P_METHOD 	    => 'POST',
					       P_CONTENT_TYPE	    => 'application/json',
					       P_CONTENT	    => V_DOC_JSON,
					       P_RESPONSE_BLOB	    => V_RESPONSE_BLOB,
					       P_HTTP_RSPONS_CODE   => V_RESPONSE_CODE,
					       P_FILE_NAME	    => V_FILE_NAME,
					       P_WALLET_PATH	    => G_WALLET_PATH,
					       P_WALLET_PWD	    => G_WALLET_PASS,
					       P_TOKEN		    => G_USER_TOKEN.GET_STRING('accessToken'));

	--Process the response
	--401, user is not authorized to access or the token is invalidated
	IF V_RESPONSE_CODE = 401 THEN
	    RAISE_APPLICATION_ERROR(-20401, 'Unauthorized!');
	END IF;
	IF V_RESPONSE_CODE = 404 THEN
	    RAISE_APPLICATION_ERROR(-20404, 'Invalid URL!');
	END IF;
	IF V_RESPONSE_CODE NOT IN (200, 201, 202) THEN
	    RAISE_APPLICATION_ERROR(-20500, IAS_WEB_SRVC_PKG.BLOB_TO_CLOB(v_response_blob));
	END IF;

	--raise_application_error(-20001, V_URL);-- IAS_WEB_SRVC_PKG.BLOB_TO_CLOB(v_response_blob));

	--Deserialize the response into json object
	V_OBJ := PLJSON(V_RESPONSE_BLOB);

	--raise_application_error(-20001, v_response_code||'-'||v_response_text);

	--If response code is 3001 then the document has already been posted, so jsut  update the Status
	--If response code is anything else than 0 or 1 it means failed, so return the error message in parameter(p_error) and Don't update the document status.
	IF V_OBJ.GET_NUMBER('code') <> 0 THEN
	    P_ERROR := V_OBJ.GET_STRING('message');
	    RETURN;
	END IF;
    END VALIDATEDOCUMENT;
    PROCEDURE SUBMITDOCUMENT(P_DOC_TYPE        IN     NUMBER,
			     P_DOC_SER	       IN     NUMBER,
			     P_BRN_NO	       IN     NUMBER,
			     P_SYS_NO	       IN     NUMBER DEFAULT 61,
			     P_SRVC_NO	       IN     NUMBER DEFAULT NULL, --optional, it will be used only if can't get the srvc_no from POS_REF_CODE
			     P_TAX_CONFIG_NO   IN     NUMBER DEFAULT NULL, --optional, it will be used only if can't get the tax_config_no from POS_REF_CODE
			     P_MACHINE_NO      IN     NUMBER, --Point of Sale machine no. It's optional if both of these variables (p_tax_config_no, p_brn_or_pos_no) are passed, --Otherwise it's mandatory
			     P_USE_ASYNC_MODE  IN     NUMBER DEFAULT 1,
			     P_FORCE_REQ_DPLCT IN     NUMBER DEFAULT 0,
			     P_ERROR		  OUT VARCHAR2,
			     P_STATUS		  OUT NUMBER)
    IS
	V_DOC_JSON	  CLOB;
	V_RESPONSE_BLOB   BLOB;
	V_RESPONSE_CODE   NUMBER;
	V_OBJ		  PLJSON;
	V_STATUS	  NUMBER;
	V_UUID		  VARCHAR2(100);
	V_HASH		  VARCHAR2(64);
	V_CLOB		  CLOB;
	V_TBL_NM	  VARCHAR2(30) := CASE P_SYS_NO WHEN 80 THEN 'IAS_POS_MACHINE' ELSE 'S_BRN' END;
	V_WHR		  VARCHAR2(100) := CASE P_SYS_NO WHEN 80 THEN ' WHERE MACHINE_NO=' || P_MACHINE_NO ELSE 'WHERE BRN_NO=' END || P_BRN_NO  ;
	V_POS_REF_CODE	  VARCHAR2(50);
	V_SRVC_NO	  NUMBER;
	V_TAX_CONFIG_NO   NUMBER;
	V_URL		  VARCHAR2(256);
	V_CNTRY_CODE	  VARCHAR2(3);
	V_FILE_NAME	  VARCHAR2(100);
	V_MSG		  VARCHAR2(250);
	V_USE_SALE_OUTLET NUMBER:=0;
	V_OUTLET_NO	  NUMBER;
	V_API_ENDPOINT	  VARCHAR2(50) := CASE P_DOC_TYPE WHEN 2 THEN 'einvoicing/submitreceiptdocument' ELSE 'tax/submitdocument' END;
    BEGIN
	--Check mandatory parameters
	IF P_DOC_TYPE IS NULL THEN
	    RAISE_APPLICATION_ERROR(-20201, 'Parameter "p_doc_type" is null');
	END IF;
	IF P_DOC_SER IS NULL THEN
	    RAISE_APPLICATION_ERROR(-20201, 'Parameter "p_doc_ser" is null');
	END IF;
	IF P_BRN_NO IS NULL THEN
	    RAISE_APPLICATION_ERROR(-20201, 'Parameter "p_brn_no" is null');
	END IF;
	IF P_SYS_NO IS NULL THEN
	    RAISE_APPLICATION_ERROR(-20201, 'Parameter "p_sys_no" is null');
	END IF;

	--Getting cntry_code from brn_no
	V_CNTRY_CODE := IAS_BRN_PKG.GET_BRN_CNTRY_CODE(P_BRN_NO);
	IF V_CNTRY_CODE NOT IN ('SAU', 'EGY', 'TUR','JOR','MLS','ETH') THEN
	    RAISE_APPLICATION_ERROR(-20202, 'Invalid contry code');
	END IF;

	--Getting Srvc_no and Tax_Config_No from POS_REF_CODE if exsits
       BEGIN
	    EXECUTE IMMEDIATE 'SELECT NVL(USE_SALE_OUTLET,0) FROM IAS_PARA_GEN WHERE ROWNUM<=1' INTO  V_USE_SALE_OUTLET;
	    --
	    IF NVL(V_USE_SALE_OUTLET,0)=1 AND P_SYS_NO=170 THEN
	       --
	       EXECUTE IMMEDIATE 'SELECT DISTINCT OUTLET_NO FROM REM_V_E_INVC_JSON WHERE DOC_SRL=:P_DOC_SER AND DOC_TYPE=:P_DOC_TYPE'
	       INTO  V_OUTLET_NO USING P_DOC_SER,P_DOC_TYPE ;
	       --
	       IF NVL(V_OUTLET_NO,0) <> 0 THEN
		  SELECT	  NVL(SRVC_NO, '0')
		  INTO		  V_POS_REF_CODE
		  FROM		  GNR_SALE_OUTLET
		  WHERE 	  OUTLET_NO = V_OUTLET_NO;
	       END IF;
	    ELSE
			    EXECUTE IMMEDIATE 'select POS_REF_CODE from ' || V_TBL_NM || ' ' || V_WHR
				INTO V_POS_REF_CODE;
	    END IF;
	EXCEPTION
	    WHEN NO_DATA_FOUND THEN
		V_POS_REF_CODE := NULL;
	END;

	IF INSTR(V_POS_REF_CODE, ';') > 0 THEN
	    V_SRVC_NO := SUBSTR(V_POS_REF_CODE, 1, INSTR(V_POS_REF_CODE, ';') - 1);
	    V_TAX_CONFIG_NO := SUBSTR(V_POS_REF_CODE, INSTR(V_POS_REF_CODE, ';') + 1);
	ELSE
	    V_SRVC_NO := V_POS_REF_CODE;
	END IF;

	V_SRVC_NO := NVL(P_SRVC_NO,V_SRVC_NO);
	IF V_SRVC_NO IS NULL THEN
	    RAISE_APPLICATION_ERROR(-20203, 'unable to get srvc_no');
	END IF;

	V_TAX_CONFIG_NO := NVL(V_TAX_CONFIG_NO, P_TAX_CONFIG_NO);

	--if this is the first call in the curent session (g_srvc_no=null) or srvc_no is different,
	-- then load the new service and loging againg
	IF G_SRVC_NO IS NULL OR G_SRVC_NO <> V_SRVC_NO THEN
	    INITIALIZE(V_SRVC_NO);
	    LOGIN(G_USERNAME, G_PASSWORD, V_MSG);
	END IF;

	--Generate json object for the document
	IF  P_SYS_NO = 170  THEN

	    EXECUTE IMMEDIATE ' SELECT REM_JSON_PKG.GNRT_E_INVC_JSON( P_DOC_TYPE    => '||P_DOC_TYPE||',
								      P_DOC_SER      => '||P_DOC_SER||',
								      P_OUT_TYP      => 0,
								      P_LANG_NO      => 1,
								      P_CNTRY_CODE   => '||''''||V_CNTRY_CODE||''''||' ) FROM DUAL ' INTO V_DOC_JSON;


	ELSIF  P_SYS_NO = 175  THEN

	    EXECUTE IMMEDIATE ' SELECT PMS_JSON_PKG.GNRT_E_INVC_JSON( P_DOC_TYPE    => '||P_DOC_TYPE||',
								      P_DOC_SER      => '||P_DOC_SER||',
								      P_OUT_TYP      => 0,
								      P_LANG_NO      => 1,
								      P_CNTRY_CODE   => '||''''||V_CNTRY_CODE||''''||' ) FROM DUAL ' INTO V_DOC_JSON;

	ELSE
	    V_DOC_JSON := YS_JSON_PKG.GNRT_E_INVC_JSON( P_DOC_TYPE     => P_DOC_TYPE,
							P_DOC_SER      => P_DOC_SER,
							P_OUT_TYP      => 0,
							P_LANG_NO      => 1,
							P_CNTRY_CODE   => V_CNTRY_CODE) ; --P_CNTRY_CODE must be passed dynamically

	END IF ;
	--Check if the token is not valid, then log ing again
	IF NOT ISTOKENVALID(G_USER_TOKEN) THEN
	    LOGIN(G_USERNAME, G_PASSWORD, V_MSG);
	END IF;

	--Set the request url
	V_URL := G_BASE_URL || '/api/'|| V_API_ENDPOINT || CASE P_USE_ASYNC_MODE WHEN 1 THEN '?async=true' ELSE '?async=false' END;
	V_URL := V_URL || CASE WHEN V_TAX_CONFIG_NO IS NOT NULL THEN '&taxConfigId=' || V_TAX_CONFIG_NO ELSE '' END;

	V_URL := V_URL || CASE WHEN P_FORCE_REQ_DPLCT = 1 THEN '&forceRequestDuplicate=true' ELSE '' END;
	--Actual call to the technical solution
	IAS_WEB_SRVC_PKG.CALL_WEB_SERVICE_BLOB(P_URL		    => V_URL,
					       P_METHOD 	    => 'POST',
					       P_CONTENT_TYPE	    => 'application/json',
					       P_CONTENT	    => V_DOC_JSON,
					       P_RESPONSE_BLOB	    => V_RESPONSE_BLOB,
					       P_HTTP_RSPONS_CODE   => V_RESPONSE_CODE,
					       P_FILE_NAME	    => V_FILE_NAME,
					       P_WALLET_PATH	    => G_WALLET_PATH,
					       P_WALLET_PWD	    => G_WALLET_PASS,
					       P_TOKEN		    => G_USER_TOKEN.GET_STRING('accessToken'));

	--Process the response
	--401, user is not authorized to access or the token is invalidated
	IF V_RESPONSE_CODE = 401 THEN
	    RAISE_APPLICATION_ERROR(-20401, 'Unauthorized!');
	END IF;
	IF V_RESPONSE_CODE = 404 THEN
	    RAISE_APPLICATION_ERROR(-20404, 'Invalid URL!');
	END IF;
	IF V_RESPONSE_CODE NOT IN (200, 201, 202) THEN
	    RAISE_APPLICATION_ERROR(-20500, IAS_WEB_SRVC_PKG.BLOB_TO_CLOB(V_RESPONSE_BLOB));
	END IF;

	--Deserialize the response into json object
	V_OBJ := PLJSON(V_RESPONSE_BLOB);

	--raise_application_error(-20001, v_response_code||'-'||v_response_text);

	--If response code is 3001 then the document has already been posted, so jsut  update the Status
	IF V_OBJ.GET_NUMBER('code') = 3001 THEN
	    P_ERROR := V_OBJ.GET_STRING('message');

	--If response code is anything else than 0 or 1 it means failed, so return the error message in parameter(p_error) and Don't update the document status.
	ELSIF V_OBJ.GET_NUMBER('code') <> 0 THEN
	    P_ERROR := V_OBJ.GET_STRING('message');
	    /*if not v_obj.get('content').is_null then
		dbms_lob.createtemporary(v_clob, true);
		v_obj.get('content').to_clob(v_clob, spaces=>true);
		p_error := p_error || chr(10)||UNISTR(replace(v_clob,'\u','\'));
		dbms_lob.freetemporary(v_clob);
	    end if;*/
	    RETURN;
	END IF;

	--The response code is 0 which means the success, to update the document status
	V_OBJ := V_OBJ.GET_PLJSON('content');

	--Mapping the technical solution status code to the onyx status codes
	V_STATUS := CASE V_OBJ.GET_STRING('status') WHEN 'Valid' THEN 1 WHEN 'New' THEN 2 WHEN 'Processing' THEN 2 WHEN 'Invalid' THEN 3 WHEN 'Rejected' THEN 4 WHEN 'Cancelled' THEN 5 WHEN 'ApiRejected' THEN 6 END;

	--Getting the document UUID, and HASH
	V_UUID := V_OBJ.GET_STRING('uuid');
	V_HASH := V_OBJ.GET_STRING('hash');

	--Check if the document status is not (valid, new, processing) then then document has been rejected, so return the error message in
	--parameter(p_error)
	IF V_STATUS NOT IN (1, 2) THEN
	    IF NOT V_OBJ.GET('taxResponseString').IS_NULL THEN
		DBMS_LOB.CREATETEMPORARY(V_CLOB, TRUE);
		V_OBJ.GET('taxResponseString').TO_CLOB(V_CLOB, SPACES => TRUE);
		V_CLOB := REGEXP_REPLACE(V_CLOB, '(\\)[\/]', '/');
		V_CLOB := REGEXP_REPLACE(V_CLOB, '\\', '\\\\');
		V_CLOB := REPLACE(V_CLOB, '\\u', '\');
		P_ERROR := P_ERROR || CHR(10) || UNISTR(V_CLOB);
		DBMS_LOB.FREETEMPORARY(V_CLOB);
	    ELSIF NOT V_OBJ.GET('taxResponse').IS_NULL THEN
		DBMS_LOB.CREATETEMPORARY(V_CLOB, TRUE);
		V_OBJ.GET('taxResponse').TO_CLOB(V_CLOB, SPACES => TRUE);
		V_CLOB := REGEXP_REPLACE(V_CLOB, '(\\)[\/]', '/');
		V_CLOB := REGEXP_REPLACE(V_CLOB, '\\', '\\\\');
		V_CLOB := REPLACE(V_CLOB, '\\u', '\');
		P_ERROR := P_ERROR || CHR(10) || UNISTR(V_CLOB);
		DBMS_LOB.FREETEMPORARY(V_CLOB);
	    END IF;
	END IF;
	P_STATUS := V_STATUS;
	--Updating the document status and codes
	POSTSUBMITPROCESS(P_DOC_TYPE,
			  P_DOC_SER,
			  P_SYS_NO,
			  V_STATUS,
			  V_UUID,
			  V_HASH);
    END SUBMITDOCUMENT;
    PROCEDURE SUBMITDOCUMENT(P_DOC_TYPE   IN	 NUMBER,
			     P_DOC_SER	  IN	 NUMBER,
			     P_SYS_NO	  IN	 NUMBER DEFAULT 61,
			     P_ERROR	     OUT VARCHAR2,
			     P_STATUS	     OUT NUMBER)
    IS
	V_DOC_JSON	  CLOB;
	V_RESPONSE_TEXT   VARCHAR2(32000);
	V_RESPONSE_CODE   NUMBER;
	V_OBJ		  PLJSON;
	V_STATUS	  NUMBER;
	V_UUID		  VARCHAR2(100);
	V_HASH		  VARCHAR2(64);
	V_CLOB		  CLOB;
	V_MSG		  VARCHAR2(250);
    BEGIN
	--Check mandatory parameters
	IF P_DOC_TYPE IS NULL THEN
	    RAISE_APPLICATION_ERROR(-20201, 'Parameter "p_doc_type" is null');
	END IF;
	IF P_DOC_SER IS NULL THEN
	    RAISE_APPLICATION_ERROR(-20202, 'Parameter "p_doc_ser" is null');
	END IF;
	IF P_SYS_NO IS NULL THEN
	    RAISE_APPLICATION_ERROR(-20203, 'Parameter "p_sys_no" is null');
	END IF;

	--Generate json object for the document
	/*v_doc_json := '{"ProfileID":"reporting:1.0","ID":"20210000011044100001",
					"IssueDateTime":"2021-12-31T10:29:57Z","InvoiceTypeCode":"388","InvoiceTransactionCode":"0200000",
					"Note":["????? ?????? ??????1 s "],"DocumentCurrencyCode":"USD","TaxCurrencyCode":"SAR","LineCountNumeric":1,"PurchaseOrderID":"","BillingreferenceID":"","ContractID":"","AccountingSupplierParty":{"Party":{"PartyIdentification":[{"ID":{"Value":"370101554100003","SchemeID":"CRN"}}],"PostalAddress":{"StreetName":"ABC154","BuildingNumber":"1654","PlotIdentification":"9999","CitySubdivisionName":"??????","CityName":"????????????","PostalZone":"88888","CountrySubentity":"??????","Country":"SA"},"PartyTaxScheme":{"CompanyID":"370101554100003","TaxScheme":"VAT"},"PartyLegalEntity":"???? ?????????"}},"AccountingCustomerParty":{"Party":{"PartyIdentification":[{"ID":{"Value":"123C12345678","SchemeID":"NAT"}}],"PostalAddress":{"StreetName":"streen name","AdditionalStreetName":"streen name","BuildingNumber":"bulding number","PlotIdentification":"1004","CitySubdivisionName":"??????","CityName":"??????","PostalZone":"11564","CountrySubentity":"??????","Country":"SA"},"PartyTaxScheme":{"CompanyID":"312345678900003","TaxScheme":"VAT"},"PartyLegalEntity":"????? ??????? ????? ??????"}},"Delivery":{"ActualDeliveryDate":"2021-12-31"},"PaymentMeans":{"PaymentMeansCode":"1","PaymentNote":"","InstructionNote":[]},"AllowanceCharge":[{"ChargeIndicator":false,"MultiplierFactorNumeric":0,"AllowanceChargeReason":"","AllowanceChargeReasonCode":"","Amount":{"Value":0,"CurrencyID":"USD"},"BaseAmount":{"Value":10,"CurrencyID":"USD"},"TaxCategory":{"ID":"S","Percent":10,"TaxScheme":"VAT"}}],"TaxTotal":[{"TaxAmount":{"Value":0.9,"CurrencyID":"USD"},"TaxSubtotal":{"TaxableAmount":{"Value":9,"CurrencyID":"USD"},"TaxAmount":{"Value":0.9,"CurrencyID":"USD"},"TaxCategory":{"ID":"S","Percent":10,"TaxScheme":"VAT"}}},{"TaxAmount":{"Value":0.9,"currencyID":"SAR"}}],"LegalMonetaryTotal":{"LineExtensionAmount":{"Value":9,"CurrencyID":"USD"},"TaxExclusiveAmount":{"Value":9,"CurrencyID":"USD"},"TaxInclusiveAmount":{"Value":9.9,"CurrencyID":"USD"},"AllowanceTotalAmount":{"Value":0,"CurrencyID":"USD"},"PrepaidAmount":{"Value":0,"CurrencyID":"USD"},"PayableAmount":{"Value":9.9,"CurrencyID":"USD"}},"InvoiceLine":[{"ID":"1","InvoicedQuantity":{"Value":10,"UnitCode":"Bag"},"LineExtensionAmount":{"Value":9,"CurrencyID":"USD"},"AllowanceCharge":[{"ChargeIndicator":false,"MultiplierFactorNumeric":10,"AllowanceChargeReason":"","AllowanceChargeReasonCode":"95","Amount":{"Value":1,"CurrencyID":"USD"},"BaseAmount":{"Value":10,"CurrencyID":"USD"}}],"TaxTotal":{"TaxAmount":{"Value":0.9,"CurrencyID":"USD"},"RoundingAmount":{"Value":9.9,"CurrencyID":"USD"}},"Item":{"Name":"????","BuyersItemIdentification":"005-003","SellersItemIdentification":"","StandardItemIdentification":"","ClassifiedTaxCategory":{"ID":"S","Percent":10,"TaxScheme":"VAT"}},"Price":{"PriceAmount":{"Value":0.9,"CurrencyID":"USD"},"BaseQuantity":{"Value":1,"UnitCode":"Bag"},"AllowanceCharge":{"ChargeIndicator":false,"MultiplierFactorNumeric":10,"AllowanceChargeReason":"","AllowanceChargeReasonCode":"","Amount":{"Value":0.1,"CurrencyID":"USD"},"BaseAmount":{"Value":1,"CurrencyID":"USD"}}}}]}';*/

	V_DOC_JSON := YS_JSON_PKG.GNRT_E_INVC_JSON(P_DOC_TYPE	  => P_DOC_TYPE,
						   P_DOC_SER	  => P_DOC_SER,
						   P_OUT_TYP	  => 0,
					       P_LANG_NO      => 1,
						   P_CNTRY_CODE   => 'KSA');

	IF NOT ISTOKENVALID(G_USER_TOKEN) THEN
	    LOGIN(G_USERNAME, G_PASSWORD, V_MSG);
	END IF;

	IAS_WEB_SRVC_PKG.CALL_WEB_SERVICE_CHAR(P_URL		    => G_BASE_URL || '/api/tax/submitdocument',
					       P_METHOD 	    => 'POST',
					       P_CONTENT_TYPE	    => 'application/json',
					       P_CONTENT	    => V_DOC_JSON,
					       P_RESPONSE_TEXT	    => V_RESPONSE_TEXT,
					       P_HTTP_RSPONS_CODE   => V_RESPONSE_CODE,
					       P_WALLET_PATH	    => G_WALLET_PATH,
					       P_WALLET_PWD	    => G_WALLET_PASS,
					       P_TOKEN		    => G_USER_TOKEN.GET_STRING('accessToken'));
	IF V_RESPONSE_CODE = 401 THEN
	    RAISE_APPLICATION_ERROR(-20401, 'Unauthorized!');
	END IF;

	V_OBJ := PLJSON(V_RESPONSE_TEXT);
	--raise_application_error(-20001, v_response_code||'-'||v_response_text);
	IF V_OBJ.GET_NUMBER('code') = 3001 THEN
	    P_ERROR := V_OBJ.GET_STRING('message');
	ELSIF V_OBJ.GET_NUMBER('code') <> 0 THEN
	    P_ERROR := V_OBJ.GET_STRING('message');
	    /*if not v_obj.get('content').is_null then
		dbms_lob.createtemporary(v_clob, true);
		v_obj.get('content').to_clob(v_clob, spaces=>true);
		p_error := p_error || chr(10)||UNISTR(replace(v_clob,'\u','\'));
		dbms_lob.freetemporary(v_clob);
	    end if;*/
	    RETURN;
	END IF;
	V_OBJ := V_OBJ.GET_PLJSON('content');
	V_STATUS := CASE V_OBJ.GET_STRING('status') WHEN 'Valid' THEN 1 WHEN 'New' THEN 2 WHEN 'Processing' THEN 2 WHEN 'Invalid' THEN 3 WHEN 'Rejected' THEN 4 WHEN 'Cancelled' THEN 5 WHEN 'ApiRejected' THEN 6 END;
	V_UUID := V_OBJ.GET_STRING('uuid');
	V_HASH := V_OBJ.GET_STRING('hash');
	IF V_STATUS NOT IN (1, 2) THEN
	    IF NOT V_OBJ.GET('taxResponse').IS_NULL THEN
		DBMS_LOB.CREATETEMPORARY(V_CLOB, TRUE);
		V_OBJ.GET('taxResponse').TO_CLOB(V_CLOB, SPACES => TRUE);
		P_ERROR := P_ERROR || CHR(10) || UNISTR(REPLACE(V_CLOB, '\u', '\'));
		DBMS_LOB.FREETEMPORARY(V_CLOB);
	    END IF;
	END IF;
	P_STATUS := V_STATUS;
	POSTSUBMITPROCESS(P_DOC_TYPE,
			  P_DOC_SER,
			  P_SYS_NO,
			  V_STATUS,
			  V_UUID,
			  V_HASH);
    END SUBMITDOCUMENT;
    PROCEDURE POSTSUBMITPROCESS(P_DOC_TYPE   IN NUMBER,
				P_DOC_SER    IN NUMBER,
				P_SYS_NO     IN NUMBER,
				P_STATUS     IN NUMBER,
				P_UUID	     IN VARCHAR2,
				P_HASH	     IN VARCHAR2)
    IS
	V_STMNT     VARCHAR2(4000);
	V_WHR	    VARCHAR2(4000);
	V_TBL_NM    VARCHAR2(32);
	V_FLD_SER   VARCHAR2(32);
    BEGIN
	/*v_whr := ' WHERE DOC_TYPE='||P_DOC_TYPE||' AND ROWNUM<=1';
	v_tbl_nm:= YS_GEN_PKG.GET_FLD_VALUE('INV_V_DOC_TYPE', 'TB_MST', V_WHR);
	v_fld_ser:= YS_GEN_PKG.GET_FLD_VALUE('INV_V_DOC_TYPE', 'FLD_SER', V_WHR);
	V_WHR := V_TBL_NM||'.'||V_FLD_SER||' = '||P_DOC_SER;*/

	IF P_DOC_TYPE = 4 THEN
	    IF P_SYS_NO IN ( 61 ,67, 85 ,70 ) THEN
		V_TBL_NM := 'ias_bill_mst';
		V_WHR := V_TBL_NM || '.bill_ser = ' || P_DOC_SER;
	    ELSIF P_SYS_NO = 80 THEN
		V_TBL_NM := 'ias_pos_bill_mst';
		V_WHR := V_TBL_NM || '.bill_srl = ' || P_DOC_SER;
	    ELSIF P_SYS_NO = 87 THEN
		V_TBL_NM := 'rms_bill_mst';
		V_WHR := V_TBL_NM || '.bill_srl = ' || P_DOC_SER;
	    END IF;
	ELSIF P_DOC_TYPE = 5 THEN
	    IF P_SYS_NO IN ( 61 ,67, 85 ,70 ) THEN
		V_TBL_NM := 'ias_rt_bill_mst';
		V_WHR := V_TBL_NM || '.rt_bill_ser = ' || P_DOC_SER;
	    ELSIF P_SYS_NO = 80 THEN
		V_TBL_NM := 'ias_pos_rt_bill_mst';
		V_WHR := V_TBL_NM || '.rt_bill_srl = ' || P_DOC_SER;
	    ELSIF P_SYS_NO = 87 THEN
		V_TBL_NM := 'rms_rt_bill_mst';
		V_WHR := V_TBL_NM || '.rt_bill_srl = ' || P_DOC_SER;
	    END IF;
	ELSIF P_DOC_TYPE = 15 THEN
	    IF P_SYS_NO IN ( 61 ,67, 85 ,70 ) THEN
		V_TBL_NM := 'IAS_BILL_MST_ADD_DISC';
		V_WHR := V_TBL_NM || '.DOC_SER = ' || P_DOC_SER;
	    END IF;
	ELSIF P_DOC_TYPE = 106 THEN -- Advance Bill
	      V_TBL_NM := 'GLS_BILL_ADVNC';
	      V_WHR := V_TBL_NM || '.DOC_SRL = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 109 THEN -- Advance Return Bill
	      V_TBL_NM := 'GLS_RTRN_BILL_ADVNC';
	      V_WHR := V_TBL_NM || '.DOC_SRL = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 2 THEN -- Receipt Voucher
	      V_TBL_NM := 'VOUCHERS';
	      V_WHR := V_TBL_NM || '.V_SER = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 501 THEN  -- cr --  5
	    V_TBL_NM := 'rem_prmting_priod_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 503 THEN -- dr --  4
	    V_TBL_NM := 'rem_bill_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 504 THEN -- dr --  4
	    V_TBL_NM := 'rem_cntrct_sale_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 513 THEN -- cr --  5
	    V_TBL_NM := 'rem_cntrct_sale_cncl_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 521 THEN -- cr --  5
	    V_TBL_NM := 'rem_rvrs_bill_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 525 THEN -- dr --  4
	    V_TBL_NM := 'rem_bill_rnt_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 526 THEN -- cr --  5
	    V_TBL_NM := 'rem_rvrs_bill_rnt_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 537 THEN -- dr --  4
	    V_TBL_NM := 'rem_bill_comm_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 538 THEN -- cr --  5
	    V_TBL_NM := 'rem_rvrs_bill_comm_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 316 THEN -- cr --  5
	    V_TBL_NM := 'PMS_RECEIPT_ENV_MST';
	    V_WHR := V_TBL_NM || '.DOC_SER = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 317 THEN -- dr --  4
	    V_TBL_NM := 'PMS_RTRN_RECEIPT_ENV_MST';
	    V_WHR := V_TBL_NM || '.DOC_SER = ' || P_DOC_SER;

       ELSIF P_DOC_TYPE = 1502 THEN -- STN
		V_TBL_NM := 'ias_bill_mst_br';
		V_WHR := V_TBL_NM || '.bill_ser = ' || P_DOC_SER;
	END IF;
	V_STMNT := 'UPDATE ' || V_TBL_NM || '
		set web_srvc_trnsfr_data_flg=:p1,
		    web_srvc_uuid=:p2,
		    doc_hash=nvl(:p3,doc_hash)
		where ' || V_WHR;

	EXECUTE IMMEDIATE V_STMNT
	    USING P_STATUS, P_UUID, P_HASH;

	--COMMIT;
    END POSTSUBMITPROCESS;
    --Check document status and update the document status
    PROCEDURE CHECKDOCUMENTSTATUS(P_DOC_TYPE   IN     NUMBER,
				  P_DOC_SER    IN     NUMBER,
				  P_SYS_NO     IN     NUMBER DEFAULT 61,
				  P_STATUS     OUT VARCHAR2,
				  P_ERROR      OUT VARCHAR2)
    IS
	V_WHR		  VARCHAR2(4000);
	V_TBL_NM	  VARCHAR2(32);
	V_SLCT_STMNT	  VARCHAR2(1000);
	V_UUID		  VARCHAR2(64);

	V_RESPONSE_TEXT   VARCHAR2(32000);
	V_RESPONSE_CODE   NUMBER;
	V_OBJ		  PLJSON;
	V_LIST		  PLJSON_LIST;
	V_ELEMENT	  PLJSON_ELEMENT;
	V_CLOB		  CLOB;
	V_HASH		  VARCHAR2(64);
	V_ONYX_STATUS	  NUMBER;
	V_MSG		  VARCHAR2(250);
    BEGIN

	--getting document detials
	IF P_DOC_TYPE = 4 THEN
	    IF P_SYS_NO IN ( 61 , 67,85 ,70 ) THEN
		V_TBL_NM := 'ias_bill_mst';
		V_WHR := V_TBL_NM || '.bill_ser = ' || P_DOC_SER;
	    ELSIF P_SYS_NO = 80 THEN
		V_TBL_NM := 'ias_pos_bill_mst';
		V_WHR := V_TBL_NM || '.bill_srl = ' || P_DOC_SER;
	    ELSIF P_SYS_NO = 87 THEN
		V_TBL_NM := 'rms_bill_mst';
		V_WHR := V_TBL_NM || '.bill_srl = ' || P_DOC_SER;
	    END IF;
	ELSIF P_DOC_TYPE = 5 THEN
	    IF P_SYS_NO IN ( 61 ,67, 85 ,70 ) THEN
		V_TBL_NM := 'ias_rt_bill_mst';
		V_WHR := V_TBL_NM || '.rt_bill_ser = ' || P_DOC_SER;
	    ELSIF P_SYS_NO = 80 THEN
		V_TBL_NM := 'ias_pos_rt_bill_mst';
		V_WHR := V_TBL_NM || '.rt_bill_srl = ' || P_DOC_SER;
	    ELSIF P_SYS_NO = 87 THEN
		V_TBL_NM := 'rms_rt_bill_mst';
		V_WHR := V_TBL_NM || '.rt_bill_srl = ' || P_DOC_SER;
	    END IF;
	ELSIF P_DOC_TYPE = 15 THEN
	    IF P_SYS_NO IN ( 61 ,67, 85 ,70 ) THEN
		V_TBL_NM := 'IAS_BILL_MST_ADD_DISC';
		V_WHR := V_TBL_NM || '.DOC_SER = ' || P_DOC_SER;
	    END IF;
	ELSIF P_DOC_TYPE = 106 THEN -- Advance Bill
	      V_TBL_NM := 'GLS_BILL_ADVNC';
	      V_WHR := V_TBL_NM || '.DOC_SRL = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 109 THEN -- Advance Return Bill
	      V_TBL_NM := 'GLS_RTRN_BILL_ADVNC';
	      V_WHR := V_TBL_NM || '.DOC_SRL = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 2 THEN -- Receipt Voucher
	      V_TBL_NM := 'VOUCHERS';
	      V_WHR := V_TBL_NM || '.V_SER = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 501 THEN  -- cr --  5
	    V_TBL_NM := 'rem_prmting_priod_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 503 THEN -- dr --  4
	    V_TBL_NM := 'rem_bill_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 504 THEN -- dr --  4
	    V_TBL_NM := 'rem_cntrct_sale_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 513 THEN -- cr --  5
	    V_TBL_NM := 'rem_cntrct_sale_cncl_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 521 THEN -- cr --  5
	    V_TBL_NM := 'rem_rvrs_bill_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 525 THEN -- dr --  4
	    V_TBL_NM := 'rem_bill_rnt_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 526 THEN -- cr --  5
	    V_TBL_NM := 'rem_rvrs_bill_rnt_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 537 THEN -- dr --  4
	    V_TBL_NM := 'rem_bill_comm_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 538 THEN -- cr --  5
	    V_TBL_NM := 'rem_rvrs_bill_comm_mst';
	     V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 316 THEN -- cr --  5
	    V_TBL_NM := 'PMS_RECEIPT_ENV_MST';
	    V_WHR := V_TBL_NM || '.DOC_SER = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 317 THEN -- dr --  4
	    V_TBL_NM := 'PMS_RTRN_RECEIPT_ENV_MST';
	    V_WHR := V_TBL_NM || '.DOC_SER = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 1502 THEN -- STN
		V_TBL_NM := 'ias_bill_mst_br';
		V_WHR := V_TBL_NM || '.bill_ser = ' || P_DOC_SER;
	END IF;

	V_SLCT_STMNT := 'SELECT WEB_SRVC_UUID FROM ' || V_TBL_NM || ' WHERE ' || V_WHR;

	EXECUTE IMMEDIATE V_SLCT_STMNT INTO V_UUID;

	IF V_UUID IS NULL THEN
	    RAISE_APPLICATION_ERROR(-20002, 'DOCUMENT UUID IS NULL. THE DOCUMENT HAS NOT BEEN POSTED TO TAX YET!.');
	END IF;

	IF NOT ISTOKENVALID(G_USER_TOKEN) THEN
	    LOGIN(G_USERNAME, G_PASSWORD, V_MSG);
	END IF;

	IAS_WEB_SRVC_PKG.CALL_WEB_SERVICE_CHAR(P_URL		    => G_BASE_URL || '/api/tax/checkDocumentStatus/' || V_UUID,
					       P_METHOD 	    => 'GET',
					       P_CONTENT_TYPE	    => 'application/json',
					       P_CONTENT	    => NULL,
					       P_RESPONSE_TEXT	    => V_RESPONSE_TEXT,
					       P_HTTP_RSPONS_CODE   => V_RESPONSE_CODE,
					       P_WALLET_PATH	    => G_WALLET_PATH,
					       P_WALLET_PWD	    => G_WALLET_PASS,
					       P_TOKEN		    => G_USER_TOKEN.GET_STRING('accessToken'));

	--raise_application_error(-20001,v_response_text);
	IF V_RESPONSE_CODE = 401 THEN
	    RAISE_APPLICATION_ERROR(-20401, 'Unauthorized!');
	END IF;

	V_OBJ := PLJSON(V_RESPONSE_TEXT);
	--v_obj.print;
	IF V_OBJ.GET_NUMBER('code') <> 0 THEN
	    P_ERROR := V_OBJ.GET_STRING('message');
	    RETURN;
	END IF;

	V_OBJ := V_OBJ.GET_PLJSON('content');

	V_ONYX_STATUS := CASE V_OBJ.GET_STRING('status') WHEN 'Valid' THEN 1 WHEN 'New' THEN 2 WHEN 'Processing' THEN 2 WHEN 'Invalid' THEN 3 WHEN 'Rejected' THEN 4 WHEN 'Cancelled' THEN 5 WHEN 'ApiRejected' THEN 6 END;

	P_STATUS := V_OBJ.GET_STRING('status');
	IF NOT V_OBJ.GET('errorsDescription').IS_NULL THEN
	    P_ERROR := V_OBJ.GET_STRING('errorsDescription');
	--v_element := v_obj.get('errorsDescription');
	--dbms_lob.createtemporary(v_clob, true);
	--v_element.to_clob(v_clob, spaces=>true);
	--p_error := dbms_lob.substr( UNISTR(replace(v_clob,'\u','\')), 4000, 1 );
	--dbms_lob.freetemporary(v_clob);
	END IF;

	POSTSUBMITPROCESS(P_DOC_TYPE,
			  P_DOC_SER,
			  P_SYS_NO,
			  V_ONYX_STATUS,
			  V_UUID,
			  NULL);

    END CHECKDOCUMENTSTATUS;

    PROCEDURE CHECKDOCUMENTSTATUS(P_DOC_TYPE	    IN	   NUMBER,
				  P_DOC_SER	    IN	   NUMBER,
				  P_SRVC_NO	    IN	   NUMBER,
				  P_SYS_NO	    IN	   NUMBER DEFAULT 61,
				  P_BRN_NO	    IN	   NUMBER DEFAULT NULL,
				  P_ERROR	       OUT VARCHAR2,
				  P_STATUS	       OUT VARCHAR2)
    IS
	V_WHR		  VARCHAR2(4000);
	V_TBL_NM	  VARCHAR2(32);
	V_SLCT_STMNT	  VARCHAR2(1000);
	V_UUID		  VARCHAR2(64);

	V_RESPONSE_TEXT   VARCHAR2(32000);
	V_RESPONSE_CODE   NUMBER;
	V_OBJ		  PLJSON;
	V_ONYX_STATUS	  NUMBER;
	V_MSG		  VARCHAR2(250);

	V_BRN_NO	  S_BRN.BRN_NO%TYPE;
	V_SRVC_NO	  NUMBER;
	V_POS_REF_CODE	  VARCHAR2(50);
	V_TAX_CONFIG_NO   NUMBER;
	V_USE_SALE_OUTLET NUMBER:=0;
	V_OUTLET_NO	  NUMBER;
	V_CUR		  SYS_REFCURSOR;
    BEGIN

	--getting document detials
	IF P_DOC_TYPE = 4 THEN
	    IF P_SYS_NO IN ( 61 , 67,85 ,70 ) THEN
		V_TBL_NM := 'ias_bill_mst';
		V_WHR := V_TBL_NM || '.bill_ser = ' || P_DOC_SER;
	    ELSIF P_SYS_NO = 80 THEN
		V_TBL_NM := 'ias_pos_bill_mst';
		V_WHR := V_TBL_NM || '.bill_srl = ' || P_DOC_SER;
	    ELSIF P_SYS_NO = 87 THEN
		V_TBL_NM := 'rms_bill_mst';
		V_WHR := V_TBL_NM || '.bill_srl = ' || P_DOC_SER;
	    END IF;
	ELSIF P_DOC_TYPE = 5 THEN
	    IF P_SYS_NO IN ( 61 ,67, 85 ,70 ) THEN
		V_TBL_NM := 'ias_rt_bill_mst';
		V_WHR := V_TBL_NM || '.rt_bill_ser = ' || P_DOC_SER;
	    ELSIF P_SYS_NO = 80 THEN
		V_TBL_NM := 'ias_pos_rt_bill_mst';
		V_WHR := V_TBL_NM || '.rt_bill_srl = ' || P_DOC_SER;
	    ELSIF P_SYS_NO = 87 THEN
		V_TBL_NM := 'rms_rt_bill_mst';
		V_WHR := V_TBL_NM || '.rt_bill_srl = ' || P_DOC_SER;
	    END IF;
	ELSIF P_DOC_TYPE = 15 THEN
	    IF P_SYS_NO IN ( 61 ,67, 85 ,70 ) THEN
		V_TBL_NM := 'IAS_BILL_MST_ADD_DISC';
		V_WHR := V_TBL_NM || '.DOC_SER = ' || P_DOC_SER;
	    END IF;
	ELSIF P_DOC_TYPE = 106 THEN -- Advance Bill
	      V_TBL_NM := 'GLS_BILL_ADVNC';
	      V_WHR := V_TBL_NM || '.DOC_SRL = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 109 THEN -- Advance Return Bill
	      V_TBL_NM := 'GLS_RTRN_BILL_ADVNC';
	      V_WHR := V_TBL_NM || '.DOC_SRL = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 2 THEN -- Receipt Voucher
	      V_TBL_NM := 'VOUCHERS';
	      V_WHR := V_TBL_NM || '.V_SER = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 501 THEN  -- cr --  5
	    V_TBL_NM := 'rem_prmting_priod_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 503 THEN -- dr --  4
	    V_TBL_NM := 'rem_bill_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 504 THEN -- dr --  4
	    V_TBL_NM := 'rem_cntrct_sale_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 513 THEN -- cr --  5
	    V_TBL_NM := 'rem_cntrct_sale_cncl_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 521 THEN -- cr --  5
	    V_TBL_NM := 'rem_rvrs_bill_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 525 THEN -- dr --  4
	    V_TBL_NM := 'rem_bill_rnt_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 526 THEN -- cr --  5
	    V_TBL_NM := 'rem_rvrs_bill_rnt_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 537 THEN -- dr --  4
	    V_TBL_NM := 'rem_bill_comm_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 538 THEN -- cr --  5
	    V_TBL_NM := 'rem_rvrs_bill_comm_mst';
	     V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 316 THEN -- cr --  5
	    V_TBL_NM := 'PMS_RECEIPT_ENV_MST';
	    V_WHR := V_TBL_NM || '.DOC_SER = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 317 THEN -- dr --  4
	    V_TBL_NM := 'PMS_RTRN_RECEIPT_ENV_MST';
	    V_WHR := V_TBL_NM || '.DOC_SER = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 1502 THEN -- STN
		V_TBL_NM := 'ias_bill_mst_br';
		V_WHR := V_TBL_NM || '.bill_ser = ' || P_DOC_SER;
	END IF;

	V_SLCT_STMNT := 'SELECT WEB_SRVC_UUID,BRN_NO FROM ' || V_TBL_NM || ' WHERE ' || V_WHR;
	V_SRVC_NO := P_SRVC_NO;

	OPEN V_CUR FOR V_SLCT_STMNT;
	    LOOP
		FETCH V_CUR INTO V_UUID,V_BRN_NO;
		EXIT WHEN V_CUR%NOTFOUND;
	    END LOOP;
	CLOSE V_CUR;

	V_BRN_NO  := NVL(P_BRN_NO,V_BRN_NO);

	IF V_UUID IS NULL THEN
	    RAISE_APPLICATION_ERROR(-20002, 'DOCUMENT UUID IS NULL. THE DOCUMENT HAS NOT BEEN POSTED TO TAX YET!.');
	END IF;

	IF V_SRVC_NO IS NULL THEN

	    IF V_BRN_NO IS NULL THEN
		RAISE_APPLICATION_ERROR(-20003,YS_GEN_PKG.GET_MSG(G_LNG_NO,1601)||CHR(32)||YS_GEN_PKG.GET_PROMPT(G_LNG_NO,50));
	    END IF;

	    --GETTING SRVC_NO AND TAX_CONFIG_NO FROM POS_REF_CODE IF EXSITS
	    BEGIN
		EXECUTE IMMEDIATE 'SELECT NVL(USE_SALE_OUTLET,0) FROM IAS_PARA_GEN WHERE ROWNUM<=1' INTO  V_USE_SALE_OUTLET;
		--
		IF NVL(V_USE_SALE_OUTLET,0) = 1 AND P_SYS_NO = 170 THEN
		   --
		   EXECUTE IMMEDIATE 'SELECT DISTINCT OUTLET_NO FROM REM_V_E_INVC_JSON WHERE DOC_SRL=:P_DOC_SER AND DOC_TYPE=:P_DOC_TYPE'
			INTO  V_OUTLET_NO USING P_DOC_SER,P_DOC_TYPE ;
		   --
		   IF NVL(V_OUTLET_NO,0) <> 0 THEN
		      SELECT  NVL(SRVC_NO, '0')
			INTO  V_POS_REF_CODE
			FROM  GNR_SALE_OUTLET
		       WHERE  OUTLET_NO = V_OUTLET_NO;
		   END IF;
		ELSE
			EXECUTE IMMEDIATE 'SELECT POS_REF_CODE FROM S_BRN WHERE BRN_NO = ' || V_BRN_NO
			    INTO V_POS_REF_CODE;
		END IF;
	    EXCEPTION
		WHEN NO_DATA_FOUND THEN
		    V_POS_REF_CODE := NULL;
	    END;

	    IF INSTR(V_POS_REF_CODE, ';') > 0 THEN
		V_SRVC_NO := SUBSTR(V_POS_REF_CODE, 1, INSTR(V_POS_REF_CODE, ';') - 1);
		V_TAX_CONFIG_NO := SUBSTR(V_POS_REF_CODE, INSTR(V_POS_REF_CODE, ';') + 1);
	    ELSE
		V_SRVC_NO := V_POS_REF_CODE;
	    END IF;

	    IF V_SRVC_NO IS NULL THEN
		RAISE_APPLICATION_ERROR(-20203, 'UNABLE TO GET SRVC_NO');
	    END IF;
	END IF;

	--IF THIS IS THE FIRST CALL IN THE CURENT SESSION (G_SRVC_NO=NULL) OR SRVC_NO IS DIFFERENT,
	-- THEN LOAD THE NEW SERVICE AND LOGING AGAING
	IF NOT ISTOKENVALID(G_USER_TOKEN) OR G_SRVC_NO IS NULL OR G_SRVC_NO <> V_SRVC_NO THEN
	    INITIALIZE(V_SRVC_NO);
	    LOGIN(G_USERNAME, G_PASSWORD, V_MSG);
	END IF;

	IAS_WEB_SRVC_PKG.CALL_WEB_SERVICE_CHAR(P_URL		    => G_BASE_URL || '/api/tax/checkDocumentStatus/' || V_UUID,
					       P_METHOD 	    => 'GET',
					       P_CONTENT_TYPE	    => 'application/json',
					       P_CONTENT	    => NULL,
					       P_RESPONSE_TEXT	    => V_RESPONSE_TEXT,
					       P_HTTP_RSPONS_CODE   => V_RESPONSE_CODE,
					       P_WALLET_PATH	    => G_WALLET_PATH,
					       P_WALLET_PWD	    => G_WALLET_PASS,
					       P_TOKEN		    => G_USER_TOKEN.GET_STRING('accessToken'));

	--raise_application_error(-20001,v_response_text);
	IF V_RESPONSE_CODE = 401 THEN
	    RAISE_APPLICATION_ERROR(-20401, 'Unauthorized!');
	END IF;

	V_OBJ := PLJSON(V_RESPONSE_TEXT);
	--v_obj.print;
	IF V_OBJ.GET_NUMBER('code') <> 0 THEN
	    P_ERROR := V_OBJ.GET_STRING('message');
	    RETURN;
	END IF;

	V_OBJ := V_OBJ.GET_PLJSON('content');

	V_ONYX_STATUS := CASE V_OBJ.GET_STRING('status') WHEN 'Valid' THEN 1 WHEN 'New' THEN 2 WHEN 'Processing' THEN 2 WHEN 'Invalid' THEN 3 WHEN 'Rejected' THEN 4 WHEN 'Cancelled' THEN 5 WHEN 'ApiRejected' THEN 6 END;

	P_STATUS := V_OBJ.GET_STRING('status');
	IF NOT V_OBJ.GET('errorsDescription').IS_NULL THEN
	    P_ERROR := V_OBJ.GET_STRING('errorsDescription');
	--v_element := v_obj.get('errorsDescription');
	--dbms_lob.createtemporary(v_clob, true);
	--v_element.to_clob(v_clob, spaces=>true);
	--p_error := dbms_lob.substr( UNISTR(replace(v_clob,'\u','\')), 4000, 1 );
	--dbms_lob.freetemporary(v_clob);
	END IF;

	POSTSUBMITPROCESS(P_DOC_TYPE,
			  P_DOC_SER,
			  P_SYS_NO,
			  V_ONYX_STATUS,
			  V_UUID,
			  NULL);

    END CHECKDOCUMENTSTATUS;

    PROCEDURE GETDASHBOARDDATA(P_NEW	     OUT NUMBER,
			       P_SUCCESS     OUT NUMBER,
			       P_WAITING     OUT NUMBER,
			       P_DECLINED    OUT NUMBER,
			       P_SUSPECTED   OUT NUMBER,
			       P_ERROR	     OUT VARCHAR2)
    IS
	V_RESPONSE_TEXT   VARCHAR2(32000);
	V_RESPONSE_CODE   NUMBER;
	V_OBJ		  PLJSON;
	V_MSG		  VARCHAR2(250);
    BEGIN
	IF NOT ISTOKENVALID(G_USER_TOKEN) THEN
	    LOGIN(G_USERNAME, G_PASSWORD, V_MSG);
	END IF;
	 IAS_WEB_SRVC_PKG.CALL_WEB_SERVICE_CHAR(P_URL		     => G_BASE_URL || '/api/Tax/GetDocumentStatusCount',
					       P_METHOD 	    => 'Get',
					       P_CONTENT_TYPE	    => 'application/json',
					       P_CONTENT	    => NULL,
					       P_RESPONSE_TEXT	    => V_RESPONSE_TEXT,
					       P_HTTP_RSPONS_CODE   => V_RESPONSE_CODE,
					       P_WALLET_PATH	    => G_WALLET_PATH,
					       P_WALLET_PWD	    => G_WALLET_PASS,
					       P_TOKEN		    => G_USER_TOKEN.GET_STRING('accessToken'));

	IF V_RESPONSE_CODE = 401 THEN
	    RAISE_APPLICATION_ERROR(-20401, 'Unauthorized!');
	END IF;

	V_OBJ := PLJSON(V_RESPONSE_TEXT);

	IF V_OBJ.GET_NUMBER('code') <> 0 THEN
	    RAISE_APPLICATION_ERROR(-20010, V_OBJ.GET_NUMBER('code') || '-' || V_OBJ.GET_STRING('message'));
	END IF;

	V_OBJ := V_OBJ.GET_PLJSON('content');

	P_SUCCESS := PLJSON_EXT.GET_NUMBER(V_OBJ, 'valid');
	P_WAITING := PLJSON_EXT.GET_NUMBER(V_OBJ, 'waiting');
	P_DECLINED := PLJSON_EXT.GET_NUMBER(V_OBJ, 'invalid');
	P_SUSPECTED := PLJSON_EXT.GET_NUMBER(V_OBJ, 'rejected');
    EXCEPTION
	WHEN OTHERS THEN
	    P_ERROR := SQLERRM;
    --raise;
    END GETDASHBOARDDATA;
    FUNCTION GETPDFA3(P_UUID	   IN  VARCHAR2,
		      P_PDF_BLOB IN  BLOB) RETURN BLOB
    IS
	V_CONTENT		CLOB;
	V_RESPONSE_BLOB 	BLOB;
	V_RESPONSE_CODE 	NUMBER;
	V_FILE_NAME		VARCHAR2(256);
	V_MSG			VARCHAR2(250);
	V_JSON			PLJSON;
	V_PDFA3_BASE64_REQ	CLOB;
	V_PDFA3_BASE64_RES	CLOB;


	V_BLOB	      BLOB;
	V_TEMP_BLOB   BLOB;
	V_OFFSET      PLS_INTEGER := 1;
	V_CHUNK_SIZE  PLS_INTEGER := 32000; -- Process in chunks of 32,000 bytes
	V_CLOB_LENGTH PLS_INTEGER;
	V_RAW_CHUNK   RAW(32767);
    BEGIN
	IF P_UUID IS NULL OR P_UUID = '' THEN
	    RAISE_APPLICATION_ERROR(-20001, 'Parameter p_uuid can''t be empty');
	END IF;

	IF P_PDF_BLOB IS NULL THEN
	    RAISE_APPLICATION_ERROR(-20001, 'Parameter P_PDF_BLOB can''t be empty');
	END IF;

	IF NOT ISTOKENVALID(G_USER_TOKEN) THEN
	    LOGIN(G_USERNAME, G_PASSWORD, V_MSG);
	END IF;

	DBMS_LOB.CREATETEMPORARY(V_PDFA3_BASE64_REQ, TRUE, DBMS_LOB.CALL);
	IAS_WEB_SRVC_PKG.BASE64ENCODE(P_BLOB => P_PDF_BLOB, P_CLOB => V_PDFA3_BASE64_REQ);

	V_PDFA3_BASE64_REQ := REPLACE(V_PDFA3_BASE64_REQ, CHR(10), '');
	V_PDFA3_BASE64_REQ := REPLACE(V_PDFA3_BASE64_REQ, CHR(13), '');

	V_CONTENT :=
'{
    "Module":"TAX",
    "Method":"GetPdfA3",
    "Parameter":{
	"uuid":"'||P_UUID||'",
	"pdfBase64":"'||V_PDFA3_BASE64_REQ||'"
    }
}';
       -- INSERT INTO IAS20211.TMP(ID, A) VALUES (SYSDATE, V_CONTENT); COMMIT;
	IAS_WEB_SRVC_PKG.CALL_WEB_SERVICE_BLOB(P_URL		    => G_BASE_URL || '/api/Genericapi?uuid=' || P_UUID,
					       P_METHOD 	    => 'POST',
					       P_CONTENT_TYPE	    => 'application/json',
					       P_CONTENT	    => V_CONTENT,
					       P_RESPONSE_BLOB	    => V_RESPONSE_BLOB,
					       P_HTTP_RSPONS_CODE   => V_RESPONSE_CODE,
						P_FILE_NAME	     => V_FILE_NAME,
					       P_WALLET_PATH	    => G_WALLET_PATH,
					       P_WALLET_PWD	    => G_WALLET_PASS,
					       P_TOKEN		    => G_USER_TOKEN.GET_STRING('accessToken'));
	IF V_RESPONSE_CODE = 401 THEN
	    RAISE_APPLICATION_ERROR(-20401, 'Unauthorized!');
	ELSIF V_RESPONSE_CODE <> 200 THEN
	    RAISE_APPLICATION_ERROR(-20010, 'Error when getting document. Error Code:' || V_RESPONSE_CODE|| '-' ||IAS_WEB_SRVC_PKG.BLOB_TO_CLOB(V_RESPONSE_BLOB));
	END IF;

	V_JSON := PLJSON(V_RESPONSE_BLOB);

	IF V_JSON.GET_NUMBER('code') <> 0 THEN
	    RAISE_APPLICATION_ERROR(-20411, 'Error when getting pdf. Code:'||V_JSON.GET_NUMBER('code') || '-' || V_JSON.GET_STRING('message'));
	END IF;

	V_JSON := PLJSON(V_JSON.GET('content'));
	V_PDFA3_BASE64_RES := V_JSON.GET_CLOB('result');

	-- Create a temporary BLOB for processing
	DBMS_LOB.CREATETEMPORARY(V_TEMP_BLOB, TRUE);

	V_CLOB_LENGTH := DBMS_LOB.GETLENGTH(V_PDFA3_BASE64_RES);

	WHILE V_OFFSET <= V_CLOB_LENGTH LOOP
	    -- Extract a chunk of the Base64 CLOB
	    V_RAW_CHUNK := UTL_RAW.CAST_TO_RAW(DBMS_LOB.SUBSTR(V_PDFA3_BASE64_RES, V_CHUNK_SIZE, V_OFFSET));

	    -- Decode the Base64 chunk to RAW
	    V_RAW_CHUNK := UTL_ENCODE.BASE64_DECODE(V_RAW_CHUNK);

	    -- Append the decoded RAW chunk to the temporary BLOB
	    DBMS_LOB.WRITEAPPEND(V_TEMP_BLOB, UTL_RAW.LENGTH(V_RAW_CHUNK), V_RAW_CHUNK);

	    -- Move the offset forward
	    V_OFFSET := V_OFFSET + V_CHUNK_SIZE;
	END LOOP;
	-- Initialize the BLOB to hold the final data
	DBMS_LOB.CREATETEMPORARY(V_BLOB, TRUE);
	DBMS_LOB.COPY(V_BLOB, V_TEMP_BLOB, DBMS_LOB.LOBMAXSIZE, 1, 1);

	-- Free the temporary BLOB
	DBMS_LOB.FREETEMPORARY(V_TEMP_BLOB);
	--INSERT INTO IAS20411.TMP(ID, FL) VALUES (SYSDATE, V_BLOB); COMMIT;

	RETURN V_BLOB;
    END GETPDFA3;
    FUNCTION GETPDFA3(P_SRVC_NO    IN NUMBER,
		      P_UUID	   IN VARCHAR2,
		      P_PDF_BLOB   IN BLOB) RETURN BLOB
    IS
	L_PDF_BLOB BLOB;
    BEGIN
	INITIALIZE(P_SRVC_NO => P_SRVC_NO);

	L_PDF_BLOB := GETPDFA3(P_UUID	  => P_UUID,
			       P_PDF_BLOB => P_PDF_BLOB);

	RETURN L_PDF_BLOB;
    END GETPDFA3;

    FUNCTION GETPOSTEDDOC(P_UUID IN VARCHAR2)
	RETURN CLOB
    IS
	V_RESPONSE_BLOB   BLOB;
	V_RESPONSE_CODE   NUMBER;
	V_FILE_NAME	  VARCHAR2(256);
	V_MSG		  VARCHAR2(250);
    BEGIN
	IF P_UUID IS NULL OR P_UUID = '' THEN
	    RAISE_APPLICATION_ERROR(-20001, 'Parameter p_uuid can''t be empty');
	END IF;

	IF NOT ISTOKENVALID(G_USER_TOKEN) THEN
	    LOGIN(G_USERNAME, G_PASSWORD, V_MSG);
	END IF;

	IAS_WEB_SRVC_PKG.CALL_WEB_SERVICE_BLOB(P_URL		    => G_BASE_URL || '/api/Tax/DownloadDocument?uuid=' || P_UUID,
					       P_METHOD 	    => 'Get',
					       P_CONTENT_TYPE	    => 'application/json',
					       P_CONTENT	    => NULL,
					       P_RESPONSE_BLOB	    => V_RESPONSE_BLOB,
					       P_HTTP_RSPONS_CODE   => V_RESPONSE_CODE,
					       P_FILE_NAME	    => V_FILE_NAME,
					       P_WALLET_PATH	    => G_WALLET_PATH,
					       P_WALLET_PWD	    => G_WALLET_PASS,
					       P_TOKEN		    => G_USER_TOKEN.GET_STRING('accessToken'));
	IF V_RESPONSE_CODE = 401 THEN
	    RAISE_APPLICATION_ERROR(-20401, 'Unauthorized!');
	ELSIF V_RESPONSE_CODE = 404 THEN
	    RAISE_APPLICATION_ERROR(-20404, 'Document with UUDI:' || P_UUID || ' not found');
	ELSIF V_RESPONSE_CODE = 200 THEN
	    RETURN IAS_WEB_SRVC_PKG.BLOB_TO_CLOB(V_RESPONSE_BLOB);
	ELSE
	    RAISE_APPLICATION_ERROR(-20010, 'Error when getting document. Error Code:' || V_RESPONSE_CODE);
	END IF;
    EXCEPTION
	WHEN OTHERS THEN
	    RAISE;
    END GETPOSTEDDOC;
    FUNCTION GETTAXSIGNEDDOC(P_UUID IN VARCHAR2)
	RETURN CLOB
    IS
	V_RESPONSE_BLOB   BLOB;
	V_RESPONSE_CODE   NUMBER;
	V_FILE_NAME	  VARCHAR2(256);
	V_MSG		  VARCHAR2(250);
    BEGIN
	IF P_UUID IS NULL OR P_UUID = '' THEN
	    RAISE_APPLICATION_ERROR(-20001, 'Parameter p_uuid can''t be empty');
	END IF;

	IF NOT ISTOKENVALID(G_USER_TOKEN) THEN
	    LOGIN(G_USERNAME, G_PASSWORD, V_MSG);
	END IF;

	IAS_WEB_SRVC_PKG.CALL_WEB_SERVICE_BLOB(P_URL		    => G_BASE_URL || '/api/Tax/DownloadTaxSignedDocument?uuid=' || P_UUID,
					       P_METHOD 	    => 'Get',
					       P_CONTENT_TYPE	    => 'application/json',
					       P_CONTENT	    => NULL,
					       P_RESPONSE_BLOB	    => V_RESPONSE_BLOB,
					       P_HTTP_RSPONS_CODE   => V_RESPONSE_CODE,
					       P_FILE_NAME	    => V_FILE_NAME,
					       P_WALLET_PATH	    => G_WALLET_PATH,
					       P_WALLET_PWD	    => G_WALLET_PASS,
					       P_TOKEN		    => G_USER_TOKEN.GET_STRING('accessToken'));
	IF V_RESPONSE_CODE = 401 THEN
	    RAISE_APPLICATION_ERROR(-20401, 'Unauthorized!');
	ELSIF V_RESPONSE_CODE = 404 THEN
	    RAISE_APPLICATION_ERROR(-20404, 'Document with UUDI:' || P_UUID || ' not found');
	ELSIF V_RESPONSE_CODE = 200 THEN
	    RETURN IAS_WEB_SRVC_PKG.BLOB_TO_CLOB(V_RESPONSE_BLOB);
	ELSE
	    RAISE_APPLICATION_ERROR(-20010, 'Error when getting document. Error Code:' || V_RESPONSE_CODE);
	END IF;
    EXCEPTION
	WHEN OTHERS THEN
	    RAISE;
    END GETTAXSIGNEDDOC;

    FUNCTION GETQRCODE(P_UUID IN VARCHAR2, P_QR_TYPE IN VARCHAR2 DEFAULT 'text')
	RETURN VARCHAR2
    IS
	V_RESPONSE_TEXT   VARCHAR2(32000);
	V_RESPONSE_CODE   NUMBER;
	V_OBJ		  PLJSON;
	V_MSG		  VARCHAR2(250);
    BEGIN

	IF P_UUID IS NULL OR P_UUID = '' THEN
	    RAISE_APPLICATION_ERROR(-20001, 'Parameter p_uuid can''t be empty');
	END IF;

	IF NOT ISTOKENVALID(G_USER_TOKEN) THEN
	    LOGIN(G_USERNAME, G_PASSWORD, V_MSG);
	END IF;


	IAS_WEB_SRVC_PKG.CALL_WEB_SERVICE_CHAR(P_URL		    => G_BASE_URL || '/api/Tax/getDocumentQr/' || P_UUID || '?type=' || P_QR_TYPE,
					       P_METHOD 	    => 'Get',
					       P_CONTENT_TYPE	    => 'application/json',
					       P_CONTENT	    => NULL,
					       P_RESPONSE_TEXT	    => V_RESPONSE_TEXT,
					       P_HTTP_RSPONS_CODE   => V_RESPONSE_CODE,
					       P_WALLET_PATH	    => G_WALLET_PATH,
					       P_WALLET_PWD	    => G_WALLET_PASS,
					       P_TOKEN		    => G_USER_TOKEN.GET_STRING('accessToken'));

	IF V_RESPONSE_CODE = 401 THEN
	    RAISE_APPLICATION_ERROR(-20401, 'Unauthorized!');
	ELSIF V_RESPONSE_CODE NOT IN (200) THEN
	    RAISE_APPLICATION_ERROR(-20001, 'Error when getting QR for document:' || P_UUID || CHR(10) || V_RESPONSE_TEXT);
	END IF;

	V_OBJ := PLJSON(V_RESPONSE_TEXT);

	IF V_OBJ.GET_NUMBER('code') <> 0 THEN
	    RAISE_APPLICATION_ERROR(-20010, V_OBJ.GET_NUMBER('code') || '-' || V_OBJ.GET_STRING('message'));
	END IF;
	RETURN V_OBJ.GET_STRING('content');
    EXCEPTION
	WHEN OTHERS THEN
	    RAISE;
    END GETQRCODE;

    FUNCTION GetVersion(P_SRVC_NO IN  NUMBER)
	RETURN VARCHAR2
    IS
	V_RESPONSE_TEXT   VARCHAR2(32000);
	V_RESPONSE_CODE   NUMBER;
	V_OBJ		  PLJSON;
    BEGIN

	IF P_SRVC_NO IS NULL THEN
	    RAISE_APPLICATION_ERROR(-20001, 'Parameter P_SRVC_NO can''t be empty');
	END IF;

	INITIALIZE(P_SRVC_NO);

	IAS_WEB_SRVC_PKG.CALL_WEB_SERVICE_CHAR(P_URL		    => G_BASE_URL || '/api/version',
					       P_METHOD 	    => 'Get',
					       P_CONTENT_TYPE	    => 'application/json',
					       P_CONTENT	    => NULL,
					       P_RESPONSE_TEXT	    => V_RESPONSE_TEXT,
					       P_HTTP_RSPONS_CODE   => V_RESPONSE_CODE,
					       P_WALLET_PATH	    => G_WALLET_PATH,
					       P_WALLET_PWD	    => G_WALLET_PASS,
					       P_TOKEN		    => null);

	IF V_RESPONSE_CODE = 401 THEN
	    RAISE_APPLICATION_ERROR(-20401, 'Unauthorized!');
	ELSIF V_RESPONSE_CODE NOT IN (200) THEN
	    RAISE_APPLICATION_ERROR(-20001, 'Error when getting version:' || V_RESPONSE_TEXT);
	END IF;
	return V_RESPONSE_TEXT;
    EXCEPTION
	WHEN OTHERS THEN
	    RAISE;
    END GetVersion;
    PROCEDURE GENERATE_PDFA3(P_SRVC_NO		IN	NUMBER,
			     P_DIR		IN	VARCHAR2,
			     P_FILE_NAME	IN	VARCHAR2,
			     P_UUID		IN	VARCHAR2,
			     P_PDFA3_FILE_NAME	OUT	VARCHAR2)
    IS

    V_FILE	    UTL_FILE.FILE_TYPE;
    V_BUFFER	    RAW(32767);
    V_AMOUNT	    BINARY_INTEGER := 32767;
    V_POS	    INTEGER := 1;
    V_BLOB	    BLOB;
    V_DEST_OFFSET   INTEGER := 1;
    V_SRC_OFFSET    INTEGER := 1;
    V_PDFA3_BLOB    BLOB;
    V_DEST_FILE     UTL_FILE.FILE_TYPE;

    BEGIN
	-- INITIALIZE THE BLOB
	DBMS_LOB.CREATETEMPORARY(V_BLOB, TRUE);

	-- OPEN THE FILE IN READ MODE
	V_FILE := UTL_FILE.FOPEN(P_DIR, P_FILE_NAME, 'rb');

	LOOP
	    BEGIN
		-- READ THE FILE INTO THE BUFFER
		UTL_FILE.GET_RAW(V_FILE, V_BUFFER, V_AMOUNT);
		-- WRITE THE BUFFER INTO THE BLOB
		DBMS_LOB.WRITEAPPEND(V_BLOB, UTL_RAW.LENGTH(V_BUFFER), V_BUFFER);
	    EXCEPTION
		WHEN NO_DATA_FOUND THEN
		    EXIT;
	    END;
	END LOOP;

	-- CLOSE THE FILE
	UTL_FILE.FCLOSE(V_FILE);

	INITIALIZE(P_SRVC_NO);
	V_PDFA3_BLOB := GETPDFA3(P_UUID, V_BLOB);

	P_PDFA3_FILE_NAME := SUBSTR(P_FILE_NAME, 0, LENGTH(P_FILE_NAME) - 4) || '-PDFA3.PDF';
	--Write the BLOB content to a new file
	V_DEST_FILE := UTL_FILE.FOPEN(P_DIR, P_PDFA3_FILE_NAME, 'wb');

	V_POS := 1;
	WHILE V_POS <= DBMS_LOB.GETLENGTH(V_PDFA3_BLOB) LOOP
	    DBMS_LOB.READ(V_PDFA3_BLOB, V_AMOUNT, V_POS, V_BUFFER);
	    UTL_FILE.PUT_RAW(V_DEST_FILE, V_BUFFER, TRUE);
	    V_POS := V_POS + V_AMOUNT;
	END LOOP;
	UTL_FILE.FCLOSE(V_DEST_FILE);
	-- FREE TEMPORARY BLOB
	DBMS_LOB.FREETEMPORARY(V_BLOB);
    EXCEPTION WHEN OTHERS THEN
	IF UTL_FILE.IS_OPEN(V_FILE) THEN
	    UTL_FILE.FCLOSE(V_FILE);
	END IF;
	IF UTL_FILE.IS_OPEN(V_DEST_FILE) THEN
	    UTL_FILE.FCLOSE(V_DEST_FILE);
	END IF;
	DBMS_LOB.FREETEMPORARY(V_BLOB);
	RAISE;
    END GENERATE_PDFA3;
--##---------------------------------------------------------------------------------------------------##--
    --## Change document status (if applicable)
    PROCEDURE CHANGEDOCUMENTSTATUS(P_DOC_TYPE	IN     NUMBER,
				   P_DOC_SER	IN     NUMBER,
				   P_SYS_NO	IN     NUMBER DEFAULT 61,
				   P_STATUS	IN     VARCHAR2,
				   P_REASON	IN     VARCHAR2 DEFAULT NULL,
				   P_ERROR	OUT VARCHAR2)
    IS
	V_WHR		  VARCHAR2(4000);
	V_TBL_NM	  VARCHAR2(32);
	V_SLCT_STMNT	  VARCHAR2(1000);
	V_UUID		  VARCHAR2(64);

	V_RESPONSE_TEXT   VARCHAR2(32000);
	V_RESPONSE_CODE   NUMBER;
	V_OBJ		  PLJSON;
	V_LIST		  PLJSON_LIST;
	V_ELEMENT	  PLJSON_ELEMENT;
	V_CLOB		  CLOB;
	V_HASH		  VARCHAR2(64);
	V_ONYX_STATUS	  NUMBER;
	V_MSG		  VARCHAR2(250);
	V_STATUS	  VARCHAR2(20);
    BEGIN

	--getting document detials
	IF P_DOC_TYPE = 4 THEN
	    IF P_SYS_NO IN ( 61 , 67,85 ,70 ) THEN
		V_TBL_NM := 'ias_bill_mst';
		V_WHR := V_TBL_NM || '.bill_ser = ' || P_DOC_SER;
	    ELSIF P_SYS_NO = 80 THEN
		V_TBL_NM := 'ias_pos_bill_mst';
		V_WHR := V_TBL_NM || '.bill_srl = ' || P_DOC_SER;
	    ELSIF P_SYS_NO = 87 THEN
		V_TBL_NM := 'rms_bill_mst';
		V_WHR := V_TBL_NM || '.bill_srl = ' || P_DOC_SER;
	    END IF;
	ELSIF P_DOC_TYPE = 5 THEN
	    IF P_SYS_NO IN ( 61 ,67, 85 ,70 ) THEN
		V_TBL_NM := 'ias_rt_bill_mst';
		V_WHR := V_TBL_NM || '.rt_bill_ser = ' || P_DOC_SER;
	    ELSIF P_SYS_NO = 80 THEN
		V_TBL_NM := 'ias_pos_rt_bill_mst';
		V_WHR := V_TBL_NM || '.rt_bill_srl = ' || P_DOC_SER;
	    ELSIF P_SYS_NO = 87 THEN
		V_TBL_NM := 'rms_rt_bill_mst';
		V_WHR := V_TBL_NM || '.rt_bill_srl = ' || P_DOC_SER;
	    END IF;
	ELSIF P_DOC_TYPE = 15 THEN
	    IF P_SYS_NO IN ( 61 ,67, 85 ,70 ) THEN
		V_TBL_NM := 'IAS_BILL_MST_ADD_DISC';
		V_WHR := V_TBL_NM || '.DOC_SER = ' || P_DOC_SER;
	    END IF;
	ELSIF P_DOC_TYPE = 106 THEN -- Advance Bill
	      V_TBL_NM := 'GLS_BILL_ADVNC';
	      V_WHR := V_TBL_NM || '.DOC_SRL = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 109 THEN -- Advance Return Bill
	      V_TBL_NM := 'GLS_RTRN_BILL_ADVNC';
	      V_WHR := V_TBL_NM || '.DOC_SRL = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 2 THEN -- Receipt Voucher
	      V_TBL_NM := 'VOUCHERS';
	      V_WHR := V_TBL_NM || '.V_SER = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 501 THEN  -- cr --  5
	    V_TBL_NM := 'rem_prmting_priod_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 503 THEN -- dr --  4
	    V_TBL_NM := 'rem_bill_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 504 THEN -- dr --  4
	    V_TBL_NM := 'rem_cntrct_sale_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 513 THEN -- cr --  5
	    V_TBL_NM := 'rem_cntrct_sale_cncl_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 521 THEN -- cr --  5
	     V_TBL_NM := 'rem_rvrs_bill_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 525 THEN -- dr --  4
	    V_TBL_NM := 'rem_bill_rnt_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 526 THEN -- cr --  5
	    V_TBL_NM := 'rem_rvrs_bill_rnt_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 537 THEN -- dr --  4
	    V_TBL_NM := 'rem_bill_comm_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 538 THEN -- cr --  5
	    V_TBL_NM := 'rem_rvrs_bill_comm_mst';
	    V_WHR := V_TBL_NM || '.doc_srl = ' || P_DOC_SER;
	 ELSIF P_DOC_TYPE = 316 THEN -- cr --  5
	    V_TBL_NM := 'PMS_RECEIPT_ENV_MST';
	    V_WHR := V_TBL_NM || '.DOC_SER = ' || P_DOC_SER;
	ELSIF P_DOC_TYPE = 317 THEN -- dr --  4
	    V_TBL_NM := 'PMS_RTRN_RECEIPT_ENV_MST';
	    V_WHR := V_TBL_NM || '.DOC_SER = ' || P_DOC_SER;
       ELSIF P_DOC_TYPE = 1502 THEN -- STN
		V_TBL_NM := 'ias_bill_mst_br';
		V_WHR := V_TBL_NM || '.bill_ser = ' || P_DOC_SER;
	END IF;


	V_SLCT_STMNT := 'SELECT WEB_SRVC_UUID FROM ' || V_TBL_NM || ' WHERE ' || V_WHR;

	EXECUTE IMMEDIATE V_SLCT_STMNT
	    INTO V_UUID;

	IF V_UUID IS NULL THEN
	    RAISE_APPLICATION_ERROR(-20002, 'Document UUID is null. The document has not been posted to Tax yet!.');
	END IF;

	IF NOT ISTOKENVALID(G_USER_TOKEN) THEN
	    LOGIN(G_USERNAME, G_PASSWORD, V_MSG);
	END IF;

	V_STATUS := CASE P_STATUS WHEN 4 THEN 'Rejected' WHEN 5 THEN 'Cancelled' END;

	IAS_WEB_SRVC_PKG.CALL_WEB_SERVICE_CHAR(P_URL		    => G_BASE_URL || '/api/tax/changeDocumentStatus/' || V_UUID ||'?status='||V_STATUS|| CASE WHEN P_REASON IS NOT NULL THEN '&reason='||P_REASON ELSE '' END,
					       P_METHOD 	    => 'GET',
					       P_CONTENT_TYPE	    => 'application/json',
					       P_CONTENT	    => NULL,
					       P_RESPONSE_TEXT	    => V_RESPONSE_TEXT,
					       P_HTTP_RSPONS_CODE   => V_RESPONSE_CODE,
					       P_WALLET_PATH	    => G_WALLET_PATH,
					       P_WALLET_PWD	    => G_WALLET_PASS,
					       P_TOKEN		    => G_USER_TOKEN.GET_STRING('accessToken'));

	--raise_application_error(-20001,v_response_text);
	IF V_RESPONSE_CODE = 401 THEN
	    RAISE_APPLICATION_ERROR(-20401, 'Unauthorized!');
	END IF;

	V_OBJ := PLJSON(V_RESPONSE_TEXT);

	--v_obj.print;
	IF V_RESPONSE_CODE IN (200, 201) AND V_OBJ.GET_NUMBER('code') = 0 THEN
	    RETURN;
	END IF;
	P_ERROR := V_OBJ.GET_STRING('message') || CHR(10) || V_OBJ.GET_STRING('content');
    END CHANGEDOCUMENTSTATUS;
--##---------------------------------------------------------------------------------------------------##--
END GNR_TECH_SOLUTION_PKG;
/
