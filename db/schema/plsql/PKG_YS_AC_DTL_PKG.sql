-- =============================================
-- PACKAGE SPEC: YS_AC_DTL_PKG  (status: INVALID)
-- =============================================
CREATE OR REPLACE
PACKAGE Ys_Ac_Dtl_Pkg AS
		--------------------------
		TYPE T_CV IS REF CURSOR ;
		---------------------
    FUNCTION Get_Ac_Dtl_Typ (P_A_Code In ACCOUNT.A_CODE%TYPE) RETURN NUMBER ;
    FUNCTION Get_Ac_Dtl_Nm( P_AC_Code_Dtl   In ACCOUNT.A_CODE%TYPE DEFAULT NULL ,
			    P_AC_CODE	    In ACCOUNT.A_CODE%TYPE  ,
			    P_Ac_Dtl_Typ    In ACCOUNT.AC_DTL_TYP%TYPE	DEFAULT 0,
			    P_Lng_No	    In LANG_DEF.LANG_NO%TYPE DEFAULT 1,
			    P_get_nm_only   In NUMBER DEFAULT 1) RETURN VARCHAR2;
   /* PROCEDURE Chk_Ac_Dtl( P_AC_Code_Dtl  IN ACCOUNT.A_CODE%TYPE,
			  P_AC_CODE	 IN ACCOUNT.A_CODE%TYPE  DEFAULT NULL,
			  P_Ac_Dtl_Nm	 IN OUT ACCOUNT.A_NAME%TYPE,
			  P_Ac_Dtl_Typ	 IN OUT ACCOUNT.AC_DTL_TYP%TYPE,
			  P_Cur_code	 IN EX_RATE.CUR_CODE%TYPE  DEFAULT NULL,
			  P_Ar_Flg	 IN Number Default 0,
			  P_Scr_Typ	 IN Number,
			  P_Aralt	 IN Number,
			  P_Apalt	 IN Number,
			  P_Doc_Date	 IN Date,
			  P_Usr_No	 IN Number,
			  P_Lng_No	 IN LANG_DEF.LANG_NO%TYPE DEFAULT 1,
			  P_Msg_No	 IN OUT Number);*/
       FUNCTION Chk_Ac_Dtl_Acy ( P_AC_Code_Dtl	IN ACCOUNT.A_CODE%TYPE,
				 P_Ac_Dtl_Typ	IN ACCOUNT.AC_DTL_TYP%TYPE,
				 P_A_Cy 	IN ACCOUNT_CURR.A_Cy%TYPE)  RETURN NUMBER ;
       -------------------------------------------------------------------------------------------------
       FUNCTION Get_One_Acy_Ac_Dtl ( P_AC_Code_Dtl  IN IAS_POST_DTL.AC_CODE_DTL%TYPE
				  ,P_Ac_Dtl_Typ   IN ACCOUNT.AC_DTL_TYP%TYPE
				  ,P_Ac_CODE	  IN ACCOUNT.A_CODE%TYPE
				  ,P_USR_NO	  IN USER_R.U_ID%TYPE	) RETURN VARCHAR2  ;
       -------------------------------------------------------------------------------------------------
       FUNCTION Get_One_Acy_Ac_Dtl ( P_AC_Code_Dtl  IN ACCOUNT.A_CODE%TYPE,
				     P_Ac_Dtl_Typ   IN ACCOUNT.AC_DTL_TYP%TYPE)  RETURN VARCHAR2;
       -------------------------------------------------------------------------------------------------
       FUNCTION Get_Ac_Dtl_Acode (  P_AC_Code_Dtl  IN ACCOUNT.A_CODE%TYPE,
				    P_Ac_Dtl_Typ   IN ACCOUNT.AC_DTL_TYP%TYPE)	RETURN VARCHAR2;

			FUNCTION Chk_Inactv_Acy ( P_AC_Code_Dtl  IN ACCOUNT.A_CODE%TYPE,
						  P_Ac_Dtl_Typ	 IN ACCOUNT.AC_DTL_TYP%TYPE,
						  P_A_Cy	 IN ACCOUNT_CURR.A_Cy%TYPE)  RETURN NUMBER ;			
			PROCEDURE SHW_AC_CODE_DTL_PRC(P_CV	    IN OUT T_CV,
					 P_WHR		IN VARCHAR2	    default null,
					 P_AC_DTL_TYP	IN NUMBER	    default 0,
					 P_AC_CODE	IN ACCOUNT.A_CODE%TYPE	      default null,
					 P_F_Ac_Code_Dtl  IN VARCHAR2			default null,
					 P_T_Ac_Code_Dtl  IN VARCHAR2			default null,
					 P_CUR_CODE	IN ACCOUNT_CURR.A_CY %TYPE    default null,
					 P_LANG_NO	IN NUMBER     ,
					 P_ORDR_BY	IN VARCHAR2,
					 P_USER_NO	IN NUMBER	) ;
END Ys_Ac_Dtl_Pkg;
/

-- ---------------------------------------------
-- PACKAGE BODY: YS_AC_DTL_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE BODY Ys_Ac_Dtl_Pkg AS
    FUNCTION Get_Ac_Dtl_Typ (P_A_Code IN ACCOUNT.A_CODE%TYPE) RETURN NUMBER Is
