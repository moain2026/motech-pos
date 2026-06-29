-- =============================================
-- PACKAGE SPEC: IAS_CST_PKG  (status: INVALID)
-- =============================================
CREATE OR REPLACE
PACKAGE IAS_Cst_Pkg as
 V_Lang_No   				 Pls_Integer;
 V_User_No   				 Pls_Integer;
 --======================================================================
 PROCEDURE Get_Para (P_Lang_no In Pls_Integer Default 1,P_User_No In Pls_Integer);
 FUNCTION Get_Cnt_Acy (P_c_code In CUSTOMER.C_CODE%TYPE,P_Usr_No   In Number) return Number;
 FUNCTION Get_One_Acy_Cst (P_c_code In CUSTOMER.C_CODE%TYPE,P_Usr_no In Number) Return VARCHAR2;
 FUNCTION Get_Acode  (P_c_code In CUSTOMER.C_CODE%TYPE) Return VARCHAR2;
 FUNCTION Get_c_code (P_a_code In ACCOUNT.A_CODE%TYPE) Return VARCHAR2;
 FUNCTION Get_C_Name(P_c_code In CUSTOMER.C_CODE%TYPE,P_Lng_no In Number) Return VARCHAR2;
 FUNCTION Get_C_PHON_NO(P_c_code In CUSTOMER.C_CODE%TYPE,P_Lng_no In Number) Return VARCHAR2;
 FUNCTION Get_c_code_By_Nm (P_c_nm In CUSTOMER.C_A_NAME%TYPE) RETURN VARCHAR2;
 FUNCTION Check_Acy (P_c_code In CUSTOMER.C_CODE%TYPE,P_a_cy   In VARCHAR2) Return Number;
 PROCEDURE Get_Credit_Lmt ( p_cr_lmt_typ   IN	    NUMBER,
			    P_c_code	 In  CUSTOMER.C_CODE%TYPE ,
 												    P_cc_code	 In  COST_CENTERS.CC_CODE%TYPE	 Default Null,			
 												    P_User_No	 In  Number,
 												    P_acy 		   In  Varchar2,
													  P_local_cur  In  Varchar2,
													  P_frc_no     In  Number   Default 2,
													  p_crlmt      OUT	NUMBER,
											      p_invlmt	   OUT	    NUMBER,
											      p_cstlmttyp  OUT	    NUMBER,
											      p_cstlmtper  OUT	    NUMBER
													  );
Function Get_C_Vndr (P_C_Code In Customer.C_Code%Type) Return Varchar2 ;
End IAS_Cst_Pkg;
/

-- ---------------------------------------------
-- PACKAGE BODY: IAS_CST_PKG  (status: INVALID)
-- ---------------------------------------------
CREATE OR REPLACE
PACKAGE Body IAS_Cst_Pkg as
--================================================================
Procedure Get_Para (P_Lang_no In pls_integer Default 1,P_User_No In pls_integer) Is
Begin
  V_Lang_No:=P_Lang_no;
  V_User_No:=P_User_No;
End Get_Para ;
--================================================================
FUNCTION Get_Cnt_Acy (P_C_code In CUSTOMER.C_CODE%TYPE,P_Usr_no In Number) Return Number Is
  cnt	Number;
Begin

    Begin
	Select count(*)
	    Into Cnt
	    From Customer_Curr
	    Where C_code =P_C_Code
	    And   A_Cy	 In (Select A_Cy
			      From   IAS_PRIV_CUSTOMER
			      Where  U_Id  = P_Usr_No
			      And    C_Code= P_C_CODE And Add_Flag=1);
    Exception When Others Then
	Cnt := 0;
    End;

    Return(Cnt);

 Exception
    When others then
      Return(Null);
End Get_Cnt_Acy ;
--================================================================
FUNCTION Get_One_Acy_Cst (P_C_code In CUSTOMER.C_CODE%TYPE,P_Usr_no In Number) Return VARCHAR2 Is

  v_Acy varchar2(7);
Begin

    Begin
	   Select A_Cy
   		  Into v_Acy
   		  From Ias_Priv_Customer
   		 where U_Id  = P_Usr_No
	       And   C_code= P_C_Code  And Add_Flag=1 ;
    Exception When Others Then
   	    Null;
    End;

    Return(v_Acy);
	
 Exception
	When others then
	  Return(Null);
End Get_One_Acy_Cst ;
--================================================================
FUNCTION Get_Acode (P_c_code In CUSTOMER.C_CODE%TYPE) Return VARCHAR2 Is
	 v_ac varchar2(30);
	Begin
	 select c_a_code
	   Into v_ac
	   From customer
	  where c_code=P_c_code ;
	
	 return(v_ac);
	
	Exception
	  when others then
	    return(Null);
