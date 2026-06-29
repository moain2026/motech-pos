-- =============================================
-- PACKAGE SPEC: POS_GNR_PKG  (status: INVALID)
-- =============================================
CREATE OR REPLACE
PACKAGE POS_GNR_PKG as
 TYPE ITM_RCRD IS RECORD ( I_CODE	      IAS_ITM_MST.I_CODE%TYPE,
			    ITM_NM	       IAS_ITM_MST.I_NAME%TYPE,
			    ITM_SLCT_FLG       NUMBER (1)
			  );
  TYPE ITM_TBL_TCH IS TABLE OF ITM_RCRD INDEX BY BINARY_INTEGER;
--##---------------------------------------------------------------------------------------------------------------------------------------##--
  PROCEDURE GET_ITMS_GRP_PRC ( P_ITM_TBL	IN OUT	 ITM_TBL_TCH,
			       P_LNG_NO 	IN	 NUMBER DEFAULT 1,
			       P_GRP_TYP_NM	IN	 VARCHAR2,
			       P_GRP_CODE	IN	 VARCHAR2,
			       P_PRICE_LVL	IN	 IAS_ITEM_PRICE.LEV_NO%TYPE,
			       P_ITMS		IN	 VARCHAR2);
--##---------------------------------------------------------------------------------------------------------------------------------------##--
 Function GET_SRVR_NO_FNC(P_HST_NM VARCHAR DEFAULT NULL) Return Number;
--##---------------------------------------------------------------------------------------------------------------------------------------##--
PROCEDURE INSRT_INSTAL_CMPNY_PRC(P_CMP_TYP		 IN NUMBER,
			       P_MOBILE_NO	       IN VARCHAR2,
			       P_ORDERID	       IN VARCHAR2,
			       P_CHECKOUTID	       IN VARCHAR2,
			       P_BILL_AMT	       IN NUMBER,
			       P_STATUS 	       IN VARCHAR2 DEFAULT NULL,
			       P_Bill_Ser	       In Number Default Null,
			       P_DOC_M_SQ	       In Number Default Null,
			       P_U_Id		       In User_r.U_ID%type,
			       P_Date		       In Date,
			       P_Brn_No 	       In Number,
			       P_CUR_CODE	       In EX_RATE.CUR_CODE%Type,
			       P_Qr_Code	       In Varchar2 Default Null,
			       P_TYP		       In CHAR	     DEFAULT 'I'
			      ) ;
--##---------------------------------------------------------------------------------------------------------------------------------------##--
Function GET_USD_WRK_SHFT_FNC(P_MCHN_NO IN NUMBER) Return Number;
--##---------------------------------------------------------------------------------------------------------------------------------------##--
Function CHK_WRK_SHFT_CSHR_FNC(P_CSHR_NO IN NUMBER) Return Number;
--##---------------------------------------------------------------------------------------------------------------------------------------##--
Function GET_WRK_SHFT_OPN_FNC(P_CSHR_NO IN NUMBER) Return Number;
--##---------------------------------------------------------------------------------------------------------------------------------------##--
PROCEDURE GET_BILL_NO_PRC(P_YR_NO	     IN    NUMBER,
			  P_AD_USR_NO	     IN    NUMBER,
			  P_MCHN_NO	     IN    IAS_POS_BILL_MST.MACHINE_NO%TYPE,
			  P_SRVR_NO	     IN    IAS_POS_BILL_MST.SRVR_NO%TYPE,
			  P_UPD_MCHN_FLG     IN    NUMBER,
			  P_BILL_NO	     IN OUT IAS_POS_BILL_MST.BILL_NO%TYPE,
			  P_BILL_SRL	     IN OUT IAS_POS_BILL_MST.BILL_SRL%TYPE,
			  P_DOC_MCHN_SQ      IN OUT IAS_POS_BILL_MST.DOC_MCHN_SQ%TYPE  );
--##---------------------------------------------------------------------------------------------------------------------------------------##--
PROCEDURE GET_RT_BILL_NO_PRC(P_YR_NO	     IN    NUMBER,
			  P_AD_USR_NO	     IN    NUMBER,
			  P_MCHN_NO	     IN    IAS_POS_RT_BILL_MST.MACHINE_NO%TYPE,
			  P_SRVR_NO	     IN    IAS_POS_RT_BILL_MST.SRVR_NO%TYPE,
			  P_UPD_MCHN_FLG     IN    NUMBER,
			  P_RT_BILL_NO	     IN OUT IAS_POS_RT_BILL_MST.RT_BILL_NO%TYPE,
			  P_RT_BILL_SRL      IN OUT IAS_POS_RT_BILL_MST.RT_BILL_SRL%TYPE,
			  P_DOC_MCHN_SQ      IN OUT IAS_POS_RT_BILL_MST.DOC_MCHN_SQ%TYPE  );