V_Ac_Dtl_Typ ACCOUNT.AC_DTL_TYP%TYPE;
 Begin
     Select nvl(AC_DTL_TYP,0)
       Into V_Ac_Dtl_Typ
       From ACCOUNT
      where A_CODE=P_A_Code
	and RowNum<=1;
      RETURN(V_Ac_Dtl_Typ);
 Exception
    when others then
      RETURN(0);
End Get_Ac_Dtl_Typ ;

FUNCTION Get_Ac_Dtl_Nm( P_AC_Code_Dtl	In ACCOUNT.A_CODE%TYPE DEFAULT NULL ,
			    P_AC_CODE	    In ACCOUNT.A_CODE%TYPE  ,
			    P_Ac_Dtl_Typ    In ACCOUNT.AC_DTL_TYP%TYPE	DEFAULT 0,
			    P_Lng_No	    In LANG_DEF.LANG_NO%TYPE DEFAULT 1,
			    P_get_nm_only   In NUMBER DEFAULT 1)  RETURN VARCHAR2 Is

 V_Cntrl_Nm   ACCOUNT.A_NAME%TYPE;
 V_Ac_Dtl_Typ ACCOUNT.Ac_Dtl_Typ%TYPE;
 V_LNG_NO     LANG_DEF.LANG_NO%TYPE := P_LNG_NO ;--NVL(P_LNG_NO,YS_PRMTR_PKG.GetPval (P_PRMTR => 'LANG_NO'));
BEGIN
IF NVL(P_Ac_Dtl_Typ,0)=0 and P_AC_CODE IS NOT NULL THEN
   V_Ac_Dtl_Typ:= Ys_Ac_Dtl_Pkg.Get_Ac_Dtl_Typ (P_A_CODE=>P_AC_CODE);
ELSE
   V_Ac_Dtl_Typ:=P_Ac_Dtl_Typ;
END IF;
  IF P_Ac_Code_Dtl Is Not Null and NVL(V_Ac_Dtl_Typ,0) <> 0 Then
     If  V_Ac_Dtl_Typ = 1 Then -- cash
	 Select DECODE(V_LNG_NO,1,CASH_NAME,CASH_E_NAME) CSH_NM
	   Into V_Cntrl_Nm
	   From CASH_IN_HAND
	  where CASH_NO = P_Ac_Code_Dtl
	    and RowNum<=1;
     ElsIf  V_Ac_Dtl_Typ = 2 Then -- Bank

	 Select  DECODE(V_LNG_NO,1,BANK_NAME,BANK_E_NAME) BNK_NM
	   Into V_Cntrl_Nm
	   From CASH_AT_BANK
	  where BANK_NO = P_Ac_Code_Dtl
	    and RowNum<=1;
     ElsIf  V_Ac_Dtl_Typ = 3 Then -- CUSTOMER
	 Select DECODE(V_LNG_NO,1,C_A_NAME,NVL(C_E_NAME,C_A_NAME)) C_NM
	   Into V_Cntrl_Nm
	   From CUSTOMER
	  where C_CODE = P_Ac_Code_Dtl
	    and RowNum<=1;
     ElsIf  V_Ac_Dtl_Typ = 4 Then -- VENDOR

	 Select DECODE(V_LNG_NO,1,V_A_NAME,NVL(V_E_NAME,V_A_NAME)) V_NM
	   Into V_Cntrl_Nm
	   From V_DETAILS
	  where V_CODE = P_Ac_Code_Dtl
	    and RowNum<=1;
     ElsIf  V_Ac_Dtl_Typ in (5,6) Then -- Debit and Credit
	 Select DECODE(V_LNG_NO,1,Ac_Code_Dtl_L_Nm,NVL(Ac_Code_Dtl_F_Nm,Ac_Code_Dtl_L_Nm)) V_NM
	   Into V_Cntrl_Nm
	   From GlS_ACCNT_DTL
	  where Ac_Code_Dtl  = P_Ac_Code_Dtl
	    AND AC_DTL_TYP=V_Ac_Dtl_Typ
	    AND AC_Code =  P_Ac_Code
	    and RowNum<=1;
     ElsIf  V_Ac_Dtl_Typ = 7 Then -- Employee
	 Select DECODE(V_LNG_NO,1,EMP_L_NM,EMP_F_NM) EMP_NM
	   Into V_Cntrl_Nm
	   From S_EMP
	  where EMP_NO = P_Ac_Code_Dtl
	    and RowNum<=1;
     End If;
  ElsIf  P_get_nm_only = 1 and nvl(V_Ac_Dtl_Typ,0) = 0 And P_Ac_Code Is Not Null Then -- no control accounts
	 Select DECODE(V_LNG_NO,1,A_NAME,NVL(A_NAME_ENG,A_NAME)) AC_NM
	   Into V_Cntrl_Nm
	   From ACCOUNT
	  where A_Code = P_Ac_Code
	    and RowNum<=1;
	ElsIf  P_get_nm_only = 1 and nvl(V_Ac_Dtl_Typ,0) <> 0 And P_Ac_Code Is Not Null AND P_Ac_Code_Dtl IS NULL Then
	 Select DECODE(V_LNG_NO,1,A_NAME,NVL(A_NAME_ENG,A_NAME)) AC_NM
	   Into V_Cntrl_Nm
	   From ACCOUNT
	  where A_Code = P_Ac_Code
	    and RowNum<=1;
  End If;
 RETURN(V_Cntrl_Nm);
