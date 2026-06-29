-- =============================================
-- PACKAGE SPEC: YS_TAX_PKG  (status: INVALID)
-- =============================================
CREATE OR REPLACE
PACKAGE YS_TAX_PKG as
								 FUNCTION GET_TAX_NM ( P_TAX_NO IN GNR_TAX_CODE_MST.TAX_NO%TYPE ,
										       P_LNG_NO IN NUMBER		       ) RETURN GNR_TAX_CODE_MST.TAX_L_NM%TYPE ;
								 FUNCTION GET_TAX_AGNCY_NM ( P_TAX_NO	IN GNR_TAX_CODE_MST.TAX_NO%TYPE ,
											     P_AGNCY_NO IN GNR_TAX_CODE_DTL.AGNCY_NO%TYPE ,
											     P_LNG_NO	IN NUMBER		       ) RETURN GNR_TAX_CODE_DTL.AGNCY_L_NM%TYPE ;
								 ----------------------------------------------------------------------------------------------------------------
								 FUNCTION GET_CLC_TAX_NM ( P_CLC_TYP_NO  IN GNR_TAX_TYP_CLC_MST.CLC_TYP_NO%TYPE ,
											   P_LNG_NO	 IN NUMBER				) RETURN GNR_TAX_TYP_CLC_MST.CLC_TYP_L_NM%TYPE ;
								 ----------------------------------------------------------------------------------------------------------------
								 FUNCTION CHK_USE_TAX ( P_CLC_DOC_TYP IN GNR_TAX_CODE_MST.CLC_DOC_TYP%TYPE ) RETURN NUMBER ; -- CLC_DOC_TYP  1= SALES ,2 = PURCHASE , 3=BOTH
								 ----------------------------------------------------------------------------------------------------------------
								 FUNCTION GET_CLC_TYP_NO_DFLT ( P_BRN_NO   IN S_BRN.BRN_NO%TYPE  ) RETURN NUMBER;
								
								 FUNCTION GET_CLC_TYP_NO ( P_CLC_TAX_TYP IN GNR_TAX_TYP_CLC_MST.CLC_TAX_TYP%TYPE) RETURN GNR_TAX_TYP_CLC_MST.CLC_TYP_NO%TYPE ;
								 ----------------------------------------------------------------------------------------------------------------
								 FUNCTION GET_CLC_TAX_TYP ( P_CLC_TYP_NO  IN GNR_TAX_TYP_CLC_MST.CLC_TYP_NO%TYPE) RETURN GNR_TAX_TYP_CLC_MST.CLC_TAX_TYP%TYPE ;
								 ----------------------------------------------------------------------------------------------------------------
								 FUNCTION GET_ITM_TAX_PRCNT ( P_CLC_TYP_NO  IN GNR_TAX_TYP_CLC_MST.CLC_TYP_NO%TYPE  ,
											      P_I_CODE	    IN IAS_ITM_MST.I_CODE%TYPE		    ,
											      P_CLC_USD_ITM IN NUMBER			  DEFAULT 1 ) RETURN NUMBER;
								 ----------------------------------------------------------------------------------------------------------------
								 PROCEDURE DEL_TAX_MOVMNT ( P_DOC_TYP	IN POS_TAX_ITM_MOVMNT.DOC_TYPE%TYPE ,
											    P_DOC_SER	IN POS_TAX_ITM_MOVMNT.DOC_SER%TYPE  );
								 ----------------------------------------------------------------------------------------------------------------
								 PROCEDURE CLC_ITM_TAX_AFTR_SAVE ( P_CLC_TYP_NO        IN POS_TAX_ITM_MOVMNT.CLC_TYP_NO%TYPE	,
												   P_DOC_TYP	       IN POS_TAX_ITM_MOVMNT.DOC_TYPE%TYPE	,  -- DOC_TYPE IN  IAS_SYS.IAS_DOCJV_TYPE_SYSTEMS
												   P_DOC_NO	       IN POS_TAX_ITM_MOVMNT.DOC_NO%TYPE	,
												   P_DOC_SER	       IN POS_TAX_ITM_MOVMNT.DOC_SER%TYPE	,
												   P_BILL_DOC_TYP      IN POS_TAX_ITM_MOVMNT.BILL_DOC_TYPE%TYPE ,
												   P_DOC_JV_TYP        IN POS_TAX_ITM_MOVMNT.DOC_JV_TYPE%TYPE	,
												   P_DOC_DATE	       IN POS_TAX_ITM_MOVMNT.DOC_DATE%TYPE	,
												   P_A_CY	       IN POS_TAX_ITM_MOVMNT.A_CY%TYPE		,
												   P_AC_RATE	       IN POS_TAX_ITM_MOVMNT.AC_RATE%TYPE	,
												   P_STK_RATE	       IN POS_TAX_ITM_MOVMNT.STK_RATE%TYPE	,
												   P_CALC_VAT_AMT_TYPE IN IAS_PARA_AR.CALC_VAT_AMT_TYPE%TYPE	,
												   P_CLC_USD_ITM       IN NUMBER  DEFAULT 1			,
												   P_CLC_RTRN_DOC      IN NUMBER  DEFAULT 0			,
												   P_BILL_NO	       IN IAS_POS_BILL_MST.BILL_NO%TYPE 	,
												   P_TBL_MVMNT_NM      IN VARCHAR2				,
												   P_TBL_MST_NM        IN VARCHAR2				,
												   P_TBL_DTL_NM        IN VARCHAR2				,
												   P_FLD_DOC_SER       IN VARCHAR2				,
												   P_FLD_TAX_A_CODE    IN VARCHAR2				,
												   P_FLD_W_CODE        IN VARCHAR2				,
												   P_FLD_I_PRICE       IN VARCHAR2				,
												   P_FLD_DISC_AMT      IN VARCHAR2				,
												   P_FLD_STK_COST      IN VARCHAR2				,
												   P_FLD_DOC_SEQ       IN VARCHAR2				,
												   P_BRN_NO	       IN IAS_POS_BILL_MST.BRN_NO%TYPE		,
												   P_DB_LNK	       IN VARCHAR2 DEFAULT NULL) ;
								  ----------------------------------------------------------------------------------------------------------------
								   FUNCTION GET_TAX_BILL_TYP(P_BILL_TYPE IN IAS_POS_BILL_MST.BILL_TYPE%TYPE,P_C_CODE IN CUSTOMER.C_CODE%TYPE) RETURN NUMBER;
								  ----------------------------------------------------------------------------------------------------------------
								  FUNCTION GET_TAX_TYP_NO ( P_CLC_TYP_NO  IN GNR_TAX_TYP_CLC_MST.CLC_TYP_NO%TYPE ) RETURN GNR_TAX_TYP_CLC_MST.CLC_TAX_TYP%TYPE;
								  ----------------------------------------------------------------------------------------------------------------
								  FUNCTION CHK_TAX_STNDRD ( P_CLC_TYP_NO IN GNR_TAX_TYP_CLC_MST.CLC_TYP_NO%TYPE ) RETURN NUMBER;
								  ----------------------------------------------------------------------------------------------------------------
		  FUNCTION GET_ETS_SRVC_FLG_FNC ( P_BRN_NO IN NUMBER )	RETURN NUMBER ; --##CHECK USE ONLINE SYNC E-INVOICE
								  ----------------------------------------------------------------------------------------------------------------
								  PROCEDURE GET_CST_TAX_BILL_TYP(P_BILL_TYPE IN IAS_POS_BILL_MST.BILL_TYPE%TYPE
														  ,P_C_CODE	   IN CUSTOMER.C_CODE%TYPE
														  ,P_CST_CSH_CODE  IN IAS_CASH_CUSTMR.CUST_CODE%TYPE
														  ,P_Use_Vat	   IN NUMBER DEFAULT 0
														  ,P_C_TAX_CODE    IN OUT CUSTOMER.C_TAX_CODE%TYPE
														  ,P_TAX_BILL_TYP  IN OUT CUSTOMER.C_CLASS_VAT%TYPE
														  );
		  FUNCTION GET_CST_TAX_BILL_TYP_FNC(P_BILL_TYPE     IN IAS_POS_BILL_MST.BILL_TYPE%TYPE
						,P_C_CODE	 IN CUSTOMER.C_CODE%TYPE
						,P_CST_CSH_CODE  IN IAS_CASH_CUSTMR.CUST_CODE%TYPE
						,P_Use_Vat	 IN NUMBER DEFAULT 0
			  )  RETURN NUMBER;
		 FUNCTION GET_INPT_PRCNT(P_CLC_TYP_NO	IN GNR_TAX_TYP_CLC_MST.CLC_TYP_NO%TYPE,
			    P_INPT_TYP	   IN GNR_TAX_INPT.INPT_TYP%TYPE,
			    P_INPT_CODE    IN GNR_TAX_INPT.INPT_CODE%TYPE)
			     RETURN NUMBER;
						    PROCEDURE CLC_INPT_TAX_AFTR_SAVE(P_CLC_TYP_NO	  IN POS_TAX_INPT_MOVMNT.CLC_TYP_NO%TYPE,
										     P_DOC_TYP		  IN POS_TAX_INPT_MOVMNT.DOC_TYPE%TYPE, 																																  -- DOC_TYPE IN  IAS_SYS.IAS_DOCJV_TYPE_SYSTEMS
										     P_DOC_NO		  IN POS_TAX_INPT_MOVMNT.DOC_NO%TYPE,
										     P_DOC_SER		  IN POS_TAX_INPT_MOVMNT.DOC_SER%TYPE,
										     P_BILL_DOC_TYP	  IN POS_TAX_INPT_MOVMNT.BILL_DOC_TYPE%TYPE,
										     P_DOC_JV_TYP	  IN POS_TAX_INPT_MOVMNT.DOC_JV_TYPE%TYPE,
										     P_DOC_DATE 	  IN POS_TAX_INPT_MOVMNT.DOC_DATE%TYPE,
										     P_A_CY		  IN POS_TAX_INPT_MOVMNT.A_CY%TYPE,
										     P_AC_RATE		  IN POS_TAX_INPT_MOVMNT.AC_RATE%TYPE,
										     P_TBL_INPT_NM	  IN VARCHAR2,
										     P_TBL_MST_NM	  IN VARCHAR2 DEFAULT NULL,
										     P_TBL_DTL_NM	  IN VARCHAR2 DEFAULT NULL,
										     P_FLD_DOC_SER	  IN VARCHAR2,
										     P_FLD_DOC_AMT	  IN VARCHAR2 DEFAULT NULL,
										     P_FLD_DOC_SER_INPT   IN VARCHAR2,
										     P_FLD_TAX_A_CODE	  IN VARCHAR2,
										     P_INPT_TYP 	  IN NUMBER,
										     P_FLD_INPT_CODE	  IN VARCHAR2,
										     P_FLD_INPT_AMT	  IN VARCHAR2,
										     P_FLD_DOC_SEQ	  IN VARCHAR2,
										     P_CLC_DOC_TYP	  IN NUMBER,																																					-- CLC_DOC_TYP	1= SALES ,2 = PURCHASE ,
										     P_DR_CR_FLG	  IN NUMBER,
										     P_LNG_NO		  IN NUMBER);
						
						    FUNCTION GET_TAX_PRD(P_DOC_DATE DATE)
							RETURN NUMBER;
						    FUNCTION GET_CLC_TYP_NO_ACTV_DATE(P_CLC_TYP_NO IN GNR_TAX_TYP_CLC_MST.CLC_TYP_NO%TYPE, P_BRN_NO IN S_BRN.BRN_NO%TYPE) RETURN DATE;											
								END YS_TAX_PKG;