End Get_Acode ;
--=================================================================
FUNCTION Get_c_code (P_a_code In ACCOUNT.A_CODE%TYPE) Return VARCHAR2 Is
 v_cc varchar2(15);
 Begin
	 Select c_code
	   Into v_cc
	   From customer
	  where c_a_code=P_a_code ;
	
	 return(v_cc);
	
	 Exception
	  when others then
	    return(Null);
 End Get_c_code;
--===============================================================
FUNCTION Get_C_Name (P_c_code In CUSTOMER.C_CODE%TYPE,P_Lng_no In Number)
  Return VARCHAR2 Is
  v_cname varchar2(60);
 Begin
	 select Decode(P_Lng_no,1,c_a_name,nvl(c_e_name,c_a_name))
	   Into v_cname
	   From customer
	  where c_code=P_c_code ;
	
	 return(v_cname);
	
	Exception when others then
	 return(Null);
End Get_C_Name ;
--===============================================================
FUNCTION Get_C_PHON_NO (P_c_code In CUSTOMER.C_CODE%TYPE,P_Lng_no In Number) Return VARCHAR2 Is
  V_C_PHONE varchar2(60);
 Begin
	 select C_PHONE
	   Into V_C_PHONE
	   From customer
	  where c_code=P_c_code ;
	
	 return(V_C_PHONE);
	
	Exception when others then
	 return(Null);
End Get_C_PHON_NO ;
--===============================================================
FUNCTION Get_c_code_By_Nm (P_c_nm In CUSTOMER.C_A_NAME%TYPE) RETURN VARCHAR2 Is
  v_code varchar2(30);
 Begin
	 select c_code
	   Into v_code
	   From customer
	  where (c_a_name = P_c_nm or c_e_name =P_c_nm )
	and Rownum<=1;
	
	 RETURN(v_code);
	
 Exception
	when others then
	  RETURN(Null);
End Get_c_code_By_Nm;
--===============================================================
FUNCTION Check_Acy (P_c_code In CUSTOMER.C_CODE%TYPE,P_a_cy   In VARCHAR2) Return Number Is
 cnt Number;
 Begin
	 Select 1
	   Into cnt
	   From customer_curr
	  where c_code=P_c_code
	    and a_cy  =P_a_cy
	    and RowNum<=1;
	
	 Return(cnt);
	
 Exception
	when others then
	  Return(0);
End Check_Acy ;
--===============================================================
PROCEDURE Get_Credit_Lmt (p_cr_lmt_typ In   NUMBER,
			  P_c_code     In  CUSTOMER.C_CODE%TYPE ,
 												  P_cc_code    In  COST_CENTERS.CC_CODE%TYPE   Default Null,			
 												  P_User_No    In  Number,
 												  P_acy 		   In  Varchar2,
													P_local_cur  In  Varchar2,
													P_frc_no     In  Number		  Default 2,
													p_crlmt      OUT      NUMBER,
										      p_invlmt	   OUT	    NUMBER,
										      p_cstlmttyp  OUT	    NUMBER,
										      p_cstlmtper  OUT	    NUMBER) IS
 v_crtype   Number:=0;

Begin

    Begin
      Select nvl(crlimit_type,1)
	Into v_crtype
	From Privilege_Fixed
       Where u_id=P_User_No;
    Exception When Others Then
     v_crtype:=1;
    End;

-- crlimit_type 1= not allow ,2=allow ,3=allow with worning

    IF P_CR_LMT_TYP = 2 THEN   -- BY COST CENTER

	    SELECT ROUND (NVL (CR_LIMIT, 0), P_FRC_NO), NVL (INV_LIMIT, 0),
		   CST_LMT_TYP, CST_LMT_PER
	      INTO P_CRLMT, P_INVLMT,
		   P_CSTLMTTYP, P_CSTLMTPER
	      FROM IAS_CUSTOMER_CC_LMT
	     WHERE C_CODE = P_C_CODE AND A_CY = P_ACY AND CC_CODE = P_CC_CODE;
      ELSE
	    SELECT ROUND (NVL (CR_LIMIT, 0), P_FRC_NO), NVL (INV_LIMIT, 0),
		   CST_LMT_TYP, CST_LMT_PER
	      INTO P_CRLMT, P_INVLMT,
		   P_CSTLMTTYP, P_CSTLMTPER
	      FROM CUSTOMER_CURR
	     WHERE C_CODE = P_C_CODE AND A_CY = P_ACY;

      END IF;
 Exception
 When Others Then
       P_CRLMT := 0;
       P_INVLMT := 0;
       P_CSTLMTTYP := 2;
       P_CSTLMTPER := NULL;
End Get_Credit_Lmt;
--=================================================================
Function Get_C_Vndr (P_C_Code In Customer.C_Code%Type) Return Varchar2 Is
  V_Vcode  Varchar2(30);
Begin
     Select C_Vendor
       Into V_Vcode
       From Customer
      Where C_Code=P_C_Code
	And RowNum<=1;
     Return(V_Vcode);
Exception
  When Others Then
    Return(Null);
End Get_C_Vndr;
--================================================================
End IAS_Cst_Pkg;
/
