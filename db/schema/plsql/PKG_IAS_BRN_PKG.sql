-- =============================================
-- PACKAGE SPEC: IAS_BRN_PKG  (status: INVALID)
-- =============================================
CREATE OR REPLACE
PACKAGE IAS_Brn_Pkg as
    FUNCTION	Get_Br_Nm	 ( G_BRN_NO    In S_BRN.BRN_NO%TYPE    ,   P_Lng_no In Number) Return VARCHAR2;
    FUNCTION	Get_Br_Cmp	 ( G_BRN_NO    In S_BRN.BRN_NO%TYPE    )   Return      Number;
    PROCEDURE	Get_Brn_Cmp_Ser  ( G_BRN_NO    In S_BRN.BRN_NO%TYPE    ,   P_CMP_NO In Out S_BRN.Cmp_NO%TYPE) ;
    FUNCTION	Chk_Usr_Brn_Prv  ( P_UserNo    In Number	       ,   G_BRN_NO    In Number,P_Priv_Type In Varchar2)  RETURN NUMBER ;
    FUNCTION	Chk_Brn_Cmp_Ser  ( G_BRN_NO    In S_BRN.BRN_NO%TYPE    ,   P_CMP_NO In S_BRN.Cmp_NO%TYPE) Return NUMBER;
    FUNCTION	Get_Br_Inf	 ( G_BRN_NO    In S_BRN.BRN_NO%TYPE    ,   P_Inf_Type  In Varchar2)   Return   VARCHAR2;
    FUNCTION	Get_Brn_Usr_Con  ( P_UserNo    In USER_R.U_ID%TYPE     )   Return      NUMBER ;
    FUNCTION	Get_Cst_Brn_Conn ( P_C_Code In CUSTOMER.C_CODE%TYPE ) Return NUMBER ;
    FUNCTION	Get_Cmp_Nm	(    P_CMP_NO	 In S_CMPNY.CMP_NO%TYPE    ,   P_Lng_no In Number) Return VARCHAR2 ;

    FUNCTION	GET_BRN_SRL  ( P_BRN_NO IN S_BRN.BRN_NO%TYPE) RETURN NUMBER ;
    FUNCTION IS_BRN_USE_E_INVC	( P_BRN_NO IN S_BRN.BRN_NO%TYPE) RETURN NUMBER ;
    FUNCTION GET_MAIN_CMP(P_CMP_NO IN NUMBER) RETURN NUMBER;

    FUNCTION GET_BRN_MAIN_CMP(P_BRN_NO IN S_BRN.BRN_NO%TYPE) RETURN NUMBER;
    FUNCTION GET_BRN_CNTRY(P_BRN_NO IN S_BRN.BRN_NO%TYPE)
	RETURN VARCHAR2;
    FUNCTION GET_BRN_CNTRY_CODE(P_BRN_NO IN S_BRN.BRN_NO%TYPE)
	RETURN VARCHAR2;

End IAS_Brn_Pkg;
/

-- ---------------------------------------------
-- PACKAGE BODY: IAS_BRN_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE Body IAS_Brn_Pkg as

--================================================================
    FUNCTION	Get_Br_Nm      (    G_BRN_NO	In S_BRN.BRN_NO%TYPE	,   P_Lng_no In Number) Return VARCHAR2 Is
    v_name varchar2(60);
Begin
    Select Decode(P_Lng_no,1,Brn_Lname,nvl(Brn_Fname,Brn_Lname))
	Into v_name
	From S_Brn
	where Brn_No = G_BRN_NO and RowNum<=1;
    Return(v_name);
Exception when others then
    Return(Null);
End Get_Br_Nm ;
--================================================================
    FUNCTION	Get_Br_Cmp     (   G_BRN_NO    In S_BRN.BRN_NO%TYPE    )   Return      NUMBER Is
    v_cmp Number;
Begin
    Select Cmp_No
	Into v_cmp
	From S_Brn
	where Brn_No = G_BRN_NO and RowNum<=1;
    Return(v_cmp);
Exception When others then
    Return(Null);
End Get_Br_Cmp ;
--================================================================
    PROCEDURE	Get_Brn_Cmp_Ser(    G_BRN_NO	In S_BRN.BRN_NO%TYPE	,   P_CMP_NO In Out S_BRN.Cmp_NO%TYPE) Is
    v_Cmp   Number;
