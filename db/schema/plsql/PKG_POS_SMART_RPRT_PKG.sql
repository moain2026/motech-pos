-- =============================================
-- PACKAGE SPEC: POS_SMART_RPRT_PKG  (status: VALID)
-- =============================================
CREATE OR REPLACE
PACKAGE POS_SMART_RPRT_PKG IS
--##-------------------------------------------------------------------------------------------------------------------------##---
    PROCEDURE  GET_FTCH_CNVRT_ROW_DATA(P_CNVRT_TYP   IN NUMBER		    ,
				       P_USR_NO      IN NUMBER DEFAULT NULL ,
				       P_LANG_NO     IN NUMBER DEFAULT 1    ,
				       P_SQLTXT      IN CLOB		    ,
				       P_REF_CRSR    OUT SYS_REFCURSOR	);
--##-------------------------------------------------------------------------------------------------------------------------##---
    PROCEDURE  GET_KPI_INDCTR_ROW_DATA( P_CNVRT_TYP   IN NUMBER 	       ,
					P_SYS_CODE    IN VARCHAR2	       ,
					P_INDCTR_TYPE IN NUMBER 	       ,
					P_BRN_NO      IN NUMBER   DEFAULT NULL ,
					P_USR_NO      IN NUMBER   DEFAULT NULL ,
					P_LANG_NO     IN NUMBER   DEFAULT 1    ,
					P_REF_CRSR    OUT SYS_REFCURSOR  );
END POS_SMART_RPRT_PKG;
/

-- ---------------------------------------------
-- PACKAGE BODY: POS_SMART_RPRT_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE BODY POS_SMART_RPRT_PKG IS
--##-------------------------------------------------------------------------------------------------------------------------##---
    PROCEDURE  GET_FTCH_CNVRT_ROW_DATA(P_CNVRT_TYP   IN NUMBER		,
				       P_USR_NO      IN NUMBER DEFAULT NULL ,
				       P_LANG_NO     IN NUMBER DEFAULT 1 ,
				       P_SQLTXT      IN CLOB	    ,
				       P_REF_CRSR    OUT SYS_REFCURSOR	) IS
    BEGIN
      IF P_CNVRT_TYP = 1 THEN
      --------------------------------------------------------------------------  To Set Lang And User Dflt
	 Ias_Prmtr_Pkg.SetPval (P_Prmtr => 'LANG_DFLT',P_Val =>  P_LANG_NO);
	 Ias_Prmtr_Pkg.SetPval (P_Prmtr => 'USER_NO'  ,P_Val =>  P_USR_NO );
      --------------------------------------------------------------------------
	 OPEN P_REF_CRSR FOR P_SQLTXT;
      --------------------------------------------------------------------------
      END IF ;

    END GET_FTCH_CNVRT_ROW_DATA ;
