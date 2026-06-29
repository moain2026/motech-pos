-- =============================================
-- PACKAGE SPEC: IAS_ACODE_PKG  (status: INVALID)
-- =============================================
CREATE OR REPLACE
PACKAGE IAS_Acode_Pkg as
 FUNCTION Get_A_Name(P_a_code In ACCOUNT.A_CODE%TYPE,P_Lng_no In Number) RETURN VARCHAR2;
 FUNCTION Get_Ac_code_By_Nm (P_a_nm In ACCOUNT.A_NAME%TYPE) RETURN VARCHAR2 ;
 FUNCTION Get_Cnt_Acy (P_a_code In ACCOUNT.A_CODE%TYPE,P_Usr_No   In Number) RETURN NUMBER;
 FUNCTION Check_Acy (P_a_code In ACCOUNT.A_CODE%TYPE,P_a_cy   In VARCHAR2) RETURN NUMBER;
 FUNCTION Get_Ac_Type (P_a_code In ACCOUNT.A_CODE%TYPE,P_Type In VARCHAR2 Default Null) RETURN NUMBER;
 FUNCTION Get_A_S_M (P_A_S_M In ACCOUNT.A_S_M%TYPE) RETURN Number;
 FUNCTION Get_AC_PARENT(P_a_code In ACCOUNT.A_CODE%TYPE, P_G_PARENT NUMBER DEFAULT 0) RETURN VARCHAR2;
 FUNCTION Get_AC_Analysis(P_a_code In ACCOUNT.A_CODE%TYPE) RETURN NUMBER;
 FUNCTION Get_Ac_Dtl_Typ (P_A_Code In ACCOUNT.A_CODE%TYPE) RETURN NUMBER ;
 FUNCTION Get_Ac_Dtl_Nm(P_AC_Code_Dtl	In ACCOUNT.A_CODE%TYPE DEFAULT NULL ,
			P_AC_CODE	In ACCOUNT.A_CODE%TYPE	,
			P_Ac_Dtl_Typ	In ACCOUNT.AC_DTL_TYP%TYPE  DEFAULT 0,
			P_Lng_No	In LANG_DEF.LANG_NO%TYPE DEFAULT 1,
			P_get_nm_only	In NUMBER DEFAULT 1)  RETURN VARCHAR2;
End IAS_Acode_Pkg;
/

-- ---------------------------------------------
-- PACKAGE BODY: IAS_ACODE_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE BODY IAS_Acode_Pkg as
--================================================================
FUNCTION Get_A_Name (P_a_code In ACCOUNT.A_CODE%TYPE,P_Lng_no In Number) RETURN VARCHAR2 Is
  v_name varchar2(60);
 Begin
     select Decode(P_Lng_no,1,a_name,nvl(a_name_Eng,a_name))
       Into v_name
       From account
      where a_code=P_a_code ;

     RETURN(v_name);
 Exception
    when others then
      RETURN(Null);
End Get_A_Name ;
--================================================================
FUNCTION Get_Ac_code_By_Nm (P_a_nm In ACCOUNT.A_NAME%TYPE) RETURN VARCHAR2 Is
  v_code varchar2(30);
 Begin
     select A_code
       Into v_code
       From ACCOUNT
      where (a_name = P_a_nm or a_name_eng =P_a_nm )
	and Rownum<=1;

     RETURN(v_code);

 Exception
    when others then
      RETURN(Null);
End Get_Ac_code_By_Nm;
--================================================================--================================================================
FUNCTION Get_Cnt_Acy (P_a_code In ACCOUNT.A_CODE%TYPE,P_Usr_no In Number) RETURN Number Is

  cnt	Number;
Begin
    Begin
	Select count(*)
	    Into Cnt
	    From Account_Curr
	    Where A_code =P_A_Code ;
    Exception When Others Then
	Cnt := 0;
    End;

    RETURN(Cnt);

 Exception
    When others then
      RETURN(Null);