/

-- ---------------------------------------------
-- PACKAGE BODY: YS_TAX_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE BODY Ys_Tax_Pkg as					
					 FUNCTION GET_TAX_NM ( P_TAX_NO IN GNR_TAX_CODE_MST.TAX_NO%TYPE ,
							       P_LNG_NO IN NUMBER		       ) RETURN GNR_TAX_CODE_MST.TAX_L_NM%TYPE IS
					
					   V_TAX_NM	GNR_TAX_CODE_MST.TAX_L_NM%TYPE;
					 BEGIN
					
					     SELECT DECODE(P_LNG_NO,1,TAX_L_NM,NVL(TAX_F_NM,TAX_L_NM)) INTO V_TAX_NM
					       FROM GNR_TAX_CODE_MST
					      WHERE TAX_NO  = P_TAX_NO
						AND ROWNUM<=1;
					
						 RETURN (V_TAX_NM );
					
					 EXCEPTION
					    WHEN OTHERS THEN
						  RETURN (NULL);
					 END GET_TAX_NM;
					
					 FUNCTION GET_TAX_AGNCY_NM ( P_TAX_NO	IN GNR_TAX_CODE_MST.TAX_NO%TYPE   ,
								     P_AGNCY_NO IN GNR_TAX_CODE_DTL.AGNCY_NO%TYPE ,
								     P_LNG_NO	IN NUMBER			  ) RETURN GNR_TAX_CODE_DTL.AGNCY_L_NM%TYPE IS
					
					  V_TAX_AGNCY_NM     GNR_TAX_CODE_DTL.AGNCY_L_NM%TYPE;
					 BEGIN
					
					     SELECT DECODE(P_LNG_NO,1,AGNCY_L_NM,NVL(AGNCY_F_NM,AGNCY_L_NM)) INTO V_TAX_AGNCY_NM
					       FROM GNR_TAX_CODE_DTL
					      WHERE TAX_NO   = P_TAX_NO
						AND AGNCY_NO = P_AGNCY_NO
						AND ROWNUM<=1;
					
						 RETURN (V_TAX_AGNCY_NM );
					
					 EXCEPTION
					    WHEN OTHERS THEN
						  RETURN (NULL);
					 END GET_TAX_AGNCY_NM;
					 ----------------------------------------------------------------------------------------------------------------
					 FUNCTION GET_CLC_TAX_NM ( P_CLC_TYP_NO  IN GNR_TAX_TYP_CLC_MST.CLC_TYP_NO%TYPE ,
								   P_LNG_NO	 IN NUMBER				) RETURN GNR_TAX_TYP_CLC_MST.CLC_TYP_L_NM%TYPE IS
					 V_CLC_TAX_NM	  GNR_TAX_CODE_DTL.AGNCY_L_NM%TYPE;
					 BEGIN
					
					     SELECT DECODE(P_LNG_NO,1,CLC_TYP_L_NM,NVL(CLC_TYP_F_NM,CLC_TYP_L_NM)) INTO V_CLC_TAX_NM
					       FROM GNR_TAX_TYP_CLC_MST
					      WHERE CLC_TYP_NO	= P_CLC_TYP_NO
						AND ROWNUM<=1;
					
						 RETURN (V_CLC_TAX_NM );
					
					 EXCEPTION
					    WHEN OTHERS THEN
						  RETURN (NULL);
					 END GET_CLC_TAX_NM;
					
					 FUNCTION CHK_USE_TAX ( P_CLC_DOC_TYP IN GNR_TAX_CODE_MST.CLC_DOC_TYP%TYPE ) RETURN NUMBER IS -- CLC_DOC_TYP  1= SALES ,2 = PURCHASE , 3=BOTH
					    V_CNT  NUMBER:=0;
					 BEGIN
					   SELECT 1
					     INTO V_CNT
					     FROM GNR_TAX_CODE_MST
					    WHERE CLC_DOC_TYP=P_CLC_DOC_TYP
					      AND ROWNUM<=1;
					
					   RETURN (V_CNT);
					
					  EXCEPTION WHEN OTHERS THEN
					    RETURN(0);
					 END CHK_USE_TAX;
					
					 FUNCTION  GET_CLC_TYP_NO_DFLT ( P_BRN_NO IN S_BRN.BRN_NO%TYPE ) RETURN NUMBER IS
					   V_CLC_TYP_NO  GNR_TAX_TYP_CLC_MST.CLC_TYP_NO%TYPE;
					 BEGIN
					
					       BEGIN
						SELECT CLC_TYP_NO
						 INTO V_CLC_TYP_NO
						 FROM GNR_TAX_TYP_CLC_MST
						WHERE NVL(CLC_TYP_DFLT_FLG,0)=1
						  AND ROWNUM <=1;
					       EXCEPTION WHEN NO_DATA_FOUND THEN
						  BEGIN
						      SELECT CLC_TYP_NO
							INTO V_CLC_TYP_NO
							FROM GNR_TAX_TYP_CLC_MST
						       WHERE NVL(CLC_TAX_TYP,0)=0
							 AND ROWNUM <=1;
						  EXCEPTION WHEN OTHERS THEN
						      V_CLC_TYP_NO := NULL;
						  END;
					       END;
					
					   RETURN (V_CLC_TYP_NO);
					
					  EXCEPTION WHEN OTHERS THEN
					    RETURN(NULL);
					 END GET_CLC_TYP_NO_DFLT;
					
					 FUNCTION GET_CLC_TYP_NO ( P_CLC_TAX_TYP IN GNR_TAX_TYP_CLC_MST.CLC_TAX_TYP%TYPE) RETURN GNR_TAX_TYP_CLC_MST.CLC_TYP_NO%TYPE IS
					   V_CLC_TYP_NO  GNR_TAX_TYP_CLC_MST.CLC_TYP_NO%TYPE;
					 BEGIN
					
					   SELECT CLC_TYP_NO
					     INTO V_CLC_TYP_NO
					     FROM GNR_TAX_TYP_CLC_MST
					    WHERE NVL(CLC_TAX_TYP,0)=P_CLC_TAX_TYP
					      AND ROWNUM <=1;
					
					   RETURN (V_CLC_TYP_NO);
					
					  EXCEPTION WHEN OTHERS THEN
					    RETURN(NULL);
					 END GET_CLC_TYP_NO;
					
					 FUNCTION GET_CLC_TAX_TYP ( P_CLC_TYP_NO  IN GNR_TAX_TYP_CLC_MST.CLC_TYP_NO%TYPE) RETURN GNR_TAX_TYP_CLC_MST.CLC_TAX_TYP%TYPE IS
					   V_CLC_TAX_TYP GNR_TAX_TYP_CLC_MST.CLC_TAX_TYP%TYPE;
					 BEGIN
					
					   SELECT CLC_TAX_TYP
					     INTO V_CLC_TAX_TYP
					     FROM GNR_TAX_TYP_CLC_MST
					    WHERE NVL(CLC_TYP_NO,0)=P_CLC_TYP_NO
					      AND ROWNUM <=1;
					
					   RETURN (V_CLC_TAX_TYP);
					
					  EXCEPTION WHEN OTHERS THEN
					    RETURN(NULL);
					 END GET_CLC_TAX_TYP;
					 FUNCTION GET_ITM_TAX_PRCNT ( P_CLC_TYP_NO  IN GNR_TAX_TYP_CLC_MST.CLC_TYP_NO%TYPE  ,
								      P_I_CODE	    IN IAS_ITM_MST.I_CODE%TYPE		    ,
								      P_CLC_USD_ITM IN NUMBER			  DEFAULT 1 ) RETURN NUMBER IS
					    V_TAX_PRCNT   POS_TAX_ITM_MOVMNT.TAX_PRCNT%TYPE;
					 BEGIN
					   IF P_CLC_TYP_NO IS NOT NULL THEN
					   --## Get Sum Tax Percent For Items
					     SELECT SUM(NVL(TI.TAX_PRCNT,0))
					       INTO V_TAX_PRCNT
					       FROM GNR_TAX_ITM TI,GNR_TAX_TYP_CLC_DTL TC , IAS_ITM_MST I,GNR_TAX_CODE_MST T
					      WHERE TI.TAX_NO	     = TC.TAX_NO
						AND TI.TAX_NO	     = T.TAX_NO
						AND TC.TAX_NO	     = T.TAX_NO
						AND TI.I_CODE	     = I.I_CODE
						AND TC.CLC_TYP_NO    = P_CLC_TYP_NO
						AND TI.I_CODE	     = P_I_CODE
						AND NVL(T.INACTIVE,0)=0
						AND DECODE(P_CLC_USD_ITM,1,1,0)= DECODE(P_CLC_USD_ITM,1,1,NVL(I.USED_ITM,0));
					       					
					     RETURN(V_TAX_PRCNT);
					   ELSE
					      RETURN(0);
					   END IF;
					 EXCEPTION WHEN OTHERS THEN
					   RETURN(0);
					 END GET_ITM_TAX_PRCNT;
					
					 PROCEDURE DEL_TAX_MOVMNT ( P_DOC_TYP	IN POS_TAX_ITM_MOVMNT.DOC_TYPE%TYPE ,
								    P_DOC_SER	IN POS_TAX_ITM_MOVMNT.DOC_SER%TYPE  ) IS
					 BEGIN
					    DELETE FROM POS_TAX_ITM_MOVMNT
					     WHERE DOC_TYPE = P_DOC_TYP
					       AND DOC_SER  = P_DOC_SER;
					
					 EXCEPTION
					    WHEN OTHERS THEN
						  RAISE_APPLICATION_ERROR(-20001,'ERROR WHEN DELETE FROM POS_TAX_ITM_MOVMNT = '||SQLERRM) ;
					 END DEL_TAX_MOVMNT;
					
					
					 PROCEDURE CLC_ITM_TAX_AFTR_SAVE ( P_CLC_TYP_NO        IN POS_TAX_ITM_MOVMNT.CLC_TYP_NO%TYPE	,
									   P_DOC_TYP	       IN POS_TAX_ITM_MOVMNT.DOC_TYPE%TYPE	,  -- DOC_TYPE IN  IAS_SYS.IAS_DOCJV_TYPE_SYSTEMS
									   P_DOC_NO	       IN POS_TAX_ITM_MOVMNT.DOC_NO%TYPE	,
									   P_DOC_SER	       IN POS_TAX_ITM_MOVMNT.DOC_SER%TYPE	,
									   P_BILL_DOC_TYP      IN POS_TAX_ITM_MOVMNT.BILL_DOC_TYPE%TYPE ,
									   P_DOC_JV_TYP        IN POS_TAX_ITM_MOVMNT.DOC_JV_TYPE%TYPE	,
									   P_DOC_DATE	       IN POS_TAX_ITM_MOVMNT.DOC_DATE%TYPE	,
									   P_A_CY	       IN POS_TAX_ITM_MOVMNT.A_CY%TYPE		,
									   P_AC_RATE	       IN POS_TAX_ITM_MOVMNT.AC_RATE%TYPE	,
									   P_STK_RATE	       IN POS_TAX_ITM_MOVMNT.STK_RATE%TYPE	,
									   P_CALC_VAT_AMT_TYPE IN IAS_PARA_AR.CALC_VAT_AMT_TYPE%TYPE	,
									   P_CLC_USD_ITM       IN NUMBER  DEFAULT 1			,
									   P_CLC_RTRN_DOC      IN NUMBER  DEFAULT 0			,
									   P_BILL_NO	       IN IAS_POS_BILL_MST.BILL_NO%TYPE 	,
									   P_TBL_MVMNT_NM      IN VARCHAR2				,
									   P_TBL_MST_NM        IN VARCHAR2				,
									   P_TBL_DTL_NM        IN VARCHAR2				,
									   P_FLD_DOC_SER       IN VARCHAR2				,
									   P_FLD_TAX_A_CODE    IN VARCHAR2				,
									   P_FLD_W_CODE        IN VARCHAR2				,
									   P_FLD_I_PRICE       IN VARCHAR2				,
									   P_FLD_DISC_AMT      IN VARCHAR2				,
									   P_FLD_STK_COST      IN VARCHAR2				,
									   P_FLD_DOC_SEQ       IN VARCHAR2				,
									   P_BRN_NO	       IN IAS_POS_BILL_MST.BRN_NO%TYPE		,
									   P_DB_LNK	       IN VARCHAR2 DEFAULT NULL)  IS
					
					   V_SLCT		VARCHAR2(32000);
					   V_WHR		VARCHAR2(3000);
					   V_FLD_I_PRICE	VARCHAR2(500);					
					   V_FLD_DOC_SEQ_BILL	VARCHAR2(100):='''';
					   V_FLD_CLC_TAX_FREE_QTY_FLG VARCHAR2(100):='';
					   V_CNT		NUMBER:=0;
					
					   V_TAX_CUR_CODE	EX_RATE.CUR_CODE%TYPE;
		   V_TAX_CUR_RATE	EX_RATE.CUR_RATE%TYPE;
		   V_FLD_TAX		VARCHAR2(20000);
		   V_FLD_TAX_VAL	VARCHAR2(20000);
		   V_TAX_STNDRD 	NUMBER:=0;
		   V_EXMPT_FLD		VARCHAR2(500);
					BEGIN
					
					     --------------------------------------------------------------------------------------------------------------
					    BEGIN
					      EXECUTE IMMEDIATE 'DELETE '||P_TBL_MVMNT_NM||' WHERE DOC_TYPE='||P_DOC_TYP||' AND DOC_SER='''||P_DOC_SER||'''';
					    EXCEPTION WHEN OTHERS THEN NULL;
					    END;
					   --------------------------------------------------------------------------------------------------------------
					    IF P_CALC_VAT_AMT_TYPE=2 THEN
					       IF P_FLD_DISC_AMT IS NOT NULL THEN
						 V_FLD_I_PRICE := P_FLD_I_PRICE||'-'||P_FLD_DISC_AMT;
					       ELSE
						 V_FLD_I_PRICE := P_FLD_I_PRICE;
					       END IF;
					    ELSE
					       V_FLD_I_PRICE := P_FLD_I_PRICE;
					    END IF;
					    --------------------------------------------------------------------------------------------------------------
					    IF	IAS_DBS_Sys_Pkg.Check_Object (P_TBL_MST_NM , 'TABLE','CLC_TAX_FREE_QTY_FLG' ) = 1 Then
					      V_FLD_CLC_TAX_FREE_QTY_FLG := 'NVL(M.CLC_TAX_FREE_QTY_FLG,0)';
					    ELSE
					      V_FLD_CLC_TAX_FREE_QTY_FLG := '0';
					    END IF;
					    --------------------------------------------------------------------------------------------------------------
					    V_TAX_STNDRD   := CHK_TAX_STNDRD ( P_CLC_TYP_NO => P_CLC_TYP_NO);
	      --------------------------------------------------------------------------------------------------------------
	       V_TAX_CUR_CODE	 := IAS_CMP_PKG.GET_TAX_CUR ( P_BRN_NO => P_BRN_NO);
	       IF V_TAX_CUR_CODE = P_A_CY THEN
		  V_TAX_CUR_RATE := P_AC_RATE;
	       ELSE
		  V_TAX_CUR_RATE := IAS_GEN_PKG.GET_CUR_RATE ( P_ACY => V_TAX_CUR_CODE );
	       END IF;
	       --------------------------------------------------------------------------------------------------------------
	       IF V_TAX_CUR_CODE IS NOT NULL AND V_TAX_CUR_RATE IS NULL THEN
		  BEGIN
		    SELECT CUR_RATE INTO V_TAX_CUR_RATE FROM EX_RATE WHERE CUR_CODE_STNDR=V_TAX_CUR_CODE AND ROWNUM<=1;
		  EXCEPTION WHEN OTHERS THEN
		    V_TAX_CUR_RATE    := NULL;
		  END;
	       END IF;
	       IF NVL(V_TAX_CUR_RATE,0)=0 THEN
		  V_TAX_CUR_RATE := IAS_GEN_PKG.GET_CUR_RATE ( P_ACY => P_A_CY );
	       END IF;

	      V_EXMPT_FLD := 'TI.VAT_EXMPT_RSN_CODE,--ITM_VAT_EX_RSN_CODE
			      TI.VAT_EXMPT_RSN_TXT,--ITM_VAT_EX_RSN_TXT';

	      V_FLD_TAX := 'PRC_BS_QTY,
			       PRC_DED_AMT,
			       ITM_NET_PRICE,
			       ITM_NET_QTY,
			       OTHR_AMT_ITM_DISC,
			       OTHR_AMT_ITM,
			       ITM_NET_AMT,
			       TAX_CUR_CODE,
			       TAX_CUR_RATE,
			       NET_TAX_AMT,
			       ITM_VAT_CAT_CODE,
			       ITM_VAT_EX_RSN_CODE,
			       ITM_VAT_EX_RSN_TXT,
			       BILL_TAX_STATUS,
			       TAX_HAS_JRNL,' ;
		 V_FLD_TAX_VAL := '1, -- PRC_BS_QTY,
				   (NVL(D.DIS_AMT_MST,0)+NVL(D.DIS_AMT_DTL,0))*(NVL(D.I_QTY,0)/NVL((D.I_QTY+NVL(FREE_QTY,0)),1)) ,-- PRC_DED_AMT
				   (NVL(D.I_PRICE,0)-((((NVL(D.DIS_AMT_MST,0)+NVL(D.DIS_AMT_DTL,0))*(NVL(D.I_QTY,0)/NVL((D.I_QTY+NVL(FREE_QTY,0)),1)))))), -- ITM_NET_PRICE
				   (NVL(D.I_QTY,0)+NVL(D.FREE_QTY,0)),-- ITM_NET_QTY
				   0,-- OTHR_AMT_ITM_DISC
				   0,--(NVL(D.OTHR_AMT,0)-NVL(D.OTHR_AMT_DISC,0))*NVL(I_QTY,0)/(NVL(D.I_QTY,0)+NVL(D.FREE_QTY,0)),-- OTHR_AMT_ITM
				   ((NVL(D.I_PRICE,0)-((((NVL(D.DIS_AMT_MST,0)+NVL(D.DIS_AMT_DTL,0))*(NVL(D.I_QTY,0)/NVL((D.I_QTY+NVL(FREE_QTY,0)),1))))))*(NVL(D.I_QTY,0)+NVL(D.FREE_QTY,0))),-- ITM_NET_AMT
				   '''||V_TAX_CUR_CODE||''',-- TAX_CURR
				   '||V_TAX_CUR_RATE||',-- TAX_CURR_RATE
				   ((NVL(D.I_PRICE,0)-((((NVL(D.DIS_AMT_MST,0)+NVL(D.DIS_AMT_DTL,0))*(NVL(D.I_QTY,0)/NVL((D.I_QTY+NVL(FREE_QTY,0)),1))))))*(NVL(D.I_QTY,0)+NVL(D.FREE_QTY,0)))
				   *NVL(TI.TAX_PRCNT,0)/100,-- NET_TAX_AMT
				   DECODE('||V_TAX_STNDRD||',1 ,TI.VAT_CAT_CODE       ,TC.VAT_CAT_CODE),--ITM_VAT_CAT_CODE
				   '||V_EXMPT_FLD||'
				   1,-- BILL_TAX_STATUS
				   0,-- TAX_HAS_JRNL';

					    BEGIN
					       IF P_CLC_RTRN_DOC=0 THEN
						 V_Slct:=  'INSERT INTO '||P_TBL_MVMNT_NM||' ( DOC_TYPE,
											       DOC_NO,
											       DOC_SER,
											       BILL_DOC_TYPE,
											       DOC_JV_TYPE,
											       DOC_DATE,
											       TAX_NO,
											       CLC_TYP_NO,
											       AGNCY_NO,
											       VAT_CAT_CODE,
											       I_CODE,
											       ITM_UNT,
											       P_SIZE,
											       I_QTY,
											       FREE_QTY,
											       I_PRICE,
											       DISC_AMT,
											       A_CODE,
											       A_CY,
											       AC_RATE,
											       TAX_PRCNT,
											       TAX_AMT,
											       TAX_AMT_L,
											       STK_COST,
											       STK_RATE,
											       W_CODE,
											       RCRD_NO,
											       CLC_TAX_FREE_QTY_FLG,
											       '||V_FLD_TAX||'
											       CMP_NO,
											       BRN_NO,
											       BRN_YEAR,
											       BRN_USR)
											SELECT '||P_DOC_TYP||',
											       '||P_DOC_NO||',
											       '||P_DOC_SER||',
											     '''||P_BILL_DOC_TYP||''',
											     '''||P_DOC_JV_TYP||''',
											     '''||P_DOC_DATE||''',
											       TI.TAX_NO,
											       TC.CLC_TYP_NO,
											       TI.AGNCY_NO,
											       TC.VAT_CAT_CODE,
											       D.I_CODE,
											       D.ITM_UNT,
											       D.P_SIZE,
											       D.I_QTY,
											       D.FREE_QTY,
											       '||P_FLD_I_PRICE||',
											       '||P_FLD_DISC_AMT||',
											       '||P_FLD_TAX_A_CODE||',
											     '''||P_A_CY||''',
											       '||P_AC_RATE||',
											       NVL(TI.TAX_PRCNT,0),
											       (('||V_FLD_I_PRICE||')*NVL(TI.TAX_PRCNT,0))/100,
											       (('||V_FLD_I_PRICE||')*NVL(TI.TAX_PRCNT,0)*'||P_AC_RATE||')/100,
											       '||P_FLD_STK_COST||',
											       '||P_STK_RATE||',
											       '||P_FLD_W_CODE||',
												D.RCRD_NO,
											       '||V_FLD_CLC_TAX_FREE_QTY_FLG||',
											       '||V_FLD_TAX_VAL||' ,
											       M.CMP_NO,
											       M.BRN_NO,
											       M.BRN_YEAR,
											       M.BRN_USR
											  FROM '||P_TBL_MST_NM||' M,'||P_TBL_DTL_NM||' D ,GNR_TAX_ITM TI,GNR_TAX_CODE_MST TM ,GNR_TAX_CODE_DTL TD ,GNR_TAX_TYP_CLC_DTL TC,IAS_ITM_MST I
											 WHERE '||P_FLD_DOC_SER||'='||REPLACE(P_FLD_DOC_SER,'M.','D.')||'
											   AND D.I_CODE     =  TI.I_CODE
											   AND TI.TAX_NO     = TM.TAX_NO
											   AND TI.TAX_NO     = TD.TAX_NO
											   AND TI.AGNCY_NO   = TD.AGNCY_NO
											   AND TI.TAX_NO     = TC.TAX_NO
											   AND TM.TAX_NO     = TD.TAX_NO
											   AND TM.TAX_NO     = TC.TAX_NO
											   AND TD.TAX_NO     = TC.TAX_NO
											   AND D.I_CODE      = I.I_CODE
											   AND TI.I_CODE     = I.I_CODE
											   AND NVL(TM.INACTIVE,0)=0
											   AND TC.CLC_TYP_NO = '||P_CLC_TYP_NO||'
											   AND '||P_FLD_DOC_SER||'='||P_DOC_SER||V_WHR||'
										      ORDER BY '||P_FLD_DOC_SEQ;
					
					      ELSE
						 --------------------------------------------
						  V_FLD_DOC_SEQ_BILL := 'D.RCRD_NO';
						 --------------------------------------------
						 V_Slct:=  'INSERT INTO '||P_TBL_MVMNT_NM||' ( DOC_TYPE,
											       DOC_NO,
											       DOC_SER,
											       BILL_DOC_TYPE,
											       DOC_JV_TYPE,
											       DOC_DATE,
											       TAX_NO,
											       CLC_TYP_NO,
											       AGNCY_NO,
											       VAT_CAT_CODE,
											       I_CODE,
											       ITM_UNT,
											       P_SIZE,
											       I_QTY,
											       FREE_QTY,
											       I_PRICE,
											       DISC_AMT,
											       A_CODE,
											       A_CY,
											       AC_RATE,
											       TAX_PRCNT,
											       TAX_AMT,
											       TAX_AMT_L,
											       STK_COST,
											       STK_RATE,
											       W_CODE,
											       RCRD_NO,
											       CLC_TAX_FREE_QTY_FLG,
											       CMP_NO,
											       BRN_NO,
											       BRN_YEAR,
											       BRN_USR)
											SELECT '||P_DOC_TYP||',
											       '||P_DOC_NO||',
											       '||P_DOC_SER||',
											     '''||P_BILL_DOC_TYP||''',
											     '''||P_DOC_JV_TYP||''',
											     '''||P_DOC_DATE||''',
											       T.TAX_NO,
											       T.CLC_TYP_NO,
											       T.AGNCY_NO,
											       T.VAT_CAT_CODE,
											       D.I_CODE,
											       D.ITM_UNT,
											       D.P_SIZE,
											       D.I_QTY,
											       D.FREE_QTY,
											       '||P_FLD_I_PRICE||',
											       '||P_FLD_DISC_AMT||',
											       '||P_FLD_TAX_A_CODE||',
											     '''||P_A_CY||''',
											       '||P_AC_RATE||',
											       NVL(T.TAX_PRCNT,0),
											       T.TAX_AMT,
											       T.TAX_AMT_L,
											       '||P_FLD_STK_COST||',
											       '||P_STK_RATE||',
											       '||P_FLD_W_CODE||',
											       D.RCRD_NO,
											       '||V_FLD_CLC_TAX_FREE_QTY_FLG||',
											       M.CMP_NO,
											       M.BRN_NO,
											       M.BRN_YEAR,
											       M.BRN_USR
											  FROM '||P_TBL_MST_NM||' M,'||P_TBL_DTL_NM||' D ,GNR_TAX_CODE_DTL TD,POS_TAX_ITM_MOVMNT  T
											 WHERE '||P_FLD_DOC_SER||' ='||REPLACE(P_FLD_DOC_SER,'M.','D.')||'
											   AND D.I_CODE 	   = T.I_CODE
											   AND T.DOC_NO 	   = '||P_BILL_NO||'
											   AND T.DOC_TYPE=4
											   AND T.TAX_NO 	   = TD.TAX_NO
											   AND T.AGNCY_NO	   = TD.AGNCY_NO
											   AND T.CLC_TYP_NO	   = '||P_CLC_TYP_NO||'
											   AND '||P_FLD_DOC_SER||' ='||P_DOC_SER||V_WHR||'
										      ORDER BY '||P_FLD_DOC_SEQ;
										     -- INSERT INTO TST(FLD) VALUES (V_Slct);
					      --COMMIT;
					      END IF;
					      EXECUTE IMMEDIATE V_Slct;
					
						  ----------------------------------------------------------------------------------------------------------
						  --## Update Tax Tables For Document
						  ----------------------------------------------------------------------------------------------------------
						 /* V_CNT := YS_GEN_PKG.GET_CNT('SELECT 1 FROM '||P_TBL_MVMNT_NM||'
										WHERE DOC_TYPE = '||P_DOC_TYP||'
										  AND DOC_SER  ='''||P_DOC_SER||'''
										  AND ROWNUM <= 1');
										 					
						  IF NVL(V_CNT,0)>0 THEN
						    ------------------------------------------------------------------------------------------------------
						    BEGIN
							  EXECUTE IMMEDIATE 'UPDATE '||P_TBL_DTL_NM||' M SET VAT_AMT = ( SELECT SUM(NVL(T.TAX_AMT,0))
																       FROM '||P_TBL_MVMNT_NM||' T
																      WHERE T.DOC_TYPE	   = '||P_DOC_TYP||'
																	AND T.DOC_SER	   = '||P_DOC_SER||'
																	AND T.I_CODE	   = M.I_CODE
																	AND T.RCRD_NO = M.RCRD_NO)
									      WHERE '||P_FLD_DOC_SER||'='||P_DOC_SER;
					
						    EXCEPTION WHEN OTHERS THEN
							NULL;
						    END;
						    -------------------------------------------------------------------------------------------------------
						    BEGIN
						      EXECUTE IMMEDIATE 'UPDATE '||P_TBL_MST_NM||' M SET VAT_AMT = ( SELECT SUM(NVL(T.I_QTY,0)*NVL(T.TAX_AMT,0))
																   FROM '||P_TBL_MVMNT_NM||' T
																  WHERE T.DOC_TYPE = '||P_DOC_TYP||'
																    AND T.DOC_SER = '||P_DOC_SER||')
									  WHERE '||P_FLD_DOC_SER||' = '||P_DOC_SER;
					
						    EXCEPTION WHEN OTHERS THEN
						      NULL;
						    END;
						    -------------------------------------------------------------------------------------------------------
						  END IF; */
					      END;
					
					END CLC_ITM_TAX_AFTR_SAVE;
					--=======================================================================
					FUNCTION GET_TAX_BILL_TYP(P_BILL_TYPE IN IAS_POS_BILL_MST.BILL_TYPE%TYPE,P_C_CODE IN CUSTOMER.C_CODE%TYPE) RETURN NUMBER
			    IS
				V_C_TAX_CODE CUSTOMER.C_TAX_CODE%TYPE := NULL;
				V_C_CLASS_VAT CUSTOMER.C_CLASS_VAT%TYPE := NULL;
			    BEGIN
				IF NVL(P_BILL_TYPE,1) = 2 AND P_C_CODE IS NOT NULL THEN			
				    BEGIN			
					SELECT C_TAX_CODE,
					       C_CLASS_VAT
					  INTO V_C_TAX_CODE,
					       V_C_CLASS_VAT
					  FROM CUSTOMER
					 WHERE C_CODE = P_C_CODE;
				    EXCEPTION
					WHEN OTHERS THEN
					    V_C_TAX_CODE := NULL;
					    V_C_CLASS_VAT := 0;
				    END;
				ELSE
				    V_C_TAX_CODE := NULL;
				    V_C_CLASS_VAT := 0;
				END IF;
			
				RETURN (CASE WHEN V_C_TAX_CODE IS NULL OR V_C_CLASS_VAT = 1 THEN 1 ELSE 2 END);
			
			    EXCEPTION WHEN OTHERS THEN
				RETURN(1);
			    END GET_TAX_BILL_TYP;
					--=======================================================================
				 FUNCTION GET_TAX_TYP_NO ( P_CLC_TYP_NO  IN GNR_TAX_TYP_CLC_MST.CLC_TYP_NO%TYPE ) RETURN GNR_TAX_TYP_CLC_MST.CLC_TAX_TYP%TYPE IS
				  V_CLC_TAX_TYP     GNR_TAX_TYP_CLC_MST.CLC_TAX_TYP%TYPE;
				 BEGIN				
				     SELECT CLC_TAX_TYP INTO V_CLC_TAX_TYP
				       FROM GNR_TAX_TYP_CLC_MST
				      WHERE CLC_TYP_NO	= P_CLC_TYP_NO;				
					 RETURN (V_CLC_TAX_TYP );				
				 EXCEPTION
				    WHEN OTHERS THEN
					  RETURN (NULL);
				 END GET_TAX_TYP_NO;
				 --=======================================================================
				 FUNCTION CHK_TAX_STNDRD ( P_CLC_TYP_NO IN GNR_TAX_TYP_CLC_MST.CLC_TYP_NO%TYPE ) RETURN NUMBER IS
					  V_CNT NUMBER;
					BEGIN					
					    SELECT 1 INTO V_CNT
					     FROM GNR_TAX_TYP_CLC_DTL
					    WHERE CLC_TYP_NO = P_CLC_TYP_NO
					      AND NVL(VAT_CAT_CODE,'0') = 'S'
					      AND ROWNUM<=1;					
					  RETURN (V_CNT);
					
					 EXCEPTION
					    WHEN OTHERS THEN
						  RETURN (0);
					END CHK_TAX_STNDRD;
				 --=======================================================================
			    FUNCTION GET_ETS_SRVC_FLG_FNC(P_BRN_NO IN NUMBER)--##CHECK USE ONLINE SYNC E-INVOICE SAU
				RETURN NUMBER
			    IS
				V_ETS_SRVC_FLG	 NUMBER(1) := 0;
				V_POS_REF_CODE	 S_BRN.POS_REF_CODE%TYPE;
			    BEGIN
			
				SELECT NVL(POS_REF_CODE, '0')
				  INTO V_POS_REF_CODE
				  FROM S_BRN
				 WHERE BRN_NO = P_BRN_NO;
			
				IF V_POS_REF_CODE IS NOT NULL THEN
			
				    BEGIN
			
					SELECT ETS_SRVC_FLG
					  INTO V_ETS_SRVC_FLG
					  FROM GNR_WEB_SRVC_MST
					 WHERE NVL(ETS_SRVC_FLG, 0) = 1 AND SRVC_NO = V_POS_REF_CODE AND ROWNUM <= 1;
				    EXCEPTION
					WHEN OTHERS THEN
					    V_ETS_SRVC_FLG := 0;
				    END;
			
				END IF;
			
				RETURN (NVL(V_ETS_SRVC_FLG, 0));
			    EXCEPTION
				WHEN OTHERS THEN
				    RETURN (0);
			    END GET_ETS_SRVC_FLG_FNC;				
				 --=======================================================================
				 PROCEDURE GET_CST_TAX_BILL_TYP(P_BILL_TYPE IN IAS_POS_BILL_MST.BILL_TYPE%TYPE
			  ,P_C_CODE	   IN CUSTOMER.C_CODE%TYPE
			  ,P_CST_CSH_CODE  IN IAS_CASH_CUSTMR.CUST_CODE%TYPE
			  ,P_Use_Vat	   IN NUMBER DEFAULT 0
			  ,P_C_TAX_CODE    IN OUT CUSTOMER.C_TAX_CODE%TYPE
			  ,P_TAX_BILL_TYP  IN OUT CUSTOMER.C_CLASS_VAT%TYPE
			  )
						 IS
							V_C_TAX_CODE CUSTOMER.C_TAX_CODE%TYPE	:=null;
							V_C_CLASS_VAT CUSTOMER.C_CLASS_VAT%TYPE :=null;
						 BEGIN
							If P_C_CODE IS NOT NULL  Then
							       Begin
								  select  C_Tax_Code ,DECODE( NVL(C_CLASS_VAT,1),2,2,3,2,1) into V_C_TAX_CODE,V_C_CLASS_VAT
								  from customer where c_code=P_C_Code and rownum<=1;
							       Exception when others then
								   Null;
							       End;
						
							       If nvl(trim(P_C_TAX_CODE),'0')='0' Then
								  P_C_TAX_CODE:=V_C_TAX_CODE;
							       Else
								   V_C_TAX_CODE:=trim(P_C_TAX_CODE)  ;
								   P_C_TAX_CODE:=trim(P_C_TAX_CODE);
							       End If;
						
							       P_TAX_BILL_TYP:= CASE WHEN nvl(trim(V_C_TAX_CODE),'0')='0' OR
											    V_C_CLASS_VAT = 1 THEN 1 ELSE 2 END;
							ELSIF P_CST_CSH_CODE IS NOT NULL  Then
							       Begin
								  select  C_Tax_Code into V_C_TAX_CODE
								  from IAS_CASH_CUSTMR where CUST_CODE=P_CST_CSH_CODE and rownum<=1;
							       Exception when others then
								   Null;
							       End;
							       P_C_TAX_CODE:=trim(V_C_TAX_CODE);
							       P_TAX_BILL_TYP:= CASE WHEN nvl(trim(P_C_TAX_CODE),'0')='0'  THEN 1 ELSE 2 END ;
							Else
							   P_C_TAX_CODE:=trim(P_C_TAX_CODE);
							   P_TAX_BILL_TYP:=  CASE WHEN nvl(trim(P_C_TAX_CODE),'0')='0'	THEN 1 ELSE 2 END ;
							End If;
							--G_TAX_BILL_TYP:=P_TAX_BILL_TYP;
						EXCEPTION WHEN OTHERS THEN
						  null;
						END GET_CST_TAX_BILL_TYP;     			 		
				 --=======================================================================
				 FUNCTION GET_CST_TAX_BILL_TYP_FNC(P_BILL_TYPE IN IAS_POS_BILL_MST.BILL_TYPE%TYPE
			     ,P_C_CODE	      IN CUSTOMER.C_CODE%TYPE
			     ,P_CST_CSH_CODE  IN IAS_CASH_CUSTMR.CUST_CODE%TYPE
			     ,P_Use_Vat       IN NUMBER DEFAULT 0
			     )	RETURN NUMBER
					 IS
						V_C_TAX_CODE CUSTOMER.C_TAX_CODE%TYPE := null;
						V_C_CLASS_VAT CUSTOMER.C_CLASS_VAT%TYPE := null;
						V_TAX_BILL_TYP NUMBER;
					 BEGIN
						If P_C_CODE IS NOT NULL  Then
						       Begin
							  select  C_Tax_Code ,DECODE( NVL(C_CLASS_VAT,1),2,2,3,2,1) into V_C_TAX_CODE,V_C_CLASS_VAT
							  from customer where c_code=P_C_Code and rownum<=1;
						       Exception when others then
							   Null;
						       End;
						       V_TAX_BILL_TYP:= CASE WHEN nvl(trim(V_C_TAX_CODE),'0')='0' OR
										    V_C_CLASS_VAT = 1 THEN 1 ELSE 2 END;
						ELSIF P_CST_CSH_CODE IS NOT NULL  Then
						       Begin
							  select  C_Tax_Code into V_C_TAX_CODE
							  from IAS_CASH_CUSTMR where CUST_CODE=P_CST_CSH_CODE and rownum<=1;
						       Exception when others then
							   Null;
						       End;
						       V_TAX_BILL_TYP:= CASE WHEN nvl(trim(V_C_TAX_CODE),'0')='0'  THEN 1 ELSE 2 END ;
						Else
						   V_TAX_BILL_TYP:=  CASE WHEN nvl(trim(V_C_TAX_CODE),'0')='0'	THEN 1 ELSE 2 END ;
						End If;
					     RETURN(V_TAX_BILL_TYP);
					EXCEPTION WHEN OTHERS THEN
					    RETURN(Null);
					END GET_CST_TAX_BILL_TYP_FNC;			    			 		
				 --=======================================================================
				 FUNCTION GET_INPT_PRCNT(P_CLC_TYP_NO	IN GNR_TAX_TYP_CLC_MST.CLC_TYP_NO%TYPE,
			    P_INPT_TYP	   IN GNR_TAX_INPT.INPT_TYP%TYPE,
			    P_INPT_CODE    IN GNR_TAX_INPT.INPT_CODE%TYPE)
	RETURN NUMBER
    IS
	V_TAX_PRCNT   POS_TAX_ITM_MOVMNT.TAX_PRCNT%TYPE;
    BEGIN

	--## Get Sum Tax Percent For Input
	SELECT SUM(NVL(TI.TAX_PRCNT, 0))
	  INTO V_TAX_PRCNT
	  FROM GNR_TAX_INPT TI, GNR_TAX_TYP_CLC_DTL TC, GNR_TAX_CODE_MST T
	 WHERE TI.TAX_NO = TC.TAX_NO
	   AND TI.TAX_NO = T.TAX_NO
	   AND TC.TAX_NO = T.TAX_NO
	   AND TC.CLC_TYP_NO = P_CLC_TYP_NO
	   AND TI.INPT_TYP = P_INPT_TYP
	   AND TI.INPT_CODE = P_INPT_CODE
	   AND NVL(T.INACTIVE, 0) = 0;

	RETURN (V_TAX_PRCNT);
    EXCEPTION
	WHEN OTHERS THEN
	    RETURN (0);
    END GET_INPT_PRCNT;
    ---------------------------------------------------------------------------------------------------------------
    PROCEDURE CLC_INPT_TAX_AFTR_SAVE(P_CLC_TYP_NO	  IN POS_TAX_INPT_MOVMNT.CLC_TYP_NO%TYPE,
				     P_DOC_TYP		  IN POS_TAX_INPT_MOVMNT.DOC_TYPE%TYPE, 																																  -- DOC_TYPE IN  IAS_SYS.IAS_DOCJV_TYPE_SYSTEMS
				     P_DOC_NO		  IN POS_TAX_INPT_MOVMNT.DOC_NO%TYPE,
				     P_DOC_SER		  IN POS_TAX_INPT_MOVMNT.DOC_SER%TYPE,
				     P_BILL_DOC_TYP	  IN POS_TAX_INPT_MOVMNT.BILL_DOC_TYPE%TYPE,
				     P_DOC_JV_TYP	  IN POS_TAX_INPT_MOVMNT.DOC_JV_TYPE%TYPE,
				     P_DOC_DATE 	  IN POS_TAX_INPT_MOVMNT.DOC_DATE%TYPE,
				     P_A_CY		  IN POS_TAX_INPT_MOVMNT.A_CY%TYPE,
				     P_AC_RATE		  IN POS_TAX_INPT_MOVMNT.AC_RATE%TYPE,
				     P_TBL_INPT_NM	  IN VARCHAR2,
				     P_TBL_MST_NM	  IN VARCHAR2 DEFAULT NULL,
				     P_TBL_DTL_NM	  IN VARCHAR2 DEFAULT NULL,
				     P_FLD_DOC_SER	  IN VARCHAR2,
				     P_FLD_DOC_AMT	  IN VARCHAR2 DEFAULT NULL,
				     P_FLD_DOC_SER_INPT   IN VARCHAR2,
				     P_FLD_TAX_A_CODE	  IN VARCHAR2,
				     P_INPT_TYP 	  IN NUMBER,
				     P_FLD_INPT_CODE	  IN VARCHAR2,
				     P_FLD_INPT_AMT	  IN VARCHAR2,
				     P_FLD_DOC_SEQ	  IN VARCHAR2,
				     P_CLC_DOC_TYP	  IN NUMBER,																																					-- CLC_DOC_TYP	1= SALES ,2 = PURCHASE ,
				     P_DR_CR_FLG	  IN NUMBER,
				     P_LNG_NO		  IN NUMBER)
    IS
	V_SLCT		     VARCHAR2(8000);
	V_WHR		     VARCHAR2(3000);
	V_FLD_CC_CODE	     VARCHAR2(100) := '''';
	V_FLD_PJ_NO	     VARCHAR2(100) := '''';
	V_FLD_ACTV_NO	     VARCHAR2(100) := '''';
	V_FLD_REF_NO	     VARCHAR2(100) := '''';
	V_FLD_DOC_SEQ_BILL   VARCHAR2(100) := '''';
	V_FLD_DOC_SEQ	     VARCHAR2(100) := '''';
	V_FLD_VAT_AMT	     VARCHAR2(100) := '''';
	V_TBL_TRNS	     VARCHAR2(100);
	V_CNT		     NUMBER := 0;
	 V_TBL_INPT	    VARCHAR2(100) := '''';

     V_FLD_INPT_CODE	 VARCHAR2(100) := '''';
     V_INPT_TYP   VARCHAR2(100) := '''';
    BEGIN
     --------------------------------------------------------------------------------------------------------------
			---- 171 FOR POS_GNR_EXPNS
			IF P_DOC_TYP IN (171) THEN
			   V_TBL_INPT:='GLS_TAX_ACC';
			 --- 81 CODE FROM  POS_GNR_EXPNS IN GNR_TAX_INPT
			   V_INPT_TYP:=P_INPT_TYP;
			   V_FLD_INPT_CODE:='A_CODE';
			ELSE
			   V_TBL_INPT:='GNR_TAX_INPT';
			   V_INPT_TYP:='TI.INPT_TYP';
			   V_FLD_INPT_CODE:='INPT_CODE';
			END IF;
       BEGIN
	    EXECUTE IMMEDIATE 'DELETE POS_TAX_INPT_MOVMNT WHERE DOC_TYPE=' || P_DOC_TYP || ' AND DOC_SER=' || P_DOC_SER || ' AND INPT_TYP=' || P_INPT_TYP;
	EXCEPTION
	    WHEN OTHERS THEN
		NULL;
	END;
	--------------------------------------------------------------------------------------------------------------
	IF P_DOC_TYP IN (4, 5, 52, 53) THEN
	    V_WHR := ' AND MB.' || P_FLD_DOC_SER || '=' || P_DOC_SER;
	    V_TBL_TRNS := ',' || P_TBL_MST_NM || ' MB';
	END IF;
	--------------------------------------------------------------------------------------------------------------
	IF IAS_DBS_SYS_PKG.CHECK_OBJECT(P_TBL_INPT_NM, 'TABLE', 'CC_CODE') = 1 THEN
	    V_FLD_CC_CODE := 'M.CC_CODE';
	ELSIF IAS_DBS_SYS_PKG.CHECK_OBJECT(P_TBL_MST_NM, 'TABLE', 'CC_CODE') = 1 AND P_DOC_TYP IN (4, 5, 52, 53) THEN
	    V_FLD_CC_CODE := 'MB.CC_CODE';
	ELSE
	    V_FLD_CC_CODE := 'NULL';
	END IF;
	IF IAS_DBS_SYS_PKG.CHECK_OBJECT(P_TBL_INPT_NM, 'TABLE', 'PJ_NO') = 1 THEN
	    V_FLD_PJ_NO := 'M.PJ_NO';
	ELSIF IAS_DBS_SYS_PKG.CHECK_OBJECT(P_TBL_MST_NM, 'TABLE', 'PJ_NO') = 1 AND P_DOC_TYP IN (4, 5, 52, 53) THEN
	    V_FLD_PJ_NO := 'MB.PJ_NO';
	ELSE
	    V_FLD_PJ_NO := 'NULL';
	END IF;
	IF IAS_DBS_SYS_PKG.CHECK_OBJECT(P_TBL_INPT_NM, 'TABLE', 'ACTV_NO') = 1 THEN
	    V_FLD_ACTV_NO := 'M.ACTV_NO';
	ELSIF IAS_DBS_SYS_PKG.CHECK_OBJECT(P_TBL_MST_NM, 'TABLE', 'ACTV_NO') = 1 AND P_DOC_TYP IN (4, 5, 52, 53) THEN
	    V_FLD_ACTV_NO := 'MB.ACTV_NO';
	ELSE
	    V_FLD_ACTV_NO := 'NULL';
	END IF;
	--------------------------------------------------------------------------------------------------------------
	IF IAS_DBS_SYS_PKG.CHECK_OBJECT(P_TBL_INPT_NM, 'TABLE', 'REF_NO') = 1 THEN
	    V_FLD_REF_NO := 'M.REF_NO';
	ELSE
	    V_FLD_REF_NO := 'NULL';
	END IF;
	IF P_FLD_DOC_SEQ IS NOT NULL THEN
	    V_FLD_DOC_SEQ := P_FLD_DOC_SEQ;
	ELSE
	    V_FLD_DOC_SEQ := '1';
	END IF;
	--------------------------------------------------------------------------------------------------------------
	BEGIN
	    V_SLCT :=
		'INSERT INTO POS_TAX_INPT_MOVMNT  ( DOC_TYPE,
						       DOC_NO,
						       DOC_SER,
						       BILL_DOC_TYPE,
						       DOC_JV_TYPE,
						       DOC_DATE,
						       TAX_NO,
						       CLC_TYP_NO,
						       AGNCY_NO,
						       VAT_CAT_CODE,
						       INPT_TYP,
						       INPT_CODE,
						       A_CODE,
						       A_CY,
						       AC_RATE,
						       INPT_AMT,
						       TAX_PRCNT,
						       TAX_AMT,
						       TAX_AMT_L,
						       CC_CODE,
						       PJ_NO,
						       ACTV_NO,
						       REF_NO,
						       RCRD_NO,
						       DR_CR_FLG,
						       TAX_PRD_NO,
						       DOC_SEQUENCE,
						       CMP_NO,
						       BRN_NO,
						       BRN_YEAR,
						       BRN_USR)
						SELECT ' || P_DOC_TYP || ',
						       ' || P_DOC_NO || ',
						       ' || P_DOC_SER || ',
						     ''' || P_BILL_DOC_TYP || ''',
						     ''' || P_DOC_JV_TYP || ''',
						     ''' || P_DOC_DATE || ''',
						       TI.TAX_NO,
						       TC.CLC_TYP_NO,
						       TI.AGNCY_NO,
						       TC.VAT_CAT_CODE,
						       ' || P_INPT_TYP || ',
						       ' || P_FLD_INPT_CODE || ',
						       ' || P_FLD_TAX_A_CODE || ',
						     ''' || P_A_CY || ''',
						       ' || P_AC_RATE || ',
						       ' || P_FLD_INPT_AMT || ',
						       NVL(TI.TAX_PRCNT,0),
						      (CASE WHEN  ' || P_DOC_TYP || ' IN (171) THEN NVL (ROUND ( '||P_FLD_INPT_AMT ||' - (  '||P_FLD_INPT_AMT||' / (  1 + ( TI.TAX_PRCNT / 100))), 2), 0)  ELSE   ((' || P_FLD_INPT_AMT || ')*NVL(TI.TAX_PRCNT,0))/100 END ),
						      (CASE WHEN  ' || P_DOC_TYP || ' IN (171) THEN NVL (ROUND ( '||P_FLD_INPT_AMT ||' - (  '||P_FLD_INPT_AMT||' / (  1 + ( TI.TAX_PRCNT / 100))), 2)*'|| P_AC_RATE ||', 0)  ELSE   (((' || P_FLD_INPT_AMT || ')*NVL(TI.TAX_PRCNT,0))/100)* '|| P_AC_RATE ||' END ),
						       ' || V_FLD_CC_CODE || ',
						       ' || V_FLD_PJ_NO || ',
						       ' || V_FLD_ACTV_NO || ',
						       ' || V_FLD_REF_NO || ',
						       1,
						       (CASE WHEN (NVL(' || P_FLD_INPT_AMT || ',0) < 0 AND ' || P_DOC_TYP || ' = 4) OR (NVL(' || P_FLD_INPT_AMT || ',0) >= 0 AND ' || P_DOC_TYP || ' = 5)  OR (NVL(' || P_FLD_INPT_AMT || ',0) >= 0 AND ' || P_DOC_TYP || ' = 171) THEN 1 ELSE -1 END),
						       YS_TAX_PKG.GET_TAX_PRD (P_DOC_DATE => ''' || P_DOC_DATE || '''),
						       ' || V_FLD_DOC_SEQ || ',
						       M.CMP_NO,
						       M.BRN_NO,
						       M.BRN_YEAR,
						       M.BRN_USR
						  FROM ' || P_TBL_INPT_NM || ' M,'|| V_TBL_INPT ||' TI,GNR_TAX_CODE_MST TM ,GNR_TAX_CODE_DTL TD ,GNR_TAX_TYP_CLC_DTL TC' || V_TBL_TRNS || '
						 WHERE ' || P_FLD_DOC_SER_INPT || '=' || P_DOC_SER || '
						   AND '|| V_INPT_TYP ||'=' || P_INPT_TYP || '
						   AND ' || P_FLD_INPT_CODE || '=TI.'|| V_FLD_INPT_CODE ||'
						   AND TI.TAX_NO     = TM.TAX_NO
						   AND TI.TAX_NO     = TD.TAX_NO
						   AND TI.AGNCY_NO   = TD.AGNCY_NO
						   AND TI.TAX_NO     = TC.TAX_NO
						   AND TM.TAX_NO     = TD.TAX_NO
						   AND TM.TAX_NO     = TC.TAX_NO
						   AND TD.TAX_NO     = TC.TAX_NO
						   AND NVL(TM.INACTIVE,0)=0
						 AND NVL(M.'||P_FLD_DOC_AMT||',0) <> 0
						   AND TC.CLC_TYP_NO = ' || P_CLC_TYP_NO || V_WHR || '
					      ORDER BY TI.TAX_NO,
						       TI.AGNCY_NO,
						       TI.'||V_FLD_INPT_CODE||'';
	END;
       --  insert into TST values (V_Slct);
	--commit;
	EXECUTE IMMEDIATE V_SLCT;
	----------------------------------------------------------------------------------------------------------
	--## Update Tax Tables For Document
	----------------------------------------------------------------------------------------------------------
	V_CNT := YS_GEN_PKG.GET_CNT('SELECT 1 FROM POS_TAX_INPT_MOVMNT
				      WHERE DOC_TYPE = ' || P_DOC_TYP || '
					AND DOC_SER  =''' || P_DOC_SER || '''
					AND ROWNUM <= 1');

	IF NVL(V_CNT, 0) > 0 THEN
	    IF UPPER(P_TBL_INPT_NM) <> UPPER('IAS_PI_BILL_EXPND') THEN

		------------------------------------------------------------------------------------------------------
		BEGIN

		    EXECUTE IMMEDIATE 'UPDATE ' || P_TBL_INPT_NM || ' M SET VAT_AMT = ( SELECT SUM(NVL(TAX_AMT,0))
											  FROM POS_TAX_INPT_MOVMNT
											 WHERE DOC_TYPE  = ' || P_DOC_TYP || '
											   AND DOC_SER	 = ' || P_DOC_SER || '
											   AND INPT_TYP  = ' || P_INPT_TYP || '
											   AND INPT_CODE = ' || P_FLD_INPT_CODE || ')
					  WHERE ' || P_FLD_DOC_SER_INPT || '=' || P_DOC_SER;
		EXCEPTION
		    WHEN OTHERS THEN
			NULL;
		END;
	    END IF;
	    -------------------------------------------------------------------------------------------------------
	    IF IAS_DBS_SYS_PKG.CHECK_OBJECT(P_TBL_MST_NM, 'TABLE', 'VAT_AMT_OTHR') = 1 THEN
		BEGIN

		    EXECUTE IMMEDIATE 'UPDATE ' || P_TBL_MST_NM || ' A SET VAT_AMT_OTHR =(SELECT SUM(NVL(VAT_AMT,0))
											    FROM ' || P_TBL_INPT_NM || ' M
											   WHERE ' || P_FLD_DOC_SER_INPT || '=A.' || P_FLD_DOC_SER || '
											     AND ' || P_FLD_DOC_SER_INPT || '=' || P_DOC_SER || ')
					WHERE ' || P_FLD_DOC_SER || '=' || P_DOC_SER;
		EXCEPTION
		    WHEN OTHERS THEN
			NULL;
		END;
	    END IF;
	    -------------------------------------------------------------------------------------------------------
	    IF IAS_DBS_SYS_PKG.CHECK_OBJECT(P_TBL_MST_NM, 'TABLE', 'VAT_AMT_OTHR') = 1 AND IAS_DBS_SYS_PKG.CHECK_OBJECT(P_TBL_DTL_NM, 'TABLE', 'VAT_AMT_OTHR') = 1 THEN

		BEGIN

		    EXECUTE IMMEDIATE 'UPDATE ' || P_TBL_DTL_NM || ' A SET VAT_AMT_OTHR = (CASE WHEN NVL(A.I_QTY,0) = 0 THEN 0
											   ELSE (SELECT (NVL(M.VAT_AMT_OTHR,0)/NVL(M.' || P_FLD_DOC_AMT || ',0))*NVL(A.I_PRICE,0)
												   FROM ' || P_TBL_MST_NM || ' M
												  WHERE ' || P_FLD_DOC_SER || '=A.' || P_FLD_DOC_SER || '
												    AND ' || P_FLD_DOC_SER || '=' || P_DOC_SER || ') END)
					WHERE ' || P_FLD_DOC_SER || '=' || P_DOC_SER;
		EXCEPTION
		    WHEN OTHERS THEN
			NULL;
		END;

	    END IF;
	-------------------------------------------------------------------------------------------------------
	END IF;
    EXCEPTION
	WHEN OTHERS THEN
	    RAISE_APPLICATION_ERROR(-20002, 'Err. When Calc. Tax Input:' || SQLERRM);
    END CLC_INPT_TAX_AFTR_SAVE;
    --------------------------------------------------------------------------------------------------------------------------------------------
    FUNCTION GET_TAX_PRD(P_DOC_DATE DATE)
	RETURN NUMBER
    IS
	V_PRD_NO       NUMBER(2);
	V_TAX_PRD_NO   NUMBER;
    BEGIN
	SELECT LTRIM(TO_CHAR(P_DOC_DATE, 'MM'), '0') INTO V_PRD_NO FROM DUAL;
	SELECT VAT_PRD_NO
	  INTO V_TAX_PRD_NO
	  FROM S_PRD_DTL
	 WHERE PRD_NO = V_PRD_NO;

	RETURN V_TAX_PRD_NO;
    EXCEPTION
	WHEN OTHERS THEN
	    RETURN NULL;
    END GET_TAX_PRD;
--##------------------------------------------------------------------------------------------------------------------------------------------
   FUNCTION GET_CLC_TYP_NO_ACTV_DATE(P_CLC_TYP_NO IN GNR_TAX_TYP_CLC_MST.CLC_TYP_NO%TYPE, P_BRN_NO IN S_BRN.BRN_NO%TYPE)
	RETURN DATE
    IS
	V_ACTV_DATE   DATE;
    BEGIN
	SELECT ACTV_DATE
	  INTO V_ACTV_DATE
	  FROM GNR_TAX_TYP_CLC_BRN
	 WHERE CLC_TYP_NO = P_CLC_TYP_NO AND BRN_NO = P_BRN_NO AND ROWNUM <= 1;

	IF V_ACTV_DATE IS NULL THEN
	    Begin
	    SELECT ACTIVE_VAT_DATE INTO V_ACTV_DATE FROM IAS_PARA_GEN;
	    EXCEPTION WHEN OTHERS THEN
	       NULL;
	    END;
	END IF;
	RETURN (V_ACTV_DATE);
    EXCEPTION
	WHEN OTHERS THEN
	    RETURN (NULL);
    END GET_CLC_TYP_NO_ACTV_DATE;
--##------------------------------------------------------------------------------------------------------------------------------------------
 End Ys_Tax_Pkg;
/