--##-------------------------------------------------------------------------------------------------------------------------##---
    PROCEDURE  GET_KPI_INDCTR_ROW_DATA( P_CNVRT_TYP   IN NUMBER 	       ,
					P_SYS_CODE    IN VARCHAR2	       ,
					P_INDCTR_TYPE IN NUMBER 	       ,
					P_BRN_NO      IN NUMBER   DEFAULT NULL ,
					P_USR_NO      IN NUMBER   DEFAULT NULL ,
					P_LANG_NO     IN NUMBER   DEFAULT 1    ,
					P_REF_CRSR    OUT SYS_REFCURSOR  ) IS
    V_SQL     CLOB  ;
    V_WHR     VARCHAR2(2000);
    BEGIN
	IF P_INDCTR_TYPE = 80001 THEN			-- DAILY
	     V_WHR :=' AND M.BILL_DATE =TO_DATE(TO_CHAR(IAS_GEN_PKG.GET_CURDATE,''DD/MM/YYYY''),''DD/MM/YYYY'') ';
	ELSIF  P_INDCTR_TYPE = 80002 THEN		-- MONTHLY
	    V_WHR :='  AND M.PRD_NO =(SELECT PRD_NO FROM S_PRD_DTL
					       WHERE
					       TO_DATE(TO_CHAR(YS_GEN_PKG.GET_CURDATE,''DD/MM/YYYY''),''DD/MM/YYYY'') BETWEEN F_DATE AND T_DATE AND ROWNUM <= 1) ';
	ELSIF  P_INDCTR_TYPE = 80003 THEN		-- PERIOD
	    V_WHR :='  AND M.BILL_DATE	BETWEEN YS_GEN_PKG.GET_FRST_DAY AND YS_GEN_PKG.GET_FINAL_DAY ';
	END IF;

	IF P_INDCTR_TYPE IS NOT NULL AND V_WHR IS NOT NULL THEN
	    BEGIN
		 V_SQL :='    SELECT M.BRN_YEAR,
				     M.BILL_DATE,
				     M.PRD_NM,
				     M.HALF_NO,
				     M.QRTR_NO,
				     M.WEEK_NO,
				     M.BRN_NM,
				     M.BILL_NO,
				     M.BILL_TYPE_NM,
				     M.A_CY,
				     M.CSH_NM,
				     M.AD_U_ID_NM,
				     M.PAID_U_ID_NM,
				     M.MACHINE_NM,
				     M.W_NM,
				     M.GRP_NM,
				     M.MNG_GRP_NM,
				     M.SUBG_GRP_NM,
				     M.ASSTNT_GRP_NM,
				     M.I_CODE,
				     M.I_NM,
				     M.ITM_MAIN_UNT,
				     M.SAL_P_QTY,
				     M.SAL_PFREE_QTY,
				     M.SAL_TOTAL_AMT,
				     M.SAL_TOTAL_AMT_L,
				     M.RT_SAL_P_QTY,
				     M.RT_SAL_PFREE_QTY,
				     M.RT_SAL_TOTAL_AMT,
				     M.RT_SAL_TOTAL_AMT_L,
				     M.SAL_P_QTY - RT_SAL_P_QTY NET_SAL_P_QTY,
				     M.SAL_PFREE_QTY - RT_SAL_PFREE_QTY NET_SAL_PFREE_QTY,
				     M.SAL_TOTAL_AMT - RT_SAL_TOTAL_AMT NET_SAL_AMT,
				     M.SAL_TOTAL_AMT_L - RT_SAL_TOTAL_AMT_L NET_SAL_AMT_L
				FROM POS_KPI_DTL_VW M
			     WHERE     1 = 1  '||V_WHR||'
				   AND EXISTS
					   (SELECT 1
					      FROM S_BRN_USR_PRIV
					     WHERE     S_BRN_USR_PRIV.BRN_NO = M.BRN_NO
						   AND VIEW_FLAG = 1
						   AND U_ID = '||P_USR_NO||'
						   AND ROWNUM <= 1)
				   AND EXISTS
					   (SELECT 1
					      FROM PRIVILEGE_WH
					     WHERE     PRIVILEGE_WH.W_CODE = M.W_CODE
						   AND VIEW_FLAG = 1
						   AND U_ID = '||P_USR_NO||'
						   AND ROWNUM <= 1)
				   AND EXISTS
					   (SELECT 1
					      FROM PRIVILEGE_GC
					     WHERE     PRIVILEGE_GC.G_CODE = M.G_CODE
						   AND VIEW_FLAG = 1
						   AND U_ID = '||P_USR_NO||'
						    AND ROWNUM <= 1)
				   AND EXISTS
					   (SELECT 1
					      FROM IAS_POS_PRIV_MACHINE
					     WHERE     U_ID = '||P_USR_NO||'
						   AND MACHINE_NO = M.MACHINE_NO
						   AND USED = 1
						   AND ROWNUM <= 1)
				   AND EXISTS
					   (SELECT 1
					      FROM PRIV_CASH
					     WHERE     U_ID = '||P_USR_NO||'
						   AND CASH_NO = M.CSH_NO
						   AND A_CY = M.A_CY
						   AND VIEW_FLAG = 1
						   AND CASH_TYPE = 1
						   AND ROWNUM <= 1)
				   AND (   EXISTS
					       (SELECT 1
						  FROM IAS_PRIV_CUSTOMER
						 WHERE	   IAS_PRIV_CUSTOMER.C_CODE = M.CSTMR_CODE
						       AND VIEW_FLAG = 1
						       AND U_ID = '||P_USR_NO||'
						       AND ROWNUM <= 1)
					OR M.CSTMR_CODE IS NULL)';
	    EXCEPTION
		WHEN OTHERS THEN
		    RAISE_APPLICATION_ERROR(-20001, IAS_GEN_PKG.GET_MSG(P_LANG_NO, 6765)||' POS_KPI_DTL_VW '||CHR(10)|| SQLERRM);
	    END;
	    OPEN P_REF_CRSR FOR V_SQL;
	END IF;
    END GET_KPI_INDCTR_ROW_DATA ;
END POS_SMART_RPRT_PKG;
/
