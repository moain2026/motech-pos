-- =============================================
-- PACKAGE SPEC: GLS_LMT_PKG  (status: INVALID)
-- =============================================
CREATE OR REPLACE
PACKAGE GLS_LMT_PKG as
 V_No_Of_Decimal	NUMBER;
 V_USE_MULTI_CUR_LMT	NUMBER;
 V_USE_CST_CR_LMT_LOCAL NUMBER;
 V_Gl_Lmt_Type		Number;
 V_GL_LMT_LVL		Number;
 PROCEDURE GET_PARAMTRS ;
 ---##-----------------------------------------------------------##--
 PROCEDURE CHK_AC_Lmt ( P_DR_CR 	 In  number DEFAULT 1 ,  --0 CREDIT(RECEIVE)   ,  1 DEBIT (PAYMENT
			P_amt		 In  number					    ,
			P_amtF		 In  number  DEFAULT 0				    ,
			P_AC_CODE	 In  ACCOUNT.A_CODE%TYPE	Default Null	    ,
			P_AC_CODE_DTL	 In  Varchar2			Default Null	    ,
			P_CC_CODE	 In  COST_CENTERS.CC_CODE%TYPE	Default Null	    ,
			P_PJ_NO 	 In  IAS_PROJECTS.PJ_NO%TYPE	Default Null	    ,
			P_ACTV_NO	 In  IAS_ACTVTY.ACTV_NO%TYPE	Default Null	    ,
			P_BRN_NO	 In  S_BRN.BRN_NO%TYPE		Default Null	    ,
			P_User_No	 In  Number					    ,
			P_CUR_CODE	 In  Varchar2					    ,
			P_frc_no	 In  Number	     Default 2			    ,
			P_Min_lmt	 out Number					    ,
			P_Max_lmt	   out Number					    ,
			P_Min_Trns_lmt	 out Number					    ,
			P_Max_Trns_lmt	 out Number					    ,
			P_Pass		 out Number					    ,
			P_Pass_Prv	 out Number					    ,
			P_No_Chk_prv	 out Number					    ,
			P_UPD_FLG	 IN NUMBER DEFAULT 0				    ,
			P_Msg		 out Varchar2					    ,
			P_Lng		 In  Number);

 ---##-----------------------------------------------------------##--
  FUNCTION GET_FCLTY_BLNC (P_AC_CODE	   In  ACCOUNT.A_CODE%TYPE		      ,
			     P_AC_DTL_TYP    In  ACCOUNT.AC_DTL_TYP%TYPE		,
			     P_AC_CODE_DTL   In  Varchar2				,
			     P_CUR_CODE      In  Varchar2				,
			     P_CC_CODE	     In  COST_CENTERS.CC_CODE%TYPE		,
			     P_PJ_NO	     In  IAS_PROJECTS.PJ_NO%TYPE		,
			     P_ACTV_NO	     In  IAS_ACTVTY.ACTV_NO%TYPE		,
			     P_BRN_NO	     In  S_BRN.BRN_NO%TYPE  Default Null	,
			     P_MAX_lmt	     in  Number 				,
			     P_FCLTY_AMT     in  Number 				,
			     P_DOC_AMT	     in  Number default 0			,
			     p_FCLTY_ST      in  Number  default 0			,
			     P_frc_no	     In  Number     Default 2  ) RETURN NUMBER;
---##-----------------------------------------------------------##--
PROCEDURE GET_ACDTL_LMT_BLNC(P_DOC_DATE      IN  DATE	DEFAULT YS_GEN_PKG.GET_SYSDATE		,
			     P_A_CODE	     IN ACCOUNT.A_CODE%TYPE	   DEFAULT NULL,
				   P_AC_DTL_TYP    IN NUMBER			 DEFAULT NULL,
				   P_AC_CODE_DTL   IN VARCHAR2			 DEFAULT NULL,
				   P_CUR_CODE	   IN VARCHAR2			 DEFAULT NULL,
			     P_BRN_NO	     IN S_BRN.BRN_NO%TYPE	   DEFAULT NULL,
				   P_CC_CODE	   IN COST_CENTERS.CC_CODE%TYPE  DEFAULT NULL,
				   P_PJ_CODE	   IN IAS_PROJECTS.PJ_NO%TYPE	 DEFAULT NULL,
				   P_ACTV_CODE	   IN IAS_ACTVTY.ACTV_NO%TYPE	 DEFAULT NULL,
				   P_LOC_AMT	   IN NUMBER   DEFAULT 1,
			     P_TRNS_VEIW_TYP IN NUMBER	DEFAULT 1,
			     P_DALY_BLNC     OUT Number ,
			     P_MNTHLY_BLNC   OUT Number ,
			     P_ANULY_BLNC    OUT Number ,
			     P_BLNC	     OUT Number) ;
---##-----------------------------------------------------------##--
End GLS_LMT_PKG;
/

-- ---------------------------------------------
-- PACKAGE BODY: GLS_LMT_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE Body GLS_LMT_PKG as
PROCEDURE GET_PARAMTRS IS
Begin
    ---------------------------------------------------------------------------------
    BEGIN
	   Select	 Gl_Lmt_Type  ,GL_LMT_LVL   ,USE_MULTI_CUR_LMT	 ,  No_Of_Decimal  ,USE_CST_CR_LMT_LOCAL
		Into	 V_Gl_Lmt_Type,V_GL_LMT_LVL ,V_USE_MULTI_CUR_LMT ,  V_No_Of_Decimal,V_USE_CST_CR_LMT_LOCAL
		From Ias_Para_Gl,IAS_PARA_AR;
    Exception When Others Then
       V_Gl_Lmt_Type	 :=0;
       V_No_Of_Decimal	 :=2;
    END ;
    ---------------------------------------------------------------------------------
End GET_PARAMTRS;

PROCEDURE CHK_AC_Lmt (	P_DR_CR 	 In  number DEFAULT 1 ,  --0 CREDIT(RECEIVE)   ,  1 DEBIT (PAYMENT
			P_amt		 In  number,
			P_amtF		 In  number  DEFAULT 0				    ,
			P_AC_CODE	 In  ACCOUNT.A_CODE%TYPE	Default Null	    ,
			P_AC_CODE_DTL	 In  Varchar2			Default Null	    ,
			P_CC_CODE	 In  COST_CENTERS.CC_CODE%TYPE	Default Null	    ,
			P_PJ_NO 	 In  IAS_PROJECTS.PJ_NO%TYPE	Default Null	    ,
			P_ACTV_NO	 In  IAS_ACTVTY.ACTV_NO%TYPE	Default Null	    ,
			P_BRN_NO	 In  S_BRN.BRN_NO%TYPE		Default Null	    ,
			P_User_No	 In  Number,
			P_CUR_CODE	 In  Varchar2,
			P_frc_no	 In  Number	     Default 2,
			P_Min_lmt	 out Number,
			P_Max_lmt	 out Number,
			P_Min_Trns_lmt	 out Number,
			P_Max_Trns_lmt	 out Number,
			P_Pass		 out Number,
			P_Pass_Prv	 out Number,
			P_No_Chk_prv	 out Number   ,
			P_UPD_FLG	 IN NUMBER DEFAULT 0,
			P_Msg		 out Varchar2 ,
			P_Lng		 In  Number) IS


 V_CNT		    Number:=0;
 V_CNT_ACC	    Number:=0;
 V_FCLTY_AMT	    Number;
 V_FCLTY_BLNC	    Number:=0;
 V_FCLTY_ST	    Number:=0;
 V_MAX_LMT_PSBL     Number:=0;
 V_Amt		    Number:=0;
 V_AmtF 	    Number:=0;
 V_LOC_AMT	    Number:=0;
 V_Bal		    Number:=0;
 V_Dr_Cr	    Number;
 V_Dr_Cr2	    Number;
 V_CUR_CODE	    VARCHAR2(30);
 V_AC_CODE	    VARCHAR2(30);
 V_AC_CODE_DTL	    VARCHAR2(30);
 V_AC_CODE_DTL_TMP  VARCHAR2(30);
 V_AC_DTL_TYP	    NUMBER;
 V_CC_CODE	    VARCHAR2(30);
 V_PJ_NO	    VARCHAR2(30);
 V_ACTV_NO	    VARCHAR2(30);
 V_MAX_MSG_TXT	    VARCHAR2(4000);
 V_DOC_DATE	    DATE :=TO_CHAR(SYSDATE,'DD/MM/YYYY');
 V_ANULY_LMT	    Number;
 V_MNTHLY_LMT	    Number;
 V_DALY_LMT	    Number;
 V_Amt_Trns	    Number:=0;
 V_AmtF_Trns	    Number:=0;
 V_DALY_BLNC	    Number:=0;
 V_MNTHLY_BLNC	    Number:=0;
 V_ANULY_BLNC	    Number:=0;
Begin

    ---------------------------------------------------------------------------------
    GET_PARAMTRS;
    ---------------------------------------------------------------------------------
     IF P_AC_CODE IS NOT NULL THEN
	 Begin
	 Select Nvl(Ac_Dtl_Typ,0)
	   Into V_AC_DTL_TYP
	   From ACCOUNT
	  where A_CODE=P_AC_CODE
	    and RowNum<=1;
	 Exception When Others Then
	   Null;
	 End;
     Else
	V_AC_DTL_TYP:=3;
     END IF ;
    --##----------------------------------------------------------------------------------------------------------##--
    --## P_Pass_Prv 1= not allow ,2=allow ,3=allow with worning
    IF V_AC_DTL_TYP =3 THEN
	Begin
	  Select Nvl(Crlimit_Type,1)
	    Into P_Pass_Prv
	    From Privilege_Fixed
	   Where u_id=P_User_No;
	Exception When Others Then
	 P_Pass_Prv:=1;
	End;
    Else
	Begin
	  Select Nvl(Acc_Lmt_Prv,1)
	    Into P_Pass_Prv
	    From Privilege_Fixed
	   Where u_id=P_User_No;
	Exception When Others Then
	 P_Pass_Prv:=1;
	End;
    END IF;
    --##----------------------------------------------------------------------------------------------------------##--
    If V_Gl_Lmt_Type  in (1,3,5,7) then
       V_AC_CODE    :=P_AC_CODE;
       V_AC_CODE_DTL:=P_AC_CODE_DTL;
    Else
       V_AC_CODE    :=NULL;
       V_AC_CODE_DTL:=NULL;
    End if;
    -----------------------------------------------
    If V_Gl_Lmt_Type  in (2,3) then
       V_CC_CODE:=P_CC_CODE;
    Else
       V_CC_CODE:=NULL;
    End if;
    If V_Gl_Lmt_Type  in (4,5) then
       V_PJ_NO:=P_PJ_NO;
    ELSE
       V_PJ_NO:=NULL;
    End if;
    If V_Gl_Lmt_Type  in (6,7) then
       V_ACTV_NO:=P_ACTV_NO;
    ELSE
       V_ACTV_NO:=NULL;
    End if;

     IF (V_Use_Multi_Cur_Lmt=1 AND V_AC_DTL_TYP IN(0,4,5,6,7)) OR (V_AC_DTL_TYP IN (1,2))
	    OR (NVL(V_USE_CST_CR_LMT_LOCAL,1)=0 AND V_AC_DTL_TYP=3 ) THEN

	  V_LOC_AMT:=0;
	  V_CUR_CODE:=P_CUR_CODE;
	    --##----------------------------------------------------------------------------------------------------------##--
	    IF V_CUR_CODE=YS_GEN_PKG.GET_LOCAL_CUR THEN
	     V_Amt:=nvl(P_amt,0);
	     V_AmtF:=NULL;
	    ELSE
	     V_Amt:=nvl(P_amt,0);
	     V_AmtF:=nvl(P_amtF,0);
	    END IF;
	    --##----------------------------------------------------------------------------------------------------------##--

     ELSE
	  V_LOC_AMT:=1;
	  V_CUR_CODE:=YS_GEN_PKG.GET_LOCAL_CUR;
	  --##----------------------------------------------------------------------------------------------------------##--
	  V_Amt:= nvl(P_amt,0);
	  V_AmtF:=NULL;
	--##----------------------------------------------------------------------------------------------------------##--
     END IF;
     ----------------------------------------------
     IF ABS(NVL(V_AmtF,0)) >0 THEN
       V_Amt:= NVL(V_AmtF,0);
     ELSE
       V_Amt:= NVL(V_Amt,0);
     END IF;

      If V_Gl_Lmt_Type	in (1,3,5,7) and NVL(V_AC_DTL_TYP,0) IN (1,2,3,4,5,6,7) AND V_AC_CODE IS NOT NULL THEN

	   BEGIN
	       SELECT 1
		INTO V_CNT_ACC
	       FROM IAS_AC_CC_LMT
	       WHERE A_CODE=V_AC_CODE
		 AND AC_DTL_TYP=V_AC_DTL_TYP
		 AND nvl(AC_CODE_DTL,'0')='0'
		 --AND NVL(Dr_Cr,1) = P_Dr_Cr
		 AND NVL(CC_CODE,'0') = DECODE(V_Gl_Lmt_Type,2,P_CC_CODE,3,P_CC_CODE,NVL(CC_CODE,'0'))
		       AND NVL(PJ_NO,'0') =   DECODE(V_Gl_Lmt_Type,4,P_pj_no,5,P_pj_no,NVL(PJ_NO,'0'))
		       AND NVL(ACTV_NO,'0') = DECODE(V_Gl_Lmt_Type,6,P_actv_no,7,P_actv_no,NVL(ACTV_NO,'0'))
		       AND NVL(BRN_NO,0)    = DECODE(V_Gl_Lmt_LVL,2,P_BRN_NO,NVL(BRN_NO,0) )
		       And A_CY = V_CUR_CODE	--DECODE(V_USE_MULTI_CUR_LMT,1,P_CUR_CODE ,YS_GEN_PKG.GET_LOCAL_CUR)
		 AND ROWNUM<=1;
	   EXCEPTION WHEN OTHERS THEN
	     V_CNT_ACC:=0;
	    END;

	    IF NVL(V_CNT_ACC,0)>0 THEN
	       V_AC_CODE_DTL_TMP:=V_AC_CODE_DTL;
	       V_AC_CODE_DTL:=NULL;
	    END IF;
    End if;

    FOR I   IN 1..NVL(V_CNT_ACC,0)+1   LOOP
     --------------------
      V_Dr_Cr :=P_Dr_Cr  ;
     --------------------
	BEGIN

	  SELECT COUNT(*)
	    INTO V_CNT
	   FROM IAS_AC_CC_LMT
	     where NVL(A_CODE,'0')=DECODE(V_Gl_Lmt_Type,1,V_AC_CODE,3,P_AC_CODE,5,V_AC_CODE,7,V_AC_CODE,NVL(A_CODE,'0'))
		AND NVL(AC_DTL_TYP,0)  = NVL(V_AC_DTL_TYP,0)
		AND NVL(AC_CODE_DTL,'0') =  NVL(V_AC_CODE_DTL,'0')
		AND NVL(CC_CODE,'0') = DECODE(V_Gl_Lmt_Type,2,P_CC_CODE,3,P_CC_CODE,NVL(CC_CODE,'0'))
		AND NVL(PJ_NO,'0') =   DECODE(V_Gl_Lmt_Type,4,P_pj_no,5,P_pj_no,NVL(PJ_NO,'0'))
		AND NVL(ACTV_NO,'0') =	 DECODE(V_Gl_Lmt_Type,6,P_actv_no,7,P_actv_no,NVL(ACTV_NO,'0'))
		AND NVL(BRN_NO,0)    = DECODE(V_Gl_Lmt_LVL,2,P_BRN_NO,NVL(BRN_NO,0) )
		--AND (MAX_AMT IS NOT NULL OR MIN_AMT IS NOT NULL)
		And A_CY = V_CUR_CODE  ;
		 --AND (MAX_AMT IS NOT NULL OR MIN_AMT IS NOT NULL)
		--AND NVL(DR_CR,0)<>P_Dr_Cr;  --AND NVL(MAX_AMT,0)> 0
       EXCEPTION WHEN OTHERS THEN
	 V_CNT:=0;
	END;

	  IF NVL(V_CNT,0)=1 THEN

	    BEGIN

	       Select DR_CR
		INTO V_Dr_Cr2
	       FROM IAS_AC_CC_LMT
		 where NVL(A_CODE,'0')=DECODE(V_Gl_Lmt_Type,1,V_AC_CODE,3,P_AC_CODE,5,V_AC_CODE,7,V_AC_CODE,NVL(A_CODE,'0'))
		    AND NVL(AC_DTL_TYP,0)  = NVL(V_AC_DTL_TYP,0)
		    AND NVL(AC_CODE_DTL,'0') =	NVL(V_AC_CODE_DTL,'0')
		    AND NVL(CC_CODE,'0') = DECODE(V_Gl_Lmt_Type,2,P_CC_CODE,3,P_CC_CODE,NVL(CC_CODE,'0'))
		    AND NVL(PJ_NO,'0') =   DECODE(V_Gl_Lmt_Type,4,P_pj_no,5,P_pj_no,NVL(PJ_NO,'0'))
		    AND NVL(ACTV_NO,'0') =  DECODE(V_Gl_Lmt_Type,6,P_actv_no,7,P_actv_no,NVL(ACTV_NO,'0'))
		    AND NVL(BRN_NO,0)	 = DECODE(V_Gl_Lmt_LVL,2,P_BRN_NO,NVL(BRN_NO,0) )
		    And A_CY = V_CUR_CODE;
		    --AND ROWNUM<=1;

	   EXCEPTION WHEN OTHERS THEN
	     V_Dr_Cr2:=NULL;
	    END;
	  --------------------
	   IF V_Dr_Cr2 IS NOT NULL AND V_Dr_Cr2<> P_DR_CR THEN
	     -------------------------
	     V_Dr_Cr :=V_Dr_Cr2  ;
	     -------------------------
	   END IF;
	     --------------------

	  ELSIF NVL(V_CNT,0)>1 THEN

	    BEGIN

	       SELECT DR_CR
		INTO V_Dr_Cr2
	       FROM IAS_AC_CC_LMT
		 where NVL(A_CODE,'0')=DECODE(V_Gl_Lmt_Type,1,V_AC_CODE,3,P_AC_CODE,5,V_AC_CODE,7,V_AC_CODE,NVL(A_CODE,'0'))
		    AND NVL(AC_DTL_TYP,0)  = NVL(V_AC_DTL_TYP,0)
		    AND NVL(AC_CODE_DTL,'0') =	NVL(V_AC_CODE_DTL,'0')
		    AND NVL(CC_CODE,'0') = DECODE(V_Gl_Lmt_Type,2,P_CC_CODE,3,P_CC_CODE,NVL(CC_CODE,'0'))
		    AND NVL(PJ_NO,'0') =   DECODE(V_Gl_Lmt_Type,4,P_pj_no,5,P_pj_no,NVL(PJ_NO,'0'))
		    AND NVL(ACTV_NO,'0') =  DECODE(V_Gl_Lmt_Type,6,P_actv_no,7,P_actv_no,NVL(ACTV_NO,'0'))
		    AND NVL(BRN_NO,0)	 = DECODE(V_Gl_Lmt_LVL,2,P_BRN_NO,NVL(BRN_NO,0) )
		    And A_CY = V_CUR_CODE
		    AND NVL(DR_CR,0)<>P_Dr_Cr
		    AND ROWNUM<=1;
		    --AND NVL(MAX_AMT,0)> 0
	    EXCEPTION WHEN OTHERS THEN
	     V_Dr_Cr2:=NULL;
	    END;

	  END IF;
      FOR J IN 1..NVL(V_CNT,1)	LOOP --V_Dr_Cr LOOP

      Begin
       Select Round(MIN_AMT,P_Frc_no),	Round(MAX_AMT,P_Frc_no),  Round(MIN_TRNS_AMT,P_Frc_no),  Round(MAX_TRNS_AMT,P_Frc_no),
	      Round(FCLTY_AMT,P_Frc_no),    FCLTY_ST	       ,EXCEED_LMT,Dr_Cr  ,Round(MAX_LMT_PSBL,P_Frc_no)
	   Into P_Min_lmt,		  P_Max_lmt,
		P_Min_Trns_lmt, 	  P_Max_Trns_lmt,     V_FCLTY_AMT  ,V_FCLTY_ST,     P_Pass,V_Dr_Cr  ,V_MAX_LMT_PSBL
	   From IAS_AC_CC_LMT
	  where NVL(A_CODE,'0')=DECODE(V_Gl_Lmt_Type,1,V_AC_CODE,3,P_AC_CODE,5,V_AC_CODE,7,V_AC_CODE,NVL(A_CODE,'0'))
	    AND NVL(AC_DTL_TYP,0)  = NVL(V_AC_DTL_TYP,0)
	    AND NVL(AC_CODE_DTL,'0') =	NVL(V_AC_CODE_DTL,'0')
	    AND NVL(Dr_Cr,1) = V_Dr_Cr
	    AND NVL(CC_CODE,'0') = DECODE(V_Gl_Lmt_Type,2,P_CC_CODE,3,P_CC_CODE,NVL(CC_CODE,'0'))
	    AND NVL(PJ_NO,'0') =   DECODE(V_Gl_Lmt_Type,4,P_pj_no,5,P_pj_no,NVL(PJ_NO,'0'))
	    AND NVL(ACTV_NO,'0') =  DECODE(V_Gl_Lmt_Type,6,P_actv_no,7,P_actv_no,NVL(ACTV_NO,'0'))
	    AND NVL(BRN_NO,0)	 = DECODE(V_Gl_Lmt_LVL,2,P_BRN_NO,NVL(BRN_NO,0) )
	    And A_CY = V_CUR_CODE
		And RowNum<=1;
	     --DECODE(V_USE_MULTI_CUR_LMT,1,P_CUR_CODE ,YS_GEN_PKG.GET_LOCAL_CUR)
      Exception when Others Then
	 P_Min_lmt :=NULL;
	 P_Max_lmt :=NULL;
	 P_Min_Trns_lmt :=NULL;
	 P_Max_Trns_lmt :=NULL;
	 V_FCLTY_AMT	:=NULL;
      End;

       --##----------------------------------------------------------------------------------------------------------##--
      --## Balance
	-- P_BLNC_TYP  :  0 = Open_bal , 1 = Net Balance  ,2 = Period Balance
	-- P_LOC_AMT	:  0 = By Cur_code , 1 = Local Amt
	-- P_DOC_POST  :  0 = not posted , 1 = posted , 2 = All
    --------------------------------------------------------------------------------------------
    Begin
    Select 1 Into V_Cnt   From Ias_Post_Dtl
	   Where C_V_Code Is Not Null
	  And Rownum<=1;
    Exception When Others Then
     V_Cnt:=0;
    End;

    /*If V_AC_DTL_TYP=3 AND NVL(V_CNT,0)=1 AND nvl(V_AC_CODE_DTL,'0')<>'0' Then  stop date 24/02/2020

	V_Bal:=Round(GET_BLNC_CST_FNC( P_loc_cur  => ys_gen_pkg.Get_Local_Cur,
				       P_cc_code  => V_CC_CODE,
				       P_c_code   => V_AC_CODE_DTL,
				       P_acy	  => V_CUR_CODE,
				       P_bal_type =>1
				       ),P_frc_no);
    ELSE*/
       GET_ACDTL_LMT_BLNC(P_DOC_DATE	  =>V_DOC_DATE	   ,
			  P_A_CODE	  =>V_AC_CODE	   ,--IN ACCOUNT.A_CODE%TYPE  DEFAULT NULL,
				      P_AC_DTL_TYP    =>V_AC_DTL_TYP   ,--IN ACCOUNT.A_CODE%TYPE  DEFAULT NULL,
			  P_AC_CODE_DTL   =>V_AC_CODE_DTL  ,
			  P_CUR_CODE	  =>V_CUR_CODE	,
			  P_BRN_NO	  =>P_BRN_NO	,
			  P_CC_CODE	  =>V_CC_CODE ,
			  P_PJ_CODE	  =>V_PJ_NO  ,
			  P_ACTV_CODE	  =>V_ACTV_NO ,
			  P_TRNS_VEIW_TYP =>1,
			  P_DALY_BLNC	  =>V_DALY_BLNC ,
			  P_MNTHLY_BLNC   =>V_MNTHLY_BLNC ,
			  P_ANULY_BLNC	  =>V_ANULY_BLNC ,
			  P_BLNC	  =>V_Bal )   ;
    --End If;
     --##----------------------------------------------------------------------------------------------------------##--

   V_FCLTY_BLNC:=NVL(GET_FCLTY_BLNC (P_AC_CODE	    =>V_AC_CODE 	 ,
				     P_AC_DTL_TYP   =>V_AC_DTL_TYP	  ,
				     P_AC_CODE_DTL  =>V_AC_CODE_DTL	  ,
				     P_CUR_CODE     =>V_CUR_CODE	  ,
				     P_CC_CODE	    =>V_CC_CODE 	  ,
				     P_PJ_NO	    =>V_PJ_NO		  ,
				     P_ACTV_NO	    =>V_ACTV_NO 	  ,
				     P_MAX_lmt	    =>P_Max_lmt 	  ,
				     P_FCLTY_AMT    =>V_FCLTY_AMT	  ,
				     P_DOC_AMT	    =>0, --;Nvl(V_Amt,0)	,
				     p_FCLTY_ST     =>V_FCLTY_ST	  ,
				     P_frc_no	    =>P_frc_no		    ),0);
     ---------------------------------------------------------------------------------------------------------------------------
     IF V_AC_DTL_TYP=3 THEN
	      IF NVL(V_FCLTY_BLNC,0) <= 0 AND NVL(V_FCLTY_AMT,0) > 0 and NVL(V_FCLTY_ST,0)=1 and P_UPD_FLG = 1 THEN
		 -----------------------------------------------
		 BEGIN
		  UPDATE IAS_AC_CC_LMT SET FCLTY_AMT=0
		  Where NVL(A_CODE,'0')=DECODE(V_Gl_Lmt_Type,1,P_AC_CODE,3,P_AC_CODE,5,P_AC_CODE,7,P_AC_CODE,NVL(A_CODE,'0'))
		    AND NVL(AC_DTL_TYP,0)  = NVL(V_AC_DTL_TYP,0)
		    AND NVL(DR_CR,0)=V_Dr_Cr
		    AND NVL(AC_CODE_DTL,'0') =	NVL(V_AC_CODE_DTL,'0')
		    AND NVL(CC_CODE,'0') = DECODE(V_Gl_Lmt_Type,2,P_CC_CODE,3,P_CC_CODE,NVL(CC_CODE,'0'))
		    AND NVL(PJ_NO,'0') =   DECODE(V_Gl_Lmt_Type,4,P_pj_no,5,P_pj_no,NVL(PJ_NO,'0'))
		    AND NVL(ACTV_NO,'0') =  DECODE(V_Gl_Lmt_Type,6,P_actv_no,7,P_actv_no,NVL(ACTV_NO,'0'))
		    AND NVL(BRN_NO,0)	 = DECODE(V_Gl_Lmt_LVL,2,P_BRN_NO,NVL(BRN_NO,0) )
		    And A_CY = DECODE(V_USE_MULTI_CUR_LMT,1,P_CUR_CODE ,YS_GEN_PKG.GET_LOCAL_CUR);
		    EXCEPTION WHEN OTHERS THEN NULL;
		 END;
		 ------------------------------------------------
	      End if;
      END IF;
     ---------------------------------------------------------------------------------------------------------------------------
 --## Max_lmt

    IF V_AC_DTL_TYP=3 AND NVL(V_FCLTY_AMT,0)>0 THEN
      -- IF nvl(V_FCLTY_ST,0) =1 THEN
	 V_MAX_MSG_TXT:=Ys_Gen_Pkg.Get_Prompt(P_Lng,571)||' ( '||ys_gen_pkg.get_flg_nm('DR_CR_FLG',V_Dr_Cr,P_Lng)||' ) ' ||' + '||Ys_Gen_Pkg.Get_Prompt(P_Lng,11913)||' = ('||nvl(P_MAX_LMT,0)||' + '||nvl(V_FCLTY_AMT,0)||') '||chr(13);
      -- ELSE
       --  V_MAX_MSG_TXT:=Ys_Gen_Pkg.Get_Prompt(P_Lng,571)||' + '||Ys_Gen_Pkg.Get_Prompt(P_Lng,11913)||' = ('||nvl(P_MAX_LMT,0)||' + '||nvl(V_FCLTY_BLNC,0)||')  ';
      -- END IF;
    ELSE
       V_MAX_MSG_TXT:=Ys_Gen_Pkg.Get_Prompt(P_Lng,571)||' ( '||ys_gen_pkg.get_flg_nm('DR_CR_FLG',V_Dr_Cr,P_Lng)||' ) ' || ' = ('||nvl(P_MAX_LMT,0)|| ') '  ||chr(13);
    END IF;

    If (P_Max_lmt Is Not Null OR NVL(V_FCLTY_AMT,0)>0 ) AND V_Dr_Cr=1 AND P_dr_cr=V_Dr_Cr Then	  -- V_Dr_Cr:= 1 debit 0 credit     and P_Amt_type=1   RECEIVE

	    if P_dr_cr =0 then
	     v_amt:=-v_amt;
	    end if;

	    IF nvl(V_Bal,0) + Nvl(V_Amt,0)> NVL(V_MAX_LMT_PSBL,0) and V_MAX_LMT_PSBL is not null THEN
	      P_Msg:=Ys_Gen_Pkg.Get_Msg(P_Lng,4689)||' = '||V_MAX_LMT_PSBL||'  '||chr(13)||Ias_Gen_Pkg.Get_Prompt(P_Lng,660)||' = '||nvl(V_Bal,0)||' + '||Ias_Gen_Pkg.Get_Prompt(P_Lng,145)||' = '||Nvl(V_Amt,0);
	      P_No_Chk_prv:=1;
	      RETURN;
	    END IF;

	    IF nvl(V_Bal,0)+Nvl(V_Amt,0) > NVL(P_Max_lmt,0)+NVL(V_FCLTY_AMT,0) then

	      P_Msg:=V_MAX_MSG_TXT||Ias_Gen_Pkg.Get_Prompt(P_Lng,660)||' + '||Ias_Gen_Pkg.Get_Prompt(P_Lng,5160)||' + '||Ias_Gen_Pkg.Get_Prompt(P_Lng,2007)||' = '||Round((nvl(V_Bal,0)+NVL(V_Amt,0)),P_frc_no)||chr(13)||
				    Ias_Gen_Pkg.Get_Prompt(P_Lng,999)||' = '||Round(nvl(P_MAX_LMT,0)+nvl(V_FCLTY_amt,0)-(nvl(V_Bal,0)+NVL(V_Amt,0)),P_frc_no)||chr(13)||
				    Ias_Gen_Pkg.Get_Prompt(P_Lng,3604)||' = '||Abs(Round(Round(nvl(P_MAX_LMT,0)+nvl(V_FCLTY_amt,0)-(nvl(V_Bal,0)+NVL(V_Amt,0)),P_frc_no)/(Round(abs(nvl(P_MAX_LMT,1)+nvl(V_FCLTY_amt,0)),P_frc_no)  )*100,2));
	     RETURN;

	    END IF;

    ElsIf (P_Max_lmt Is Not Null OR NVL(V_FCLTY_AMT,0)>0 ) AND V_Dr_Cr=0  Then	-- V_Dr_Cr:= 1 debit 0 credit	RECEIVE


	    If P_Dr_Cr =1 Then
	     V_Amt:=-V_Amt;
	    End If;

	    IF	abs(nvl(V_Bal,0) - Nvl(V_Amt,0))> NVL(V_MAX_LMT_PSBL,0) and V_MAX_LMT_PSBL is not null	THEN
	      P_Msg:=Ys_Gen_Pkg.Get_Msg(P_Lng,4689)||' = '||V_MAX_LMT_PSBL||'  '||chr(13)||Ias_Gen_Pkg.Get_Prompt(P_Lng,660)||' = '||nvl(V_Bal,0)||' + '||Ias_Gen_Pkg.Get_Prompt(P_Lng,145)||' = '||Nvl(V_Amt,0);
	      P_No_Chk_prv:=1;
	      RETURN;

	    END IF;



	    IF	 nvl(V_Bal,0) - Nvl(V_Amt,0) < - (NVL(P_Max_lmt,0)+NVL(V_FCLTY_AMT,0)) Then


	     P_Msg:=V_MAX_MSG_TXT||Ias_Gen_Pkg.Get_Prompt(P_Lng,660)||' + '||Ias_Gen_Pkg.Get_Prompt(P_Lng,5160)||' + '||Ias_Gen_Pkg.Get_Prompt(P_Lng,2007)||' = '||Round((nvl(V_Bal,0)-NVL(V_Amt,0)),P_frc_no)||' '||chr(13)||
				    Ias_Gen_Pkg.Get_Prompt(P_Lng,999)||' = '||Round(abs(nvl(P_MAX_LMT,0)+nvl(V_FCLTY_amt,0)-abs(nvl(V_Bal,0)-NVL(V_Amt,0))),P_frc_no)||chr(13)||
				    Ias_Gen_Pkg.Get_Prompt(P_Lng,3604)||' = '||Round(Abs(Round(abs(nvl(P_MAX_LMT,0)+nvl(V_FCLTY_amt,0)-abs(nvl(V_Bal,0)-NVL(V_Amt,0))),P_frc_no)/nvl(P_MAX_LMT,0)+nvl(V_FCLTY_amt,0)+1 )*100,P_frc_no);

	     RETURN;

	    End IF;
    End IF;

       --##----------------------------------------------------------------------------------------------------------##--

    --## Min_lmt
    If P_Min_lmt Is Not Null and V_Dr_Cr=1 and NVL(V_CNT,1)=1 Then  -- V_Dr_Cr:= 1 debit 0 credit PAYMNENT

	  If P_dr_cr =0 then
	     v_amt:=-v_amt;
	  End if;


	   IF nvl(V_Bal,0)+Nvl(V_Amt,0)< nvl(P_Min_lmt,0) Then -- -nvl(P_Min_lmt,0) Then

		 P_Msg:=Ias_Gen_Pkg.Get_Prompt(P_Lng,570)||' ( '||ys_gen_pkg.get_flg_nm('DR_CR_FLG',V_Dr_Cr,P_Lng)||' ) '||' = '||P_MIN_LMT||' '||chr(13)||
								 Ias_Gen_Pkg.Get_Prompt(P_Lng,660)||' + '||Ias_Gen_Pkg.Get_Prompt(P_Lng,5160)||' + '||Ias_Gen_Pkg.Get_Prompt(P_Lng,2007)||' = '||Round((nvl(V_Bal,0)+NVL(V_Amt,0)),P_frc_no)||' '||chr(13)||
								 Ias_Gen_Pkg.Get_Prompt(P_Lng,999)||' = '||Round( abs((nvl(V_Bal,0)+NVL(V_Amt,0)))-P_MIN_LMT,P_frc_no)||chr(13)||
								 Ias_Gen_Pkg.Get_Prompt(P_Lng,3604)||' = '||Round(Abs(Round(abs(nvl(V_Bal,0)+NVL(V_Amt,0))-nvl(P_MIN_LMT,0),P_frc_no)/nvl(P_MIN_LMT,1)+1 )*100,P_frc_no);


	    RETURN;
	    End IF;
    ELSIf P_Min_lmt Is Not Null and V_Dr_Cr=0 and NVL(V_CNT,1)=1 Then  --- V_Dr_Cr:= 1 debit 0 credit	RECEIVE

	  If P_dr_cr =1 then
	     v_amt:=-v_amt;
	  End if;

	     IF   nvl(V_Bal,0) - Nvl(V_Amt,0) > - nvl(P_Min_lmt,0) Then

		P_Msg:=Ias_Gen_Pkg.Get_Prompt(P_Lng,570)||' ( '||ys_gen_pkg.get_flg_nm('DR_CR_FLG',V_Dr_Cr,P_Lng)||' ) '||' = '||P_MIN_LMT||' '||chr(13)||
							  Ias_Gen_Pkg.Get_Prompt(P_Lng,660)||' + '||Ias_Gen_Pkg.Get_Prompt(P_Lng,5160)||' + '||Ias_Gen_Pkg.Get_Prompt(P_Lng,2007)||' = '||Round((nvl(V_Bal,0)-NVL(V_Amt,0)),P_frc_no)||' '||chr(13)||
							  Ias_Gen_Pkg.Get_Prompt(P_Lng,999)||' = '||Round(abs((nvl(V_Bal,0)-NVL(V_Amt,0)))-P_MIN_LMT,P_frc_no)||chr(13)||
							   Ias_Gen_Pkg.Get_Prompt(P_Lng,3604)||' = '||Abs(Round(Round(abs((nvl(V_Bal,0)-NVL(V_Amt,0)))-P_MIN_LMT,P_frc_no)/(Round(abs(nvl(P_MIN_LMT,0) +1 ),P_frc_no)  )*100,2));



	    End IF;
    End IF;
    --##----------------------------------------------------------------------------------------------------------##--
    --##----------------------------------------------------------------------------------------------------------##--
    --## Max_trns_lmt
    If P_Max_Trns_lmt Is Not Null  and V_Dr_Cr=1 AND V_Dr_Cr=P_Dr_Cr Then  --- V_Dr_Cr:= 1 debit 0 credit
	    IF	Nvl(V_Amt,0)> nvl(P_Max_Trns_lmt,0) Then

	     P_Msg:=Ias_Gen_Pkg.Get_Prompt(P_Lng,573)||' ( '||ys_gen_pkg.get_flg_nm('DR_CR_FLG',V_Dr_Cr,P_Lng)||' ) '||' = '||P_MAX_TRNS_LMT||chr(13)||
								   Ias_Gen_Pkg.Get_Prompt(P_Lng,2007)||'  = '||Round(NVL(V_Amt,0),P_frc_no)||' '||chr(13)||
								   Ias_Gen_Pkg.Get_Prompt(P_Lng,999)||'  = '||Round(abs(nvl(P_MAX_TRNS_LMT,0)-NVL(V_Amt,0)),P_frc_no)||chr(13)||
								   Ias_Gen_Pkg.Get_Prompt(P_Lng,3604)||' = '||Abs(Round(((nvl(P_MAX_TRNS_LMT,0)-Nvl(NVL(V_Amt,0),0)) /nvl(P_MAX_TRNS_LMT,0)+1)*100,2));
	    RETURN;
	End IF;

    End IF;
    --##----------------------------------------------------------------------------------------------------------##--
    --## Min_trns_lmt
    If	P_Min_Trns_lmt Is Not Null  and P_Dr_Cr=1 AND V_Dr_Cr=P_Dr_Cr  Then  --- V_Dr_Cr:= 1 debit 0 credit
	    IF	Nvl(V_Amt,0)< nvl(P_Min_Trns_lmt,0) Then

	     P_Msg:=Ias_Gen_Pkg.Get_Prompt(P_Lng,572)||' ( '||ys_gen_pkg.get_flg_nm('DR_CR_FLG',V_Dr_Cr,P_Lng)||' ) '||' = '||P_Min_TRNS_LMT||chr(13)||
								   Ias_Gen_Pkg.Get_Prompt(P_Lng,2007)||'  = '||Round(ABS(NVL(V_Amt,0)),P_frc_no)||' '||chr(13)||
								   Ias_Gen_Pkg.Get_Prompt(P_Lng,999)||'  = '||Round(abs(nvl(P_Min_TRNS_LMT,0)-ABS(NVL(V_Amt,0))),P_frc_no)||chr(13)||
								   Ias_Gen_Pkg.Get_Prompt(P_Lng,3604)||' = '||Abs(Round(((nvl(P_Min_TRNS_LMT,0)-Nvl(ABS(NVL(V_Amt,0)),0)) /nvl(P_Min_TRNS_LMT,0)+1)*100,2));
	    RETURN;
	    End IF;
    End IF;
    --##----------------------------------------------------------------------------------------------------------##--
    --##----------------------------------------------------------------------------------------------------------##--
    --## Max_trns_lmt
    If P_Max_Trns_lmt Is Not Null  and P_Dr_Cr=0 AND V_Dr_Cr=P_Dr_Cr  Then  --- V_Dr_Cr:= 1 debit 0 credit
	    IF abs(Nvl(V_Amt,0))> nvl(P_Max_Trns_lmt,0) Then

	     P_Msg:=Ias_Gen_Pkg.Get_Prompt(P_Lng,573)||' ( '||ys_gen_pkg.get_flg_nm('DR_CR_FLG',V_Dr_Cr,P_Lng)||' ) '||' = '||P_MAX_TRNS_LMT||chr(13)||
								   Ias_Gen_Pkg.Get_Prompt(P_Lng,2007)||'  = '||Round(NVL(V_Amt,0),P_frc_no)||' '||chr(13)||
								   Ias_Gen_Pkg.Get_Prompt(P_Lng,999)||'  = '||Round(abs(nvl(P_MAX_TRNS_LMT,0)-NVL(V_Amt,0)),P_frc_no)||chr(13)||
								   Ias_Gen_Pkg.Get_Prompt(P_Lng,3604)||' = '||Abs(Round(((nvl(P_MAX_TRNS_LMT,0)-Nvl(NVL(V_Amt,0),0)) /nvl(P_MAX_TRNS_LMT,0)+1)*100,2));
	    RETURN;
	End IF;

    End IF;
    --##----------------------------------------------------------------------------------------------------------##--
    --## Min_trns_lmt
    If	P_Min_Trns_lmt Is Not Null  and P_Dr_Cr=0 AND V_Dr_Cr=P_Dr_Cr  Then  --- V_Dr_Cr:= 1 debit 0 credit
	    IF	abs(Nvl(V_Amt,0))< nvl(P_Min_Trns_lmt,0) Then

	     P_Msg:=Ias_Gen_Pkg.Get_Prompt(P_Lng,572)||' ( '||ys_gen_pkg.get_flg_nm('DR_CR_FLG',V_Dr_Cr,P_Lng)||' ) '||' = '||P_Min_TRNS_LMT||chr(13)||
								   Ias_Gen_Pkg.Get_Prompt(P_Lng,2007)||'  = '||Round(ABS(NVL(V_Amt,0)),P_frc_no)||chr(13)||
								   Ias_Gen_Pkg.Get_Prompt(P_Lng,999)||'  = '||Round(abs(nvl(P_Min_TRNS_LMT,0)-ABS(NVL(V_Amt,0))),P_frc_no)||chr(13)||
								   Ias_Gen_Pkg.Get_Prompt(P_Lng,3604)||' = '||Abs(Round(((nvl(P_Min_TRNS_LMT,0)-Nvl(ABS(NVL(V_Amt,0)),0)) /nvl(P_Min_TRNS_LMT,0)+1)*100,2));
	    RETURN;
	    End IF;
    End IF;
    --##----------------------------------------------------------------------------------------------------------##--
    --## --## V_DALY_LMT P_Dr_Cr=1
      If V_DALY_LMT Is Not Null  and P_Dr_Cr=1	AND V_Dr_Cr=P_Dr_Cr Then  --- V_Dr_Cr:= 1 debit 0 credit
    	
      -- if P_dr_cr =0 then
     --        v_amt:=-v_amt;
	  --  End if;

	 IF Nvl(V_DALY_BLNC,0)+Nvl(V_Amt,0) > nvl(V_DALY_LMT,0) Then
    	
    	 		BEGIN
	     P_Msg:=Ias_Gen_Pkg.Get_Prompt(P_Lng,13294)||' '||Ias_Gen_Pkg.Get_Prompt(P_Lng,13290)||' ( '||ys_gen_pkg.get_flg_nm('DR_CR_FLG',V_Dr_Cr,P_Lng)||' ) '||' = '||V_DALY_LMT||chr(13)||
    												   	    Ias_Gen_Pkg.Get_Prompt(P_Lng,660)||'  = '||Round(NVL(V_DALY_BLNC,0),P_frc_no)||' '||chr(13)||
    												   	    Ias_Gen_Pkg.Get_Prompt(P_Lng,2007)||'  = '||Round(NVL(V_Amt,0),P_frc_no)||' '||chr(13)||
    												   	    Ias_Gen_Pkg.Get_Prompt(P_Lng,999)||'  = '||Round(abs(nvl(V_DALY_LMT,0)-(Nvl(V_DALY_BLNC,0)+Nvl(V_Amt,0))),P_frc_no)||chr(13)||
    												   	    Ias_Gen_Pkg.Get_Prompt(P_Lng,3604)||' = '||Abs(Round(((nvl(V_DALY_LMT,0)-(Nvl(V_DALY_BLNC,0)+Nvl(V_Amt,0))) /nvl(V_DALY_LMT,1))*100,2));
    		 RETURN;
	     EXCEPTION WHEN OTHERS THEN
	       	  P_Msg:=Ias_Gen_Pkg.Get_Prompt(P_Lng,13294)||' '||Ias_Gen_Pkg.Get_Prompt(P_Lng,13290)||' ( '||ys_gen_pkg.get_flg_nm('DR_CR_FLG',V_Dr_Cr,P_Lng)||' ) '||' = '||V_DALY_LMT||chr(13)||
    												   	    Ias_Gen_Pkg.Get_Prompt(P_Lng,660)||'  = '||Round(NVL(V_DALY_BLNC,0),P_frc_no)||' '||chr(13)||
    												   	    Ias_Gen_Pkg.Get_Prompt(P_Lng,2007)||'  = '||Round(NVL(V_Amt,0),P_frc_no)||' '||chr(13)||
    												   	    Ias_Gen_Pkg.Get_Prompt(P_Lng,999)||'  = '||Round(abs(nvl(V_DALY_LMT,0)-(Nvl(V_DALY_BLNC,0)+Nvl(V_Amt,0))),P_frc_no);
	      RETURN;
	  END ;
	End IF;
    End IF;
     --##----------------------------------------------------------------------------------------------------------##--
     --##----------------------------------------------------------------------------------------------------------##--
  --## V_DALY_LMT P_Dr_Cr=0
    If V_DALY_LMT Is Not Null  and P_Dr_Cr=0 AND V_Dr_Cr=P_Dr_Cr  Then	--- V_Dr_Cr:= 1 debit 0 credit
    		
    		--IF  Nvl(V_DALY_BLNC,0)-Nvl(V_Amt,0) < - nvl(V_DALY_LMT,0) Then
    		IF ABS(Nvl(V_DALY_BLNC,0)-Nvl(V_Amt,0)) > nvl(V_DALY_LMT,0) Then
    		-----------------------------------------------------------------
    	 	BEGIN
	     P_Msg:=Ias_Gen_Pkg.Get_Prompt(P_Lng,13294)||' '||Ias_Gen_Pkg.Get_Prompt(P_Lng,13290)||' ( '||ys_gen_pkg.get_flg_nm('DR_CR_FLG',V_Dr_Cr,P_Lng)||' ) '||' = '||V_DALY_LMT||chr(13)||
			   	    Ias_Gen_Pkg.Get_Prompt(P_Lng,660)||'  = '||Round(NVL(V_DALY_BLNC,0),P_frc_no)||' '||chr(13)||
			   	    Ias_Gen_Pkg.Get_Prompt(P_Lng,2007)||'  = '||Round(NVL(V_Amt,0),P_frc_no)||' '||chr(13)||
			   	    Ias_Gen_Pkg.Get_Prompt(P_Lng,999)||'  = '||Round(abs(nvl(V_DALY_LMT,0)+(Nvl(V_DALY_BLNC,0)-Nvl(V_Amt,0))),P_frc_no)||chr(13)||
			   	    Ias_Gen_Pkg.Get_Prompt(P_Lng,3604)||' = '||Abs(Round(((nvl(V_DALY_LMT,0)+(Nvl(V_DALY_BLNC,0)-Nvl(V_Amt,0))) /nvl(V_DALY_LMT,1))*100,2));
	     RETURN;
	     EXCEPTION WHEN OTHERS THEN
	       	P_Msg:=Ias_Gen_Pkg.Get_Prompt(P_Lng,13294)||' '||Ias_Gen_Pkg.Get_Prompt(P_Lng,13290)||' ( '||ys_gen_pkg.get_flg_nm('DR_CR_FLG',V_Dr_Cr,P_Lng)||' ) '||' = '||V_DALY_LMT||chr(13)||
					   	    Ias_Gen_Pkg.Get_Prompt(P_Lng,660)||'  = '||Round(NVL(V_DALY_BLNC,0),P_frc_no)||' '||chr(13)||
					   	    Ias_Gen_Pkg.Get_Prompt(P_Lng,2007)||'  = '||Round(NVL(V_Amt,0),P_frc_no)||' '||chr(13)||
					   	    Ias_Gen_Pkg.Get_Prompt(P_Lng,999)||'  = '||Round(abs(nvl(V_DALY_LMT,0)+(Nvl(V_DALY_BLNC,0)-Nvl(V_Amt,0))),P_frc_no);

	      RETURN;
	 END ;
	 -----------------------------------------------------------------
	End IF;

    End IF;
     --##----------------------------------------------------------------------------------------------------------##--
     --## --## V_MNTHLY_LMT P_Dr_Cr=1
    If V_MNTHLY_LMT Is Not Null  and P_Dr_Cr=1	AND V_Dr_Cr=P_Dr_Cr Then  --- V_Dr_Cr:= 1 debit 0 credit
    		IF  Nvl(V_MNTHLY_BLNC,0)+Nvl(V_Amt,0) > nvl(V_MNTHLY_LMT,0) Then
    	 		BEGIN
	     P_Msg:=Ias_Gen_Pkg.Get_Prompt(P_Lng,13294)||' '||Ias_Gen_Pkg.Get_Prompt(P_Lng,13291)||' '||Ias_Gen_Pkg.Get_Prompt(P_Lng,13210)||' ( '||ys_gen_pkg.get_flg_nm('DR_CR_FLG',V_Dr_Cr,P_Lng)||' ) '||' = '||V_MNTHLY_LMT||chr(13)||
    								Ias_Gen_Pkg.Get_Prompt(P_Lng,2007)||'  = '||Round(NVL(V_Amt,0),P_frc_no)||' '||chr(13)||
    								Ias_Gen_Pkg.Get_Prompt(P_Lng,999)||'  = '||Round(abs(nvl(V_MNTHLY_LMT,0)-NVL(V_Amt,0)),P_frc_no)||chr(13)||
    								Ias_Gen_Pkg.Get_Prompt(P_Lng,3604)||' = '||Abs(Round(((nvl(V_MNTHLY_LMT,0)-Nvl(NVL(V_Amt,0),0)) /nvl(V_MNTHLY_LMT,1))*100,2));
    		 RETURN;
	     EXCEPTION WHEN OTHERS THEN
	       	  P_Msg:=Ias_Gen_Pkg.Get_Prompt(P_Lng,13294)||' '||Ias_Gen_Pkg.Get_Prompt(P_Lng,13291)||' '||Ias_Gen_Pkg.Get_Prompt(P_Lng,13291)||' ( '||ys_gen_pkg.get_flg_nm('DR_CR_FLG',V_Dr_Cr,P_Lng)||' ) '||' = '||V_MNTHLY_LMT||chr(13)||
    								     Ias_Gen_Pkg.Get_Prompt(P_Lng,2007)||' = '||Round(NVL(V_Amt,0),P_frc_no)||' '||chr(13)||
    										 Ias_Gen_Pkg.Get_Prompt(P_Lng,999)||'  = '||Round(abs(nvl(V_MNTHLY_LMT,0)-NVL(V_Amt,0)),P_frc_no);

	      RETURN;
	  END ;
	End IF;

    End IF;
     --##----------------------------------------------------------------------------------------------------------##--
     --##----------------------------------------------------------------------------------------------------------##--
     --## V_MNTHLY_AMT P_Dr_Cr=0
    If V_MNTHLY_LMT Is Not Null  and P_Dr_Cr=0	AND V_Dr_Cr=P_Dr_Cr  Then  --- V_Dr_Cr:= 1 debit 0 credit
    		IF abs(Nvl(V_MNTHLY_BLNC,0)-nvl(V_Amt,0)) > nvl(V_MNTHLY_LMT,0) Then
    	 		BEGIN
	     P_Msg:=Ias_Gen_Pkg.Get_Prompt(P_Lng,13294)||' '||Ias_Gen_Pkg.Get_Prompt(P_Lng,13291)||' ( '||ys_gen_pkg.get_flg_nm('DR_CR_FLG',V_Dr_Cr,P_Lng)||' ) '||' = '||V_MNTHLY_LMT||chr(13)||
    												   	    Ias_Gen_Pkg.Get_Prompt(P_Lng,2007)||'  = '||Round(NVL(V_Amt,0),P_frc_no)||' '||chr(13)||
    												   	    Ias_Gen_Pkg.Get_Prompt(P_Lng,999)||'  = '||Round(abs(nvl(V_MNTHLY_LMT,0)-NVL(V_Amt,0)),P_frc_no)||chr(13)||
    												   	    Ias_Gen_Pkg.Get_Prompt(P_Lng,3604)||' = '||Abs(Round(((nvl(V_MNTHLY_LMT,0)-Nvl(NVL(V_Amt,0),0)) /nvl(V_MNTHLY_LMT,1))*100,2));
    		RETURN;
	     EXCEPTION WHEN OTHERS THEN
	       	P_Msg:=Ias_Gen_Pkg.Get_Prompt(P_Lng,13294)||' '||Ias_Gen_Pkg.Get_Prompt(P_Lng,13291)||' ( '||ys_gen_pkg.get_flg_nm('DR_CR_FLG',V_Dr_Cr,P_Lng)||' ) '||' = '||V_MNTHLY_LMT||chr(13)||
    												   	    Ias_Gen_Pkg.Get_Prompt(P_Lng,2007)||'  = '||Round(NVL(V_Amt,0),P_frc_no)||' '||chr(13)||
    												   	    Ias_Gen_Pkg.Get_Prompt(P_Lng,999)||'  = '||Round(abs(nvl(V_MNTHLY_LMT,0)-NVL(V_Amt,0)),P_frc_no);

	      RETURN;
	  END ;
	End IF;

    End IF;
     --##----------------------------------------------------------------------------------------------------------##--
     --##----------------------------------------------------------------------------------------------------------##--
   --## --## ANULY P_Dr_Cr=1
    If V_ANULY_LMT Is Not Null	and P_Dr_Cr=1  AND V_Dr_Cr=P_Dr_Cr Then  --- V_Dr_Cr:= 1 debit 0 credit
    		IF  Nvl(V_ANULY_BLNC,0)+Nvl(V_Amt,0) > nvl(V_ANULY_LMT,0) Then
    	 		BEGIN
	     P_Msg:=Ias_Gen_Pkg.Get_Prompt(P_Lng,13294)||' '||Ias_Gen_Pkg.Get_Prompt(P_Lng,13292)||' ( '||ys_gen_pkg.get_flg_nm('DR_CR_FLG',V_Dr_Cr,P_Lng)||' ) '||' = '||V_ANULY_LMT||chr(13)||
    												   	    Ias_Gen_Pkg.Get_Prompt(P_Lng,2007)||'  = '||Round(NVL(V_Amt,0),P_frc_no)||' '||chr(13)||
    												   	    Ias_Gen_Pkg.Get_Prompt(P_Lng,999)||'  = '||Round(abs(nvl(V_ANULY_LMT,0)-NVL(V_Amt,0)),P_frc_no)||chr(13)||
    												   	    Ias_Gen_Pkg.Get_Prompt(P_Lng,3604)||' = '||Abs(Round(((nvl(V_ANULY_LMT,0)-Nvl(NVL(V_Amt,0),0)) /nvl(V_ANULY_LMT,1))*100,2));
    		 RETURN;
	     EXCEPTION WHEN OTHERS THEN
	       	  P_Msg:=Ias_Gen_Pkg.Get_Prompt(P_Lng,13294)||' '||Ias_Gen_Pkg.Get_Prompt(P_Lng,13292)||' ( '||ys_gen_pkg.get_flg_nm('DR_CR_FLG',V_Dr_Cr,P_Lng)||' ) '||' = '||V_ANULY_LMT||chr(13)||
    												   	    Ias_Gen_Pkg.Get_Prompt(P_Lng,2007)||'  = '||Round(NVL(V_Amt,0),P_frc_no)||' '||chr(13)||
    												   	    Ias_Gen_Pkg.Get_Prompt(P_Lng,999)||'  = '||Round(abs(nvl(V_ANULY_LMT,0)-NVL(V_Amt,0)),P_frc_no);

	      RETURN;
	  END ;
	End IF;
    End IF;
     --##----------------------------------------------------------------------------------------------------------##--
     --##----------------------------------------------------------------------------------------------------------##--
    --## V_ANULY_LMT P_Dr_Cr=0
    If V_ANULY_LMT Is Not Null	and P_Dr_Cr=0	AND V_Dr_Cr=P_Dr_Cr Then  --- V_Dr_Cr:= 1 debit 0 credit
    		IF  abs(Nvl(V_ANULY_BLNC,0)-Nvl(V_Amt,0)) > nvl(V_ANULY_LMT,0) Then
    	 		BEGIN
	     P_Msg:=Ias_Gen_Pkg.Get_Prompt(P_Lng,13294)||' '||Ias_Gen_Pkg.Get_Prompt(P_Lng,13292)||' ( '||ys_gen_pkg.get_flg_nm('DR_CR_FLG',V_Dr_Cr,P_Lng)||' ) '||' = '||V_ANULY_LMT||chr(13)||
    												   	    Ias_Gen_Pkg.Get_Prompt(P_Lng,2007)||'  = '||Round(NVL(V_Amt,0),P_frc_no)||' '||chr(13)||
    												   	    Ias_Gen_Pkg.Get_Prompt(P_Lng,999)||'  = '||Round(abs(nvl(V_ANULY_LMT,0)-NVL(V_Amt,0)),P_frc_no)||chr(13)||
    												   	    Ias_Gen_Pkg.Get_Prompt(P_Lng,3604)||' = '||Abs(Round(((nvl(V_ANULY_LMT,0)-Nvl(NVL(V_Amt,0),0)) /nvl(V_ANULY_LMT,1) )*100,2));
    		RETURN;
	     EXCEPTION WHEN OTHERS THEN
	       	P_Msg:=Ias_Gen_Pkg.Get_Prompt(P_Lng,13294)||' '||Ias_Gen_Pkg.Get_Prompt(P_Lng,13292)||' ( '||ys_gen_pkg.get_flg_nm('DR_CR_FLG',V_Dr_Cr,P_Lng)||' ) '||' = '||V_ANULY_LMT||chr(13)||
    												   	    Ias_Gen_Pkg.Get_Prompt(P_Lng,2007)||'  = '||Round(NVL(V_Amt,0),P_frc_no)||' '||chr(13)||
    												   	    Ias_Gen_Pkg.Get_Prompt(P_Lng,999)||'  = '||Round(abs(nvl(V_ANULY_LMT,0)-NVL(V_Amt,0)),P_frc_no);
	      RETURN;
	  END ;
	End IF;
    End IF;

      IF V_Dr_Cr2 IS NOT NULL THEN
	V_Dr_Cr:=V_Dr_Cr2;
      END IF;

   END LOOP;
    IF NVL(V_CNT_ACC,0)>0 THEN
       V_AC_CODE_DTL:=V_AC_CODE_DTL_TMP;
    END IF;

  END LOOP;
 Exception
 When Others Then
  Null;
End CHK_AC_Lmt;
--===============================================================
FUNCTION GET_FCLTY_BLNC (P_AC_CODE	 In  ACCOUNT.A_CODE%TYPE			,
			 P_AC_DTL_TYP	 In  ACCOUNT.AC_DTL_TYP%TYPE			,
			 P_AC_CODE_DTL	 In  Varchar2					,
			 P_CUR_CODE	 In  Varchar2					,
			 P_CC_CODE	 In  COST_CENTERS.CC_CODE%TYPE			,
			 P_PJ_NO	 In  IAS_PROJECTS.PJ_NO%TYPE			,
			 P_ACTV_NO	 In  IAS_ACTVTY.ACTV_NO%TYPE			,
			 P_BRN_NO	 In  S_BRN.BRN_NO%TYPE	    Default Null	,
			 P_MAX_lmt	 in  Number					,
			 P_FCLTY_AMT	 in  Number					,
			 P_DOC_AMT	 in  Number default 0				,
			 p_FCLTY_ST	 in  Number default 0				,
			 P_frc_no	 In  Number	Default 2  ) RETURN NUMBER IS


 V_FCLTY_blnc	    Number:=0;
 V_FCLTY_ST	    Number:=0;
 V_Amt		    Number:=0;
 V_LOC_AMT	    Number:=0;
 Bal		    Number:=0;
 V_CUR_CODE	    VARCHAR2(30);
Begin
  ---------------------------------------------------------------------------------
    GET_PARAMTRS;
  ---------------------------------------------------------------------------------

     IF (V_Use_Multi_Cur_Lmt=1 AND P_AC_DTL_TYP IN(0,4,5,6,7)) OR (P_AC_DTL_TYP IN (1,2))
	    OR (NVL(V_USE_CST_CR_LMT_LOCAL,1)=0 AND P_AC_DTL_TYP=3 ) THEN

	  V_LOC_AMT:=0;
	  V_CUR_CODE:=P_CUR_CODE;
     ELSE
	  V_LOC_AMT:=1;
	  V_CUR_CODE:=YS_GEN_PKG.GET_LOCAL_CUR;
     END IF;

     Bal:=Round(GET_BLNC_CST_FNC( P_loc_cur  => ys_gen_pkg.Get_Local_Cur,
				       P_cc_code  => NULL,
				       P_c_code   => P_AC_CODE_DTL,
				       P_acy	  => V_CUR_CODE,
				       P_bal_type =>1
				       ),P_frc_no);


    IF Nvl(P_FCLTY_AMT,0) >0 AND   nvl(Bal,0)+NVL(P_DOC_AMT,0)	<= nvl(P_max_lmt,0) THEN   ---and NVL(P_FCLTY_ST,0)=1	+NVL(P_FCLTY_AMT,0)

       V_FCLTY_blnc:=P_FCLTY_AMT;
       --AND NVL(P_DOC_AMT,0)>=0

    ELSIF Nvl(P_FCLTY_AMT,0) >0   AND ABS(nvl(Bal,0)+NVL(P_DOC_AMT,0))	> nvl(P_max_lmt,0) then   --and NVL(P_FCLTY_ST,0)=0    +NVL(P_FCLTY_AMT,0)
       V_FCLTY_blnc:=nvl(P_FCLTY_AMT,0)-(ABS(nvl(Bal,0)+ NVL(P_DOC_AMT,0)) - nvl(P_max_lmt,0));

    ELSE
       V_FCLTY_blnc:=0;
    End if;

  RETURN(V_FCLTY_blnc);
Exception
 When Others Then
  Null;
END GET_FCLTY_BLNC;
--===============================================================
--===============================================================
PROCEDURE GET_ACDTL_LMT_BLNC(P_DOC_DATE      In  DATE	DEFAULT YS_GEN_PKG.GET_SYSDATE		,
														P_A_CODE	IN ACCOUNT.A_CODE%TYPE	      DEFAULT NULL,
														P_AC_DTL_TYP	IN NUMBER    DEFAULT NULL,
														P_AC_CODE_DTL	IN VARCHAR2  DEFAULT NULL,
														P_CUR_CODE	IN VARCHAR2  DEFAULT NULL,
														P_BRN_NO	IN S_BRN.BRN_NO%TYPE  DEFAULT NULL,
														P_CC_CODE	IN COST_CENTERS.CC_CODE%TYPE  DEFAULT NULL,
														P_PJ_CODE	IN IAS_PROJECTS.PJ_NO%TYPE    DEFAULT NULL,
														P_ACTV_CODE	IN IAS_ACTVTY.ACTV_NO%TYPE    DEFAULT NULL,
														P_LOC_AMT	IN NUMBER   DEFAULT 1,
														P_TRNS_VEIW_TYP IN NUMBER  DEFAULT 1,
														P_DALY_BLNC	OUT Number ,
														P_MNTHLY_BLNC	OUT Number ,
														P_ANULY_BLNC	OUT Number ,
														P_BLNC		OUT Number
			   )   IS
V_CNT	     Number;
V_LOC_AMT    Number;
V_CUR_CODE   Varchar2(20);
V_BLNC_NOT_PST	Number;
BEGIN
    --------------------------------------------------------------------------------
     GET_PARAMTRS;
    ---------------------------------------------------------------------------------
     --##----------------------------------------------------------------------------------------------------------##--
      IF (NVL(V_Use_Multi_Cur_Lmt,0)=1 AND P_AC_DTL_TYP IN(0,4,5,6,7)) OR (P_AC_DTL_TYP IN (1,2))
			  OR (NVL(V_USE_CST_CR_LMT_LOCAL,0)=0 AND P_AC_DTL_TYP=3 ) THEN
			
		  V_LOC_AMT:=0;	
	  V_CUR_CODE:=P_CUR_CODE;

	  ELSE
			V_LOC_AMT:=1;
		    V_CUR_CODE:=YS_GEN_PKG.GET_LOCAL_CUR;
		 --##----------------------------------------------------------------------------------------------------------##--
    END IF;

     ----------------------------------------------
     IF P_CUR_CODE IS NULL THEN
       V_CUR_CODE:=YS_GEN_PKG.GET_LOCAL_CUR;
     END IF;
   --------------------------------------------------------------------------------------------------------------------------
    V_CNT :=YS_GEN_PKG.GET_CNT('SELECT 1 FROM IAS_POST_DTL
				WHERE C_CODE IS NOT NULL
				  AND ROWNUM<=1');
				
			    If P_AC_DTL_TYP=3 AND NVL(V_CNT,0)=1 AND P_AC_CODE_DTL IS NOT NULL then
			
			       Select Decode(V_cur_code,YS_GEN_PKG.GET_LOCAL_CUR,nvl(sum(amt),0), nvl(sum(amt_f),0))
				       Into P_BLNC
		     From Ias_Post_Dtl D
		    WHERE --AC_DTL_TYP=3 AND AC_CODE_DTL=P_Ac_code_Dtl
		       ((AC_DTL_TYP=3 AND AC_CODE_DTL=P_Ac_code_Dtl )OR (AC_DTL_TYP=4 AND AC_CODE_DTL=IAS_CST_PKG.GET_C_VNDR(P_Ac_code_Dtl)))
		      and a_cy= Decode(V_LOC_AMT,1,a_cy,V_CUR_CODE)
		      and nvl(D.cc_code,'0') = Decode(P_cc_code,null,nvl(D.cc_code,'0'),P_cc_code)
		      and nvl(D.pj_no,'0')   = Decode(P_pj_code,null,nvl(D.pj_no,'0'),P_pj_code)
		      and nvl(D.actv_no,'0') = Decode(P_actv_code,null,nvl(D.actv_no,'0'),P_actv_code)
		      AND NVL(D.BRN_NO,0)    = DECODE(V_Gl_Lmt_LVL,2,P_BRN_NO,NVL(D.BRN_NO,0) );
	       	
			    Else						
			     Select Decode(V_cur_code,YS_GEN_PKG.GET_LOCAL_CUR,nvl(sum(amt),0), nvl(sum(amt_f),0))
				     Into P_BLNC
				     From Ias_Post_Dtl--GLS_V_AC_DTL_CCPJACTV_BLNC
				    where nvl(A_code,'0') = Decode(P_A_Code,null,nvl(A_Code,'0'),P_A_Code)
				      and nvl(Ac_Code_Dtl,'0') = Decode(P_Ac_code_Dtl,Null,nvl(Ac_Code_Dtl,'0'),P_Ac_Code_Dtl)
				      and nvl(Ac_Dtl_Typ,0)   = Decode(P_Ac_Dtl_Typ,0,nvl(Ac_Dtl_Typ,0),P_Ac_Dtl_Typ)
				      and a_cy= Decode(V_LOC_AMT,1,a_cy,V_CUR_CODE)
				      and nvl(cc_code,'0') = Decode(P_cc_code,null,nvl(cc_code,'0'),P_cc_code)
				      and nvl(pj_no,'0')   = Decode(P_pj_code,null,nvl(pj_no,'0'),P_pj_code)
				      and nvl(actv_no,'0') = Decode(P_actv_code,null,nvl(actv_no,'0'),P_actv_code)
		    and NVL(BRN_NO,0)	 = DECODE(V_Gl_Lmt_LVL,2,P_BRN_NO,NVL(BRN_NO,0) );
			    END IF;

	      BEGIN
		Select Decode(V_cur_code,YS_GEN_PKG.GET_LOCAL_CUR,nvl(sum(amt),0), nvl(sum(amt_f),0))
			 Into V_BLNC_NOT_PST
			 From POS_AC_BLNC_NOT_PST_VW
			where nvl(A_code,'0') = Decode(P_A_Code,null,nvl(A_Code,'0'),P_A_Code)
			  and nvl(Ac_Code_Dtl,'0') = Decode(P_Ac_code_Dtl,Null,nvl(Ac_Code_Dtl,'0'),P_Ac_Code_Dtl)
			  and nvl(Ac_Dtl_Typ,0)   = Decode(P_Ac_Dtl_Typ,0,nvl(Ac_Dtl_Typ,0),P_Ac_Dtl_Typ)
			  and a_cy= Decode(V_LOC_AMT,1,a_cy,V_CUR_CODE)
			  and nvl(cc_code,'0') = Decode(P_cc_code,null,nvl(cc_code,'0'),P_cc_code)
			  and nvl(pj_no,'0')   = Decode(P_pj_code,null,nvl(pj_no,'0'),P_pj_code)
			  and nvl(actv_no,'0') = Decode(P_actv_code,null,nvl(actv_no,'0'),P_actv_code)
			  AND NVL(BRN_NO,0)    = DECODE(V_Gl_Lmt_LVL,2,P_BRN_NO,NVL(BRN_NO,0) );
	      EXCEPTION WHEN OTHERS THEN
		V_BLNC_NOT_PST:=0;
	      END;
	      P_BLNC:=NVL(P_BLNC,0)+NVL(V_BLNC_NOT_PST,0);
   --------------------------------------------------------------------------------------------------------------------------
 --If nvl(P_TRNS_VEIW_TYP,1) =1 then  --TRANSACTION
   /*If P_AC_DTL_TYP=3 AND NVL(V_CNT,0)=1 AND P_AC_CODE_DTL IS NOT NULL then
			      --GLS_V_CST_VND_CCPJACTV_BLNC

	   Select Decode(V_cur_code,YS_GEN_PKG.GET_LOCAL_CUR,nvl(sum(amt),0), nvl(sum(amt_f),0))
				       Into P_DALY_BLNC
		     From Ias_Post_Dtl D
		    WHERE --AC_DTL_TYP=3 AND AC_CODE_DTL=P_Ac_code_Dtl
		       ((AC_DTL_TYP=3 AND AC_CODE_DTL=P_Ac_code_Dtl ) OR (AC_DTL_TYP=4 AND AC_CODE_DTL=IAS_CST_PKG.GET_C_VNDR(P_Ac_code_Dtl)))
		      and a_cy= Decode(V_LOC_AMT,1,a_cy,V_CUR_CODE)
		      and doc_date between P_DOC_DATE and  P_DOC_DATE
					      and doc_type<>0				
		      and nvl(D.cc_code,'0') = Decode(P_cc_code,null,nvl(D.cc_code,'0'),P_cc_code)
		      and nvl(D.pj_no,'0')   = Decode(P_pj_code,null,nvl(D.pj_no,'0'),P_pj_code)
		      and nvl(D.actv_no,'0') = Decode(P_actv_code,null,nvl(D.actv_no,'0'),P_actv_code);

   ELSE
					Select Decode(V_cur_code,YS_GEN_PKG.GET_LOCAL_CUR,nvl(sum(amt),0), nvl(sum(amt_f),0))
				     Into P_DALY_BLNC
				     From Ias_Post_Dtl
				    where nvl(A_code,'0') = Decode(P_A_Code,null,nvl(A_Code,'0'),P_A_Code)
				      and nvl(Ac_Code_Dtl,'0') = Decode(P_Ac_code_Dtl,Null,nvl(Ac_Code_Dtl,'0'),P_Ac_Code_Dtl)
				      and nvl(Ac_Dtl_Typ,0)   = Decode(P_Ac_Dtl_Typ,0,nvl(Ac_Dtl_Typ,0),P_Ac_Dtl_Typ)
				      and a_cy= Decode(V_LOC_AMT,1,a_cy,V_CUR_CODE)
				      and doc_date between P_DOC_DATE and  P_DOC_DATE
				      and doc_type<>0
				      --AND NVL(AMT,0)>0
				      and nvl(cc_code,'0') = Decode(P_cc_code,null,nvl(cc_code,'0'),P_cc_code)
				      and nvl(pj_no,'0')   = Decode(P_pj_code,null,nvl(pj_no,'0'),P_pj_code)
				      and nvl(actv_no,'0') = Decode(P_actv_code,null,nvl(actv_no,'0'),P_actv_code);
   END IF;
   --------------------------------------------------------------------------------------------------------------------------
      If P_AC_DTL_TYP=3 AND NVL(V_CNT,0)=1 AND P_AC_CODE_DTL IS NOT NULL then
			      --GLS_V_CST_VND_CCPJACTV_BLNC

	   Select Decode(V_cur_code,YS_GEN_PKG.GET_LOCAL_CUR,nvl(sum(amt),0), nvl(sum(amt_f),0))
				       Into P_MNTHLY_BLNC
		     From Ias_Post_Dtl D
		    WHERE --AC_DTL_TYP=3 AND AC_CODE_DTL=P_Ac_code_Dtl
		       ((AC_DTL_TYP=3 AND AC_CODE_DTL=P_Ac_code_Dtl ) OR (AC_DTL_TYP=4 AND AC_CODE_DTL=IAS_CST_PKG.GET_C_VNDR(P_Ac_code_Dtl)))
		      and a_cy= Decode(V_LOC_AMT,1,a_cy,V_CUR_CODE)
		      and doc_date between TRUNC(P_DOC_DATE,'MM') and  LAST_DAY(P_DOC_DATE)
				      and doc_type<>0
					      --AND NVL(AMT,0)>0
		      and nvl(D.cc_code,'0') = Decode(P_cc_code,null,nvl(D.cc_code,'0'),P_cc_code)
		      and nvl(D.pj_no,'0')   = Decode(P_pj_code,null,nvl(D.pj_no,'0'),P_pj_code)
		      and nvl(D.actv_no,'0') = Decode(P_actv_code,null,nvl(D.actv_no,'0'),P_actv_code);

    ELSE
					Select Decode(V_cur_code,YS_GEN_PKG.GET_LOCAL_CUR,nvl(sum(amt),0), nvl(sum(amt_f),0))
				     Into P_MNTHLY_BLNC
				     From Ias_Post_Dtl
				    where nvl(A_code,'0') = Decode(P_A_Code,null,nvl(A_Code,'0'),P_A_Code)
				      and nvl(Ac_Code_Dtl,'0') = Decode(P_Ac_code_Dtl,Null,nvl(Ac_Code_Dtl,'0'),P_Ac_Code_Dtl)
				      and nvl(Ac_Dtl_Typ,0)   = Decode(P_Ac_Dtl_Typ,0,nvl(Ac_Dtl_Typ,0),P_Ac_Dtl_Typ)
				      and a_cy= Decode(V_LOC_AMT,1,a_cy,V_CUR_CODE)
				      and doc_date between TRUNC(P_DOC_DATE,'MM') and  LAST_DAY(P_DOC_DATE)
				      and doc_type<>0
				      --AND NVL(AMT,0)>0
				      and nvl(cc_code,'0') = Decode(P_cc_code,null,nvl(cc_code,'0'),P_cc_code)
				      and nvl(pj_no,'0')   = Decode(P_pj_code,null,nvl(pj_no,'0'),P_pj_code)
				      and nvl(actv_no,'0') = Decode(P_actv_code,null,nvl(actv_no,'0'),P_actv_code);
   END IF;
   --------------------------------------------------------------------------------------------------------------------------
    If P_AC_DTL_TYP=3 AND NVL(V_CNT,0)=1 AND P_AC_CODE_DTL IS NOT NULL then
			      --GLS_V_CST_VND_CCPJACTV_BLNC

	   Select Decode(V_cur_code,YS_GEN_PKG.GET_LOCAL_CUR,nvl(sum(amt),0), nvl(sum(amt_f),0))
				       Into P_ANULY_BLNC
		     From Ias_Post_Dtl D
		    WHERE --AC_DTL_TYP=3 AND AC_CODE_DTL=P_Ac_code_Dtl
		       ((AC_DTL_TYP=3 AND AC_CODE_DTL=P_Ac_code_Dtl ) OR (AC_DTL_TYP=4 AND AC_CODE_DTL=IAS_CST_PKG.GET_C_VNDR(P_Ac_code_Dtl)))
		      and a_cy= Decode(V_LOC_AMT,1,a_cy,V_CUR_CODE)
		      and doc_date between YS_GEN_PKG.GET_FRST_DAY and	YS_GEN_PKG.GET_FINAL_DAY
					      and doc_type<>0
					      --AND NVL(AMT,0)>0
		      and nvl(D.cc_code,'0') = Decode(P_cc_code,null,nvl(D.cc_code,'0'),P_cc_code)
		      and nvl(D.pj_no,'0')   = Decode(P_pj_code,null,nvl(D.pj_no,'0'),P_pj_code)
		      and nvl(D.actv_no,'0') = Decode(P_actv_code,null,nvl(D.actv_no,'0'),P_actv_code);

    ELSE
					Select Decode(V_cur_code,YS_GEN_PKG.GET_LOCAL_CUR,nvl(sum(amt),0), nvl(sum(amt_f),0))
				     Into P_ANULY_BLNC
				     From Ias_Post_Dtl
				    where nvl(A_code,'0') = Decode(P_A_Code,null,nvl(A_Code,'0'),P_A_Code)
				      and nvl(Ac_Code_Dtl,'0') = Decode(P_Ac_code_Dtl,Null,nvl(Ac_Code_Dtl,'0'),P_Ac_Code_Dtl)
				      and nvl(Ac_Dtl_Typ,0)   = Decode(P_Ac_Dtl_Typ,0,nvl(Ac_Dtl_Typ,0),P_Ac_Dtl_Typ)
				      and a_cy= Decode(V_LOC_AMT,1,a_cy,V_CUR_CODE)
				      and doc_date between YS_GEN_PKG.GET_FRST_DAY and	YS_GEN_PKG.GET_FINAL_DAY
				      and doc_type<>0
				      --AND NVL(AMT,0)>0
				      and nvl(cc_code,'0') = Decode(P_cc_code,null,nvl(cc_code,'0'),P_cc_code)
				      and nvl(pj_no,'0')   = Decode(P_pj_code,null,nvl(pj_no,'0'),P_pj_code)
				      and nvl(actv_no,'0') = Decode(P_actv_code,null,nvl(actv_no,'0'),P_actv_code);
   END IF;   */
   --END IF;  --TRANSACTION
    -------------------------------------------------------------------------------------------------------------------------
Exception
 When Others Then
  Null;
END GET_ACDTL_LMT_BLNC;
--===============================================================
End GLS_LMT_PKG;
/
