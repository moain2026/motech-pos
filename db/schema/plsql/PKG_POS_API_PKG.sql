-- =============================================
-- PACKAGE SPEC: POS_API_PKG  (status: INVALID)
-- =============================================
CREATE OR REPLACE
PACKAGE POS_API_PKG IS
    --##------------------------------------------------------------------------------------------------------------------------------##--
      V_USE_PAY_CASH_RT_BILLS  IAS_PARA_POS.USE_PAY_CASH_RT_BILLS%TYPE;
      G_USE_PAID_BILLS	       NUMBER;
      V_CALC_VAT_AMT_TYPE      IAS_PARA_AR.CALC_VAT_AMT_TYPE%TYPE;
      V_Use_Pos_Point_Sys      NUMBER;
      V_Point_Age_Expired_Typ  NUMBER;
      V_Point_Age_Expired_Prd  NUMBER;
      G_USE_PRICE_INCLUDE_VAT  NUMBER;
      G_CLC_TYP_NO_TAX	       NUMBER;
      G_MACHINE_NO	       NUMBER;
      G_SRVR_NO 	       NUMBER;
      G_CC_CODE_DFLT	       IAS_POS_BILL_MST.CC_CODE%TYPE;
      G_ACTV_NO_DFLT	       IAS_POS_BILL_MST.ACTV_NO%TYPE;
      G_PJ_NO_DFLT	       IAS_POS_BILL_MST.PJ_NO%TYPE;
      G_WCODE_DFLT	       IAS_POS_BILL_MST.W_CODE%TYPE;
      G_USE_VAT_MCHN	       NUMBER;
      G_Use_Vat 	       NUMBER;
      G_Chk_Itm_Price	       NUMBER;
      G_LVL_PRICE_NO	       NUMBER;
      G_WCODE		       NUMBER;
      G_BRN_NO		       NUMBER;
      G_C_Code		       NUMBER;
      G_Cur_Code	       Ex_Rate.Cur_Code%Type;
      G_Cur_Rate	       Ex_Rate.Cur_Rate%Type;
      --G_Stk_Cur_Code		      Ex_Rate.Cur_Code%Type := Ias_Gen_Pkg.Get_Stk_Cur;
      --G_Stk_Rate		      Ex_Rate.Cur_Rate%Type := Ias_Gen_Pkg.Get_Cur_Rate (P_Acy => G_Stk_Cur_Code);
      G_Ad_U_Id 	       User_R.U_Id%Type;
      G_Clc_Vat_Price_Typ      NUMBER;
      G_BILL_TYPE	       NUMBER;
      G_CHCK_AVL_QTY	       NUMBER;
      G_LNG_NO		       NUMBER;
      G_NO_OF_DECIMAL_AR       NUMBER;
      V_MSG_NO		       IAS_MSGS.MSG_NO%TYPE;
      G_MSG_TXT 	       VARCHAR2(500);
      V_LBL_NO		       IAS_LABELS.LABEL_NO%TYPE;
      V_Err_No		       NUMBER;
      G_Pkg_Nm		       VARCHAR2(100);
      G_BILL_SRL	       IAS_POS_BILL_MST.BILL_SRL%TYPE;
      G_BILL_NO 	       IAS_POS_BILL_MST.BILL_NO%TYPE;
      G_DOC_MCHN_SQ	       IAS_POS_BILL_MST.DOC_MCHN_SQ%TYPE;
      G_BILL_DATE	       IAS_POS_BILL_MST.BILL_DATE%TYPE;
      G_BILL_TIME	       IAS_POS_BILL_MST.BILL_TIME%TYPE;
      G_SAVE_TYP	       NUMBER;
      G_RT_BILL_SRL	       IAS_POS_RT_BILL_MST.BILL_SRL%TYPE;
      G_RT_BILL_NO	       IAS_POS_RT_BILL_MST.BILL_NO%TYPE;
      G_RT_BILL_DATE	       IAS_POS_RT_BILL_MST.RT_BILL_DATE%TYPE;
      G_RT_BILL_TIME	       IAS_POS_RT_BILL_MST.RT_BILL_TIME%TYPE;
      G_TOT_ITM_PRICE	       NUMBER;
      G_TOT_ITM_PRICE_VAT      NUMBER;
      G_DISC_CARD_NO	       NUMBER;
      G_TOT_DISC_DTL	       NUMBER;
      G_TOT_DISC_DTL_VAT       NUMBER;
      G_DISC_AMT_MST	       NUMBER;
      G_DISC_AMT_MST_VAT       NUMBER;
      G_DISC_AMT_DTL	       NUMBER;
      G_DIS_AMT_MD	       NUMBER;
      G_AMT_ROUNDED_AS_DISC    NUMBER;
      G_DIS_AMT_NO_CHK_PRV     NUMBER;
      G_DISC_CARD_PRCNT        NUMBER;
      G_SUM_PRICE_WITH_PRM     NUMBER;
      G_MOBILE_NO	       IAS_POS_BILL_MST.MOBILE_NO%TYPE;
      G_CLC_DISC_CARD_TYP      NUMBER:=3;
      G_CLC_SI_DISC_WITHOUT_ITM_DISC NUMBER;
      G_CLC_TAX_EXTRNAL_FLG    NUMBER;
      G_TAX_BILL_TYP	       NUMBER;
      G_DOC_UUID	       IAS_POS_BILL_MST.WEB_SRVC_UUID%Type;
      G_USE_WRK_SHFT	       NUMBER;
    --##------------------------------------------------------------------------------------------------------------------------------##--
    FUNCTION LOAD_PRMTRS RETURN VARCHAR2;
    --##------------------------------------------------------------------------------------------------------------------------------##--
    FUNCTION  GET_BRN_XML (P_DVC_SRL  In VARCHAR2
			  ,P_LNG_NO IN NUMBER DEFAULT 1 ) RETURN CLOB	;
    --##------------------------------------------------------------------------------------------------------------------------------##--
    FUNCTION  GET_IAS_PARA_POS_XML ( P_LNG_NO IN NUMBER DEFAULT 1 ) RETURN CLOB   ;
    --##------------------------------------------------------------------------------------------------------------------------------##--
    FUNCTION  GET_IAS_PARA_GEN_XML ( P_LNG_NO IN NUMBER DEFAULT 1 ) RETURN CLOB   ;
    --##------------------------------------------------------------------------------------------------------------------------------##--
    FUNCTION  GET_IAS_PARA_AR_XML ( P_LNG_NO IN NUMBER DEFAULT 1 ) RETURN CLOB	 ;
    --##------------------------------------------------------------------------------------------------------------------------------##--
    FUNCTION  GET_POS_MACHINE_XML ( P_DVC_SRL  In VARCHAR2 ) RETURN CLOB   ;
    --##------------------------------------------------------------------------------------------------------------------------------##--
    FUNCTION  GET_POS_PRIV_MACHINE_XML ( P_DVC_SRL  In VARCHAR2 ) RETURN CLOB	;
    --##------------------------------------------------------------------------------------------------------------------------------##--
    FUNCTION  GET_POS_USR_PRV_XML ( P_DVC_SRL  In VARCHAR2 ) RETURN CLOB   ;
    --##------------------------------------------------------------------------------------------------------------------------------##--
    FUNCTION  GET_EMP_NO_XML( P_DVC_SRL  In VARCHAR2
			      ,P_LNG_NO IN NUMBER DEFAULT 1
			       ) RETURN CLOB   ;
    --##------------------------------------------------------------------------------------------------------------------------------##--
    PROCEDURE INSRT_IAS_POS_BILL_MST(P_BILL_NO		  IN IAS_POS_BILL_MST.BILL_NO%TYPE
				    ,P_BILL_DATE	  IN IAS_POS_BILL_MST.BILL_DATE%TYPE
				    ,P_A_CY		  IN IAS_POS_BILL_MST.A_CY%TYPE
				    ,P_BILL_TIME	  IN IAS_POS_BILL_MST.BILL_TIME%TYPE
				    ,P_BILL_TYPE	  IN IAS_POS_BILL_MST.BILL_TYPE%TYPE
				    ,P_SI_TYPE		  IN IAS_POS_BILL_MST.SI_TYPE%TYPE	       DEFAULT NULL
				    ,P_C_CODE		  IN IAS_POS_BILL_MST.C_CODE%TYPE	       DEFAULT NULL
				    ,P_EMP_NO		  IN IAS_POS_BILL_MST.EMP_NO%TYPE	       DEFAULT NULL
				    ,P_MOBILE_NO	  IN IAS_POS_BILL_MST.MOBILE_NO%TYPE	       DEFAULT NULL
				    ,P_CUST_CODE	  IN IAS_POS_BILL_MST.CUST_CODE%TYPE	       DEFAULT NULL
				    ,P_BILL_RATE	  IN IAS_POS_BILL_MST.BILL_RATE%TYPE
				    ,P_BILL_AMT 	  IN IAS_POS_BILL_MST.BILL_AMT%TYPE	       DEFAULT NULL
				    ,P_CLC_TYP_NO_TAX	  IN IAS_POS_BILL_MST.CLC_TYP_NO_TAX%TYPE      DEFAULT NULL
				    ,P_POSTED		  IN IAS_POS_BILL_MST.POSTED%TYPE	       DEFAULT 0
				    ,P_BILL_NOTE	  IN IAS_POS_BILL_MST.BILL_NOTE%TYPE	       DEFAULT NULL
				    ,P_MACHINE_NO	  IN IAS_POS_BILL_MST.MACHINE_NO%TYPE	       DEFAULT NULL
				    ,P_SRVR_NO		  IN IAS_POS_BILL_MST.SRVR_NO%TYPE	       DEFAULT NULL
				    ,P_HUNG		  IN IAS_POS_BILL_MST.HUNG%TYPE 	       DEFAULT 0
				    ,P_PAYED_AMT	  IN IAS_POS_BILL_MST.PAYED_AMT%TYPE	       DEFAULT NULL
				    ,P_VAT_AMT		  IN IAS_POS_BILL_MST.VAT_AMT%TYPE	       DEFAULT 0
				    ,P_DISC_AMT 	  IN IAS_POS_BILL_MST.DISC_AMT%TYPE	       DEFAULT NULL
				    ,P_DISC_AMT_MST	  IN IAS_POS_BILL_MST.DISC_AMT_MST%TYPE        DEFAULT NULL
				    ,P_DISC_AMT_DTL	  IN IAS_POS_BILL_MST.DISC_AMT_DTL%TYPE        DEFAULT NULL
				    ,P_DISC_AMT_AFTR_VAT  IN IAS_POS_BILL_MST.DISC_AMT_AFTR_VAT %TYPE  DEFAULT NULL
				    ,P_W_CODE		  IN IAS_POS_BILL_MST.W_CODE%TYPE	       DEFAULT NULL
				    ,P_PAID_U_ID	  IN IAS_POS_BILL_MST.PAID_U_ID%TYPE	       DEFAULT NULL
				    ,P_PAID_DATE	  IN IAS_POS_BILL_MST.PAID_DATE%TYPE	       DEFAULT NULL
				    ,P_REP_CODE 	  IN IAS_POS_BILL_MST.REP_CODE%TYPE	       DEFAULT NULL
				    ,P_CARD_AMT 	  IN IAS_POS_BILL_MST.CARD_AMT%TYPE	       DEFAULT NULL
				    ,P_CHEQUE_NO	  IN IAS_POS_BILL_MST.CHEQUE_NO%TYPE	       DEFAULT NULL
				    ,P_CHEQUE_AMT	  IN IAS_POS_BILL_MST.CHEQUE_AMT%TYPE	       DEFAULT NULL
				    ,P_CHEQUE_DUE_DATE	  IN IAS_POS_BILL_MST.CHEQUE_DUE_DATE%TYPE     DEFAULT NULL
				    ,P_CREDIT_CARD	  IN IAS_POS_BILL_MST.CREDIT_CARD%TYPE	       DEFAULT NULL
				    ,P_CR_CARD_NO	  IN IAS_POS_BILL_MST.CR_CARD_NO%TYPE	       DEFAULT NULL
				    ,P_CR_CARD_AMT	  IN IAS_POS_BILL_MST.CR_CARD_AMT%TYPE	       DEFAULT NULL
				    ,P_CR_CARD_COMM_PER   IN IAS_POS_BILL_MST.CR_CARD_COMM_PER%TYPE	DEFAULT NULL
				    ,P_CR_CARD_NO_SCND	  IN IAS_POS_BILL_MST.CR_CARD_NO_SCND%TYPE     DEFAULT NULL
				    ,P_CR_CARD_AMT_SCND   IN IAS_POS_BILL_MST.CR_CARD_AMT_SCND%TYPE    DEFAULT NULL
				    ,P_CR_CARD_COMM_PER_SCND   IN IAS_POS_BILL_MST.CR_CARD_COMM_PER_SCND%TYPE	  DEFAULT NULL
				    ,P_CR_CARD_NO_THRD	  IN IAS_POS_BILL_MST.CR_CARD_NO_THRD%TYPE     DEFAULT NULL
				    ,P_CR_CARD_AMT_THRD   IN IAS_POS_BILL_MST.CR_CARD_AMT_THRD%TYPE    DEFAULT NULL
				    ,P_CR_CARD_COMM_PER_THRD IN IAS_POS_BILL_MST.CR_CARD_COMM_PER_THRD%TYPE	DEFAULT NULL
				    ,P_CR_VALUE_DATE	  IN IAS_POS_BILL_MST.CR_VALUE_DATE%TYPE       DEFAULT NULL
				    ,P_CR_VALUE_DATE_SCND IN IAS_POS_BILL_MST.CR_VALUE_DATE_SCND%TYPE  DEFAULT NULL
				    ,P_CR_VALUE_DATE_THRD IN IAS_POS_BILL_MST.CR_VALUE_DATE_THRD%TYPE  DEFAULT NULL
				    ,P_CR_CARD_CST_NO	   IN IAS_POS_BILL_MST.CR_CARD_CST_NO%TYPE  DEFAULT NULL
				    ,P_CR_CARD_CST_NO_SCND IN IAS_POS_BILL_MST.CR_CARD_CST_NO_SCND%TYPE  DEFAULT NULL
				    ,P_CR_CARD_CST_NO_THRD IN IAS_POS_BILL_MST.CR_CARD_CST_NO_THRD%TYPE  DEFAULT NULL
				    ,P_CASH_NO		  IN IAS_POS_BILL_MST.CASH_NO%TYPE	       DEFAULT NULL
				    ,P_FIELD1		  IN IAS_POS_BILL_MST.FIELD1%TYPE	       DEFAULT NULL
				    ,P_FIELD2		  IN IAS_POS_BILL_MST.FIELD2%TYPE	       DEFAULT NULL
				    ,P_FIELD3		  IN IAS_POS_BILL_MST.FIELD3%TYPE	       DEFAULT NULL
				    ,P_FIELD4		  IN IAS_POS_BILL_MST.FIELD4%TYPE	       DEFAULT NULL
				    ,P_FIELD5		  IN IAS_POS_BILL_MST.FIELD5%TYPE	       DEFAULT NULL
				    ,P_PAID_BILL	  IN IAS_POS_BILL_MST.PAID_BILL%TYPE	       DEFAULT NULL
				    ,P_AD_U_ID		  IN IAS_POS_BILL_MST.AD_U_ID%TYPE
				    ,P_AD_DATE		  IN IAS_POS_BILL_MST.AD_DATE%TYPE
				    ,P_UP_U_ID		  IN IAS_POS_BILL_MST.UP_U_ID%TYPE	       DEFAULT NULL
				    ,P_UP_DATE		  IN IAS_POS_BILL_MST.UP_DATE%TYPE	       DEFAULT NULL
				    ,P_UP_CNT		  IN IAS_POS_BILL_MST.UP_CNT%TYPE	       DEFAULT NULL
				    ,P_PR_REP		  IN IAS_POS_BILL_MST.PR_REP%TYPE	       DEFAULT NULL
				    ,P_CMP_NO		  IN IAS_POS_BILL_MST.CMP_NO%TYPE	       DEFAULT NULL
				    ,P_BRN_NO		  IN IAS_POS_BILL_MST.BRN_NO%TYPE
				    ,P_BRN_YEAR 	  IN IAS_POS_BILL_MST.BRN_YEAR%TYPE	       DEFAULT NULL
				    ,P_BRN_USR		  IN IAS_POS_BILL_MST.BRN_USR%TYPE	       DEFAULT NULL
				    ,P_POINT_TYP_NO	  IN IAS_POS_BILL_MST.POINT_TYP_NO%TYPE        DEFAULT NULL
				    ,P_POINT_CALC_TYP_NO  IN IAS_POS_BILL_MST.POINT_CALC_TYP_NO%TYPE   DEFAULT NULL
				    ,P_POINT_RPLC_AMT	  IN IAS_POS_BILL_MST.POINT_RPLC_AMT%TYPE      DEFAULT NULL
				    ,P_AD_TRMNL_NM	  IN IAS_POS_BILL_MST.AD_TRMNL_NM%TYPE	       DEFAULT NULL
				    ,P_UP_TRMNL_NM	  IN IAS_POS_BILL_MST.UP_TRMNL_NM%TYPE	       DEFAULT NULL
				    ,P_CRD_NO		  IN IAS_POS_BILL_MST.CRD_NO%TYPE	  DEFAULT NULL
				    ,P_CRD_DISC_PER	  IN IAS_POS_BILL_MST.CRD_DISC_PER%TYPE 	DEFAULT NULL
				    ,P_QT_PRM_NO	  IN IAS_POS_BILL_MST.QT_PRM_NO%TYPE	     DEFAULT NULL
				    ,P_QT_PRM_SER	  IN IAS_POS_BILL_MST.QT_PRM_SER%TYPE	      DEFAULT NULL
				    ,P_QT_PRM_RCRD_NO	  IN IAS_POS_BILL_MST.QT_PRM_RCRD_NO%TYPE	  DEFAULT NULL
				    ,P_ASS_AMT		  IN IAS_POS_BILL_MST.ASS_AMT%TYPE	   DEFAULT NULL
				    ,P_PYMNT_AC 	  IN IAS_POS_BILL_MST.PYMNT_AC%TYPE	    DEFAULT NULL
				    ,P_AC_CODE		  IN IAS_POS_BILL_MST.AC_CODE%TYPE	   DEFAULT NULL
				    ,P_AC_DTL_TYP	  IN IAS_POS_BILL_MST.AC_DTL_TYP%TYPE	      DEFAULT NULL
				    ,P_AC_CODE_DTL	  IN IAS_POS_BILL_MST.AC_CODE_DTL%TYPE	       DEFAULT NULL
				    ,P_AC_AMT		  IN IAS_POS_BILL_MST.AC_AMT%TYPE	  DEFAULT NULL
				    ,P_OTHR_AMT 	  IN IAS_POS_BILL_MST.OTHR_AMT%TYPE	    DEFAULT NULL
				    ,P_CLC_TAX_FREE_QTY_FLG IN IAS_POS_BILL_MST.CLC_TAX_FREE_QTY_FLG%TYPE   DEFAULT NULL
				    ,P_CR_CARD_GROUP_NO     IN IAS_POS_BILL_MST.CR_CARD_GROUP_NO%TYPE	    DEFAULT NULL
				    ,P_CC_CODE		    IN IAS_POS_BILL_MST.CC_CODE%TYPE	   DEFAULT NULL
				    ,P_PJ_NO		    IN IAS_POS_BILL_MST.PJ_NO%TYPE	   DEFAULT NULL
				    ,P_ACTV_NO		    IN IAS_POS_BILL_MST.ACTV_NO%TYPE	   DEFAULT NULL
				    ,P_DOC_SER_EXTRNL	    IN IAS_POS_BILL_MST.DOC_SER_EXTRNL%TYPE	    DEFAULT NULL
				    ,P_REF_NO		    IN IAS_POS_BILL_MST.REF_NO%TYPE	    DEFAULT NULL
				    ,P_DOC_MCHN_SQ	    IN IAS_POS_BILL_MST.DOC_MCHN_SQ%TYPE  DEFAULT NULL
				    ,P_EXTERNAL_POST	    IN IAS_POS_BILL_MST.DOC_MCHN_SQ%TYPE  DEFAULT NULL
				    ,P_C_TAX_CODE	    IN IAS_POS_BILL_MST.C_TAX_CODE%TYPE  DEFAULT NULL
				    ,P_LNG_NO		    IN NUMBER DEFAULT 1
				    ,P_CLC_TAX_EXTRNAL_FLG  IN NUMBER  DEFAULT 0  --0 CALC TAX EXTRNAL 1 CALC TAX IN SAVE
				    ,P_SAVE_TYP 	    IN NUMBER  DEFAULT 0  --## 0 INSERT OFFLINE BILL 1 INSERT ONLINE BILL
				    );
    --##------------------------------------------------------------------------------------------------------------------------------##--
    PROCEDURE INSRT_IAS_POS_BILL_DTL(P_BILL_NO	       IN IAS_POS_BILL_DTL.BILL_NO%TYPE
				    ,P_I_CODE	       IN IAS_POS_BILL_DTL.I_CODE%TYPE
				    ,P_I_QTY	       IN IAS_POS_BILL_DTL.I_QTY%TYPE
				    ,P_ITM_UNT	       IN IAS_POS_BILL_DTL.ITM_UNT%TYPE
				    ,P_P_SIZE	       IN IAS_POS_BILL_DTL.P_SIZE%TYPE
				    ,P_P_QTY	       IN IAS_POS_BILL_DTL.P_QTY%TYPE			   DEFAULT NULL
				    ,P_I_PRICE	       IN IAS_POS_BILL_DTL.I_PRICE%TYPE
				    ,P_DIS_PER	       IN IAS_POS_BILL_DTL.DIS_PER%TYPE 		   DEFAULT NULL
				    ,P_DIS_AMT	       IN IAS_POS_BILL_DTL.DIS_AMT%TYPE 		   DEFAULT NULL
				    ,P_DIS_AMT_MST     IN IAS_POS_BILL_DTL.DIS_AMT_MST%TYPE		   DEFAULT NULL
				    ,P_DIS_AMT_DTL     IN IAS_POS_BILL_DTL.DIS_AMT_DTL%TYPE		   DEFAULT NULL
				    ,P_VAT_PER	       IN IAS_POS_BILL_DTL.VAT_PER%TYPE 		   DEFAULT NULL
				    ,P_VAT_AMT	       IN IAS_POS_BILL_DTL.VAT_AMT%TYPE 		   DEFAULT NULL
				    ,P_BATCH_NO        IN IAS_POS_BILL_DTL.BATCH_NO%TYPE		   DEFAULT NULL
				    ,P_EXPIRE_DATE     IN IAS_POS_BILL_DTL.EXPIRE_DATE%TYPE		   DEFAULT NULL
				    ,P_BARCODE	       IN IAS_POS_BILL_DTL.BARCODE%TYPE 		   DEFAULT NULL
				    ,P_W_CODE	       IN IAS_POS_BILL_DTL.W_CODE%TYPE			   DEFAULT NULL
				    ,P_SERVICE_ITEM    IN IAS_POS_BILL_DTL.SERVICE_ITEM%TYPE		   DEFAULT NULL
				    ,P_FREE_QTY        IN IAS_POS_BILL_DTL.FREE_QTY%TYPE		   DEFAULT NULL
				    ,P_RCRD_NO	       IN IAS_POS_BILL_DTL.RCRD_NO%TYPE 		   DEFAULT NULL
				    ,P_CMP_NO	       IN IAS_POS_BILL_DTL.CMP_NO%TYPE			   DEFAULT NULL
				    ,P_BRN_NO	       IN IAS_POS_BILL_DTL.BRN_NO%TYPE			   DEFAULT NULL
				    ,P_BRN_YEAR        IN IAS_POS_BILL_DTL.BRN_YEAR%TYPE		   DEFAULT NULL
				    ,P_BRN_USR	       IN IAS_POS_BILL_DTL.BRN_USR%TYPE 		   DEFAULT NULL
				    ,P_I_PRICE_VAT     IN IAS_POS_BILL_DTL.I_PRICE_VAT%TYPE		   DEFAULT NULL
				    ,P_FIELD_DTL1      IN IAS_POS_BILL_DTL.FIELD_DTL1%TYPE		   DEFAULT NULL
				    ,P_FIELD_DTL2      IN IAS_POS_BILL_DTL.FIELD_DTL2%TYPE		   DEFAULT NULL
				    ,P_FIELD_DTL3      IN IAS_POS_BILL_DTL.FIELD_DTL3%TYPE		   DEFAULT NULL
				    ,P_FIELD_DTL4      IN IAS_POS_BILL_DTL.FIELD_DTL4%TYPE		   DEFAULT NULL
				    ,P_DIS_AMT_DTL_HL_PRM   IN IAS_POS_BILL_DTL.DIS_AMT_DTL_HL_PRM%TYPE    DEFAULT NULL
				    ,P_QT_I_QTY 	    IN IAS_POS_BILL_DTL.QT_I_QTY%TYPE		   DEFAULT NULL
				    ,P_DIS_AMT_DTL_VAT	    IN IAS_POS_BILL_DTL.DIS_AMT_DTL_VAT%TYPE	   DEFAULT NULL
				    ,P_DIS_AFTR_VAT_MST     IN IAS_POS_BILL_DTL.DIS_AFTR_VAT_MST%TYPE	   DEFAULT NULL
				    ,P_DIS_AMT_MST_VAT	    IN IAS_POS_BILL_DTL.DIS_AMT_MST_VAT%TYPE	   DEFAULT NULL
				    ,P_VAT_AMT_DIS_DTL_VAT  IN IAS_POS_BILL_DTL.VAT_AMT_DIS_DTL_VAT%TYPE   DEFAULT NULL
				    ,P_VAT_AMT_AFTR_DIS     IN IAS_POS_BILL_DTL.VAT_AMT_AFTR_DIS%TYPE	   DEFAULT NULL
				    ,P_VAT_AMT_BFR_DIS	    IN IAS_POS_BILL_DTL.VAT_AMT_BFR_DIS%TYPE	   DEFAULT NULL
				    ,P_VAT_AMT_DIS_MST_VAT  IN IAS_POS_BILL_DTL.VAT_AMT_DIS_MST_VAT%TYPE   DEFAULT NULL
				    ,P_QT_PRM_RCRD_NO	    IN IAS_POS_BILL_DTL.QT_PRM_RCRD_NO%TYPE	   DEFAULT NULL
				    ,P_QT_PRM_SER	    IN IAS_POS_BILL_DTL.QT_PRM_SER%TYPE 	   DEFAULT NULL
				    ,P_QT_PRM_NO	    IN IAS_POS_BILL_DTL.QT_PRM_NO%TYPE		   DEFAULT NULL
				    ,P_DOC_D_SEQ	    IN IAS_POS_BILL_DTL.DOC_D_SEQ%TYPE		   DEFAULT NULL
				    ,P_PRM_GRP_NO	    IN IAS_POS_BILL_DTL.PRM_GRP_NO%TYPE 	   DEFAULT NULL
				    ,P_QR_CODE		    IN IAS_POS_BILL_DTL.QR_CODE%TYPE		   DEFAULT NULL
				    ,P_OTHR_AMT 	    IN IAS_POS_BILL_DTL.OTHR_AMT%TYPE		   DEFAULT NULL
				    ,P_EMP_NO		    IN IAS_POS_BILL_DTL.EMP_NO%TYPE		   DEFAULT NULL
				    ,P_SERIALNO 	    IN IAS_POS_BILL_DTL.SERIALNO%TYPE		   DEFAULT NULL
				    ,P_LVL_PRICE_NO	    IN NUMBER DEFAULT NULL
				    );
    --##------------------------------------------------------------------------------------------------------------------------------##--
    PROCEDURE EXTRCT_POS_BILL_PRC(P_XML in	 CLOB,
				  P_JSON_RSLT	       OUT CLOB    ) ;
    --##------------------------------------------------------------------------------------------------------------------------------##--
    FUNCTION  GET_I_Code_XML ( P_USR_NO  In Number
			      ,P_LNG_NO IN NUMBER DEFAULT 1
			      ,P_I_CODE IN VARCHAR2 DEFAULT Null
			      ,P_I_NAME IN VARCHAR2 DEFAULT Null ) RETURN CLOB	 ;
    --##-----------------------------------------------------------------------------------------------------##--
PROCEDURE INSRT_IAS_POS_RT_BILL_MST( P_RT_BILL_NO IN IAS_POS_RT_BILL_MST.RT_BILL_NO%TYPE
	    ,P_RT_BILL_DATE	      IN IAS_POS_RT_BILL_MST.RT_BILL_DATE%TYPE
	    ,P_RT_BILL_TIME	      IN IAS_POS_RT_BILL_MST.RT_BILL_TIME%TYPE
	    ,P_RT_BILL_TYPE	      IN IAS_POS_RT_BILL_MST.RT_BILL_TYPE%TYPE
	    ,P_SR_TYPE		      IN IAS_POS_RT_BILL_MST.SR_TYPE%TYPE	      DEFAULT NULL
	    ,P_EMP_NO		      IN IAS_POS_RT_BILL_MST.EMP_NO%TYPE	      DEFAULT NULL
	    ,P_BILL_NO		      IN IAS_POS_RT_BILL_MST.BILL_NO%TYPE	      DEFAULT NULL
	    ,P_C_CODE		      IN IAS_POS_RT_BILL_MST.C_CODE%TYPE	      DEFAULT NULL
	    ,P_A_CY		      IN IAS_POS_RT_BILL_MST.A_CY%TYPE
	    ,P_RT_BILL_RATE	      IN IAS_POS_RT_BILL_MST.RT_BILL_RATE%TYPE
	    ,P_RT_BILL_AMT	      IN IAS_POS_RT_BILL_MST.RT_BILL_AMT%TYPE	      DEFAULT NULL
	    ,P_RT_BILL_NOTE	      IN IAS_POS_RT_BILL_MST.RT_BILL_NOTE%TYPE	      DEFAULT NULL
	    ,P_PAYED_AMT	      IN IAS_POS_RT_BILL_MST.PAYED_AMT%TYPE	      DEFAULT NULL
	    ,P_REPORTED 	      IN IAS_POS_RT_BILL_MST.REPORTED%TYPE	      DEFAULT NULL
	    ,P_VAT_AMT		      IN IAS_POS_RT_BILL_MST.VAT_AMT%TYPE	      DEFAULT NULL
	    ,P_DISC_AMT 	      IN IAS_POS_RT_BILL_MST.DISC_AMT%TYPE	      DEFAULT NULL
	    ,P_DISC_AMT_MST	      IN IAS_POS_RT_BILL_MST.DISC_AMT_MST%TYPE	      DEFAULT NULL
	    ,P_DISC_AMT_DTL	      IN IAS_POS_RT_BILL_MST.DISC_AMT_DTL%TYPE	      DEFAULT NULL
	    ,P_CHEQUE_NO	      IN IAS_POS_RT_BILL_MST.CHEQUE_NO%TYPE	      DEFAULT NULL
	    ,P_CHEQUE_AMT	      IN IAS_POS_RT_BILL_MST.CHEQUE_AMT%TYPE	      DEFAULT NULL
	    ,P_CHEQUE_DUE_DATE	      IN IAS_POS_RT_BILL_MST.CHEQUE_DUE_DATE%TYPE     DEFAULT NULL
	    ,P_CREDIT_CARD	      IN IAS_POS_RT_BILL_MST.CREDIT_CARD%TYPE	      DEFAULT NULL
	    ,P_CR_CARD_NO	      IN IAS_POS_RT_BILL_MST.CR_CARD_NO%TYPE	      DEFAULT NULL
	    ,P_CR_CARD_AMT	      IN IAS_POS_RT_BILL_MST.CR_CARD_AMT%TYPE	      DEFAULT NULL
	    ,P_CR_CARD_COMM_PER       IN IAS_POS_RT_BILL_MST.CR_CARD_COMM_PER%TYPE    DEFAULT NULL
	    ,P_CR_CARD_NO_SCND	      IN IAS_POS_RT_BILL_MST.CR_CARD_NO_SCND%TYPE     DEFAULT NULL
	    ,P_CR_CARD_AMT_SCND       IN IAS_POS_RT_BILL_MST.CR_CARD_AMT_SCND%TYPE    DEFAULT NULL
	    ,P_CR_CARD_COMM_PER_SCND  IN IAS_POS_RT_BILL_MST.CR_CARD_COMM_PER_SCND%TYPE     DEFAULT NULL
	    ,P_CR_CARD_NO_THRD	      IN IAS_POS_RT_BILL_MST.CR_CARD_NO_THRD%TYPE     DEFAULT NULL
	    ,P_CR_CARD_AMT_THRD       IN IAS_POS_RT_BILL_MST.CR_CARD_AMT_THRD%TYPE    DEFAULT NULL
	    ,P_CR_CARD_COMM_PER_THRD  IN IAS_POS_RT_BILL_MST.CR_CARD_COMM_PER_THRD%TYPE     DEFAULT NULL
	    ,P_CR_CARD_CST_NO	      IN IAS_POS_RT_BILL_MST.CR_CARD_CST_NO%TYPE      DEFAULT NULL
	    ,P_CR_CARD_CST_NO_SCND    IN IAS_POS_RT_BILL_MST.CR_CARD_CST_NO_SCND%TYPE  DEFAULT NULL
	    ,P_CR_CARD_CST_NO_THRD IN IAS_POS_RT_BILL_MST.CR_CARD_CST_NO_THRD%TYPE   DEFAULT NULL
	    ,P_CASH_NO		  IN IAS_POS_RT_BILL_MST.CASH_NO%TYPE		     DEFAULT NULL
	    ,P_W_CODE		  IN IAS_POS_RT_BILL_MST.W_CODE%TYPE		     DEFAULT NULL
	    ,P_RT_PRICE_TYPE	  IN IAS_POS_RT_BILL_MST.RT_PRICE_TYPE%TYPE	     DEFAULT NULL
	    ,P_REP_CODE 	  IN IAS_POS_RT_BILL_MST.REP_CODE%TYPE		     DEFAULT NULL
	    ,P_W_CODE_BILL	  IN IAS_POS_RT_BILL_MST.W_CODE_BILL%TYPE	     DEFAULT NULL
	    ,P_REP_CODE_BILL	  IN IAS_POS_RT_BILL_MST.REP_CODE_BILL%TYPE	     DEFAULT NULL
	    ,P_CC_CODE_BILL	  IN IAS_POS_RT_BILL_MST.CC_CODE_BILL%TYPE	     DEFAULT NULL
	    ,P_RETURN_TYPE	  IN IAS_POS_RT_BILL_MST.RETURN_TYPE%TYPE	     DEFAULT NULL
	    ,P_MACHINE_NO	  IN IAS_POS_RT_BILL_MST.MACHINE_NO%TYPE	     DEFAULT NULL
	    ,P_SRVR_NO		  IN IAS_POS_RT_BILL_MST.SRVR_NO%TYPE		     DEFAULT NULL
	    ,P_HUNG		  IN IAS_POS_RT_BILL_MST.HUNG%TYPE		     DEFAULT NULL
	    ,P_PAYED		  IN IAS_POS_RT_BILL_MST.PAYED%TYPE		     DEFAULT NULL
	    ,P_POSTED		  IN IAS_POS_RT_BILL_MST.POSTED%TYPE		     DEFAULT 0
	    ,P_MACHINE_NO_BILL	  IN IAS_POS_RT_BILL_MST.MACHINE_NO_BILL%TYPE	     DEFAULT NULL
	    ,P_PAID_U_ID	  IN IAS_POS_RT_BILL_MST.PAID_U_ID%TYPE 	     DEFAULT NULL
	    ,P_PAID_DATE	  IN IAS_POS_RT_BILL_MST.PAID_DATE%TYPE 	     DEFAULT NULL
	    ,P_PAID_RT_BILL	  IN IAS_POS_RT_BILL_MST.PAID_RT_BILL%TYPE	     DEFAULT NULL
	    ,P_MACHINE_NO_PAID	  IN IAS_POS_RT_BILL_MST.MACHINE_NO_PAID%TYPE	     DEFAULT NULL
	    ,P_RT_BILL_JRNL	  IN IAS_POS_RT_BILL_MST.RT_BILL_JRNL%TYPE	     DEFAULT NULL
	    ,P_CUST_CODE	  IN IAS_POS_RT_BILL_MST.CUST_CODE%TYPE 	     DEFAULT NULL
	    ,P_MOBILE_NO	  IN IAS_POS_RT_BILL_MST.MOBILE_NO%TYPE 	     DEFAULT NULL
	    ,P_POINT_TYP_NO	  IN IAS_POS_RT_BILL_MST.POINT_TYP_NO%TYPE	     DEFAULT NULL
	    ,P_POINT_RPLC_AMT	  IN IAS_POS_RT_BILL_MST.POINT_RPLC_AMT%TYPE		DEFAULT NULL
	    ,P_DISC_AMT_HL_PRM	  IN IAS_POS_RT_BILL_MST.DISC_AMT_HL_PRM%TYPE	     DEFAULT NULL
	    ,P_RT_VAT_PRD_TYP	  IN IAS_POS_RT_BILL_MST.RT_VAT_PRD_TYP%TYPE	     DEFAULT NULL
	    ,P_RTRN_PRV_YR	  IN IAS_POS_RT_BILL_MST.RTRN_PRV_YR%TYPE	     DEFAULT NULL
	    ,P_DISC_AMT_AFTR_VAT  IN IAS_POS_RT_BILL_MST.DISC_AMT_AFTR_VAT%TYPE      DEFAULT NULL
	    ,P_DISC_AMT_MST_VAT   IN IAS_POS_RT_BILL_MST.DISC_AMT_MST_VAT%TYPE	     DEFAULT NULL
	    ,P_VAT_AMT_DISC_MST   IN IAS_POS_RT_BILL_MST.VAT_AMT_DISC_MST%TYPE	     DEFAULT NULL
	    ,P_CLC_TYP_NO_TAX	  IN IAS_POS_RT_BILL_MST.CLC_TYP_NO_TAX%TYPE	     DEFAULT NULL
	    ,P_AD_U_ID		  IN IAS_POS_RT_BILL_MST.AD_U_ID%TYPE
	    ,P_AD_DATE		  IN IAS_POS_RT_BILL_MST.AD_DATE%TYPE
	    ,P_UP_U_ID		  IN IAS_POS_RT_BILL_MST.UP_U_ID%TYPE	  DEFAULT NULL
	    ,P_UP_DATE		  IN IAS_POS_RT_BILL_MST.UP_DATE%TYPE	  DEFAULT NULL
	    ,P_UP_CNT		  IN IAS_POS_RT_BILL_MST.UP_CNT%TYPE	  DEFAULT NULL
	    ,P_PR_REP		  IN IAS_POS_RT_BILL_MST.PR_REP%TYPE	  DEFAULT NULL
	    ,P_CMP_NO		  IN IAS_POS_RT_BILL_MST.CMP_NO%TYPE	  DEFAULT NULL
	    ,P_BRN_NO		  IN IAS_POS_RT_BILL_MST.BRN_NO%TYPE
	    ,P_BRN_YEAR 	  IN IAS_POS_RT_BILL_MST.BRN_YEAR%TYPE
	    ,P_BRN_USR		  IN IAS_POS_RT_BILL_MST.BRN_USR%TYPE	  DEFAULT NULL
	    ,P_PYMNT_AC 	  IN IAS_POS_RT_BILL_MST.PYMNT_AC%TYPE	     DEFAULT NULL
	    ,P_AC_CODE		  IN IAS_POS_RT_BILL_MST.AC_CODE%TYPE	     DEFAULT NULL
	    ,P_AC_DTL_TYP	  IN IAS_POS_RT_BILL_MST.AC_DTL_TYP%TYPE     DEFAULT NULL
	    ,P_AC_CODE_DTL	  IN IAS_POS_RT_BILL_MST.AC_CODE_DTL%TYPE    DEFAULT NULL
	    ,P_AC_AMT		  IN IAS_POS_RT_BILL_MST.AC_AMT%TYPE	     DEFAULT NULL
	    ,P_CLC_TAX_FREE_QTY_FLG IN IAS_POS_RT_BILL_MST.CLC_TAX_FREE_QTY_FLG%TYPE	   DEFAULT NULL
	    ,P_OTHR_AMT 	  IN IAS_POS_RT_BILL_MST.OTHR_AMT%TYPE	      DEFAULT NULL
	    ,P_AD_TRMNL_NM	  IN IAS_POS_RT_BILL_MST.AD_TRMNL_NM%TYPE     DEFAULT NULL
	    ,P_UP_TRMNL_NM	  IN IAS_POS_RT_BILL_MST.UP_TRMNL_NM%TYPE     DEFAULT NULL
	    ,P_DOC_SER_EXTRNL	  IN IAS_POS_RT_BILL_MST.DOC_SER_EXTRNL%TYPE  DEFAULT NULL
	    ,P_CC_CODE		  IN IAS_POS_RT_BILL_MST.CC_CODE%TYPE	      DEFAULT NULL
	    ,P_PJ_NO		  IN IAS_POS_RT_BILL_MST.PJ_NO%TYPE	      DEFAULT NULL
	    ,P_ACTV_NO		  IN IAS_POS_RT_BILL_MST.ACTV_NO%TYPE	      DEFAULT NULL
	    ,P_EXTERNAL_POST	  IN IAS_POS_RT_BILL_MST.DOC_MCHN_SQ%TYPE  DEFAULT NULL
	    ,P_REF_NO		  IN IAS_POS_RT_BILL_MST.REF_NO%TYPE  DEFAULT NULL
	    ,P_DOC_MCHN_SQ	  IN IAS_POS_RT_BILL_MST.DOC_MCHN_SQ%TYPE  DEFAULT NULL
	    ,P_C_TAX_CODE	  IN IAS_POS_RT_BILL_MST.C_TAX_CODE%TYPE  DEFAULT NULL
	    ,P_LNG_NO		  IN NUMBER DEFAULT 1
	    ,P_CLC_TAX_EXTRNAL_FLG  IN NUMBER  DEFAULT 0  --0 CALC TAX EXTRNAL 1 CALC TAX IN SAVE
	    ,P_SAVE_TYP 	  IN NUMBER  DEFAULT 0 --## 0 INSERT OFFLINE RT BILL 1 INSERT ONLINE RTBILL
	   );
	    --##------------------------------------------------------------------------------------------------------------------------------##--
       PROCEDURE INSRT_IAS_POS_RT_BILL_DTL( P_RT_BILL_NO      IN IAS_POS_RT_BILL_DTL.RT_BILL_NO%TYPE		  DEFAULT NULL
	    ,P_I_CODE	       IN IAS_POS_RT_BILL_DTL.I_CODE%TYPE
	    ,P_I_QTY	       IN IAS_POS_RT_BILL_DTL.I_QTY%TYPE
	    ,P_I_PRICE	       IN IAS_POS_RT_BILL_DTL.I_PRICE%TYPE
	    ,P_DIS_PER	       IN IAS_POS_RT_BILL_DTL.DIS_PER%TYPE		      DEFAULT NULL
	    ,P_DIS_AMT	       IN IAS_POS_RT_BILL_DTL.DIS_AMT%TYPE		      DEFAULT NULL
	    ,P_DIS_AMT_MST     IN IAS_POS_RT_BILL_DTL.DIS_AMT_MST%TYPE		      DEFAULT NULL
	    ,P_DIS_AMT_DTL     IN IAS_POS_RT_BILL_DTL.DIS_AMT_DTL%TYPE		      DEFAULT NULL
	    ,P_ITM_UNT	       IN IAS_POS_RT_BILL_DTL.ITM_UNT%TYPE
	    ,P_P_SIZE	       IN IAS_POS_RT_BILL_DTL.P_SIZE%TYPE
	    ,P_P_QTY	       IN IAS_POS_RT_BILL_DTL.P_QTY%TYPE
	    ,P_VAT_PER	       IN IAS_POS_RT_BILL_DTL.VAT_PER%TYPE		      DEFAULT NULL
	    ,P_VAT_AMT	       IN IAS_POS_RT_BILL_DTL.VAT_AMT%TYPE		      DEFAULT NULL
	    ,P_BATCH_NO        IN IAS_POS_RT_BILL_DTL.BATCH_NO%TYPE		      DEFAULT NULL
	    ,P_EXPIRE_DATE     IN IAS_POS_RT_BILL_DTL.EXPIRE_DATE%TYPE		      DEFAULT NULL
	    ,P_BARCODE	       IN IAS_POS_RT_BILL_DTL.BARCODE%TYPE		      DEFAULT NULL
	    ,P_W_CODE	       IN IAS_POS_RT_BILL_DTL.W_CODE%TYPE		      DEFAULT NULL
	    ,P_SERVICE_ITEM    IN IAS_POS_RT_BILL_DTL.SERVICE_ITEM%TYPE 	      DEFAULT NULL
	    ,P_FREE_QTY        IN IAS_POS_RT_BILL_DTL.FREE_QTY%TYPE		      DEFAULT NULL
	    ,P_RCRD_NO	       IN IAS_POS_RT_BILL_DTL.RCRD_NO%TYPE		      DEFAULT NULL
	    ,P_CMP_NO	       IN IAS_POS_RT_BILL_DTL.CMP_NO%TYPE		      DEFAULT NULL
	    ,P_BRN_NO	       IN IAS_POS_RT_BILL_DTL.BRN_NO%TYPE		      DEFAULT NULL
	    ,P_BRN_YEAR        IN IAS_POS_RT_BILL_DTL.BRN_YEAR%TYPE		      DEFAULT NULL
	    ,P_BRN_USR	       IN IAS_POS_RT_BILL_DTL.BRN_USR%TYPE		      DEFAULT NULL
	    ,P_I_PRICE_VAT     IN IAS_POS_RT_BILL_DTL.I_PRICE_VAT%TYPE		      DEFAULT NULL
	    ,P_DIS_AMT_DTL_HL_PRM   IN IAS_POS_RT_BILL_DTL.DIS_AMT_DTL_HL_PRM%TYPE    DEFAULT NULL
	    ,P_QT_I_QTY 	    IN IAS_POS_RT_BILL_DTL.QT_I_QTY%TYPE	      DEFAULT NULL
	    ,P_DIS_AMT_DTL_VAT	    IN IAS_POS_RT_BILL_DTL.DIS_AMT_DTL_VAT%TYPE       DEFAULT NULL
	    ,P_DIS_AFTR_VAT_MST     IN IAS_POS_RT_BILL_DTL.DIS_AFTR_VAT_MST%TYPE      DEFAULT NULL
	    ,P_DIS_AMT_MST_VAT	    IN IAS_POS_RT_BILL_DTL.DIS_AMT_MST_VAT%TYPE       DEFAULT NULL
	    ,P_VAT_AMT_DIS_DTL_VAT  IN IAS_POS_RT_BILL_DTL.VAT_AMT_DIS_DTL_VAT%TYPE   DEFAULT NULL
	    ,P_VAT_AMT_AFTR_DIS     IN IAS_POS_RT_BILL_DTL.VAT_AMT_AFTR_DIS%TYPE      DEFAULT NULL
	    ,P_VAT_AMT_BFR_DIS	    IN IAS_POS_RT_BILL_DTL.VAT_AMT_BFR_DIS%TYPE       DEFAULT NULL
	    ,P_VAT_AMT_DIS_MST_VAT  IN IAS_POS_RT_BILL_DTL.VAT_AMT_DIS_MST_VAT%TYPE   DEFAULT NULL
	    ,P_QT_PRM_RCRD_NO	    IN IAS_POS_RT_BILL_DTL.QT_PRM_RCRD_NO%TYPE	      DEFAULT NULL
	    ,P_QT_PRM_SER	    IN IAS_POS_RT_BILL_DTL.QT_PRM_SER%TYPE	      DEFAULT NULL
	    ,P_QT_PRM_NO	    IN IAS_POS_RT_BILL_DTL.QT_PRM_NO%TYPE	      DEFAULT NULL
	    ,P_DOC_D_SEQ	    IN IAS_POS_RT_BILL_DTL.DOC_D_SEQ%TYPE	      DEFAULT NULL
	    ,P_QR_CODE		    IN IAS_POS_RT_BILL_DTL.QR_CODE%TYPE 	      DEFAULT NULL
	    ,P_SERIALNO 	    IN IAS_POS_RT_BILL_DTL.SERIALNO%TYPE	      DEFAULT NULL
	    ,P_LVL_PRICE_NO	    IN NUMBER DEFAULT NULL   );
    --##------------------------------------------------------------------------------------------------------------------------------##--
    PROCEDURE EXTRCT_POS_RT_BILL_PRC( P_XML in	     CLOB,
				      P_JSON_RSLT    OUT CLOB
				       ) ;
    --##------------------------------------------------------------------------------------------------------------------------------##--
    FUNCTION  GET_C_CODE_XML( P_DVC_SRL  In VARCHAR2
			     ,P_C_CODE IN CUSTOMER.C_CODE%TYPE DEFAULT NULL
			     ,P_LNG_NO IN NUMBER DEFAULT 1
			     ,P_Whr    IN VARCHAR2  DEFAULT NULL) RETURN CLOB	;
    --##------------------------------------------------------------------------------------------------------------------------------##--
    FUNCTION  GET_C_CODE_CUR_XML( P_DVC_SRL  In VARCHAR2
				 ,P_C_CODE IN CUSTOMER.C_CODE%TYPE DEFAULT NULL
				 ,P_LNG_NO IN NUMBER DEFAULT 1 ) RETURN CLOB   ;
--##------------------------------------------------------------------------------------------------------------------------------##--
    FUNCTION  GET_C_CODE_CUR_PRV_XML( P_DVC_SRL  In VARCHAR2
				     ,P_C_CODE IN CUSTOMER.C_CODE%TYPE DEFAULT NULL
				     ,P_LNG_NO IN NUMBER DEFAULT 1
				     ,P_Whr    IN VARCHAR2  DEFAULT NULL) RETURN CLOB	;
    --##------------------------------------------------------------------------------------------------------------------------------##--
    FUNCTION  GET_CUST_CODE_XML( P_LNG_NO IN NUMBER DEFAULT 1
				,P_Whr	  IN VARCHAR2  DEFAULT NULL) RETURN CLOB   ;
    --##------------------------------------------------------------------------------------------------------------------------------##--
    PROCEDURE EXTRCT_CASH_CUSTMR_PRC(  P_XML in       CLOB,
	      P_JSON_RSLT     OUT VARCHAR    ) ;
    --##------------------------------------------------------------------------------------------------------------------------------##--
    PROCEDURE INSRT_IAS_CASH_CUSTMR( P_CUST_CODE	 IN IAS_CASH_CUSTMR.CUST_CODE%TYPE
	     ,P_CUST_L_NM	    IN IAS_CASH_CUSTMR.CUST_L_NM%TYPE
	     ,P_CUST_F_NM	    IN IAS_CASH_CUSTMR.CUST_F_NM%TYPE DEFAULT NULL
	     ,P_MOBILE_NO	    IN IAS_CASH_CUSTMR.MOBILE_NO%TYPE
	     ,P_CUST_GRP_CODE	    IN IAS_CASH_CUSTMR.CUST_GRP_CODE%TYPE DEFAULT NULL
	     ,P_POINT_TYP_NO	    IN IAS_CASH_CUSTMR.POINT_TYP_NO%TYPE DEFAULT NULL
	     ,P_POINT_TYP_ACTV_DATE IN IAS_CASH_CUSTMR.POINT_TYP_ACTV_DATE%TYPE DEFAULT NULL
	     ,P_CRD_NO_DISC	    IN IAS_CASH_CUSTMR.CRD_NO_DISC%TYPE DEFAULT NULL
	     ,P_FIRST_DEAL_DATE     IN IAS_CASH_CUSTMR.FIRST_DEAL_DATE%TYPE DEFAULT NULL
	     ,P_TEL_NO		    IN IAS_CASH_CUSTMR.TEL_NO%TYPE DEFAULT NULL
	     ,P_FAX_NO		    IN IAS_CASH_CUSTMR.FAX_NO%TYPE DEFAULT NULL
	     ,P_PBOX		    IN IAS_CASH_CUSTMR.PBOX%TYPE DEFAULT NULL
	     ,P_E_MAIL		    IN IAS_CASH_CUSTMR.E_MAIL%TYPE DEFAULT NULL
	     ,P_WEB_SITE	    IN IAS_CASH_CUSTMR.WEB_SITE%TYPE  DEFAULT NULL
	     ,P_REP_CODE	    IN IAS_CASH_CUSTMR.CITY_NO%TYPE DEFAULT NULL
	     ,P_ADDRESS 	    IN IAS_CASH_CUSTMR.ADDRESS%TYPE DEFAULT NULL
	     ,P_BIRTH_DATE	    IN IAS_CASH_CUSTMR.BIRTH_DATE%TYPE	DEFAULT NULL
	     ,P_C_BOX_CODE	    IN IAS_CASH_CUSTMR.C_BOX_CODE%TYPE	DEFAULT NULL
	     ,P_C_tax_code	    IN IAS_CASH_CUSTMR.C_TAX_CODE%TYPE	DEFAULT NULL
	     ,P_Cntry_no	    IN IAS_CASH_CUSTMR.Cntry_no%TYPE	DEFAULT NULL
	     ,P_City_no 	    IN IAS_CASH_CUSTMR.City_no%TYPE	DEFAULT NULL
	     ,P_Building_no	    IN IAS_CASH_CUSTMR.Building_no%TYPE DEFAULT NULL
	     ,P_Street		    IN IAS_CASH_CUSTMR.Street%TYPE	DEFAULT NULL
	     ,P_Add_no		    IN IAS_CASH_CUSTMR.Add_no%TYPE	DEFAULT NULL
	     ,P_Prov_No 	    IN IAS_CASH_CUSTMR.Prov_No%TYPE   DEFAULT NULL
	     ,P_R_Code		    IN IAS_CASH_CUSTMR.R_Code%TYPE    DEFAULT NULL
	     ,P_FIELD1		    IN IAS_CASH_CUSTMR.FIELD1%TYPE    DEFAULT NULL
	     ,P_FIELD2		    IN IAS_CASH_CUSTMR.FIELD2%TYPE    DEFAULT NULL
	     ,P_FIELD3		    IN IAS_CASH_CUSTMR.FIELD3%TYPE    DEFAULT NULL
	     ,P_FIELD4		    IN IAS_CASH_CUSTMR.FIELD4%TYPE    DEFAULT NULL
	     ,P_FIELD5		    IN IAS_CASH_CUSTMR.FIELD5%TYPE    DEFAULT NULL
	     ,P_BRN_NO		    IN IAS_CASH_CUSTMR.BRN_NO%TYPE
	     ,P_CMP_NO		    IN IAS_CASH_CUSTMR.CMP_NO%TYPE    DEFAULT NULL
	     ,P_AD_U_ID 	    IN IAS_CASH_CUSTMR.AD_U_ID%TYPE
	     ,P_AD_DATE 	    IN IAS_CASH_CUSTMR.AD_DATE%TYPE
	     ,P_AD_TRMNL_NM	    IN IAS_CASH_CUSTMR.AD_TRMNL_NM%TYPE   DEFAULT NULL
	     ,P_LNG_NO IN NUMBER DEFAULT 1);
    --##------------------------------------------------------------------------------------------------------------------------------##--
    FUNCTION  GET_PAY_TYPE_XML( P_DVC_SRL In VARCHAR2
			     ,P_LNG_NO IN NUMBER DEFAULT 1 ) RETURN CLOB   ;
    --##------------------------------------------------------------------------------------------------------------------------------##--
    FUNCTION  GET_CARD_TYPES_XML (P_DVC_SRL In VARCHAR2,P_CR_CARD_TYPE IN NUMBER DEFAULT NULL,P_LNG_NO IN NUMBER DEFAULT 1 ) RETURN CLOB   ;
    --##------------------------------------------------------------------------------------------------------------------------------##--
    FUNCTION  GET_ITM_PRICE_XML (P_I_CODE  IN VARCHAR2 ,
				 P_ITM_UNT IN VARCHAR2 DEFAULT NULL,
				 P_LVL_NO  IN NUMBER,
				 P_W_Code  IN NUMBER,
				 P_BRN_NO  IN NUMBER,
				 P_LNG_NO  IN NUMBER DEFAULT 1,
				 P_clc_typ_no_tax  In Number Default Null,
				 P_calc_vat_amt_type In Number Default 1,
				 P_Use_price_include_vat In Number Default 0,
				 P_Get_All_Unt	In Number Default null ) RETURN CLOB ;
    --##------------------------------------------------------------------------------------------------------------------------------##--
    FUNCTION  GET_ITM_DATA_XML(P_LVL_NO   IN NUMBER,
			     P_W_Code	IN NUMBER,
			     P_BRN_NO	IN NUMBER,
			     P_SRCH_TYP IN NUMBER DEFAULT 2,
			     P_SRCH_VAL IN VARCHAR2 DEFAULT NULL,
			     P_WHR	IN VARCHAR2 DEFAULT NULL,
			     P_I_CODE	IN VARCHAR2 DEFAULT NULL,
			     P_ITM_UNT	IN VARCHAR2 DEFAULT NULL,
			     P_Get_All_Unt IN NUMBER Default null ) RETURN CLOB ;
    --##------------------------------------------------------------------------------------------------------------------------------##--
    FUNCTION GET_CSTMR_POINT_BLNC(P_Cust_Code	  In Ias_Cash_Custmr.Cust_Code%Type Default Null,
				  P_Point_Typ_No  In Ias_Point_Typ_Mst.Point_Typ_No%Type Default Null,
				  P_Db_Link	  In Varchar2 Default Null,
				  P_Lng_No	  In  Number  default 1 ) RETURN CLOB;
    --##------------------------------------------------------------------------------------------------------------------------------##--
    FUNCTION GET_ALL_CSTMR_POINT_BLNC(P_Point_Typ_No  In Ias_Point_Typ_Mst.Point_Typ_No%Type Default Null,
				      P_Db_Link       In Varchar2 Default Null,
				      P_Lng_No	      In  Number  default 1 ) RETURN CLOB;
    --##------------------------------------------------------------------------------------------------------------------------------##--
    FUNCTION  GET_QUT_PRM_PRICE_DIS_XML(P_I_CODE  IN VARCHAR2,
					P_ITM_UNT IN VARCHAR2,
					P_W_Code  IN NUMBER ) RETURN CLOB   ;
    --##------------------------------------------------------------------------------------------------------------------------------##--
    FUNCTION  GET_QUT_PRM_PRC_DSCNT_XML (P_TBL_NM IN VARCHAR2 Default 'IAS_QUT_PRM_MST' ,P_QUOT_NO  IN NUMBER DEFAULT NULL,P_WHR IN Varchar2 Default Null) RETURN CLOB;
    --##------------------------------------------------------------------------------------------------------------------------------##--
     FUNCTION  GET_QUT_PRM_PRICE (P_I_CODE  IN VARCHAR2,
				  P_ITM_UNT IN VARCHAR2,
				  P_W_Code  IN NUMBER) RETURN NUMBER   ;
    --##------------------------------------------------------------------------------------------------------------------------------##--
    FUNCTION  GET_QUT_PRM_DISC (P_I_CODE  IN VARCHAR2,
				P_ITM_UNT IN VARCHAR2,
				P_ITM_PRICE IN NUMBER,
				P_W_Code  IN NUMBER) RETURN NUMBER   ;
    --##------------------------------------------------------------------------------------------------------------------------------##--
     FUNCTION GET_ITM_VAT_AMT_XML (P_CLC_TYP_NO_TAX    IN NUMBER,
				   P_CALC_VAT_AMT_TYPE IN NUMBER,
				   P_I_CODE	       IN VARCHAR2 ,
				   P_I_PRICE	       IN NUMBER,
				   P_DISC_AMT	       IN NUMBER) RETURN NUMBER   ;
    --##------------------------------------------------------------------------------------------------------------------------------##--
   FUNCTION GET_inpt_data ( P_inpt_typ	   In	  Varchar2
			   ,P_Fld_Nm1	   In	  Varchar2 Default Null
			   ,P_Fld_Nm2	   In	  Varchar2 Default Null
			   ,P_Fld_Nm3	   In	  Varchar2 Default Null
			   ,P_Fld_Nm4	   In	  Varchar2 Default Null
			   ,P_Fld_Val1	   In	  Varchar2 Default Null
			   ,P_Fld_Val2	   In	  Varchar2 Default Null
			   ,P_Fld_Val3	   In	  Varchar2 Default Null
			   ,P_Fld_Val4	   In	  Varchar2 Default Null
			   ,P_whr	   In	  Varchar2 Default Null
			   ,P_Usr_no	   In	  Number   Default Null
			   ,P_Brn_no	   In	  Number   Default Null ) RETURN CLOB;
   --##------------------------------------------------------------------------------------------------------------------------------##--
   FUNCTION GET_SALESDISC_XML ( P_LNG_NO IN NUMBER DEFAULT 1 ) RETURN CLOB ;
   --##------------------------------------------------------------------------------------------------------------------------------##--
   FUNCTION GET_QT_PRM_DATA_XML (P_TBL_NM IN VARCHAR2,
				 P_LNG_NO IN NUMBER DEFAULT 1 ) RETURN CLOB ;
   --##------------------------------------------------------------------------------------------------------------------------------##--
    FUNCTION CHECK_DB_SRVR_TYP_FNC RETURN NUMBER;
   --##------------------------------------------------------------------------------------------------------------------------------##--
   FUNCTION GET_CUR_RATE_FNC(P_A_CY   EX_RATE.CUR_CODE%TYPE,
			     P_USR_NO USER_R.U_ID%TYPE ) RETURN NUMBER;
   --##------------------------------------------------------------------------------------------------------------------------------##--
   FUNCTION GET_BILL_MST_XML(P_BILL_NO IN IAS_POS_BILL_MST.BILL_NO%TYPE
			    ,P_DVC_SRL IN VARCHAR2
			    ,P_USR_NO  IN USER_R.U_ID%TYPE
			    ,P_BRN_USR IN IAS_POS_BILL_MST.BRN_USR%TYPE
			    ,P_LNG_NO  IN NUMBER  ) RETURN  CLOB ;
   --##------------------------------------------------------------------------------------------------------------------------------##--
   FUNCTION GET_BILL_DTL_XML(P_BILL_NO IN IAS_POS_BILL_MST.BILL_NO%TYPE
			    ,P_DVC_SRL IN VARCHAR2
			    ,P_USR_NO  IN USER_R.U_ID%TYPE
			    ,P_BRN_USR IN IAS_POS_BILL_MST.BRN_USR%TYPE
			    ,P_LNG_NO  IN NUMBER  ) RETURN  CLOB ;
   --##------------------------------------------------------------------------------------------------------------------------------##--
    PROCEDURE EXTRCT_POS_SALES_ORDR_PRC(P_XML	    IN	CLOB,
					P_JSON_RSLT OUT VARCHAR) ;
   --##------------------------------------------------------------------------------------------------------------------------------##--
   FUNCTION INSRT_SALES_ORDER_MST_FNC(P_SO_TYPE    IN SALES_ORDER.SO_TYPE%TYPE
			       ,P_ORDER_NO	 IN SALES_ORDER.ORDER_NO%TYPE
			       ,P_ORDER_SER	 IN SALES_ORDER.ORDER_SER%TYPE
			       ,P_ORDER_DATE	 IN SALES_ORDER.ORDER_DATE%TYPE
			       ,P_ORDER_TIME	 IN SALES_ORDER.ORDER_TIME%TYPE
			       ,P_ORDER_CUR	 IN SALES_ORDER.ORDER_CUR%TYPE
			       ,P_CUR_RATE	 IN SALES_ORDER.CUR_RATE%TYPE
			       ,P_C_CODE	 IN SALES_ORDER.C_CODE%TYPE
			       ,P_C_NAME	 IN SALES_ORDER.C_NAME%TYPE
			       ,P_A_DESC	 IN SALES_ORDER.A_DESC%TYPE
			       ,P_CC_CODE	 IN SALES_ORDER.CC_CODE%TYPE
			       ,P_PJ_NO 	 IN SALES_ORDER.PJ_NO%TYPE
			       ,P_ACTV_NO	 IN SALES_ORDER.ACTV_NO%TYPE
			       ,P_W_CODE	 IN SALES_ORDER.W_CODE%TYPE
			       ,P_REP_CODE	 IN SALES_ORDER.REP_CODE%TYPE
			       ,P_EMP_NO	 IN SALES_ORDER.EMP_NO%TYPE
			       ,P_PROCESED	 IN SALES_ORDER.PROCESED%TYPE
			       ,P_STAND_BY	 IN SALES_ORDER.STAND_BY%TYPE
			       ,P_VAT_AMT	 IN SALES_ORDER.VAT_AMT%TYPE
			       ,P_ORDER_AMT	 IN SALES_ORDER.ORDER_AMT%TYPE
			       ,P_DISC_AMT	 IN SALES_ORDER.DISC_AMT%TYPE
			       ,P_DISC_AMT_MST	 IN SALES_ORDER.DISC_AMT_MST%TYPE
			       ,P_DISC_AMT_MST_VAT IN SALES_ORDER.DISC_AMT_MST_VAT%TYPE
			       ,P_DISC_AMT_DTL	   IN SALES_ORDER.DISC_AMT_DTL%TYPE
			       ,P_OTHR_AMT	   IN SALES_ORDER.OTHR_AMT%TYPE  DEFAULT 0
			       ,P_APPROVED	   IN SALES_ORDER.APPROVED%TYPE
			       ,P_APRV_U_ID	   IN SALES_ORDER.APRV_U_ID%TYPE
			       ,P_APRV_DATE	   IN SALES_ORDER.APRV_DATE%TYPE
			       ,P_APRV_DSC	   IN SALES_ORDER.APRV_DSC%TYPE
			       ,P_INACTIVE	      IN SALES_ORDER.INACTIVE%TYPE	 DEFAULT 0
			       ,P_INACTIVE_RES	      IN SALES_ORDER.INACTIVE_RES%TYPE	 DEFAULT NULL
			       ,P_INACTIVE_DATE       IN SALES_ORDER.INACTIVE_DATE%TYPE  DEFAULT NULL
			       ,P_INACTIVE_U_ID       IN SALES_ORDER.INACTIVE_U_ID%TYPE  DEFAULT NULL
			       ,P_R_CODE	      IN SALES_ORDER.R_CODE%TYPE	 DEFAULT NULL
			       ,P_PRM_CODE	      IN SALES_ORDER.PRM_CODE%TYPE	 DEFAULT NULL
			       ,P_DRIVER_NO	      IN SALES_ORDER.DRIVER_NO%TYPE	  DEFAULT NULL
			       ,P_ORDER_EXPIRE_DATE   IN SALES_ORDER.ORDER_EXPIRE_DATE%TYPE DEFAULT NULL
			       ,P_FIELD1		IN SALES_ORDER.FIELD1%TYPE     DEFAULT NULL
			       ,P_FIELD2		IN SALES_ORDER.FIELD2%TYPE     DEFAULT NULL
			       ,P_FIELD3		IN SALES_ORDER.FIELD3%TYPE     DEFAULT NULL
			       ,P_FIELD4		IN SALES_ORDER.FIELD4%TYPE     DEFAULT NULL
			       ,P_FIELD5		IN SALES_ORDER.FIELD5%TYPE     DEFAULT NULL
			       ,P_FIELD6		IN SALES_ORDER.FIELD6%TYPE     DEFAULT NULL
			       ,P_FIELD7		IN SALES_ORDER.FIELD7%TYPE     DEFAULT NULL
			       ,P_FIELD8		IN SALES_ORDER.FIELD8%TYPE     DEFAULT NULL
			       ,P_FIELD9		IN SALES_ORDER.FIELD9%TYPE     DEFAULT NULL
			       ,P_FIELD10		IN SALES_ORDER.FIELD10%TYPE    DEFAULT NULL
			       ,P_AD_U_ID		IN SALES_ORDER.AD_U_ID%TYPE
			       ,P_AD_DATE		IN SALES_ORDER.AD_DATE%TYPE
			       ,P_UP_U_ID		IN SALES_ORDER.UP_U_ID%TYPE
			       ,P_UP_DATE		IN SALES_ORDER.UP_DATE%TYPE
			       ,P_UP_CNT		IN SALES_ORDER.UP_CNT%TYPE
			       ,P_PR_REP		IN SALES_ORDER.PR_REP%TYPE
			       ,P_CMP_NO		IN SALES_ORDER.CMP_NO%TYPE
			       ,P_BRN_NO		IN SALES_ORDER.BRN_NO%TYPE
			       ,P_BRN_YEAR		IN SALES_ORDER.BRN_YEAR%TYPE
			       ,P_BRN_USR		IN SALES_ORDER.BRN_USR%TYPE
			       ,P_MACHINE_NO		IN SALES_ORDER.MACHINE_NO%TYPE
			       ,P_CUST_CODE		IN SALES_ORDER.CUST_CODE%TYPE
			       ,P_MOBILE_NO		IN SALES_ORDER.MOBILE_NO%TYPE
			       ,P_PYMNT_TYPE		IN SALES_ORDER.PYMNT_TYPE%TYPE
			       ,P_CASH_NO		IN SALES_ORDER.CASH_NO%TYPE
			       ,P_CSH_PYMNT_AMT 	IN SALES_ORDER.CSH_PYMNT_AMT%TYPE
			       ,P_CREDIT_CARD		IN SALES_ORDER.CREDIT_CARD%TYPE
			       ,P_CR_CARD_NO		IN SALES_ORDER.CR_CARD_NO%TYPE
			       ,P_CR_CARD_AMT		IN SALES_ORDER.CR_CARD_AMT%TYPE
			       ,P_CR_CARD_COMM_PER	IN SALES_ORDER.CR_CARD_COMM_PER%TYPE
			       ,P_CR_CARD_DSC		IN SALES_ORDER.CR_CARD_DSC%TYPE
			       ,P_CR_CARD_CST_NO	IN SALES_ORDER.CR_CARD_CST_NO%TYPE
			       ,P_CR_CARD_NO_SCND	IN SALES_ORDER.CR_CARD_NO_SCND%TYPE
			       ,P_CR_CARD_AMT_SCND	IN SALES_ORDER.CR_CARD_AMT_SCND%TYPE
			       ,P_CR_CARD_COMM_PER_SCND IN SALES_ORDER.CR_CARD_COMM_PER_SCND%TYPE
			       ,P_CR_CARD_DSC_SCND	IN SALES_ORDER.CR_CARD_DSC_SCND%TYPE
			       ,P_CR_CARD_CST_NO_SCND	IN SALES_ORDER.CR_CARD_CST_NO_SCND%TYPE
			       ,P_CR_CARD_NO_THRD	IN SALES_ORDER.CR_CARD_NO_THRD%TYPE
			       ,P_CR_CARD_AMT_THRD	IN SALES_ORDER.CR_CARD_AMT_THRD%TYPE
			       ,P_CR_CARD_COMM_PER_THRD IN SALES_ORDER.CR_CARD_COMM_PER_THRD%TYPE
			       ,P_CR_CARD_DSC_THRD	IN SALES_ORDER.CR_CARD_DSC_THRD%TYPE
			       ,P_CR_CARD_CST_NO_THRD	IN SALES_ORDER.CR_CARD_CST_NO_THRD%TYPE
			       ,P_ADVNC_PYMNT_A_CODE	IN SALES_ORDER.ADVNC_PYMNT_A_CODE%TYPE
			       ,P_ADVNC_PYMNT_AC_CODE_DTL IN SALES_ORDER.ADVNC_PYMNT_AC_CODE_DTL%TYPE
			       ,P_ADVNC_PYMNT_AC_DTL_TYP  IN SALES_ORDER.ADVNC_PYMNT_AC_DTL_TYP%TYPE
			       ,P_DOC_SER_EXTRNL	  IN SALES_ORDER.DOC_SER_EXTRNL%TYPE  DEFAULT NULL
			       ,P_EXTERNAL_POST 	  IN SALES_ORDER.EXTERNAL_POST%TYPE  DEFAULT NULL
			       ,P_SHO_SYS_TYP		   IN SALES_ORDER.SHO_SYS_TYP%TYPE  DEFAULT NULL
			       ,P_NOTE_NO		   IN SALES_ORDER.NOTE_NO%TYPE	DEFAULT NULL
			       ,P_CSTMR_TYP		   IN SALES_ORDER.CSTMR_TYP%TYPE  DEFAULT NULL
			       ,P_C_ADDRESS		   IN SALES_ORDER.C_ADDRESS%TYPE  DEFAULT NULL
			       ,P_LATITUDE		   IN SALES_ORDER.LATITUDE%TYPE  DEFAULT NULL
			       ,P_LONGITUDE		   IN SALES_ORDER.LONGITUDE%TYPE  DEFAULT NULL
			       ,P_AD_TRMNL_NM		   IN SALES_ORDER.AD_TRMNL_NM%TYPE  DEFAULT NULL
			       ,P_DISC_AMT_AFTR_VAT	   IN SALES_ORDER.DISC_AMT_AFTR_VAT%TYPE  DEFAULT NULL
			       ,P_POINT_TYP_NO		   IN SALES_ORDER.POINT_TYP_NO%TYPE  DEFAULT NULL
			       ,P_POINT_CNT		   IN SALES_ORDER.POINT_CNT%TYPE  DEFAULT NULL
			       ,P_RCPNT_CMPNY		   IN SALES_ORDER.RCPNT_CMPNY%TYPE  DEFAULT NULL
			       ,P_RCPNT_NAME		   IN SALES_ORDER.RCPNT_NAME%TYPE  DEFAULT NULL
			       ,P_RCPNT_EMAIL		   IN SALES_ORDER.RCPNT_EMAIL%TYPE  DEFAULT NULL
			       ,P_RCPNT_ADDRESS 	   IN SALES_ORDER.RCPNT_ADDRESS%TYPE  DEFAULT NULL
			       ,P_RCPNT_CITY		   IN SALES_ORDER.RCPNT_CITY%TYPE  DEFAULT NULL
			       ,P_RCPNT_POST_CODE	   IN SALES_ORDER.RCPNT_POST_CODE%TYPE	DEFAULT NULL
			       ,P_RCPNT_STATE		   IN SALES_ORDER.RCPNT_STATE%TYPE  DEFAULT NULL
			       ,P_RCPNT_CNTRY		   IN SALES_ORDER.RCPNT_CNTRY%TYPE  DEFAULT NULL
			       ,P_RCPNT_CNTRY_CODE	   IN SALES_ORDER.RCPNT_CNTRY_CODE%TYPE  DEFAULT NULL
			       ,P_FRGHT_CMPNY		   IN SALES_ORDER.FRGHT_CMPNY%TYPE  DEFAULT NULL
			       ,P_CLC_TAX_EXTRNAL_FLG	  IN NUMBER  DEFAULT 0	--0 CALC TAX EXTRNAL 1 CALC TAX IN SAVE
			       ,P_SAVE_TYP		  IN NUMBER  DEFAULT 0	--## 0 INSERT OFFLINE BILL 1 INSERT ONL
			       ,P_LNG_NO		  IN NUMBER) RETURN VARCHAR2;
   --##-----------------------------------------------------------------------------------------------------##--
   FUNCTION INSRT_SALES_ORDER_DTL_FNC(P_SO_TYPE       IN ORDER_DETAIL.SO_TYPE%TYPE
				   ,P_ORDER_NO	      IN ORDER_DETAIL.ORDER_NO%TYPE
				   ,P_ORDER_SER       IN ORDER_DETAIL.ORDER_SER%TYPE
				   ,P_I_CODE	      IN ORDER_DETAIL.I_CODE%TYPE
				   ,P_ITM_UNT	      IN ORDER_DETAIL.ITM_UNT%TYPE
				   ,P_P_SIZE	      IN ORDER_DETAIL.P_SIZE%TYPE
				   ,P_I_QTY	      IN ORDER_DETAIL.I_QTY%TYPE
				   ,P_FREE_QTY	      IN ORDER_DETAIL.FREE_QTY%TYPE
				   ,P_P_QTY	      IN ORDER_DETAIL.P_QTY%TYPE
				   ,P_EXPIRE_DATE     IN ORDER_DETAIL.EXPIRE_DATE%TYPE
				   ,P_BATCH_NO	      IN ORDER_DETAIL.BATCH_NO%TYPE
				   ,P_I_PRICE	      IN ORDER_DETAIL.I_PRICE%TYPE
				   ,P_I_PRICE_VAT     IN ORDER_DETAIL.I_PRICE_VAT%TYPE
				   ,P_VAT_PER	      IN ORDER_DETAIL.VAT_PER%TYPE
				   ,P_VAT_AMT	      IN ORDER_DETAIL.VAT_AMT%TYPE
				   ,P_DIS_PER	      IN ORDER_DETAIL.DIS_PER%TYPE
				   ,P_DIS_AMT_DTL_VAT IN ORDER_DETAIL.DIS_AMT_DTL_VAT%TYPE
				   ,P_DIS_AMT_DTL     IN ORDER_DETAIL.DIS_AMT_DTL%TYPE
				   ,P_DIS_AMT_MST     IN ORDER_DETAIL.DIS_AMT_MST%TYPE
				   ,P_DIS_AMT_MST_VAT IN ORDER_DETAIL.DIS_AMT_MST_VAT%TYPE
				   ,P_DIS_AMT	      IN ORDER_DETAIL.DIS_AMT%TYPE
				   ,P_DIS_AMT_AFTR_VAT IN ORDER_DETAIL.DIS_AMT_AFTR_VAT%TYPE DEFAULT NULL
				   ,P_OTHR_AMT	      IN ORDER_DETAIL.OTHR_AMT%TYPE
				   ,P_W_CODE	      IN ORDER_DETAIL.W_CODE%TYPE
				   ,P_RCRD_NO	      IN ORDER_DETAIL.RCRD_NO%TYPE
				   ,P_BARCODE	      IN ORDER_DETAIL.BARCODE%TYPE
				   ,P_ITEM_DESC       IN ORDER_DETAIL.ITEM_DESC%TYPE
				   ,P_CANCELED	      IN ORDER_DETAIL.CANCELED%TYPE
				   ,P_DOC_SEQ	      IN ORDER_DETAIL.DOC_SEQ%TYPE
				   ,P_EMP_NO	      IN ORDER_DETAIL.EMP_NO%TYPE
				   ,P_FIELD_DTL1      IN ORDER_DETAIL.FIELD_DTL1%TYPE
				   ,P_FIELD_DTL2      IN ORDER_DETAIL.FIELD_DTL2%TYPE
				   ,P_FIELD_DTL3      IN ORDER_DETAIL.FIELD_DTL3%TYPE
				   ,P_CMP_NO	      IN ORDER_DETAIL.CMP_NO%TYPE
				   ,P_BRN_NO	      IN ORDER_DETAIL.BRN_NO%TYPE
				   ,P_BRN_YEAR	      IN ORDER_DETAIL.BRN_YEAR%TYPE
				   ,P_BRN_USR	      IN ORDER_DETAIL.BRN_USR%TYPE
				   ,P_QT_PRM_SER      IN ORDER_DETAIL.QT_PRM_SER%TYPE  DEFAULT NULL
				   ,P_QT_PRM_NO       IN ORDER_DETAIL.QT_PRM_NO%TYPE  DEFAULT NULL
				   ,P_QT_PRM_RCRD_NO  IN ORDER_DETAIL.QT_PRM_RCRD_NO%TYPE  DEFAULT NULL
				   ,P_LNG_NO	      IN NUMBER) RETURN VARCHAR2;
   --##------------------------------------------------------------------------------------------------------------------------------##--
   PROCEDURE Snd_Vrfct_Msg_Prc(P_Mobile_No  IN Ias_Pos_Bill_Mst.Mobile_No%TYPE,
				   P_Cust_Code	IN Ias_Pos_Bill_Mst.Mobile_No%TYPE DEFAULT NULL,
				   P_DOC_NO	IN Ias_Pos_Bill_Mst.Bill_No%TYPE,
				   P_Brn_NO	IN Ias_Pos_Bill_Mst.Brn_No%TYPE,
				   P_MSG_TYP	IN NUMBER DEFAULT 1,
				   P_LNG_NO	IN   NUMBER,
				   P_JSON_RSLT OUT VARCHAR
				   );
   --##------------------------------------------------------------------------------------------------------------------------------##--
   Procedure Chk_Itm(P_Doc_Type 	   In Number					   ---## 4 SALES INVOICE 5-  RETURN SALES INVOICE
		    ,P_I_Code		     In Ias_Itm_Mst.I_Code%Type
		    ,P_Itm_Unt		     In Ias_Pos_Bill_Dtl.Itm_Unt%Type
		    ,P_P_Size		     In  Ias_Pos_Bill_Dtl.P_Size%Type			 Default Null
		    ,P_I_Qty		     In Ias_Pos_Bill_Dtl.I_Qty%Type			Default Null
		    ,P_Free_Qty 	     In Ias_Pos_Bill_Dtl.Free_Qty%Type			Default Null
		    ,P_I_Price		     In Ias_Pos_Bill_Dtl.I_Price%Type			Default Null
		    ,P_I_Price_Vat	     In Ias_Pos_Bill_Dtl.I_Price_Vat%Type		Default Null
		    ,P_Lev_No		     In Number					    Default Null
		    ,P_Qt_Prm_Method	     In NUMBER					    Default Null
		    ,P_Qut_Prm_Price	     In NUMBER					    Default Null
		    ,P_Qt_Prm_Ser	     In NUMBER					    Default Null
		    ,P_Dis_Per		     In Ias_Pos_Bill_Dtl.Dis_Per%Type			Default Null
		    ,P_Dis_Amt_Dtl	     In Ias_Pos_Bill_Dtl.Dis_Amt_Dtl%Type		Default Null
		    ,P_Dis_Amt_Dtl_Vat	     In Ias_Pos_Bill_Dtl.Dis_Amt_Dtl_Vat%Type		Default Null
		    ,P_Dis_Amt_Mst	     In Ias_Pos_Bill_Dtl.Dis_Amt_Mst%Type		Default Null
		    ,P_W_Code		     In Ias_Pos_Bill_Dtl.W_Code%Type			Default Null
		    ,P_Expire_Date	     In Ias_Pos_Bill_Dtl.Expire_Date%Type		Default Null
		    ,P_Batch_No 	     In Ias_Pos_Bill_Dtl.Batch_No%Type			Default Null
		    ,P_Brn_No		     In Ias_Pos_Bill_Dtl.Brn_No%Type			Default Null
		    ,P_Doc_Ser		     In Ias_Pos_Bill_Mst.bill_srl%Type		       Default Null
		    ,P_Doc_Date 	     In Ias_Pos_Bill_Mst.Bill_Date%Type 		Default Null
		    ,P_C_Code		     In Customer.c_code%Type			    Default Null
		    ,P_CUR_CODE 	     In EX_RATE.CUR_CODE%Type			    Default Null
		    ,P_Ac_Rate		     In NUMBER					    Default Null
		    ,P_USR_NO		     In USER_R.U_ID%Type			    Default Null
		    ,P_CLC_VAT_PRICE_TYP     IN  NUMBER 				    DEFAULT 1
		    ,P_Bill_Doc_Type	     IN  NUMBER 				   Default Null
		    ,P_Chk_Avlqty_Flg	     In Number					     Default 0
		    ,P_Chk_Itm_Price	     IN  NUMBER DEFAULT 0		     --# 0 nocheck 1 check
		    ,P_Use_Vat		     IN  NUMBER 				    Default Null
		    ,P_Clc_Typ_No_Tax	     IN  NUMBER 				    Default Null
		    ,P_Lng_No		     In Number					    Default 1
		    ,P_Msg_Txt		     In Out Varchar2
		    ,P_Pkg_Line 	     In Out Varchar2
		    ,P_Pkg_NM		    In Out Varchar2 ) ;
Procedure CHK_ITM_PRICE   (  P_I_Code		     In Ias_Itm_Mst.I_Code%Type
			    ,P_Itm_Unt		     In Ias_Pos_Bill_Dtl.Itm_Unt%Type
			    ,P_P_Size		     In Ias_Pos_Bill_Dtl.P_Size%Type			Default Null
			    ,P_I_Qty		     In Ias_Pos_Bill_Dtl.I_Qty%Type			Default Null
			    ,P_I_Price		     In Ias_Pos_Bill_Dtl.I_Price%Type			Default Null
			    ,P_I_Price_Vat	     In Ias_Pos_Bill_Dtl.I_Price_Vat%Type		Default Null
			    ,P_Qt_Prm_Method	     In NUMBER					    Default Null
			    ,P_Qut_Prm_Price	     In NUMBER					    Default Null
			    ,P_Qt_Prm_Ser	     In NUMBER					    Default Null
			    ,P_Dis_Amt_Dtl	     In Ias_Pos_Bill_Dtl.Dis_Amt_Dtl%Type		Default Null
			    ,P_Dis_Amt_Dtl_Vat	     In Ias_Pos_Bill_Dtl.Dis_Amt_Dtl_Vat%Type		Default Null
			    ,P_Dis_Amt_Mst	     In Ias_Pos_Bill_Dtl.Dis_Amt_Mst%Type		Default Null
			    ,P_W_Code		     In Ias_Pos_Bill_Dtl.W_Code%Type			Default Null
			    ,P_Expire_Date	     In Ias_Pos_Bill_Dtl.Expire_Date%Type		Default Null
			    ,P_Batch_No 	     In Ias_Pos_Bill_Dtl.Batch_No%Type			Default Null
			    ,P_Brn_No		     In Ias_Pos_Bill_Dtl.Brn_No%Type			Default Null
			    ,P_Doc_Date 	     In Ias_Pos_Bill_Mst.Bill_Date%Type 		Default Null
			    ,P_CUR_CODE 	     In EX_RATE.CUR_CODE%Type			    Default Null
			    ,P_Ac_Rate		     In NUMBER			    Default Null
			    ,P_Lev_No		     In Number					    Default Null
			    ,P_USR_NO		     In USER_R.U_ID%Type			    Default Null
			    ,P_Use_Exp_Date	     IN  NUMBER 				    DEFAULT 1
			    ,P_Use_Batch_No	     IN  NUMBER 				    DEFAULT 1
			    ,P_Service_Item	     IN  NUMBER 				    DEFAULT 0
			    ,P_Bill_Doc_Type	      IN  NUMBER				    Default Null
			    ,P_CLC_VAT_PRICE_TYP     IN  NUMBER 				    DEFAULT 1
			    ,P_Lng_No		     In Number					    Default 1
			    ,P_Msg_Txt		     In Out Varchar2
			    ,P_Pkg_Line 	     In Out Varchar2
			    ,P_Pkg_NM		     In Out Varchar2);
Function Chk_Price_Lmt(P_Lmt_Typ    In Number,
		       P_Price_Type In Number,
		       P_Price	    In Number,
		       P_W_Code     In Ias_Pos_Bill_Dtl.W_Code%Type Default Null,
		       P_I_Qty	    In Ias_Pos_Bill_Dtl.I_Qty%Type Default Null,
		       P_Brn_No     In Ias_Pos_Bill_Dtl.Brn_No%Type Default Null,
		       P_Usr_No     In User_R.U_Id%Type Default Null,
		       P_Lev_No     In Number Default Null,
		       P_I_Code     In Ias_Itm_Mst.I_Code%Type,
		       P_Itm_Unt    In Ias_Pos_Bill_Dtl.Itm_Unt%Type,
		       P_Cur_Code   In Ex_Rate.Cur_Code%Type Default Null,
		       P_Ac_Rate    In Number Default Null,
		       P_Stk_Rate   In Number Default Null) Return Number;
FUNCTION PST_INSRT_BILL_PRC   RETURN VARCHAR2;
FUNCTION UPDT_BILL_IN_SAV_PRC RETURN VARCHAR2;
FUNCTION PST_INSRT_RT_BILL_PRC	 RETURN VARCHAR2;
FUNCTION UPDT_RT_BILL_IN_SAV_PRC RETURN VARCHAR2;
PROCEDURE CLC_DISC_VAT_AMT_PRC(P_I_CODE 		    IN	   IAS_ITM_MST.I_CODE%TYPE,
			   P_TOT_ITEM_PRICE		    IN	   NUMBER,
			   P_TOT_ITEM_PRICE_VAT 	    IN	   NUMBER,
			   P_TOT_DISC			    IN	   NUMBER,
			   P_TOT_DISC_VAT		    IN	   NUMBER,
			   P_I_QTY			    IN	   NUMBER,
			   P_I_PRICE			    IN	   NUMBER,
			   P_I_PRICE_VAT		    IN	   NUMBER,
			   P_TOTAL_PRICE_WITH_PRM	    IN	   NUMBER,
			   P_SUM_PRICE_WITH_PRM 	    IN	   NUMBER,
			   P_CLC_SI_DISC_WITHOUT_ITM_DISC   IN	   NUMBER,
			   P_CLC_DISC_CARD_TYP		    IN	   NUMBER,
			   P_DISC_AMT_MST		    IN	   NUMBER,
			   P_DISC_AMT_MST_VAT		    IN	   NUMBER,
			   P_DISC_CARD_PRCNT		    IN	   NUMBER,
			   P_DIS_AMT_DTL		    IN	   NUMBER,
			   P_DIS_AMT_DTL_VAT		    IN	   NUMBER,
			   P_DIS_AMT_MST		    IN OUT NUMBER,
			   P_DIS_AMT_MST_VAT		    IN OUT NUMBER,
			   P_DIS_AMT			    IN OUT NUMBER);
 PROCEDURE CLC_ITM_TAX(P_I_CODE 		    IN	   VARCHAR2,
			  P_USE_VAT		    IN	   NUMBER,
			  P_CLC_TYP_NO_TAX	    IN	   NUMBER,
			  P_CALC_VAT_AMT_TYPE	    IN	   NUMBER,
			  P_USE_PRICE_INCLUDE_VAT   IN	   NUMBER,
			  P_I_PRICE		    IN	   NUMBER,
			  P_I_PRICE_VAT 	    IN	   NUMBER,
			  P_DIS_AMT_MST 	    IN	   NUMBER,
			  P_DIS_AMT_MST_VAT	    IN	   NUMBER,
			  P_SUM_TOTAL_VAT_AMT	    IN	   NUMBER,
			  P_DIS_AMT_DTL_VAT	    IN	   NUMBER,
			  P_DISC_AMT_AFTR_VAT	    IN	   NUMBER,
			  P_VAT_PRCNT		    IN OUT NUMBER,
			  P_VAT_AMT		    IN OUT NUMBER,
			  P_DIS_AMT_DTL 	    IN OUT NUMBER,
			  P_VAT_DISC_AMT	    IN OUT NUMBER,
			  P_VAT_AMT_DIS_DTL_VAT     IN OUT NUMBER,
			  P_VAT_AMT_AFTR_DIS	    IN OUT NUMBER,
			  P_VAT_AMT_BFR_DIS	    IN OUT NUMBER,
			  P_VAT_AMT_DIS_MST_VAT     IN OUT NUMBER,
			  P_DIS_AFTR_VAT_MST	    IN OUT NUMBER);
PROCEDURE CHK_BILL_NO_ST_PRC(P_BILL_NO IN IAS_POS_BILL_MST.BILL_NO%TYPE
			   ,P_MACHINE_NO IN IAS_POS_RT_BILL_MST.MACHINE_NO%TYPE
			   ,P_USR_NO  IN USER_R.U_ID%TYPE
			   ,P_BRN_USR IN IAS_POS_BILL_MST.BRN_USR%TYPE
			   ,P_LNG_NO  IN NUMBER
			   ,P_MSG_NO  OUT NUMBER
			   ,P_Msg_Txt OUT VARCHAR2 );
FUNCTION GET_BILL_DATA_XML(P_BILL_NO IN IAS_POS_BILL_MST.BILL_NO%TYPE, P_LANG_NO IN IAS_LABELS.LANG_NO%TYPE)
	RETURN CLOB;
FUNCTION REPLACE_CLOB(P_SRC    CLOB,
			  P_SRCH   CLOB,
			  P_RPLC   CLOB)
	RETURN CLOB;
FUNCTION GET_RT_BILL_DATA_XML(P_RT_BILL_NO IN IAS_POS_RT_BILL_MST.RT_BILL_NO%TYPE, P_LANG_NO IN IAS_LABELS.LANG_NO%TYPE)
	RETURN CLOB;
FUNCTION  GET_POS_DATA(P_TYP_NO    In NUMBER,	--# 1 SALES 2 RT SALES 3 NET SALES
		       P_WHR_SL    In VARCHAR2 DEFAULT NULL,
		       P_WHR_SL_RT In VARCHAR2 DEFAULT NULL,
		       P_NO_DCML   In NUMBER DEFAULT 2,
		       P_LNG_NO    In NUMBER DEFAULT 1 ) RETURN CLOB;
PROCEDURE DLT_HNG_BILL_PRC(P_BILL_NO   IN NUMBER
			  ,P_USR_NO    In USER_R.U_ID%Type  Default Null
			  ,P_Lng_No    In Number  Default 1
			  ,P_Msg_Txt   In Out Varchar2);
PROCEDURE SET_TAX_BILL_TYP(P_BILL_DOC_TYPE IN IAS_POS_BILL_MST.BILL_TYPE%TYPE
			  ,P_C_CODE	   IN CUSTOMER.C_CODE%TYPE
			  ,P_Use_Vat	   IN NUMBER DEFAULT 0
			  ,P_C_TAX_CODE    IN OUT CUSTOMER.C_TAX_CODE%TYPE
			  ,P_TAX_BILL_TYP  IN OUT CUSTOMER.C_CLASS_VAT%TYPE
			  ) ;
PROCEDURE SYNC_E_INVC_PRC(P_DOC_TYPE	   IN	  NUMBER,
			  P_BILL_TYPE	   IN	  NUMBER,
			  P_BRN_NO	   IN	  NUMBER,
			  P_Use_Vat	   In	  Number DEFAULT 0 ,
			  P_SYS_NO	   IN	  NUMBER,
			  P_DOC_SER	   IN	  NUMBER,
			  P_C_CODE	   IN	  VARCHAR2,
			  P_TAX_BILL_TYP   IN	  NUMBER DEFAULT 1,
			  P_OFFLINE_VLDT   IN	  NUMBER DEFAULT 0,
			  P_DO_COMMIT	   IN	  NUMBER DEFAULT 0,
			  P_Tbl_Mst_Nm	   IN	  VARCHAR2,
			  P_Fld_Doc_Ser    IN	  VARCHAR2,
			  P_SAVE_TYP	   IN	  NUMBER DEFAULT 0,
			  P_COMMIT_FLG	   IN	  NUMBER DEFAULT 0,
			  P_WEB_SRVC_UUID  OUT	NUMBER,
			  P_WRNNG_TXT	   OUT VARCHAR2,
			  P_Msg_Txt	   Out Varchar2,
			  P_ERR_NO	   Out Varchar2,
			  P_Pkg_NM	   Out Varchar2);
    FUNCTION CHK_DSC_PRV_FNC RETURN NUMBER;
   END POS_API_PKG;
/

-- ---------------------------------------------
-- PACKAGE BODY: POS_API_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE BODY POS_API_PKG  IS
   FUNCTION LOAD_PRMTRS RETURN VARCHAR2 IS
   BEGIN
     BEGIN
       SELECT USE_PAID,USE_PAY_CASH_RT_BILLS,IAS_PARA_POS.Use_Pos_Point_Sys,IAS_PARA_AR.Point_Age_Expired_Typ,IAS_PARA_AR.Point_Age_Expired_Prd,
	     USE_PRICE_INCLUDE_VAT,Calc_vat_amt_type,CHCK_AVL_QTY,IAS_PARA_AR.NO_OF_DECIMAL_AR,
	     NVL(CALC_SI_DISC_WITHOUT_ITM_DISC, 0), 3--NVL(CLC_DISC_CARD_TYP,3)
	     ,Nvl(Calc_Vat_Amt_Type,0),IAS_PARA_POS.USE_WRK_SHFT
	INTO G_USE_PAID_BILLS,V_USE_PAY_CASH_RT_BILLS,V_Use_Pos_Point_Sys,V_Point_Age_Expired_Typ,V_Point_Age_Expired_Prd,
	     G_USE_PRICE_INCLUDE_VAT,G_Clc_Vat_Price_Typ,G_CHCK_AVL_QTY,G_NO_OF_DECIMAL_AR,
	     G_CLC_SI_DISC_WITHOUT_ITM_DISC,G_CLC_DISC_CARD_TYP
	    ,V_Calc_Vat_Amt_Type,G_USE_WRK_SHFT
       FROM IAS_PARA_POS,IAS_PARA_AR,IAS_PARA_GEN;
     EXCEPTION WHEN OTHERS  THEN
	    RETURN 'ERROR WHEN GET PARAMETERS FROM IAS_PARA_POS ' || SQLERRM;
     END;
      --G_SRVR_NO := RMS_GNR_PKG.GET_SRVR_NO;
      IF G_MACHINE_NO IS NOT NULL THEN
	BEGIN
	    SELECT CC_CODE,ACTV_NO,PJ_NO, NVL(CLC_TYP_NO_TAX, 0), DEF_WCODE,  NVL(USE_VAT, 0),PRICE_LEVEL,DEF_BRN_NO--, CURR_DFLT
	      INTO G_CC_CODE_DFLT,G_ACTV_NO_DFLT,G_PJ_NO_DFLT,G_CLC_TYP_NO_TAX, G_WCODE_DFLT, G_USE_VAT_MCHN,G_LVL_PRICE_NO,G_BRN_NO--, G_A_CY_DFLT
	    FROM IAS_POS_MACHINE
	     WHERE UPPER(MACHINE_NO) = UPPER(G_MACHINE_NO);
	    IF G_USE_VAT_MCHN = 0 THEN
		G_USE_PRICE_INCLUDE_VAT := 0;
	    END IF;
	EXCEPTION WHEN OTHERS THEN
		RETURN 'ERROR WHEN GET PARAMETERS FROM IAS_POS_MACHINE MACHINE_NO =' || G_MACHINE_NO;
	END;
     END IF;
     RETURN NULL;
   END LOAD_PRMTRS;
   --##-----------------------------------------------------------------------------------------------------##--
  FUNCTION  GET_BRN_XML( P_DVC_SRL  In VARCHAR2
			 ,P_LNG_NO IN NUMBER DEFAULT 1) RETURN CLOB IS
	 V_CNT	   NUMBER;
	 V_LNG_NO  NUMBER;
	 V_SQL	   VARCHAR2(4000);
	 QRY_CTX   DBMS_XMLGEN.CTXHANDLE;
     QRY_RSLT  CLOB;
  BEGIN
    IF P_DVC_SRL IS NOT NULL THEN
	V_SQL:='Select Brn_no,Decode('||P_LNG_NO||',1,Nvl(BRN_LNAME,BRN_FNAME),
		  Nvl(BRN_FNAME,BRN_LNAME))BRN_NAME
		From S_Brn
		Where	Exists (select 1 From S_Brn_Usr_Priv S_PRV,IAS_V_USR_PRIV_MACHINE_PRV M_PRV
					  Where S_PRV.U_ID=M_PRV.U_ID
					    And S_PRV.Brn_No = S_Brn.Brn_No
					    And Nvl(S_PRV.Add_Flag,1) = 1
					    AND NVL(M_PRV.USED,0)=1
					    AND  M_PRV.MACHINE_NAME='''||P_DVC_SRL||'''
					    And RowNum<=1 )
					    Order By Cmp_No , Brn_No';

      QRY_CTX :=DBMS_XMLGEN.NEWCONTEXT (V_SQL);
      DBMS_XMLGEN.SETNULLHANDLING(QRY_CTX,DBMS_XMLGEN.EMPTY_TAG);
      QRY_RSLT := DBMS_XMLGEN.GETXML(QRY_CTX);
    END IF;
   RETURN QRY_RSLT;
  EXCEPTION
     WHEN OTHERS THEN
	 RETURN NULL;
	 RAISE_APPLICATION_ERROR(-20201,' Error When GET BRANCH Data. '|| CHR(13) || SQLERRM);
 END GET_BRN_XML;
 --##-----------------------------------------------------------------------------------------------------##--
 FUNCTION  GET_IAS_PARA_POS_XML(P_LNG_NO IN NUMBER DEFAULT 1) RETURN CLOB IS

   V_CNT     NUMBER;
   V_SQL     VARCHAR2(4000);
   QRY_CTX   DBMS_XMLGEN.CTXHANDLE;
   QRY_RSLT  CLOB;
  BEGIN

	V_SQL:='Select * FROM IAS_PARA_POS Where 1=1';

      QRY_CTX :=DBMS_XMLGEN.NEWCONTEXT (V_SQL);
      DBMS_XMLGEN.SETNULLHANDLING(QRY_CTX,DBMS_XMLGEN.EMPTY_TAG);
      QRY_RSLT := DBMS_XMLGEN.GETXML(QRY_CTX);
      RETURN QRY_RSLT;

  EXCEPTION
     WHEN OTHERS THEN
	 RETURN NULL;
	 RAISE_APPLICATION_ERROR(-20201,' Error When GET IAS_PARA_POS Data. '|| CHR(13) || SQLERRM);
 END GET_IAS_PARA_POS_XML;
 --##-----------------------------------------------------------------------------------------------------##--
 FUNCTION  GET_IAS_PARA_GEN_XML(P_LNG_NO IN NUMBER DEFAULT 1) RETURN CLOB IS
   V_CNT     NUMBER;
   V_SQL     VARCHAR2(4000);
   QRY_CTX   DBMS_XMLGEN.CTXHANDLE;
   QRY_RSLT  CLOB;
  BEGIN
	V_SQL:='Select * FROM IAS_PARA_GEN Where 1=1';

	QRY_CTX :=DBMS_XMLGEN.NEWCONTEXT (V_SQL);
      DBMS_XMLGEN.SETNULLHANDLING(QRY_CTX,DBMS_XMLGEN.EMPTY_TAG);
      QRY_RSLT := DBMS_XMLGEN.GETXML(QRY_CTX);
      RETURN QRY_RSLT;

  EXCEPTION
     WHEN OTHERS THEN
	 RETURN NULL;
	 RAISE_APPLICATION_ERROR(-20201,' Error When GET IAS_PARA_GEN Data. '|| CHR(13) || SQLERRM);
 END GET_IAS_PARA_GEN_XML;
 --##-----------------------------------------------------------------------------------------------------##--
 FUNCTION  GET_IAS_PARA_AR_XML(P_LNG_NO IN NUMBER DEFAULT 1) RETURN CLOB IS

   V_CNT     NUMBER;
   V_SQL     VARCHAR2(4000);
   QRY_CTX   DBMS_XMLGEN.CTXHANDLE;
   QRY_RSLT  CLOB;
  BEGIN
      V_SQL:='Select * FROM IAS_PARA_AR Where 1=1';
      QRY_CTX :=DBMS_XMLGEN.NEWCONTEXT (V_SQL);
      DBMS_XMLGEN.SETNULLHANDLING(QRY_CTX,DBMS_XMLGEN.EMPTY_TAG);
      QRY_RSLT := DBMS_XMLGEN.GETXML(QRY_CTX);
      RETURN QRY_RSLT;

  EXCEPTION
     WHEN OTHERS THEN
	 RETURN NULL;
	 RAISE_APPLICATION_ERROR(-20201,' Error When GET IAS_PARA_AR Data. '|| CHR(13) || SQLERRM);
 END GET_IAS_PARA_AR_XML;
--##-----------------------------------------------------------------------------------------------------##--
 FUNCTION  GET_POS_MACHINE_XML	(P_DVC_SRL  In VARCHAR2 ) RETURN CLOB IS

   V_CNT     NUMBER;
   V_SQL     VARCHAR2(4000);
   QRY_CTX   DBMS_XMLGEN.CTXHANDLE;
   QRY_RSLT  CLOB;
  BEGIN

	V_SQL:='Select * From Ias_Pos_Machine
		Where Nvl(USE_MOBILE_APP_FLG,0)=1 And  TERMINAL  = Nvl('||''''||P_DVC_SRL||''''||',TERMINAL) ';

      QRY_CTX :=DBMS_XMLGEN.NEWCONTEXT (V_SQL);
      DBMS_XMLGEN.SETNULLHANDLING(QRY_CTX,DBMS_XMLGEN.EMPTY_TAG);
      QRY_RSLT := DBMS_XMLGEN.GETXML(QRY_CTX);
      RETURN QRY_RSLT;
  EXCEPTION
     WHEN OTHERS THEN
	 RETURN NULL;
	 RAISE_APPLICATION_ERROR(-20201,' Error When GET Ias_Pos_Machine Data. '|| CHR(13) || SQLERRM);
 END GET_POS_MACHINE_XML;
 --##-----------------------------------------------------------------------------------------------------##--
 FUNCTION  GET_POS_PRIV_MACHINE_XML( P_DVC_SRL	In VARCHAR2) RETURN CLOB IS
   V_CNT     NUMBER;
   V_SQL     VARCHAR2(4000);
   QRY_CTX   DBMS_XMLGEN.CTXHANDLE;
   QRY_RSLT  CLOB;
  BEGIN

    IF P_DVC_SRL IS NOT NULL THEN
	V_SQL:='Select U_ID,USR_NAME,MACHINE_NO,MACHINE_NAME,USED
		 From  IAS_V_USR_PRIV_MACHINE_PRV M_PRV
		 Where NVL(USED,0)=1 AND  MACHINE_NAME='''||P_DVC_SRL||'''';

      QRY_CTX :=DBMS_XMLGEN.NEWCONTEXT (V_SQL);
      DBMS_XMLGEN.SETNULLHANDLING(QRY_CTX,DBMS_XMLGEN.EMPTY_TAG);
      QRY_RSLT := DBMS_XMLGEN.GETXML(QRY_CTX);
    END IF;
    RETURN QRY_RSLT;
  EXCEPTION
     WHEN OTHERS THEN
	 RETURN NULL;
	 RAISE_APPLICATION_ERROR(-20201,' Error When GET PRIV_MACHINE Data. '|| CHR(13) || SQLERRM);
 END GET_POS_PRIV_MACHINE_XML;
 --##-----------------------------------------------------------------------------------------------------##--
 FUNCTION  GET_POS_USR_PRV_XML( P_DVC_SRL  In VARCHAR2) RETURN CLOB IS
    V_CNT     NUMBER;
    V_SQL     VARCHAR2(4000);
    QRY_CTX   DBMS_XMLGEN.CTXHANDLE;
    QRY_RSLT  CLOB;
  BEGIN
    IF P_DVC_SRL IS NOT NULL THEN
	V_SQL:='Select U_ID			,
		    inv_dis_lmt 		,
		    Max_Disc_Itm_Per		,
		    Inv_Dis_Lmt_Itm		,
		    Mod_Itm_Disc		,
		    Allow_Del_Itm_From_Pos_Bill ,
		    Allow_Change_Pos_Qty	,
		    Pmanual			,
		    Use_Undo_Ctrlu		,
		    Rtn_Bill_No 		,
		    Print_Prev_Bill		,
		    ALLW_PRNT_LAST_BILL 	,
		    ALLOW_HUNG_BILLS		,
		    ALLW_APRVD_POS_RTBILL	,
		    PLIMIT_TYPE 		,
		    L_Price			,
		    H_Price			,
		    Nvl(allow_bill_fqty_only,0) allow_bill_fqty_only,
		    Nvl(AR_ALLOW_DISC_ITM_QUT_PRM_SI,0) AR_ALLOW_DISC_ITM_QUT_PRM_SI,
		    PLIMIT_PER,
		    Allw_Sal_New_Expdate,
		    PRNT_CNT_FOR_BILL,
		    SRCH_ITM_CRTRIA ,
		    crlimit_type,
		    CRLIMIT_PER,
		    Nvl(AR_UPDATE_FREE_QTY,0) AR_UPDATE_FREE_QTY,
		    Allw_decrs_qty,
		    ALLW_UPD_PYMNT_TYP_SI_IN_SR,
		    POS_PYMNT_UNPAID_BILLS,
		    PAY_AVL_QTY,
		    ALLW_CLS_MSGBOX_AFTR_ENTR_ITM,
		    RTRN_BILL_MOR_ONE,
		    Allw_excd_lmt_sal_itm,
		    ALLW_FILL_ALL_ITM_TO_RTBILL
      FROM PRIVILEGE_FIXED
      WHERE
      EXISTS(SELECT 1
       FROM  IAS_V_USR_PRIV_MACHINE_PRV M_PRV
       WHERE M_PRV.U_ID=PRIVILEGE_FIXED.U_ID AND NVL(M_PRV.USED,0)=1
       AND  M_PRV.MACHINE_NAME='''||P_DVC_SRL||'''  And RowNum<=1 )
       ORDER BY U_ID'  ;

      QRY_CTX :=DBMS_XMLGEN.NEWCONTEXT (V_SQL);
      DBMS_XMLGEN.SETNULLHANDLING(QRY_CTX,DBMS_XMLGEN.EMPTY_TAG);
      QRY_RSLT := DBMS_XMLGEN.GETXML(QRY_CTX);
     END IF;
      RETURN QRY_RSLT;
  EXCEPTION
     WHEN OTHERS THEN
	 RETURN NULL;
	 RAISE_APPLICATION_ERROR(-20201,' Error When GET USR_PRV Data. '|| CHR(13) || SQLERRM);
 END GET_POS_USR_PRV_XML;
 --##-----------------------------------------------------------------------------------------------------##--
 FUNCTION  GET_EMP_NO_XML  (P_DVC_SRL  In VARCHAR2
			   ,P_LNG_NO IN NUMBER DEFAULT 1) RETURN CLOB IS
    V_CNT     NUMBER;
    V_SQL     VARCHAR2(4000);
    QRY_CTX   DBMS_XMLGEN.CTXHANDLE;
    QRY_RSLT  CLOB;
  BEGIN

  --#------------------------------------------------------------------------------------------------------------
       If Ys_Gen_Pkg.Get_Fld_Value ('IAS_PARA_GEN', 'EMP_PRV_TYP') = 0 Then
	    V_Sql:=' Select Emp_No,Decode('||P_Lng_No||',1,Nvl(Emp_L_Nm,Emp_F_Nm),Nvl(Emp_F_Nm,Emp_L_Nm)) Emp_Name
		From s_Emp
		where Nvl(Inactive,0)=0
		 Order By Emp_No';
       Else
	  IF Ys_Gen_Pkg.Get_Fld_Value ('IAS_PARA_GEN','EMP_PRV_TYP') IN(0,2) THEN
	    V_Sql:='Select M.Emp_No,Decode('||P_Lng_No||',1,Nvl(M.Emp_L_Nm,M.Emp_F_Nm),Nvl(M.Emp_F_Nm,M.Emp_L_Nm)) Emp_Name
	       From s_Emp M Where Nvl(M.Inactive,0)=0 '  ;
	  ELSE
	     V_Sql:='Select M.Emp_No,Decode('||P_Lng_No||',1,Nvl(M.Emp_L_Nm,M.Emp_F_Nm),Nvl(M.Emp_F_Nm,M.Emp_L_Nm)) Emp_Name
	     From s_Emp M Where Nvl(M.Inactive,0)=0
		     AND  EXISTS(SELECT 1
		 FROM  IAS_V_USR_PRIV_MACHINE_PRV M_PRV ,S_Emp_Prv  S_PRV
		 WHERE M_PRV.U_ID=S_PRV.U_ID AND S_PRV.EMPNO_HRCHYNO=M.Emp_No AND NVL(M_PRV.USED,0)=1 AND NVL(S_PRV.ADD_FLAG,0)=1 AND  M_PRV.MACHINE_NAME='''||P_DVC_SRL||'''  And RowNum<=1 )'  ;
	  End If;
       End If;

	QRY_CTX :=DBMS_XMLGEN.NEWCONTEXT (V_SQL);
      DBMS_XMLGEN.SETNULLHANDLING(QRY_CTX,DBMS_XMLGEN.EMPTY_TAG);
      QRY_RSLT := DBMS_XMLGEN.GETXML(QRY_CTX);
      RETURN QRY_RSLT;
  EXCEPTION
     WHEN OTHERS THEN
	 RETURN NULL;
	 RAISE_APPLICATION_ERROR(-20201,' Error When GET Employee Data. '|| CHR(13) || SQLERRM);
 END GET_EMP_NO_XML;
 --##-----------------------------------------------------------------------------------------------------##--
PROCEDURE EXTRCT_POS_BILL_PRC(	P_XML in	     CLOB,
				P_JSON_RSLT	     OUT CLOB	 )  IS
V_JSON_RSLT   VARCHAR2(4000);
V_XML_TYPE    XMLTYPE;
--V_BILL_NO   IAS_POS_BILL_MST.BILL_NO%TYPE;
V_Cur_Code    VARCHAR2(1000);
V_VAT_AMT	     NUMBER;
V_RCRD_NO	     NUMBER;
V_DOC_D_SEQ	     NUMBER;
V_CREDIT_CARD	     NUMBER;
V_HUNG_BILL	     NUMBER;
V_ERR_MSG	     VARCHAR2(1000);
V_WRNNG_TXT	     VARCHAR2(4000);
V_Msg_Txt	     VARCHAR2(4000);
V_ERR_NO	     VARCHAR2(100);
V_Pkg_NM	     VARCHAR2(100);
V_OFFLINE_VLDT	     NUMBER;
V_C_TAX_CODE	     CUSTOMER.C_TAX_CODE%TYPE;
V_UPD_MCHN_FLG	     NUMBER;
V_Calc_Vat_Amt_Type  NUMBER;
BEGIN
    --V_JSON_RSLT:= '{"_Result": { "_Doc_No":@DOC_NO,"_ErrMsg": "@errmsg","_ErrNo": @errno } }';
    V_JSON_RSLT:= '{"_Result": { "_Doc_No":"@DOC_NO","_ErrMsg": "@errmsg","_ErrNo": @errno ,"_DOC_UUID":"@DOC_UUID","_WRNNG_TXT":"@WRNNG_TXT" } }';
    V_XML_TYPE :=XMLTYPE.CREATEXML ( P_XML);
    FOR M_CV IN
			(SELECT      EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BILL_NO	       ') AS  BILL_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BILL_DATE	       ') AS  BILL_DATE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BILL_TIME	       ') AS  BILL_TIME
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BILL_TYPE	       ') AS  BILL_TYPE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/MOBILE_NO	       ') AS  MOBILE_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CUST_CODE	       ') AS  CUST_CODE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/C_CODE 	       ') AS  C_CODE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/EMP_NO 	       ') AS  EMP_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/A_CY		       ') AS  A_CY
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BILL_RATE	       ') AS  BILL_RATE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BILL_AMT	       ') AS  BILL_AMT
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CLC_TYP_NO_TAX        ') AS  CLC_TYP_NO_TAX
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/POINT_TYP_NO	       ') AS  POINT_TYP_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/POINT_CALC_TYP_NO     ') AS  POINT_CALC_TYP_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/POINT_RPLC_AMT        ') AS  POINT_RPLC_AMT
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/POSTED 	       ') AS  POSTED
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BILL_NOTE	       ') AS  BILL_NOTE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/MACHINE_NO	       ') AS  MACHINE_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/SRVR_NO	       ') AS  SRVR_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/HUNG		       ') AS  HUNG
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/PAYED_AMT	       ') AS  PAYED_AMT
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/VAT_AMT	       ') AS  VAT_AMT
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DISC_AMT	       ') AS  DISC_AMT
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DISC_AMT_MST	       ') AS  DISC_AMT_MST
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DISC_AMT_DTL	       ') AS  DISC_AMT_DTL
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DISC_AMT_AFTR_VAT     ') AS  DISC_AMT_AFTR_VAT
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/PAID_BILL	       ') AS  PAID_BILL
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/W_CODE 	       ') AS  W_CODE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/PAID_U_ID	       ') AS  PAID_U_ID
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/PAID_DATE	       ') AS  PAID_DATE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/REP_CODE	       ') AS  REP_CODE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/SI_TYPE	       ') AS  SI_TYPE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CARD_AMT	       ') AS  CARD_AMT
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CHEQUE_NO	       ') AS  CHEQUE_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CHEQUE_AMT	       ') AS  CHEQUE_AMT
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CHEQUE_DUE_DATE       ') AS  CHEQUE_DUE_DATE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CREDIT_CARD	       ') AS  CREDIT_CARD
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_NO	       ') AS  CR_CARD_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_AMT	       ') AS  CR_CARD_AMT
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_COMM_PER      ') AS  CR_CARD_COMM_PER
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_NO_SCND       ') AS  CR_CARD_NO_SCND
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_AMT_SCND      ') AS  CR_CARD_AMT_SCND
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_COMM_PER_SCND	 ') AS	CR_CARD_COMM_PER_SCND
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_NO_THRD       ') AS  CR_CARD_NO_THRD
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_AMT_THRD      ') AS  CR_CARD_AMT_THRD
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_COMM_PER_THRD ') AS  CR_CARD_COMM_PER_THRD
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_VALUE_DATE	       ') AS  CR_VALUE_DATE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_VALUE_DATE_SCND    ') AS  CR_VALUE_DATE_SCND
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_VALUE_DATE_THRD    ') AS  CR_VALUE_DATE_THRD
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_CST_NO 	') AS CR_CARD_CST_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_CST_NO_SCND	') AS CR_CARD_CST_NO_SCND
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/P_CR_CARD_CST_NO_THRD	') AS CR_CARD_CST_NO_THRD
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CASH_NO	    ') AS  CASH_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FIELD1 	    ') AS  FIELD1
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FIELD2 	    ') AS  FIELD2
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FIELD3 	    ') AS  FIELD3
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FIELD4 	    ') AS  FIELD4
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FIELD5 	    ') AS  FIELD5
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/AD_U_ID	    ') AS  AD_U_ID
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/AD_DATE	    ') AS  AD_DATE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/UP_U_ID	    ') AS  UP_U_ID
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/UP_DATE	    ') AS  UP_DATE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/UP_CNT 	    ') AS  UP_CNT
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/PR_REP 	    ') AS  PR_REP
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CMP_NO 	    ') AS  CMP_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BRN_NO 	    ') AS  BRN_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BRN_YEAR	     ') AS  BRN_YEAR
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BRN_USR	     ') AS  BRN_USR
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/UP_TRMNL_NM	     ') AS  UP_TRMNL_NM
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/AD_TRMNL_NM	     ') AS  AD_TRMNL_NM
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CRD_NO 	     ') AS  CRD_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CRD_DISC_PER	     ') AS  CRD_DISC_PER
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/QT_PRM_NO	     ') AS  QT_PRM_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/QT_PRM_SER	     ') AS  QT_PRM_SER
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/QT_PRM_RCRD_NO      ') AS  QT_PRM_RCRD_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/ASS_AMT	     ') AS  ASS_AMT
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/PYMNT_AC	     ') AS  PYMNT_AC
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/AC_CODE	      ') AS  AC_CODE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/AC_DTL_TYP	      ') AS  AC_DTL_TYP
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/AC_CODE_DTL	       ') AS  AC_CODE_DTL
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/AC_AMT 	       ') AS  AC_AMT
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/OTHR_AMT	       ') AS  OTHR_AMT
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CLC_TAX_FREE_QTY_FLG  ') AS  CLC_TAX_FREE_QTY_FLG
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_GROUP_NO      ') AS  CR_CARD_GROUP_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DOC_SER_EXTRNL        ') AS  DOC_SER_EXTRNL
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DOC_MCHN_SQ	       ') AS  DOC_MCHN_SQ
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/EXTERNAL_POST	       ') AS  EXTERNAL_POST
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CC_CODE	       ') AS  CC_CODE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/PJ_NO		       ') AS  PJ_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/ACTV_NO	       ') AS  ACTV_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/REF_NO 	       ') AS  REF_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/LNG_NO 	       ') AS  LNG_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CLC_TAX_EXTRNAL_FLG   ') AS  CLC_TAX_EXTRNAL_FLG
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/C_TAX_CODE   ') AS  C_TAX_CODE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/SAVE_TYP	       ') AS  SAVE_TYP	--# 0 OFFLINE 1 ONLINE SAVE IN DB 2 ONLINE  CLC AND RETURN BILL DATA XML NO SAVE 3 ONLINE SAVE BILL AFTER CLC AND RETURN BILL DATA
			FROM TABLE (XMLSEQUENCE (EXTRACT (V_XML_TYPE, '/IAS_POS_BILL/IAS_POS_BILL_MST'))) XMLMSTDMY)
      LOOP --(1)
      --##--------------------------------------------------------------------------------##--
       IF NVL(M_CV.SAVE_TYP,0)=0 AND M_CV.BILL_NO IS NULL THEN
	  ROLLBACK;
	  RAISE_APPLICATION_ERROR(-20904,'Error App BILL_NO IS NULL '||CHR(10)||SQLERRM) ;
       END IF;
       --##--------------------------------------------------------------------------------##--
	IF NVL(M_CV.SAVE_TYP,0)>0 AND M_CV.BILL_NO IS NOT NULL THEN --AND NVL(M_CV.HUNG,0)=0 THEN
	    BEGIN
	      SELECT HUNG INTO V_HUNG_BILL FROM IAS_POS_BILL_MST WHERE BILL_NO=M_CV.BILL_NO;
	    EXCEPTION WHEN OTHERS THEN
	       V_HUNG_BILL:=0;
	    END;
       END IF;
      --##--------------------------------------------------------------------------------##--
       IF NVL(M_CV.SAVE_TYP,0)>0 AND NVL(V_HUNG_BILL,0)<>1 THEN
	  G_SRVR_NO:=POS_GNR_PKG.GET_SRVR_NO_FNC;
	  IF NVL(M_CV.SAVE_TYP,0)=2 THEN
	    V_UPD_MCHN_FLG:=0;
	  ELSE
	    V_UPD_MCHN_FLG:=1;
	  END IF;
	  POS_GNR_PKG.GET_BILL_NO_PRC(P_YR_NO	      =>M_CV.BRN_YEAR,
				      P_AD_USR_NO     =>M_CV.AD_U_ID,
				      P_MCHN_NO       =>M_CV.MACHINE_NO,
				      P_SRVR_NO       =>G_SRVR_NO,
				      P_UPD_MCHN_FLG  =>V_UPD_MCHN_FLG,
				      P_BILL_NO       =>G_BILL_NO,
				      P_BILL_SRL      =>G_BILL_SRL,
				      P_DOC_MCHN_SQ   =>G_DOC_MCHN_SQ);

	POS_GNR_PKG.GET_DATE_INCRS_DCRS_PRC(P_BILL_DATE=>G_BILL_DATE,
					    P_BILL_TIME=>G_BILL_TIME);
      ELSE
	 G_BILL_NO    :=M_CV.BILL_NO;
	 G_DOC_MCHN_SQ:=M_CV.DOC_MCHN_SQ;
	 G_BILL_DATE  :=M_CV.BILL_DATE;
	 G_BILL_TIME  :=M_CV.BILL_TIME;
	 IF M_CV.SRVR_NO IS NOT NULL THEN
	     G_SRVR_NO :=M_CV.SRVR_NO;
	 ELSE
	     G_SRVR_NO :=POS_GNR_PKG.GET_SRVR_NO_FNC;
	 END IF;
	 IF (NVL(V_HUNG_BILL,0)=1 OR NVL(M_CV.HUNG,0)=1 ) AND M_CV.BILL_NO IS NOT NULL THEN
	     POS_GNR_PKG.GET_DATE_INCRS_DCRS_PRC(P_BILL_DATE=>G_BILL_DATE,
						 P_BILL_TIME=>G_BILL_TIME);

	      BEGIN
		 DELETE FROM IAS_POS_BILL_MST WHERE BILL_NO=M_CV.BILL_NO;
					       DELETE FROM IAS_POS_BILL_DTL WHERE BILL_NO=M_CV.BILL_NO;
					       DELETE FROM POS_TAX_ITM_MOVMNT WHERE DOC_NO=M_CV.BILL_NO AND DOC_TYPE=4;
					       DELETE FROM IAS_POS_PAY_BILLS WHERE BILL_NO=M_CV.BILL_NO;
	      EXCEPTION WHEN OTHERS THEN
		 NULL;
	      END;
	 END IF;
      END IF;
     IF NVL(M_CV.BILL_RATE,0)>0 THEN
	G_Cur_Rate:=M_CV.BILL_RATE;
     ELSE
	G_Cur_Rate:=Ias_Gen_Pkg.Get_Cur_rate(p_acy=>M_CV.A_CY);
     END IF;
   --##--------------------------------------------------------------------------------##--
    G_SAVE_TYP:=NVL(M_CV.SAVE_TYP,0);
    G_CLC_TAX_EXTRNAL_FLG:=M_CV.CLC_TAX_EXTRNAL_FLG;
    G_LNG_NO  :=NVL(M_CV.LNG_NO,1);
    IF M_CV.W_CODE IS NOT NULL THEN
       G_WCODE:=M_CV.W_CODE;
    END IF;
    IF M_CV.BRN_NO IS NOT NULL THEN
	G_BRN_NO:=M_CV.BRN_NO;
    END IF;
    If Nvl(M_CV.Cr_Card_Amt,0)+Nvl(M_CV.Cr_Card_Amt_Scnd,0)+Nvl(M_CV.Cr_Card_Amt_Thrd,0) > 0 THEN
	V_CREDIT_CARD:=1;
    END IF;
   --##--------------------------------------------------------------------------------##--
    BEGIN
     SELECT Use_Vat INTO G_Use_Vat
	FROM IAS_PARA_GEN ;
    EXCEPTION
	WHEN NO_DATA_FOUND THEN
	 G_Use_Vat := 0 ;
    END ;
    G_MACHINE_NO :=M_CV.MACHINE_NO;
 /* LOAD PARAMETERS */
    V_ERR_MSG := LOAD_PRMTRS;
    IF V_ERR_MSG IS NOT NULL
    THEN
	RAISE_APPLICATION_ERROR(-20002,' Err when load parameter , '||V_ERR_MSG ||' '||SQLERRM);
    END IF;
    If NVL(G_Use_Vat,0)=1 AND M_CV.C_CODE||M_CV.CUST_CODE IS NOT NULL THEN
    YS_TAX_PKG.GET_CST_TAX_BILL_TYP(P_BILL_TYPE    =>M_CV.BILL_TYPE
				  ,P_C_CODE	   =>M_CV.C_CODE
				  ,P_CST_CSH_CODE  =>M_CV.CUST_CODE
				  ,P_Use_Vat	   =>G_Use_Vat
				  ,P_C_TAX_CODE    =>V_C_TAX_CODE
				  ,P_TAX_BILL_TYP  =>G_TAX_BILL_TYP
				  );
    ELSE
       V_C_TAX_CODE:='';
       G_TAX_BILL_TYP:=1;
       M_CV.C_TAX_CODE:='';
    END IF;
    IF M_CV.C_TAX_CODE IS NOT NULL THEN
       V_C_TAX_CODE:=M_CV.C_TAX_CODE;
    END IF;
    --##--------------------------------------------------------------------------------##--
BEGIN		       --(2)
INSRT_IAS_POS_BILL_MST( P_BILL_NO      =>G_BILL_NO
		,P_BILL_DATE	       =>TO_DATE(TO_CHAR(G_BILL_DATE),'DD/MM/RRRR')
		,P_BILL_TIME	       =>G_BILL_TIME
		,P_BILL_TYPE	       =>M_CV.BILL_TYPE
		,P_SI_TYPE	       =>M_CV.SI_TYPE
		,P_C_CODE	       =>M_CV.C_CODE
		,P_EMP_NO	       =>M_CV.EMP_NO
		,P_MOBILE_NO	       =>M_CV.MOBILE_NO
		,P_CUST_CODE	       =>M_CV.CUST_CODE
		,P_A_CY 	       =>M_CV.A_CY
		,P_BILL_RATE	       =>G_Cur_Rate
		,P_BILL_NOTE	       =>M_CV.BILL_NOTE
		,P_MACHINE_NO	       =>M_CV.MACHINE_NO
		,P_CLC_TYP_NO_TAX      =>M_CV.CLC_TYP_NO_TAX
		,P_BILL_AMT	       =>M_CV.BILL_AMT
		,P_POINT_TYP_NO        =>M_CV.POINT_TYP_NO
		,P_POINT_RPLC_AMT      =>M_CV.POINT_RPLC_AMT
		,P_POINT_CALC_TYP_NO   =>M_CV.POINT_CALC_TYP_NO
		,P_POSTED	       =>0
		,P_HUNG 	       =>M_CV.HUNG
		,P_VAT_AMT	       =>M_CV.VAT_AMT
		,P_CARD_AMT	       =>M_CV.CARD_AMT
		,P_DISC_AMT	       =>M_CV.DISC_AMT
		,P_DISC_AMT_MST        =>M_CV.DISC_AMT_MST
		,P_DISC_AMT_DTL        =>M_CV.DISC_AMT_DTL
		,P_DISC_AMT_AFTR_VAT   =>M_CV.DISC_AMT_AFTR_VAT
		,P_W_CODE	       =>G_WCODE
		,P_REP_CODE	       =>M_CV.REP_CODE
		,P_CHEQUE_NO	       =>M_CV.CHEQUE_NO
		,P_CHEQUE_AMT	       =>M_CV.CHEQUE_AMT
		,P_CHEQUE_DUE_DATE     =>TO_DATE(TO_CHAR(M_CV.CHEQUE_DUE_DATE),'DD/MM/RRRR')
		,P_CREDIT_CARD	       =>V_CREDIT_CARD
		,P_CR_CARD_NO	       =>M_CV.CR_CARD_NO
		,P_CR_CARD_AMT	       =>M_CV.CR_CARD_AMT
		,P_CR_CARD_COMM_PER    =>M_CV.CR_CARD_COMM_PER
		,P_CR_CARD_NO_SCND     =>M_CV.CR_CARD_NO_SCND
		,P_CR_CARD_AMT_SCND    =>M_CV.CR_CARD_AMT_SCND
		,P_CR_CARD_COMM_PER_SCND =>M_CV.CR_CARD_COMM_PER_SCND
		,P_CR_CARD_NO_THRD     =>M_CV.CR_CARD_NO_THRD
		,P_CR_CARD_AMT_THRD    =>M_CV.CR_CARD_AMT_THRD
		,P_CR_CARD_COMM_PER_THRD =>M_CV.CR_CARD_COMM_PER_THRD
		,P_CR_VALUE_DATE       =>TO_DATE(TO_CHAR(M_CV.CR_VALUE_DATE),'DD/MM/RRRR')
		,P_CR_VALUE_DATE_SCND  =>TO_DATE(TO_CHAR(M_CV.CR_VALUE_DATE_SCND),'DD/MM/RRRR')
		,P_CR_VALUE_DATE_THRD  =>TO_DATE(TO_CHAR(M_CV.CR_VALUE_DATE_THRD),'DD/MM/RRRR')
		,P_CR_CARD_CST_NO      =>M_CV.CR_CARD_CST_NO
		,P_CR_CARD_CST_NO_SCND =>M_CV.CR_CARD_CST_NO_SCND
		,P_CR_CARD_CST_NO_THRD =>M_CV.CR_CARD_CST_NO_THRD
		,P_CASH_NO	       =>M_CV.CASH_NO
		,P_FIELD1	       =>M_CV.FIELD1
		,P_FIELD2	       =>M_CV.FIELD2
		,P_FIELD3	       =>M_CV.FIELD3
		,P_FIELD4	       =>M_CV.FIELD4
		,P_FIELD5	       =>M_CV.FIELD5
		,P_PAID_BILL	       =>M_CV.PAID_BILL
		,P_PAYED_AMT	       =>M_CV.PAYED_AMT
		,P_PAID_U_ID	       =>M_CV.PAID_U_ID
		,P_PAID_DATE	       =>TO_DATE(TO_CHAR(M_CV.PAID_DATE),'DD/MM/RRRR')
		,P_AD_U_ID	       =>M_CV.AD_U_ID
		,P_AD_DATE	       =>sysdate
		,P_UP_U_ID	       =>M_CV.UP_U_ID
		,P_UP_DATE	       =>Null
		,P_UP_CNT	       =>M_CV.UP_CNT
		,P_PR_REP	       =>M_CV.PR_REP
		,P_CMP_NO	       =>M_CV.CMP_NO
		,P_BRN_NO	       =>G_BRN_NO
		,P_BRN_YEAR	       =>M_CV.BRN_YEAR
		,P_BRN_USR	       =>M_CV.BRN_USR
		,P_UP_TRMNL_NM	       =>M_CV.UP_TRMNL_NM
		,P_AD_TRMNL_NM	       =>M_CV.AD_TRMNL_NM
		,P_CRD_NO	       =>M_CV.CRD_NO
		,P_CRD_DISC_PER        =>M_CV.CRD_DISC_PER
		,P_QT_PRM_NO	       =>M_CV.QT_PRM_NO
		,P_QT_PRM_SER	       =>M_CV.QT_PRM_SER
		,P_QT_PRM_RCRD_NO      =>M_CV.QT_PRM_RCRD_NO
		,P_ASS_AMT	       =>M_CV.ASS_AMT
		,P_PYMNT_AC	       =>M_CV.PYMNT_AC
		,P_AC_CODE	       =>M_CV.AC_CODE
		,P_AC_DTL_TYP	       =>M_CV.AC_DTL_TYP
		,P_AC_CODE_DTL	       =>M_CV.AC_CODE_DTL
		,P_AC_AMT	       =>M_CV.AC_AMT
		,P_OTHR_AMT	       =>M_CV.OTHR_AMT
		,P_CLC_TAX_FREE_QTY_FLG=>M_CV.CLC_TAX_FREE_QTY_FLG
		,P_CR_CARD_GROUP_NO    =>M_CV.CR_CARD_GROUP_NO
		,P_DOC_SER_EXTRNL      =>M_CV.DOC_SER_EXTRNL
		,P_EXTERNAL_POST       =>M_CV.EXTERNAL_POST
		,P_CC_CODE	       =>M_CV.CC_CODE
		,P_PJ_NO	       =>M_CV.PJ_NO
		,P_ACTV_NO	       =>M_CV.ACTV_NO
		,P_C_TAX_CODE	       =>V_C_TAX_CODE
		,P_REF_NO	       =>M_CV.REF_NO
		,P_DOC_MCHN_SQ	       =>G_DOC_MCHN_SQ
		,P_SRVR_NO	       =>G_SRVR_NO
		,P_LNG_NO	       =>NVL(M_CV.LNG_NO,1)
		,P_SAVE_TYP	       =>M_CV.SAVE_TYP
		 )  ;

    EXCEPTION WHEN OTHERS THEN
      ROLLBACK;
      RAISE_APPLICATION_ERROR(-20010,'Err when insert IAS_POS_BILL_MST BILL_NO= '||G_BILL_NO ||' '||CHR(10)||SQLERRM);
    END; --(2)
     BEGIN
	SELECT NVL(MAX(RCRD_NO), 0)
	  INTO V_RCRD_NO
	  FROM IAS_POS_BILL_DTL
	 WHERE BILL_NO = G_BILL_NO;
     EXCEPTION WHEN OTHERS THEN
	V_RCRD_NO:=0;
     END;
    -------------------------------------------------------------------------------------------------------------------------------
      FOR D_CV IN
			(SELECT      EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BILL_NO	       ') AS  BILL_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/I_CODE 	       ') AS  I_CODE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/I_QTY		       ') AS  I_QTY
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/I_PRICE	       ') AS  I_PRICE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DIS_PER	       ') AS  DIS_PER
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DIS_AMT	       ') AS  DIS_AMT
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DIS_AMT_MST	       ') AS  DIS_AMT_MST
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DIS_AMT_DTL	       ') AS  DIS_AMT_DTL
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/ITM_UNT	       ') AS  ITM_UNT
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/P_SIZE 	       ') AS  P_SIZE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/P_QTY		       ') AS  P_QTY
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/VAT_PER	       ') AS  VAT_PER
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/VAT_AMT	       ') AS  VAT_AMT
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BATCH_NO	       ') AS  BATCH_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/EXPIRE_DATE	       ') AS  EXPIRE_DATE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BARCODE	       ') AS  BARCODE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/W_CODE 	       ') AS  W_CODE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/SERVICE_ITEM	       ') AS  SERVICE_ITEM
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FREE_QTY	       ') AS  FREE_QTY
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/RCRD_NO	       ') AS  RCRD_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/I_PRICE_VAT	       ') AS  I_PRICE_VAT
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/QT_PRM_RCRD_NO        ') AS  QT_PRM_RCRD_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/QT_PRM_SER	       ') AS  QT_PRM_SER
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/QT_PRM_NO	       ') AS  QT_PRM_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DOC_D_SEQ	       ') AS  DOC_D_SEQ
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/PRM_GRP_NO	       ') AS  PRM_GRP_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/QR_CODE	       ') AS  QR_CODE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DIS_AMT_DTL_HL_PRM    ') AS  DIS_AMT_DTL_HL_PRM
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/QT_I_QTY	       ') AS  QT_I_QTY
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DIS_AMT_DTL_VAT       ') AS  DIS_AMT_DTL_VAT
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DIS_AFTR_VAT_MST      ') AS  DIS_AFTR_VAT_MST
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DIS_AMT_MST_VAT       ') AS  DIS_AMT_MST_VAT
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/VAT_AMT_DIS_DTL_VAT   ') AS VAT_AMT_DIS_DTL_VAT
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/VAT_AMT_AFTR_DIS      ') AS VAT_AMT_AFTR_DIS
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/VAT_AMT_BFR_DIS       ') AS VAT_AMT_BFR_DIS
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/VAT_AMT_DIS_MST_VAT   ') AS VAT_AMT_DIS_MST_VAT
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FIELD_DTL1	       ') AS  FIELD_DTL1
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FIELD_DTL2	       ') AS  FIELD_DTL2
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FIELD_DTL3	       ') AS  FIELD_DTL3
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FIELD_DTL4	       ') AS  FIELD_DTL4
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CMP_NO 	       ') AS  CMP_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BRN_NO 	       ') AS  BRN_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BRN_YEAR	       ') AS  BRN_YEAR
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BRN_USR	       ') AS  BRN_USR
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/OTHR_AMT	       ') AS  OTHR_AMT
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/EMP_NO 	       ') AS  EMP_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/SERIALNO	       ') AS  SERIALNO
			FROM TABLE (XMLSEQUENCE (EXTRACT (V_XML_TYPE, '/IAS_POS_BILL/IAS_POS_BILL_DTL'))) XMLMSTDMY)
      LOOP --(1)
	    --------------------------------------------------------------------------------
	    -------- TO INSERT IAS_POS_BILL_DTL
  BEGIN 		  --(2)
  IF NVL(M_CV.SAVE_TYP,0)>0 OR D_CV.RCRD_NO IS NULL THEN
    V_RCRD_NO := V_RCRD_NO + 1;
  ELSE
    V_RCRD_NO :=D_CV.RCRD_NO;
  END IF;
  IF NVL(M_CV.SAVE_TYP,0) IN (1,3) OR D_CV.DOC_D_SEQ IS NULL THEN
    V_DOC_D_SEQ := POS_BILL_DTL_SEQ.NEXTVAL;
  ELSE
    V_DOC_D_SEQ :=D_CV.DOC_D_SEQ;
  END IF;
INSRT_IAS_POS_BILL_DTL( P_BILL_NO  =>G_BILL_NO
		,P_I_CODE	   =>D_CV.I_CODE
		,P_I_QTY	   =>D_CV.I_QTY
		,P_I_PRICE	   =>D_CV.I_PRICE
		,P_DIS_PER	   =>D_CV.DIS_PER
		,P_DIS_AMT	   =>D_CV.DIS_AMT
		,P_DIS_AMT_MST	   =>D_CV.DIS_AMT_MST
		,P_DIS_AMT_DTL	   =>D_CV.DIS_AMT_DTL
		,P_ITM_UNT	   =>D_CV.ITM_UNT
		,P_P_SIZE	   =>D_CV.P_SIZE
		,P_P_QTY	   =>D_CV.P_QTY
		,P_VAT_PER	   =>D_CV.VAT_PER
		,P_VAT_AMT	   =>D_CV.VAT_AMT
		,P_BATCH_NO	   =>D_CV.BATCH_NO
		,P_EXPIRE_DATE	   =>D_CV.EXPIRE_DATE
		,P_BARCODE	   =>D_CV.BARCODE
		,P_W_CODE	   =>G_WCODE
		,P_SERVICE_ITEM    =>D_CV.SERVICE_ITEM
		,P_FREE_QTY	   =>D_CV.FREE_QTY
		,P_RCRD_NO	   =>V_RCRD_NO
		,P_CMP_NO	   =>M_CV.CMP_NO
		,P_BRN_NO	   =>G_BRN_NO
		,P_BRN_YEAR	   =>M_CV.BRN_YEAR
		,P_BRN_USR	   =>M_CV.BRN_USR
		,P_I_PRICE_VAT	   =>D_CV.I_PRICE_VAT
		,P_FIELD_DTL1	   =>D_CV.FIELD_DTL1
		,P_FIELD_DTL2	   =>D_CV.FIELD_DTL2
		,P_FIELD_DTL3	   =>D_CV.FIELD_DTL3
		,P_FIELD_DTL4	   =>D_CV.FIELD_DTL4
		,P_DIS_AMT_DTL_HL_PRM	=>D_CV.DIS_AMT_DTL_HL_PRM
		,P_QT_I_QTY		=>D_CV.QT_I_QTY
		,P_DIS_AMT_DTL_VAT	=>D_CV.DIS_AMT_DTL_VAT
		,P_DIS_AFTR_VAT_MST	=>D_CV.DIS_AFTR_VAT_MST
		,P_DIS_AMT_MST_VAT	=>D_CV.DIS_AMT_MST_VAT
		,P_VAT_AMT_DIS_DTL_VAT	=>D_CV.VAT_AMT_DIS_DTL_VAT
		,P_VAT_AMT_AFTR_DIS	=>D_CV.VAT_AMT_AFTR_DIS
		,P_VAT_AMT_BFR_DIS	=>D_CV.VAT_AMT_BFR_DIS
		,P_VAT_AMT_DIS_MST_VAT	=>D_CV.VAT_AMT_DIS_MST_VAT
		,P_QT_PRM_RCRD_NO	=>D_CV.QT_PRM_RCRD_NO
		,P_QT_PRM_SER		=>D_CV.QT_PRM_SER
		,P_QT_PRM_NO		=>D_CV.QT_PRM_NO
		,P_DOC_D_SEQ		=>V_DOC_D_SEQ
		,P_PRM_GRP_NO		=>D_CV.PRM_GRP_NO
		,P_QR_CODE		=>D_CV.QR_CODE
		,P_OTHR_AMT		=>D_CV.OTHR_AMT
		,P_EMP_NO		=>D_CV.EMP_NO
		,P_SERIALNO		=>D_CV.SERIALNO);

       EXCEPTION
       WHEN OTHERS THEN
       ROLLBACK;
	  RAISE_APPLICATION_ERROR(-20010,'Err when insert IAS_POS_BILL_MST BILL_NO= '||G_BILL_NO ||' '||CHR(10)||SQLERRM);
	 --RETURN SQLERRM;
       END; --(2)
     END LOOP;
   --#---------------------------------------------------------------------------------------------------------#--
   ----------------------------------------------------------------------------------------------------------
	Begin
	 Select Cur_Code
		Into V_Cur_Code
		 From ex_rate
		  Where stock_cur = 1 ;
	  Exception
	    When No_Data_Found Then
	       Null;
	 End ;
   ----------------------------------------------------------------------------------------------------------
	BEGIN
	    SELECT Nvl(Calc_Vat_Amt_Type,0)  INTO V_Calc_Vat_Amt_Type
	    FROM IAS_PARA_AR ;
	EXCEPTION
	    WHEN NO_DATA_FOUND THEN
	     Null;
	END ;
	BEGIN
	    SELECT SUM(NVL(VAT_AMT,0)*NVL(I_QTY,0)) INTO V_VAT_AMT
	    FROM IAS_POS_BILL_DTL WHERE BILL_NO=G_BILL_NO ;
	EXCEPTION WHEN OTHERS THEN
	     V_VAT_AMT:=0;
	END ;
   ----------------------------------------------------------------------------------------------------------
  If M_CV.CLC_TYP_NO_TAX Is Not Null AND NVL(V_VAT_AMT,0)>0 Then
	   Ys_Tax_Pkg.Clc_Itm_Tax_Aftr_Save (  P_Clc_Typ_No	   => M_CV.CLC_TYP_NO_TAX	   ,
					       P_Doc_Typ	   => 4 			   , -- Doc_Type In  Ias_Sys.Ias_Docjv_Type_Systems
					       P_Doc_No 	   => G_BILL_NO 		   ,
					       P_Doc_Ser	   => G_BILL_SRL		   ,
					       P_Bill_Doc_Typ	   => M_CV.BILL_TYPE		   ,
					       P_Doc_Jv_Typ	   => M_CV.Si_Type		   ,
					       P_Doc_Date	   => M_CV.Bill_Date		   ,
					       P_A_Cy		   => M_CV.A_CY 		   ,
					       P_Ac_Rate	   => G_Cur_Rate		   ,
					       P_Stk_Rate	   => Ias_Gen_Pkg.Get_Cur_rate(p_acy=>V_Cur_Code),
					       P_Calc_Vat_Amt_Type => V_Calc_Vat_Amt_Type	   ,
					       P_Clc_Usd_Itm	   => 0 			   ,
					       P_Clc_Rtrn_Doc	   => 0 			   ,
					       P_Bill_No	    => NULL			   ,
					       P_Tbl_Mvmnt_Nm	   => 'POS_TAX_ITM_MOVMNT'	 ,
					       P_Tbl_Mst_Nm	   => 'Ias_Pos_Bill_Mst'	 ,
					       P_Tbl_Dtl_Nm	   => 'Ias_Pos_Bill_Dtl'	 ,
					       P_Fld_Doc_Ser	   => 'M.BILL_SRL'		 ,
					       P_Fld_Tax_A_Code    => 'TD.AC_CODE_AR'		 ,
					       P_Fld_W_Code	   => 'D.W_CODE'		 ,
					       P_Fld_I_Price	   => 'D.I_PRICE'		 ,
					       P_Fld_Disc_Amt	   => 'NVL(D.DIS_AMT,0)'	 ,
					       P_Fld_Stk_Cost	   => 0 			   ,
					       P_BRN_NO 	   =>G_BRN_NO			   ,
					       P_Fld_Doc_Seq	   => 'D.RCRD_NO'		 );
  End If;
   --#---------------------------------------------------------------------------------------------------------#--
   --# INSERT INSRT_OTHR_CHRG_MVMNT
    V_Msg_Txt :=POS_OTHR_CHRG_PKG.INSRT_OTHR_CHRG_MVMNT ( P_DOC_TYP	=>4,
															    P_BILL_NO	  =>G_BILL_NO,
															    P_BILL_SRL	  =>G_BILL_SRL,
															    P_XML_INPT	  =>P_XML,
															    P_LNG_NO	  =>G_LNG_NO);
    IF V_MSG_TXT IS NOT NULL THEN
	RAISE_APPLICATION_ERROR(-20010,'Err when insert INSRT_OTHR_CHRG_MVMNT BILL_NO= '||G_BILL_NO ||' '||CHR(10)||V_Msg_Txt);
    END IF;
  ----------------------------------------------------------------------------------------------------------
  --##INSERT INT POSINT_CLC_TRNS
  If V_Use_Pos_Point_Sys=1 And M_CV.cust_code Is Not Null And M_CV.point_typ_no Is Not Null AND NVL(M_CV.SAVE_TYP,0)<>2 Then
    DECLARE
     V_Doc_Amt	       Number;
     V_Point_Amt       Number;
     V_Doc_Rplc_Amt    Number;
     V_Min_Lmt_Calc    Number;
     V_Min_Lmt_Rplc    Number;
     V_Point_Cnt       Number;
     V_Trns_no	       Number;
     V_Server_No       Number;
     --V_Expire_Date	 Date;
    BEGIN
       Pos_Point_Pkg.Get_Point_Typ_Min_Lmt(P_Point_Typ_No=>M_CV.Point_Typ_No,
					   P_Min_Lmt_Calc=>V_Min_Lmt_Calc,
					   P_Min_Lmt_Rplc=>V_Min_Lmt_Rplc);

       /*V_Expire_Date:=Pos_Point_Pkg.Get_Expire_Date(P_Point_Typ_No => M_CV.Point_Typ_No,
						    P_Cust_Code    => M_CV.Cust_Code,
						    P_Point_Age_Expired_Typ=> V_Point_Age_Expired_Typ,
						    P_Point_Age_Expired_Prd=> V_Point_Age_Expired_Prd);*/
     V_Server_No:=POS_GNR_PKG.GET_SRVR_NO_FNC;
     V_Doc_Amt	:=Pos_Point_Pkg.Get_bill_doc_amt_point_fnc(P_Point_Typ_No =>M_CV.Point_Typ_No,
							   P_Bill_No	  =>G_Bill_No);
     V_Point_Cnt:=Pos_Point_Pkg.Get_Point_Cnt(P_Point_Typ_No=>M_cv.Point_Typ_No,P_Bill_Amt=>V_Doc_Amt);---Nvl(:Ias_Pos_Bill_Mst.POINT_RPLC_AMT);
       --V_Point_Amt:= Pos_Point_Pkg.Get_Point_Rplc_Amt(P_Point_Typ_No => M_CV.Point_Typ_No,P_Point_cnt =>V_Point_Cnt) ;
      If Nvl(V_Point_Cnt,0)>0  And Nvl(V_Point_Cnt,0)>= Nvl(V_Min_Lmt_Calc,0) And Nvl(V_Doc_Amt,0)>0 Then									 --INSRT_POINT_TRNS_PRC;
	Begin
	   Select  Substr(M_CV.Brn_Year,3,2)||V_Server_No||M_CV.Machine_No||1||POS_POINT_SEQ.NEXTVAL
	     into V_Trns_no From Dual;
	Exception When others then
	  RAISE_APPLICATION_ERROR(-20011,'Error When Get trns_no for insert point For bill_no '||G_Bill_No ||' '||CHR(10)||SQLERRM);
	End;
	If V_trns_no Is Null Then
	   Raise_application_error(-20012,'Err can not get trns_no for insert point For bill_no '||G_Bill_no ||' '||Chr(10)||Sqlerrm);
	End If;
	Begin
	   Pos_Point_Pkg.Insrt_Pos_Point_Trns(P_TRNS_NO      =>V_Trns_no,
					      P_TRNS_DATE    =>M_CV.Bill_Date,
					      P_CUST_CODE    => M_CV.Cust_Code,
					      P_MOBILE_NO    =>M_CV.MOBILE_NO,
					      P_POINT_TYP_NO =>M_CV.Point_Typ_No,
					      P_Bill_NO      =>G_Bill_No,
					      P_DOC_AMT      =>V_Doc_Amt,
					      P_POINT_CNT    =>V_Point_Cnt,
					      P_TRNS_TYPE    =>1,
					      P_A_CY	     =>M_CV.A_Cy,
					      P_Ac_Rate      =>G_Cur_Rate,
					      P_machine_no   =>M_CV.machine_no,
					      P_AD_U_ID      =>M_CV.AD_U_ID,
					      P_AD_DATE      =>M_CV.AD_DATE,
					      P_CMP_NO	     =>M_CV.CMP_NO,
					      P_BRN_NO	     =>M_CV.BRN_NO,
					      P_BRN_YEAR     =>M_CV.BRN_YEAR,
					      P_BRN_USR      =>M_CV.BRN_USR,
					      P_Bill_Amt     =>M_CV.Bill_Amt,
					      P_Yr_Br_Usr    =>USER,
					      P_Db_Link      =>NULL,
					      P_Point_Age_Expired_Typ=>V_Point_Age_Expired_Typ,
					      P_Point_Age_Expired_Prd=>V_Point_Age_Expired_Prd );
	Exception when others then
	  ROLLBACK;
	  RAISE_APPLICATION_ERROR(-20012,'Err when insert Pos_Point_Calc_trns Bill_no= '||G_Bill_No ||' '||CHR(10)||SQLERRM);
	END;
      End If;
      IF NVL(M_CV.POINT_RPLC_AMT,0)>0 AND NVL(M_CV.POINT_CALC_TYP_NO,0) =1 And M_cv.Point_typ_no Is Not Null THEN
	Begin
	   Select  Substr(M_CV.Brn_Year,3,2)||V_Server_No||M_CV.Machine_No||1||POS_POINT_SEQ.NEXTVAL
	     into V_Trns_no From Dual;
	Exception When others then
	  RAISE_APPLICATION_ERROR(-20013,'Error When Get trns_no for insert point For bill_no '||G_Bill_No ||' '||CHR(10)||SQLERRM);
	End;
	If V_trns_no Is Null Then
	   Raise_application_error(-20014,'Err can not get trns_no for insert point For bill_no '||G_Bill_no ||' '||Chr(10)||Sqlerrm);
	End If;

      V_Point_Cnt:=-POS_POINT_PKG.GET_POINT_RPLC_CNT(P_POINT_TYP_NO =>M_cv.Point_typ_no,P_AMT_RPLC=>M_CV.POINT_RPLC_AMT*Nvl(G_Cur_Rate,1));
      IF NVL(V_Point_Cnt,0)=0  THEN
	 Raise_application_error(-20015,'Err can not get Point_Cnt from repalce amt bill_no '||G_Bill_no ||' '||Chr(10)||Sqlerrm);
      End If;
      V_Doc_Amt:=-Pos_Point_Pkg.Get_Point_Amt(P_Point_Typ_No=>M_cv.Point_typ_no,P_Point_cnt=>Nvl(V_Point_Cnt,0));
      Begin
	   Pos_Point_Pkg.Insrt_Pos_Point_Trns(P_TRNS_NO      =>V_Trns_no,
					      P_TRNS_DATE    =>M_CV.Bill_Date,
					      P_CUST_CODE    => M_CV.Cust_Code,
					      P_MOBILE_NO    =>M_CV.MOBILE_NO,
					      P_POINT_TYP_NO =>M_CV.Point_Typ_No,
					      P_Bill_NO      =>G_Bill_No,
					      P_DOC_AMT      =>V_Doc_Amt,
					      P_POINT_CNT    =>V_Point_Cnt,
					      P_TRNS_TYPE    =>3,
					      P_A_CY	     =>M_CV.A_Cy,
					      P_Ac_Rate      =>G_Cur_Rate,
					      P_machine_no   =>M_CV.machine_no,
					      P_AD_U_ID      =>M_CV.AD_U_ID,
					      P_AD_DATE      =>M_CV.AD_DATE,
					      P_CMP_NO	     =>M_CV.CMP_NO,
					      P_BRN_NO	     =>M_CV.BRN_NO,
					      P_BRN_YEAR     =>M_CV.BRN_YEAR,
					      P_BRN_USR      =>M_CV.BRN_USR,
					      P_Bill_Amt     =>M_CV.Bill_Amt,
					      P_Yr_Br_Usr    =>USER,
					      P_Db_Link      =>NULL,
					      P_Point_Age_Expired_Typ=>V_Point_Age_Expired_Typ,
					      P_Point_Age_Expired_Prd=>V_Point_Age_Expired_Prd );
	Exception when others then
	  ROLLBACK;
	  RAISE_APPLICATION_ERROR(-20012,'Err when insert Pos_Point_Calc_trns for rplc_amt Bill_no= '||G_Bill_No ||' '||CHR(10)||SQLERRM);
	END;
      END IF;
    END;
  End If;
  --##--------------------------------------------------------------------------------------------------------##--
  --##--------------------------------------------------------------------------------------------------------##--
    IF NVL(M_CV.SAVE_TYP,0)>0 Then
      V_ERR_MSG := PST_INSRT_BILL_PRC;
  ELSE
      V_ERR_MSG:='';
  END IF;

    IF V_ERR_MSG IS NOT NULL THEN
	P_JSON_RSLT := '{"_Result": { "_Doc_No":"' || G_BILL_NO || '","_Doc_Srl":"' || G_BILL_SRL || '","_ErrMsg":"' || REPLACE(V_ERR_MSG,'"','') || '","_ErrNo":-30 } }';
	ROLLBACK;
	RAISE_APPLICATION_ERROR(-20012,'Err when Update bill for Bill_no= '||G_Bill_No ||' '||CHR(10)||V_ERR_MSG||' '||SQLERRM);
	RETURN;
    ELSE
	IF NVL(M_CV.SAVE_TYP,0)=2 THEN
	   P_JSON_RSLT := POS_API_PKG.GET_BILL_DATA_XML(P_BILL_NO => G_BILL_NO, P_LANG_NO => G_LNG_NO);
	   ROLLBACK;
	   RETURN;
	ELSE
	    --##------------------------------------------------------------##--
	    --## SYNC_E_INVC
	    IF NVL(M_CV.SAVE_TYP,0) IN(0,1) AND NVL(IAS_BRN_PKG.IS_BRN_USE_E_INVC(P_BRN_NO => G_BRN_NO),0)<> 0 THEN
	       --##P_OFFLINE_VLDT =1 NO VALIDATION ONLY
		 SYNC_E_INVC_PRC( P_DOC_TYPE	   =>4,
				  P_BILL_TYPE	   =>M_CV.BILL_TYPE,
				  P_BRN_NO	   =>G_BRN_NO,
				  P_Use_Vat	   =>G_Use_Vat,
				  P_SYS_NO	   =>80,
				  P_DOC_SER	   =>G_BILL_SRL,
				  P_C_CODE	   =>M_CV.C_CODE,
				  P_TAX_BILL_TYP   =>G_TAX_BILL_TYP,
				  P_OFFLINE_VLDT   =>1,
				  P_DO_COMMIT	   =>0,
				  P_Tbl_Mst_Nm	   =>'IAS_POS_BILL_MST',
				  P_Fld_Doc_Ser    =>'BILL_SRL',
				  P_SAVE_TYP	   =>M_CV.SAVE_TYP,
				  P_COMMIT_FLG	   =>1,--G_COMMIT_FLG,
				  P_WEB_SRVC_UUID  =>G_DOC_UUID,
				  P_WRNNG_TXT	   =>V_WRNNG_TXT,
				  P_Msg_Txt	   =>V_Msg_Txt,
				  P_ERR_NO	   =>V_ERR_NO,
				  P_Pkg_NM	   =>V_Pkg_NM);
		    If	V_MSG_TXT Is Not Null Then--AND V_OFFLINE_VLDT=1 Then
			P_JSON_RSLT := '{"_Result": { "_Doc_No":"' || G_BILL_NO || '","_Doc_Srl":"' || G_BILL_SRL || '","_ErrMsg":"' || REPLACE(V_Msg_Txt,'"','') || '","_ErrNo":-31 } }';
			ROLLBACK;
			RAISE_APPLICATION_ERROR(-20031,'Err when SYNC_E_INVC for Bill_no= '||G_Bill_No ||' '||CHR(10)||V_Msg_Txt||' '||SQLERRM);
			RETURN;
		    ELSE
			COMMIT;
		    End If;
		 --##P_OFFLINE_VLDT =0 SYNC BILL
		 SYNC_E_INVC_PRC( P_DOC_TYPE	   =>4,
				  P_BILL_TYPE	   =>M_CV.BILL_TYPE,
				  P_BRN_NO	   =>G_BRN_NO,
				  P_Use_Vat	   =>G_Use_Vat,
				  P_SYS_NO	   =>80,
				  P_DOC_SER	   =>G_BILL_SRL,
				  P_C_CODE	   =>M_CV.C_CODE,
				  P_TAX_BILL_TYP   =>G_TAX_BILL_TYP,
				  P_OFFLINE_VLDT   =>0,
				  P_DO_COMMIT	   =>0,
				  P_Tbl_Mst_Nm	   =>'IAS_POS_BILL_MST',
				  P_Fld_Doc_Ser    =>'BILL_SRL',
				  P_SAVE_TYP	   =>M_CV.SAVE_TYP,
				  P_COMMIT_FLG	   =>1,--G_COMMIT_FLG,
				  P_WEB_SRVC_UUID  =>G_DOC_UUID,
				  P_WRNNG_TXT	   =>V_WRNNG_TXT,
				  P_Msg_Txt	   =>V_Msg_Txt,
				  P_ERR_NO	   =>V_ERR_NO,
				  P_Pkg_NM	   =>V_Pkg_NM);
		    If	V_MSG_TXT Is Not Null Then--AND V_OFFLINE_VLDT=1 Then
			NULL;
		    End If;
	    END IF;
	    --##------------------------------------------------------------##--
	    --##NVL(M_CV.SAVE_TYP,0) IN(0,1) COMMIT IN SAVE_TYP=0 OFFLINE SAVE	1 ONLINE SAVE
	  If V_MSG_TXT Is Null Then
	      COMMIT;
	  End If;
	  --V_JSON_RSLT := '{"_Result": { "_Doc_No":"' || G_BILL_NO || '","_Doc_Srl":"' || G_BILL_SRL || '","_ErrMsg":"SUCCESSFUL","_ErrNo":0 } }';
	  V_JSON_RSLT := '{"_Result": { "_Doc_No":"' || G_BILL_NO || '","_Doc_Srl":"' || G_BILL_SRL || '","_ErrMsg":"SUCCESSFUL","_ErrNo":0,"_DOC_UUID":"@DOC_UUID","_WRNNG_TXT":"@WRNNG_TXT" } }';
	END IF;
    END IF;
 --##--------------------------------------------------------------------------------------------------------##--
     END LOOP; --(1)
	V_JSON_RSLT:=REPLACE(V_JSON_RSLT,'@DOC_NO', G_BILL_NO);
	V_JSON_RSLT:=REPLACE(V_JSON_RSLT,'@errno',0);
	V_JSON_RSLT:=REPLACE(V_JSON_RSLT,'@errmsg','The operation accomplished successfully.');
	V_JSON_RSLT:=REPLACE(V_JSON_RSLT, '@DOC_UUID', G_DOC_UUID);
	V_WRNNG_TXT:=Replace( V_WRNNG_TXT,'"',' ');
	V_WRNNG_TXT:=Replace( V_WRNNG_TXT,':',' ');
	V_WRNNG_TXT:=Replace( V_WRNNG_TXT,',',' ');
	V_WRNNG_TXT:=Replace( V_WRNNG_TXT,'''',' ');
	V_JSON_RSLT:=REPLACE(V_JSON_RSLT, '@WRNNG_TXT', V_WRNNG_TXT);

	P_JSON_RSLT:=V_JSON_RSLT;
End EXTRCT_POS_BILL_PRC;
 --##-----------------------------------------------------------------------------------------------------##--
PROCEDURE INSRT_IAS_POS_BILL_MST(P_BILL_NO	      IN IAS_POS_BILL_MST.BILL_NO%TYPE
					      ,P_BILL_DATE	    IN IAS_POS_BILL_MST.BILL_DATE%TYPE
					      ,P_A_CY		    IN IAS_POS_BILL_MST.A_CY%TYPE
					      ,P_BILL_TIME	    IN IAS_POS_BILL_MST.BILL_TIME%TYPE
					      ,P_BILL_TYPE	    IN IAS_POS_BILL_MST.BILL_TYPE%TYPE
					      ,P_SI_TYPE	    IN IAS_POS_BILL_MST.SI_TYPE%TYPE		 DEFAULT NULL
					      ,P_C_CODE 	    IN IAS_POS_BILL_MST.C_CODE%TYPE		 DEFAULT NULL
					      ,P_EMP_NO 	    IN IAS_POS_BILL_MST.EMP_NO%TYPE		 DEFAULT NULL
					      ,P_MOBILE_NO	    IN IAS_POS_BILL_MST.MOBILE_NO%TYPE		 DEFAULT NULL
					      ,P_CUST_CODE	    IN IAS_POS_BILL_MST.CUST_CODE%TYPE		 DEFAULT NULL
					      ,P_BILL_RATE	    IN IAS_POS_BILL_MST.BILL_RATE%TYPE
					      ,P_BILL_AMT	    IN IAS_POS_BILL_MST.BILL_AMT%TYPE		 DEFAULT NULL
					      ,P_CLC_TYP_NO_TAX     IN IAS_POS_BILL_MST.CLC_TYP_NO_TAX%TYPE	 DEFAULT NULL
					      ,P_POSTED 	    IN IAS_POS_BILL_MST.POSTED%TYPE		 DEFAULT 0
					      ,P_BILL_NOTE	    IN IAS_POS_BILL_MST.BILL_NOTE%TYPE		 DEFAULT NULL
					      ,P_MACHINE_NO	    IN IAS_POS_BILL_MST.MACHINE_NO%TYPE 	 DEFAULT NULL
					      ,P_SRVR_NO	    IN IAS_POS_BILL_MST.SRVR_NO%TYPE		 DEFAULT NULL
					      ,P_HUNG		    IN IAS_POS_BILL_MST.HUNG%TYPE		 DEFAULT 0
					      ,P_PAYED_AMT	    IN IAS_POS_BILL_MST.PAYED_AMT%TYPE		 DEFAULT NULL
					      ,P_VAT_AMT	    IN IAS_POS_BILL_MST.VAT_AMT%TYPE		 DEFAULT 0
					      ,P_DISC_AMT	    IN IAS_POS_BILL_MST.DISC_AMT%TYPE		 DEFAULT NULL
					      ,P_DISC_AMT_MST	    IN IAS_POS_BILL_MST.DISC_AMT_MST%TYPE	 DEFAULT NULL
					      ,P_DISC_AMT_DTL	    IN IAS_POS_BILL_MST.DISC_AMT_DTL%TYPE	 DEFAULT NULL
					      ,P_DISC_AMT_AFTR_VAT  IN IAS_POS_BILL_MST.DISC_AMT_AFTR_VAT %TYPE  DEFAULT NULL
					      ,P_W_CODE 	    IN IAS_POS_BILL_MST.W_CODE%TYPE		 DEFAULT NULL
					      ,P_PAID_U_ID	    IN IAS_POS_BILL_MST.PAID_U_ID%TYPE		 DEFAULT NULL
					      ,P_PAID_DATE	    IN IAS_POS_BILL_MST.PAID_DATE%TYPE		 DEFAULT NULL
					      ,P_REP_CODE	    IN IAS_POS_BILL_MST.REP_CODE%TYPE		 DEFAULT NULL
					      ,P_CARD_AMT	    IN IAS_POS_BILL_MST.CARD_AMT%TYPE		 DEFAULT NULL
					      ,P_CHEQUE_NO	    IN IAS_POS_BILL_MST.CHEQUE_NO%TYPE		 DEFAULT NULL
					      ,P_CHEQUE_AMT	    IN IAS_POS_BILL_MST.CHEQUE_AMT%TYPE 	 DEFAULT NULL
					      ,P_CHEQUE_DUE_DATE    IN IAS_POS_BILL_MST.CHEQUE_DUE_DATE%TYPE	 DEFAULT NULL
					      ,P_CREDIT_CARD	    IN IAS_POS_BILL_MST.CREDIT_CARD%TYPE	 DEFAULT NULL
					      ,P_CR_CARD_NO	    IN IAS_POS_BILL_MST.CR_CARD_NO%TYPE 	 DEFAULT NULL
					      ,P_CR_CARD_AMT	    IN IAS_POS_BILL_MST.CR_CARD_AMT%TYPE	 DEFAULT NULL
					      ,P_CR_CARD_COMM_PER   IN IAS_POS_BILL_MST.CR_CARD_COMM_PER%TYPE	  DEFAULT NULL
					      ,P_CR_CARD_NO_SCND    IN IAS_POS_BILL_MST.CR_CARD_NO_SCND%TYPE	 DEFAULT NULL
					      ,P_CR_CARD_AMT_SCND   IN IAS_POS_BILL_MST.CR_CARD_AMT_SCND%TYPE	 DEFAULT NULL
					      ,P_CR_CARD_COMM_PER_SCND	 IN IAS_POS_BILL_MST.CR_CARD_COMM_PER_SCND%TYPE     DEFAULT NULL
					      ,P_CR_CARD_NO_THRD    IN IAS_POS_BILL_MST.CR_CARD_NO_THRD%TYPE	 DEFAULT NULL
					      ,P_CR_CARD_AMT_THRD   IN IAS_POS_BILL_MST.CR_CARD_AMT_THRD%TYPE	 DEFAULT NULL
					      ,P_CR_CARD_COMM_PER_THRD IN IAS_POS_BILL_MST.CR_CARD_COMM_PER_THRD%TYPE	  DEFAULT NULL
					      ,P_CR_VALUE_DATE	    IN IAS_POS_BILL_MST.CR_VALUE_DATE%TYPE	 DEFAULT NULL
					      ,P_CR_VALUE_DATE_SCND IN IAS_POS_BILL_MST.CR_VALUE_DATE_SCND%TYPE  DEFAULT NULL
					      ,P_CR_VALUE_DATE_THRD IN IAS_POS_BILL_MST.CR_VALUE_DATE_THRD%TYPE  DEFAULT NULL
					      ,P_CR_CARD_CST_NO      IN IAS_POS_BILL_MST.CR_CARD_CST_NO%TYPE  DEFAULT NULL
					      ,P_CR_CARD_CST_NO_SCND IN IAS_POS_BILL_MST.CR_CARD_CST_NO_SCND%TYPE  DEFAULT NULL
					      ,P_CR_CARD_CST_NO_THRD IN IAS_POS_BILL_MST.CR_CARD_CST_NO_THRD%TYPE  DEFAULT NULL
					      ,P_CASH_NO	    IN IAS_POS_BILL_MST.CASH_NO%TYPE		 DEFAULT NULL
					      ,P_FIELD1 	    IN IAS_POS_BILL_MST.FIELD1%TYPE		 DEFAULT NULL
					      ,P_FIELD2 	    IN IAS_POS_BILL_MST.FIELD2%TYPE		 DEFAULT NULL
					      ,P_FIELD3 	    IN IAS_POS_BILL_MST.FIELD3%TYPE		 DEFAULT NULL
					      ,P_FIELD4 	    IN IAS_POS_BILL_MST.FIELD4%TYPE		 DEFAULT NULL
					      ,P_FIELD5 	    IN IAS_POS_BILL_MST.FIELD5%TYPE		 DEFAULT NULL
					      ,P_PAID_BILL	    IN IAS_POS_BILL_MST.PAID_BILL%TYPE		 DEFAULT NULL
					      ,P_AD_U_ID	    IN IAS_POS_BILL_MST.AD_U_ID%TYPE
					      ,P_AD_DATE	    IN IAS_POS_BILL_MST.AD_DATE%TYPE
					      ,P_UP_U_ID	    IN IAS_POS_BILL_MST.UP_U_ID%TYPE		 DEFAULT NULL
					      ,P_UP_DATE	    IN IAS_POS_BILL_MST.UP_DATE%TYPE		 DEFAULT NULL
					      ,P_UP_CNT 	    IN IAS_POS_BILL_MST.UP_CNT%TYPE		 DEFAULT NULL
					      ,P_PR_REP 	    IN IAS_POS_BILL_MST.PR_REP%TYPE		 DEFAULT NULL
					      ,P_CMP_NO 	    IN IAS_POS_BILL_MST.CMP_NO%TYPE		 DEFAULT NULL
					      ,P_BRN_NO 	    IN IAS_POS_BILL_MST.BRN_NO%TYPE
					      ,P_BRN_YEAR	    IN IAS_POS_BILL_MST.BRN_YEAR%TYPE		 DEFAULT NULL
					      ,P_BRN_USR	    IN IAS_POS_BILL_MST.BRN_USR%TYPE		 DEFAULT NULL
					      ,P_POINT_TYP_NO	    IN IAS_POS_BILL_MST.POINT_TYP_NO%TYPE	 DEFAULT NULL
					      ,P_POINT_CALC_TYP_NO  IN IAS_POS_BILL_MST.POINT_CALC_TYP_NO%TYPE	 DEFAULT NULL
					      ,P_POINT_RPLC_AMT     IN IAS_POS_BILL_MST.POINT_RPLC_AMT%TYPE	 DEFAULT NULL
					      ,P_AD_TRMNL_NM	    IN IAS_POS_BILL_MST.AD_TRMNL_NM%TYPE	 DEFAULT NULL
					      ,P_UP_TRMNL_NM	    IN IAS_POS_BILL_MST.UP_TRMNL_NM%TYPE	 DEFAULT NULL
					      ,P_CRD_NO 	    IN IAS_POS_BILL_MST.CRD_NO%TYPE	    DEFAULT NULL
					      ,P_CRD_DISC_PER	    IN IAS_POS_BILL_MST.CRD_DISC_PER%TYPE	  DEFAULT NULL
					      ,P_QT_PRM_NO	    IN IAS_POS_BILL_MST.QT_PRM_NO%TYPE	       DEFAULT NULL
					      ,P_QT_PRM_SER	    IN IAS_POS_BILL_MST.QT_PRM_SER%TYPE 	DEFAULT NULL
					      ,P_QT_PRM_RCRD_NO     IN IAS_POS_BILL_MST.QT_PRM_RCRD_NO%TYPE	    DEFAULT NULL
					      ,P_ASS_AMT	    IN IAS_POS_BILL_MST.ASS_AMT%TYPE	     DEFAULT NULL
					      ,P_PYMNT_AC	    IN IAS_POS_BILL_MST.PYMNT_AC%TYPE	      DEFAULT NULL
					      ,P_AC_CODE	    IN IAS_POS_BILL_MST.AC_CODE%TYPE	     DEFAULT NULL
					      ,P_AC_DTL_TYP	    IN IAS_POS_BILL_MST.AC_DTL_TYP%TYPE 	DEFAULT NULL
					      ,P_AC_CODE_DTL	    IN IAS_POS_BILL_MST.AC_CODE_DTL%TYPE	 DEFAULT NULL
					      ,P_AC_AMT 	    IN IAS_POS_BILL_MST.AC_AMT%TYPE	    DEFAULT NULL
					      ,P_OTHR_AMT	    IN IAS_POS_BILL_MST.OTHR_AMT%TYPE	      DEFAULT NULL
					      ,P_CLC_TAX_FREE_QTY_FLG IN IAS_POS_BILL_MST.CLC_TAX_FREE_QTY_FLG%TYPE   DEFAULT NULL
					      ,P_CR_CARD_GROUP_NO     IN IAS_POS_BILL_MST.CR_CARD_GROUP_NO%TYPE       DEFAULT NULL
					      ,P_CC_CODE	      IN IAS_POS_BILL_MST.CC_CODE%TYPE	     DEFAULT NULL
					      ,P_PJ_NO		      IN IAS_POS_BILL_MST.PJ_NO%TYPE	     DEFAULT NULL
					      ,P_ACTV_NO	      IN IAS_POS_BILL_MST.ACTV_NO%TYPE	     DEFAULT NULL
					      ,P_DOC_SER_EXTRNL       IN IAS_POS_BILL_MST.DOC_SER_EXTRNL%TYPE	      DEFAULT NULL
					      ,P_REF_NO 	      IN IAS_POS_BILL_MST.REF_NO%TYPE	      DEFAULT NULL
					      ,P_DOC_MCHN_SQ	      IN IAS_POS_BILL_MST.DOC_MCHN_SQ%TYPE  DEFAULT NULL
					      ,P_EXTERNAL_POST	      IN IAS_POS_BILL_MST.DOC_MCHN_SQ%TYPE  DEFAULT NULL
					      ,P_C_TAX_CODE	      IN IAS_POS_BILL_MST.C_TAX_CODE%TYPE  DEFAULT NULL
					      ,P_LNG_NO 	      IN NUMBER DEFAULT 1
					      ,P_CLC_TAX_EXTRNAL_FLG  IN NUMBER  DEFAULT 0  --0 CALC TAX EXTRNAL 1 CALC TAX IN SAVE
					      ,P_SAVE_TYP	      IN NUMBER  DEFAULT 0  --## 0 INSERT OFFLINE BILL 1 INSERT ONLINE BILL
     )	IS
  V_Cnt 	 NUMBER := 0 ;
  V_A_CY	 VARCHAR(200);
  V_CREDIT_CARD  NUMBER := 0 ;
  V_Usd_Dsc_Crd_Only_Once Number:=0;
  V_ERR_MSG	 VARCHAR2 (1000);
  V_CASH_NO	 IAS_POS_BILL_MST.CASH_NO%TYPE;
  V_POS_PYMNT_UNPAID_BILLS  NUMBER;
  V_PAID_BILL	 NUMBER;
  V_PAID_U_ID	 NUMBER;
  V_Cc_Code	 Ias_Pos_Machine.Cc_Code%Type ;
  V_Pj_No	 Ias_Projects.Pj_No%Type      ;
  V_Actv_No	 Ias_Actvty.Actv_No%Type      ;
  V_SHFT_SRL	 NUMBER;
BEGIN

   G_MACHINE_NO :=P_MACHINE_NO;
 /* LOAD PARAMETERS */
    V_ERR_MSG := LOAD_PRMTRS;
    IF V_ERR_MSG IS NOT NULL
    THEN
	RAISE_APPLICATION_ERROR(-20002,' Err when load parameter , '||V_ERR_MSG ||' '||SQLERRM);
    END IF;

    IF P_SAVE_TYP>0 AND P_W_CODE IS NULL THEN
       G_WCODE:=G_WCODE_DFLT;
    ELSE
       G_WCODE:=P_W_CODE;
    END IF;

    IF P_A_CY IS NULL THEN
       RAISE_APPLICATION_ERROR(-20002,' A_CY Is Null , '||SQLERRM);
    ELSIF P_W_CODE IS NULL AND P_SAVE_TYP=0 THEN
       RAISE_APPLICATION_ERROR(-20005,' W_CODE Is Null , '||SQLERRM);
    ELSIF P_MACHINE_NO IS NULL THEN
       RAISE_APPLICATION_ERROR(-20005,'  MACHINE_NO Is Null , '||SQLERRM);
    ELSIF P_SRVR_NO IS NULL AND NVL(P_SAVE_TYP,0)>0 THEN
       RAISE_APPLICATION_ERROR(-20005,'  P_SRVR_NO Is Null , '||SQLERRM);
    ELSIF P_AD_U_ID IS NULL THEN
       RAISE_APPLICATION_ERROR(-20005,'  AD USER ID Is Null , '||SQLERRM);
    ELSIF P_BILL_TYPE NOT IN (1,2,3,4,8) THEN
       RAISE_APPLICATION_ERROR(-20006,'  BILL_TYPE  VALUE IS WRONG, '||P_BILL_TYPE||SQLERRM);
    ELSIF P_BILL_TYPE =2 AND P_C_CODE IS NULL THEN
	RAISE_APPLICATION_ERROR(-20007,' YOU MUST ENTER CUSTOMER CODE ');
    ELSIF P_BILL_TYPE =4 AND NVL(P_CR_CARD_AMT,0)+NVL(P_CR_CARD_AMT_SCND,0)+NVL(P_CR_CARD_AMT_THRD,0)=0 THEN
	RAISE_APPLICATION_ERROR(-20008,'  BILL TYPE IS CREDIT CARD BUT THERE ARE NO CREDIT CARD AMT., '||SQLERRM);
    ELSIF P_BILL_TYPE =4 AND ROUND((NVL(P_BILL_AMT,0)+NVL(P_VAT_AMT,0) -NVL(P_DISC_AMT,0)-NVL(P_POINT_RPLC_AMT,0)),1)  <> ROUND(NVL(P_CR_CARD_AMT,0)+NVL(P_CR_CARD_AMT_SCND,0)+NVL(P_CR_CARD_AMT_THRD,0),1) THEN
	RAISE_APPLICATION_ERROR(-20009,'  BILL TYPE IS CREDIT CARD BUT NET BILL AMT. NOT EQUL CREATI CARD AMT., '||SQLERRM);
    END IF;

    IF P_BILL_NO IS  NULL   THEN
	RAISE_APPLICATION_ERROR(-20001,' BILL_NO Is Null , '||SQLERRM);
    ELSIF G_BILL_DATE IS NULL THEN
       RAISE_APPLICATION_ERROR(-20003,' BILL_DATE Is Null , '||SQLERRM);
    ELSIF G_BILL_TIME IS NULL THEN
       RAISE_APPLICATION_ERROR(-20004,' BILL_TIME Is Null , '||SQLERRM);
    ELSIF G_DOC_MCHN_SQ IS NULL THEN
	RAISE_APPLICATION_ERROR(-20005,'  DOC_MCHN_SQ Is Null , '||SQLERRM);
    END IF;

   G_C_Code :=case When nvl(P_C_Code,'0')='0' Then Null Else P_C_Code End;
   G_Cur_Code:=P_A_CY;
   G_Cur_Rate:=P_BILL_RATE;
   G_Ad_U_Id :=P_AD_U_ID;
   G_BILL_TYPE:=P_BILL_TYPE;
   G_DISC_CARD_NO :=P_CRD_NO;
   G_MOBILE_NO	  :=P_MOBILE_NO;
   G_TOT_ITM_PRICE:= P_BILL_AMT;
   G_DISC_AMT_MST := P_DISC_AMT_MST;
   G_DISC_AMT_DTL := P_DISC_AMT_DTL;
   G_DIS_AMT_MD   := P_DISC_AMT;
   IF P_SAVE_TYP>0 THEN
      IF  G_CHCK_AVL_QTY=4 THEN
	Begin
	   Select PAY_AVL_QTY,POS_PYMNT_UNPAID_BILLS
	    INTO G_CHCK_AVL_QTY,V_POS_PYMNT_UNPAID_BILLS
	   FROM  Privilege_fixed
	   Where U_ID=G_Ad_U_Id;
	Exception When Others Then
	   Null;
	End;
     END IF;
   END IF;
   IF P_SAVE_TYP>0 AND NVL(G_USE_PAID_BILLS,0)=1 AND NVL(V_POS_PYMNT_UNPAID_BILLS,0)=0 AND P_BILL_TYPE=1  THEN
	V_PAID_BILL:=0;
   ELSE
       V_PAID_BILL:=1;
   END IF;
   IF NVL(P_PAID_U_ID,0)=0 THEN
     V_PAID_U_ID:=G_Ad_U_Id;
   ELSE
     V_PAID_U_ID:=P_PAID_U_ID;
   END IF;
   V_CASH_NO:=NVL(P_CASH_NO,IAS_CSHBNK_PKG.GET_USR_CSH_NO(P_USR_NO => P_AD_U_ID,P_MCHN_NO =>P_MACHINE_NO));
   IF NVL(V_PAID_BILL,0)=1 AND V_CASH_NO IS NULL AND P_BILL_TYPE=1 THEN
       RAISE_APPLICATION_ERROR(-20005,' CASH NO Is Null FOR CASHER NO= '||P_AD_U_ID ||SQLERRM);
   END IF;
------------------------------------------------------------------------------------------------------------------------------
   IF NVL(P_VAT_AMT,0)>0 AND  P_CLC_TYP_NO_TAX IS NULL THEN
	  RAISE_APPLICATION_ERROR(-20010,'CLC_TYP_NO_TAX NOT FOUND FOR BILL NO '||P_BILL_NO) ;
   END IF;

   Begin
      Select Cc_Code,
	     Pj_No,
	     Actv_No
	Into V_Cc_Code,
	     V_Pj_No,
	     V_Actv_No
	From ias_pos_machine
       Where machine_no = P_MACHINE_NO;
  Exception When Others Then
      Null;
  End;
  If P_CC_CODE is not null then
     V_Cc_Code:=P_CC_CODE;
  End If;
  If P_PJ_NO is not null then
     V_Pj_No:=P_PJ_NO;
  End If;
  If P_ACTV_NO is not null then
     V_Actv_No:=P_ACTV_NO;
  End If;
------------------------------------------------------------------------------------------------------------------------------
      BEGIN
       SELECT 1 INTO V_CNT
	    FROM IAS_POS_BILL_MST
	    WHERE BILL_NO = P_BILL_NO
	    AND  ROWNUM  <= 1 ;
      EXCEPTION
	    WHEN NO_DATA_FOUND THEN
	     V_CNT := 0 ;
      END ;
      IF  NVL(V_CNT,0) > 0 THEN
	     RAISE_APPLICATION_ERROR(-20006,'BILL_No  Is Duplicate ,BILL_NO = '||P_BILL_NO ||'--'||CHR(10)||SQLERRM) ;
      END IF;
  IF P_BILL_TYPE =1 THEN
   --##TO CHECK CURRENCY CODE
   -----------------------------------------------------------------------------------------------------
   BEGIN
    SELECT DISTINCT CUR_CODE INTO V_A_CY
	 From Ex_Rate ,Ias_Cash_In_Hand_Dtl
	  Where Ias_Cash_In_Hand_Dtl.A_Cy = Ex_Rate.Cur_Code
	   And Cur_Code = P_A_CY
	   And Nvl(Inactive,0) = 0
	   And Exists( Select 1 From User_R
			 Where U_Id = P_AD_U_ID
			  And User_R.Cash_No =Ias_Cash_In_Hand_Dtl.Cash_No
			  And Rownum  <=1  ) ;
   EXCEPTION WHEN NO_DATA_FOUND THEN
	RAISE_APPLICATION_ERROR(-20007,'The currency code does not existing..OR not difine curr for user Curr '||V_A_CY||' USER NO '||P_AD_U_ID||' '|| SQLERRM);
   END ;
   IF V_A_CY IS NULL OR V_A_CY <> P_A_CY   THEN
	 RAISE_APPLICATION_ERROR(-20008,'The currency code for bill '||P_A_CY ||' not equl curr from cash no  '||V_A_CY||SQLERRM);
   END IF;
  END IF;
 ---##-----------------------------------------------------------------------------------------------------
   IF P_W_CODE IS NOT NULL     THEN
       BEGIN
	    SELECT 1 INTO V_CNT
	    FROM   Ias_Pos_Machine
	    WHERE  Def_Wcode  =P_W_CODE
	    AND    MACHINE_NO =P_MACHINE_NO
	    AND  ROWNUM  <= 1 ;
	    EXCEPTION
		WHEN NO_DATA_FOUND THEN
		 V_CNT := 0 ;
	    END ;
	    IF NVL(V_CNT,0)=0 THEN
		 RAISE_APPLICATION_ERROR(-20009,'W_CODE  Is Wrong ,W_CODE = '||P_W_CODE ||'--'||CHR(10)||SQLERRM) ;
	    END IF;
     END IF;
--##-------------------------------------------------------------------------------------------------##--
--##START CHECK  CARD AMT
    IF NVL(P_CR_CARD_AMT,0)>0 AND P_CR_CARD_NO IS NULL THEN
       RAISE_APPLICATION_ERROR(-20010,' CARD_NO IS NULL BUT CARD AMT IS NOT NULL CR_CARD_AMT = '||P_CR_CARD_AMT ||'--'||CHR(10)||SQLERRM) ;
    END IF;
    IF P_CR_CARD_NO IS NOT NULL THEN
    IF NVL(P_CR_CARD_AMT,0)=0 THEN
	RAISE_APPLICATION_ERROR(-20010,'VISA AMT IS NULL'||P_CR_CARD_NO ||'--'||CHR(10)||SQLERRM) ;
    END IF;
    Begin
    Select 1 Into V_Cnt
    From Credit_card_types
    Where cr_card_no =P_CR_CARD_NO
    And Machine_No  = P_MACHINE_NO
    And RowNum <= 1 ;
    Exception When Others Then
       RAISE_APPLICATION_ERROR(-20010,'VISA CARD NOT MATCH WITH MACHIME NO OR NOT FOUND CR_CARD_NO'||P_CR_CARD_NO ||'--'||CHR(10)||SQLERRM) ;
    End ;
    End If;

    IF NVL(P_CR_CARD_AMT_SCND,0)>0 AND P_CR_CARD_NO_SCND IS NULL THEN
    RAISE_APPLICATION_ERROR(-20010,' CARD_NO IS NULL BUT CARD AMT IS NOT NULL CR_CARD_AMT_SCND = '||P_CR_CARD_AMT_SCND ||'--'||CHR(10)||SQLERRM) ;
    END IF;
    IF P_CR_CARD_NO_SCND IS NOT NULL THEN
    IF NVL(P_CR_CARD_AMT_SCND,0)=0 THEN
    RAISE_APPLICATION_ERROR(-20010,'VISA AMT IS NULL'||P_CR_CARD_NO_SCND ||'--'||CHR(10)||SQLERRM) ;
    END IF;
    Begin
    Select 1 Into V_Cnt
    From credit_card_types
    Where cr_card_no =P_CR_CARD_NO_SCND
    And Machine_No  = P_MACHINE_NO
    And RowNum <= 1 ;
    Exception When Others Then
    RAISE_APPLICATION_ERROR(-20010,'VISA CARD NOT MATCH WITH MACHIME NO OR NOT FOUND CR_CARD_NO_SCND= '||P_CR_CARD_NO_SCND ||'--'||CHR(10)||SQLERRM) ;
    End ;
    End If;

    IF NVL(P_CR_CARD_AMT_THRD,0)>0 AND P_CR_CARD_NO_THRD IS NULL THEN
    RAISE_APPLICATION_ERROR(-20010,' CARD_NO IS NULL BUT CARD AMT IS NOT NULL CR_CARD_AMT_THRD = '||P_CR_CARD_AMT_THRD ||'--'||CHR(10)||SQLERRM) ;
    END IF;
    IF P_CR_CARD_NO_THRD IS NOT NULL THEN
    IF NVL(P_CR_CARD_AMT_THRD,0)=0 THEN
    RAISE_APPLICATION_ERROR(-20010,'VISA AMT IS NULL'||P_CR_CARD_NO_THRD ||'--'||CHR(10)||SQLERRM) ;
    END IF;
    Begin
    Select 1 Into V_Cnt
    From credit_card_types
    Where cr_card_no =P_CR_CARD_NO_THRD
    And Machine_No  = P_MACHINE_NO
    And RowNum <= 1 ;
    Exception When Others Then
    RAISE_APPLICATION_ERROR(-20010,'VISA CARD NOT MATCH WITH MACHIME NO OR NOT FOUND CR_CARD_NO_THRD'||P_CR_CARD_NO_THRD ||'--'||CHR(10)||SQLERRM) ;
    End ;
    End If;
--##END CHECK  CARD AMT
--##-------------------------------------------------------------------------------------------------##--
    IF NVL(P_CR_CARD_AMT,0)+NVL(P_CR_CARD_AMT_SCND,0)+NVL(P_CR_CARD_AMT_THRD,0)>0 THEN
      V_CREDIT_CARD:=1;
    ELSE
      V_CREDIT_CARD:=0;
    END IF;
    IF G_BILL_SRL IS NULL THEN
      G_BILL_SRL:=To_char(IAS_GEN_PKG.GET_CURDATE,'YYYY')||'01'||Lpad(G_SRVR_NO,3, 0)||Lpad(P_MACHINE_NO, 5, 0)||Nvl(P_DOC_MCHN_SQ,0);
    END IF;
    IF P_C_TAX_CODE IS NULL THEN
	G_TAX_BILL_TYP:=1;
    End If;
--##-----------------------------------------------------------------------------------------------------
   IF P_SAVE_TYP>0 AND NVL(G_DISC_AMT_MST,0)+NVL(G_DISC_AMT_DTL,0) > 0 THEN
       IF CHK_DSC_PRV_FNC IS NOT NULL THEN
	    RAISE_APPLICATION_ERROR(-20011,'Check priv disc '||CHK_DSC_PRV_FNC) ;
       END IF;
   END IF;
 --##-----------------------------------------------------------------------------------------------------
   IF Nvl(G_USE_WRK_SHFT,0)=1 Then
   <<GET_USER_SHFT_SRL>>
	DECLARE
	    L_OPN_SHT_FLG NUMBER(3) := 0;
	BEGIN
		POS_WRK_SHFT_PKG.GET_USR_SHFT_SRL(P_LANG_NO	 => G_LNG_NO,
						  P_USR_NO	 => NVL(P_PAID_U_ID, P_AD_U_ID),
						  P_BRN_NO	 => P_BRN_NO,
						  P_SHFT_SRL	 => V_SHFT_SRL,
						  P_MSG_TXT	 => G_MSG_TXT,
						  P_OPN_SHT_FLG  => L_OPN_SHT_FLG);
		IF G_MSG_TXT IS NOT NULL THEN
		     RAISE_APPLICATION_ERROR(-20012,'GET_USR_SHFT_SRL '||G_MSG_TXT) ;
		END IF;
	END GET_USER_SHFT_SRL;
    END IF;
--##-----------------------------------------------------------------------------------------------------
	 INSERT INTO IAS_POS_BILL_MST
	      (  BILL_NO
		,Bill_Srl
		,DOC_MCHN_SQ
		,BILL_DATE
		,BILL_TIME
		,BILL_TYPE
		,SI_TYPE
		,C_CODE
		,EMP_NO
		,A_CY
		,BILL_RATE
		,BILL_AMT
		,CASH_NO
		,POSTED
		,BILL_NOTE
		,MACHINE_NO
		,HUNG
		,PAYED_AMT
		,CARD_AMT
		,VAT_AMT
		,DISC_AMT
		,DISC_AMT_MST
		,DISC_AMT_DTL
		,W_CODE
		,REP_CODE
		,FIELD1
		,FIELD2
		,FIELD3
		,FIELD4
		,FIELD5
		,PAID_BILL
		,PAID_U_ID
		,PAID_DATE
		,AD_U_ID
		,AD_DATE
		,UP_U_ID
		,UP_DATE
		,UP_CNT
		,PR_REP
		,CMP_NO
		,BRN_NO
		,BRN_YEAR
		,BRN_USR
		,POINT_RPLC_AMT
		,POINT_TYP_NO
		,POINT_CALC_TYP_NO
		,MOBILE_NO
		,CUST_CODE
		,UP_TRMNL_NM
		,AD_TRMNL_NM
		,CLC_TYP_NO_TAX
		,CREDIT_CARD
		,CR_CARD_NO
		,CR_CARD_AMT
		,CR_CARD_COMM_PER
		,CR_CARD_NO_SCND
		,CR_CARD_AMT_SCND
		,CR_CARD_COMM_PER_SCND
		,CR_CARD_NO_THRD
		,CR_CARD_AMT_THRD
		,CR_CARD_COMM_PER_THRD
		,CR_VALUE_DATE
		,CR_VALUE_DATE_SCND
		,CR_VALUE_DATE_THRD
		,CR_CARD_CST_NO
		,CR_CARD_CST_NO_SCND
		,CR_CARD_CST_NO_THRD
		,REF_NO
		,DISC_AMT_AFTR_VAT
		,CRD_NO
		,CRD_DISC_PER
		,QT_PRM_NO
		,QT_PRM_SER
		,QT_PRM_RCRD_NO
		,ASS_AMT
		,PYMNT_AC
		,AC_CODE
		,AC_DTL_TYP
		,AC_CODE_DTL
		,AC_AMT
		,OTHR_AMT
		,CLC_TAX_FREE_QTY_FLG
		,CR_CARD_GROUP_NO
		,DOC_SER_EXTRNL
		,CC_CODE,PJ_NO,ACTV_NO
		,C_TAX_CODE
		,TAX_BILL_TYP
		,SRVR_NO
		,EXTERNAL_POST
		,PRICE_LVL
		,SHFT_SRL
	      )
	    VALUES
	      (  G_BILL_NO
		,G_Bill_Srl
		,G_DOC_MCHN_SQ
		,G_BILL_DATE
		,G_BILL_TIME
		,P_BILL_TYPE
		,P_SI_TYPE
		,P_C_CODE
		,P_EMP_NO
		,P_A_CY
		,P_BILL_RATE
		,P_BILL_AMT
		,P_CASH_NO
		,P_POSTED
		,P_BILL_NOTE
		,P_MACHINE_NO
		,P_HUNG
		,P_PAYED_AMT
		,P_CARD_AMT
		,P_VAT_AMT
		,P_DISC_AMT
		,P_DISC_AMT_MST
		,P_DISC_AMT_DTL
		,P_W_CODE
		,P_REP_CODE
		,P_FIELD1
		,P_FIELD2
		,P_FIELD3
		,P_FIELD4
		,P_FIELD5
		,V_PAID_BILL
		,V_PAID_U_ID
		,P_PAID_DATE
		,P_AD_U_ID
		,P_AD_DATE
		,P_UP_U_ID
		,P_UP_DATE
		,P_UP_CNT
		,P_PR_REP
		,P_CMP_NO
		,P_BRN_NO
		,P_BRN_YEAR
		,P_BRN_USR
		,P_POINT_RPLC_AMT
		,P_POINT_TYP_NO
		,P_POINT_CALC_TYP_NO
		,P_MOBILE_NO
		,P_CUST_CODE
		,P_UP_TRMNL_NM
		,P_AD_TRMNL_NM
		,P_CLC_TYP_NO_TAX
		,V_CREDIT_CARD
		,P_CR_CARD_NO
		,P_CR_CARD_AMT
		,P_CR_CARD_COMM_PER
		,P_CR_CARD_NO_SCND
		,P_CR_CARD_AMT_SCND
		,P_CR_CARD_COMM_PER_SCND
		,P_CR_CARD_NO_THRD
		,P_CR_CARD_AMT_THRD
		,P_CR_CARD_COMM_PER_THRD
		,P_CR_VALUE_DATE
		,P_CR_VALUE_DATE_SCND
		,P_CR_VALUE_DATE_THRD
		,P_CR_CARD_CST_NO
		,P_CR_CARD_CST_NO_SCND
		,P_CR_CARD_CST_NO_THRD
		,P_REF_NO
		,P_DISC_AMT_AFTR_VAT
		,P_CRD_NO
		,P_CRD_DISC_PER
		,P_QT_PRM_NO
		,P_QT_PRM_SER
		,P_QT_PRM_RCRD_NO
		,P_ASS_AMT
		,P_PYMNT_AC
		,P_AC_CODE
		,P_AC_DTL_TYP
		,P_AC_CODE_DTL
		,P_AC_AMT
		,P_OTHR_AMT
		,P_CLC_TAX_FREE_QTY_FLG
		,P_CR_CARD_GROUP_NO
		,P_DOC_SER_EXTRNL
		,V_CC_CODE,V_PJ_NO,V_ACTV_NO
		,P_C_TAX_CODE
		,G_TAX_BILL_TYP
		,G_SRVR_NO
		,P_EXTERNAL_POST
		,G_LVL_PRICE_NO
		,V_SHFT_SRL
		 ) ;
	If P_CRD_NO Is Not Null Then
		    Begin
			Select Used_Only_Once into V_Usd_Dsc_Crd_Only_Once
			 From Ias_Card_Sal
			 where crd_no=P_CRD_NO
		       And CRD_TYPE=1 ;
		    Exception When Others Then
			V_Usd_Dsc_Crd_Only_Once:=0;
		    End;
		    Begin
		      Update Ias_Card_Sal
		       Set Processed =1
			Where Crd_No =P_CRD_NO
			And Nvl(Processed,0)=0 ;
		    Exception When Others Then
			 null;
		    End;
		    If Nvl(CHECK_DB_SRVR_TYP_FNC,0)> 0 And Nvl(V_Usd_Dsc_Crd_Only_Once,0)=1  Then
		      Begin
					    EXECUTE IMMEDIATE 'Update '||User||'.Ias_Card_Sal@ONYX.ONYX.COM
						Set Processed =1
					     Where Nvl(Processed,0)=0  And Crd_No = '||P_CRD_NO ;
		      Exception When Others Then
			  null;
		      End;
		    End If;
       End If;
 EXCEPTION  WHEN OTHERS THEN
	      ROLLBACK;
	      RAISE_APPLICATION_ERROR (-20012,'Error When Insert Into IAS_POS_BILL_MST , '||CHR(10)||SQLERRM);
 END INSRT_IAS_POS_BILL_MST;
--##-----------------------------------------------------------------------------------------------------##--
PROCEDURE INSRT_IAS_POS_BILL_DTL(P_BILL_NO	   IN IAS_POS_BILL_DTL.BILL_NO%TYPE
    ,P_I_CODE	       IN IAS_POS_BILL_DTL.I_CODE%TYPE
    ,P_I_QTY	       IN IAS_POS_BILL_DTL.I_QTY%TYPE
    ,P_ITM_UNT	       IN IAS_POS_BILL_DTL.ITM_UNT%TYPE
    ,P_P_SIZE	       IN IAS_POS_BILL_DTL.P_SIZE%TYPE
    ,P_P_QTY	       IN IAS_POS_BILL_DTL.P_QTY%TYPE			   DEFAULT NULL
    ,P_I_PRICE	       IN IAS_POS_BILL_DTL.I_PRICE%TYPE
    ,P_DIS_PER	       IN IAS_POS_BILL_DTL.DIS_PER%TYPE 		   DEFAULT NULL
    ,P_DIS_AMT	       IN IAS_POS_BILL_DTL.DIS_AMT%TYPE 		   DEFAULT NULL
    ,P_DIS_AMT_MST     IN IAS_POS_BILL_DTL.DIS_AMT_MST%TYPE		   DEFAULT NULL
    ,P_DIS_AMT_DTL     IN IAS_POS_BILL_DTL.DIS_AMT_DTL%TYPE		   DEFAULT NULL
    ,P_VAT_PER	       IN IAS_POS_BILL_DTL.VAT_PER%TYPE 		   DEFAULT NULL
    ,P_VAT_AMT	       IN IAS_POS_BILL_DTL.VAT_AMT%TYPE 		   DEFAULT NULL
    ,P_BATCH_NO        IN IAS_POS_BILL_DTL.BATCH_NO%TYPE		   DEFAULT NULL
    ,P_EXPIRE_DATE     IN IAS_POS_BILL_DTL.EXPIRE_DATE%TYPE		   DEFAULT NULL
    ,P_BARCODE	       IN IAS_POS_BILL_DTL.BARCODE%TYPE 		   DEFAULT NULL
    ,P_W_CODE	       IN IAS_POS_BILL_DTL.W_CODE%TYPE			   DEFAULT NULL
    ,P_SERVICE_ITEM    IN IAS_POS_BILL_DTL.SERVICE_ITEM%TYPE		   DEFAULT NULL
    ,P_FREE_QTY        IN IAS_POS_BILL_DTL.FREE_QTY%TYPE		   DEFAULT NULL
    ,P_RCRD_NO	       IN IAS_POS_BILL_DTL.RCRD_NO%TYPE 		   DEFAULT NULL
    ,P_CMP_NO	       IN IAS_POS_BILL_DTL.CMP_NO%TYPE			   DEFAULT NULL
    ,P_BRN_NO	       IN IAS_POS_BILL_DTL.BRN_NO%TYPE			   DEFAULT NULL
    ,P_BRN_YEAR        IN IAS_POS_BILL_DTL.BRN_YEAR%TYPE		   DEFAULT NULL
    ,P_BRN_USR	       IN IAS_POS_BILL_DTL.BRN_USR%TYPE 		   DEFAULT NULL
    ,P_I_PRICE_VAT     IN IAS_POS_BILL_DTL.I_PRICE_VAT%TYPE		   DEFAULT NULL
    ,P_FIELD_DTL1      IN IAS_POS_BILL_DTL.FIELD_DTL1%TYPE		   DEFAULT NULL
    ,P_FIELD_DTL2      IN IAS_POS_BILL_DTL.FIELD_DTL2%TYPE		   DEFAULT NULL
    ,P_FIELD_DTL3      IN IAS_POS_BILL_DTL.FIELD_DTL3%TYPE		   DEFAULT NULL
    ,P_FIELD_DTL4      IN IAS_POS_BILL_DTL.FIELD_DTL4%TYPE		   DEFAULT NULL
    ,P_DIS_AMT_DTL_HL_PRM   IN IAS_POS_BILL_DTL.DIS_AMT_DTL_HL_PRM%TYPE    DEFAULT NULL
    ,P_QT_I_QTY 	    IN IAS_POS_BILL_DTL.QT_I_QTY%TYPE		   DEFAULT NULL
    ,P_DIS_AMT_DTL_VAT	    IN IAS_POS_BILL_DTL.DIS_AMT_DTL_VAT%TYPE	   DEFAULT NULL
    ,P_DIS_AFTR_VAT_MST     IN IAS_POS_BILL_DTL.DIS_AFTR_VAT_MST%TYPE	   DEFAULT NULL
    ,P_DIS_AMT_MST_VAT	    IN IAS_POS_BILL_DTL.DIS_AMT_MST_VAT%TYPE	   DEFAULT NULL
    ,P_VAT_AMT_DIS_DTL_VAT  IN IAS_POS_BILL_DTL.VAT_AMT_DIS_DTL_VAT%TYPE   DEFAULT NULL
    ,P_VAT_AMT_AFTR_DIS     IN IAS_POS_BILL_DTL.VAT_AMT_AFTR_DIS%TYPE	   DEFAULT NULL
    ,P_VAT_AMT_BFR_DIS	    IN IAS_POS_BILL_DTL.VAT_AMT_BFR_DIS%TYPE	   DEFAULT NULL
    ,P_VAT_AMT_DIS_MST_VAT  IN IAS_POS_BILL_DTL.VAT_AMT_DIS_MST_VAT%TYPE   DEFAULT NULL
    ,P_QT_PRM_RCRD_NO	    IN IAS_POS_BILL_DTL.QT_PRM_RCRD_NO%TYPE	   DEFAULT NULL
    ,P_QT_PRM_SER	    IN IAS_POS_BILL_DTL.QT_PRM_SER%TYPE 	   DEFAULT NULL
    ,P_QT_PRM_NO	    IN IAS_POS_BILL_DTL.QT_PRM_NO%TYPE		   DEFAULT NULL
    ,P_DOC_D_SEQ	    IN IAS_POS_BILL_DTL.DOC_D_SEQ%TYPE		   DEFAULT NULL
    ,P_PRM_GRP_NO	    IN IAS_POS_BILL_DTL.PRM_GRP_NO%TYPE 	   DEFAULT NULL
    ,P_QR_CODE		    IN IAS_POS_BILL_DTL.QR_CODE%TYPE		   DEFAULT NULL
    ,P_OTHR_AMT 	    IN IAS_POS_BILL_DTL.OTHR_AMT%TYPE		   DEFAULT NULL
    ,P_EMP_NO		    IN IAS_POS_BILL_DTL.EMP_NO%TYPE		   DEFAULT NULL
    ,P_SERIALNO 	    IN IAS_POS_BILL_DTL.SERIALNO%TYPE		   DEFAULT NULL
    ,P_LVL_PRICE_NO	    IN NUMBER DEFAULT NULL
    )  IS
V_CNT		  NUMBER :=0;
V_P_QTY 	  NUMBER ;
V_Itm_Srvc	  NUMBER :=0;
V_RCRD_NO	  NUMBER ;
V_DOC_D_SEQ	  NUMBER ;
V_USE_EXP_DATE	  NUMBER ;
V_USE_BATCH_NO	  NUMBER ;
V_USE_QTY_FRCTION NUMBER ;
V_USE_SERIALNO	  NUMBER ;
V_EXPIRE_DATE	  IAS_POS_BILL_DTL.EXPIRE_DATE%TYPE;
V_BATCH_NO	  IAS_POS_BILL_DTL.BATCH_NO%TYPE;
V_I_PRICE	  NUMBER ;
V_I_PRICE_VAT	  NUMBER ;
V_VAT_PRCNT	  NUMBER ;
V_Vat_disc_amt	  NUMBER ;
BEGIN
	IF P_BILL_NO IS  NULL		THEN
	   RAISE_APPLICATION_ERROR(-20020,' BILL_NO Is Null IN Pos_Bill_Dtl, '||SQLERRM);
	ELSIF P_I_CODE IS NULL THEN
	   RAISE_APPLICATION_ERROR(-20021,' I_CODE Is Null , '||SQLERRM);
	ELSIF P_ITM_UNT IS NULL THEN
	  RAISE_APPLICATION_ERROR(-20022,' ITM_UNT Is Null , '||SQLERRM);
	ELSIF P_P_SIZE IS NULL THEN
	  RAISE_APPLICATION_ERROR(-20023,' P_SIZE FOR I_CODE Is Null , '||SQLERRM);
	ELSIF P_W_CODE IS NULL AND G_SAVE_TYP=0 THEN
	  RAISE_APPLICATION_ERROR(-20024,' W_CODE Is Null , '||SQLERRM);
	END IF;
	IF G_WCode IS NULL THEN
	   RAISE_APPLICATION_ERROR(-20025,' W_CODE Is Null , '||SQLERRM);
	END IF;
----##-----------------------------------------------------------------------------------------------------##-----
	 IF P_I_CODE IS NOT NULL     THEN
		BEGIN
		 SELECT 1,SERVICE_ITM,USE_EXP_DATE,USE_BATCH_NO,USE_QTY_FRACTION,USE_SERIALNO
		 INTO V_CNT ,V_Itm_Srvc,V_USE_EXP_DATE,V_USE_BATCH_NO,V_USE_QTY_FRCTION,V_USE_SERIALNO
		FROM   IAS_ITM_MST
		WHERE  I_CODE  =P_I_CODE
		   AND	ROWNUM	<= 1 ;
		EXCEPTION
		    WHEN NO_DATA_FOUND THEN
		V_CNT := 0 ;
		END ;
		IF  NVL(V_CNT,0) = 0 THEN
		RAISE_APPLICATION_ERROR(-20025,'I_Code	Is Wrong ,I_CODE = '||P_I_CODE ||'--'||CHR(10)||SQLERRM) ;
		END IF;
	 END IF;
	 ----##-----------------------------------------------------------------------------------------------------##-----
	 IF P_I_CODE IS NOT NULL  AND P_ITM_UNT IS NOT NULL   THEN
		BEGIN
		SELECT 1 INTO V_CNT
		FROM   IAS_ITM_DTL
		WHERE  I_CODE  =P_I_CODE
		AND    ITM_UNT =P_ITM_UNT
		AND  ROWNUM  <= 1 ;
		EXCEPTION WHEN NO_DATA_FOUND THEN
		    V_CNT := 0 ;
		END ;
		IF  NVL(V_CNT,0) = 0 THEN
		   RAISE_APPLICATION_ERROR(-20026,'Itm_Unt  Is Wrong ,ITM_UNT = '||P_ITM_UNT ||'--'||CHR(10)||SQLERRM) ;
		END IF;

		BEGIN
		SELECT 1 INTO V_CNT
		FROM   IAS_ITM_DTL
		WHERE  I_CODE  =P_I_CODE
		AND    ITM_UNT =P_ITM_UNT
		AND    P_SIZE =P_P_SIZE
		AND    ROWNUM  <= 1 ;
		EXCEPTION WHEN NO_DATA_FOUND THEN
		   V_CNT := 0 ;
		END ;
		IF  NVL(V_CNT,0) = 0 THEN
		   RAISE_APPLICATION_ERROR(-20026,'P_SIZE  Is Wrong I_CODE ITM_UNT P_SIZE = '||P_I_CODE||' '||P_ITM_UNT ||' '||P_P_SIZE||CHR(10)||SQLERRM) ;
		END IF;
	 END IF;
	 ----##-----------------------------------------------------------------------------------------------------##-----
	 IF P_I_QTY IS NOT NULL AND P_FREE_QTY <= 0  THEN
	    IF	P_I_QTY <= 0 THEN
	      RAISE_APPLICATION_ERROR(-20027,'I_QTY IS ZERO ,I_QTY = '||P_I_QTY ||'--'||CHR(10)||SQLERRM) ;
	    END IF;
	 END IF;
	 IF NVL(V_USE_SERIALNO,0)>0 AND P_SERIALNO IS NULL THEN
	     RAISE_APPLICATION_ERROR(-20027,'I_CODE  = '||P_I_CODE ||' USE SERIAL NO BUT SERIAL NO IS NULL'||CHR(10)||SQLERRM) ;
	 END IF;
	----##-----------------------------------------------------------------------------------------------------##-----
	IF P_FREE_QTY IS NOT NULL   THEN
	    IF	P_FREE_QTY < 0 THEN
	      RAISE_APPLICATION_ERROR(-20028,'I_QTY < 0 ,I_QTY = '||P_I_QTY ||'--'||CHR(10)||SQLERRM) ;
	    END IF;
	END IF;
	----##-----------------------------------------------------------------------------------------------------##-----
	IF P_I_PRICE IS NOT NULL   THEN
	    IF	P_I_PRICE < 0 THEN
	       RAISE_APPLICATION_ERROR(-20029,'I_PRICE < 0 ,I_PRICE = '||P_I_PRICE ||'--'||CHR(10)||SQLERRM) ;
	    END IF;
	END IF;

       V_I_Price     := P_I_Price;
       V_I_Price_vat := P_I_PRICE_VAT;
       --V_Vat_Per   := P_Vat_Per;

       IF G_USE_PRICE_INCLUDE_VAT = 1 AND P_I_PRICE_VAT IS NULL THEN
	  RAISE_APPLICATION_ERROR(-20029,'I_PRICE_VAT IS NULL'||'--'||CHR(10)||SQLERRM) ;
       ELSIF G_USE_PRICE_INCLUDE_VAT = 1 THEN
	 IF G_SAVE_TYP>0 THEN
	   V_Vat_disc_amt :=Round((((Nvl(P_Dis_Amt_Dtl,0)+Nvl(P_Dis_Amt_Mst,0)))*Nvl(P_VAT_PER,0))/100,12);
	  --V_VAT_PRCNT := YS_TAX_PKG.GET_ITM_TAX_PRCNT(P_CLC_TYP_NO => G_CLC_TYP_NO_TAX, P_I_CODE => P_I_CODE, P_CLC_USD_ITM => 0);
	  --V_I_PRICE := P_I_PRICE_VAT / ((NVL(P_VAT_PER, 0) / 100) + 1);
	   V_I_PRICE :=Nvl(P_I_PRICE_VAT,0)-(Nvl(P_VAT_AMT,0)+Nvl(V_Vat_disc_amt,0));
	 END IF;
       END IF;
   --##---------------------------------------------------------------------------------------------------------------------------##--

       IF MOD(NVL(P_I_QTY, 0), 1) <> 0 AND NVL(V_USE_QTY_FRCTION, 0) = 0 THEN
	--G_MSG_NO := 677;
	 RAISE_APPLICATION_ERROR(-20029,'This Item Do not To deal Fraction'||P_I_CODE||'--'||CHR(10)||SQLERRM) ;
       END IF;
	/* CHECK EXP DATE */
	V_EXPIRE_DATE:=P_EXPIRE_DATE;
	IF V_USE_EXP_DATE = 1 AND V_EXPIRE_DATE IS NULL THEN
	    --G_MSG_NO := 1009;
	    RAISE_APPLICATION_ERROR(-20029,'Expire date is null for item'||P_I_CODE||'--'||CHR(10)||SQLERRM) ;
	ELSIF V_USE_EXP_DATE = 0 THEN
	   V_EXPIRE_DATE := TO_DATE('01/01/1900', 'DD/MM/YYYY');
	END IF;
	/* CHECK BATCHA */
	V_BATCH_NO:=P_BATCH_NO;
	IF V_USE_BATCH_NO =1 AND V_BATCH_NO IS NULL THEN
	    --G_MSG_NO := 1009;
	    RAISE_APPLICATION_ERROR(-20029,'Batch NO is null for item '||P_I_CODE||'--'||CHR(10)||SQLERRM) ;
	ELSE
	    V_BATCH_NO := '0';
	END IF;
      IF G_SAVE_TYP>0 THEN
	G_Chk_Itm_Price:=1;
      Else
	G_Chk_Itm_Price:=0;
      End If;
      IF P_LVL_PRICE_NO IS NOT NULL THEN
	G_LVL_PRICE_NO:=P_LVL_PRICE_NO;
      END IF;
   IF G_SAVE_TYP>0 THEN
   --##---------------------------------------------------------------------------------------------------------------------------##--
   --## CHK ITM DATA
      Chk_Itm(P_Doc_Type	    => 4
	       ,P_I_Code	      => P_I_Code
	       ,P_Itm_Unt	      => P_Itm_Unt
	       ,P_P_Size	      => P_P_Size
	       ,P_I_Qty 	      => P_I_Qty
	       ,P_Free_Qty	      => P_Free_Qty
	       ,P_I_Price	      => V_I_Price
	       ,P_I_Price_Vat	      => V_I_Price_Vat
	       ,P_Lev_No	      => G_LVL_PRICE_NO
	       ,P_Qt_Prm_Method       => Null
	       ,P_Qut_Prm_Price       => Null
	       ,P_Qt_Prm_Ser	      => P_Qt_Prm_Ser
	       ,P_Dis_Per	      => P_Dis_Per
	       ,P_Dis_Amt_Dtl	      => P_Dis_Amt_Dtl
	       ,P_Dis_Amt_Dtl_Vat     => P_Dis_Amt_Dtl_Vat
	       ,P_Dis_Amt_Mst	      => P_Dis_Amt_Mst
	       ,P_W_Code	      => G_WCode
	       ,P_Expire_Date	      => P_Expire_Date
	       ,P_Batch_No	      => P_Batch_No
	       ,P_Brn_No	      => G_Brn_No
	       ,P_Doc_Ser	      => G_Bill_Srl
	       ,P_Doc_Date	      => G_Bill_Date
	       ,P_C_Code	      => G_C_Code
	       ,P_Cur_Code	      => G_Cur_Code
	       ,P_Ac_Rate	      => G_Cur_Rate
	       ,P_Usr_No	      => G_Ad_U_Id
	       ,P_Clc_Vat_Price_Typ   => Nvl (G_Clc_Vat_Price_Typ, 1)
	       ,P_Bill_Doc_Type       => G_BILL_TYPE
	       ,P_Chk_Avlqty_Flg      => Nvl(G_CHCK_AVL_QTY,0)
	       ,P_Chk_Itm_Price       => G_Chk_Itm_Price --# 0 nocheck 1 check
	       ,P_Use_Vat	      => G_USE_VAT_MCHN
	       ,P_Clc_Typ_No_Tax      => G_Clc_Typ_No_Tax
	       ,P_Lng_No	      => G_Lng_No
	       ,P_Msg_Txt	      => G_Msg_Txt
	       ,P_Pkg_Line	      => V_Err_No
	       ,P_Pkg_Nm	      => G_Pkg_Nm);

	   If G_Msg_Txt Is Not Null Then
	      --Goto RTN_RSLT;
	      RAISE_APPLICATION_ERROR (-20028,'Err When Insert Into IAS_POS_BILL_DTL , '||CHR(10)||G_Msg_Txt);
	   End If;
	End If;
		----##-----------------------------------------------------------------------------------------------------##-----
		V_P_QTY:=P_I_QTY*P_P_SIZE;
		----##-----------------------------------------------------------------------------------------------------##-----
		BEGIN
		INSERT INTO IAS_POS_BILL_DTL ( BILL_NO,BILL_SRL,I_CODE, I_QTY,
		I_PRICE, DIS_PER, DIS_AMT,
		DIS_AMT_MST, DIS_AMT_DTL, ITM_UNT,
		P_SIZE, P_QTY, VAT_PER,
		VAT_AMT, BATCH_NO, EXPIRE_DATE,
		BARCODE, W_CODE, SERVICE_ITEM,
		FREE_QTY, RCRD_NO, CMP_NO,
		BRN_NO, BRN_YEAR, BRN_USR,
		I_PRICE_VAT, FIELD_DTL1,
		FIELD_DTL2, FIELD_DTL3, FIELD_DTL4,
		DIS_AMT_DTL_HL_PRM, QT_I_QTY, DIS_AMT_DTL_VAT,
		DIS_AFTR_VAT_MST, DIS_AMT_MST_VAT, VAT_AMT_DIS_DTL_VAT,
		VAT_AMT_AFTR_DIS, VAT_AMT_BFR_DIS,VAT_AMT_DIS_MST_VAT ,
		QT_PRM_RCRD_NO,QT_PRM_SER,QT_PRM_NO,DOC_D_SEQ,PRM_GRP_NO,QR_CODE,PRICE_LVL
		)
		VALUES
		(P_BILL_NO,G_BILL_SRL,P_I_CODE, P_I_QTY,
		V_I_Price, P_DIS_PER, P_DIS_AMT,
		P_DIS_AMT_MST, P_DIS_AMT_DTL, P_ITM_UNT,
		P_P_SIZE, V_P_QTY, P_VAT_PER,
		P_VAT_AMT, V_BATCH_NO, V_EXPIRE_DATE,
		P_BARCODE, P_W_CODE, V_Itm_Srvc,
		P_FREE_QTY, P_RCRD_NO, P_CMP_NO,
		P_BRN_NO, P_BRN_YEAR, P_BRN_USR,
		V_I_Price_Vat, P_FIELD_DTL1,
		P_FIELD_DTL2, P_FIELD_DTL3, P_FIELD_DTL4,
		P_DIS_AMT_DTL_HL_PRM, P_QT_I_QTY, P_DIS_AMT_DTL_VAT,
		P_DIS_AFTR_VAT_MST, P_DIS_AMT_MST_VAT, P_VAT_AMT_DIS_DTL_VAT,
		P_VAT_AMT_AFTR_DIS, P_VAT_AMT_BFR_DIS, P_VAT_AMT_DIS_MST_VAT,
		P_QT_PRM_RCRD_NO,P_QT_PRM_SER,P_QT_PRM_NO,P_DOC_D_SEQ,P_PRM_GRP_NO,P_QR_CODE,G_LVL_PRICE_NO
		) ;

    /* <<RTN_RSLT>>
      --####################--
      If V_Msg_Txt Is Not Null	Then
	 RAISE_APPLICATION_ERROR (-20028,'Err When Insert Into IAS_POS_BILL_DTL , '||CHR(10)||V_Msg_Txt);
      END IF; */

    EXCEPTION  WHEN OTHERS THEN
      ROLLBACK;
      RAISE_APPLICATION_ERROR (-20030,'Error When Insert Into IAS_POS_BILL_DTL , '||CHR(10)||SQLERRM);
    END;
END INSRT_IAS_POS_BILL_DTL;
--##-----------------------------------------------------------------------------------------------------##--
FUNCTION  GET_I_Code_XML( P_USR_NO  In Number
			 ,P_LNG_NO IN NUMBER DEFAULT 1
			 ,P_I_CODE IN VARCHAR2 DEFAULT Null
			 ,P_I_NAME IN VARCHAR2 DEFAULT Null) RETURN CLOB IS

   V_CNT     NUMBER;
   V_XML_TXT CLOB;
   V_XML_TYP XMLTYPE;
   V_LNG_NO  NUMBER;
   V_SQL     VARCHAR2(4000);
 BEGIN
    IF P_USR_NO IS NOT NULL THEN
	V_SQL:='Select M.I_Code,Decode('||P_LNG_NO||',1,Nvl(I_Name,I_E_Name),Nvl(I_E_Name,I_Name)) I_Name,D.Itm_Unt Unit,M.I_Desc
	From Ias_Itm_Mst M,Ias_Itm_Dtl D
	Where M.I_Code=D.I_Code
	And Nvl(M.Inactive,0)=0 And Nvl(D.No_Sale,0)=0
	And Nvl(M.Use_Batch_No,0)=0
	And Nvl(M.Use_Attch,0)=0
	And M.I_code  Like Nvl('||'''%'||P_I_Code||'%'''||',M.I_code)
	And Decode('||P_LNG_NO||',1,I_Name,I_E_Name)  Like Nvl('||'''%'||P_I_NAME||'%'''||',Decode('||P_LNG_NO||',1,I_Name,I_E_Name))
	And Exists (Select 1 From Privilege_Gc Where U_Id='||P_USR_NO||'
	And G_Code=M.G_Code And Add_Flag=1 And Rownum<=1)
	And RowNum <=30
	Order By Decode('||P_LNG_NO||',1,I_Name,I_E_Name),M.I_Code';
	V_XML_TXT:=DBMS_XMLGEN.GETXML(V_SQL);

	IF V_XML_TXT IS NOT NULL THEN
	  V_XML_TYP:=XMLTYPE.CREATEXML(V_XML_TXT);

	BEGIN
	SELECT COUNT(*) INTO V_CNT FROM TABLE(XMLSEQUENCE(EXTRACT(V_XML_TYP,'/ROWSET/ROW') ))XMLDUMMAY;
	EXCEPTION
	WHEN OTHERS THEN
	NULL;
	END;
	IF NVL(V_CNT,0)>1 THEN
	V_XML_TXT:=REPLACE(V_XML_TXT,'<ROW>','<ITEMS>');
	V_XML_TXT:=REPLACE(V_XML_TXT,'</ROW>','</ITEMS>');
	ELSIF  NVL(V_CNT,0)=1 THEN
	V_XML_TXT:=REPLACE(V_XML_TXT,'<ROW>','<ROWITEMS>');
	V_XML_TXT:=REPLACE(V_XML_TXT,'</ROW>','</ROWITEMS>');
	END IF;
	END IF;
	END IF;
	RETURN V_XML_TXT;
	EXCEPTION
	WHEN OTHERS THEN
	RETURN NULL;
	RAISE_APPLICATION_ERROR(-20201,' Error When ITEMS  Data. '|| CHR(13) || SQLERRM);
END GET_I_Code_XML;
--##-----------------------------------------------------------------------------------------------------##--
PROCEDURE INSRT_IAS_POS_RT_BILL_MST(P_RT_BILL_NO IN IAS_POS_RT_BILL_MST.RT_BILL_NO%TYPE
	    ,P_RT_BILL_DATE	      IN IAS_POS_RT_BILL_MST.RT_BILL_DATE%TYPE
	    ,P_RT_BILL_TIME	      IN IAS_POS_RT_BILL_MST.RT_BILL_TIME%TYPE
	    ,P_RT_BILL_TYPE	      IN IAS_POS_RT_BILL_MST.RT_BILL_TYPE%TYPE
	    ,P_SR_TYPE		      IN IAS_POS_RT_BILL_MST.SR_TYPE%TYPE	      DEFAULT NULL
	    ,P_EMP_NO		      IN IAS_POS_RT_BILL_MST.EMP_NO%TYPE	      DEFAULT NULL
	    ,P_BILL_NO		      IN IAS_POS_RT_BILL_MST.BILL_NO%TYPE	      DEFAULT NULL
	    ,P_C_CODE		      IN IAS_POS_RT_BILL_MST.C_CODE%TYPE	      DEFAULT NULL
	    ,P_A_CY		      IN IAS_POS_RT_BILL_MST.A_CY%TYPE
	    ,P_RT_BILL_RATE	      IN IAS_POS_RT_BILL_MST.RT_BILL_RATE%TYPE
	    ,P_RT_BILL_AMT	      IN IAS_POS_RT_BILL_MST.RT_BILL_AMT%TYPE	      DEFAULT NULL
	    ,P_RT_BILL_NOTE	      IN IAS_POS_RT_BILL_MST.RT_BILL_NOTE%TYPE	      DEFAULT NULL
	    ,P_PAYED_AMT	      IN IAS_POS_RT_BILL_MST.PAYED_AMT%TYPE	      DEFAULT NULL
	    ,P_REPORTED 	      IN IAS_POS_RT_BILL_MST.REPORTED%TYPE	      DEFAULT NULL
	    ,P_VAT_AMT		      IN IAS_POS_RT_BILL_MST.VAT_AMT%TYPE	      DEFAULT NULL
	    ,P_DISC_AMT 	      IN IAS_POS_RT_BILL_MST.DISC_AMT%TYPE	      DEFAULT NULL
	    ,P_DISC_AMT_MST	      IN IAS_POS_RT_BILL_MST.DISC_AMT_MST%TYPE	      DEFAULT NULL
	    ,P_DISC_AMT_DTL	      IN IAS_POS_RT_BILL_MST.DISC_AMT_DTL%TYPE	      DEFAULT NULL
	    ,P_CHEQUE_NO	      IN IAS_POS_RT_BILL_MST.CHEQUE_NO%TYPE	      DEFAULT NULL
	    ,P_CHEQUE_AMT	      IN IAS_POS_RT_BILL_MST.CHEQUE_AMT%TYPE	      DEFAULT NULL
	    ,P_CHEQUE_DUE_DATE	      IN IAS_POS_RT_BILL_MST.CHEQUE_DUE_DATE%TYPE     DEFAULT NULL
	    ,P_CREDIT_CARD	      IN IAS_POS_RT_BILL_MST.CREDIT_CARD%TYPE	      DEFAULT NULL
	    ,P_CR_CARD_NO	      IN IAS_POS_RT_BILL_MST.CR_CARD_NO%TYPE	      DEFAULT NULL
	    ,P_CR_CARD_AMT	      IN IAS_POS_RT_BILL_MST.CR_CARD_AMT%TYPE	      DEFAULT NULL
	    ,P_CR_CARD_COMM_PER       IN IAS_POS_RT_BILL_MST.CR_CARD_COMM_PER%TYPE    DEFAULT NULL
	    ,P_CR_CARD_NO_SCND	      IN IAS_POS_RT_BILL_MST.CR_CARD_NO_SCND%TYPE     DEFAULT NULL
	    ,P_CR_CARD_AMT_SCND       IN IAS_POS_RT_BILL_MST.CR_CARD_AMT_SCND%TYPE    DEFAULT NULL
	    ,P_CR_CARD_COMM_PER_SCND  IN IAS_POS_RT_BILL_MST.CR_CARD_COMM_PER_SCND%TYPE     DEFAULT NULL
	    ,P_CR_CARD_NO_THRD	      IN IAS_POS_RT_BILL_MST.CR_CARD_NO_THRD%TYPE     DEFAULT NULL
	    ,P_CR_CARD_AMT_THRD       IN IAS_POS_RT_BILL_MST.CR_CARD_AMT_THRD%TYPE    DEFAULT NULL
	    ,P_CR_CARD_COMM_PER_THRD  IN IAS_POS_RT_BILL_MST.CR_CARD_COMM_PER_THRD%TYPE     DEFAULT NULL
	    ,P_CR_CARD_CST_NO	      IN IAS_POS_RT_BILL_MST.CR_CARD_CST_NO%TYPE      DEFAULT NULL
	    ,P_CR_CARD_CST_NO_SCND    IN IAS_POS_RT_BILL_MST.CR_CARD_CST_NO_SCND%TYPE  DEFAULT NULL
	    ,P_CR_CARD_CST_NO_THRD IN IAS_POS_RT_BILL_MST.CR_CARD_CST_NO_THRD%TYPE   DEFAULT NULL
	    ,P_CASH_NO		  IN IAS_POS_RT_BILL_MST.CASH_NO%TYPE		     DEFAULT NULL
	    ,P_W_CODE		  IN IAS_POS_RT_BILL_MST.W_CODE%TYPE		     DEFAULT NULL
	    ,P_RT_PRICE_TYPE	  IN IAS_POS_RT_BILL_MST.RT_PRICE_TYPE%TYPE	     DEFAULT NULL
	    ,P_REP_CODE 	  IN IAS_POS_RT_BILL_MST.REP_CODE%TYPE		     DEFAULT NULL
	    ,P_W_CODE_BILL	  IN IAS_POS_RT_BILL_MST.W_CODE_BILL%TYPE	     DEFAULT NULL
	    ,P_REP_CODE_BILL	  IN IAS_POS_RT_BILL_MST.REP_CODE_BILL%TYPE	     DEFAULT NULL
	    ,P_CC_CODE_BILL	  IN IAS_POS_RT_BILL_MST.CC_CODE_BILL%TYPE	     DEFAULT NULL
	    ,P_RETURN_TYPE	  IN IAS_POS_RT_BILL_MST.RETURN_TYPE%TYPE	     DEFAULT NULL
	    ,P_MACHINE_NO	  IN IAS_POS_RT_BILL_MST.MACHINE_NO%TYPE	     DEFAULT NULL
	    ,P_SRVR_NO		  IN IAS_POS_RT_BILL_MST.SRVR_NO%TYPE		     DEFAULT NULL
	    ,P_HUNG		  IN IAS_POS_RT_BILL_MST.HUNG%TYPE		     DEFAULT NULL
	    ,P_PAYED		  IN IAS_POS_RT_BILL_MST.PAYED%TYPE		     DEFAULT NULL
	    ,P_POSTED		  IN IAS_POS_RT_BILL_MST.POSTED%TYPE		     DEFAULT 0
	    ,P_MACHINE_NO_BILL	  IN IAS_POS_RT_BILL_MST.MACHINE_NO_BILL%TYPE	     DEFAULT NULL
	    ,P_PAID_U_ID	  IN IAS_POS_RT_BILL_MST.PAID_U_ID%TYPE 	     DEFAULT NULL
	    ,P_PAID_DATE	  IN IAS_POS_RT_BILL_MST.PAID_DATE%TYPE 	     DEFAULT NULL
	    ,P_PAID_RT_BILL	  IN IAS_POS_RT_BILL_MST.PAID_RT_BILL%TYPE	     DEFAULT NULL
	    ,P_MACHINE_NO_PAID	  IN IAS_POS_RT_BILL_MST.MACHINE_NO_PAID%TYPE	     DEFAULT NULL
	    ,P_RT_BILL_JRNL	  IN IAS_POS_RT_BILL_MST.RT_BILL_JRNL%TYPE	     DEFAULT NULL
	    ,P_CUST_CODE	  IN IAS_POS_RT_BILL_MST.CUST_CODE%TYPE 	     DEFAULT NULL
	    ,P_MOBILE_NO	  IN IAS_POS_RT_BILL_MST.MOBILE_NO%TYPE 	     DEFAULT NULL
	    ,P_POINT_TYP_NO	  IN IAS_POS_RT_BILL_MST.POINT_TYP_NO%TYPE	     DEFAULT NULL
	    ,P_POINT_RPLC_AMT	  IN IAS_POS_RT_BILL_MST.POINT_RPLC_AMT%TYPE		DEFAULT NULL
	    ,P_DISC_AMT_HL_PRM	  IN IAS_POS_RT_BILL_MST.DISC_AMT_HL_PRM%TYPE	     DEFAULT NULL
	    ,P_RT_VAT_PRD_TYP	  IN IAS_POS_RT_BILL_MST.RT_VAT_PRD_TYP%TYPE	     DEFAULT NULL
	    ,P_RTRN_PRV_YR	  IN IAS_POS_RT_BILL_MST.RTRN_PRV_YR%TYPE	     DEFAULT NULL
	    ,P_DISC_AMT_AFTR_VAT  IN IAS_POS_RT_BILL_MST.DISC_AMT_AFTR_VAT%TYPE      DEFAULT NULL
	    ,P_DISC_AMT_MST_VAT   IN IAS_POS_RT_BILL_MST.DISC_AMT_MST_VAT%TYPE	     DEFAULT NULL
	    ,P_VAT_AMT_DISC_MST   IN IAS_POS_RT_BILL_MST.VAT_AMT_DISC_MST%TYPE	     DEFAULT NULL
	    ,P_CLC_TYP_NO_TAX	  IN IAS_POS_RT_BILL_MST.CLC_TYP_NO_TAX%TYPE	     DEFAULT NULL
	    ,P_AD_U_ID		  IN IAS_POS_RT_BILL_MST.AD_U_ID%TYPE
	    ,P_AD_DATE		  IN IAS_POS_RT_BILL_MST.AD_DATE%TYPE
	    ,P_UP_U_ID		  IN IAS_POS_RT_BILL_MST.UP_U_ID%TYPE	  DEFAULT NULL
	    ,P_UP_DATE		  IN IAS_POS_RT_BILL_MST.UP_DATE%TYPE	  DEFAULT NULL
	    ,P_UP_CNT		  IN IAS_POS_RT_BILL_MST.UP_CNT%TYPE	  DEFAULT NULL
	    ,P_PR_REP		  IN IAS_POS_RT_BILL_MST.PR_REP%TYPE	  DEFAULT NULL
	    ,P_CMP_NO		  IN IAS_POS_RT_BILL_MST.CMP_NO%TYPE	  DEFAULT NULL
	    ,P_BRN_NO		  IN IAS_POS_RT_BILL_MST.BRN_NO%TYPE
	    ,P_BRN_YEAR 	  IN IAS_POS_RT_BILL_MST.BRN_YEAR%TYPE
	    ,P_BRN_USR		  IN IAS_POS_RT_BILL_MST.BRN_USR%TYPE	  DEFAULT NULL
	    ,P_PYMNT_AC 	  IN IAS_POS_RT_BILL_MST.PYMNT_AC%TYPE	     DEFAULT NULL
	    ,P_AC_CODE		  IN IAS_POS_RT_BILL_MST.AC_CODE%TYPE	     DEFAULT NULL
	    ,P_AC_DTL_TYP	  IN IAS_POS_RT_BILL_MST.AC_DTL_TYP%TYPE     DEFAULT NULL
	    ,P_AC_CODE_DTL	  IN IAS_POS_RT_BILL_MST.AC_CODE_DTL%TYPE    DEFAULT NULL
	    ,P_AC_AMT		  IN IAS_POS_RT_BILL_MST.AC_AMT%TYPE	     DEFAULT NULL
	    ,P_CLC_TAX_FREE_QTY_FLG IN IAS_POS_RT_BILL_MST.CLC_TAX_FREE_QTY_FLG%TYPE	   DEFAULT NULL
	    ,P_OTHR_AMT 	  IN IAS_POS_RT_BILL_MST.OTHR_AMT%TYPE	      DEFAULT NULL
	    ,P_AD_TRMNL_NM	  IN IAS_POS_RT_BILL_MST.AD_TRMNL_NM%TYPE     DEFAULT NULL
	    ,P_UP_TRMNL_NM	  IN IAS_POS_RT_BILL_MST.UP_TRMNL_NM%TYPE     DEFAULT NULL
	    ,P_DOC_SER_EXTRNL	  IN IAS_POS_RT_BILL_MST.DOC_SER_EXTRNL%TYPE  DEFAULT NULL
	    ,P_CC_CODE		  IN IAS_POS_RT_BILL_MST.CC_CODE%TYPE	      DEFAULT NULL
	    ,P_PJ_NO		  IN IAS_POS_RT_BILL_MST.PJ_NO%TYPE	      DEFAULT NULL
	    ,P_ACTV_NO		  IN IAS_POS_RT_BILL_MST.ACTV_NO%TYPE	      DEFAULT NULL
	    ,P_EXTERNAL_POST	  IN IAS_POS_RT_BILL_MST.DOC_MCHN_SQ%TYPE  DEFAULT NULL
	    ,P_REF_NO		  IN IAS_POS_RT_BILL_MST.REF_NO%TYPE  DEFAULT NULL
	    ,P_DOC_MCHN_SQ	  IN IAS_POS_RT_BILL_MST.DOC_MCHN_SQ%TYPE  DEFAULT NULL
	    ,P_C_TAX_CODE	  IN IAS_POS_RT_BILL_MST.C_TAX_CODE%TYPE  DEFAULT NULL
	    ,P_LNG_NO		  IN NUMBER DEFAULT 1
	    ,P_CLC_TAX_EXTRNAL_FLG  IN NUMBER  DEFAULT 0  --0 CALC TAX EXTRNAL 1 CALC TAX IN SAVE
	    ,P_SAVE_TYP 	  IN NUMBER  DEFAULT 0 --## 0 INSERT OFFLINE RT BILL 1 INSERT ONLINE RTBILL
	     ) Is
 V_Cnt	 NUMBER := 0 ;
 V_A_CY  VARCHAR(200);
 V_PAYED NUMBER := 0 ;
 --V_RT_BILL_SRL  NUMBER;
 V_ERR_MSG	VARCHAR2 (1000);
 V_msg_txt	VARCHAR2 (1000);
 V_RTN_BILL_NO_MNDTRY  NUMBER := 0 ;
 V_Cc_Code    IAS_POS_RT_BILL_MST.Cc_Code%Type ;
 V_Pj_No      IAS_POS_RT_BILL_MST.Pj_No%Type	  ;
 V_Actv_No    IAS_POS_RT_BILL_MST.Actv_No%Type	    ;
 V_SHFT_SRL   NUMBER;
BEGIN

   G_MACHINE_NO :=P_MACHINE_NO;
   G_TOT_ITM_PRICE:= P_RT_BILL_AMT;
   G_DISC_AMT_MST := P_DISC_AMT_MST;
   G_DISC_AMT_DTL := P_DISC_AMT_DTL;
   G_DIS_AMT_MD   := P_DISC_AMT;
 /* LOAD PARAMETERS */
    V_ERR_MSG := LOAD_PRMTRS;
    IF V_ERR_MSG IS NOT NULL
    THEN
	RAISE_APPLICATION_ERROR(-20002,' Err when load parameter , '||V_ERR_MSG ||' '||SQLERRM);
    END IF;

    IF P_SAVE_TYP>0 AND P_W_CODE IS NULL THEN
       G_WCODE:=G_WCODE_DFLT;
    ELSE
       G_WCODE:=P_W_CODE;
    END IF;


    Begin
       Select RTN_BILL_NO
	INTO V_RTN_BILL_NO_MNDTRY
       FROM  Privilege_fixed
       Where U_ID=P_Ad_U_Id;
    Exception When Others Then
       Null;
    End;

   IF NVL(V_RTN_BILL_NO_MNDTRY,0)>0 AND P_BILL_NO IS  NULL THEN
       V_msg_txt := Ias_gen_pkg.Get_msg(P_lng_no => P_Lng_No, P_msg_no => 898) ;
       RAISE_APPLICATION_ERROR(-20001,' BILL_NO Is Null  '||V_msg_txt||' '||SQLERRM);
   END IF;
   IF P_SAVE_TYP>0 AND P_BILL_NO IS NOT NULL THEN
       CHK_BILL_NO_ST_PRC(P_BILL_NO => P_BILL_NO
			  ,P_MACHINE_NO =>P_MACHINE_NO
			  ,P_USR_NO  => P_Ad_U_Id
			  ,P_BRN_USR => P_BRN_USR
			  ,P_LNG_NO  => P_LNG_NO
			  ,P_MSG_NO  => V_msg_NO
			  ,P_Msg_Txt =>V_msg_txt);
   END IF;
     IF P_RT_BILL_NO IS  NULL		THEN
	RAISE_APPLICATION_ERROR(-20001,' RT_BILL_NO Is Null , '||SQLERRM);
     ELSIF P_A_CY IS NULL THEN
	RAISE_APPLICATION_ERROR(-20002,' A_CY Is Null , '||SQLERRM);
     ELSIF P_RT_BILL_DATE IS NULL THEN
	RAISE_APPLICATION_ERROR(-20003,' RT_BILL_DATE Is Null , '||SQLERRM);
     ELSIF P_RT_BILL_TIME IS NULL THEN
	RAISE_APPLICATION_ERROR(-20004,' RT_BILL_TIME Is Null , '||SQLERRM);
     ELSIF P_W_CODE IS NULL THEN
	RAISE_APPLICATION_ERROR(-20005,' W_CODE Is Null , '||SQLERRM);
     ELSIF P_DOC_MCHN_SQ IS NULL THEN
	RAISE_APPLICATION_ERROR(-20005,' DOC_MCHN_SQ Is Null , '||SQLERRM);
     ELSIF P_MACHINE_NO IS NULL THEN
	RAISE_APPLICATION_ERROR(-20005,' MACHINE_NO Is Null , '||SQLERRM);
     ELSIF P_RT_BILL_TYPE NOT IN (1,2,3,4,8) THEN
	RAISE_APPLICATION_ERROR(-20006,'  RT BILL_TYPE	VALUE IS WRONG, '||P_RT_BILL_TYPE ||SQLERRM);
     ELSIF P_RT_BILL_TYPE =2 AND P_C_CODE IS NULL THEN
	RAISE_APPLICATION_ERROR(-20007,' YOU MUST ENTER CUSTOMER CODE ');
    ELSIF P_RT_BILL_TYPE =4 AND NVL(P_CR_CARD_AMT,0)+NVL(P_CR_CARD_AMT_SCND,0)+NVL(P_CR_CARD_AMT_THRD,0)=0 THEN
	RAISE_APPLICATION_ERROR(-20008,'  BILL TYPE IS CREDIT CARD BUT THERE ARE NO CREDIT CARD AMT., '||SQLERRM);
    ELSIF P_RT_BILL_TYPE =4 AND ROUND((NVL(P_RT_BILL_AMT,0)+NVL(P_VAT_AMT,0) -NVL(P_DISC_AMT,0)-NVL(P_POINT_RPLC_AMT,0)),1)  <> ROUND(NVL(P_CR_CARD_AMT,0)+NVL(P_CR_CARD_AMT_SCND,0)+NVL(P_CR_CARD_AMT_THRD,0),1) THEN
	RAISE_APPLICATION_ERROR(-20009,'  BILL TYPE IS CREDIT CARD BUT NET BILL AMT. NOT EQUL CREATI CARD AMT., '||SQLERRM);
    END IF;
     BEGIN
	SELECT 1 INTO V_CNT
	FROM IAS_POS_RT_BILL_MST
	WHERE RT_BILL_NO = P_RT_BILL_NO
	AND  ROWNUM  <= 1 ;
     EXCEPTION	WHEN NO_DATA_FOUND THEN
	  V_CNT := 0 ;
     END ;
     IF  NVL(V_CNT,0) > 0 THEN
	   RAISE_APPLICATION_ERROR(-20006,'RT_BILL_No  Is Duplicate ,RT_BILL_NO = '||P_RT_BILL_NO ||'--'||CHR(10)||SQLERRM) ;
     END IF;
	---##-----------------------------------------------------------------------------------------------------
	IF P_W_CODE IS NOT NULL     THEN
	BEGIN
	SELECT 1 INTO V_CNT
	FROM   Ias_Pos_Machine
	WHERE  Def_Wcode  =P_W_CODE
	AND    MACHINE_NO =P_MACHINE_NO
	AND  ROWNUM  <= 1 ;
	EXCEPTION
	WHEN NO_DATA_FOUND THEN
	V_CNT := 0 ;
	END ;
	IF  NVL(V_CNT,0) = 0 THEN
	RAISE_APPLICATION_ERROR(-20009,'W_CODE	Is Wrong ,W_CODE = '||P_W_CODE ||'--'||CHR(10)||SQLERRM) ;
	END IF;
	END IF;
       --##-----------------------------------------------------------------------------------------------------
      IF NVL(V_USE_PAY_CASH_RT_BILLS,0)=0 THEN
	V_PAYED:=1;
      ELSIF P_RT_BILL_TYPE>1 THEN
	V_PAYED:=1;
      ELSE
	V_PAYED:=0;
      END IF;
--##-----------------------------------------------------------------------------------------------------
Begin
    Select Cc_Code,
	   Pj_No,
	   Actv_No
      Into V_Cc_Code,
	   V_Pj_No,
	   V_Actv_No
      From ias_pos_machine
     Where machine_no =P_MACHINE_NO;
Exception When Others Then
    NULL;
End;
 If P_CC_CODE is not null then
     V_Cc_Code:=P_CC_CODE;
  End If;
  If P_PJ_NO is not null then
     V_Pj_No:=P_PJ_NO;
  End If;
  If P_ACTV_NO is not null then
     V_Actv_No:=P_ACTV_NO;
  End If;
  IF P_C_TAX_CODE IS NULL THEN
       G_TAX_BILL_TYP:=1;
  End If;
--##-----------------------------------------------------------------------------------------------------
      IF G_RT_BILL_SRL IS NULL THEN
	G_RT_BILL_SRL:=to_char(ias_gen_pkg.Get_Curdate,'YYYY')||'02'||Lpad(1,3, 0)||Lpad(P_MACHINE_NO, 5, 0)||Nvl(P_DOC_MCHN_SQ,0);
      END IF;
--##-----------------------------------------------------------------------------------------------------
     IF P_SAVE_TYP>0 AND NVL(G_DISC_AMT_MST,0)+NVL(G_DISC_AMT_DTL,0) > 0 AND P_BILL_NO IS  NULL THEN
       IF CHK_DSC_PRV_FNC IS NOT NULL THEN
	   RAISE_APPLICATION_ERROR(-2001,'Check priv disc '||CHK_DSC_PRV_FNC) ;
       END IF;
    END IF;
--##-----------------------------------------------------------------------------------------------------
    IF Nvl(G_USE_WRK_SHFT,0)=1 Then
   <<GET_USER_SHFT_SRL>>
	DECLARE
	    L_OPN_SHT_FLG NUMBER(3) := 0;
	BEGIN
		POS_WRK_SHFT_PKG.GET_USR_SHFT_SRL(P_LANG_NO	 => G_LNG_NO,
						  P_USR_NO	 => NVL(P_PAID_U_ID, P_AD_U_ID),
						  P_BRN_NO	 => P_BRN_NO,
						  P_SHFT_SRL	 => V_SHFT_SRL,
						  P_MSG_TXT	 => G_MSG_TXT,
						  P_OPN_SHT_FLG  => L_OPN_SHT_FLG);
		IF G_MSG_TXT IS NOT NULL THEN
		     RAISE_APPLICATION_ERROR(-20012,'GET_USR_SHFT_SRL '||G_MSG_TXT) ;
		END IF;
	END GET_USER_SHFT_SRL;
    END IF;
--##-----------------------------------------------------------------------------------------------------
  INSERT INTO IAS_POS_RT_BILL_MST( RT_BILL_NO,RT_BILL_SRL,DOC_MCHN_SQ, RT_BILL_DATE, RT_BILL_TIME,
	   RT_BILL_TYPE, SR_TYPE, BILL_NO,
	   C_CODE, A_CY, RT_BILL_RATE,
	   RT_BILL_AMT, POSTED, RT_BILL_NOTE,
	   MACHINE_NO, HUNG, PAYED_AMT, CASH_NO,
	   REPORTED, VAT_AMT, DISC_AMT,
	   DISC_AMT_MST, DISC_AMT_DTL, CHEQUE_NO,
	   CHEQUE_AMT, CHEQUE_DUE_DATE, CREDIT_CARD,
	   CR_CARD_NO, CR_CARD_AMT,CR_CARD_COMM_PER,
	   CR_CARD_NO_SCND,CR_CARD_AMT_SCND,CR_CARD_COMM_PER_SCND,
	   CR_CARD_NO_THRD,CR_CARD_AMT_THRD,CR_CARD_COMM_PER_THRD,
	   CR_CARD_CST_NO,CR_CARD_CST_NO_SCND,CR_CARD_CST_NO_THRD,
	   W_CODE, RT_PRICE_TYPE, REP_CODE,
	   W_CODE_BILL, REP_CODE_BILL, CC_CODE_BILL,
	   RETURN_TYPE, PAYED, MACHINE_NO_BILL,
	   PAID_U_ID, PAID_DATE, EMP_NO,
	   PAID_RT_BILL, MACHINE_NO_PAID, RT_BILL_JRNL,
	   AD_U_ID, AD_DATE, UP_U_ID,
	   UP_DATE, UP_CNT, PR_REP,
	   CMP_NO, BRN_NO, BRN_YEAR,
	   BRN_USR, CUST_CODE, MOBILE_NO,
	   POINT_TYP_NO,POINT_RPLC_AMT, DISC_AMT_HL_PRM, RT_VAT_PRD_TYP,
	   RTRN_PRV_YR, CLC_TYP_NO_TAX, DISC_AMT_AFTR_VAT,
	   DISC_AMT_MST_VAT, VAT_AMT_DISC_MST,REF_NO,
	   PYMNT_AC,AC_CODE,AC_DTL_TYP,AC_CODE_DTL,
	   CC_CODE,PJ_NO,ACTV_NO,
	   AC_AMT,CLC_TAX_FREE_QTY_FLG,OTHR_AMT,AD_TRMNL_NM,UP_TRMNL_NM,DOC_SER_EXTRNL,SRVR_NO,EXTERNAL_POST,C_TAX_CODE,TAX_BILL_TYP,PRICE_LVL,SHFT_SRL)
      VALUES
	  (P_RT_BILL_NO,G_RT_BILL_SRL,P_DOC_MCHN_SQ,P_RT_BILL_DATE,P_RT_BILL_TIME,
	   P_RT_BILL_TYPE, P_SR_TYPE, P_BILL_NO,
	   P_C_CODE, P_A_CY, P_RT_BILL_RATE,
	   P_RT_BILL_AMT, P_POSTED, P_RT_BILL_NOTE,
	   P_MACHINE_NO, P_HUNG, P_PAYED_AMT, P_CASH_NO,
	   P_REPORTED, P_VAT_AMT, P_DISC_AMT,
	   P_DISC_AMT_MST, P_DISC_AMT_DTL, P_CHEQUE_NO,
	   P_CHEQUE_AMT, P_CHEQUE_DUE_DATE, P_CREDIT_CARD,
	   P_CR_CARD_NO, P_CR_CARD_AMT,P_CR_CARD_COMM_PER,
	   P_CR_CARD_NO_SCND,P_CR_CARD_AMT_SCND,P_CR_CARD_COMM_PER_SCND,
	   P_CR_CARD_NO_THRD,P_CR_CARD_AMT_THRD,P_CR_CARD_COMM_PER_THRD,
	   P_CR_CARD_CST_NO,P_CR_CARD_CST_NO_SCND,P_CR_CARD_CST_NO_THRD,
	   P_W_CODE, P_RT_PRICE_TYPE, P_REP_CODE,
	   P_W_CODE_BILL, P_REP_CODE_BILL, P_CC_CODE_BILL,
	   P_RETURN_TYPE, V_PAYED, P_MACHINE_NO_BILL,
	   DECODE(V_PAYED,1,P_PAID_U_ID,''), P_PAID_DATE, P_EMP_NO,
	   P_PAID_RT_BILL, P_MACHINE_NO_PAID, P_RT_BILL_JRNL,
	   P_AD_U_ID, P_AD_DATE, P_UP_U_ID,
	   P_UP_DATE, P_UP_CNT, P_PR_REP,
	   P_CMP_NO, P_BRN_NO, P_BRN_YEAR,
	   P_BRN_USR, P_CUST_CODE, P_MOBILE_NO,
	   P_POINT_TYP_NO,P_POINT_RPLC_AMT, P_DISC_AMT_HL_PRM, P_RT_VAT_PRD_TYP,
	   P_RTRN_PRV_YR, P_CLC_TYP_NO_TAX, P_DISC_AMT_AFTR_VAT,
	   P_DISC_AMT_MST_VAT, P_VAT_AMT_DISC_MST,P_REF_NO,
	   P_PYMNT_AC,P_AC_CODE,P_AC_DTL_TYP,P_AC_CODE_DTL,
	   V_CC_CODE,V_PJ_NO,V_ACTV_NO,
	   P_AC_AMT,P_CLC_TAX_FREE_QTY_FLG,P_OTHR_AMT,P_AD_TRMNL_NM,P_UP_TRMNL_NM,P_DOC_SER_EXTRNL,P_SRVR_NO,P_EXTERNAL_POST,P_C_TAX_CODE,G_TAX_BILL_TYP,G_LVL_PRICE_NO,V_SHFT_SRL) ;
EXCEPTION  WHEN OTHERS THEN
  ROLLBACK;
  RAISE_APPLICATION_ERROR (-20012,'Error When Insert Into IAS_POS_RT_BILL_MST , '||CHR(10)||SQLERRM);
END INSRT_IAS_POS_RT_BILL_MST;
--##-----------------------------------------------------------------------------------------------------##--
PROCEDURE INSRT_IAS_POS_RT_BILL_DTL( P_RT_BILL_NO      IN IAS_POS_RT_BILL_DTL.RT_BILL_NO%TYPE
	,P_I_CODE	   IN IAS_POS_RT_BILL_DTL.I_CODE%TYPE
	,P_I_QTY	   IN IAS_POS_RT_BILL_DTL.I_QTY%TYPE
	,P_I_PRICE	   IN IAS_POS_RT_BILL_DTL.I_PRICE%TYPE
	,P_DIS_PER	   IN IAS_POS_RT_BILL_DTL.DIS_PER%TYPE			  DEFAULT NULL
	,P_DIS_AMT	   IN IAS_POS_RT_BILL_DTL.DIS_AMT%TYPE			  DEFAULT NULL
	,P_DIS_AMT_MST	   IN IAS_POS_RT_BILL_DTL.DIS_AMT_MST%TYPE		  DEFAULT NULL
	,P_DIS_AMT_DTL	   IN IAS_POS_RT_BILL_DTL.DIS_AMT_DTL%TYPE		  DEFAULT NULL
	,P_ITM_UNT	   IN IAS_POS_RT_BILL_DTL.ITM_UNT%TYPE
	,P_P_SIZE	   IN IAS_POS_RT_BILL_DTL.P_SIZE%TYPE
	,P_P_QTY	   IN IAS_POS_RT_BILL_DTL.P_QTY%TYPE
	,P_VAT_PER	   IN IAS_POS_RT_BILL_DTL.VAT_PER%TYPE
	,P_VAT_AMT	   IN IAS_POS_RT_BILL_DTL.VAT_AMT%TYPE			  DEFAULT NULL
	,P_BATCH_NO	   IN IAS_POS_RT_BILL_DTL.BATCH_NO%TYPE 		  DEFAULT NULL
	,P_EXPIRE_DATE	   IN IAS_POS_RT_BILL_DTL.EXPIRE_DATE%TYPE		  DEFAULT NULL
	,P_BARCODE	   IN IAS_POS_RT_BILL_DTL.BARCODE%TYPE			  DEFAULT NULL
	,P_W_CODE	   IN IAS_POS_RT_BILL_DTL.W_CODE%TYPE			  DEFAULT NULL
	,P_SERVICE_ITEM    IN IAS_POS_RT_BILL_DTL.SERVICE_ITEM%TYPE		  DEFAULT NULL
	,P_FREE_QTY	   IN IAS_POS_RT_BILL_DTL.FREE_QTY%TYPE 		  DEFAULT NULL
	,P_RCRD_NO	   IN IAS_POS_RT_BILL_DTL.RCRD_NO%TYPE			  DEFAULT NULL
	,P_CMP_NO	   IN IAS_POS_RT_BILL_DTL.CMP_NO%TYPE			  DEFAULT NULL
	,P_BRN_NO	   IN IAS_POS_RT_BILL_DTL.BRN_NO%TYPE			  DEFAULT NULL
	,P_BRN_YEAR	   IN IAS_POS_RT_BILL_DTL.BRN_YEAR%TYPE 		  DEFAULT NULL
	,P_BRN_USR	   IN IAS_POS_RT_BILL_DTL.BRN_USR%TYPE			  DEFAULT NULL
	,P_I_PRICE_VAT	   IN IAS_POS_RT_BILL_DTL.I_PRICE_VAT%TYPE		  DEFAULT NULL
	,P_DIS_AMT_DTL_HL_PRM	IN IAS_POS_RT_BILL_DTL.DIS_AMT_DTL_HL_PRM%TYPE	  DEFAULT NULL
	,P_QT_I_QTY		IN IAS_POS_RT_BILL_DTL.QT_I_QTY%TYPE		  DEFAULT NULL
	,P_DIS_AMT_DTL_VAT	IN IAS_POS_RT_BILL_DTL.DIS_AMT_DTL_VAT%TYPE	  DEFAULT NULL
	,P_DIS_AFTR_VAT_MST	IN IAS_POS_RT_BILL_DTL.DIS_AFTR_VAT_MST%TYPE	  DEFAULT NULL
	,P_DIS_AMT_MST_VAT	IN IAS_POS_RT_BILL_DTL.DIS_AMT_MST_VAT%TYPE	  DEFAULT NULL
	,P_VAT_AMT_DIS_DTL_VAT	IN IAS_POS_RT_BILL_DTL.VAT_AMT_DIS_DTL_VAT%TYPE   DEFAULT NULL
	,P_VAT_AMT_AFTR_DIS	IN IAS_POS_RT_BILL_DTL.VAT_AMT_AFTR_DIS%TYPE	  DEFAULT NULL
	,P_VAT_AMT_BFR_DIS	IN IAS_POS_RT_BILL_DTL.VAT_AMT_BFR_DIS%TYPE	  DEFAULT NULL
	,P_VAT_AMT_DIS_MST_VAT	IN IAS_POS_RT_BILL_DTL.VAT_AMT_DIS_MST_VAT%TYPE   DEFAULT NULL
	,P_QT_PRM_RCRD_NO	IN IAS_POS_RT_BILL_DTL.QT_PRM_RCRD_NO%TYPE	  DEFAULT NULL
	,P_QT_PRM_SER		IN IAS_POS_RT_BILL_DTL.QT_PRM_SER%TYPE		  DEFAULT NULL
	,P_QT_PRM_NO		IN IAS_POS_RT_BILL_DTL.QT_PRM_NO%TYPE		  DEFAULT NULL
	,P_DOC_D_SEQ		IN IAS_POS_RT_BILL_DTL.DOC_D_SEQ%TYPE		  DEFAULT NULL
	,P_QR_CODE		IN IAS_POS_RT_BILL_DTL.QR_CODE%TYPE		  DEFAULT NULL
	,P_SERIALNO		IN IAS_POS_RT_BILL_DTL.SERIALNO%TYPE		  DEFAULT NULL
	,P_LVL_PRICE_NO 	IN NUMBER DEFAULT NULL	 )  IS
  V_CNT 	 NUMBER :=0;
  V_P_QTY	 NUMBER ;
  V_Itm_Srvc	 NUMBER :=0;
  V_Vat_disc_amt NUMBER :=0;
  V_I_Price	 NUMBER :=0;
  V_I_Price_Vat  NUMBER :=0;
  V_USE_SERIALNO NUMBER :=0;
BEGIN
	    IF P_RT_BILL_NO IS	NULL	       THEN
	      RAISE_APPLICATION_ERROR(-20020,' RT_BILL_NO Is Null , '||SQLERRM);
	    ELSIF P_I_CODE IS NULL THEN
	      RAISE_APPLICATION_ERROR(-20021,' I_CODE Is Null , '||SQLERRM);
	    ELSIF P_ITM_UNT IS NULL THEN
	      RAISE_APPLICATION_ERROR(-20022,' ITM_UNT Is Null , '||SQLERRM);
	    ELSIF P_P_SIZE IS NULL THEN
	      RAISE_APPLICATION_ERROR(-20023,' P_SIZE FOR I_CODE Is Null , '||SQLERRM);
	    ELSIF P_W_CODE IS NULL THEN
	      RAISE_APPLICATION_ERROR(-20024,' W_CODE Is Null , '||SQLERRM);
	    END IF;
	    ----##-----------------------------------------------------------------------------------------------------##-----
	    IF P_I_CODE IS NOT NULL	THEN
	    BEGIN
	    SELECT 1,SERVICE_ITM,USE_SERIALNO INTO V_CNT ,V_Itm_Srvc,V_USE_SERIALNO
	    FROM   IAS_ITM_MST
	    WHERE  I_CODE  =P_I_CODE
	    AND  ROWNUM  <= 1 ;
	    EXCEPTION
	    WHEN NO_DATA_FOUND THEN
	    V_CNT := 0 ;
	    END ;
	    IF	NVL(V_CNT,0) = 0 THEN
	      RAISE_APPLICATION_ERROR(-20025,'I_Code  Is Wrong ,I_CODE = '||P_I_CODE ||'--'||CHR(10)||SQLERRM) ;
	    END IF;
	    END IF;
	    ----##-----------------------------------------------------------------------------------------------------##-----
	    IF P_I_CODE IS NOT NULL AND P_ITM_UNT IS NOT NULL THEN
	    BEGIN
	    SELECT 1 INTO V_CNT
	    FROM   IAS_ITM_DTL
	    WHERE  I_CODE  =P_I_CODE
	    AND    ITM_UNT =P_ITM_UNT
	    AND  ROWNUM  <= 1 ;
	    EXCEPTION
	    WHEN NO_DATA_FOUND THEN
	    V_CNT := 0 ;
	    END ;
	    IF	NVL(V_CNT,0) = 0 THEN
	    RAISE_APPLICATION_ERROR(-20026,'Itm_Unt  Is Wrong ,ITM_UNT = '||P_ITM_UNT ||'--'||CHR(10)||SQLERRM) ;
	    END IF;

	    BEGIN
	    SELECT 1 INTO V_CNT
	    FROM   IAS_ITM_DTL
	    WHERE  I_CODE  =P_I_CODE
	    AND    ITM_UNT =P_ITM_UNT
	    AND    P_SIZE =P_P_SIZE
	    AND  ROWNUM  <= 1 ;
	    EXCEPTION
	    WHEN NO_DATA_FOUND THEN
	    V_CNT := 0 ;
	    END ;
	    IF	NVL(V_CNT,0) = 0 THEN
	    RAISE_APPLICATION_ERROR(-20026,'P_SIZE  Is Wrong I_CODE ITM_UNT P_SIZE = '||P_I_CODE||' '||P_ITM_UNT ||' '||P_P_SIZE||CHR(10)||SQLERRM) ;
	    END IF;

	    END IF;
	    ----##-----------------------------------------------------------------------------------------------------##-----
	    IF P_I_QTY IS NOT NULL   THEN
	    IF	P_I_QTY <= 0 AND P_FREE_QTY <= 0 THEN
	    RAISE_APPLICATION_ERROR(-20027,'I_QTY IS ZERO ,I_QTY = '||P_I_QTY ||'--'||CHR(10)||SQLERRM) ;
	    END IF;
	    END IF;
	    ----##-----------------------------------------------------------------------------------------------------##-----
	    IF P_FREE_QTY IS NOT NULL	THEN
	    IF	P_FREE_QTY < 0 THEN
	    RAISE_APPLICATION_ERROR(-20028,'I_QTY < 0 ,I_QTY = '||P_I_QTY ||'--'||CHR(10)||SQLERRM) ;
	    END IF;
	    END IF;
	    ----##-----------------------------------------------------------------------------------------------------##-----
	    IF P_I_PRICE IS NOT NULL   THEN
	    IF	P_I_PRICE < 0 THEN
	    RAISE_APPLICATION_ERROR(-20029,'I_PRICE < 0 ,I_PRICE = '||P_I_QTY ||'--'||CHR(10)||SQLERRM) ;
	    END IF;
	    END IF;

	    IF NVL(V_USE_SERIALNO,0)>0 AND P_SERIALNO IS NULL THEN
		 RAISE_APPLICATION_ERROR(-20027,'I_CODE  = '||P_I_CODE ||' USE SERIAL NO BUT SERIAL NO IS NULL'||CHR(10)||SQLERRM) ;
	    END IF;

       V_I_Price     := P_I_Price;
       V_I_Price_vat := P_I_PRICE_VAT;
       --V_Vat_Per   := P_Vat_Per;

       IF G_USE_PRICE_INCLUDE_VAT = 1 AND P_I_PRICE_VAT IS NULL THEN
	  RAISE_APPLICATION_ERROR(-20029,'I_PRICE_VAT IS NULL'||'--'||CHR(10)||SQLERRM) ;
       ELSIF G_USE_PRICE_INCLUDE_VAT = 1 THEN
	 IF G_SAVE_TYP>0 THEN
	   V_Vat_disc_amt :=Round((((Nvl(P_Dis_Amt_Dtl,0)+Nvl(P_Dis_Amt_Mst,0)))*Nvl(P_VAT_PER,0))/100,12);
	  --V_VAT_PRCNT := YS_TAX_PKG.GET_ITM_TAX_PRCNT(P_CLC_TYP_NO => G_CLC_TYP_NO_TAX, P_I_CODE => P_I_CODE, P_CLC_USD_ITM => 0);
	  --V_I_PRICE := P_I_PRICE_VAT / ((NVL(P_VAT_PER, 0) / 100) + 1);
	   V_I_PRICE :=Nvl(P_I_PRICE_VAT,0)-(Nvl(P_VAT_AMT,0)+Nvl(V_Vat_disc_amt,0));
	 END IF;
       END IF;

 /* IF G_SAVE_TYP>0 THEN
    G_Chk_Itm_Price:=1;
  Else
    G_Chk_Itm_Price:=0;
  End If;*/
  IF P_LVL_PRICE_NO IS NOT NULL THEN
    G_LVL_PRICE_NO:=P_LVL_PRICE_NO;
  END IF;
   IF G_SAVE_TYP>0 THEN
   --##---------------------------------------------------------------------------------------------------------------------------##--
   --## CHK ITM DATA
      Chk_Itm(P_Doc_Type	    => 5
	       ,P_I_Code	      => P_I_Code
	       ,P_Itm_Unt	      => P_Itm_Unt
	       ,P_P_Size	      => P_P_Size
	       ,P_I_Qty 	      => P_I_Qty
	       ,P_Free_Qty	      => P_Free_Qty
	       ,P_I_Price	      => V_I_Price
	       ,P_I_Price_Vat	      => V_I_Price_Vat
	       ,P_Lev_No	      => G_LVL_PRICE_NO
	       ,P_Qt_Prm_Method       => Null
	       ,P_Qut_Prm_Price       => Null
	       ,P_Qt_Prm_Ser	      => P_Qt_Prm_Ser
	       ,P_Dis_Per	      => P_Dis_Per
	       ,P_Dis_Amt_Dtl	      => P_Dis_Amt_Dtl
	       ,P_Dis_Amt_Dtl_Vat     => P_Dis_Amt_Dtl_Vat
	       ,P_Dis_Amt_Mst	      => P_Dis_Amt_Mst
	       ,P_W_Code	      => G_WCode
	       ,P_Expire_Date	      => P_Expire_Date
	       ,P_Batch_No	      => P_Batch_No
	       ,P_Brn_No	      => G_Brn_No
	       ,P_Doc_Ser	      => G_RT_BILL_SRL
	       ,P_Doc_Date	      => G_Bill_Date
	       ,P_C_Code	      => G_C_Code
	       ,P_Cur_Code	      => G_Cur_Code
	       ,P_Ac_Rate	      => G_Cur_Rate
	       ,P_Usr_No	      => G_Ad_U_Id
	       ,P_Clc_Vat_Price_Typ   => Nvl (G_Clc_Vat_Price_Typ, 1)
	       ,P_Bill_Doc_Type       => G_BILL_TYPE
	       ,P_Chk_Avlqty_Flg      => Nvl(G_CHCK_AVL_QTY,0)
	       ,P_Chk_Itm_Price       => 0--G_Chk_Itm_Price --# 0 nocheck 1 check
	       ,P_Use_Vat	      => G_USE_VAT_MCHN
	       ,P_Clc_Typ_No_Tax      => G_Clc_Typ_No_Tax
	       ,P_Lng_No	      => G_Lng_No
	       ,P_Msg_Txt	      => G_Msg_Txt
	       ,P_Pkg_Line	      => V_Err_No
	       ,P_Pkg_Nm	      => G_Pkg_Nm);

	   If G_Msg_Txt Is Not Null Then
	      --Goto RTN_RSLT;
	      RAISE_APPLICATION_ERROR (-20028,'Err When Insert Into IAS_POS_RT_BILL_DTL , '||CHR(10)||G_Msg_Txt);
	   End If;
	End If;
	    V_P_QTY:=  P_I_QTY*P_P_SIZE;
----##-----------------------------------------------------------------------------------------------------##-----
		    BEGIN
		    INSERT INTO IAS_POS_RT_BILL_DTL ( RT_BILL_NO,RT_BILL_SRL, I_CODE, I_QTY,
		    I_PRICE, DIS_PER, DIS_AMT,
		    DIS_AMT_MST, DIS_AMT_DTL, ITM_UNT,
		    P_SIZE, P_QTY, VAT_PER,
		    VAT_AMT, BATCH_NO, EXPIRE_DATE,
		    BARCODE, W_CODE, SERVICE_ITEM,
		    FREE_QTY, RCRD_NO, CMP_NO,
		    BRN_NO, BRN_YEAR, BRN_USR,
		    I_PRICE_VAT,
		    DIS_AMT_DTL_HL_PRM, QT_I_QTY, DIS_AMT_DTL_VAT,
		    DIS_AFTR_VAT_MST, DIS_AMT_MST_VAT, VAT_AMT_DIS_DTL_VAT,
		    VAT_AMT_AFTR_DIS, VAT_AMT_BFR_DIS,VAT_AMT_DIS_MST_VAT ,
		    QT_PRM_RCRD_NO,QT_PRM_SER,QT_PRM_NO,DOC_D_SEQ,QR_CODE ,PRICE_LVL
		    )
		    VALUES
		    (P_RT_BILL_NO,G_RT_BILL_SRL, P_I_CODE, P_I_QTY,
		    P_I_PRICE, P_DIS_PER, P_DIS_AMT,
		    P_DIS_AMT_MST, P_DIS_AMT_DTL, P_ITM_UNT,
		    P_P_SIZE, V_P_QTY, P_VAT_PER,
		    P_VAT_AMT, P_BATCH_NO, P_EXPIRE_DATE,
		    P_BARCODE, P_W_CODE, V_Itm_Srvc,
		    P_FREE_QTY, P_RCRD_NO, P_CMP_NO,
		    P_BRN_NO, P_BRN_YEAR, P_BRN_USR,
		    P_I_PRICE_VAT,
		    P_DIS_AMT_DTL_HL_PRM, P_QT_I_QTY, P_DIS_AMT_DTL_VAT,
		    P_DIS_AFTR_VAT_MST, P_DIS_AMT_MST_VAT, P_VAT_AMT_DIS_DTL_VAT,
		    P_VAT_AMT_AFTR_DIS, P_VAT_AMT_BFR_DIS, P_VAT_AMT_DIS_MST_VAT,
		    P_QT_PRM_RCRD_NO,P_QT_PRM_SER,P_QT_PRM_NO,P_DOC_D_SEQ,P_QR_CODE,G_LVL_PRICE_NO
		    ) ;
EXCEPTION  WHEN OTHERS THEN
ROLLBACK;
    RAISE_APPLICATION_ERROR (-20030,'Error When Insert Into IAS_POS_RT_BILL_DTL , '||CHR(10)||SQLERRM);
END;
END INSRT_IAS_POS_RT_BILL_DTL;

PROCEDURE EXTRCT_POS_RT_BILL_PRC(  P_XML in		CLOB,
				 P_JSON_RSLT	      OUT CLOB	  )  IS
V_JSON_RSLT VARCHAR2(4000);
V_XML_TYPE  XMLTYPE;
V_Cur_Code     VARCHAR2(1000);
V_Calc_Vat_Amt_Type Number;
V_Vat_Amt	    Number;
V_ERR_MSG	    VARCHAR2 (1000);
V_CREDIT_CARD  Number;
V_WRNNG_TXT	     VARCHAR2(4000);
V_Msg_Txt	     VARCHAR2(4000);
V_ERR_NO	     VARCHAR2(100);
V_Pkg_NM	     VARCHAR2(100);
V_OFFLINE_VLDT	     NUMBER;
V_C_TAX_CODE	     CUSTOMER.C_TAX_CODE%TYPE;
V_UPD_MCHN_FLG	     Number;
BEGIN
--V_JSON_RSLT:= '{"_Result": { "_Doc_No":@DOC_NO,"_ErrMsg": "@errmsg","_ErrNo": @errno } }';
V_JSON_RSLT:= '{"_Result": { "_Doc_No":"@DOC_NO","_ErrMsg": "@errmsg","_ErrNo": @errno ,"_DOC_UUID":"@DOC_UUID","_WRNNG_TXT":"@WRNNG_TXT" } }';
V_XML_TYPE :=XMLTYPE.CREATEXML ( P_XML);

FOR M_CV IN
(SELECT      EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BILL_NO		  ') AS  RT_BILL_NO
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BILL_DATE		  ') AS  RT_BILL_DATE
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BILL_TIME		  ') AS  RT_BILL_TIME
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BILL_TYPE		  ') AS  RT_BILL_TYPE
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/SR_TYPE		  ') AS  SR_TYPE
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/EMP_NO 		  ') AS  EMP_NO
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BILL_NO_REF		  ') AS  BILL_NO_REF
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/C_CODE 		  ') AS  C_CODE
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/A_CY			  ') AS  A_CY
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BILL_RATE	       ') AS  RT_BILL_RATE
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/RT_BILL_AMT		  ') AS  RT_BILL_AMT
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BILL_NOTE	       ') AS  RT_BILL_NOTE
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/PAYED_AMT		  ') AS  PAYED_AMT
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/REPORTED		  ') AS  REPORTED
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/VAT_AMT		  ') AS  VAT_AMT
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DISC_AMT		  ') AS  DISC_AMT
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DISC_AMT_MST		  ') AS  DISC_AMT_MST
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DISC_AMT_DTL		  ') AS  DISC_AMT_DTL
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CHEQUE_NO		  ') AS  CHEQUE_NO
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CHEQUE_AMT		  ') AS  CHEQUE_AMT
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CHEQUE_DUE_DATE	  ') AS  CHEQUE_DUE_DATE
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CREDIT_CARD		  ') AS  CREDIT_CARD
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_NO		  ') AS  CR_CARD_NO
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_AMT		  ') AS  CR_CARD_AMT
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_COMM_PER	  ') AS  CR_CARD_COMM_PER
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_NO_SCND	  ') AS  CR_CARD_NO_SCND
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_AMT_SCND	  ') AS  CR_CARD_AMT_SCND
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_COMM_PER_SCND	  ') AS  CR_CARD_COMM_PER_SCND
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_NO_THRD	  ') AS  CR_CARD_NO_THRD
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_AMT_THRD	  ') AS  CR_CARD_AMT_THRD
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_COMM_PER_THRD	  ') AS  CR_CARD_COMM_PER_THRD
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_CST_NO 	  ') AS  CR_CARD_CST_NO
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_CST_NO_SCND	  ') AS  CR_CARD_CST_NO_SCND
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_CST_NO_THRD	  ') AS  CR_CARD_CST_NO_THRD
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CASH_NO		  ') AS  CASH_NO
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/W_CODE 		  ') AS  W_CODE
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/RT_PRICE_TYPE		  ') AS  RT_PRICE_TYPE
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/REP_CODE		  ') AS  REP_CODE
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/W_CODE_BILL		  ') AS  W_CODE_BILL
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/REP_CODE_BILL		  ') AS  REP_CODE_BILL
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CC_CODE_BILL		  ') AS  CC_CODE_BILL
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/RETURN_TYPE		  ') AS  RETURN_TYPE
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/MACHINE_NO		  ') AS  MACHINE_NO
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/SRVR_NO		  ') AS  SRVR_NO
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/HUNG			  ') AS  HUNG
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/PAYED			  ') AS  PAYED
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/POSTED 		  ') AS  POSTED
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/MACHINE_NO_BILL	  ') AS  MACHINE_NO_BILL
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/PAID_U_ID		  ') AS  PAID_U_ID
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/PAID_DATE		  ') AS  PAID_DATE
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/PAID_BILL		  ') AS  PAID_RT_BILL
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/MACHINE_NO_PAID	  ') AS  MACHINE_NO_PAID
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/RT_BILL_JRNL		  ') AS  RT_BILL_JRNL
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CUST_CODE		  ') AS  CUST_CODE
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/MOBILE_NO		  ') AS  MOBILE_NO
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/POINT_TYP_NO		  ') AS  POINT_TYP_NO
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/POINT_RPLC_AMT 	  ') AS  POINT_RPLC_AMT
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DISC_AMT_HL_PRM	  ') AS  DISC_AMT_HL_PRM
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/RT_VAT_PRD_TYP 	  ') AS  RT_VAT_PRD_TYP
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/RTRN_PRV_YR		  ') AS  RTRN_PRV_YR
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DISC_AMT_AFTR_VAT	  ') AS  DISC_AMT_AFTR_VAT
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DISC_AMT_MST_VAT	  ') AS  DISC_AMT_MST_VAT
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/VAT_AMT_DISC_MST	  ') AS  VAT_AMT_DISC_MST
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CLC_TYP_NO_TAX 	  ') AS  CLC_TYP_NO_TAX
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/AD_U_ID		  ') AS  AD_U_ID
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/AD_DATE		  ') AS  AD_DATE
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/UP_U_ID		  ') AS  UP_U_ID
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/UP_DATE		  ') AS  UP_DATE
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/UP_CNT 		  ') AS  UP_CNT
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/PR_REP 		  ') AS  PR_REP
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CMP_NO 		  ') AS  CMP_NO
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BRN_NO 		  ') AS  BRN_NO
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BRN_YEAR		  ') AS  BRN_YEAR
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BRN_USR		  ') AS  BRN_USR
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/PYMNT_AC		  ') AS  PYMNT_AC
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/AC_CODE		  ') AS  AC_CODE
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/AC_DTL_TYP		  ') AS  AC_DTL_TYP
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/AC_CODE_DTL		  ') AS  AC_CODE_DTL
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/AC_AMT 		  ') AS  AC_AMT
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CLC_TAX_FREE_QTY_FLG	  ') AS  CLC_TAX_FREE_QTY_FLG
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/OTHR_AMT		  ') AS  OTHR_AMT
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/AD_TRMNL_NM	     ') AS  AD_TRMNL_NM
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/UP_TRMNL_NM	     ') AS  UP_TRMNL_NM
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DOC_SER_EXTRNL      ') AS  DOC_SER_EXTRNL
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DOC_MCHN_SQ	     ') AS  DOC_MCHN_SQ
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/EXTERNAL_POST	       ') AS EXTERNAL_POST
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CC_CODE	       ') AS  CC_CODE
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/PJ_NO		       ') AS  PJ_NO
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/ACTV_NO	       ') AS  ACTV_NO
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/REF_NO 	      ') AS REF_NO
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/LNG_NO 	     ') AS  LNG_NO
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CLC_TAX_EXTRNAL_FLG   ') AS  CLC_TAX_EXTRNAL_FLG
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/C_TAX_CODE   ') AS  C_TAX_CODE
	    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/SAVE_TYP	     ') AS  SAVE_TYP
	    FROM TABLE (XMLSEQUENCE (EXTRACT (V_XML_TYPE, '/IAS_POS_RT_BILL/IAS_POS_RT_BILL_MST'))) XMLMSTDMY)
LOOP --(1)
--------------------------------------------------------------------------------
   IF NVL(M_CV.SAVE_TYP,0)=0 AND M_CV.RT_BILL_NO IS NULL THEN
       ROLLBACK;
      RAISE_APPLICATION_ERROR(-20904,'Error App RT_BILL_NO IS NULL '||CHR(10)||SQLERRM) ;
   END IF;
  ---------------------------------------------------------------------------------
   IF NVL(M_CV.SAVE_TYP,0)>0 THEN
	  G_SRVR_NO:=POS_GNR_PKG.GET_SRVR_NO_FNC;
	   IF NVL(M_CV.SAVE_TYP,0)=2 THEN
	    V_UPD_MCHN_FLG:=0;
	  ELSE
	    V_UPD_MCHN_FLG:=1;
	  END IF;
	  POS_GNR_PKG.GET_RT_BILL_NO_PRC(P_YR_NO      =>M_CV.BRN_YEAR,
				      P_AD_USR_NO     =>M_CV.AD_U_ID,
				      P_MCHN_NO       =>M_CV.MACHINE_NO,
				      P_SRVR_NO       =>G_SRVR_NO,
				      P_UPD_MCHN_FLG  =>V_UPD_MCHN_FLG,
				      P_RT_BILL_NO    =>G_RT_BILL_NO,
				      P_RT_BILL_SRL   =>G_RT_BILL_SRL,
				      P_DOC_MCHN_SQ   =>G_DOC_MCHN_SQ);

	POS_GNR_PKG.GET_DATE_INCRS_DCRS_PRC(P_BILL_DATE=>G_RT_BILL_DATE,
					    P_BILL_TIME=>G_RT_BILL_TIME);
   ELSE
	 G_RT_BILL_NO	 :=M_CV.RT_BILL_NO;
	 G_DOC_MCHN_SQ	 :=M_CV.DOC_MCHN_SQ;
	 G_RT_BILL_DATE  :=M_CV.RT_BILL_DATE;
	 G_RT_BILL_TIME  :=M_CV.RT_BILL_TIME;
	 G_SRVR_NO	 :=M_CV.SRVR_NO;
   END IF;
  ---------------------------------------------------------------------------------
    G_SAVE_TYP:=NVL(M_CV.SAVE_TYP,0);
    G_CLC_TAX_EXTRNAL_FLG:=M_CV.CLC_TAX_EXTRNAL_FLG;
    G_LNG_NO  :=NVL(M_CV.LNG_NO,1);
    IF M_CV.W_CODE IS NOT NULL THEN
       G_WCODE:=M_CV.W_CODE;
    END IF;
    IF M_CV.BRN_NO IS NOT NULL THEN
	G_BRN_NO:=M_CV.BRN_NO;
    END IF;
    If Nvl(M_CV.Cr_Card_Amt,0)+Nvl(M_CV.Cr_Card_Amt_Scnd,0)+Nvl(M_CV.Cr_Card_Amt_Thrd,0) > 0 THEN
	V_CREDIT_CARD:=1;
    END IF;
    IF NVL(M_CV.RT_BILL_RATE,0)>0 THEN
	      G_Cur_Rate:=M_CV.RT_BILL_RATE;
	  ELSE
	      G_Cur_Rate:=Ias_Gen_Pkg.Get_Cur_rate(p_acy=>M_CV.A_CY);
	  END IF;
	  ----------------------------------------------------------------------------------------------------------
   BEGIN
	SELECT Use_Vat INTO G_Use_Vat
	FROM IAS_PARA_GEN ;
    EXCEPTION
	WHEN NO_DATA_FOUND THEN
	 G_Use_Vat := 0 ;
    END ;
	  If M_CV.C_CODE||M_CV.CUST_CODE IS NOT NULL THEN
    YS_TAX_PKG.GET_CST_TAX_BILL_TYP(P_BILL_TYPE    =>M_CV.RT_BILL_TYPE
				  ,P_C_CODE	   =>M_CV.C_CODE
				  ,P_CST_CSH_CODE  =>M_CV.CUST_CODE
				  ,P_Use_Vat	   =>G_Use_Vat
				  ,P_C_TAX_CODE    =>V_C_TAX_CODE
				  ,P_TAX_BILL_TYP  =>G_TAX_BILL_TYP
				  );
    ELSE
       V_C_TAX_CODE:='';
       G_TAX_BILL_TYP:=1;
       M_CV.C_TAX_CODE:='';
    END IF;
    IF M_CV.C_TAX_CODE IS NOT NULL THEN
       V_C_TAX_CODE:=M_CV.C_TAX_CODE;
    END IF;
---------------------------------------------------------------------------------
   /* LOAD PARAMETERS */
    V_ERR_MSG := LOAD_PRMTRS;
    IF V_ERR_MSG IS NOT NULL THEN
	P_JSON_RSLT := '{"_Result": { "_Doc_No":' || G_RT_BILL_NO || ',"_ErrMsg":" ' || V_ERR_MSG || '","_ErrNo":-20 } }';
	RETURN;
    END IF;
---------------------------------------------------------------------------------
BEGIN		       --(2)
INSRT_IAS_POS_RT_BILL_MST( P_RT_BILL_NO 	   => G_RT_BILL_NO
	    ,P_RT_BILL_DATE	     => TO_DATE(TO_CHAR(G_RT_BILL_DATE),'DD/MM/RRRR')
	    ,P_RT_BILL_TIME	     => G_RT_BILL_TIME
	    ,P_RT_BILL_TYPE	     => M_CV.RT_BILL_TYPE
	    ,P_SR_TYPE		     => M_CV.SR_TYPE
	    ,P_EMP_NO		     => M_CV.EMP_NO
	    ,P_BILL_NO		     => M_CV.BILL_NO_REF
	    ,P_C_CODE		     => M_CV.C_CODE
	    ,P_A_CY		     => M_CV.A_CY
	    ,P_RT_BILL_RATE	     => G_Cur_Rate
	    ,P_RT_BILL_AMT	     => M_CV.RT_BILL_AMT
	    ,P_RT_BILL_NOTE	     => M_CV.RT_BILL_NOTE
	    ,P_PAYED_AMT	     => M_CV.PAYED_AMT
	    ,P_REPORTED 	     => M_CV.REPORTED
	    ,P_VAT_AMT		     => M_CV.VAT_AMT
	    ,P_DISC_AMT 	     => M_CV.DISC_AMT
	    ,P_DISC_AMT_MST	     => M_CV.DISC_AMT_MST
	    ,P_DISC_AMT_DTL	     => M_CV.DISC_AMT_DTL
	    ,P_CHEQUE_NO	     => M_CV.CHEQUE_NO
	    ,P_CHEQUE_AMT	     => M_CV.CHEQUE_AMT
	    ,P_CHEQUE_DUE_DATE	     => TO_DATE(TO_CHAR(M_CV.CHEQUE_DUE_DATE),'DD/MM/RRRR')
	    ,P_CREDIT_CARD	     => V_CREDIT_CARD
	    ,P_CR_CARD_NO	     => M_CV.CR_CARD_NO
	    ,P_CR_CARD_AMT	     => M_CV.CR_CARD_AMT
	    ,P_CR_CARD_COMM_PER      => M_CV.CR_CARD_COMM_PER
	    ,P_CR_CARD_NO_SCND	     => M_CV.CR_CARD_NO_SCND
	    ,P_CR_CARD_AMT_SCND      => M_CV.CR_CARD_AMT_SCND
	    ,P_CR_CARD_COMM_PER_SCND => M_CV.CR_CARD_COMM_PER_SCND
	    ,P_CR_CARD_NO_THRD	     => M_CV.CR_CARD_NO_THRD
	    ,P_CR_CARD_AMT_THRD      => M_CV.CR_CARD_AMT_THRD
	    ,P_CR_CARD_COMM_PER_THRD => M_CV.CR_CARD_COMM_PER_THRD
	    ,P_CR_CARD_CST_NO	     => M_CV.CR_CARD_CST_NO
	    ,P_CR_CARD_CST_NO_SCND   => M_CV.CR_CARD_CST_NO_SCND
	    ,P_CR_CARD_CST_NO_THRD   => M_CV.CR_CARD_CST_NO_THRD
	    ,P_CASH_NO		     => M_CV.CASH_NO
	    ,P_W_CODE		     => M_CV.W_CODE
	    ,P_RT_PRICE_TYPE	     => M_CV.RT_PRICE_TYPE
	    ,P_REP_CODE 	     => M_CV.REP_CODE
	    ,P_W_CODE_BILL	     => M_CV.W_CODE_BILL
	    ,P_REP_CODE_BILL	     => M_CV.REP_CODE_BILL
	    ,P_CC_CODE_BILL	     => M_CV.CC_CODE_BILL
	    ,P_RETURN_TYPE	     => M_CV.RETURN_TYPE
	    ,P_MACHINE_NO	     => M_CV.MACHINE_NO
	    ,P_HUNG		     => M_CV.HUNG
	    ,P_PAYED		     => M_CV.PAYED
	    ,P_POSTED		     => 0
	    ,P_MACHINE_NO_BILL	     => M_CV.MACHINE_NO_BILL
	    ,P_PAID_U_ID	     => M_CV.PAID_U_ID
	    ,P_PAID_DATE	     => TO_DATE(TO_CHAR(M_CV.PAID_DATE),'DD/MM/RRRR')
	    ,P_PAID_RT_BILL	     => M_CV.PAID_RT_BILL
	    ,P_MACHINE_NO_PAID	     => M_CV.MACHINE_NO_PAID
	    ,P_RT_BILL_JRNL	     => M_CV.RT_BILL_JRNL
	    ,P_CUST_CODE	     => M_CV.CUST_CODE
	    ,P_MOBILE_NO	     => M_CV.MOBILE_NO
	    ,P_POINT_TYP_NO	     => M_CV.POINT_TYP_NO
	    ,P_POINT_RPLC_AMT	     => M_CV.POINT_RPLC_AMT
	    ,P_DISC_AMT_HL_PRM	     => M_CV.DISC_AMT_HL_PRM
	    ,P_RT_VAT_PRD_TYP	     => M_CV.RT_VAT_PRD_TYP
	    ,P_RTRN_PRV_YR	     => M_CV.RTRN_PRV_YR
	    ,P_DISC_AMT_AFTR_VAT     => M_CV.DISC_AMT_AFTR_VAT
	    ,P_DISC_AMT_MST_VAT      => M_CV.DISC_AMT_MST_VAT
	    ,P_VAT_AMT_DISC_MST      => M_CV.VAT_AMT_DISC_MST
	    ,P_CLC_TYP_NO_TAX	     => M_CV.CLC_TYP_NO_TAX
	    ,P_AD_U_ID		     => M_CV.AD_U_ID
	    ,P_AD_DATE		     => SYSDATE
	    ,P_UP_U_ID		     => M_CV.UP_U_ID
	    ,P_UP_DATE		     => NULL
	    ,P_UP_CNT		     => M_CV.UP_CNT
	    ,P_PR_REP		     => M_CV.PR_REP
	    ,P_CMP_NO		     => M_CV.CMP_NO
	    ,P_BRN_NO		     => M_CV.BRN_NO
	    ,P_BRN_YEAR 	     => M_CV.BRN_YEAR
	    ,P_BRN_USR		     => M_CV.BRN_USR
	    ,P_PYMNT_AC 	     => M_CV.PYMNT_AC
	    ,P_AC_CODE		     => M_CV.AC_CODE
	    ,P_AC_DTL_TYP	     => M_CV.AC_DTL_TYP
	    ,P_AC_CODE_DTL	     => M_CV.AC_CODE_DTL
	    ,P_AC_AMT		     => M_CV.AC_AMT
	    ,P_CLC_TAX_FREE_QTY_FLG  => M_CV.CLC_TAX_FREE_QTY_FLG
	    ,P_OTHR_AMT 	     => M_CV.OTHR_AMT
	    ,P_AD_TRMNL_NM	     => M_CV.AD_TRMNL_NM
	    ,P_UP_TRMNL_NM	     => M_CV.UP_TRMNL_NM
	    ,P_DOC_SER_EXTRNL	     => M_CV.DOC_SER_EXTRNL
	    ,P_CC_CODE		     => M_CV.CC_CODE
	    ,P_PJ_NO		     => M_CV.PJ_NO
	    ,P_ACTV_NO		     => M_CV.ACTV_NO
	    ,P_EXTERNAL_POST	     => M_CV.EXTERNAL_POST
	    ,P_C_TAX_CODE	     => V_C_TAX_CODE
	    ,P_REF_NO		     => M_CV.REF_NO
	    ,P_SRVR_NO		     => G_SRVR_NO
	    ,P_DOC_MCHN_SQ	     => G_DOC_MCHN_SQ
	    )  ;
EXCEPTION
WHEN OTHERS THEN
ROLLBACK;
RAISE_APPLICATION_ERROR(-20010,'Err when insert IAS_POS_RT_BILL_MST RT_BILL_NO= '||G_RT_BILL_NO ||' '||CHR(10)||SQLERRM);
END;
-------------------------------------------------------------------------------------------------------------------------------
FOR D_CV IN
(SELECT  EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BILL_NO		') AS  RT_BILL_NO
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/I_CODE		   ') AS  I_CODE
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/I_QTY		   ') AS  I_QTY
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/I_PRICE		   ') AS  I_PRICE
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DIS_PER		   ') AS  DIS_PER
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DIS_AMT		   ') AS  DIS_AMT
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DIS_AMT_MST	   ') AS  DIS_AMT_MST
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DIS_AMT_DTL	   ') AS  DIS_AMT_DTL
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/ITM_UNT		   ') AS  ITM_UNT
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/P_SIZE		   ') AS  P_SIZE
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/P_QTY		   ') AS  P_QTY
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/VAT_PER		   ') AS  VAT_PER
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/VAT_AMT		   ') AS  VAT_AMT
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BATCH_NO		   ') AS  BATCH_NO
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/EXPIRE_DATE	   ') AS  EXPIRE_DATE
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BARCODE		   ') AS  BARCODE
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/W_CODE		   ') AS  W_CODE
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/SERVICE_ITEM	   ') AS  SERVICE_ITEM
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FREE_QTY		   ') AS  FREE_QTY
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/RCRD_NO		   ') AS  RCRD_NO
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/I_PRICE_VAT	   ') AS  I_PRICE_VAT
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/QT_PRM_RCRD_NO	   ') AS  QT_PRM_RCRD_NO
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/QT_PRM_SER 	   ') AS  QT_PRM_SER
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/QT_PRM_NO		   ') AS  QT_PRM_NO
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DOC_D_SEQ		   ') AS  DOC_D_SEQ
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/QR_CODE		   ') AS  QR_CODE
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DIS_AMT_DTL_HL_PRM    ') AS  DIS_AMT_DTL_HL_PRM
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/QT_I_QTY		   ') AS  QT_I_QTY
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DIS_AMT_DTL_VAT	   ') AS  DIS_AMT_DTL_VAT
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DIS_AFTR_VAT_MST	   ') AS  DIS_AFTR_VAT_MST
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DIS_AMT_MST_VAT	   ') AS  DIS_AMT_MST_VAT
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/VAT_AMT_DIS_DTL_VAT   ') AS VAT_AMT_DIS_DTL_VAT
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/VAT_AMT_AFTR_DIS	   ') AS VAT_AMT_AFTR_DIS
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/VAT_AMT_BFR_DIS	   ') AS VAT_AMT_BFR_DIS
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/VAT_AMT_DIS_MST_VAT   ') AS VAT_AMT_DIS_MST_VAT
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CMP_NO		   ') AS  CMP_NO
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BRN_NO		   ') AS  BRN_NO
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BRN_YEAR		   ') AS  BRN_YEAR
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BRN_USR		   ') AS  BRN_USR
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/LVL_PRICE_NO	   ') AS  LVL_PRICE_NO
	,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/SERIALNO		   ') AS  SERIALNO
FROM TABLE (XMLSEQUENCE (EXTRACT (V_XML_TYPE, '/IAS_POS_RT_BILL/IAS_POS_RT_BILL_DTL'))) XMLMSTDMY)
LOOP --(2)
--------------------------------------------------------------------------------
------- TO INSERT IAS_POS_RT_BILL_DTL

 BEGIN
  INSRT_IAS_POS_RT_BILL_DTL( P_RT_BILL_NO    =>G_RT_BILL_NO
	,P_I_CODE	   =>D_CV.I_CODE
	,P_I_QTY	   =>D_CV.I_QTY
	,P_I_PRICE	   =>D_CV.I_PRICE
	,P_DIS_PER	   =>D_CV.DIS_PER
	,P_DIS_AMT	   =>D_CV.DIS_AMT
	,P_DIS_AMT_MST	   =>D_CV.DIS_AMT_MST
	,P_DIS_AMT_DTL	   =>D_CV.DIS_AMT_DTL
	,P_ITM_UNT	   =>D_CV.ITM_UNT
	,P_P_SIZE	   =>D_CV.P_SIZE
	,P_P_QTY	   =>D_CV.P_QTY
	,P_VAT_PER	   =>D_CV.VAT_PER
	,P_VAT_AMT	   =>D_CV.VAT_AMT
	,P_BATCH_NO	   =>D_CV.BATCH_NO
	,P_EXPIRE_DATE	   =>D_CV.EXPIRE_DATE
	,P_BARCODE	   =>D_CV.BARCODE
	,P_W_CODE	   =>D_CV.W_CODE
	,P_SERVICE_ITEM    =>D_CV.SERVICE_ITEM
	,P_FREE_QTY	   =>D_CV.FREE_QTY
	,P_RCRD_NO	   =>D_CV.RCRD_NO
	,P_CMP_NO	   =>M_CV.CMP_NO
	,P_BRN_NO	   =>M_CV.BRN_NO
	,P_BRN_YEAR	   =>M_CV.BRN_YEAR
	,P_BRN_USR	   =>M_CV.BRN_USR
	,P_I_PRICE_VAT	   =>D_CV.I_PRICE_VAT
	,P_DIS_AMT_DTL_HL_PRM	=>D_CV.DIS_AMT_DTL_HL_PRM
	,P_QT_I_QTY		=>D_CV.QT_I_QTY
	,P_DIS_AMT_DTL_VAT	=>D_CV.DIS_AMT_DTL_VAT
	,P_DIS_AFTR_VAT_MST	=>D_CV.DIS_AFTR_VAT_MST
	,P_DIS_AMT_MST_VAT	=>D_CV.DIS_AMT_MST_VAT
	,P_VAT_AMT_DIS_DTL_VAT	=>D_CV.VAT_AMT_DIS_DTL_VAT
	,P_VAT_AMT_AFTR_DIS	=>D_CV.VAT_AMT_AFTR_DIS
	,P_VAT_AMT_BFR_DIS	=>D_CV.VAT_AMT_BFR_DIS
	,P_VAT_AMT_DIS_MST_VAT	=>D_CV.VAT_AMT_DIS_MST_VAT
	,P_QT_PRM_RCRD_NO	=>D_CV.QT_PRM_RCRD_NO
	,P_QT_PRM_SER		=>D_CV.QT_PRM_SER
	,P_QT_PRM_NO		=>D_CV.QT_PRM_NO
	,P_DOC_D_SEQ		=>D_CV.DOC_D_SEQ
	,P_QR_CODE		=>D_CV.QR_CODE
	,P_LVL_PRICE_NO 	=>D_CV.LVL_PRICE_NO
	,P_SERIALNO		=>D_CV.SERIALNO);
EXCEPTION
WHEN OTHERS THEN
ROLLBACK;
RAISE_APPLICATION_ERROR(-20010,'Err when insert IAS_POS_RT_BILL_DTL RT_BILL_NO= '||G_RT_BILL_NO ||' '||CHR(10)||SQLERRM);

END; --(2)

END LOOP;
     ----------------------------------------------------------------------------------------------------------
	Begin
	 Select Cur_Code
		Into V_Cur_Code
		 From ex_rate
		  Where stock_cur = 1 ;
	  Exception
	    When No_Data_Found Then
	       Null;
	 End ;
   ----------------------------------------------------------------------------------------------------------
	BEGIN
	    SELECT Nvl(Calc_Vat_Amt_Type,0)  INTO V_Calc_Vat_Amt_Type
	    FROM IAS_PARA_AR ;
	EXCEPTION
	    WHEN NO_DATA_FOUND THEN
	     Null;
	END ;
       BEGIN
	    SELECT SUM(NVL(VAT_AMT,0)*NVL(I_QTY,0)) INTO V_VAT_AMT
	    FROM IAS_POS_RT_BILL_DTL WHERE Rt_BILL_NO=G_Rt_BILL_NO ;
	EXCEPTION WHEN OTHERS THEN
	     V_VAT_AMT:=0;
	END ;
    ----------------------------------------------------------------------------------------------------------
       If  M_CV.Clc_Typ_No_Tax Is Not Null AND NVL(V_VAT_AMT,0)>0 Then
		   Ys_Tax_Pkg.Clc_Itm_Tax_Aftr_Save (  P_Clc_Typ_No	   => M_CV.Clc_Typ_No_Tax	   ,
						       P_Doc_Typ	   => 5 		     , -- Doc_Type In  Ias_Sys.Ias_Docjv_Type_Systems
						       P_Doc_No 	   => G_Rt_BILL_NO		   ,
						       P_Doc_Ser	   => G_RT_BILL_SRL		   ,
						       P_Bill_Doc_Typ	   => M_CV.Rt_BILL_TYPE 	   ,
						       P_Doc_Jv_Typ	   => M_CV.Sr_Type		   ,
						       P_Doc_Date	   => M_CV.Rt_Bill_Date 	   ,
						       P_A_Cy		   => M_CV.A_CY 		   ,
						       P_Ac_Rate	   => G_Cur_Rate		   ,
						       P_Stk_Rate	   => Ias_Gen_Pkg.Get_Cur_rate(p_acy=>V_Cur_Code),
						       P_Calc_Vat_Amt_Type => V_Calc_Vat_Amt_Type	   ,
						       P_Clc_Usd_Itm	   => 0 			   ,
						       P_Clc_Rtrn_Doc	   => 0 			   ,
						       P_Bill_No	    => Null ,--M_CV.Bill_No	   ,
						       P_Tbl_Mvmnt_Nm	   => 'POS_TAX_ITM_MOVMNT'	 ,
						       P_Tbl_Mst_Nm	   => 'Ias_Pos_Rt_Bill_Mst'	   ,
						       P_Tbl_Dtl_Nm	   => 'Ias_Pos_Rt_Bill_Dtl'	   ,
						       P_Fld_Doc_Ser	   => 'M.RT_BILL_SRL'		   ,
						       P_Fld_Tax_A_Code    => 'TD.AC_CODE_AR'		   ,
						       P_Fld_W_Code	   => 'D.W_CODE'		   ,
						       P_Fld_I_Price	   => 'D.I_PRICE'		   ,
						       P_Fld_Disc_Amt	   => 'NVL(D.DIS_AMT,0)'	   ,
						       P_Fld_Stk_Cost	   => 0 			     ,
						       P_BRN_NO 	   => M_CV.BRN_NO		     ,
						       P_Fld_Doc_Seq	   => 'D.RCRD_NO'		   );
	  End If;
    --##--------------------------------------------------------------------------------------------------------##--
      IF NVL(M_CV.SAVE_TYP,0)>0 Then
	   V_ERR_MSG := PST_INSRT_RT_BILL_PRC;
      ELSE
	 V_ERR_MSG :='';
      END IF;
	    IF V_ERR_MSG IS NOT NULL THEN
		P_JSON_RSLT := '{"_Result": { "_Doc_No":"' || G_RT_BILL_NO || '","_Doc_Srl":"' || G_RT_BILL_SRL || '","_ErrMsg":"' || REPLACE(V_ERR_MSG,'"','') || '","_ErrNo":-30 } }';
		ROLLBACK;
		RAISE_APPLICATION_ERROR(-20012,'Err when Update Rt_bill for Rt Bill_no= '||G_Rt_Bill_No ||' '||CHR(10)||V_ERR_MSG||' '||SQLERRM);
		RETURN;
	    ELSE
		IF NVL(M_CV.SAVE_TYP,0)=2 THEN
		   P_JSON_RSLT := POS_API_PKG.GET_RT_BILL_DATA_XML(P_RT_BILL_NO => G_RT_BILL_NO, P_LANG_NO => G_LNG_NO);
		   ROLLBACK;
		   RETURN;
		ELSE
		--##------------------------------------------------------------##--
		--## SYNC_E_INVC
		IF NVL(M_CV.SAVE_TYP,0) IN(0,1) AND NVL(IAS_BRN_PKG.IS_BRN_USE_E_INVC(P_BRN_NO => G_BRN_NO),0)<> 0 THEN
		  --##P_OFFLINE_VLDT =1  VALIDATION ONLY
				 SYNC_E_INVC_PRC( P_DOC_TYPE	  =>5,
						  P_BILL_TYPE	   =>M_CV.RT_BILL_TYPE,
						  P_BRN_NO	   =>G_BRN_NO,
						  P_Use_Vat	   =>G_Use_Vat,
						  P_SYS_NO	   =>80,
						  P_DOC_SER	   =>G_RT_BILL_SRL,
						  P_C_CODE	   =>M_CV.C_CODE,
						  P_TAX_BILL_TYP   =>G_TAX_BILL_TYP,
						  P_OFFLINE_VLDT   =>1,
						  P_DO_COMMIT	   =>0,
						  P_Tbl_Mst_Nm	   =>'IAS_POS_RT_BILL_MST',
						  P_Fld_Doc_Ser    =>'RT_BILL_SRL',
						  P_SAVE_TYP	   =>M_CV.SAVE_TYP,
						  P_COMMIT_FLG	   =>1,--G_COMMIT_FLG,
						  P_WEB_SRVC_UUID  =>G_DOC_UUID,
						  P_WRNNG_TXT	   =>V_WRNNG_TXT,
						  P_Msg_Txt	   =>V_Msg_Txt,
						  P_ERR_NO	   =>V_ERR_NO,
						  P_Pkg_NM	   =>V_Pkg_NM);
		    If	V_MSG_TXT Is Not Null Then--AND V_OFFLINE_VLDT=1 Then
			P_JSON_RSLT := '{"_Result": { "_Doc_No":"' || G_RT_BILL_NO || '","_Doc_Srl":"' || G_RT_BILL_SRL || '","_ErrMsg":"' || REPLACE(V_Msg_Txt,'"','') || '","_ErrNo":-31 } }';
			ROLLBACK;
			RAISE_APPLICATION_ERROR(-20031,'Err when SYNC_E_INVC for RT_Bill_no= '||G_RT_BILL_NO||' '||CHR(10)||V_Msg_Txt||' '||SQLERRM);
			RETURN;
		    ELSE
			COMMIT;
		    End If;
		    --##P_OFFLINE_VLDT=0  SYNC BILL
		     SYNC_E_INVC_PRC( P_DOC_TYPE       =>5,
						  P_BILL_TYPE	   =>M_CV.RT_BILL_TYPE,
						  P_BRN_NO	   =>G_BRN_NO,
						  P_Use_Vat	   =>G_Use_Vat,
						  P_SYS_NO	   =>80,
						  P_DOC_SER	   =>G_RT_BILL_SRL,
						  P_C_CODE	   =>M_CV.C_CODE,
						  P_TAX_BILL_TYP   =>G_TAX_BILL_TYP,
						  P_OFFLINE_VLDT   =>0,
						  P_DO_COMMIT	   =>0,
						  P_Tbl_Mst_Nm	   =>'IAS_POS_RT_BILL_MST',
						  P_Fld_Doc_Ser    =>'RT_BILL_SRL',
						  P_SAVE_TYP	   =>M_CV.SAVE_TYP,
						  P_COMMIT_FLG	   =>1,--G_COMMIT_FLG,
						  P_WEB_SRVC_UUID  =>G_DOC_UUID,
						  P_WRNNG_TXT	   =>V_WRNNG_TXT,
						  P_Msg_Txt	   =>V_Msg_Txt,
						  P_ERR_NO	   =>V_ERR_NO,
						  P_Pkg_NM	   =>V_Pkg_NM);
		    If	V_MSG_TXT Is Not Null Then--AND V_OFFLINE_VLDT=1 Then
		       NULL;
		    End If;
		END IF;
	    --##------------------------------------------------------------##--
		If V_MSG_TXT Is Null Then
		  COMMIT;
		End If;
		  --V_JSON_RSLT := '{"_Result": { "_Doc_No":"' || G_RT_BILL_NO || '","_Doc_Srl":"' || G_RT_BILL_SRL || '","_ErrMsg":"SUCCESSFUL","_ErrNo":0 } }';
		  V_JSON_RSLT := '{"_Result": { "_Doc_No":"' || G_RT_BILL_NO || '","_Doc_Srl":"' || G_RT_BILL_SRL || '","_ErrMsg":"SUCCESSFUL","_ErrNo":0,"_DOC_UUID":"@DOC_UUID","_WRNNG_TXT":"@WRNNG_TXT" } }';
		END IF;
	    END IF;
    --##--------------------------------------------------------------------------------------------------------##--
	If V_MSG_TXT Is Null Then
	  COMMIT;
	End If;
END LOOP; --(1)
V_JSON_RSLT:=REPLACE(V_JSON_RSLT,'@DOC_NO', G_RT_BILL_NO);
	V_JSON_RSLT:=REPLACE(V_JSON_RSLT,'@errno',0);
	V_JSON_RSLT:=REPLACE(V_JSON_RSLT,'@errmsg','The operation accomplished successfully.');
	V_JSON_RSLT:=REPLACE(V_JSON_RSLT, '@DOC_UUID', G_DOC_UUID);
	  V_WRNNG_TXT:=Replace( V_WRNNG_TXT,'"',' ');
	V_WRNNG_TXT:=Replace( V_WRNNG_TXT,':',' ');
	V_WRNNG_TXT:=Replace( V_WRNNG_TXT,',',' ');
	V_WRNNG_TXT:=Replace( V_WRNNG_TXT,'''',' ');
	V_JSON_RSLT:=REPLACE(V_JSON_RSLT, '@WRNNG_TXT', V_WRNNG_TXT);
	P_JSON_RSLT:=V_JSON_RSLT;
End EXTRCT_POS_RT_BILL_PRC;
--##-----------------------------------------------------------------------------------------------------##--
FUNCTION  GET_C_CODE_XML( P_DVC_SRL  In VARCHAR2
			 ,P_C_CODE IN CUSTOMER.C_CODE%TYPE DEFAULT NULL
			 ,P_LNG_NO IN NUMBER DEFAULT 1
			 ,P_Whr    IN VARCHAR2	DEFAULT NULL) RETURN CLOB IS
  V_CNT     NUMBER;
  V_SQL     VARCHAR2(4000);
  V_AR_AC_LINK_TYPE   NUMBER;
  QRY_CTX   DBMS_XMLGEN.CTXHANDLE;
  QRY_RSLT  CLOB;
BEGIN
IF P_DVC_SRL IS NOT NULL THEN
	    BEGIN
		SELECT AR_AC_LINK_TYPE INTO V_AR_AC_LINK_TYPE FROM IAS_PARA_AR;
	    EXCEPTION
	       WHEN OTHERS THEN
		   NULL;
	    END;
		V_SQL:='SELECT * FROM ( Select customer.c_code c_code,
		     Decode ('||P_LNG_NO||',1, Nvl (c_a_name, c_e_name),
			      Nvl (c_e_name, c_a_name)) c_name,
		     Decode ('||P_LNG_NO||',1, Nvl (c_group_a_name, c_group_e_name),
			      Nvl (c_group_e_name, c_group_a_name)) group_name,
		     customer.c_a_code a_code,
		     customer.Secret_Key Secret_Key,C_Tax_Code,ROWNUM ROW_NUM
		From customer,Customer_Group
		Where
		   customer.c_Group_Code = Customer_Group.c_Group_Code(+)
		   AND NVL(CUSTOMER.INACTIVE,0)=0
		   AND CUSTOMER.C_CODE=NVL('||''''||P_C_CODE||''''||', CUSTOMER.C_CODE)
		And (
		       ((('||V_AR_AC_LINK_TYPE||' = 1)
			And Exists (
				 Select 1
				   From Priv_Acc A_PRV,IAS_V_USR_PRIV_MACHINE_PRV M_PRV
				  Where A_PRV.U_Id =M_PRV.U_Id
				    And A_PRV.A_Code = customer.c_a_code
				    And Nvl(Add_Flag,0) = 1
				    And NVL(M_PRV.USED,0)=1
				    AND  M_PRV.MACHINE_NAME='''||P_DVC_SRL||'''
				    And RowNum <=1 ))
		Or (('||V_AR_AC_LINK_TYPE||' = 2)
			  And Exists (
				 Select 1
				   From Ias_Priv_customer A_PRV,IAS_V_USR_PRIV_MACHINE_PRV M_PRV
				  Where A_PRV.U_Id =M_PRV.U_Id
				    And c_code = customer.c_code
				    And Nvl(Add_Flag,0) = 1
				    And NVL(M_PRV.USED,0)=1
				    AND  M_PRV.MACHINE_NAME='''||P_DVC_SRL||'''
				    And RowNum <=1 ))))
		 )
	  WHERE 1=1 '||P_WHR;

      QRY_CTX :=DBMS_XMLGEN.NEWCONTEXT (V_SQL);
      DBMS_XMLGEN.SETNULLHANDLING(QRY_CTX,DBMS_XMLGEN.EMPTY_TAG);
      QRY_RSLT := DBMS_XMLGEN.GETXML(QRY_CTX);

   END IF;
RETURN QRY_RSLT;
EXCEPTION
WHEN OTHERS THEN
--RAISE_APPLICATION_ERROR(-20201,' Error When GET CUSTOMER Data. '|| CHR(13) || SQLERRM);
    RETURN '{"_Result": {"_ErrMsg":"Error When Get Customer Data ' || SQLERRM || '","_ErrNo":-104 } }';
END GET_C_CODE_XML;
--##-----------------------------------------------------------------------------------------------------##--
FUNCTION  GET_C_CODE_CUR_XML( P_DVC_SRL  In VARCHAR2
			     ,P_C_CODE IN CUSTOMER.C_CODE%TYPE DEFAULT NULL
			     ,P_LNG_NO IN NUMBER DEFAULT 1 ) RETURN CLOB IS
V_CNT	  NUMBER;
V_XML_TXT CLOB;
V_XML_TYP XMLTYPE;
V_LNG_NO  NUMBER;
V_SQL	  VARCHAR2(4000);
V_AR_AC_LINK_TYPE   NUMBER;
BEGIN
IF P_DVC_SRL IS NOT NULL THEN
	    BEGIN
		SELECT AR_AC_LINK_TYPE INTO V_AR_AC_LINK_TYPE FROM IAS_PARA_AR;
	    EXCEPTION
	       WHEN OTHERS THEN
		   NULL;
	    END;
		V_SQL:='Select customer.c_code,
		     Decode ('||P_LNG_NO||',1, Nvl (c_a_name, c_e_name),
			      Nvl (c_e_name, c_a_name)) c_name,
		     customer.c_a_code a_code,CUSTOMER_CURR.A_CY,
		     Decode ('||P_LNG_NO||',1, Nvl (c_group_a_name, c_group_e_name),
			      Nvl (c_group_e_name, c_group_a_name)) group_name,
		     customer.Secret_Key
		From customer,Customer_Group,CUSTOMER_CURR
		Where customer.C_CODE=CUSTOMER_CURR.C_CODE
		   AND customer.c_Group_Code = Customer_Group.c_Group_Code(+)
		   AND NVL(customer.BLK_LST,0)=0
		   AND NVL(CUSTOMER.INACTIVE,0)=0
		   AND NVL(CUSTOMER_CURR.INACTIVE,0)=0
		   AND CUSTOMER.C_CODE=NVL('||''''||P_C_CODE||''''||', CUSTOMER.C_CODE)
		And (
		       ((('||V_AR_AC_LINK_TYPE||' = 1)
			And Exists (
				 Select 1
				   From Priv_Acc A_PRV,IAS_V_USR_PRIV_MACHINE_PRV M_PRV
				  Where A_PRV.U_Id =M_PRV.U_Id
				    And A_PRV.A_Code = customer.c_a_code
				    And Nvl(Add_Flag,0) = 1
				    And NVL(M_PRV.USED,0)=1
				    AND  M_PRV.MACHINE_NAME='''||P_DVC_SRL||'''
				    And RowNum <=1 ))
		Or (('||V_AR_AC_LINK_TYPE||' = 2)
			  And Exists (
				 Select 1
				   From Ias_Priv_customer A_PRV,IAS_V_USR_PRIV_MACHINE_PRV M_PRV
				  Where A_PRV.U_Id =M_PRV.U_Id
				    And c_code = customer.c_code
				    And Nvl(Add_Flag,0) = 1
				    And NVL(M_PRV.USED,0)=1
				    AND  M_PRV.MACHINE_NAME='''||P_DVC_SRL||'''
				    And RowNum <=1 ))))
		ORDER BY CUSTOMER.C_CODE,CUSTOMER_CURR.A_CY';

V_XML_TXT:=DBMS_XMLGEN.GETXML(V_SQL);
IF V_XML_TXT IS NOT NULL THEN
   V_XML_TYP:=XMLTYPE.CREATEXML(V_XML_TXT);

	BEGIN
	    SELECT COUNT(*) INTO V_CNT FROM TABLE(XMLSEQUENCE(EXTRACT(V_XML_TYP,'/ROWSET/ROW') ))XMLDUMMAY;
	EXCEPTION
	WHEN OTHERS THEN
	    NULL;
	END;
	IF NVL(V_CNT,0)>1 THEN
	V_XML_TXT:=REPLACE(V_XML_TXT,'<ROW>','<CUSTOMER>');
	V_XML_TXT:=REPLACE(V_XML_TXT,'</ROW>','</CUSTOMER>');
	ELSIF  NVL(V_CNT,0)=1 THEN
	V_XML_TXT:=REPLACE(V_XML_TXT,'<ROW>','<ROWCUSTOMER>');
	V_XML_TXT:=REPLACE(V_XML_TXT,'</ROW>','</ROWCUSTOMER>');
	END IF;
END IF;
END IF;
RETURN V_XML_TXT;
EXCEPTION
WHEN OTHERS THEN
--RAISE_APPLICATION_ERROR(-20201,' Error When GET CUSTOMER Data. '|| CHR(13) || SQLERRM);
    RETURN '{"_Result": {"_ErrMsg":"Error When Get Customer Data CUR ' || SQLERRM || '","_ErrNo":-105 } }';
END GET_C_CODE_CUR_XML;
--##-----------------------------------------------------------------------------------------------------##--
FUNCTION  GET_C_CODE_CUR_PRV_XML( P_DVC_SRL  In VARCHAR2
				 ,P_C_CODE IN CUSTOMER.C_CODE%TYPE DEFAULT NULL
				 ,P_LNG_NO IN NUMBER DEFAULT 1
				 ,P_Whr    IN VARCHAR2	DEFAULT NULL) RETURN CLOB IS
  V_CNT     NUMBER;
  V_SQL     VARCHAR2(4000);
  QRY_CTX   DBMS_XMLGEN.CTXHANDLE;
  QRY_RSLT  CLOB;
BEGIN
  IF P_DVC_SRL IS NOT NULL THEN

		V_SQL:='SELECT * FROM (
		      SELECT IAS_PRIV_CUSTOMER.U_ID,CUSTOMER.C_CODE,
		     DECODE ('||P_LNG_NO||',1, NVL (C_A_NAME, C_E_NAME),
			      NVL (C_E_NAME, C_A_NAME)) C_NAME,
		     CUSTOMER.C_A_CODE A_CODE,CUSTOMER_CURR.A_CY,NVL(ADD_FLAG,0) ADD_FLAG,ROWNUM ROW_NUM
		FROM CUSTOMER,CUSTOMER_CURR,IAS_PRIV_CUSTOMER
		WHERE CUSTOMER.C_CODE=CUSTOMER_CURR.C_CODE
		   AND CUSTOMER.C_CODE=IAS_PRIV_CUSTOMER.C_CODE
		   AND CUSTOMER_CURR.C_CODE=IAS_PRIV_CUSTOMER.C_CODE
		   AND CUSTOMER_CURR.A_CY=IAS_PRIV_CUSTOMER.A_CY
		   AND NVL(CUSTOMER.BLK_LST,0)=0
		   AND NVL(CUSTOMER.INACTIVE,0)=0
		   AND NVL(CUSTOMER_CURR.INACTIVE,0)=0
		   AND NVL(IAS_PRIV_CUSTOMER.ADD_FLAG,0) = 1
		   AND CUSTOMER.C_CODE=NVL('||''''||P_C_CODE||''''||', CUSTOMER.C_CODE)
		   AND EXISTS(SELECT 1
		      FROM  IAS_V_USR_PRIV_MACHINE_PRV M_PRV
			 WHERE M_PRV.U_ID=Ias_Priv_customer.U_ID
			   AND NVL(M_PRV.USED,0)=1
			   AND	M_PRV.MACHINE_NAME='''||P_DVC_SRL||'''	AND ROWNUM<=1 )
		)
		WHERE 1=1 '||P_WHR;

      QRY_CTX :=DBMS_XMLGEN.NEWCONTEXT (V_SQL);
      DBMS_XMLGEN.SETNULLHANDLING(QRY_CTX,DBMS_XMLGEN.EMPTY_TAG);
      QRY_RSLT := DBMS_XMLGEN.GETXML(QRY_CTX);
   END IF;
  RETURN QRY_RSLT;
EXCEPTION
WHEN OTHERS THEN
--RAISE_APPLICATION_ERROR(-20201,' Error When GET CUSTOMER Data. '|| CHR(13) || SQLERRM);
    RETURN '{"_Result": {"_ErrMsg":"Error When Get Customer Data CUR PRV ' || SQLERRM || '","_ErrNo":-106 } }';
END GET_C_CODE_CUR_PRV_XML;
--##-----------------------------------------------------------------------------------------------------##--
PROCEDURE EXTRCT_CASH_CUSTMR_PRC(P_XML in	      CLOB,
				 P_JSON_RSLT	      OUT VARCHAR    )	IS
V_JSON_RSLT    VARCHAR2(4000);
V_XML_TYPE     XMLTYPE;
V_CUST_CODE    IAS_CASH_CUSTMR.CUST_CODE%TYPE;
V_Use_Vat      Number;
V_Cur_Code     VARCHAR2(1000);
V_Calc_Vat_Amt_Type   Number;

BEGIN
    V_JSON_RSLT:= '{"_Result": { "_Doc_No":@DOC_NO,"_ErrMsg": "@errmsg","_ErrNo": @errno } }';
    V_XML_TYPE :=XMLTYPE.CREATEXML ( P_XML);

    FOR M_CV IN
			(SELECT      EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CUST_CODE	       ') AS  CUST_CODE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CUST_L_NM	       ') AS  CUST_L_NM
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CUST_F_NM	       ') AS  CUST_F_NM
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/MOBILE_NO	       ') AS  MOBILE_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CUST_GRP_CODE	       ') AS  CUST_GRP_CODE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/POINT_TYP_NO	       ') AS  POINT_TYP_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/POINT_TYP_ACTV_DATE   ') AS  POINT_TYP_ACTV_DATE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CRD_NO_DISC	       ') AS  CRD_NO_DISC
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FIRST_DEAL_DATE       ') AS  FIRST_DEAL_DATE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/TEL_NO 	       ') AS  TEL_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FAX_NO 	       ') AS  FAX_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/PBOX		       ') AS  PBOX
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/E_MAIL 	       ') AS  E_MAIL
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/WEB_SITE	       ') AS  WEB_SITE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/R_CODE 	       ') AS  R_CODE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CITY_NO	       ') AS  CITY_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/REP_CODE	       ') AS  REP_CODE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/ADDRESS	       ') AS  ADDRESS
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BIRTH_DATE	       ') AS  BIRTH_DATE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/C_BOX_CODE	       ') AS  C_BOX_CODE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/C_TAX_CODE	       ') AS  C_TAX_CODE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CNTRY_NO	     ') AS  CNTRY_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BUILDING_NO		') AS  BUILDING_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/STREET 	   ') AS  STREET
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/ADD_NO 	   ') AS  ADD_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/PROV_NO	    ') AS  PROV_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FIELD1 	       ') AS  FIELD1
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FIELD2 	       ') AS  FIELD2
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FIELD3 	       ') AS  FIELD3
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FIELD4 	       ') AS  FIELD4
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FIELD5 	       ') AS  FIELD5
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BRN_NO 	       ') AS  BRN_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CMP_NO 	       ') AS  CMP_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/AD_U_ID	       ') AS  AD_U_ID
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/AD_DATE	       ') AS  AD_DATE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/AD_TRMNL_NM	       ') AS AD_TRMNL_NM
			FROM TABLE (XMLSEQUENCE (EXTRACT (V_XML_TYPE, '/IAS_CASH_CUSTMR'))) XMLMSTDMY)
      LOOP --(1)
	    V_CUST_CODE:=M_CV.CUST_CODE;
	    --------------------------------------------------------------------------------
	       IF M_CV.MOBILE_NO IS NULL THEN
		  ROLLBACK;
		  RAISE_APPLICATION_ERROR(-20904,'Error App MOBILE_NO IS NULL '||CHR(10)||SQLERRM) ;
	       END IF;
	  ---------------------------------------------------------------------------------
	       BEGIN		      --(2)
			     INSRT_IAS_CASH_CUSTMR( P_CUST_CODE 	   =>M_CV.CUST_CODE
						    ,P_CUST_L_NM	   =>M_CV.CUST_L_NM
						    ,P_CUST_F_NM	   =>M_CV.CUST_F_NM
						    ,P_MOBILE_NO	   =>M_CV.MOBILE_NO
						    ,P_CUST_GRP_CODE	   =>M_CV.CUST_GRP_CODE
						    ,P_POINT_TYP_NO	   =>M_CV.POINT_TYP_NO
						    ,P_POINT_TYP_ACTV_DATE =>M_CV.POINT_TYP_ACTV_DATE
						    ,P_CRD_NO_DISC	   =>M_CV.CRD_NO_DISC
						    ,P_FIRST_DEAL_DATE	   =>M_CV.FIRST_DEAL_DATE
						    ,P_TEL_NO		   =>M_CV.TEL_NO
						    ,P_FAX_NO		   =>M_CV.FAX_NO
						    ,P_PBOX		   =>M_CV.PBOX
						    ,P_E_MAIL		   =>M_CV.E_MAIL
						    ,P_WEB_SITE 	   =>M_CV.WEB_SITE
						    ,P_R_CODE		   =>M_CV.R_CODE
						    ,P_CITY_NO		   =>M_CV.CITY_NO
						    ,P_REP_CODE 	   =>M_CV.REP_CODE
						    ,P_ADDRESS		   =>M_CV.ADDRESS
						    ,P_BIRTH_DATE	   =>M_CV.BIRTH_DATE
						    ,P_C_BOX_CODE	   =>M_CV.C_BOX_CODE
						    ,P_C_TAX_CODE	   =>M_CV.C_TAX_CODE
						    ,P_CNTRY_NO 	   =>M_CV.CNTRY_NO
						    ,P_BUILDING_NO	   =>M_CV.BUILDING_NO
						    ,P_STREET		   =>M_CV.STREET
						    ,P_ADD_NO		   =>M_CV.ADD_NO
						    ,P_PROV_NO		   =>M_CV.PROV_NO
						    ,P_FIELD1		   =>M_CV.FIELD1
						    ,P_FIELD2		   =>M_CV.FIELD2
						    ,P_FIELD3		   =>M_CV.FIELD3
						    ,P_FIELD4		   =>M_CV.FIELD4
						    ,P_FIELD5		   =>M_CV.FIELD5
						    ,P_AD_U_ID		   =>M_CV.AD_U_ID
						    ,P_AD_DATE		   =>sysdate
						    ,P_CMP_NO		   =>M_CV.CMP_NO
						    ,P_BRN_NO		   =>M_CV.BRN_NO
						    ,P_AD_TRMNL_NM	   =>M_CV.AD_TRMNL_NM )  ;

	       EXCEPTION
	       WHEN OTHERS THEN
	       ROLLBACK;
		  RAISE_APPLICATION_ERROR(-20010,'Err when insert IAS_CASH_CUSTMER P_CUST_CODE= '||M_CV.CUST_CODE ||' '||CHR(10)||SQLERRM);
	       END; --(2)
    COMMIT;
 ----------------------------------------------------------------------------------------------------------
     END LOOP; --(1)
	V_JSON_RSLT:=REPLACE(V_JSON_RSLT,'@CUST_CODE', V_CUST_CODE);
	V_JSON_RSLT:=REPLACE(V_JSON_RSLT,'@errno',0);
	V_JSON_RSLT:=REPLACE(V_JSON_RSLT,'@errmsg','The operation accomplished successfully.');
	P_JSON_RSLT:=V_JSON_RSLT;

End EXTRCT_CASH_CUSTMR_PRC;
--##-----------------------------------------------------------------------------------------------------##--

FUNCTION  GET_CUST_CODE_XML(P_LNG_NO IN NUMBER DEFAULT 1
			   ,P_Whr    IN VARCHAR2  DEFAULT NULL) RETURN CLOB IS
  V_CNT     NUMBER;
  V_SQL     VARCHAR2(4000);
  QRY_CTX   DBMS_XMLGEN.CTXHANDLE;
  QRY_RSLT  CLOB;
BEGIN
	V_SQL:='SELECT * FROM(
	SELECT IAS_CASH_CUSTMR.CUST_code,
	Decode ('||P_LNG_NO||',1, CUST_L_NM,
	Nvl (CUST_F_NM, CUST_L_NM)) cust_name,
	CUST_GRP_CODE, MOBILE_NO, POINT_TYP_NO, POINT_TYP_ACTV_DATE, TEL_NO, FAX_NO, PBOX, E_MAIL,
	WEB_SITE, R_CODE, CITY_NO, REP_CODE, ADDRESS, BIRTH_DATE, FIRST_DEAL_DATE,C_BOX_CODE,FIELD1,FIELD2,FIELD3,FIELD4,FIELD5,FIELD6,FIELD7,FIELD8,FIELD9,FIELD10,
	INACTIVE,INACTIVE_RES,INACTIVE_DATE,BRN_NO,CMP_NO,AD_U_ID,AD_DATE,UP_U_ID,UP_DATE,PR_REP,UP_CNT,AD_TRMNL_NM,UP_TRMNL_NM,EXTERNAL_POST,C_CMPNY_NM,C_ACTVTY_TYP,
	C_ACTVTN_CODE,C_ACTVTN_FLG,CRD_NO_DISC,BLK_LST_DATE,BLK_LST_RES,BLK_LST,RGN_NO,CSTMR_BUILD_NO,CSTMR_FLOOR_NO,CSTMR_APRTMNT_NO,CNTRY_NO,PROV_NO,C_PWD,
	C_TAX_CODE, INACTIVE_U_ID, BUILDING_NO, STREET, DSTRCT_NM, ADD_NO, CR_NO, CSTMR_IDNTFR, SHRT_ADD, DRIVER_NO, C_GENDER,
	ROWNUM ROW_NUM
	From IAS_CASH_CUSTMR
	) WHERE 1=1 '||P_WHR;

     QRY_CTX :=DBMS_XMLGEN.NEWCONTEXT (V_SQL);
      DBMS_XMLGEN.SETNULLHANDLING(QRY_CTX,DBMS_XMLGEN.EMPTY_TAG);
      QRY_RSLT := DBMS_XMLGEN.GETXML(QRY_CTX);
      RETURN QRY_RSLT;
EXCEPTION
WHEN OTHERS THEN
RETURN NULL;
RAISE_APPLICATION_ERROR(-20201,' Error When GET CUSTOMER  CASH Data. '|| CHR(13) || SQLERRM);
END GET_CUST_CODE_XML;
--##-----------------------------------------------------------------------------------------------------##--
PROCEDURE INSRT_IAS_CASH_CUSTMR(P_CUST_CODE	    IN IAS_CASH_CUSTMR.CUST_CODE%TYPE
 ,P_CUST_L_NM		IN IAS_CASH_CUSTMR.CUST_L_NM%TYPE
 ,P_CUST_F_NM		IN IAS_CASH_CUSTMR.CUST_F_NM%TYPE DEFAULT NULL
 ,P_MOBILE_NO		IN IAS_CASH_CUSTMR.MOBILE_NO%TYPE
 ,P_CUST_GRP_CODE	IN IAS_CASH_CUSTMR.CUST_GRP_CODE%TYPE DEFAULT NULL
 ,P_POINT_TYP_NO	IN IAS_CASH_CUSTMR.POINT_TYP_NO%TYPE DEFAULT NULL
 ,P_POINT_TYP_ACTV_DATE IN IAS_CASH_CUSTMR.POINT_TYP_ACTV_DATE%TYPE DEFAULT NULL
 ,P_CRD_NO_DISC 	IN IAS_CASH_CUSTMR.CRD_NO_DISC%TYPE DEFAULT NULL
 ,P_FIRST_DEAL_DATE	IN IAS_CASH_CUSTMR.FIRST_DEAL_DATE%TYPE DEFAULT NULL
 ,P_TEL_NO		IN IAS_CASH_CUSTMR.TEL_NO%TYPE DEFAULT NULL
 ,P_FAX_NO		IN IAS_CASH_CUSTMR.FAX_NO%TYPE DEFAULT NULL
 ,P_PBOX		IN IAS_CASH_CUSTMR.PBOX%TYPE DEFAULT NULL
 ,P_E_MAIL		IN IAS_CASH_CUSTMR.E_MAIL%TYPE DEFAULT NULL
 ,P_WEB_SITE		IN IAS_CASH_CUSTMR.WEB_SITE%TYPE  DEFAULT NULL
 ,P_REP_CODE		IN IAS_CASH_CUSTMR.CITY_NO%TYPE DEFAULT NULL
 ,P_ADDRESS		IN IAS_CASH_CUSTMR.ADDRESS%TYPE DEFAULT NULL
 ,P_BIRTH_DATE		IN IAS_CASH_CUSTMR.BIRTH_DATE%TYPE  DEFAULT NULL
 ,P_C_BOX_CODE		IN IAS_CASH_CUSTMR.C_BOX_CODE%TYPE  DEFAULT NULL
 ,P_C_tax_code		IN IAS_CASH_CUSTMR.C_TAX_CODE%TYPE  DEFAULT NULL
 ,P_Cntry_no		IN IAS_CASH_CUSTMR.Cntry_no%TYPE    DEFAULT NULL
 ,P_City_no		IN IAS_CASH_CUSTMR.City_no%TYPE     DEFAULT NULL
 ,P_Building_no 	IN IAS_CASH_CUSTMR.Building_no%TYPE DEFAULT NULL
 ,P_Street		IN IAS_CASH_CUSTMR.Street%TYPE	    DEFAULT NULL
 ,P_Add_no		IN IAS_CASH_CUSTMR.Add_no%TYPE	    DEFAULT NULL
 ,P_Prov_No		IN IAS_CASH_CUSTMR.Prov_No%TYPE   DEFAULT NULL
 ,P_R_Code		IN IAS_CASH_CUSTMR.R_Code%TYPE	  DEFAULT NULL
 ,P_FIELD1		IN IAS_CASH_CUSTMR.FIELD1%TYPE	  DEFAULT NULL
 ,P_FIELD2		IN IAS_CASH_CUSTMR.FIELD2%TYPE	  DEFAULT NULL
 ,P_FIELD3		IN IAS_CASH_CUSTMR.FIELD3%TYPE	  DEFAULT NULL
 ,P_FIELD4		IN IAS_CASH_CUSTMR.FIELD4%TYPE	  DEFAULT NULL
 ,P_FIELD5		IN IAS_CASH_CUSTMR.FIELD5%TYPE	  DEFAULT NULL
 ,P_BRN_NO		IN IAS_CASH_CUSTMR.BRN_NO%TYPE
 ,P_CMP_NO		IN IAS_CASH_CUSTMR.CMP_NO%TYPE	  DEFAULT NULL
 ,P_AD_U_ID		IN IAS_CASH_CUSTMR.AD_U_ID%TYPE
 ,P_AD_DATE		IN IAS_CASH_CUSTMR.AD_DATE%TYPE
 ,P_AD_TRMNL_NM 	IN IAS_CASH_CUSTMR.AD_TRMNL_NM%TYPE   DEFAULT NULL
 ,P_LNG_NO IN NUMBER DEFAULT 1) IS
 V_CNT	NUMBER:=0;
 V_MSG_TXT  VARCHAR2(4000);
BEGIN
	IF P_CUST_CODE IS  NULL   THEN
	 RAISE_APPLICATION_ERROR(-20001,' CUST CODE Is Null , '||SQLERRM);
	ELSIF P_CUST_L_NM IS NULL THEN
	 RAISE_APPLICATION_ERROR(-20001,' CUSTMER NAME Is Null , '||SQLERRM);
	ELSIF P_MOBILE_NO IS NULL THEN
	 RAISE_APPLICATION_ERROR(-20001,' MOBILE NO Is Null , '||SQLERRM);
	END IF;

	BEGIN
	SELECT 1 INTO V_CNT
	FROM IAS_CASH_CUSTMR
	WHERE CUST_CODE = P_CUST_CODE
	AND  ROWNUM  <= 1 ;
	EXCEPTION
	WHEN NO_DATA_FOUND THEN
	V_CNT := 0 ;
	END ;
	IF  NVL(V_CNT,0) > 0 THEN
	  RAISE_APPLICATION_ERROR(-20006,'THIS CUSTMER CODE ALREADY EXISTS ,CUST_CODE = '||P_CUST_CODE ||'--'||CHR(10)||SQLERRM) ;
	END IF;
IF NVL(IAS_BRN_PKG.IS_BRN_USE_E_INVC(P_Brn_No =>P_Brn_No),0) = 1 THEN
  IF P_C_tax_code IS NULL THEN
      V_MSG_TXT := IAS_GEN_PKG.GET_MSG(P_LNG_NO => P_LNG_NO, P_MSG_NO => 1601)||' C_tax_code';
      RAISE_APPLICATION_ERROR(-20008,V_MSG_TXT||'--'||CHR(10)||SQLERRM) ;
  End If;
  IF P_Cntry_no IS NULL THEN
      V_MSG_TXT := IAS_GEN_PKG.GET_MSG(P_LNG_NO => P_LNG_NO, P_MSG_NO => 1601)||' Cntry_no';
      RAISE_APPLICATION_ERROR(-20008,V_MSG_TXT||'--'||CHR(10)||SQLERRM) ;
  End If;
  IF P_City_no IS NULL THEN
      V_MSG_TXT := IAS_GEN_PKG.GET_MSG(P_LNG_NO => P_LNG_NO, P_MSG_NO => 1601)||' City_no';
      RAISE_APPLICATION_ERROR(-20008,V_MSG_TXT||'--'||CHR(10)||SQLERRM) ;
  End If;
  IF P_Building_no IS NULL THEN
      V_MSG_TXT := IAS_GEN_PKG.GET_MSG(P_LNG_NO => P_LNG_NO, P_MSG_NO => 1601)||' Building_no';
      RAISE_APPLICATION_ERROR(-20008,V_MSG_TXT||'--'||CHR(10)||SQLERRM) ;
  End If;
  IF P_Street IS NULL THEN
      V_MSG_TXT := IAS_GEN_PKG.GET_MSG(P_LNG_NO => P_LNG_NO, P_MSG_NO => 1601)||' Street';
      RAISE_APPLICATION_ERROR(-20008,V_MSG_TXT||'--'||CHR(10)||SQLERRM) ;
  End If;
  IF P_Add_no IS NULL THEN
      V_MSG_TXT := IAS_GEN_PKG.GET_MSG(P_LNG_NO => P_LNG_NO, P_MSG_NO => 1601)||' Add_no';
      RAISE_APPLICATION_ERROR(-20008,V_MSG_TXT||'--'||CHR(10)||SQLERRM) ;
  End If;
  IF P_R_Code IS NULL THEN
      V_MSG_TXT := IAS_GEN_PKG.GET_MSG(P_LNG_NO => P_LNG_NO, P_MSG_NO => 1601)||' R_Code';
      RAISE_APPLICATION_ERROR(-20008,V_MSG_TXT||'--'||CHR(10)||SQLERRM) ;
  End If;
  IF P_Prov_No IS NULL THEN
      V_MSG_TXT := IAS_GEN_PKG.GET_MSG(P_LNG_NO => P_LNG_NO, P_MSG_NO => 1601)||' Prov_No';
      RAISE_APPLICATION_ERROR(-20008,V_MSG_TXT||'--'||CHR(10)||SQLERRM) ;
  End If;
End If;

BEGIN
SELECT 1 INTO V_CNT
FROM IAS_CASH_CUSTMR
WHERE MOBILE_NO = P_MOBILE_NO
AND  ROWNUM  <= 1 ;
EXCEPTION
WHEN NO_DATA_FOUND THEN
V_CNT := 0 ;
END ;
  IF  NVL(V_CNT,0) > 0 THEN
   RAISE_APPLICATION_ERROR(-20006,'THIS CUSTMER MOBILE NO ALREADY EXISTS ,MOBILE_NO = '||P_MOBILE_NO ||'--'||CHR(10)||SQLERRM) ;
  END IF;

INSERT INTO IAS_CASH_CUSTMR(CUST_CODE
		     ,CUST_L_NM
		     ,CUST_F_NM
		     ,MOBILE_NO
		     ,CUST_GRP_CODE
		     ,POINT_TYP_NO
		     ,POINT_TYP_ACTV_DATE
		     ,CRD_NO_DISC
		     ,FIRST_DEAL_DATE
		     ,TEL_NO
		     ,FAX_NO
		     ,PBOX
		     ,E_MAIL
		     ,WEB_SITE
		     ,R_CODE
		     ,CITY_NO
		     ,REP_CODE
		     ,ADDRESS
		     ,BIRTH_DATE
		     ,C_BOX_CODE
		     ,C_tax_code
		     ,Cntry_no
		     ,Building_no
		     ,Street
		     ,Add_no
		     ,Prov_No
		     ,FIELD1
		     ,FIELD2
		     ,FIELD3
		     ,FIELD4
		     ,FIELD5
		     ,BRN_NO
		     ,CMP_NO
		     ,AD_U_ID
		     ,AD_DATE
		     ,AD_TRMNL_NM  )
		    VALUES (P_CUST_CODE
		     ,P_CUST_L_NM
		     ,P_CUST_F_NM
		     ,P_MOBILE_NO
		     ,P_CUST_GRP_CODE
		     ,P_POINT_TYP_NO
		     ,P_POINT_TYP_ACTV_DATE
		     ,P_CRD_NO_DISC
		     ,P_FIRST_DEAL_DATE
		     ,P_TEL_NO
		     ,P_FAX_NO
		     ,P_PBOX
		     ,P_E_MAIL
		     ,P_WEB_SITE
		     ,P_R_CODE
		     ,P_CITY_NO
		     ,P_REP_CODE
		     ,P_ADDRESS
		     ,P_BIRTH_DATE
		     ,P_C_BOX_CODE
		     ,P_C_tax_code
		     ,P_Cntry_no
		     ,P_Building_no
		     ,P_Street
		     ,P_Add_no
		     ,P_Prov_No
		     ,P_FIELD1
		     ,P_FIELD2
		     ,P_FIELD3
		     ,P_FIELD4
		     ,P_FIELD5
		     ,P_BRN_NO
		     ,P_CMP_NO
		     ,P_AD_U_ID
		     ,P_AD_DATE
		     ,P_AD_TRMNL_NM);
EXCEPTION WHEN OTHERS THEN
ROLLBACK;
RAISE_APPLICATION_ERROR (-20012,'Error When Insert Into IAS_CASH_CUSTMR , '||CHR(10)||SQLERRM);
END INSRT_IAS_CASH_CUSTMR;
--##-----------------------------------------------------------------------------------------------------##--
FUNCTION  GET_PAY_TYPE_XML( P_DVC_SRL IN VARCHAR2
			   ,P_LNG_NO IN NUMBER DEFAULT 1) RETURN CLOB IS
   V_CNT     NUMBER;
   V_SQL     VARCHAR2(4000);
   QRY_CTX   DBMS_XMLGEN.CTXHANDLE;
   QRY_RSLT  CLOB;
 BEGIN
    IF P_DVC_SRL IS NOT NULL THEN
	V_SQL:='SELECT	D.U_ID,M.FLG_VALUE,M.FLG_DESC
		  FROM S_FLAGS M,S_FLAGS_PRIV D
		  WHERE  M.FLG_CODE =''PAY_TYPE_NAME_POS''
		   AND M.FLG_CODE =D.FLG_CODE
		   AND M.FLG_VALUE=D.FLG_VALUE
		   AND M.FLG_ST =1
		   AND M.LANG_NO ='||P_LNG_NO||'
		   AND EXISTS (SELECT 1 FROM IAS_V_USR_PRIV_MACHINE_PRV M_PRV
				 WHERE D.U_Id =M_PRV.U_Id
				   AND M_PRV.MACHINE_NAME='''||P_DVC_SRL||'''
				   AND NVL(M_PRV.USED,0)=1
				   AND RowNum<=1)
		   Order by D.U_ID,M.FLG_SR ';

      QRY_CTX :=DBMS_XMLGEN.NEWCONTEXT (V_SQL);
      DBMS_XMLGEN.SETNULLHANDLING(QRY_CTX,DBMS_XMLGEN.EMPTY_TAG);
      QRY_RSLT := DBMS_XMLGEN.GETXML(QRY_CTX);
    END IF;
   RETURN QRY_RSLT;

  EXCEPTION
     WHEN OTHERS THEN
	 RETURN NULL;
	 RAISE_APPLICATION_ERROR(-20201,' Error When GET PAY TYPE Data. '|| CHR(13) || SQLERRM);
 END GET_PAY_TYPE_XML;
 --##-----------------------------------------------------------------------------------------------------##--
--##-----------------------------------------------------------------------------------------------------##--
FUNCTION  GET_CARD_TYPES_XML(P_DVC_SRL In VARCHAR2,P_CR_CARD_TYPE IN NUMBER DEFAULT NULL,P_LNG_NO IN NUMBER DEFAULT 1) RETURN CLOB IS
    V_CNT     NUMBER;
    V_SQL     VARCHAR2(4000);
    QRY_CTX   DBMS_XMLGEN.CTXHANDLE;
    QRY_RSLT  CLOB;
    V_WHR     VARCHAR2(1000);
 BEGIN
   IF NVL(P_CR_CARD_TYPE,0)<>0 THEN
	    V_WHR := ' AND D.CR_CARD_TYPE='||P_CR_CARD_TYPE;
   END IF;
  V_SQL:='SELECT D.CR_CARD_NO,Decode ('||P_LNG_NO||',1, Nvl (D.CR_CARD_NAME, D.CR_CARD_E_NAME),
				Nvl (D.CR_CARD_E_NAME, D.CR_CARD_NAME)) CARD_NAME,
				D.BANK_AC, D.COMM_AC, D.COMM_PER,
				D.COMM_CALC_TYPE, D.DUE_PERIOD, D.CR_CARD_TYPE,
				D.MACHINE_NO_BANK, D.MACHINE_NO, D.W_CODE,
				D.ACODE_REC_LETTER, D.BANK_NO, D.AD_U_ID,D.MAX_COMM_AMT,A.Cr_card_type_code
				FROM CREDIT_CARD_TYPES D,IAS_POS_MACHINE M,Ias_cr_card_types A
				WHERE M.MACHINE_NO=D.MACHINE_NO AND A.Cr_card_type=d.Cr_card_type AND M.TERMINAL ='''||P_DVC_SRL||'''
				'||V_WHR||'
				ORDER BY D.CR_CARD_NO ';

      QRY_CTX :=DBMS_XMLGEN.NEWCONTEXT (V_SQL);
      DBMS_XMLGEN.SETNULLHANDLING(QRY_CTX,DBMS_XMLGEN.EMPTY_TAG);
      QRY_RSLT := DBMS_XMLGEN.GETXML(QRY_CTX);
      RETURN QRY_RSLT;

  EXCEPTION
     WHEN OTHERS THEN
	 RETURN NULL;
	 RAISE_APPLICATION_ERROR(-20201,' Error When GET CARD TYPES Data. '|| CHR(13) || SQLERRM);
END GET_CARD_TYPES_XML;
--##-----------------------------------------------------------------------------------------------------##--
FUNCTION GET_ITM_PRICE_XML (P_I_CODE  IN VARCHAR2 ,
			    P_ITM_UNT IN VARCHAR2 DEFAULT NULL ,
			    P_LVL_NO  IN NUMBER,
			    P_W_Code  IN NUMBER,
			    P_BRN_NO  IN NUMBER,
			    P_LNG_NO  IN NUMBER DEFAULT 1,
			    P_clc_typ_no_tax In Number Default Null,
			    P_calc_vat_amt_type In Number Default 1,
			    P_Use_price_include_vat In Number Default 0,
			    P_Get_All_Unt  In Number Default null) RETURN CLOB	IS
	V_pos_pricing_type NUMBER;
	V_price_level	   NUMBER;
	V_price_type	   NUMBER;
	V_I_PRICE	   NUMBER;
	V_I_CODE	   IAS_ITM_MST.I_CODE%TYPE;
	V_ITM_UNT	   IAS_ITM_DTL.ITM_UNT%TYPE;
	V_XML_TXT	   CLOB;
	V_XML_TYP	   XMLTYPE;
	V_CNT		   NUMBER;
	V_SQL		   VARCHAR2(4000);
	V_No_Of_Decimal_Ar NUMBER;
	V_Use_price_include_vat  NUMBER;
	V_clc_vat_amt_type	Number;
BEGIN
      BEGIN
      SELECT POS_PRICING_TYPE,PRICE_LEVEL,PRICE_TYPE,NVL(IAS_PARA_AR.NO_OF_DECIMAL_AR,2),IAS_PARA_GEN.USE_PRICE_INCLUDE_VAT,Calc_Vat_Amt_Type
	    INTO V_POS_PRICING_TYPE,V_PRICE_LEVEL,V_PRICE_TYPE ,V_NO_OF_DECIMAL_AR,V_USE_PRICE_INCLUDE_VAT,V_clc_vat_amt_type
	 FROM IAS_PARA_POS,IAS_PARA_INV,IAS_PARA_AR,IAS_PARA_GEN;
	EXCEPTION WHEN OTHERS THEN
	    NULL;
	END;
	IF NVL(V_NO_OF_DECIMAL_AR ,0)=0 THEN
	V_NO_OF_DECIMAL_AR:=3;
	END IF;
	IF P_LVL_NO IS NOT NULL THEN
	    V_price_level:=P_LVL_NO;
	END IF;
	Ias_Itm_Pkg.Get_I_code ( P_Barcode => P_I_CODE,
				 P_I_Code  => V_I_code ,
				 P_Itm_Unt => V_ITM_UNT );
	IF V_I_CODE IS NULL THEN
	   V_I_CODE:=P_I_CODE;
	      IF NVL(P_GET_ALL_UNT,0)=0 THEN
		V_ITM_UNT:=IAS_ITM_PKG.GET_ICODE_SALES_UNIT(P_I_CODE =>P_I_CODE);
		 IF V_ITM_UNT IS NULL THEN
		  V_ITM_UNT:=IAS_ITM_PKG.GET_ICODE_MIN_UNIT(P_I_CODE =>P_I_CODE);
		 END IF;
	      END IF;
	ELSE
	  IF P_GET_ALL_UNT=1 THEN
	     V_ITM_UNT:='';
	  END IF;
	END IF;
	IF V_ITM_UNT IS NULL THEN
	    V_ITM_UNT:=P_ITM_UNT;
	END IF;
	DBMS_SESSION.SET_CONTEXT('POS23_GNR_CNTXT','W_CODE',P_W_CODE);
       V_SQL:='Select I_code,
		     Decode('||P_LNG_NO||' ,1,I_Name,Nvl(I_E_Name,I_Name)) I_name,
		     Nvl(I_desc,'' '') I_Desc,
		     Itm_unt,
		     P_size,
		     A_cy,
		     NVL(I_Img,'' '') I_Img,
		     YS_TAX_PKG.GET_ITM_TAX_PRCNT ( P_CLC_TYP_NO =>'''||P_clc_typ_no_tax||''' , P_I_CODE =>I_CODE) VAT_PER,
		     ROUND(I_price_orgnl,'''||V_No_Of_Decimal_Ar||''') I_price_orgnl ,
		     ROUND(I_price_orgnl,'''||V_No_Of_Decimal_Ar||''') I_price_Lvl ,
		     ROUND(Decode('''||V_Use_price_include_vat||''',0,I_price_orgnl,I_price_orgnl /((Nvl(YS_TAX_PKG.GET_ITM_TAX_PRCNT ( P_CLC_TYP_NO =>'''||P_clc_typ_no_tax||''' , P_I_CODE =>I_CODE),0)/100)+1)  ),'''||V_No_Of_Decimal_Ar||''') I_price_lvl_no_vat,
		     ROUND(I_price_prm,'''||V_No_Of_Decimal_Ar||''') I_price_prm,
		     ROUND(Decode('''||V_Use_price_include_vat||''',0,I_price,I_price /((Nvl(YS_TAX_PKG.GET_ITM_TAX_PRCNT ( P_CLC_TYP_NO =>'''||P_clc_typ_no_tax||''' , P_I_CODE =>I_CODE),0)/100)+1)  ),'''||V_No_Of_Decimal_Ar||''') I_price,
		     ROUND(Decode('''||V_clc_vat_amt_type||''',1,Nvl(Decode('''||V_Use_price_include_vat||''',0,I_price_orgnl,I_price_orgnl /((Nvl(YS_TAX_PKG.GET_ITM_TAX_PRCNT ( P_CLC_TYP_NO =>'''||P_clc_typ_no_tax||''' , P_I_CODE =>I_CODE),0)/100)+1)  ),0)*YS_TAX_PKG.GET_ITM_TAX_PRCNT ( P_CLC_TYP_NO =>'''||P_clc_typ_no_tax||''' , P_I_CODE =>I_CODE)/100,
			     (Nvl(Decode('''||V_Use_price_include_vat||''',0,I_price_orgnl,I_price_orgnl /((Nvl(YS_TAX_PKG.GET_ITM_TAX_PRCNT ( P_CLC_TYP_NO =>'''||P_clc_typ_no_tax||''' , P_I_CODE =>I_CODE),0)/100)+1)  ),0)-Nvl(Decode('''||V_Use_price_include_vat||''',0,Disc_amt,Disc_amt /((Nvl(YS_TAX_PKG.GET_ITM_TAX_PRCNT ( P_CLC_TYP_NO =>'''||P_clc_typ_no_tax||''' , P_I_CODE =>I_CODE),0)/100)+1)  ),0) ) *YS_TAX_PKG.GET_ITM_TAX_PRCNT ( P_CLC_TYP_NO =>'''||P_clc_typ_no_tax||''' , P_I_CODE =>I_CODE)/100),'''||V_No_Of_Decimal_Ar||''') Vat_Amt,
		     ROUND(Decode('''||V_clc_vat_amt_type||''',1,Nvl(Decode('''||V_Use_price_include_vat||''',0,I_price,I_price /((Nvl(YS_TAX_PKG.GET_ITM_TAX_PRCNT ( P_CLC_TYP_NO =>'''||P_clc_typ_no_tax||''' , P_I_CODE =>I_CODE),0)/100)+1)  ),0)*YS_TAX_PKG.GET_ITM_TAX_PRCNT ( P_CLC_TYP_NO =>'''||P_clc_typ_no_tax||''' , P_I_CODE =>I_CODE)/100,
			     (Nvl(Decode('''||V_Use_price_include_vat||''',0,I_price,I_price /((Nvl(YS_TAX_PKG.GET_ITM_TAX_PRCNT ( P_CLC_TYP_NO =>'''||P_clc_typ_no_tax||''' , P_I_CODE =>I_CODE),0)/100)+1)  ),0)-Nvl(Decode('''||V_Use_price_include_vat||''',0,Disc_amt,Disc_amt /((Nvl(YS_TAX_PKG.GET_ITM_TAX_PRCNT ( P_CLC_TYP_NO =>'''||P_clc_typ_no_tax||''' , P_I_CODE =>I_CODE),0)/100)+1)  ),0) ) *YS_TAX_PKG.GET_ITM_TAX_PRCNT ( P_CLC_TYP_NO =>'''||P_clc_typ_no_tax||''' , P_I_CODE =>I_CODE)/100),'''||V_No_Of_Decimal_Ar||''') Vat_Amt_i_price,
			      ROUND(Decode('''||V_clc_vat_amt_type||''',2
		     ,(Disc_amt /((Nvl(YS_TAX_PKG.GET_ITM_TAX_PRCNT ( P_CLC_TYP_NO =>'''||P_clc_typ_no_tax||''' , P_I_CODE =>I_CODE),0)/100)+1)*YS_TAX_PKG.GET_ITM_TAX_PRCNT ( P_CLC_TYP_NO =>'''||P_clc_typ_no_tax||''' , P_I_CODE =>I_CODE)/100)
		     ,0),8)   Vat_Amt_Disc
	From IAS_ITM_DATA_VW
	WHERE Lev_No='||V_PRICE_LEVEL||'
	   AND I_CODE='||''''||V_I_Code||''''||'
	   AND ITM_UNT=NVL('||''''||V_ITM_UNT||''''||',ITM_UNT)
	   AND Decode('||V_Price_Type||',2,W_Code,5,Brn_No,1)= Decode('||V_Price_Type||',2,'||P_W_code||',5,'||P_Brn_No||',1) ';
	 V_XML_TXT:=DBMS_XMLGEN.GETXML(V_SQL);
    IF V_XML_TXT IS NOT NULL THEN
	   V_XML_TYP:=XMLTYPE.CREATEXML(V_XML_TXT);
	BEGIN
	   SELECT COUNT(*) INTO V_CNT FROM TABLE(XMLSEQUENCE(EXTRACT(V_XML_TYP,'/ROWSET/ROW') ))XMLDUMMAY;
	EXCEPTION  WHEN OTHERS THEN
	   NULL;
	END;
	IF NVL(V_CNT,0)>1 THEN
	  V_XML_TXT:=REPLACE(V_XML_TXT,'<ROW>','<ITMPRICE>');
	  V_XML_TXT:=REPLACE(V_XML_TXT,'</ROW>','</ITMPRICE>');
	ELSIF  NVL(V_CNT,0)=1 THEN
	  V_XML_TXT:=REPLACE(V_XML_TXT,'<ROW>','<ROWITMPRICE>');
	  V_XML_TXT:=REPLACE(V_XML_TXT,'</ROW>','</ROWITMPRICE>');
	END IF;
    END IF;
    RETURN V_XML_TXT;
END GET_ITM_PRICE_XML;
--##------------------------------------------------------------------------------------------------------------------------------##--
FUNCTION GET_ITM_DATA_XML(P_LVL_NO  IN NUMBER,
			 P_W_Code   IN NUMBER,
			 P_BRN_NO   IN NUMBER,
			 P_SRCH_TYP IN NUMBER DEFAULT 2,
			 P_SRCH_VAL IN VARCHAR2 DEFAULT NULL,
			 P_WHR	    IN VARCHAR2 DEFAULT NULL,
			 P_I_CODE   IN VARCHAR2 DEFAULT NULL,
			 P_ITM_UNT  IN VARCHAR2 DEFAULT NULL,
			 P_Get_All_Unt IN NUMBER Default null ) RETURN CLOB  IS

	V_I_CODE	   IAS_ITM_MST.I_CODE%TYPE;
	V_ITM_UNT	   IAS_ITM_DTL.ITM_UNT%TYPE;
	V_XML_TXT	   CLOB;
	V_XML_TYP	   XMLTYPE;
	V_CNT		   NUMBER;
	V_price_level	   NUMBER;
	V_POS_PRICING_TYPE NUMBER;
	V_PRICE_TYPE	   NUMBER;
	V_SRCH_VAL	   VARCHAR2(400);
	V_SRCH_ITM_UNT	   IAS_ITM_DTL.ITM_UNT%TYPE;
	V_SQL		   VARCHAR2(4000);
BEGIN
       BEGIN
	  SELECT POS_PRICING_TYPE,PRICE_LEVEL,PRICE_TYPE
	    INTO V_POS_PRICING_TYPE,V_PRICE_LEVEL,V_PRICE_TYPE
	 FROM IAS_PARA_POS,IAS_PARA_INV,IAS_PARA_AR;
	EXCEPTION WHEN OTHERS THEN
	    NULL;
	END;
	IF P_LVL_NO IS NOT NULL THEN
	    V_price_level:=P_LVL_NO;
	END IF;
	IF P_I_CODE IS NOT NULL THEN
	 Ias_Itm_Pkg.Get_I_code(P_Barcode => P_I_CODE,
				P_I_Code  => V_I_code ,
				P_Itm_Unt => V_ITM_UNT );

		IF V_I_CODE IS NULL THEN
		   V_I_CODE:=P_I_CODE;
		      IF NVL(P_GET_ALL_UNT,0)=0 THEN
			V_ITM_UNT:=IAS_ITM_PKG.GET_ICODE_SALES_UNIT(P_I_CODE =>P_I_CODE);
			 IF V_ITM_UNT IS NULL THEN
			  V_ITM_UNT:=IAS_ITM_PKG.GET_ICODE_MIN_UNIT(P_I_CODE =>P_I_CODE);
			 END IF;
		      END IF;
		ELSE
		  IF P_GET_ALL_UNT=1 THEN
		     V_ITM_UNT:='';
		  END IF;
		END IF;
		IF V_ITM_UNT IS NULL THEN
		    V_ITM_UNT:=P_ITM_UNT;
		END IF;
	 END IF;
	 V_SRCH_VAL:='';
	 If P_SRCH_TYP in(1,2) and P_SRCH_VAL Is Not Null Then
	     Ias_Itm_Pkg.Get_I_code(P_Barcode => P_SRCH_VAL,
				    P_I_Code  => V_SRCH_VAL ,
				    P_Itm_Unt => V_SRCH_ITM_UNT );

	 End If;
	 IF V_SRCH_VAL Is Null Then
	    V_SRCH_VAL:=P_SRCH_VAL;
	 End If;
	 DBMS_SESSION.SET_CONTEXT('POS23_GNR_CNTXT','W_CODE',P_W_CODE);
       V_SQL:='Select I_code,
		     I_Name,
		     Nvl(I_E_Name,'' '') I_E_Name,
		     Itm_unt,
		     P_size,
		     A_cy,
		     NVL(I_Img,'' '') I_Img,
		     I_price_orgnl  I_price_lvl
	From IAS_ITM_DATA_VW
	WHERE Lev_No='||V_PRICE_LEVEL||'
	   AND I_CODE=NVL('||''''||V_I_Code||''''||',I_CODE)
	   AND Decode('||V_Price_Type||',2,W_Code,5,Brn_No,1)= Decode('||V_Price_Type||',2,'||P_W_code||',5,'||P_Brn_No||',1)
	   And Decode('||P_SRCH_TYP||',
		2,upper(I_Code||I_Name||I_E_Name),
		3,upper(I_Name||I_Desc||I_E_Name),
		I_Code) Like
	    Decode('||''''||V_SRCH_VAL||''''||',
		   Null, ''%'',
		   ''%''|| Decode('||P_SRCH_TYP||',2,Replace('||''''||V_SRCH_VAL||''''||','' '',''%''),'||''''||V_SRCH_VAL||''''||') || ''%'')
		    ';
	 V_XML_TXT:=DBMS_XMLGEN.GETXML(V_SQL);
    IF V_XML_TXT IS NOT NULL THEN
	   V_XML_TYP:=XMLTYPE.CREATEXML(V_XML_TXT);
	BEGIN
	   SELECT COUNT(*) INTO V_CNT FROM TABLE(XMLSEQUENCE(EXTRACT(V_XML_TYP,'/ROWSET/ROW') ))XMLDUMMAY;
	EXCEPTION  WHEN OTHERS THEN
	   NULL;
	END;
	IF NVL(V_CNT,0)>1 THEN
	  V_XML_TXT:=REPLACE(V_XML_TXT,'<ROW>','<ITMPRICE>');
	  V_XML_TXT:=REPLACE(V_XML_TXT,'</ROW>','</ITMPRICE>');
	ELSIF  NVL(V_CNT,0)=1 THEN
	  V_XML_TXT:=REPLACE(V_XML_TXT,'<ROW>','<ROWITMPRICE>');
	  V_XML_TXT:=REPLACE(V_XML_TXT,'</ROW>','</ROWITMPRICE>');
	END IF;
    END IF;
    RETURN V_XML_TXT;
END GET_ITM_DATA_XML;
--##------------------------------------------------------------------------------------------------------------------------------##--
FUNCTION GET_CSTMR_POINT_BLNC (P_Cust_Code	    In Ias_Cash_Custmr.Cust_Code%Type Default Null,
			       P_Point_Typ_No	    In Ias_Point_Typ_Mst.Point_Typ_No%Type Default Null,
			       P_Db_Link	    In Varchar2 Default Null,
			       P_Lng_No 	    In	Number	default 1 ) RETURN CLOB  IS
 V_XML_TXT	      CLOB;
 V_XML_TYP	      XMLTYPE;
 V_CNT		      NUMBER;
 V_Point_Aprvd_By_Day NUMBER;
 VDb_Link	      VARCHAR2(100);
 V_SQL		      VARCHAR2(4000);
 V_Point_Blnc	      NUMBER;
BEGIN
	BEGIN
	  SELECT Point_Aprvd_By_Day
	    INTO V_Point_Aprvd_By_Day
	 FROM IAS_PARA_AR;
	EXCEPTION WHEN OTHERS THEN
	    NULL;
	END;
	IF V_Point_Aprvd_By_Day IS NULL THEN
	    V_Point_Aprvd_By_Day:=0;
	END IF;
	IF NVL(CHECK_DB_SRVR_TYP_FNC,0)=0 Then
	   VDB_LINK:='';
	ELSE
	    IF P_DB_LINK IS NULL THEN
	      VDb_Link:='ONYX.ONYX.COM';
	    ELSE
	      VDB_LINK:=P_DB_LINK;
	    END IF;
	END IF;
      IF P_Cust_Code IS NOT NULL THEN
       V_SQL:=' Select Cust_Code,
		       Decode('||P_Lng_No||',1,Cust_L_Nm,Nvl(Cust_F_Nm,Cust_L_Nm))  Cust_Nm,
		       '||P_Point_Typ_No||' Point_Typ_No,
			NVL(Pos_Point_Pkg.Get_Cust_Point_bal(P_Cust_Code    =>'||''''||P_Cust_Code||''''||',
						 P_Point_Typ_No =>'||P_Point_Typ_No||',
						 P_Db_Link	=>'||''''||VDb_Link||''''||',
						 P_Point_Aprvd_By_Day=>'||V_Point_Aprvd_By_Day||',
						 P_Lng_No   =>'||P_Lng_No||'),0) Point_Blnc
		 From Ias_Cash_Custmr
		Where Cust_Code='||''''||P_Cust_Code||''''||'
		    ';
      ELSE
	 V_SQL:=' Select Cust_Code,
		       Decode('||P_Lng_No||',1,Cust_L_Nm,Nvl(Cust_F_Nm,Cust_L_Nm))  Cust_Nm,
		       NVL('||''''||P_Point_Typ_No||''''||',POINT_TYP_NO) Point_Typ_No,
			NVL(Pos_Point_Pkg.Get_Cust_Point_bal(P_Cust_Code    =>Cust_Code,
						 P_Point_Typ_No =>NVL('||''''||P_Point_Typ_No||''''||',
						 P_Db_Link	=>'||''''||VDb_Link||''''||',
						 P_Point_Aprvd_By_Day=>'||V_Point_Aprvd_By_Day||',
						 P_Lng_No   =>'||P_Lng_No||'),0) Point_Blnc
		 From Ias_Cash_Custmr
		    ';
      END IF;
	 V_XML_TXT:=DBMS_XMLGEN.GETXML(V_SQL);
    IF V_XML_TXT IS NOT NULL THEN
	   V_XML_TYP:=XMLTYPE.CREATEXML(V_XML_TXT);
	BEGIN
	   SELECT COUNT(*) INTO V_CNT FROM TABLE(XMLSEQUENCE(EXTRACT(V_XML_TYP,'/ROWSET/ROW') ))XMLDUMMAY;
	EXCEPTION  WHEN OTHERS THEN
	   NULL;
	END;
	IF NVL(V_CNT,0)>1 THEN
	  V_XML_TXT:=REPLACE(V_XML_TXT,'<ROW>','<POINTBLNC>');
	  V_XML_TXT:=REPLACE(V_XML_TXT,'</ROW>','</POINTBLNC>');
	ELSIF  NVL(V_CNT,0)=1 THEN
	  V_XML_TXT:=REPLACE(V_XML_TXT,'<ROW>','<ROWPOINTBLNC>');
	  V_XML_TXT:=REPLACE(V_XML_TXT,'</ROW>','</ROWPOINTBLNC>');
	END IF;
    END IF;
    RETURN V_XML_TXT;
END GET_CSTMR_POINT_BLNC;
--##------------------------------------------------------------------------------------------------------------------------------##--
FUNCTION GET_ALL_CSTMR_POINT_BLNC (P_Point_Typ_No     In Ias_Point_Typ_Mst.Point_Typ_No%Type Default Null,
				   P_Db_Link	      In Varchar2 Default Null,
				   P_Lng_No	      In  Number  default 1 ) RETURN CLOB  IS
     V_XML_TXT		  CLOB;
     V_XML_TYP		  XMLTYPE;
     V_CNT		  NUMBER;
     V_Point_Aprvd_By_Day NUMBER;
     VDb_Link		  VARCHAR2(100);
     V_SQL		  VARCHAR2(4000);
     V_Point_Blnc	  NUMBER;
BEGIN
	BEGIN
	  SELECT Point_Aprvd_By_Day
	    INTO V_Point_Aprvd_By_Day
	 FROM IAS_PARA_AR;
	EXCEPTION WHEN OTHERS THEN
	    NULL;
	END;
	IF NVL(CHECK_DB_SRVR_TYP_FNC,0)=0 Then
	   VDB_LINK:='';
	ELSE
	    IF P_DB_LINK IS NULL THEN
	      VDb_Link:='ONYX.ONYX.COM';
	    ELSE
	      VDB_LINK:=P_DB_LINK;
	    END IF;
	END IF;
       V_SQL:=' Select Cust_Code,
		       Decode('||P_Lng_No||',1,Cust_L_Nm,Nvl(Cust_F_Nm,Cust_L_Nm))  Cust_Nm,
		       '||P_Point_Typ_No||' Point_Typ_No,
			NVL(Pos_Point_Pkg.Get_Cust_Point_bal(P_Cust_Code    =>Cust_Code,
						 P_Point_Typ_No =>'||P_Point_Typ_No||',
						 P_Db_Link	=>'||''''||VDb_Link||''''||',
						 P_Point_Aprvd_By_Day=>'||V_Point_Aprvd_By_Day||',
						 P_Lng_No   =>'||P_Lng_No||'),0) Point_Blnc
		 From Ias_Cash_Custmr
		    ';
	 V_XML_TXT:=DBMS_XMLGEN.GETXML(V_SQL);
    IF V_XML_TXT IS NOT NULL THEN
	   V_XML_TYP:=XMLTYPE.CREATEXML(V_XML_TXT);
	BEGIN
	   SELECT COUNT(*) INTO V_CNT FROM TABLE(XMLSEQUENCE(EXTRACT(V_XML_TYP,'/ROWSET/ROW') ))XMLDUMMAY;
	EXCEPTION  WHEN OTHERS THEN
	   NULL;
	END;
	IF NVL(V_CNT,0)>1 THEN
	  V_XML_TXT:=REPLACE(V_XML_TXT,'<ROW>','<POINTBLNC>');
	  V_XML_TXT:=REPLACE(V_XML_TXT,'</ROW>','</POINTBLNC>');
	ELSIF  NVL(V_CNT,0)=1 THEN
	  V_XML_TXT:=REPLACE(V_XML_TXT,'<ROW>','<ROWPOINTBLNC>');
	  V_XML_TXT:=REPLACE(V_XML_TXT,'</ROW>','</ROWPOINTBLNC>');
	END IF;
    END IF;
    RETURN V_XML_TXT;
END GET_ALL_CSTMR_POINT_BLNC;
--##------------------------------------------------------------------------------------------------------------------------------##--
    FUNCTION  GET_QUT_PRM_PRICE_DIS_XML (P_I_CODE  IN VARCHAR2,
					 P_ITM_UNT IN VARCHAR2,
					 P_W_Code  IN NUMBER ) RETURN CLOB  IS
    V_CNT     NUMBER;
    V_XML_TXT CLOB;
    V_XML_TYP XMLTYPE;
    V_LNG_NO  NUMBER;
    V_SQL     VARCHAR2(4000);
    BEGIN
	V_SQL:='SELECT NVL(D.I_PRICE,0) I_PRICE,
			DECODE(D.DISC_TYPE,1,D.DISC_AMT_PER,0) DISC_PER ,
			DECODE(D.DISC_TYPE,2,D.DISC_AMT_PER,0) DISC_AMT ,
			M.QUOT_CUR,
			M.QT_PRM_METHOD,
			M.QT_PRM_TYPE,
			M.QUOT_NO,
			M.QUOT_SER
	From Ias_Qut_Prm_Mst M,Ias_Qut_Prm_Dtl D
	Where  M.Quot_Ser = D.Quot_Ser
	AND D.I_CODE='||''''||P_I_Code||''''||'
	AND D.ITM_UNT=NVL('||''''||P_ITM_UNT||''''||',D.ITM_UNT)
	And M.Qt_Prm_Type=1 and M.QT_PRM_METHOD IN(1,2) And ( Nvl(M.By_Comp_Qty,0)=0 Or Nvl(D.COMP_QTY,0) In (0,1) )
	And Nvl(M.Inactive,0)=0 And Nvl(M.Qt_prm_cst_type,0)=0 And Nvl(M.APPROVED,0)=1 and Nvl(M.USE_QTN_PRM_IN_POS_SYS_FLG,0)=1
	And TO_DATE(SYSDATE,''DD/MM/YYYY'') Between  TO_DATE(M.F_Date,''DD/MM/YYYY'') And  TO_DATE(M.T_Date,''DD/MM/YYYY'')
	And To_Char(To_Date(SYSDATE),''D'') In (M.Fld_Day1,M.Fld_Day2,M.Fld_Day3,M.Fld_Day4,M.Fld_Day5,M.Fld_Day6,M.Fld_Day7)
	And To_Char(Ias_gen_Pkg.Get_Curdate,''HH24:MI:SS'') >= Nvl(M.F_Time,To_Char(Ias_gen_Pkg.Get_Curdate,''HH24:MI:SS''))
	And To_Char(Ias_gen_Pkg.Get_Curdate,''HH24:MI:SS'') <= Nvl(M.T_Time,To_Char(Ias_gen_Pkg.Get_Curdate,''HH24:MI:SS''))
	And (Case
		When M.Qt_Prm_Wc_Type=0 Then 1
		When M.Qt_Prm_Wc_Type=1 And D.W_Code   = '||P_W_Code||'  Then 1
		When M.Qt_Prm_Wc_Type=2 And D.Whg_Code =(Select Whg_Code From Warehouse_Details Where W_Code='||P_W_Code||' And RowNum<=1) Then 1
		When M.Qt_Prm_Wc_Type=3 And D.Cntry_No =(Select Cntry_No From Warehouse_Details Where W_Code='||P_W_Code||' And RowNum<=1) Then 1
		When M.Qt_Prm_Wc_Type=4 And D.Prov_No  =(Select Prov_No  From Warehouse_Details Where W_Code='||P_W_Code||' And RowNum<=1) Then 1
		When M.Qt_Prm_Wc_Type=5 And D.City_No  =(Select City_No  From Warehouse_Details Where W_Code='||P_W_Code||' And RowNum<=1) Then 1
		When M.Qt_Prm_Wc_Type=6 And D.R_Code   =(Select R_Code	 From Warehouse_Details Where W_Code='||P_W_Code||' And RowNum<=1) Then 1
		Else 0 End)=1
	And RowNum <=1 ';
	V_XML_TXT:=DBMS_XMLGEN.GETXML(V_SQL);
	IF V_XML_TXT IS NOT NULL THEN
	V_XML_TYP:=XMLTYPE.CREATEXML(V_XML_TXT);
	BEGIN
	SELECT COUNT(*) INTO V_CNT FROM TABLE(XMLSEQUENCE(EXTRACT(V_XML_TYP,'/ROWSET/ROW') ))XMLDUMMAY;
	EXCEPTION
	WHEN OTHERS THEN
	NULL;
	END;
	IF NVL(V_CNT,0)>1 THEN
	V_XML_TXT:=REPLACE(V_XML_TXT,'<ROW>','<QUTPRM>');
	V_XML_TXT:=REPLACE(V_XML_TXT,'</ROW>','</QUTPRM>');
	ELSIF  NVL(V_CNT,0)=1 THEN
	V_XML_TXT:=REPLACE(V_XML_TXT,'<ROW>','<ROWQUTPRM>');
	V_XML_TXT:=REPLACE(V_XML_TXT,'</ROW>','</ROWQUTPRM>');
	END IF;
    END IF;
       RETURN V_XML_TXT;
    EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
    RAISE_APPLICATION_ERROR(-20201,' Error When GET QUTPRM Data. '|| CHR(13) || SQLERRM);
    END GET_QUT_PRM_PRICE_DIS_XML;
--##-----------------------------------------------------------------------------------------------------##--
  FUNCTION  GET_QUT_PRM_PRC_DSCNT_XML (P_TBL_NM IN VARCHAR2 Default 'IAS_QUT_PRM_MST',P_QUOT_NO  IN NUMBER DEFAULT NULL,P_WHR IN Varchar2 Default Null) RETURN CLOB  IS
    V_CNT     NUMBER;
    V_XML_TXT CLOB;
    V_XML_TYP XMLTYPE;
    V_LNG_NO  NUMBER;
    V_SQL     VARCHAR2(4000);
    BEGIN
    IF UPPER(P_TBL_NM)=UPPER('IAS_QUT_PRM_MST')   THEN
     V_SQL:='SELECT
	    M.QT_PRM_TYPE,
	    M.QT_PRM_METHOD,
	    M.QUOT_NO,
	    M.QUOT_SER,
	    M.F_DATE,
	    M.T_DATE,
	    M.A_DESC
	  From Ias_Qut_Prm_Mst M
	Where M.QUOT_NO=DECODE('||''''||P_QUOT_NO||''''||',NULL, M.QUOT_NO,'||''''||P_QUOT_NO||''''||')
	And M.Qt_Prm_Type=1 and M.QT_PRM_METHOD IN(1,2)  And Nvl(M.By_Comp_Qty,0)=0
	And Nvl(M.Inactive,0)=0 And Nvl(M.Qt_prm_cst_type,0)=0	And Nvl(M.APPROVED,0)=1 and Nvl(M.USE_QTN_PRM_IN_POS_SYS_FLG,0)=1
	And TO_DATE(SYSDATE,''DD/MM/YYYY'') Between  TO_DATE(M.F_Date,''DD/MM/YYYY'') And  TO_DATE(M.T_Date,''DD/MM/YYYY'')
	And To_Char(To_Date(SYSDATE),''D'') In (M.Fld_Day1,M.Fld_Day2,M.Fld_Day3,M.Fld_Day4,M.Fld_Day5,M.Fld_Day6,M.Fld_Day7)
	And To_Char(Ias_gen_Pkg.Get_Curdate,''HH24:MI:SS'') >= Nvl(M.F_Time,To_Char(Ias_gen_Pkg.Get_Curdate,''HH24:MI:SS''))
	And To_Char(Ias_gen_Pkg.Get_Curdate,''HH24:MI:SS'') <= Nvl(M.T_Time,To_Char(Ias_gen_Pkg.Get_Curdate,''HH24:MI:SS''))
	 '||P_WHR||' ';
    ELSE
	V_SQL:='SELECT
			M.QT_PRM_TYPE,
			M.QT_PRM_METHOD,
			M.QUOT_NO,
			M.QUOT_SER,
			D.I_CODE,
			D.ITM_UNT,
			a.I_NAME,
						a.I_E_NAME,
						a.I_IMG,
			NVL(D.I_PRICE,0) I_PRICE,
			DECODE(D.DISC_TYPE,1,D.DISC_AMT_PER,0) DISC_PER ,
			DECODE(D.DISC_TYPE,2,D.DISC_AMT_PER,0) DISC_AMT ,
			M.QUOT_CUR,
			D.Expire_date,
			D.Batch_no
	From Ias_Qut_Prm_Mst M,Ias_Qut_Prm_Dtl D,Ias_Itm_Mst a
	Where  M.Quot_Ser = D.Quot_Ser
	And  d.i_code=a.i_code
	And M.QUOT_NO=DECODE('||''''||P_QUOT_NO||''''||',NULL, M.QUOT_NO,'||''''||P_QUOT_NO||''''||')
	And M.Qt_Prm_Type=1 and M.QT_PRM_METHOD IN(1,2)  And ( Nvl(M.By_Comp_Qty,0)=0 Or Nvl(D.COMP_QTY,0) In (0,1) )  And Nvl(M.APPROVED,0)=1 and Nvl(M.USE_QTN_PRM_IN_POS_SYS_FLG,0)=1
	And Nvl(M.Inactive,0)=0 And Nvl(M.Qt_prm_cst_type,0)=0
	And TO_DATE(SYSDATE,''DD/MM/YYYY'') Between  TO_DATE(M.F_Date,''DD/MM/YYYY'') And  TO_DATE(M.T_Date,''DD/MM/YYYY'')
	And To_Char(To_Date(SYSDATE),''D'') In (M.Fld_Day1,M.Fld_Day2,M.Fld_Day3,M.Fld_Day4,M.Fld_Day5,M.Fld_Day6,M.Fld_Day7)
	And To_Char(Ias_gen_Pkg.Get_Curdate,''HH24:MI:SS'') >= Nvl(M.F_Time,To_Char(Ias_gen_Pkg.Get_Curdate,''HH24:MI:SS''))
	And To_Char(Ias_gen_Pkg.Get_Curdate,''HH24:MI:SS'') <= Nvl(M.T_Time,To_Char(Ias_gen_Pkg.Get_Curdate,''HH24:MI:SS''))
	 '||P_WHR||' ';
    END IF;
	V_XML_TXT:=DBMS_XMLGEN.GETXML(V_SQL);
	IF V_XML_TXT IS NOT NULL THEN
	V_XML_TYP:=XMLTYPE.CREATEXML(V_XML_TXT);
	BEGIN
	SELECT COUNT(*) INTO V_CNT FROM TABLE(XMLSEQUENCE(EXTRACT(V_XML_TYP,'/ROWSET/ROW') ))XMLDUMMAY;
	EXCEPTION
	WHEN OTHERS THEN
	NULL;
	END;
	IF NVL(V_CNT,0)>1 THEN
	V_XML_TXT:=REPLACE(V_XML_TXT,'<ROW>','<QUTPRM>');
	V_XML_TXT:=REPLACE(V_XML_TXT,'</ROW>','</QUTPRM>');
	ELSIF  NVL(V_CNT,0)=1 THEN
	V_XML_TXT:=REPLACE(V_XML_TXT,'<ROW>','<ROWQUTPRM>');
	V_XML_TXT:=REPLACE(V_XML_TXT,'</ROW>','</ROWQUTPRM>');
	END IF;
    END IF;
       RETURN V_XML_TXT;
    EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
    RAISE_APPLICATION_ERROR(-20201,' Error When GET QUTPRM Data. '|| CHR(13) || SQLERRM);
    END GET_QUT_PRM_PRC_DSCNT_XML;
--##-----------------------------------------------------------------------------------------------------##--
    FUNCTION  GET_QUT_PRM_PRICE(P_I_CODE  IN VARCHAR2,
				P_ITM_UNT IN VARCHAR2,
				P_W_Code  IN NUMBER ) RETURN NUMBER  IS
  V_PRICE   NUMBER:=0;
BEGIN
     SELECT NVL(D.I_PRICE,0)  INTO V_PRICE
	From Ias_Qut_Prm_Mst M,Ias_Qut_Prm_Dtl D
	Where  M.Quot_Ser = D.Quot_Ser
	AND D.I_CODE=P_I_CODE
	AND D.ITM_UNT=NVL(P_ITM_UNT,D.ITM_UNT)
	And M.Qt_Prm_Type=1 and M.QT_PRM_METHOD =1 And ( Nvl(M.By_Comp_Qty,0)=0 Or Nvl(D.COMP_QTY,0) In (0,1) ) And Nvl(M.Qt_prm_cst_type,0)=0
	And Nvl(M.Inactive,0)=0 And Nvl(M.APPROVED,0)=1 and Nvl(M.USE_QTN_PRM_IN_POS_SYS_FLG,0)=1
	And TO_DATE(SYSDATE,'DD/MM/YYYY') Between  TO_DATE(M.F_Date,'DD/MM/YYYY') And  TO_DATE(M.T_Date,'DD/MM/YYYY')
	And To_Char(To_Date(SYSDATE),'D') In (M.Fld_Day1,M.Fld_Day2,M.Fld_Day3,M.Fld_Day4,M.Fld_Day5,M.Fld_Day6,M.Fld_Day7)
	And To_Char(Ias_gen_Pkg.Get_Curdate,'HH24:MI:SS') >= Nvl(M.F_Time,To_Char(Ias_gen_Pkg.Get_Curdate,'HH24:MI:SS'))
	And To_Char(Ias_gen_Pkg.Get_Curdate,'HH24:MI:SS') <= Nvl(M.T_Time,To_Char(Ias_gen_Pkg.Get_Curdate,'HH24:MI:SS'))
	And (Case
		When M.Qt_Prm_Wc_Type=0 Then 1
		When M.Qt_Prm_Wc_Type=1 And D.W_Code   = P_W_Code Then 1
		When M.Qt_Prm_Wc_Type=2 And D.Whg_Code =(Select Whg_Code From Warehouse_Details Where W_Code=P_W_Code And RowNum<=1) Then 1
		When M.Qt_Prm_Wc_Type=3 And D.Cntry_No =(Select Cntry_No From Warehouse_Details Where W_Code=P_W_Code And RowNum<=1) Then 1
		When M.Qt_Prm_Wc_Type=4 And D.Prov_No  =(Select Prov_No  From Warehouse_Details Where W_Code=P_W_Code And RowNum<=1) Then 1
		When M.Qt_Prm_Wc_Type=5 And D.City_No  =(Select City_No  From Warehouse_Details Where W_Code=P_W_Code And RowNum<=1) Then 1
		When M.Qt_Prm_Wc_Type=6 And D.R_Code   =(Select R_Code	 From Warehouse_Details Where W_Code=P_W_Code And RowNum<=1) Then 1
		Else 0 End)=1
	And RowNum <=1;
    RETURN(V_PRICE);
EXCEPTION WHEN OTHERS THEN
   RETURN (0);
END GET_QUT_PRM_PRICE;
    --##-----------------------------------------------------------------------------------------------------##--
FUNCTION  GET_QUT_PRM_DISC (P_I_CODE  IN VARCHAR2 ,
			    P_ITM_UNT IN VARCHAR2,
			    P_ITM_PRICE IN NUMBER,
			    P_W_Code  IN NUMBER ) RETURN NUMBER  IS
  V_DISC   NUMBER:=0;
BEGIN
     SELECT  DECODE(D.DISC_TYPE,1,(P_ITM_PRICE*D.DISC_AMT_PER)/100,D.DISC_AMT_PER) INTO V_DISC
	From Ias_Qut_Prm_Mst M,Ias_Qut_Prm_Dtl D
	Where  M.Quot_Ser = D.Quot_Ser
	AND D.I_CODE=P_I_CODE
	AND D.ITM_UNT=NVL(P_ITM_UNT,D.ITM_UNT)
	And M.Qt_Prm_Type=1 and M.QT_PRM_METHOD =2 And ( Nvl(M.By_Comp_Qty,0)=0 Or Nvl(D.COMP_QTY,0) In (0,1) )
	And Nvl(M.Inactive,0)=0  And Nvl(M.APPROVED,0)=1 and Nvl(M.USE_QTN_PRM_IN_POS_SYS_FLG,0)=1
	And TO_DATE(SYSDATE,'DD/MM/YYYY') Between  TO_DATE(M.F_Date,'DD/MM/YYYY') And  TO_DATE(M.T_Date,'DD/MM/YYYY')
	And To_Char(To_Date(SYSDATE),'D') In (M.Fld_Day1,M.Fld_Day2,M.Fld_Day3,M.Fld_Day4,M.Fld_Day5,M.Fld_Day6,M.Fld_Day7)
	And To_Char(Ias_gen_Pkg.Get_Curdate,'HH24:MI:SS') >= Nvl(M.F_Time,To_Char(Ias_gen_Pkg.Get_Curdate,'HH24:MI:SS'))
	And To_Char(Ias_gen_Pkg.Get_Curdate,'HH24:MI:SS') <= Nvl(M.T_Time,To_Char(Ias_gen_Pkg.Get_Curdate,'HH24:MI:SS'))
	And (Case
		When M.Qt_Prm_Wc_Type=0 Then 1
		When M.Qt_Prm_Wc_Type=1 And D.W_Code   = P_W_Code Then 1
		When M.Qt_Prm_Wc_Type=2 And D.Whg_Code =(Select Whg_Code From Warehouse_Details Where W_Code=P_W_Code And RowNum<=1) Then 1
		When M.Qt_Prm_Wc_Type=3 And D.Cntry_No =(Select Cntry_No From Warehouse_Details Where W_Code=P_W_Code And RowNum<=1) Then 1
		When M.Qt_Prm_Wc_Type=4 And D.Prov_No  =(Select Prov_No  From Warehouse_Details Where W_Code=P_W_Code And RowNum<=1) Then 1
		When M.Qt_Prm_Wc_Type=5 And D.City_No  =(Select City_No  From Warehouse_Details Where W_Code=P_W_Code And RowNum<=1) Then 1
		When M.Qt_Prm_Wc_Type=6 And D.R_Code   =(Select R_Code	 From Warehouse_Details Where W_Code=P_W_Code And RowNum<=1) Then 1
		Else 0 End)=1
	And RowNum <=1;
    RETURN(V_DISC);
EXCEPTION WHEN OTHERS THEN
   RETURN (0);
END GET_QUT_PRM_DISC;
    --##-----------------------------------------------------------------------------------------------------##--
    FUNCTION GET_ITM_VAT_AMT_XML(P_CLC_TYP_NO_TAX    IN NUMBER,
			       P_CALC_VAT_AMT_TYPE IN NUMBER,
			       P_I_CODE 	   IN VARCHAR2 ,
			       P_I_PRICE	   IN NUMBER,
			       P_DISC_AMT	   IN NUMBER) RETURN NUMBER IS
      V_VAT_PER NUMBER:=0;
      V_VAT_AMT NUMBER:=0;
      V_CALC_VAT_AMT_TYPE NUMBER:=0;
    BEGIN
      V_VAT_PER := YS_TAX_PKG.GET_ITM_TAX_PRCNT ( P_CLC_TYP_NO =>P_CLC_TYP_NO_TAX , P_I_CODE =>P_I_CODE );
      IF NVL(P_CALC_VAT_AMT_TYPE,0)=0 Then
	  BEGIN
	    SELECT CALC_VAT_AMT_TYPE INTO V_CALC_VAT_AMT_TYPE FROM IAS_PARA_AR;
	  EXCEPTION WHEN OTHERS THEN
	    NULL;
	  END;
	ELSE
	  V_CALC_VAT_AMT_TYPE:=P_CALC_VAT_AMT_TYPE;
	END IF;
      IF P_I_PRICE>0 THEN
	   IF NVL(V_CALC_VAT_AMT_TYPE,1)=1 THEN
	      V_VAT_AMT :=ROUND((NVL(P_I_PRICE,0)*NVL(V_VAT_PER,0))/100,12) ;
	  ELSE
	      V_VAT_AMT :=ROUND(((NVL(P_I_PRICE,0)-NVL(P_DISC_AMT,0))*NVL(V_VAT_PER,0))/100,12) ;
	  END IF;
      ELSE
	V_VAT_AMT :=0;
      END IF;
      RETURN (V_VAT_AMT);
    END GET_ITM_VAT_AMT_XML;
--##-----------------------------------------------------------------------------------------------------##--
FUNCTION GET_inpt_data (    P_inpt_typ	   In	  Varchar2
			   ,P_Fld_Nm1	   In	  Varchar2 Default Null
			   ,P_Fld_Nm2	   In	  Varchar2 Default Null
			   ,P_Fld_Nm3	   In	  Varchar2 Default Null
			   ,P_Fld_Nm4	   In	  Varchar2 Default Null
			   ,P_Fld_Val1	   In	  Varchar2 Default Null
			   ,P_Fld_Val2	   In	  Varchar2 Default Null
			   ,P_Fld_Val3	   In	  Varchar2 Default Null
			   ,P_Fld_Val4	   In	  Varchar2 Default Null
			   ,P_whr	   In	  Varchar2 Default Null
			   ,P_Usr_no	   In	  Number   Default Null
			   ,P_Brn_no	   In	  Number   Default Null ) RETURN CLOB Is

/*--##############################################################--
 INPUT TYPE NAME	      CODEING		     PARAMETER
   --------------------------------------------------------------------
    USERS			 USER
    BRN_NO			 BRN		  P_Usr_no
    Account			 ACODE		  P_Usr_no
    EmPLOOYE			 EMP		  P_Usr_no
    Customer			 CSTMR		  P_Usr_no
    Sales_Man			 SMAN		  P_Usr_no
    Collerctor			 COLNO		  P_Usr_no
    Cost_Centers		 CC_CODE	  P_Usr_no
    Projects			 PJNO		  P_Usr_no
    Actvty			 ACTVNO 	  P_Usr_no
    Warehouse			 WCODE		  P_Usr_no
    Cash_In_Hand		 CASH		  P_Usr_no,P_brn_no
    Bank			 BANK		  P_Usr_no
    TAXS			 TAXNO
    Method Of Tax.Calc		 CLC_TYP_NO_TAX    P_Usr_no,P_brn_no
    SALES order Types		 SO_TYPE	   P_Usr_no
    Sales Types 		 SI_TYPE	   P_Usr_no
    RETURN Sales Types		 SR_TYPE	   P_Usr_no
    CURRENCY			 ACY
    Group Details		 GCODE		  P_Usr_no
    SUB  Group Details		 SUBGCODE	  P_Usr_no
    Customer_Group		 CSTMRGCODE
    ITEMS WITHOUT UNIT		 ITMCODE	  P_Usr_no
    ITEMS WITH UNIT		 ITM_WITH_UNT	  P_Usr_no
    ITEMS UNIT			 ITM_UNT
    LEAVES			 HLDY_CODE
    HRS ARTCLE			 ARTCL_CODE	P_Fld_Nm1  ARTCL_CLASS	-  P_Fld_Val1  (1 LOAN 2 TRUST ...)
    S_EMP_CODE_DTL		 EMP_CODE_DFN	P_Fld_Nm1  CODE_TYP	-  P_Fld_Val1  (1 Job  2 Specialization ...)
    HRS_GNR_CODE_DTL		 GNR_CODE_DTL	 P_Fld_Nm1  CODE_TYP	 -   P_Fld_Val1  ( 710 Permision ...)
    IAS_POINT_TYP_MST		 POINT_TYP_MST
    IAS_POINT_TYP_CALC_DTL	 POINT_TYP_CALC_DTL
    IAS_POINT_TYP_RPLC_DTL	 POINT_TYP_RPLC_DTL
    IAS_CARD_SAL		 CARD_SAL_DISC
    IAS_CARD_SAL_DISC_TYP	 CARD_SAL_DISC_TYP
--##############################################################-- */
    V_whr		Varchar2(8000) ;
    V_Ordr		Varchar2(20000) ;
    V_Sql_qry		Varchar2(20000) ;
    P_MSG_NO		Varchar2(8000) ;
    V_XML_TYP		XMLTYPE;
    V_Msg_Txt		Varchar2(4000);
    V_json_rslt 	Varchar2(4000);
    QRY_CTX	       DBMS_XMLGEN.CTXHANDLE;
    QRY_RSLT	       CLOB;
   Begin
    V_json_rslt := '{"_Result": { "_ErrMsg": "@errmsg","_ErrNo": @errno } }';
      ------------------------------------------------------------------
     If P_Fld_Nm1 Is Not Null And P_Fld_Val1 Is Not Null  Then
       V_Whr :=V_Whr|| ' And '||P_Fld_Nm1||'='''||P_Fld_Val1||'''';
     End If;
     ------------------------------------------------------------------
     If P_Fld_Nm2 Is Not Null And P_Fld_Val2 Is Not Null  Then
       V_Whr := V_Whr|| ' And '||P_Fld_Nm2||'='''||P_Fld_Val2||'''';
     End If;
     ------------------------------------------------------------------
     If P_Fld_Nm3 Is Not Null And P_Fld_Val3 Is Not Null  Then
       V_Whr := V_Whr|| ' And '||P_Fld_Nm3||'='''||P_Fld_Val3||'''';
     End If;
     ------------------------------------------------------------------
     If P_Fld_Nm4 Is Not Null And P_Fld_Val4 Is Not Null  Then
       V_Whr := V_Whr|| ' And '||P_Fld_Nm4||'='''||P_Fld_Val4||'''';
     End If;
     ------------------------------------------------------------------
     If  P_Inpt_Typ Is Null Then
	     V_msg_txt := 'Enter P_Inpt_Typ   ';
	     Goto Rtn_rslt;
     End If;

     If Upper(P_Inpt_Typ) not in ('USER','ITM_UNT','CSTMRGCODE','ACY','RCODE','TAXNO','POINT_TYP_MST','POINT_TYP_CALC_DTL','POINT_TYP_RPLC_DTL','CARD_SAL_DISC','CARD_SAL_DISC_TYP') And P_Usr_no Is Null Then
	     V_msg_txt := 'Enter P_Usr_no   ';
	     Goto Rtn_rslt;
     End If;
      If  UPPER(P_Inpt_Typ) = 'USER' Then    --U_id USR_NO, Decode ('||P_Lng_No||', 1, U_A_Name, Nvl (U_E_Name, U_A_Name)) USR_NM
	   V_Sql_Qry:=' Select ROWNUM  ROW_NUM ,USER_R.*
			    From User_R  Where	Nvl (Inactive, 0)=0  ';

      Elsif  UPPER(P_Inpt_Typ) = 'BRN' Then
	    V_Sql_Qry:='Select ROWNUM  ROW_NUM ,S_Brn.*
					From S_Brn
					Where Nvl (Inactive, 0)=0
					  AND	Exists(Select 1 From S_Brn_Usr_Priv
						     Where u_id='||P_Usr_no||'
						      And Brn_no=S_Brn.Brn_no
						      And Nvl(Add_Bnf_Flag,0)=1
						      And RowNum<=1)  ';

      Elsif  UPPER(P_Inpt_Typ) = 'ACODE' Then
	  V_Sql_Qry:=' Select ROWNUM  ROW_NUM ,Account.*
				  From Account
				 Where	A_S_M In (Select Account_Type
						       From Account_Types
						      Where Affected_By_Trans = 1 And Rownum <= 1)
							AND Exists(Select 1 From PRIV_ACC
												 Where u_id='||P_Usr_no||'
												  And A_CODE=Account.A_CODE
												  And Nvl(ADD_FLAG,0)=1
												  And RowNum<=1)  ';
      Elsif  UPPER(P_Inpt_Typ) = 'EMP' Then
		V_Sql_Qry := ' Select ROWNUM  ROW_NUM ,M.*
				   From S_Emp M
				   Where Nvl (Inactive, 0)=0
				   AND	(('||P_Usr_no||' = 1)
								Or 1 =	 (Case When Ys_Gen_Pkg.Get_Fld_Value (''IAS_PARA_GEN'', ''EMP_PRV_TYP'') = 0
												 Then 1
											      Else (Select 1
												      From S_Emp_Prv
												     Where U_Id = '||P_Usr_no||'
												       And Empno_Hrchyno =
													      Decode (Emp_Prv_Typ,
														      1, M.Emp_No,
														      2, M.Hrchy_No
														     )
												       And Nvl(Add_Flag,0) = 1
												       And Rownum <= 1)
											   End) )  ';
      Elsif  UPPER(P_Inpt_Typ) = 'CSTMR' Then
	 V_Sql_Qry := ' Select ROWNUM  ROW_NUM ,Customer.*
			  From Customer
			 Where Nvl (Inactive, 0)=0
			 AND (	 ( '||P_Usr_no||' = 1)
				Or (   (    ( Ys_Gen_Pkg.Get_Fld_Value (''IAS_PARA_AR'', ''AR_AC_LINK_TYPE '') = 1)
					And Exists
					       (Select 1
						  From Priv_Acc
						 Where U_Id = '||P_Usr_no||' And A_Code = Customer.C_A_Code And Nvl (Add_Flag, 0) = 1 And Rownum <= 1))
				    Or (    ( Ys_Gen_Pkg.Get_Fld_Value (''IAS_PARA_AR'', ''AR_AC_LINK_TYPE '') = 2)
					And Exists
					       (Select 1
						  From Ias_Priv_Customer
						 Where U_Id = '||P_Usr_no||' And C_Code = Customer.C_Code And Nvl (Add_Flag, 0) = 1 And Rownum <= 1))))  ';

      Elsif  UPPER(P_Inpt_Typ) = 'SMAN' Then
	  V_Sql_Qry:='Select ROWNUM  ROW_NUM ,Sales_Man.*
				From Sales_Man
			       Where Nvl (Inactive, 0)=0
			       AND  (('||P_Usr_no||' = 1 )
				     Or(Exists (Select 1  From IAS_PRIV_SMAN
					   Where U_Id	= '||P_Usr_no||'
					     And Rep_code = sales_man.reprs_code
					     And Nvl(Add_Flag,0)=1
					     And Rownum<=1)))	 ';
      Elsif  UPPER(P_Inpt_Typ) = 'COLNO' Then
	  V_Sql_Qry:='	Select ROWNUM  ROW_NUM ,Collerctor.*
		    From Collerctor
		   Where Nvl (Inactive, 0)=0
		   AND Exists
			    (Select 1
			       From Ias_Priv_Collectors
			      Where U_Id = '||P_Usr_no||' And Col_No = Collerctor.Col_No And Nvl (Add_Flag, 0) = 1 And Rownum <= 1) ';
      Elsif  UPPER(P_Inpt_Typ) = 'CC_CODE' Then
	V_Sql_Qry:=' Select ROWNUM  ROW_NUM ,Cost_Centers.*
			From Cost_Centers
		       Where	 Nvl (Inactive_Sls, 0) = 0
			     And C_S_M = (Select Cc_Type
					    From Cost_Center_Types
					   Where Affected_By_Trans = 1)
			     And (   ( '||P_Usr_no||' = 1)
				  Or Exists
					(Select Cc_Code
					   From Privilege_Cc
					  Where U_Id = '||P_Usr_no||' And Cc_Code = Cost_Centers.Cc_Code And Nvl (Add_Flag, 0) = 1 And Rownum <= 1))  ';

      Elsif  UPPER(P_Inpt_Typ) = 'PJNO' Then
	  V_Sql_Qry:='	Select ROWNUM  ROW_NUM ,Ias_Projects.*
		From Ias_Projects
	       Where	 Pj_Sub = 1
	       AND Nvl (Inactive, 0) = 0
		     And (   ('||P_Usr_no||'= 1)
			  Or Exists
				(Select Pj_No
				   From Ias_Priv_Projects
				  Where U_Id =	'||P_Usr_no||' And Pj_No = Ias_Projects.Pj_No And Nvl (Add_Flag, 0) = 1 And Rownum <= 1)) ';
      Elsif  UPPER(P_Inpt_Typ) = 'ACTVNO' Then
	  V_Sql_Qry:=' Select ROWNUM  ROW_NUM ,Ias_Actvty.*
			From Ias_Actvty
		       Where	 Actv_Sub = 1
			     And Nvl (Inactive, 0) = 0
			     And (   (	'||P_Usr_no||' = 1)
				  Or Exists
					(Select Actv_No
					   From Ias_Priv_Actvty
					  Where U_Id =	'||P_Usr_no||' And Actv_No = Ias_Actvty.Actv_No And Nvl (Add_Flag, 0) = 1 And Rownum <= 1))  ';
      Elsif  UPPER(P_Inpt_Typ) = 'WCODE' Then
	  V_Sql_Qry:=' Select  Select ROWNUM  ROW_NUM ,Warehouse_Details.*
			  From Warehouse_Details
			 Where Inactive <> 1
			       And (   ( '||P_Usr_no||' = 1)
				    Or Exists
					  (Select W_Code
					     From Privilege_Wh
					    Where U_Id = '||P_Usr_no||' And W_Code = Warehouse_Details.W_Code And Nvl (Add_Flag, 0) = 1 And Rownum <= 1))  ';
      Elsif  UPPER(P_Inpt_Typ) = 'CASH' Then
	 If P_brn_no Is Null Then
		 V_msg_txt := 'Enter P_brn_no	';
		 Goto Rtn_rslt;
	 End If;
	V_Sql_Qry:='  Select ROWNUM  ROW_NUM ,Cash_In_Hand.*
			  From Cash_In_Hand
			 Where	   Conn_Brn_No = '||P_brn_no||'
			   And Nvl (Inactive, 0) = 0
			   And (   '||P_Usr_no||' = 1
				    Or Exists
					  (Select Cash_No
					     From Priv_Cash
					    Where U_Id = '||P_Usr_no||' And Cash_No = Cash_In_Hand.Cash_No And Cash_Type = 1 And Nvl (Add_Flag, 0) = 1 And Rownum <= 1)) ';
      Elsif  UPPER(P_Inpt_Typ) = 'BANK' Then
	 V_Sql_Qry:='  Select ROWNUM  ROW_NUM ,Cash_At_Bank.*
		      From Cash_At_Bank
		     Where Nvl (Inactive, 0) = 0
			   And ( '||P_Usr_no||' = 1
				Or Exists
				      (Select Cash_No
					 From Priv_Cash
					Where U_Id = '||P_Usr_no||' And Cash_No = Cash_At_Bank.Bank_No And Cash_Type = 2 And Nvl (Add_Flag, 0) = 1 And Rownum <= 1))  ';
      Elsif  UPPER(P_Inpt_Typ) = 'TAXNO' Then
	V_Sql_Qry:='  Select ROWNUM  ROW_NUM ,Gnr_Tax_Code_Mst.*
			  From Gnr_Tax_Code_Mst
			 Where Nvl (Inactive, 0)=0  ';

      Elsif  UPPER(P_Inpt_Typ) = 'CLC_TYP_NO_TAX' Then
	 If P_brn_no Is Null Then
		 V_msg_txt := 'Enter P_brn_no	';
		 Goto Rtn_rslt;
	 End If;
	 V_Sql_Qry:=' Select Rownum ROW_NUM, Clc_Typ_No_Tax ,Clc_Typ_L_Nm ,Clc_Typ_F_Nm
		      From (Select Distinct M.Clc_Typ_No Clc_Typ_No_Tax,Clc_Typ_L_Nm ,Clc_Typ_F_Nm
			      From Gnr_Tax_Typ_Clc_Mst M, Gnr_Tax_Typ_Clc_Brn Db
			     Where     M.Clc_Typ_No = Db.Clc_Typ_No
				   And Db.Brn_No = Decode (Nvl ( '||P_Brn_No||', 0),  0, 0,  Db.Brn_No, Nvl (  '||P_Brn_No||', 0))
				   And (   M.Clc_Tax_Typ <> 0
					Or Exists
					      (Select D.Clc_Typ_No
						 From Gnr_Tax_Typ_Clc_Dtl D, Gnr_Tax_Code_Mst T
						Where D.Tax_No = T.Tax_No And D.Clc_Typ_No = M.Clc_Typ_No And T.Clc_Doc_Typ In (1, 3) And Rownum <= 1)))
		     Where 1 = 1   ';
      Elsif  UPPER(P_Inpt_Typ) = 'SO_TYPE' Then
	 V_Sql_Qry:='Select ROWNUM  ROW_NUM ,Ias_Sorder_Types.*
			  From Ias_Sorder_Types
			 Where (   ( '||P_Usr_no||' = 1)
				Or Exists
				      (Select S_Type
					 From Ias_Priv_Ar
					Where U_Id = '||P_Usr_no||' And Nvl (Add_Flag, 0) = 1
					And Ias_Priv_Ar.S_Type = Ias_Sorder_Types.So_Type
					 And Ias_Priv_Ar.Ar_Type = 2
					 And Rownum <= 1))   ';
      Elsif  UPPER(P_Inpt_Typ) = 'SI_TYPE' Then
	V_Sql_Qry:='Select ROWNUM  ROW_NUM ,Ias_Sales_Types.*
				From Ias_Sales_Types
				Where  Exists(Select S_Type From Ias_Priv_Ar
						Where U_Id='||P_Usr_no||'
						  And Ias_Priv_Ar.Ar_Type=3
						  And Ias_Priv_Ar.S_Type=Ias_Sales_Types.SI_Type
					  And Nvl(Add_Flag,0)=1
						  And Rownum<=1)   ';
      Elsif  UPPER(P_Inpt_Typ) = 'SR_TYPE' Then
	V_Sql_Qry:=' Select ROWNUM  ROW_NUM ,Ias_Rt_Sales_Types.*
				From Ias_Rt_Sales_Types
				Where  Exists(Select S_Type From Ias_Priv_Ar
						Where U_Id='||P_Usr_no||'
						  And Ias_Priv_Ar.Ar_Type=4
						  And Ias_Priv_Ar.S_Type=Ias_Rt_Sales_Types.SR_Type
					  And Nvl(Add_Flag,0)=1
						  And Rownum<=1)  ';
      Elsif Upper(P_Inpt_Typ) = 'ACY' Then
	    V_Sql_Qry:=' Select ROWNUM	ROW_NUM ,Ex_Rate.*
			   From Ex_Rate ';
      Elsif Upper(P_Inpt_Typ) = 'GCODE' Then
	   V_Sql_Qry:=' Select ROWNUM  ROW_NUM ,Group_Details.*
			    From Group_Details
			   Where   '||P_Usr_no||' = 1
				 Or Exists
				       (Select G_Code
					  From Privilege_Gc
					 Where U_Id = '||P_Usr_no||' And G_Code = Group_Details.G_Code And Add_Flag = 1 And Rownum <= 1)  ';
      Elsif Upper(P_Inpt_Typ) = 'SUBGCODE' Then
	   V_Sql_Qry:=' Select ROWNUM  ROW_NUM ,Ias_Sub_Grp_Dtl.*
			  From Ias_Sub_Grp_Dtl
			 Where	  (   '||P_Usr_no||' = 1
				    Or Exists
					  (Select G_Code
					     From Privilege_Gc
					    Where Nvl (Add_Flag, 0) = 1 And U_Id = '||P_Usr_no||' And G_Code = Ias_Sub_Grp_Dtl.G_Code And Rownum <= 1))  ';
      Elsif Upper(P_Inpt_Typ) = 'CSTMRGCODE' Then
	  V_Sql_Qry:='Select ROWNUM  ROW_NUM ,Customer_Group.*
	      From Customer_Group ';
      Elsif Upper(P_Inpt_Typ) = 'ITMCODE' Then
	 V_Sql_Qry:='Select ROWNUM  ROW_NUM ,Ias_Itm_Mst.*
			From Ias_Itm_Mst
		       Where  Get_Items_Activity (Activity_No
						    , '||P_Usr_no||'
						    , Ys_Gen_Pkg.Get_Fld_Value (''IAS_PARA_Inv'', ''Conn_Itm_Act_By_Usr_Priv'')
						    ,1) = 1
			     And (  '||P_Usr_no||' = 1
				  Or Exists
					(Select 1
					   From Privilege_Gc
					  Where U_Id = '||P_Usr_no||' And G_Code = G_Code And Nvl (Add_Flag, 0) = 1 And Rownum <= 1))  ';
      Elsif Upper(P_Inpt_Typ) = 'ITM_WITH_UNT' Then
	 V_Sql_Qry:=' Select ROWNUM  ROW_NUM ,m.*
			    ,D.Itm_Unt,D.P_SIZE,D.MAIN_UNIT,D.SALE_UNIT ,D.PUR_UNIT,d.NO_SALE
			From Ias_Itm_Mst M, Ias_Itm_Dtl D
		       Where	 M.I_Code = D.I_Code
			     And Get_Items_Activity (M.Activity_No
						    , '||P_Usr_no||'
						    , Ys_Gen_Pkg.Get_Fld_Value (''IAS_PARA_Inv'', ''Conn_Itm_Act_By_Usr_Priv'')
						    ,1) = 1
			     And (   '||P_Usr_no||' = 1
				  Or Exists
					(Select 1
					   From Privilege_Gc
					  Where U_Id ='||P_Usr_no||' And G_Code = M.G_Code And Nvl (Add_Flag, 0) = 1 And Rownum <= 1))';
	 V_Ordr:=' ORDER BY I_Code '  ;
      Elsif Upper(P_Inpt_Typ) = 'ITM_UNT' Then
	  V_Sql_Qry:='Select DISTINCT  ROWNUM  ROW_NUM ,Ias_Itm_Dtl.*
			   From Ias_Itm_Dtl			      ';

      Elsif  UPPER(P_Inpt_Typ) = 'HLDY_CODE' Then
	V_Sql_Qry:='Select ROWNUM  ROW_NUM ,HRS_HLDY_CODE.*
				From HRS_HLDY_CODE
				where NVL(INACTIVE,0)=0
				AND NVL(SHW_IN_RQST_HLDY,0)=1
				and Exists(Select hldy_no From S_EMP_HLDY_BLNC
						Where NVL(INACTIVE,0) = 0
						  AND HLDY_NO = HRS_HLDY_CODE.HLDY_NO
						  --AND EMP_NO=:emp_no
						  And Rownum<=1)
				OR (HRS_GNR_PKG.Get_Hldy_TYP (HRS_HLDY_CODE.HLDY_NO)=3 AND NVL(INACTIVE,0) = 0)
				OR (NVL(RNWL_FLG,0)=0 AND NVL(INACTIVE,0) = 0)	 ';
      Elsif  UPPER(P_Inpt_Typ) = 'ARTCL_CODE' Then

	V_Sql_Qry:='Select ROWNUM  ROW_NUM ,HRS_ARTCL.*
				From HRS_ARTCL
				where NVL(INACTIVE,0)=0  ';
      Elsif  UPPER(P_Inpt_Typ) = 'EMP_CODE_DFN' Then
	V_Sql_Qry:='Select ROWNUM  ROW_NUM ,S_EMP_CODE_DTL.*
				From  S_EMP_CODE_DTL
			       where NVL(INACTIVE,0)=0	';
      Elsif  UPPER(P_Inpt_Typ) = 'GNR_CODE_DTL' Then
	V_Sql_Qry:='Select ROWNUM  ROW_NUM ,HRS_GNR_CODE_DTL.*
				From  HRS_GNR_CODE_DTL
			       where NVL(INACTIVE,0)=0	';
      Elsif  UPPER(P_Inpt_Typ) = 'POINT_TYP_MST' Then
	V_Sql_Qry:='Select ROWNUM  ROW_NUM ,IAS_POINT_TYP_MST.*
			  From	IAS_POINT_TYP_MST
			   Where NVL(INACTIVE,0)=0  ';
      Elsif  UPPER(P_Inpt_Typ) = 'POINT_TYP_CALC_DTL' Then
	V_Sql_Qry:='Select ROWNUM  ROW_NUM ,IAS_POINT_TYP_CALC_DTL.*
			  From	IAS_POINT_TYP_CALC_DTL
			   Where 1=1 ';
      Elsif  UPPER(P_Inpt_Typ) = 'POINT_TYP_RPLC_DTL' Then
	V_Sql_Qry:='Select ROWNUM  ROW_NUM ,IAS_POINT_TYP_RPLC_DTL.*
			  From	IAS_POINT_TYP_RPLC_DTL
			   Where 1=1  ';
      Elsif  UPPER(P_Inpt_Typ) = 'CARD_SAL_DISC_TYPE' Then
	V_Sql_Qry:='Select ROWNUM  ROW_NUM ,IAS_CARD_SAL_DISC_TYP.*
			  From	IAS_CARD_SAL_DISC_TYP
			   Where NVL(INACTIVE,0)=0 ';
      Elsif  UPPER(P_Inpt_Typ) = 'CARD_SAL_DISC' Then
	V_Sql_Qry:='Select ROWNUM  ROW_NUM ,IAS_CARD_SAL.*,
		  (Select Nvl(Sum((Nvl(D.I_Qty,0) * (Nvl(D.I_Price,0)-Nvl(D.Dis_Amt,0)-Nvl(D.Dis_aftr_vat_mst,0)) * Nvl(M.Bill_Rate,1))),0) Sal_Amt
		       From POS_BILL_MST_ALL_VW M,POS_BILL_DTL_ALL_VW D
		      Where M.Bill_No = D.Bill_No
		       And M.CRD_NO =IAS_CARD_SAL.CRD_NO) SAL_AMT_PRV
			  From	IAS_CARD_SAL
			   Where CRD_TYPE=1 AND NVL(INACTIVE,0)=0 ';
      End If;

      V_SQL_QRY:=' select * from ( '||V_SQL_QRY||' ) where 1=1 ';
      V_SQL_QRY:=V_SQL_QRY||V_WHR||P_WHR||V_Ordr;
      QRY_CTX :=DBMS_XMLGEN.NEWCONTEXT (V_SQL_QRY);
      DBMS_XMLGEN.SETNULLHANDLING(QRY_CTX,DBMS_XMLGEN.EMPTY_TAG);
      QRY_RSLT := DBMS_XMLGEN.GETXML(QRY_CTX);
     RETURN QRY_RSLT;
  --####################--
   <<Rtn_rslt>>
   If V_msg_txt Is Not Null Then
	 V_json_rslt := Replace(V_json_rslt, '@errmsg', V_msg_txt);
	 RETURN V_json_rslt;
   End If;
--####################--
   Exception
      When Others Then
	 Raise_Application_Error (-20083, 'GET_inpt_data , ' || Sqlerrm);
End GET_inpt_data;
--##-----------------------------------------------------------------------------------------------------##--
FUNCTION  GET_SALESDISC_XML(P_LNG_NO IN NUMBER DEFAULT 1) RETURN CLOB IS

   V_CNT     NUMBER;
   V_SQL     VARCHAR2(4000);
   QRY_CTX   DBMS_XMLGEN.CTXHANDLE;
   QRY_RSLT  CLOB;
  V_USE_APRVD_DISC_TYP number := 0;
BEGIN
		--##--------------------------------------------##--
		Begin
		select USE_APRVD_DISC_TYP into V_USE_APRVD_DISC_TYP from ias_para_ar;
		Exception when others then
		  V_USE_APRVD_DISC_TYP :=0;
		End;
		--##--------------------------------------------##--
    IF NVL(V_USE_APRVD_DISC_TYP,0)=0 THEN
      V_SQL:='SELECT * FROM SALES_DISC WHERE 1=1';
    ELSE
      V_SQL:='SELECT D.* FROM IAS_SALES_DISC_MST M,SALES_DISC D WHERE  M.DOC_SER=D.DOC_SER AND NVL(M.APPROVED,0)=1 ';
    END IF;
      QRY_CTX :=DBMS_XMLGEN.NEWCONTEXT (V_SQL);
      DBMS_XMLGEN.SETNULLHANDLING(QRY_CTX,DBMS_XMLGEN.EMPTY_TAG);
      QRY_RSLT := DBMS_XMLGEN.GETXML(QRY_CTX);
      RETURN QRY_RSLT;
  EXCEPTION
     WHEN OTHERS THEN
	 RETURN NULL;
	 RAISE_APPLICATION_ERROR(-20201,' Error When GET_SALESDISC_XML Data. '|| CHR(13) || SQLERRM);
 END GET_SALESDISC_XML;
--##-----------------------------------------------------------------------------------------------------##--
FUNCTION GET_QT_PRM_DATA_XML (P_TBL_NM IN VARCHAR2,
			      P_LNG_NO IN NUMBER DEFAULT 1 ) RETURN CLOB IS
   V_SQL     VARCHAR2(4000);
   QRY_CTX   DBMS_XMLGEN.CTXHANDLE;
   QRY_RSLT  CLOB;
 BEGIN
    IF	UPPER(P_TBL_NM)=UPPER('IAS_QUT_PRM_MST') THEN
       V_SQL:='SELECT * FROM IAS_QUT_PRM_MST WHERE  NVL(INACTIVE,0) =0 And Nvl(USE_QTN_PRM_IN_POS_SYS_FLG,0)=1 and Nvl(APPROVED,0)=1 ';
    ELSIF UPPER(P_TBL_NM)=UPPER('IAS_QUT_PRM_DTL') THEN
       V_SQL:='SELECT * FROM IAS_QUT_PRM_DTL WHERE Exists(Select 1
							   From IAS_QUT_PRM_MST
							   Where IAS_QUT_PRM_MST.QUOT_SER =IAS_QUT_PRM_DTL.QUOT_SER And Nvl(USE_QTN_PRM_IN_POS_SYS_FLG,0)=1 and Nvl(APPROVED,0)=1 AND NVL(INACTIVE,0) =0) ';
    ELSIF UPPER(P_TBL_NM)=UPPER('IAS_QUT_PRM_SUB_DTL') THEN
       V_SQL:='SELECT * FROM IAS_QUT_PRM_SUB_DTL WHERE Exists (Select 1
							  From IAS_QUT_PRM_MST
							  Where IAS_QUT_PRM_MST.QUOT_SER =IAS_QUT_PRM_SUB_DTL.QUOT_SER And Nvl(APPROVED,0)=1 AND NVL(INACTIVE,0)=0) ';
    ELSIF UPPER(P_TBL_NM)=UPPER('IAS_QUT_PRM_GRP_MST') THEN
       V_SQL:='SELECT * FROM IAS_QUT_PRM_GRP_MST WHERE 1=1';
    ELSIF UPPER(P_TBL_NM)=UPPER('IAS_QUT_PRM_GRP_DTL') THEN
       V_SQL:='SELECT * FROM IAS_QUT_PRM_GRP_DTL WHERE 1=1';
    END IF;
      QRY_CTX :=DBMS_XMLGEN.NEWCONTEXT (V_SQL);
      DBMS_XMLGEN.SETNULLHANDLING(QRY_CTX,DBMS_XMLGEN.EMPTY_TAG);
      QRY_RSLT := DBMS_XMLGEN.GETXML(QRY_CTX);
      RETURN QRY_RSLT;
  EXCEPTION
     WHEN OTHERS THEN
	 RETURN NULL;
	 RAISE_APPLICATION_ERROR(-20201,' Error When GET_PRM_XML Data for table '||P_TBL_NM ||CHR(13) || SQLERRM);
END GET_QT_PRM_DATA_XML;
---##--------------------------------------------------------------------------------------------------##---
FUNCTION CHECK_DB_SRVR_TYP_FNC RETURN NUMBER IS
  V_Cnt  Number  := 0 ;
 Begin
      Begin
       Select 1
	 Into  V_Cnt
	From   Dba_Snapshots
	 Where Table_Name = 'IAS_ITM_MST'
	  And  Owner	  =  User
	  And  RowNum <= 1 ;
      Exception
	When No_Data_Found Then
	  V_Cnt :=  0 ;
	When Others Then
	  Null ;
      End ;

      If  V_Cnt > 0 Then
	    Return (1) ;
      Else
	    Return (0) ;
      End If ;
 End CHECK_DB_SRVR_TYP_FNC;
--##---------------------------------------------------------------------------------##--
FUNCTION GET_CUR_RATE_FNC(P_A_CY   EX_RATE.CUR_CODE%TYPE,
			  P_USR_NO USER_R.U_ID%TYPE ) RETURN NUMBER IS
 V_CUR_RATE   NUMBER;
BEGIN
 IF P_A_CY IS NOT NULL THEN
      BEGIN
       SELECT  CUR_RATE
	 INTO V_CUR_RATE
	 FROM GLS_CRNCY_USR_LMT
	WHERE CUR_CODE = P_A_CY
	  AND USER_NO= P_USR_NO
	  AND  ROWNUM  <= 1 ;
      EXCEPTION WHEN NO_DATA_FOUND THEN
		 NULL;
	       WHEN OTHERS THEN
	V_CUR_RATE:=NULL;
      END ;
      IF NVL(V_CUR_RATE,0)=0 THEN
	       BEGIN
		 SELECT CUR_RATE_POS
		   INTO V_CUR_RATE
		  FROM EX_RATE
		   WHERE CUR_CODE = P_A_CY;
	       EXCEPTION
		 WHEN OTHERS THEN
		  V_CUR_RATE:=NULL;
	       END ;
	       IF NVL(V_CUR_RATE,0)=0 THEN
		      V_CUR_RATE:=IAS_GEN_PKG.GET_CUR_RATE(P_ACY=>P_A_CY);
	       END IF;
      END IF;
 END IF;
   RETURN(V_CUR_RATE);
END GET_CUR_RATE_FNC;
--##---------------------------------------------------------------------------------##--
FUNCTION GET_BILL_MST_XML(P_BILL_NO IN IAS_POS_BILL_MST.BILL_NO%TYPE
			 ,P_DVC_SRL IN VARCHAR2
			 ,P_USR_NO  IN USER_R.U_ID%TYPE
			 ,P_BRN_USR IN IAS_POS_BILL_MST.BRN_USR%TYPE
			 ,P_LNG_NO  IN NUMBER  ) RETURN  CLOB IS

   V_CNT	       NUMBER:=0;
   V_LNG_NO	       NUMBER;
   V_USR_NM	       VARCHAR2(100);
   V_SQL	       VARCHAR2(8000);
   QRY_CTX	       DBMS_XMLGEN.CTXHANDLE;
   QRY_RSLT	       CLOB;
   V_WHR	       VARCHAR2(1000);
   V_BILL_RATE_FLD     VARCHAR2(1000);
   V_TBL_NM_MST        VARCHAR2(500);
   V_MOVE_DATA_TO_DB_LINK VARCHAR2(200);
   V_RETURN_CHANGE_TYPE  NUMBER;
   V_RETURN_PERIOD	 NUMBER;
   V_CHANGE_PERIOD	 NUMBER;
   V_RTRN_COUPON_BILL	 NUMBER;
   V_USE_PREV_PAID_CARD  NUMBER;
   V_Bill_Date		 DATE;
   BEGIN
	V_LNG_NO:=NVL(P_LNG_NO,1);
	---------------------------------------------------------------------
	 If P_bill_no Is Null Then
	     V_Err_No	 := 20001;
	     V_MSG_NO	 :=898;
	     Goto Rtn_Rslt;
	 End If;
	 If P_Usr_no is Null  Then
	      V_Err_No	  := 20002;
	      V_MSG_NO	  :=450;
	      Goto Rtn_Rslt;
	 End If;
	 If P_BRN_USR is Null  Then
	      V_Err_No	  := 20003;
	      V_MSG_NO	  :=1601;
	      G_Msg_Txt   := 'Accounting Unit IS NULL';
	      Goto Rtn_Rslt;
	 End If;
	 V_USR_NM:='YSPOS'||P_BRN_USR;
	 V_CNT := IAS_GEN_PKG.GET_CNT('Select 1 From All_Users Where UserName='''||V_USR_NM||''' And RowNum<=1');

	 If Nvl(V_cnt,0)=0 Then
	      V_Err_No	  := 20002;
	      V_MSG_NO	  :=298;
	      G_MSG_TXT    :=V_USR_NM;
	      Goto Rtn_Rslt;
	 End If;
	--##-----------------------------------------------------------------------##--
	--##check bill no
	V_SQL :='  Select 1
		       From '||V_USR_NM||'.Ias_Pos_Bill_Mst
			Where Bill_No = '||P_bill_no;
	V_Cnt := Ias_Gen_Pkg.Get_Cnt(V_SQL);
	If Nvl(V_Cnt,0)>0 Then
	   V_TBL_NM_MST :=V_USR_NM||'.IAS_POS_BILL_MST';
	Else
	      V_SQL :='  Select 1
		       From '||V_USR_NM||'.Ias_Pos_Hst_Bill_Mst
			Where Bill_No = '||P_bill_no;
	       V_Cnt := Ias_Gen_Pkg.Get_Cnt(V_SQL);
		If Nvl(V_Cnt,0)>0 Then
		   V_TBL_NM_MST :=V_USR_NM||'.IAS_POS_HST_BILL_MST';
		Else
		  IF NVL(CHECK_DB_SRVR_TYP_FNC,0)=0 Then
		    V_Err_No	:= 20005;
		    G_Msg_Txt	:= P_bill_no;
		    V_MSG_NO	:=899;
		    Goto Rtn_Rslt;
		  Else
		      Begin
		       Select
			     Move_Data_To_Db_Link
			Into V_Move_Data_To_Db_Link
			  From ias_pos_machine
			   Where Upper(terminal)=Upper(P_DVC_SRL);
		      Exception When Others Then
			V_Move_Data_To_Db_Link:='ONYX.ONYX.COM';
		      End;
		      V_SQL :='  Select 1
			   From '||V_USR_NM||'.Ias_Pos_Bill_Mst@'||V_Move_Data_To_Db_Link||'
			    Where Bill_No = '||P_bill_no;
		      V_Cnt := Ias_Gen_Pkg.Get_Cnt(V_SQL);
		      If Nvl(V_Cnt,0)>0 Then
			 V_TBL_NM_MST :=V_USR_NM||'.Ias_Pos_Hst_Bill_Mst@'||V_Move_Data_To_Db_Link;
		      Else
			 V_Err_No    := 20006;
			 G_Msg_Txt   := P_bill_no;
			 V_MSG_NO    :=899;
			 Goto Rtn_Rslt;
		      End If;
		  End If;
		End If;
	End If;
	IF V_TBL_NM_MST IS NULL THEN
	     V_Err_No	 :=20007;
	     G_Msg_Txt	 := P_bill_no;
	     V_MSG_NO	 :=899;
	     Goto Rtn_rslt;
	ELSE
	    V_SQL :='  Select 1
			   From '||V_TBL_NM_MST||'
			    Where NVL(BILL_RTRN,0)=1 AND Bill_No = '||P_bill_no;
	   V_Cnt := Ias_Gen_Pkg.Get_Cnt(V_SQL);
	   IF NVL(V_Cnt,0)>0 THEN
	     V_Err_No	 :=20007;
	     G_Msg_Txt	 := P_bill_no;
	     V_MSG_NO	 :=4606;
	     Goto Rtn_rslt;
	   ELSE
	       V_SQL :='Select COUNT(1)
			From POS_RT_BILL_MST_ALL_VW
			Where  Bill_No= '||P_bill_no;
		  V_Cnt := Ias_Gen_Pkg.Get_Cnt(V_SQL);
		   IF NVL(V_Cnt,0)>0 THEN
		     V_Err_No	 :=20007;
		     G_Msg_Txt	 := P_bill_no;
		     V_MSG_NO	 :=4606;
		     Goto Rtn_rslt;
		   END IF;
	   END IF;
	END IF;
	--##------------------------------------------------------------------------------##--
	--##CHECK PREIOD ALLOWED
	     BEGIN
		 SELECT RETURN_CHANGE_TYPE,
			RTRN_COUPON_BILL,
			USE_PREV_PAID_CARD
		  INTO V_RETURN_CHANGE_TYPE,
		       V_RTRN_COUPON_BILL,
		       V_USE_PREV_PAID_CARD
		   FROM IAS_PARA_POS ;
	     EXCEPTION
		  WHEN OTHERS THEN
		  NULL;
	     END ;
	IF  V_RETURN_CHANGE_TYPE = 1  THEN
	     BEGIN
		 SELECT RETURN_PERIOD,
			CHANGE_PERIOD
		  INTO V_RETURN_PERIOD,
		       V_CHANGE_PERIOD
		   FROM IAS_PARA_POS ;
	     EXCEPTION
		  WHEN OTHERS THEN
		  V_RETURN_PERIOD := NULL;
		  V_CHANGE_PERIOD := NULL;
	     END ;
	ELSIF V_RETURN_CHANGE_TYPE = 2	THEN
	     BEGIN
		 SELECT RETURN_PERIOD,
			CHANGE_PERIOD
		  INTO V_RETURN_PERIOD,
		       V_CHANGE_PERIOD
		   FROM IAS_POS_MACHINE
		    WHERE UPPER(TERMINAL)=UPPER(P_DVC_SRL);
	     EXCEPTION WHEN OTHERS THEN
		      V_RETURN_PERIOD := NULL;
		      V_CHANGE_PERIOD := NULL;
	     END ;
	END IF ;
	IF V_CHANGE_PERIOD IS NOT NULL OR V_RETURN_PERIOD IS NOT NULL THEN
	      V_SQL :='  Select bill_date
			   From '||V_TBL_NM_MST||'
			    Where Bill_No = '||P_bill_no;
	       V_Bill_Date:= Ias_Pos_Distibuted_Db_Pkg.Get_Date(V_SQL);
	      If V_Bill_Date Is Not Null Then
		    If V_Change_Period Is Not Null and V_Change_Period >=Nvl(V_Return_Period,0)  Then
			   If to_date(SYSDATE,'DD/MM/YYYY') -To_date(V_Bill_Date,'DD/MM/YYYY') > V_Change_Period Then
			     V_Err_No	 :=20010;
			     V_MSG_NO	 :=1252;
			     V_LBL_NO	 :=779;
			     G_Msg_Txt	 := V_Bill_Date;
			     Goto Rtn_rslt;
			   END IF;
		    ElsIf V_Return_Period Is Not Null and V_Return_Period >=Nvl(V_Change_Period,0)  Then
			   If To_date(SYSDATE,'DD/MM/YYYY') -To_date(V_Bill_Date,'DD/MM/YYYY') > V_Return_Period Then
			     V_Err_No	 :=20011;
			     V_MSG_NO	 :=1251;
			     V_LBL_NO	 :=779;
			     G_Msg_Txt	 := V_Bill_Date;
			     Goto Rtn_rslt;
			   End If ;
		    End If;
	      End If ;
	END IF;
	--##------------------------------------------------------------------------------##--
	IF V_Rtrn_Coupon_Bill =1 And  Nvl(V_Use_Prev_Paid_Card,0) = 1 Then
	    V_SQL :='  Select COUNT(1)
			   From '||V_TBL_NM_MST||'
			    Where NVL(CARD_AMT,0)>0 AND Bill_No = '||P_bill_no;
	   V_Cnt := Ias_Gen_Pkg.Get_Cnt(V_SQL);
	   IF NVL(V_Cnt,0)>0 THEN
	     V_Err_No	 :=200012;
	     G_Msg_Txt	 := P_bill_no;
	     V_MSG_NO	 :=4271;
	     Goto Rtn_rslt;
	   END IF;
	END IF;
	---------------------------------------------------------------------
	 V_Bill_Rate_Fld:=' POS_API_PKG.GET_CUR_RATE_FNC(P_A_CY   =>A_CY,
					     P_USR_NO=> '||P_Usr_no||')';
	---------------------------------------------------------------------

	   V_SQL:= 'SELECT
		    BILL_NO,
		    BILL_SRL,
		    BILL_DATE,
		    BILL_TYPE,
		    C_CODE,
		    A_CY,
		    '||V_Bill_Rate_FLD||' Bill_Rate ,
		    cust_code,
		    Mobile_No,
		    (SELECT DECODE ('||P_LNG_NO||', 1, NVL (C_A_NAME, C_E_NAME),NVL (C_E_NAME, C_A_NAME))
		     FROM CUSTOMER WHERE C_CODE = '||V_TBL_NM_MST||'.C_CODE AND ROWNUM <= 1) CSTMR_NM,
		    (SELECT DECODE ('||P_LNG_NO||', 1, NVL (CUST_L_NM, CUST_F_NM),NVL (CUST_F_NM, CUST_L_NM))
		     FROM IAS_CASH_CUSTMR WHERE CUST_CODE = NVL ('||V_TBL_NM_MST||'.CUST_CODE,0) AND ROWNUM <= 1) CSTMR_CSH_NM,
		    CREDIT_CARD, CR_CARD_NO, CR_CARD_AMT, CR_CARD_NO_SCND, CR_CARD_AMT_SCND, CR_CARD_NO_THRD, CR_CARD_AMT_THRD,  CR_CARD_DSC, CR_CARD_DSC_SCND, CR_CARD_DSC_THRD,
		    CR_CARD_COMM_PER, CR_CARD_COMM_PER_SCND, CR_CARD_COMM_PER_THRD,
		    CRD_DISC_PER,
		    Emp_no,
		    Rep_Code,
		    W_Code,
		    Machine_no,
		    Bill_Rtrn,
		    DISC_AMT_AFTR_VAT,
		    Clc_Typ_No_Tax,
		    CLC_TAX_FREE_QTY_FLG,
		    Card_Amt,
		    Pymnt_Ac,
		    Ac_Code,
		    Ac_Code_Dtl,
		    Ac_Dtl_Typ,
		    Ac_Amt,
		    Point_Typ_No,
		    Point_Calc_Typ_No,
		    POINT_RPLC_AMT,
		    BILL_DOC_TYPE_SUB,
		    ASS_NO,
		    ASS_AMT,
		    ASS_AMT_OTHR,
		    TAX_BILL_TYP,
		    C_TAX_CODE,
		    WEB_SRVC_TRNSFR_DATA_FLG,
		    WEB_SRVC_UUID,
		    WEB_SRVC_TRNSFR_DATA_DSC,
		    ADVNC_PYMNT_AMT,
		    OTHR_AMT
		    FROM '||V_TBL_NM_MST||'
		    WHERE BILL_NO='||P_BILL_NO||'
		    '||V_WHR||'
		    ';

      QRY_CTX :=DBMS_XMLGEN.NEWCONTEXT (V_SQL);
      DBMS_XMLGEN.SETNULLHANDLING(QRY_CTX,DBMS_XMLGEN.EMPTY_TAG);
      QRY_RSLT := DBMS_XMLGEN.GETXML(QRY_CTX);
    RETURN QRY_RSLT;

     --####################--
      <<RTN_RSLT>>

      IF V_MSG_NO IS NOT NULL AND V_LBL_NO IS NOT NULL THEN
	 RETURN '{"_Result": { "_Doc_No":"' || P_BILL_NO || '","_ErrMsg":" ' || IAS_GEN_PKG.GET_MSG(P_LNG_NO => V_LNG_NO, P_MSG_NO => V_MSG_NO) || ' - ' || IAS_GEN_PKG.GET_PROMPT (P_LNG_NO => V_LNG_NO, P_LBL_NO => V_LBL_NO)||' '||G_MSG_TXT|| '","_ErrNo":-70 } }';
      ELSIF V_MSG_NO IS NOT NULL THEN
	 RETURN '{"_Result": { "_Doc_No":"' || P_BILL_NO || '","_ErrMsg":" ' || IAS_GEN_PKG.GET_MSG(P_LNG_NO => V_LNG_NO, P_MSG_NO => V_MSG_NO) ||' '||G_MSG_TXT|| '","_ErrNo":-71 } }';
      ELSE
	 RETURN NULL;
      END IF;
    --####################--
 EXCEPTION WHEN OTHERS THEN
       RETURN SQLERRM;
 End GET_BILL_MST_XML;
---##--------------------------------------------------------------------------------------------------##---
FUNCTION GET_BILL_DTL_XML(P_BILL_NO IN IAS_POS_BILL_MST.BILL_NO%TYPE
			 ,P_DVC_SRL IN VARCHAR2
			 ,P_USR_NO  IN USER_R.U_ID%TYPE
			 ,P_BRN_USR IN IAS_POS_BILL_MST.BRN_USR%TYPE
			 ,P_LNG_NO  IN NUMBER  ) RETURN  CLOB IS

       V_Cnt		   Number:=0;
       V_LNG_NO 	   NUMBER;
       V_USR_NM 	   Varchar2(100);
       V_SQL		   Varchar2(8000);
       QRY_CTX	 DBMS_XMLGEN.CTXHANDLE;
       QRY_RSLT  CLOB;
       V_WHR		   Varchar2(1000);
       V_TBL_NM_DTL	   Varchar2(500);
       V_Move_Data_To_Db_Link Varchar2(200);
   BEGIN
	V_LNG_NO:=NVL(P_LNG_NO,1);
	---------------------------------------------------------------------
	 If P_bill_no Is Null Then
	     V_Err_No	 := 20001;
	     V_MSG_NO	 :=898;
	     Goto Rtn_Rslt;
	 End If;
	 If P_Usr_no is Null  Then
	      V_Err_No	  := 20002;
	      V_MSG_NO	  :=450;
	      Goto Rtn_Rslt;
	 End If;
	 If P_BRN_USR is Null  Then
	      V_Err_No	  := 20003;
	      V_MSG_NO	  :=1601;
	      G_Msg_Txt   := 'Accounting Unit IS NULL';
	      Goto Rtn_Rslt;
	 End If;
	 V_USR_NM:='YSPOS'||P_BRN_USR;
	 V_CNT := IAS_GEN_PKG.GET_CNT('Select 1 From All_Users Where UserName='''||V_USR_NM||''' And RowNum<=1');

	 If Nvl(V_cnt,0)=0 Then
	      V_Err_No	  := 20002;
	      V_MSG_NO	  :=298;
	      Goto Rtn_Rslt;
	 End If;
	--##-----------------------------------------------------------------------##--
	--##check bill no
	V_SQL :='  Select COUNT(1)
		       From '||V_USR_NM||'.Ias_Pos_Bill_Dtl
			Where Bill_No = '||P_bill_no||' And RowNum<=1 ';
	V_Cnt := Ias_Gen_Pkg.Get_Cnt(V_SQL);
	If Nvl(V_Cnt,0)>0 Then
	   V_TBL_NM_DTL :=V_USR_NM||'.Ias_Pos_Bill_Dtl';
	Else
	      V_SQL :='  Select 1
		       From '||V_USR_NM||'.Ias_Pos_Hst_Bill_Dtl
			Where Bill_No = '||P_bill_no||' And RowNum<=1 ';
	       V_Cnt := Ias_Gen_Pkg.Get_Cnt(V_SQL);
		If Nvl(V_Cnt,0)>0 Then
		   V_TBL_NM_DTL :=V_USR_NM||'.IAS_POS_HST_BILL_Dtl';
		Else
		  IF NVL(CHECK_DB_SRVR_TYP_FNC,0)=0 Then
		    V_Err_No	:= 20005;
		    G_Msg_Txt	:= P_bill_no;
		    V_MSG_NO	:=899;
		    Goto Rtn_Rslt;
		  Else
		      Begin
		       Select
			     Move_Data_To_Db_Link
			Into V_Move_Data_To_Db_Link
			  From Ias_pos_machine
			   Where Upper(terminal)=Upper(P_DVC_SRL);
		      Exception When Others Then
			V_Move_Data_To_Db_Link:='ONYX.ONYX.COM';
		      End;
		      V_SQL :='  Select 1
			   From '||V_USR_NM||'.Ias_Pos_Bill_Dtl@'||V_Move_Data_To_Db_Link||'
			    Where Bill_No = '||P_bill_no||' And RowNum<=1 ';
		      V_Cnt := Ias_Gen_Pkg.Get_Cnt(V_SQL);
		      If Nvl(V_Cnt,0)>0 Then
			 V_TBL_NM_DTL :=V_USR_NM||'.Ias_Pos_Hst_Bill_Dtl@'||V_Move_Data_To_Db_Link;
		      Else
			 V_Err_No    := 20006;
			 G_Msg_Txt   := P_bill_no;
			 V_MSG_NO    :=899;
			 Goto Rtn_Rslt;
		      End If;
		  End If;
		End If;
	End If;
	IF V_TBL_NM_DTL IS NULL THEN
	     V_Err_No	 :=20007;
	     G_Msg_Txt	 := P_bill_no;
	     V_MSG_NO	 :=899;
	     Goto Rtn_rslt;
	END IF;
	---------------------------------------------------------------------
	   V_SQL:= 'SELECT D.BILL_NO,
			   D.I_CODE,
			   IAS_Itm_Pkg.Get_Itm_Name (p_i_code=>D.I_CODE,P_Lng_no=>'||P_LNG_NO||') I_NAME,
			   D.ITM_UNT,
			   D.P_SIZE,
			   D.I_QTY,
			   NVL(D.FREE_QTY,0) FREE_QTY,
			   D.P_QTY,
			   NVL(D.I_PRICE,0) I_PRICE,
			   NVL(D.I_PRICE_VAT,0) I_PRICE_VAT,
			   NVL(D.DIS_PER,0) DIS_PER,
			   NVL(D.DIS_AMT,0) DIS_AMT,
			   NVL(D.DIS_AMT_MST,0) DIS_AMT_MST,
			   NVL(D.DIS_AMT_DTL,0) DIS_AMT_DTL,
			   NVL(D.DIS_AMT_DTL_VAT,0) DIS_AMT_DTL_VAT,
			   NVL(D.VAT_PER,0) VAT_PER,
			   NVL(D.VAT_AMT,0) VAT_AMT,
			   NVL(D.BATCH_NO,0) BATCH_NO,
			   NVL(D.EXPIRE_DATE,''01/01/1900'') EXPIRE_DATE,
			   Nvl(D.BARCODE,'' '') BARCODE,
			   D.W_CODE,
			   Nvl(D.EMP_NO,'''') EMP_NO,
			   NVL(D.SERVICE_ITEM,0) SERVICE_ITEM,
			   NVL(D.RCRD_NO,0)  RCRD_NO,
			   NVL(D.QT_PRM_NO,'''') QT_PRM_NO,
			   NVL(D.QT_PRM_SER,'''') QT_PRM_SER,
			   NVL(D.QT_PRM_RCRD_NO,'''') QT_PRM_RCRD_NO,
			   NVL(D.PRM_GRP_NO,'''') PRM_GRP_NO,
			   NVL(D.ORDER_SER,'''') ORDER_SER,
			   NVL(D.ORDER_NO,'''') ORDER_NO,
			   NVL(D.FIELD_DTL1,'''') FIELD_DTL1,
			   NVL(D.FIELD_DTL2,'''') FIELD_DTL2,
			   NVL(D.FIELD_DTL3,'''') FIELD_DTL3,
			   NVL(D.FIELD_DTL4,'''') FIELD_DTL4,
			   NVL(D.QT_I_QTY,'''') QT_I_QTY,
			   NVL(D.DIS_AFTR_VAT_MST,0) DIS_AFTR_VAT_MST,
			   NVL(D.DIS_AMT_MST_VAT,0)  DIS_AMT_MST_VAT,
			   NVL(D.DIS_AMT_DTL_HL_PRM,0) DIS_AMT_DTL_HL_PRM,
			   NVL(D.OTHR_AMT,0) OTHR_AMT,
			   NVL(D.QR_CODE,'''') QR_CODE,
			   D.CMP_NO,
			   D.BRN_NO,
			   D.BRN_YEAR,
			   D.BRN_USR,
			   NVL(M.USE_EXP_DATE,0) USE_EXP_DATE,
			   NVL(M.USE_BATCH_NO,0) USE_BATCH_NO
		    FROM '||V_TBL_NM_DTL||' D,Ias_Itm_Mst m
		    WHERE D.BILL_NO='||P_BILL_NO||'
		      AND D.I_CODE=M.I_CODE
		    '||V_WHR||'
		    ';

      QRY_CTX :=DBMS_XMLGEN.NEWCONTEXT (V_SQL);
      DBMS_XMLGEN.SETNULLHANDLING(QRY_CTX,DBMS_XMLGEN.EMPTY_TAG);
      QRY_RSLT := DBMS_XMLGEN.GETXML(QRY_CTX);
    RETURN QRY_RSLT;
     --####################--
      <<RTN_RSLT>>
       IF V_MSG_NO IS NOT NULL AND V_LBL_NO IS NOT NULL THEN
	 RETURN '{"_Result": { "_Doc_No":"' || P_BILL_NO || '","_ErrMsg":" ' || IAS_GEN_PKG.GET_MSG(P_LNG_NO => V_LNG_NO, P_MSG_NO => V_MSG_NO) || ' - ' || IAS_GEN_PKG.GET_PROMPT (P_LNG_NO => V_LNG_NO, P_LBL_NO => V_LBL_NO)||' '||G_MSG_TXT|| '","_ErrNo":-70 } }';
      ELSIF V_MSG_NO IS NOT NULL THEN
	 RETURN '{"_Result": { "_Doc_No":"' || P_BILL_NO || '","_ErrMsg":" ' || IAS_GEN_PKG.GET_MSG(P_LNG_NO => V_LNG_NO, P_MSG_NO => V_MSG_NO) ||' '||G_MSG_TXT|| '","_ErrNo":-71 } }';
      ELSE
	 RETURN NULL;
      END IF;
    --####################--
 EXCEPTION WHEN OTHERS THEN
       RETURN SQLERRM;
 END GET_BILL_DTL_XML;
 --##-----------------------------------------------------------------------------------------------------##--
 PROCEDURE EXTRCT_POS_SALES_ORDR_PRC(P_XML	 IN  CLOB,
				    P_JSON_RSLT  OUT VARCHAR) IS

    V_XML_TYPE	 XMLTYPE;
    V_ORDER_SER  SALES_ORDER.ORDER_SER%TYPE;
    V_ORDER_NO	 SALES_ORDER.ORDER_NO%TYPE;
    V_ROW_INSRTD BOOLEAN := FALSE;
    V_ERR_MSG	 VARCHAR2 (2000);
    V_RCRD_NO	 NUMBER;
BEGIN
    V_XML_TYPE :=XMLTYPE.CREATEXML ( P_XML);
    V_ROW_INSRTD := FALSE;

      FOR M_CV IN
	    (SELECT    EXTRACTVALUE (VALUE (XMLMSTDMY), '*/SO_TYPE	 ') AS	SO_TYPE
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DOC_NO	 ') AS	ORDER_NO
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DOC_SER	 ') AS	ORDER_SER
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DOC_DATE	 ') AS	ORDER_DATE
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/ORDER_TIME	 ') AS	ORDER_TIME
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CUR_CODE	 ') AS	ORDER_CUR
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CUR_RATE	 ') AS	CUR_RATE
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/C_CODE	 ') AS	C_CODE
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/C_NAME	 ') AS	C_NAME
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/A_DESC	 ') AS	A_DESC
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CC_CODE	 ') AS	CC_CODE
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/PJ_NO	 ') AS	PJ_NO
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/ACTV_NO	 ') AS	ACTV_NO
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/W_CODE	 ') AS	W_CODE
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/REP_CODE	 ') AS	REP_CODE
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/EMP_NO	 ') AS	EMP_NO
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/PROCESED	 ') AS	PROCESED
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/STAND_BY	 ') AS	STAND_BY
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/VAT_AMT	 ') AS	VAT_AMT
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/ORDER_AMT	 ') AS	ORDER_AMT
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DISC_AMT	 ') AS	DISC_AMT
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DISC_AMT_MST  ') AS	DISC_AMT_MST
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DISC_AMT_MST_VAT ') AS  DISC_AMT_MST_VAT
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DISC_AMT_DTL     ') AS  DISC_AMT_DTL
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/OTHR_AMT	    ') AS  OTHR_AMT
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/APPROVED	    ') AS  APPROVED
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/APRV_U_ID	    ') AS  APRV_U_ID
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/APRV_DATE	    ') AS  APRV_DATE
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/APRV_DSC	    ') AS  APRV_DSC
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CHEQUE_AMT	    ') AS  CHEQUE_AMT
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/INACTIVE	    ') AS  INACTIVE
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/INACTIVE_RES     ') AS  INACTIVE_RES
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/INACTIVE_DATE    ') AS  INACTIVE_DATE
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/INACTIVE_U_ID    ') AS  INACTIVE_U_ID
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/R_CODE	    ')	AS  R_CODE
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/PRM_CODE	    ') AS  PRM_CODE
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DRIVER_NO	    ') AS  DRIVER_NO
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/ORDER_EXPIRE_DATE  ') AS  ORDER_EXPIRE_DATE
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FIELD1	     ') AS  FIELD1
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FIELD2	     ') AS  FIELD2
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FIELD3	     ') AS  FIELD3
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FIELD4	     ') AS  FIELD4
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FIELD5	     ') AS  FIELD5
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FIELD6	     ') AS FIELD6
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FIELD7	     ') AS FIELD7
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FIELD8	     ') AS FIELD8
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FIELD9	     ') AS  FIELD9
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FIELD10	     ') AS  FIELD10
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/AD_U_ID	     ') AS  AD_U_ID
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/AD_DATE	     ') AS  AD_DATE
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/UP_U_ID	     ') AS  UP_U_ID
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/UP_DATE	     ') AS  UP_DATE
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/UP_CNT	     ') AS  UP_CNT
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/PR_REP	     ') AS  PR_REP
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CMP_NO	     ') AS  CMP_NO
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BRN_NO	     ') AS  BRN_NO
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BRN_YEAR	     ') AS  BRN_YEAR
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BRN_USR	     ') AS  BRN_USR
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/MACHINE_NO	     ') AS  MACHINE_NO
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/C_CODE_CSH	     ') AS  CUST_CODE
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/C_MOBILE	     ') AS  MOBILE_NO
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/PYMNT_TYPE	     ') AS  PYMNT_TYPE
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CASH_NO	     ') AS  CASH_NO
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CSH_PYMNT_AMT     ') AS  CSH_PYMNT_AMT
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CREDIT_CARD	     ') AS  CREDIT_CARD
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_NO	     ') AS  CR_CARD_NO
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_AMT	     ') AS  CR_CARD_AMT
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_COMM_PER  ') AS  CR_CARD_COMM_PER
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_DSC	     ') AS  CR_CARD_DSC
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_CST_NO    ') AS  CR_CARD_CST_NO
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_NO_SCND   ') AS  CR_CARD_NO_SCND
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_AMT_SCND  ') AS  CR_CARD_AMT_SCND
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_COMM_PER_SCND    ') AS  CR_CARD_COMM_PER_SCND
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_DSC_SCND	    ') AS  CR_CARD_DSC_SCND
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_CST_NO_SCND	    ') AS  CR_CARD_CST_NO_SCND
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_NO_THRD	    ') AS  CR_CARD_NO_THRD
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_AMT_THRD	    ') AS  CR_CARD_AMT_THRD
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_COMM_PER_THRD    ') AS  CR_CARD_COMM_PER_THRD
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_DSC_THRD	    ') AS  CR_CARD_DSC_THRD
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CR_CARD_CST_NO_THRD	    ') AS  CR_CARD_CST_NO_THRD
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/ADVNC_PYMNT_A_CODE	    ') AS  ADVNC_PYMNT_A_CODE
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/ADVNC_PYMNT_AC_CODE_DTL  ') AS  ADVNC_PYMNT_AC_CODE_DTL
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/ADVNC_PYMNT_AC_DTL_TYP   ') AS  ADVNC_PYMNT_AC_DTL_TYP
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DOC_SER_EXTRNL	    ') AS  DOC_SER_EXTRNL
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/EXTERNAL_POST	 ') AS EXTERNAL_POST
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/SHO_SYS_TYP	       ') AS SHO_SYS_TYP
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/NOTE_NO	   ') AS NOTE_NO
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CSTMR_TYP	     ') AS CSTMR_TYP
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/C_ADDRESS	     ') AS C_ADDRESS
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/LATITUDE	    ') AS LATITUDE
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/LONGITUDE	     ') AS LONGITUDE
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/AD_TRMNL_NM	       ') AS AD_TRMNL_NM
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DISC_AMT_AFTR_VAT	     ') AS DISC_AMT_AFTR_VAT
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/POINT_TYP_NO 	') AS POINT_TYP_NO
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/POINT_CNT	     ') AS POINT_CNT
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/RCPNT_CMPNY	       ') AS RCPNT_CMPNY
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/RCPNT_NAME	      ') AS RCPNT_NAME
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/RCPNT_EMAIL	       ') AS RCPNT_EMAIL
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/RCPNT_ADDRESS	 ') AS RCPNT_ADDRESS
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/RCPNT_CITY	      ') AS RCPNT_CITY
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/RCPNT_POST_CODE	   ') AS RCPNT_POST_CODE
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/RCPNT_STATE	       ') AS RCPNT_STATE
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/RCPNT_CNTRY	       ') AS RCPNT_CNTRY
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/RCPNT_CNTRY_CODE	    ') AS RCPNT_CNTRY_CODE
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FRGHT_CMPNY	       ') AS FRGHT_CMPNY
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CLC_TAX_EXTRNAL_FLG	 ') AS	CLC_TAX_EXTRNAL_FLG
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/SAVE_TYP		 ') AS	SAVE_TYP
		      ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/LNG_NO') AS LNG_NO
	    FROM TABLE (XMLSEQUENCE (EXTRACT (V_XML_TYPE, '/SAL_ORDR/SALES_ORDER'))) XMLMSTDMY)
   LOOP --(1)
   --##--------------------------------------------------------------------------------##--
    G_SRVR_NO :=POS_GNR_PKG.GET_SRVR_NO_FNC;
    G_SAVE_TYP:=NVL(M_CV.SAVE_TYP,0);
    G_CLC_TAX_EXTRNAL_FLG:=M_CV.CLC_TAX_EXTRNAL_FLG;
    G_LNG_NO  :=NVL(M_CV.LNG_NO,1);
    G_Ad_U_Id :=M_CV.AD_U_ID;
    IF M_CV.W_CODE IS NOT NULL THEN
       G_WCODE:=M_CV.W_CODE;
    END IF;
    IF M_CV.BRN_NO IS NOT NULL THEN
	G_BRN_NO:=M_CV.BRN_NO;
    END IF;
	  --------------------------------------------------------------------------------
	  IF M_CV.ORDER_NO IS NOT NULL AND NVL(M_CV.SAVE_TYP,0)=0 THEN
	     V_ORDER_NO  :=M_CV.ORDER_NO;
	  ELSE
	    BEGIN
	      SELECT NVL(MAX(TO_NUMBER(ORDER_NO)),0)+1 INTO V_ORDER_NO
	       FROM SALES_ORDER WHERE BRN_NO = M_CV.BRN_NO;
	    EXCEPTION WHEN OTHERS THEN
		  RAISE_APPLICATION_ERROR(-20903,'Error App When Get Order_no '||CHR(10)||SQLERRM) ;
	    END;
	  END IF;
	  IF V_ORDER_NO IS NOT NULL THEN
	     V_ORDER_SER:= SUBSTR(M_CV.BRN_YEAR,3,2)||POS_GNR_PKG.GET_SRVR_NO_FNC||LPAD(M_CV.MACHINE_NO,5,0)||LPAD(M_CV.BRN_NO,6,'0')||V_ORDER_NO;
	  END IF;
	  ---------------------------------------------------------------------------------
	  IF V_ORDER_SER IS NULL THEN
	     ROLLBACK;
	     RAISE_APPLICATION_ERROR(-20904,'Error App Order_ser Is Null '||CHR(10)||SQLERRM);
	  END IF;
	  ---------------------------------------------------------------------------------
     BEGIN
       V_ERR_MSG :=INSRT_SALES_ORDER_MST_FNC( P_SO_TYPE       =>M_CV.SO_TYPE
		,P_ORDER_NO		  =>V_ORDER_NO
		,P_ORDER_SER		  =>V_ORDER_SER
		,P_ORDER_DATE		  =>TO_DATE(TO_CHAR(M_CV.ORDER_DATE),'DD/MM/RRRR')
		,P_ORDER_TIME		  =>M_CV.ORDER_TIME
		,P_ORDER_CUR		  =>M_CV.ORDER_CUR
		,P_CUR_RATE		  =>M_CV.CUR_RATE
		,P_C_CODE		  =>M_CV.C_CODE
		,P_C_NAME		  =>M_CV.C_NAME
		,P_A_DESC		  =>M_CV.A_DESC
		,P_CC_CODE		  =>M_CV.CC_CODE
		,P_PJ_NO		  =>M_CV.PJ_NO
		,P_ACTV_NO		  =>M_CV.ACTV_NO
		,P_W_CODE		  =>M_CV.W_CODE
		,P_REP_CODE		  =>M_CV.REP_CODE
		,P_EMP_NO		  =>M_CV.EMP_NO
		,P_PROCESED		  =>M_CV.PROCESED
		,P_STAND_BY		  =>M_CV.STAND_BY
		,P_VAT_AMT		  =>M_CV.VAT_AMT
		,P_ORDER_AMT		  =>M_CV.ORDER_AMT
		,P_DISC_AMT		  =>M_CV.DISC_AMT
		,P_DISC_AMT_MST 	  =>M_CV.DISC_AMT_MST
		,P_DISC_AMT_MST_VAT	  =>M_CV.DISC_AMT_MST_VAT
		,P_DISC_AMT_DTL 	  =>M_CV.DISC_AMT_DTL
		,P_OTHR_AMT		  =>M_CV.OTHR_AMT
		,P_APPROVED		  =>M_CV.APPROVED
		,P_APRV_U_ID		  =>M_CV.APRV_U_ID
		,P_APRV_DATE		  =>TO_DATE(TO_CHAR(M_CV.APRV_DATE),'DD/MM/RRRR')
		,P_APRV_DSC		  =>M_CV.APRV_DSC
		,P_INACTIVE		  =>M_CV.INACTIVE
		,P_INACTIVE_RES 	  =>M_CV.INACTIVE_RES
		,P_INACTIVE_DATE	  =>TO_DATE(TO_CHAR(M_CV.INACTIVE_DATE),'DD/MM/RRRR')
		,P_INACTIVE_U_ID	  =>M_CV.INACTIVE_U_ID
		,P_R_CODE		  =>M_CV.R_CODE
		,P_PRM_CODE		  =>M_CV.PRM_CODE
		,P_DRIVER_NO		  =>M_CV.DRIVER_NO
		,P_ORDER_EXPIRE_DATE	  =>TO_DATE(TO_CHAR(M_CV.ORDER_EXPIRE_DATE),'DD/MM/RRRR')
		,P_FIELD1		  =>M_CV.FIELD1
		,P_FIELD2		  =>M_CV.FIELD2
		,P_FIELD3		  =>M_CV.FIELD3
		,P_FIELD4		  =>M_CV.FIELD4
		,P_FIELD5		  =>M_CV.FIELD5
		,P_FIELD6		  =>M_CV.FIELD6
		,P_FIELD7		  =>M_CV.FIELD7
		,P_FIELD8		  =>M_CV.FIELD8
		,P_FIELD9		  =>M_CV.FIELD9
		,P_FIELD10		   =>M_CV.FIELD10
		,P_AD_U_ID		   =>M_CV.AD_U_ID
		,P_AD_DATE		   =>TO_DATE(TO_CHAR(M_CV.AD_DATE),'DD/MM/RRRR')
		,P_UP_U_ID		   =>M_CV.UP_U_ID
		,P_UP_DATE		   =>TO_DATE(TO_CHAR(M_CV.UP_DATE),'DD/MM/RRRR')
		,P_UP_CNT		   =>M_CV.UP_CNT
		,P_PR_REP		   =>M_CV.PR_REP
		,P_CMP_NO		   =>M_CV.CMP_NO
		,P_BRN_NO		   =>M_CV.BRN_NO
		,P_BRN_YEAR		   =>M_CV.BRN_YEAR
		,P_BRN_USR		   =>M_CV.BRN_USR
		,P_MACHINE_NO		   =>M_CV.MACHINE_NO
		,P_CUST_CODE		   =>M_CV.CUST_CODE
		,P_MOBILE_NO		   =>M_CV.MOBILE_NO
		,P_PYMNT_TYPE		   =>M_CV.PYMNT_TYPE
		,P_CASH_NO		   =>M_CV.CASH_NO
		,P_CSH_PYMNT_AMT	   =>M_CV.CSH_PYMNT_AMT
		,P_CREDIT_CARD		   =>M_CV.CREDIT_CARD
		,P_CR_CARD_NO		   =>M_CV.CR_CARD_NO
		,P_CR_CARD_AMT		   =>M_CV.CR_CARD_AMT
		,P_CR_CARD_COMM_PER	   =>M_CV.CR_CARD_COMM_PER
		,P_CR_CARD_DSC		   =>M_CV.CR_CARD_DSC
		,P_CR_CARD_CST_NO	   =>M_CV.CR_CARD_CST_NO
		,P_CR_CARD_NO_SCND	   =>M_CV.CR_CARD_NO_SCND
		,P_CR_CARD_AMT_SCND	   =>M_CV.CR_CARD_AMT_SCND
		,P_CR_CARD_COMM_PER_SCND   =>M_CV.CR_CARD_COMM_PER_SCND
		,P_CR_CARD_DSC_SCND	   =>M_CV.CR_CARD_DSC_SCND
		,P_CR_CARD_CST_NO_SCND	   =>M_CV.CR_CARD_CST_NO_SCND
		,P_CR_CARD_NO_THRD	   =>M_CV.CR_CARD_NO_THRD
		,P_CR_CARD_AMT_THRD	   =>M_CV.CR_CARD_AMT_THRD
		,P_CR_CARD_COMM_PER_THRD   =>M_CV.CR_CARD_COMM_PER_THRD
		,P_CR_CARD_DSC_THRD	   =>M_CV.CR_CARD_DSC_THRD
		,P_CR_CARD_CST_NO_THRD	   =>M_CV.CR_CARD_CST_NO_THRD
		,P_ADVNC_PYMNT_A_CODE	   =>M_CV.ADVNC_PYMNT_A_CODE
		,P_ADVNC_PYMNT_AC_CODE_DTL =>M_CV.ADVNC_PYMNT_AC_CODE_DTL
		,P_ADVNC_PYMNT_AC_DTL_TYP  =>M_CV.ADVNC_PYMNT_AC_DTL_TYP
		,P_DOC_SER_EXTRNL	   =>M_CV.DOC_SER_EXTRNL
		,P_EXTERNAL_POST	   =>M_CV.EXTERNAL_POST
		,P_SHO_SYS_TYP		   =>M_CV.SHO_SYS_TYP
		,P_NOTE_NO		   =>M_CV.NOTE_NO
		,P_CSTMR_TYP		   =>M_CV.CSTMR_TYP
		,P_C_ADDRESS		   =>M_CV.C_ADDRESS
		,P_LATITUDE		   =>M_CV.LATITUDE
		,P_LONGITUDE		   =>M_CV.LONGITUDE
		,P_AD_TRMNL_NM		   =>M_CV.AD_TRMNL_NM
		,P_DISC_AMT_AFTR_VAT	   =>M_CV.DISC_AMT_AFTR_VAT
		,P_POINT_TYP_NO 	   =>M_CV.POINT_TYP_NO
		,P_POINT_CNT		   =>M_CV.POINT_CNT
		,P_RCPNT_CMPNY		   =>M_CV.RCPNT_CMPNY
		,P_RCPNT_NAME		   =>M_CV.RCPNT_NAME
		,P_RCPNT_EMAIL		   =>M_CV.RCPNT_EMAIL
		,P_RCPNT_ADDRESS	   =>M_CV.RCPNT_ADDRESS
		,P_RCPNT_CITY		   =>M_CV.RCPNT_CITY
		,P_RCPNT_POST_CODE	   =>M_CV.RCPNT_POST_CODE
		,P_RCPNT_STATE		   =>M_CV.RCPNT_STATE
		,P_RCPNT_CNTRY		   =>M_CV.RCPNT_CNTRY
		,P_RCPNT_CNTRY_CODE	   =>M_CV.RCPNT_CNTRY_CODE
		,P_FRGHT_CMPNY		   =>M_CV.FRGHT_CMPNY
		,P_LNG_NO		   =>M_CV.LNG_NO
		 )  ;
	    IF V_ERR_MSG IS NOT NULL
	    THEN
	       P_JSON_RSLT := '{"_Result": { "_ErrMsg":"' || V_ERR_MSG|| '","_ErrNo":-1 } }';
	       --P_JSON_RSLT := '{"_Result": { "_Doc_No":' || V_ORDER_NO || ',"_Doc_Ser":' || V_ORDER_SER || ',"_ErrMsg":"' || V_ERR_MSG|| '","_ErrNo":-1 } }';
	       ROLLBACK;

	       RETURN;
	    END IF;
     EXCEPTION
	    WHEN OTHERS THEN
	       ROLLBACK;
		P_JSON_RSLT := '{"_Result": { "_ErrMsg":"Error When Insert Into Sales_order ' || SQLERRM || '","_ErrNo":-2 } }';
	      -- P_JSON_RSLT := '{"_Result": { "_Doc_No":' || V_ORDER_NO || ',"_Doc_Ser":' || V_ORDER_SER || ',"_ErrMsg":"Error When Insert Into Sales_order ' || SQLERRM || '","_ErrNo":-2 } }';
	   RETURN;
     END;
    -------------------------------------------------------------------------------------------------------------------------------
      FOR D_CV IN
			(SELECT      EXTRACTVALUE (VALUE (XMLMSTDMY), '*/SO_TYPE	    ') AS  SO_TYPE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/ORDER_NO	    ') AS  ORDER_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/ORDER_SER	    ') AS  ORDER_SER
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/I_CODE 	    ') AS  I_CODE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/ITM_UNT	    ') AS  ITM_UNT
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/P_SIZE 	    ') AS  P_SIZE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/I_QTY		    ') AS  I_QTY
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FREE_QTY	    ') AS  FREE_QTY
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/P_QTY		    ') AS  P_QTY
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/EXPIRE_DATE	    ') AS  EXPIRE_DATE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BATCH_NO	    ') AS  BATCH_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/I_PRICE	    ') AS  I_PRICE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/I_PRICE_VAT	    ') AS  I_PRICE_VAT
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/VAT_PER	    ') AS  VAT_PER
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/VAT_AMT	    ') AS  VAT_AMT
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DIS_PER	    ') AS  DIS_PER
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DIS_AMT_DTL_VAT    ') AS  DIS_AMT_DTL_VAT
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DIS_AMT_DTL	    ') AS  DIS_AMT_DTL
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DIS_AMT_MST	    ') AS  DIS_AMT_MST
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DIS_AMT_MST_VAT    ') AS  DIS_AMT_MST_VAT
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DIS_AMT	    ') AS  DIS_AMT
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DIS_AMT_AFTR_VAT   ') AS  DIS_AMT_AFTR_VAT
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/OTHR_AMT	    ') AS  OTHR_AMT
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/W_CODE 	    ') AS  W_CODE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/RCRD_NO	    ') AS  RCRD_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BARCODE	    ') AS  BARCODE
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/ITEM_DESC	    ') AS  ITEM_DESC
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CANCELED	    ') AS  CANCELED
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/DOC_SEQ	    ') AS  DOC_SEQ
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/EMP_NO 	    ') AS  EMP_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FIELD_DTL1	    ') AS  FIELD_DTL1
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FIELD_DTL2	    ') AS  FIELD_DTL2
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/FIELD_DTL3	    ') AS FIELD_DTL3
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/CMP_NO 	    ') AS CMP_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BRN_NO 	    ') AS BRN_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BRN_YEAR	    ') AS BRN_YEAR
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/BRN_USR	    ') AS  BRN_USR
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/QT_PRM_SER	    ') AS  QT_PRM_SER
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/QT_PRM_NO	    ') AS  QT_PRM_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/QT_PRM_RCRD_NO     ') AS  QT_PRM_RCRD_NO
				    ,EXTRACTVALUE (VALUE (XMLMSTDMY), '*/LNG_NO') AS LNG_NO
			FROM TABLE (XMLSEQUENCE (EXTRACT (V_XML_TYPE, '/SAL_ORDR/ORDER_DETAIL'))) XMLMSTDMY)
      LOOP --(1)
	    --------------------------------------------------------------------------------
	    -------- TO INSERT IAS_POS_BILL_DTL
  BEGIN 		 --(2)
       V_RCRD_NO := V_RCRD_NO + 1;
       V_ERR_MSG := INSRT_SALES_ORDER_DTL_FNC( P_SO_TYPE	 =>D_CV.SO_TYPE
		,P_ORDER_NO	     =>V_ORDER_NO
		,P_ORDER_SER	     =>V_ORDER_SER
		,P_I_CODE	     =>D_CV.I_CODE
		,P_ITM_UNT	     =>D_CV.ITM_UNT
		,P_P_SIZE	     =>D_CV.P_SIZE
		,P_I_QTY	     =>D_CV.I_QTY
		,P_FREE_QTY	     =>D_CV.FREE_QTY
		,P_P_QTY	     =>D_CV.P_QTY
		,P_EXPIRE_DATE	     =>D_CV.EXPIRE_DATE
		,P_BATCH_NO	     =>D_CV.BATCH_NO
		,P_I_PRICE	     =>D_CV.I_PRICE
		,P_I_PRICE_VAT	     =>D_CV.I_PRICE_VAT
		,P_VAT_PER	     =>D_CV.VAT_PER
		,P_VAT_AMT	     =>D_CV.VAT_AMT
		,P_DIS_PER	     =>D_CV.DIS_PER
		,P_DIS_AMT_DTL_VAT   =>D_CV.DIS_AMT_DTL_VAT
		,P_DIS_AMT_DTL	     =>D_CV.DIS_AMT_DTL
		,P_DIS_AMT_MST	     =>D_CV.DIS_AMT_MST
		,P_DIS_AMT_MST_VAT   =>D_CV.DIS_AMT_MST_VAT
		,P_DIS_AMT	     =>D_CV.DIS_AMT
		,P_DIS_AMT_AFTR_VAT  =>D_CV.DIS_AMT_AFTR_VAT
		,P_OTHR_AMT    =>M_CV.OTHR_AMT
		,P_W_CODE      =>M_CV.W_CODE
		,P_RCRD_NO     =>V_RCRD_NO
		,P_BARCODE     =>D_CV.BARCODE
		,P_ITEM_DESC   =>D_CV.ITEM_DESC
		,P_CANCELED    =>D_CV.CANCELED
		,P_DOC_SEQ     =>D_CV.DOC_SEQ
		,P_EMP_NO      =>D_CV.EMP_NO
		,P_FIELD_DTL1  =>D_CV.FIELD_DTL1
		,P_FIELD_DTL2  =>D_CV.FIELD_DTL2
		,P_FIELD_DTL3  =>D_CV.FIELD_DTL3
		,P_CMP_NO      =>D_CV.CMP_NO
		,P_BRN_NO      =>D_CV.BRN_NO
		,P_BRN_YEAR    =>D_CV.BRN_YEAR
		,P_BRN_USR     =>D_CV.BRN_USR
		,P_QT_PRM_SER  =>D_CV.QT_PRM_SER
		,P_QT_PRM_NO   =>D_CV.QT_PRM_NO
		,P_QT_PRM_RCRD_NO  =>D_CV.QT_PRM_RCRD_NO
		,P_LNG_NO      =>D_CV.LNG_NO
		)  ;

	 IF V_ERR_MSG IS NOT NULL THEN
	    --P_JSON_RSLT := '{"_Result": { "_Doc_No":' || V_ORDER_NO || ',"_Doc_Ser":' || V_ORDER_SER || ',"_ErrMsg":"' || V_ERR_MSG || '","_ErrNo":-3 } }';
	    P_JSON_RSLT := '{"_Result": { "_ErrMsg":"' || V_ERR_MSG || '","_ErrNo":-3 } }';
	    ROLLBACK;
	    RETURN;
	 ELSE
	    V_ROW_INSRTD := TRUE;
	 END IF;
	 --#---------------------------------------------------------------------------------------------------------#--
	 --# INSERT INSRT_OTHR_CHRG_MVMNT
			    V_ERR_MSG :=POS_OTHR_CHRG_PKG.INSRT_OTHR_CHRG_MVMNT ( P_DOC_TYP	=>149,
																		    P_BILL_NO	  =>V_ORDER_NO,
																		    P_BILL_SRL	  =>V_ORDER_SER,
																		    P_XML_INPT	  =>P_XML,
																		    P_LNG_NO	  =>G_LNG_NO);
			    IF V_ERR_MSG IS NOT NULL THEN
				RAISE_APPLICATION_ERROR(-20010,'Err when insert INSRT_OTHR_CHRG_MVMNT ORDER NO= '||V_ORDER_NO ||' '||CHR(10)||V_ERR_MSG);
			    END IF;
			  --#---------------------------------------------------------------------------------------------------------#--
     EXCEPTION
	  WHEN OTHERS THEN
	     ROLLBACK;
	     --P_JSON_RSLT := '{"_Result": { "_Doc_No":' || V_ORDER_NO || ',"_Doc_Ser":' || V_ORDER_SER || ',"_ErrMsg":"Error When Insert Into Order_detail '|| SQLERRM || '","_ErrNo":-4 } }';
	     P_JSON_RSLT := '{"_Result": { "_ErrMsg":"Error When Insert Into Order_detail '|| SQLERRM || '","_ErrNo":-4 } }';
	      ROLLBACK;
	     RAISE;
     END;
     END LOOP;
   ----------------------------------------------------------------------------------------------------------
   COMMIT;
   P_JSON_RSLT := '{"_Result": { "_Doc_No":' || V_ORDER_NO || ',"_Doc_Ser":' || V_ORDER_SER || ',"_ErrMsg":" successfully Saved ","_ErrNo":-0 } }';
   ----------------------------------------------------------------------------------------------------------
   END LOOP; --(1)
 EXCEPTION WHEN OTHERS THEN
       P_JSON_RSLT := '{"_Result": { "_Doc_No":' || V_ORDER_NO || ',"_Doc_Ser":' || V_ORDER_SER || ',"_ErrMsg":"Error When Insert Sales_order ' || SQLERRM || '","_ErrNo":-29 } }';
       ROLLBACK;
 END EXTRCT_POS_SALES_ORDR_PRC;
  --##-----------------------------------------------------------------------------------------------------##--
 FUNCTION INSRT_SALES_ORDER_MST_FNC(P_SO_TYPE	     IN SALES_ORDER.SO_TYPE%TYPE
				   ,P_ORDER_NO	     IN SALES_ORDER.ORDER_NO%TYPE
				   ,P_ORDER_SER      IN SALES_ORDER.ORDER_SER%TYPE
				   ,P_ORDER_DATE     IN SALES_ORDER.ORDER_DATE%TYPE
				   ,P_ORDER_TIME     IN SALES_ORDER.ORDER_TIME%TYPE
				   ,P_ORDER_CUR      IN SALES_ORDER.ORDER_CUR%TYPE
				   ,P_CUR_RATE	     IN SALES_ORDER.CUR_RATE%TYPE
				   ,P_C_CODE	     IN SALES_ORDER.C_CODE%TYPE
				   ,P_C_NAME	     IN SALES_ORDER.C_NAME%TYPE
				   ,P_A_DESC	     IN SALES_ORDER.A_DESC%TYPE
				   ,P_CC_CODE	     IN SALES_ORDER.CC_CODE%TYPE
				   ,P_PJ_NO	     IN SALES_ORDER.PJ_NO%TYPE
				   ,P_ACTV_NO	     IN SALES_ORDER.ACTV_NO%TYPE
				   ,P_W_CODE	     IN SALES_ORDER.W_CODE%TYPE
				   ,P_REP_CODE	     IN SALES_ORDER.REP_CODE%TYPE
				   ,P_EMP_NO	     IN SALES_ORDER.EMP_NO%TYPE
				   ,P_PROCESED	     IN SALES_ORDER.PROCESED%TYPE
				   ,P_STAND_BY	     IN SALES_ORDER.STAND_BY%TYPE
				   ,P_VAT_AMT	     IN SALES_ORDER.VAT_AMT%TYPE
				   ,P_ORDER_AMT      IN SALES_ORDER.ORDER_AMT%TYPE
				   ,P_DISC_AMT	     IN SALES_ORDER.DISC_AMT%TYPE
				   ,P_DISC_AMT_MST   IN SALES_ORDER.DISC_AMT_MST%TYPE
				   ,P_DISC_AMT_MST_VAT IN SALES_ORDER.DISC_AMT_MST_VAT%TYPE
				   ,P_DISC_AMT_DTL     IN SALES_ORDER.DISC_AMT_DTL%TYPE
				   ,P_OTHR_AMT	       IN SALES_ORDER.OTHR_AMT%TYPE  DEFAULT 0
				   ,P_APPROVED	       IN SALES_ORDER.APPROVED%TYPE
				   ,P_APRV_U_ID        IN SALES_ORDER.APRV_U_ID%TYPE
				   ,P_APRV_DATE        IN SALES_ORDER.APRV_DATE%TYPE
				   ,P_APRV_DSC	       IN SALES_ORDER.APRV_DSC%TYPE
				   ,P_INACTIVE		  IN SALES_ORDER.INACTIVE%TYPE	     DEFAULT 0
				   ,P_INACTIVE_RES	  IN SALES_ORDER.INACTIVE_RES%TYPE   DEFAULT NULL
				   ,P_INACTIVE_DATE	  IN SALES_ORDER.INACTIVE_DATE%TYPE  DEFAULT NULL
				   ,P_INACTIVE_U_ID	  IN SALES_ORDER.INACTIVE_U_ID%TYPE  DEFAULT NULL
				   ,P_R_CODE		  IN SALES_ORDER.R_CODE%TYPE	     DEFAULT NULL
				   ,P_PRM_CODE		  IN SALES_ORDER.PRM_CODE%TYPE	     DEFAULT NULL
				   ,P_DRIVER_NO 	  IN SALES_ORDER.DRIVER_NO%TYPE       DEFAULT NULL
				   ,P_ORDER_EXPIRE_DATE   IN SALES_ORDER.ORDER_EXPIRE_DATE%TYPE DEFAULT NULL
				   ,P_FIELD1		    IN SALES_ORDER.FIELD1%TYPE	   DEFAULT NULL
				   ,P_FIELD2		    IN SALES_ORDER.FIELD2%TYPE	   DEFAULT NULL
				   ,P_FIELD3		    IN SALES_ORDER.FIELD3%TYPE	   DEFAULT NULL
				   ,P_FIELD4		    IN SALES_ORDER.FIELD4%TYPE	   DEFAULT NULL
				   ,P_FIELD5		    IN SALES_ORDER.FIELD5%TYPE	   DEFAULT NULL
				   ,P_FIELD6		    IN SALES_ORDER.FIELD6%TYPE	   DEFAULT NULL
				   ,P_FIELD7		    IN SALES_ORDER.FIELD7%TYPE	   DEFAULT NULL
				   ,P_FIELD8		    IN SALES_ORDER.FIELD8%TYPE	   DEFAULT NULL
				   ,P_FIELD9		    IN SALES_ORDER.FIELD9%TYPE	   DEFAULT NULL
				   ,P_FIELD10		    IN SALES_ORDER.FIELD10%TYPE    DEFAULT NULL
				   ,P_AD_U_ID		    IN SALES_ORDER.AD_U_ID%TYPE
				   ,P_AD_DATE		    IN SALES_ORDER.AD_DATE%TYPE
				   ,P_UP_U_ID		    IN SALES_ORDER.UP_U_ID%TYPE
				   ,P_UP_DATE		    IN SALES_ORDER.UP_DATE%TYPE
				   ,P_UP_CNT		    IN SALES_ORDER.UP_CNT%TYPE
				   ,P_PR_REP		    IN SALES_ORDER.PR_REP%TYPE
				   ,P_CMP_NO		    IN SALES_ORDER.CMP_NO%TYPE
				   ,P_BRN_NO		    IN SALES_ORDER.BRN_NO%TYPE
				   ,P_BRN_YEAR		    IN SALES_ORDER.BRN_YEAR%TYPE
				   ,P_BRN_USR		    IN SALES_ORDER.BRN_USR%TYPE
				   ,P_MACHINE_NO	    IN SALES_ORDER.MACHINE_NO%TYPE
				   ,P_CUST_CODE 	    IN SALES_ORDER.CUST_CODE%TYPE
				   ,P_MOBILE_NO 	    IN SALES_ORDER.MOBILE_NO%TYPE
				   ,P_PYMNT_TYPE	    IN SALES_ORDER.PYMNT_TYPE%TYPE
				   ,P_CASH_NO		    IN SALES_ORDER.CASH_NO%TYPE
				   ,P_CSH_PYMNT_AMT	    IN SALES_ORDER.CSH_PYMNT_AMT%TYPE
				   ,P_CREDIT_CARD	    IN SALES_ORDER.CREDIT_CARD%TYPE
				   ,P_CR_CARD_NO	    IN SALES_ORDER.CR_CARD_NO%TYPE
				   ,P_CR_CARD_AMT	    IN SALES_ORDER.CR_CARD_AMT%TYPE
				   ,P_CR_CARD_COMM_PER	    IN SALES_ORDER.CR_CARD_COMM_PER%TYPE
				   ,P_CR_CARD_DSC	    IN SALES_ORDER.CR_CARD_DSC%TYPE
				   ,P_CR_CARD_CST_NO	    IN SALES_ORDER.CR_CARD_CST_NO%TYPE
				   ,P_CR_CARD_NO_SCND	    IN SALES_ORDER.CR_CARD_NO_SCND%TYPE
				   ,P_CR_CARD_AMT_SCND	    IN SALES_ORDER.CR_CARD_AMT_SCND%TYPE
				   ,P_CR_CARD_COMM_PER_SCND IN SALES_ORDER.CR_CARD_COMM_PER_SCND%TYPE
				   ,P_CR_CARD_DSC_SCND	    IN SALES_ORDER.CR_CARD_DSC_SCND%TYPE
				   ,P_CR_CARD_CST_NO_SCND   IN SALES_ORDER.CR_CARD_CST_NO_SCND%TYPE
				   ,P_CR_CARD_NO_THRD	    IN SALES_ORDER.CR_CARD_NO_THRD%TYPE
				   ,P_CR_CARD_AMT_THRD	    IN SALES_ORDER.CR_CARD_AMT_THRD%TYPE
				   ,P_CR_CARD_COMM_PER_THRD IN SALES_ORDER.CR_CARD_COMM_PER_THRD%TYPE
				   ,P_CR_CARD_DSC_THRD	    IN SALES_ORDER.CR_CARD_DSC_THRD%TYPE
				   ,P_CR_CARD_CST_NO_THRD   IN SALES_ORDER.CR_CARD_CST_NO_THRD%TYPE
				   ,P_ADVNC_PYMNT_A_CODE    IN SALES_ORDER.ADVNC_PYMNT_A_CODE%TYPE
				   ,P_ADVNC_PYMNT_AC_CODE_DTL IN SALES_ORDER.ADVNC_PYMNT_AC_CODE_DTL%TYPE
				   ,P_ADVNC_PYMNT_AC_DTL_TYP  IN SALES_ORDER.ADVNC_PYMNT_AC_DTL_TYP%TYPE
				   ,P_DOC_SER_EXTRNL	      IN SALES_ORDER.DOC_SER_EXTRNL%TYPE  DEFAULT NULL
				   ,P_EXTERNAL_POST	      IN SALES_ORDER.EXTERNAL_POST%TYPE  DEFAULT NULL
					       ,P_SHO_SYS_TYP		   IN SALES_ORDER.SHO_SYS_TYP%TYPE  DEFAULT NULL
					       ,P_NOTE_NO		   IN SALES_ORDER.NOTE_NO%TYPE	DEFAULT NULL
					       ,P_CSTMR_TYP		   IN SALES_ORDER.CSTMR_TYP%TYPE  DEFAULT NULL
					       ,P_C_ADDRESS		   IN SALES_ORDER.C_ADDRESS%TYPE  DEFAULT NULL
					       ,P_LATITUDE		   IN SALES_ORDER.LATITUDE%TYPE  DEFAULT NULL
					       ,P_LONGITUDE		   IN SALES_ORDER.LONGITUDE%TYPE  DEFAULT NULL
					       ,P_AD_TRMNL_NM		   IN SALES_ORDER.AD_TRMNL_NM%TYPE  DEFAULT NULL
					       ,P_DISC_AMT_AFTR_VAT	   IN SALES_ORDER.DISC_AMT_AFTR_VAT%TYPE  DEFAULT NULL
					       ,P_POINT_TYP_NO		   IN SALES_ORDER.POINT_TYP_NO%TYPE  DEFAULT NULL
					       ,P_POINT_CNT		   IN SALES_ORDER.POINT_CNT%TYPE  DEFAULT NULL
					       ,P_RCPNT_CMPNY		   IN SALES_ORDER.RCPNT_CMPNY%TYPE  DEFAULT NULL
					       ,P_RCPNT_NAME		   IN SALES_ORDER.RCPNT_NAME%TYPE  DEFAULT NULL
					       ,P_RCPNT_EMAIL		   IN SALES_ORDER.RCPNT_EMAIL%TYPE  DEFAULT NULL
					       ,P_RCPNT_ADDRESS 	   IN SALES_ORDER.RCPNT_ADDRESS%TYPE  DEFAULT NULL
					       ,P_RCPNT_CITY		   IN SALES_ORDER.RCPNT_CITY%TYPE  DEFAULT NULL
					       ,P_RCPNT_POST_CODE	   IN SALES_ORDER.RCPNT_POST_CODE%TYPE	DEFAULT NULL
					       ,P_RCPNT_STATE		   IN SALES_ORDER.RCPNT_STATE%TYPE  DEFAULT NULL
					       ,P_RCPNT_CNTRY		   IN SALES_ORDER.RCPNT_CNTRY%TYPE  DEFAULT NULL
					       ,P_RCPNT_CNTRY_CODE	   IN SALES_ORDER.RCPNT_CNTRY_CODE%TYPE  DEFAULT NULL
					       ,P_FRGHT_CMPNY		   IN SALES_ORDER.FRGHT_CMPNY%TYPE  DEFAULT NULL
				   ,P_CLC_TAX_EXTRNAL_FLG     IN NUMBER  DEFAULT 0  --0 CALC TAX EXTRNAL 1 CALC TAX IN SAVE
				   ,P_SAVE_TYP		      IN NUMBER  DEFAULT 0  --## 0 INSERT OFFLINE BILL 1 INSERT ONL
				   ,P_LNG_NO		      IN NUMBER) RETURN VARCHAR2 IS
   V_CNT	  NUMBER:=0;
   V_LNG_NO	  NUMBER;
   V_NET_ORDR_AMT NUMBER:=0;
  BEGIN

     IF NVL(P_LNG_NO,0)=0 Then
	  V_LNG_NO := 1;
     Else
	  V_LNG_NO := P_LNG_NO;
     End If;
   G_MACHINE_NO :=P_MACHINE_NO;
 /* LOAD PARAMETERS */
    G_MSG_TXT := LOAD_PRMTRS;
    IF G_MSG_TXT IS NOT NULL
      THEN
	 V_MSG_NO := '';
	 G_MSG_TXT:=G_MSG_TXT;
	 GOTO RTN_RSLT;
    END IF;

     V_NET_ORDR_AMT:=ROUND((NVL(P_ORDER_AMT,0)+NVL(P_VAT_AMT,0) -NVL(P_DISC_AMT,0)),1);
     G_TOT_ITM_PRICE:= V_NET_ORDR_AMT;
	   G_DISC_AMT_MST := P_DISC_AMT_MST;
	   G_DISC_AMT_DTL := P_DISC_AMT_DTL;
	   G_DIS_AMT_MD   := P_DISC_AMT;
	
    IF P_BRN_NO IS NULL THEN
	 V_MSG_NO := 644;
	 G_MSG_TXT := 'BRN_NO';
	 GOTO RTN_RSLT;
    END IF;
    IF P_CMP_NO IS NULL THEN
	 V_MSG_NO := 644;
	 G_MSG_TXT := 'CMP_NO';
	 GOTO RTN_RSLT;
    END IF;
    IF P_BRN_USR IS NULL THEN
	 V_MSG_NO := 644;
	 G_MSG_TXT := 'BRN_USR';
	 GOTO RTN_RSLT;
    END IF;
    IF P_BRN_YEAR IS NULL THEN
	 V_MSG_NO := 644;
	 G_MSG_TXT := 'BRN_YEAR';
	 GOTO RTN_RSLT;
    END IF;
    IF P_ORDER_NO IS  NULL	     THEN
	 V_MSG_NO := 836;
	 G_MSG_TXT := 'ORDER_NO';
	 GOTO RTN_RSLT;
    ELSIF P_ORDER_SER IS  NULL		 THEN
	 V_MSG_NO := 836;
	 G_MSG_TXT := 'ORDER_SER';
	 GOTO RTN_RSLT;
    ELSIF P_ORDER_CUR IS NULL THEN
	 V_MSG_NO := 31;
	 G_MSG_TXT := 'ORDER_CUR';
	 GOTO RTN_RSLT;
    ELSIF P_ORDER_DATE IS NULL THEN
	 V_MSG_NO := 841;
	 G_MSG_TXT := 'ORDER_DATE';
	 GOTO RTN_RSLT;
    ELSIF P_ORDER_TIME IS NULL THEN
	 V_MSG_NO := 644;
	 G_MSG_TXT := 'ORDER_TIME';
	 GOTO RTN_RSLT;
    ELSIF P_W_CODE IS NULL THEN
	 V_MSG_NO := 15;
	 G_MSG_TXT := 'W_CODE';
	 GOTO RTN_RSLT;
    ELSIF NVL(P_PYMNT_TYPE,1) NOT IN (1,2,3,4,8) THEN
	V_MSG_NO := 143;
	V_LBL_NO := 535;
	 GOTO RTN_RSLT;
    ELSIF P_PYMNT_TYPE =2 AND P_C_CODE IS NULL THEN
	 V_MSG_NO := 644;
	 V_LBL_NO := 388;
	 --V_MSG_TXT := 'PYMNT_TYPE';
	 GOTO RTN_RSLT;
    ELSIF P_PYMNT_TYPE =4 AND NVL(P_CR_CARD_AMT,0)+NVL(P_CR_CARD_AMT_SCND,0)+NVL(P_CR_CARD_AMT_THRD,0)=0 THEN
	 V_MSG_NO := 644;
	 V_LBL_NO :=2167;
	 GOTO RTN_RSLT;
    ELSIF NVL(P_CSH_PYMNT_AMT,0)+ROUND(NVL(P_CR_CARD_AMT,0)+NVL(P_CR_CARD_AMT_SCND,0)+NVL(P_CR_CARD_AMT_THRD,0),1)>NVL(V_NET_ORDR_AMT,0)  THEN
	  V_MSG_NO := 6308;
	 GOTO RTN_RSLT;
    END IF;
    --##------------------------------------------------------------------------------------------------------------------
    BEGIN
       SELECT 1 INTO V_CNT
	    FROM SALES_ORDER
	    WHERE ORDER_SER = P_ORDER_SER
	    AND  ROWNUM  <= 1 ;
    EXCEPTION
	WHEN NO_DATA_FOUND THEN
	 V_CNT := 0 ;
    END ;
    IF	NVL(V_CNT,0) > 0 THEN
	 V_MSG_NO := 8;
	 G_MSG_TXT := 'ORDER_SER';
	 GOTO RTN_RSLT;
    END IF;
    --##------------------------------------------------------------------------------------------------------------------
    IF NVL(G_DISC_AMT_MST,0)+NVL(G_DISC_AMT_DTL,0) > 0 THEN
       G_MSG_TXT := CHK_DSC_PRV_FNC;
       IF G_MSG_TXT IS NOT NULL THEN
	   V_MSG_NO:=626;
	   GOTO RTN_RSLT;
       END IF;
    END IF;
    --##------------------------------------------------------------------------------------------------------------------
    G_BILL_DATE  :=P_ORDER_DATE;
    G_BILL_TIME  :=P_ORDER_TIME;
   --##----------------------------------------------------------------------------------------------
	INSERT INTO SALES_ORDER(SO_TYPE
			       ,ORDER_NO
			       ,ORDER_SER
			       ,ORDER_DATE
			       ,ORDER_TIME
			       ,ORDER_CUR
			       ,CUR_RATE
			       ,C_CODE
			       ,C_NAME
			       ,A_DESC
			       ,CC_CODE
			       ,PJ_NO
			       ,ACTV_NO
			       ,W_CODE
			       ,REP_CODE
			       ,EMP_NO
			       ,PROCESED
			       ,STAND_BY
			       ,VAT_AMT
			       ,ORDER_AMT
			       ,DISC_AMT
			       ,DISC_AMT_MST
			       ,DISC_AMT_MST_VAT
			       ,DISC_AMT_DTL
			       ,OTHR_AMT
			       ,APPROVED
			       ,APRV_U_ID
			       ,APRV_DATE
			       ,APRV_DSC
			       ,INACTIVE
			       ,INACTIVE_RES
			       ,INACTIVE_DATE
			       ,INACTIVE_U_ID
			       ,R_CODE
			       ,PRM_CODE
			       ,DRIVER_NO
			       ,ORDER_EXPIRE_DATE
			       ,EXTERNAL_POST
			       ,FIELD1
			       ,FIELD2
			       ,FIELD3
			       ,FIELD4
			       ,FIELD5
			       ,FIELD6
			       ,FIELD7
			       ,FIELD8
			       ,FIELD9
			       ,FIELD10
			       ,AD_U_ID
			       ,AD_DATE
			       ,UP_U_ID
			       ,UP_DATE
			       ,UP_CNT
			       ,PR_REP
			       ,CMP_NO
			       ,BRN_NO
			       ,BRN_YEAR
			       ,BRN_USR
			       ,MACHINE_NO
			       ,CUST_CODE
			       ,MOBILE_NO
			       ,PYMNT_TYPE
			       ,CASH_NO
			       ,CSH_PYMNT_AMT
			       ,CREDIT_CARD
			       ,CR_CARD_NO
			       ,CR_CARD_AMT
			       ,CR_CARD_COMM_PER
			       ,CR_CARD_DSC
			       ,CR_CARD_CST_NO
			       ,CR_CARD_NO_SCND
			       ,CR_CARD_AMT_SCND
			       ,CR_CARD_COMM_PER_SCND
			       ,CR_CARD_DSC_SCND
			       ,CR_CARD_CST_NO_SCND
			       ,CR_CARD_NO_THRD
			       ,CR_CARD_AMT_THRD
			       ,CR_CARD_COMM_PER_THRD
			       ,CR_CARD_DSC_THRD
			       ,CR_CARD_CST_NO_THRD
			       ,ADVNC_PYMNT_A_CODE
			       ,ADVNC_PYMNT_AC_CODE_DTL
			       ,DOC_SER_EXTRNL
			       ,SHO_SYS_TYP
			       ,NOTE_NO
			       ,CSTMR_TYP
			       ,C_ADDRESS
			       ,LATITUDE
			       ,LONGITUDE
			       ,AD_TRMNL_NM
			       ,DISC_AMT_AFTR_VAT
			       ,POINT_TYP_NO
			       ,POINT_CNT
			       ,RCPNT_CMPNY
			       ,RCPNT_NAME
			       ,RCPNT_EMAIL
			       ,RCPNT_ADDRESS
			       ,RCPNT_CITY
			       ,RCPNT_POST_CODE
			       ,RCPNT_STATE
			       ,RCPNT_CNTRY
			       ,RCPNT_CNTRY_CODE
			       ,FRGHT_CMPNY
			       )
			 VALUES(P_SO_TYPE
			       ,P_ORDER_NO
			       ,P_ORDER_SER
			       ,P_ORDER_DATE
			       ,P_ORDER_TIME
			       ,P_ORDER_CUR
			       ,P_CUR_RATE
			       ,P_C_CODE
			       ,P_C_NAME
			       ,P_A_DESC
			       ,P_CC_CODE
			       ,P_PJ_NO
			       ,P_ACTV_NO
			       ,P_W_CODE
			       ,P_REP_CODE
			       ,P_EMP_NO
			       ,NVL(P_PROCESED,0)
			       ,P_STAND_BY
			       ,P_VAT_AMT
			       ,P_ORDER_AMT
			       ,P_DISC_AMT
			       ,P_DISC_AMT_MST
			       ,P_DISC_AMT_MST_VAT
			       ,P_DISC_AMT_DTL
			       ,P_OTHR_AMT
			       ,P_APPROVED
			       ,P_APRV_U_ID
			       ,P_APRV_DATE
			       ,P_APRV_DSC
			       ,P_INACTIVE
			       ,P_INACTIVE_RES
			       ,P_INACTIVE_DATE
			       ,P_INACTIVE_U_ID
			       ,P_R_CODE
			       ,P_PRM_CODE
			       ,P_DRIVER_NO
			       ,P_ORDER_EXPIRE_DATE
			       ,80
			       ,P_FIELD1
			       ,P_FIELD2
			       ,P_FIELD3
			       ,P_FIELD4
			       ,P_FIELD5
			       ,P_FIELD6
			       ,P_FIELD7
			       ,P_FIELD8
			       ,P_FIELD9
			       ,P_FIELD10
			       ,P_AD_U_ID
			       ,P_AD_DATE
			       ,P_UP_U_ID
			       ,P_UP_DATE
			       ,P_UP_CNT
			       ,P_PR_REP
			       ,P_CMP_NO
			       ,P_BRN_NO
			       ,P_BRN_YEAR
			       ,P_BRN_USR
			       ,P_MACHINE_NO
			       ,P_CUST_CODE
			       ,P_MOBILE_NO
			       ,P_PYMNT_TYPE
			       ,P_CASH_NO
			       ,P_CSH_PYMNT_AMT
			       ,P_CREDIT_CARD
			       ,P_CR_CARD_NO
			       ,P_CR_CARD_AMT
			       ,P_CR_CARD_COMM_PER
			       ,P_CR_CARD_DSC
			       ,P_CR_CARD_CST_NO
			       ,P_CR_CARD_NO_SCND
			       ,P_CR_CARD_AMT_SCND
			       ,P_CR_CARD_COMM_PER_SCND
			       ,P_CR_CARD_DSC_SCND
			       ,P_CR_CARD_CST_NO_SCND
			       ,P_CR_CARD_NO_THRD
			       ,P_CR_CARD_AMT_THRD
			       ,P_CR_CARD_COMM_PER_THRD
			       ,P_CR_CARD_DSC_THRD
			       ,P_CR_CARD_CST_NO_THRD
			       ,P_ADVNC_PYMNT_A_CODE
			       ,P_ADVNC_PYMNT_AC_CODE_DTL
			       ,P_DOC_SER_EXTRNL
			       ,P_SHO_SYS_TYP
			       ,P_NOTE_NO
			       ,P_CSTMR_TYP
			       ,P_C_ADDRESS
			       ,P_LATITUDE
			       ,P_LONGITUDE
			       ,P_AD_TRMNL_NM
			       ,P_DISC_AMT_AFTR_VAT
			       ,P_POINT_TYP_NO
			       ,P_POINT_CNT
			       ,P_RCPNT_CMPNY
			       ,P_RCPNT_NAME
			       ,P_RCPNT_EMAIL
			       ,P_RCPNT_ADDRESS
			       ,P_RCPNT_CITY
			       ,P_RCPNT_POST_CODE
			       ,P_RCPNT_STATE
			       ,P_RCPNT_CNTRY
			       ,P_RCPNT_CNTRY_CODE
			       ,P_FRGHT_CMPNY
			       );
   --####################--
      <<RTN_RSLT>>
      IF V_MSG_NO IS NOT NULL AND V_LBL_NO IS NOT NULL THEN
	 RETURN 'MSG_NO:'||V_MSG_NO||' - '||IAS_GEN_PKG.GET_MSG (P_LNG_NO => V_LNG_NO, P_MSG_NO => V_MSG_NO) || ' - ' || IAS_GEN_PKG.GET_PROMPT (P_LNG_NO => V_LNG_NO, P_LBL_NO => V_LBL_NO)||' '||G_MSG_TXT||' ORDER_NO='||P_ORDER_NO;
      ELSIF V_MSG_NO IS NOT NULL THEN
	 RETURN 'MSG_NO:'||V_MSG_NO||' - '||IAS_GEN_PKG.GET_MSG (P_LNG_NO => V_LNG_NO, P_MSG_NO => V_MSG_NO)||' '||G_MSG_TXT||' ORDER_NO='||P_ORDER_NO;
      ELSE
	 RETURN NULL;
      END IF;
    --####################--
  EXCEPTION WHEN OTHERS THEN
       ROLLBACK;
       RETURN SQLERRM;
  END INSRT_SALES_ORDER_MST_FNC;
  --##-----------------------------------------------------------------------------------------------------##--
  FUNCTION INSRT_SALES_ORDER_DTL_FNC(P_SO_TYPE	      IN ORDER_DETAIL.SO_TYPE%TYPE
				   ,P_ORDER_NO	      IN ORDER_DETAIL.ORDER_NO%TYPE
				   ,P_ORDER_SER       IN ORDER_DETAIL.ORDER_SER%TYPE
				   ,P_I_CODE	      IN ORDER_DETAIL.I_CODE%TYPE
				   ,P_ITM_UNT	      IN ORDER_DETAIL.ITM_UNT%TYPE
				   ,P_P_SIZE	      IN ORDER_DETAIL.P_SIZE%TYPE
				   ,P_I_QTY	      IN ORDER_DETAIL.I_QTY%TYPE
				   ,P_FREE_QTY	      IN ORDER_DETAIL.FREE_QTY%TYPE
				   ,P_P_QTY	      IN ORDER_DETAIL.P_QTY%TYPE
				   ,P_EXPIRE_DATE     IN ORDER_DETAIL.EXPIRE_DATE%TYPE
				   ,P_BATCH_NO	      IN ORDER_DETAIL.BATCH_NO%TYPE
				   ,P_I_PRICE	      IN ORDER_DETAIL.I_PRICE%TYPE
				   ,P_I_PRICE_VAT     IN ORDER_DETAIL.I_PRICE_VAT%TYPE
				   ,P_VAT_PER	      IN ORDER_DETAIL.VAT_PER%TYPE
				   ,P_VAT_AMT	      IN ORDER_DETAIL.VAT_AMT%TYPE
				   ,P_DIS_PER	      IN ORDER_DETAIL.DIS_PER%TYPE
				   ,P_DIS_AMT_DTL_VAT IN ORDER_DETAIL.DIS_AMT_DTL_VAT%TYPE
				   ,P_DIS_AMT_DTL     IN ORDER_DETAIL.DIS_AMT_DTL%TYPE
				   ,P_DIS_AMT_MST     IN ORDER_DETAIL.DIS_AMT_MST%TYPE
				   ,P_DIS_AMT_MST_VAT IN ORDER_DETAIL.DIS_AMT_MST_VAT%TYPE
				   ,P_DIS_AMT	      IN ORDER_DETAIL.DIS_AMT%TYPE
				   ,P_DIS_AMT_AFTR_VAT IN ORDER_DETAIL.DIS_AMT_AFTR_VAT%TYPE DEFAULT NULL
				   ,P_OTHR_AMT	      IN ORDER_DETAIL.OTHR_AMT%TYPE
				   ,P_W_CODE	      IN ORDER_DETAIL.W_CODE%TYPE
				   ,P_RCRD_NO	      IN ORDER_DETAIL.RCRD_NO%TYPE
				   ,P_BARCODE	      IN ORDER_DETAIL.BARCODE%TYPE
				   ,P_ITEM_DESC       IN ORDER_DETAIL.ITEM_DESC%TYPE
				   ,P_CANCELED	      IN ORDER_DETAIL.CANCELED%TYPE
				   ,P_DOC_SEQ	      IN ORDER_DETAIL.DOC_SEQ%TYPE
				   ,P_EMP_NO	      IN ORDER_DETAIL.EMP_NO%TYPE
				   ,P_FIELD_DTL1      IN ORDER_DETAIL.FIELD_DTL1%TYPE
				   ,P_FIELD_DTL2      IN ORDER_DETAIL.FIELD_DTL2%TYPE
				   ,P_FIELD_DTL3      IN ORDER_DETAIL.FIELD_DTL3%TYPE
				   ,P_CMP_NO	      IN ORDER_DETAIL.CMP_NO%TYPE
				   ,P_BRN_NO	      IN ORDER_DETAIL.BRN_NO%TYPE
				   ,P_BRN_YEAR	      IN ORDER_DETAIL.BRN_YEAR%TYPE
				   ,P_BRN_USR	      IN ORDER_DETAIL.BRN_USR%TYPE
				   ,P_QT_PRM_SER      IN ORDER_DETAIL.QT_PRM_SER%TYPE  DEFAULT NULL
				   ,P_QT_PRM_NO       IN ORDER_DETAIL.QT_PRM_NO%TYPE  DEFAULT NULL
				   ,P_QT_PRM_RCRD_NO  IN ORDER_DETAIL.QT_PRM_RCRD_NO%TYPE  DEFAULT NULL
				   ,P_LNG_NO	      IN NUMBER ) RETURN VARCHAR2 IS
    V_CNT	   NUMBER:=0;
    V_LNG_NO	   NUMBER;
    V_P_QTY	   NUMBER;
    V_I_Price	   NUMBER;
    V_I_Price_vat  NUMBER;
    V_Vat_disc_amt NUMBER;
 BEGIN
     IF NVL(P_LNG_NO,0)=0 Then
	  V_LNG_NO := 1;
	  G_Lng_No :=1;
       Else
	  V_LNG_NO := P_LNG_NO;
	  G_Lng_No := P_LNG_NO;
       End If;

    IF P_ORDER_NO IS  NULL	     THEN
	 V_MSG_NO := 836;
	 G_MSG_TXT := 'ORDER_NO';
	 GOTO RTN_RSLT;
    ELSIF P_ORDER_SER IS  NULL		 THEN
	 V_MSG_NO := 836;
	 G_MSG_TXT := 'ORDER_SER';
	 GOTO RTN_RSLT;
    ELSIF P_W_CODE IS NULL THEN
	 V_MSG_NO := 15;
	 G_MSG_TXT := 'W_CODE';
	 GOTO RTN_RSLT;
    ELSIF P_I_CODE IS NULL THEN
	 V_MSG_NO := 813;
	 G_MSG_TXT := 'I_CODE';
	 GOTO RTN_RSLT;
    ELSIF P_ITM_UNT IS NULL THEN
	 V_MSG_NO := 1896;
	 G_MSG_TXT := 'ITM_UNT';
	 GOTO RTN_RSLT;
    ELSIF NVL(P_I_QTY,0)+NVL(P_FREE_QTY,0)<1 THEN
	 V_MSG_NO := 103;
	 G_MSG_TXT := 'I_QTY';
	 GOTO RTN_RSLT;
    ELSIF P_I_CODE IS NOT NULL AND P_ITM_UNT IS NOT NULL  THEN
	    BEGIN
		SELECT 1 INTO V_CNT
		FROM   IAS_ITM_DTL
		WHERE  I_CODE  =P_I_CODE
		AND    ITM_UNT =P_ITM_UNT
		AND  ROWNUM  <= 1 ;
	    EXCEPTION
	    WHEN NO_DATA_FOUND THEN
	    V_CNT := 0 ;
	    END ;
	    IF	NVL(V_CNT,0) = 0 THEN
	     V_MSG_NO := 44;
	     G_MSG_TXT := 'I_CODE ITM_UNT';
	     GOTO RTN_RSLT;
	    END IF;
    END IF;

    IF P_I_PRICE IS NOT NULL   THEN
	    IF	P_I_PRICE < 0 THEN
	       RAISE_APPLICATION_ERROR(-20029,'I_PRICE < 0 ,I_PRICE = '||P_I_PRICE ||'--'||CHR(10)||SQLERRM) ;
	    END IF;
	END IF;

       V_I_Price     := P_I_Price;
       V_I_Price_vat := P_I_PRICE_VAT;
       --V_Vat_Per   := P_Vat_Per;
       IF G_USE_PRICE_INCLUDE_VAT = 1 AND P_I_PRICE_VAT IS NULL THEN
	  RAISE_APPLICATION_ERROR(-20029,'I_PRICE_VAT IS NULL'||'--'||CHR(10)||SQLERRM) ;
       ELSIF G_USE_PRICE_INCLUDE_VAT = 1 THEN
	 IF G_SAVE_TYP>0 THEN
	   V_Vat_disc_amt :=Round((((Nvl(P_Dis_Amt_Dtl,0)+Nvl(P_Dis_Amt_Mst,0)))*Nvl(P_VAT_PER,0))/100,12);
	  --V_VAT_PRCNT := YS_TAX_PKG.GET_ITM_TAX_PRCNT(P_CLC_TYP_NO => G_CLC_TYP_NO_TAX, P_I_CODE => P_I_CODE, P_CLC_USD_ITM => 0);
	  --V_I_PRICE := P_I_PRICE_VAT / ((NVL(P_VAT_PER, 0) / 100) + 1);
	   V_I_PRICE :=Nvl(P_I_PRICE_VAT,0)-(Nvl(P_VAT_AMT,0)+Nvl(V_Vat_disc_amt,0));
	 END IF;
       END IF;
   --##----------------------------------------------------------------------------------------------------
   --IF G_SAVE_TYP>0 THEN
   --##---------------------------------------------------------------------------------------------------------------------------##--
   --## CHK ITM DATA
      Chk_Itm(P_Doc_Type	      =>149
	       ,P_I_Code	      => P_I_Code
	       ,P_Itm_Unt	      => P_Itm_Unt
	       ,P_P_Size	      => P_P_Size
	       ,P_I_Qty 	      => P_I_Qty
	       ,P_Free_Qty	      => P_Free_Qty
	       ,P_I_Price	      => V_I_Price
	       ,P_I_Price_Vat	      => V_I_Price_Vat
	       ,P_Lev_No	      => G_LVL_PRICE_NO
	       ,P_Qt_Prm_Method       => Null
	       ,P_Qut_Prm_Price       => Null
	       ,P_Qt_Prm_Ser	      => Null
	       ,P_Dis_Per	      => P_Dis_Per
	       ,P_Dis_Amt_Dtl	      => P_Dis_Amt_Dtl
	       ,P_Dis_Amt_Dtl_Vat     => P_Dis_Amt_Dtl_Vat
	       ,P_Dis_Amt_Mst	      => P_Dis_Amt_Mst
	       ,P_W_Code	      => G_WCode
	       ,P_Expire_Date	      => P_Expire_Date
	       ,P_Batch_No	      => P_Batch_No
	       ,P_Brn_No	      => G_Brn_No
	       ,P_Doc_Ser	      => P_ORDER_SER
	       ,P_Doc_Date	      => G_Bill_Date
	       ,P_C_Code	      => G_C_Code
	       ,P_Cur_Code	      => G_Cur_Code
	       ,P_Ac_Rate	      => G_Cur_Rate
	       ,P_Usr_No	      => G_Ad_U_Id
	       ,P_Clc_Vat_Price_Typ   => Nvl (G_Clc_Vat_Price_Typ, 1)
	       ,P_Bill_Doc_Type       => G_BILL_TYPE
	       ,P_Chk_Avlqty_Flg      => Nvl(G_CHCK_AVL_QTY,0)
	       ,P_Chk_Itm_Price       => 1--G_Chk_Itm_Price --# 0 nocheck 1 check
	       ,P_Use_Vat	      => G_USE_VAT_MCHN
	       ,P_Clc_Typ_No_Tax      => G_Clc_Typ_No_Tax
	       ,P_Lng_No	      => G_Lng_No
	       ,P_Msg_Txt	      => G_Msg_Txt
	       ,P_Pkg_Line	      => V_Err_No
	       ,P_Pkg_Nm	      => G_Pkg_Nm);

	   If G_Msg_Txt Is Not Null Then
	       --V_MSG_NO := 44;
	       G_MSG_TXT :=G_Msg_Txt;
	       GOTO RTN_RSLT;
	   End If;
     V_P_QTY:=P_I_QTY*P_P_SIZE;
       INSERT INTO ORDER_DETAIL(SO_TYPE,
			       ORDER_NO,
			       ORDER_SER,
			       I_CODE,
			       ITM_UNT,
			       P_SIZE,
			       I_QTY,
			       FREE_QTY,
			       P_QTY,
			       EXPIRE_DATE,
			       BATCH_NO,
			       I_PRICE,
			       I_PRICE_VAT,
			       VAT_PER,
			       VAT_AMT,
			       DIS_PER,
			       DIS_AMT_DTL_VAT,
			       DIS_AMT_DTL,
			       DIS_AMT_MST,
			       DIS_AMT_MST_VAT,
			       DIS_AMT,
			       DIS_AMT_AFTR_VAT,
			       OTHR_AMT,
			       W_CODE,
			       RCRD_NO,
			       BARCODE,
			       ITEM_DESC,
			       EXTERNAL_POST,
			       CANCELED,
			       DOC_SEQ,
			       EMP_NO,
			       FIELD_DTL1,
			       FIELD_DTL2,
			       FIELD_DTL3,
			       CMP_NO,
			       BRN_NO,
			       BRN_YEAR,
			       BRN_USR ,
			       QT_PRM_SER,
			       QT_PRM_NO,
			       QT_PRM_RCRD_NO
				)
			VALUES(P_SO_TYPE,
			       P_ORDER_NO,
			       P_ORDER_SER,
			       P_I_CODE,
			       P_ITM_UNT,
			       P_P_SIZE,
			       P_I_QTY,
			       P_FREE_QTY,
			       P_P_QTY,
			       P_EXPIRE_DATE,
			       P_BATCH_NO,
			       P_I_PRICE,
			       P_I_PRICE_VAT,
			       P_VAT_PER,
			       P_VAT_AMT,
			       P_DIS_PER,
			       P_DIS_AMT_DTL_VAT,
			       P_DIS_AMT_DTL,
			       P_DIS_AMT_MST,
			       P_DIS_AMT_MST_VAT,
			       P_DIS_AMT,
			       P_DIS_AMT_AFTR_VAT,
			       P_OTHR_AMT,
			       P_W_CODE,
			       P_RCRD_NO,
			       P_BARCODE,
			       P_ITEM_DESC,
			       80,
			       P_CANCELED,
			       P_DOC_SEQ,
			       P_EMP_NO,
			       P_FIELD_DTL1,
			       P_FIELD_DTL2,
			       P_FIELD_DTL3,
			       P_CMP_NO,
			       P_BRN_NO,
			       P_BRN_YEAR,
			       P_BRN_USR ,
			       P_QT_PRM_SER,
			       P_QT_PRM_NO,
			       P_QT_PRM_RCRD_NO);
    --#---------------------------------------------------------------------------------------------------------#--

      <<RTN_RSLT>>
      IF V_MSG_NO IS NOT NULL AND V_LBL_NO IS NOT NULL THEN
	 RETURN 'MSG_NO:'||V_MSG_NO||' - '||IAS_GEN_PKG.GET_MSG (P_LNG_NO => V_LNG_NO, P_MSG_NO => V_MSG_NO) || ' - ' || IAS_GEN_PKG.GET_PROMPT (P_LNG_NO => V_LNG_NO, P_LBL_NO => V_LBL_NO)||' '||G_MSG_TXT||' ORDER_NO='||P_ORDER_NO;
      ELSIF V_MSG_NO IS NOT NULL THEN
	 RETURN 'MSG_NO:'||V_MSG_NO||' - '||IAS_GEN_PKG.GET_MSG (P_LNG_NO => V_LNG_NO, P_MSG_NO => V_MSG_NO)||' '||G_MSG_TXT||' ORDER_NO='||P_ORDER_NO;
      ELSIF G_MSG_TXT IS NOT NULL THEN
	 RETURN G_MSG_TXT||' ORDER_NO='||P_ORDER_NO;
      ELSE
	 RETURN NULL;
      END IF;
    --####################--
  EXCEPTION WHEN OTHERS THEN
       ROLLBACK;
       RETURN SQLERRM;
 END INSRT_SALES_ORDER_DTL_FNC;
--##-----------------------------------------------------------------------------------------------------##--
PROCEDURE Snd_Vrfct_Msg_Prc(P_Mobile_No  IN Ias_Pos_Bill_Mst.Mobile_No%TYPE,
			    P_Cust_Code  IN Ias_Pos_Bill_Mst.Mobile_No%TYPE DEFAULT NULL,
			    P_doc_no	 In Ias_pos_bill_mst.Bill_no%TYPE,
			    P_Brn_NO	 IN Ias_Pos_Bill_Mst.Brn_No%TYPE,
			    P_MSG_TYP	 IN NUMBER DEFAULT 1,
			    P_LNG_NO	 IN NUMBER,
			    P_JSON_RSLT OUT VARCHAR)  IS
  V_E_Mail Ias_Cash_Custmr.E_Mail%Type;
  V_Cmp_Nm	 Varchar2(100);
  V_brn_Year	 Number:=to_char(SYSDATE,'YYYY');
  V_Msg_Txt	 Varchar2(500);
  V_VRFCT_MSG	 Varchar2(20);
  V_Send_Msg_Typ Number;
  V_Cmp_No	 Number;
  V_Brn_Usr	 Number;

  V_JSON_RSLT  VARCHAR2(4000);
BEGIN  V_JSON_RSLT:= '{"_Result": { "_VRFCT_CODE":@VRFCT_CODE,"_ErrMsg": "@errmsg","_ErrNo": @errno } }';
      If  P_Mobile_No Is Not Null Then
	    V_VRFCT_MSG:=LPAD(ABS(dbms_random.random),5);
	    V_Msg_Txt:=Ias_Gen_Pkg.Get_prompt(P_LNG_NO ,18118)||' = '||V_VRFCT_MSG;
		Begin
		    Select E_mail Into V_e_mail From Ias_cash_custmr
		      Where Cust_Code=P_Cust_Code;
		Exception When Others Then
		    Null;
		End;
		--##-----------------------------------------------------------------------------------------------------------##--
		 Begin
		   Select Send_Msg_Typ into V_Send_Msg_Typ FROM Ias_Para_Pos;
		 Exception When Others Then
		   V_Send_Msg_Typ:=1;
		 End;
		 Begin
		   Select Cmp_no,Brn_Usr into V_cmp_no,V_Brn_Usr From S_brn Where Brn_no=P_brn_no;
		 Exception When Others Then
		   V_cmp_no:=1;
		   V_Brn_Usr:=1;
		 End;
		--##-----------------------------------------------------------------------------------------------------------##--
	     V_Cmp_Nm:=IAS_Brn_Pkg.Get_Cmp_Nm(P_CMP_NO=>V_cmp_no ,P_Lng_no =>P_LNG_NO);
		    --##-----------------------------------------------------------------------------------------------------------##--
	      If V_VRFCT_MSG Is Not Null Then
		 Begin
		    Ias_Sms_Mail_Pkg.Insrt_Msg_Alrt_Prc (
							P_Lng_No	   =>P_LNG_NO,
							P_Msg_Mthd_Send    =>V_Send_Msg_Typ,-- 1 sms -2 email -3 sms and email
							P_Msg_Typ	   => 80,
							P_Msg_Txt	   => V_Msg_Txt,
							P_Mobile_No	   => P_Mobile_No,
							P_E_Mail	   => V_E_Mail,
							P_Subjct_Mail	   => V_Cmp_Nm,
							P_Doc_Typ	   => 130,
							P_Doc_Srl	   =>P_doc_no,
							P_Ad_Date	   => Sysdate,
							P_Cmp_No	   => V_Cmp_No,
							P_Brn_No	   => P_Brn_NO,
							P_Brn_Usr	   => V_Brn_Usr,
							P_Brn_Year	   => V_brn_Year);
		 Exception  When Others Then
		     RAISE_APPLICATION_ERROR(-20201,' Error Insert msg Insrt_Msg_Alrt_Prc '|| CHR(13) || SQLERRM);
		 End;
		 COMMIT;
	      End If;
      End If;

       V_JSON_RSLT:=REPLACE(V_JSON_RSLT,'@VRFCT_CODE', V_VRFCT_MSG);
       V_JSON_RSLT:=REPLACE(V_JSON_RSLT,'@errno',0);
       --V_JSON_RSLT:=REPLACE(V_JSON_RSLT,'@errmsg','The operation accomplished successfully.');
       P_JSON_RSLT:=V_JSON_RSLT;
Exception When Others Then
     Raise_Application_Error (-20202, 'Err when Snd_Vrfct_Msg_Prc , ' || Sqlerrm);
END Snd_Vrfct_Msg_Prc;
Procedure Chk_Itm  ( P_Doc_Type 	     In Number			---## 4 SALES INVOICE 5-  RETURN SALES INVOICE 149 sales order
		    ,P_I_Code		     In Ias_Itm_Mst.I_Code%Type
		    ,P_Itm_Unt		     In Ias_Pos_Bill_Dtl.Itm_Unt%Type
		    ,P_P_Size		     In  Ias_Pos_Bill_Dtl.P_Size%Type	 Default Null
		    ,P_I_Qty		     In Ias_Pos_Bill_Dtl.I_Qty%Type	 Default Null
		    ,P_Free_Qty 	     In Ias_Pos_Bill_Dtl.Free_Qty%Type	 Default Null
		    ,P_I_Price		     In Ias_Pos_Bill_Dtl.I_Price%Type			Default Null
		    ,P_I_Price_Vat	     In Ias_Pos_Bill_Dtl.I_Price_Vat%Type		Default Null
		    ,P_Lev_No		     In Number					    Default Null
		    ,P_Qt_Prm_Method	     In NUMBER					    Default Null
		    ,P_Qut_Prm_Price	     In NUMBER					    Default Null
		    ,P_Qt_Prm_Ser	     In NUMBER					    Default Null
		    ,P_Dis_Per		     In Ias_Pos_Bill_Dtl.Dis_Per%Type			Default Null
		    ,P_Dis_Amt_Dtl	     In Ias_Pos_Bill_Dtl.Dis_Amt_Dtl%Type		Default Null
		    ,P_Dis_Amt_Dtl_Vat	     In Ias_Pos_Bill_Dtl.Dis_Amt_Dtl_Vat%Type		Default Null
		    ,P_Dis_Amt_Mst	     In Ias_Pos_Bill_Dtl.Dis_Amt_Mst%Type		Default Null
		    ,P_W_Code		     In Ias_Pos_Bill_Dtl.W_Code%Type			Default Null
		    ,P_Expire_Date	     In Ias_Pos_Bill_Dtl.Expire_Date%Type		Default Null
		    ,P_Batch_No 	     In Ias_Pos_Bill_Dtl.Batch_No%Type			Default Null
		    ,P_Brn_No		     In Ias_Pos_Bill_Dtl.Brn_No%Type			Default Null
		    ,P_Doc_Ser		     In Ias_Pos_Bill_Mst.bill_srl%Type		       Default Null
		    ,P_Doc_Date 	     In Ias_Pos_Bill_Mst.Bill_Date%Type 		Default Null
		    ,P_C_Code		     In Customer.c_code%Type			    Default Null
		    ,P_CUR_CODE 	     In EX_RATE.CUR_CODE%Type			    Default Null
		    ,P_Ac_Rate		     In NUMBER					    Default Null
		    ,P_USR_NO		     In USER_R.U_ID%Type			    Default Null
		    ,P_CLC_VAT_PRICE_TYP     IN  NUMBER 				    DEFAULT 1
		    ,P_Bill_Doc_Type	     IN  NUMBER 				   Default Null
		    ,P_Chk_Avlqty_Flg	     In Number					     Default 0
		    ,P_Chk_Itm_Price	     IN  NUMBER DEFAULT 0		     --# 0 nocheck 1 check
		    ,P_Use_Vat		     IN  NUMBER 				    Default Null
		    ,P_Clc_Typ_No_Tax	     IN  NUMBER 				    Default Null
		    ,P_Lng_No		     In Number					    Default 1
		    ,P_Msg_Txt		     In Out Varchar2
		    ,P_Pkg_Line 	     In Out Varchar2
		    ,P_Pkg_NM		    In Out Varchar2 )  Is
 V_i_qty_clc		       Ias_Pos_Bill_Dtl.I_qty%Type;
   V_itm_avl_qty		 Number := 0;
   V_found			 Number := 0;
   V_msg_no			 Number;
   V_cnt			 Number;
   V_no_sal_flg 		 Number;
   V_inactv_flg 		 Number;
   V_whr			 Varchar2(4000);
   V_Pkg_NM			 Varchar2(500);
   V_msg_txt			 Varchar2(4000) := Null;
   V_pkg_line			 Varchar2(4000) := Null;
   V_err_line			 Int := Null;
   V_brn_no			 Number;
   V_p_size			 Ias_Pos_Bill_Dtl.P_size%Type;
   V_use_expire_date		 Number(5);
   V_use_batch_no		 Number(5);
   V_show_disc_per_items	 Number(5);
   V_USE_DTS_WITHOUT_INV	 Number(2);
   V_ITM_Use_exp_date		     Number(2);
   V_Use_qty_fraction		 Number(2);
   V_ITM_Use_batch_no		     Number(2);
   V_Service_itm		 Number(2);
   V_Cash_sale			 Number(2);
   V_Weighted			 Number(2);
   V_Inactive_ITM		 Number(2);
   V_HAS_VAT			 Number(2):=0;
   V_ALLW_SAL_EXPRD_ITM 	 Number(2):=0;
BEGIN

   Begin
      Select Nvl(Use_expire_date, 0)
	    ,Nvl(Use_batch_no, 0)
	    ,Nvl(Show_disc_per_items_ar, 0)
      Into   V_use_expire_date
	    ,V_use_batch_no
	    ,V_show_disc_per_items
      From   Ias_para_ar
	    ,Ias_para_inv ;
   Exception
      When Others Then
	 Null;
   End;
   --------------------------------------------------------------------------------
   Begin
      Select Nvl(ALLW_SAL_EXPRD_ITM, 0)
      Into  V_ALLW_SAL_EXPRD_ITM
      From  PRIVILEGE_FIXED
      where u_id=p_usr_no
      and rownum<=1;
   Exception
      When Others Then
	 V_ALLW_SAL_EXPRD_ITM:=0;
   End;
  --------------------------------------------------------------------------------
   If P_i_code Is Null Then
      V_msg_txt := Ias_gen_pkg.Get_msg(P_lng_no => P_Lng_No, P_msg_no => 3319) ;
      V_Err_Line:=$$Plsql_Line;
       GOTO  Rtn_rslt;
   Elsif P_itm_unt Is Null Then
      V_msg_txt := Ias_gen_pkg.Get_msg(P_lng_no => P_Lng_No, P_msg_no => 1896);
      V_Err_Line:=$$Plsql_Line;
      GOTO  Rtn_rslt;
   End If;

   If P_i_code Is Not Null And P_itm_unt Is Not Null Then
      Begin
	 Select 1,
		Nvl(Use_exp_date, 0) Use_exp_date
	       ,Nvl(Use_qty_fraction, 0) Use_qty_fraction
	       ,NVL(Use_batch_no,0)
	       ,Nvl(Service_itm, 0) Service_itm
	       ,NVL(Cash_sale,0)
	       ,NVL(Weighted,0)
	       ,Nvl(Inactive, 0)
	       ,nvl(VAT_TYPE,0)
	 Into  V_cnt
	       ,V_ITM_Use_exp_date
	       ,V_Use_qty_fraction
	       ,V_ITM_Use_batch_no
	       ,V_Service_itm
	       ,V_Cash_sale
	       ,V_Weighted
	       ,V_Inactive_ITM
	       ,v_has_vat
	 From	Ias_itm_mst
	 Where	I_code = P_i_code And Rownum <= 1;
      Exception
	 When Others Then
	    V_cnt := 0;
      End;

      If V_cnt = 0 Then
	 V_msg_txt := Ias_gen_pkg.Get_msg(P_lng_no => P_Lng_No, P_msg_no => 46)||chr(10)||Ias_Gen_Pkg.Get_Prompt ( P_Lng_No, 176)||'='||p_i_code;
	 V_Err_Line:=$$Plsql_Line;
	 GOTO  Rtn_rslt;
      End If;

      Begin
	 Select 1
	       ,P_size
	       ,Nvl(No_sale, 0)
	       ,Nvl(Inactive, 0)
	 Into	V_cnt
	       ,V_p_size
	       ,V_no_sal_flg
	       ,V_inactv_flg
	 From	Ias_itm_dtl
	 Where	I_code = P_i_code And Itm_unt = P_itm_unt And Rownum <= 1;
      Exception
	 When Others Then
	    V_cnt := 0;
      End;

      If V_cnt = 0 Then
	 V_msg_txt := Ias_gen_pkg.Get_msg(P_lng_no => P_Lng_No, P_msg_no => 5013)
		     ||chr(10)||Ias_Gen_Pkg.Get_Prompt ( P_Lng_No, 176)||'='||p_i_code
		     ||chr(10)||Ias_Gen_Pkg.Get_Prompt ( P_Lng_No, 180)||'='||P_itm_unt;
	 V_Err_Line:=$$Plsql_Line;
	 GOTO  Rtn_rslt;
      Elsif V_no_sal_flg = 1  Then
	 V_msg_txt := Ias_gen_pkg.Get_msg(P_lng_no => P_Lng_No, P_msg_no => 597)
		      ||chr(10)||Ias_Gen_Pkg.Get_Prompt ( P_Lng_No, 176)||'='||p_i_code
		      ||chr(10)||Ias_Gen_Pkg.Get_Prompt ( P_Lng_No, 180)||'='||P_itm_unt;
	 V_Err_Line:=$$Plsql_Line;
	 GOTO  Rtn_rslt;
      Elsif V_inactv_flg = 1 Then
	 V_msg_txt := Ias_gen_pkg.Get_msg(P_lng_no => P_Lng_No, P_msg_no => 377)
		      ||chr(10)||Ias_Gen_Pkg.Get_Prompt ( P_Lng_No, 176)||'='||p_i_code
		      ||chr(10)||Ias_Gen_Pkg.Get_Prompt ( P_Lng_No, 180)||'='||P_itm_unt;
	  V_Err_Line:=$$Plsql_Line;
	  GOTO	Rtn_rslt;
      Elsif V_CASH_SALE = 1 and nvl(P_Bill_Doc_Type,1)<>1 and nvl(p_doc_type,0)=4  Then
	 V_msg_txt := Ias_gen_pkg.Get_msg(P_lng_no => P_Lng_No, P_msg_no => 1362)
		      ||chr(10)||Ias_Gen_Pkg.Get_Prompt ( P_Lng_No, 176)||'='||p_i_code;
	  V_Err_Line:=$$Plsql_Line;
	  GOTO	Rtn_rslt;
      End If;
   End If;
--##----------------------------------------------------------------------------------------------------------------##--

	 If V_Inactive_ITM = 1 Then
	    V_msg_txt := Ias_gen_pkg.Get_msg(P_lng_no => P_Lng_No, P_msg_no => 377)||chr(10)||Ias_Gen_Pkg.Get_Prompt ( P_Lng_No, 176)||'='||p_i_code;
	    V_Err_Line:=$$Plsql_Line;
	    GOTO  Rtn_rslt;
	 -- ELSIF I.CASH_SALE = 1 AND  NVL(G_BILL_DOC_TYPE,0) <> 1 AND G_DOC_TYP<>5  THEN
	      -- V_MSG_TXT:=IAS_GEN_PKG.GET_MSG(P_LNG_NO =>P_Lng_No, P_MSG_NO =>1362) ||', I_CODE ='||P_I_CODE||' ';
	      -- V_Err_Line:=$$Plsql_Line;  GOTO  Rtn_rslt;
	 Elsif V_Use_qty_fraction = 0 And(Mod(Nvl(P_i_qty, 0), 1) <> 0 Or Mod(Nvl(P_free_qty, 0), 1) <> 0) Then
	    V_msg_txt := Ias_gen_pkg.Get_msg(P_lng_no => P_Lng_No, P_msg_no => 677)||chr(10)||Ias_Gen_Pkg.Get_Prompt ( P_Lng_No, 176)||'='||p_i_code;
	    V_Err_Line:=$$Plsql_Line;
	    GOTO  Rtn_rslt;
	 Elsif V_ITM_Use_exp_date = 1 And P_expire_date Is Null And V_use_expire_date = 1 and Nvl(P_DOC_TYPE,0)<>149 Then
	   V_msg_txt := Ias_gen_pkg.Get_msg(P_lng_no => P_Lng_No, P_msg_no => 144)
			    ||chr(10)||Ias_Gen_Pkg.Get_Prompt ( P_Lng_No, 176)||'='||p_i_code;
	    V_Err_Line:=$$Plsql_Line;
	    GOTO  Rtn_rslt;
	 Elsif V_ITM_Use_exp_date = 1 And Nvl(P_expire_date, '01/01/1900') In( '01/01/1900','28/08/1317') And V_use_expire_date = 1
	    AND NVL(P_DOC_TYPE,0) <>149 Then
	   V_msg_txt := Ias_gen_pkg.Get_msg(P_lng_no => P_Lng_No, P_msg_no => 647)
			    ||chr(10)||Ias_Gen_Pkg.Get_Prompt ( P_Lng_No, 176)||'='||p_i_code
			    ||chr(10)||Ias_Gen_Pkg.Get_Prompt ( P_Lng_No, 115)||'='||P_expire_date;
	    V_Err_Line:=$$Plsql_Line;
	    GOTO  Rtn_rslt;
	 Elsif V_ITM_Use_exp_date = 0 And P_expire_date Is Not Null And Nvl(P_expire_date, '01/01/1900') Not In( '01/01/1900','28/08/1317') Then
	       V_msg_txt := Ias_gen_pkg.Get_msg(P_lng_no => P_Lng_No, P_msg_no => 5791)
			    ||chr(10)||Ias_Gen_Pkg.Get_Prompt ( P_Lng_No, 176)||'='||p_i_code
			    ||chr(10)||Ias_Gen_Pkg.Get_Prompt ( P_Lng_No, 115)||'='||P_expire_date;
	    V_Err_Line:=$$Plsql_Line;
	     GOTO  Rtn_rslt;
	 Elsif V_ITM_Use_exp_date = 1 And V_use_expire_date = 1 And nvl(P_doc_type,0)=4
			  And  V_ALLW_SAL_EXPRD_ITM=1 And Nvl(P_expire_date, '01/01/1900') <P_Doc_Date Then
	   V_msg_txt := Ias_gen_pkg.Get_msg(P_lng_no => P_Lng_No, P_msg_no => 1495)
			    ||chr(10)||Ias_Gen_Pkg.Get_Prompt ( P_Lng_No, 176)||'='||p_i_code
			    ||chr(10)||Ias_Gen_Pkg.Get_Prompt ( P_Lng_No, 115)||'='||P_expire_date;
	    V_Err_Line:=$$Plsql_Line;
	    GOTO  Rtn_rslt;
	 End If;

	 If V_ITM_Use_batch_no = 1 And V_use_batch_no = 1 And NVL(P_batch_no,'0')='0' AND NVL(P_DOC_TYPE,0) =149  Then
	     V_msg_txt := Ias_gen_pkg.Get_msg(P_lng_no => P_Lng_No, P_msg_no => 1113)
			    ||chr(10)||Ias_Gen_Pkg.Get_Prompt ( P_Lng_No, 176)||'='||p_i_code;
	    V_Err_Line:=$$Plsql_Line;
	     GOTO  Rtn_rslt;
	 Elsif V_ITM_Use_batch_no = 0 And P_batch_no Is Not Null And nvl(P_batch_no,'0') <> '0' Then
	    V_msg_txt := Ias_gen_pkg.Get_msg(P_lng_no => P_Lng_No, P_msg_no => 5799)
			    ||chr(10)||Ias_Gen_Pkg.Get_Prompt ( P_Lng_No, 176)||'='||p_i_code
			    ||chr(10)||Ias_Gen_Pkg.Get_Prompt ( P_Lng_No, 1304)||'='||P_batch_no;
	    V_Err_Line:=$$Plsql_Line;
	     GOTO  Rtn_rslt;
	 End If;
 --=====================================================================================================--
	   If Nvl(P_i_price, 0) <= 0 And Nvl(P_i_qty, 0) > 0 Then
	      V_msg_txt := Ias_gen_pkg.Get_msg(P_lng_no => P_Lng_No, P_msg_no => 855)
	      ||CHR(10)||' I_PRICE IS NULL '
	      ||CHR(10)||' I_CODE =' || P_i_code;
	      V_Err_Line:=$$Plsql_Line;
	      GOTO  Rtn_rslt;
	   ELSIF NVL(G_USE_PRICE_INCLUDE_VAT,0) = 1 and NVL(P_I_PRICE_VAT,0) <=0 AND  nvl(G_Clc_Vat_Price_Typ,0)=2 And Nvl(P_i_qty, 0) > 0 THEN
	      V_msg_txt := Ias_gen_pkg.Get_msg(P_lng_no => P_Lng_No, P_msg_no => 855)
	      ||CHR(10)||' I_PRICE_VAT IS NULL '
	      ||CHR(10)||' I_CODE =' || P_i_code;
	      V_Err_Line:=$$Plsql_Line;
	     GOTO  Rtn_rslt;
	   Elsif Nvl(P_i_qty, 0) < 0 Or Nvl(P_free_qty, 0) < 0 Then
	      V_msg_txt := Ias_gen_pkg.Get_msg(P_lng_no => P_Lng_No, P_msg_no => 3492) || ', I_CODE =' || P_i_code || ' ';
	      V_Err_Line:=$$Plsql_Line;
	      GOTO  Rtn_rslt;
	   Elsif Nvl(P_i_qty, 0) + Nvl(P_free_qty, 0) = 0 Then
	      V_msg_txt := Ias_gen_pkg.Get_msg(P_lng_no => P_Lng_No, P_msg_no => 3492) || ', I_CODE =' || P_i_code || ' ';
	      V_Err_Line:=$$Plsql_Line;
	      GOTO  Rtn_rslt;
	   Elsif V_show_disc_per_items = 0 And Nvl(P_dis_amt_dtl, 0) > 0  Then										       -- NOT USE ITM DSCNT
	      V_msg_txt := 'You Send Item Discount , But Systen Not Use Discount Per Item , ' || ' P_DIS_AMT_DTL > 0 or P_DIS_AMT_DTL2 >0 .. ,' || ', I_CODE =' || P_i_code || ' ';
	      V_Err_Line:=$$Plsql_Line;
	      GOTO  Rtn_rslt;
	   Elsif  V_show_disc_per_items = 0 And Nvl(P_dis_amt_dtl_vat, 0) > 0 Then								       -- NOT USE ITM DSCNT
	      V_msg_txt := 'You Send Item Discount , But Systen Not Use Discount Per Item , ' || ' P_DIS_AMT_DTL_VAT > 0 or P_DIS_AMT_DTL2_VAT >0 .. ,' || ', I_CODE =' || P_i_code || ' ';
	      V_Err_Line:=$$Plsql_Line;
	      GOTO  Rtn_rslt;
	   Elsif Nvl(P_dis_amt_dtl, 0) < 0 Or Nvl(P_dis_amt_mst, 0) < 0 Then
	      V_msg_txt := Ias_gen_pkg.Get_msg(P_lng_no => P_Lng_No, P_msg_no => 3312) || ' DIS_AMT_DTL OR DIS_AMT_MST ' || ', I_CODE =' || P_i_code || ' ';
	      V_Err_Line:=$$Plsql_Line;
	      GOTO  Rtn_rslt;
	   Elsif Nvl(P_dis_amt_dtl_vat, 0) < 0	Then
	      V_msg_txt := Ias_gen_pkg.Get_msg(P_lng_no => P_Lng_No, P_msg_no => 3312) || ' P_DIS_AMT_DTL_VAT OR P_DIS_AMT_DTL2_VAT OR P_DIS_AMT_DTL3_VAT' || ', I_CODE =' || P_i_code || ' ';
	      V_Err_Line:=$$Plsql_Line;
	      GOTO  Rtn_rslt;
	   Elsif Nvl(P_dis_per, 0) > 100  Then
	      V_msg_txt := Ias_gen_pkg.Get_msg(P_lng_no => P_Lng_No, P_msg_no => 625) ||chr(10)||Ias_Gen_Pkg.Get_Prompt ( P_Lng_No, 176)||'='||p_i_code;
	      V_Err_Line:=$$Plsql_Line;
	      GOTO  Rtn_rslt;
	   Elsif Nvl(P_i_price, 0) - Nvl(P_dis_amt_dtl, 0) < 0	And Nvl(P_i_qty, 0) > 0 Then
	      V_msg_txt := Ias_gen_pkg.Get_msg(P_lng_no => P_Lng_No, P_msg_no => 774)
			      ||chr(10)||Ias_Gen_Pkg.Get_Prompt ( P_Lng_No, 176)||'='||p_i_code
			      ||chr(10)||Ias_Gen_Pkg.Get_Prompt ( P_Lng_No, 230)||'='||Nvl(P_i_price, 0)
			      ||chr(10)||Ias_Gen_Pkg.Get_Prompt ( P_Lng_No, 2681)||'='|| Nvl(P_dis_amt_dtl, 0);
	      V_Err_Line:=$$Plsql_Line;
	      GOTO  Rtn_rslt;
	   END IF;
	   ----------------------------
	   IF nvl(G_Clc_Vat_Price_Typ,0)=2 THEN

	       If (Nvl(P_i_price_VAT, 0) - (Nvl(P_dis_amt_dtl_VAT, 0))) < 0 And Nvl(P_i_qty, 0) > 0  and Nvl(P_i_price_VAT, 0)>0 Then
		  V_msg_txt := Ias_gen_pkg.Get_msg(P_lng_no => P_Lng_No, P_msg_no => 774)
				  ||chr(10)||Ias_Gen_Pkg.Get_Prompt ( P_Lng_No, 176)||'='||p_i_code
				  ||chr(10)||Ias_Gen_Pkg.Get_Prompt ( P_Lng_No, 13667)||'='||Nvl(P_i_price_VAT, 0)
				  ||chr(10)||Ias_Gen_Pkg.Get_Prompt ( P_Lng_No, 2681) ||'='||Nvl(P_dis_amt_dtl_VAT, 0);
		  V_Err_Line:=$$Plsql_Line;
		  GOTO	Rtn_rslt;
	       End If;
	   END IF;
	   If  NVL(P_DOC_TYPE,0)  IN(4,5) Then
	       If P_Clc_Typ_No_Tax Is Not Null And Nvl (P_USE_VAT, 0) = 1 and nvl(v_has_vat,0)=1
		AND Nvl (Ys_Tax_Pkg.Get_Clc_Tax_Typ (P_Clc_Typ_No => P_Clc_Typ_No_Tax), 0) = 0	Then
		       Begin
			   SELECT 1 into v_cnt FROM
				   GNR_TAX_ITM TI,
				   GNR_TAX_CODE_MST TM,
				   GNR_TAX_CODE_DTL TD,
				   GNR_TAX_TYP_CLC_DTL TC
			       WHERE	       TI.TAX_NO = TM.TAX_NO
			       AND	       TI.TAX_NO = TD.TAX_NO
			       AND	       TI.AGNCY_NO = TD.AGNCY_NO
			       AND	       TI.TAX_NO = TC.TAX_NO
			       AND	       TM.TAX_NO = TD.TAX_NO
			       AND	       TM.TAX_NO = TC.TAX_NO
			       AND	       TD.TAX_NO = TC.TAX_NO
			       AND	       NVL (TM.INACTIVE, 0) = 0
			       AND	       I_CODE = p_I_CODE
			      -- AND		 NVL(TI.TAX_PRCNT,0)>0
			       AND	       TC.CLC_TYP_NO =P_Clc_Typ_No_Tax
			       AND ROWNUM<=1	;
		       Exception
			  When No_Data_Found Then
			     V_Cnt := 0;
			  When Others Then
			    V_Err_Line := $$Plsql_Line;
			    v_Msg_Txt :=  ' Erorr when Check Tax Define For Item ' || chr(10) || Sqlerrm;
			    Goto Rtn_Rslt;
		       End;

		       If nvl(v_cnt,0)=0 Then
			  V_msg_txt := Ias_gen_pkg.Get_msg(P_lng_no => P_Lng_No, P_msg_no => 6130) ||chr(10)||Ias_Gen_Pkg.Get_Prompt ( P_Lng_No, 176)||'='||p_i_code;
			  V_Err_Line:=$$Plsql_Line;
			  GOTO	Rtn_rslt;
		       End If;

	       End If;
	    End If;
   --=====================================================================================================--
   --## CHECK  ITEM  AVLQTY
   IF NVL(P_Chk_Avlqty_Flg,0)=1 THEN

       If P_w_code Is Null Then
	  V_msg_txt := Ias_gen_pkg.Get_msg(P_lng_no => P_Lng_No, P_msg_no => 930) || ' ';
	  V_Err_Line:=$$Plsql_Line;
	  GOTO	Rtn_rslt;
       End If;
       DECLARE
	   V_Avlqty	       NUMBER;
	   V_Resv_Qty	       NUMBER;
	   V_Resv_Qty2		NUMBER;
	   V_Net_Out_Bill_Qty  NUMBER;
	   V_Po_Qty	       NUMBER;
	   V_Allqty	       NUMBER;
	   V_ITM_TXT	       VARCHAR2(4000);
       BEGIN
	   If V_Service_itm = 0 Then
	      /* Begin
			Select Avl_Qty
			      ,Rsrv_Qty
			      ,Net_Out_Bill_Qty
			      ,Prchs_Ord_Qty
			Into   V_Avlqty
			      ,V_Resv_Qty
			      ,V_Net_Out_Bill_Qty
			      ,V_Po_Qty
			From   Table(Inv_Qty_Pkg.Get_Avl_Qty_Fnc(P_Itm_Code	    => P_I_Code
								,P_Itm_Size	    => V_p_size
								,P_W_Code	    => P_W_Code
								,P_Exp_Date	    => P_Expire_Date
								,P_Batch_No	    => P_Batch_No
								,P_T_Date	    => Null
								,P_By_Exp_Btch	    => 1
								,P_All_W_Code	    => 1
								,P_Avl_Qty_Typ	    => 0
								,P_Whr		    => Null
								,P_Usr_No	    =>1
								));

	       Exception When No_Data_Found Then
		   V_Avlqty	      :=0;
		   V_Resv_Qty	      :=0;
		   V_Net_Out_Bill_Qty :=0;
		   V_Po_Qty	      :=0;
	       When Others  Then
		   V_msg_txt :=  'ERROR  IN Get_Avl_Qty_Fnc' || Sqlerrm;
		  V_Err_Line:=$$Plsql_Line;
		  GOTO	Rtn_rslt;
	       End ;*/

	       Begin
		   V_Avlqty:=Get_Icode_Avlqty (  P_Icode   => P_I_Code,
						 P_Psize   => Nvl(V_p_size,1) ,
						 P_Wcode   => P_W_Code,
						 P_Expdate => Nvl(P_Expire_Date,'01/01/1900'),
						 P_Batchno => Nvl(P_Batch_No,'0'));
	       Exception When Others Then
		   V_msg_txt :=  'ERROR  In Get_Icode_Avlqty ' || Sqlerrm;
		   V_Err_Line:=$$Plsql_Line;
		  GOTO	Rtn_rslt;
	       End ;


	       IF V_ITM_USE_EXP_DATE=1 AND V_ITM_Use_batch_no=1 THEN
		 V_ITM_TXT:=Ias_Gen_Pkg.Get_Prompt(P_Lng_No, 115)||' ='||P_Expire_Date||chr(10)||Ias_Gen_Pkg.Get_Prompt(P_Lng_No, 1304)||' ='||P_Batch_No;
	       ELSIF V_ITM_USE_EXP_DATE=1 THEN
		 V_ITM_TXT:=Ias_Gen_Pkg.Get_Prompt(P_Lng_No, 115)||' ='||P_Expire_Date;
	       ELSIF V_ITM_Use_batch_no=1 THEN
		 V_ITM_TXT:=Ias_Gen_Pkg.Get_Prompt(P_Lng_No, 1304)||' ='||P_Batch_No;
	       END IF;

	      V_Allqty := Nvl(V_Avlqty,0);  --- Nvl(V_Resv_Qty,0);

	      If ((V_Allqty)*Nvl(V_p_size,1))  < ((Nvl(P_I_Qty,0)*Nvl(V_p_size,1)) + (Nvl(P_Free_Qty,0)*Nvl(V_p_size,1))) Then
		V_Err_Line:=$$Plsql_Line;

		   IF V_ITM_USE_EXP_DATE=1 AND V_ITM_Use_batch_no=1 THEN
		     V_ITM_TXT:=Ias_Gen_Pkg.Get_Prompt(P_Lng_No, 115)||' ='||P_Expire_Date||chr(10)||Ias_Gen_Pkg.Get_Prompt(P_Lng_No, 1304)||' ='||P_Batch_No;
		   ELSIF V_ITM_USE_EXP_DATE=1 THEN
		     V_ITM_TXT:=Ias_Gen_Pkg.Get_Prompt(P_Lng_No, 115)||' ='||P_Expire_Date;
		   ELSIF V_ITM_Use_batch_no=1 THEN
		     V_ITM_TXT:=Ias_Gen_Pkg.Get_Prompt(P_Lng_No, 1304)||' ='||P_Batch_No;
		   END IF;

		  V_Msg_Txt:=Ias_Gen_Pkg.Get_Msg(P_Lng_No =>P_Lng_No, P_Msg_No =>932)||(Nvl(P_I_Qty,0)+Nvl(P_Free_Qty,0))||chr(10)
					      ||Ias_Gen_Pkg.Get_Prompt(P_Lng_No, 1526)||' =' ||Round(Nvl(V_Avlqty,0),4)||chr(10)
					      ||Ias_Gen_Pkg.Get_Prompt (P_Lng_No,1047 )||' = '||Round(V_Resv_Qty,4)||chr(10)||' '
					      ||Ias_Gen_Pkg.Get_Prompt ( P_Lng_No, 176)||'='||p_i_code||chr(10)||V_ITM_TXT;
		  Goto Rtn_Rslt;
	      End If;
	   End If;
	   NULL;
      END;
   END IF;
   --=====================================================================================================--
   --## CHECK ITEM PRICE
   IF Nvl(P_Chk_Itm_Price,0)=1 THEN
	     CHK_ITM_PRICE   ( P_I_Code 	      =>P_I_Code
			    ,P_Itm_Unt		      =>P_Itm_Unt
			    ,P_P_Size		      =>V_P_SIZE
			    ,P_I_Qty		      =>P_I_Qty
			    ,P_I_Price		      =>P_I_Price
			    ,P_I_Price_Vat	      =>P_I_Price_Vat
			    ,P_Qt_Prm_Method	      =>P_Qt_Prm_Method
			    ,P_Qut_Prm_Price	      =>P_Qut_Prm_Price
			    ,P_Qt_Prm_Ser	      =>P_Qt_Prm_Ser
			    ,P_Dis_Amt_Dtl	      =>P_Dis_Amt_Dtl
			    ,P_Dis_Amt_Dtl_Vat	      =>P_Dis_Amt_Dtl_Vat
			    ,P_Dis_Amt_Mst	      =>P_Dis_Amt_Mst
			    ,P_W_Code		      =>P_W_Code
			    ,P_Expire_Date	      =>P_Expire_Date
			    ,P_Batch_No 	      =>P_Batch_No
			    ,P_Brn_No		      =>P_Brn_No
			    ,P_Doc_Date 	      =>P_DOC_Date
			    ,P_CUR_CODE 	      =>P_CUR_CODE
			    ,P_Ac_Rate		      =>P_AC_RATE
			    ,P_Lev_No		      =>P_LEV_NO
			    ,P_USR_NO		      =>P_USR_NO
			    ,P_Use_Exp_Date	      =>V_ITM_USE_EXP_DATE
			    ,P_Use_Batch_No	      =>V_ITM_USE_EXP_DATE
			    ,P_Service_Item	      =>V_Service_itm
			    ,P_Bill_Doc_Type	      =>P_Bill_Doc_Type
			    ,P_CLC_VAT_PRICE_TYP      =>P_CLC_VAT_PRICE_TYP
			    ,P_Lng_No		      =>P_Lng_No
			    ,P_Msg_Txt		      =>V_Msg_Txt
			    ,P_Pkg_Line 	      =>V_Err_Line
			    ,P_Pkg_NM		      =>V_Pkg_NM);

     IF V_Msg_Txt IS NOT NULL THEN
	Goto Rtn_Rslt;
     END IF;
   END IF;
   --=====================================================================================================--
--####################--
   <<Rtn_rslt>>
   If V_msg_txt Is Not Null Then
	 P_Msg_Txt  := V_Msg_Txt;
	 P_Pkg_Line := V_Err_Line;
	 P_Pkg_NM  := NVL( V_Pkg_NM,'Chk_Itm');
	 Return;
   End If;
--####################--
EXCEPTION WHEN OTHERS THEN
   Raise_Application_Error(-20201, ' Error IN Chk_Itm. ' || chr(10) || Sqlerrm);
End Chk_Itm;

Procedure CHK_ITM_PRICE   (  P_I_Code		     In Ias_Itm_Mst.I_Code%Type
			    ,P_Itm_Unt		     In Ias_Pos_Bill_Dtl.Itm_Unt%Type
			    ,P_P_Size		     In Ias_Pos_Bill_Dtl.P_Size%Type	Default Null
			    ,P_I_Qty		     In Ias_Pos_Bill_Dtl.I_Qty%Type	Default Null
			    ,P_I_Price		     In Ias_Pos_Bill_Dtl.I_Price%Type	 Default Null
			    ,P_I_Price_Vat	     In Ias_Pos_Bill_Dtl.I_Price_Vat%Type   Default Null
			    ,P_Qt_Prm_Method	     In NUMBER					    Default Null
			    ,P_Qut_Prm_Price	     In NUMBER					    Default Null
			    ,P_Qt_Prm_Ser	     In NUMBER					    Default Null
			    ,P_Dis_Amt_Dtl	     In Ias_Pos_Bill_Dtl.Dis_Amt_Dtl%Type		Default Null
			    ,P_Dis_Amt_Dtl_Vat	     In Ias_Pos_Bill_Dtl.Dis_Amt_Dtl_Vat%Type		Default Null
			    ,P_Dis_Amt_Mst	     In Ias_Pos_Bill_Dtl.Dis_Amt_Mst%Type		Default Null
			    ,P_W_Code		     In Ias_Pos_Bill_Dtl.W_Code%Type			Default Null
			    ,P_Expire_Date	     In Ias_Pos_Bill_Dtl.Expire_Date%Type		Default Null
			    ,P_Batch_No 	     In Ias_Pos_Bill_Dtl.Batch_No%Type			Default Null
			    ,P_Brn_No		     In Ias_Pos_Bill_Dtl.Brn_No%Type			Default Null
			    ,P_Doc_Date 	     In Ias_Pos_Bill_Mst.Bill_Date%Type 		Default Null
			    ,P_CUR_CODE 	     In EX_RATE.CUR_CODE%Type			    Default Null
			    ,P_Ac_Rate		     In NUMBER			    Default Null
			    ,P_Lev_No		     In Number					    Default Null
			    ,P_USR_NO		     In USER_R.U_ID%Type			    Default Null
			    ,P_Use_Exp_Date	     IN  NUMBER 				    DEFAULT 1
			    ,P_Use_Batch_No	     IN  NUMBER 				    DEFAULT 1
			    ,P_Service_Item	     IN  NUMBER 				    DEFAULT 0
			    ,P_Bill_Doc_Type	     IN  NUMBER 				    Default Null
			    ,P_CLC_VAT_PRICE_TYP     IN  NUMBER 				    DEFAULT 1
			    ,P_Lng_No		     In Number					    Default 1
			    ,P_Msg_Txt		     In Out Varchar2
			    ,P_Pkg_Line 	     In Out Varchar2
			    ,P_Pkg_NM		     In Out Varchar2) IS
   V_Stock_Rate 		    Number := Ias_Gen_Pkg.Get_Cur_Rate(Ias_Gen_Pkg.Get_Stk_Cur);
   V_Invprice			    Number;
   V_Low_Price			    Number;
   V_High_Price 		    Number;
   V_Lev_No			    Number;
   V_Icwt			    Number;
   V_Price			    Number;
   V_Price_Stk			    Number;
   V_Icwt_Div			    Number;
   V_Cnt			    Number;
   V_Whr			    Varchar2(3000);
   G_Chk_Price_Cost_Lmt_So_Si	    Number(2);
   G_Plimit_Type		    Number(2);
   G_Plimit_Per 		    Number(10);
   G_L_Price			    Number(2);
   G_H_Price			    Number(2);
   G_Chk_Lmt_Price_Minus_Disc_Si    Number(2);
   G_Chk_Lmt_Quot_Prm_Si	    Number(2);
   G_Price_Type 		    Number(2);
   G_Use_Itm_Price_By_Expire_Date   Number(2);
   G_Use_Itm_Price_By_Batch_No	    Number(2);
   G_No_Of_Decimal_Ar		    Number(10);
   G_Costing_Type		    Number(2);
   G_Wtavg_Type 		    Number(2);
   G_Chk_Stk_Quot_Prm_Si	    Number(2);
   P_Doc_Type_Ref		    NUMBER:=0;
   V_msg_txt			    Varchar2(4000) := Null;
   V_Pkg_NM			    Varchar2(500) := Null;
   V_pkg_line			    Varchar2(4000) := Null;
   V_err_line			 Int := Null;
Begin
   Begin
      Select Nvl(Chk_Price_Cost_Lmt_So_Si, 0),
	     Nvl(Chk_Lmt_Price_Minus_Disc_Si, 0),
	     Nvl(Chk_Lmt_Quot_Prm_Si, 0),
	     Nvl(Use_Itm_Price_By_Expire_Date, 0),
	     Nvl(Use_Itm_Price_By_Batch_No, 0),
	     Nvl(No_Of_Decimal_Ar, 2),
	     Nvl(Costing_Type, 0),
	     Nvl(Wtavg_Type, 0),
	     Nvl(Chk_Stk_Quot_Prm_Si, 0),
	     nvl(Price_Type,0)
	Into G_Chk_Price_Cost_Lmt_So_Si,
	     G_Chk_Lmt_Price_Minus_Disc_Si,
	     G_Chk_Lmt_Quot_Prm_Si,
	     G_Use_Itm_Price_By_Expire_Date,
	     G_Use_Itm_Price_By_Batch_No,
	     G_No_Of_Decimal_Ar,
	     G_Costing_Type,
	     G_Wtavg_Type,
	     G_Chk_Stk_Quot_Prm_Si,
	     G_Price_Type
	From Ias_Para_Ar, Ias_Para_Inv;
   Exception
      When Others Then
	 Null;
   End;

      Begin
	 Select Nvl(Plimit_Type, 2),
		Plimit_Per,
		Nvl(L_Price, 2),
		Nvl(H_Price, 2)
	   Into G_Plimit_Type,
		G_Plimit_Per,
		G_L_Price,
		G_H_Price
	   From Privilege_Fixed
	  Where U_Id = P_Usr_No;
      Exception
	 When Others Then
	    V_Msg_Txt :=  'ERROR  IN Privilege_Fixed' || Sqlerrm;
	    V_Err_Line := $$plsql_Line;
	    Goto Rtn_Rslt;
      End;
      --##-----------------------------------------------------------------------------------##--
      If Nvl(G_Clc_Vat_Price_Typ, 0) = 2 Then
	 If G_Chk_Lmt_Price_Minus_Disc_Si = 1 Then
	    V_Price := Nvl(P_I_Price_Vat, 0) - Nvl(P_Dis_Amt_Dtl_Vat, 0) ;
	 Else
	    V_Price := Nvl(P_I_Price_Vat, 0);
	 End If;
      Else
	 If G_Chk_Lmt_Price_Minus_Disc_Si = 1 Then
	    V_Price := Nvl(P_I_Price, 0) - Nvl(P_Dis_Amt_Dtl, 0) ;
	 Else
	    V_Price := Nvl(P_I_Price, 0);
	 End If;
      End If;

      ------------------------------------------------------------------------------
      If G_Chk_Lmt_Price_Minus_Disc_Si = 1 Then
	 V_Price_Stk := Nvl(P_I_Price, 0) - Nvl(P_Dis_Amt_Dtl, 0);
      Else
	 V_Price_Stk := Nvl(P_I_Price, 0);
      End If;

      ------------------------------------------------------------------------------
       If G_L_Price <> 2 Then
	 If (P_Qt_Prm_Ser Is Not Null
	     And Nvl( P_Qt_Prm_Method, 0) In (1, 2))
	    And G_Chk_Lmt_Quot_Prm_Si = 0
	    And ((Nvl( P_Qut_Prm_Price, 0) > 0
		  And Nvl(P_I_Price_Vat, Nvl(P_I_Price, 0)) >= Nvl( P_Qut_Prm_Price, 0))
		 Or Nvl( P_Qut_Prm_Price, 0) = 0) Then
	    Null;
	 Else
	   V_Cnt := Chk_Price_Lmt(P_Lmt_Typ	=>1,
				   P_Price_Type  => G_Price_Type,
				   P_Price	 => V_Price,
				   P_W_Code	 => P_W_Code,
				   P_I_Qty	 => P_I_Qty,
				   P_Brn_No	 => P_Brn_No,
				   P_Usr_No	 => P_Usr_No,
				   P_Lev_No	 => P_Lev_No ,
				   P_I_Code	 => P_I_Code,
				   P_Itm_Unt	 => P_Itm_Unt,
				   P_Cur_Code	 => P_Cur_Code,
				   P_Ac_Rate	 => P_Ac_Rate,
				   P_Stk_Rate	 => Ias_Gen_Pkg.Get_Cur_Rate(Ias_Gen_Pkg.Get_Stk_Cur));

	    V_Lev_No :=        Ias_Gen_Pkg.Get_Low_Lvl_Price(P_Usr_No => P_Usr_No);
	    V_Low_Price      := IAS_ITM_PKG.Get_Itm_Price_Docacy(P_Icode			 => P_I_Code,
								 P_Itm_Unt			 => P_Itm_Unt,
								 P_Acy				 => P_Cur_Code,
								 P_Loc_Cur			 => Ias_Gen_Pkg.Get_Local_Cur,
								 P_Stk_Cur			 => Ias_Gen_Pkg.Get_Stk_Cur,
								 P_Ac_Rate			 => P_Ac_Rate,
								 P_Stk_Rate			 => Ias_Gen_Pkg.Get_Cur_Rate(Ias_Gen_Pkg.Get_Stk_Cur),
								 P_Lev_No			 => V_Lev_No,
								 P_Wcode			 => P_W_Code,
								 P_Iqty 			 => P_I_Qty,
								 P_Bill_Doc_Type		 => P_Bill_Doc_Type,
								 P_Price_Type			 => G_Price_Type,
								 P_Brn_No			 => P_Brn_No,
								 P_Exp_Date			 => P_Expire_Date,
								 P_Batch_No			 => P_Batch_No,
								 P_Use_Price_Exp_Date		 => G_Use_Itm_Price_By_Expire_Date,
								 P_Use_Price_Batch_No		 => G_Use_Itm_Price_By_Batch_No,
								 P_Use_Exp_Date 		 => P_Use_Exp_Date,
								 P_Use_Batch_No 		 => P_Use_Batch_No,
								 P_Itm_Use_Price_Expdate_Optnl	 => 0,
								 P_Itm_Use_Price_Btchno_Optnl	 => 0,
								 P_Usr_No			 => P_Usr_No);

	    ------------------------------------------------------------------------------------------------------
	    If (Round(V_Price, G_No_Of_Decimal_Ar) < Round(V_Low_Price, G_No_Of_Decimal_Ar)
		And Nvl(V_Low_Price, 0) <> 0)
	       Or Nvl(V_Cnt, 0) > 0 Then
	       If G_L_Price = 1 Then
		  V_Msg_Txt :=	Ias_Gen_Pkg.Get_Msg(P_Lng_No => P_Lng_No, P_Msg_No => 1117) || chr(10) || Ias_Gen_Pkg.Get_Prompt(P_Lng_No, 176) || '=' || P_I_Code || chr(10) || Ias_Gen_Pkg.Get_Prompt(P_Lng_No, 230) || '=' || Nvl(V_Price, 0);
		  V_Err_Line := $$plsql_Line;
		  Goto Rtn_Rslt;
	       End If;
	    End If;
	 End If;
	END IF;
	 --##------------------------------------------------------------------------------##--
	 If G_H_Price <> 2 Then
	   V_Cnt := Chk_Price_Lmt(P_Lmt_Typ	=>2,
				   P_Price_Type  => G_Price_Type,
				   P_Price	 => V_Price,
				   P_W_Code	 => P_W_Code,
				   P_I_Qty	 => P_I_Qty,
				   P_Brn_No	 => P_Brn_No,
				   P_Usr_No	 => P_Usr_No,
				   P_Lev_No	 => P_Lev_No ,
				   P_I_Code	 => P_I_Code,
				   P_Itm_Unt	 => P_Itm_Unt,
				   P_Cur_Code	 => P_Cur_Code,
				   P_Ac_Rate	 => P_Ac_Rate,
				   P_Stk_Rate	 => Ias_Gen_Pkg.Get_Cur_Rate(Ias_Gen_Pkg.Get_Stk_Cur));

	    V_Lev_No := 	 Ias_Gen_Pkg.Get_High_Lvl_Price(P_Usr_No => p_USR_NO);
	    V_High_Price      := IAS_ITM_PKG.Get_Itm_Price_Docacy(P_Icode			  => P_I_Code,
								  P_Itm_Unt			  => P_Itm_Unt,
								  P_Acy 			  => P_Cur_Code,
								  P_Loc_Cur			  => Ias_Gen_Pkg.Get_Local_Cur,
								  P_Stk_Cur			  => Ias_Gen_Pkg.Get_Stk_Cur,
								  P_Ac_Rate			  => P_Ac_Rate,
								  P_Stk_Rate			  => Ias_Gen_Pkg.Get_Cur_Rate(Ias_Gen_Pkg.Get_Stk_Cur),
								  P_Lev_No			  => V_Lev_No,
								  P_Wcode			  => P_W_Code,
								  P_Iqty			  => P_I_Qty,
								  P_Bill_Doc_Type		  => P_Bill_Doc_Type,
								  P_Price_Type			  => G_Price_Type,
								  P_Brn_No			  => P_Brn_No,
								  P_Exp_Date			  => P_Expire_Date,
								  P_Batch_No			  => P_Batch_No,
								  P_Use_Price_Exp_Date		  => G_Use_Itm_Price_By_Expire_Date,
								  P_Use_Price_Batch_No		  => G_Use_Itm_Price_By_Batch_No,
								  P_Use_Exp_Date		  => P_Use_Exp_Date,
								  P_Use_Batch_No		  => P_Use_Batch_No,
								  P_Itm_Use_Price_Expdate_Optnl   => 0,
								  P_Itm_Use_Price_Btchno_Optnl	  => 0,
								  P_Usr_No			  => P_Usr_No);

	    --------------------------------------------------------------------------------------------------------
	    If (Round(V_Price, G_No_Of_Decimal_Ar) > Round(V_High_Price, G_No_Of_Decimal_Ar)
		And Nvl(V_High_Price, 0) <> 0)
	       Or Nvl(V_Cnt, 0) > 0 Then
	       If G_H_Price = 1 Then
		  V_Msg_Txt :=	Ias_Gen_Pkg.Get_Msg(P_Lng_No => P_Lng_No, P_Msg_No => 1136) || chr(10) || Ias_Gen_Pkg.Get_Prompt(P_Lng_No, 176) || '=' || P_I_Code || chr(10) || Ias_Gen_Pkg.Get_Prompt(P_Lng_No, 230) || '=' || Nvl(V_Price, 0);
		  V_Err_Line := $$plsql_Line;
		  Goto Rtn_Rslt;
	       End If;
	    End If;
	 End If;

	 --##-----------------------------------------------------------------------------------##--
	 If Nvl(P_Service_Item, 0) = 0 Then
	    V_Invprice := (Nvl(V_Price_Stk, 1) * Nvl(P_Ac_Rate, 1)) / Nvl(V_Stock_Rate, 1);

	    If G_Costing_Type = 2 Then
	       V_Icwt := Ias_Itm_Pkg.Get_Grand_Wtavg(P_Wtavg_Type => G_Wtavg_Type, P_Icode => P_I_Code, P_Wcode => P_W_Code) * Nvl(P_P_Size, 1);
	   /* Else
	       V_Icwt	   := Last_Incoming_Price(P_Wtavg_Type	 => G_Wtavg_Type,
						  P_Icode	 => P_I_Code,
						  P_Psize	 => P_P_Size,
						  P_Wcode	 => P_W_Code,
						  P_Type	 => 1);*/
	    End If;

	    If Nvl( P_Qut_Prm_Price, 0) > 0
	       And G_Chk_Stk_Quot_Prm_Si = 0 Then
	       Null;
	    Else
	       If Nvl(V_Icwt, 0) = 0 Then
		  V_Icwt_Div := 1;
	       Else
		  V_Icwt_Div := V_Icwt;
	       End If;

	       If Nvl(V_Invprice, 0) < Round(Nvl(V_Icwt, 0), 4) Then
		  If G_Plimit_Type In (1, 2) Then
		     If G_Plimit_Type = 1
			Or G_Plimit_Per = 0
			Or (Nvl(G_Plimit_Per, 0) > 0
			    And Round(((Nvl(V_Icwt, 0) - Nvl(V_Invprice, 0)) / V_Icwt_Div) * 100, 2) > G_Plimit_Per) Then
			V_Msg_Txt :=  Ias_Gen_Pkg.Get_Msg(P_Lng_No => P_Lng_No, P_Msg_No => 1079) || chr(10) || Ias_Gen_Pkg.Get_Prompt(P_Lng_No, 176) || '=' || P_I_Code;
			V_Err_Line := $$plsql_Line;
			Goto Rtn_Rslt;
		     End If;
		  End If;
	       End If;
	    End If;
	 End If;
     -- End If; 																																																																																																																										  -------
   --####################--
   <<Rtn_rslt>>
   If V_msg_txt Is Not Null Then
	 P_Msg_Txt  := V_Msg_Txt;
	 P_Pkg_Line := V_Err_Line;
	 P_Pkg_NM  := NVL( V_Pkg_NM,'Gnr_api_pkg.CHK_ITM_PRICE');
	 Return;
   End If;
--####################--
EXCEPTION WHEN OTHERS THEN
   Raise_Application_Error(-20201, ' Error IN CHK_ITM_PRICE. ' || chr(10) || Sqlerrm);
END CHK_ITM_PRICE;
--##-----------------------------------------------------------------------------------------------------##--
Function Chk_Price_Lmt(P_Lmt_Typ    In Number,
		       P_Price_Type In Number,
		       P_Price	    In Number,
		       P_W_Code     In Ias_Pos_Bill_Dtl.W_Code%Type Default Null,
		       P_I_Qty	    In Ias_Pos_Bill_Dtl.I_Qty%Type Default Null,
		       P_Brn_No     In Ias_Pos_Bill_Dtl.Brn_No%Type Default Null,
		       P_Usr_No     In User_R.U_Id%Type Default Null,
		       P_Lev_No     In Number Default Null,
		       P_I_Code     In Ias_Itm_Mst.I_Code%Type,
		       P_Itm_Unt    In Ias_Pos_Bill_Dtl.Itm_Unt%Type,
		       P_Cur_Code   In Ex_Rate.Cur_Code%Type Default Null,
		       P_Ac_Rate    In Number Default Null,
		       P_Stk_Rate   In Number Default Null) Return Number
Is
   V_Cur_Rate	Number;
   V_Cnt	Number;
   V_Fld_Lmt	Varchar2(50);
   V_Whr	Varchar2(5000);
   V_Sgn	Varchar2(5);
   V_Sql	Varchar2(32000);
Begin
   ----------------------------------------------------------------------------------------
   If P_Lmt_Typ = 1 Then
      V_Fld_Lmt := 'b.Min_Itm_Price';
      V_Sgn :=	   '>';
   Else
      V_Fld_Lmt := 'b.Max_Itm_Price';
      V_Sgn :=	   '<';
   End If;

   ---------------------------------------------------------------------------
   If P_Price_Type In (2, 4) Then
      V_Whr := V_Whr || ' And b.W_Code=' || P_W_Code;
   End If;

   If P_Price_Type In (3, 4) Then
      V_Whr := V_Whr || ' And ' || Nvl(P_I_Qty, 0) || ' Between b.From_Qty And b.To_Qty';
   End If;

   If Nvl(P_Price_Type,0) = 5 Then
      V_Whr := V_Whr || ' And b.Brn_no=' || P_Brn_No;
   End If;

   ----------------------------------------------------------------------------------------
   Begin
      V_Cur_Rate := Ias_Gen_Pkg.Get_Cnt('Select B.Cur_Rate
							     From Ias_Pricing_Levels A,Gls_Crncy_Usr_Lmt B
							    Where A.A_Cy     = B.Cur_Code
							      And A.Lev_No   = ' || P_Lev_No || '
							      And B.User_No  = ' || P_Usr_No || '
							      And Rownum<=1');
   Exception
      When Others Then
	 V_Cur_Rate := Null;
   End;

   ---------------------------------------------------------------------------
   --gen_pkg.shw_edtr(v_sql);
   Begin
      V_Cnt	 := Ias_Gen_Pkg.Get_Cnt('Select 1
					  From Ias_Pricing_Levels a,Ias_Item_Price b,Ex_Rate c
					     Where a.Lev_No   = b.Lev_No
					       And b.Lev_No   = ' || P_Lev_No || '
					       And b.I_code=''' || P_I_Code || '''
						       And b.Itm_unt=''' || P_Itm_Unt || '''' || V_Whr || '
						       and ' || V_Fld_Lmt || ' is not null
						       And Decode(a.A_Cy, ''' || P_Cur_Code || ''',' || V_Fld_Lmt || ',
						   ''' || Ias_Gen_Pkg.Get_Stk_Cur || ''' , ((' || V_Fld_Lmt || '*' || P_Stk_Rate || ')/' || P_Ac_Rate || '),
						   ''' || Ias_Gen_Pkg.Get_Local_Cur || ''' , (' || V_Fld_Lmt || '/' || P_Ac_Rate || '),
						   ((' || V_Fld_Lmt || ' * Decode(' || Nvl(V_Cur_Rate, 0) || ',0,C.Cur_Rate,' || Nvl(V_Cur_Rate, 0) || ') ) / ' || P_Ac_Rate || '))' ||
					V_Sgn || Nvl(P_Price, 0) || '
					       And c.Cur_Code = a.A_Cy
					       And RowNum<=1');
   Exception
      When Others Then
	 V_Cnt := 0;
   End;

   Return (V_Cnt);
Exception
   When Others Then
      Return (0);
End Chk_Price_Lmt;
--##-----------------------------------------------------------------------------------------------------##--
FUNCTION PST_INSRT_BILL_PRC
	RETURN VARCHAR2 IS
BEGIN

    G_MSG_TXT := UPDT_BILL_IN_SAV_PRC;
    IF G_MSG_TXT IS NOT NULL THEN
	RETURN G_MSG_TXT;
    END IF;

    /*G_MSG_TXT := SYNC_E_INVC(P_DOC_TYP => 4,P_DOC_SRL => G_BILL_SRL);

    IF G_MSG_TXT IS NOT NULL THEN
	RETURN G_MSG_TXT;
    END IF;*/

    RETURN NULL;
EXCEPTION WHEN OTHERS THEN
	   RETURN G_MSG_TXT;--GET_SQLERRM;
END PST_INSRT_BILL_PRC;
--##-----------------------------------------------------------------------------------------------------##--
FUNCTION UPDT_BILL_IN_SAV_PRC RETURN VARCHAR2 IS
    V_CNT_DTL	    NUMBER;
    V_BILL_AMT	    NUMBER;
    V_DIS_AMT_DTL   NUMBER;
    V_DISC_AMT_MST  NUMBER;
    V_VAT_AMT	    NUMBER;
    V_CLC_TAX_FREE_QTY_FLG NUMBER;
    V_VAT_DISC_AMT     NUMBER;
    V_DISC_AMT_AFTR_VAT NUMBER;
    V_SI_TYPE		NUMBER;
BEGIN
 IF G_BILL_NO IS NOT NULL THEN
   BEGIN
     SELECT CLC_TAX_FREE_QTY_FLG,DISC_AMT_MST,DISC_AMT_MST_VAT,CRD_DISC_PER,DISC_AMT_AFTR_VAT,SI_TYPE
     INTO V_CLC_TAX_FREE_QTY_FLG,G_DISC_AMT_MST,G_DISC_AMT_MST_VAT,G_DISC_CARD_PRCNT,V_DISC_AMT_AFTR_VAT,V_SI_TYPE
     FROM IAS_POS_BILL_MST WHERE BILL_NO=G_BILL_NO;
   EXCEPTION WHEN OTHERS THEN
      V_CLC_TAX_FREE_QTY_FLG:=0;
   END;
     BEGIN
	GNR_QTN_PRM_PKG.CLC_DOC_QTN_PRM(P_DOC_SRL	=> G_BILL_SRL,
					P_BRN_NO	=> G_BRN_NO,
					P_BILL_DOC_TYPE => NULL,
					P_BILL_RATE	=> G_Cur_Rate,
					P_SYS_TYP	=> 2,
					P_C_CODE	=> NULL,
					P_W_CODE	=> NULL,
					P_CSTMR_CODE	=> NULL,
					P_MACHINE_NO	=> G_MACHINE_NO,
					P_NO_OF_DCML	=> G_NO_OF_DECIMAL_AR);
    EXCEPTION
	WHEN OTHERS THEN
	    RETURN 'EXCEPTION IN CLC_DOC_QTN_PRM '||SQLERRM;
    END;
   --IF NVL(G_CLC_TAX_EXTRNAL_FLG,0)>0 THEN
   --##-----------------------------------------------------------------##--
	SELECT NVL(COUNT(*), 0),
		       ROUND(NVL(SUM(I_QTY * I_PRICE), 0), G_NO_OF_DECIMAL_AR),
		       ROUND(NVL(SUM(I_QTY * I_PRICE_VAT), 0), G_NO_OF_DECIMAL_AR),
		       ROUND(NVL(SUM(I_QTY * DIS_AMT_DTL), 0), G_NO_OF_DECIMAL_AR),
		       ROUND(NVL(SUM(I_QTY * DIS_AMT_DTL_VAT), 0), G_NO_OF_DECIMAL_AR),
		       ROUND(SUM((NVL(I_QTY,0)+(NVL(FREE_QTY,0)*NVL(V_CLC_TAX_FREE_QTY_FLG,0) ))*NVL(VAT_AMT,0)),G_NO_OF_DECIMAL_AR),
		       ROUND(SUM(NVL(I_QTY, 0) * (CASE WHEN NVL( QT_PRM_SER, 0) > 0 THEN (NVL(I_PRICE, 0) - NVL(DIS_AMT_DTL,0)) * NVL(I_QTY, 0) ELSE 0 END)), G_NO_OF_DECIMAL_AR)
		  INTO V_CNT_DTL,
		       G_TOT_ITM_PRICE,
		       G_TOT_ITM_PRICE_VAT,
		       G_TOT_DISC_DTL,
		       G_TOT_DISC_DTL_VAT,
		       V_VAT_AMT,
		       G_SUM_PRICE_WITH_PRM
		  FROM IAS_POS_BILL_DTL
		 WHERE BILL_NO = G_BILL_NO;

		FOR DTL_CRSR IN (SELECT ROWID,
					DIS_AMT_DTL,
					DIS_AMT_DTL_VAT,
					DIS_AMT_MST,
					DIS_AMT_MST_VAT,
					DIS_AMT,
					VAT_PER,
					VAT_AMT,
					VAT_AMT_DIS_DTL_VAT,
					VAT_AMT_AFTR_DIS,
					VAT_AMT_BFR_DIS,
					VAT_AMT_DIS_MST_VAT,
					DIS_AFTR_VAT_MST,
					I_QTY ,
					I_PRICE ,
					I_PRICE_VAT,
					I_CODE,
					ROUND(NVL(I_QTY, 0) * (CASE WHEN NVL( QT_PRM_SER, 0) > 0 THEN (NVL(I_PRICE, 0) - NVL(DIS_AMT_DTL,0)) * NVL(I_QTY, 0) ELSE 0 END), G_NO_OF_DECIMAL_AR) TOTAL_PRICE_WITH_PRM
				   FROM IAS_POS_BILL_DTL
				  WHERE BILL_NO = G_BILL_NO)
		LOOP
		    CLC_DISC_VAT_AMT_PRC(P_I_CODE			=> DTL_CRSR.I_CODE ,
					 P_TOT_ITEM_PRICE		=> G_TOT_ITM_PRICE ,
					 P_TOT_ITEM_PRICE_VAT		=> G_TOT_ITM_PRICE_VAT ,
					 P_TOT_DISC			=> G_TOT_DISC_DTL ,
					 P_TOT_DISC_VAT 		=> G_TOT_DISC_DTL_VAT ,
					 P_I_QTY			=> DTL_CRSR.I_QTY ,
					 P_I_PRICE			=> DTL_CRSR.I_PRICE ,
					 P_I_PRICE_VAT			=> DTL_CRSR.I_PRICE_VAT ,
					 P_TOTAL_PRICE_WITH_PRM 	=> DTL_CRSR.TOTAL_PRICE_WITH_PRM ,
					 P_SUM_PRICE_WITH_PRM		=> G_SUM_PRICE_WITH_PRM ,
					 P_CLC_SI_DISC_WITHOUT_ITM_DISC => G_CLC_SI_DISC_WITHOUT_ITM_DISC  ,
					 P_CLC_DISC_CARD_TYP		=> G_CLC_DISC_CARD_TYP ,
					 P_DISC_AMT_MST 		=> G_DISC_AMT_MST,
					 P_DISC_AMT_MST_VAT		=> G_DISC_AMT_MST_VAT ,
					 P_DISC_CARD_PRCNT		=> G_DISC_CARD_PRCNT,
					 P_DIS_AMT_DTL			=> DTL_CRSR.DIS_AMT_DTL,
					 P_DIS_AMT_DTL_VAT		=> DTL_CRSR.DIS_AMT_DTL_VAT,
					 P_DIS_AMT_MST			=> DTL_CRSR.DIS_AMT_MST,
					 P_DIS_AMT_MST_VAT		=> DTL_CRSR.DIS_AMT_MST_VAT,
					 P_DIS_AMT			=> DTL_CRSR.DIS_AMT);

				CLC_ITM_TAX(P_I_CODE		    => DTL_CRSR.I_CODE,
					    P_USE_VAT		    => G_USE_VAT_MCHN,
					    P_CLC_TYP_NO_TAX	    => G_CLC_TYP_NO_TAX,
					    P_CALC_VAT_AMT_TYPE     => V_CALC_VAT_AMT_TYPE,
					    P_USE_PRICE_INCLUDE_VAT => G_USE_PRICE_INCLUDE_VAT,
					    P_I_PRICE		    => DTL_CRSR.I_PRICE,
					    P_I_PRICE_VAT	    => DTL_CRSR.I_PRICE_VAT,
					    P_DIS_AMT_MST	    => DTL_CRSR.DIS_AMT_MST,
					    P_DIS_AMT_MST_VAT	    => DTL_CRSR.DIS_AMT_MST_VAT,
					    P_SUM_TOTAL_VAT_AMT     => V_VAT_AMT,
					    P_DIS_AMT_DTL_VAT	    => DTL_CRSR.DIS_AMT_DTL_VAT,
					    P_DISC_AMT_AFTR_VAT     => V_DISC_AMT_AFTR_VAT,
					    P_VAT_PRCNT 	    => DTL_CRSR.VAT_PER,
					    P_VAT_AMT		    => DTL_CRSR.VAT_AMT,
					    P_DIS_AMT_DTL	    => DTL_CRSR.DIS_AMT_DTL,
					    P_VAT_DISC_AMT	    => V_VAT_DISC_AMT,
					    P_VAT_AMT_DIS_DTL_VAT   => DTL_CRSR.VAT_AMT_DIS_DTL_VAT,
					    P_VAT_AMT_AFTR_DIS	    => DTL_CRSR.VAT_AMT_AFTR_DIS,
					    P_VAT_AMT_BFR_DIS	    => DTL_CRSR.VAT_AMT_BFR_DIS,
					    P_VAT_AMT_DIS_MST_VAT   => DTL_CRSR.VAT_AMT_DIS_MST_VAT,
					    P_DIS_AFTR_VAT_MST	    => DTL_CRSR.DIS_AFTR_VAT_MST);

		    UPDATE IAS_POS_BILL_DTL
		       SET DIS_AMT_DTL = DTL_CRSR.DIS_AMT_DTL,
			   DIS_AMT_DTL_VAT = DTL_CRSR.DIS_AMT_DTL_VAT,
			   DIS_AMT_MST = DTL_CRSR.DIS_AMT_MST,
			   DIS_AMT_MST_VAT = DTL_CRSR.DIS_AMT_MST_VAT,
			   DIS_AMT = DTL_CRSR.DIS_AMT,
			   VAT_PER = DTL_CRSR.VAT_PER,
			   VAT_AMT = DTL_CRSR.VAT_AMT,
			   VAT_AMT_DIS_DTL_VAT = DTL_CRSR.VAT_AMT_DIS_DTL_VAT,
			   VAT_AMT_AFTR_DIS = DTL_CRSR.VAT_AMT_AFTR_DIS,
			   VAT_AMT_BFR_DIS = DTL_CRSR.VAT_AMT_BFR_DIS,
			   VAT_AMT_DIS_MST_VAT = DTL_CRSR.VAT_AMT_DIS_MST_VAT,
			   DIS_AFTR_VAT_MST = DTL_CRSR.DIS_AFTR_VAT_MST,
			   I_PRICE = (CASE G_USE_PRICE_INCLUDE_VAT WHEN 1 THEN	NVL(I_PRICE_VAT, 0) -(NVL(DTL_CRSR.VAT_AMT, 0) + NVL(V_VAT_DISC_AMT, 0)) ELSE I_PRICE END)
		     WHERE ROWID = DTL_CRSR.ROWID;
       END LOOP;
       --##-----------------------------------------------------------------##--
   --END IF;
   SELECT  NVL(COUNT(*), 0),
	   ROUND(NVL(SUM(I_QTY * I_PRICE), 0), G_NO_OF_DECIMAL_AR),
	   ROUND(NVL(SUM(I_QTY * DIS_AMT_DTL), 0), G_NO_OF_DECIMAL_AR),
	   ROUND(NVL(SUM(I_QTY * DIS_AMT_MST), 0), G_NO_OF_DECIMAL_AR),
	   ROUND(SUM((NVL(I_QTY,0)+(NVL(FREE_QTY,0)*NVL(V_CLC_TAX_FREE_QTY_FLG,0) ))*NVL(VAT_AMT,0)),G_NO_OF_DECIMAL_AR)
      INTO V_CNT_DTL,
	   V_BILL_AMT,
	   V_DIS_AMT_DTL,
	   V_DISC_AMT_MST,
	   V_VAT_AMT
      FROM IAS_POS_BILL_DTL
     WHERE BILL_NO = G_BILL_NO;
     IF V_CNT_DTL = 0 THEN
	  RETURN 'NO ROWS FOUND IN DTL';
     END IF;
    --##-----------------------------------------------------------------##--
     UPDATE IAS_POS_BILL_MST
		   SET BILL_AMT =V_BILL_AMT,
		       DISC_AMT_DTL =NVL(V_DIS_AMT_DTL,0),
		       DISC_AMT =NVL(V_DIS_AMT_DTL,0)+NVL(V_DISC_AMT_MST,0),
		       VAT_AMT	=V_VAT_AMT
		      -- CASH_NO = DECODE(NVL(PAID_FLG, 0), 1,IAS_CSHBNK_PKG.GET_USR_CSH_NO(P_USR_NO => G_USR_NO, P_TRMNL_NO => G_TRMNL_NO),NULL)
		 WHERE BILL_NO = G_BILL_NO;
	   --##------------------------------------------------------------------------------------------------##--
				     If NVL(G_USE_VAT,0)=1 AND G_CLC_TYP_NO_TAX Is Not Null AND NVL(V_VAT_AMT,0)>0 Then
					   Ys_Tax_Pkg.Clc_Itm_Tax_Aftr_Save (  P_Clc_Typ_No	   => G_CLC_TYP_NO_TAX	       ,
									       P_Doc_Typ	   => 4 		       , -- Doc_Type In  Ias_Sys.Ias_Docjv_Type_Systems
									       P_Doc_No 	   => G_BILL_NO 	       ,
									       P_Doc_Ser	   => G_BILL_SRL	       ,
									       P_Bill_Doc_Typ	   => G_BILL_TYPE	       ,
									       P_Doc_Jv_Typ	   => V_SI_TYPE 	       ,
									       P_Doc_Date	   => G_BILL_DATE	       ,
									       P_A_Cy		   => G_Cur_Code	       ,
									       P_Ac_Rate	   => G_Cur_Rate	       ,
									       P_STK_RATE	   => IAS_GEN_PKG.GET_CUR_RATE(P_ACY => IAS_GEN_PKG.GET_STK_CUR),
									       P_Calc_Vat_Amt_Type => V_Calc_Vat_Amt_Type      ,
									       P_Clc_Usd_Itm	   => 0 		       ,
									       P_Clc_Rtrn_Doc	   => 0 		       ,
									       P_Bill_No	   => NULL		       ,
									       P_Tbl_Mvmnt_Nm	   => 'POS_TAX_ITM_MOVMNT'   ,
									       P_Tbl_Mst_Nm	   => 'Ias_Pos_Bill_Mst'     ,
									       P_Tbl_Dtl_Nm	   => 'Ias_Pos_Bill_Dtl'     ,
									       P_Fld_Doc_Ser	   => 'M.BILL_SRL'	     ,
									       P_Fld_Tax_A_Code    => 'TD.AC_CODE_AR'	     ,
									       P_Fld_W_Code	   => 'D.W_CODE'	     ,
									       P_Fld_I_Price	   => 'D.I_PRICE'	     ,
									       P_Fld_Disc_Amt	   => 'NVL(D.DIS_AMT,0)'     ,
									       P_Fld_Stk_Cost	   => 0 		       ,
									       P_BRN_NO 	   =>G_BRN_NO		       ,
									       P_Fld_Doc_Seq	   => 'D.RCRD_NO'	       );
				    End If;
				  --##------------------------------------------------------------------------------------------------##--
 END IF;
 RETURN NULL;
EXCEPTION WHEN OTHERS THEN
    RETURN 'EXCEPTION IN UPDATE_BILL_AMT  ' || SQLERRM;
END UPDT_BILL_IN_SAV_PRC;
--##-----------------------------------------------------------------------------------------------------##--
FUNCTION PST_INSRT_RT_BILL_PRC
	RETURN VARCHAR2 IS
BEGIN

    G_MSG_TXT := UPDT_RT_BILL_IN_SAV_PRC;
    IF G_MSG_TXT IS NOT NULL THEN
	RETURN G_MSG_TXT;
    END IF;

    /*G_MSG_TXT := SYNC_E_INVC(P_DOC_TYP => 4,P_DOC_SRL => G_BILL_SRL);

    IF G_MSG_TXT IS NOT NULL THEN
	RETURN G_MSG_TXT;
    END IF;*/

    RETURN NULL;
EXCEPTION WHEN OTHERS THEN
	   RETURN G_MSG_TXT;--GET_SQLERRM;
END PST_INSRT_RT_BILL_PRC;
--##-----------------------------------------------------------------------------------------------------##--
FUNCTION UPDT_RT_BILL_IN_SAV_PRC RETURN VARCHAR2 IS
    V_CNT_DTL	    NUMBER;
    V_RT_BILL_AMT   NUMBER;
    V_DIS_AMT_DTL   NUMBER;
    V_DISC_AMT_MST  NUMBER;
    V_VAT_AMT	    NUMBER;
    V_CLC_TAX_FREE_QTY_FLG NUMBER;
    V_VAT_DISC_AMT     NUMBER;
    V_DISC_AMT_AFTR_VAT NUMBER;
BEGIN
 IF G_RT_BILL_NO IS NOT NULL THEN
   BEGIN
     SELECT CLC_TAX_FREE_QTY_FLG,DISC_AMT_MST,DISC_AMT_MST_VAT,DISC_AMT_AFTR_VAT
     INTO V_CLC_TAX_FREE_QTY_FLG,G_DISC_AMT_MST,G_DISC_AMT_MST_VAT,V_DISC_AMT_AFTR_VAT
     FROM IAS_POS_RT_BILL_MST WHERE RT_BILL_NO=G_RT_BILL_NO;
   EXCEPTION WHEN OTHERS THEN
      V_CLC_TAX_FREE_QTY_FLG:=0;
   END;
   IF NVL(G_CLC_TAX_EXTRNAL_FLG,0)>0 THEN
   --##-----------------------------------------------------------------##--
	SELECT NVL(COUNT(*), 0),
		       ROUND(NVL(SUM(I_QTY * I_PRICE), 0), G_NO_OF_DECIMAL_AR),
		       ROUND(NVL(SUM(I_QTY * I_PRICE_VAT), 0), G_NO_OF_DECIMAL_AR),
		       ROUND(NVL(SUM(I_QTY * DIS_AMT_DTL), 0), G_NO_OF_DECIMAL_AR),
		       ROUND(NVL(SUM(I_QTY * DIS_AMT_DTL_VAT), 0), G_NO_OF_DECIMAL_AR),
		       ROUND(SUM((NVL(I_QTY,0)+(NVL(FREE_QTY,0)*NVL(V_CLC_TAX_FREE_QTY_FLG,0) ))*NVL(VAT_AMT,0)),G_NO_OF_DECIMAL_AR),
		       ROUND(SUM(NVL(I_QTY, 0) * (CASE WHEN NVL( QT_PRM_SER, 0) > 0 THEN (NVL(I_PRICE, 0) - NVL(DIS_AMT_DTL,0)) * NVL(I_QTY, 0) ELSE 0 END)), G_NO_OF_DECIMAL_AR)
		  INTO V_CNT_DTL,
		       G_TOT_ITM_PRICE,
		       G_TOT_ITM_PRICE_VAT,
		       G_TOT_DISC_DTL,
		       G_TOT_DISC_DTL_VAT,
		       V_VAT_AMT,
		       G_SUM_PRICE_WITH_PRM
		  FROM IAS_POS_RT_BILL_DTL
		 WHERE RT_BILL_NO = G_RT_BILL_NO;

		FOR DTL_CRSR IN (SELECT ROWID,
					DIS_AMT_DTL,
					DIS_AMT_DTL_VAT,
					DIS_AMT_MST,
					DIS_AMT_MST_VAT,
					DIS_AMT,
					VAT_PER,
					VAT_AMT,
					VAT_AMT_DIS_DTL_VAT,
					VAT_AMT_AFTR_DIS,
					VAT_AMT_BFR_DIS,
					VAT_AMT_DIS_MST_VAT,
					DIS_AFTR_VAT_MST,
					I_QTY ,
					I_PRICE ,
					I_PRICE_VAT,
					I_CODE,
					ROUND(NVL(I_QTY, 0) * (CASE WHEN NVL( QT_PRM_SER, 0) > 0 THEN (NVL(I_PRICE, 0) - NVL(DIS_AMT_DTL,0)) * NVL(I_QTY, 0) ELSE 0 END), G_NO_OF_DECIMAL_AR) TOTAL_PRICE_WITH_PRM
				   FROM IAS_POS_RT_BILL_DTL
				  WHERE RT_BILL_NO = G_RT_BILL_NO)
		LOOP
		    CLC_DISC_VAT_AMT_PRC(P_I_CODE			=> DTL_CRSR.I_CODE ,
					 P_TOT_ITEM_PRICE		=> G_TOT_ITM_PRICE ,
					 P_TOT_ITEM_PRICE_VAT		=> G_TOT_ITM_PRICE_VAT ,
					 P_TOT_DISC			=> G_TOT_DISC_DTL ,
					 P_TOT_DISC_VAT 		=> G_TOT_DISC_DTL_VAT ,
					 P_I_QTY			=> DTL_CRSR.I_QTY ,
					 P_I_PRICE			=> DTL_CRSR.I_PRICE ,
					 P_I_PRICE_VAT			=> DTL_CRSR.I_PRICE_VAT ,
					 P_TOTAL_PRICE_WITH_PRM 	=> DTL_CRSR.TOTAL_PRICE_WITH_PRM ,
					 P_SUM_PRICE_WITH_PRM		=> G_SUM_PRICE_WITH_PRM ,
					 P_CLC_SI_DISC_WITHOUT_ITM_DISC => G_CLC_SI_DISC_WITHOUT_ITM_DISC  ,
					 P_CLC_DISC_CARD_TYP		=> G_CLC_DISC_CARD_TYP ,
					 P_DISC_AMT_MST 		=> G_DISC_AMT_MST,
					 P_DISC_AMT_MST_VAT		=> G_DISC_AMT_MST_VAT ,
					 P_DISC_CARD_PRCNT		=> G_DISC_CARD_PRCNT,
					 P_DIS_AMT_DTL			=> DTL_CRSR.DIS_AMT_DTL,
					 P_DIS_AMT_DTL_VAT		=> DTL_CRSR.DIS_AMT_DTL_VAT,
					 P_DIS_AMT_MST			=> DTL_CRSR.DIS_AMT_MST,
					 P_DIS_AMT_MST_VAT		=> DTL_CRSR.DIS_AMT_MST_VAT,
					 P_DIS_AMT			=> DTL_CRSR.DIS_AMT);

				CLC_ITM_TAX(P_I_CODE		    => DTL_CRSR.I_CODE,
					    P_USE_VAT		    => G_USE_VAT_MCHN,
					    P_CLC_TYP_NO_TAX	    => G_CLC_TYP_NO_TAX,
					    P_CALC_VAT_AMT_TYPE     => V_CALC_VAT_AMT_TYPE,
					    P_USE_PRICE_INCLUDE_VAT => G_USE_PRICE_INCLUDE_VAT,
					    P_I_PRICE		    => DTL_CRSR.I_PRICE,
					    P_I_PRICE_VAT	    => DTL_CRSR.I_PRICE_VAT,
					    P_DIS_AMT_MST	    => DTL_CRSR.DIS_AMT_MST,
					    P_DIS_AMT_MST_VAT	    => DTL_CRSR.DIS_AMT_MST_VAT,
					    P_SUM_TOTAL_VAT_AMT     => V_VAT_AMT,
					    P_DIS_AMT_DTL_VAT	    => DTL_CRSR.DIS_AMT_DTL_VAT,
					    P_DISC_AMT_AFTR_VAT     => V_DISC_AMT_AFTR_VAT,
					    P_VAT_PRCNT 	    => DTL_CRSR.VAT_PER,
					    P_VAT_AMT		    => DTL_CRSR.VAT_AMT,
					    P_DIS_AMT_DTL	    => DTL_CRSR.DIS_AMT_DTL,
					    P_VAT_DISC_AMT	    => V_VAT_DISC_AMT,
					    P_VAT_AMT_DIS_DTL_VAT   => DTL_CRSR.VAT_AMT_DIS_DTL_VAT,
					    P_VAT_AMT_AFTR_DIS	    => DTL_CRSR.VAT_AMT_AFTR_DIS,
					    P_VAT_AMT_BFR_DIS	    => DTL_CRSR.VAT_AMT_BFR_DIS,
					    P_VAT_AMT_DIS_MST_VAT   => DTL_CRSR.VAT_AMT_DIS_MST_VAT,
					    P_DIS_AFTR_VAT_MST	    => DTL_CRSR.DIS_AFTR_VAT_MST);

		    UPDATE IAS_POS_RT_BILL_DTL
		       SET DIS_AMT_DTL = DTL_CRSR.DIS_AMT_DTL,
			   DIS_AMT_DTL_VAT = DTL_CRSR.DIS_AMT_DTL_VAT,
			   DIS_AMT_MST = DTL_CRSR.DIS_AMT_MST,
			   DIS_AMT_MST_VAT = DTL_CRSR.DIS_AMT_MST_VAT,
			   DIS_AMT = DTL_CRSR.DIS_AMT,
			   VAT_PER = DTL_CRSR.VAT_PER,
			   VAT_AMT = DTL_CRSR.VAT_AMT,
			   VAT_AMT_DIS_DTL_VAT = DTL_CRSR.VAT_AMT_DIS_DTL_VAT,
			   VAT_AMT_AFTR_DIS = DTL_CRSR.VAT_AMT_AFTR_DIS,
			   VAT_AMT_BFR_DIS = DTL_CRSR.VAT_AMT_BFR_DIS,
			   VAT_AMT_DIS_MST_VAT = DTL_CRSR.VAT_AMT_DIS_MST_VAT,
			   DIS_AFTR_VAT_MST = DTL_CRSR.DIS_AFTR_VAT_MST,
			   I_PRICE = (CASE G_USE_PRICE_INCLUDE_VAT WHEN 1 THEN	NVL(I_PRICE_VAT, 0) -(NVL(DTL_CRSR.VAT_AMT, 0) + NVL(V_VAT_DISC_AMT, 0)) ELSE I_PRICE END)
		     WHERE ROWID = DTL_CRSR.ROWID;
       END LOOP;
       --##-----------------------------------------------------------------##--
   END IF;
   SELECT  NVL(COUNT(*), 0),
	   ROUND(NVL(SUM(I_QTY * I_PRICE), 0), G_NO_OF_DECIMAL_AR),
	   ROUND(NVL(SUM(I_QTY * DIS_AMT_DTL), 0), G_NO_OF_DECIMAL_AR),
	   ROUND(NVL(SUM(I_QTY * DIS_AMT_MST), 0), G_NO_OF_DECIMAL_AR),
	   ROUND(SUM((NVL(I_QTY,0)+(NVL(FREE_QTY,0)*NVL(V_CLC_TAX_FREE_QTY_FLG,0) ))*NVL(VAT_AMT,0)),G_NO_OF_DECIMAL_AR)
      INTO V_CNT_DTL,
	   V_RT_BILL_AMT,
	   V_DIS_AMT_DTL,
	   V_DISC_AMT_MST,
	   V_VAT_AMT
      FROM IAS_POS_RT_BILL_DTL
     WHERE RT_BILL_NO = G_RT_BILL_NO;
     IF V_CNT_DTL = 0 THEN
	  RETURN 'NO ROWS FOUND IN DTL';
     END IF;

     UPDATE IAS_POS_RT_BILL_MST
		   SET RT_BILL_AMT = V_RT_BILL_AMT,
		       DISC_AMT_DTL = NVL(V_DIS_AMT_DTL, 0),
		       DISC_AMT =  NVL(V_DIS_AMT_DTL, 0)+NVL(V_DISC_AMT_MST, 0)
		      -- CASH_NO = DECODE(NVL(PAID_FLG, 0), 1,IAS_CSHBNK_PKG.GET_USR_CSH_NO(P_USR_NO => G_USR_NO, P_TRMNL_NO => G_TRMNL_NO),NULL)
		 WHERE RT_BILL_NO = G_RT_BILL_NO;
 END IF;
 RETURN NULL;
EXCEPTION WHEN OTHERS THEN
    RETURN 'EXCEPTION IN UPDATE_RT_BILL_AMT  ' || SQLERRM;
END UPDT_RT_BILL_IN_SAV_PRC;
--##-----------------------------------------------------------------------------------------------------##--
PROCEDURE CLC_DISC_VAT_AMT_PRC(P_I_CODE 		    IN	   IAS_ITM_MST.I_CODE%TYPE,
			   P_TOT_ITEM_PRICE		    IN	   NUMBER,
			   P_TOT_ITEM_PRICE_VAT 	    IN	   NUMBER,
			   P_TOT_DISC			    IN	   NUMBER,
			   P_TOT_DISC_VAT		    IN	   NUMBER,
			   P_I_QTY			    IN	   NUMBER,
			   P_I_PRICE			    IN	   NUMBER,
			   P_I_PRICE_VAT		    IN	   NUMBER,
			   P_TOTAL_PRICE_WITH_PRM	    IN	   NUMBER,
			   P_SUM_PRICE_WITH_PRM 	    IN	   NUMBER,
			   P_CLC_SI_DISC_WITHOUT_ITM_DISC   IN	   NUMBER,
			   P_CLC_DISC_CARD_TYP		    IN	   NUMBER,
			   P_DISC_AMT_MST		    IN	   NUMBER,
			   P_DISC_AMT_MST_VAT		    IN	   NUMBER,
			   P_DISC_CARD_PRCNT		    IN	   NUMBER,
			   P_DIS_AMT_DTL		    IN	   NUMBER,
			   P_DIS_AMT_DTL_VAT		    IN	   NUMBER,
			   P_DIS_AMT_MST		    IN OUT NUMBER,
			   P_DIS_AMT_MST_VAT		    IN OUT NUMBER,
			   P_DIS_AMT			    IN OUT NUMBER)
    IS
    BEGIN
	IF P_I_CODE IS NULL THEN
	    RETURN;
	END IF;

	IF (NVL(P_DISC_AMT_MST, 0) + NVL(P_TOT_DISC, 0)) > 0 AND NVL(P_TOT_ITEM_PRICE, 0) > 0 AND NVL(P_I_QTY, 0) > 0 THEN

	    IF NVL(P_DISC_CARD_PRCNT, 0) > 0 THEN ---Use Discount Card
		IF P_CLC_DISC_CARD_TYP = 0 THEN
		    IF P_I_PRICE - NVL(P_DIS_AMT_DTL, 0) > 0 AND NVL(P_TOTAL_PRICE_WITH_PRM, 0) = 0 THEN
			IF P_CLC_SI_DISC_WITHOUT_ITM_DISC = 1 THEN
			    P_DIS_AMT_MST := (NVL(P_DISC_AMT_MST, 0) / (P_TOT_ITEM_PRICE - NVL(P_TOT_DISC, 0) - NVL(P_SUM_PRICE_WITH_PRM, 0))) * (P_I_PRICE - NVL(P_DIS_AMT_DTL, 0));

			    IF NVL(P_TOT_ITEM_PRICE_VAT, 0) > 0 THEN
				P_DIS_AMT_MST_VAT := (NVL(P_DISC_AMT_MST_VAT, 0) / (P_TOT_ITEM_PRICE_VAT - NVL(P_TOT_DISC_VAT, 0) - NVL(P_SUM_PRICE_WITH_PRM, 0))) * (P_I_PRICE_VAT - NVL(P_DIS_AMT_DTL_VAT, 0));
			    END IF;
			ELSE
			    P_DIS_AMT_MST := (NVL(P_DISC_AMT_MST, 0) / (P_TOT_ITEM_PRICE - NVL(P_SUM_PRICE_WITH_PRM, 0))) * P_I_PRICE;

			    IF NVL(P_TOT_ITEM_PRICE_VAT, 0) > 0 THEN
				P_DIS_AMT_MST_VAT := (NVL(P_DISC_AMT_MST_VAT, 0) / (P_TOT_ITEM_PRICE_VAT - NVL(P_SUM_PRICE_WITH_PRM, 0))) * P_I_PRICE_VAT;
			    END IF;
			END IF;
		    ELSE
			P_DIS_AMT_MST := 0;
			P_DIS_AMT_MST_VAT := 0;
		    END IF;
		ELSE
		    IF (P_I_PRICE - NVL(P_DIS_AMT_DTL, 0)) > 0 THEN
			IF P_CLC_SI_DISC_WITHOUT_ITM_DISC = 1 THEN
			    P_DIS_AMT_MST := (NVL(P_DISC_AMT_MST, 0) / (P_TOT_ITEM_PRICE - NVL(P_TOT_DISC, 0))) * (P_I_PRICE - NVL(P_DIS_AMT_DTL, 0));

			    IF NVL(P_TOT_ITEM_PRICE_VAT, 0) > 0 THEN
				P_DIS_AMT_MST_VAT := (NVL(P_DISC_AMT_MST_VAT, 0) / (P_TOT_ITEM_PRICE_VAT - NVL(P_TOT_DISC_VAT, 0))) * (P_I_PRICE_VAT - NVL(P_DIS_AMT_DTL_VAT, 0));
			    END IF;

			ELSE
			    P_DIS_AMT_MST := (NVL(P_DISC_AMT_MST, 0) / P_TOT_ITEM_PRICE) * P_I_PRICE;

			    IF NVL(P_TOT_ITEM_PRICE_VAT, 0) > 0 THEN
				P_DIS_AMT_MST_VAT := (NVL(P_DISC_AMT_MST_VAT, 0) / P_TOT_ITEM_PRICE_VAT) * P_I_PRICE_VAT;
			    END IF;
			END IF;
		    ELSE
			P_DIS_AMT_MST := 0;
			P_DIS_AMT_MST_VAT := 0;
		    END IF;
		END IF;
	    ELSE ---Not Use Discount Card
		IF (P_I_PRICE - NVL(P_DIS_AMT_DTL, 0)) > 0 THEN
		    IF P_CLC_SI_DISC_WITHOUT_ITM_DISC = 1 THEN
			P_DIS_AMT_MST := (NVL(P_DISC_AMT_MST, 0) / (P_TOT_ITEM_PRICE - NVL(P_TOT_DISC, 0))) * (P_I_PRICE - NVL(P_DIS_AMT_DTL, 0));
			IF NVL(P_TOT_ITEM_PRICE_VAT, 0) > 0 THEN
			    P_DIS_AMT_MST_VAT := (NVL(P_DISC_AMT_MST_VAT, 0) / (P_TOT_ITEM_PRICE_VAT - NVL(P_TOT_DISC_VAT, 0))) * (P_I_PRICE_VAT - NVL(P_DIS_AMT_DTL_VAT, 0));
			END IF;
		    ELSE
			P_DIS_AMT_MST := (NVL(P_DISC_AMT_MST, 0) / P_TOT_ITEM_PRICE) * P_I_PRICE;
			IF NVL(P_TOT_ITEM_PRICE_VAT, 0) > 0 THEN
			    P_DIS_AMT_MST_VAT := (NVL(P_DISC_AMT_MST_VAT, 0) / P_TOT_ITEM_PRICE_VAT) * P_I_PRICE_VAT;
			END IF;
		    END IF;
		ELSE
		    P_DIS_AMT_MST := 0;
		    P_DIS_AMT_MST_VAT := 0;
		END IF;
	    END IF;
	ELSE
	    P_DIS_AMT_MST := 0;
	    P_DIS_AMT_MST_VAT := 0;
	END IF;
	P_DIS_AMT := NVL(P_DIS_AMT_MST, 0) + NVL(P_DIS_AMT_DTL, 0);
    END CLC_DISC_VAT_AMT_PRC;
    --##-----------------------------------------------------------------------------------------------------##--
    PROCEDURE CLC_ITM_TAX(P_I_CODE		    IN	   VARCHAR2,
			  P_USE_VAT		    IN	   NUMBER,
			  P_CLC_TYP_NO_TAX	    IN	   NUMBER,
			  P_CALC_VAT_AMT_TYPE	    IN	   NUMBER,
			  P_USE_PRICE_INCLUDE_VAT   IN	   NUMBER,
			  P_I_PRICE		    IN	   NUMBER,
			  P_I_PRICE_VAT 	    IN	   NUMBER,
			  P_DIS_AMT_MST 	    IN	   NUMBER,
			  P_DIS_AMT_MST_VAT	    IN	   NUMBER,
			  P_SUM_TOTAL_VAT_AMT	    IN	   NUMBER,
			  P_DIS_AMT_DTL_VAT	    IN	   NUMBER,
			  P_DISC_AMT_AFTR_VAT	    IN	   NUMBER,
			  P_VAT_PRCNT		    IN OUT NUMBER,
			  P_VAT_AMT		    IN OUT NUMBER,
			  P_DIS_AMT_DTL 	    IN OUT NUMBER,
			  P_VAT_DISC_AMT	    IN OUT NUMBER,
			  P_VAT_AMT_DIS_DTL_VAT     IN OUT NUMBER,
			  P_VAT_AMT_AFTR_DIS	    IN OUT NUMBER,
			  P_VAT_AMT_BFR_DIS	    IN OUT NUMBER,
			  P_VAT_AMT_DIS_MST_VAT     IN OUT NUMBER,
			  P_DIS_AFTR_VAT_MST	    IN OUT NUMBER)
    IS
    BEGIN
	IF NVL(P_USE_VAT, 0) = 1  THEN
	    P_VAT_PRCNT := Ys_Tax_Pkg.Get_Itm_Tax_Prcnt(P_CLC_TYP_NO => P_CLC_TYP_NO_TAX, P_I_CODE => P_I_CODE);

	    IF NVL(P_VAT_PRCNT, 0) > 0 THEN
		IF NVL(P_CALC_VAT_AMT_TYPE, 1) = 1 THEN
		    P_VAT_AMT := ROUND((NVL(P_I_PRICE, 0) * NVL(P_VAT_PRCNT, 0)) / 100, 12);
		ELSIF NVL(P_CALC_VAT_AMT_TYPE, 1) = 2 THEN
		    P_VAT_AMT := ROUND(((NVL(P_I_PRICE, 0) - (NVL(P_DIS_AMT_DTL, 0) + NVL(P_DIS_AMT_MST, 0))) * NVL(P_VAT_PRCNT, 0)) / 100, 12);
		    P_VAT_DISC_AMT := ROUND((((NVL(P_DIS_AMT_DTL, 0) + NVL(P_DIS_AMT_MST, 0))) * NVL(P_VAT_PRCNT, 0)) / 100, 12);
		END IF;

		IF NVL(P_USE_PRICE_INCLUDE_VAT, 0) = 1 THEN
		    P_DIS_AMT_DTL := ROUND(P_DIS_AMT_DTL_VAT / ((NVL(P_VAT_PRCNT, 0) / 100) + 1), 12);
		END IF;

		--P_Vat_Amt_Dis_Dtl_Vat :=Round(((Nvl(P_Dis_Amt_Dtl_Vat,0))*Nvl(P_VAT_PRCNT,0))/100,4) ;
		IF NVL(P_DIS_AMT_DTL_VAT, 0) > 0 THEN
		    P_VAT_AMT_DIS_DTL_VAT := NVL(P_DIS_AMT_DTL_VAT, 0) - NVL(P_DIS_AMT_DTL, 0);
		END IF;

		P_VAT_AMT_AFTR_DIS := ROUND(((NVL(P_I_PRICE, 0) - (NVL(P_DIS_AMT_DTL, 0) + NVL(P_DIS_AMT_MST, 0))) * NVL(P_VAT_PRCNT, 0)) / 100, 12);
		P_VAT_AMT_BFR_DIS := ROUND((NVL(P_I_PRICE, 0) * NVL(P_VAT_PRCNT, 0)) / 100, 12);
		P_VAT_AMT_DIS_MST_VAT := ROUND(((NVL(P_DIS_AMT_MST_VAT, 0) * NVL(P_VAT_PRCNT, 0))) / 100, 12);

		--##move to pre insert
		--If  Nvl(P_Use_Price_Include_Vat,0)=1	Then
		IF NVL(P_SUM_TOTAL_VAT_AMT, 0) > 0 AND NVL(P_DISC_AMT_AFTR_VAT, 0) > 0 THEN
		    P_DIS_AFTR_VAT_MST := (NVL(P_DISC_AMT_AFTR_VAT, 0) / (P_SUM_TOTAL_VAT_AMT)) * P_VAT_AMT;
		END IF;
	    /*	  ELSE
			IF NVL(P_TOT_ITEM_PRICE,0)-NVL(P_SUM_PRICE_WITH_PRM,0)>0 AND NVL(P_DISC_AMT_AFTR_VAT,0)>0  THEN
			 P_DIS_AFTR_VAT_MST := (NVL(P_DISC_AMT_AFTR_VAT,0)/(P_TOT_ITEM_PRICE-NVL(P_SUM_PRICE_WITH_PRM,0)))*P_I_PRICE;
		      END IF;
		End If;*/
	    ELSE
		P_VAT_AMT := 0;
		P_VAT_AMT_AFTR_DIS := 0;
		P_VAT_AMT_BFR_DIS := 0;
	    END IF;
	ELSE
	    P_VAT_AMT := 0;
	    P_VAT_AMT_AFTR_DIS := 0;
	    P_VAT_AMT_BFR_DIS := 0;
	END IF;
    END CLC_ITM_TAX;
--##-----------------------------------------------------------------------------------------------------##--
 PROCEDURE CHK_BILL_NO_ST_PRC(P_BILL_NO IN IAS_POS_BILL_MST.BILL_NO%TYPE
			   ,P_MACHINE_NO IN IAS_POS_RT_BILL_MST.MACHINE_NO%TYPE
			   ,P_USR_NO  IN USER_R.U_ID%TYPE
			   ,P_BRN_USR IN IAS_POS_BILL_MST.BRN_USR%TYPE
			   ,P_LNG_NO  IN NUMBER
			   ,P_MSG_NO  OUT NUMBER
			   ,P_Msg_Txt OUT VARCHAR2 ) IS
   V_CNT		  NUMBER:=0;
   V_LNG_NO		  NUMBER;
   V_USR_NM		  VARCHAR2(100);
   V_SQL		  VARCHAR2(8000);
   V_WHR		  VARCHAR2(1000);
   V_BILL_RATE_FLD	  VARCHAR2(1000);
   V_TBL_NM_MST 	  VARCHAR2(500);
   V_MOVE_DATA_TO_DB_LINK VARCHAR2(200);
   V_RETURN_CHANGE_TYPE  NUMBER;
   V_RETURN_PERIOD	 NUMBER;
   V_CHANGE_PERIOD	 NUMBER;
   V_RTRN_COUPON_BILL	 NUMBER;
   V_USE_PREV_PAID_CARD  NUMBER;
   V_Bill_Date		 DATE;
   V_MSG_NO		 NUMBER;
   V_Msg_Txt		 VARCHAR2(200);
   V_Err_No		 NUMBER;
   BEGIN
      V_LNG_NO:=NVL(P_LNG_NO,1);
	---------------------------------------------------------------------
	 If P_bill_no Is Null Then
	     V_Err_No	 := 20001;
	     V_MSG_NO	 :=898;
	     Goto Rtn_Rslt;
	 End If;
	 If P_Usr_no is Null  Then
	      V_Err_No	  := 20002;
	      V_MSG_NO	  :=450;
	      Goto Rtn_Rslt;
	 End If;
	 If P_BRN_USR is Null  Then
	      V_Err_No	  := 20003;
	      V_MSG_NO	  :=1601;
	      V_Msg_Txt   := 'Accounting Unit IS NULL';
	      Goto Rtn_Rslt;
	 End If;
	 V_USR_NM:='YSPOS'||P_BRN_USR;
	 V_CNT := IAS_GEN_PKG.GET_CNT('Select 1 From All_Users Where UserName='''||V_USR_NM||''' And RowNum<=1');

	 If Nvl(V_cnt,0)=0 Then
	      V_Err_No	  := 20002;
	      V_MSG_NO	  :=298;
	      V_MSG_TXT    :=V_USR_NM;
	      Goto Rtn_Rslt;
	 End If;
	--##-----------------------------------------------------------------------##--
	--##check bill no
	V_SQL :='  Select 1
		       From '||V_USR_NM||'.Ias_Pos_Bill_Mst
			Where Bill_No = '||P_bill_no;
	V_Cnt := Ias_Gen_Pkg.Get_Cnt(V_SQL);
	If Nvl(V_Cnt,0)>0 Then
	   V_TBL_NM_MST :=V_USR_NM||'.IAS_POS_BILL_MST';
	Else
	      V_SQL :='  Select 1
		       From '||V_USR_NM||'.Ias_Pos_Hst_Bill_Mst
			Where Bill_No = '||P_bill_no;
	       V_Cnt := Ias_Gen_Pkg.Get_Cnt(V_SQL);
		If Nvl(V_Cnt,0)>0 Then
		   V_TBL_NM_MST :=V_USR_NM||'.IAS_POS_HST_BILL_MST';
		Else
		  IF NVL(CHECK_DB_SRVR_TYP_FNC,0)=0 Then
		    V_Err_No	:= 20005;
		    V_Msg_Txt	:= P_bill_no;
		    V_MSG_NO	:=899;
		    Goto Rtn_Rslt;
		  Else
		      Begin
		       Select
			     Move_Data_To_Db_Link
			Into V_Move_Data_To_Db_Link
			  From ias_pos_machine
			   Where MACHINE_NO=P_MACHINE_NO;
		      Exception When Others Then
			V_Move_Data_To_Db_Link:='ONYX.ONYX.COM';
		      End;
		      V_SQL :='  Select 1
			   From '||V_USR_NM||'.Ias_Pos_Bill_Mst@'||V_Move_Data_To_Db_Link||'
			    Where Bill_No = '||P_bill_no;
		      V_Cnt := Ias_Gen_Pkg.Get_Cnt(V_SQL);
		      If Nvl(V_Cnt,0)>0 Then
			 V_TBL_NM_MST :=V_USR_NM||'.Ias_Pos_Hst_Bill_Mst@'||V_Move_Data_To_Db_Link;
		      Else
			 V_Err_No    := 20006;
			 V_Msg_Txt   := P_bill_no;
			 V_MSG_NO    :=899;
			 Goto Rtn_Rslt;
		      End If;
		  End If;
		End If;
	End If;
	IF V_TBL_NM_MST IS NULL THEN
	     V_Err_No	 :=20007;
	     V_Msg_Txt	 := P_bill_no;
	     V_MSG_NO	 :=899;
	     Goto Rtn_rslt;
	ELSE
	    V_SQL :='  Select 1
			   From '||V_TBL_NM_MST||'
			    Where NVL(BILL_RTRN,0)=1 AND Bill_No = '||P_bill_no;
	   V_Cnt := Ias_Gen_Pkg.Get_Cnt(V_SQL);
	   IF NVL(V_Cnt,0)>0 THEN
	     V_Err_No	 :=20007;
	     V_Msg_Txt	 := P_bill_no;
	     V_MSG_NO	 :=4606;
	     Goto Rtn_rslt;
	   ELSE
	       V_SQL :='Select 1
			       From IAS_POS_RT_BILL_MST
				Where  Bill_No = '||P_bill_no||'
			  UNION ALL
			Select 1
			From IAS_POS_HST_RT_BILL_MST
			Where  Bill_No= '||P_bill_no;
		  V_Cnt := Ias_Gen_Pkg.Get_Cnt(V_SQL);
		   IF NVL(V_Cnt,0)>0 THEN
		     V_Err_No	 :=20007;
		     V_Msg_Txt	 := P_bill_no;
		     V_MSG_NO	 :=4606;
		     Goto Rtn_rslt;
		   END IF;
	   END IF;
	END IF;
	--##------------------------------------------------------------------------------##--
	--##CHECK PREIOD ALLOWED
	     BEGIN
		 SELECT RETURN_CHANGE_TYPE,
			RTRN_COUPON_BILL,
			USE_PREV_PAID_CARD
		  INTO V_RETURN_CHANGE_TYPE,
		       V_RTRN_COUPON_BILL,
		       V_USE_PREV_PAID_CARD
		   FROM IAS_PARA_POS ;
	     EXCEPTION
		  WHEN OTHERS THEN
		  NULL;
	     END ;
	IF  V_RETURN_CHANGE_TYPE = 1  THEN
	     BEGIN
		 SELECT RETURN_PERIOD,
			CHANGE_PERIOD
		  INTO V_RETURN_PERIOD,
		       V_CHANGE_PERIOD
		   FROM IAS_PARA_POS ;
	     EXCEPTION
		  WHEN OTHERS THEN
		  V_RETURN_PERIOD := NULL;
		  V_CHANGE_PERIOD := NULL;
	     END ;
	ELSIF V_RETURN_CHANGE_TYPE = 2	THEN
	     BEGIN
		 SELECT RETURN_PERIOD,
			CHANGE_PERIOD
		  INTO V_RETURN_PERIOD,
		       V_CHANGE_PERIOD
		   FROM IAS_POS_MACHINE
		    WHERE MACHINE_NO=P_MACHINE_NO;
	     EXCEPTION WHEN OTHERS THEN
		      V_RETURN_PERIOD := NULL;
		      V_CHANGE_PERIOD := NULL;
	     END ;
	END IF ;
	IF V_CHANGE_PERIOD IS NOT NULL OR V_RETURN_PERIOD IS NOT NULL THEN
	      V_SQL :='  Select bill_date
			   From '||V_TBL_NM_MST||'
			    Where NVL(BILL_RTRN,0)=1 AND Bill_No = '||P_bill_no;
	       V_Bill_Date:= Ias_Pos_Distibuted_Db_Pkg.Get_Date(V_SQL);
	      If V_Bill_Date Is Not Null Then
		    If V_Change_Period Is Not Null and V_Change_Period >=Nvl(V_Return_Period,0)  Then
			   If to_date(SYSDATE,'DD/MM/YYYY') -To_date(V_Bill_Date,'DD/MM/YYYY') > V_Change_Period Then
			     V_Err_No	 :=20010;
			     V_MSG_NO	 :=1252;
			     V_LBL_NO	 :=779;
			     V_Msg_Txt	 := V_Bill_Date;
			     Goto Rtn_rslt;
			   END IF;
		    ElsIf V_Return_Period Is Not Null and V_Return_Period >=Nvl(V_Change_Period,0)  Then
			   If To_date(SYSDATE,'DD/MM/YYYY') -To_date(V_Bill_Date,'DD/MM/YYYY') > V_Return_Period Then
			     V_Err_No	 :=20011;
			     V_MSG_NO	 :=1251;
			     V_LBL_NO	 :=779;
			     V_Msg_Txt	 := V_Bill_Date;
			     Goto Rtn_rslt;
			   End If ;
		    End If;
	      End If ;
	END IF;
	--##------------------------------------------------------------------------------##--
	IF V_Rtrn_Coupon_Bill =1 And  Nvl(V_Use_Prev_Paid_Card,0) = 1 Then
	    V_SQL :='  Select 1
			   From '||V_TBL_NM_MST||'
			    Where NVL(CARD_AMT,0)>0 AND Bill_No = '||P_bill_no;
	   V_Cnt := Ias_Gen_Pkg.Get_Cnt(V_SQL);
	   IF NVL(V_Cnt,0)>0 THEN
	     V_Err_No	 :=200012;
	     V_Msg_Txt	 := P_bill_no;
	     V_MSG_NO	 :=4271;
	     Goto Rtn_rslt;
	   END IF;
	END IF;

       --####################--
      <<RTN_RSLT>>
      P_MSG_NO:=V_MSG_NO;
      IF V_MSG_NO IS NOT NULL AND V_LBL_NO IS NOT NULL THEN
	    P_Msg_Txt :=IAS_GEN_PKG.GET_MSG(P_LNG_NO => V_LNG_NO, P_MSG_NO => V_MSG_NO) || ' - ' || IAS_GEN_PKG.GET_PROMPT (P_LNG_NO => V_LNG_NO, P_LBL_NO => V_LBL_NO)||' '||V_MSG_TXT;
      ELSIF V_MSG_NO IS NOT NULL THEN
	    P_Msg_Txt := IAS_GEN_PKG.GET_MSG(P_LNG_NO => V_LNG_NO, P_MSG_NO => V_MSG_NO) ||' '||V_MSG_TXT;
      END IF;
   END CHK_BILL_NO_ST_PRC;
--##-----------------------------------------------------------------------------------------------------##--
FUNCTION GET_BILL_DATA_XML(P_BILL_NO IN IAS_POS_BILL_MST.BILL_NO%TYPE, P_LANG_NO IN IAS_LABELS.LANG_NO%TYPE)
	RETURN CLOB
    IS
	QRY_RSLT1	    CLOB;
	QRY_RSLT2	    CLOB;
	QRY_CTX 	    DBMS_XMLGEN.CTXHANDLE;

	V_USE_E_INVOICE     S_BRN.USE_E_INVOICE%TYPE:=0;
	V_BRN_TAX_CODE	    S_BRN.BRN_TAX_CODE%TYPE;
	V_BRN_NM	    S_BRN.BRN_LNAME%TYPE;
	V_USE_QR_ENCODING   IAS_PARA_AR.USE_QR_ENCODING%TYPE;
	V_AD_DATE	    IAS_POS_BILL_MST.AD_DATE%TYPE;
	V_BILL_NET_AMT	    IAS_POS_BILL_MST.BILL_AMT%TYPE:=0;
	V_BILL_VAT_AMT	    IAS_POS_BILL_MST.BILL_AMT%TYPE:=0;

    BEGIN

	--##GET QR CODE
	SELECT DECODE(NVL(P_LANG_NO, 1), 1, BRN_LNAME, NVL(BRN_FNAME, BRN_LNAME))
	  INTO V_BRN_NM
	  FROM S_BRN
	 WHERE BRN_NO = (SELECT BRN_NO
			   FROM IAS_POS_BILL_MST
			  WHERE BILL_NO = P_BILL_NO)
	   AND ROWNUM <= 1;
       V_USE_E_INVOICE:=0;
       /* BEGIN
	    POS_GNR_PKG.GET_RPRT_QR_PRMTRS(P_USE_E_INVOICE     => V_USE_E_INVOICE,
					   P_USE_QR_ENCODING   => V_USE_QR_ENCODING,
					   P_BRN_TAX_CODE      => V_BRN_TAX_CODE,
					   P_AD_DATE	       => V_AD_DATE,
					   P_BILL_NET_AMT      => V_BILL_NET_AMT,
					   P_BILL_VAT_AMT      => V_BILL_VAT_AMT,
					   P_DOC_SRL	       => P_BILL_SRL,
					   P_DOC_TYP	       => 1);
	EXCEPTION
	    WHEN OTHERS THEN
		NULL;
	END;*/

	--##END GET QR CODE
	QRY_CTX := DBMS_XMLGEN.NEWCONTEXT('SELECT
			    M.BILL_NO,M.BILL_SRL,M.BILL_DATE,M.BILL_TIME,M.BILL_TYPE,M.SI_TYPE,M.C_CODE,M.A_CY,M.BILL_RATE,
			    M.BILL_AMT,M.POSTED,M.BILL_NOTE,M.MACHINE_NO,M.HUNG,M.HUNG_U_ID,M.HUNG_DATE,M.REPORTED,
			    M.CLC_TYP_NO_TAX,M.VAT_AMT,M.CLC_VAT_AMT_TYP,M.C_TAX_CODE,M.CLC_TAX_FREE_QTY_FLG,
			    M.DISC_AMT,M.DISC_AMT_MST,M.DISC_AMT_DTL,M.CREDIT_CARD,M.CR_CARD_NO,M.CR_CARD_AMT,
			    M.CR_CARD_NO_SCND,M.CR_CARD_AMT_SCND,M.CR_CARD_NO_THRD,M.CR_CARD_AMT_THRD,
			    M.CR_VALUE_DATE,M.CR_VALUE_DATE_SCND,M.CR_VALUE_DATE_THRD,M.CR_CARD_DSC,
			    M.CR_CARD_DSC_SCND,M.CR_CARD_DSC_THRD,M.CR_BANK_NO,M.CR_BANK_NO_SCND,M.CR_BANK_NO_THRD,
			    M.VALUE_DATE,M.CR_VALUED,M.CR_VALUED_SCND,M.CR_VALUED_THRD,M.CR_DOC_NO_REF,M.CR_DOC_NO_REF_SCND,M.CR_DOC_NO_REF_THRD,M.CR_CARD_CST_NO,
			    M.CR_CARD_CST_NO_SCND,M.CR_CARD_CST_NO_THRD,M.CR_CARD_COMM_PER,M.CR_CARD_COMM_PER_SCND,M.CR_CARD_COMM_PER_THRD,M.CR_CARD_GROUP_NO,
			    M.CASH_NO,M.W_CODE,M.PAID_BILL,M.PAID_U_ID,M.PAID_DATE,M.PAYED_AMT,M.REP_CODE,M.EMP_NO,
			    M.FIELD1,M.FIELD2,M.FIELD3,M.FIELD4,M.FIELD5,M.RET_AMT,M.CARD_AMT,M.CARD_AMT_FREE,
			    M.QT_PRM_NO,M.QT_PRM_SER,M.QT_PRM_RCRD_NO,M.CUST_CODE,M.MOBILE_NO,M.POINT_TYP_NO,M.POINT_CALC_TYP_NO,M.POINT_RPLC_AMT,
			    M.CRD_NO,M.CRD_DISC_PER,M.DISC_AMT_HL_PRM,M.ASS_AMT,M.BILL_RTRN,M.DISC_AMT_AFTR_VAT,M.DISC_AMT_MST_VAT,M.VAT_AMT_DISC_MST,
			    M.QT_CPN_AMT,M.PYMNT_AC,M.AC_CODE,M.AC_CODE_DTL,M.AC_DTL_TYP,M.AC_AMT,M.BILL_DOC_TYPE_SUB,
			    M.SFDA_DCTR_NO,M.SFDA_PTNT_ID,M.SFDA_PRSPCT_NO,M.SFDA_PRSPCT_DATE,M.REF_NO,M.OTHR_AMT,
			    M.ADVNC_PYMNT_AMT,M.SRVR_NO,M.DOC_MCHN_SQ,M.COMM_PER,M.COMM_AMT_DTL,M.CC_CODE,M.PJ_NO,M.ACTV_NO,
			    M.WEB_SRVC_TRNSFR_DATA_FLG,M.LVL_PRICE_NO,M.SYS_DOC_ID,M.WEB_SRVC_UUID,M.WEB_SRVC_TRNSFR_DATA_DSC,M.CPN_AMT,
			    M.DOC_HASH,M.ASS_AMT_OTHR,M.ASS_NO,M.SHFT_SRL,M.MOV_DATE,M.DOC_SER_EXTRNL,M.EXTERNAL_POST,
			    M.AD_U_ID,M.AD_DATE,M.UP_U_ID,M.UP_DATE,M.UP_CNT,M.AD_TRMNL_NM,M.UP_TRMNL_NM,M.CMP_NO,M.BRN_NO,M.BRN_YEAR,M.BRN_USR,
			    (SELECT DECODE ('||P_LANG_NO||', 1, NVL (C_A_NAME, C_E_NAME),NVL (C_E_NAME, C_A_NAME))
			     FROM CUSTOMER WHERE C_CODE = M.C_CODE AND ROWNUM <= 1) CSTMR_NM,
			    (SELECT DECODE ('||P_LANG_NO||', 1, NVL (CUST_L_NM, CUST_F_NM),NVL (CUST_F_NM, CUST_L_NM))
			    FROM IAS_CASH_CUSTMR WHERE CUST_CODE = NVL (M.CUST_CODE,0) AND ROWNUM <= 1) CSTMR_CSH_NM,
			    NVL(M.BILL_AMT,0)+NVL(M.VAT_AMT,0)-NVL(M.DISC_AMT,0)-NVL(M.DISC_AMT_AFTR_VAT,0)+NVL(M.Othr_Amt,0) BILL_AMT_NET,
			    YS_TAX_PKG.GET_CST_TAX_BILL_TYP_FNC(P_BILL_TYPE=>M.BILL_TYPE,P_C_CODE=>M.C_CODE,P_CST_CSH_CODE=>M.CUST_CODE,P_Use_Vat=>1) TAX_BILL_TYP
			   FROM IAS_POS_BILL_MST M
			    WHERE M.BILL_NO = ' || P_BILL_NO);

	DBMS_XMLGEN.SETROWSETTAG(QRY_CTX, 'BILL_DATA');
	DBMS_XMLGEN.SETROWTAG(QRY_CTX, 'POS_BILL_MST');
	DBMS_XMLGEN.SETNULLHANDLING(QRY_CTX, DBMS_XMLGEN.EMPTY_TAG);
	QRY_RSLT1 := DBMS_XMLGEN.GETXML(QRY_CTX);

	IF QRY_RSLT1 IS NOT NULL THEN
	    QRY_CTX := DBMS_XMLGEN.NEWCONTEXT('SELECT D.BILL_NO,D.BILL_SRL,D.I_CODE,
		       LTRIM(RTRIM(DECODE(' || P_LANG_NO || ',1,NVL(M.I_NAME,M.I_E_NAME),NVL(M.I_E_NAME,M.I_NAME)))) I_NAME,
			D.ITM_UNT,D.P_SIZE,D.I_QTY,D.P_QTY,D.FREE_QTY,
			D.I_PRICE,D.I_PRICE_VAT,D. DIS_PER,D.DIS_AMT_DTL,D.DIS_AMT_MST,D.DIS_AMT,D.
			VAT_PER,D.VAT_AMT,D.BATCH_NO,D.EXPIRE_DATE,D.BARCODE,D.
			W_CODE,D.SERVICE_ITEM,D.RCRD_NO,D.DOC_D_SEQ,D.QT_PRM_NO,D.QT_PRM_SER,D.QT_PRM_RCRD_NO,D.PRM_GRP_NO
			ORDER_SER,D.ORDER_NO,D.FIELD_DTL1,D.FIELD_DTL2,D.FIELD_DTL3,D.FIELD_DTL4,D.
			DIS_AMT_DTL_HL_PRM,D.QT_I_QTY,D.DIS_AMT_DTL_VAT,D.DIS_AFTR_VAT_MST,D. DIS_AMT_MST_VAT,D.VAT_AMT_DIS_DTL_VAT,D.VAT_AMT_AFTR_DIS,D.
			VAT_AMT_BFR_DIS,D. VAT_AMT_DIS_MST_VAT,D. QR_CODE,D.OTHR_AMT,D.EMP_NO,D.COMM_PER,D.COMM_AMT_DTL,D.
			SSCC_CODE,D.GTIN_CODE,D.SRLNO_CODE,D.MFG_DATE,D.SERIALNO,D.CC_CODE,D.PJ_NO,D.ACTV_NO,D.ITEM_DESC,D.
			CMP_NO,D.BRN_NO,D.BRN_YEAR,D.BRN_USR
			 FROM IAS_POS_BILL_DTL D,IAS_ITM_MST M
			     WHERE D.BILL_NO = ' || P_BILL_NO || '
			       AND D.I_CODE = M.I_CODE
			     ORDER BY D.RCRD_NO');

	    DBMS_XMLGEN.SETROWSETTAG(QRY_CTX, 'BILL_DATA');
	    DBMS_XMLGEN.SETROWTAG(QRY_CTX, 'POS_BILL_DTL');
	    DBMS_XMLGEN.SETNULLHANDLING(QRY_CTX, DBMS_XMLGEN.EMPTY_TAG);

	    QRY_RSLT2 := DBMS_XMLGEN.GETXML(QRY_CTX);

	    IF QRY_RSLT2 IS NOT NULL THEN
		QRY_RSLT1 := REPLACE_CLOB(REPLACE_CLOB(QRY_RSLT1, '</BILL_DATA>', REPLACE_CLOB(REPLACE_CLOB(QRY_RSLT2, '<BILL_DATA>', ''), '<?xml version="1.0"?>', '')), CHR(10) || CHR(10), '');
	    END IF;
	END IF;
     RETURN QRY_RSLT1;
    EXCEPTION WHEN OTHERS THEN
	    RETURN '{"_Result": { "_ErrMsg":"ERROR IN GET_BILL_DATA ' || SQLERRM || '","_ErrNo":-54} }';
    END GET_BILL_DATA_XML;
--##-----------------------------------------------------------------------------------------------------##--
FUNCTION REPLACE_CLOB(P_SRC    CLOB,
		      P_SRCH   CLOB,
		      P_RPLC   CLOB)
	RETURN CLOB
    IS
	V_POS	PLS_INTEGER;
    BEGIN
	V_POS := INSTR(P_SRC, P_SRCH);

	IF V_POS > 0 THEN
	    RETURN SUBSTR(P_SRC, 1, V_POS - 1) || P_RPLC || SUBSTR(P_SRC, V_POS + LENGTH(P_SRCH));
	END IF;

	RETURN P_SRC;
    END REPLACE_CLOB;
FUNCTION GET_RT_BILL_DATA_XML(P_RT_BILL_NO IN IAS_POS_RT_BILL_MST.RT_BILL_NO%TYPE, P_LANG_NO IN IAS_LABELS.LANG_NO%TYPE)
	RETURN CLOB
    IS
	QRY_RSLT1	    CLOB;
	QRY_RSLT2	    CLOB;
	QRY_CTX 	    DBMS_XMLGEN.CTXHANDLE;

	V_USE_E_INVOICE     S_BRN.USE_E_INVOICE%TYPE:=0;
	V_BRN_TAX_CODE	    S_BRN.BRN_TAX_CODE%TYPE;
	V_BRN_NM	    S_BRN.BRN_LNAME%TYPE;
	V_USE_QR_ENCODING   IAS_PARA_AR.USE_QR_ENCODING%TYPE:=0;
	V_AD_DATE	    IAS_POS_RT_BILL_MST.AD_DATE%TYPE;
	V_BILL_NET_AMT	    NUMBER:=0;
	V_BILL_VAT_AMT	    NUMBER:=0;
    BEGIN
	--##GET QR CODE
	SELECT DECODE(NVL(P_LANG_NO, 1), 1, BRN_LNAME, NVL(BRN_FNAME, BRN_LNAME))
	  INTO V_BRN_NM
	  FROM S_BRN
	 WHERE BRN_NO = (SELECT BRN_NO
			   FROM IAS_POS_RT_BILL_MST
			  WHERE RT_BILL_NO = P_RT_BILL_NO)
	   AND ROWNUM <= 1;
       /* BEGIN
	    POS_GNR_PKG.GET_RPRT_QR_PRMTRS(P_USE_E_INVOICE     => V_USE_E_INVOICE,
					   P_USE_QR_ENCODING   => V_USE_QR_ENCODING,
					   P_BRN_TAX_CODE      => V_BRN_TAX_CODE,
					   P_AD_DATE	       => V_AD_DATE,
					   P_BILL_NET_AMT      => V_BILL_NET_AMT,
					   P_BILL_VAT_AMT      => V_BILL_VAT_AMT,
					   P_DOC_SRL	       => P_BILL_SRL,
					   P_DOC_TYP	       => 1);
	EXCEPTION
	    WHEN OTHERS THEN
		NULL;
	END;*/
	--##END GET QR CODE
     QRY_CTX := DBMS_XMLGEN.NEWCONTEXT('SELECT
	M.RT_BILL_NO,M.RT_BILL_SRL,M.BILL_NO,M.BILL_SRL,M.RT_BILL_DATE,M.RT_BILL_TIME,M.RT_BILL_TYPE,M.SR_TYPE,M.C_CODE,M.A_CY,M.RT_BILL_RATE,
	M.RT_BILL_AMT,M.RT_BILL_NOTE,M.MACHINE_NO,M.HUNG,M.PAYED_AMT,M.REPORTED,
	M.VAT_AMT,M.CLC_TYP_NO_TAX,M.CLC_VAT_AMT_TYP,M. C_TAX_CODE,M.CLC_TAX_FREE_QTY_FLG,M.RT_VAT_PRD_TYP,M.RTRN_PRV_YR,M.DISC_AMT,M.DISC_AMT_MST,
	M.DISC_AMT_DTL,M.CASH_NO,M.W_CODE,M.RT_PRICE_TYPE,M.PAYED,M.PAID_U_ID,M.PAID_DATE,
	M.CREDIT_CARD,M.CR_CARD_NO,M.CR_CARD_AMT,M.CR_CARD_NO_SCND,M.CR_CARD_NO_THRD,M.CR_CARD_AMT_SCND,M.CR_CARD_AMT_THRD,M.CR_CARD_DSC,M.CR_CARD_DSC_SCND,
	M.CR_CARD_DSC_THRD,M.CR_BANK_NO,M.CR_BANK_NO_SCND,M.CR_BANK_NO_THRD,M.CR_DOC_NO_REF,M.CR_DOC_NO_REF_SCND,M.CR_DOC_NO_REF_THRD,M.CR_CARD_COMM_PER,
	M.CR_CARD_COMM_PER_SCND,M.CR_CARD_COMM_PER_THRD,M.CR_CARD_CST_NO,M.CR_CARD_CST_NO_SCND,M.CR_CARD_CST_NO_THRD,
	M.REP_CODE,M.W_CODE_BILL,M.REP_CODE_BILL,M.CC_CODE_BILL,M.RETURN_TYPE,M.MACHINE_NO_BILL,
	M.EMP_NO,M.MACHINE_NO_PAID,M.RT_BILL_JRNL,M.CUST_CODE,M.MOBILE_NO,M.POINT_TYP_NO,
	M.DISC_AMT_HL_PRM,M.QT_CPN_AMT,M.QT_CPN_RPLC_AMT,M.DISC_AMT_AFTR_VAT,M.DISC_AMT_MST_VAT,M.VAT_AMT_DISC_MST,
	M.PYMNT_AC,M.AC_CODE,M.AC_CODE_DTL,M.AC_DTL_TYP,M.AC_AMT,M.POINT_RPLC_AMT,M.REF_NO,M.OTHR_AMT,
	M.SRVR_NO,M.DOC_MCHN_SQ,M.COMM_PER,M.COMM_AMT_DTL,M.SYS_DOC_ID,M.CC_CODE,M.PJ_NO,M.ACTV_NO,M.WEB_SRVC_TRNSFR_DATA_FLG,M.LVL_PRICE_NO,
	M.WEB_SRVC_UUID,M.WEB_SRVC_TRNSFR_DATA_DSC,M.DOC_HASH,M.SHFT_SRL,M.MOV_DATE,M.DOC_SER_EXTRNL,M.EXTERNAL_POST,
	M.AD_U_ID,M.AD_DATE,M.UP_U_ID,M.UP_DATE,M.UP_CNT,M.AD_TRMNL_NM,M.UP_TRMNL_NM,M.CMP_NO,M.BRN_NO,M.BRN_YEAR,M.BRN_USR,
	(SELECT DECODE ('||P_LANG_NO||', 1, NVL (C_A_NAME, C_E_NAME),NVL (C_E_NAME, C_A_NAME))
		 FROM CUSTOMER WHERE C_CODE = M.C_CODE AND ROWNUM <= 1) CSTMR_NM,
	(SELECT DECODE ('||P_LANG_NO||', 1, NVL (CUST_L_NM, CUST_F_NM),NVL (CUST_F_NM, CUST_L_NM))
	     FROM IAS_CASH_CUSTMR WHERE CUST_CODE = NVL (M.CUST_CODE,0) AND ROWNUM <= 1) CSTMR_CSH_NM,
       NVL(M.RT_BILL_AMT,0)+NVL(M.VAT_AMT,0)-NVL(M.DISC_AMT,0)-NVL(M.DISC_AMT_AFTR_VAT,0)+NVL(M.Othr_Amt,0) RT_BILL_AMT_NET,
	YS_TAX_PKG.GET_CST_TAX_BILL_TYP_FNC(P_BILL_TYPE=>M.RT_BILL_TYPE,P_C_CODE=>M.C_CODE,P_CST_CSH_CODE=>M.CUST_CODE,P_Use_Vat=>1) TAX_BILL_TYP
	     FROM IAS_POS_RT_BILL_MST M
	     WHERE M.RT_BILL_NO = ' || P_RT_BILL_NO);

	DBMS_XMLGEN.SETROWSETTAG(QRY_CTX, 'RT_BILL_DATA');
	DBMS_XMLGEN.SETROWTAG(QRY_CTX, 'POS_RT_BILL_MST');
	DBMS_XMLGEN.SETNULLHANDLING(QRY_CTX, DBMS_XMLGEN.EMPTY_TAG);
	QRY_RSLT1 := DBMS_XMLGEN.GETXML(QRY_CTX);

	IF QRY_RSLT1 IS NOT NULL THEN
	    QRY_CTX := DBMS_XMLGEN.NEWCONTEXT('SELECT D.RT_BILL_NO,D.RT_BILL_SRL,D.I_CODE,
		       LTRIM(RTRIM(DECODE(' || P_LANG_NO || ',1,NVL(M.I_NAME,M.I_E_NAME),NVL(M.I_E_NAME,M.I_NAME)))) I_NAME,
		       D.ITM_UNT,D.P_SIZE,D.I_QTY,D.P_QTY,D.FREE_QTY,D.I_PRICE,D.I_PRICE_VAT,D.DIS_PER,D.VAT_PER,D.VAT_AMT,
		       D.DIS_AMT_DTL,D.DIS_AMT_MST,D.DIS_AMT,D.BATCH_NO,D.EXPIRE_DATE,D.W_CODE,D.SERVICE_ITEM,D.BARCODE,D.RCRD_NO,
		       D.QT_PRM_SER,D.QT_PRM_RCRD_NO,D.DIS_AMT_DTL_HL_PRM,D.QT_I_QTY,D.RT_RPLC_AMT,
		       D.DIS_AMT_DTL_VAT,D.DIS_AFTR_VAT_MST,D.DIS_AMT_MST_VAT,D.VAT_AMT_DIS_DTL_VAT,D.VAT_AMT_AFTR_DIS,D.VAT_AMT_BFR_DIS,D.VAT_AMT_DIS_MST_VAT,
		       D.DOC_D_SEQ,D.QR_CODE,D.EMP_NO,D.OTHR_AMT,D.SSCC_CODE,D.GTIN_CODE,D.SRLNO_CODE,D.MFG_DATE,D.SERIALNO,D.COMM_PER,D.COMM_AMT_DTL,
		       D.CC_CODE,D.PJ_NO,D.ACTV_NO,D.FIELD_DTL1,D.FIELD_DTL3,D.FIELD_DTL4,D.FIELD_DTL2,D.ITEM_DESC,
		       D.CMP_NO,D.BRN_NO,D.BRN_YEAR,D.QT_PRM_NO,D.BRN_USR
			 FROM IAS_POS_RT_BILL_DTL D,IAS_ITM_MST M
			     WHERE D.RT_BILL_NO = ' || P_RT_BILL_NO || '
			       AND D.I_CODE = M.I_CODE
			     ORDER BY D.RCRD_NO');

	    DBMS_XMLGEN.SETROWSETTAG(QRY_CTX, 'RT_BILL_DATA');
	    DBMS_XMLGEN.SETROWTAG(QRY_CTX, 'POS_RT_BILL_DTL');
	    DBMS_XMLGEN.SETNULLHANDLING(QRY_CTX, DBMS_XMLGEN.EMPTY_TAG);

	    QRY_RSLT2 := DBMS_XMLGEN.GETXML(QRY_CTX);
	    IF QRY_RSLT2 IS NOT NULL THEN
		QRY_RSLT1 := REPLACE_CLOB(REPLACE_CLOB(QRY_RSLT1, '</RT_BILL_DATA>', REPLACE_CLOB(REPLACE_CLOB(QRY_RSLT2, '<RT_BILL_DATA>', ''), '<?xml version="1.0"?>', '')), CHR(10) || CHR(10), '');
	    END IF;
	END IF;
     RETURN QRY_RSLT1;
  EXCEPTION WHEN OTHERS THEN
	   RETURN '{"_Result": { "_ErrMsg":"ERROR IN GET_RT_BILL_DATA ' || SQLERRM || '","_ErrNo":-54} }';
  END GET_RT_BILL_DATA_XML;
--##-----------------------------------------------------------------------------------------------------##--
--
FUNCTION  GET_POS_DATA(P_TYP_NO In NUMBER,   --# 1 SALES 2 RT SALES 3 NET SALES
		       P_WHR_SL    In VARCHAR2 DEFAULT NULL,
		       P_WHR_SL_RT In VARCHAR2 DEFAULT NULL,
		       P_NO_DCML   In NUMBER DEFAULT 2,
		       P_LNG_NO In NUMBER DEFAULT 1 ) RETURN CLOB  IS
  V_CNT     NUMBER;
  V_SQL     VARCHAR2(4000);
  QRY_CTX   DBMS_XMLGEN.CTXHANDLE;
  QRY_RSLT  CLOB;
BEGIN
 IF P_TYP_NO=1 THEN
	V_SQL:='SELECT ROUND(SUM(NVL(D.I_QTY,0)* (NVL (D.I_PRICE,0) + NVL(D.VAT_AMT,0)-NVL(DIS_AMT,0) )* M.BILL_RATE),'||P_NO_DCML||') SALES_TOT
		 ,COUNT(M.BILL_NO) CNT_BILL
		FROM POS_BILL_MST_ALL_VW M, POS_BILL_DTL_ALL_VW D
		WHERE M.BILL_NO=D.BILL_NO '||P_WHR_SL;
 ELSIF P_TYP_NO=2 THEN
      V_SQL:='SELECT ROUND(SUM(NVL(D.I_QTY,0)* (NVL (D.I_PRICE,0) + NVL(D.VAT_AMT,0)-NVL(DIS_AMT,0) )* M.RT_BILL_RATE),'||P_NO_DCML||') RT_SALES_TOT
		   ,COUNT(M.RT_BILL_NO) CNT_RTBILL
		    FROM POS_RT_BILL_MST_ALL_VW M, POS_RT_BILL_DTL_ALL_VW D
		    WHERE M.RT_BILL_NO=D.RT_BILL_NO '||P_WHR_SL_RT;
 ELSIF P_TYP_NO=3 THEN
	  V_SQL:='SELECT SUM(SALES_TOT) SALES_TOT, SUM(RT_SALES_TOT) RT_SALES_TOT,SUM(SALES_TOT)-SUM(RT_SALES_TOT) NET_SALES_TOT
	  FROM (
	   SELECT ROUND(SUM(NVL(D.I_QTY,0)* (NVL (D.I_PRICE,0) + NVL(D.VAT_AMT,0)-NVL(DIS_AMT,0) )* M.BILL_RATE),'||P_NO_DCML||') SALES_TOT,
		 0 RT_SALES_TOT
		FROM POS_BILL_MST_ALL_VW M, POS_BILL_DTL_ALL_VW D
		WHERE M.BILL_NO=D.BILL_NO '||P_WHR_SL||'
		  Union All
	       SELECT 0 SALES_TOT,ROUND(SUM(NVL(D.I_QTY,0)* (NVL (D.I_PRICE,0) + NVL(D.VAT_AMT,0)-NVL(DIS_AMT,0) )* M.RT_BILL_RATE),'||P_NO_DCML||') RT_SALES_TOT
		    FROM POS_RT_BILL_MST_ALL_VW M, POS_RT_BILL_DTL_ALL_VW D
		    WHERE M.RT_BILL_NO=D.RT_BILL_NO '||P_WHR_SL_RT||'
		    )';
 ELSIF P_TYP_NO=4 THEN	--BILL SUM BY BILL_NO
	V_SQL:='SELECT	M.BILL_NO,M.BILL_DATE,M.A_CY,ROUND(SUM(NVL(D.I_QTY,0)* (NVL (D.I_PRICE,0) + NVL(D.VAT_AMT,0)-NVL(DIS_AMT,0) )* M.BILL_RATE),'||P_NO_DCML||') BILL_AMT,
		  M.PAYED_AMT,COUNT(I_CODE) ITM_CNT
		FROM POS_BILL_MST_ALL_VW M, POS_BILL_DTL_ALL_VW D
		WHERE M.BILL_NO=D.BILL_NO '||P_WHR_SL
		||' GROUP BY M.BILL_NO,M.BILL_DATE,M.A_CY,M.PAYED_AMT';
 ELSIF P_TYP_NO=5 THEN	--RT BILL SUM BY RT_BILL_NO
	V_SQL:='SELECT	M.RT_BILL_NO,M.RT_BILL_DATE,M.A_CY,ROUND(SUM(NVL(D.I_QTY,0)* (NVL (D.I_PRICE,0) + NVL(D.VAT_AMT,0)-NVL(DIS_AMT,0) )* M.RT_BILL_RATE),'||P_NO_DCML||') RT_BILL_AMT,
		  M.PAYED_AMT,COUNT(I_CODE) ITM_CNT
		FROM POS_RT_BILL_MST_ALL_VW M, POS_RT_BILL_DTL_ALL_VW D
		WHERE M.RT_BILL_NO=D.RT_BILL_NO '||P_WHR_SL_RT
		||' GROUP BY M.RT_BILL_NO,M.RT_BILL_DATE,M.A_CY,M.PAYED_AMT';
  ELSIF P_TYP_NO=6 THEN   --SUM BILL BY BYMNT TYP
	 V_SQL:='SELECT Sum( decode(bill_type ,1, ((Nvl(M.Bill_Amt,0)+Nvl(M.Vat_Amt,0)-Nvl(M.Disc_Amt,0))-(Nvl(M.Cr_Card_Amt,0)+Nvl(M.Cr_Card_Amt_Scnd,0)+Nvl(M.Cr_Card_Amt_Thrd,0)
	 +Nvl(M.POINT_RPLC_AMT,0)+Nvl(M.CARD_AMT,0)+nvl(M.AC_AMT,0)) *M.BILL_RATE )))  bill_amt_cash,
		       Sum((decode(bill_type ,2,(Nvl(M.Bill_Amt,0)+Nvl(M.Vat_Amt,0) -Nvl(M.Disc_Amt,0) ),0)+NVL(M.AC_AMT,0))*NVL(M.BILL_RATE,1) ) bill_amt_credit,
		       SUM ((Nvl(M.Cr_Card_Amt,0)+Nvl(M.Cr_Card_Amt_Scnd,0)+Nvl(M.Cr_Card_Amt_Thrd,0))*M.BILL_RATE )  Bill_amt_cr_card,
		       SUM((M.NON_CSH_AMT-NVL(M.AC_AMT,0)) *M.BILL_RATE) OTHR_NON_CSH_AMT,
		       SUM(M.NET_BILL_AMT*M.BILL_RATE) BILL_AMT_TOT,
		       SUM(M.Disc_Amt*M.BILL_RATE) Disc_Amt_TOT,
		       SUM(M.Vat_Amt*M.BILL_RATE) Vat_AMT_TOT,
		       COUNT(M.BILL_NO) BILL_NO_CNT
		FROM POS_BILL_MST_ALL_VW M
		WHERE NVL(M.HUNG,0)=0 '||P_WHR_SL;
  ELSIF P_TYP_NO=7 THEN   --SUM RT_BILL BY BYMNT TYP
	V_SQL:='SELECT Sum( decode(RT_bill_type,1,((Nvl(M.RT_Bill_Amt,0)+Nvl(M.Vat_Amt,0)-Nvl(M.Disc_Amt,0))-(Nvl(M.Cr_Card_Amt,0)+Nvl(M.Cr_Card_Amt_Scnd,0)+Nvl(M.Cr_Card_Amt_Thrd,0)
	 +Nvl(M.POINT_RPLC_AMT,0)+nvl(M.AC_AMT,0)) *M.RT_BILL_RATE )))	RT_bill_amt_cash,
		       Sum((decode(RT_bill_type,2,(Nvl(M.RT_Bill_Amt,0)+Nvl(M.Vat_Amt,0) -Nvl(M.Disc_Amt,0) ),0)+NVL(M.AC_AMT,0))*NVL(M.RT_BILL_RATE,1) ) RT_bill_amt_credit,
		       SUM ((Nvl(M.Cr_Card_Amt,0)+Nvl(M.Cr_Card_Amt_Scnd,0)+Nvl(M.Cr_Card_Amt_Thrd,0))*M.RT_BILL_RATE )  RT_Bill_amt_cr_card,
		       SUM(NVL(M.POINT_RPLC_AMT,0) *M.RT_BILL_RATE) OTHR_NON_CSH_AMT,
		       SUM(M.NET_BILL_AMT*M.RT_BILL_RATE) BILL_AMT_TOT,
		       SUM(M.Disc_Amt*M.RT_BILL_RATE) Disc_Amt_TOT,
		       SUM(M.Vat_Amt*M.RT_BILL_RATE) Vat_AMT_TOT,
		       COUNT(M.RT_BILL_NO) BILL_NO_CNT
		FROM POS_RT_BILL_MST_ALL_VW M
		WHERE 1=1 '||P_WHR_SL_RT;
  ELSIF P_TYP_NO=8 THEN --GET TOP 5 SALES ITEMS BY AMT
       V_SQL:='SELECT D.I_CODE,
       Decode('||P_LNG_NO||',1,I_NAME,Nvl(I_E_NAME,I_NAME)) I_NAME,
       ROUND (Sales_Amt_Loc, 2) Sales_amt
	      FROM (  SELECT I_CODE,
			     SUM (Sales_Amt_Loc) Sales_Amt_Loc
			FROM (SELECT D.I_CODE I_CODE,
				       SUM(NVL (D.I_Qty,0)
					  *(NVL (D.I_Price,0)+NVL(D.Vat_amt,0)-NVL(D.Dis_Amt,0))* M.Bill_Rate)
					  Sales_Amt_Loc
				  FROM POS_BILL_MST_ALL_VW M, POS_BILL_DTL_ALL_VW D
				 WHERE M.Bill_NO = D.Bill_NO '||P_WHR_SL||'
			      GROUP BY I_CODE
			      )
		    GROUP BY I_CODE
		    ORDER BY Sales_Amt_Loc DESC) D,
	     IAS_ITM_MST M
	  WHERE M.I_CODE=D.I_CODE AND ROWNUM <=5 ';
  ELSIF P_TYP_NO=9 THEN --GET TOP 5 SALES ITEMS BY QTY
		 V_SQL:='SELECT D.I_CODE,
		       Decode('||P_LNG_NO||',1,I_NAME,Nvl(I_E_NAME,I_NAME)) I_NAME,
		       QTY
		  FROM (SELECT I_CODE,
				 SUM (QTY) QTY
			    FROM (SELECT D.I_CODE I_CODE,
					SUM (NVL (D.P_Qty,0)) QTY
				      FROM POS_BILL_MST_ALL_VW M, POS_BILL_DTL_ALL_VW D
				     WHERE M.Bill_NO = D.Bill_NO '||P_WHR_SL||'
				  GROUP BY I_CODE
				  )
			GROUP BY I_CODE
			ORDER BY QTY DESC) D,
			 IAS_ITM_MST M
		       WHERE M.I_CODE=D.I_CODE AND ROWNUM <=5 ';
  ELSIF P_TYP_NO=10 THEN --GET TOP 5 RT_SALES ITEMS BY AMT
       V_SQL:='SELECT D.I_CODE,
       Decode('||P_LNG_NO||',1,I_NAME,Nvl(I_E_NAME,I_NAME)) I_NAME,
       ROUND (Rt_Sales_Amt_Loc, 2) Rt_Sales_amt
	      FROM (SELECT I_CODE,
			   SUM(Rt_Sales_Amt_Loc) Rt_Sales_Amt_Loc
			FROM (	SELECT D.I_CODE I_CODE,
				       SUM (
					    NVL (D.I_Qty,0)
					  * (NVL (D.I_Price,0)+NVL(D.Vat_amt,0)-NVL(D.Dis_Amt,0))
					  * M.RT_Bill_Rate)
					  Rt_Sales_Amt_Loc
				  FROM POS_RT_BILL_MST_ALL_VW M, POS_RT_BILL_DTL_ALL_VW D
				 WHERE M.RT_Bill_NO = D.RT_Bill_NO '||P_WHR_SL_RT||'
			      GROUP BY I_CODE
			      )
		    GROUP BY I_CODE
		    ORDER BY Rt_Sales_Amt_Loc DESC) D,
	     IAS_ITM_MST M
	  WHERE M.I_CODE=D.I_CODE AND ROWNUM <=5 ';
  ELSIF P_TYP_NO=11 THEN --GET TOP 5 SALES ITEMS BY QTY
		 V_SQL:='SELECT D.I_CODE,
		       Decode('||P_LNG_NO||',1,I_NAME,Nvl(I_E_NAME,I_NAME)) I_NAME,
		       QTY
		  FROM (SELECT I_CODE,
			       SUM(QTY) QTY
			    FROM (SELECT D.I_CODE I_CODE,
					 SUM (NVL (D.P_Qty,0)) QTY
				      FROM POS_RT_BILL_MST_ALL_VW M, POS_RT_BILL_DTL_ALL_VW D
				     WHERE M.RT_Bill_NO = D.RT_Bill_NO '||P_WHR_SL_RT||'
				  GROUP BY I_CODE
				  )
			GROUP BY I_CODE
			ORDER BY QTY DESC) D,
			 IAS_ITM_MST M
		       WHERE M.I_CODE=D.I_CODE AND ROWNUM <=5 ';									    		
 END IF;

     QRY_CTX :=DBMS_XMLGEN.NEWCONTEXT (V_SQL);
      DBMS_XMLGEN.SETNULLHANDLING(QRY_CTX,DBMS_XMLGEN.EMPTY_TAG);
      QRY_RSLT := DBMS_XMLGEN.GETXML(QRY_CTX);
      RETURN QRY_RSLT;

EXCEPTION
WHEN OTHERS THEN
RETURN NULL;
RAISE_APPLICATION_ERROR(-20201,' Error When GET DATA '|| CHR(13) || SQLERRM);
END GET_POS_DATA;
--##-----------------------------------------------------------------------------------------------------##--
PROCEDURE DLT_HNG_BILL_PRC(P_BILL_NO   IN NUMBER
			  ,P_USR_NO    In USER_R.U_ID%Type  Default Null
			  ,P_Lng_No    In Number  Default 1
			  ,P_Msg_Txt   In Out Varchar2) IS
V_HUNG	 NUMBER;
V_MSG_NO NUMBER;
V_MSG_TXT VARCHAR2(1000);
V_AUDIT_DEL_ITM NUMBER;
V_ALLW_DEL_ITM_FROM_POS_BILL  NUMBER;
BEGIN
  BEGIN
    SELECT HUNG INTO V_HUNG FROM IAS_POS_BILL_MST WHERE BILL_NO=P_BILL_NO;
  EXCEPTION WHEN OTHERS THEN
    V_HUNG:=0;
    V_MSG_NO:=899;
    Goto Rtn_Rslt;
  END;
  IF NVL(V_HUNG,0)=0 THEN
     V_MSG_TXT:='This bill not hung';
     Goto Rtn_Rslt;
  END IF;
  BEGIN
   SELECT ALLOW_DEL_ITM_FROM_POS_BILL INTO
	 V_ALLW_DEL_ITM_FROM_POS_BILL
	 FROM PRIVILEGE_FIXED WHERE U_ID=P_USR_NO;
  EXCEPTION WHEN OTHERS THEN
    V_AUDIT_DEL_ITM:=0;
  END;
  IF NVL(V_ALLW_DEL_ITM_FROM_POS_BILL,0)=0 THEN
     V_MSG_NO:=592;
    Goto Rtn_Rslt;
  END IF;
  BEGIN
    SELECT AUDIT_DEL_ITM INTO V_AUDIT_DEL_ITM FROM IAS_PARA_POS;
  EXCEPTION WHEN OTHERS THEN
    V_AUDIT_DEL_ITM:=0;
  END;
  IF NVL(V_HUNG,0)=1 THEN
    IF NVL(V_AUDIT_DEL_ITM,0)>0 THEN
	   Begin
	   INSERT INTO IAS_POS_AUD_ITEM(bill_no    ,
					bill_date  ,
					bill_time  ,
					a_cy	   ,
					bill_rate  ,
					machine_no ,
					i_code	   ,
					p_size	   ,
					Itm_Unt    ,
					w_code	   ,
					i_qty	   ,
					i_price    ,
					barcode    ,
					aud_u_id   ,
					aud_date   ,
					brn_no	   ,
					brn_year   ,
					Cmp_No	   ,
					Brn_Usr,
					Hung_Bill)
		      Select M.bill_no	  ,
			     M.bill_date  ,
			     M.bill_time  ,
			     M.a_cy	  ,
			     M.bill_rate  ,
			     M.machine_no ,
			     D.i_code	  ,
			     D.p_size	  ,
			     D.Itm_Unt	  ,
			     D.w_code	  ,
			     D.i_qty	  ,
			     D.i_price	  ,
			     D.barcode	  ,
			     P_USR_NO	,
			     SYSDATE   ,
			     M.brn_no	  ,
			     M.brn_year   ,
			     M.Cmp_No	  ,
			     M.Brn_Usr,
			     M.Hung
		      From IAS_POS_BILL_MST M,IAS_POS_BILL_DTL D
		      WHERE M.BILL_NO=D.BILL_NO
		       AND M.BILL_NO=P_BILL_NO;
	     EXCEPTION WHEN OTHERS THEN
	     V_MSG_TXT:='ERR WHEN INSERT INTO AUDT TABLE IAS_POS_AUD_ITEM ';
	     Goto Rtn_Rslt;
	     END;
	  END IF;
     BEGIN
       DELETE FROM IAS_POS_BILL_MST WHERE BILL_NO=P_BILL_NO;
       DELETE FROM IAS_POS_BILL_DTL WHERE BILL_NO=P_BILL_NO;
       DELETE FROM POS_TAX_ITM_MOVMNT WHERE DOC_NO=P_BILL_NO AND DOC_TYPE=4;
       DELETE FROM IAS_POS_PAY_BILLS WHERE BILL_NO=P_BILL_NO;
     EXCEPTION WHEN OTHERS THEN
       V_MSG_TXT:='ERR WHEN DELETE BILL NO='||P_BILL_NO;
	Goto Rtn_Rslt;
     END;
  END IF;
     --####################--
      <<RTN_RSLT>>
  --P_MSG_NO:=V_MSG_NO;
  IF V_MSG_NO IS NULL AND V_MSG_TXT IS NULL THEN
       P_Msg_Txt :=V_MSG_TXT;
  ELSIF V_MSG_NO IS NOT NULL THEN
       P_Msg_Txt := IAS_GEN_PKG.GET_MSG(P_LNG_NO => P_LNG_NO, P_MSG_NO => V_MSG_NO) ||' '||V_MSG_TXT;
  END IF;
END DLT_HNG_BILL_PRC;
--##-----------------------------------------------------------------------------------------------------##--
PROCEDURE SET_TAX_BILL_TYP(P_BILL_DOC_TYPE IN IAS_POS_BILL_MST.BILL_TYPE%TYPE
			  ,P_C_CODE	   IN CUSTOMER.C_CODE%TYPE
			  ,P_Use_Vat	   IN NUMBER DEFAULT 0
			  ,P_C_TAX_CODE    IN OUT CUSTOMER.C_TAX_CODE%TYPE
			  ,P_TAX_BILL_TYP  IN OUT CUSTOMER.C_CLASS_VAT%TYPE
			  )
 IS
	V_C_TAX_CODE CUSTOMER.C_TAX_CODE%TYPE := null;
	V_C_CLASS_VAT CUSTOMER.C_CLASS_VAT%TYPE := null;
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
	Else
	   P_C_TAX_CODE:=trim(P_C_TAX_CODE);
	   P_TAX_BILL_TYP:=  CASE WHEN nvl(trim(P_C_TAX_CODE),'0')='0'	THEN 1 ELSE 2 END ;
	End If;
	G_TAX_BILL_TYP:=P_TAX_BILL_TYP;
EXCEPTION WHEN OTHERS THEN
  Null;
END SET_TAX_BILL_TYP;
--##-----------------------------------------------------------------------------------------------------##--
PROCEDURE SYNC_E_INVC_PRC( P_DOC_TYPE	    IN	   NUMBER,
			    P_BILL_TYPE      IN     NUMBER,
			    P_BRN_NO	     IN     NUMBER,
			    P_Use_Vat	     In     Number DEFAULT 0 ,
			    P_SYS_NO	     IN     NUMBER,
			    P_DOC_SER	     IN     NUMBER,
			    P_C_CODE	     IN     VARCHAR2,
			    P_TAX_BILL_TYP   IN     NUMBER DEFAULT 1,
			    P_OFFLINE_VLDT   IN     NUMBER DEFAULT 0,
			    P_DO_COMMIT      IN     NUMBER DEFAULT 0,
			    P_Tbl_Mst_Nm     IN     VARCHAR2,
			    P_Fld_Doc_Ser    IN     VARCHAR2,
			    P_SAVE_TYP	     IN     NUMBER DEFAULT 0,
			    P_COMMIT_FLG     IN     NUMBER DEFAULT 0,
			    P_WEB_SRVC_UUID  OUT  NUMBER,
			    P_WRNNG_TXT      OUT VARCHAR2,
			    P_Msg_Txt	     Out Varchar2,
			    P_ERR_NO	     Out Varchar2,
			    P_Pkg_NM	     Out Varchar2)
IS
    V_START_DATE   DATE;
    V_END_DATE	   DATE;
    V_USR	   VARCHAR2(30);
    V_ERROR	   VARCHAR2(4000);
    V_STATUS	   VARCHAR2(4000);
    V_SRVC_NO	   NUMBER;
    V_CNTRY_CODE   VARCHAR2(30);
BEGIN
    ---------------------------------------------------------
    IF P_DOC_TYPE NOT In (4, 5) Then
       RETURN;
    END IF;
    ---------------------------------------------------------
    IF Nvl(P_SYS_NO,0)=80  And nvl(P_SAVE_TYP,0)=2 THEN
	RETURN;
    END IF;
    ---------------------------------------------------------
    IF NVL(IAS_BRN_PKG.IS_BRN_USE_E_INVC(P_BRN_NO => P_BRN_NO), 0) = 0 OR nvl(P_Use_Vat,0) = 0 THEN
	RETURN;
    END IF;
    ---------------------------------------------------------
    BEGIN
	V_CNTRY_CODE := IAS_BRN_PKG.GET_BRN_CNTRY_CODE(P_BRN_NO);
    EXCEPTION
	WHEN OTHERS THEN
	    V_CNTRY_CODE := NULL;
    END;
   ---------------------------------------------------------
    IF YS_TAX_PKG.GET_ETS_SRVC_FLG_FNC(P_BRN_NO => P_BRN_NO) = 1 AND UPPER(V_CNTRY_CODE) = 'SAU' THEN
	EXECUTE IMMEDIATE 'BEGIN
				YS_JSON_PKG.SYNC_E_INVC_PRC(P_DOC_TYPE	     => '||(CASE WHEN P_DOC_TYPE IS NULL THEN 'NULL' ELSE P_DOC_TYPE || '' END)||',
							    P_BILL_TYPE      => '||(CASE WHEN P_BILL_TYPE IS NULL THEN 'NULL' ELSE P_BILL_TYPE || '' END)||',
							    P_BRN_NO	     => '||(CASE WHEN P_BRN_NO IS NULL THEN 'NULL' ELSE P_BRN_NO || '' END)||',
							    P_SYS_NO	     => '||(CASE WHEN P_SYS_NO IS NULL THEN 'NULL' ELSE P_SYS_NO || '' END)||',
							    P_DOC_SER	     => '||(CASE WHEN P_DOC_SER IS NULL THEN 'NULL' ELSE P_DOC_SER || '' END)||',
							    P_C_CODE	     => '''||(CASE WHEN P_C_CODE IS NULL THEN 'NULL' ELSE P_C_CODE || '' END)||''',
							    P_ERR_TXT	     => :V_ERROR,
							    P_WRNNG_TXT      => :V_STATUS,
							    P_TAX_BILL_TYP   => '||NVL(P_TAX_BILL_TYP,1)||',
							    P_OFFLINE_VLDT   => '||NVL(P_OFFLINE_VLDT,0)||'
							    );
			  END;'
	    USING OUT V_ERROR, OUT V_STATUS;
	    If V_ERROR Is Not Null Then
	      P_ERR_NO :=20691;
	      P_Msg_Txt:=V_ERROR;
	      P_Pkg_NM	:='POS_API_PKG.SYNC_E_INVC_PRC';
	      Return;
	    Else
	       P_Msg_Txt:=null;
	    End If;

	    V_STATUS:=Replace(V_STATUS,'"',' ');
	    V_STATUS:=Replace( V_STATUS,':',' ');
	    V_STATUS:=Replace( V_STATUS,',',' ');
	    V_STATUS:=Replace( V_STATUS,'''',' ');
	    P_WRNNG_TXT:= V_STATUS;

	   If Nvl(P_OFFLINE_VLDT,0)=0 then
		  Begin
		    Execute Immediate ' Select	WEB_SRVC_UUID from '||P_Tbl_Mst_Nm||'
			     where '||P_Fld_Doc_Ser||'='||P_DOC_SER||'
			       and rownum<=1  ' into P_WEB_SRVC_UUID;
		  Exception
		     When Others Then
		       null;
		  End;

		  IF P_WEB_SRVC_UUID Is Null THEN
		       DBMS_LOCK.SLEEP(2);
		  END IF;
		  Begin
			Execute Immediate ' Select  WEB_SRVC_UUID from '||P_Tbl_Mst_Nm||'
				 where '||P_Fld_Doc_Ser||'='||P_DOC_SER||'
				   and rownum<=1  ' into P_WEB_SRVC_UUID;
		   Exception
		     When Others Then
		       null;
		  End;
	   End If;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
	      P_ERR_NO :=20692;
	      P_Msg_Txt:='Err In Sync_E_Invc_Prc  ' || CHR(10) || SQLERRM;
	      P_Pkg_NM	:='POS_API_PKG.SYNC_E_INVC_PRC';
END SYNC_E_INVC_PRC;
--##-----------------------------------------------------------------------------------------------------##--
FUNCTION CHK_DSC_PRV_FNC RETURN NUMBER IS
	V_DISC_LMT		  NUMBER;
	V_DISC_LMT_ITM		  NUMBER;
	VI_DISC_PER		  NUMBER;
	VI_DISC_PER_ITM 	  NUMBER;
	VI_DIS_AMT_MST		  NUMBER := 0;
	V_DIS_AMT_DTL_NO_CHK_PRV  NUMBER;
	V_MSG_NO		  NUMBER;
	V_MSG_TXT		  VARCHAR2(1000);
    BEGIN
	IF NVL(G_DISC_AMT_MST, 0) > 0 OR NVL(G_DISC_AMT_DTL, 0) > 0 THEN --(1)
	    IF NVL(G_DISC_AMT_MST, 0) + NVL(G_DISC_AMT_DTL, 0) > NVL(G_TOT_ITM_PRICE, 0) THEN
	       V_MSG_NO:=884;
	    ELSE
	      BEGIN
		IF NVL(G_TOT_ITM_PRICE, 0) > 0 AND NVL(G_DISC_AMT_MST, 0) + NVL(G_DISC_AMT_DTL, 0) > 0 THEN
		    VI_DIS_AMT_MST := NVL(G_DISC_AMT_MST, 0) - (NVL(G_AMT_ROUNDED_AS_DISC, 0));

		    VI_DISC_PER := ROUND((100 * (VI_DIS_AMT_MST)) / G_TOT_ITM_PRICE, G_NO_OF_DECIMAL_AR);
		    VI_DISC_PER_ITM := ROUND((100 * (NVL(VI_DIS_AMT_MST, 0) + (NVL(G_DISC_AMT_DTL, 0) - NVL(V_DIS_AMT_DTL_NO_CHK_PRV, 0)))) / G_TOT_ITM_PRICE, G_NO_OF_DECIMAL_AR);

		    SELECT NVL(INV_DIS_LMT, 0), NVL(INV_DIS_LMT_ITM,INV_DIS_LMT)
		      INTO V_DISC_LMT, V_DISC_LMT_ITM
		      FROM PRIVILEGE_FIXED
		     WHERE U_ID = G_Ad_U_Id;
		    IF NVL(VI_DISC_PER, 0) > NVL(V_DISC_LMT, 0) THEN
			V_MSG_NO:=626;
		    END IF;
		    IF NVL(VI_DISC_PER_ITM, 0) > NVL(V_DISC_LMT_ITM, 0) THEN
			V_MSG_NO:=626;
		    END IF;
		END IF;
	       END;
	    END IF;
	END IF;
	IF V_MSG_NO IS NOT NULL THEN
	   V_MSG_TXT := Ias_gen_pkg.Get_msg(P_lng_no => G_Lng_No, P_msg_no => V_MSG_NO);
	   RETURN(V_MSG_TXT);
	ELSE
	 RETURN(NULL);
	END IF;
EXCEPTION WHEN OTHERS THEN
   RETURN NULL;
END CHK_DSC_PRV_FNC;
--##-----------------------------------------------------------------------------------------------------##--
 --##END PACKGE
    BEGIN
    EXECUTE IMMEDIATE 'ALTER SESSION SET NLS_DATE_FORMAT=''DD/MM/YYYY''';

      <<LOAD_PARAMETERS>>
    DECLARE
	V_ERR_MSG VARCHAR2(1000);
    BEGIN
	V_ERR_MSG := LOAD_PRMTRS;

	IF V_ERR_MSG IS NOT NULL
	THEN
	    NULL;
	END IF;
    END LOAD_PARAMETERS;
--##--------------------------------------------------------------------------##--
 END POS_API_PKG;
/