Begin
    Select     Cmp_No
	Into	v_Cmp
	From	S_Brn
	where	Brn_No	=   G_BRN_NO
	and RowNum<=1;

    If v_Cmp Is Not Null Then
	P_Cmp_No   :=  V_Cmp   ;
    End If;

Exception When others then
    P_Cmp_No	:=Null;
End Get_Brn_Cmp_Ser ;
--================================================================
    FUNCTION	Chk_Usr_Brn_Prv(   P_UserNo    In Number	       ,   G_BRN_NO    In Number,P_Priv_Type In Varchar2)  RETURN NUMBER Is
    v_Flg Number:=0;
BEGIN
    If Upper(P_Priv_Type) Is Not Null Then
	Select Decode(Upper(P_Priv_Type),'ADD',nvl(Add_Flag,0),nvl(View_Flag,0))
		Into v_Flg
	    From S_BRN_USR_PRIV
	    Where U_Id	 = P_UserNo and Brn_No = G_BRN_NO  and Rownum <=1 ;
    End If;
    Return(v_Flg);
Exception When others then
    Return (0);
End Chk_Usr_Brn_Prv;
--===============================================================
    FUNCTION	Chk_Brn_Cmp_Ser(   G_BRN_NO    In S_BRN.BRN_NO%TYPE,   P_CMP_NO In S_BRN.Cmp_NO%TYPE) RETURN NUMBER Is
    cnt   Number;
Begin
    If G_BRN_NO Is Not Null And P_Cmp_No Is Not Null Then
	Begin
	    Select	1
		Into	Cnt
		From	S_Brn
		where	Brn_No	=   G_BRN_NO
		And	Cmp_No	=   P_CMP_NO
		and RowNum<=1;
	Exception When Others Then
	    Cnt:=0;
	End;
    Else
	Cnt:=0;
    End If;
    Return(Cnt);

Exception When others then
    Return (0);
End Chk_Brn_Cmp_Ser ;
--================================================================
    FUNCTION	Get_Br_Inf     (    G_BRN_NO	In S_BRN.BRN_NO%TYPE	,   P_Inf_Type	In Varchar2)   Return	VARCHAR2 Is
    v_Inf VARCHAR2(50);
Begin
    If P_Inf_Type Is Not Null Then
	Begin
	Execute Immediate
	'Select '||P_Inf_Type||'
		From S_Brn
		where Brn_No = '||G_BRN_NO||' and RowNum<=1 '
	    Into v_Inf ;
	Exception When others then
	    v_Inf:=Null;
	End;
    Else
	V_Inf:=Null;
    End If;
    Return(v_Inf);
Exception When others then
    Return(Null);
End Get_Br_Inf ;
--===============================================================
    FUNCTION	Get_Brn_Usr_Con( P_UserNo    In USER_R.U_ID%TYPE  )   Return	  NUMBER Is
    v_Brn Number;
Begin
    Select Conn_Brn_No
	Into v_Brn
	From User_R
	where U_Id = P_UserNo and RowNum<=1;
    Return(v_Brn);
Exception When others then
    Return(Null);
End Get_Brn_Usr_Con ;
--===============================================================
FUNCTION    Get_Cst_Brn_Conn( P_C_Code In CUSTOMER.C_CODE%TYPE ) Return NUMBER Is
    v_Brn Number;
Begin
	Select Conn_Brn_No
    Into v_Brn
    From Customer
    where C_code = P_C_Code and RowNum<=1;
    Return(v_Brn);
Exception When others then
    Return(Null);
End Get_Cst_Brn_Conn ;
--===============================================================
FUNCTION    Get_Cmp_Nm	    (	 P_CMP_NO    In S_CMPNY.CMP_NO%TYPE    ,   P_Lng_no In Number) Return VARCHAR2 Is
    v_nm varchar2(100);
Begin
    Select Decode(P_Lng_no,1,CMP_LNAME,nvl(CMP_FNAME,CMP_LNAME))
	Into v_nm
	From S_CMPNY
	where CMP_NO = P_CMP_NO and RowNum<=1;
    Return(v_nm);
Exception when others then
    Return(Null);
End Get_Cmp_Nm ;
--===============================================================
Function Get_Brn_Srl  ( P_Brn_No In S_Brn.Brn_No%Type) Return Number Is
  V_Brn_Srl Number;
 Begin
	
	 Select Nvl(Brn_Srl,0)
	   Into V_Brn_Srl
	   From S_Brn
	  Where Brn_No = P_Brn_No
	    And Rownum<=1;
	
	 Return(V_Brn_Srl);
	
 Exception
	When Others Then
	  Return(0);