Exception
    when others then
      RETURN(Null);
END Get_Ac_Dtl_Nm ;
---------------------------------------------------------------------------------------------------------------------------------
/*PROCEDURE Chk_Ac_Dtl( P_AC_Code_Dtl  IN ACCOUNT.A_CODE%TYPE,
		      P_AC_CODE      IN ACCOUNT.A_CODE%TYPE  DEFAULT NULL,
		      P_Ac_Dtl_Nm    IN OUT ACCOUNT.A_Name%TYPE  ,
		      P_Ac_Dtl_Typ   IN OUT ACCOUNT.AC_DTL_TYP%TYPE,
		      P_Cur_code     IN EX_RATE.CUR_CODE%TYPE  DEFAULT NULL,
		      P_Ar_Flg	     IN Number Default 0,
		      P_Scr_Typ      IN Number,
		      P_Aralt	     IN Number,
		      P_Apalt	     IN Number,
		      P_Doc_Date     IN Date,
		      P_Usr_No	     IN Number,
		      P_Lng_No	     IN LANG_DEF.LANG_NO%TYPE DEFAULT 1,
		      P_Msg_No	     IN OUT Number) Is
BEGIN
----------------------------------------------------------------------------
    IF P_Ac_Dtl_Typ IS NULL and P_AC_CODE IS NOT NULL THEN
       P_Ac_Dtl_Typ:= Ys_Ac_Dtl_Pkg.Get_Ac_Dtl_Typ (P_A_CODE=>P_AC_CODE);
    END IF;
----------------------------------------------------------------------------
  IF P_Ac_Code_Dtl Is Not Null and NVL(P_Ac_Dtl_Typ,0) <> 0 Then
     If  P_Ac_Dtl_Typ IN (1,2) Then -- cash Or Bank
	 IAS_CshBnk_Pkg.Chk_CshBnk_No ( P_Csh_No     => P_Ac_Code_Dtl,
					P_Ac_Code    => P_Ac_Code,
					P_Csh_Nm     => P_Ac_Dtl_Nm,
					P_Ac_Dtl_Typ => P_Ac_Dtl_Typ,
					P_Cur_code   => P_Cur_code,
					P_Lng_No     => P_Lng_No,
					P_Usr_No     => P_Usr_No,
					P_Scr_Typ    => P_Scr_Typ,
					P_Msg_No     => P_Msg_No);

     ElsIf  P_Ac_Dtl_Typ = 3 Then -- CUSTOMER

	 Ias_Cst_Pkg.Chk_C_code (  P_C_Code	=> P_Ac_Code_Dtl,
				   P_Ac_Code	=> P_Ac_Code,
				   P_Aralt	=> P_Aralt,
				   P_Cst_Nm	=> P_Ac_Dtl_Nm,
				   P_Ac_Dtl_Typ => P_Ac_Dtl_Typ,
				   P_Ar_Flg	=> P_Ar_Flg,
				   P_Lng_No	=> P_Lng_No,
				   P_Usr_No	=> P_Usr_No,
				   P_Scr_Typ	=> P_Scr_Typ,
				   P_Msg_No	=> P_Msg_No);
	    ------------------------------------------------------------------------
     ElsIf  P_Ac_Dtl_Typ = 4 Then -- VENDOR
	 IAS_Vndr_Pkg.Chk_V_code ( P_V_Code	=> P_Ac_Code_Dtl,
				   P_Ac_Code	=> P_Ac_Code,
				   P_Apalt	=> P_Apalt,
				   P_Vnd_Nm	=> P_Ac_Dtl_Nm,
				   P_Ac_Dtl_Typ => P_Ac_Dtl_Typ,
				   P_Lng_No	=> P_Lng_No,
				   P_Usr_No	=> P_Usr_No,
				   P_Scr_Typ	=> P_Scr_Typ,
				   P_Msg_No	=> P_Msg_No);

     ELSIF P_Ac_Dtl_Typ IN(5,6) Then
       GLS_ACCNTDTL_Pkg.Chk_AC_CODE_DTL ( P_AC_CODE_DTL    => P_Ac_Code_Dtl,
					  P_Ac_Code	   => P_Ac_Code,
					  P_AC_CODE_DTL_NM => P_Ac_Dtl_Nm,
					  P_Ac_Dtl_Typ	   => P_Ac_Dtl_Typ,
					  P_Cur_code	   => P_Cur_code,
					  P_Lng_No	   => P_Lng_No,
					  P_Usr_No	   => P_Usr_No,
					  P_Scr_Typ	   => P_Scr_Typ,
					  P_Msg_No	   => P_Msg_No);

     ElsIf  P_Ac_Dtl_Typ = 7 Then -- EMPLOYEE
		  Ys_Emp_Pkg.Chk_Emp ( P_Hrs_Sys   => 0,
				       P_Emp_No    => P_Ac_Code_Dtl,
				       P_Lng_No    => P_Lng_No,
				       P_Usr_No    => P_Usr_No,
				       P_Scr_Typ   => P_Scr_Typ,
				       P_Doc_Date  => P_Doc_Date,
				       P_Emp_Nm    => P_Ac_Dtl_Nm,
				       P_Msg_No    => P_Msg_No);

	 End If;
      End If;

    Exception
	when others then
	  P_Msg_No := 312;
    END Chk_Ac_Dtl ;*/