--##---------------------------------------------------------------------------------------------------------------------------------------##--
PROCEDURE GET_DATE_INCRS_DCRS_PRC(P_BILL_DATE  IN OUT IAS_POS_BILL_MST.BILL_DATE%TYPE,
				  P_BILL_TIME  IN OUT IAS_POS_BILL_MST.BILL_TIME%TYPE);
--##---------------------------------------------------------------------------------------------------------------------------------------##--
 PROCEDURE EXECUTE_PRGMA_PRC(P_SQL VARCHAR2);
--##---------------------------------------------------------------------------------------------------------------------------------------##--
 PROCEDURE ADD_SQL_QUEUE_TSK_PRC(P_DOC_SRL	    NUMBER,
				 P_SQL_STMNT	    VARCHAR2,
				 P_EXEC_TIME	    DATE DEFAULT NULL,
				 P_FAILURE_DLT_FLG  NUMBER DEFAULT 0,
				 P_ALLWD_RTRY_CNT   NUMBER DEFAULT 3);
--##---------------------------------------------------------------------------------------------------------------------------------------##--
 PROCEDURE EXEC_SQL_QUEUE_TSK_PRC;
 --##---------------------------------------------------------------------------------------------------------------------------------------##--
 FUNCTION CHK_MAIN_SRVR_CNCT_FNC(P_DB_LNK VARCHAR2) RETURN NUMBER;
 --##---------------------------------------------------------------------------------------------------------------------------------------##--
END POS_GNR_PKG;
/