End Get_Brn_Srl ;
--===============================================================
Function Is_Brn_USE_E_Invc  ( P_Brn_No In S_Brn.Brn_No%Type) Return Number Is
  V_Use_E_Invc Number := 0 ;
 Begin
	
	 Select Nvl(Use_E_Invoice,0)
	   Into V_Use_E_Invc
	   From S_Brn
	  Where Brn_No = P_Brn_No
	    And Rownum<=1;
	
	 Return(V_Use_E_Invc);
	
 Exception
	When Others Then
	  Return(0);
End Is_Brn_USE_E_Invc ;
--===============================================================
 FUNCTION GET_MAIN_CMP(P_CMP_NO IN NUMBER)
	RETURN NUMBER
 IS
	V_CMP_NO   NUMBER;
 BEGIN
	IF P_CMP_NO IS NOT NULL THEN

	    SELECT MAIN_CMP_NO
	      INTO V_CMP_NO
	      FROM S_CMPNY
	     WHERE CMP_NO = P_CMP_NO;

	END IF;
	IF V_CMP_NO IS NULL THEN
	    RETURN (P_CMP_NO);
	ELSE
	    RETURN (V_CMP_NO);
	END IF;
    EXCEPTION
	WHEN OTHERS THEN
	    RETURN (NULL);
  END GET_MAIN_CMP;
--===============================================================
   FUNCTION GET_BRN_MAIN_CMP(P_BRN_NO IN S_BRN.BRN_NO%TYPE)
	RETURN NUMBER
   IS
	V_MAIN_CMP   NUMBER;
	V_BRN_CMP    NUMBER;
   BEGIN
	IF P_BRN_NO IS NOT NULL THEN
	    SELECT CMP_NO
	      INTO V_BRN_CMP
	      FROM S_BRN
	     WHERE BRN_NO = P_BRN_NO;

	    V_MAIN_CMP := GET_MAIN_CMP(P_CMP_NO => V_BRN_CMP);
	END IF;
	IF V_MAIN_CMP IS NULL THEN
	    RETURN (V_BRN_CMP);
	ELSE
	    RETURN (V_MAIN_CMP);
	END IF;
    EXCEPTION
	WHEN OTHERS THEN
	    RETURN (NULL);
    END GET_BRN_MAIN_CMP;
--===============================================================
FUNCTION GET_BRN_CNTRY(P_BRN_NO IN S_BRN.BRN_NO%TYPE)
	RETURN VARCHAR2 IS
   V_CNTRY NUMBER;
   V_CNTRY_CODE VARCHAR2(200);
 BEGIN
      IF P_BRN_NO IS NOT NULL THEN
	SELECT CNTRY_NO
	INTO V_CNTRY
	FROM S_BRN
	WHERE BRN_NO = P_BRN_NO;
    ------------------------------------------
	SELECT CNTRY_SHRT
	INTO V_CNTRY_CODE
	FROM CNTRY
	WHERE CNTRY_NO = V_CNTRY;

       RETURN (V_CNTRY_CODE);
    END IF;
  EXCEPTION WHEN OTHERS THEN
	      RETURN (NULL);
 END  GET_BRN_CNTRY;
--===============================================================
 FUNCTION GET_BRN_CNTRY_CODE(P_BRN_NO IN S_BRN.BRN_NO%TYPE)
	RETURN VARCHAR2 IS
   V_CNTRY NUMBER;
   V_CNTRY_CODE VARCHAR2(200);
 BEGIN
     IF P_BRN_NO IS NOT NULL THEN
	SELECT CNTRY_NO
	INTO V_CNTRY
	FROM S_BRN
	WHERE BRN_NO = P_BRN_NO;
    ------------------------------------------
	SELECT CNTRY_SHRT
	INTO V_CNTRY_CODE
	FROM CNTRY
	WHERE CNTRY_NO = V_CNTRY;

       RETURN (V_CNTRY_CODE);
    END IF;
   EXCEPTION WHEN OTHERS THEN
	      RETURN (NULL);
 END   GET_BRN_CNTRY_CODE;
 --===============================================================
End IAS_Brn_Pkg;
/