--##----------------------------------------------------------------------------------------------------------------------------##--
FUNCTION Chk_Ac_Dtl_Acy ( P_AC_Code_Dtl   IN ACCOUNT.A_CODE%TYPE,
			  P_Ac_Dtl_Typ	  IN ACCOUNT.AC_DTL_TYP%TYPE,
			  P_A_CY	  IN ACCOUNT_CURR.A_CY%TYPE ) RETURN NUMBER Is

     V_Cnt	  Number:=0;
     V_CST_LNK	  Number:=0;
     V_VNDR_LNK    Number:=0;
    BEGIN
      V_CST_LNK  :=Nvl(IAS_GEN_PKG.GET_FLD_VALUE('IAS_PARA_AR','NVL(AR_AC_LINK_TYPE,0)'),0);
      V_VNDR_LNK :=Nvl(IAS_GEN_PKG.GET_FLD_VALUE('IAS_PARA_AP','NVL(AP_AC_LINK_TYPE,0)'),0);
      IF  NVL(P_Ac_Dtl_Typ,0) Not in (0,7) And P_A_CY Is Not Null Then

	 If  P_Ac_Dtl_Typ = 1 Then -- cash

	     V_Cnt := Ias_Gen_Pkg.Get_Cnt('Select 1
					   From Ias_Cash_In_Hand_Dtl
					  Where Cash_No = '''||P_Ac_Code_Dtl||'''
					    And A_Cy	= '''||P_A_Cy||'''
					    And Rownum<=1');

	 ElsIf	P_Ac_Dtl_Typ = 2 Then -- Bank

	     V_Cnt := Ias_Gen_Pkg.Get_Cnt('Select 1
					       From Ias_Cash_At_Bank_Dtl
					      Where Bank_No = '''||P_Ac_Code_Dtl||'''
						And A_Cy    = '''||P_A_Cy||'''
						And Rownum<=1');

	 ElsIf	P_Ac_Dtl_Typ = 3 AND V_CST_LNK=2 Then -- CUSTOMER

	     V_Cnt := Ias_Gen_Pkg.Get_Cnt('Select 1
					       From Customer_Curr
					      Where C_Code = '''||P_Ac_Code_Dtl||'''
						And A_Cy    = '''||P_A_Cy||'''
						And Rownum<=1');

	 ElsIf	P_Ac_Dtl_Typ = 4 AND V_VNDR_LNK=2 Then -- VENDOR

		 V_Cnt := Ias_Gen_Pkg.Get_Cnt('Select 1
					       From Vendor_Curr
					      Where V_Code = '''||P_Ac_Code_Dtl||'''
						And A_Cy    = '''||P_A_Cy||'''
						And Rownum<=1');

	  ElsIf  P_Ac_Dtl_Typ IN(5,6) Then -- DEBIT AND CREDIT

	     V_Cnt := Ias_Gen_Pkg.Get_Cnt('Select 1
					       From GlS_V_ACCNT_DTL_CURR
					      Where AC_CODE_DTL = '''||P_Ac_Code_Dtl||'''
						AND AC_DTL_TYP = '''||P_Ac_Dtl_Typ||'''
						And CUR_CODE	= '''||P_A_Cy||'''
						And Rownum<=1');

	 End If;
	 If (P_Ac_Dtl_Typ = 3 AND V_CST_LNK<>2) or (P_Ac_Dtl_Typ = 4 AND V_VNDR_LNK<>2) then
	     V_Cnt:=1;
	 End if;
      End If;
 RETURN(V_Cnt);
Exception
    when others then
      RETURN(0);
END Chk_Ac_Dtl_Acy ;
--##----------------------------------------------------------------------------------------------------------------------------##--
FUNCTION Get_One_Acy_Ac_Dtl ( P_AC_Code_Dtl  IN IAS_POST_DTL.AC_CODE_DTL%TYPE
			     ,P_Ac_Dtl_Typ   IN ACCOUNT.AC_DTL_TYP%TYPE
			     ,P_Ac_CODE      IN ACCOUNT.A_CODE%TYPE
			     ,P_USR_NO	     IN USER_R.U_ID%TYPE
			     )	RETURN VARCHAR2 IS
  V_Acy  ACCOUNT_CURR.A_CY%TYPE;
BEGIN
  If P_AC_Code_Dtl Is Not Null And P_Ac_Dtl_Typ Is Not Null Then
    If P_Ac_Dtl_Typ IN(1,2) Then
       -----------------------------------------------
       V_Acy:=IAS_CshBnk_Pkg.Get_One_Acy_Cb (P_Cb_Type =>P_Ac_Dtl_Typ ,P_Cb_No =>P_AC_Code_Dtl,P_Usr_no =>P_USR_NO);
       -----------------------------------------------
    ElsIf P_Ac_Dtl_Typ=3 Then
       -----------------------------------------------
       V_Acy:=IAS_Cst_Pkg.Get_One_Acy_Cst (P_C_code =>P_AC_Code_Dtl,P_Usr_no  =>P_USR_NO) ;
       -----------------------------------------------
    --ElsIf P_Ac_Dtl_Typ=4 Then
       -----------------------------------------------
      -- V_Acy:=IAS_VNDR_Pkg.Get_One_Acy_Vnd (P_V_code =>P_AC_Code_Dtl,P_Usr_no  =>P_USR_NO) ;
       -----------------------------------------------
  /*  ElsIf P_Ac_Dtl_Typ IN(5,6) Then
       -----------------------------------------------
       V_Acy:=GLS_ACCNTDTL_Pkg.Get_One_Acy (P_Ac_Code_Dtl    =>P_AC_Code_Dtl
					   ,P_Ac_Dtl_Typ     =>P_Ac_Dtl_Typ
					   ,P_Ac_CODE	     =>P_AC_Code
					   ,P_Usr_no	     =>P_USR_NO);*/
       -----------------------------------------------
    End If;
  End If;
 RETURN(V_Acy);
Exception
    when others then
      RETURN(Null);
END Get_One_Acy_Ac_Dtl ;
--##----------------------------------------------------------------------------------------------------------------------------##--
FUNCTION Get_One_Acy_Ac_Dtl ( P_AC_Code_Dtl  IN ACCOUNT.A_CODE%TYPE,
			      P_Ac_Dtl_Typ   IN ACCOUNT.AC_DTL_TYP%TYPE)  RETURN VARCHAR2 IS
  V_Acy  ACCOUNT_CURR.A_CY%TYPE;
BEGIN
  If P_AC_Code_Dtl Is Not Null And P_Ac_Dtl_Typ Is Not Null Then
    If P_Ac_Dtl_Typ=1 Then
       -----------------------------------------------
       Select A_Cy InTo V_Acy From Ias_Cash_In_Hand_Dtl
	Where Cash_No = P_Ac_Code_Dtl;
       -----------------------------------------------
    ElsIf P_Ac_Dtl_Typ=2 Then
       -----------------------------------------------
       Select A_Cy InTo V_Acy From Ias_Cash_At_Bank_Dtl
	Where Bank_No = P_Ac_Code_Dtl;
       -----------------------------------------------
    ElsIf P_Ac_Dtl_Typ=3 Then
       -----------------------------------------------
       Select A_Cy InTo V_Acy From Customer_Curr
	Where C_Code = P_Ac_Code_Dtl;
       -----------------------------------------------
   /* ElsIf P_Ac_Dtl_Typ=4 Then
       -----------------------------------------------
       Select A_Cy InTo V_Acy From Vendor_Curr
	Where V_Code = P_Ac_Code_Dtl;
       -----------------------------------------------
    ElsIf P_Ac_Dtl_Typ IN(5,6) Then
       -----------------------------------------------
       Select CUR_CODE InTo V_Acy From GlS_ACCNT_DTL_CURR
	Where AC_CODE_DTL =P_Ac_Code_Dtl
	  AND AC_DTL_TYP  =P_AC_DTL_TYP; */
       -----------------------------------------------
    End If;
  End If;
 RETURN(V_Acy);
Exception
    when others then
      RETURN(Null);
END Get_One_Acy_Ac_Dtl ;
--##----------------------------------------------------------------------------------------------------------------------------##--
FUNCTION Get_Ac_Dtl_Acode ( P_AC_Code_Dtl  IN ACCOUNT.A_CODE%TYPE,
			    P_Ac_Dtl_Typ   IN ACCOUNT.AC_DTL_TYP%TYPE)	RETURN VARCHAR2 IS
  V_A_CODE  		ACCOUNT.A_CODE%TYPE;

BEGIN
  If P_AC_Code_Dtl Is Not Null And P_Ac_Dtl_Typ Is Not Null Then
    If P_Ac_Dtl_Typ=1 Then
       -----------------------------------------------
       Select A_CODE InTo V_A_CODE From Cash_In_Hand
	Where Cash_No = P_Ac_Code_Dtl;
       -----------------------------------------------
    ElsIf P_Ac_Dtl_Typ=2 Then
       -----------------------------------------------
       Select A_CODE InTo V_A_CODE From Cash_At_Bank
	Where Bank_No = P_Ac_Code_Dtl;
       -----------------------------------------------
    ElsIf P_Ac_Dtl_Typ=3 Then
       -----------------------------------------------
       Select C_A_CODE InTo V_A_CODE From Customer
	Where C_Code = P_Ac_Code_Dtl;
       -----------------------------------------------
    ElsIf P_Ac_Dtl_Typ=4 Then
       -----------------------------------------------
       Select V_A_CODE InTo V_A_CODE From V_details
	Where V_Code = P_Ac_Code_Dtl;
       -----------------------------------------------
    ElsIf P_Ac_Dtl_Typ IN(5,6) Then
       -----------------------------------------------
       Select AC_CODE InTo V_A_CODE From GlS_ACCNT_DTL
	Where AC_CODE_DTL =P_Ac_Code_Dtl
	  AND AC_DTL_TYP  =P_AC_DTL_TYP;
       -----------------------------------------------
    End If;
  End If;
 RETURN(V_A_CODE);
Exception
    when others then
      RETURN(Null);
END Get_Ac_Dtl_Acode ;
--##----------------------------------------------------------------------------------------------------------------------------##--
FUNCTION Chk_Inactv_Acy ( P_AC_Code_Dtl  IN ACCOUNT.A_CODE%TYPE,
			  P_Ac_Dtl_Typ	 IN ACCOUNT.AC_DTL_TYP%TYPE,
			  P_A_Cy	 IN ACCOUNT_CURR.A_Cy%TYPE)  RETURN NUMBER IS
     V_Cnt	  Number:=0;
     V_CST_LNK	  Number:=0;
     V_VNDR_LNK    Number:=0;
    BEGIN
      V_CST_LNK  :=Nvl(IAS_GEN_PKG.GET_FLD_VALUE('IAS_PARA_AR','NVL(AR_AC_LINK_TYPE,0)'),0);
      V_VNDR_LNK :=Nvl(IAS_GEN_PKG.GET_FLD_VALUE('IAS_PARA_AP','NVL(AP_AC_LINK_TYPE,0)'),0);
      IF P_Ac_Code_Dtl Is Not Null and NVL(P_Ac_Dtl_Typ,0) <> 0 And P_A_Cy Is Not Null Then
	 If  P_Ac_Dtl_Typ = 1 Then -- cash
	     V_Cnt := Ias_Gen_Pkg.Get_Cnt('Select 1
					   From Ias_Cash_In_Hand_Dtl
					  Where Cash_No = '''||P_Ac_Code_Dtl||'''
					    And A_Cy	= '''||P_A_Cy||'''
					    And Nvl(Inactive,0)=1
					    And Rownum<=1');

	 ElsIf	P_Ac_Dtl_Typ = 2 Then -- Bank
	     V_Cnt := Ias_Gen_Pkg.Get_Cnt('Select 1
					       From Ias_Cash_At_Bank_Dtl
					      Where Bank_No = '''||P_Ac_Code_Dtl||'''
						And A_Cy    = '''||P_A_Cy||'''
						And Nvl(Inactive,0)=1
						And Rownum<=1');
	 ElsIf	P_Ac_Dtl_Typ = 3 AND V_CST_LNK=2 Then -- CUSTOMER
	     V_Cnt := Ias_Gen_Pkg.Get_Cnt('Select 1
					       From Customer_Curr
					      Where C_Code = '''||P_Ac_Code_Dtl||'''
						And A_Cy    = '''||P_A_Cy||'''
						And Nvl(Inactive,0)=1
						And Rownum<=1');
	 ElsIf	P_Ac_Dtl_Typ = 4 AND V_VNDR_LNK=2  Then -- VENDOR
		 V_Cnt := Ias_Gen_Pkg.Get_Cnt('Select 1
					       From Vendor_Curr
					      Where V_Code = '''||P_Ac_Code_Dtl||'''
						And A_Cy    = '''||P_A_Cy||'''
						And Nvl(Inactive,0)=1
						And Rownum<=1');
	 ElsIf	P_Ac_Dtl_Typ IN(5,6) Then -- VENDOR
		 V_Cnt := Ias_Gen_Pkg.Get_Cnt('Select 1
					       From AC_CODE_DTL_CURR
					      Where AC_CODE_DTL = '''||P_Ac_Code_Dtl||'''
						AND AC_DTL_TYP	='''||P_AC_DTL_TYP||''';
						And CUR_COE    = '''||P_A_Cy||'''
						And Nvl(Inactive,0)=1
						And Rownum<=1');
	 End If;
      End If;
 RETURN(V_Cnt);
Exception
    when others then
      RETURN(0);
END Chk_Inactv_Acy ;
---------------------------------------------------
PROCEDURE SHW_AC_CODE_DTL_PRC(P_CV	    IN OUT T_CV,
			     P_WHR	    IN VARCHAR2 	default null,
			     P_AC_DTL_TYP   IN NUMBER		default 0,
			     P_AC_CODE	    IN ACCOUNT.A_CODE%TYPE	  default null,
			     P_F_Ac_Code_Dtl  IN VARCHAR2		    default null,
			     P_T_Ac_Code_Dtl  IN VARCHAR2		    default null,
			     P_CUR_CODE     IN ACCOUNT_CURR.A_CY %TYPE	  default null,
			     P_LANG_NO	    IN NUMBER	  ,
			     P_ORDR_BY	    IN VARCHAR2,
			     P_USER_NO	    IN NUMBER		) IS

	V_ac_nm 	ACCOUNT.A_NAME%TYPE;
	V_Ac_Dtl_Typ ACCOUNT.Ac_Dtl_Typ%TYPE;
	V_LNG_NO     LANG_DEF.LANG_NO%TYPE := P_LANG_NO ;
BEGIN
    IF P_Ac_Dtl_Typ IS NULL and P_AC_CODE IS NOT NULL THEN
       V_Ac_Dtl_Typ:= Ys_Ac_Dtl_Pkg.Get_Ac_Dtl_Typ (P_A_CODE=>P_AC_CODE);
    ELSE
       V_Ac_Dtl_Typ:=P_Ac_Dtl_Typ;
    END IF;
    --IF P_Ac_Code_Dtl Is Not Null and NVL(V_Ac_Dtl_Typ,0) <> 0 Then
    IF NVL(V_Ac_Dtl_Typ,0) <> 0 Then

	If  V_Ac_Dtl_Typ = 1 Then -- cash
	    OPEN P_CV FOR
		 'SELECT    M.A_CODE AC_CODE
			   ,M.CASH_NO AC_CODE_DTL
			   ,NULL      AC_CODE_DTL_SUB
			   ,DECODE(:P_LANG_NO, 1, M.CASH_NAME, M.CASH_E_NAME) AC_CODE_DTL_NM
			   ,D.A_CY CUR_CODE
		  FROM CASH_IN_HAND M
		    , IAS_CASH_IN_HAND_DTL D
		 WHERE M.A_CODE     = D.A_CODE
		   AND M.CASH_NO    = D.CASH_NO
		   AND M.A_CODE     = NVL(:P_AC_CODE	,M.A_CODE)
		   AND M.CASH_NO    BETWEEN NVL(:P_F_Ac_Code_Dtl,M.CASH_NO) AND NVL(:P_T_Ac_Code_Dtl,M.CASH_NO)
		   AND D.A_CY	 = NVL(:P_CUR_CODE   , D.A_CY)'
		   USING
			P_LANG_NO,
			P_AC_CODE,
			P_F_Ac_Code_Dtl,
			P_T_Ac_Code_Dtl,
			P_CUR_CODE;
	ElsIf  V_Ac_Dtl_Typ = 2 Then -- Bank
	    OPEN P_CV FOR
		 'Select M.A_CODE   AC_CODE
		       ,M.BANK_NO   AC_CODE_DTL
		       ,NULL	    AC_CODE_DTL_SUB
		       ,DECODE(:P_LANG_NO,1,BANK_NAME,BANK_E_NAME) AC_CODE_DTL_NM
		       ,D.A_CY CUR_CODE
		   From CASH_AT_BANK	M
		       ,IAS_CASH_AT_BANK_DTL D
		  where M.A_CODE     = D.A_CODE
		    AND M.BANK_NO    = D.BANK_NO
		    AND M.A_CODE     = NVL(:P_AC_CODE,M.A_CODE)
		    AND M.BANK_NO    BETWEEN NVL(:P_F_Ac_Code_Dtl,M.BANK_NO) AND NVL(:P_T_Ac_Code_Dtl,M.BANK_NO)
		    AND D.A_CY	     = NVL(:P_CUR_CODE, D.A_CY) '|| P_WHR || P_ORDR_BY
		    USING
			P_LANG_NO,
			P_AC_CODE,
			P_F_Ac_Code_Dtl,
			P_T_Ac_Code_Dtl,
			P_CUR_CODE;

	ElsIf  V_Ac_Dtl_Typ = 3 Then -- CUSTOMER
	    OPEN P_CV FOR
		 'Select    M.C_A_CODE	 AC_CODE
			   ,M.C_CODE	 AC_CODE_DTL
			   ,NULL	 AC_CODE_DTL_SUB
			   ,DECODE(:P_LANG_NO,1,C_A_NAME,NVL(C_E_NAME,C_A_NAME)) AC_CODE_DTL_NM
			   ,D.A_CY CUR_CODE
		   From CUSTOMER    M
		       ,Customer_Curr D
		  where M.C_CODE    = D.C_CODE
		    AND M.C_A_CODE  = NVL(:P_AC_CODE,M.C_A_CODE)
		    AND M.C_CODE    BETWEEN NVL(:P_F_Ac_Code_Dtl,M.C_CODE) AND NVL(:P_T_Ac_Code_Dtl,M.C_CODE)
		    AND D.A_CY	    = NVL(:P_CUR_CODE, D.A_CY)
		    AND NVL(CONN_HPS_SYS,0)=0	 '|| P_WHR || '
	       UNION ALL
		  Select    Ias_Cst_Pkg.Get_Acode(B.AC_CODE_DTL)   AC_CODE
			   ,M.C_CODE		    AC_CODE_DTL
			   ,B.AC_CODE_DTL_SUB	    AC_CODE_DTL_SUB
			   ,DECODE(:P_LANG_NO,1,AC_CODE_DTL_SUB_L_NM,NVL(AC_CODE_DTL_SUB_F_NM,AC_CODE_DTL_SUB_L_NM)) AC_CODE_DTL_NM
			   ,D.A_CY CUR_CODE
		   From CUSTOMER    M
		       ,Customer_Curr D
		       ,GLS_V_AC_CODE_DTL_SUB  B
		  where M.C_CODE    = D.C_CODE
		    AND M.C_CODE    = B.AC_CODE_DTL
		    AND M.C_A_CODE  = NVL(:P_AC_CODE,M.C_A_CODE)
		    AND M.C_CODE    BETWEEN NVL(:P_F_Ac_Code_Dtl,M.C_CODE) AND NVL(:P_T_Ac_Code_Dtl,M.C_CODE)
		    AND D.A_CY	    = NVL(:P_CUR_CODE, D.A_CY)
		    AND NVL(CONN_HPS_SYS,0)=1	 '|| P_WHR || P_ORDR_BY
		    USING
			P_LANG_NO,
			P_AC_CODE,
			P_F_Ac_Code_Dtl,
			P_T_Ac_Code_Dtl,
			P_CUR_CODE,
			P_LANG_NO,
			P_AC_CODE,
			P_F_Ac_Code_Dtl,
			P_T_Ac_Code_Dtl,
			P_CUR_CODE;
	 ElsIf	V_Ac_Dtl_Typ = 4 Then -- VENDOR
	    OPEN P_CV FOR
		 'Select    M.V_A_CODE	AC_CODE
			   ,M.V_CODE	AC_CODE_DTL
			   ,NULL	AC_CODE_DTL_SUB
			   ,DECODE(:P_LANG_NO,1,V_A_NAME,NVL(V_E_NAME,V_A_NAME)) AC_CODE_DTL_NM
			   ,D.A_CY	CUR_CODE
		   From V_DETAILS   M
		       ,Vendor_Curr D
		  where M.V_CODE    = D.V_CODE
		    AND M.V_A_CODE  = NVL(:P_AC_CODE,M.V_A_CODE)
		    AND M.V_CODE    BETWEEN NVL(:P_F_Ac_Code_Dtl,M.V_CODE) AND NVL(:P_T_Ac_Code_Dtl,M.V_CODE)
		    AND D.A_CY	    = NVL(:P_CUR_CODE, D.A_CY	 ) '|| P_WHR || P_ORDR_BY
		    USING
			P_LANG_NO,
			P_AC_CODE,
			P_F_Ac_Code_Dtl,
			P_T_Ac_Code_Dtl,
			P_CUR_CODE  ;
	 ElsIf	V_Ac_Dtl_Typ in (5,6) Then -- Debit and Credit
	    OPEN P_CV FOR
		 'Select    M.AC_CODE	    AC_CODE
			   ,M.Ac_Code_Dtl   AC_CODE_DTL
			   ,NULL	    AC_CODE_DTL_SUB
			   ,DECODE(:P_LANG_NO,1,Ac_Code_Dtl_L_Nm,NVL(Ac_Code_Dtl_F_Nm,Ac_Code_Dtl_L_Nm)) AC_CODE_DTL_NM
			   ,D.CUR_CODE CUR_CODE
		   From GlS_V_ACCNT_DTL    M
		       ,GlS_V_ACCNT_DTL_CURR D
		  where M.AC_Code	= D.AC_Code
		    AND M.Ac_Code_Dtl	= D.Ac_Code_Dtl
		    AND M.AC_DTL_TYP	= D.Ac_Dtl_Typ
		    AND M.AC_DTL_TYP	= :V_Ac_Dtl_Typ
		    AND M.AC_Code	= NVL(:P_AC_CODE,M.AC_Code)
		    AND M.Ac_Code_Dtl	 BETWEEN NVL(:P_F_Ac_Code_Dtl,M.Ac_Code_Dtl) AND NVL(:P_T_Ac_Code_Dtl,M.Ac_Code_Dtl)
		    AND D.CUR_CODE	= NVL(:P_CUR_CODE, D.CUR_CODE	) '|| P_WHR || P_ORDR_BY
		    USING
			P_LANG_NO,
			V_Ac_Dtl_Typ,
			P_AC_CODE,
			P_F_Ac_Code_Dtl,
			P_T_Ac_Code_Dtl,
			P_CUR_CODE;
	ElsIf  V_Ac_Dtl_Typ = 7 Then -- Employee
	    OPEN P_CV FOR
		 'Select    :P_AC_CODE	AC_CODE
			   ,M.EMP_NO   AC_CODE_DTL
			   ,NULL       AC_CODE_DTL_SUB
			   ,DECODE(:P_LANG_NO,1,EMP_L_NM,EMP_F_NM) AC_CODE_DTL_NM
			   ,CUR_CODE CUR_CODE
		   From S_EMP	 M
		  where M.AC_Code  = NVL(:P_AC_CODE,M.AC_Code)
		    AND M.EMP_NO    BETWEEN NVL(:P_F_Ac_Code_Dtl,M.EMP_NO) AND NVL(:P_T_Ac_Code_Dtl,M.EMP_NO)
		    AND M.CUR_CODE = NVL(:P_CUR_CODE, M.CUR_CODE   )'|| P_WHR || P_ORDR_BY
		    USING
			P_AC_CODE,
			P_LANG_NO,
			P_AC_CODE,
			P_F_Ac_Code_Dtl,
			P_T_Ac_Code_Dtl,
			P_CUR_CODE;
	    END IF;
    end if;
  EXCEPTION
    WHEN OTHERS THEN
	   RAISE_APPLICATION_ERROR(-20417,'Error When Query From AC_CODE_DTL PRC '||SQLERRM) ;
END SHW_AC_CODE_DTL_PRC;
--##----------------------------------------------------------------------------------------------------------------------------##--
END Ys_Ac_Dtl_Pkg;
/