End Get_Cnt_Acy ;
--================================================================
FUNCTION Get_Ac_Type (P_a_code In ACCOUNT.A_CODE%TYPE,P_Type In VARCHAR2 Default Null) RETURN Number Is
cnt Number;
--  RETURN   1 - Cash  2 - Bank  3 - Inv Acc Code 4 - Cost acc Code
Begin
If Nvl(P_Type,'CSH')='CSH' Then
	     Begin
		  Select 1
		   Into cnt
		 From cash_in_hand
	       Where a_code=P_a_code
		 And RowNum<=1;
	    Exception
		When others then
	  Begin
			 Select 2
			   Into cnt
			 From cash_at_bank
		       Where a_code=P_a_code
			 And RowNum<=1;
		    Exception
			When others then
		      Cnt :=0;
		     End;
	     End;
End If;
    RETURN(cnt);

    Exception
	when others then
	  RETURN(0);
End Get_Ac_Type ;
--===============================================================
FUNCTION Check_Acy (P_a_code In ACCOUNT.A_CODE%TYPE,P_a_cy   In VARCHAR2) RETURN Number Is
cnt Number;
 Begin
     Select 1
       Into cnt
       From account_curr
      where a_code=P_a_code
	and a_cy  =P_a_cy
	and RowNum<=1;

     RETURN(cnt);

 Exception
    when others then
      RETURN(0);
End Check_Acy ;
--===============================================================
FUNCTION Get_A_S_M (P_a_S_M In ACCOUNT.A_S_m%TYPE) RETURN Number Is
cnt Number;
 Begin
     Select Decode(Count(Distinct A_LEVEL),1,0,Min(a_Level))
       Into cnt
       From account
      where a_s_m=P_a_s_m;

     RETURN(cnt);

 Exception
    when others then
      RETURN(null);
End Get_A_S_M ;
--===============================================================
FUNCTION GET_AC_PARENT(P_a_code In ACCOUNT.A_CODE%TYPE, P_G_PARENT NUMBER DEFAULT 0) RETURN VARCHAR2 IS
V_Parnt_code Varchar2(30);

Begin
If  P_G_PARENT = 1 Then --  Get Garent Parent

    Declare
    Cursor Ac_cv Is Select a_code  From  Account
		    Start with	A_code= P_a_code
		    Connect by	A_code = Prior	A_PARENT  Order by Level;

     Begin
	For i in Ac_cv Loop
	 V_Parnt_code:=i.A_code ;
	End loop;

	Exception
	 When Others Then
	  V_Parnt_code:=NULL;
     End;

Else -- Get Parent Account

  Select A_Parent
    Into V_Parnt_code
    From Account
   Where A_code=P_a_code ;


End If;

RETURN(V_Parnt_code);

 Exception
   When Others Then
    RETURN(NULL);
End  GET_AC_PARENT;
--===============================================================
FUNCTION Get_AC_Analysis(P_a_code In ACCOUNT.A_CODE%TYPE) RETURN NUMBER Is

v_a_analysis Number;

 Begin
     Select A_ANALYSIS
       Into v_a_analysis
       From account
      where a_code=P_a_code
	and RowNum<=1;

     RETURN(v_a_analysis);

 Exception
    when others then
      RETURN(Null);
End Get_AC_Analysis ;

--===============================================================
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
--===============================================================
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
   V_Ac_Dtl_Typ:= Get_Ac_Dtl_Typ (P_A_CODE=>P_AC_CODE);
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
   /*  ElsIf  V_Ac_Dtl_Typ = 4 Then -- VENDOR
	 Select DECODE(V_LNG_NO,1,V_A_NAME,NVL(V_E_NAME,V_A_NAME)) V_NM
	   Into V_Cntrl_Nm
	   From V_DETAILS
	  where V_CODE = P_Ac_Code_Dtl
	    and RowNum<=1;
     ElsIf  V_Ac_Dtl_Typ in (5,6) Then -- Debit and Credit
	 Select DECODE(V_LNG_NO,1,Ac_Code_Dtl_L_Nm,NVL(Ac_Code_Dtl_F_Nm,Ac_Code_Dtl_L_Nm)) V_NM
	   Into V_Cntrl_Nm
	   From GlS_V_ACCNT_DTL
	  where Ac_Code_Dtl  = P_Ac_Code_Dtl
	    AND AC_DTL_TYP=V_Ac_Dtl_Typ
	    AND AC_Code =  P_Ac_Code
	    and RowNum<=1;*/
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
--===============================================================
End IAS_Acode_Pkg;
/
