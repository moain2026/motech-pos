-- PROCEDURE: SYNC_E_INVC_PRC (status: INVALID)
CREATE OR REPLACE
PROCEDURE SYNC_E_INVC_PRC(P_DOC_TYPE	 IN	NUMBER,
					    P_BILL_TYPE    IN	  NUMBER,
					    P_BRN_NO	   IN	  NUMBER,
					    P_DOC_SER	   IN	  NUMBER,
					    P_C_CODE	   IN	  VARCHAR2,
					    P_ERR_TXT	     OUT VARCHAR2,
					    P_WRNNG_TXT      OUT VARCHAR2)
IS
    V_START_DATE     DATE;
    V_END_DATE	     DATE;
    V_USR	     VARCHAR2(30);
    V_ERROR	     VARCHAR2(4000);
    V_STATUS	     NUMBER;
    V_SRVC_NO	     NUMBER;
    V_ETS_SRVC_FLG   NUMBER(1) := 0;
    V_POS_REF_CODE   S_BRN.POS_REF_CODE%TYPE;
    V_CNTRY_CODE     VARCHAR2(30);
    V_USE_ASYNC_MODE NUMBER := (CASE YS_TAX_PKG.GET_TAX_BILL_TYP(P_BILL_TYPE => P_BILL_TYPE, P_C_CODE => P_C_CODE) WHEN 2 THEN 0 ELSE 1 END);
BEGIN

    IF NVL(IAS_BRN_PKG.IS_BRN_USE_E_INVC(P_BRN_NO => P_BRN_NO), 0) = 0 THEN
	RETURN;
    END IF;

    SELECT NVL(POS_REF_CODE, '0')
      INTO V_POS_REF_CODE
      FROM S_BRN
     WHERE BRN_NO = P_BRN_NO;

    BEGIN

	SELECT ETS_SRVC_FLG, SRVC_NO
	  INTO V_ETS_SRVC_FLG, V_SRVC_NO
	  FROM GNR_WEB_SRVC_MST
	 WHERE NVL(ETS_SRVC_FLG, 0) = 1 AND SRVC_NO = V_POS_REF_CODE AND ROWNUM <= 1;
    EXCEPTION
	WHEN OTHERS THEN
	    V_ETS_SRVC_FLG := 0;
    END;

    BEGIN
	V_CNTRY_CODE := IAS_BRN_PKG.GET_BRN_CNTRY_CODE(P_BRN_NO);
    EXCEPTION
	WHEN OTHERS THEN
	    V_CNTRY_CODE := NULL;
    END;

    IF NVL(V_ETS_SRVC_FLG, 0) = 1 AND UPPER(V_CNTRY_CODE) = 'SAU' THEN

	EXECUTE IMMEDIATE 'BEGIN
				GNR_TECH_SOLUTION_PKG.SUBMITDOCUMENT( P_DOC_TYPE	 => ' || P_DOC_TYPE || ' ,
								      P_DOC_SER 	 => ' || P_DOC_SER  || ' ,
								      P_BRN_NO		 => ' || P_BRN_NO   || ' ,
								      P_SYS_NO		 => 80 ,
								      P_SRVC_NO 	 => ' || (CASE WHEN V_SRVC_NO IS NULL THEN 'NULL' ELSE V_SRVC_NO || '' END) || ' ,
								      P_TAX_CONFIG_NO	 => NULL,
								      P_MACHINE_NO	 => NULL,
								      P_USE_ASYNC_MODE	 => ' || V_USE_ASYNC_MODE || ',
								      P_ERROR		 => :V_ERROR ,
								      P_STATUS		 => :V_STATUS );
	END ; ' USING OUT V_ERROR,OUT V_STATUS;

	IF V_STATUS IN ( 1 , 2 )  THEN --Bill posted successfully
	    IF V_ERROR IS NOT NULL  THEN
	       P_WRNNG_TXT := 'Invoice Status : ' || V_STATUS || CHR(13) || 'WARNING : ' || V_ERROR;
	    END IF;
	ELSE
	    --Bill posted unsuccessfully,parameter v_status will show the state in which the invoice is, parameter 'V_ERROR' will contain error detail
	    P_ERR_TXT := 'Invoice Status : ' || V_STATUS || CHR(13) || 'ERROR : ' || V_ERROR;
	END IF;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
	RAISE_APPLICATION_ERROR(-20005, 'Err In Sync_E_Invc_Prc  ' || CHR(10) || SQLERRM);
END SYNC_E_INVC_PRC;
/