-- ---------------------------------------------
-- PACKAGE BODY: POS_GNR_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE BODY POS_GNR_PKG AS
--##---------------------------------------------------------------------------------------------------------------------------------------##--
 PROCEDURE GET_ITMS_GRP_PRC ( P_ITM_TBL 	IN OUT	 ITM_TBL_TCH,
			      P_LNG_NO		IN	 NUMBER DEFAULT 1,
			      P_GRP_TYP_NM	IN	 VARCHAR2,
			      P_GRP_CODE	IN	 VARCHAR2,
			      P_PRICE_LVL	IN	 IAS_ITEM_PRICE.LEV_NO%TYPE,
			      P_ITMS		IN	 VARCHAR2) IS
   V_SQL_STMNT	 CLOB
	:='SELECT M.I_CODE,
		    DECODE('||P_LNG_NO||',1,M.I_NAME,NVL(M.I_E_NAME,M.I_NAME)) ITM_NM,
		    NVL((SELECT 1 FROM DUAL WHERE (M.I_CODE||D.ITM_UNT) IN ('
			|| P_ITMS
			|| ')),0) ITM_SLCT_FLG
	     FROM IAS_ITM_MST M,IAS_ITM_DTL D
	      WHERE M.I_CODE=D.I_CODE
		AND '||P_GRP_TYP_NM||' = '''||P_GRP_CODE||'''
		AND D.MAIN_UNIT=1
		AND NVL(M.INACTIVE,0)=0
		AND EXISTS (SELECT 1 FROM IAS_ITEM_PRICE C WHERE C.I_CODE=M.I_CODE AND C.LEV_NO='||P_PRICE_LVL||' )
		   ORDER BY M.I_CODE';
 BEGIN
	  EXECUTE IMMEDIATE V_SQL_STMNT
	  BULK COLLECT INTO P_ITM_TBL;
 EXCEPTION
      WHEN NO_DATA_FOUND THEN
		NULL;
      WHEN OTHERS THEN
	    RAISE_APPLICATION_ERROR (-20001, 'ERROR WHEN POS_GNR_PKG.GET_ITMS_GRP : ' || V_SQL_STMNT || CHR ( 13) || SQLERRM, TRUE);
END GET_ITMS_GRP_PRC;
--##-----------------------------------------------------------------------------------------------------------##--
Function GET_SRVR_NO_FNC(P_HST_NM VARCHAR DEFAULT NULL) Return Number Is
  V_server_no  Ias_pos_server_db_link.Server_no%Type;
  V_hst_nm     Varchar2(200);
Begin
   If P_HST_NM Is Null Then
       BEGIN
	 SELECT HOST_NAME INTO V_HST_NM FROM V$INSTANCE WHERE UPPER(STATUS)=UPPER('OPEN');
       EXCEPTION WHEN OTHERS THEN
	   V_HST_NM:='';
       END;
   Else
      V_HST_NM:=P_HST_NM;
   End If;
    If V_HST_NM Is Not Null Then
      Begin
	 Select Server_No Into V_Server_No
	       FROM IAS_POS_SERVER_DB_LINK
		  WHERE UPPER(SERVER_NM)=V_HST_NM;
      Exception When Others Then
	V_Server_No:='';
       End;
     End If;
   Return(V_Server_No);
End GET_SRVR_NO_FNC;
--##-----------------------------------------------------------------------------------------------------------##--
PROCEDURE INSRT_INSTAL_CMPNY_PRC(P_CMP_TYP		 IN NUMBER,
					     P_MOBILE_NO	     IN VARCHAR2,
					     P_ORDERID		     IN VARCHAR2,
					     P_CHECKOUTID	     IN VARCHAR2,
					     P_BILL_AMT 	     IN NUMBER,
					     P_STATUS		     IN VARCHAR2 DEFAULT NULL,
					     P_Bill_Ser 	     In Number Default Null,
					     P_DOC_M_SQ 	     In Number Default Null,
					     P_U_Id		     In User_r.U_ID%type,
					     P_Date		     In Date,
					     P_Brn_No		     In Number,
				 P_CUR_CODE		 In EX_RATE.CUR_CODE%Type,
				 P_Qr_Code		 In Varchar2 Default Null,
					     P_TYP		     In CHAR	   DEFAULT 'I'
					      )
Is
 PRAGMA AUTONOMOUS_TRANSACTION;
Begin
   If Nvl(P_TYP,'I') = 'I' Then
       BEGIN
	   Insert Into POS_INSTLMNT_CMPNY (Cmp_Typ, Mobile_No, Orderid, Checkoutid, Bill_Amt,DOC_M_SQ, Status,Bill_Ser,Ad_Date,Ad_U_Id,Brn_No,CUR_CODE,QR_CODE)
	     Values (P_CMP_TYP,P_MOBILE_NO,P_ORDERID,P_CHECKOUTID,P_BILL_AMT,P_DOC_M_SQ,P_STATUS,P_Bill_Ser,P_Date,P_U_Id,P_Brn_No,P_Cur_Code,P_QR_CODE);
       Exception When Others Then
	 ROLLBACK;
	 Raise_application_error(-20664,'Error When Insert Into POS_INSTLMNT_CMPNY '||' ,'||SqlErrm) ;
       End;
   ElsIf Nvl(P_TYP,'I') = 'U' Then
	 If P_Bill_Ser Is Null Then
	     BEGIN
		 Update POS_INSTLMNT_CMPNY Set Status = P_Status,Up_Date=P_Date ,UP_U_Id=P_U_Id
			Where MOBILE_NO  = P_MOBILE_NO
			  And BILL_AMT	 = P_BILL_AMT
			  And Orderid	 = P_ORDERID
			  And Checkoutid = P_CHECKOUTID
			  And Cmp_Typ	 = P_CMP_TYP;
	     Exception When Others Then
	       ROLLBACK;
	       Raise_application_error(-20666,'Error When Update  POS_INSTLMNT_CMPNY '||' ,'||SqlErrm) ;
	     End;
	 Else
	     BEGIN
		 Update POS_INSTLMNT_CMPNY Set Status = P_Status,Bill_Ser=P_Bill_Ser ,Up_Date=P_Date ,UP_U_Id=P_U_Id
			Where MOBILE_NO  = P_MOBILE_NO
			  And BILL_AMT	 = P_BILL_AMT
			  And Orderid	 = P_ORDERID
			  And Checkoutid = P_CHECKOUTID
			  And Cmp_Typ	 = P_CMP_TYP;
	     Exception When Others Then
	       ROLLBACK;
	       Raise_application_error(-20666,'Error When Update  POS_INSTLMNT_CMPNY '||' ,'||SqlErrm) ;
	     End;
	 End IF;

   End If;
   COMMIT;
EXCEPTION
	WHEN OTHERS  THEN
	ROLLBACK;
	RAISE_APPLICATION_ERROR (-20667,'Err. In Insrt POS_INSTLMNT_CMPNY : ' || CHR (13) || SQLERRM, TRUE);
End INSRT_INSTAL_CMPNY_PRC;
--##-----------------------------------------------------------------------------------------------------------##--
Function GET_USD_WRK_SHFT_FNC(P_MCHN_NO IN NUMBER) Return Number IS
 V_USE_WRK_SHFT NUMBER;
Begin
    BEGIN
       SELECT  USE_WRK_SHFT INTO V_USE_WRK_SHFT FROM IAS_PARA_POS;
    Exception When Others Then
	 V_USE_WRK_SHFT:=1;
    End;
   If Nvl(V_USE_WRK_SHFT,1)=1 Then
	Begin --## PARAMETR FOR use work shift
	    Select Stng_mchn_val into V_USE_WRK_SHFT
	     From POS_DFLT_STNG_DTL
	      Where STNG_NO=8 And Machine_no=P_MCHN_NO And Rownum<=1;
	Exception When Others Then
	  Begin
	     Select Stng_val into V_USE_WRK_SHFT
	     From POS_DFLT_STNG_MST
	      Where STNG_NO=8 And Rownum<=1;
	  Exception When Others Then
	       V_USE_WRK_SHFT:=1;
	  End;
	 End;
    End If;
    RETURN(V_USE_WRK_SHFT);
 Exception When Others Then
    RETURN(1);
End GET_USD_WRK_SHFT_FNC;
--##-----------------------------------------------------------------------------------------------------------##--
Function CHK_WRK_SHFT_CSHR_FNC(P_CSHR_NO IN NUMBER) Return Number IS
  V_HV_WRK_SHFT NUMBER;
BEGIN
    BEGIN
       SELECT  COUNT(1) INTO V_HV_WRK_SHFT FROM POS_WRK_SHFT_CSHR WHERE CSHR_NO=P_CSHR_NO AND CLS_DATE IS NULL ;
    EXCEPTION  WHEN OTHERS THEN
	V_HV_WRK_SHFT:=0;
    END;
  RETURN(V_HV_WRK_SHFT);
EXCEPTION WHEN OTHERS THEN
    RETURN(0);
END CHK_WRK_SHFT_CSHR_FNC;
--##-----------------------------------------------------------------------------------------------------------##--
Function GET_WRK_SHFT_OPN_FNC(P_CSHR_NO IN NUMBER) Return Number Is
V_SHFT_SRL POS_WRK_SHFT_CSHR.SHFT_SRL%TYPE;
 V_CNT	    NUMBER;

 V_F_DATE  POS_WRK_SHFT_CSHR.F_DATE%TYPE;
 V_T_DATE  POS_WRK_SHFT_CSHR.T_DATE%TYPE;
 V_F_TIME  POS_WRK_SHFT_CSHR.F_TIME%TYPE;
 V_T_TIME  POS_WRK_SHFT_CSHR.T_TIME%TYPE;
 V_INTRFRNC_FLG  NUMBER;
 G_WRK_SHFT_TYP  NUMBER;
BEGIN
  SELECT  MIN(SHFT_SRL) INTO V_SHFT_SRL FROM POS_WRK_SHFT_CSHR WHERE CSHR_NO=P_CSHR_NO AND CLS_DATE IS NULL;
  IF V_SHFT_SRL IS NOT NULL THEN
       BEGIN
	SELECT COUNT(1) INTO V_CNT FROM IAS_DEPOSIT_CURRENCY_MST WHERE SHFT_SRL=V_SHFT_SRL And Rownum<=1;
       EXCEPTION  WHEN OTHERS THEN
	V_CNT:=0;
       END;
       IF NVL(V_CNT,0)>0 THEN
	  V_SHFT_SRL:='';
       END IF;
      IF V_SHFT_SRL IS NOT NULL AND NVL(G_WRK_SHFT_TYP,0)=1 THEN
	   BEGIN
	    SELECT F_DATE,
		   T_DATE,
		   NVL(F_TIME,0),
		   NVL(T_TIME,0),
		   INTRFRNC_FLG
	      INTO V_F_DATE,
		   V_T_DATE,
		   V_F_TIME,
		   V_T_TIME,
		   V_INTRFRNC_FLG
	      FROM POS_WRK_SHFT_CSHR
	     WHERE CSHR_NO	  = P_CSHR_NO
	       AND SHFT_SRL	  = V_SHFT_SRL
	       AND NVL(CLS_FLG,0) = 0
	       AND ROWNUM<=1 ;
	EXCEPTION
	    WHEN TOO_MANY_ROWS THEN
		  V_SHFT_SRL:='';
	    WHEN OTHERS THEN
		 V_SHFT_SRL:='';
	END ;
	IF V_SHFT_SRL IS NOT NULL THEN
	    IF	SYSDATE <  TO_DATE(TO_CHAR(V_F_DATE,'DD/MM/YYYY'),'DD/MM/YYYY') + (NVL(V_F_TIME, 0)/ 86400) THEN
		  V_SHFT_SRL:='';
	    ELSIF  SYSDATE >  TO_DATE(TO_CHAR(V_T_DATE,'DD/MM/YYYY'),'DD/MM/YYYY') + ((NVL(V_T_TIME,0))/ 86400) THEN
		  V_SHFT_SRL:='';
	    END IF;
	END IF;
      END IF;
   END IF;
   RETURN (V_SHFT_SRL);
EXCEPTION  WHEN OTHERS THEN
  RETURN (NULL);
End GET_WRK_SHFT_OPN_FNC;
--##-----------------------------------------------------------------------------------------------------------##--
PROCEDURE GET_BILL_NO_PRC(P_YR_NO	     IN    NUMBER,
			  P_AD_USR_NO	     IN    NUMBER,
			  P_MCHN_NO	     IN    IAS_POS_BILL_MST.MACHINE_NO%TYPE,
			  P_SRVR_NO	     IN    IAS_POS_BILL_MST.SRVR_NO%TYPE,
			  P_UPD_MCHN_FLG     IN    NUMBER,
			  P_BILL_NO	     IN OUT IAS_POS_BILL_MST.BILL_NO%TYPE,
			  P_BILL_SRL	     IN OUT IAS_POS_BILL_MST.BILL_SRL%TYPE,
			  P_DOC_MCHN_SQ      IN OUT IAS_POS_BILL_MST.DOC_MCHN_SQ%TYPE  ) IS
  V_POS_BILL_SERIAL NUMBER;
  V_USER_DIGIT	    NUMBER;
  V_MACHINE_DIGIT   NUMBER;
  V_SERIAL_DIGIT    NUMBER;
Begin
     BEGIN
	SELECT POS_BILL_SERIAL,USER_DIGIT,MACHINE_DIGIT,SERIAL_DIGIT
	  INTO V_POS_BILL_SERIAL,V_USER_DIGIT,V_MACHINE_DIGIT,V_SERIAL_DIGIT
	FROM IAS_PARA_POS;
     EXCEPTION WHEN OTHERS THEN
	 NULL;
     END;
 If V_POS_BILL_SERIAL=1 Then
   Select Substr(P_YR_NO,3,2)||P_SRVR_NO||Lpad(Machine_no,V_MACHINE_DIGIT,0)||P_AD_USR_NO||Lpad(Nvl(SALE_SER,0)+1,V_SERIAL_DIGIT,0)
	  ,Nvl(Sale_ser,0)+1
	 Into P_BILL_NO,P_DOC_MCHN_SQ
	   From Ias_pos_machine
	    Where Machine_no = P_MCHN_NO;
 Else
    Select Substr(P_YR_NO,3,2)||P_SRVR_NO||Lpad(Machine_no,V_MACHINE_DIGIT,0)||Lpad(Nvl(Sale_ser,0)+1,V_SERIAL_DIGIT,0)
	   ,Nvl(Sale_ser,0)+1
     Into P_BILL_NO,P_DOC_MCHN_SQ
       From ias_pos_machine
	Where Machine_no = P_MCHN_NO ;
 End If;
 P_BILL_SRL:=Substr(P_YR_NO,3,2)||'01'||Lpad(P_SRVR_NO,3, 0)||Lpad(P_MCHN_NO, 5, 0)||Nvl(P_DOC_MCHN_SQ,0);
 IF NVL(P_UPD_MCHN_FLG,0)=1 THEN
	BEGIN
	  UPDATE IAS_POS_MACHINE  SET SALE_SER=P_DOC_MCHN_SQ WHERE MACHINE_NO = P_MCHN_NO ;
	EXCEPTION WHEN OTHERS THEN
	     RAISE_APPLICATION_ERROR (-20022, 'ERROR WHEN UPDATE LAST SALE SER FROM MACHINE NO = '||P_MCHN_NO|| CHR ( 13) || SQLERRM, TRUE);
	 END;
     END IF;
EXCEPTION WHEN OTHERS THEN
	  RAISE_APPLICATION_ERROR (-20020, 'ERROR WHEN GET LAST BILL_NO FROM MACHINE NO = '||P_MCHN_NO|| CHR ( 13) || SQLERRM, TRUE);
End GET_BILL_NO_PRC;
--##-----------------------------------------------------------------------------------------------------------##--
PROCEDURE GET_RT_BILL_NO_PRC(P_YR_NO		IN    NUMBER,
			  P_AD_USR_NO	     IN    NUMBER,
			  P_MCHN_NO	     IN    IAS_POS_RT_BILL_MST.MACHINE_NO%TYPE,
			  P_SRVR_NO	     IN    IAS_POS_RT_BILL_MST.SRVR_NO%TYPE,
			  P_UPD_MCHN_FLG     IN    NUMBER,
			  P_RT_BILL_NO	     IN OUT IAS_POS_RT_BILL_MST.RT_BILL_NO%TYPE,
			  P_RT_BILL_SRL      IN OUT IAS_POS_RT_BILL_MST.RT_BILL_SRL%TYPE,
			  P_DOC_MCHN_SQ      IN OUT IAS_POS_RT_BILL_MST.DOC_MCHN_SQ%TYPE  ) IS
  V_POS_BILL_SERIAL NUMBER;
  V_USER_DIGIT	    NUMBER;
  V_MACHINE_DIGIT   NUMBER;
  V_SERIAL_DIGIT    NUMBER;
  V_DOC_TYP	    VARCHAR2(5) ;
Begin
     BEGIN
	SELECT POS_BILL_SERIAL,USER_DIGIT,MACHINE_DIGIT,SERIAL_DIGIT
	  INTO V_POS_BILL_SERIAL,V_USER_DIGIT,V_MACHINE_DIGIT,V_SERIAL_DIGIT
	FROM IAS_PARA_POS;
     EXCEPTION WHEN OTHERS THEN
	 NULL;
     END;
  V_DOC_TYP:='02';
 If V_POS_BILL_SERIAL=1 Then
   Select Substr(P_YR_NO,3,2)||V_DOC_TYP||P_SRVR_NO||Lpad(Machine_no,V_MACHINE_DIGIT,0)||P_AD_USR_NO||Lpad(Nvl(Rt_sale_ser,0)+1,V_SERIAL_DIGIT,0)
	  ,Nvl(RT_SALE_SER,0)+1
	 Into P_RT_BILL_NO,P_DOC_MCHN_SQ
	   From Ias_pos_machine
	    Where Machine_no = P_MCHN_NO;
 Else
    Select Substr(P_YR_NO,3,2)||V_DOC_TYP||P_SRVR_NO||Lpad(Machine_no,V_MACHINE_DIGIT,0)||Lpad(Nvl(Rt_sale_ser,0)+1,V_SERIAL_DIGIT,0)
	   ,Nvl(RT_SALE_SER,0)+1
     Into P_RT_BILL_NO,P_DOC_MCHN_SQ
       From Ias_pos_machine
	Where Machine_no = P_MCHN_NO ;
 End If;
 P_RT_BILL_SRL:=Substr(P_YR_NO,3,2)||'02'||Lpad(P_SRVR_NO,3, 0)||Lpad(P_MCHN_NO, 5, 0)||Nvl(P_DOC_MCHN_SQ,0);
  IF NVL(P_UPD_MCHN_FLG,0)=1 THEN
	BEGIN
	  UPDATE IAS_POS_MACHINE  SET RT_SALE_SER=P_DOC_MCHN_SQ WHERE MACHINE_NO = P_MCHN_NO ;
	EXCEPTION WHEN OTHERS THEN
	     RAISE_APPLICATION_ERROR (-20025, 'ERROR WHEN UPDATE LAST RT SALE SER FROM MACHINE NO = '||P_MCHN_NO|| CHR ( 13) || SQLERRM, TRUE);
	 END;
  END IF;
EXCEPTION WHEN OTHERS THEN
   RAISE_APPLICATION_ERROR (-20026, 'ERROR WHEN GET LAST RT BILL_NO FROM MACHINE NO = '||P_MCHN_NO|| CHR ( 13) || SQLERRM, TRUE);
End GET_RT_BILL_NO_PRC;
--##-----------------------------------------------------------------------------------------------------------##--
PROCEDURE GET_DATE_INCRS_DCRS_PRC(P_BILL_DATE  IN OUT IAS_POS_BILL_MST.BILL_DATE%TYPE,
				  P_BILL_TIME  IN OUT IAS_POS_BILL_MST.BILL_TIME%TYPE)
   IS
      V_PRD_BACK_HOUR		IAS_PARA_POS.PRD_BACK_HOUR%TYPE;
      V_PRD_BACK_INCRS_F_DATE	IAS_PARA_POS.PRD_BACK_INCRS_F_DATE%TYPE;
      V_PRD_BACK_INCRS_T_DATE	IAS_PARA_POS.PRD_BACK_INCRS_T_DATE%TYPE;
      V_PRD_BACK_INCRS_TYP	IAS_PARA_POS.PRD_BACK_INCRS_TYP%TYPE;
      V_HOUR			NUMBER;
   BEGIN
      BEGIN
	 SELECT NVL (PRD_BACK_HOUR, 0),
		PRD_BACK_INCRS_F_DATE,
		PRD_BACK_INCRS_T_DATE,
		NVL (PRD_BACK_INCRS_TYP, 0)
	   INTO V_PRD_BACK_HOUR,
		V_PRD_BACK_INCRS_F_DATE,
		V_PRD_BACK_INCRS_T_DATE,
		V_PRD_BACK_INCRS_TYP
	   FROM IAS_PARA_POS;
      EXCEPTION
	 WHEN OTHERS
	 THEN
	    RAISE_APPLICATION_ERROR (-20201,
					' ERR WHEN READ PARAMETER FROM PARA_POS '
				     || SQLERRM
				    );
      END;

      IF V_PRD_BACK_HOUR IS NOT NULL
      THEN
	 IF    (    V_PRD_BACK_INCRS_F_DATE IS NULL
		AND V_PRD_BACK_INCRS_T_DATE IS NULL
	       )
	    OR TO_DATE (IAS_GEN_PKG.GET_CURDATE, 'DD/MM/RRRR')
		  BETWEEN TO_DATE (V_PRD_BACK_INCRS_F_DATE, 'DD/MM/RRRR')
		      AND TO_DATE (V_PRD_BACK_INCRS_T_DATE, 'DD/MM/RRRR')
	 THEN
	    V_HOUR := TO_CHAR (IAS_GEN_PKG.GET_CURDATE, 'HH24');

	    IF V_PRD_BACK_INCRS_TYP = 1
	    THEN
	       IF 24 - V_HOUR <= V_PRD_BACK_HOUR
	       THEN
		  P_BILL_DATE := TO_DATE (TO_CHAR (IAS_GEN_PKG.GET_CURDATE,'DD/MM/YYYY')) + 1;
		  P_BILL_TIME := '00:00:00';
	       ELSE
		  P_BILL_DATE := TO_CHAR (IAS_GEN_PKG.GET_CURDATE, 'DD/MM/YYYY');
		  P_BILL_TIME := TO_CHAR (IAS_GEN_PKG.GET_CURDATE, 'HH24:MI:SS');
	       END IF;
	    ELSE
	       IF V_PRD_BACK_HOUR > V_HOUR
	       THEN
		  P_BILL_DATE := TO_DATE (TO_CHAR (IAS_GEN_PKG.GET_CURDATE, 'DD/MM/YYYY')) - 1;
		  P_BILL_TIME := '23:59:59';
	       ELSE
		  P_BILL_DATE := TO_CHAR (IAS_GEN_PKG.GET_CURDATE, 'DD/MM/YYYY');
		  P_BILL_TIME := TO_CHAR (IAS_GEN_PKG.GET_CURDATE, 'HH24:MI:SS');
	       END IF;
	    END IF;
	 END IF;
      END IF;

      P_BILL_DATE := NVL(P_BILL_DATE,TO_CHAR (IAS_GEN_PKG.GET_CURDATE, 'DD/MM/YYYY'));
      P_BILL_TIME := NVL(P_BILL_TIME,TO_CHAR (IAS_GEN_PKG.GET_CURDATE, 'HH24:MI:SS'));
   END GET_DATE_INCRS_DCRS_PRC;
--##-----------------------------------------------------------------------------------------------------------##--
PROCEDURE EXECUTE_PRGMA_PRC(P_SQL VARCHAR2)
    IS
	PRAGMA AUTONOMOUS_TRANSACTION;
    BEGIN

	EXECUTE IMMEDIATE P_SQL;
	COMMIT;

    EXCEPTION
	WHEN OTHERS THEN
	    ROLLBACK;

	    RAISE_APPLICATION_ERROR(
	     -20605,
	     'ERROR WHEN EXECUTE_PRGMA_PRC : '||CHR(13)||P_SQL|| CHR(13) || SQLERRM,
	     TRUE
	  );
    END EXECUTE_PRGMA_PRC;
    --##-----------------------------------------------------------------------------------------------------------##--
    PROCEDURE ADD_SQL_QUEUE_TSK_PRC(P_DOC_SRL	       NUMBER,
				    P_SQL_STMNT        VARCHAR2,
				    P_EXEC_TIME        DATE DEFAULT NULL,
				    P_FAILURE_DLT_FLG  NUMBER DEFAULT 0,
				    P_ALLWD_RTRY_CNT   NUMBER DEFAULT 3)
    IS
    BEGIN
	EXECUTE_PRGMA_PRC('INSERT INTO POS_SQL_QUEUE(DOC_SRL, SQL_STMNT, EXEC_TIME, AD_DATE,FAILURE_DLT_FLG,ALLWD_RTRY_CNT)
				VALUES ('||P_DOC_SRL||', '''||REPLACE(P_SQL_STMNT,'''','''''')||''', '||TO_CHAR(NVL(P_EXEC_TIME,SYSDATE),'YYYYMMDDHH24MISS')||', SYSDATE,'||NVL(P_FAILURE_DLT_FLG,0)||','||NVL(P_ALLWD_RTRY_CNT,3)||')');

	BEGIN
	    DBMS_SCHEDULER.ENABLE(NAME => 'POS23_SQL_QUEUE_JOB');
	EXCEPTION
	    WHEN OTHERS
	    THEN NULL;
	END;

    EXCEPTION
	WHEN OTHERS THEN
	    NULL;
    END ADD_SQL_QUEUE_TSK_PRC;
   --##-----------------------------------------------------------------------------------------------------------##--
    PROCEDURE EXEC_SQL_QUEUE_TSK_PRC
    IS
	V_CNT NUMBER := 0;
	V_EXEC_TIME NUMBER := TO_CHAR(SYSDATE,'YYYYMMDDHH24MISS');
    BEGIN
	FOR EXEC_CRSR IN (SELECT ROWID,SQL_STMNT,DOC_SRL,NVL(FAILURE_DLT_FLG,0) FAILURE_DLT_FLG,NVL(ALLWD_RTRY_CNT,3) ALLWD_RTRY_CNT,NVL(RTRY_CNT,0) RTRY_CNT
			    FROM POS_SQL_QUEUE
			   WHERE EXEC_TIME <= V_EXEC_TIME
			     AND NVL(RTRY_CNT,0) < NVL(ALLWD_RTRY_CNT,3)
			 )
	LOOP

	    BEGIN
		EXECUTE_PRGMA_PRC(EXEC_CRSR.SQL_STMNT);
		EXECUTE_PRGMA_PRC('DELETE FROM POS_SQL_QUEUE WHERE ROWID = '''||EXEC_CRSR.ROWID||'''');
	    EXCEPTION
		WHEN OTHERS THEN
		    BEGIN
			IF EXEC_CRSR.RTRY_CNT + 1 >= EXEC_CRSR.ALLWD_RTRY_CNT AND EXEC_CRSR.FAILURE_DLT_FLG = 1 THEN
			    EXECUTE_PRGMA_PRC('DELETE FROM POS_SQL_QUEUE WHERE ROWID = '''||EXEC_CRSR.ROWID||'''');
			ELSE
			    EXECUTE_PRGMA_PRC('UPDATE POS_SQL_QUEUE SET RTRY_CNT = NVL(RTRY_CNT,0) + 1 WHERE ROWID = '''||EXEC_CRSR.ROWID||'''');
			END IF;
		    EXCEPTION
			WHEN OTHERS THEN
			    NULL;
		    END;
	    END;

	END LOOP;

	BEGIN
	    SELECT 1
	      INTO V_CNT
	      FROM POS_SQL_QUEUE
	     WHERE NVL(RTRY_CNT,0) < NVL(ALLWD_RTRY_CNT,3);

	EXCEPTION
	    WHEN NO_DATA_FOUND THEN
		DBMS_SCHEDULER.DISABLE(NAME => 'POS23_SQL_QUEUE_JOB',FORCE => TRUE);
	    WHEN OTHERS THEN
		NULL;
	END;

    EXCEPTION
	WHEN OTHERS THEN
	    NULL;
    END EXEC_SQL_QUEUE_TSK_PRC;
--##-----------------------------------------------------------------------------------------------------------##--
   FUNCTION CHK_MAIN_SRVR_CNCT_FNC(P_DB_LNK VARCHAR2) RETURN NUMBER IS
	V_CNT NUMBER;
   BEGIN
	EXECUTE IMMEDIATE 'SELECT 1 FROM DUAL@' || P_DB_LNK INTO V_CNT;

	RETURN V_CNT;
   EXCEPTION
	WHEN NO_DATA_FOUND THEN
	    RETURN 1;
	WHEN OTHERS THEN
	    RETURN 0;
   END CHK_MAIN_SRVR_CNCT_FNC;
--##-----------------------------------------------------------------------------------------------------------##--
END POS_GNR_PKG;
/
